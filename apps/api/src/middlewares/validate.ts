import type { NextFunction, Request, Response } from 'express';
import type { ZodObject, ZodType } from 'zod';

export const validateBody =
  <TSchema extends ZodType>(schema: TSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };

export const validateParams =
  (schema: ZodObject) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    req.params = schema.parse(req.params) as Request['params'];
    next();
  };
