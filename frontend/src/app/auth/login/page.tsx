'use client';

import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            Hifz Companion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quran Memorization App for Huffaz
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
