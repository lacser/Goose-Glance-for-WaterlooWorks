import { useContextService } from "./utils/useContextService";
import { useIndexedDB } from "./utils/useIndexedDB";
import { useSettingsSync } from "./utils/useSettingsSync";
import { useAppSelector } from "./store/hooks";
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
} from "./components";

function App() {
  useContextService();
  useIndexedDB();
  useSettingsSync();
  const devMode = useAppSelector((state) => state.settings.devMode);
  const onJobId = useAppSelector((state) => state.waterlooworks.onJobId);

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
