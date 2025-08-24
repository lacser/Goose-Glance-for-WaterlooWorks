import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { SettingsState } from "../store/slices/settingsSlice";

export const useSettingsSync = () => {
  const settings = useAppSelector((state) => state.settings);
  const prevSettingsRef = useRef<SettingsState | null>(null);

  useEffect(() => {
    // Check if this is the initial load or the values actually changed
    const prevSettings = prevSettingsRef.current;
    
    if (prevSettings === null) {
      // Initial load: don't update chrome.storage, just record current values
      prevSettingsRef.current = { ...settings };
      return;
    }

    // Check whether each field actually changed
    const hasChanged = 
      prevSettings.openaiApiKey !== settings.openaiApiKey ||
      prevSettings.autoAnalysis !== settings.autoAnalysis ||
      prevSettings.language !== settings.language ||
      prevSettings.devMode !== settings.devMode;

    if (hasChanged) {
      // Update chrome.storage only when values truly changed
      chrome.storage.sync.set({
        openaiApiKey: settings.openaiApiKey,
        autoAnalysis: settings.autoAnalysis,
        language: settings.language,
        devMode: settings.devMode,
      });

      // Update the previous settings reference
      prevSettingsRef.current = { ...settings };
    }
  }, [settings]);
};
