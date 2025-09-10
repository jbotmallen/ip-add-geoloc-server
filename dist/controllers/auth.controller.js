"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.getSession = exports.logout = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    signed: true
};
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
            return;
        }
        const user = await user_1.default.create({
            email,
            password
        });
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json({
            success: true,
            data: userResponse
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }
        const user = await user_1.default.findOne({ email }).select('+password');
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
        res.cookie('token', token, cookieOptions);
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({
            success: true,
            token,
            data: userResponse
        });
    }
    catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getSession = async (req, res) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
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
    }
    catch (error) {
        console.error('Session error:', error);
        res.clearCookie('token');
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
};
exports.getSession = getSession;
const getMe = async (req, res, next) => {
    try {
        const user = await user_1.default.findById(req.user?.id);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
