import { Router } from "express";
import { AgentController } from "../controllers/agent.controller.js";
import { AgentService } from "../services/agent.service.js";

const agentController = new AgentController(new AgentService());
const router = Router();

router.post("/review", agentController.codeReview.bind(agentController));

export default router;
