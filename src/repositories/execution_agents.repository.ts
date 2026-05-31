import { ExecutionAgent } from "../models/execution_agent.model.js";
import { IExecutionAgent } from "./contracts/execution_agent.interface.js";
import { prisma } from "../infra/db/prisma.client.js";
import { PrismaClient } from "@prisma/client/extension";

export class ExecutionAgentRepository implements IExecutionAgent {
  public constructor(private db: PrismaClient = prisma) {}

  public async saveExecution(executionAgent: ExecutionAgent): Promise<void> {
    await this.db.executionAgent.create({
      data: executionAgent,
    });
  }
}
