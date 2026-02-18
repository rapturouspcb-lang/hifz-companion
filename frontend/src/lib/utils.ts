import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAyahId(surahId: number, ayahNumber: number): string {
  return `${surahId}:${ayahNumber}`;
}

export function parseAyahId(id: string): { surahId: number; ayahNumber: number } | null {
  const match = id.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  return {
    surahId: parseInt(match[1], 10),
    ayahNumber: parseInt(match[2], 10),
  };
}

export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

export function formatStreak(count: number): string {
  if (count >= 365) {
    const years = Math.floor(count / 365);
    return `${years}y ${count % 365}d`;
  }
  if (count >= 30) {
    const months = Math.floor(count / 30);
    return `${months}m ${count % 30}d`;
  }
  return `${count} days`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
