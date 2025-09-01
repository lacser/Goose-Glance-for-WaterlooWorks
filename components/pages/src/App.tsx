import { Route, Routes } from "react-router-dom";
import WebLlmTestPage from "./pages/WebLlmTestPage";
import Home from "./pages/Home";
import WelcomePage from "./pages/WelcomePage";
import PrivacyAcknowledgementPage from "./pages/PrivacyAcknowledgementPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/webllm-test" element={<WebLlmTestPage />} />
      <Route path="/privacy" element={<PrivacyAcknowledgementPage />} />
    </Routes>
  );
}

export default App;
