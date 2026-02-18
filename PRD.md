# Hifz Companion - Product Requirements Document

## Executive Summary

**Hifz Companion** is a production-grade Quran application designed specifically for Huffaz (Quran memorizers). Unlike basic Quran readers, this application focuses on deep memorization support, structured revision workflows, and intelligent Mutashabihat (similar verse) detection to help Huffaz maintain and strengthen their memorization.

---

## 1. Product Vision

To become the definitive digital companion for Quran memorizers worldwide, combining traditional Hifz methodologies with modern technology to create an intelligent, personalized revision experience that strengthens memorization and prevents common errors.

### Core Principles

1. **Accuracy First** - Every ayah, translation, and recitation must be verified and authentic
2. **Hifz-Centric Design** - Every feature serves the memorization journey
3. **Intelligent Assistance** - Use technology to identify and prevent common mistakes
4. **Respectful Experience** - Clean, distraction-free interface befitting the Quran

---

## 2. User Personas

### Primary Personas

#### Persona 1: Hafiz Student (Age 10-25)
- **Profile**: Currently memorizing Quran under a teacher's guidance
- **Goals**: Complete memorization, retain what's learned, prepare for revision
- **Pain Points**: Confusing similar verses, forgetting recently memorized portions, lack of structured revision
- **Key Features Used**: Mutashabihat alerts, daily revision planner, progress tracking

#### Persona 2: Practicing Hafiz (Age 25-50)
- **Profile**: Completed Hifz, needs regular revision to maintain
- **Goals**: Maintain memorization, identify weak areas, efficient daily revision
- **Pain Points**: Time constraints, weak surahs, mixing up similar verses
- **Key Features Used**: Quick revision mode, weak surah tracking, Mutashabihat comparison

#### Persona 3: Quran Teacher
- **Profile**: Teaching Hifz to students
- **Goals**: Track student progress, assign revision, identify common mistakes
- **Pain Points**: Managing multiple students, tracking individual progress
- **Key Features Used**: Mistake tracking, progress dashboard, revision assignment

#### Persona 4: Adult Revisiting Quran
- **Profile**: Learned Quran earlier, wants to re-strengthen connection
- **Goals**: Refresh memorization, understand meaning, consistent practice
- **Pain Points**: Forgotten portions, limited time, need for translation
- **Key Features Used**: Translation toggle, slow recitation, daily tilawat tracking

---

## 3. Feature Specifications

### 3.1 Mutashabihat Intelligence Module (Core Feature)

**Problem**: Huffaz often confuse verses that are similar in wording but appear in different surahs. This is one of the most common sources of mistakes.

**Solution**: An intelligent system that:
- Automatically detects similar verses across the Quran
- Highlights Mutashabihat in the Mushaf view
- Provides side-by-side comparison
- Shows word-level differences with color coding
- Enables one-click navigation between related ayahs

**Technical Approach**:
```
Mutashabihat Detection Algorithm:
1. Pre-computed similarity matrix using:
   - Levenshtein distance for text similarity
   - N-gram overlap analysis
   - Root word matching (Arabic morphology)
   - Known scholarly classifications of Mutashabihat

2. Similarity Score Components:
   - Exact word matches
   - Root word matches
   - Structural similarity (verse length, word count)
   - Classical Mutashabihat references

3. Threshold-based classification:
   - High similarity (>0.8): Direct Mutashabih
   - Medium similarity (0.5-0.8): Related verses
   - Low similarity (<0.5): Not flagged
```

**UI Components**:
- Inline highlighting in Mushaf view
- Sidebar panel showing related verses
- Comparison modal with word-level diff
- Color coding: Green (identical), Yellow (similar), Orange (contextual)

### 3.2 Smart Quran Search

**Search Types**:

| Type | Description | Implementation |
|------|-------------|----------------|
| Arabic Word | Direct Arabic text search | Full-text search with diacritic handling |
| Root Search | Search by Arabic root | Morphological analysis |
| Meaning Search | Search by Urdu/English meaning | Translation indexing |
| Topic Search | Thematic search | Pre-categorized verse tags |
| Voice Search | Arabic voice input | Speech-to-text API |

**Search Features**:
- Fuzzy matching for Arabic typos
- Search suggestions and autocomplete
- Recent searches
- Search within specific surahs/juzs

### 3.3 Audio Recitation Module

**Reciters**:
1. Sheikh Abdul Basit Abdul Samad (Murattal)
2. Sheikh Abdul Basit (Mujawwad)
3. Sheikh Abdur Rahman Al-Sudais
4. Sheikh Saud Al-Shuraim

**Playback Features**:
- Ayah-by-ayah playback
- Continuous surah playback
- Repeat modes: Single ayah, Range, Surah
- Speed control: 0.5x, 0.75x, 1x, 1.25x
- Audio sync with Mushaf highlighting
- Offline audio caching

**Audio Quality**:
- High-quality MP3 (128kbps minimum)
- Gapless playback within surahs
- Pre-buffering for smooth playback

### 3.4 Urdu Translation

**Translation Source**: Maulana Fateh Muhammad Jalandhari (most widely accepted Urdu translation)

**Features**:
- Toggle translation on/off
- Side-by-side Arabic/Urdu view
- Inline translation below ayahs
- Independent translation search
- Word-by-word translation (future)

### 3.5 Hafiz Revision Mode

**Revision Types**:

1. **Hide & Recall Mode**
   - Progressive ayah hiding
   - First letter hint system
   - Voice recitation verification (future)
   - Self-marking correctness

2. **Daily Revision Planner**
   - Configurable revision schedule
   - New memorization vs. old revision balance
   - Juz-based rotation (Sabaq, Manzil system)
   - Custom surah lists

3. **Mistake Tracking**
   - Mark ayahs with mistakes
   - Categorize: Stutter, Wrong word, Forgot, Mixed with similar
   - Auto-add to weak ayah list
   - Spaced repetition for mistake ayahs

4. **Progress Dashboard**
   - Memorization progress graph
   - Revision streak counter
   - Weak surah heatmap
   - Weekly/monthly statistics

### 3.6 Personal Dashboard

**Daily Metrics**:
- Tilawat counter (pages/juz)
- Revision completion percentage
- Current streak
- Today's tasks

**Progress Visualization**:
- Juz completion wheel
- Surah mastery levels
- Weekly activity graph
- Mistake trend analysis

**Personalization**:
- Bookmarks (ayahs, pages)
- Personal notes on ayahs
- Highlighting with custom colors
- Tags for ayahs

---

## 4. User Flows

### 4.1 Daily Revision Flow

```
[Open App] → [Dashboard shows today's revision]
     ↓
[Select: New Sabaq / Old Revision / Weak Surahs]
     ↓
[Choose from: Juz selector / Surah list / Auto-suggested]
     ↓
[Revision Mode]
     ├→ [Read mode: Recite with audio]
     ├→ [Hide mode: Test memorization]
     └→ [Compare mode: Check against Mushaf]
     ↓
[Mark ayahs: Correct / Mistake / Needs review]
     ↓
[Summary: Stats, Mistakes logged, Streak updated]
     ↓
[Dashboard updated with progress]
```

### 4.2 Mutashabihat Discovery Flow

```
[Reading an ayah] → [Mutashabihat indicator shown]
     ↓
[Click indicator] → [Similar verses panel opens]
     ↓
[View similar verses with diff highlighting]
     ↓
[Click verse to navigate] → [Jump to that ayah]
     ↓
[Side-by-side comparison available]
```

### 4.3 Search Flow

```
[Open Search] → [Voice or Text input]
     ↓
[Results categorized: Arabic matches, Translations, Topics]
     ↓
[Select result] → [Navigate to ayah in Mushaf]
     ↓
[Context preserved, can return to search]
```

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 (App Router) | SSR, SEO, Performance, TypeScript |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, Consistency |
| State | Zustand + React Query | Lightweight, Server state |
| Backend | Node.js + Express/Fastify | JavaScript ecosystem, Performance |
| API | REST + tRPC | Type safety, Flexibility |
| Database | PostgreSQL | Relational data, Full-text search |
| Cache | Redis | Session, Audio metadata, Search |
| File Storage | S3/Local | Audio files, Static assets |
| Search | PostgreSQL FTS + Custom | Arabic-optimized search |
| Auth | NextAuth.js | Secure, Flexible |

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                          │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│   Pages     │  Components │   Hooks     │     State (Zustand)   │
├─────────────┴─────────────┴─────────────┴───────────────────────┤
│                    API Layer (tRPC/REST)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                            │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│   Routes    │  Services   │   Utils     │     Middleware        │
├─────────────┴─────────────┴─────────────┴───────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Core Modules                                │   │
│  ├────────────┬────────────┬────────────┬─────────────────┤   │
│  │ Quran Svc  │ Audio Svc  │ Search Svc │ Mutashabihat Svc│   │
│  ├────────────┼────────────┼────────────┼─────────────────┤   │
│  │ User Svc   │Revision Svc│ ProgressSvc│  Analytics Svc  │   │
│  └────────────┴────────────┴────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │ PostgreSQL│   │   Redis   │   │   S3/     │
        │           │   │   Cache   │   │  Storage  │
        └───────────┘   └───────────┘   └───────────┘
```

### 5.3 Database Schema

```sql
-- Core Quran Tables
CREATE TABLE surahs (
    id INT PRIMARY KEY,
    name_arabic VARCHAR(50) NOT NULL,
    name_english VARCHAR(50) NOT NULL,
    name_urdu VARCHAR(100),
    revelation_type VARCHAR(10) CHECK (revelation_type IN ('Meccan', 'Medinan')),
    ayah_count INT NOT NULL,
    page_start INT NOT NULL,
    page_end INT NOT NULL,
    juz_list INT[] NOT NULL
);

CREATE TABLE ayahs (
    id BIGINT PRIMARY KEY,
    surah_id INT REFERENCES surahs(id),
    ayah_number INT NOT NULL,
    page_number INT NOT NULL,
    juz_number INT NOT NULL,
    hizb_number INT NOT NULL,
    text_arabic TEXT NOT NULL,
    text_arabic_simple TEXT NOT NULL, -- Without diacritics for search
    text_urdu TEXT,
    text_english TEXT,
    word_count INT,
    UNIQUE(surah_id, ayah_number)
);

CREATE TABLE mutashabihat (
    id SERIAL PRIMARY KEY,
    ayah_id_1 BIGINT REFERENCES ayahs(id),
    ayah_id_2 BIGINT REFERENCES ayahs(id),
    similarity_score DECIMAL(3,2) NOT NULL,
    similarity_type VARCHAR(20) CHECK (similarity_type IN
        ('exact_repeat', 'near_repeat', 'thematic', 'structural')),
    diff_data JSONB, -- Word-level diff information
    UNIQUE(ayah_id_1, ayah_id_2)
);

-- User Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    surah_id INT REFERENCES surahs(id),
    memorization_status VARCHAR(20) DEFAULT 'not_started',
    mastery_level INT DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
    last_revised_at TIMESTAMP,
    revision_count INT DEFAULT 0,
    mistake_count INT DEFAULT 0,
    UNIQUE(user_id, surah_id)
);

CREATE TABLE revision_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    revision_type VARCHAR(20),
    surah_ids INT[],
    pages_covered DECIMAL(4,1),
    mistakes_logged INT DEFAULT 0
);

CREATE TABLE mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    ayah_id BIGINT REFERENCES ayahs(id),
    session_id UUID REFERENCES revision_sessions(id),
    mistake_type VARCHAR(20) CHECK (mistake_type IN
        ('stutter', 'wrong_word', 'forgot', 'mutashabih_confusion', 'other')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    ayah_id BIGINT REFERENCES ayahs(id),
    bookmark_type VARCHAR(20) DEFAULT 'general',
    note TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, ayah_id)
);

CREATE TABLE daily_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Search Optimization
CREATE INDEX idx_ayah_text_search ON ayahs USING GIN (to_tsvector('arabic', text_arabic_simple));
CREATE INDEX idx_ayah_urdu_search ON ayahs USING GIN (to_tsvector('urdu', text_urdu));
CREATE INDEX idx_mutashabihat_ayah1 ON mutashabihat(ayah_id_1);
CREATE INDEX idx_mutashabihat_ayah2 ON mutashabihat(ayah_id_2);
```

---

## 6. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and architecture
- [ ] Database schema and migrations
- [ ] Quran data import (Arabic text, Urdu translation)
- [ ] Basic API structure
- [ ] Frontend scaffolding

### Phase 2: Core Features (Weeks 3-4)
- [ ] Mushaf UI with 13-line layout
- [ ] Surah and ayah navigation
- [ ] Audio player integration
- [ ] Urdu translation display
- [ ] Basic search functionality

### Phase 3: Intelligence Layer (Weeks 5-6)
- [ ] Mutashabihat detection algorithm
- [ ] Similarity scoring and storage
- [ ] UI for Mutashabihat display
- [ ] Word-level diff visualization
- [ ] Cross-ayah navigation

### Phase 4: Hifz Features (Weeks 7-8)
- [ ] User authentication
- [ ] Revision session tracking
- [ ] Hide & recall mode
- [ ] Mistake logging
- [ ] Progress dashboard

### Phase 5: Polish & Launch (Weeks 9-10)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Voice search
- [ ] Offline support (PWA)
- [ ] Testing and bug fixes
- [ ] Deployment and monitoring

---

## 7. API Endpoints Overview

### Quran Endpoints
```
GET    /api/v1/surahs                    - List all surahs
GET    /api/v1/surahs/:id                - Get surah details
GET    /api/v1/surahs/:id/ayahs          - Get all ayahs in surah
GET    /api/v1/ayahs/:id                 - Get single ayah
GET    /api/v1/pages/:number             - Get page content
GET    /api/v1/juz/:number               - Get juz content
```

### Mutashabihat Endpoints
```
GET    /api/v1/ayahs/:id/mutashabihat    - Get similar ayahs
GET    /api/v1/mutashabihat/:id/compare  - Get comparison data
```

### Search Endpoints
```
GET    /api/v1/search                    - Universal search
GET    /api/v1/search/arabic             - Arabic text search
GET    /api/v1/search/topic/:topic       - Topic-based search
POST   /api/v1/search/voice              - Voice search processing
```

### Audio Endpoints
```
GET    /api/v1/reciters                  - List available reciters
GET    /api/v1/audio/:reciter/:ayah_id   - Get audio URL
GET    /api/v1/audio/:reciter/surah/:id  - Get surah audio
```

### User Endpoints
```
POST   /api/v1/auth/register             - User registration
POST   /api/v1/auth/login                - User login
GET    /api/v1/users/me                  - Current user profile
PUT    /api/v1/users/me/settings         - Update settings
```

### Progress Endpoints
```
GET    /api/v1/progress                  - User progress summary
POST   /api/v1/revision/start            - Start revision session
POST   /api/v1/revision/end              - End revision session
POST   /api/v1/mistakes                  - Log a mistake
GET    /api/v1/streak                    - Get streak info
POST   /api/v1/bookmarks                 - Create bookmark
DELETE /api/v1/bookmarks/:id             - Remove bookmark
```

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users | 1,000+ (Month 3) | Analytics |
| Session Duration | 15+ minutes | Analytics |
| Revision Completion | 70%+ | Backend tracking |
| Mistake Reduction | 30% decrease over 3 months | User progress data |
| User Retention (D7) | 40%+ | Analytics |
| App Rating | 4.5+ stars | Store reviews |

---

## 9. Future Considerations

- **Multi-language support**: English, Turkish, Indonesian translations
- **Gamification**: Achievements, leaderboards (optional)
- **Social features**: Teacher-student linking
- **AI-powered feedback**: Pronunciation verification
- **Wearables**: Quran revision reminders on smartwatch
- **Print integration**: Export custom revision sheets

---

## 10. Technical Constraints

- **Arabic Text Handling**: Must support RTL, proper diacritics rendering
- **Audio Storage**: ~2GB total for all reciters
- **Offline Support**: Core features must work offline (PWA)
- **Privacy**: User progress data encrypted, GDPR compliant
- **Performance**: Page load < 2s, API response < 200ms

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: Hifz Companion Engineering Team*
