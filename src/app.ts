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
import { ensureDbConnected } from './middleware/dbConnection';

dotenv.config();

const app: Application = express();

const requiredEnvVars = ['SESSION_SECRET', 'MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

console.log('Environment Variables:', process.env.NODE_ENV);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

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

app.use(compression());
app.use(express.json({ limit: '10mb' }));

const cookieSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
app.use(cookieParser(cookieSecret));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

app.use(ensureDbConnected);

app.get('/api/debug/env', (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not found' });
    }

    res.json({
        NODE_ENV: process.env.NODE_ENV,
        SESSION_SECRET_EXISTS: !!process.env.SESSION_SECRET,
        MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL
    });
});
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