import { Button } from "@fluentui/react-components";
import { ArrowClockwiseRegular, BugRegular } from "@fluentui/react-icons";
import { useJobAnalysis } from "../hooks/useJobAnalysis";
import { useAppSelector } from "../store/hooks";

export default function AnalysisErrorPage() {
  const { handleAnalyze } = useJobAnalysis();
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
  const error = useAppSelector((state) => state.waterlooworks.error);

  const handleReportIssue = () => {
    window.open("https://github.com/lacser/Goose-Glance/issues", "_blank");
  };

  return (
    <div className="w-full min-h-80 flex items-center p-6 rounded-lg">
      {/* Left side - Analysis Error image */}
      <div className="flex-shrink-0">
        <img
          src="/content/AnalysisErrorImage.webp"
          alt="Analysis Error"
          className="rounded-lg size-72"
        />
      </div>

      {/* Right side - Description and controls */}
      <div className="flex-1 ml-8 flex flex-col justify-center max-w-md">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Analysis Failed
        </h2>

        <p className="text-black mb-4 leading-relaxed">
          An error occurred while analyzing the job posting. This could be due to network issues, API limitations, or other technical problems.
        </p>

        {error && (
          <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded border">
            Error: {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {/* Retry Analysis Button */}
          <div className="flex items-center gap-3">
            <Button
              appearance="primary"
              onClick={handleAnalyze}
              icon={<ArrowClockwiseRegular />}
              disabled={isLoading}
              className="flex-1"
            >
              Retry Analysis
            </Button>
          </div>

          {/* Report Issue Button */}
          <div className="flex items-center gap-3">
            <Button
              appearance="secondary"
              onClick={handleReportIssue}
              icon={<BugRegular />}
              className="flex-1"
            >
              Report Issue on GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}