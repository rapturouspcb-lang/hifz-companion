import { Request, Response, NextFunction } from 'express';
import { RECITERS } from '../types/index.js';
import { config } from '../config/index.js';

export class AudioController {
  getReciters = (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: { reciters: RECITERS }
    });
  };

  getAyahAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ayahId } = req.params;
      const { reciter } = req.query;

      const reciterId = (reciter as string) || 'abdul_basit_murattal';
      const reciterInfo = RECITERS.find(r => r.id === reciterId);

      if (!reciterInfo) {
        res.status(400).json({
          status: 'fail',
          message: 'Invalid reciter. Available: ' + RECITERS.map(r => r.id).join(', ')
        });
        return;
      }

      // Calculate surah and ayah number from global ayah id
      // This would normally query the database
      const audioUrl = `${config.audioBaseUrl}${reciterInfo.audioBaseUrl}/${ayahId}.mp3`;

      res.json({
        status: 'success',
        data: {
          ayahId: parseInt(ayahId, 10),
          reciter: reciterInfo,
          audioUrl
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

      const reciterId = (reciter as string) || 'abdul_basit_murattal';
      const reciterInfo = RECITERS.find(r => r.id === reciterId);

      if (!reciterInfo) {
        res.status(400).json({
          status: 'fail',
          message: 'Invalid reciter'
        });
        return;
      }

      res.json({
        status: 'success',
        data: {
          surahId: parseInt(surahId, 10),
          reciter: reciterInfo,
          playlistUrl: `${config.audioBaseUrl}${reciterInfo.audioBaseUrl}/surah/${surahId}.json`
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getJuzAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { juzNumber } = req.params;
      const { reciter } = req.query;

      const reciterId = (reciter as string) || 'abdul_basit_murattal';
      const reciterInfo = RECITERS.find(r => r.id === reciterId);

      if (!reciterInfo) {
        res.status(400).json({
          status: 'fail',
          message: 'Invalid reciter'
        });
        return;
      }

      res.json({
        status: 'success',
        data: {
          juzNumber: parseInt(juzNumber, 10),
          reciter: reciterInfo,
          playlistUrl: `${config.audioBaseUrl}${reciterInfo.audioBaseUrl}/juz/${juzNumber}.json`
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getPageAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pageNumber } = req.params;
      const { reciter } = req.query;

      const reciterId = (reciter as string) || 'abdul_basit_murattal';
      const reciterInfo = RECITERS.find(r => r.id === reciterId);

      if (!reciterInfo) {
        res.status(400).json({
          status: 'fail',
          message: 'Invalid reciter'
        });
        return;
      }

      res.json({
        status: 'success',
        data: {
          pageNumber: parseInt(pageNumber, 10),
          reciter: reciterInfo,
          playlistUrl: `${config.audioBaseUrl}${reciterInfo.audioBaseUrl}/page/${pageNumber}.json`
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AudioController;
