'use client';

import { useParams } from 'next/navigation';
import { MushafView } from '@/components/mushaf/MushafView';

export default function SurahPage() {
  const params = useParams();
  const surahId = parseInt(params.id as string, 10);

  // For now, redirect to main Quran page with the surah
  // In a full implementation, this would show the specific surah

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Surah {surahId}</h1>
      <p className="text-gray-600 mb-8">
        Surah-specific view coming soon. For now, use the main Quran reader.
      </p>
      <MushafView initialPage={1} />
    </div>
  );
}
