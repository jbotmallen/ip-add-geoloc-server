import app from './app';
import connectDB from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8000;

const startDevServer = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected successfully');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Development server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\nAvailable endpoints:');
            console.log('  POST   /api/auth/register');
            console.log('  POST   /api/auth/login');
            console.log('  POST   /api/auth/logout');
            console.log('  GET    /api/auth/');
            console.log('  GET    /api/auth/me');
            console.log('  GET    /health');
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\nSIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start dev server:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    startDevServer();
}

export default startDevServer;