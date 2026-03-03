import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ValidationError as CustomValidationError } from './errorHandler.js';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
    body(req);
    } catch (error) {
    if (error instanceof CustomValidationError) {
    return next(error);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return next();
  }

    res.status(400).json({
    status: 'fail',
    message: 'Validation failed',
    errors: errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));
  };
};

// Common validation schemas
export const registerSchema = {
  email: body('email').isEmail(),
  password: body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  displayName: body('displayName').optional().isLength({ max: 100 }),
});

export const loginSchema = {
  email: body('email').isEmail(),
  password: body('password').exists(),
};

export const updateProfileSchema = {
  displayName: body('displayName').optional().isLength({ max: 100 }),
};

export const changePasswordSchema = {
  currentPassword: body('currentPassword').exists(),
  newPassword: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  confirmNewPassword: body('confirmNewPassword')
    .isLength({ min: 8 })
    .withMessage('Passwords do not match'),
};

export const bookmarkSchema = {
  ayahId: body('ayahId').isInt({ min: 1 }),
  bookmarkType: body('bookmarkType').optional().isIn(['general', 'revision', 'favorite', 'important']),
  note: body('note').optional().isString().isLength({ max: 500 }),
  color: body('color').optional().isHexColor(),
};

export const logMistakeSchema = {
  ayahId: body('ayahId').isInt({ min: 1 }),
  mistakeType: body('mistakeType').isIn(['stutter', 'wrong_word', 'forgot', 'mutashabih_confusion', 'other']),
  notes: body('notes').optional().isString().isLength({ max: 500 }),
};

export const revisionSessionSchema = {
  revisionType: body('revisionType').isIn(['sabaq', 'sabaq_para', 'manzil', 'weak', 'custom']),
  surahIds: body('surahIds').optional().isArray(),
  pagesCovered: body('pagesCovered').optional().isNumeric(),
  mistakesLogged: body('mistakesLogged').optional().isInt({ min: 0 }),
};

// Rate Limiting Middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
});

export const applyRateLimit = () => {
  return limiter;
};
