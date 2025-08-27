import { useAppSelector } from "../store/hooks";
import { setJobSummary as setJobSummaryDB } from "./useIndexedDB";
import { useJobData } from "../hooks/useJobData";

interface OpenAIResponseOutput {
  id: string;
  type: "reasoning" | "message";
  status?: string;
  content?: Array<{
    type: string;
    text: string;
  }>;
}

interface OpenAIResponse {
  output?: OpenAIResponseOutput[];
}

export const useJobSummarization = (jobId: string | null) => {
  const { rawSummary: existingSummary } = useJobData(jobId ?? undefined);

  const openaiApiKey = useAppSelector((state) => state.settings.openaiApiKey);
  const language = useAppSelector((state) => state.settings.language);
  const llmConfig = useAppSelector((state) => state.llmConfig);

  const summarizeJob = async (description: string) => {
    if (!jobId || !openaiApiKey) return;

    try {
      // Create a deep copy of the schema and replace ${response_language} with the actual language
      const schemaString = JSON.stringify(llmConfig.output_schema.schema);
      const updatedSchemaString = schemaString.replace(/\$\{response_language\}/g, language);
      const updatedSchema = JSON.parse(updatedSchemaString);

      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model_config.model,
            input: [
              {
                role: "system",
                content: llmConfig.system_message,
              },
              {
                role: "user",
                content: description,
              },
            ],
            text: {
              format: {
                type: "json_schema",
                name: llmConfig.output_schema.name,
                strict: llmConfig.output_schema.strict,
                schema: updatedSchema,
              },
              verbosity: "low"
            },
            reasoning: {
              effort: "minimal",
              summary: null
            },
            tools: [],
            store: false,
            include: []
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response from OpenAI");
      }

      const data: OpenAIResponse = await response.json();
      const summary = data.output?.find((item: OpenAIResponseOutput) => item.type === 'message')?.content?.[0]?.text;

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
