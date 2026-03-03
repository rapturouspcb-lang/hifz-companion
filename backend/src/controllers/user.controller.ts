import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// Token generation utilities
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

export class UserController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const defaultSettings = {
        defaultReciter: 'abdul_basit_murattal',
        showTranslation: true,
        translationLanguage: 'urdu',
        mushafLayout: '13_line',
        fontSize: 'medium',
        theme: 'light'
      };

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName: displayName || null,
          settings: JSON.stringify(defaultSettings)
        }
      });

      // Create initial streak record
      await prisma.dailyStreak.create({
        data: { userId: user.id }
      });

      const token = this.generateToken(user.id, user.email);

      res.status(201).json({
        status: 'success',
        data: {
          user: { id: user.id, email: user.email, displayName: user.displayName },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = this.generateToken(user.id, user.email);

      res.json({
        status: 'success',
        data: {
          user: { id: user.id, email: user.email, displayName: user.displayName },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response) => {
    // In a stateless JWT setup, logout is handled client-side
    // Optionally, we could implement token blacklisting here
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const user = await prisma.user.findUnique({
        where: { id: authReq.user!.id },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          settings: true
        }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      res.json({ status: 'success', data: { ...user, settings: JSON.parse(user.settings || '{}') } });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { displayName } = req.body;

      const user = await prisma.user.update({
        where: { id: authReq.user!.id },
        data: { displayName },
        select: {
          id: true,
          email: true,
          displayName: true,
          settings: true
        }
      });

      res.json({ status: 'success', data: { ...user, settings: JSON.parse(user.settings || '{}') } });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { settings } = req.body;

      const user = await prisma.user.update({
        where: { id: authReq.user!.id },
        data: { settings: JSON.stringify(settings) },
        select: { id: true, settings: true }
      });

      res.json({ status: 'success', data: JSON.parse(user.settings || '{}') });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: authReq.user!.id }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      res.json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  private generateToken(userId: string, email: string): string {
    const options: jwt.SignOptions = { expiresIn: '7d' };
    return jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      options
    );
  }

  // Password Reset Flow (#10)
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError('Email is required');
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Don't reveal if user exists or not for security
        res.json({
          status: 'success',
          message: 'If an account with that email exists, a reset link has been sent.',
        });
        return;
      }

      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      // In production, send email with reset link
      // For now, return the token for testing
      res.json({
        status: 'success',
        message: 'Password reset link has been sent to your email',
        // Remove this in production:
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ValidationError('Token and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters');
      }

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
        },
      });

      res.json({
        status: 'success',
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // Email Verification (#11)
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
      });

      res.json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      if (user.emailVerified) {
        res.json({
          status: 'success',
          message: 'Email is already verified',
        });
        return;
      }

      const verificationToken = generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 86400000); // 24 hours

      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationToken,
          verificationExpires,
        },
      });

      // In production, send verification email
      res.json({
        status: 'success',
        message: 'Verification email has been sent',
        // Remove this in production:
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
