import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export class AnalyticsController {
  // Get user analytics
  getUserAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user!.id;
      const { period = '30d' } = req.query;

      // Calculate date range
      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get revision sessions in period
      const sessions = await prisma.revisionSession.findMany({
        where: {
          userId,
          startedAt: { gte: startDate },
        },
      });

      // Get mistakes in period
      const mistakes = await prisma.mistake.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      });

      // Calculate metrics
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter((s) => s.endedAt).length;
      const totalMistakes = mistakes.length;
      const totalPages = sessions.reduce((acc, s) => acc + (s.pagesCovered || 0), 0);

      // Daily activity
      const dailyActivity = await this.getDailyActivity(userId, startDate);

      // Mistake breakdown
      const mistakeBreakdown = await this.getMistakeBreakdown(userId, startDate);

      // Surah progress
      const surahProgress = await prisma.userProgress.findMany({
        where: { userId },
      });

      res.json({
        status: 'success',
        data: {
          period: { days: daysAgo, start: startDate, end: new Date() },
          overview: {
            totalSessions,
            completedSessions,
            totalMistakes,
            totalPages: Math.round(totalPages),
            averagePagesPerSession: totalSessions > 0 ? Math.round(totalPages / totalSessions) : 0,
          },
          dailyActivity,
          mistakeBreakdown,
          memorization: {
            totalMemorized: surahProgress.filter((s) => s.memorizationStatus === 'completed').length,
            inProgress: surahProgress.filter((s) => s.memorizationStatus === 'in_progress').length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Get app-wide analytics (admin only)
  getAppAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period = '30d' } = req.query;

      const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [totalUsers, activeUsers, totalSessions, totalMistakes] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            revisionSessions: { some: { startedAt: { gte: startDate } } },
          },
        }),
        prisma.revisionSession.count({ where: { startedAt: { gte: startDate } } }),
        prisma.mistake.count({ where: { createdAt: { gte: startDate } } }),
      ]);

      res.json({
        status: 'success',
        data: {
          period: { days: daysAgo, start: startDate },
          users: { total: totalUsers, active: activeUsers },
          activity: { sessions: totalSessions, mistakes: totalMistakes },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private getDailyActivity = async (userId: string, startDate: Date) => {
    const sessions = await prisma.revisionSession.findMany({
      where: { userId, startedAt: { gte: startDate } },
      select: { startedAt: true, pagesCovered: true, mistakesLogged: true },
    });

    // Group by date
    const activity: Record<string, { sessions: number; pages: number; mistakes: number }> = {};
    sessions.forEach((s) => {
      const date = s.startedAt.toISOString().split('T')[0];
      if (!activity[date]) {
        activity[date] = { sessions: 0, pages: 0, mistakes: 0 };
      }
      activity[date].sessions++;
      activity[date].pages += s.pagesCovered || 0;
      activity[date].mistakes += s.mistakesLogged;
    });

    return Object.entries(activity).map(([date, data]) => ({
      date,
      ...data,
      pages: Math.round(data.pages),
    }));
  };

  private getMistakeBreakdown = async (userId: string, startDate: Date) => {
    const mistakes = await prisma.mistake.groupBy({
      by: ['mistakeType'],
      where: { userId, createdAt: { gte: startDate } },
      _count: { id: true },
    });

    return mistakes.map((m) => ({
      type: m.mistakeType,
      count: m._count.id,
    }));
  };
}

export default AnalyticsController;
