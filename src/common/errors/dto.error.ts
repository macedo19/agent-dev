import { z } from "zod";
import { AppError } from "./app.error.js";

class DtoError extends AppError {
  public readonly issues: z.core.$ZodIssue[];

  constructor(issues: z.core.$ZodIssue[]) {
    super("Validation error", 400);
    this.issues = issues;
  }
}

export { DtoError };
