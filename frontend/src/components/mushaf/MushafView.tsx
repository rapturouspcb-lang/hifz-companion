'use client';

import { useState, useEffect, useCallback } from 'react';
import { quranApi, mutashabihatApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Bookmark, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { MutashabihatPanel } from './MutashabihatPanel';

interface Ayah {
  id: number;
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
  juzNumber: number;
  textArabic: string;
  textUrdu?: string;
  textEnglish?: string;
  surah?: {
    id: number;
    nameEnglish: string;
    nameArabic: string;
  };
}

interface Mutashabihat {
  ayahId: number;
  similarAyah: {
    id: number;
    surahId: number;
    ayahNumber: number;
    textArabic: string;
    surahName: string;
  };
  similarityScore: number;
  similarityType: string;
  diffData: any;
}

interface MushafViewProps {
  initialPage?: number;
  showTranslation?: boolean;
  translationLanguage?: 'urdu' | 'english';
  highlightMutashabihat?: boolean;
}

export function MushafView({
  initialPage = 1,
  showTranslation = true,
  translationLanguage = 'urdu',
  highlightMutashabihat = true,
}: MushafViewProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutashabihatMap, setMutashabihatMap] = useState<Map<number, Mutashabihat[]>>(new Map());
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [showMutashabihatPanel, setShowMutashabihatPanel] = useState(false);

  const fetchPage = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await quranApi.getPage(pageNumber);
      const pageData = response.data.data;
      setAyahs(pageData.ayahs || []);

      // Fetch mutashabihat for each ayah if highlighting is enabled
      if (highlightMutashabihat) {
        const mutashabihatPromises = pageData.ayahs?.map(async (ayah: Ayah) => {
          try {
            const mutRes = await mutashabihatApi.getForAyah(ayah.id);
            return { ayahId: ayah.id, mutashabihat: mutRes.data.data.mutashabihat };
          } catch {
            return { ayahId: ayah.id, mutashabihat: [] };
          }
        }) || [];

        const results = await Promise.all(mutashabihatPromises);
        const newMap = new Map<number, Mutashabihat[]>();
        results.forEach(({ ayahId, mutashabihat }) => {
          if (mutashabihat.length > 0) {
            newMap.set(ayahId, mutashabihat);
          }
        });
        setMutashabihatMap(newMap);
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  }, [highlightMutashabihat]);

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= 604) {
      setCurrentPage(pageNumber);
      setSelectedAyah(null);
    }
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleAyahClick = (ayahId: number) => {
    if (mutashabihatMap.has(ayahId)) {
      setSelectedAyah(ayahId);
      setShowMutashabihatPanel(true);
    }
  };

  const getMutashabihatClass = (ayahId: number): string => {
    if (!highlightMutashabihat || !mutashabihatMap.has(ayahId)) return '';

    const mutashabihat = mutashabihatMap.get(ayahId)!;
    const highestScore = Math.max(...mutashabihat.map(m => m.similarityScore));

    if (highestScore >= 0.9) return 'mutashabihat-highlight exact';
    if (highestScore >= 0.7) return 'mutashabihat-highlight near';
    return 'mutashabihat-highlight thematic';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Mushaf View */}
      <div className="flex-1">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of 604
            </span>
            <input
              type="number"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value, 10))}
              className="w-20 px-3 py-1 text-center border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= 604}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Mushaf Page */}
        <div className="mushaf-page rounded-lg p-8 min-h-[800px]">
          <div className="arabic-text text-arabic-lg">
            {ayahs.map((ayah) => {
              const mutashabihatClass = getMutashabihatClass(ayah.id);
              const surahHeader = ayah.ayahNumber === 1 && (
                <div key={`surah-header-${ayah.id}`} className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-mushaf-accent mb-2">
                    {ayah.surah?.nameArabic}
                  </h3>
                  <p className="text-sm text-gray-600">{ayah.surah?.nameEnglish}</p>
                </div>
              );

              return (
                <span key={ayah.id}>
                  {surahHeader}
                  <span
                    className={cn(
                      'ayah-text cursor-pointer inline',
                      mutashabihatClass,
                      selectedAyah === ayah.id && 'ring-2 ring-primary-500 rounded'
                    )}
                    onClick={() => handleAyahClick(ayah.id)}
                  >
                    {ayah.textArabic}
                    <span className="ayah-number inline-flex items-center justify-center w-6 h-6 mx-1 text-xs font-sans bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                      {ayah.ayahNumber}
                    </span>
                  </span>
                  {' '}

                  {/* Translation below ayah */}
                  {showTranslation && (
                    <div className="urdu-text text-sm text-gray-600 dark:text-gray-400 mb-4 mt-1">
                      {translationLanguage === 'urdu' ? ayah.textUrdu : ayah.textEnglish}
                    </div>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-1">
            {[currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
              .filter(p => p >= 1 && p <= 604)
              .map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={cn(
                    'w-8 h-8 text-sm rounded',
                    p === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {p}
                </button>
              ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= 604}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mutashabihat Side Panel */}
      {showMutashabihatPanel && selectedAyah && (
        <MutashabihatPanel
          ayahId={selectedAyah}
          mutashabihat={mutashabihatMap.get(selectedAyah) || []}
          onClose={() => {
            setShowMutashabihatPanel(false);
            setSelectedAyah(null);
          }}
        />
      )}
    </div>
  );
}
