"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await (0, database_1.default)()
            .then(() => {
            console.log('Database connected successfully');
        })
            .catch(err => {
            console.error('Database connection error:', err);
            process.exit(1);
        });
        const server = app_1.default.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Promise Rejection:', err);
            server.close(() => {
                process.exit(1);
            });
        });
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
