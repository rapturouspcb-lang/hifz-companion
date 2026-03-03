# Hifz Companion

A production-grade Quran memorization application for Huffaz.

## Features

### Core Features
- 📖 **Quran Navigation** - Browse surahs, ayahs, pages, and juzs
- 🔊 **Audio Playback** - Multiple reciters with sync highlighting
- 🔍 **Advanced Search** - Arabic text, translations, and topic-based search
- 📝 **Mutashabihat Intelligence** - Similar verses detection and comparison

### Memorization Tools
- 🎯 **Revision Modes** - Hide & Recall with progressive difficulty
- ✅ **Self-Marking System** - Mark ayahs as Correct/Partial/Incorrect
- 📊 **Spaced Repetition** - Intelligent review scheduling
- 📅 **Daily Revision Planner** - Sabaq, Sabaq Para, Manzil schedules
- ❌ **Mistake Tracking** - Log and analyze revision mistakes
- 🔖 **Bookmarks & Notes** - Save ayahs and add personal notes

### User Experience
- 📱 **PWA Support** - Offline-first with service worker caching
- 🌐 **Multi-Language (i18n)** - RTL support for Arabic/Urdu
- ⌨️ **Keyboard Shortcuts** - Quick navigation and controls
- 📤 **Export/Print** - Revision sheets and progress reports
- 🏆 **Gamification** - Achievements, streaks, and progress tracking

### Authentication & Security
- 🔐 **JWT Authentication** - Secure token-based auth
- 🔑 **OAuth Integration** - Google and Apple sign-in ready
- ✉️ **Email Verification** - Account verification flow
- 🔄 **Password Reset** - Secure password recovery

### For Teachers
- 👨‍🏫 **Teacher Mode** - Manage students and track progress
- 📈 **Class Analytics** - Overview of student performance

### Technical Features
- 🚀 **API Versioning** - Versioned REST API with OpenAPI docs
- 🛡️ **Input Validation** - Zod schemas and rate limiting
- 🔄 **CI/CD Pipeline** - GitHub Actions for automated testing
- 📊 **Analytics** - User and app-wide metrics

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

## Project Structure

```
hifz-companion/
├── frontend/          # Next.js application
├── backend/           # Node.js API server
├── database/          # Migrations and seeds
├── docs/              # Documentation
├── shared/            # Shared types and utilities
├── PRD.md             # Product requirements
└── package.json       # Root workspace config
```

## Documentation

- [Product Requirements (PRD.md)](./PRD.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)

## License

MIT
