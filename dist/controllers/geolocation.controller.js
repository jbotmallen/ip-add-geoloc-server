"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserGeolocationHistory = exports.searchGeoLocations = void 0;
const geolocation_1 = __importDefault(require("../models/geolocation"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const helpers_1 = require("../utils/helpers");
const searchGeoLocations = async (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'IP address is required'
        });
        return;
    }
    const { ip: ipAddress } = ip;
    const validatedIp = (0, helpers_1.validateIP)(ipAddress);
    if (!validatedIp) {
        console.log('Invalid IP address format:', ipAddress);
        res.status(400).json({
            success: false,
            data: null,
            message: 'Invalid IP address format'
        });
        return;
    }
    const token = process.env.IPINFO_TOKEN;
    let authToken = req.signedCookies?.token;
    if (!authToken) {
        authToken = req.headers.authorization?.split(' ')[1];
    }
    if (!authToken) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    try {
        const existingGeo = await geolocation_1.default.findOne({ ip: ipAddress });
        if (existingGeo) {
            res.status(200).json({
                success: true,
                data: existingGeo,
                message: 'Geolocation data fetched successfully'
            });
            return;
        }
        const response = await fetch(`https://ipinfo.io/${ipAddress}/geo?token=${token}`);
        const data = (await response.json());
        const decoded = jsonwebtoken_1.default.verify(authToken, process.env.JWT_SECRET || 'secret');
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        const existingUser = await user_1.default.findById(req.user.id);
        if (!existingUser) {
            res.status(401).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!existingUser.isActive) {
            res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
            return;
        }
        await geolocation_1.default.create({
            ip: data.ip,
            country: data.country,
            region: data.region,
            city: data.city,
            latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : null,
            longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : null,
            searchedBy: existingUser._id,
            timezone: data.timezone,
            isp: data.org
        });
        res.status(200).json({
            success: true,
            data,
            message: 'Geolocation data fetched successfully'
        });
        return;
    }
    catch (error) {
        console.error('Error fetching geolocation data:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Error fetching geolocation data'
        });
    }
};
exports.searchGeoLocations = searchGeoLocations;
const getUserGeolocationHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let token = req.signedCookies?.token;
        if (!token) {
            token = req.headers.authorization?.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET ||
            'secret');
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        const existingUser = await user_1.default.findById(req.user.id);
        if (!existingUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!existingUser.isActive) {
            res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
            return;
        }
        const geoLocations = await geolocation_1.default.find({ searchedBy: existingUser._id })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        const total = await geolocation_1.default.countDocuments({ searchedBy: existingUser._id });
        res.status(200).json({
            success: true,
            data: geoLocations,
            page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total
        });
    }
    catch (error) {
        console.error('Error fetching geolocation history:', error);
        next(error);
    }
};
exports.getUserGeolocationHistory = getUserGeolocationHistory;
