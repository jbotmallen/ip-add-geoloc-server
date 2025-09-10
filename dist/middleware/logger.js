"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = (req, res, next) => {
    const { method, originalUrl } = req;
    const timestamp = new Date().toISOString();
    const ipAddress = req.ip || req.connection.remoteAddress;
    console.log(`[${timestamp}] ${method} ${originalUrl} - ${ipAddress}`);
    next();
};
exports.default = logger;
