let currentJobId = null;
let pendingJobData = null;
let docViewer = null;

// Inject additional CSS to job posting page
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
      .goose-glance-panel {
        overflow: hidden;
        padding: 0;
        min-height: 300px;
      }
    `;
  document.head.appendChild(style);
}

// Listen for content height adjustment messages from iframes and adjust iframe height accordingly
function handleMessage(event) {
  if (event.data && event.data.type === "adjustHeight") {
    const iframe = document.querySelector('iframe[src^="chrome-extension://"]');
    if (iframe) {
      iframe.style.height = event.data.height + "px";
    }
  }
  
  if (event.data && event.data.type === "refreshPage") {
    window.location.reload();
  }

  if (event.data && event.data.type === "IFRAME_SCROLL") {
    if (!(typeof event.origin === "string" && event.origin.startsWith("chrome-extension://"))) {
      return;
    }
    const p = event.data.payload || {};
    const doScrollBy = (dx, dy) => {
      docViewer.scrollBy({ left: dx || 0, top: dy || 0, behavior: "auto" });
    };

    if (p.method === "wheel" || p.method === "touch") {
      doScrollBy(p.deltaX || 0, p.deltaY || 0);
    } else if (p.method === "key") {
      const line = 40;
      const page = Math.max(window.innerHeight - 80, 200);
      switch (p.key) {
        case "ArrowDown":
          doScrollBy(0, line);
          break;
        case "ArrowUp":
          doScrollBy(0, -line);
          break;
        case "ArrowRight":
          doScrollBy(line, 0);
          break;
        case "ArrowLeft":
          doScrollBy(-line, 0);
          break;
        case "PageDown":
          doScrollBy(0, page);
          break;
        case "PageUp":
          doScrollBy(0, -page);
          break;
        case "Home":
          window.scrollTo({ top: 0, behavior: "auto" });
          break;
        case "End":
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" });
          break;
        case " ":
          doScrollBy(0, p.shiftKey ? -page : page);
          break;
        default:
          break;
      }
    }
  }

  if (event.data && event.data.type === "IFRAME_HOOK_READY") {
    if (pendingJobData) {
      sendJobDescriptionToIframe(pendingJobData.jobId, pendingJobData.description);
      pendingJobData = null;
    }
  }
}

function createPanel(contentDiv) {
  // Check for existing panel in the content div
  const existingPanel = contentDiv.querySelector(".goose-glance-panel");
  if (existingPanel) existingPanel.remove();

  const container = document.createElement("div");
  container.className = "panel goose-glance-panel";
  const iframeSrc = chrome.runtime.getURL("content/index.html");
  container.innerHTML = `
      <div class="panel-body">
        <iframe style="border:none; width:100%" src="${iframeSrc}"></iframe>
      </div>
    `;

  const firstPanelChild = Array.from(contentDiv.children).find((child) =>
    child.classList.contains("panel")
  );

  if (firstPanelChild) {
    contentDiv.insertBefore(container, firstPanelChild);
  } else {
    throw new Error("No panel child found");
  }
}

function sendJobDescriptionToIframe(jobId, description) {
  const iframes = document.querySelectorAll(
    'iframe[src^="chrome-extension://"]'
  );
  iframes.forEach((iframe) => {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "SET_JOB_DESCRIPTION",
          payload: { id: jobId, description: description },
        },
        `chrome-extension://${chrome.runtime.id}`
      );
    }
  });
}

// Load the job posting into the iframe(s).
function loadPosting(staticContentDiv) {
  let fullDescription = "";
  // Find job ID
  const jobIdSpan = document.querySelector(
    ".doc-viewer__document-content .dashboard-header__posting-title .tag-label"
  );
  let jobId = null;
  if (jobIdSpan) {
    jobId = jobIdSpan.textContent.replace(/\D+/g, "");
  }

  const td = new TurndownService({ headingStyle: "atx" });
  const md = td.turndown(staticContentDiv);

  // Get full job description
  if (staticContentDiv) {
    fullDescription = md;
  }

  console.log("Loading new job posting:", jobId);
  pendingJobData = {
    jobId: jobId,
    description: fullDescription
  };
}

// Call function loadPosting only if the job ID has changed.
async function processPageChanges() {
  try {
    const jobIdSpan = document.querySelector(
      ".doc-viewer__document-content .dashboard-header__posting-title .tag-label"
    );
    if (!jobIdSpan) {
      currentJobId = null;
      return;
    }
    const newJobId = jobIdSpan.textContent.trim();

    if (newJobId === currentJobId) return;
    currentJobId = newJobId;

    const longFormDiv = document.querySelector(".is--long-form-reading");
    if (!longFormDiv) return;

    const contentDivWrapper = longFormDiv.querySelector("div");
    const contentDiv = contentDivWrapper.querySelector("div");
    const panelDivs = Array.from(contentDiv.children).filter((child) =>
      child.classList.contains("panel")
    );
    if (panelDivs.length < 1) {
      currentJobId = null;
      return;
    }
    const staticContentDiv = contentDiv.cloneNode(true);

    docViewer = document.querySelector(".doc-viewer__document-content").parentElement;
    createPanel(contentDiv);
    loadPosting(staticContentDiv);
  } catch (error) {
    console.error("Processing page changes failed:", error);
  }
}

// MutationObserver for page DOM changes and call processPageChanges.
function setupMutationObserver() {
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "id"],
  };
  // Debounce to limit the rate of processPageChanges calls
  const callback = () => {
    if (callback.timeout) clearTimeout(callback.timeout);
    callback.timeout = setTimeout(processPageChanges, 100);
  };
  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
}

async function initialize() {
  try {
    injectStyles();
    window.addEventListener("message", handleMessage);
    await processPageChanges();
    setupMutationObserver();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

window.addEventListener("load", initialize);
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initialize();
}
