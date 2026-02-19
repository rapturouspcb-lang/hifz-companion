/**
 * Full Quran Database Seed Script
 * Fetches complete Quran data from multiple sources with fallback
 * Run with: npm run db:seed-full
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Primary API: Quran.com (most reliable)
const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// Complete Surah data with page info (from standard 13-line mushaf)
const SURAH_META: { [key: number]: { pageStart: number; pageEnd: number; juzList: number[] } } = {
  1: { pageStart: 1, pageEnd: 1, juzList: [1] },
  2: { pageStart: 2, pageEnd: 49, juzList: [1, 2, 3] },
  3: { pageStart: 50, pageEnd: 76, juzList: [3, 4] },
  4: { pageStart: 77, pageEnd: 106, juzList: [4, 5, 6] },
  5: { pageStart: 106, pageEnd: 127, juzList: [6, 7] },
  6: { pageStart: 128, pageEnd: 150, juzList: [7, 8] },
  7: { pageStart: 151, pageEnd: 176, juzList: [8, 9] },
  8: { pageStart: 177, pageEnd: 186, juzList: [9, 10] },
  9: { pageStart: 187, pageEnd: 207, juzList: [10, 11] },
  10: { pageStart: 208, pageEnd: 221, juzList: [11] },
  11: { pageStart: 221, pageEnd: 235, juzList: [11, 12] },
  12: { pageStart: 235, pageEnd: 248, juzList: [12, 13] },
  13: { pageStart: 249, pageEnd: 255, juzList: [13] },
  14: { pageStart: 255, pageEnd: 261, juzList: [13] },
  15: { pageStart: 262, pageEnd: 267, juzList: [14] },
  16: { pageStart: 267, pageEnd: 281, juzList: [14] },
  17: { pageStart: 282, pageEnd: 293, juzList: [15] },
  18: { pageStart: 293, pageEnd: 304, juzList: [15, 16] },
  19: { pageStart: 305, pageEnd: 312, juzList: [16] },
  20: { pageStart: 312, pageEnd: 321, juzList: [16] },
  21: { pageStart: 322, pageEnd: 331, juzList: [17] },
  22: { pageStart: 332, pageEnd: 341, juzList: [17] },
  23: { pageStart: 342, pageEnd: 349, juzList: [18] },
  24: { pageStart: 350, pageEnd: 359, juzList: [18] },
  25: { pageStart: 359, pageEnd: 366, juzList: [18, 19] },
  26: { pageStart: 367, pageEnd: 376, juzList: [19] },
  27: { pageStart: 377, pageEnd: 385, juzList: [19, 20] },
  28: { pageStart: 385, pageEnd: 396, juzList: [20] },
  29: { pageStart: 396, pageEnd: 404, juzList: [20, 21] },
  30: { pageStart: 404, pageEnd: 410, juzList: [21] },
  31: { pageStart: 411, pageEnd: 414, juzList: [21] },
  32: { pageStart: 415, pageEnd: 417, juzList: [21] },
  33: { pageStart: 418, pageEnd: 427, juzList: [21, 22] },
  34: { pageStart: 428, pageEnd: 434, juzList: [22] },
  35: { pageStart: 434, pageEnd: 440, juzList: [22] },
  36: { pageStart: 440, pageEnd: 445, juzList: [22, 23] },
  37: { pageStart: 446, pageEnd: 452, juzList: [23] },
  38: { pageStart: 453, pageEnd: 458, juzList: [23] },
  39: { pageStart: 458, pageEnd: 467, juzList: [23, 24] },
  40: { pageStart: 467, pageEnd: 476, juzList: [24] },
  41: { pageStart: 477, pageEnd: 482, juzList: [24, 25] },
  42: { pageStart: 483, pageEnd: 489, juzList: [25] },
  43: { pageStart: 489, pageEnd: 494, juzList: [25] },
  44: { pageStart: 494, pageEnd: 496, juzList: [25] },
  45: { pageStart: 497, pageEnd: 500, juzList: [25] },
  46: { pageStart: 501, pageEnd: 505, juzList: [26] },
  47: { pageStart: 506, pageEnd: 509, juzList: [26] },
  48: { pageStart: 510, pageEnd: 514, juzList: [26] },
  49: { pageStart: 514, pageEnd: 517, juzList: [26] },
  50: { pageStart: 518, pageEnd: 520, juzList: [26] },
  51: { pageStart: 520, pageEnd: 523, juzList: [26, 27] },
  52: { pageStart: 523, pageEnd: 525, juzList: [27] },
  53: { pageStart: 526, pageEnd: 528, juzList: [27] },
  54: { pageStart: 528, pageEnd: 531, juzList: [27] },
  55: { pageStart: 531, pageEnd: 534, juzList: [27] },
  56: { pageStart: 534, pageEnd: 537, juzList: [27] },
  57: { pageStart: 537, pageEnd: 541, juzList: [27] },
  58: { pageStart: 542, pageEnd: 545, juzList: [28] },
  59: { pageStart: 545, pageEnd: 548, juzList: [28] },
  60: { pageStart: 549, pageEnd: 551, juzList: [28] },
  61: { pageStart: 551, pageEnd: 553, juzList: [28] },
  62: { pageStart: 553, pageEnd: 554, juzList: [28] },
  63: { pageStart: 554, pageEnd: 556, juzList: [28] },
  64: { pageStart: 556, pageEnd: 558, juzList: [28] },
  65: { pageStart: 558, pageEnd: 559, juzList: [28] },
  66: { pageStart: 560, pageEnd: 561, juzList: [28] },
  67: { pageStart: 562, pageEnd: 564, juzList: [29] },
  68: { pageStart: 564, pageEnd: 566, juzList: [29] },
  69: { pageStart: 566, pageEnd: 568, juzList: [29] },
  70: { pageStart: 568, pageEnd: 570, juzList: [29] },
  71: { pageStart: 570, pageEnd: 571, juzList: [29] },
  72: { pageStart: 572, pageEnd: 573, juzList: [29] },
  73: { pageStart: 574, pageEnd: 575, juzList: [29] },
  74: { pageStart: 575, pageEnd: 577, juzList: [29] },
  75: { pageStart: 577, pageEnd: 578, juzList: [29] },
  76: { pageStart: 578, pageEnd: 580, juzList: [29] },
  77: { pageStart: 580, pageEnd: 581, juzList: [29] },
  78: { pageStart: 582, pageEnd: 583, juzList: [30] },
  79: { pageStart: 583, pageEnd: 584, juzList: [30] },
  80: { pageStart: 585, pageEnd: 585, juzList: [30] },
  81: { pageStart: 586, pageEnd: 586, juzList: [30] },
  82: { pageStart: 587, pageEnd: 587, juzList: [30] },
  83: { pageStart: 588, pageEnd: 589, juzList: [30] },
  84: { pageStart: 589, pageEnd: 590, juzList: [30] },
  85: { pageStart: 590, pageEnd: 591, juzList: [30] },
  86: { pageStart: 591, pageEnd: 591, juzList: [30] },
  87: { pageStart: 592, pageEnd: 592, juzList: [30] },
  88: { pageStart: 592, pageEnd: 593, juzList: [30] },
  89: { pageStart: 593, pageEnd: 594, juzList: [30] },
  90: { pageStart: 594, pageEnd: 594, juzList: [30] },
  91: { pageStart: 595, pageEnd: 595, juzList: [30] },
  92: { pageStart: 595, pageEnd: 596, juzList: [30] },
  93: { pageStart: 596, pageEnd: 596, juzList: [30] },
  94: { pageStart: 596, pageEnd: 597, juzList: [30] },
  95: { pageStart: 597, pageEnd: 597, juzList: [30] },
  96: { pageStart: 597, pageEnd: 598, juzList: [30] },
  97: { pageStart: 598, pageEnd: 599, juzList: [30] },
  98: { pageStart: 599, pageEnd: 599, juzList: [30] },
  99: { pageStart: 599, pageEnd: 600, juzList: [30] },
  100: { pageStart: 600, pageEnd: 600, juzList: [30] },
  101: { pageStart: 600, pageEnd: 600, juzList: [30] },
  102: { pageStart: 600, pageEnd: 601, juzList: [30] },
  103: { pageStart: 601, pageEnd: 601, juzList: [30] },
  104: { pageStart: 601, pageEnd: 601, juzList: [30] },
  105: { pageStart: 601, pageEnd: 602, juzList: [30] },
  106: { pageStart: 602, pageEnd: 602, juzList: [30] },
  107: { pageStart: 602, pageEnd: 602, juzList: [30] },
  108: { pageStart: 602, pageEnd: 602, juzList: [30] },
  109: { pageStart: 603, pageEnd: 603, juzList: [30] },
  110: { pageStart: 603, pageEnd: 603, juzList: [30] },
  111: { pageStart: 603, pageEnd: 603, juzList: [30] },
  112: { pageStart: 604, pageEnd: 604, juzList: [30] },
  113: { pageStart: 604, pageEnd: 604, juzList: [30] },
  114: { pageStart: 604, pageEnd: 604, juzList: [30] },
};

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error}`);
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function fetchSurahs(): Promise<any[]> {
  console.log('Fetching surahs from Quran.com API...');
  const response = await fetchWithRetry(`${QURAN_API_BASE}/chapters?language=en`);
  return response.chapters;
}

async function fetchAyahsForSurah(surahId: number, ayahCount: number): Promise<any[]> {
  // Fetch all verses with Urdu translation (translation_id: 158 for Urdu Maududi)
  // API limits to 50 per page, so we need to paginate
  const allVerses: any[] = [];
  const perPage = 50;
  const pages = Math.ceil(ayahCount / perPage);

  for (let page = 1; page <= pages; page++) {
    const url = `${QURAN_API_BASE}/verses/by_chapter/${surahId}?language=en&words=false&translations=158&fields=text_uthmani,text_imlaei&page=${page}&per_page=${perPage}`;
    const response = await fetchWithRetry(url);
    allVerses.push(...response.verses);
  }

  return allVerses;
}

function simplifyArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
    .replace(/ـ/g, '') // Remove tatweel
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║       Hifz Companion - Full Quran Seed            ║
  ╚═══════════════════════════════════════════════════╝
  `);

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.mutashabihat.deleteMany();
  await prisma.mistake.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.revisionSession.deleteMany();
  await prisma.dailyStreak.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ayah.deleteMany();
  await prisma.surah.deleteMany();
  console.log('Existing data cleared.\n');

  // Fetch and seed surahs
  const surahs = await fetchSurahs();
  console.log(`Fetched ${surahs.length} surahs\n`);

  console.log('Seeding surahs...');
  for (const surah of surahs) {
    const meta = SURAH_META[surah.id] || { pageStart: 1, pageEnd: 604, juzList: [1] };

    await prisma.surah.create({
      data: {
        id: surah.id,
        nameArabic: surah.name_arabic,
        nameEnglish: surah.name_simple,
        nameUrdu: surah.translated_name?.name || null,
        revelationType: surah.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
        ayahCount: surah.verses_count,
        pageStart: meta.pageStart,
        pageEnd: meta.pageEnd,
        juzList: JSON.stringify(meta.juzList),
      },
    });
  }
  console.log(`Seeded ${surahs.length} surahs\n`);

  // Fetch and seed ayahs
  console.log('Seeding ayahs (this may take a few minutes)...\n');
  let totalAyahs = 0;
  let globalAyahId = 1;

  for (const surah of surahs) {
    try {
      const verses = await fetchAyahsForSurah(surah.id, surah.verses_count);

      for (const verse of verses) {
        const textArabic = verse.text_uthmani || verse.text_imlaei || '';
        const textUrdu = verse.translations?.[0]?.text || null;
        const meta = SURAH_META[surah.id] || { pageStart: 1, juzList: [1] };

        // Calculate juz number based on page
        let juz = 1;
        for (let j = 30; j >= 1; j--) {
          if (meta.pageStart >= (j - 1) * 20 + 1) {
            juz = j;
            break;
          }
        }

        await prisma.ayah.create({
          data: {
            id: globalAyahId++,
            surahId: surah.id,
            ayahNumber: verse.verse_number,
            pageNumber: meta.pageStart,
            juzNumber: meta.juzList[0],
            hizbNumber: meta.juzList[0] * 8,
            textArabic: textArabic,
            textArabicSimple: simplifyArabic(textArabic),
            textUrdu: textUrdu?.replace(/<[^>]*>/g, '') || null, // Remove HTML tags
            wordCount: simplifyArabic(textArabic).split(/\s+/).filter(w => w.length > 0).length,
          },
        });
        totalAyahs++;
      }

      process.stdout.write(`\rSurah ${surah.id}/114: ${surah.name_simple} - ${verses.length} ayahs (Total: ${totalAyahs})`);
    } catch (error) {
      console.log(`\nError fetching surah ${surah.id}: ${error}`);
    }
  }

  console.log('\n\nVerifying data...');
  const surahCount = await prisma.surah.count();
  const ayahCount = await prisma.ayah.count();

  console.log(`
  ╔════════════════════════════════════════╗
  ║     Quran Seed Complete!               ║
  ╠════════════════════════════════════════╣
  ║  Surahs:  ${surahCount.toString().padStart(3)} / 114                  ║
  ║  Ayahs:   ${ayahCount.toString().padStart(5)} / 6236                 ║
  ╚════════════════════════════════════════╝
  `);

  if (surahCount < 114 || ayahCount < 6236) {
    console.log('⚠️  Warning: Not all data was seeded. Check network connection.');
  } else {
    console.log('✅ All Quran data seeded successfully!');
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
