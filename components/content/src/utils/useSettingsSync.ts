import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { SettingsState } from "../store/slices/settingsSlice";

export const useSettingsSync = () => {
  const settings = useAppSelector((state) => state.settings);
  const prevSettingsRef = useRef<SettingsState | null>(null);

  useEffect(() => {
    // 检查是否是初次加载或者值真正发生了变化
    const prevSettings = prevSettingsRef.current;
    
    if (prevSettings === null) {
      // 初次加载，不更新 chrome.storage，只记录当前值
      prevSettingsRef.current = { ...settings };
      return;
    }

    // 检查每个字段是否真正发生了变化
    const hasChanged = 
      prevSettings.openaiApiKey !== settings.openaiApiKey ||
      prevSettings.autoAnalysis !== settings.autoAnalysis ||
      prevSettings.language !== settings.language ||
      prevSettings.devMode !== settings.devMode;

    if (hasChanged) {
      // 只有在值真正发生变化时才更新 chrome.storage
      chrome.storage.sync.set({
        openaiApiKey: settings.openaiApiKey,
        autoAnalysis: settings.autoAnalysis,
        language: settings.language,
        devMode: settings.devMode,
      });

      // 更新上一次的值
      prevSettingsRef.current = { ...settings };
    }
  }, [settings]);
};
