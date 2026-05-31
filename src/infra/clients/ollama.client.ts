import { GenerateResponse, Ollama } from "ollama";
import promptReview from "../../common/prompts/agent-review.prompt.js";

class OllamaClient {
  private ollama;

  constructor() {
    this.ollama = new Ollama({
      host:
        String(process.env.USE_OLLAMA_CLOUD) === "true"
          ? process.env.OLLAMA_HOST_CLOUD
          : process.env.OLLAMA_HOST_LOCAL,
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      },
    });
  }

  async sendMessage(message: string): Promise<GenerateResponse> {
    const prompt = promptReview.replace("%code", message);
    return await this.ollama.generate({
      model: String(process.env.OLLAMA_MODEL),
      prompt: prompt,
      format: "json",
    });
  }
}

export { OllamaClient };
