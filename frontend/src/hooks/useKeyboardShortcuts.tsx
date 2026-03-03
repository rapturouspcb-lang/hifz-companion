'use client';

import React, { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { keys: 'Q', description: 'Go to Quran' },
    { keys: 'S', description: 'Go to Search' },
    { keys: 'R', description: 'Start Revision' },
    { keys: 'D', description: 'Go to Dashboard' },
    { keys: 'B', description: 'Go to Bookmarks' },
    { keys: '/', description: 'Focus Search' },
    { keys: '←', description: 'Previous Ayah' },
    { keys: '→', description: 'Next Ayah' },
    { keys: 'Space', description: 'Play/Pause Audio' },
    { keys: 'H', description: 'Toggle Hide Mode' },
    { keys: 'T', description: 'Toggle Translation' },
    { keys: '?', description: 'Show Keyboard Shortcuts' },
    { keys: 'Esc', description: 'Close Modal / Go Back' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <span className="sr-only">Close</span>✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">?</kbd> anywhere to see this help
        </p>
      </div>
    </div>
  );
}

// Global keyboard shortcuts for the app
export function GlobalShortcuts({ onNavigate }: { onNavigate: (path: string) => void }) {
  const shortcuts: KeyboardShortcut[] = [
    { key: 'q', action: () => onNavigate('/quran'), description: 'Go to Quran' },
    { key: 's', action: () => onNavigate('/search'), description: 'Go to Search' },
    { key: 'r', action: () => onNavigate('/revision'), description: 'Start Revision' },
    { key: 'd', action: () => onNavigate('/dashboard'), description: 'Go to Dashboard' },
    { key: 'b', action: () => onNavigate('/bookmarks'), description: 'Go to Bookmarks' },
  ];

  useKeyboardShortcuts(shortcuts);

  return null;
}
