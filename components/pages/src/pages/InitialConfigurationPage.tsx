import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  Dropdown,
  Field,
  Input,
  Label,
  Option,
  ProgressBar,
  Radio,
  RadioGroup,
  Textarea,
  tokens,
} from "@fluentui/react-components";
import SymbolsProvider from "../symbols";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useModelTesting } from "../hooks/useModelTesting";

type CloudProvider = "OpenAI" | "Gemini" | "OpenRouter";
type Mode = "cloud" | "local";

// Default local model (lightweight), consistent with WebLlmTestPage
const LOCAL_MODEL_ID = "Qwen3-4B-q4f16_1-MLC";

const InitialConfigurationPage: React.FC = () => {
  const navigate = useNavigate();

  // page title and subtitle (localized)
  const { t } = useTranslation();
  const title = t("initialConfiguration.title");
  const subtitle = t("initialConfiguration.subtitle");

  // Provider selection: cloud or local
  const [mode, setMode] = useState<Mode>("cloud");

  // Cloud config
  const [cloudProvider, setCloudProvider] =
    useState<CloudProvider>("OpenRouter");
  const [apiKey, setApiKey] = useState("");
  // Testing logic via shared hook
  const {
    cloudTestStatus,
    cloudTestMessage,
    testCloudApi,
    resetCloudTest,
    webGpuSupported,
    webGpuError,
    isLoadingLocal,
    isLocalEngineReady,
    localProgress,
    localProgressText,
    localTestStatus,
    localTestMessage,
    poem,
    isGeneratingPoem,
    testLocalByPoem,
    resetLocalTest,
  } = useModelTesting({ localModelId: LOCAL_MODEL_ID });

  // Popup-like settings: AI summary language + Auto Analysis
  const [language, setLanguage] = useState("English");
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [syncMessage, setSyncMessage] = useState("");

  // Reset opposite side status when switching mode
  useEffect(() => {
    if (mode === "cloud") {
      resetLocalTest();
    } else {
      resetCloudTest();
    }
  }, [mode, resetCloudTest, resetLocalTest]);

  // Sync language & autoAnalysis from chrome.storage like popup
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.sync) {
          chrome.storage.sync.get(["language", "autoAnalysis"], (result) => {
            let synced = false;
            if (typeof result.language === "string") {
              setLanguage(result.language);
              synced = true;
            }
            if (typeof result.autoAnalysis !== "undefined") {
              setAutoAnalysis(!!result.autoAnalysis);
              synced = true;
            }
            if (synced) {
              setSyncMessage(t("initialConfiguration.settings.syncedMessage"));
              setTimeout(() => setSyncMessage(""), 2500);
            }
          });
        } else {
          // Dev preview fallback
          const lang = localStorage.getItem("language");
          const auto = localStorage.getItem("autoAnalysis");
          let synced = false;
          if (lang) {
            setLanguage(lang);
            synced = true;
          }
          if (auto !== null) {
            setAutoAnalysis(auto === "true");
            synced = true;
          }
          if (synced) {
            setSyncMessage(t("initialConfiguration.settings.syncedMessage"));
            setTimeout(() => setSyncMessage(""), 2500);
          }
        }
      } catch {
        // ignore
      }
    };
    syncFromStorage();
  }, [t]);

  const handleCloudTest = async () => {
    await testCloudApi(cloudProvider, apiKey);
  };

  // Save settings and navigate to the next page
  const testPassed =
    mode === "cloud"
      ? cloudTestStatus === "success"
      : localTestStatus === "success";

  const saveSettingsAndProceed = async () => {
    try {
      // Merge existing apiKeys
      const persist = async () => {
        if (typeof chrome !== "undefined" && chrome.storage?.sync) {
          await new Promise<void>((resolve) => {
            chrome.storage.sync.get(["apiKeys", "aiProvider"], (current) => {
              const prev = (current?.apiKeys as Record<string, string>) || {};
              const apiKeys =
                mode === "cloud"
                  ? {
                      ...prev,
                      [cloudProvider]: apiKey.trim(),
                    }
                  : prev;
              const aiProvider = mode === "cloud" ? cloudProvider : "Local";
              chrome.storage.sync.set(
                {
                  apiKeys,
                  aiProvider,
                  // Also persist language & autoAnalysis like popup
                  language,
                  autoAnalysis,
                },
                () => resolve()
              );
            });
          });
        } else {
          // Fallback to localStorage (dev preview only)
          const prevStr = localStorage.getItem("apiKeys");
          const prev = prevStr ? JSON.parse(prevStr) : {};
          if (mode === "cloud") {
            prev[cloudProvider] = apiKey.trim();
          }
          localStorage.setItem("apiKeys", JSON.stringify(prev));
          localStorage.setItem(
            "aiProvider",
            mode === "cloud" ? cloudProvider : "Local"
          );
          localStorage.setItem("language", language);
          localStorage.setItem("autoAnalysis", String(autoAnalysis));
        }
      };

      await persist();
    } catch {
      // Ignore storage errors
    }
    navigate("/welcome");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-y-auto">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-brand-100/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center gap-2">
                <span>{title}</span>
                <SymbolsProvider
                  classname="text-brand-600"
                  iconSize="2.25rem"
                  fill={1}
                >
                  tune
                </SymbolsProvider>
              </h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                {subtitle}
              </p>
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
              <div className="mt-8 flex items-center justify-start">
                <button
                  type="button"
                  onClick={saveSettingsAndProceed}
                  disabled={!testPassed}
                  className={
                    "spotlight-card spotlight-white block w-full lg:w-3/4 rounded-xl p-5 bg-gradient-to-r from-brand-600 to-brand-700 text-white ring-1 ring-brand-700/40 shadow-sm transition-all duration-300 ease-out " +
                    "relative overflow-visible z-0 after:content-[''] after:absolute after:-inset-1 after:rounded-xl after:bg-gradient-to-r after:from-brand-400/25 after:to-brand-600/25 after:blur-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:ease-out after:pointer-events-none after:-z-10 " +
                    "before:content-[''] before:absolute before:inset-0 before:rounded-xl before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300 before:ease-out before:pointer-events-none " +
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  }
                >
                  <div className="relative z-10 flex items-center gap-3 justify-between w-full">
                    <span className="text-base font-medium">
                      {t("initialConfiguration.next")}
                    </span>
                    <SymbolsProvider classname="ml-4" color="white" fill={1}>
                      arrow_forward
                    </SymbolsProvider>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="aspect-[1/1] rounded-xl overflow-hidden shadow ring-1 ring-gray-200 bg-white max-h-80">
                <img
                  src="./InitialSetupImage.webp"
                  alt={t("initialConfiguration.alt.imageAlt")}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="sr-only">
                {t("initialConfiguration.alt.squareImage")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out">
            {/* Choose model source */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-base font-medium">
                {t("initialConfiguration.chooseProvider")}
              </div>
              <RadioGroup
                layout="horizontal"
                value={mode}
                onChange={(_, d) => setMode(d.value as Mode)}
              >
                <Radio
                  value="cloud"
                  label={t("initialConfiguration.mode.cloud")}
                />
                <Radio
                  value="local"
                  label={t("initialConfiguration.mode.local")}
                />
              </RadioGroup>
            </div>

            {/* Cloud configuration */}
            {mode === "cloud" && (
              <>
                <div className="mt-2 text-sm text-gray-600">
                  <Trans
                    i18nKey="initialConfiguration.cloud.description"
                    components={{ br: <br /> }}
                  />
                </div>
                <div className="mt-2 grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t("initialConfiguration.cloud.providerLabel")}
                    >
                      <Dropdown
                        selectedOptions={[cloudProvider]}
                        onOptionSelect={(_, data) =>
                          setCloudProvider(data.optionValue as CloudProvider)
                        }
                        value={cloudProvider}
                        placeholder={t(
                          "initialConfiguration.cloud.providerPlaceholder"
                        )}
                      >
                        <Option text="OpenAI" value="OpenAI">
                          OpenAI
                        </Option>
                        <Option text="Gemini" value="Gemini">
                          Gemini
                        </Option>
                        <Option text="OpenRouter" value="OpenRouter">
                          OpenRouter
                        </Option>
                      </Dropdown>
                    </Field>
                    <Field label={t("initialConfiguration.cloud.apiKeyLabel")}>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          resetCloudTest();
                        }}
                        placeholder={t(
                          "initialConfiguration.cloud.apiKeyPlaceholder"
                        )}
                      />
                    </Field>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      appearance="primary"
                      onClick={handleCloudTest}
                      disabled={cloudTestStatus === "testing" || !apiKey.trim()}
                    >
                      {cloudTestStatus === "testing"
                        ? t("initialConfiguration.cloud.testing")
                        : t("initialConfiguration.cloud.testConnection")}
                    </Button>

                    {cloudTestStatus !== "idle" && (
                      <Label
                        style={{
                          color:
                            cloudTestStatus === "success"
                              ? tokens.colorPaletteGreenForeground1
                              : cloudTestStatus === "error"
                              ? tokens.colorPaletteRedForeground1
                              : tokens.colorNeutralForeground2,
                        }}
                      >
                        {cloudTestMessage ||
                          (cloudTestStatus === "success"
                            ? t("initialConfiguration.testPassed")
                            : cloudTestStatus === "error"
                            ? t("initialConfiguration.testFailed")
                            : "")}
                      </Label>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Local configuration */}
            {mode === "local" && (
              <div className="mt-4 grid gap-5">
                {!webGpuSupported && (
                  <div className="text-sm text-red-600">{webGpuError}</div>
                )}

                <div className="grid gap-3">
                  <div className="text-sm text-gray-600">
                    <Trans
                      i18nKey="initialConfiguration.local.description"
                      values={{ model: LOCAL_MODEL_ID }}
                      components={{ br: <br /> }}
                    />
                  </div>
                  {!isLocalEngineReady && (
                    <div className="flex items-center gap-3">
                      <ProgressBar value={localProgress} color="brand" />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {Math.round(localProgress * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {localProgressText}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      appearance="primary"
                      onClick={testLocalByPoem}
                      disabled={
                        !webGpuSupported || isLoadingLocal || isGeneratingPoem
                      }
                    >
                      {isGeneratingPoem
                        ? t("initialConfiguration.local.generating")
                        : isLocalEngineReady
                        ? t("initialConfiguration.local.testLocalModel")
                        : t("initialConfiguration.local.loadAndTest")}
                    </Button>

                    {localTestStatus !== "idle" && (
                      <Label
                        style={{
                          color:
                            localTestStatus === "success"
                              ? tokens.colorPaletteGreenForeground1
                              : localTestStatus === "error"
                              ? tokens.colorPaletteRedForeground1
                              : tokens.colorNeutralForeground2,
                        }}
                      >
                        {localTestMessage ||
                          (localTestStatus === "success"
                            ? t("initialConfiguration.testPassed")
                            : localTestStatus === "error"
                            ? t("initialConfiguration.testFailed")
                            : "")}
                      </Label>
                    )}
                  </div>

                  {poem && (
                    <Field
                      label={t("initialConfiguration.local.generatedPoemLabel")}
                    >
                      <Textarea value={poem} readOnly rows={4} />
                    </Field>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Language and auto analysis settings (global) */}
          <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out mt-6">
            <div className="grid gap-5">
              {syncMessage && (
                <div className="text-sm text-brand-700">{syncMessage}</div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("initialConfiguration.settings.languageLabel")}>
                  <Dropdown
                    selectedOptions={[language]}
                    value={language}
                    onOptionSelect={(_, d) =>
                      d.optionValue && setLanguage(d.optionValue)
                    }
                  >
                    <Option value="English" text="English">
                      {t("languages.English")}
                    </Option>
                    <Option value="French" text="French">
                      {t("languages.French")}
                    </Option>
                    <Option
                      value="Chinese (Simplified)"
                      text="Chinese (Simplified)"
                    >
                      {t("languages.ChineseSimplified")}
                    </Option>
                    <Option
                      value="Chinese (Traditional)"
                      text="Chinese (Traditional)"
                    >
                      {t("languages.ChineseTraditional")}
                    </Option>
                  </Dropdown>
                </Field>
                <Field
                  label={t("initialConfiguration.settings.autoAnalysisLabel")}
                >
                  <div className="flex items-center h-9">
                    <input
                      type="checkbox"
                      className="accent-brand-600 w-5 h-5 cursor-pointer"
                      checked={autoAnalysis}
                      onChange={(e) => setAutoAnalysis(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {t("initialConfiguration.settings.autoAnalysisDesc")}
                    </span>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InitialConfigurationPage;
