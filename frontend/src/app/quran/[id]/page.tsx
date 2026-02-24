'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { quranApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  textArabic: string;
  textArabicSimple?: string;
  textUrdu?: string;
  textEnglish?: string;
  wordCount?: number;
}

interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  revelationType: string;
  ayahCount: number;
  pageStart: number;
  pageEnd: number;
  juzList: number[];
}

interface SurahPageProps {
  params: { id: string };
}

export default function SurahPage() {
  const params = useParams();
  const router = useRouter();
  const surahId = parseInt(params.id as string, 10);

  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [surahRes, ayahsRes] = await Promise.all([
        quranApi.getSurah(surahId),
        quranApi.getSurahAyahs(surahId),
      ]);
      setSurah(surahRes.data.data);
      setAyahs(ayahsRes.data.data.ayahs);
    } catch (error) {
      console.error('Failed to fetch surah data:', error);
    } finally {
      setLoading(false);
    }
  }, [surahId]);

  useEffect(() => {
    fetchData();
    setHighlightedAyah(null);
  }, [fetchData]);

  const goToSurah = (id: number) => {
    if (id >= 1 && id <= 114) {
      router.push(`/quran/${id}`);
    }
  };

  const goToPrevSurah = () => goToSurah(surahId - 1);
  const goToNextSurah = () => goToSurah(surahId + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading surah...</p>
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Surah not found</p>
          <Link href="/quran" className="text-primary-600 hover:text-primary-700">
            Return to Quran
          </Link>
        </div>
      </div>
    );
  }

  // Group ayahs into lines (13-line mushaf style - approximately 4-5 words per line)
  const lines: Ayah[][] = [];
  let currentLine: Ayah[] = [];
  let currentWordCount = 0;
  const WORDS_PER_LINE = 12; // Approximate for 13-line layout

  ayahs.forEach((ayah) => {
    const ayahWords = ayah.wordCount || ayah.textArabic.split(' ').length;

    if (currentWordCount + ayahWords > WORDS_PER_LINE && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [ayah];
      currentWordCount = ayahWords;
    } else {
      currentLine.push(ayah);
      currentWordCount += ayahWords;
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href="/quran"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Home className="w-5 h-5" />
              </Link>
              {surahId > 1 && (
                <button
                  onClick={goToPrevSurah}
                  className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
              )}
            </div>

            {/* Surah Title */}
            <div className="text-center">
              <h1 className="text-2xl font-arabic font-bold text-primary-700 dark:text-primary-300">
                {surah.nameArabic}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {surah.nameEnglish} • {surah.ayahCount} Ayahs • {surah.revelationType}
              </p>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                {showTranslation ? 'Hide' : 'Show'} Translation
              </button>
              {surahId < 114 && (
                <button
                  onClick={goToNextSurah}
                  className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mushaf Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Bismillah (except Surah At-Tawbah) */}
        {surahId !== 9 && surahId !== 1 && (
          <div className="text-center mb-8 py-4">
            <p className="text-3xl font-arabic text-primary-700 dark:text-primary-300">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* 13-Line Mushaf Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="space-y-1">
            {lines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className="flex flex-wrap items-baseline justify-center gap-1 leading-loose min-h-[2.5rem]"
              >
                {line.map((ayah) => (
                  <span
                    key={ayah.id}
                    onClick={() => setHighlightedAyah(highlightedAyah === ayah.id ? null : ayah.id)}
                    className={cn(
                      'cursor-pointer transition-all duration-200 rounded px-1',
                      highlightedAyah === ayah.id && 'bg-primary-100 dark:bg-primary-900/30'
                    )}
                  >
                    {/* Ayah Text */}
                    <span className="text-xl md:text-2xl font-arabic text-gray-900 dark:text-gray-100">
                      {ayah.textArabic}
                    </span>
                    {/* Ayah Number */}
                    <span className="inline-flex items-center justify-center mx-1 text-xs font-sans bg-primary-600 text-white rounded-full w-5 h-5">
                      {ayah.ayahNumber}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Urdu Translation Section */}
        {showTranslation && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-4 text-center">Urdu Translation</h2>
            <div className="space-y-4 text-right" dir="rtl">
              {ayahs.map((ayah) => (
                <div
                  key={ayah.id}
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    highlightedAyah === ayah.id && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <span className="text-sm text-primary-600 dark:text-primary-400 ml-2">
                    {ayah.ayahNumber}.
                  </span>
                  <span className="text-lg urdu-text text-gray-700 dark:text-gray-300">
                    {ayah.textUrdu || 'Translation not available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {surahId > 1 ? (
            <button
              onClick={goToPrevSurah}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous Surah</span>
            </button>
          ) : (
            <div />
          )}

          {surahId < 114 && (
            <button
              onClick={goToNextSurah}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span>Next Surah</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
