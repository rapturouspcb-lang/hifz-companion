import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export class ProgressController {
  getProgressOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;

      const [surahProgress, streak, recentMistakes, recentSessions] = await Promise.all([
        prisma.userProgress.findMany({
          where: { userId },
          orderBy: { surahId: 'asc' }
        }),
        prisma.dailyStreak.findUnique({ where: { userId } }),
        prisma.mistake.count({
          where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        }),
        prisma.revisionSession.findMany({
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 5
        })
      ]);

      const totalMemorized = surahProgress.filter(s => s.memorizationStatus === 'completed').length;
      const inProgress = surahProgress.filter(s => s.memorizationStatus === 'in_progress').length;

      res.json({
        status: 'success',
        data: {
          summary: {
            totalMemorized,
            inProgress,
            notStarted: 114 - totalMemorized - inProgress
          },
          streak: streak || { currentStreak: 0, longestStreak: 0 },
          recentMistakes,
          recentSessions
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getSurahProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;

      const progress = await prisma.userProgress.findMany({
        where: { userId },
        orderBy: { surahId: 'asc' }
      });

      res.json({ status: 'success', data: progress });
    } catch (error) {
      next(error);
    }
  };

  updateSurahProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { surahId } = req.params;
      const { memorizationStatus, masteryLevel } = req.body;

      const progress = await prisma.userProgress.upsert({
        where: { userId_surahId: { userId, surahId: parseInt(surahId, 10) } },
        update: {
          memorizationStatus,
          masteryLevel,
          lastRevisedAt: new Date()
        },
        create: {
          userId,
          surahId: parseInt(surahId, 10),
          memorizationStatus,
          masteryLevel
        }
      });

      res.json({ status: 'success', data: progress });
    } catch (error) {
      next(error);
    }
  };

  startRevisionSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { revisionType, surahIds } = req.body;

      const session = await prisma.revisionSession.create({
        data: {
          userId,
          revisionType,
          surahIds: surahIds || []
        }
      });

      res.status(201).json({ status: 'success', data: session });
    } catch (error) {
      next(error);
    }
  };

  endRevisionSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { sessionId } = req.params;
      const { pagesCovered, mistakesLogged } = req.body;

      const session = await prisma.revisionSession.updateMany({
        where: { id: sessionId, userId },
        data: {
          endedAt: new Date(),
          pagesCovered,
          mistakesLogged
        }
      });

      // Update streak
      await this.updateStreak(userId);

      res.json({ status: 'success', data: session });
    } catch (error) {
      next(error);
    }
  };

  getRevisionHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { limit = 30, offset = 0 } = req.query;

      const sessions = await prisma.revisionSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10)
      });

      res.json({ status: 'success', data: sessions });
    } catch (error) {
      next(error);
    }
  };

  logMistake = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId, sessionId, mistakeType, notes } = req.body;

      const mistake = await prisma.mistake.create({
        data: {
          userId,
          ayahId,
          sessionId: sessionId || null,
          mistakeType,
          notes
        }
      });

      // Update mistake count in progress
      const ayah = await prisma.ayah.findUnique({ where: { id: ayahId } });
      if (ayah) {
        await prisma.userProgress.updateMany({
          where: { userId, surahId: ayah.surahId },
          data: { mistakeCount: { increment: 1 } }
        });
      }

      res.status(201).json({ status: 'success', data: mistake });
    } catch (error) {
      next(error);
    }
  };

  getMistakes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { limit = 100 } = req.query;

      const mistakes = await prisma.mistake.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string, 10),
        include: { ayah: { include: { surah: true } } }
      });

      res.json({ status: 'success', data: mistakes });
    } catch (error) {
      next(error);
    }
  };

  getWeakAyahs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;

      // Get ayahs with multiple mistakes
      const weakAyahs = await prisma.mistake.groupBy({
        by: ['ayahId'],
        where: { userId },
        _count: { id: true },
        having: { id: { _count: { gte: 2 } } },
        orderBy: { _count: { id: 'desc' } }
      });

      const ayahIds = weakAyahs.map(w => w.ayahId);
      const ayahs = await prisma.ayah.findMany({
        where: { id: { in: ayahIds } },
        include: { surah: true }
      });

      const result = ayahs.map(a => ({
        ...a,
        mistakeCount: weakAyahs.find(w => w.ayahId === a.id)?._count.id || 0
      }));

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  getStreak = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;

      const streak = await prisma.dailyStreak.findUnique({ where: { userId } });

      res.json({ status: 'success', data: streak || { currentStreak: 0, longestStreak: 0 } });
    } catch (error) {
      next(error);
    }
  };

  getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;

      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { ayah: { include: { surah: true } } }
      });

      res.json({ status: 'success', data: bookmarks });
    } catch (error) {
      next(error);
    }
  };

  addBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId, bookmarkType, note, color } = req.body;

      const bookmark = await prisma.bookmark.create({
        data: {
          userId,
          ayahId,
          bookmarkType,
          note,
          color
        }
      });

      res.status(201).json({ status: 'success', data: bookmark });
    } catch (error) {
      next(error);
    }
  };

  removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId } = req.params;

      await prisma.bookmark.deleteMany({
        where: { userId, ayahId: parseInt(ayahId, 10) }
      });

      res.json({ status: 'success', message: 'Bookmark removed' });
    } catch (error) {
      next(error);
    }
  };

  addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId, note } = req.body;

      const bookmark = await prisma.bookmark.upsert({
        where: { userId_ayahId: { userId, ayahId } },
        update: { note },
        create: { userId, ayahId, note, bookmarkType: 'note' }
      });

      res.json({ status: 'success', data: bookmark });
    } catch (error) {
      next(error);
    }
  };

  updateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId } = req.params;
      const { note } = req.body;

      const bookmark = await prisma.bookmark.updateMany({
        where: { userId, ayahId: parseInt(ayahId, 10) },
        data: { note }
      });

      res.json({ status: 'success', data: bookmark });
    } catch (error) {
      next(error);
    }
  };

  deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { ayahId } = req.params;

      await prisma.bookmark.updateMany({
        where: { userId, ayahId: parseInt(ayahId, 10) },
        data: { note: null }
      });

      res.json({ status: 'success', message: 'Note deleted' });
    } catch (error) {
      next(error);
    }
  };

  private updateStreak = async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.dailyStreak.findUnique({ where: { userId } });

    if (!streak) {
      await prisma.dailyStreak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActivityDate: today }
      });
      return;
    }

    if (!streak.lastActivityDate) {
      await prisma.dailyStreak.update({
        where: { userId },
        data: { currentStreak: 1, longestStreak: 1, lastActivityDate: today }
      });
      return;
    }

    const lastDate = new Date(streak.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change needed
      return;
    }

    if (diffDays === 1) {
      // Consecutive day
      const newStreak = streak.currentStreak + 1;
      await prisma.dailyStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          lastActivityDate: today
        }
      });
    } else {
      // Streak broken
      await prisma.dailyStreak.update({
        where: { userId },
        data: { currentStreak: 1, lastActivityDate: today }
      });
    }
  };
}

export default ProgressController;
