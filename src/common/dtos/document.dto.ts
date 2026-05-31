import * as z from "zod";
import { AllowedLanguages } from "../const/languages.const.js";

const LanguageEnum = z.enum(AllowedLanguages);
const TypeDoc = z.enum(['technical', 'operational'])

export const DocumentDto = z.object({
  code: z.string().max(10000),
  language: LanguageEnum,
  doc_type: TypeDoc,
});
