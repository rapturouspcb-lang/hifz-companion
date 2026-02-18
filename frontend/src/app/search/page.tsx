'use client';

import { useState } from 'react';
import { searchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Search, Mic, X } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface SearchResult {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textUrdu?: string;
  surahName?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'arabic' | 'translation'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([
    'sabr', 'jannah', 'jahannam', 'salah', 'parents', 'knowledge'
  ]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchApi.search(searchQuery, searchType);
      setResults(response.data.data.ayahs);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSearch = async (topic: string) => {
    setQuery(topic);
    setLoading(true);
    try {
      const response = await searchApi.searchByTopic(topic);
      setResults(response.data.data.ayahs);
    } catch (error) {
      console.error('Topic search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Quran</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by Arabic text, meaning, or topic..."
              className="w-full pl-12 pr-12 py-4 text-lg border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dir="auto"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <Button
            size="lg"
            onClick={() => handleSearch()}
            isLoading={loading}
          >
            Search
          </Button>
        </div>

        {/* Search Type Selector */}
        <div className="flex gap-2 mt-3">
          {(['all', 'arabic', 'translation'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-full capitalize transition-colors',
                searchType === type
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Quick Links */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Topics</h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicSearch(topic)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 capitalize transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Found {results.length} results
            </p>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-600">
                      {result.surahName} {result.ayahNumber}
                    </span>
                    <span className="text-xs text-gray-400">
                      Ayah #{result.id}
                    </span>
                  </div>
                  <p className="arabic-text text-xl mb-3" dir="rtl">
                    {result.textArabic}
                  </p>
                  {result.textUrdu && (
                    <p className="urdu-text text-gray-600 dark:text-gray-400" dir="rtl">
                      {result.textUrdu}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results found for &quot;{query}&quot;</p>
            <p className="text-sm mt-2">Try different keywords or search by topic</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
