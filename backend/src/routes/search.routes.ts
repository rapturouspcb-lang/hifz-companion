import { Router } from 'express';
import SearchController from '../controllers/search.controller.js';

const router = Router();
const searchController = new SearchController();

// Universal search
router.get('/', searchController.search);

// Arabic text search
router.get('/arabic', searchController.searchArabic);

// Translation search
router.get('/translation', searchController.searchTranslation);

// Topic-based search
router.get('/topic/:topic', searchController.searchByTopic);

// Get available topics
router.get('/topics', searchController.getTopics);

export default router;
