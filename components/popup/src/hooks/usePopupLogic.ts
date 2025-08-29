import { useEffect, useState } from 'react';
import { useApiKeyTest } from './useApiKeyTest';

type AiProvider = 'OpenAI' | 'Gemini' | 'OpenRouter' | 'Local';

interface ApiKeys {
  OpenAI: string;
  Gemini: string;
  OpenRouter: string;
  Local: string;
}

export function usePopupLogic() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    OpenAI: '',
    Gemini: '',
    OpenRouter: '',
    Local: ''
  });
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [aiProvider, setAiProvider] = useState<AiProvider>('OpenAI');
  const [devMode, setDevMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [providerSwitchMessage, setProviderSwitchMessage] = useState('');

  const { testStatus, testMessage, testApiKey, resetTest } = useApiKeyTest();
  
  // Handle AI Provider change with notification
  const handleAiProviderChange = (newProvider: AiProvider) => {
    setAiProvider(newProvider);
    resetTest();
    setProviderSwitchMessage(`API Key for ${newProvider} loaded`);
    setTimeout(() => {
      setProviderSwitchMessage('');
    }, 2000);
  };
  
  // Reset test status and message when API key changes
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKeys(prev => ({
      ...prev,
      [aiProvider]: newValue
    }));
    resetTest();
  };

  // Load saved settings on mount
  useEffect(() => {
    chrome.storage.sync.get(['apiKeys', 'autoAnalysis', 'language', 'devMode', 'aiProvider'], (result) => {
      if (result.apiKeys) {
        setApiKeys(result.apiKeys);
      }
      if (typeof result.autoAnalysis !== 'undefined') {
        setAutoAnalysis(result.autoAnalysis);
      }
      if (result.language) {
        setLanguage(result.language);
      }
      if (typeof result.devMode !== 'undefined') {
        setDevMode(result.devMode);
      }
      if (result.aiProvider) {
        setAiProvider(result.aiProvider);
      }
    });
  }, []);

  // Save the settings to chrome.storage
  const saveSettings = () => {
    chrome.storage.sync.set(
      {
        apiKeys,
        autoAnalysis,
        language,
        devMode,
        aiProvider,
      },
      () => {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 500);
      }
    );
  };

  // Create wrapper function that passes aiProvider to testApiKey
  const handleTestApiKey = () => {
    const currentApiKey = apiKeys[aiProvider];
    testApiKey(currentApiKey, aiProvider);
  };

  return {
    apiKey: apiKeys[aiProvider], // Return the current provider's API key
    setApiKey: handleApiKeyChange,
    aiProvider,
    setAiProvider: handleAiProviderChange,
    language,
    setLanguage,
    testStatus,
    testMessage,
    providerSwitchMessage,
    autoAnalysis,
    setAutoAnalysis,
    devMode,
    setDevMode,
    saveStatus,
    saveSettings,
    testApiKey: handleTestApiKey,
  };
}
