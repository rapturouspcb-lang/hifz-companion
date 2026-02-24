/**
 * Database seed script
 * Run with: npm run db:seed
 *
 * Minimal seed for development:
 * - Surah 1 (Al-Fatiha) with all 7 ayahs
 * - Urdu translation by Maulana Fateh Muhammad Jalandhari
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All 114 surahs metadata
const surahsData = [
  { id: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah", nameUrdu: "الفاتحہ", revelationType: "Meccan", ayahCount: 7, pageStart: 1, pageEnd: 1, juzList: [1] },
  { id: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", nameUrdu: "البقرہ", revelationType: "Medinan", ayahCount: 286, pageStart: 2, pageEnd: 49, juzList: [1, 2, 3] },
  { id: 3, nameArabic: "آل عمران", nameEnglish: "Aal-Imran", nameUrdu: "آل عمران", revelationType: "Medinan", ayahCount: 200, pageStart: 50, pageEnd: 76, juzList: [3, 4] },
  { id: 4, nameArabic: "النساء", nameEnglish: "An-Nisa", nameUrdu: "النساء", revelationType: "Medinan", ayahCount: 176, pageStart: 77, pageEnd: 106, juzList: [4, 5, 6] },
  { id: 5, nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", nameUrdu: "المائدہ", revelationType: "Medinan", ayahCount: 120, pageStart: 106, pageEnd: 127, juzList: [6, 7] },
  { id: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", nameUrdu: "یس", revelationType: "Meccan", ayahCount: 83, pageStart: 440, pageEnd: 445, juzList: [22, 23] },
  { id: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Rahman", nameUrdu: "الرحمن", revelationType: "Medinan", ayahCount: 78, pageStart: 531, pageEnd: 534, juzList: [27] },
  { id: 56, nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah", nameUrdu: "الواقعہ", revelationType: "Meccan", ayahCount: 96, pageStart: 534, pageEnd: 537, juzList: [27] },
  { id: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", nameUrdu: "الملک", revelationType: "Meccan", ayahCount: 30, pageStart: 562, pageEnd: 564, juzList: [29] },
  { id: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas", nameUrdu: "الاخلاص", revelationType: "Meccan", ayahCount: 4, pageStart: 604, pageEnd: 604, juzList: [30] },
  { id: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", nameUrdu: "الفلق", revelationType: "Meccan", ayahCount: 5, pageStart: 604, pageEnd: 604, juzList: [30] },
  { id: 114, nameArabic: "الناس", nameEnglish: "An-Nas", nameUrdu: "الناس", revelationType: "Meccan", ayahCount: 6, pageStart: 604, pageEnd: 604, juzList: [30] },
];

// Al-Fatiha (Surah 1) - Complete with Urdu translation by Maulana Fateh Muhammad Jalandhari
const alFatihaAyahs = [
  {
    id: 1,
    surahId: 1,
    ayahNumber: 1,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    textArabicSimple: "بسم الله الرحمن الرحيم",
    textUrdu: "شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے",
    textEnglish: "In the name of Allah, the Most Gracious, the Most Merciful.",
    wordCount: 4
  },
  {
    id: 2,
    surahId: 1,
    ayahNumber: 2,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    textArabicSimple: "الحمد لله رب العلمين",
    textUrdu: "سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے",
    textEnglish: "All praise is due to Allah, Lord of the worlds.",
    wordCount: 4
  },
  {
    id: 3,
    surahId: 1,
    ayahNumber: 3,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "الرَّحْمَٰنِ الرَّحِيمِ",
    textArabicSimple: "الرحمن الرحيم",
    textUrdu: "بڑا مہربان نہایت رحم والا",
    textEnglish: "The Most Gracious, the Most Merciful.",
    wordCount: 2
  },
  {
    id: 4,
    surahId: 1,
    ayahNumber: 4,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "مَالِكِ يَوْمِ الدِّينِ",
    textArabicSimple: "مالك يوم الدين",
    textUrdu: "روز جزا کا مالک",
    textEnglish: "Master of the Day of Judgment.",
    wordCount: 3
  },
  {
    id: 5,
    surahId: 1,
    ayahNumber: 5,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    textArabicSimple: "اياك نعبد واياك نستعين",
    textUrdu: "ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد چاہتے ہیں",
    textEnglish: "You alone we worship, and You alone we ask for help.",
    wordCount: 4
  },
  {
    id: 6,
    surahId: 1,
    ayahNumber: 6,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    textArabicSimple: "اهدنا الصراط المستقيم",
    textUrdu: "ہم کو سیدھے راستے چلا",
    textEnglish: "Guide us to the straight path.",
    wordCount: 3
  },
  {
    id: 7,
    surahId: 1,
    ayahNumber: 7,
    pageNumber: 1,
    juzNumber: 1,
    hizbNumber: 1,
    textArabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    textArabicSimple: "صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين",
    textUrdu: "ان لوگوں کے راستے جن پر تو نے انعام کیا، نہ ان کے جن پر غضب ہوا اور نہ گمراہوں کے",
    textEnglish: "The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray.",
    wordCount: 9
  }
];

async function main() {
  console.log('Starting database seed...');

  // Seed Surahs
  console.log('Seeding surahs...');
  for (const surah of surahsData) {
    await prisma.surah.upsert({
      where: { id: surah.id },
      update: {},
      create: surah
    });
  }
  console.log(`Seeded ${surahsData.length} surahs`);

  // Seed Al-Fatiha ayahs
  console.log('Seeding Al-Fatiha (Surah 1) ayahs...');
  for (const ayah of alFatihaAyahs) {
    await prisma.ayah.upsert({
      where: { id: ayah.id },
      update: {},
      create: ayah
    });
  }
  console.log(`Seeded ${alFatihaAyahs.length} ayahs from Al-Fatiha`);

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
