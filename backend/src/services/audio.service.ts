import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { NotFoundError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const AUDIO_DIR = process.env.AUDIO_DIR || path.join(process.cwd(), 'audio');
const CDN_URL = process.env.CDN_URL;

export class AudioService {
  private reciters = [
    { id: 'abdul_basit_murattal', name: 'Abdul Basit (Murattal)', baseUrl: 'https://everyayah.com/data/AbdulBasitMurattal' },
    { id: 'abdul_basit_mujawwad', name: 'Abdul Basit (Mujawwad)', baseUrl: 'https://everyayah.com/data/AbdulBasitMujawwad' },
    { id: 'sudais', name: 'Abdur Rahman Al-Sudais', baseUrl: 'https://everyayah.com/data/Sudais' },
    { id: 'shuraim', name: 'Saud Al-Shuraim', baseUrl: 'https://everyayah.com/data/Shuraim' },
    { id: 'husary', name: 'Mahmoud Khalil Al-Husary', baseUrl: 'https://everyayah.com/data/Husary' },
    { id: 'minshawi', name: 'Mohammed Siddiq Al-Minshawi', baseUrl: 'https://everyayah.com/data/Minshawi' },
  ];

  getReciters = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const recitersWithUrl = this.reciters.map(r => ({
        id: r.id,
        name: r.name,
        audioUrl: `${CDN_URL || ''}/audio/${r.id}`
      }));

      res.json({
        status: 'success',
        data: recitersWithUrl
      });
    } catch (error) {
      next(error);
    }
  };

  getAyahAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ayahId } = req.params;
      const { reciter } = req.query;
      const quality = (req.query.quality as string) || '128';

      const reciterConfig = this.reciters.find(r => r.id === reciter);
      if (!reciterConfig) {
        return res.json({
          status: 'success',
          data: {
            audioUrl: null,
            message: 'Reciter not found, using default'
          }
        });
      }

      // Get ayah to find surah and ayah number
      const ayah = await prisma.ayah.findUnique({
        where: { id: parseInt(ayahId, 10) }
      });

      if (!ayah) {
        throw new NotFoundError('Ayah not found');
      }

      // Construct audio URL
      const paddedSurah = String(ayah.surahId).padStart(3, '0');
      const paddedAyah = String(ayah.ayahNumber).padStart(3, '0');
      const audioUrl = `${reciterConfig.baseUrl}/${paddedSurah}${paddedAyah}.mp3`;

      res.json({
        status: 'success',
        data: {
          audioUrl,
          ayahId,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber,
          reciter: reciterConfig.id,
          quality
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getSurahAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { surahId } = req.params;
      const { reciter } = req.query;

      const reciterConfig = this.reciters.find(r => r.id === reciter);
      if (!reciterConfig) {
        return res.json({
          status: 'success',
          data: {
            audioUrls: [],
            message: 'Reciter not found'
          }
        });
      }

      // Get surah to find ayah count
      const surah = await prisma.surah.findUnique({
        where: { id: parseInt(surahId, 10) }
      });

      if (!surah) {
        throw new NotFoundError('Surah not found');
      }

      // Generate audio URLs for all ayahs
      const audioUrls: { ayahNumber: number; audioUrl: string }[] = [];
      for (let i = 1; i <= surah.ayahCount; i++) {
        const paddedSurah = String(surahId).padStart(3, '0');
        const paddedAyah = String(i).padStart(3, '0');
        audioUrls.push({
          ayahNumber: i,
          audioUrl: `${reciterConfig.baseUrl}/${paddedSurah}${paddedAyah}.mp3`
        });
      }

      res.json({
        status: 'success',
        data: {
          surahId: surah.id,
          surahName: surah.nameEnglish,
          reciter: reciterConfig.id,
          audioUrls
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get audio file info (for offline caching)
  getAudioFileInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reciter, surahId, ayahNumber } = req.query;

      const reciterConfig = this.reciters.find(r => r.id === reciter);
      if (!reciterConfig) {
        throw new NotFoundError('Reciter not found');
      }

      const paddedSurah = String(surahId).padStart(3, '0');
      const paddedAyah = String(ayahNumber).padStart(3, '0');
      const filename = `${paddedSurah}${paddedAyah}.mp3`;

      // In production, check if file exists in CDN
      // For now, return file info
      res.json({
        status: 'success',
        data: {
          filename,
          url: `${reciterConfig.baseUrl}/${filename}`,
          reciter: reciterConfig.id,
          surahId,
          ayahNumber
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AudioService;
