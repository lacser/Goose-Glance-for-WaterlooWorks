import { Button } from "@fluentui/react-components";
import { SettingsRegular } from "@fluentui/react-icons";

export default function NoConfigPage() {
  const handleConfigPageClick = () => {
    chrome.runtime.sendMessage(
      { action: 'openInitialConfigPage' }
    );
  };

  return (
    <div className="w-full h-80 flex items-center p-6 rounded-lg">
      {/* Left side - No Configuration image */}
      <div className="flex-shrink-0">
        <img
          src="/content/NoConfigurationImage.webp"
          alt="No Configuration"
          className="rounded-lg size-72"
        />
      </div>

      {/* Right side - Description and controls */}
      <div className="flex-1 ml-8 flex flex-col justify-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          AI Provider Not Configured
        </h2>

        <p className="text-black mb-4 leading-relaxed">
          You need to configure an AI provider before using the analysis feature. Please go to the initial setup page to complete the configuration.
        </p>

        <p className="text-black mb-4 leading-relaxed">
          Once configured, you can start analyzing job information.
        </p>

        <div className="flex flex-col gap-4">
          {/* Go to Welcome Page Button */}
          <div className="flex items-center gap-3">
            <Button
              appearance="primary"
              onClick={handleConfigPageClick}
              icon={<SettingsRegular />}
              className="flex-1"
            >
              Go to Setup Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}