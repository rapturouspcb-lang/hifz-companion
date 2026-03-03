'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/lib/api';
import {
  User,
  Lock,
  Bell,
  Volume2,
  Languages,
  Palette,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSettings {
  defaultReciter: string;
  showTranslation: boolean;
  translationLanguage: string;
  mushafLayout: string;
  fontSize: string;
  theme: string;
  audioQuality: string;
  notifications: {
    revisionReminder: boolean;
    streakReminder: boolean;
    emailUpdates: boolean;
  };
}

const reciters = [
  { value: 'abdul_basit_murattal', label: 'Abdul Basit (Murattal)' },
  { value: 'abdul_basit_mujawwad', label: 'Abdul Basit (Mujawwad)' },
  { value: 'sudais', label: 'Abdur Rahman Al-Sudais' },
  { value: 'shuraim', label: 'Saud Al-Shuraim' },
];

const languages = [
  { value: 'urdu', label: 'Urdu' },
  { value: 'english', label: 'English' },
];

const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const audioQualities = [
  { value: '128', label: 'Standard (128kbps)' },
  { value: '256', label: 'High (256kbps)' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  // Password state
  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    defaultReciter: 'abdul_basit_murattal',
    showTranslation: true,
    translationLanguage: 'urdu',
    mushafLayout: '13_line',
    fontSize: 'medium',
    theme: 'light',
    audioQuality: '128',
    notifications: {
      revisionReminder: true,
      streakReminder: true,
      emailUpdates: false,
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email);
    }
  }, [user]);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await userApi.getProfile();
        if (response.data.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.data.settings }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async () => {
    setMessage(null);
    setIsSaving(true);
    try {
      const response = await userApi.updateSettings({ displayName });
      setUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }

    setIsSaving(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setMessage(null);
    setIsSaving(true);
    try {
      await userApi.updateSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Account deletion not implemented in backend yet
      setMessage({ type: 'error', text: 'Account deletion is not available yet.' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Message Banner */}
      {message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-lg flex items-center gap-2',
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          )}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>

                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled
                    helperText="Email changes require verification (coming soon)"
                  />

                  <div className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Translation Language
                    </label>
                  </div>
                  <select
                    value={settings.translationLanguage}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, translationLanguage: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>

                  <Button onClick={handleUpdateProfile} isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h2>

                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Input
                    label="New Password"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />

                  <Input
                    label="Confirm New Password"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />

                  <Button onClick={handleChangePassword} isLoading={isSaving}>
                    Update Password
                  </Button>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Appearance Settings
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, theme: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      {themes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, fontSize: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      {fontSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Translation
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display translation alongside Arabic text
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, showTranslation: !prev.showTranslation }))
                      }
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        settings.showTranslation
                          ? 'bg-primary-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                          settings.showTranslation ? 'left-6' : 'left-1'
                        )}
                      />
                    </button>
                  </div>

                  <Button onClick={handleSaveSettings} isLoading={isSaving}>
                    Save Settings
                  </Button>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === 'audio' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Audio Settings
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Reciter
                    </label>
                    <select
                      value={settings.defaultReciter}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, defaultReciter: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      {reciters.map((reciter) => (
                        <option key={reciter.value} value={reciter.value}>
                          {reciter.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Audio Quality
                    </label>
                    <select
                      value={settings.audioQuality}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, audioQuality: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      {audioQualities.map((quality) => (
                        <option key={quality.value} value={quality.value}>
                          {quality.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={handleSaveSettings} isLoading={isSaving}>
                    Save Settings
                  </Button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'revisionReminder',
                        title: 'Revision Reminders',
                        description: 'Get reminded to complete your daily revision',
                      },
                      {
                        key: 'streakReminder',
                        title: 'Streak Reminders',
                        description: 'Get notified when your streak is at risk',
                      },
                      {
                        key: 'emailUpdates',
                        title: 'Email Updates',
                        description: 'Receive updates about new features and improvements',
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.title}
                          </label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [item.key]: !prev.notifications[item.key as keyof typeof prev.notifications],
                              },
                            }))
                          }
                          className={cn(
                            'relative w-11 h-6 rounded-full transition-colors',
                            settings.notifications[item.key as keyof typeof settings.notifications]
                              ? 'bg-primary-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                              settings.notifications[item.key as keyof typeof settings.notifications]
                                ? 'left-6'
                                : 'left-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSaveSettings} isLoading={isSaving}>
                    Save Settings
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
