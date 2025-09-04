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
      prevSettings.geminiApiKey !== settings.geminiApiKey ||
      prevSettings.openRouterApiKey !== settings.openRouterApiKey ||
      prevSettings.aiProvider !== settings.aiProvider ||
      prevSettings.autoAnalysis !== settings.autoAnalysis ||
      prevSettings.language !== settings.language ||
      prevSettings.devMode !== settings.devMode ||
      prevSettings.collapsed !== settings.collapsed;

    if (hasChanged) {
      // Update chrome.storage only when values truly changed
      const apiKeys = {
        OpenAI: settings.openaiApiKey,
        Gemini: settings.geminiApiKey,
        OpenRouter: settings.openRouterApiKey,
        Local: "", // Local doesn't need API key
      };

      chrome.storage.sync.set({
        apiKeys,
        aiProvider: settings.aiProvider,
        autoAnalysis: settings.autoAnalysis,
        language: settings.language,
        devMode: settings.devMode,
        collapsed: settings.collapsed,
        openaiApiKey: settings.openaiApiKey,
      });

      // Update the previous settings reference
      prevSettingsRef.current = { ...settings };
    }
  }, [settings]);
};
