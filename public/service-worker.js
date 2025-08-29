import { ExtensionServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'openWelcomePage') {

    const extensionId = chrome.runtime.id;
    const welcomePageUrl = `chrome-extension://${extensionId}/welcome/index.html`;
    chrome.tabs.create({
      url: welcomePageUrl,
      active: true
    });
  }
  return;
});

// Hookup an engine to a service worker handler
let handler;

chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "web_llm_service_worker");
  if (handler === undefined) {
    handler = new ExtensionServiceWorkerMLCEngineHandler(port);
  } else {
    handler.setPort(port);
  }
  port.onMessage.addListener(handler.onmessage.bind(handler));
});
