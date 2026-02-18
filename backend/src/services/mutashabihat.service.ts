import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MutashabihatResult {
  ayahId: number;
  similarAyah: {
    id: number;
    surahId: number;
    ayahNumber: number;
    textArabic: string;
    surahName: string;
  };
  similarityScore: number;
  similarityType: string;
  diffData: any;
}

export class MutashabihatService {
  async getMutashabihatForAyah(ayahId: number): Promise<MutashabihatResult[]> {
    const results = await prisma.$queryRaw<MutashabihatResult[]>`
      SELECT
        m.ayah_id_1 as "ayahId",
        a2.id as "similarAyahId",
        a2.surah_id as "surahId",
        a2.ayah_number as "ayahNumber",
        a2.text_arabic as "textArabic",
        s.name_english as "surahName",
        m.similarity_score as "similarityScore",
        m.similarity_type as "similarityType",
        m.diff_data as "diffData"
      FROM mutashabihat m
      JOIN ayahs a2 ON m.ayah_id_2 = a2.id
      JOIN surahs s ON a2.surah_id = s.id
      WHERE m.ayah_id_1 = ${ayahId}
      UNION
      SELECT
        m.ayah_id_2 as "ayahId",
        a1.id as "similarAyahId",
        a1.surah_id as "surahId",
        a1.ayah_number as "ayahNumber",
        a1.text_arabic as "textArabic",
        s.name_english as "surahName",
        m.similarity_score as "similarityScore",
        m.similarity_type as "similarityType",
        m.diff_data as "diffData"
      FROM mutashabihat m
      JOIN ayahs a1 ON m.ayah_id_1 = a1.id
      JOIN surahs s ON a1.surah_id = s.id
      WHERE m.ayah_id_2 = ${ayahId}
      ORDER BY "similarityScore" DESC
    `;

    return results.map(r => ({
      ayahId: r.ayahId,
      similarAyah: {
        id: Number(r.similarAyahId || r.similarAyah),
        surahId: Number(r.surahId),
        ayahNumber: r.ayahNumber,
        textArabic: r.textArabic,
        surahName: r.surahName
      },
      similarityScore: r.similarityScore,
      similarityType: r.similarityType,
      diffData: r.diffData
    }));
  }

  async compareAyahs(ayahId1: number, ayahId2: number): Promise<{
    ayah1: any;
    ayah2: any;
    comparison: any;
  }> {
    const [ayah1, ayah2] = await Promise.all([
      prisma.ayah.findUnique({
        where: { id: ayahId1 },
        include: { surah: true }
      }),
      prisma.ayah.findUnique({
        where: { id: ayahId2 },
        include: { surah: true }
      })
    ]);

    if (!ayah1 || !ayah2) {
      throw new Error('One or both ayahs not found');
    }

    const mutashabih = await prisma.mutashabihat.findFirst({
      where: {
        OR: [
          { ayahId1, ayahId2 },
          { ayahId1: ayahId2, ayahId2: ayahId1 }
        ]
      }
    });

    return {
      ayah1,
      ayah2,
      comparison: {
        similarityScore: mutashabih?.similarityScore || 0,
        similarityType: mutashabih?.similarityType || 'unknown',
        diffData: mutashabih?.diffData || null
      }
    };
  }

  async getMutashabihatForSurah(surahId: number): Promise<MutashabihatResult[]> {
    const ayahs = await prisma.ayah.findMany({
      where: { surahId },
      select: { id: true }
    });

    const ayahIds = ayahs.map(a => a.id);
    const allMutashabihat: MutashabihatResult[] = [];

    for (const ayahId of ayahIds) {
      const results = await this.getMutashabihatForAyah(ayahId);
      allMutashabihat.push(...results);
    }

    // Remove duplicates and sort
    const seen = new Set<string>();
    return allMutashabihat.filter(m => {
      const key = [m.ayahId, m.similarAyah.id].sort().join('-');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => b.similarityScore - a.similarityScore);
  }

  async getStats(): Promise<{
    totalMutashabihat: number;
    byType: Record<string, number>;
    topSimilarPairs: Array<{ ayah1: number; ayah2: number; score: number }>;
  }> {
    const total = await prisma.mutashabihat.count();

    const byType = await prisma.mutashabihat.groupBy({
      by: ['similarityType'],
      _count: true
    });

    const topPairs = await prisma.mutashabihat.findMany({
      orderBy: { similarityScore: 'desc' },
      take: 10,
      select: {
        ayahId1: true,
        ayahId2: true,
        similarityScore: true
      }
    });

    return {
      totalMutashabihat: total,
      byType: Object.fromEntries(byType.map(t => [t.similarityType, t._count])),
      topSimilarPairs: topPairs.map(p => ({
        ayah1: p.ayahId1,
        ayah2: p.ayahId2,
        score: p.similarityScore
      }))
    };
  }
}

export default MutashabihatService;
