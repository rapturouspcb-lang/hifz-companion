import axios from 'axios';

// Use relative path to go through Next.js proxy (avoids CORS issues)
// The rewrite in next.config.js adds /api/v1 prefix
const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const quranApi = {
  getSurahs: () => api.get('/quran/surahs'),
  getSurah: (id: number) => api.get(`/quran/surahs/${id}`),
  getSurahAyahs: (id: number) => api.get(`/quran/surahs/${id}/ayahs`),
  getAyah: (id: number) => api.get(`/quran/ayahs/${id}`),
  getPage: (number: number) => api.get(`/quran/pages/${number}`),
  getJuz: (number: number) => api.get(`/quran/juz/${number}`),
};

export const mutashabihatApi = {
  getForAyah: (ayahId: number) => api.get(`/mutashabihat/ayahs/${ayahId}`),
  compare: (ayahId1: number, ayahId2: number) =>
    api.get(`/mutashabihat/compare/${ayahId1}/${ayahId2}`),
  getForSurah: (surahId: number) => api.get(`/mutashabihat/surahs/${surahId}`),
  getStats: () => api.get('/mutashabihat/stats'),
};

export const searchApi = {
  search: (query: string, type?: string) =>
    api.get('/search', { params: { q: query, type } }),
  searchArabic: (query: string) =>
    api.get('/search/arabic', { params: { q: query } }),
  searchByTopic: (topic: string) => api.get(`/search/topic/${topic}`),
  getTopics: () => api.get('/search/topics'),
};

export const audioApi = {
  getReciters: () => api.get('/audio/reciters'),
  getAyahAudio: (ayahId: number, reciter?: string) =>
    api.get(`/audio/ayah/${ayahId}`, { params: { reciter } }),
  getSurahAudio: (surahId: number, reciter?: string) =>
    api.get(`/audio/surah/${surahId}`, { params: { reciter } }),
};

export const userApi = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    api.post('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/users/login', data),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { displayName?: string }) =>
    api.put('/users/me', data),
  updateSettings: (settings: any) => api.put('/users/me/settings', { settings }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
};

export const progressApi = {
  getOverview: () => api.get('/progress'),
  getSurahProgress: () => api.get('/progress/surahs'),
  updateSurahProgress: (surahId: number, data: any) =>
    api.put(`/progress/surahs/${surahId}`, data),
  startRevision: (data: any) => api.post('/progress/revision/start', data),
  endRevision: (sessionId: string, data: any) =>
    api.post(`/progress/revision/${sessionId}/end`, data),
  logMistake: (data: any) => api.post('/progress/mistakes', data),
  getMistakes: () => api.get('/progress/mistakes'),
  getStreak: () => api.get('/progress/streak'),
  getBookmarks: () => api.get('/progress/bookmarks'),
  addBookmark: (data: any) => api.post('/progress/bookmarks', data),
  removeBookmark: (ayahId: number) => api.delete(`/progress/bookmarks/${ayahId}`),
};
