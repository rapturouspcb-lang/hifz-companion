import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { SurahList } from '@/components/dashboard/SurahList';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              حافظ ساتھی
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Hifz Companion
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Your intelligent Quran memorization partner. Master Mutashabihat, track your progress,
              and strengthen your Hifz with smart revision tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quran">
                <Button size="lg" variant="secondary">
                  Start Reading
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-700">
                  My Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔄"
              title="Mutashabihat Intelligence"
              description="Automatically detect and highlight similar verses across the Quran. Compare word-by-word differences."
            />
            <FeatureCard
              icon="📖"
              title="13-Line Mushaf"
              description="Authentic 13-line Indo-Pak Mushaf layout with clear Arabic text and Urdu translation."
            />
            <FeatureCard
              icon="🔊"
              title="Audio Recitation"
              description="Listen to beautiful recitations by renowned Qaris. Slow mode for memorization."
            />
            <FeatureCard
              icon="📊"
              title="Progress Tracking"
              description="Track your memorization progress, daily streaks, and identify weak areas."
            />
            <FeatureCard
              icon="🎯"
              title="Revision Planner"
              description="Smart daily revision planner based on the Sabaq-Manzil system."
            />
            <FeatureCard
              icon="🔍"
              title="Smart Search"
              description="Search by Arabic text, meaning, or topic. Voice search supported."
            />
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Quick Access
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Continue Reading</h3>
              <SurahList />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Today&apos;s Goals</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="space-y-4">
                  <GoalItem label="New Sabaq" progress={0} total={1} />
                  <GoalItem label="Sabaq Para" progress={0} total={5} />
                  <GoalItem label="Manzil" progress={0} total={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function GoalItem({ label, progress, total }: { label: string; progress: number; total: number }) {
  const percentage = (progress / total) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{progress}/{total}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
