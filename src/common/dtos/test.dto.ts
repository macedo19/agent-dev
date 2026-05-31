import * as z from "zod";
import {
  AllowedFrameworks,
  AllowedLanguages,
} from "../const/languages.const.js";

const LanguageEnum = z.enum(AllowedLanguages);
const FrameworksEnum = z.enum(AllowedFrameworks);

export const TestDto = z.object({
  code: z.string().max(10000),
  language: LanguageEnum,
  test_framework: FrameworksEnum,
});
