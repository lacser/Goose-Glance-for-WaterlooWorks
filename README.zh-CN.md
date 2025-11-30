# Goose Glance <img src="./public/icons/icon128.png" alt="LOGO" width="30"> </br>职位信息一眼尽览

> 这是本项目 README 的简体中文版本。

![Welcome Image](./components/pages/public/WelcomeImage.webp)

## 快速上手

想立刻试试？
[![在 Chrome Web Store 中查看](https://img.shields.io/badge/Chrome%20Web%20Store-查看-blue?logo=google-chrome\&logoColor=white)](https://chromewebstore.google.com/detail/goose-glance-for-waterloo/hblfffccmiegiahkolkendnfkaegogjg)

### Goose Glance 是什么

Goose Glance 是一款面向 Waterloo Works 的 Chrome 浏览器扩展，由大型语言模型（LLM）驱动。它会自动从 Waterloo Works 页面采撷职位文本，凭借 AI 能力提炼关键信息：工作职责、任职要求、工作学期时长与城市地点等；随后将这些要点无缝注入原页面之中，让重要信息一目了然，助你高效浏览、迅速筛选。如雁掠湖面，电光一瞥，繁复化简。

## 隐私

不是每个人都愿意阅读所有代码来弄清数据去向。[这里](https://mango-ground-0bd6b9d0f.1.azurestaticapps.net/)有一份简明扼要的说明，介绍 Goose Glance 会使用哪些数据。

请注意：Goose Glance 以 MIT 许可开源，按“现状”提供，不附带任何形式的担保或条件。

## 开发者注记（DEV Notes）

### 技术栈（Tech Stack of Goose Glance）

* TypeScript
* React
* Redux
* Vite
* WebLLM
* Tailwind CSS
* Indexed DB
* Fluent UI 组件

### 开发与构建（Dev and build）

此扩展由三部分组成：

1. **弹出窗口（Popup）**：用于扩展配置。见 `components/popup` 目录。
2. **页面注入内容（Content）**：注入至 Waterloo Works 页面。见 `components/content` 目录。
3. **独立页面（Pages）**：用于新安装引导与配置，在新标签页打开。见 `components/pages` 目录。

运行 `yarn build` 会执行 `scripts/build.js`：分别构建上述部分，复制 `public` 目录内容，并输出到 `dist`。开发与测试时，可在浏览器中以“加载已解压的扩展程序”的方式，加载 `dist` 目录。

运行 `yarn watch` 会执行 `scripts/watch.js`：它在检测到文件变更后自动调用 `scripts/build.js`。
