import { Request, Response, NextFunction } from 'express';
import GeoLocation from '../models/geolocation';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import { validateIP } from '../utils/helpers';
import { IpInfoResponse } from '../types/responses';

export const searchGeoLocations = async (
    req: Request,
    res: Response,
) => {
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

    const validatedIp = validateIP(ipAddress);
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
        const existingGeo = await GeoLocation.findOne({ ip: ipAddress });

        if (existingGeo) {
            res.status(200).json({
                success: true,
                data: existingGeo,
                message: 'Geolocation data fetched successfully'
            });
            return;
        }

        const response = await fetch(`https://ipinfo.io/${ipAddress}/geo?token=${token}`);
        const data = (await response.json()) as IpInfoResponse;

        const decoded = jwt.verify(
            authToken,
            process.env.JWT_SECRET || 'secret',
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        const existingUser = await User.findById(req.user.id);
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

        await GeoLocation.create({
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
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Error fetching geolocation data'
        });
    }
};

export const getUserGeolocationHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
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
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET ||
            'secret'
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
        };

        const existingUser = await User.findById(req.user.id);
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
        const geoLocations = await GeoLocation.find({ searchedBy: existingUser._id })
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        const total = await GeoLocation.countDocuments({ searchedBy: existingUser._id });

        res.status(200).json({
            success: true,
            data: geoLocations,
            page,
            totalPages: Math.ceil(total / limit),
            totalRecords: total
        });
    } catch (error) {
        console.error('Error fetching geolocation history:', error);
        next(error);
    }
};