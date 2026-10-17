"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryProvider>
        {children}
        <ThemeToaster />
      </QueryProvider>
    </NextThemeProvider>
  );
}

function ThemeToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster closeButton richColors theme={resolvedTheme === "light" ? "light" : "dark"} />;
}
