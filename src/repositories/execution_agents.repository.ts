import { format } from "date-fns";
import { ExecutionAgent } from "../models/execution_agent.model.js";
import {
  IExecutionAgent,
  IHistoryDetailGeneric,
} from "./contracts/execution_agent.interface.js";
import { prisma } from "../infra/db/prisma.client.js";
import { PrismaClient } from "@prisma/client/extension";

export class ExecutionAgentRepository implements IExecutionAgent {
  public constructor(private db: PrismaClient = prisma) {}

  public async saveExecution(executionAgent: ExecutionAgent): Promise<void> {
    await this.db.executionAgent.create({
      data: executionAgent,
    });
  }

  public async findAll(filter: {
    id?: string;
  }): Promise<ExecutionAgent | IHistoryDetailGeneric[]> {
    const isFilterById = !!filter.id;

    if (isFilterById) {
      const executionAgent = await this.db.executionAgent.findUnique({
        where: { id: filter.id },
      });
      return executionAgent || [];
    }

    const rows = await this.db.executionAgent.findMany({
      take: 20,
    });
    const resultGeneric: IHistoryDetailGeneric[] = [];
    for (const row of rows) {
      resultGeneric.push({
        id: row.id || "",
        type: row.flowType,
        timestamp: format(row.createdAt , "yyyy-MM-dd HH:mm:ss"),
      });
    }
    return resultGeneric;
  }
}
