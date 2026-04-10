import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter} from "react-router";
import AuthProvider from "./components/Authentication/AuthProvider/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RoutesAll from "./Routes/RoutesAll.tsx";  // here all the routes are defined and imported in main.tsx




const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
       <RoutesAll></RoutesAll> 
      </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
