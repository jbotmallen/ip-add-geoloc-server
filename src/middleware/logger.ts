import { Request, Response, NextFunction } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
    const { method, originalUrl } = req;
    const timestamp = new Date().toISOString();
    const ipAddress = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${originalUrl} - ${ipAddress}`);
    next();
};

export default logger;