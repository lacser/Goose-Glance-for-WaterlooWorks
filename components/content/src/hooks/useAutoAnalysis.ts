import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useJobData } from "./useJobData";
import { useJobAnalysis } from "./useJobAnalysis";

export const useAutoAnalysis = () => {
  const onJobId = useAppSelector((state) => state.waterlooworks.onJobId);
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
  const autoAnalysis = useAppSelector((state) => state.settings.autoAnalysis);

  const { summary } = useJobData();
  const { handleAnalyze } = useJobAnalysis();
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (onJobId && !summary && !isLoading && autoAnalysis && !hasAnalyzed) {
      handleAnalyze();
    }
    if (isLoading) {
      setHasAnalyzed(true);
    }
  }, [onJobId, summary, isLoading, autoAnalysis, handleAnalyze, hasAnalyzed]);
};
