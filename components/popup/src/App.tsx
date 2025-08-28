import { useState } from "react";
import {
  Button,
  Combobox,
  Option,
  Spinner,
  Switch,
  Input,
  Text,
  MessageBar,
  MessageBarTitle,
  MessageBarBody,
} from "@fluentui/react-components";
import { usePopupLogic } from "./utils/popupLogic";

function App() {
  const {
    apiKey,
    setApiKey,
    aiProvider,
    setAiProvider,
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
    testApiKey,
  } = usePopupLogic();

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-[300px] p-5 min-h-[300px]">
      <header className="flex items-center gap-2">
        <Text size={500} weight="semibold" font="base">
          Goose Glance
        </Text>
        <img
          src="/icons/icon128.png"
          width={30}
          height={30}
          alt="Goose Glance Logo"
        />
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Text font="base">AI Provider</Text>
          <Combobox
            value={aiProvider}
            onOptionSelect={(_, data) =>
              data.optionValue && setAiProvider(data.optionValue as 'OpenAI' | 'Gemini' | 'OpenRouter' | 'Local')
            }
          >
            <Option value="OpenAI">OpenAI</Option>
            <Option value="Gemini">Gemini</Option>
            <Option value="OpenRouter">OpenRouter</Option>
            <Option value="Local">Local</Option>
          </Combobox>
          {aiProvider !== 'Local' && (
            <>
              <Text font="base">{aiProvider} API Key</Text>
              <Input
                type="password"
                value={apiKey}
                onChange={setApiKey}
                placeholder={`Enter your ${aiProvider} API key`}
              />
            </>
          )}
          {aiProvider !== 'Local' && (testStatus === "idle" || testStatus === "testing") && (
            <Button onClick={testApiKey} disabled={testStatus === "testing"}>
              <div className="flex items-center gap-2">
                {testStatus === "testing" && <Spinner size="tiny" />}
                <span>Test API Connection</span>
              </div>
            </Button>
          )}
          {(testMessage || providerSwitchMessage) && (
            <MessageBar 
              intent={
                providerSwitchMessage 
                  ? "info" 
                  : (testStatus === "error" ? "error" : "success")
              }
            >
              <MessageBarBody>
                <MessageBarTitle>
                  {providerSwitchMessage || testMessage}
                </MessageBarTitle>
              </MessageBarBody>
            </MessageBar>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Text font="base">Language</Text>
          <Combobox
            value={language}
            onOptionSelect={(_, data) =>
              data.optionValue && setLanguage(data.optionValue)
            }
          >
            <Option value="English">English</Option>
            <Option value="French">French</Option>
            <Option value="Chinese (Simplified)">Chinese (Simplified)</Option>
            <Option value="Chinese (Traditional)">Chinese (Traditional)</Option>
          </Combobox>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Text font="base">Auto Analysis</Text>
              <Switch
                checked={autoAnalysis}
                onChange={(e) => setAutoAnalysis(e.target.checked)}
              />
            </div>
          </div>
          {isAdvancedSettingsOpen && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Text font="base">DEV Mode</Text>
                <Switch
                  checked={devMode}
                  onChange={(e) => setDevMode(e.target.checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center gap-2">
        <Button
          appearance="secondary"
          onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
        >
          Advanced Settings
        </Button>
        <Button
          appearance="primary"
          onClick={saveSettings}
          disabled={saveStatus === "saved"}
        >
          {saveStatus === "saved" ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default App;
