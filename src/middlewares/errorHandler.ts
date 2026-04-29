import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  const statusCode = err instanceof AppError ? err.statusCode : ('statusCode' in err ? Number(err.statusCode) : 500);
  
  const response = {
    error: {
      message: statusCode === 500 ? 'Internal Server Error' : err.message,
      correlationId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  };

  if (statusCode === 500) {
    console.error(`[${correlationId}] Unexpected error:`, err);
  }

  res.status(statusCode).json(response);
};

export const addCorrelationId = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || crypto.randomUUID();
  next();
};
