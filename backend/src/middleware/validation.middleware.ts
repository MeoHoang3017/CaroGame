import type { Request, Response, NextFunction } from "express";
import { validationResult, type ValidationChain } from "express-validator";
import { ErrorResponse, sendResponse } from "../utils/response";

/**
 * Validation Middleware
 * @description Middleware to handle validation errors from express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    for (const validation of validations) {
      await validation.run(req);
    }

    // Check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => ({
        field: err.type === "field" ? err.path : undefined,
        message: err.msg,
        value: err.type === "field" ? err.value : undefined,
      }));

      const response = ErrorResponse.CUSTOM(400, "Validation error", {
        errors: errorMessages,
      });
      return sendResponse(res, response);
    }

    next();
  };
};

/**
 * Helper to format validation errors
 */
export const formatValidationErrors = (errors: ReturnType<typeof validationResult>) => {
  return errors.array().map((err) => ({
    field: err.type === "field" ? err.path : undefined,
    message: err.msg,
    value: err.type === "field" ? err.value : undefined,
  }));
};

