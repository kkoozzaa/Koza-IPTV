// ----------------------------
// Koza IPTV - Pro Hybrid (V58 - Ghost Click Fix)
// ----------------------------

var m3uSources = [
];

var categories = { "FAVORİLER": [] };
var catNames = ["FAVORİLER"];
var curCatIdx = 0;
var curChanIdx = 0;
var currentSourceIdx = 0; 
var idleTimer = null;
var UI_TIMEOUT = 8000;
var isAppReady = false;

var longPressTimer = null;
var isOptionsOpen = false;
var mergePool = []; 

var Keys = {
    UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, ENTER: 13, BACK: 10009,
    CH_UP: 427, CH_DOWN: 428, PLAY_PAUSE: 10252
};

window.onload = function() {
    try {
        tizen.tvinputdevice.registerKey("ChannelUp");
        tizen.tvinputdevice.registerKey("ChannelDown");
        tizen.tvinputdevice.registerKey("MediaPlayPause");
    } catch (e) { console.log("Key reg error"); }

    var savedFavs = localStorage.getItem("koza_favs");
    if (savedFavs) { categories["FAVORİLER"] = JSON.parse(savedFavs); }
    
    for (var s = 0; s < m3uSources.length; s++) { fetchSource(m3uSources[s]); }
    setInterval(updateClock, 1000);
    wakeUpUI(false); 
};

// --- DATA & PLAY LOGIC ---
function onDataSuccess(data) {
    parseM3U(data);
    renderUI();
    if (!isAppReady) {
        checkAutoStart();
        isAppReady = true;
        var ldr = document.getElementById("loader");
        if (ldr) { ldr.style.display = "none"; }
    }
}

function parseM3U(data) {
    var lines = data.split(/\r?\n/);
    var cur = "GENEL";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.indexOf("#EXTINF") === 0) {
            var catM = line.match(/group-title=\"([^\"]+)\"/);
            cur = catM ? catM[1].toUpperCase() : "DİĞER";
            var name = line.substring(line.lastIndexOf(",") + 1).trim();
            var url = (lines[i+1] && lines[i+1].indexOf("http") === 0) ? lines[i+1].trim() : "";
            if (url) {
                if (!categories[cur]) { categories[cur] = []; catNames.push(cur); }
                categories[cur].push({ name: name, url: url, cat: cur, sources: [url], hidden: false });
            }
        }
    }
}

function fetchSource(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) { onDataSuccess(this.responseText); }
    };
    xhr.send();
}

function checkAutoStart() {
    var lastChan = localStorage.getItem("koza_last_chan");
    if (lastChan) {
        var parsed = JSON.parse(lastChan);
        var catIdx = catNames.indexOf(parsed.cat);
        if (catIdx > -1) {
            curCatIdx = catIdx;
            var list = categories[catNames[curCatIdx]];
            for (var i = 0; i < list.length; i++) {
                if (list[i].url === parsed.url) { curChanIdx = i; break; }
            }
        }
    }
    renderUI();
    play();
}

function play() {
    var list = (categories[catNames[curCatIdx]] || []).filter(function(c) { return !c.hidden; });
    var chan = list[curChanIdx];
    if (!chan) { return; }
    localStorage.setItem("koza_last_chan", JSON.stringify({url: chan.url, cat: chan.cat}));
    currentSourceIdx = 0;
    startStream(chan);
}

function startStream(chan) {
    var url = chan.sources[currentSourceIdx];
    if (!url) { return; }
    document.getElementById("infoNumber").textContent = (curChanIdx + 1);
    document.getElementById("infoName").textContent = chan.name;
    document.getElementById("infoDesc").textContent = "[" + chan.cat + "] " + url;
    document.getElementById("infoDesc").style.color = "#aaa";
    try {
        webapis.avplay.stop();
        webapis.avplay.open(url);
        webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY", "PLAYER_BUFFER_SIZE_IN_SECOND", 3);
        webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
        webapis.avplay.setListener({
            onbufferingcomplete: function() { document.getElementById("infoDesc").style.color = "#00FF00"; },
            onerror: function() { tryNextSource(chan); }
        });
        webapis.avplay.prepareAsync(function() { webapis.avplay.play(); }, function() { tryNextSource(chan); });
    } catch (e) { console.error("AVPlay error"); }
}

function tryNextSource(chan) {
    if (currentSourceIdx < chan.sources.length - 1) {
        currentSourceIdx++;
        startStream(chan);
    }
}

// --- UI LOGIC ---
function wakeUpUI(showFullList) {
    var gui = document.getElementById("globalUI");
    var leftMenu = document.getElementById("leftMenu");
    if (gui) { gui.classList.add("show"); }
    
    if (isOptionsOpen) {
        if (leftMenu) { leftMenu.style.display = "block"; }
    } else {
        if (leftMenu) { leftMenu.style.display = showFullList ? "block" : "none"; }
    }

    if (idleTimer) { clearTimeout(idleTimer); }
    if (!isOptionsOpen) {
        idleTimer = setTimeout(function() {
            if (gui) { gui.classList.remove("show"); }
        }, UI_TIMEOUT);
    }
}

document.addEventListener("keydown", function(e) {
    var list = (categories[catNames[curCatIdx]] || []).filter(function(c) { return !c.hidden; });
    var gui = document.getElementById("globalUI");
    var isUIVisible = gui && gui.classList.contains("show");

    // KANAL +/- (Her zaman çalışır)
    if (e.keyCode === Keys.CH_UP) {
        curChanIdx = (curChanIdx - 1 + list.length) % list.length;
        renderUI(); wakeUpUI(false); play(); return;
    }
    if (e.keyCode === Keys.CH_DOWN) {
        curChanIdx = (curChanIdx + 1) % list.length;
        renderUI(); wakeUpUI(false); play(); return;
    }

    // ENTER KONTROLÜ
    if (e.keyCode === Keys.ENTER) {
        if (isOptionsOpen) {
            toggleFavorite();
        } else if (isUIVisible) {
            // SADECE UI AÇIKKEN BASILI TUTMA ÇALIŞIR
            if (!longPressTimer) {
                longPressTimer = setTimeout(function() { openOptions(); }, 1000);
            }
        } else {
            // UI KAPALIYSA OK HİÇBİR ŞEY YAPMASIN (Kanalı bozmaz)
            return; 
        }
    }

    // YÖN TUŞLARI (UI Kapalıysa Uyandırır)
    if (e.keyCode === Keys.UP || e.keyCode === Keys.DOWN || e.keyCode === Keys.LEFT || e.keyCode === Keys.RIGHT) {
        if (!isOptionsOpen) { wakeUpUI(true); }
    }

    // LİSTE GEZİNTİSİ
    if (e.keyCode === Keys.UP) { curChanIdx = (curChanIdx - 1 + list.length) % list.length; renderUI(); }
    if (e.keyCode === Keys.DOWN) { curChanIdx = (curChanIdx + 1) % list.length; renderUI(); }
    
    if (isOptionsOpen) {
        if (e.keyCode === Keys.RIGHT) { addToMerge(); }
        if (e.keyCode === Keys.LEFT) { finalizeMerge(); }
    } else {
        if (e.keyCode === Keys.LEFT) { curCatIdx = (curCatIdx - 1 + catNames.length) % catNames.length; curChanIdx = 0; renderUI(); }
        if (e.keyCode === Keys.RIGHT) { curCatIdx = (curCatIdx + 1) % catNames.length; curChanIdx = 0; renderUI(); }
    }
    
    if (e.keyCode === Keys.BACK) {
        if (isOptionsOpen) { closeOptions(); e.preventDefault(); return; }
        if (isUIVisible) {
            gui.classList.remove("show");
            e.preventDefault();
        } else if (confirm("Çıkış?")) { tizen.application.getCurrentApplication().exit(); }
    }
});

document.addEventListener("keyup", function(e) {
    if (e.keyCode === Keys.ENTER) {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
            
            // Eğer UI açıksa ve seçenekler kapalıysa kanalı oynat
            var gui = document.getElementById("globalUI");
            var leftMenu = document.getElementById("leftMenu");
            if (gui.classList.contains("show") && !isOptionsOpen) {
                if (leftMenu && leftMenu.style.display === "block") {
                    play();
                }
            }
        }
    }
});

function openOptions() {
    isOptionsOpen = true;
    var list = (categories[catNames[curCatIdx]] || []).filter(function(c) { return !c.hidden; });
    var chan = list[curChanIdx];
    if (chan) {
        document.getElementById("infoName").textContent = "AYARLAR: " + chan.name;
        document.getElementById("infoDesc").innerHTML = "<b>[OK]</b> Favori | <b>[SAĞ]</b> Havuz | <b>[SOL]</b> Birleştir";
        document.getElementById("infoDesc").style.color = "#FFD700";
    }
    wakeUpUI(true); 
}

function addToMerge() {
    var list = (categories[catNames[curCatIdx]] || []).filter(function(c) { return !c.hidden; });
    var chan = list[curChanIdx];
    if (catNames[curCatIdx] === "FAVORİLER" && chan) {
        chan.hidden = true; 
        mergePool.push(chan);
        renderUI();
        document.getElementById("infoDesc").textContent = "HAVUZA EKLENDİ (" + mergePool.length + ")";
    }
}

function finalizeMerge() {
    if (mergePool.length < 2) { return; }
    var base = JSON.parse(JSON.stringify(mergePool[0]));
    base.name = "[BİRLEŞİK] " + base.name;
    base.sources = mergePool.map(function(m) { return m.url; });
    base.hidden = false;
    var favs = categories["FAVORİLER"];
    for (var i = 0; i < mergePool.length; i++) {
        var idx = favs.indexOf(mergePool[i]);
        if (idx > -1) { favs.splice(idx, 1); }
    }
    favs.push(base);
    localStorage.setItem("koza_favs", JSON.stringify(favs));
    mergePool = [];
    closeOptions();
}

function toggleFavorite() {
    var list = (categories[catNames[curCatIdx]] || []).filter(function(c) { return !c.hidden; });
    var chan = list[curChanIdx];
    if (!chan) { return; }
    var favs = categories["FAVORİLER"];
    var idx = -1;
    for (var i = 0; i < favs.length; i++) {
        if (favs[i].url === chan.url) { idx = i; break; }
    }
    if (idx > -1) { 
        favs.splice(idx, 1); 
        document.getElementById("infoDesc").textContent = "FAVORİDEN ÇIKARILDI";
    } else { 
        favs.push(JSON.parse(JSON.stringify(chan))); 
        document.getElementById("infoDesc").textContent = "FAVORİYE EKLENDİ";
    }
    localStorage.setItem("koza_favs", JSON.stringify(favs));
    renderUI();
}

function closeOptions() {
    isOptionsOpen = false;
    var favs = categories["FAVORİLER"];
    for (var i = 0; i < favs.length; i++) { favs[i].hidden = false; }
    renderUI();
    wakeUpUI(true);
}

function renderUI() {
    var cName = catNames[curCatIdx];
    document.getElementById("currentCat").textContent = cName;
    var listEl = document.getElementById("channelList");
    listEl.innerHTML = "";
    var list = (categories[cName] || []).filter(function(c) { return !c.hidden; });
    for (var i = 0; i < list.length; i++) {
        var div = document.createElement("div");
        div.className = (i === curChanIdx) ? "channel focus" : "channel";
        var isFav = false;
        var favsArr = categories["FAVORİLER"];
        for (var f = 0; f < favsArr.length; f++) {
            if (favsArr[f].url === list[i].url) { isFav = true; break; }
        }
        div.innerHTML = '<div class="ch-num">' + (i + 1) + '</div><div class="name">' + list[i].name + (isFav ? " ★" : "") + '</div>';
        listEl.appendChild(div);
    }
    listEl.style.top = (350 - (curChanIdx * 90)) + "px";
}

function updateClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var clockEl = document.getElementById("clock");
    if (clockEl) { clockEl.textContent = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m); }
}