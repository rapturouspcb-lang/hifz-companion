/**
 * Database seed script
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import surahsData from '../data/surahs.json' with { type: 'json' };
import sampleAyahs from '../data/sample-ayahs.json' with { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Seed Surahs
  console.log('Seeding surahs...');
  for (const surah of surahsData) {
    await prisma.surah.upsert({
      where: { id: surah.id },
      update: {},
      create: {
        id: surah.id,
        nameArabic: surah.nameArabic,
        nameEnglish: surah.nameEnglish,
        nameUrdu: surah.nameUrdu,
        revelationType: surah.revelationType,
        ayahCount: surah.ayahCount,
        pageStart: surah.pageStart,
        pageEnd: surah.pageEnd,
        juzList: surah.juzList
      }
    });
  }
  console.log(`Seeded ${surahsData.length} surahs`);

  // Seed sample ayahs (for development)
  if (sampleAyahs.length > 0) {
    console.log('Seeding sample ayahs...');
    for (const ayah of sampleAyahs) {
      await prisma.ayah.upsert({
        where: { id: ayah.id },
        update: {},
        create: {
          id: ayah.id,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber,
          pageNumber: ayah.pageNumber,
          juzNumber: ayah.juzNumber,
          hizbNumber: ayah.hizbNumber,
          textArabic: ayah.textArabic,
          textArabicSimple: ayah.textArabicSimple,
          textUrdu: ayah.textUrdu,
          textEnglish: ayah.textEnglish,
          wordCount: ayah.wordCount
        }
      });
    }
    console.log(`Seeded ${sampleAyahs.length} sample ayahs`);
  }

  console.log('Database seed completed!');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
