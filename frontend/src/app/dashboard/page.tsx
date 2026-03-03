'use client';

import { useState, useEffect } from 'react';
import { progressApi, quranApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  Flame,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getGreeting } from '@/lib/utils';

interface Surah {
  id: number;
  nameEnglish: string;
  nameArabic: string;
  ayahCount: number;
}

interface ProgressData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
  summary: {
    totalMemorized: number;
    inProgress: number;
    notStarted: number;
  };
  recentSessions: any[];
  recentMistakes: number;
  weeklyActivity: { date: string; count: number }[];
  juzProgress: { juz: number; progress: number }[];
  weakSurahs: { surahId: number; mistakeCount: number }[];
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      // Still show dashboard but with limited features for guests
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [progressRes, surahsRes] = await Promise.all([
        progressApi.getOverview().catch(() => ({ data: { data: getDefaultProgress() } })),
        quranApi.getSurahs().catch(() => ({ data: { data: [] } })),
      ]);
      setProgress(progressRes.data.data);
      setSurahs(surahsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setProgress(getDefaultProgress());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultProgress = (): ProgressData => ({
    streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: '' },
    summary: { totalMemorized: 0, inProgress: 0, notStarted: 114 },
    recentSessions: [],
    recentMistakes: 0,
    weeklyActivity: generateMockWeeklyActivity(),
    juzProgress: Array.from({ length: 30 }, (_, i) => ({ juz: i + 1, progress: 0 })),
    weakSurahs: [],
  });

  function generateMockWeeklyActivity() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day) => ({ date: day, count: 0 }));
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAyahs = 6236;
  const memorizedAyahs = Math.round(
    (progress?.summary.totalMemorized || 0) * (totalAyahs / 114)
  );
  const overallProgress = Math.round((memorizedAyahs / totalAyahs) * 100);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.displayName || 'Hafiz'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {progress?.streak?.currentStreak
            ? `You're on a ${progress.streak.currentStreak}-day streak! Keep it up!`
            : 'Start your Hifz journey today'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Streak</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {progress?.streak?.currentStreak || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Best: {progress?.streak?.longestStreak || 0} days
          </p>
        </div>

        {/* Memorized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Memorized</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {progress?.summary?.totalMemorized || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            of 114 surahs
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {overallProgress}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {memorizedAyahs.toLocaleString()} / {totalAyahs.toLocaleString()} ayahs
          </p>
        </div>

        {/* Mistakes This Week */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Mistakes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {progress?.recentMistakes || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            in last 7 days
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Progress Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Juz Completion Wheel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Juz Progress
            </h2>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {progress?.juzProgress?.map((juz) => (
                <div
                  key={juz.juz}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center text-xs font-medium',
                    juz.progress >= 100
                      ? 'bg-green-500 text-white'
                      : juz.progress > 50
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : juz.progress > 0
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  )}
                  title={`Juz ${juz.juz}: ${juz.progress}% complete`}
                >
                  {juz.juz}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800" />
                <span>50%+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/50" />
                <span>Started</span>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Activity
            </h2>
            <div className="flex items-end justify-between h-32 gap-2">
              {progress?.weeklyActivity?.map((day, index) => {
                const maxCount = Math.max(...(progress?.weeklyActivity?.map((d) => d.count) || [1]));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                const isToday = index === new Date().getDay();
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative h-24">
                      <div
                        className={cn(
                          'absolute bottom-0 w-full rounded-t-lg transition-all',
                          isToday ? 'bg-primary-500' : 'bg-primary-300 dark:bg-primary-700'
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className={cn(
                      'text-xs',
                      isToday ? 'font-bold text-primary-600' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Surahs Heatmap */}
          {progress?.weakSurahs && progress.weakSurahs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weak Surahs
                </h2>
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-2">
                {progress.weakSurahs.slice(0, 5).map((weak) => {
                  const surah = surahs.find((s) => s.id === weak.surahId);
                  return (
                    <Link
                      key={weak.surahId}
                      href={`/quran/${weak.surahId}`}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {surah?.nameEnglish || `Surah ${weak.surahId}`}
                        </span>
                        <span className="text-arabic text-gray-600 dark:text-gray-400">
                          {surah?.nameArabic}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {weak.mistakeCount} mistakes
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Sessions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/revision" className="block">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Start Revision</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
              <Link href="/quran" className="block">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Read Quran</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
              <Link href="/mistakes" className="block">
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Review Mistakes</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </div>
              </Link>
            </div>
          </div>

          {/* Today's Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Today&apos;s Goals
            </h2>
            <div className="space-y-3">
              <GoalItem
                icon={<CheckCircle className="w-4 h-4" />}
                label="Complete revision"
                completed={false}
              />
              <GoalItem
                icon={<BookOpen className="w-4 h-4" />}
                label="Read 2 pages"
                completed={false}
              />
              <GoalItem
                icon={<Flame className="w-4 h-4" />}
                label="Maintain streak"
                completed={(progress?.streak?.currentStreak || 0) > 0}
              />
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Sessions
            </h2>
            {(progress?.recentSessions?.length || 0) > 0 ? (
              <div className="space-y-3">
                {progress?.recentSessions?.slice(0, 3).map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {session.revisionType?.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {session.pagesCovered} pages
                      </p>
                      {session.mistakesLogged > 0 && (
                        <p className="text-xs text-red-500">{session.mistakesLogged} mistakes</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sessions yet</p>
                <Link href="/revision">
                  <Button size="sm" className="mt-3">
                    Start Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalItem({
  icon,
  label,
  completed,
}: {
  icon: React.ReactNode;
  label: string;
  completed: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-3 p-2 rounded-lg', completed && 'bg-green-50 dark:bg-green-900/20')}>
      <div
        className={cn(
          'p-1.5 rounded-lg',
          completed
            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-sm',
          completed
            ? 'text-green-700 dark:text-green-400 line-through'
            : 'text-gray-700 dark:text-gray-300'
        )}
      >
        {label}
      </span>
      {completed && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
    </div>
  );
}
