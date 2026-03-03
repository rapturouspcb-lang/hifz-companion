import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hifz_companion'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],

  audioStoragePath: process.env.AUDIO_STORAGE_PATH || path.resolve(process.cwd(), 'storage/audio'),
  audioBaseUrl: process.env.AUDIO_BASE_URL || 'http://localhost:3001/audio'
};
