import { Switch } from "@fluentui/react-components";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setAutoAnalysis } from "../store/slices/settingsSlice";
import { useState, useEffect } from "react";

export default function AnalyzingPage() {
  const autoAnalysisEnabled = useAppSelector(
    (state) => state.settings.autoAnalysis
  );
  const dispatch = useAppDispatch();
  
  const interestingSentences = [
    "Shhh… negotiating with campus geese for API access.",
    "Combing WaterlooWorks like it’s match day—please rank us #1.", 
    "Paging the Tool Bearers… we might need a 60-inch pipe wrench to loosen this job post.",
    "Detouring through DC—quiet zone level: stealth mode.",
    "Beaming insights from the Quantum-Nano Centre—superpositioning “must-have” and “nice-to-have.”",
    "Deploying co-op senses: detecting “team player,” “fast learner,” and “you’ll wear many hats.”",
    "If a goose blocks the path, we simply refactor around it—agile, not hostile.",
    "Uploading clarity to your brain’s cache—no frosh week hype required.",
    "Training my neural networks on the tears of ECE 2A students...",
    "Calculating the probability that this job posting won't ghost you after the interview...",
    "Processing job requirements... Warning: 'Entry-level' position requires 10 years experience detected.",
    "Analyzing whether this company's 'competitive salary' actually covers your Mr. Noodles budget...",
    "Decoding employer-speak: 'Fast-paced environment' = 'We're constantly on fire, help us.'",
    "Running sentiment analysis on 'looking for rockstar developers'... Cringe level: Maximum.",
    "Processing another 'innovative fintech startup disrupting the blockchain AI space'...",
    "Calculating optimal coffee-to-code ratio for surviving this work term...",
    "My algorithms are learning... Unlike that one group project member we all know.",
    "Training on a dataset of startup buzzwords... 'Synergy' and 'paradigm shift' detected.",
    "Applying natural language processing to decode what 'unlimited PTO' really means...",
    "Channeling the aggressive energy of campus geese to parse through job requirements...",
    "Loading with the determination of a Waterloo student crossing the bridge to E7...",
    "Processing faster than a first-year running from a goose in Waterloo Park...",
    "Deploying AI agents to infiltrate the corporate matrix... Accessing mainframe... Just kidding, it's probably hosted on a single AWS instance.",
    "Initiating quantum job search protocols... Schrödinger's interview: simultaneously successful and rejected.",
    "Adding some pi to your job search. Don't worry, my estimate is completely irrational.",
    "Still faster than waiting for your offer to arrive in the mail.",
    "Analyzing job descriptions. Spoiler: they all require 5 years of experience and fluent Python.",
    "Searching for jobs. My internal sensors are detecting aggressive geese in your area.",
    "I'm sorry, I can't find that job. A Goose ate the server cable.",
    "Parsing qualifications. Did you know a Canada Goose can fly at 70 mph? Neither can I, apparently.",
    "Don't worry, your data is safe. The geese are too busy chasing frosh.",
    "Adjusting flux capacitor. We'll have this job summary ready in a jiffy."
  ];
  
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(Math.floor(Math.random() * interestingSentences.length));
  
  const handleAutoAnalysisToggle = () => {
    dispatch(setAutoAnalysis(!autoAnalysisEnabled));
  };

  // Loop through interesting sentences randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSentenceIndex(Math.floor(Math.random() * interestingSentences.length));
    }, 3000);

    return () => clearInterval(interval);
  }, [interestingSentences.length]);

  return (
    <div className="w-full h-80 flex items-center p-6 rounded-lg">
      {/* Left side - Analyzing image */}
      <div className="flex-shrink-0">
        <img
          src="/content/AnalyzingImage.webp"
          alt="Analyzing"
          className="rounded-lg size-72"
        />
      </div>

      {/* Right side - Description and controls */}
      <div className="flex-1 ml-8 flex flex-col justify-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Analyzing
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed min-h-[3rem] flex items-center">
          {interestingSentences[currentSentenceIndex]}
        </p>

        <div className="flex flex-col gap-4">
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
