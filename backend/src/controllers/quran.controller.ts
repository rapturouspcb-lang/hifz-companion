import { Request, Response, NextFunction } from 'express';
import QuranService, { PaginationParams } from '../services/quran.service.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export class QuranController {
  private quranService: QuranService;

  constructor() {
    this.quranService = new QuranService();
  }

  private getPaginationParams(req: Request): PaginationParams {
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);

    if (isNaN(page) && req.query.page) {
      throw new ValidationError('Invalid page parameter');
    }
    if (isNaN(limit) && req.query.limit) {
      throw new ValidationError('Invalid limit parameter');
    }
    if (page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    return {
      page: page || undefined,
      limit: limit || undefined
    };
  }

  getAllSurahs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.getPaginationParams(req);
      const result = await this.quranService.getAllSurahs(params);
      res.json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getSurahById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id < 1 || id > 114) {
        throw new ValidationError('Surah ID must be between 1 and 114');
      }

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
      if (isNaN(surahId) || surahId < 1 || surahId > 114) {
        throw new ValidationError('Surah ID must be between 1 and 114');
      }

      const params = this.getPaginationParams(req);
      const includeTranslation = req.query.translation === 'true';

      const result = await this.quranService.getSurahAyahs(surahId, params);

      res.json({
        status: 'success',
        data: {
          surahId,
          ayahs: includeTranslation ? result.data : result.data.map(a => ({
            id: a.id,
            ayahNumber: a.ayahNumber,
            textArabic: a.textArabic,
            pageNumber: a.pageNumber,
            juzNumber: a.juzNumber
          }))
        },
        pagination: result.pagination
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
