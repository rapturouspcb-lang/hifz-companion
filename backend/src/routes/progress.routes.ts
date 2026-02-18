import { Router } from 'express';
import ProgressController from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const progressController = new ProgressController();

// All progress routes require authentication
router.use(authenticate);

// Progress overview
router.get('/', progressController.getProgressOverview);

// Surah progress
router.get('/surahs', progressController.getSurahProgress);
router.put('/surahs/:surahId', progressController.updateSurahProgress);

// Revision sessions
router.post('/revision/start', progressController.startRevisionSession);
router.post('/revision/:sessionId/end', progressController.endRevisionSession);
router.get('/revision/history', progressController.getRevisionHistory);

// Mistakes
router.post('/mistakes', progressController.logMistake);
router.get('/mistakes', progressController.getMistakes);
router.get('/mistakes/weak-ayahs', progressController.getWeakAyahs);

// Streak
router.get('/streak', progressController.getStreak);

// Bookmarks
router.get('/bookmarks', progressController.getBookmarks);
router.post('/bookmarks', progressController.addBookmark);
router.delete('/bookmarks/:ayahId', progressController.removeBookmark);

// Notes
router.post('/notes', progressController.addNote);
router.put('/notes/:ayahId', progressController.updateNote);
router.delete('/notes/:ayahId', progressController.deleteNote);

export default router;
