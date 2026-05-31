import { Router } from "express";
import { AgentController } from "../controllers/agent.controller.js";
import { AgentService } from "../services/agent.service.js";
import { OllamaClient } from "../infra/clients/ollama.client.js";

const agentController = new AgentController(
  new AgentService(new OllamaClient()),
);
const router = Router();

router.post("/review", agentController.codeReview.bind(agentController));
router.post("/compliance", agentController.codeCompliance.bind(agentController));

export default router;
