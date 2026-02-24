import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import MAIN_HOME_ROUTES from "./components/MAIN_HOME_ROUTES/MAIN_HOME_ROUTES.tsx";
import Services from "./components/BasicComponents/Services/Services.tsx";
import Registration from "./components/Authentication/Auth_Page/Registration.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MAIN_HOME_ROUTES />} />
          <Route path="/services" element={<Services />} />
          <Route path="/registration" element={<Registration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
