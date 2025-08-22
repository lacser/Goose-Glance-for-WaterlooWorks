import { useState, useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import Symbols from "./symbols";
import techIconNames from "./techIconNames";

export interface SkillRequirementsCardProps {
  className?: string;
}

interface TechSkillWithIcon {
  name: string;
  iconPath?: string;
}

export default function SkillRequirementsCard({
  className = "",
}: SkillRequirementsCardProps) {
  const [showSoftSkills, setShowSoftSkills] = useState(true);

  const { technicalSkills, softSkills } = useAppSelector((state) => {
    const jobID = state.waterlooworks.onJobId;
    if (!jobID) return { technicalSkills: [], softSkills: [] };

    const jobData = state.waterlooworks.jobData[jobID];
    if (!jobData?.summary) return { technicalSkills: [], softSkills: [] };

    try {
      const summaryData = JSON.parse(jobData.summary);
      return {
        technicalSkills: summaryData.technical_skills || [],
        softSkills: summaryData.soft_skills || [],
      };
    } catch (e) {
      console.error("Error parsing summary:", e);
      return { technicalSkills: [], softSkills: [] };
    }
  });

  // Special technology name mappings
  const specialMappings: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    "c++": "cplusplus",
    cpp: "cplusplus",
    "c#": "csharp",
    cs: "csharp",
    ".net": "dot-net",
    dotnet: "dotnetcore",
    aws: "amazonwebservices",
    gcp: "googlecloud",
    k8s: "kubernetes",
    vue: "vuejs",
    next: "nextjs",
    nuxt: "nuxtjs",
    node: "nodejs",
    express: "express",
    mongo: "mongodb",
    postgres: "postgresql",
    mysql: "mysql",
    redis: "redis",
    docker: "docker",
    git: "git",
    github: "github",
    gitlab: "gitlab",
    html: "html5",
    css: "css3",
    sass: "sass",
    scss: "sass",
    tailwind: "tailwindcss",
    bootstrap: "bootstrap",
    "material-ui": "materialui",
    mui: "materialui",
    "ant design": "antdesign",
    antd: "antdesign",
  };

  // Process technical skills and match icons
  const processedTechnicalSkills = useMemo((): TechSkillWithIcon[] => {
    const result: TechSkillWithIcon[] = [];

    technicalSkills.forEach((skill: string) => {
      // Process skills with slashes (e.g., "C/C++")
      const skillParts = skill.split("/").map((part) => part.trim());

      skillParts.forEach((skillPart) => {
        const normalizedSkill = skillPart.toLowerCase().trim();

        // Check for special mappings
        let iconName = specialMappings[normalizedSkill];

        // If no special mapping, try direct matching
        if (!iconName) {
          const matchedIcon = techIconNames.find(
            (icon) => icon.toLowerCase().replace(".svg", "") === normalizedSkill
          );
          if (matchedIcon) {
            iconName = matchedIcon.replace(".svg", "");
          }
        }

        result.push({
          name: skillPart,
          iconPath: iconName ? `/content/techIcons/${iconName}.svg` : undefined,
        });
      });
    });

    return result;
  }, [technicalSkills]);

  if (!technicalSkills.length && !softSkills.length) {
    return null;
  }

  return (
    <div
      className={`p-[0.8rem] w-[300px] h-fit ${className} rounded-md shadow-md border border-gray-200`}
    >
      {/* Technical Skills Section */}
      {technicalSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-start gap-3 mb-3">
            <Symbols iconSize="24px">code</Symbols>
            <h2 className="text-base font-semibold">Technical Skills</h2>
          </div>

          <div className="grid grid-cols-6 gap-[0.3rem] mb-2">
            {processedTechnicalSkills
              .filter((skill) => skill.iconPath)
              .map((skill, index) => (
                <div
                  key={`icon-${index}`}
                  className="flex flex-col items-center justify-center w-[40px] h-[40px] border-gray-200 border bg-white rounded-md hover:bg-gray-100 transition-colors shadow-[0px_1px_5px_1px_#D6D6D6]"
                  title={skill.name}
                >
                  <img
                    src={skill.iconPath}
                    alt={skill.name}
                    className="w-8 h-8 rounded-md"
                  />
                </div>
              ))}
          </div>

          {/* Text list for technical skills*/}
          <div className="flex flex-wrap gap-1">
            {processedTechnicalSkills
              .filter((skill) => !skill.iconPath)
              .map((skill, index) => (
                <span
                  key={`text-${index}`}
                  className="text-sm text-gray-800 bg-[#F5F5F5] px-2 py-1 rounded"
                >
                  {skill.name}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Soft Skills Section */}
      {softSkills.length > 0 && (
        <div>
          <div
            className={`flex items-center justify-between ${
              showSoftSkills ? "mb-3" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Symbols iconSize="24px">diversity_2</Symbols>
              <h3 className="text-base font-semibold">Soft Skills</h3>
            </div>
            <button
              onClick={() => setShowSoftSkills(!showSoftSkills)}
              className="flex items-center justify-center hover:bg-gray-100 rounded-full p-1"
              aria-label={
                showSoftSkills ? "Hide soft skills" : "Show soft skills"
              }
            >
              <Symbols iconSize="24px">
                {showSoftSkills ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              </Symbols>
            </button>
          </div>

          {showSoftSkills && (
            <div className="flex flex-wrap gap-1">
              {softSkills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="text-sm font-medium text-gray-800 bg-[#F5F5F5] px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
