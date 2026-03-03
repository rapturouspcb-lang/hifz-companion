import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Simple validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  next();
};

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
});

export const applyRateLimit = () => limiter;
