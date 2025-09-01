import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { HashRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </FluentProvider>
  </StrictMode>
);
