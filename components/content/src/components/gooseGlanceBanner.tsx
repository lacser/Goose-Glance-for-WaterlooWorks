import { Button, Switch } from "@fluentui/react-components";
import { DataUsageSparkleRegular, PanelTopContractRegular, PanelTopExpandRegular } from "@fluentui/react-icons";
import { useJobAnalysis } from "../hooks/useJobAnalysis";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setAutoAnalysis } from "../store/slices/settingsSlice";
import LoadingAnimation from "./loadingAnimation";

interface GooseGlanceBannerProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function GooseGlanceBanner({
  collapsed,
  onToggleCollapse,
}: GooseGlanceBannerProps) {
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
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <strong>GOOSE GLANCE INSIGHT</strong>
          {isLoading && <LoadingAnimation />}
        </div>
        <Button
          appearance="subtle"
          aria-label={collapsed ? "Expand" : "Collapse"}
          title={collapsed ? "Expand" : "Collapse"}
          onClick={onToggleCollapse}
          icon={
            collapsed ? <PanelTopExpandRegular /> : <PanelTopContractRegular />
          }
        />
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
