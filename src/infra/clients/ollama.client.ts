import { GenerateResponse, Ollama } from "ollama";
import { generatePrompt } from "../../common/utils/generate-prompts.js";
import {
  AgentType,
  PlaceholdersAgentEntrada,
} from "../../common/interfaces/agent.interface.js";
import { OllamaClientError } from "../../common/errors/ollama.error.js";

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

  async sendMessage(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    type: AgentType,
  ): Promise<GenerateResponse> {
    try {
      const prompt = generatePrompt(type, placeholdersEntrada);
      return await this.ollama.generate({
        model: String(process.env.OLLAMA_MODEL),
        prompt: prompt,
        format: "json",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new OllamaClientError(
        "Failed to send message to Ollama Client with a model " +
          process.env.OLLAMA_MODEL +
          ". " +
          errorMessage,
      );
    }
  }
}

export { OllamaClient };
