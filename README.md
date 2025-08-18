### Technologies used by the extension

- TypeScript
- React
- Redux
- Vite
- Tailwind CSS
- Yarn
- IndexedDB
- Fluent UI components

### Extension structure and build

The extension consists of two parts: 

1. Popup window for extension configurations. See under `components/popup` folder.
2. Content injected into the Waterloo Works page. See under `components/content` folder.

Running `npm run build` executes `scripts/build.js`, which builds both parts separately, copies the contents of the `public` folder, and produces a `dist` directory. For development and testing, load the `dist` folder in the browser as an unpacked extension.
