import * as z from "zod";
import { AllowedLanguages } from "../const/languages.const.js";

const LanguageEnum = z.enum(AllowedLanguages);

export const ReviewDto = z.object({
  code: z.string().max(10000),
  language: LanguageEnum,
  context: z.string().max(10000).optional(),
});
