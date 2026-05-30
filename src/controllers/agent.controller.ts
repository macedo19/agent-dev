import { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";

class AgentController {
  constructor(
    private readonly agentService: AgentService,
  ) {}

  async codeReview(_req: Request, res: Response) {
    console.warn(_req.body)
    const result = await this.agentService.reviewCode();
    return res.status(200).json({ message: result });
  }
}

export { AgentController };
