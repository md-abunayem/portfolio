"use client";

import { useSyncExternalStore } from "react";
import { Contrast } from "lucide-react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isDark = resolvedTheme !== "light";

  return (
    <button
      aria-label={mounted ? (isDark ? "Light mode" : "Dark mode") : "Change color theme"}
      className="theme-toggle theme-toggle--icon-only"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      <Contrast aria-hidden="true" size={17} />
      <span>{mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}</span>
    </button>
  );
}
