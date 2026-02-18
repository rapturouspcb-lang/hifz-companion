'use client';

import Link from 'next/link';
import { quranApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  revelationType: string;
  ayahCount: number;
}

export function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await quranApi.getSurahs();
      setSurahs(response.data.data.surahs);
    } catch (error) {
      console.error('Failed to fetch surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = surahs.filter((surah) => {
    const matchesFilter = filter === 'all' ||
      surah.revelationType.toLowerCase() === filter;
    const matchesSearch = searchQuery === '' ||
      surah.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.nameArabic.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search surah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
        <div className="flex gap-2">
          {(['all', 'meccan', 'medinan'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'px-4 py-2 text-sm rounded-lg transition-colors capitalize',
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Surah Grid */}
      <div className="grid gap-2">
        {filteredSurahs.slice(0, 10).map((surah) => (
          <Link
            key={surah.id}
            href={`/quran/${surah.id}`}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-semibold">
                {surah.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arabic text-lg">{surah.nameArabic}</span>
                  <span className="font-medium">{surah.nameEnglish}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {surah.ayahCount} ayahs • {surah.revelationType}
                </div>
              </div>
            </div>
            <div className="font-arabic text-2xl text-gray-300">
              {surah.nameArabic.charAt(0)}
            </div>
          </Link>
        ))}
      </div>

      {filteredSurahs.length > 10 && (
        <Link
          href="/quran"
          className="block text-center text-primary-600 hover:text-primary-700 mt-4"
        >
          View all {filteredSurahs.length} surahs
        </Link>
      )}
    </div>
  );
}
