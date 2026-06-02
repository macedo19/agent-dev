import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { DtoError } from "../errors/dto.error.js";

function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof DtoError) {
    return res.status(400).json({ errors: error.issues });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: "Internal Server Error" });
}

export { errorHandlerMiddleware };
