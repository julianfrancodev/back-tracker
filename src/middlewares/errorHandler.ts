import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  const statusCode = err.statusCode || 500;
  
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
