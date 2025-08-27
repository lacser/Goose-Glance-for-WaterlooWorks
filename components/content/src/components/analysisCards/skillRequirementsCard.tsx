import { useState, useMemo } from "react";
import { useJobSummary } from "../../hooks/useJobData";
import { Tooltip } from "@fluentui/react-components";
import Symbols from "../symbols";
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

  const { summary } = useJobSummary();
  const technicalSkills = summary?.technical_skills ?? [];
  const softSkills = summary?.soft_skills ?? [];

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
    "tailwind css": "tailwindcss",
    bootstrap: "bootstrap",
    "material-ui": "materialui",
    mui: "materialui",
    "ant design": "antdesign",
    antd: "antdesign",
  };

  const findIconForSkill = (skillName: string): string | undefined => {
    const normalizedSkill = skillName.toLowerCase().trim();
    
    // Step 1: Try special mappings with original normalized skill
    if (specialMappings[normalizedSkill]) {
      return specialMappings[normalizedSkill];
    }
    
    // Step 2: Process keywords and try special mappings again
    let processedSkill = normalizedSkill;
    
    // Handle suffix keywords like ".js", ".ts", etc.
    const suffixMatch = processedSkill.match(/^(.*?)[\s.-]+(js|ts|jsx|tsx)$/);
    if (suffixMatch) {
      processedSkill = `${suffixMatch[1]}${suffixMatch[2]}`;
    }
    
    // Handle "adobe" prefix removal
    if (/^adobe[-_\s.]*/.test(processedSkill)) {
      processedSkill = processedSkill.replace(/^adobe[-_\s.]*/, "").trim();
    }
    
    // Try special mappings with processed skill
    if (specialMappings[processedSkill]) {
      return specialMappings[processedSkill];
    }
    
    // Step 3: Try direct matching with techIconNames
    const directMatch = techIconNames.find(
      (icon) => icon.toLowerCase().replace(".svg", "") === processedSkill
    );
    if (directMatch) {
      return directMatch.replace(".svg", "");
    }
    
    // If all else fails, try direct matching with original normalized skill
    const originalDirectMatch = techIconNames.find(
      (icon) => icon.toLowerCase().replace(".svg", "") === normalizedSkill
    );
    if (originalDirectMatch) {
      return originalDirectMatch.replace(".svg", "");
    }
    
    return undefined;
  };

  // Process technical skills and match icons
  const processedTechnicalSkills = useMemo((): TechSkillWithIcon[] => {
    const result: TechSkillWithIcon[] = [];

    technicalSkills.forEach((skill: string) => {
      // Process skills with slashes (e.g., "C/C++")
      const skillParts = skill.split("/").map((part) => part.trim());

      skillParts.forEach((skillPart) => {
        const iconName = findIconForSkill(skillPart);

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
                <Tooltip
                  content={skill.name}
                  relationship="label"
                >
                  <div
                    key={`icon-${index}`}
                    className="flex flex-col items-center justify-center w-[40px] h-[40px] border-gray-200 border bg-white rounded-md hover:bg-gray-100 transition-colors shadow-[0px_1px_5px_1px_#D6D6D6]"
                  >
                    <img
                      src={skill.iconPath}
                      alt={skill.name}
                      className="w-8 h-8 rounded-md"
                    />
                  </div>
                </Tooltip>
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
