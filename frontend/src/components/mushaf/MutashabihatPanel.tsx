'use client';

import { useState, useEffect } from 'react';
import { mutashabihatApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { X, ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface SimilarAyah {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  surahName: string;
}

interface Mutashabihat {
  ayahId: number;
  similarAyah: SimilarAyah;
  similarityScore: number;
  similarityType: string;
  diffData: {
    words1: string[];
    words2: string[];
    diff: Array<{
      type: 'equal' | 'add' | 'remove' | 'change';
      value: string;
    }>;
  } | null;
}

interface MutashabihatPanelProps {
  ayahId: number;
  mutashabihat: Mutashabihat[];
  onClose: () => void;
  onNavigate?: (ayahId: number) => void;
}

export function MutashabihatPanel({
  ayahId,
  mutashabihat,
  onClose,
  onNavigate,
}: MutashabihatPanelProps) {
  const [selectedComparison, setSelectedComparison] = useState<Mutashabihat | null>(null);
  const [detailedComparison, setDetailedComparison] = useState<any>(null);

  useEffect(() => {
    if (mutashabihat.length > 0 && !selectedComparison) {
      setSelectedComparison(mutashabihat[0]);
    }
  }, [mutashabihat, selectedComparison]);

  useEffect(() => {
    if (selectedComparison) {
      fetchDetailedComparison();
    }
  }, [selectedComparison]);

  const fetchDetailedComparison = async () => {
    if (!selectedComparison) return;
    try {
      const response = await mutashabihatApi.compare(
        ayahId,
        selectedComparison.similarAyah.id
      );
      setDetailedComparison(response.data.data.comparison);
    } catch (error) {
      console.error('Failed to fetch comparison:', error);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      exact_repeat: 'Exact Repeat',
      near_repeat: 'Near Repeat',
      thematic: 'Thematic',
      structural: 'Structural',
    };
    return labels[type] || type;
  };

  const renderDiff = () => {
    if (!detailedComparison?.diffData) return null;

    const { diff } = detailedComparison.diffData;

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="text-sm font-semibold mb-3">Word-by-Word Comparison</h4>
        <div className="flex gap-4">
          {/* Original Ayah */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-2">Original</p>
            <div className="arabic-text text-lg leading-loose flex flex-wrap gap-1" dir="rtl">
              {diff.map((item: any, idx: number) => (
                <span
                  key={idx}
                  className={cn(
                    'px-1 rounded',
                    item.type === 'equal' && 'diff-equal',
                    item.type === 'remove' && 'diff-removed',
                    item.type === 'change' && 'diff-changed'
                  )}
                >
                  {item.value}
                </span>
              ))}
            </div>
          </div>

          {/* Similar Ayah */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-2">Similar</p>
            <div className="arabic-text text-lg leading-loose flex flex-wrap gap-1" dir="rtl">
              {diff.map((item: any, idx: number) => (
                <span
                  key={idx}
                  className={cn(
                    'px-1 rounded',
                    item.type === 'equal' && 'diff-equal',
                    item.type === 'add' && 'diff-added',
                    item.type === 'change' && 'diff-changed'
                  )}
                >
                  {item.type === 'remove' ? '' : item.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-200 rounded" /> Identical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-200 rounded" /> Removed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-300 rounded" /> Added
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-200 rounded" /> Changed
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold">Mutashabihat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Similar Verses List */}
      <div className="max-h-64 overflow-y-auto border-b dark:border-gray-700">
        {mutashabihat.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No similar verses found
          </div>
        ) : (
          mutashabihat.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedComparison(m)}
              className={cn(
                'w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                selectedComparison?.similarAyah.id === m.similarAyah.id &&
                  'bg-primary-50 dark:bg-primary-900/20'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {m.similarAyah.surahName} {m.similarAyah.ayahNumber}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    getSimilarityColor(m.similarityScore)
                  )}
                >
                  {(m.similarityScore * 100).toFixed(0)}%
                </span>
              </div>
              <p className="arabic-text text-sm text-gray-600 dark:text-gray-400 truncate" dir="rtl">
                {m.similarAyah.textArabic}
              </p>
              <span className="text-xs text-gray-400">{getTypeLabel(m.similarityType)}</span>
            </button>
          ))
        )}
      </div>

      {/* Selected Comparison Details */}
      {selectedComparison && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">
              {selectedComparison.similarAyah.surahName}:{selectedComparison.similarAyah.ayahNumber}
            </h4>
            {onNavigate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigate(selectedComparison.similarAyah.id)}
              >
                Go to Ayah
              </Button>
            )}
          </div>

          <div className="arabic-text text-lg p-4 bg-mushaf-bg rounded-lg border border-mushaf-border" dir="rtl">
            {selectedComparison.similarAyah.textArabic}
          </div>

          {renderDiff()}
        </div>
      )}
    </div>
  );
}
