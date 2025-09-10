import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
    searchGeoLocations,
    getUserGeolocationHistory
} from '../controllers/geolocation.controller';
import { ensureDbConnected } from '../middleware/dbConnection';

const router = Router();

router.use(ensureDbConnected);

router.post('/search', isAuthenticated, searchGeoLocations);
router.get('/', isAuthenticated, getUserGeolocationHistory);

export default router;