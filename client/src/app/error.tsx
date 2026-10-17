"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portfolio page rendering failed.", error);
  }, [error]);

  return (
    <main className="error-page">
      <p className="mono-label">SOMETHING WENT WRONG</p>
      <h1>This page could not be loaded.</h1>
      <button className="button button--primary" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
