import {
  CreateExtensionServiceWorkerMLCEngine,
  ChatCompletionRequest,
  ResponseFormat,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";
import { setJobSummary as setJobSummaryDB } from "../useIndexedDB";

const LOCAL_MODEL_ID = "Qwen3-4B-q4f16_1-MLC";

const buildSystemMessage = (language: string) =>
  `Summarize the provided job posting with concise language. Consider the context provided below when generating your summary.\n\n# Context\n\n- The job posting provided is from Waterloo Works, designed for university students seeking co-op opportunities.\n- You may assume the user holds a work visa for legal employment in Canada. This does not imply the user is a Citizen, holds a PR or is a refugee protected by Canada.\n- Focus the summarization on information that is most relevant and appealing to university students. Use English in your response unless specified for certain fields otherwise.\n\n# Field Notes\n\n\`job_title\`: A descriptive job title according to main roles of the job position. This can be different from the job title in the original posting. Use ${language} for this field.\n\n\`key_roles\`: 1-3 key responsibilities of the role with <mark>helighted keywords</mark>. Use ${language} for this field.\n\n\`work_term_year\`: Start and end year of the job (e.g. [2024, 2025])\n\n\`work_term_month\`: Start and end months of the job (e.g. ['May', 'August'])\n\n\`work_term_date\`: Start and end date of the job (e.g. [1, 31])\n\n\`work_type\`: Work arrangement type\n\n\`working_country_iso3166_alpha2\`: Working country in ISO 3166-1 alpha-2, 'null' for fully remote position\n\n\`working_location\`: Working location formatted as 'City, Province', 'null' for fully remote position\n\n\`company_name\`: Official company/organization name\n\n\`technical_skills\`: Programming languages, frameworks, and technical tools. Only list skill names, no explanation needed\n\n\`soft_skills\`: Non-technical skills like communication or teamwork. Use ${language} for this field.\n\n\`speak_french\`: Requirement for French language proficiency\n\n\`driver_license\`: Requirement for a valid driver's license\n\n\`background_check\`: Requires criminal background check\n\n\`canadian_citizen_or_pr\`: Requirement for Canadian citizenship/PR status\n\n\`work_visa\`: This ONLY applies to jobs outside of Canada. Select true if the job requires a work visa\n\n\`other_special_requirements\`: Additional special requirements (e.g. certifications, licenses, health clearances).`;

// Pre-converted JSON schema string
const OUTPUT_SCHEMA_JSON =
  '{"additionalProperties":false,"type":"object","properties":{"job_title":{"type":"string"},"key_roles":{"type":"array","items":{"type":"string"}},"work_term_year":{"anyOf":[{"type":"array","items":{"type":"number"}},{"type":"null"}]},"work_term_month":{"anyOf":[{"type":"array","items":{"enum":["January","February","March","April","May","June","July","August","September","October","November","December"],"type":"string"}},{"type":"null"}]},"work_term_date":{"anyOf":[{"type":"array","items":{"type":"number"}},{"type":"null"}]},"work_type":{"anyOf":[{"enum":["on_site","hybrid","fully_remote"],"type":"string"},{"type":"null"}]},"working_country_iso3166_alpha2":{"anyOf":[{"pattern":"^[A-Z]{2}$","type":"string"},{"type":"null"}]},"working_location":{"anyOf":[{"type":"string"},{"type":"null"}]},"company_name":{"type":"string"},"technical_skills":{"type":"array","items":{"type":"string"}},"soft_skills":{"type":"array","items":{"type":"string"}},"speak_french":{"enum":["Not required","Preferred","Required"],"type":"string"},"driver_license":{"enum":["Not required","Preferred","Required"],"type":"string"},"background_check":{"type":"boolean"},"canadian_citizen_or_pr":{"enum":["Not required","Preferred","Required"],"type":"string"},"work_visa":{"type":"boolean"},"other_special_requirements":{"anyOf":[{"type":"array","items":{"type":"string"}},{"type":"null"}]}},"required":["job_title","key_roles","work_term_year","work_term_month","work_term_date","work_type","working_country_iso3166_alpha2","working_location","company_name","technical_skills","soft_skills","speak_french","driver_license","background_check","canadian_citizen_or_pr","work_visa","other_special_requirements"]}';

let enginePromise: Promise<MLCEngineInterface> | null = null;
async function getEngine(): Promise<MLCEngineInterface> {
  if (!enginePromise) {
    enginePromise = CreateExtensionServiceWorkerMLCEngine(LOCAL_MODEL_ID, {
      initProgressCallback: () => {},
    });
  }
  return enginePromise;
}

export const useLocalAnalysis = () => {
  const analyzeWithLocal = async (
    jobId: string,
    description: string,
    language: string
  ) => {
    if (!jobId) {
      return {
        status: "error",
        source: "local",
        error: "Missing job ID",
      } as const;
    }

    try {
      const engine = await getEngine();
      const request: ChatCompletionRequest = {
        stream: false,
        messages: [
          { role: "system", content: buildSystemMessage(language) },
          { role: "user", content: description },
        ],
        max_tokens: 1024,
        response_format: {
          type: "json_object",
          schema: OUTPUT_SCHEMA_JSON,
        } as ResponseFormat,
      };

      await engine.chatCompletion(request);
      const summary = await engine.getMessage();

      if (summary) {
        await setJobSummaryDB(jobId, summary);
        return { status: "success", source: "local" } as const;
      }
      throw new Error("No summary returned from local model");
    } catch (error) {
      return {
        status: "error",
        source: "local",
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      } as const;
    }
  };

  return { analyzeWithLocal };
};
