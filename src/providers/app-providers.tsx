"use client";

import { NavigationProvider } from "@/components/layout/route-navigation";
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
        <NavigationProvider>{children}</NavigationProvider>
        <Toaster richColors closeButton position="top-right" />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
