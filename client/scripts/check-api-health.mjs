const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  "",
);
const healthUrl = `${apiBaseUrl}/api/health`;

try {
  const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    throw new Error(`Health endpoint returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (
    payload?.success !== true ||
    payload?.statusCode !== 200 ||
    payload?.data?.status !== "ok"
  ) {
    throw new Error("Health endpoint returned an unexpected response.");
  }

  console.log(`API health check passed: ${healthUrl}`);
} catch (error) {
  console.error(`API health check failed for ${healthUrl}.`, error);
  process.exitCode = 1;
}
