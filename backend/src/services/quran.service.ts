import { PrismaClient, Surah, Ayah } from '@prisma/client';

const prisma = new PrismaClient();

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class QuranService {
  async getAllSurahs(params: PaginationParams = {}): Promise<PaginatedResult<Surah>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 114; // Default to all surahs
    const skip = (page - 1) * limit;

    const [surahs, total] = await Promise.all([
      prisma.surah.findMany({
        orderBy: { id: 'asc' },
        skip,
        take: limit
      }),
      prisma.surah.count()
    ]);

    return {
      data: surahs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async getSurahById(id: number): Promise<Surah | null> {
    return prisma.surah.findUnique({
      where: { id }
    });
  }

  async getSurahAyahs(surahId: number, params: PaginationParams = {}): Promise<PaginatedResult<Ayah>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const skip = (page - 1) * limit;

    const [ayahs, total] = await Promise.all([
      prisma.ayah.findMany({
        where: { surahId },
        orderBy: { ayahNumber: 'asc' },
        skip,
        take: limit
      }),
      prisma.ayah.count({ where: { surahId } })
    ]);

    return {
      data: ayahs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async getAyahById(id: number): Promise<Ayah | null> {
    return prisma.ayah.findUnique({
      where: { id },
      include: { surah: true }
    });
  }

  async getAyahRange(start: number, end: number): Promise<Ayah[]> {
    return prisma.ayah.findMany({
      where: {
        id: { gte: start, lte: end }
      },
      orderBy: { id: 'asc' }
    });
  }

  async getPage(pageNumber: number): Promise<{
    page: number;
    ayahs: Ayah[];
    surahs: Surah[];
    juzNumber: number;
  }> {
    const ayahs = await prisma.ayah.findMany({
      where: { pageNumber },
      orderBy: { id: 'asc' },
      include: { surah: true }
    });

    if (ayahs.length === 0) {
      return { page: pageNumber, ayahs: [], surahs: [], juzNumber: 0 };
    }

    const uniqueSurahs = [...new Map(
      ayahs.map(a => [a.surah.id, a.surah])
    ).values()];

    return {
      page: pageNumber,
      ayahs,
      surahs: uniqueSurahs,
      juzNumber: ayahs[0].juzNumber
    };
  }

  async getJuz(juzNumber: number): Promise<{
    juz: number;
    ayahs: Ayah[];
    surahs: Surah[];
  }> {
    const ayahs = await prisma.ayah.findMany({
      where: { juzNumber },
      orderBy: { id: 'asc' },
      include: { surah: true }
    });

    const uniqueSurahs = [...new Map(
      ayahs.map(a => [a.surah.id, a.surah])
    ).values()];

    return {
      juz: juzNumber,
      ayahs,
      surahs: uniqueSurahs
    };
  }

  async getHizb(hizbNumber: number): Promise<{
    hizb: number;
    ayahs: Ayah[];
  }> {
    const ayahs = await prisma.ayah.findMany({
      where: { hizbNumber },
      orderBy: { id: 'asc' }
    });

    return { hizb: hizbNumber, ayahs };
  }

  async getTotalAyahCount(): Promise<number> {
    return prisma.ayah.count();
  }

  async searchAyahs(query: string, limit: number = 50): Promise<Ayah[]> {
    return prisma.$queryRaw<Ayah[]>`
      SELECT * FROM ayahs
      WHERE text_arabic_simple ILIKE ${`%${query}%`}
      ORDER BY id ASC
      LIMIT ${limit}
    `;
  }

  async searchTranslation(
    query: string,
    language: 'urdu' | 'english',
    limit: number = 50
  ): Promise<Ayah[]> {
    const column = language === 'urdu' ? 'text_urdu' : 'text_english';
    return prisma.$queryRaw<Ayah[]>`
      SELECT * FROM ayahs
      WHERE ${prisma.$queryRawUnsafe(column)} ILIKE ${`%${query}%`}
      ORDER BY id ASC
      LIMIT ${limit}
    `;
  }
}

export default QuranService;
