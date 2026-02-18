import { Request, Response, NextFunction } from 'express';
import SearchService from '../services/search.service.js';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, type, language, surahId, juzNumber, limit, offset } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          status: 'fail',
          message: 'Query parameter "q" is required'
        });
        return;
      }

      const result = await this.searchService.search(q, {
        type: type as 'arabic' | 'translation' | 'all',
        language: language as 'urdu' | 'english',
        surahId: surahId ? parseInt(surahId as string, 10) : undefined,
        juzNumber: juzNumber ? parseInt(juzNumber as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  searchArabic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, limit, offset } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          status: 'fail',
          message: 'Query parameter "q" is required'
        });
        return;
      }

      const result = await this.searchService.search(q, {
        type: 'arabic',
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  searchTranslation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, language, limit, offset } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          status: 'fail',
          message: 'Query parameter "q" is required'
        });
        return;
      }

      const result = await this.searchService.search(q, {
        type: 'translation',
        language: (language as 'urdu' | 'english') || 'urdu',
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0
      });

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  searchByTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { topic } = req.params;

      const result = await this.searchService.searchByTopic(topic);

      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  getTopics = (req: Request, res: Response) => {
    const topics = this.searchService.getAvailableTopics();
    res.json({
      status: 'success',
      data: { topics }
    });
  };
}

export default SearchController;
