import { z } from 'zod';

// Common validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const revisionSessionSchema = z.object({
  revisionType: z.enum(['sabaq', 'sabaq_para', 'manzil', 'weak', 'custom']),
  surahIds: z.array(z.number()).min(1, 'At least one surah is required').optional(),
});

export const mistakeLogSchema = z.object({
  ayahId: z.number().int().positive(),
  mistakeType: z.enum(['stutter', 'wrong_word', 'forgot', 'mutashabih_confusion', 'other']),
  notes: z.string().max(500).optional(),
});

export const bookmarkSchema = z.object({
  ayahId: z.number().int().positive(),
  bookmarkType: z.enum(['general', 'revision', 'favorite', 'important']).default('general').optional(),
  note: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// Helper functions
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string } {
  if (password.length < 8) {
    return { valid: false, errors: 'Password must be at least 8 characters' };
  }
  return { valid: true, errors: '' };
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/[<>'"&]/g, '').trim();
}
