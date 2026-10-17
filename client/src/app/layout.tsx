import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
const bodyFont = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Md. Abu Nayem — Full-Stack Developer",
    template: "%s | Md. Abu Nayem",
  },
  description:
    "Portfolio of Md. Abu Nayem, Computer Science graduate and full-stack developer.",
  openGraph: {
    title: "Md. Abu Nayem — Full-Stack Developer",
    description:
      "Portfolio of Md. Abu Nayem, Computer Science graduate and full-stack developer.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      className={cn(headingFont.variable, bodyFont.variable, monoFont.variable, "font-sans")}
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
