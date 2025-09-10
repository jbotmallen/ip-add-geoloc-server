import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
    status?: string;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        status,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
    error.statusCode = 404;
    next(error);
};