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
import { RedisClient } from "../infra/clients/redis.client.js";
import { RedisError } from "../common/errors/redis.error.js";

class AgentService {
  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly executionAgentRepository: IExecutionAgent,
    private readonly redisClient: RedisClient,
  ) {}

  async getOutputPayloadRedisCached(key: string) {
    try {
      const outputCached = await this.redisClient.get(key);
      return outputCached ? formatMessageToJson(outputCached) : null;
    } catch {
      throw new RedisError("Failed to retrieve cached output from Redis.");
    }
  }

  async saveOutputPayloadRedisCache(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async reviewCode(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.REVISAO as AgentType,
    );
    const parsedOutput = formatMessageToJson(responseAgent.response);
    await this.saveOutputPayloadRedisCache(hashInput, responseAgent.response);
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: AgentTypeEnum.REVISAO,
      outputPayload: parsedOutput,
    });
    return parsedOutput;
  }

  async complianceCode(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.ADERENCIA as AgentType,
    );
    const parsedOutput = formatMessageToJson(responseAgent.response);
    await this.saveOutputPayloadRedisCache(hashInput, responseAgent.response);
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: AgentTypeEnum.ADERENCIA,
      outputPayload: parsedOutput,
    });
    return parsedOutput;
  }

  async generateDocumentation(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.DOCUMENTACAO as AgentType,
    );
    const parsedOutput = formatMessageToJson(responseAgent.response);
    await this.saveOutputPayloadRedisCache(hashInput, responseAgent.response);
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: AgentTypeEnum.DOCUMENTACAO,
      outputPayload: parsedOutput,
    });
    return parsedOutput;
  }

  async generateTests(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.TESTES as AgentType,
    );
    const parsedOutput = formatMessageToJson(responseAgent.response);
    await this.saveOutputPayloadRedisCache(hashInput, responseAgent.response);
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: AgentTypeEnum.TESTES,
      outputPayload: parsedOutput,
    });
    return parsedOutput;
  }

  async saveExecution({
    responseAgent,
    placeholdersEntrada,
    typeFlow,
    outputPayload,
  }: {
    responseAgent: GenerateResponse;
    placeholdersEntrada: PlaceholdersAgentEntrada;
    typeFlow: string;
    outputPayload: Record<string, any>;
  }) {
    const executionAgent = new ExecutionAgent({
      flowType: typeFlow,
      durationMs: responseAgent.total_duration / 1000000,
      inputPayload: placeholdersEntrada,
      outputPayload,
    });
    await this.executionAgentRepository.saveExecution(executionAgent);
  }
}

export { AgentService };
