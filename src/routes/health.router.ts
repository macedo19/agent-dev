import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";

export function createHealthRouter() {
  const agentController = new HealthController();
  const router = Router();
  router.get("/", agentController.checkHealth.bind(agentController));
  return router;
}
