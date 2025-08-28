import { setJobSummary as setJobSummaryDB } from "../useIndexedDB";

const MODEL_CONFIG = {
  model: "google/gemini-2.5-flash",
};

const SYSTEM_MESSAGE = `Summarize the provided job posting with concise language. Consider the context provided below when generating your summary.\n\n# Context\n\n- The job posting provided is from Waterloo Works, designed for university students seeking co-op opportunities.\n- You may assume the user holds a work visa for legal employment in Canada. This does not imply the user is a Citizen, holds a PR or is a refugee protected by Canada.\n\n# Notes\n\n- Focus the summarization on information that is most relevant and appealing to university students. Use English in your response unless specified for certain fields otherwise.`;

const getOutputSchema = (language: string) => ({
  name: "job_info_insight",
  strict: true,
  schema: {
    type: "object",
    properties: {
      job_title: {
        type: "string",
        description: `A descriptive job title according to main roles of the job position. This can be different from the job title in the original posting. Use ${language} for this field.`,
      },
      key_roles: {
        type: "array",
        description: `1-3 key responsibilities of the role with <mark>highlighted keywords</mark>. Use ${language} for this field.`,
        items: {
          type: "string",
        },
      },
      work_term_year: {
        type: ["array", "null"],
        description:
          "Start and end year of the work term (e.g. [2024, 2025])",
        items: {
          type: "number",
        },
      },
      work_term_month: {
        type: ["array", "null"],
        description:
          "Start and end months of the work term (e.g. ['May', 'August'])",
        items: {
          type: "string",
          enum: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
        },
      },
      work_term_date: {
        type: ["array", "null"],
        description: "Start and end date of the work term (e.g. [1, 31])",
        items: {
          type: "number",
        },
      },
      work_type: {
        type: ["string", "null"],
        enum: ["on_site", "hybrid", "fully_remote"],
        description: "Work arrangement type",
      },
      working_country_iso3166_alpha2: {
        type: ["string", "null"],
        pattern: "^[A-Z]{2}$",
        description:
          "Working country in ISO 3166-1 alpha-2, 'null' for fully remote position",
      },
      working_location: {
        type: ["string", "null"],
        description:
          "Working location formatted as 'City, Province', 'null' for fully remote position",
      },
      company_name: {
        type: "string",
        description: "Official company/organization name",
      },
      technical_skills: {
        type: "array",
        description: "Programming languages, frameworks, and technical tools",
        items: {
          type: "string",
        },
      },
      soft_skills: {
        type: "array",
        description: "Non-technical skills like communication or teamwork",
        items: {
          type: "string",
        },
      },
      speak_french: {
        type: "string",
        description: "Requirement for French language proficiency",
        enum: ["Not required", "Preferred", "Required"],
      },
      driver_license: {
        type: "string",
        description: "Requirement for a valid driver's license",
        enum: ["Not required", "Preferred", "Required"],
      },
      background_check: {
        type: "boolean",
        description: "Requires criminal background check",
      },
      canadian_citizen_or_pr: {
        type: "string",
        description: "Requirement for Canadian citizenship/PR status",
        enum: ["Not required", "Preferred", "Required"],
      },
      work_visa: {
        type: "boolean",
        description:
          "This ONLY applies to jobs outside of Canada. Select true if the job requires a work visa",
      },
      other_special_requirements: {
        type: ["array", "null"],
        description: `Additional special requirements (e.g. certifications, licenses, health clearances). Use ${language} for this field.`,
        items: {
          type: "string",
        },
      },
    },
    required: [
      "job_title",
      "key_roles",
      "work_term_year",
      "work_term_month",
      "work_term_date",
      "work_type",
      "working_country_iso3166_alpha2",
      "working_location",
      "company_name",
      "technical_skills",
      "soft_skills",
      "speak_french",
      "driver_license",
      "background_check",
      "canadian_citizen_or_pr",
      "work_visa",
      "other_special_requirements",
    ],
    additionalProperties: false,
  },
});

export const useOpenRouterAnalysis = () => {
  const analyzeWithOpenRouter = async (
    jobId: string,
    description: string,
    apiKey: string,
    language: string
  ) => {
    if (!jobId || !apiKey) {
      return {
        status: "error",
        source: "openrouter",
        error: "Missing job ID or API key",
      } as const;
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: MODEL_CONFIG.model,
            messages: [
              {
                role: "system",
                content: SYSTEM_MESSAGE,
              },
              {
                role: "user",
                content: description,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: getOutputSchema(language),
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response from OpenRouter: ${errorText}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content;

      if (summary) {
        await setJobSummaryDB(jobId, summary);
        return {
          status: "success",
          source: "openrouter",
        } as const;
      } else {
        throw new Error("No summary returned from OpenRouter");
      }
    } catch (error) {
      return {
        status: "error",
        source: "openrouter",
        error: error instanceof Error ? error.message : "An unknown error occurred",
      } as const;
    }
  };

  return { analyzeWithOpenRouter };
};
