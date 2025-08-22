import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";
import countryNames from "./countryNames";

export interface WorkLocationCardProps {
  className?: string;
}

export default function WorkLocationCard({
  className = "",
}: WorkLocationCardProps) {
  const { workType, workingCountry, workingLocation } = useAppSelector(
    (state) => {
      const jobID = state.waterlooworks.onJobId;
      if (!jobID)
        return { workType: null, workingCountry: null, workingLocation: null };

      const jobData = state.waterlooworks.jobData[jobID];
      if (!jobData?.summary)
        return { workType: null, workingCountry: null, workingLocation: null };

      try {
        const summaryData = JSON.parse(jobData.summary);
        return {
          workType: summaryData.work_type || null,
          workingCountry: summaryData.working_country_iso3166_alpha2 || null,
          workingLocation: summaryData.working_location || null,
        };
      } catch (e) {
        console.error("Error parsing summary:", e);
        return { workType: null, workingCountry: null, workingLocation: null };
      }
    }
  );

  // Find country flag image path
  const countryFlagPath = useMemo(() => {
    if (!workingCountry) return null;

    // Convert to lowercase for matching
    const countryLower = workingCountry.toLowerCase();

    // Check if country exists in countryNames
    const matchedCountry = countryNames.find((country) =>
      country.toLowerCase().startsWith(countryLower)
    );

    return matchedCountry ? `/content/countryFlags/${matchedCountry}` : null;
  }, [workingCountry]);

  // If no data, don't render the component
  if (!workType && !workingCountry && !workingLocation) {
    return null;
  }

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      {/* Work Type Section */}
      {workType && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Symbols iconSize="24px">home_work</Symbols>
              <h2 className="text-base font-semibold">Work Type</h2>
            </div>
            <span className="text-base font-semibold">
              {workType
                .replace("_", " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>
        </div>
      )}

      {/* Work Location Section */}
      <div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col col-span-2 justify-between">
            <div className="flex items-center gap-2">
              <Symbols iconSize="24px">pin_drop</Symbols>
              <h2 className="text-base font-semibold">Work Location</h2>
            </div>
            {workingLocation && (
              <div className="text-base text-gray-800">{workingLocation}</div>
            )}
          </div>
          {workingCountry && countryFlagPath && (
            <div className="flex flex-col items-end justify-between">
              <img
                src={countryFlagPath}
                alt={workingCountry}
                className="w-8 h-6 object-cover rounded-sm mb-1"
              />
              <span className="text-base font-medium text-gray-800">
                {workingCountry}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
