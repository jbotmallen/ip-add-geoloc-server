import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}

interface JwtPayload {
    id: string;
    email: string;
    name: string;
}

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            if (req.path.startsWith('/api/')) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret'
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        next();
    } catch (error) {
        if (req.path.startsWith('/api/')) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }

        res.clearCookie('token');
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
};

export const isGuest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.cookies?.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET || 'secret');

            res.status(403).json({
                success: false,
                message: 'You are already logged in'
            });
            return;
        }

        next();
    } catch (error) {
        res.clearCookie('token');
        next();
    }
};