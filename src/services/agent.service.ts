import { AgentTypeEnum } from "../common/enum/agent.enum.js";
import {
  AgentType,
  PlaceholdersAgentEntrada,
} from "../common/interfaces/agent.interface.js";
import { formatMessageToJson } from "../common/utils/format-messages.js";
import { OllamaClient } from "../infra/clients/ollama.client.js";
import { GenerateResponse } from "ollama/src/index.js";
import { IExecutionAgent } from "../repositories/contracts/execution_agent.interface.js";
import { ExecutionAgent } from "../models/execution_agent.model.js";

class AgentService {
  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly executionAgentRepository: IExecutionAgent,
  ) {}

  async reviewCode(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.REVISAO as AgentType,
    );
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: "review",
    });
    return formatMessageToJson(responseAgent.response);
  }

  async complianceCode(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.ADERENCIA as AgentType,
    );
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: "compliance",
    });
    return formatMessageToJson(responseAgent.response);
  }

  async generateDocumentation(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.DOCUMENTACAO as AgentType,
    );
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: "documentation",
    });
    return formatMessageToJson(responseAgent.response);
  }

  async generateTests(placeholdersEntrada: PlaceholdersAgentEntrada) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.TESTES as AgentType,
    );
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: "tests",
    });
    return formatMessageToJson(responseAgent.response);
  }

  async saveExecution({
    responseAgent,
    placeholdersEntrada,
    typeFlow,
  }: {
    responseAgent: GenerateResponse;
    placeholdersEntrada: PlaceholdersAgentEntrada;
    typeFlow: string;
  }) {
    const executionAgent = new ExecutionAgent({
      flowType: typeFlow,
      durationMs: responseAgent.total_duration / 1000000,
      inputPayload: placeholdersEntrada,
      outputPayload: JSON.parse(responseAgent.response),
    });
    await this.executionAgentRepository.saveExecution(executionAgent);
  }
}

export { AgentService };
