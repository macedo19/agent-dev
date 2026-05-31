import * as z from "zod";
import { AllowedLanguages } from "../const/languages.const.js";

const LanguageEnum = z.enum(AllowedLanguages);

export const ComplianceDto = z.object({
  code: z.string().max(10000),
  language: LanguageEnum,
  task_description: z.string().max(10000).optional(),
});
