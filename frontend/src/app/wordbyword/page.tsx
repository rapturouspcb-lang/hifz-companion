'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { Button } from '@/components/common/Button';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Word {
  arabic: string;
  urdu?: string;
  english?: string;
  root?: string;
}

interface AyahWords {
  surahId: number;
  ayahNumber: number;
  ayahId: number;
  words: Word[];
}

function WordByWordContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const initialSurah = parseInt((params?.id as string) || '1');
  const initialAyah = parseInt(searchParams?.get('ayah') || '1');

  const [surahId, setSurahId] = useState(initialSurah);
  const [ayahNumber, setAyahNumber] = useState(initialAyah);
  const [ayahWords, setAyahWords] = useState<AyahWords | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [language, setLanguage] = useState<'urdu' | 'english'>('urdu');
  const [highlightedWord, setHighlightedWord] = useState<number | null>(null);
  const [surahInfo, setSurahInfo] = useState<{ ayahCount: number } | null>(null);

  useEffect(() => {
    fetchAyahWords();
  }, [surahId, ayahNumber]);

  const fetchAyahWords = async () => {
    setLoading(true);
    try {
      const [surahRes, ayahsRes] = await Promise.all([
        quranApi.getSurah(surahId),
        quranApi.getSurahAyahs(surahId),
      ]);

      setSurahInfo(surahRes.data.data);

      const ayahs = ayahsRes.data.data;
      const currentAyah = ayahs.find((a: any) => a.ayahNumber === ayahNumber);

      if (currentAyah) {
        const words = splitIntoWords(currentAyah.textArabic, currentAyah.textUrdu);
        setAyahWords({
          surahId,
          ayahNumber,
          ayahId: currentAyah.id,
          words,
        });
      }
    } catch (error) {
      console.error('Failed to fetch ayah words:', error);
    } finally {
      setLoading(false);
    }
  };

  const splitIntoWords = (arabic: string, urdu?: string): Word[] => {
    const arabicWords = arabic.split(/\s+/).filter((w) => w);
    const urduWords = urdu?.split(/\s+/).filter((w) => w) || [];

    return arabicWords.map((arabic, index) => ({
      arabic,
      urdu: urduWords[index] || '',
      english: '',
    }));
  };

  const goToNextAyah = () => {
    if (surahInfo && ayahNumber < surahInfo.ayahCount) {
      setAyahNumber((prev) => prev + 1);
      setHighlightedWord(null);
    }
  };

  const goToPrevAyah = () => {
    if (ayahNumber > 1) {
      setAyahNumber((prev) => prev - 1);
      setHighlightedWord(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex flex-wrap gap-4 justify-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Word-by-Word Translation
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTranslation ? 'Hide' : 'Show'}
          </Button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'urdu' | 'english')}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="urdu">اردو</option>
            <option value="english">English</option>
          </select>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Surah {surahId}</p>
          <p className="font-medium text-gray-900 dark:text-white">Ayah {ayahNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToPrevAyah} disabled={ayahNumber === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {ayahNumber} / {surahInfo?.ayahCount || 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextAyah}
            disabled={!surahInfo || ayahNumber >= surahInfo.ayahCount}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Full Ayah Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <p className="text-2xl text-gray-900 dark:text-white text-right leading-loose" dir="rtl">
          {ayahWords?.words.map((w) => w.arabic).join(' ')}
        </p>
      </div>

      {/* Word-by-Word Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Word Analysis
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {ayahWords?.words.map((word, index) => (
            <button
              key={index}
              onClick={() => setHighlightedWord(highlightedWord === index ? null : index)}
              className={cn(
                'flex flex-col items-center p-4 rounded-xl transition-all min-w-[80px] border-2',
                highlightedWord === index
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              )}
            >
              <span className="text-xl text-gray-900 dark:text-white mb-2" dir="rtl">
                {word.arabic}
              </span>
              {showTranslation && (
                <span
                  className="text-sm text-gray-600 dark:text-gray-400 text-center"
                  dir={language === 'urdu' ? 'rtl' : 'ltr'}
                >
                  {language === 'urdu' ? word.urdu : word.english || '—'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Word Detail */}
        {highlightedWord !== null && ayahWords?.words[highlightedWord] && (
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Arabic</p>
                <p className="text-2xl text-gray-900 dark:text-white" dir="rtl">
                  {ayahWords.words[highlightedWord].arabic}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'urdu' ? 'Urdu Translation' : 'English Translation'}
                </p>
                <p className="text-lg text-gray-900 dark:text-white" dir={language === 'urdu' ? 'rtl' : 'ltr'}>
                  {language === 'urdu'
                    ? ayahWords.words[highlightedWord].urdu || 'Translation not available'
                    : ayahWords.words[highlightedWord].english || 'Translation not available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Click on any word to see its translation details
      </p>
    </div>
  );
}

export default function WordByWordPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      }
    >
      <WordByWordContent />
    </Suspense>
  );
}
