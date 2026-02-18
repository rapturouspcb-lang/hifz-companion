'use client';

import { useState, useEffect } from 'react';
import { progressApi, userApi } from '@/lib/api';
import { Flame, BookOpen, Target, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await progressApi.getOverview();
      setProgress(response.data.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500 streak-fire" />
            </div>
            <span className="text-sm text-gray-500">Current Streak</span>
          </div>
          <p className="text-3xl font-bold">
            {progress?.streak?.currentStreak || 0}
          </p>
          <p className="text-sm text-gray-500">days</p>
        </div>

        {/* Memorized */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm text-gray-500">Memorized</span>
          </div>
          <p className="text-3xl font-bold">
            {progress?.summary?.totalMemorized || 0}
          </p>
          <p className="text-sm text-gray-500">surahs</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm text-gray-500">In Progress</span>
          </div>
          <p className="text-3xl font-bold">
            {progress?.summary?.inProgress || 0}
          </p>
          <p className="text-sm text-gray-500">surahs</p>
        </div>

        {/* Mistakes This Week */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-sm text-gray-500">Mistakes (7 days)</span>
          </div>
          <p className="text-3xl font-bold">
            {progress?.recentMistakes || 0}
          </p>
          <p className="text-sm text-gray-500">logged</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/revision">
          <div className="bg-primary-600 text-white rounded-lg p-6 hover:bg-primary-700 transition-colors cursor-pointer">
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Start Revision</h3>
            <p className="text-primary-100 text-sm">Begin your daily revision session</p>
          </div>
        </Link>

        <Link href="/quran">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-8 h-8 mb-3 text-primary-600" />
            <h3 className="font-semibold text-lg mb-1">Read Quran</h3>
            <p className="text-gray-500 text-sm">Continue from where you left off</p>
          </div>
        </Link>

        <Link href="/search">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
            <Target className="w-8 h-8 mb-3 text-primary-600" />
            <h3 className="font-semibold text-lg mb-1">Search</h3>
            <p className="text-gray-500 text-sm">Find ayahs by topic or meaning</p>
          </div>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Revision Sessions</h2>
        {progress?.recentSessions?.length > 0 ? (
          <div className="space-y-3">
            {progress.recentSessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{session.revisionType?.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{session.pagesCovered} pages</p>
                  <p className="text-sm text-red-500">{session.mistakesLogged} mistakes</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No revision sessions yet.</p>
            <Link href="/revision">
              <Button className="mt-4">Start Your First Session</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
