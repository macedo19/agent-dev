import { ExecutionAgent } from "../../models/execution_agent.model.js";

interface IExecutionAgent {
  saveExecution(executionAgent: ExecutionAgent): Promise<void>;
}

export { IExecutionAgent };