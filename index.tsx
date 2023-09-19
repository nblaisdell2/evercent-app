import "./styles/index.css";
import { config } from "dotenv";
config();

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Auth0ProviderWithNavigate } from "./src/components/Auth0WithNavigate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // If a query fails, don't retry
      retry: false,
      retryOnMount: false,
      // data is never considered stale
      staleTime: Infinity,

      // suspense: true,

      // // refetch options (shouldn't apply since data is never stale)
      // refetchInterval: 60000, // number of ms to refetch next
      // refetchIntervalInBackground: true, // true if refetch in background, false otherwise
      // refetchOnWindowFocus: false,
      // refetchOnReconnect: false,

      // Default Query to run, can be overridden
      // queryFn: defaultQueryFn,
    },
  },
});

const root = createRoot(document.getElementById("root") as Element);
root.render(
  <QueryClientProvider client={queryClient}>
    <Auth0ProviderWithNavigate>
      <App />
    </Auth0ProviderWithNavigate>
  </QueryClientProvider>
);
