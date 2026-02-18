'use client';

import { useState } from 'react';
import { MushafView } from '@/components/mushaf/MushafView';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { cn } from '@/lib/utils';
import { Book, Headphones, Settings } from 'lucide-react';

export default function QuranPage() {
  const [currentAyahId, setCurrentAyahId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [translationLanguage, setTranslationLanguage] = useState<'urdu' | 'english'>('urdu');
  const [highlightMutashabihat, setHighlightMutashabihat] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Al-Quran</h1>
          <p className="text-gray-600 dark:text-gray-400">Read and listen to the Holy Quran</p>
        </div>

        {/* Settings Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showAudioPlayer
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Headphones className="w-5 h-5" />
          </button>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Show Translation</span>
        </label>

        {showTranslation && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Language:</span>
            <select
              value={translationLanguage}
              onChange={(e) => setTranslationLanguage(e.target.value as 'urdu' | 'english')}
              className="px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="urdu">اردو (Urdu)</option>
              <option value="english">English</option>
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightMutashabihat}
            onChange={(e) => setHighlightMutashabihat(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Highlight Mutashabihat</span>
        </label>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Mushaf View */}
        <div className={cn('flex-1', showAudioPlayer ? 'pr-4' : '')}>
          <MushafView
            initialPage={currentPage}
            showTranslation={showTranslation}
            translationLanguage={translationLanguage}
            highlightMutashabihat={highlightMutashabihat}
          />
        </div>

        {/* Audio Player Sidebar */}
        {showAudioPlayer && (
          <div className="w-80 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4">Audio Player</h3>
              <AudioPlayer
                currentAyahId={currentAyahId || undefined}
                onAyahChange={setCurrentAyahId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Legend for Mutashabihat */}
      {highlightMutashabihat && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Mutashabihat Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500/30 border-b-2 border-green-500 rounded" />
              Exact Repeat (90%+ similarity)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-500/30 border-b-2 border-yellow-500 rounded" />
              Near Repeat (70-90% similarity)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500/20 border-b-2 border-orange-500 rounded" />
              Thematic (related meaning)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
