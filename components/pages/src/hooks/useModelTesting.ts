import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChatCompletionRequest } from "@mlc-ai/web-llm";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  CreateExtensionServiceWorkerMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

export type CloudProvider = "OpenAI" | "Gemini" | "OpenRouter";
export type TestStatus = "idle" | "testing" | "success" | "error";

interface UseModelTestingOptions {
  localModelId?: string;
}

export function useModelTesting(options?: UseModelTestingOptions) {
  const LOCAL_MODEL_ID = options?.localModelId ?? "Qwen3-4B-q4f16_1-MLC";
  const { t } = useTranslation();

  // Cloud test states
  const [cloudTestStatus, setCloudTestStatus] = useState<TestStatus>("idle");
  const [cloudTestMessage, setCloudTestMessage] = useState("");

  // Local engine & test states
  const engineRef = useRef<MLCEngineInterface | null>(null);
  const [webGpuSupported, setWebGpuSupported] = useState(true);
  const [webGpuError, setWebGpuError] = useState("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [isLocalEngineReady, setIsLocalEngineReady] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localProgressText, setLocalProgressText] = useState(
    t("hooks.modelTesting.notStarted")
  );
  const [localTestStatus, setLocalTestStatus] = useState<TestStatus>("idle");
  const [localTestMessage, setLocalTestMessage] = useState("");
  const [poem, setPoem] = useState("");
  const [isGeneratingPoem, setIsGeneratingPoem] = useState(false);

  // WebGPU detection
  const detectWebGpu = useCallback(() => {
    const supported =
      typeof navigator !== "undefined" &&
      (navigator as Navigator & Record<string, unknown>) &&
      "gpu" in (navigator as Navigator & Record<string, unknown>);
    setWebGpuSupported(supported);
    if (!supported) {
      setWebGpuError(t("hooks.modelTesting.webGpuNotSupported"));
    } else {
      setWebGpuError("");
    }
    return supported;
  }, [t]);

  useEffect(() => {
    detectWebGpu();
  }, [detectWebGpu]);

  // Local engine lifecycle
  const localInitProgress = useCallback((report: InitProgressReport) => {
    setLocalProgress(report.progress ?? 0);
    setLocalProgressText(report.text ?? "");
    if (report.progress === 1) {
      setIsLocalEngineReady(true);
      setIsLoadingLocal(false);
    }
  }, []);

  const unloadLocalEngine = useCallback(async () => {
    if (engineRef.current) {
      try {
        await engineRef.current.unload?.();
      } catch {
        // ignore
      }
      engineRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void unloadLocalEngine();
    };
  }, [unloadLocalEngine]);

  const loadLocalEngine = useCallback(async () => {
    setIsLoadingLocal(true);
    setIsLocalEngineReady(false);
    setLocalProgress(0);
    setLocalProgressText(t("hooks.modelTesting.startingModelLoad"));
    try {
      await unloadLocalEngine();
      const engine = await CreateExtensionServiceWorkerMLCEngine(
        LOCAL_MODEL_ID,
        { initProgressCallback: localInitProgress }
      );
      engineRef.current = engine;
    } catch (e) {
      console.error(e);
      setLocalProgressText(t("hooks.modelTesting.modelLoadFailed"));
      setIsLoadingLocal(false);
    }
  }, [LOCAL_MODEL_ID, localInitProgress, unloadLocalEngine, t]);

  // Local model smoke test (poem)
  const testLocalByPoem = useCallback(async () => {
    if (!detectWebGpu()) {
      setLocalTestStatus("error");
      setLocalTestMessage(
        webGpuError || t("hooks.modelTesting.webGpuUnsupportedShort")
      );
      return;
    }
    setLocalTestStatus("testing");
    setLocalTestMessage("");
    setPoem("");

    try {
      if (!engineRef.current || !isLocalEngineReady) {
        await loadLocalEngine();
      }
      if (!engineRef.current || !isLocalEngineReady) {
        if (!engineRef.current) {
          setLocalTestStatus("error");
          setLocalTestMessage(t("hooks.modelTesting.engineNotReady"));
          return;
        }
      }

      const engine = engineRef.current!;
      const prompt = "Write a four-line poem about 'A cute goose'.";
      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: "/no_think" },
        { role: "user", content: prompt },
      ];
      const req: ChatCompletionRequest = {
        messages,
        stream: true,
        temperature: 0.7,
        top_p: 0.9,
      } as ChatCompletionRequest;

      setIsGeneratingPoem(true);
      setPoem("");

      // Helper to remove <think> blocks and any stray tags from output
      const stripThinkTags = (text: string) =>
        text
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/<\/?think>/gi, "")
          .replace(/^\s+/, "");

      const genStart =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const completion = await engine.chat.completions.create(req);
      let acc = "";
      for await (const chunk of completion as AsyncIterable<ChatCompletionChunk>) {
        const curDelta = chunk?.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (curDelta) {
          acc += curDelta;
          setPoem(stripThinkTags(acc));
        }
      }
      // Final cleanup just in case
      setPoem((prev) => stripThinkTags(prev));
      const genEnd =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const elapsedMs = genEnd - genStart;
      setLocalTestStatus("success");
      setLocalTestMessage(
        elapsedMs > 5000
          ? t("hooks.modelTesting.localPerfSlowWarning")
          : t("hooks.modelTesting.localTestSuccess")
      );
    } catch (e) {
      console.error(e);
      setLocalTestStatus("error");
      setLocalTestMessage(t("hooks.modelTesting.localTestFailed"));
    } finally {
      setIsGeneratingPoem(false);
    }
  }, [detectWebGpu, isLocalEngineReady, webGpuError, loadLocalEngine, t]);

  // Cloud provider API key testers
  const testOpenAI = async (key: string) => {
    const resp = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (resp.ok)
      return {
        success: true,
        message: t("hooks.modelTesting.apiKeyValid"),
      } as const;
    return {
      success: false,
      message: t("hooks.modelTesting.apiKeyInvalid"),
    } as const;
  };

  type ProviderErrorPayload = { error?: { message?: string } };

  const testOpenRouter = async (key: string) => {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: "Say hi." }],
        max_tokens: 1,
      }),
    });
    if (resp.ok)
      return {
        success: true,
        message: t("hooks.modelTesting.apiKeyValid"),
      } as const;
    const error = (await resp
      .json()
      .catch(() => ({}))) as unknown as ProviderErrorPayload;
    return {
      success: false,
      message: error?.error?.message || t("hooks.modelTesting.apiKeyInvalid"),
    } as const;
  };

  const testGemini = async (key: string) => {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hi." }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    );
    if (resp.ok)
      return {
        success: true,
        message: t("hooks.modelTesting.apiKeyValid"),
      } as const;
    const error = (await resp
      .json()
      .catch(() => ({}))) as unknown as ProviderErrorPayload;
    return {
      success: false,
      message: error?.error?.message || t("hooks.modelTesting.apiKeyInvalid"),
    } as const;
  };

  const testCloudApi = async (
    provider: CloudProvider,
    apiKey: string
  ): Promise<void> => {
    if (!apiKey.trim()) {
      setCloudTestStatus("error");
      setCloudTestMessage(t("hooks.modelTesting.inputApiKey"));
      return;
    }
    try {
      setCloudTestStatus("testing");
      setCloudTestMessage("");
      let result: { success: boolean; message: string };
      if (provider === "OpenAI") result = await testOpenAI(apiKey.trim());
      else if (provider === "OpenRouter")
        result = await testOpenRouter(apiKey.trim());
      else result = await testGemini(apiKey.trim());

      setCloudTestStatus(result.success ? "success" : "error");
      setCloudTestMessage(result.message);
    } catch (e) {
      console.error(e);
      setCloudTestStatus("error");
      setCloudTestMessage(t("hooks.modelTesting.testError"));
    }
  };

  // Resets
  const resetCloudTest = () => {
    setCloudTestStatus("idle");
    setCloudTestMessage("");
  };
  const resetLocalTest = () => {
    setLocalTestStatus("idle");
    setLocalTestMessage("");
    setPoem("");
  };

  return {
    // cloud
    cloudTestStatus,
    cloudTestMessage,
    testCloudApi,
    resetCloudTest,

    // local
    webGpuSupported,
    webGpuError,
    isLoadingLocal,
    isLocalEngineReady,
    localProgress,
    localProgressText,
    localTestStatus,
    localTestMessage,
    poem,
    isGeneratingPoem,
    testLocalByPoem,
    resetLocalTest,
  } as const;
}
