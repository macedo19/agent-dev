import { ExecutionAgent } from "../../models/execution_agent.model.js";

interface IHistoryDetailGeneric {
  id: string;
  type: string;
  timestamp: string;
}


interface IExecutionAgent {
  saveExecution(executionAgent: ExecutionAgent): Promise<void>;
  findAll(filter: {id?: string}): Promise<ExecutionAgent | IHistoryDetailGeneric[]>;
}

export { IExecutionAgent, IHistoryDetailGeneric };