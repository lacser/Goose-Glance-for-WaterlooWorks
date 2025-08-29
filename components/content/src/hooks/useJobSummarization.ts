import { useAppSelector } from "../store/hooks";
import { useJobData } from "../hooks/useJobData";
import { useOpenAIAnalysis } from "./providers/useOpenAIAnalysis";
import { useGeminiAnalysis } from "./providers/useGeminiAnalysis";
import { useOpenRouterAnalysis } from "./providers/useOpenRouterAnalysis";

export const useJobSummarization = (jobId: string | null) => {
  const { rawSummary: existingSummary } = useJobData(jobId ?? undefined);

  const openaiApiKey = useAppSelector((state) => state.settings.openaiApiKey);
  const geminiApiKey = useAppSelector((state) => state.settings.geminiApiKey);
  const openRouterApiKey = useAppSelector((state) => state.settings.openRouterApiKey);
  const aiProvider = useAppSelector((state) => state.settings.aiProvider);
  const language = useAppSelector((state) => state.settings.language);

  const { analyzeWithOpenAI } = useOpenAIAnalysis();
  const { analyzeWithGemini } = useGeminiAnalysis();
  const { analyzeWithOpenRouter } = useOpenRouterAnalysis();

  const summarizeJob = async (description: string) => {
    if (!jobId) {
      return {
        status: "error",
        source: aiProvider.toLowerCase(),
        error: "No job ID provided",
      } as const;
    }

    switch (aiProvider) {
      case 'OpenAI':
        if (!openaiApiKey) {
          return {
            status: "error",
            source: "openai",
            error: "OpenAI API key not configured",
          } as const;
        }
        return await analyzeWithOpenAI(jobId, description, openaiApiKey, language);

      case 'Gemini':
        if (!geminiApiKey) {
          return {
            status: "error",
            source: "gemini",
            error: "Gemini API key not configured",
          } as const;
        }
        return await analyzeWithGemini(jobId, description, geminiApiKey, language);

      case 'OpenRouter':
        if (!openRouterApiKey) {
          return {
            status: "error",
            source: "openrouter",
            error: "OpenRouter API key not configured",
          } as const;
        }
        return await analyzeWithOpenRouter(jobId, description, openRouterApiKey, language);

      case 'Local':
        return {
          status: "error",
          source: "local",
          error: "Local AI analysis not yet implemented",
        } as const;

      default:
        return {
          status: "error",
          source: "unknown",
          error: `Unknown AI provider: ${aiProvider}`,
        } as const;
    }
  };

  return {
    summarizeJob,
    existingSummary,
  };
};
