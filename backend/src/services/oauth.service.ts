import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { AuthenticationError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export class OAuthController {
  // Google OAuth
  googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;

      // Verify Google token (simplified - in production use google-auth-library)
      const payload = await this.verifyGoogleToken(idToken);

      if (!payload || !payload.email) {
        throw new AuthenticationError('Invalid Google token');
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email: payload.email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            passwordHash: '', // No password for OAuth users
            displayName: payload.name || payload.email.split('@')[0],
          },
        });
        await prisma.dailyStreak.create({ data: { userId: user.id } });
      }

      const token = this.generateToken(user.id, user.email);

      res.json({
        status: 'success',
        data: {
          user: { id: user.id, email: user.email, displayName: user.displayName },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Apple OAuth
  appleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identityToken, user: appleUser } = req.body;

      const payload = await this.verifyAppleToken(identityToken);

      if (!payload || !payload.email) {
        throw new AuthenticationError('Invalid Apple token');
      }

      let user = await prisma.user.findUnique({ where: { email: payload.email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            passwordHash: '',
            displayName: appleUser?.name?.firstName || payload.email.split('@')[0],
          },
        });
        await prisma.dailyStreak.create({ data: { userId: user.id } });
      }

      const token = this.generateToken(user.id, user.email);

      res.json({
        status: 'success',
        data: {
          user: { id: user.id, email: user.email, displayName: user.displayName },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private verifyGoogleToken = async (idToken: string) => {
    // In production, use google-auth-library to verify
    // For now, decode without verification (development only)
    try {
      const decoded = jwt.decode(idToken) as any;
      return decoded;
    } catch {
      return null;
    }
  };

  private verifyAppleToken = async (identityToken: string) => {
    // In production, verify with Apple's public keys
    try {
      const decoded = jwt.decode(identityToken) as any;
      return decoded;
    } catch {
      return null;
    }
  };

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}

export default OAuthController;
