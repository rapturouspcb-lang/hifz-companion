'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';
import { progressApi, quranApi } from '@/lib/api';
import {
  Book,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flag,
  Lightbulb,
  Play,
  Square,
  Target,
  Brain,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textUrdu?: string;
}

interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
}

interface MistakeLog {
  ayahId: number;
  mistakeType: 'stutter' | 'wrong_word' | 'forgot' | 'mutashabih_confusion' | 'other';
}

type RevisionType = 'sabaq' | 'sabaq_para' | 'manzil' | 'weak' | 'custom';
type HideMode = 'none' | 'first_letter' | 'progressive' | 'full';
type MarkType = 'correct' | 'incorrect' | 'partial';

const revisionTypes = [
  { value: 'sabaq', label: 'Sabaq', description: 'Newly memorized', icon: Star },
  { value: 'sabaq_para', label: 'Sabaq Para', description: 'Recent (last 7 days)', icon: Clock },
  { value: 'manzil', label: 'Manzil', description: 'Old revision', icon: Book },
  { value: 'weak', label: 'Weak Surahs', description: 'Needs improvement', icon: Target },
  { value: 'custom', label: 'Custom', description: 'Select manually', icon: Brain },
];

const mistakeTypes = [
  { value: 'stutter', label: 'Stutter', color: 'yellow' },
  { value: 'wrong_word', label: 'Wrong Word', color: 'orange' },
  { value: 'forgot', label: 'Forgot', color: 'red' },
  { value: 'mutashabih_confusion', label: 'Mutashabih Mix-up', color: 'purple' },
  { value: 'other', label: 'Other', color: 'gray' },
];

export default function RevisionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Session state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Revision setup state
  const [revisionType, setRevisionType] = useState<RevisionType>('sabaq');
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ayah state
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [hideMode, setHideMode] = useState<HideMode>('none');
  const [showTranslation, setShowTranslation] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wordRevealCount, setWordRevealCount] = useState(0);

  // Marking state
  const [marks, setMarks] = useState<Record<number, MarkType>>({});
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [showMistakeModal, setShowMistakeModal] = useState(false);
  const [selectedMistakeType, setSelectedMistakeType] = useState<string>('forgot');

  // Session summary
  const [sessionStats, setSessionStats] = useState({
    totalAyahs: 0,
    correct: 0,
    incorrect: 0,
    partial: 0,
    mistakes: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Load surahs on mount
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const response = await quranApi.getSurahs();
        setSurahs(response.data.data);
      } catch (error) {
        console.error('Failed to load surahs:', error);
      }
    };
    loadSurahs();
  }, []);

  const startRevision = async () => {
    setIsLoading(true);
    try {
      // Start revision session
      const sessionResponse = await progressApi.startRevision({
        revisionType,
        surahIds: selectedSurahs,
      });
      setSessionId(sessionResponse.data.data.sessionId);

      // Load ayahs for selected surahs
      if (selectedSurahs.length > 0) {
        const surahId = selectedSurahs[0]; // For simplicity, start with first surah
        const ayahsResponse = await quranApi.getSurahAyahs(surahId);
        setAyahs(ayahsResponse.data.data);
      }

      setSessionStarted(true);
      setSessionEnded(false);
      setMarks({});
      setMistakes([]);
      setCurrentAyahIndex(0);
    } catch (error) {
      console.error('Failed to start revision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endRevision = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Calculate stats
      const stats = {
        totalAyahs: ayahs.length,
        correct: Object.values(marks).filter((m) => m === 'correct').length,
        incorrect: Object.values(marks).filter((m) => m === 'incorrect').length,
        partial: Object.values(marks).filter((m) => m === 'partial').length,
        mistakes: mistakes.length,
      };
      setSessionStats(stats);

      // Log all mistakes
      for (const mistake of mistakes) {
        await progressApi.logMistake({
          ayahId: mistake.ayahId,
          mistakeType: mistake.mistakeType,
          sessionId,
        });
      }

      // End session
      await progressApi.endRevision(sessionId, {
        pagesCovered: ayahs.length / 15, // Rough estimate
        mistakesLogged: mistakes.length,
      });

      setSessionEnded(true);
      setSessionStarted(false);
    } catch (error) {
      console.error('Failed to end revision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAyah = (mark: MarkType) => {
    const currentAyah = ayahs[currentAyahIndex];
    if (!currentAyah) return;

    setMarks((prev) => ({ ...prev, [currentAyah.id]: mark }));
    goToNextAyah();
  };

  const logMistake = (mistakeType: string) => {
    const currentAyah = ayahs[currentAyahIndex];
    if (!currentAyah) return;

    setMistakes((prev) => [
      ...prev,
      { ayahId: currentAyah.id, mistakeType: mistakeType as MistakeLog['mistakeType'] },
    ]);
    setShowMistakeModal(false);
  };

  const goToNextAyah = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
      setRevealed(false);
      setWordRevealCount(0);
    }
  };

  const goToPrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
      setRevealed(false);
      setWordRevealCount(0);
    }
  };

  const resetRevision = () => {
    setSessionStarted(false);
    setSessionEnded(false);
    setSessionId(null);
    setCurrentAyahIndex(0);
    setMarks({});
    setMistakes([]);
    setAyahs([]);
    setRevealed(false);
    setWordRevealCount(0);
  };

  const processAyahText = useCallback(
    (text: string): string => {
      if (hideMode === 'none' || revealed) {
        return text;
      }

      const words = text.split(' ');

      if (hideMode === 'full') {
        return words.map(() => '＿').join(' ');
      }

      if (hideMode === 'first_letter') {
        return words
          .map((word) => {
            const cleanWord = word.replace(/[^\u0600-\u06FF]/g, '');
            if (cleanWord.length === 0) return word;
            return cleanWord[0] + '﹏'.repeat(Math.max(0, cleanWord.length - 1));
          })
          .join(' ');
      }

      if (hideMode === 'progressive') {
        return words
          .map((word, index) => {
            if (index < wordRevealCount) return word;
            const cleanWord = word.replace(/[^\u0600-\u06FF]/g, '');
            if (cleanWord.length === 0) return word;
            return cleanWord[0] + '﹏'.repeat(Math.max(0, cleanWord.length - 1));
          })
          .join(' ');
      }

      return text;
    },
    [hideMode, revealed, wordRevealCount]
  );

  const revealMore = () => {
    const currentAyah = ayahs[currentAyahIndex];
    if (!currentAyah) return;

    const wordCount = currentAyah.textArabic.split(' ').length;
    if (wordRevealCount < wordCount) {
      setWordRevealCount((prev) => prev + 1);
    } else {
      setRevealed(true);
    }
  };

  // Selection view
  if (!sessionStarted && !sessionEnded) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Start Revision Session
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose your revision type and select surahs to revise
        </p>

        {/* Revision Type Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revision Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revisionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setRevisionType(type.value as RevisionType)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    revisionType === type.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        revisionType === type.value
                          ? 'text-primary-600'
                          : 'text-gray-400'
                      )}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Surah Selection (for custom) */}
        {revisionType === 'custom' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Surahs
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-xl">
              {surahs.map((surah) => (
                <button
                  key={surah.id}
                  onClick={() => {
                    setSelectedSurahs((prev) =>
                      prev.includes(surah.id)
                        ? prev.filter((id) => id !== surah.id)
                        : [...prev, surah.id]
                    );
                  }}
                  className={cn(
                    'p-2 rounded-lg text-sm transition-all',
                    selectedSurahs.includes(surah.id)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {surah.id}. {surah.nameEnglish}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Selected: {selectedSurahs.length} surah(s)
            </p>
          </div>
        )}

        {/* Start Button */}
        <Button
          size="lg"
          onClick={startRevision}
          isLoading={isLoading}
          disabled={revisionType === 'custom' && selectedSurahs.length === 0}
        >
          <Play className="w-5 h-5 mr-2" />
          Start Revision
        </Button>
      </div>
    );
  }

  // Session ended - Summary view
  if (sessionEnded) {
    const percentage = Math.round(
      ((sessionStats.correct + sessionStats.partial * 0.5) / sessionStats.totalAyahs) * 100
    );

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Revision Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Great job completing your revision session
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {sessionStats.totalAyahs}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Ayahs</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-3xl font-bold text-primary-600">{percentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-600">{sessionStats.correct}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correct</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <p className="text-3xl font-bold text-red-600">{sessionStats.mistakes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mistakes</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={resetRevision}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Session
            </Button>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Active revision session
  const currentAyah = ayahs[currentAyahIndex];
  const progress = ayahs.length > 0 ? ((currentAyahIndex + 1) / ayahs.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Ayah {currentAyahIndex + 1} of {ayahs.length}
              </span>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={endRevision}>
              <Square className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {currentAyah && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {/* Ayah Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Surah {currentAyah.surahId}, Ayah {currentAyah.ayahNumber}
              </span>
              <div className="flex items-center gap-2">
                {/* Hide Mode Selector */}
                <select
                  value={hideMode}
                  onChange={(e) => setHideMode(e.target.value as HideMode)}
                  className="text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1.5"
                >
                  <option value="none">Show All</option>
                  <option value="first_letter">First Letter</option>
                  <option value="progressive">Progressive</option>
                  <option value="full">Full Hide</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Arabic Text */}
            <div className="mb-6">
              <p
                dir="rtl"
                className="text-3xl md:text-4xl font-arabic leading-loose text-gray-900 dark:text-white"
              >
                {processAyahText(currentAyah.textArabic)}
              </p>
            </div>

            {/* Translation */}
            {showTranslation && currentAyah.textUrdu && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-lg text-gray-700 dark:text-gray-300" dir="rtl">
                  {currentAyah.textUrdu}
                </p>
              </div>
            )}

            {/* Reveal Controls */}
            {hideMode !== 'none' && !revealed && (
              <div className="flex justify-center gap-4 mb-8">
                {hideMode === 'progressive' && (
                  <Button variant="outline" onClick={revealMore}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Reveal Word
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setRevealed(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Full Ayah
                </Button>
              </div>
            )}

            {/* Navigation & Marking */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={goToPrevAyah} disabled={currentAyahIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => markAyah('correct')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Correct
                </Button>
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => markAyah('partial')}
                >
                  Partial
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => setShowMistakeModal(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Incorrect
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={goToNextAyah}
                disabled={currentAyahIndex === ayahs.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mistake Modal */}
      {showMistakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Log Mistake
            </h3>
            <div className="space-y-2 mb-6">
              {mistakeTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    logMistake(type.value);
                    markAyah('incorrect');
                  }}
                  className="w-full p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowMistakeModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
