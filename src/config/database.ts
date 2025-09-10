// config/database.ts
import mongoose, { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Prevent multiple connections in serverless environment
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  // Return ongoing connection promise if connecting
  if (cached.promise) {
    console.log('Database connection in progress...');
    return await cached.promise;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Important options for serverless
    const opts = {
      bufferCommands: false, // Disable buffering
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('Creating new database connection...');
    
    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });

    cached.conn = await cached.promise;
    return cached.conn;
    
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export default connectDB;