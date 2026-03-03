import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export class TeacherController {
  // Get all students (teacher only)
  getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;

      // Check if user is a teacher (would need role field in User model)
      // For now, return all users with their progress summary
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          streak: true,
          progress: {
            select: {
              surahId: true,
              memorizationStatus: true,
              masteryLevel: true,
              mistakeCount: true,
            },
          },
          revisionSessions: {
            select: { startedAt: true, endedAt: true, mistakesLogged: true },
            orderBy: { startedAt: 'desc' },
            take: 5,
          },
        },
      });

      const students = users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        createdAt: u.createdAt,
        streak: u.streak?.currentStreak || 0,
        memorizedCount: u.progress.filter((p) => p.memorizationStatus === 'completed').length,
        inProgressCount: u.progress.filter((p) => p.memorizationStatus === 'in_progress').length,
        totalMistakes: u.progress.reduce((acc, p) => acc + p.mistakeCount, 0),
        recentSessions: u.revisionSessions,
        weakAreas: u.progress.filter((p) => p.mistakeCount >= 3).map((p) => p.surahId),
      }));

      res.json({ status: 'success', data: students });
    } catch (error) {
      next(error);
    }
  };

  // Get specific student details
  getStudentDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          settings: true,
          streak: true,
          progress: { include: { surah: true } },
          mistakes: {
            include: { ayah: { include: { surah: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          revisionSessions: {
            orderBy: { startedAt: 'desc' },
            take: 30,
          },
        },
      });

      if (!user) {
        throw new NotFoundError('Student not found');
      }

      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  // Add notes for a student
  addStudentNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const { surahId, note, masteryLevel } = req.body;

      // Update user progress with teacher notes
      const progress = await prisma.userProgress.upsert({
        where: { userId_surahId: { userId: studentId, surahId } },
        update: { masteryLevel },
        create: { userId: studentId, surahId, masteryLevel },
      });

      res.json({ status: 'success', data: progress });
    } catch (error) {
      next(error);
    }
  };

  // Get class-wide analytics
  getClassAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period = '30d' } = req.query;
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [totalStudents, activeStudents, totalSessions, avgMistakes] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { revisionSessions: { some: { startedAt: { gte: startDate } } } },
        }),
        prisma.revisionSession.count({ where: { startedAt: { gte: startDate } } }),
        prisma.mistake.count({ where: { createdAt: { gte: startDate } } }),
      ]);

      // Get weak surahs across all students
      const weakSurahs = await prisma.userProgress.groupBy({
        by: ['surahId'],
        where: { mistakeCount: { gte: 3 } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      });

      res.json({
        status: 'success',
        data: {
          overview: { totalStudents, activeStudents, totalSessions, avgMistakes },
          weakSurahs: weakSurahs.map((w) => ({ surahId: w.surahId, studentCount: w._count.userId })),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default TeacherController;
