/**
 * Script to compute Mutashabihat (similar verses) across the Quran
 * Run with: npm run db:mutashabihat
 */

import { PrismaClient } from '@prisma/client';
import MutashabihatDetector, { AyahData, MutashabihResult } from '../utils/mutashabihat-detector.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Mutashabihat detection...');
  console.time('Total time');

  // Fetch all ayahs
  console.log('Fetching ayahs from database...');
  const ayahs = await prisma.ayah.findMany({
    select: {
      id: true,
      surahId: true,
      ayahNumber: true,
      textArabic: true,
      textArabicSimple: true
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${ayahs.length} ayahs`);

  // Map to detector format
  const ayahData: AyahData[] = ayahs.map(a => ({
    id: Number(a.id),
    surahId: a.surahId,
    ayahNumber: a.ayahNumber,
    textArabic: a.textArabic,
    textArabicSimple: a.textArabicSimple
  }));

  // Initialize detector
  const detector = new MutashabihatDetector();

  // Process in batches
  const threshold = 0.55; // Similarity threshold
  console.log(`Detecting Mutashabihat with threshold ${threshold}...`);

  const results = await detector.batchDetect(ayahData, threshold, (progress) => {
    console.log(`Progress: ${progress.toFixed(1)}%`);
  });

  console.log(`Found ${results.length} Mutashabihat pairs`);

  // Clear existing Mutashabihat data
  console.log('Clearing existing data...');
  await prisma.mutashabihat.deleteMany();

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);

    await prisma.mutashabihat.createMany({
      data: batch.map((r: MutashabihResult) => ({
        ayahId1: r.ayahId1,
        ayahId2: r.ayahId2,
        similarityScore: r.similarityScore,
        similarityType: r.similarityType,
        diffData: r.diffData
      })),
      skipDuplicates: true
    });

    console.log(`Inserted ${Math.min(i + batchSize, results.length)} / ${results.length}`);
  }

  // Statistics
  const stats = await prisma.mutashabihat.groupBy({
    by: ['similarityType'],
    _count: true
  });

  console.log('\nMutashabihat Statistics:');
  stats.forEach(s => {
    console.log(`  ${s.similarityType}: ${s._count}`);
  });

  console.timeEnd('Total time');
  console.log('Mutashabihat detection completed!');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
