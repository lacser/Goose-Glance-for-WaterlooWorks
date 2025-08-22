import { useContextService } from "./utils/useContextService";
import { useIndexedDB } from "./utils/useIndexedDB";
import { useAppSelector } from "./store/hooks";
import { DevContent } from "./components/devContent";
import {
  RoleSummaryCard,
  IdentityRequirementsCard,
  WorkDurationCard,
  SkillRequirementsCard,
  WorkLocationCard,
} from "./components";

function App() {
  useContextService();
  useIndexedDB();
  const devMode = useAppSelector((state) => state.settings.devMode);

  if (devMode) {
    return <DevContent />;
  }
  return (
    <>
      <div className="flex gap-2 p-2 flex-wrap">
        <RoleSummaryCard />
        <IdentityRequirementsCard />
        <WorkDurationCard />
        <SkillRequirementsCard />
        <WorkLocationCard />
      </div>
    </>
  );
}

export default App;
