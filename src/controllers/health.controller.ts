
import { Request, Response } from "express";
import { logger } from "../infra/log/app.logger.js";

class HealthController {

    async checkHealth(req: Request, res: Response) {
        return res.status(200).json({ status: "Aplicação em execução" });
    }

}

export { HealthController }