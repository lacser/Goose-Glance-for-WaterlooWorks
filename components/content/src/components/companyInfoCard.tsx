import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";
import { Button, Tooltip } from "@fluentui/react-components";
import { SparkleRegular, SearchRegular } from "@fluentui/react-icons";

export interface CompanyInfoCardProps {
  className?: string;
}

export default function CompanyInfoCard({
  className = "",
}: CompanyInfoCardProps) {
  const companyName = useAppSelector((state) => {
    const jobID = state.waterlooworks.onJobId;
    if (!jobID) return null;

    const jobData = state.waterlooworks.jobData[jobID];
    if (!jobData?.summary) return null;

    try {
      const summaryData = JSON.parse(jobData.summary);
      return summaryData.company_name || null;
    } catch (e) {
      console.error("Error parsing summary:", e);
      return null;
    }
  });

  // If no data, don't render the component
  if (!companyName) {
    return null;
  }

  const aiQuery = `Introduce the company ${companyName} to me. If I am making a job application to the company, what should I be aware of?`;

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Symbols iconSize="24px">domain</Symbols>
          <h2 className="text-base font-semibold">Company Name</h2>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Ask ChatGPT about the company" relationship="label">
            <Button icon={<SparkleRegular />} as="a" href={`https://chat.openai.com/?q=${aiQuery}`} target="_blank" />
          </Tooltip>
          <Tooltip content="Search the company on Google" relationship="label">
            <Button icon={<SearchRegular />} as="a" href={`https://www.google.com/search?q=${companyName}`} target="_blank" />
          </Tooltip>
        </div>
      </div>
      <div className="mt-2 text-base text-gray-800">{companyName}</div>
    </div>
  );
}
