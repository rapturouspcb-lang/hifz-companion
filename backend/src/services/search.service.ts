import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchResult {
  ayahs: any[];
  totalCount: number;
  query: string;
  searchType: string;
}

// Topic mappings for Quranic themes
const TOPIC_MAPPINGS: Record<string, string[]> = {
  sabr: ['صبر', 'patient', 'patience', 'perseverance'],
  jannah: ['جنة', 'جنت', 'paradise', 'heaven', 'garden'],
  jahannam: ['نار', 'جهنم', 'hell', 'fire'],
  salah: ['صلاة', 'صلوة', 'prayer', 'salat'],
  zakah: ['زكاة', 'زكوة', 'charity', 'zakat', 'alms'],
  hajj: ['حج', 'pilgrimage', 'kaaba', 'كعبة'],
  fasting: ['صوم', 'صيام', 'fast', 'ramadan', 'رمضان'],
  parents: ['والد', 'والدة', 'اب', 'ام', 'parent', 'mother', 'father'],
  orphans: ['يتيم', 'orphan'],
  knowledge: ['علم', 'knowledge', 'learn', 'wisdom', 'حكمة'],
  taqwa: ['تقوى', 'god-fearing', 'righteous'],
  tawakkul: ['توكل', 'trust', 'reliance'],
  shukr: ['شكر', 'gratitude', 'grateful', 'thankful'],
  istighfar: ['استغفر', 'forgiveness', 'forgive', 'مغفر'],
  dua: ['دعاء', 'دعا', 'supplication', 'pray', 'call']
};

export class SearchService {
  async search(
    query: string,
    options: {
      type?: 'arabic' | 'translation' | 'all';
      language?: 'urdu' | 'english';
      surahId?: number;
      juzNumber?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SearchResult> {
    const { type = 'all', language = 'urdu', limit = 50, offset = 0 } = options;

    let ayahs: any[] = [];

    if (type === 'arabic' || type === 'all') {
      const arabicResults = await this.searchArabicText(query);
      ayahs = [...ayahs, ...arabicResults];
    }

    if (type === 'translation' || type === 'all') {
      const translationResults = await this.searchTranslation(query, language);
      ayahs = [...ayahs, ...translationResults];
    }

    // Remove duplicates based on ayah id
    const uniqueAyahs = [...new Map(ayahs.map(a => [a.id, a])).values()];

    // Apply filters
    let filtered = uniqueAyahs;
    if (options.surahId) {
      filtered = filtered.filter(a => a.surahId === options.surahId);
    }
    if (options.juzNumber) {
      filtered = filtered.filter(a => a.juzNumber === options.juzNumber);
    }

    // Paginate
    const paginated = filtered.slice(offset, offset + limit);

    return {
      ayahs: paginated,
      totalCount: filtered.length,
      query,
      searchType: type
    };
  }

  private async searchArabicText(query: string): Promise<any[]> {
    // Remove diacritics for search
    const normalizedQuery = this.removeDiacritics(query);

    return prisma.$queryRaw<any[]>`
      SELECT a.*, s.name_english as "surahName", s.name_arabic as "surahNameArabic"
      FROM ayahs a
      JOIN surahs s ON a.surah_id = s.id
      WHERE a.text_arabic_simple ILIKE ${`%${normalizedQuery}%`}
      ORDER BY a.id ASC
      LIMIT 100
    `;
  }

  private async searchTranslation(query: string, language: 'urdu' | 'english'): Promise<any[]> {
    const column = language === 'urdu' ? 'text_urdu' : 'text_english';

    return prisma.$queryRaw<any[]>`
      SELECT a.*, s.name_english as "surahName", s.name_arabic as "surahNameArabic"
      FROM ayahs a
      JOIN surahs s ON a.surah_id = s.id
      WHERE ${prisma.$queryRawUnsafe(column)} ILIKE ${`%${query}%`}
      ORDER BY a.id ASC
      LIMIT 100
    `;
  }

  async searchByTopic(topic: string): Promise<SearchResult> {
    const keywords = TOPIC_MAPPINGS[topic.toLowerCase()] || [topic];
    const ayahs: any[] = [];

    for (const keyword of keywords) {
      const results = await this.searchArabicText(keyword);
      ayahs.push(...results);
    }

    const uniqueAyahs = [...new Map(ayahs.map(a => [a.id, a])).values()];

    return {
      ayahs: uniqueAyahs,
      totalCount: uniqueAyahs.length,
      query: topic,
      searchType: 'topic'
    };
  }

  getAvailableTopics(): string[] {
    return Object.keys(TOPIC_MAPPINGS);
  }

  private removeDiacritics(text: string): string {
    // Arabic diacritics (harakat) to remove for search
    const diacritics = /[\u064B-\u065F\u0670]/g;
    return text.replace(diacritics, '');
  }
}

export default SearchService;
