# Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for Hifz Companion.

## Tables

### surahs
Stores information about the 114 surahs of the Quran.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key (1-114) |
| name_arabic | VARCHAR(50) | Arabic name of the surah |
| name_english | VARCHAR(50) | English name of the surah |
| name_urdu | VARCHAR(100) | Urdu name of the surah |
| revelation_type | VARCHAR(10) | 'Meccan' or 'Medinan' |
| ayah_count | INT | Number of ayahs in the surah |
| page_start | INT | Starting page number (1-604) |
| page_end | INT | Ending page number |
| juz_list | INT[] | Array of juz numbers this surah spans |

### ayahs
Stores all 6,236 ayahs of the Quran.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key (global ayah number 1-6236) |
| surah_id | INT | Foreign key to surahs |
| ayah_number | INT | Ayah number within the surah |
| page_number | INT | Page number in standard Mushaf |
| juz_number | INT | Juz number (1-30) |
| hizb_number | INT | Hizb number (1-60) |
| text_arabic | TEXT | Full Arabic text with diacritics |
| text_arabic_simple | TEXT | Arabic text without diacritics (for search) |
| text_urdu | TEXT | Urdu translation (Fateh Muhammad Jalandhari) |
| text_english | TEXT | English translation |
| word_count | INT | Number of words in the ayah |

### mutashabihat
Stores pairs of similar ayahs (Mutashabihat).

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ayah_id_1 | BIGINT | Foreign key to first ayah |
| ayah_id_2 | BIGINT | Foreign key to second ayah |
| similarity_score | DECIMAL(3,2) | Similarity score (0.00-1.00) |
| similarity_type | VARCHAR(20) | 'exact_repeat', 'near_repeat', 'thematic', 'structural' |
| diff_data | JSONB | Word-level diff information |

### users
Stores user accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| display_name | VARCHAR(100) | User's display name |
| created_at | TIMESTAMP | Account creation timestamp |
| settings | JSONB | User preferences |

### user_progress
Tracks memorization progress per surah.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| surah_id | INT | Foreign key to surahs |
| memorization_status | VARCHAR(20) | 'not_started', 'in_progress', 'completed', 'reviewing' |
| mastery_level | INT | Mastery percentage (0-100) |
| last_revised_at | TIMESTAMP | Last revision date |
| revision_count | INT | Number of revisions |
| mistake_count | INT | Number of mistakes logged |

### revision_sessions
Records individual revision sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| started_at | TIMESTAMP | Session start time |
| ended_at | TIMESTAMP | Session end time |
| revision_type | VARCHAR(20) | 'sabaq', 'sabaq_para', 'manzil', 'weak_surahs', 'custom' |
| surah_ids | INT[] | Surahs covered in this session |
| pages_covered | DECIMAL(4,1) | Number of pages covered |
| mistakes_logged | INT | Number of mistakes in this session |

### mistakes
Logs individual mistakes during revision.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| ayah_id | BIGINT | Foreign key to ayahs |
| session_id | UUID | Foreign key to revision_sessions |
| mistake_type | VARCHAR(20) | 'stutter', 'wrong_word', 'forgot', 'mutashabih_confusion', 'other' |
| notes | TEXT | Optional notes |
| created_at | TIMESTAMP | When mistake was logged |

### bookmarks
Stores user bookmarks and notes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| ayah_id | BIGINT | Foreign key to ayahs |
| bookmark_type | VARCHAR(20) | 'general', 'favorite', 'note', etc. |
| note | TEXT | Personal note |
| color | VARCHAR(7) | Hex color code |
| created_at | TIMESTAMP | Bookmark creation time |

### daily_streaks
Tracks user revision streaks.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Unique foreign key to users |
| current_streak | INT | Current consecutive days |
| longest_streak | INT | All-time longest streak |
| last_activity_date | DATE | Date of last activity |
| updated_at | TIMESTAMP | Last update time |

## Indexes

- `idx_ayah_text_search` - GIN index for Arabic text search
- `idx_ayah_urdu_search` - GIN index for Urdu translation search
- `idx_mutashabihat_ayah1` - Index on ayah_id_1 for fast lookup
- `idx_mutashabihat_ayah2` - Index on ayah_id_2 for fast lookup
- `idx_mistakes_user` - Index on user_id for mistake queries
- `idx_mistakes_ayah` - Index on ayah_id for ayah mistake queries

## Migrations

Run migrations using Prisma:

```bash
cd backend
npm run db:migrate
```

## Seed Data

Seed the database with initial data:

```bash
npm run db:seed
```

## Mutashabihat Computation

Compute Mutashabihat pairs (run after seeding ayahs):

```bash
npm run db:mutashabihat
```
