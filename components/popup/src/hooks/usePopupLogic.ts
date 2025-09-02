import { useCallback, useEffect, useRef, useState } from "react";
import { useApiKeyTest } from "./useApiKeyTest";
import {
  CreateExtensionServiceWorkerMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

type AiProvider = "OpenAI" | "Gemini" | "OpenRouter" | "Local";

interface ApiKeys {
  OpenAI: string;
  Gemini: string;
  OpenRouter: string;
  Local: string;
}

export function usePopupLogic() {
  // Local engine refs & states
  const localEngineRef = useRef<MLCEngineInterface | null>(null);
  const LOCAL_MODEL_ID = "Qwen3-4B-q4f16_1-MLC";

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    OpenAI: "",
    Gemini: "",
    OpenRouter: "",
    Local: "",
  });
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [aiProvider, setAiProvider] = useState<AiProvider>("OpenAI");
  const [devMode, setDevMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [providerSwitchMessage, setProviderSwitchMessage] = useState("");

  // WebGPU and local model loading states
  const [webGpuSupported, setWebGpuSupported] = useState(true);
  const [webGpuError, setWebGpuError] = useState("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [isLocalEngineReady, setIsLocalEngineReady] = useState(false);
  const [localLoadProgress, setLocalLoadProgress] = useState(0);
  const [localProgressText, setLocalProgressText] = useState("Not started");
  const { testStatus, testMessage, testApiKey, resetTest } = useApiKeyTest();

  // WebGPU detection
  const detectWebGpu = useCallback(() => {
    const supported =
      typeof navigator !== "undefined" &&
      "gpu" in (navigator as Navigator & Record<string, unknown>);
    setWebGpuSupported(supported);
    if (!supported) {
      setWebGpuError(
        "Your browser does not currently support WebGPU. Local AI cannot be enabled. Please use the latest Chrome or Edge."
      );
    } else {
      setWebGpuError("");
    }
    return supported;
  }, []);

  const localInitProgress = useCallback((report: InitProgressReport) => {
    setLocalLoadProgress(report.progress ?? 0);
    setLocalProgressText(report.text ?? "");
    if (report.progress === 1) {
      setIsLocalEngineReady(true);
      setIsLoadingLocal(false);
    }
  }, []);

  const unloadLocalEngine = useCallback(async () => {
    if (localEngineRef.current) {
      try {
        await localEngineRef.current.unload?.();
      } catch {
        // ignore
      }
      localEngineRef.current = null;
    }
  }, []);

  const startLoadLocalEngine = useCallback(async () => {
    setIsLoadingLocal(true);
    setIsLocalEngineReady(false);
    setLocalLoadProgress(0);
    setLocalProgressText("Starting model load...");
    try {
      await unloadLocalEngine();
      const engine = await CreateExtensionServiceWorkerMLCEngine(
        LOCAL_MODEL_ID,
        {
          initProgressCallback: localInitProgress,
        }
      );
      localEngineRef.current = engine;
    } catch (e) {
      console.error(e);
      setLocalProgressText(
        "Model loading failed. Please check the console log."
      );
      setIsLoadingLocal(false);
    }
  }, [LOCAL_MODEL_ID, localInitProgress, unloadLocalEngine]);

  // Handle AI Provider change with notification + local model handling
  const handleAiProviderChange = (newProvider: AiProvider) => {
    setAiProvider(newProvider);
    resetTest();
    if (newProvider === "Local") {
      setProviderSwitchMessage("Starting local model load...");
      setTimeout(() => setProviderSwitchMessage(""), 2000);

      if (!detectWebGpu()) {
        setIsLoadingLocal(false);
        setIsLocalEngineReady(false);
        return;
      }
      startLoadLocalEngine();
    } else {
      // Switching away from Local
      setProviderSwitchMessage(`API Key for ${newProvider} loaded`);
      setTimeout(() => setProviderSwitchMessage(""), 2000);
      unloadLocalEngine();
      setIsLoadingLocal(false);
      setIsLocalEngineReady(false);
      setLocalLoadProgress(0);
      setLocalProgressText("Not started");
    }
  };

  // Reset test status and message when API key changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKeys((prev) => ({
      ...prev,
      [aiProvider]: newValue,
    }));
    resetTest();
  };

  // Load saved settings on mount
  useEffect(() => {
    chrome.storage.sync.get(
      ["apiKeys", "autoAnalysis", "language", "devMode", "aiProvider"],
      (result) => {
        if (result.apiKeys) {
          setApiKeys(result.apiKeys);
        }
        if (typeof result.autoAnalysis !== "undefined") {
          setAutoAnalysis(result.autoAnalysis);
        }
        if (result.language) {
          setLanguage(result.language);
        }
        if (typeof result.devMode !== "undefined") {
          setDevMode(result.devMode);
        }
        if (result.aiProvider) {
          setAiProvider(result.aiProvider);
          // If restored provider is Local, apply WebGPU check and possibly start loading
          if (result.aiProvider === "Local") {
            if (detectWebGpu()) {
              startLoadLocalEngine();
            }
          }
        }
      }
    );
  }, [detectWebGpu, startLoadLocalEngine]);

  // Save the settings to chrome.storage
  const saveSettings = () => {
    chrome.storage.sync.set(
      {
        apiKeys,
        autoAnalysis,
        language,
        devMode,
        aiProvider,
      },
      () => {
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 500);
      }
    );
  };

  const handleTestApiKey = () => {
    const currentApiKey = apiKeys[aiProvider];
    testApiKey(currentApiKey, aiProvider);
  };

  return {
    apiKey: apiKeys[aiProvider], // Return the current provider's API key
    setApiKey: handleApiKeyChange,
    aiProvider,
    setAiProvider: handleAiProviderChange,
    language,
    setLanguage,
    testStatus,
    testMessage,
    providerSwitchMessage,
    autoAnalysis,
    setAutoAnalysis,
    devMode,
    setDevMode,
    saveStatus,
    saveSettings,
    testApiKey: handleTestApiKey,
    webGpuSupported,
    webGpuError,
    isLoadingLocal,
    isLocalEngineReady,
    localLoadProgress,
    localProgressText,
  };
}
