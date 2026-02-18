import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticationError } from './errorHandler.js';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = decoded;

    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
      req.user = decoded;
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};
