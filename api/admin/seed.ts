import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../src/config/database';
import User from '../../src/models/user';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const seedToken = req.headers['x-seed-token'];
    if (seedToken !== process.env.SEED_TOKEN) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        await connectDB();

        const seedEmail = process.env.SEED_USER_EMAIL || 'admin@example.com';
        const seedPassword = process.env.SEED_USER_PASSWORD || 'Admin123!@#';

        const existingUser = await User.findOne({ email: seedEmail });

        if (!existingUser) {
            await User.create({
                email: seedEmail,
                password: seedPassword,
                isActive: true
            });

            return res.status(201).json({
                message: 'Seed user created successfully',
                email: seedEmail
            });
        }

        return res.status(200).json({
            message: 'Seed user already exists',
            email: seedEmail
        });
    } catch (error: any) {
        return res.status(500).json({
            message: 'Seeding failed',
            error: error.message
        });
    }
}