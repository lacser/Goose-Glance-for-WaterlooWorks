import { useContextService } from "./hooks/useContextService";
import { useIndexedDB } from "./hooks/useIndexedDB";
import { useSettingsSync } from "./hooks/useSettingsSync";
import { useScrollForwarding } from "./hooks/useScrollForwarding";
import { useAppSelector } from "./store/hooks";
import { useJobSummary } from "./hooks/useJobData";
import { DevContent } from "./components/devContent";
import {
  RoleSummaryCard,
  IdentityRequirementsCard,
  WorkDurationCard,
  SkillRequirementsCard,
  WorkLocationCard,
  CompanyInfoCard,
  GooseGlanceBanner,
  ErrorPage,
  NoAnalysisPage,
  AnalyzingPage,
} from "./components";

function App() {
  useContextService();
  useIndexedDB();
  useSettingsSync();
  useScrollForwarding();
  const devMode = useAppSelector((state) => state.settings.devMode);
  const onJobId = useAppSelector((state) => state.waterlooworks.onJobId);
  const isLoading = useAppSelector((state) => state.waterlooworks.isLoading);
  const { summary } = useJobSummary();

  if (devMode) {
    return <DevContent />;
  }
  if (!onJobId) {
    return (
      <>
        <GooseGlanceBanner />
        <ErrorPage />
      </>
    );
  }
  if (!summary) {
    if (isLoading) {
      return (
        <>
          <GooseGlanceBanner />
          <AnalyzingPage />
        </>
      );
    } else {
      return (
        <>
          <GooseGlanceBanner />
          <NoAnalysisPage />
        </>
      );
    }
  }

  return (
    <>
      <GooseGlanceBanner />
      <div className="columns-[300px] gap-2 p-2">
        <div className="break-inside-avoid mb-2">
          <RoleSummaryCard />
        </div>
        <div className="break-inside-avoid mb-2">
          <IdentityRequirementsCard />
        </div>
        <div className="break-inside-avoid mb-2">
          <WorkLocationCard />
        </div>
        <div className="break-inside-avoid mb-2">
          <WorkDurationCard />
        </div>
        <div className="break-inside-avoid mb-2">
          <SkillRequirementsCard />
        </div>
        <div className="break-inside-avoid mb-2">
          <CompanyInfoCard />
        </div>
      </div>
    </>
  );
}

export default App;
