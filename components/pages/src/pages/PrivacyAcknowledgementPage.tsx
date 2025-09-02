import React from "react";
import { useTranslation } from "react-i18next";
import SymbolsProvider from "../symbols";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

const PrivacyAcknowledgementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-y-auto">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-brand-100/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center gap-2">
                <span>{t("privacy.title")}</span>
                <SymbolsProvider
                  classname="text-brand-600"
                  iconSize="2.25rem"
                  fill={1}
                >
                  privacy_tip
                </SymbolsProvider>
              </h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                {t("privacy.subtitle")}
              </p>
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
              <div className="mt-8">
                <Link
                  to="/initial-configuration"
                  className="spotlight-card spotlight-white block w-full lg:w-3/4 rounded-xl p-5 bg-gradient-to-r from-brand-600 to-brand-700 text-white ring-1 ring-brand-700/40 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 relative overflow-visible z-0 after:content-[''] after:absolute after:-inset-1 after:rounded-xl after:bg-gradient-to-r after:from-brand-400/25 after:to-brand-600/25 after:blur-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:ease-out after:pointer-events-none after:-z-10 before:content-[''] before:absolute before:inset-0 before:rounded-xl before:bg-white before:opacity-0 hover:before:opacity-10 before:transition-opacity before:duration-300 before:ease-out before:pointer-events-none"
                >
                  <div className="relative z-10 flex items-center gap-3 justify-between w-full">
                    <span className="text-base font-medium">
                      {t("privacy.actions.continueSetup")}
                    </span>
                    <SymbolsProvider classname="ml-4" color="white" fill={1}>
                      arrow_forward
                    </SymbolsProvider>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="aspect-[1/1] rounded-xl overflow-hidden shadow ring-1 ring-gray-200 bg-white max-h-80">
                <img
                  src="./PrivacyImage.webp"
                  alt={t("alt.privacyImage")}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="sr-only">{t("alt.imageRatioSquare")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {/* No data collection by app */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  lock
                </SymbolsProvider>
                <div className="font-medium">
                  {t("privacy.sections.noDataCollection.title")}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {t("privacy.sections.noDataCollection.desc")}
              </p>
            </div>

            {/* IndexedDB cache */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  file_save
                </SymbolsProvider>
                <div className="font-medium">
                  {t("privacy.sections.indexedDb.title")}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {t("privacy.sections.indexedDb.desc")}
              </p>
            </div>

            {/* Local model cache */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  memory
                </SymbolsProvider>
                <div className="font-medium">
                  {t("privacy.sections.localModelCache.title")}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {t("privacy.sections.localModelCache.desc")}
              </p>
            </div>

            {/* Open Source */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  verified
                </SymbolsProvider>
                <div className="font-medium">
                  {t("privacy.sections.openSource.title")}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {t("privacy.sections.openSource.desc")}{" "}
                <a
                  href="https://github.com/lacser/Goose-Glance"
                  className="text-brand-700 hover:text-brand-800 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("welcome.coreFeatures.openSource.githubLink")}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyAcknowledgementPage;
