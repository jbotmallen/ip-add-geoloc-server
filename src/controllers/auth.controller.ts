import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getCookieOptions } from '../utils/helpers';

const cookieOptions = {
    expires: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    signed: true
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
            return;
        }

        const user = await User.create({
            email,
            password
        });

        const userResponse = user.toObject();
        delete (userResponse as any).password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
            return;
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        user.lastLogin = new Date();
        await user.save();

        const token = user.generateAuthToken();

        res.cookie('token', token, getCookieOptions());

        const userResponse = user.toObject();
        delete (userResponse as any).password;

        res.status(200).json({
            success: true,
            token,
            data: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        res.cookie('token', '', {
            expires: new Date(0),
            httpOnly: true,
            signed: true,
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getSession = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        let token = req.signedCookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        console.log('Token:', token);

        if (!token) {
            res.status(200).json({
                success: false,
                message: 'No active session',
                data: null
            });
            return;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret',
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        res.status(200).json({
            success: true,
            message: 'Active session',
            data: req.user
        });

        return;
    } catch (error) {
        console.error('Session error:', error);
        res.clearCookie('token');
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
};


export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};