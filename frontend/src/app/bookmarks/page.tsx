'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { progressApi, quranApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Palette,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Bookmark {
  id: string;
  ayahId: number;
  surahId: number;
  ayahNumber: number;
  bookmarkType: string;
  note: string | null;
  color: string;
  createdAt: string;
  ayahText?: string;
}

interface Surah {
  id: number;
  nameEnglish: string;
  nameArabic: string;
}

const colors = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
];

const bookmarkTypes = [
  { value: 'general', label: 'General' },
  { value: 'revision', label: 'Revision' },
  { value: 'favorite', label: 'Favorite' },
  { value: 'important', label: 'Important' },
];

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editType, setEditType] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookmarksRes, surahsRes] = await Promise.all([
        progressApi.getBookmarks().catch(() => ({ data: { data: [] } })),
        quranApi.getSurahs().catch(() => ({ data: { data: [] } })),
      ]);
      setBookmarks(bookmarksRes.data.data || []);
      setSurahs(surahsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (ayahId: number) => {
    try {
      await progressApi.removeBookmark(ayahId);
      setBookmarks((prev) => prev.filter((b) => b.ayahId !== ayahId));
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  const updateBookmark = async () => {
    if (!editingBookmark) return;
    try {
      // Note: Backend update endpoint would need to be implemented
      setBookmarks((prev) =>
        prev.map((b) =>
          b.ayahId === editingBookmark.ayahId
            ? { ...b, note: editNote, color: editColor, bookmarkType: editType }
            : b
        )
      );
      setEditingBookmark(null);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const getSurahName = (surahId: number) => {
    const surah = surahs.find((s) => s.id === surahId);
    return surah ? `${surah.id}. ${surah.nameEnglish}` : `Surah ${surahId}`;
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const surahName = getSurahName(bookmark.surahId).toLowerCase();
    const matchesSearch = searchQuery
      ? surahName.includes(searchQuery.toLowerCase()) ||
        bookmark.note?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = filterType ? bookmark.bookmarkType === filterType : true;
    const matchesColor = filterColor ? bookmark.color === filterColor : true;
    return matchesSearch && matchesType && matchesColor;
  });

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const surahId = bookmark.surahId;
    if (!acc[surahId]) {
      acc[surahId] = [];
    }
    acc[surahId].push(bookmark);
    return acc;
  }, {} as Record<number, Bookmark[]>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookmarks</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
        >
          <option value="">All Types</option>
          {bookmarkTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => setFilterColor(filterColor === color.value ? null : color.value)}
            className={cn(
              'w-6 h-6 rounded-full transition-transform',
              filterColor === color.value && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
            )}
            style={{ backgroundColor: color.value }}
            title={color.label}
          />
        ))}
        {filterColor && (
          <button
            onClick={() => setFilterColor(null)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Bookmarks List */}
      {Object.keys(groupedBookmarks).length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
          <Bookmark className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start bookmarking ayahs while reading the Quran
          </p>
          <Link href="/quran">
            <Button>Go to Quran</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookmarks).map(([surahId, surahBookmarks]) => (
            <div key={surahId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {getSurahName(parseInt(surahId))}
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {surahBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Color indicator */}
                      <div
                        className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: bookmark.color || '#3b82f6' }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Ayah {bookmark.ayahNumber}
                          </span>
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs rounded-full',
                              bookmark.bookmarkType === 'favorite'
                                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                                : bookmark.bookmarkType === 'revision'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : bookmark.bookmarkType === 'important'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            )}
                          >
                            {bookmark.bookmarkType}
                          </span>
                        </div>
                        {bookmark.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {bookmark.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Added {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/quran/${surahId}?ayah=${bookmark.ayahNumber}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingBookmark(bookmark);
                            setEditNote(bookmark.note || '');
                            setEditColor(bookmark.color || '#3b82f6');
                            setEditType(bookmark.bookmarkType);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBookmark(bookmark.ayahId)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingBookmark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Bookmark</h3>
              <button
                onClick={() => setEditingBookmark(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  {bookmarkTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setEditColor(color.value)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-transform',
                        editColor === color.value && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEditingBookmark(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={updateBookmark}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
