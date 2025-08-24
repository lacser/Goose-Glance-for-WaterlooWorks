import { useState } from "react";
import { useJobSummarization } from "../utils/useJobSummarization";
import { useJobData } from "./useJobData";

export const useJobAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const job = useJobData();
  const jobData = job.id
    ? {
        id: job.id,
        description: job.description ?? "",
        summary: job.rawSummary ?? null,
      }
    : null;

  const { summarizeJob } = useJobSummarization(jobData?.id || null);

  const handleAnalyze = async () => {
    if (!jobData?.description) return;

    setIsLoading(true);
    setError(null);

    try {
      await summarizeJob(jobData.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleAnalyze,
    jobData,
  };
};
