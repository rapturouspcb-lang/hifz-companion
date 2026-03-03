'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { progressApi } from '@/lib/api';
import {
  Trophy,
  Flame,
  BookOpen,
  Target,
  Star,
  Award,
  CheckCircle,
  Lock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  progress: number;
  unlocked: boolean;
  category: 'streak' | 'memorization' | 'revision' | 'special';
}

const achievementsList: Omit<Achievement, 'progress' | 'unlocked'>[] = [
  // Streak achievements
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: <Flame className="w-6 h-6" />, requirement: 7, category: 'streak' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: <Flame className="w-6 h-6" />, requirement: 30, category: 'streak' },
  { id: 'streak_100', title: 'Century Streak', description: 'Maintain a 100-day streak', icon: <Flame className="w-6 h-6" />, requirement: 100, category: 'streak' },
  { id: 'streak_365', title: 'Year Champion', description: 'Maintain a 365-day streak', icon: <Trophy className="w-6 h-6" />, requirement: 365, category: 'streak' },

  // Memorization achievements
  { id: 'surah_1', title: 'First Step', description: 'Memorize your first surah', icon: <BookOpen className="w-6 h-6" />, requirement: 1, category: 'memorization' },
  { id: 'surah_10', title: 'Getting Started', description: 'Memorize 10 surahs', icon: <BookOpen className="w-6 h-6" />, requirement: 10, category: 'memorization' },
  { id: 'surah_36', title: 'Juz Master', description: 'Memorize 36 surahs (1 Juz)', icon: <Target className="w-6 h-6" />, requirement: 36, category: 'memorization' },
  { id: 'surah_114', title: 'Hafiz Complete', description: 'Memorize all 114 surahs', icon: <Trophy className="w-6 h-6" />, requirement: 114, category: 'memorization' },

  // Revision achievements
  { id: 'revision_50', title: 'Dedicated Reviser', description: 'Complete 50 revision sessions', icon: <CheckCircle className="w-6 h-6" />, requirement: 50, category: 'revision' },
  { id: 'revision_100', title: 'Revision Pro', description: 'Complete 100 revision sessions', icon: <CheckCircle className="w-6 h-6" />, requirement: 100, category: 'revision' },
  { id: 'revision_500', title: 'Revision Master', description: 'Complete 500 revision sessions', icon: <Award className="w-6 h-6" />, requirement: 500, category: 'revision' },

  // Special achievements
  { id: 'mistake_free', title: 'Perfect Recitation', description: 'Complete a session with no mistakes', icon: <Star className="w-6 h-6" />, requirement: 1, category: 'special' },
  { id: 'mutashabih_detect', title: 'Mutashabih Hunter', description: 'Identify 10 mutashabih pairs correctly', icon: <Zap className="w-6 h-6" />, requirement: 10, category: 'special' },
];

export default function AchievementsPage() {
  const { isAuthenticated } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchProgress();
  }, [isAuthenticated]);

  const fetchProgress = async () => {
    try {
      const response = await progressApi.getOverview();
      const data = response.data.data;

      // Map progress to achievements
      const userAchievements = achievementsList.map((a) => {
        let progress = 0;
        let unlocked = false;

        switch (a.category) {
          case 'streak':
            progress = data?.streak?.currentStreak || 0;
            break;
          case 'memorization':
            progress = data?.summary?.totalMemorized || 0;
            break;
          case 'revision':
            progress = data?.revisionCount || 0;
            break;
          case 'special':
            progress = data?.specialAchievements?.[a.id] || 0;
            break;
        }

        unlocked = progress >= a.requirement;

        return { ...a, progress, unlocked };
      });

      setAchievements(userAchievements);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      // Set default achievements
      setAchievements(
        achievementsList.map((a) => ({ ...a, progress: 0, unlocked: false }))
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlocked).length,
    percentage: Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100),
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'streak', label: 'Streak' },
    { id: 'memorization', label: 'Memorization' },
    { id: 'revision', label: 'Revision' },
    { id: 'special', label: 'Special' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your Hifz journey milestones</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Progress</p>
            <p className="text-3xl font-bold">
              {stats.unlocked} / {stats.total}
            </p>
            <p className="text-yellow-100 text-sm">achievements unlocked</p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-yellow-200/30"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="text-white"
                strokeWidth="8"
                strokeDasharray={`${stats.percentage * 2.64} 264`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {stats.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              achievement.unlocked
                ? 'bg-white dark:bg-gray-800 border-yellow-400 shadow-lg'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75'
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg',
                  achievement.unlocked
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                )}
              >
                {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {achievement.description}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-medium">
                      {Math.min(achievement.progress, achievement.requirement)} / {achievement.requirement}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        achievement.unlocked
                          ? 'bg-yellow-500'
                          : 'bg-primary-500'
                      )}
                      style={{
                        width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              {achievement.unlocked && (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
