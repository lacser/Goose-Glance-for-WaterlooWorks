import { useAppSelector } from "../store/hooks";
import { setJobSummary as setJobSummaryDB } from "../utils/useIndexedDB";
import { useJobData } from "../hooks/useJobData";

export const useJobSummarization = (jobId: string | null) => {
  const { rawSummary: existingSummary } = useJobData(jobId ?? undefined);

  const openaiApiKey = useAppSelector((state) => state.settings.openaiApiKey);
  const language = useAppSelector((state) => state.settings.language);
  const llmConfig = useAppSelector((state) => state.llmConfig);

  const summarizeJob = async (description: string) => {
    if (!jobId || !openaiApiKey) return;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model_config.model,
            messages: [
              {
                role: "system",
                content: `${llmConfig.system_message}\nPlease respond in ${language}.`,
              },
              {
                role: "user",
                content: description,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: llmConfig.output_schema,
            },
            temperature: llmConfig.model_config.temperature,
            top_p: llmConfig.model_config.top_p,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from OpenAI");
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content;

      if (summary) {
        await setJobSummaryDB(jobId, summary);
        return {
          status: "success",
          source: "openai",
        } as const;
      } else {
        throw new Error("No summary returned from OpenAI");
      }
    } catch (error) {
      return {
        status: "error",
        source: "openai",
        error: error instanceof Error ? error.message : "An unknown error occurred",
      } as const;
    }
  };

  return {
    summarizeJob,
    existingSummary,
  };
};
