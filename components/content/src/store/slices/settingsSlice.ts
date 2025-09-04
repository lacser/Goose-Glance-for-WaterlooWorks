import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  openaiApiKey: string;
  geminiApiKey: string;
  openRouterApiKey: string;
  aiProvider: 'OpenAI' | 'Gemini' | 'OpenRouter' | 'Local';
  autoAnalysis: boolean;
  language: string;
  devMode: boolean;
  collapsed: boolean;
}

const initialState: SettingsState = {
  openaiApiKey: '',
  geminiApiKey: '',
  openRouterApiKey: '',
  aiProvider: 'OpenAI',
  autoAnalysis: false,
  language: 'English',
  devMode: false,
  collapsed: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOpenAiApiKey: (state, action: PayloadAction<string>) => {
      state.openaiApiKey = action.payload;
    },
    setGeminiApiKey: (state, action: PayloadAction<string>) => {
      state.geminiApiKey = action.payload;
    },
    setOpenRouterApiKey: (state, action: PayloadAction<string>) => {
      state.openRouterApiKey = action.payload;
    },
    setAiProvider: (state, action: PayloadAction<'OpenAI' | 'Gemini' | 'OpenRouter' | 'Local'>) => {
      state.aiProvider = action.payload;
    },
    setAutoAnalysis: (state, action: PayloadAction<boolean>) => {
      state.autoAnalysis = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setDevMode: (state, action: PayloadAction<boolean>) => {
      state.devMode = action.payload;
    },
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
    }
  },
});

export const { 
  setOpenAiApiKey, 
  setGeminiApiKey, 
  setOpenRouterApiKey, 
  setAiProvider, 
  setAutoAnalysis, 
  setLanguage, 
  setDevMode,
  setCollapsed
} = settingsSlice.actions;
export default settingsSlice.reducer;
