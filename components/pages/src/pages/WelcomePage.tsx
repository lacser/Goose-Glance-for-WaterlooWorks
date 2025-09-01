import React from 'react';
import { useTranslation } from 'react-i18next';
import SymbolsProvider from '../symbols';
import LanguageSwitcher from '../components/LanguageSwitcher';

const WelcomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-y-auto">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-brand-100/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center">
                <span>{t('welcome.title')}</span>
                <img src="./icon128.png" alt={t('alt.icon')} className="ml-1 h-10 w-10 sm:h-12 sm:w-12 rounded" />
              </h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                {t('welcome.subtitle')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-white shadow-sm ring-1 ring-gray-200">
                  <SymbolsProvider classname="text-brand-600" iconSize="16px" fill={1}>
                    verified
                  </SymbolsProvider>
                  {t('welcome.features.openSource')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-white shadow-sm ring-1 ring-gray-200">
                  <SymbolsProvider classname="text-brand-600" iconSize="16px" fill={1}>
                    lock
                  </SymbolsProvider>
                  {t('welcome.features.localFirst')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-white shadow-sm ring-1 ring-gray-200">
                  <SymbolsProvider classname="text-brand-600" iconSize="16px" fill={1}>
                    auto_awesome
                  </SymbolsProvider>
                  {t('welcome.features.seamlessIntegration')}
                </span>
              </div>
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
            </div>
            <div>
              <div className="aspect-[3/2] rounded-xl overflow-hidden shadow ring-1 ring-gray-200 bg-white">
                <img src="./WelcomeImage.webp" alt={t('alt.heroImage')} className="h-full w-full object-cover" />
              </div>
              <p className="sr-only">{t('alt.imageRatio')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <h2 className="text-2xl font-semibold">{t('welcome.coreFeatures.title')}</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Open Source */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  verified
                </SymbolsProvider>
                <div className="font-medium">{t('welcome.coreFeatures.openSource.title')}</div>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {t('welcome.coreFeatures.openSource.description')}
                <a 
                  href="https://github.com/lacser/Goose-Glance" 
                  className="text-brand-700 hover:text-brand-800 font-medium"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {t('welcome.coreFeatures.openSource.githubLink')}
                </a>
              </p>
            </div>

            {/* WebLLM + Cloud */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  memory
                </SymbolsProvider>
                <div className="font-medium">{t('welcome.coreFeatures.aiModels.title')}</div>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {t('welcome.coreFeatures.aiModels.description')}
              </p>
            </div>

            {/* IndexedDB Cache */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  file_save
                </SymbolsProvider>
                <div className="font-medium">{t('welcome.coreFeatures.cache.title')}</div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {t('welcome.coreFeatures.cache.description')}
              </p>
            </div>

            {/* Seamless UX */}
            <div className="spotlight-card bg-white rounded-xl p-5 shadow-sm ring-1 ring-gray-200 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <SymbolsProvider classname="text-brand-600" fill={1}>
                  acute
                </SymbolsProvider>
                <div className="font-medium">{t('welcome.coreFeatures.ux.title')}</div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {t('welcome.coreFeatures.ux.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Callouts */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-4 gap-5">
            <div className="spotlight-card flex items-center bg-white rounded-xl p-5 ring-1 ring-gray-200 shadow-sm lg:col-span-3 transition-all duration-300 ease-out hover:shadow-md hover:ring-gray-200 hover:-translate-y-0.5">
              <div className="flex items-center w-full text-base sm:text-lg">
                <SymbolsProvider classname="text-gray-700" fill={1}>
                  info
                </SymbolsProvider>
                <p className="text-sm text-gray-700 ml-2 text-left">
                  {t('welcome.disclaimer')}
                </p>
              </div>
            </div>
            <a className="spotlight-card spotlight-white block w-full rounded-xl p-5 bg-gradient-to-r from-brand-600 to-brand-700 text-white ring-1 ring-brand-700/40 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-3 justify-between w-full">
                <span className="text-base font-medium">{t('welcome.getStarted')}</span>
                <SymbolsProvider classname="ml-4" color="white" fill={1}>
                  arrow_forward
                </SymbolsProvider>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
