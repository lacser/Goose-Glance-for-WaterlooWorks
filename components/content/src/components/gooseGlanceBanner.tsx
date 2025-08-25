import { Button, Switch } from "@fluentui/react-components";
import { DataUsageSparkleRegular } from "@fluentui/react-icons";
import { useJobAnalysis } from "../hooks/useJobAnalysis";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setAutoAnalysis } from "../store/slices/settingsSlice";
import LoadingAnimation from "./loadingAnimation";

export default function GooseGlanceBanner() {
  const { handleAnalyze } = useJobAnalysis();
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
  const autoAnalysisEnabled = useAppSelector(
    (state) => state.settings.autoAnalysis
  );
  const dispatch = useAppDispatch();
  const handleAutoAnalysisToggle = () => {
    dispatch(setAutoAnalysis(!autoAnalysisEnabled));
  };

  return (
    <div className="bg-gray-200 h-9 pl-2.5 pr-1 rounded flex items-center text-sm justify-between">
      <div className="flex items-center">
        <strong>GOOSE GLANCE INSIGHT</strong>
        {isLoading && <LoadingAnimation />}
      </div>
      <div className="flex items-center gap-2">
        {!autoAnalysisEnabled && (
          <Button
            appearance="primary"
            onClick={handleAnalyze}
            icon={<DataUsageSparkleRegular />}
            disabled={isLoading}
          >
            Analyze
          </Button>
        )}
        <Switch
          label="Auto Analysis"
          checked={autoAnalysisEnabled}
          onChange={handleAutoAnalysisToggle}
        />
      </div>
    </div>
  );
}
