import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import geolocationRoutes from './routes/geolocation.routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './middleware/logger';

dotenv.config();

const app: Application = express();

app.set('trust proxy', 1);
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL!
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
console.log('CORS allowed origins:', process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL!
    : ['http://localhost:5173', 'http://localhost:5174']);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/geolocations', geolocationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;