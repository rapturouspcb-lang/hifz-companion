import { PrismaClient, Surah, Ayah } from '@prisma/client';

const prisma = new PrismaClient();

export class QuranService {
  async getAllSurahs(): Promise<Surah[]> {
    return prisma.surah.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async getSurahById(id: number): Promise<Surah | null> {
    return prisma.surah.findUnique({
      where: { id }
    });
  }

  async getSurahAyahs(surahId: number): Promise<Ayah[]> {
    return prisma.ayah.findMany({
      where: { surahId },
      orderBy: { ayahNumber: 'asc' }
    });
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
