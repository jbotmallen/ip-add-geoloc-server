import { Request, Response, NextFunction } from 'express';
import connectDB from '../config/database';

let isConnected = false;

export const ensureDbConnected = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!isConnected) {
            await connectDB();
            isConnected = true;
            console.log('Database connected via middleware');
        }
        next();
    } catch (error) {
        console.error('Database connection error in middleware:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
};