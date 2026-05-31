import { Request, Response } from "express";
import { AgentService } from "../services/agent.service.js";
import { generateHashInput } from "../common/utils/hash.js";
import { ReviewDto } from "../common/dtos/review.dto.js";
import { ComplianceDto } from "../common/dtos/compliance.dto.js";
import { DocumentDto } from "../common/dtos/document.dto.js";
import { TestDto } from "../common/dtos/test.dto.js";

class AgentController {
  constructor(private readonly agentService: AgentService) {}

  async codeReview(_req: Request, res: Response) {
    const parsed = ReviewDto.safeParse(_req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const { code, language, context } = parsed.data;
    const hashed = generateHashInput({ code, language, context });
    const outputCached = await this.agentService.getOutputPayloadRedisCached(hashed);

    if (outputCached) {
      return res.status(200).json({ data: outputCached });
    }

    const result = await this.agentService.reviewCode({ code, language, context }, hashed);
    return res.status(200).json({ data: result });
  }

  async codeCompliance(_req: Request, res: Response) {
    const parsed = ComplianceDto.safeParse(_req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const { code, language, task_description } = parsed.data;
    const hashed = generateHashInput({ code, language, task_description });
    const outputCached = await this.agentService.getOutputPayloadRedisCached(hashed);

    if (outputCached) {
      return res.status(200).json({ data: outputCached });
    }

    const result = await this.agentService.complianceCode({ code, language, task_description }, hashed);
    return res.status(200).json({ data: result });
  }

  async generateDocumentation(_req: Request, res: Response) {
    const parsed = DocumentDto.safeParse(_req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const { code, language, doc_type } = parsed.data;
    const hashed = generateHashInput({ code, language, doc_type });
    const outputCached = await this.agentService.getOutputPayloadRedisCached(hashed);

    if (outputCached) {
      return res.status(200).json({ data: outputCached });
    }

    const result = await this.agentService.generateDocumentation({ code, language, doc_type }, hashed);
    return res.status(200).json({ data: result });
  }

  async generateTests(_req: Request, res: Response) {
    const parsed = TestDto.safeParse(_req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }

    const { code, language, test_framework } = parsed.data;
    const hashed = generateHashInput({ code, language, test_framework });
    const outputCached = await this.agentService.getOutputPayloadRedisCached(hashed);

    if (outputCached) {
      return res.status(200).json({ data: outputCached });
    }

    const result = await this.agentService.generateTests({ code, language, test_framework }, hashed);
    return res.status(200).json({ data: result });
  }
}

export { AgentController };
