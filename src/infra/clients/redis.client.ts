import { createClient } from "redis";

class RedisClient {
  private redis: ReturnType<typeof createClient>;

  public constructor() {
    this.redis = createClient({
      url: process.env.REDIS_HOST,
    //   password: process.env.REDIS_PASSWORD,
    });

    this.redis.on("error", (err) => console.error("Redis error:", err));
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
}

export { RedisClient };