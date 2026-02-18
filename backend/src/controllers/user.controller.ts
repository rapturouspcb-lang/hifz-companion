import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

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

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName: displayName || null,
          settings: {
            defaultReciter: 'abdul_basit_murattal',
            showTranslation: true,
            translationLanguage: 'urdu',
            mushafLayout: '13_line',
            fontSize: 'medium',
            theme: 'light'
          }
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

      res.json({ status: 'success', data: user });
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

      res.json({ status: 'success', data: user });
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
        data: { settings },
        select: { id: true, settings: true }
      });

      res.json({ status: 'success', data: user.settings });
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
    return jwt.sign(
      { id: userId, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

export default UserController;
