'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { searchApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Search, Mic, MicOff, X, Volume2, AlertCircle } from 'lucide-react';
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
  const [topics] = useState<string[]>([
    'sabr', 'jannah', 'jahannam', 'salah', 'parents', 'knowledge'
  ]);

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA'; // Arabic Saudi Arabia

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);

        if (event.results[0].isFinal) {
          handleSearch(transcript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        switch (event.error) {
          case 'not-allowed':
            setVoiceError('Microphone access denied. Please allow microphone access.');
            break;
          case 'no-speech':
            setVoiceError('No speech detected. Please try again.');
            break;
          case 'network':
            setVoiceError('Network error. Please check your connection.');
            break;
          default:
            setVoiceError('Voice recognition failed. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setVoiceError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        setVoiceError('Failed to start voice recognition. Please try again.');
      }
    }
  }, [isListening]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchApi.search(searchQuery, searchType);
      setResults(response.data.data.ayahs || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSearch = async (topic: string) => {
    setQuery(topic);
    setLoading(true);
    try {
      const response = await searchApi.searchByTopic(topic);
      setResults(response.data.data.ayahs || []);
    } catch (error) {
      console.error('Topic search failed:', error);
      setResults([]);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Quran</h1>

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
              className="w-full pl-12 pr-24 py-4 text-lg border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              dir="auto"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              {/* Voice Search Button */}
              {voiceSupported && (
                <button
                  onClick={toggleVoiceSearch}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isListening
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600'
                  )}
                  title={isListening ? 'Stop listening' : 'Voice search (Arabic)'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => handleSearch()}
            isLoading={loading}
            className="hidden sm:flex"
          >
            Search
          </Button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-primary-700 dark:text-primary-400">
              Listening... Recite an ayah in Arabic
            </span>
          </div>
        )}

        {/* Voice Error */}
        {voiceError && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-400">{voiceError}</span>
            <button
              onClick={() => setVoiceError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Type Selector */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {(['all', 'arabic', 'translation'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-full capitalize transition-colors whitespace-nowrap',
                searchType === type
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
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
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Popular Topics</h3>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/quran/${result.surahId}?ayah=${result.ayahNumber}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {result.surahName} - Ayah {result.ayahNumber}
                    </span>
                  </div>
                  <p className="text-xl leading-relaxed text-gray-900 dark:text-white mb-3" dir="rtl">
                    {result.textArabic}
                  </p>
                  {result.textUrdu && (
                    <p className="text-gray-600 dark:text-gray-400" dir="rtl">
                      {result.textUrdu}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No results found</p>
            <p className="mt-2">Try different keywords or search by topic</p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {voiceSupported ? 'Type or speak to search' : 'Type to search the Quran'}
            </p>
            <p className="text-sm mt-2">Search in Arabic, English, or Urdu</p>
          </div>
        )}
      </div>
    </div>
  );
}
