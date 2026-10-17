import { env } from "./config/env";
import app from "./app";
import prisma from "./config/prisma";

const startServer = async () => {
  await prisma.$connect();
  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received. Closing server.`);
    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await prisma.$disconnect();
    } catch (error) {
      console.error("Server shutdown failed.", error);
      process.exitCode = 1;
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
};

void startServer().catch(async (error: unknown) => {
  console.error("Server startup failed.", error);
  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error("Database cleanup after startup failure failed.", disconnectError);
  }
  process.exitCode = 1;
});
