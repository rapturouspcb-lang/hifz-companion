# API Documentation

## Base URL

```
Development: http://localhost:3001/api/v1
Production: https://api.hifzcompanion.com/api/v1
```

## Authentication

Protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Quran Endpoints

### GET /quran/surahs

List all 114 surahs.

**Response:**
```json
{
  "status": "success",
  "data": {
    "surahs": [
      {
        "id": 1,
        "nameArabic": "الفاتحة",
        "nameEnglish": "Al-Fatihah",
        "nameUrdu": "الفاتحہ",
        "revelationType": "Meccan",
        "ayahCount": 7,
        "pageStart": 1,
        "pageEnd": 1
      }
    ],
    "count": 114
  }
}
```

### GET /quran/surahs/:id

Get a specific surah by ID (1-114).

### GET /quran/surahs/:id/ayahs

Get all ayahs in a surah.

### GET /quran/ayahs/:id

Get a specific ayah by global ID (1-6236).

### GET /quran/pages/:number

Get all ayahs on a specific page (1-604).

### GET /quran/juz/:number

Get all ayahs in a specific juz (1-30).

---

## Mutashabihat Endpoints

### GET /mutashabihat/ayahs/:id

Get all similar ayahs for a specific ayah.

**Response:**
```json
{
  "status": "success",
  "data": {
    "ayahId": 1,
    "mutashabihat": [
      {
        "ayahId": 1,
        "similarAyah": {
          "id": 776,
          "surahId": 6,
          "ayahNumber": 45,
          "textArabic": "...",
          "surahName": "Al-An'am"
        },
        "similarityScore": 0.92,
        "similarityType": "exact_repeat",
        "diffData": {
          "words1": ["...", "..."],
          "words2": ["...", "..."],
          "diff": [
            {"type": "equal", "value": "..."},
            {"type": "change", "value": "..."}
          ]
        }
      }
    ],
    "count": 3
  }
}
```

### GET /mutashabihat/compare/:ayahId1/:ayahId2

Get detailed comparison between two ayahs.

### GET /mutashabihat/stats

Get statistics about Mutashabihat in the database.

---

## Search Endpoints

### GET /search?q=query&type=all

Universal search across Arabic text and translations.

**Parameters:**
- `q` (required): Search query
- `type`: 'arabic', 'translation', or 'all' (default: 'all')
- `language`: 'urdu' or 'english' (default: 'urdu')
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

### GET /search/arabic?q=query

Search in Arabic text only.

### GET /search/topic/:topic

Search by topic (e.g., 'sabr', 'jannah', 'salah').

### GET /search/topics

Get list of available topics.

---

## Audio Endpoints

### GET /audio/reciters

List all available reciters.

**Response:**
```json
{
  "status": "success",
  "data": {
    "reciters": [
      {
        "id": "abdul_basit_murattal",
        "nameEnglish": "Abdul Basit Abdul Samad",
        "nameArabic": "عبد الباسط عبد الصمد",
        "style": "Murattal"
      }
    ]
  }
}
```

### GET /audio/ayah/:ayahId?reciter=abdul_basit_murattal

Get audio URL for a specific ayah.

### GET /audio/surah/:surahId

Get audio playlist for entire surah.

---

## User Endpoints

### POST /users/register

Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "Ahmed"
}
```

### POST /users/login

Login and receive JWT token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "Ahmed"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /users/me

Get current user profile (requires auth).

### PUT /users/me/settings

Update user settings (requires auth).

---

## Progress Endpoints (All require authentication)

### GET /progress

Get overall progress overview.

### PUT /progress/surahs/:surahId

Update progress for a specific surah.

### POST /progress/revision/start

Start a new revision session.

**Body:**
```json
{
  "revisionType": "sabaq",
  "surahIds": [1, 2, 3]
}
```

### POST /progress/revision/:sessionId/end

End a revision session.

### POST /progress/mistakes

Log a mistake.

**Body:**
```json
{
  "ayahId": 123,
  "mistakeType": "mutashabih_confusion",
  "notes": "Mixed up with similar ayah"
}
```

### GET /progress/streak

Get current streak information.

### POST /progress/bookmarks

Add a bookmark.

### DELETE /progress/bookmarks/:ayahId

Remove a bookmark.

---

## Error Responses

All errors follow this format:

```json
{
  "status": "fail",
  "message": "Error description"
}
```

Common HTTP status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (not authorized)
- 404: Not Found
- 500: Internal Server Error
