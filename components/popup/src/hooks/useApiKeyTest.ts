import { useState } from "react";

type TestStatus = "idle" | "testing" | "success" | "error";
type AiProvider = "OpenAI" | "Gemini" | "OpenRouter" | "Local";

export function useApiKeyTest() {
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");

  const testOpenAI = async (apiKey: string) => {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { success: true, message: "API key is valid" };
    } else {
      return { success: false, message: "Invalid API key" };
    }
  };

  const testOpenRouter = async (apiKey: string) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: "Explain how AI works in a few words.",
            },
          ],
          max_tokens: 1,
        }),
      }
    );

    if (response.ok) {
      return { success: true, message: "API key is valid" };
    } else {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.error?.message || "Invalid API key",
      };
    }
  };

  const testGemini = async (apiKey: string) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Explain how AI works in a few words.",
                },
              ],
            },
          ],
          generationConfig: {
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
      }
    );

    if (response.ok) {
      return { success: true, message: "API key is valid" };
    } else {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.error?.message || "Invalid API key",
      };
    }
  };

  const testApiKey = async (apiKey: string, aiProvider: AiProvider) => {
    if (!apiKey.trim()) {
      setTestMessage("Please enter an API key");
      setTestStatus("error");
      return;
    }

    if (aiProvider === "Local") {
      setTestMessage("Local provider does not require testing");
      setTestStatus("success");
      return;
    }

    try {
      setTestStatus("testing");
      setTestMessage("");

      let result;
      switch (aiProvider) {
        case "OpenAI":
          result = await testOpenAI(apiKey.trim());
          break;
        case "OpenRouter":
          result = await testOpenRouter(apiKey.trim());
          break;
        case "Gemini":
          result = await testGemini(apiKey.trim());
          break;
        default:
          throw new Error("Unsupported AI provider");
      }

      setTestStatus(result.success ? "success" : "error");
      setTestMessage(result.message);
    } catch (error) {
      setTestStatus("error");
      setTestMessage("Error testing API key");
      console.error("API key test error:", error);
    }
  };

  const resetTest = () => {
    setTestStatus("idle");
    setTestMessage("");
  };

  return {
    testStatus,
    testMessage,
    testApiKey,
    resetTest,
  };
}
