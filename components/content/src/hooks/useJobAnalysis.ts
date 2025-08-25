import { useState } from "react";
import { useJobSummarization } from "./useJobSummarization";
import { useJobData } from "./useJobData";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setIsLoading } from "../store/slices/waterlooworksSlice";

export const useJobAnalysis = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
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

    dispatch(setIsLoading(true));
    setError(null);

    try {
      await summarizeJob(jobData.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return {
    isLoading,
    error,
    handleAnalyze,
    jobData,
  };
};
