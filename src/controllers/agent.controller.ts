import { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";

class AgentController {
  constructor(private readonly agentService: AgentService) {}

  async codeReview(_req: Request, res: Response) {
    const { code, language, context } = _req.body;
    const result = await this.agentService.reviewCode({
      code,
      language,
      context,
    });
    return res.status(200).json({ data: result });
  }

  async codeCompliance(_req: Request, res: Response) {
    const { code, language, task_description } = _req.body;
    const result = await this.agentService.complianceCode({
      code,
      language,
      task_description,
    });
    return res.status(200).json({ data: result });
  }
}

export { AgentController };
