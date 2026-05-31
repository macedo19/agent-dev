import { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";

class AgentController {
  constructor(
    private readonly agentService: AgentService,
  ) {}

  async codeReview(_req: Request, res: Response) {
    const { code } = _req.body;
    const result = await this.agentService.reviewCode(code);
    return res.status(200).json({ data: result });
  }
}

export { AgentController };
