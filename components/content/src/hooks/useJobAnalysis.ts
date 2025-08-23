import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useJobSummarization } from "../utils/useJobSummarization";

export const useJobAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobID = useAppSelector((state) => state.waterlooworks.onJobId);

  const jobData = useAppSelector((state) => {
    const data = state.waterlooworks.jobData;
    return jobID && data[jobID]
      ? {
          description: data[jobID].description,
          summary: data[jobID].summary,
          id: jobID,
        }
      : null;
  });

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
