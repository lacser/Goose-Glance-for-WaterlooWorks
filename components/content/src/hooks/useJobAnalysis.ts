import { useJobSummarization } from "./useJobSummarization";
import { useJobData } from "./useJobData";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setIsLoading, setError } from "../store/slices/waterlooworksSlice";

export const useJobAnalysis = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);

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

    dispatch(setError(null));
    dispatch(setIsLoading(true));

    try {
      const result = await summarizeJob(jobData.description);
      if (result.status === "error") {
        dispatch(setError(result.error));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : "An error occurred"));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return {
    isLoading,
    handleAnalyze,
    jobData,
  };
};
