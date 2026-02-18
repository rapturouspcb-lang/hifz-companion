import { Router } from 'express';
import quranRoutes from './quran.routes.js';
import mutashabihatRoutes from './mutashabihat.routes.js';
import searchRoutes from './search.routes.js';
import audioRoutes from './audio.routes.js';
import userRoutes from './user.routes.js';
import progressRoutes from './progress.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: 'Hifz Companion API',
    version: '1.0.0',
    description: 'Production-grade Quran memorization companion for Huffaz',
    endpoints: {
      quran: '/quran',
      mutashabihat: '/mutashabihat',
      search: '/search',
      audio: '/audio',
      users: '/users',
      progress: '/progress'
    }
  });
});

router.use('/quran', quranRoutes);
router.use('/mutashabihat', mutashabihatRoutes);
router.use('/search', searchRoutes);
router.use('/audio', audioRoutes);
router.use('/users', userRoutes);
router.use('/progress', progressRoutes);

export default router;
