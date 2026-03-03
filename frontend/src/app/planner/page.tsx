'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { progressApi, quranApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  Calendar,
  BookOpen,
  Target,
  Star,
  Clock,
  AlertTriangle,
  ChevronRight,
  CheckCircle,
  Play,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Surah {
  id: number;
  nameEnglish: string;
  nameArabic: string;
  ayahCount: number;
}

interface RevisionPlan {
  sabaq: number[];
  sabaqPara: number[];
  manzil: number[];
  weakSurahs: { surahId: number; mistakeCount: number }[];
}

export default function PlannerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'sabaq' | 'sabaqPara' | 'manzil' | 'weak'>('sabaq');
  const [customPlan, setCustomPlan] = useState<number[]>([]);
  const [showCustomMode, setShowCustomMode] = useState(false);

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
      const [surahsRes, planRes] = await Promise.all([
        quranApi.getSurahs().catch(() => ({ data: { data: [] } })),
        progressApi.getRevisionPlan?.().catch(() => ({ data: { data: getDefaultPlan() } })),
      ]);
      setSurahs(surahsRes.data.data || []);
      setPlan(planRes.data.data || getDefaultPlan());
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setPlan(getDefaultPlan());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPlan = (): RevisionPlan => ({
    sabaq: [],
    sabaqPara: [],
    manzil: [],
    weakSurahs: [],
  });

  const getSurahName = (surahId: number) => {
    const surah = surahs.find((s) => s.id === surahId);
    return surah ? `${surah.id}. ${surah.nameEnglish}` : `Surah ${surahId}`;
  };

  const startRevision = (type: string, surahIds: number[]) => {
    // Navigate to revision page with pre-selected surahs
    const params = new URLSearchParams({
      type,
      surahs: surahIds.join(','),
    });
    router.push(`/revision?${params.toString()}`);
  };

  const toggleCustomSurah = (surahId: number) => {
    setCustomPlan((prev) =>
      prev.includes(surahId) ? prev.filter((id) => id !== surahId) : [...prev, surahId]
    );
  };

  const tabs = [
    { id: 'sabaq', label: 'Sabaq', icon: Star, description: 'New memorization', count: plan?.sabaq?.length || 0 },
    { id: 'sabaqPara', label: 'Sabaq Para', icon: Clock, description: 'Recent (7 days)', count: plan?.sabaqPara?.length || 0 },
    { id: 'manzil', label: 'Manzil', icon: BookOpen, description: 'Old revision', count: plan?.manzil?.length || 0 },
    { id: 'weak', label: 'Weak', icon: AlertTriangle, description: 'Needs work', count: plan?.weakSurahs?.length || 0 },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentSurahs =
    selectedTab === 'weak'
      ? (plan?.weakSurahs || []).map((w) => w.surahId)
      : plan?.[selectedTab] || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revision Planner</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Plan your daily Hifz revision using the Sabaq-Manzil system
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCustomMode(!showCustomMode)}>
          <Settings className="w-4 h-4 mr-2" />
          Custom
        </Button>
      </div>

      {/* Today's Plan Summary */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mb-6">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <div key={tab.id} className="text-center">
              <p className="text-3xl font-bold">{tab.count}</p>
              <p className="text-sm text-primary-100">{tab.label}</p>
            </div>
          ))}
        </div>
        {currentSurahs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-500">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => startRevision(selectedTab, currentSurahs)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start {tabs.find((t) => t.id === selectedTab)?.label} Revision
            </Button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={cn(
                'p-4 rounded-xl text-left transition-all border-2',
                selectedTab === tab.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className={cn(
                    'w-5 h-5',
                    selectedTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'font-medium',
                    selectedTab === tab.id
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {tab.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tab.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</p>
            </button>
          );
        })}
      </div>

      {/* Surah List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {tabs.find((t) => t.id === selectedTab)?.label} Surahs
          </h3>
        </div>

        {currentSurahs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No surahs in this category yet</p>
            <p className="text-sm mt-2">Complete some revision to populate your plan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {currentSurahs.map((surahId) => {
              const weakInfo = plan?.weakSurahs?.find((w) => w.surahId === surahId);
              return (
                <div
                  key={surahId}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium',
                        selectedTab === 'weak'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : selectedTab === 'sabaq'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {surahId}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getSurahName(surahId)}
                      </p>
                      {weakInfo && (
                        <p className="text-sm text-red-500">{weakInfo.mistakeCount} mistakes</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/quran/${surahId}`}>
                    <Button variant="ghost" size="sm">
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Mode */}
      {showCustomMode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Select Custom Surahs</h3>
              <button
                onClick={() => setShowCustomMode(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {surahs.map((surah) => (
                  <button
                    key={surah.id}
                    onClick={() => toggleCustomSurah(surah.id)}
                    className={cn(
                      'p-2 rounded-lg text-sm text-left transition-colors',
                      customPlan.includes(surah.id)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    {surah.id}. {surah.nameEnglish}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {customPlan.length} surahs selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCustomPlan([])}>
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    startRevision('custom', customPlan);
                    setShowCustomMode(false);
                  }}
                  disabled={customPlan.length === 0}
                >
                  Start Revision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
