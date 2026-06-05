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
import { logger } from "../infra/log/app.logger.js";

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
    logger.info({
      message: "flow_started",
      flow_type: AgentTypeEnum.REVISAO,
      language: placeholdersEntrada.language,
      code_length: placeholdersEntrada.code.length,
    });
    const responseAgent: GenerateResponse = await this.ollamaClient.sendMessage(
      placeholdersEntrada,
      AgentTypeEnum.REVISAO as AgentType,
    );
    console.warn("Review response:", responseAgent.response);
    const parsedOutput = formatMessageToJson(responseAgent.response);
    await this.saveOutputPayloadRedisCache(hashInput, responseAgent.response);
    await this.saveExecution({
      responseAgent,
      placeholdersEntrada,
      typeFlow: AgentTypeEnum.REVISAO,
      outputPayload: parsedOutput,
    });
    this.logFlowCompleted(AgentTypeEnum.REVISAO, responseAgent);
    return parsedOutput;
  }

  async complianceCode(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    logger.info({
      message: "flow_started",
      flow_type: AgentTypeEnum.ADERENCIA,
      language: placeholdersEntrada.language,
      code_length: placeholdersEntrada.code.length,
    });
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
    this.logFlowCompleted(AgentTypeEnum.ADERENCIA, responseAgent);
    return parsedOutput;
  }

  async generateDocumentation(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    logger.info({
      message: "flow_started",
      flow_type: AgentTypeEnum.DOCUMENTACAO,
      language: placeholdersEntrada.language,
      doc_type: placeholdersEntrada.doc_type,
      code_length: placeholdersEntrada.code.length,
    });
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
    this.logFlowCompleted(AgentTypeEnum.DOCUMENTACAO, responseAgent);
    return parsedOutput;
  }

  async generateTests(
    placeholdersEntrada: PlaceholdersAgentEntrada,
    hashInput: string,
  ) {
    logger.info({
      message: "flow_started",
      flow_type: AgentTypeEnum.TESTES,
      language: placeholdersEntrada.language,
      test_framework: placeholdersEntrada.test_framework,
      code_length: placeholdersEntrada.code.length,
    });
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
    this.logFlowCompleted(AgentTypeEnum.TESTES, responseAgent);
    return parsedOutput;
  }

  private logFlowCompleted(flowType: string, response: GenerateResponse) {
    logger.info({
      message: "flow_completed",
      flow_type: flowType,
      model_used: response.model,
      duration_ms: Math.round(response.total_duration / 1_000_000),
      prompt_tokens: response.prompt_eval_count,
      output_tokens: response.eval_count,
    });
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
    outputPayload: Record<string, unknown>;
  }) {
    const executionAgent = new ExecutionAgent({
      flowType: typeFlow,
      durationMs: responseAgent.total_duration / 1000000,
      inputPayload: placeholdersEntrada,
      outputPayload,
    });
    await this.executionAgentRepository.saveExecution(executionAgent);
  }

  async getHistory(filterById: string = "") {
    const filterObject = filterById ? { id: filterById } : {};
    const result = await this.executionAgentRepository.findAll(filterObject);
    logger.info({ message: "history_retrieved", filter_id: filterById || null });
    return result;
  }
}

export { AgentService };
