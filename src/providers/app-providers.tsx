"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { ReactQueryProvider } from "@/providers/react-query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="woofdesk"
      enableSystem={false}
    >
      <ReactQueryProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
