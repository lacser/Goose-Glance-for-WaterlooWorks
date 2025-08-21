# Goose Glance

### What is Goose Glance
Goose Glance is a Chrome browser extension powered by LLM (Large Language Model) designed for Waterloo Works. It automatically extracts job posting content from Waterloo Works pages and leverages AI capabilities to summarize key information including job responsibilities, required qualifications, work term duration, and location. This information is then seamlessly injected into the job posting page, enabling quick review and efficient filtering of opportunities.

### Technologies used by Goose Glance

- TypeScript
- React
- Redux
- Vite
- Tailwind CSS
- Indexed DB
- Fluent UI components

### Dev and build

The extension consists of two parts: 

1. Popup window for extension configurations. See under `components/popup` folder.
2. Content injected into the Waterloo Works page. See under `components/content` folder.

Running `npm run build` executes `scripts/build.js`, which builds both parts separately, copies the contents of the `public` folder, and produces a `dist` directory. For development and testing, load the `dist` folder in the browser as an unpacked extension.

Running `npm run watch` executes `scripts/watch.js`, this simply runs `scripts/build.js` automatically whenever it detects a file change. This provides convenience for development process.