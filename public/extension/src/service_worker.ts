import { ExtensionServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

let handler;

// Service worker (TypeScript)
chrome.runtime.onMessage.addListener((message) => {
  if ((message as { action?: string }).action === 'openWelcomePage') {
    const extensionId = chrome.runtime.id;
    const welcomePageUrl = `chrome-extension://${extensionId}/pages/index.html`;
    chrome.tabs.create({
      url: welcomePageUrl,
      active: true,
    });
  }
  return;
});

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "web_llm_service_worker");
  if (handler === undefined) {
    handler = new ExtensionServiceWorkerMLCEngineHandler(port);
  } else {
    handler.setPort(port);
  }
  port.onMessage.addListener(handler.onmessage.bind(handler));
});