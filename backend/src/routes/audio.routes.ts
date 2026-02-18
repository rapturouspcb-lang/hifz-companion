import { Router } from 'express';
import AudioController from '../controllers/audio.controller.js';

const router = Router();
const audioController = new AudioController();

// Get all reciters
router.get('/reciters', audioController.getReciters);

// Get audio for specific ayah
router.get('/ayah/:ayahId', audioController.getAyahAudio);

// Get audio for entire surah
router.get('/surah/:surahId', audioController.getSurahAudio);

// Get audio for juz
router.get('/juz/:juzNumber', audioController.getJuzAudio);

// Get audio playlist for page
router.get('/page/:pageNumber', audioController.getPageAudio);

export default router;
