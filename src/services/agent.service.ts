import { AgentTypeEnum } from "../common/enum/agent.enum.js";
import {
  AgentType,
  PlaceholdersAgentEntrada,
} from "../common/interfaces/agent.interface.js";
import { formatMessageToJson } from "../common/utils/format-messages.js";
import { OllamaClient } from "../infra/clients/ollama.client.js";
import { GenerateResponse } from "ollama/src/index.js";

class AgentService {
  constructor(private readonly ollamaClient: OllamaClient) {}

  async reviewCode(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.REVISAO as AgentType,
    );
    return formatMessageToJson(responseAgent.response);
  }

  async complianceCode(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.ADERENCIA as AgentType,
    );
    return formatMessageToJson(responseAgent.response);
  }

  async generateDocumentation(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.DOCUMENTACAO as AgentType,
    );
    return formatMessageToJson(responseAgent.response);
  }
}

export { AgentService };
