declare class TurndownService {
  constructor(options?: { headingStyle?: string });
  turndown(input: string | Node): string;
}

type BoardId = "full" | "direct" | "contract";

type BoardConfig = {
  id: BoardId;
  label: string;
  path: string;
};

type BulkJob = {
  id: string;
  description: string;
};

type BoardState = {
  available: boolean | null;
  processed: boolean;
  progress: string | null;
};

type StoredBoardState = Partial<
  Record<BoardId, { processedAt: number; jobCount: number }>
>;

type BulkRequest = {
  type: "BULK_ANALYZE_JOBS";
  payload: {
    boardId: BoardId;
    jobs: BulkJob[];
  };
};

const BOARD_STATUS_STORAGE_KEY = "gooseGlancePreAnalyzeStatus";
const FULL_CYCLE_UNAVAILABLE_TEXT = "To search for jobs, ensure the following:";

const BOARDS: BoardConfig[] = [
  {
    id: "full",
    label: "Full Cycle",
    path: "/myAccount/co-op/full/jobs.htm",
  },
  {
    id: "direct",
    label: "Employer Direct",
    path: "/myAccount/co-op/direct/jobs.htm",
  },
  {
    id: "contract",
    label: "Contract & Part-time",
    path: "/myAccount/contract.htm",
  },
];

const boardStates: Record<BoardId, BoardState> = {
  full: { available: null, processed: false, progress: null },
  direct: { available: null, processed: false, progress: null },
  contract: { available: null, processed: false, progress: null },
};

const rowElements = new Map<
  BoardId,
  { status: HTMLElement; button: HTMLButtonElement }
>();

let panel: HTMLElement | null = null;
let trigger: HTMLButtonElement | null = null;
let workerFrame: HTMLIFrameElement | null = null;
let workerReady = false;
let pendingBulkRequest: BulkRequest | null = null;
let activeBoardId: BoardId | null = null;
let availabilityChecked = false;

function materialIconHtml(name: string, classname = ""): string {
  return `<span class="gg-material-symbols ${classname}" aria-hidden="true">${name}</span>`;
}

function injectPreAnalyzeStyles() {
  const materialFontUrl = chrome.runtime.getURL(
    "content/icons/MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.ttf"
  );
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Material Symbols Rounded";
      font-style: normal;
      font-display: block;
      src: url("${materialFontUrl}") format("truetype");
    }

    .gg-material-symbols {
      -webkit-font-smoothing: antialiased;
      display: inline-block;
      font-family: "Material Symbols Rounded";
      font-style: normal;
      font-weight: normal;
      letter-spacing: normal;
      line-height: 1;
      user-select: none;
      white-space: nowrap;
      font-variation-settings: "FILL" 0, "GRAD" 0, "opsz" 24, "wght" 400;
    }

    /* Keep header positioning intact (do not override sticky/fixed). */
    .gg-pre-analyze-mount {
      align-items: center !important;
      display: flex !important;
      gap: 8px;
      min-width: 0;
    }

    .gg-pre-analyze-trigger {
      align-items: center;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.22);
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
      color: #242424;
      cursor: pointer;
      display: inline-flex;
      flex-shrink: 0;
      font: 600 13px/1.2 Arial, sans-serif;
      gap: 6px;
      margin-left: auto;
      margin-right: 16px;
      padding: 5px 10px 5px 5px;
      position: relative;
      z-index: 10000;
    }

    .gg-pre-analyze-trigger:hover {
      background: #f5f5f5;
    }

    .gg-pre-analyze-trigger--fixed {
      margin-left: 0;
      margin-right: 0;
      position: fixed;
      right: 20px;
      top: 14px;
    }

    .gg-pre-analyze-trigger img {
      height: 20px;
      width: 20px;
    }

    .gg-pre-analyze-window {
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.14), 0 0 2px rgba(0, 0, 0, 0.12);
      color: #242424;
      display: none;
      font-family: "Segoe UI", Arial, sans-serif;
      margin: 0;
      padding: 12px 14px 10px;
      position: fixed;
      right: 16px;
      top: 64px;
      width: min(360px, calc(100vw - 32px));
      z-index: 10001;
    }

    .gg-pre-analyze-window--open {
      display: block;
    }

    .gg-pre-analyze-heading {
      align-items: center;
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
    }

    .gg-pre-analyze-heading img {
      height: 28px;
      width: 28px;
    }

    .gg-pre-analyze-heading h2 {
      color: #1f1f1f;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
      margin: 0;
    }

    .gg-pre-analyze-close {
      align-items: center;
      background: transparent;
      border: 0;
      color: #555555;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      margin-left: auto;
      padding: 2px;
    }

    .gg-pre-analyze-close .gg-material-symbols {
      font-size: 20px;
    }

    .gg-pre-analyze-description {
      color: #616161;
      font-size: 13px;
      line-height: 1.5;
      margin: 0 0 10px;
    }

    .gg-pre-analyze-rows {
      margin: 0;
      padding: 0;
    }

    .gg-pre-analyze-row {
      align-items: center;
      box-sizing: border-box;
      border-top: 1px solid #eeeeee;
      display: grid;
      gap: 8px;
      grid-template-columns: minmax(0, 1fr) 26px 100px;
      margin: 0;
      min-height: 42px;
      padding: 4px 0;
      position: relative;
    }

    .gg-pre-analyze-row:last-child {
      min-height: 38px;
      padding-bottom: 0;
    }

    .gg-pre-analyze-board-name {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.3;
    }

    .gg-pre-analyze-status {
      align-items: center;
      display: inline-flex;
      border-radius: 4px;
      cursor: help;
      height: 26px;
      justify-content: center;
      width: 26px;
    }

    .gg-pre-analyze-status:focus-visible {
      outline: 2px solid #2457a7;
      outline-offset: 2px;
    }

    .gg-pre-analyze-tooltip {
      background: #242424;
      border-radius: 6px;
      bottom: calc(100% - 4px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
      box-sizing: border-box;
      color: #ffffff;
      font: 400 12px/1.4 "Segoe UI", Arial, sans-serif;
      max-width: calc(100% - 100px);
      padding: 7px 9px;
      position: absolute;
      right: 100px;
      text-align: left;
      visibility: hidden;
      white-space: normal;
      width: 220px;
      z-index: 1;
    }

    /* The transparent bridge keeps the tooltip open as the pointer enters it. */
    .gg-pre-analyze-tooltip::after {
      content: "";
      height: 12px;
      left: 0;
      position: absolute;
      top: 100%;
      width: 100%;
    }

    .gg-pre-analyze-status:not([data-tooltip-dismissed]):hover .gg-pre-analyze-tooltip,
    .gg-pre-analyze-status:not([data-tooltip-dismissed]):focus .gg-pre-analyze-tooltip {
      visibility: visible;
    }

    .gg-pre-analyze-status .gg-material-symbols {
      font-size: 24px;
    }

    .gg-pre-analyze-status--unavailable { color: #b42318; }
    .gg-pre-analyze-status--pending { color: #b76e00; }
    .gg-pre-analyze-status--complete { color: #137333; }
    .gg-pre-analyze-status--working { color: #2457a7; }

    .gg-pre-analyze-status--working .gg-material-symbols {
      animation: gg-pre-analyze-spin 1s linear infinite;
    }

    @keyframes gg-pre-analyze-spin {
      to { transform: rotate(360deg); }
    }

    .gg-pre-analyze-action {
      box-sizing: border-box;
      background: #0f6cbd;
      border: 1px solid transparent;
      border-radius: 4px;
      color: #ffffff;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      margin: 0;
      min-height: 32px;
      padding: 5px 8px;
      transition: background-color 120ms ease, border-color 120ms ease;
      width: 100%;
    }

    .gg-pre-analyze-action:hover:not(:disabled) {
      background: #115ea3;
    }

    .gg-pre-analyze-action:active:not(:disabled) {
      background: #0c3b5e;
    }

    .gg-pre-analyze-action:focus-visible {
      outline: 2px solid #242424;
      outline-offset: 2px;
    }

    .gg-pre-analyze-action:disabled {
      background: #f0f0f0;
      border-color: #e0e0e0;
      color: #707070;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .gg-pre-analyze-action { transition: none; }
    }

    .gg-pre-analyze-board-frame,
    .gg-pre-analyze-worker-frame {
      border: 0;
      height: 900px;
      left: -12000px;
      position: fixed;
      top: 0;
      visibility: hidden;
      width: 1280px;
    }
  `;
  document.head.appendChild(style);
}

function findHeader(): HTMLElement | null {
  const waterlooWorksHeading = Array.from(document.querySelectorAll("h1")).find(
    (heading) => heading.textContent?.trim() === "WaterlooWorks"
  );
  return (
    waterlooWorksHeading?.closest("header") ??
    document.querySelector<HTMLElement>("header.header__container, header, [role='banner']")
  );
}

/** Prefer the first header child div (brand row) so the trigger sits on its right. */
function findTriggerMount(header: HTMLElement): HTMLElement {
  return (
    header.querySelector<HTMLElement>(":scope > div:first-of-type") ?? header
  );
}

function setStatusIcon(
  status: HTMLElement,
  iconName: string,
  variant: "unavailable" | "pending" | "complete" | "working",
  label: string,
  description: string
) {
  status.className = `gg-pre-analyze-status gg-pre-analyze-status--${variant}`;
  status.setAttribute("aria-label", label);
  status.querySelector<HTMLElement>(".gg-material-symbols")!.textContent = iconName;
  status.querySelector<HTMLElement>(".gg-pre-analyze-tooltip")!.textContent = description;
}

function createTriggerAndPanel() {
  const iconUrl = chrome.runtime.getURL("icons/icon48.png");
  const triggerIconUrl = chrome.runtime.getURL("icons/logo.svg");
  const header = findHeader();

  trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "gg-pre-analyze-trigger";
  trigger.setAttribute("aria-expanded", "false");
  trigger.innerHTML = `<img alt="" src="${triggerIconUrl}"><span>Bulk analyze</span>`;

  if (header) {
    header.classList.add("gg-pre-analyze-header-host");
    const mount = findTriggerMount(header);
    mount.classList.add("gg-pre-analyze-mount");
    mount.appendChild(trigger);
  } else {
    trigger.classList.add("gg-pre-analyze-trigger--fixed");
    document.body.appendChild(trigger);
  }

  panel = document.createElement("section");
  panel.className = "gg-pre-analyze-window";
  panel.setAttribute("aria-label", "Bulk analyze status");
  panel.innerHTML = `
    <div class="gg-pre-analyze-heading">
      <img alt="" src="${iconUrl}">
      <h2>Bulk analyze status</h2>
      <button class="gg-pre-analyze-close" type="button" aria-label="Close">${materialIconHtml("close")}</button>
    </div>
    <p class="gg-pre-analyze-description">
      Pre-load and analyze jobs in bulk to get instant job insights while you browse.
    </p>
    <div class="gg-pre-analyze-rows"></div>
  `;
  document.body.appendChild(panel);

  const rows = panel.querySelector<HTMLElement>(".gg-pre-analyze-rows")!;
  for (const board of BOARDS) {
    const row = document.createElement("div");
    row.className = "gg-pre-analyze-row";
    row.innerHTML = `
      <span class="gg-pre-analyze-board-name">${board.label}</span>
      <span class="gg-pre-analyze-status" tabindex="0" role="img" aria-describedby="gg-pre-analyze-tooltip-${board.id}">
        ${materialIconHtml("progress_activity")}
        <span class="gg-pre-analyze-tooltip" id="gg-pre-analyze-tooltip-${board.id}" role="tooltip"></span>
      </span>
      <button class="gg-pre-analyze-action" type="button" disabled>Checking…</button>
    `;
    const status = row.querySelector<HTMLElement>(".gg-pre-analyze-status")!;
    setStatusIcon(status, "progress_activity", "working", "Checking",
      "Checking whether this section is available for analysis.");
    const resetTooltip = () => delete status.dataset.tooltipDismissed;
    status.addEventListener("mouseenter", resetTooltip);
    status.addEventListener("focus", resetTooltip);
    const button = row.querySelector<HTMLButtonElement>(".gg-pre-analyze-action")!;
    button.addEventListener("click", () => void processBoard(board));
    rowElements.set(board.id, { status, button });
    rows.appendChild(row);
  }

  const closeButton = panel.querySelector<HTMLButtonElement>(
    ".gg-pre-analyze-close"
  )!;
  const closePanel = () => {
    panel?.classList.remove("gg-pre-analyze-window--open");
    trigger?.setAttribute("aria-expanded", "false");
  };

  closeButton.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !panel?.classList.contains("gg-pre-analyze-window--open")) return;
    rowElements.forEach(({ status }) => {
      if (status.matches(":hover, :focus")) status.dataset.tooltipDismissed = "true";
    });
  });
  trigger.addEventListener("click", () => {
    const isOpen = panel?.classList.toggle("gg-pre-analyze-window--open") ?? false;
    trigger?.setAttribute("aria-expanded", String(isOpen));
    if (isOpen && !availabilityChecked) {
      availabilityChecked = true;
      void checkBoardAvailability();
    }
  });
}

function renderBoard(boardId: BoardId) {
  const state = boardStates[boardId];
  const elements = rowElements.get(boardId);
  if (!elements) return;

  const { status, button } = elements;

  if (state.available === false) {
    setStatusIcon(status, "cancel", "unavailable", "Unavailable",
      "This section is unavailable and cannot be analyzed.");
    button.textContent = "Unavailable";
    button.disabled = true;
    return;
  }

  if (state.progress) {
    setStatusIcon(status, "progress_activity", "working", "Processing",
      `Bulk analysis is in progress: ${state.progress}`);
    button.textContent = state.progress;
    button.disabled = true;
    return;
  }

  if (state.available === null) {
    setStatusIcon(status, "progress_activity", "working", "Checking",
      "Checking whether this section is available for analysis.");
    button.textContent = "Checking…";
    button.disabled = true;
    return;
  }

  if (state.processed) {
    setStatusIcon(status, "check_circle", "complete", "Processed",
      "Bulk analysis is complete. Select Refresh to analyze this section again.");
    button.textContent = "Refresh";
  } else {
    setStatusIcon(status, "error", "pending", "Not processed",
      "This section is available but has not been analyzed. Select Process to start.");
    button.textContent = "Process";
  }

  button.disabled = activeBoardId !== null;
}

function renderAllBoards() {
  for (const board of BOARDS) renderBoard(board.id);
}

async function loadStoredBoardStates() {
  const result = await chrome.storage.local.get(BOARD_STATUS_STORAGE_KEY);
  const stored = (result[BOARD_STATUS_STORAGE_KEY] ?? {}) as StoredBoardState;
  for (const board of BOARDS) {
    boardStates[board.id].processed = Boolean(stored[board.id]);
  }
  renderAllBoards();
}

function pageHasOverviewAction(doc: Document): boolean {
  return Array.from(doc.scripts).some((script) =>
    script.textContent?.includes("function getPostingOverview")
  );
}

async function checkBoardAvailability() {
  await Promise.all(
    BOARDS.map(async (board) => {
      const response = await fetch(board.path, { credentials: "include" });
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const isFullCycleUnavailable =
        board.id === "full" &&
        doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT);

      boardStates[board.id].available =
        !isFullCycleUnavailable && pageHasOverviewAction(doc);
      renderBoard(board.id);
    })
  );
}

function waitForFrameLoad(frame: HTMLIFrameElement): Promise<Document> {
  return new Promise((resolve) => {
    frame.addEventListener(
      "load",
      () => resolve(frame.contentDocument!),
      { once: true }
    );
  });
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function waitForBoard(doc: Document) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (
      pageHasOverviewAction(doc) ||
      doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT)
    ) {
      return;
    }
    await delay(100);
  }
}

function extractOverviewAction(doc: Document): string {
  const source = Array.from(doc.scripts)
    .map((script) => script.textContent ?? "")
    .find((text) => text.includes("function getPostingOverview"));
  const match = source?.match(
    /function\s+getPostingOverview\s*\([^)]*\)\s*\{[\s\S]*?action:\s*'([^']+)'/
  );
  return match![1];
}

function getVisibleJobIds(doc: Document): string[] {
  return Array.from(
    doc.querySelectorAll<HTMLInputElement>(
      'input[name="dataViewerSelection"][value]'
    )
  )
    .map((input) => input.value)
    .filter((value) => /^\d+$/.test(value));
}

function findNextPageButton(doc: Document): HTMLButtonElement | null {
  const root = doc.querySelector("#dataViewerPlaceholder") ?? doc.body;
  return (
    Array.from(root.querySelectorAll<HTMLButtonElement>("button")).find(
      (button) => {
        const label = [
          button.getAttribute("aria-label"),
          button.getAttribute("title"),
          button.textContent,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase();
        return (
          label.includes("next page") ||
          label === "keyboard_arrow_right" ||
          label === "chevron_right" ||
          label === "navigate_next"
        );
      }
    ) ?? null
  );
}

function isDisabled(button: HTMLButtonElement): boolean {
  return (
    button.disabled ||
    button.getAttribute("aria-disabled") === "true" ||
    button.classList.contains("disabled")
  );
}

async function collectAllJobIds(doc: Document): Promise<string[]> {
  const ids = new Set<string>();

  while (true) {
    const pageIds = getVisibleJobIds(doc);
    pageIds.forEach((id) => ids.add(id));

    const nextButton = findNextPageButton(doc);
    if (!nextButton || isDisabled(nextButton)) break;

    const signature = pageIds.join(",");
    nextButton.click();

    let changed = false;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      await delay(100);
      if (getVisibleJobIds(doc).join(",") !== signature) {
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }

  return Array.from(ids);
}

async function fetchPostingDescription(
  board: BoardConfig,
  action: string,
  postingId: string
): Promise<string> {
  const response = await fetch(board.path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams({ action, postingId }),
  });
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style").forEach((element) => element.remove());
  const turndown = new TurndownService({ headingStyle: "atx" });
  return turndown.turndown(doc.body);
}

async function scrapeBoard(board: BoardConfig): Promise<BulkJob[]> {
  const frame = document.createElement("iframe");
  frame.className = "gg-pre-analyze-board-frame";
  frame.setAttribute("aria-hidden", "true");
  const loadPromise = waitForFrameLoad(frame);
  frame.src = board.path;
  document.body.appendChild(frame);

  const doc = await loadPromise;
  await waitForBoard(doc);

  if (
    board.id === "full" &&
    doc.body.textContent?.includes(FULL_CYCLE_UNAVAILABLE_TEXT)
  ) {
    boardStates[board.id].available = false;
    frame.remove();
    return [];
  }

  const action = extractOverviewAction(doc);
  const jobIds = await collectAllJobIds(doc);
  const jobs: BulkJob[] = [];

  for (let index = 0; index < jobIds.length; index += 1) {
    boardStates[board.id].progress = `Fetching ${index + 1}/${jobIds.length}`;
    renderBoard(board.id);
    jobs.push({
      id: jobIds[index],
      description: await fetchPostingDescription(board, action, jobIds[index]),
    });
  }

  frame.remove();
  return jobs;
}

function ensureWorkerFrame(): HTMLIFrameElement {
  if (workerFrame) return workerFrame;

  workerFrame = document.createElement("iframe");
  workerFrame.className = "gg-pre-analyze-worker-frame";
  workerFrame.dataset.gooseGlanceWorker = "true";
  workerFrame.setAttribute("aria-hidden", "true");
  workerFrame.src = chrome.runtime.getURL("content/index.html");
  document.body.appendChild(workerFrame);
  return workerFrame;
}

function sendPendingBulkRequest() {
  if (!workerReady || !pendingBulkRequest || !workerFrame?.contentWindow) return;
  workerFrame.contentWindow.postMessage(
    pendingBulkRequest,
    `chrome-extension://${chrome.runtime.id}`
  );
  pendingBulkRequest = null;
}

async function saveProcessedBoard(boardId: BoardId, jobCount: number) {
  const result = await chrome.storage.local.get(BOARD_STATUS_STORAGE_KEY);
  const stored = (result[BOARD_STATUS_STORAGE_KEY] ?? {}) as StoredBoardState;
  stored[boardId] = { processedAt: Date.now(), jobCount };
  await chrome.storage.local.set({ [BOARD_STATUS_STORAGE_KEY]: stored });
}

function handleWorkerMessage(event: MessageEvent) {
  if (event.source !== workerFrame?.contentWindow) return;

  if (event.data?.type === "IFRAME_HOOK_READY") {
    workerReady = true;
    sendPendingBulkRequest();
  }

  if (event.data?.type === "BULK_ANALYSIS_PROGRESS") {
    const { boardId, completed, total } = event.data.payload as {
      boardId: BoardId;
      completed: number;
      total: number;
    };
    boardStates[boardId].progress = `Analyzing ${completed}/${total}`;
    renderBoard(boardId);
  }

  if (event.data?.type === "BULK_ANALYSIS_COMPLETE") {
    const { boardId, total } = event.data.payload as {
      boardId: BoardId;
      total: number;
    };
    boardStates[boardId].processed = true;
    boardStates[boardId].progress = null;
    activeBoardId = null;
    void saveProcessedBoard(boardId, total);
    renderAllBoards();
  }

  if (event.data?.type === "BULK_ANALYSIS_ERROR") {
    const { boardId, error } = event.data.payload as {
      boardId: BoardId;
      error: string;
    };
    console.error(`Bulk analysis failed for ${boardId}:`, error);
    boardStates[boardId].progress = null;
    activeBoardId = null;
    renderAllBoards();
  }
}

async function processBoard(board: BoardConfig) {
  if (activeBoardId || boardStates[board.id].available === false) return;

  activeBoardId = board.id;
  boardStates[board.id].progress = "Loading…";
  renderAllBoards();

  try {
    const jobs = await scrapeBoard(board);
    if (boardStates[board.id].available === false) {
      boardStates[board.id].progress = null;
      activeBoardId = null;
      renderAllBoards();
      return;
    }

    boardStates[board.id].progress = `Analyzing 0/${jobs.length}`;
    renderBoard(board.id);
    pendingBulkRequest = {
      type: "BULK_ANALYZE_JOBS",
      payload: { boardId: board.id, jobs },
    };
    ensureWorkerFrame();
    sendPendingBulkRequest();
  } catch (error) {
    console.error(`Failed to process ${board.label}:`, error);
    boardStates[board.id].progress = null;
    activeBoardId = null;
    renderAllBoards();
  }
}

export async function initializePreAnalyze() {
  if (!window.location.pathname.startsWith("/myAccount/")) return;
  if (document.querySelector(".gg-pre-analyze-trigger")) return;
  injectPreAnalyzeStyles();
  createTriggerAndPanel();
  window.addEventListener("message", handleWorkerMessage);
  await loadStoredBoardStates();
}
