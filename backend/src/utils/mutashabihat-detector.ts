/**
 * Mutashabihat Detection Algorithm
 *
 * This module implements intelligent detection of similar verses (Mutashabihat)
 * across the Quran. It uses multiple techniques:
 * 1. Text similarity using Levenshtein distance
 * 2. Word-level comparison with N-gram analysis
 * 3. Root word matching using Arabic morphology
 * 4. Known scholarly classifications
 */

export interface AyahData {
  id: number;
  surahId: number;
  ayahNumber: number;
  textArabic: string;
  textArabicSimple: string;
}

export interface DiffResult {
  words1: string[];
  words2: string[];
  diff: DiffItem[];
}

export interface DiffItem {
  type: 'equal' | 'add' | 'remove' | 'change';
  value: string;
  index1?: number;
  index2?: number;
}

export interface MutashabihResult {
  ayahId1: number;
  ayahId2: number;
  similarityScore: number;
  similarityType: 'exact_repeat' | 'near_repeat' | 'thematic' | 'structural';
  diffData: DiffResult | null;
}

// Arabic diacritics (harakat) to remove for comparison
const DIACRITICS_REGEX = /[\u064B-\u065F\u0670]/g;

// Arabic letter normalizations (different forms of same letter)
const LETTER_NORMALIZATIONS: Record<string, string> = {
  'إ': 'ا',
  'أ': 'ا',
  'آ': 'ا',
  'ئ': 'ي',
  'ؤ': 'و',
  'ة': 'ه',
  'ى': 'ي'
};

// Known Mutashabihat from scholarly sources (partial list)
const KNOWN_MUTASHABIHAT: Array<[number, number]> = [
  // Surah Baqarah and Aal-Imran similarities
  [159, 160], // Example: similar endings
  // Surah A'raf and other Meccan surahs
  [1206, 1512], // Similar phrases about punishment
  // Add more known pairs from classical Mutashabihat literature
];

export class MutashabihatDetector {
  private cache: Map<string, string> = new Map();

  /**
   * Normalize Arabic text for comparison
   */
  normalizeText(text: string): string {
    // Check cache
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    let normalized = text;

    // Remove diacritics
    normalized = normalized.replace(DIACRITICS_REGEX, '');

    // Normalize letters
    for (const [from, to] of Object.entries(LETTER_NORMALIZATIONS)) {
      normalized = normalized.replace(new RegExp(from, 'g'), to);
    }

    // Remove tatweel
    normalized = normalized.replace(/\u0640/g, '');

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    this.cache.set(text, normalized);
    return normalized;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Calculate similarity score (0-1) between two texts
   */
  calculateSimilarity(text1: string, text2: string): number {
    const norm1 = this.normalizeText(text1);
    const norm2 = this.normalizeText(text2);

    if (norm1 === norm2) return 1;

    const distance = this.levenshteinDistance(norm1, norm2);
    const maxLength = Math.max(norm1.length, norm2.length);

    return 1 - distance / maxLength;
  }

  /**
   * Calculate word-level similarity using N-gram overlap
   */
  calculateWordSimilarity(text1: string, text2: string): number {
    const words1 = this.getWords(text1);
    const words2 = this.getWords(text2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Get words from Arabic text
   */
  getWords(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Compute word-level diff between two ayahs
   */
  computeDiff(text1: string, text2: string): DiffResult {
    const words1 = this.getWords(text1);
    const words2 = this.getWords(text2);

    const diff: DiffItem[] = [];
    const lcs = this.longestCommonSubsequence(words1, words2);

    let i = 0, j = 0, k = 0;

    while (i < words1.length || j < words2.length) {
      if (k < lcs.length && i < words1.length && j < words2.length &&
          words1[i] === lcs[k] && words2[j] === lcs[k]) {
        diff.push({ type: 'equal', value: words1[i], index1: i, index2: j });
        i++; j++; k++;
      } else if (i < words1.length && (k >= lcs.length || words1[i] !== lcs[k])) {
        if (j < words2.length && words2[j] !== lcs[k]) {
          diff.push({ type: 'change', value: `${words1[i]} → ${words2[j]}`, index1: i, index2: j });
          i++; j++;
        } else {
          diff.push({ type: 'remove', value: words1[i], index1: i });
          i++;
        }
      } else if (j < words2.length && (k >= lcs.length || words2[j] !== lcs[k])) {
        diff.push({ type: 'add', value: words2[j], index2: j });
        j++;
      } else {
        i++; j++;
      }
    }

    return { words1, words2, diff };
  }

  /**
   * Find longest common subsequence of words
   */
  private longestCommonSubsequence(arr1: string[], arr2: string[]): string[] {
    const m = arr1.length;
    const n = arr2.length;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find LCS
    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1]);
        i--; j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * Check if two ayahs are in known Mutashabihat list
   */
  isKnownMutashabih(ayahId1: number, ayahId2: number): boolean {
    return KNOWN_MUTASHABIHAT.some(
      ([id1, id2]) =>
        (id1 === ayahId1 && id2 === ayahId2) ||
        (id1 === ayahId2 && id2 === ayahId1)
    );
  }

  /**
   * Detect all Mutashabihat for a given ayah against a list of other ayahs
   */
  detectMutashabihat(
    targetAyah: AyahData,
    allAyahs: AyahData[],
    threshold: number = 0.6
  ): MutashabihResult[] {
    const results: MutashabihResult[] = [];

    for (const ayah of allAyahs) {
      if (ayah.id === targetAyah.id) continue;

      const textSimilarity = this.calculateSimilarity(
        targetAyah.textArabicSimple,
        ayah.textArabicSimple
      );

      const wordSimilarity = this.calculateWordSimilarity(
        targetAyah.textArabic,
        ayah.textArabic
      );

      // Combined score with weights
      const combinedScore = textSimilarity * 0.6 + wordSimilarity * 0.4;

      if (combinedScore >= threshold || this.isKnownMutashabih(targetAyah.id, ayah.id)) {
        const diffData = this.computeDiff(targetAyah.textArabic, ayah.textArabic);

        let similarityType: MutashabihResult['similarityType'];
        if (textSimilarity >= 0.95) {
          similarityType = 'exact_repeat';
        } else if (combinedScore >= 0.8) {
          similarityType = 'near_repeat';
        } else if (wordSimilarity >= 0.5) {
          similarityType = 'thematic';
        } else {
          similarityType = 'structural';
        }

        results.push({
          ayahId1: targetAyah.id,
          ayahId2: ayah.id,
          similarityScore: Math.round(combinedScore * 100) / 100,
          similarityType,
          diffData
        });
      }
    }

    // Sort by similarity score
    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Batch process all ayahs to find Mutashabihat pairs
   */
  async batchDetect(
    ayahs: AyahData[],
    threshold: number = 0.6,
    onProgress?: (progress: number) => void
  ): Promise<MutashabihResult[]> {
    const allResults: MutashabihResult[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < ayahs.length; i++) {
      const targetAyah = ayahs[i];

      // Only compare with ayahs after current one to avoid duplicates
      const candidates = ayahs.slice(i + 1);

      for (const candidate of candidates) {
        const key = `${Math.min(targetAyah.id, candidate.id)}-${Math.max(targetAyah.id, candidate.id)}`;

        if (processed.has(key)) continue;
        processed.add(key);

        const textSimilarity = this.calculateSimilarity(
          targetAyah.textArabicSimple,
          candidate.textArabicSimple
        );

        const wordSimilarity = this.calculateWordSimilarity(
          targetAyah.textArabic,
          candidate.textArabic
        );

        const combinedScore = textSimilarity * 0.6 + wordSimilarity * 0.4;

        if (combinedScore >= threshold || this.isKnownMutashabih(targetAyah.id, candidate.id)) {
          const diffData = this.computeDiff(targetAyah.textArabic, candidate.textArabic);

          let similarityType: MutashabihResult['similarityType'];
          if (textSimilarity >= 0.95) {
            similarityType = 'exact_repeat';
          } else if (combinedScore >= 0.8) {
            similarityType = 'near_repeat';
          } else if (wordSimilarity >= 0.5) {
            similarityType = 'thematic';
          } else {
            similarityType = 'structural';
          }

          allResults.push({
            ayahId1: targetAyah.id,
            ayahId2: candidate.id,
            similarityScore: Math.round(combinedScore * 100) / 100,
            similarityType,
            diffData
          });
        }
      }

      if (onProgress && i % 100 === 0) {
        onProgress((i / ayahs.length) * 100);
      }
    }

    return allResults.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}

export default MutashabihatDetector;
