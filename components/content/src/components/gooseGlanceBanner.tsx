import { Button } from "@fluentui/react-components";
import { DataUsageSparkleRegular } from "@fluentui/react-icons";
import { useJobAnalysis } from "../hooks/useJobAnalysis";
import LoadingAnimation from "./loadingAnimation";

export default function GooseGlanceBanner() {
  const { isLoading, handleAnalyze } = useJobAnalysis();

  return (
    <div className="bg-gray-200 h-9 pl-2.5 pr-1 rounded flex items-center text-sm justify-between">
      <div className="flex items-center">
        <strong>GOOSE GLANCE INSIGHT</strong>
        {isLoading && <LoadingAnimation />}
      </div>
      <div className="ml-2">
        <Button appearance="primary" onClick={handleAnalyze} icon={<DataUsageSparkleRegular />}>
          Analyze
        </Button>
      </div>
    </div>
  );
}
