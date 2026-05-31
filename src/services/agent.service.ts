import { formatMessageToJson } from "../common/utils/format-messages.js";
import { OllamaClient } from "../infra/clients/ollama.client.js";
import { GenerateResponse } from "ollama/src/index.js";

class AgentService {
  constructor(private readonly ollamaClient: OllamaClient) {}

  async reviewCode(prompt: string) {
    const responseAgent:  GenerateResponse=
      await this.ollamaClient.sendMessage(prompt);
    return formatMessageToJson(responseAgent.response);
  }
}

export { AgentService };
