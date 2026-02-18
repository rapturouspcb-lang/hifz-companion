import { Request, Response, NextFunction } from 'express';
import MutashabihatService from '../services/mutashabihat.service.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export class MutashabihatController {
  private mutashabihatService: MutashabihatService;

  constructor() {
    this.mutashabihatService = new MutashabihatService();
  }

  getMutashabihatForAyah = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ayahId = parseInt(req.params.id, 10);

      const mutashabihat = await this.mutashabihatService.getMutashabihatForAyah(ayahId);

      res.json({
        status: 'success',
        data: {
          ayahId,
          mutashabihat,
          count: mutashabihat.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  compareAyahs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ayahId1 = parseInt(req.params.ayahId1, 10);
      const ayahId2 = parseInt(req.params.ayahId2, 10);

      const comparison = await this.mutashabihatService.compareAyahs(ayahId1, ayahId2);

      res.json({
        status: 'success',
        data: comparison
      });
    } catch (error) {
      if ((error as Error).message === 'One or both ayahs not found') {
        next(new NotFoundError('Ayah'));
        return;
      }
      next(error);
    }
  };

  getMutashabihatForSurah = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const surahId = parseInt(req.params.id, 10);

      const mutashabihat = await this.mutashabihatService.getMutashabihatForSurah(surahId);

      res.json({
        status: 'success',
        data: {
          surahId,
          mutashabihat,
          count: mutashabihat.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.mutashabihatService.getStats();

      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}

export default MutashabihatController;
