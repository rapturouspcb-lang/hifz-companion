-- Initial database setup commands

-- Create the database
CREATE DATABASE hifz_companion;

-- Connect to the database
\c hifz_companion;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Note: Actual schema is managed by Prisma
-- Run: npm run db:migrate
