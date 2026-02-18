import { Router } from 'express';
import MutashabihatController from '../controllers/mutashabihat.controller.js';

const router = Router();
const mutashabihatController = new MutashabihatController();

// Get similar ayahs for a specific ayah
router.get('/ayahs/:id', mutashabihatController.getMutashabihatForAyah);

// Get detailed comparison between two ayahs
router.get('/compare/:ayahId1/:ayahId2', mutashabihatController.compareAyahs);

// Get all mutashabihat for a surah
router.get('/surahs/:id', mutashabihatController.getMutashabihatForSurah);

// Get mutashabihat statistics
router.get('/stats', mutashabihatController.getStats);

export default router;
