import { Route, Routes } from "react-router-dom";
import WebLlmTestPage from "./pages/WebLlmTestPage";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/webllm-test" element={<WebLlmTestPage />} />
    </Routes>
  );
}

export default App;
