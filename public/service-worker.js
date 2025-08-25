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
