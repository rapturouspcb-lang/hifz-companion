import { Request, Response, NextFunction } from 'express';
import QuranService from '../services/quran.service.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export class QuranController {
  private quranService: QuranService;

  constructor() {
    this.quranService = new QuranService();
  }

  getAllSurahs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surahs = await this.quranService.getAllSurahs();
      res.json({
        status: 'success',
        data: { surahs, count: surahs.length }
      });
    } catch (error) {
      next(error);
    }
  };

  getSurahById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const surah = await this.quranService.getSurahById(id);

      if (!surah) {
        throw new NotFoundError('Surah');
      }

      res.json({ status: 'success', data: surah });
    } catch (error) {
      next(error);
    }
  };

  getSurahAyahs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surahId = parseInt(req.params.id, 10);
      const includeTranslation = req.query.translation === 'true';

      const ayahs = await this.quranService.getSurahAyahs(surahId);

      res.json({
        status: 'success',
        data: {
          surahId,
          ayahs: includeTranslation ? ayahs : ayahs.map(a => ({
            id: a.id,
            ayahNumber: a.ayahNumber,
            textArabic: a.textArabic,
            pageNumber: a.pageNumber,
            juzNumber: a.juzNumber
          })),
          count: ayahs.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getAyahById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const ayah = await this.quranService.getAyahById(id);

      if (!ayah) {
        throw new NotFoundError('Ayah');
      }

      res.json({ status: 'success', data: ayah });
    } catch (error) {
      next(error);
    }
  };

  getAyahRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const start = parseInt(req.params.start, 10);
      const end = parseInt(req.params.end, 10);

      const ayahs = await this.quranService.getAyahRange(start, end);

      res.json({
        status: 'success',
        data: { ayahs, count: ayahs.length }
      });
    } catch (error) {
      next(error);
    }
  };

  getPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pageNumber = parseInt(req.params.number, 10);

      if (pageNumber < 1 || pageNumber > 604) {
        throw new NotFoundError('Page (must be 1-604)');
      }

      const page = await this.quranService.getPage(pageNumber);
      res.json({ status: 'success', data: page });
    } catch (error) {
      next(error);
    }
  };

  getJuz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const juzNumber = parseInt(req.params.number, 10);

      if (juzNumber < 1 || juzNumber > 30) {
        throw new NotFoundError('Juz (must be 1-30)');
      }

      const juz = await this.quranService.getJuz(juzNumber);
      res.json({ status: 'success', data: juz });
    } catch (error) {
      next(error);
    }
  };

  getHizb = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hizbNumber = parseInt(req.params.number, 10);

      if (hizbNumber < 1 || hizbNumber > 60) {
        throw new NotFoundError('Hizb (must be 1-60)');
      }

      const hizb = await this.quranService.getHizb(hizbNumber);
      res.json({ status: 'success', data: hizb });
    } catch (error) {
      next(error);
    }
  };
}

export default QuranController;
