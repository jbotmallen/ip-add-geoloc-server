import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        process.on('unhandledRejection', (err: Error) => {
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

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();