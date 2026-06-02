import { AppError } from "./app.error.js";

class RedisError extends AppError {
  constructor(message: string) {
    super(message, 503);
  }
}

export { RedisError };
