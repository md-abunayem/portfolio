import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import achievementRoutes from "./routes/achievement.routes";
import authRoutes from "./routes/auth.routes";
import educationRoutes from "./routes/education.routes";
import experienceRoutes from "./routes/experience.routes";
import healthRoutes from "./routes/health.routes";
import messageRoutes from "./routes/message.routes";
import projectRoutes from "./routes/project.routes";
import publicRoutes from "./routes/public.routes";
import researchRoutes from "./routes/research.routes";
import skillRoutes from "./routes/skill.routes";
import certificationRoutes from "./routes/certification.routes";
import profileRoutes from "./routes/profile.routes";
import uploadRoutes from "./routes/upload.routes";
import { requireAdmin, requireSameOrigin } from "./middlewares/auth.middleware";
import { ApiError } from "./utils/ApiError";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CLIENT_ORIGINS.includes(origin)) {
        callback(null, origin ?? true);
        return;
      }
      callback(new ApiError(403, "Request origin is not allowed."));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

app.use("/api/health", healthRoutes);
app.use(
  "/api/v1/admin",
  requireSameOrigin,
  requireAdmin,
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", projectRoutes);
app.use("/api/v1", skillRoutes);
app.use("/api/v1", experienceRoutes);
app.use("/api/v1", educationRoutes);
app.use("/api/v1", achievementRoutes);
app.use("/api/v1", researchRoutes);
app.use("/api/v1", certificationRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1", messageRoutes);
app.use("/api/v1/public", publicRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
