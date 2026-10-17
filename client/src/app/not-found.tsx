import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <p className="mono-label">404 / NOT FOUND</p>
      <h1>This page isn&apos;t here.</h1>
      <Link className="button button--primary" href="/">
        Back to home
      </Link>
    </main>
  );
}
