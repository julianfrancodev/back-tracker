import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
  id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: { message: 'No se proporcionó un token válido' } });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Token inválido o expirado' } });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { message: 'Usuario no autenticado' } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: { message: 'No tienes permisos para realizar esta acción' } });
      return;
    }

    next();
  };
};
