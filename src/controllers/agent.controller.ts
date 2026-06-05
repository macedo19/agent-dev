import { NextFunction, Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";
import { generateHashInput } from "../common/utils/hash.js";
import { ReviewDto } from "../common/dtos/review.dto.js";
import { ComplianceDto } from "../common/dtos/compliance.dto.js";
import { DocumentDto } from "../common/dtos/document.dto.js";
import { TestDto } from "../common/dtos/test.dto.js";
import { DtoError } from "../common/errors/dto.error.js";
import { HistoryDto } from "../common/dtos/history.dto.js";
import { logger } from "../infra/log/app.logger.js";

class AgentController {
  constructor(private readonly agentService: AgentService) {}

  async codeReview(_req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ReviewDto.safeParse(_req.body);
      if (!parsed.success) throw new DtoError(parsed.error.issues);

      const { code, language, context } = parsed.data;
      const hashed = generateHashInput({ code, language, context });
      const outputCached =
        await this.agentService.getOutputPayloadRedisCached(hashed);

      if (outputCached !== null) {
        logger.info({ message: "cache_hit", flow_type: "review", language });
        return res.status(200).json({ data: outputCached });
      }

      const result = await this.agentService.reviewCode(
        { code, language, context },
        hashed,
      );
      return res.status(200).json({ data: result });
    } catch (error) {
      console.warn("Review error:", error);
      logger.error({ message: "flow_error", flow_type: "review", error: error instanceof Error ? error.message : String(error) });
      next(error);
    }
  }

  async codeCompliance(_req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ComplianceDto.safeParse(_req.body);
      if (!parsed.success) throw new DtoError(parsed.error.issues);

      const { code, language, task_description } = parsed.data;
      const hashed = generateHashInput({ code, language, task_description });
      const outputCached =
        await this.agentService.getOutputPayloadRedisCached(hashed);

      if (outputCached !== null) {
        logger.info({ message: "cache_hit", flow_type: "compliance", language });
        return res.status(200).json({ data: outputCached });
      }

      const result = await this.agentService.complianceCode(
        { code, language, task_description },
        hashed,
      );
      return res.status(200).json({ data: result });
    } catch (error) {
      logger.error({ message: "flow_error", flow_type: "compliance", error: error instanceof Error ? error.message : String(error) });
      next(error);
    }
  }

  async generateDocumentation(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const parsed = DocumentDto.safeParse(_req.body);
      if (!parsed.success) throw new DtoError(parsed.error.issues);

      const { code, language, doc_type } = parsed.data;
      const hashed = generateHashInput({ code, language, doc_type });
      const outputCached =
        await this.agentService.getOutputPayloadRedisCached(hashed);

      if (outputCached !== null) {
        logger.info({ message: "cache_hit", flow_type: "documentation", language, doc_type });
        return res.status(200).json({ data: outputCached });
      }

      const result = await this.agentService.generateDocumentation(
        { code, language, doc_type },
        hashed,
      );
      return res.status(200).json({ data: result });
    } catch (error) {
      logger.error({ message: "flow_error", flow_type: "documentation", error: error instanceof Error ? error.message : String(error) });
      next(error);
    }
  }

  async generateTests(_req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = TestDto.safeParse(_req.body);
      if (!parsed.success) throw new DtoError(parsed.error.issues);

      const { code, language, test_framework } = parsed.data;
      const hashed = generateHashInput({ code, language, test_framework });
      const outputCached =
        await this.agentService.getOutputPayloadRedisCached(hashed);

      if (outputCached !== null) {
        logger.info({ message: "cache_hit", flow_type: "tests", language, test_framework });
        return res.status(200).json({ data: outputCached });
      }

      const result = await this.agentService.generateTests(
        { code, language, test_framework },
        hashed,
      );
      return res.status(200).json({ data: result });
    } catch (error) {
      logger.error({ message: "flow_error", flow_type: "tests", error: error instanceof Error ? error.message : String(error) });
      next(error);
    }
  }

  async getHistory(_req: Request, res: Response, next: NextFunction) {
    try {

      const parsed = HistoryDto.safeParse(_req.params);
      if (!parsed.success) throw new DtoError(parsed.error.issues);
      const history = await this.agentService.getHistory(parsed.data.id);
      return res.status(200).json({ data: history });
    } catch (error) {
      logger.error({ message: "flow_error", flow_type: "history", error: error instanceof Error ? error.message : String(error) });
      next(error);
    }
  }
}

export { AgentController };
