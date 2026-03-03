'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Search, Target, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/quran', label: 'Quran', icon: Book },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/revision', label: 'Revision', icon: Target },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full transition-colors',
            pathname === '/settings'
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
