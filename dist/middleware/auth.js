"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGuest = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuthenticated = (req, res, next) => {
    try {
        let token = req.signedCookies?.token;
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
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
exports.isAuthenticated = isAuthenticated;
const isGuest = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            res.status(403).json({
                success: false,
                message: 'You are already logged in'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.clearCookie('token');
        next();
    }
};
exports.isGuest = isGuest;
