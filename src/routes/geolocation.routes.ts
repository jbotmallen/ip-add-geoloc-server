import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import {
    searchGeoLocations,
    getUserGeolocationHistory
} from '../controllers/geolocation.controller';

const router = Router();

router.post('/search', isAuthenticated, searchGeoLocations);
router.get('/', isAuthenticated, getUserGeolocationHistory);

export default router;