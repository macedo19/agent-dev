import "dotenv/config";
import express from "express";
import { createAgentRouter } from "./routes/agents.router.js";
import { RedisClient } from "./infra/clients/redis.client.js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

const redisClient = new RedisClient();

async function bootstrap() {
  await redisClient.connect();
  app.use("/api/v1", createAgentRouter(redisClient));
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

bootstrap();
