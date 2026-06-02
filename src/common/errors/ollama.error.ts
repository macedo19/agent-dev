import { AppError } from "./app.error.js";

class OllamaClientError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}

export { OllamaClientError };
