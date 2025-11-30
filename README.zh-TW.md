# Goose Glance <img src="./public/icons/icon128.png" alt="LOGO" width="30"> </br>職缺資訊，一眼即得

> 这是本项目 README 的繁體中文版本。

![Welcome Image](./components/pages/public/WelcomeImage.webp)

## 快速上手

想立刻體驗看看？
[![在 Chrome Web Store 中查看](https://img.shields.io/badge/Chrome%20Web%20Store-View-blue?logo=google-chrome\&logoColor=white)](https://chromewebstore.google.com/detail/goose-glance-for-waterloo/hblfffccmiegiahkolkendnfkaegogjg)

### Goose Glance 是什麼

Goose Glance 是一款為 Waterloo Works 打造的 Chrome 瀏覽器擴充功能，由大型語言模型（LLM）驅動。
它能自動從 Waterloo Works 頁面擷取職缺內容，並以 AI 技術提煉關鍵資訊：職責內容、任職條件、實習學期長度與地點位置等。接著將這些要點無縫注入原頁面中，讓你在瀏覽時即可迅速掌握精華，輕鬆篩選機會——
如雁掠湖面，電光一瞥，繁華化簡。

## 隱私

不是每個人都願意逐行讀程式碼來了解資料流向。[這裡](https://mango-ground-0bd6b9d0f.1.azurestaticapps.net/)提供一份簡明扼要的說明，解釋 Goose Glance 會使用哪些資料。

請注意：Goose Glance 以 MIT 授權條款開放原始碼，並以「現況」提供，不附帶任何形式的擔保或條件。

## 開發者筆記（DEV Notes）

### 技術堆疊（Tech Stack of Goose Glance）

* TypeScript
* React
* Redux
* Vite
* WebLLM
* Tailwind CSS
* Indexed DB
* Fluent UI 元件

### 開發與建置（Dev and build）

此擴充功能由三部分組成：

1. **彈出視窗（Popup）**：提供擴充功能的設定介面。位於 `components/popup` 資料夾。
2. **頁面注入內容（Content）**：注入至 Waterloo Works 頁面。位於 `components/content` 資料夾。
3. **獨立頁面（Pages）**：用於初次安裝的導引與設定，會在新分頁開啟。位於 `components/pages` 資料夾。

執行 `yarn build` 會執行 `scripts/build.js`：分別建置各部分，複製 `public` 資料夾內容，並輸出到 `dist` 目錄。
開發與測試時，可於瀏覽器中以「載入未封裝項目」的方式載入 `dist` 目錄。

執行 `yarn watch` 會執行 `scripts/watch.js`：當偵測到檔案變更時自動呼叫 `scripts/build.js`。
