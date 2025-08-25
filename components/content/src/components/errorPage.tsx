export default function ErrorPage() {
  const handleRefresh = () => {
    window.parent.postMessage({ type: "refreshPage" }, "*");
  };

  const handleGithubRedirect = () => {
    window.open("https://github.com/lacser/Goose-Glance", "_blank");
  };

  return (
    <div className="w-full h-80 flex items-center p-6 rounded-lg">
      {/* Left side - Error image */}
      <div className="flex-shrink-0">
        <img
          src="/content/ErrorImage.webp"
          alt="Decorative Error Image"
          className="rounded-lg size-72"
        />
      </div>

      {/* Right side - Description and buttons */}
      <div className="flex-1 ml-8 flex flex-col justify-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Something went wrong
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Goose Glance seems to have failed to properly load Job Posting
          information from the page. This might be a temporary issue, you can
          refresh the page and try again. If this is a persistent problem,
          please report it on Github.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#0f6cbd] text-white rounded-md hover:opacity-90 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#fff"
            >
              <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
            </svg>
            Refresh Page
          </button>

          <button
            onClick={handleGithubRedirect}
            className="px-4 py-2 bg-[#242424] text-white rounded-md hover:opacity-90 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#fff"
            >
              <path d="M480-200q66 0 113-47t47-113v-160q0-66-47-113t-113-47q-66 0-113 47t-47 113v160q0 66 47 113t113 47Zm-80-120h160v-80H400v80Zm0-160h160v-80H400v80Zm80 40Zm0 320q-65 0-120.5-32T272-240H160v-80h84q-3-20-3.5-40t-.5-40h-80v-80h80q0-20 .5-40t3.5-40h-84v-80h112q14-23 31.5-43t40.5-35l-64-66 56-56 86 86q28-9 57-9t57 9l88-86 56 56-66 66q23 15 41.5 34.5T688-640h112v80h-84q3 20 3.5 40t.5 40h80v80h-80q0 20-.5 40t-3.5 40h84v80H688q-32 56-87.5 88T480-120Z" />
            </svg>
            Report on Github
          </button>
        </div>
      </div>
    </div>
  );
}
