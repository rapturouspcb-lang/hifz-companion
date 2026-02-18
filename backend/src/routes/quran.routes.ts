import { Router } from 'express';
import QuranController from '../controllers/quran.controller.js';

const router = Router();
const quranController = new QuranController();

// Surah endpoints
router.get('/surahs', quranController.getAllSurahs);
router.get('/surahs/:id', quranController.getSurahById);
router.get('/surahs/:id/ayahs', quranController.getSurahAyahs);

// Ayah endpoints
router.get('/ayahs/:id', quranController.getAyahById);
router.get('/ayahs/range/:start/:end', quranController.getAyahRange);

// Page and Juz endpoints
router.get('/pages/:number', quranController.getPage);
router.get('/juz/:number', quranController.getJuz);

// Hizb endpoint
router.get('/hizb/:number', quranController.getHizb);

export default router;
