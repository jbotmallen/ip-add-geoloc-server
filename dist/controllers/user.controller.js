"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const createUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        const user = await user_1.default.create({ email, password });
        const { password: _, ...userResponse } = user.toObject();
        if (!userResponse) {
            res.status(500).json({
                success: false,
                data: null,
            });
            return;
        }
        res.status(201).json({
            success: true,
            data: userResponse
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await user_1.default.find()
            .select('-password')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        const total = await user_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
