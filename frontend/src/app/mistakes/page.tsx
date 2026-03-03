'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { progressApi, quranApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  AlertTriangle,
  Filter,
  Calendar,
  BookOpen,
  ChevronRight,
  BarChart3,
  Target,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mistake {
  id: string;
  ayahId: number;
  surahId: number;
  ayahNumber: number;
  mistakeType: 'stutter' | 'wrong_word' | 'forgot' | 'mutashabih_confusion' | 'other';
  notes: string | null;
  sessionId: string | null;
  createdAt: string;
}

interface Surah {
  id: number;
  nameEnglish: string;
  nameArabic: string;
}

const mistakeTypeConfig = {
  stutter: { label: 'Stutter', color: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  wrong_word: { label: 'Wrong Word', color: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  forgot: { label: 'Forgot', color: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  mutashabih_confusion: { label: 'Mutashabih Mix-up', color: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  other: { label: 'Other', color: 'gray', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
};

export default function MistakesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'weak'>('list');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mistakesRes, surahsRes] = await Promise.all([
        progressApi.getMistakes().catch(() => ({ data: { data: [] } })),
        quranApi.getSurahs().catch(() => ({ data: { data: [] } })),
      ]);
      setMistakes(mistakesRes.data.data || []);
      setSurahs(surahsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSurahName = (surahId: number) => {
    const surah = surahs.find((s) => s.id === surahId);
    return surah ? `${surah.id}. ${surah.nameEnglish}` : `Surah ${surahId}`;
  };

  const filterByPeriod = (mistake: Mistake) => {
    const mistakeDate = new Date(mistake.createdAt);
    const now = new Date();

    switch (filterPeriod) {
      case 'today':
        return mistakeDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return mistakeDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return mistakeDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredMistakes = mistakes
    .filter((m) => (filterType ? m.mistakeType === filterType : true))
    .filter(filterByPeriod);

  // Calculate statistics
  const stats = {
    total: mistakes.length,
    byType: Object.entries(mistakeTypeConfig).map(([type, config]) => ({
      type,
      ...config,
      count: mistakes.filter((m) => m.mistakeType === type).length,
    })),
  };

  // Find weak ayahs (multiple mistakes)
  const weakAyahs = Object.entries(
    mistakes.reduce((acc, m) => {
      const key = `${m.surahId}:${m.ayahNumber}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .filter(([_, count]) => count >= 2)
    .map(([key, count]) => {
      const [surahId, ayahNumber] = key.split(':').map(Number);
      return { surahId, ayahNumber, count };
    })
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mistake History</h1>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Mistakes</p>
        </div>
        {stats.byType.map((type) => (
          <div
            key={type.type}
            className={cn('rounded-xl p-4', type.bg)}
          >
            <p className={cn('text-2xl font-bold', type.text)}>{type.count}</p>
            <p className={cn('text-sm', type.text)}>{type.label}</p>
          </div>
        ))}
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            All Mistakes
          </button>
          <button
            onClick={() => setViewMode('weak')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'weak'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            Weak Ayahs
          </button>
        </div>

        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>

        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
        >
          <option value="">All Types</option>
          {Object.entries(mistakeTypeConfig).map(([type, config]) => (
            <option key={type} value={type}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {viewMode === 'weak' ? (
        // Weak Ayahs View
        <div className="space-y-4">
          {weakAyahs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <Target className="w-12 h-12 mx-auto text-green-300 dark:text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Weak Ayahs
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You haven&apos;t made multiple mistakes on any ayah. Keep up the good work!
              </p>
            </div>
          ) : (
            weakAyahs.map((ayah) => {
              const config = Object.values(mistakeTypeConfig).find((c) =>
                mistakes.find(
                  (m) => m.surahId === ayah.surahId && m.ayahNumber === ayah.ayahNumber
                )?.mistakeType
              );
              return (
                <div
                  key={`${ayah.surahId}-${ayah.ayahNumber}`}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getSurahName(ayah.surahId)} - Ayah {ayah.ayahNumber}
                        </p>
                        <p className="text-sm text-red-500">
                          {ayah.count} mistakes logged
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/quran/${ayah.surahId}?ayah=${ayah.ayahNumber}`}>
                        <Button variant="outline" size="sm">
                          Review
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No mistakes found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filterType || filterPeriod !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Great job! Keep up the good work.'}
              </p>
            </div>
          ) : (
            filteredMistakes.map((mistake) => {
              const config = mistakeTypeConfig[mistake.mistakeType];
              return (
                <div
                  key={mistake.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                        <AlertTriangle className={cn('w-5 h-5', config.text)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getSurahName(mistake.surahId)} - Ayah {mistake.ayahNumber}
                          </p>
                          <span className={cn('px-2 py-0.5 text-xs rounded-full', config.bg, config.text)}>
                            {config.label}
                          </span>
                        </div>
                        {mistake.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {mistake.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(mistake.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Ayah ID: {mistake.ayahId}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/quran/${mistake.surahId}?ayah=${mistake.ayahNumber}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
