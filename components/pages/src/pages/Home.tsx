import { Link } from "react-router-dom";
import SymbolsProvider from "../symbols";

function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 overflow-y-auto">
      <section className="bg-gradient-to-b from-white to-brand-100/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight flex items-center gap-2">
                <span>DEV Page</span>
                <SymbolsProvider
                  classname="text-brand-600"
                  iconSize="2.25rem"
                  fill={1}
                >
                  design_services
                </SymbolsProvider>
              </h1>
              <p className="mt-3 text-lg text-gray-600 leading-relaxed">
                Development Debug Entry Page
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/welcome"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-brand-600 text-white ring-1 ring-brand-700/40 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5"
                >
                  Welcome Page /welcome
                </Link>
                <Link
                  to="/webllm-test"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-white text-gray-900 ring-1 ring-gray-200 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5"
                >
                  WebLLM Test /webllm-test
                </Link>
              </div>
            </div>
            <div>
              <div className="aspect-[3/2] rounded-xl overflow-hidden shadow ring-1 ring-gray-200 bg-white">
                <img
                  src="./DevPageImage.webp"
                  alt="Dev Page Image"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="sr-only">3:2 image</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
