import { Request, Response, NextFunction } from 'express';

export const validateUserInput = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
        errors.push('Valid email is required');
    }

    if (req.method === 'POST' && (!password || password.length < 6)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            errors
        });
        return;
    }

    next();
};