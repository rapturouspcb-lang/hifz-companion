-- CreateTable
CREATE TABLE "surahs" (
    "id" INTEGER NOT NULL,
    "name_arabic" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "name_urdu" TEXT,
    "revelation_type" TEXT NOT NULL,
    "ayah_count" INTEGER NOT NULL,
    "page_start" INTEGER NOT NULL,
    "page_end" INTEGER NOT NULL,
    "juz_list" INTEGER[],

    CONSTRAINT "surahs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ayahs" (
    "id" INTEGER NOT NULL,
    "surah_id" INTEGER NOT NULL,
    "ayah_number" INTEGER NOT NULL,
    "page_number" INTEGER NOT NULL,
    "juz_number" INTEGER NOT NULL,
    "hizb_number" INTEGER NOT NULL,
    "text_arabic" TEXT NOT NULL,
    "text_arabic_simple" TEXT NOT NULL,
    "text_urdu" TEXT,
    "text_english" TEXT,
    "word_count" INTEGER,

    CONSTRAINT "ayahs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutashabihat" (
    "id" SERIAL NOT NULL,
    "ayah_id_1" INTEGER NOT NULL,
    "ayah_id_2" INTEGER NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,
    "similarity_type" TEXT NOT NULL,
    "diff_data" TEXT,

    CONSTRAINT "mutashabihat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settings" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "surah_id" INTEGER NOT NULL,
    "memorization_status" TEXT NOT NULL DEFAULT 'not_started',
    "mastery_level" INTEGER NOT NULL DEFAULT 0,
    "last_revised_at" TIMESTAMP(3),
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "mistake_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "revision_type" TEXT NOT NULL,
    "surah_ids" TEXT NOT NULL,
    "pages_covered" DOUBLE PRECISION,
    "mistakes_logged" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "revision_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistakes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ayah_id" INTEGER NOT NULL,
    "session_id" TEXT,
    "mistake_type" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ayah_id" INTEGER NOT NULL,
    "bookmark_type" TEXT NOT NULL DEFAULT 'general',
    "note" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ayahs_page_number_idx" ON "ayahs"("page_number");

-- CreateIndex
CREATE INDEX "ayahs_juz_number_idx" ON "ayahs"("juz_number");

-- CreateIndex
CREATE UNIQUE INDEX "ayahs_surah_id_ayah_number_key" ON "ayahs"("surah_id", "ayah_number");

-- CreateIndex
CREATE INDEX "mutashabihat_ayah_id_1_idx" ON "mutashabihat"("ayah_id_1");

-- CreateIndex
CREATE INDEX "mutashabihat_ayah_id_2_idx" ON "mutashabihat"("ayah_id_2");

-- CreateIndex
CREATE UNIQUE INDEX "mutashabihat_ayah_id_1_ayah_id_2_key" ON "mutashabihat"("ayah_id_1", "ayah_id_2");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_surah_id_key" ON "user_progress"("user_id", "surah_id");

-- CreateIndex
CREATE INDEX "revision_sessions_user_id_idx" ON "revision_sessions"("user_id");

-- CreateIndex
CREATE INDEX "revision_sessions_started_at_idx" ON "revision_sessions"("started_at");

-- CreateIndex
CREATE INDEX "mistakes_user_id_idx" ON "mistakes"("user_id");

-- CreateIndex
CREATE INDEX "mistakes_ayah_id_idx" ON "mistakes"("ayah_id");

-- CreateIndex
CREATE INDEX "mistakes_created_at_idx" ON "mistakes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_ayah_id_key" ON "bookmarks"("user_id", "ayah_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_streaks_user_id_key" ON "daily_streaks"("user_id");

-- AddForeignKey
ALTER TABLE "ayahs" ADD CONSTRAINT "ayahs_surah_id_fkey" FOREIGN KEY ("surah_id") REFERENCES "surahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutashabihat" ADD CONSTRAINT "mutashabihat_ayah_id_1_fkey" FOREIGN KEY ("ayah_id_1") REFERENCES "ayahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutashabihat" ADD CONSTRAINT "mutashabihat_ayah_id_2_fkey" FOREIGN KEY ("ayah_id_2") REFERENCES "ayahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_surah_id_fkey" FOREIGN KEY ("surah_id") REFERENCES "surahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_sessions" ADD CONSTRAINT "revision_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_ayah_id_fkey" FOREIGN KEY ("ayah_id") REFERENCES "ayahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "revision_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_ayah_id_fkey" FOREIGN KEY ("ayah_id") REFERENCES "ayahs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_streaks" ADD CONSTRAINT "daily_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
