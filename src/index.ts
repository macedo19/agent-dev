import "dotenv/config";
import express from "express";
import { createAgentRouter } from "./routes/agents.router.js";
import { RedisClient } from "./infra/clients/redis.client.js";
import { createHealthRouter } from "./routes/health.router.js";
import { errorHandlerMiddleware } from "./common/middlewares/error-handler.middleware.js";

const app = express();
const port = process.env.PORT ?? 3000;
const redisClient = new RedisClient();

async function bootstrap() {
  await redisClient.connect();
  app.use(express.json());
  app.use("/api/v1", createAgentRouter(redisClient));
  app.use("/health", createHealthRouter());
  app.use(errorHandlerMiddleware);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
