import { Button, Switch } from "@fluentui/react-components";
import { DataUsageSparkleRegular } from "@fluentui/react-icons";
import { useJobAnalysis } from "../hooks/useJobAnalysis";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setAutoAnalysis } from "../store/slices/settingsSlice";

export default function NoAnalysisPage() {
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
    <div className="w-full h-80 flex items-center p-6 rounded-lg">
      {/* Left side - No Analysis image */}
      <div className="flex-shrink-0">
        <img
          src="/content/NoAnalysisImage.webp"
          alt="Not analyzed Yet"
          className="rounded-lg size-72"
        />
      </div>

      {/* Right side - Description and controls */}
      <div className="flex-1 ml-8 flex flex-col justify-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Not analyzed Yet
        </h2>

        <p className="text-gray-600 mb-2 leading-relaxed">
          You can start an analysis manually using the Analyze button below, or
          enable Auto Analysis to automatically analyze job postings when
          they're detected.
        </p>

        <p className="text-black mb-4 leading-relaxed">
          Analyized job summaries are always automatically saved locally on your
          computer.
        </p>

        <div className="flex flex-col gap-4">
          {/* Analyze Button */}
          <div className="flex items-center gap-3">
            <Button
              appearance="primary"
              onClick={handleAnalyze}
              icon={<DataUsageSparkleRegular />}
              disabled={isLoading}
              className="flex-1"
            >
              Analyze Job Posting
            </Button>
          </div>

          {/* Auto Analysis Toggle */}
          <div className="flex items-center justify-between">
            <Switch
              label="Auto Analysis"
              checked={autoAnalysisEnabled}
              onChange={handleAutoAnalysisToggle}
            />
            <span className="text-sm text-gray-500">
              {autoAnalysisEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
