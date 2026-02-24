'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { quranApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Search, BookOpen } from 'lucide-react';

interface Surah {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  revelationType: string;
  ayahCount: number;
  pageStart: number;
  pageEnd: number;
}

export default function QuranPage() {
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
      setSurahs(response.data.data || []);
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
      surah.nameArabic.includes(searchQuery) ||
      surah.id.toString() === searchQuery;
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Quran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-2">
              القرآن الكريم
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The Holy Quran • Select a Surah to read
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'meccan', 'medinan'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg transition-colors capitalize',
                    filter === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-white'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Surah Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/quran/${surah.id}`}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow group"
            >
              {/* Surah Number */}
              <div className="w-12 h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-semibold text-lg shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {surah.id}
              </div>

              {/* Surah Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-arabic text-xl text-gray-900 dark:text-white">
                    {surah.nameArabic}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{surah.nameEnglish}</span>
                  <span>•</span>
                  <span>{surah.ayahCount} ayahs</span>
                </div>
              </div>

              {/* Revelation Type Badge */}
              <div className={cn(
                'px-2 py-1 text-xs rounded-full shrink-0',
                surah.revelationType === 'Meccan'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              )}>
                {surah.revelationType}
              </div>
            </Link>
          ))}
        </div>

        {filteredSurahs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No surahs found matching your search.
            </p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Showing {filteredSurahs.length} of {surahs.length} Surahs
          </p>
          <p className="mt-1">
            Total: {surahs.reduce((sum, s) => sum + s.ayahCount, 0)} Ayahs
          </p>
        </div>
      </main>
    </div>
  );
}
