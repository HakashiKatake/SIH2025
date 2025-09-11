import mongoose from 'mongoose';
import { redisClient } from './database';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  services: {
    mongodb: {
      status: 'connected' | 'disconnected' | 'error';
      message?: string;
    };
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      message?: string;
    };
  };
  timestamp: string;
}

export const checkDatabaseHealth = async (): Promise<HealthStatus> => {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    services: {
      mongodb: { status: 'disconnected' },
      redis: { status: 'disconnected' }
    },
    timestamp: new Date().toISOString()
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthStatus.services.mongodb.status = 'connected';
    } else {
      healthStatus.services.mongodb.status = 'disconnected';
      healthStatus.services.mongodb.message = 'MongoDB not connected';
      healthStatus.status = 'unhealthy';
    }
  } catch (error) {
    healthStatus.services.mongodb.status = 'error';
    healthStatus.services.mongodb.message = error instanceof Error ? error.message : 'Unknown error';
    healthStatus.status = 'unhealthy';
  }

  // Check Redis connection
  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      healthStatus.services.redis.status = 'connected';
    } else {
      healthStatus.services.redis.status = 'disconnected';
      healthStatus.services.redis.message = 'Redis not connected';
      // Redis is optional, so don't mark overall status as unhealthy
    }
  } catch (error) {
    healthStatus.services.redis.status = 'error';
    healthStatus.services.redis.message = error instanceof Error ? error.message : 'Unknown error';
    // Redis is optional, so don't mark overall status as unhealthy
  }

  return healthStatus;
};