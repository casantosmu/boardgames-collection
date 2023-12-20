import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./providers/theme.tsx";
import { AuthProvider } from "./providers/auth.tsx";
import { ToastProvider } from "./providers/toast.tsx";
import { Router } from "./router.tsx";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
