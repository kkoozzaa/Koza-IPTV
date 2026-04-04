\# Koza IPTV - Tizen Smart TV Edition



\*\*Koza IPTV\*\* is a lightweight, high-performance IPTV player specifically designed for Samsung Tizen Smart TVs. Built with pure JavaScript and Tizen Web APIs, it focuses on speed, stability, and a seamless user experience.



\---



\## 🚀 Key Features



\* \*\*Hybrid Multi-Source Support:\*\* Fetches and merges live channels from multiple M3U sources simultaneously.

\* \*\*Intelligent UI/UX:\*\* A minimalist sidebar navigation system that appears only when needed, ensuring an immersive viewing experience.

\* \*\*Long-Press Settings Menu:\*\* A unique "Hold OK" gesture to access advanced channel options without cluttering the screen.

\* \*\*Favorite System:\*\* Easily add or remove channels from your favorites with a single click.

\* \*\*Channel Merging (Hybrid Mode):\*\* Ability to group multiple sources for the same channel into a single entry to prevent stream downtime.

\* \*\*Auto-Resume:\*\* Remembers the last category and channel played even after a TV reboot.

\* \*\*Tizen Optimized:\*\* Specifically tuned for Samsung TV hardware with native AVPlay integration for ultra-fast buffering.



\---



\## 🛠️ Technical Details



\* \*\*Platform:\*\* Samsung Tizen OS (Web Application)

\* \*\*Language:\*\* JavaScript (Vanilla), HTML5, CSS3

\* \*\*Engine:\*\* Tizen Web API \& Samsung Product API (AVPlay)

\* \*\*Resolution:\*\* 1080p (Native Upscaling for 4K TVs)



\---



\## 📂 Project Structure



\* `index.html`: The core UI structure and video container.

\* `main.js`: The "brain" of the app. Handles M3U parsing, stream logic, and remote control input.

\* `style.css`: Modern, dark-themed UI with smooth CSS transitions.

\* `config.xml`: Tizen application configuration and permissions.



\---



\## ⚙️ Installation



1\.  Open \*\*Tizen Studio\*\*.

2\.  Import the project folder.

3\.  Ensure your \*\*Samsung Certificate\*\* is active in the Certificate Manager.

4\.  Right-click the project and select \*\*"Build Signed Package"\*\*.

5\.  Deploy the generated `.wgt` file to your TV using \*\*Device Manager\*\*.



\---



\## ⌨️ Controls



| Key | Action |

| :--- | :--- |

| \*\*UP / DOWN\*\* | Navigate channel list |

| \*\*LEFT / RIGHT\*\* | Switch Categories |

| \*\*OK (Short Press)\*\* | Play selected channel (when UI is visible) |

| \*\*OK (Long Press)\*\* | Open Options / Favorites Menu |

| \*\*CH+ / CH-\*\* | Instant Channel Surfing (Zapping) |

| \*\*BACK\*\* | Close UI or Exit Application |



\---



\## ⚠️ Disclaimer



This application is an open-source IPTV player and \*\*does not provide any content\*\*. Users must provide their own M3U playlists. The developer is not responsible for the content played through this application.



\---



This project was developed with ai.

