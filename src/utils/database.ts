import mongoose from 'mongoose';
import { createClient } from 'redis';
import { config } from './config';
import { handleMongooseError, handleRedisError } from './errors';
import { DatabaseIndexingService } from './indexing';

// MongoDB connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Create essential indexes for optimal query performance
    try {
      await DatabaseIndexingService.createEssentialIndexes();
    } catch (indexError) {
      console.warn('⚠️ Warning: Some indexes could not be created:', indexError);
      // Don't fail startup for index creation issues
    }
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    const dbError = handleMongooseError(error);
    console.error('❌ MongoDB connection failed:', dbError.message);
    process.exit(1);
  }
};

// Redis connection
export const redisClient = createClient({
  url: config.redisUrl,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    
    // Handle Redis events
    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
    
    redisClient.on('disconnect', () => {
      console.warn('⚠️ Redis disconnected');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
    
  } catch (error) {
    const redisError = handleRedisError(error);
    console.error('❌ Redis connection failed:', redisError.message);
    // Don't exit process for Redis failures - app can work without cache
    console.warn('⚠️ Continuing without Redis cache');
  }
};

// Graceful shutdown
export const closeConnections = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing database connections...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing database connections...');
  await closeConnections();
  process.exit(0);
});