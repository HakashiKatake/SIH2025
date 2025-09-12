"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseIndexingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const CropAnalysis_1 = require("../models/CropAnalysis");
const ChatMessage_1 = require("../models/ChatMessage");
const Weather_1 = require("../models/Weather");
const FarmingRoadmap_1 = require("../models/FarmingRoadmap");
/**
 * Database indexing utility to ensure optimal query performance
 * This utility creates additional indexes beyond what's defined in the models
 */
class DatabaseIndexingService {
    /**
     * Create all essential indexes for optimal query performance
     */
    static async createEssentialIndexes() {
        console.log('🔍 Creating essential database indexes...');
        try {
            await Promise.all([
                this.createUserIndexes(),
                this.createProductIndexes(),
                this.createCropAnalysisIndexes(),
                this.createChatMessageIndexes(),
                this.createWeatherIndexes(),
                this.createRoadmapIndexes()
            ]);
            console.log('✅ All essential indexes created successfully');
        }
        catch (error) {
            console.error('❌ Error creating indexes:', error);
            throw error;
        }
    }
    /**
     * Create additional indexes for User collection
     */
    static async createUserIndexes() {
        const collection = User_1.User.collection;
        // Compound indexes for common user queries
        await collection.createIndex({ 'location.state': 1, 'location.district': 1, isActive: 1, createdAt: -1 }, { name: 'user_location_active_created' });
        await collection.createIndex({ preferredLanguage: 1, 'location.state': 1, isActive: 1 }, { name: 'user_language_location_active' });
        await collection.createIndex({ crops: 1, 'location.state': 1, isActive: 1 }, { name: 'user_crops_location_active' });
        await collection.createIndex({ farmSize: 1, 'location.state': 1, isActive: 1 }, { name: 'user_farmsize_location_active' });
        console.log('✅ User indexes created');
    }
    /**
     * Create additional indexes for Product collection
     */
    static async createProductIndexes() {
        const collection = Product_1.Product.collection;
        // Compound indexes for marketplace queries
        await collection.createIndex({ category: 1, 'location.state': 1, 'location.district': 1, isActive: 1, createdAt: -1 }, { name: 'product_category_location_active_created' });
        await collection.createIndex({ price: 1, category: 1, 'location.state': 1, isActive: 1 }, { name: 'product_price_category_location_active' });
        await collection.createIndex({ quantity: 1, unit: 1, category: 1, isActive: 1 }, { name: 'product_quantity_unit_category_active' });
        await collection.createIndex({ sellerId: 1, category: 1, isActive: 1, updatedAt: -1 }, { name: 'product_seller_category_active_updated' });
        // Geospatial index for location-based searches
        await collection.createIndex({ 'location.latitude': 1, 'location.longitude': 1, isActive: 1 }, { name: 'product_geolocation_active' });
        console.log('✅ Product indexes created');
    }
    /**
     * Create additional indexes for CropAnalysis collection
     */
    static async createCropAnalysisIndexes() {
        const collection = CropAnalysis_1.CropAnalysis.collection;
        // Compound indexes for crop analysis queries
        await collection.createIndex({ userId: 1, 'analysisResult.healthStatus': 1, createdAt: -1 }, { name: 'crop_user_health_created' });
        await collection.createIndex({ cropType: 1, 'analysisResult.healthStatus': 1, createdAt: -1 }, { name: 'crop_type_health_created' });
        await collection.createIndex({ userId: 1, cropType: 1, createdAt: -1 }, { name: 'crop_user_type_created' });
        await collection.createIndex({ 'analysisResult.confidence': -1, createdAt: -1 }, { name: 'crop_confidence_created' });
        console.log('✅ CropAnalysis indexes created');
    }
    /**
     * Create additional indexes for ChatMessage collection
     */
    static async createChatMessageIndexes() {
        const collection = ChatMessage_1.ChatMessage.collection;
        // Compound indexes for chat queries
        await collection.createIndex({ userId: 1, messageType: 1, language: 1, createdAt: -1 }, { name: 'chat_user_type_language_created' });
        await collection.createIndex({ language: 1, confidence: -1, createdAt: -1 }, { name: 'chat_language_confidence_created' });
        await collection.createIndex({ relatedTopics: 1, language: 1, createdAt: -1 }, { name: 'chat_topics_language_created' });
        console.log('✅ ChatMessage indexes created');
    }
    /**
     * Create additional indexes for Weather collections
     */
    static async createWeatherIndexes() {
        const weatherCacheCollection = Weather_1.WeatherCache.collection;
        const weatherAlertCollection = Weather_1.WeatherAlert.collection;
        // Weather cache indexes
        await weatherCacheCollection.createIndex({ locationKey: 1, expiresAt: 1 }, { name: 'weather_cache_location_expires' });
        await weatherCacheCollection.createIndex({ latitude: 1, longitude: 1, expiresAt: 1 }, { name: 'weather_cache_coords_expires' });
        // Weather alert indexes
        await weatherAlertCollection.createIndex({ userId: 1, isActive: 1, expiresAt: 1, createdAt: -1 }, { name: 'weather_alert_user_active_expires_created' });
        await weatherAlertCollection.createIndex({ alertType: 1, severity: 1, isActive: 1, createdAt: -1 }, { name: 'weather_alert_type_severity_active_created' });
        console.log('✅ Weather indexes created');
    }
    /**
     * Create additional indexes for FarmingRoadmap collection
     */
    static async createRoadmapIndexes() {
        const collection = FarmingRoadmap_1.FarmingRoadmap.collection;
        // Compound indexes for roadmap queries
        await collection.createIndex({ userId: 1, cropType: 1, isActive: 1, createdAt: -1 }, { name: 'roadmap_user_crop_active_created' });
        await collection.createIndex({ cropType: 1, 'location.state': 1, isActive: 1 }, { name: 'roadmap_crop_location_active' });
        await collection.createIndex({ userId: 1, currentStage: 1, isActive: 1 }, { name: 'roadmap_user_stage_active' });
        await collection.createIndex({ estimatedHarvest: 1, isActive: 1 }, { name: 'roadmap_harvest_active' });
        console.log('✅ FarmingRoadmap indexes created');
    }
    /**
     * Get index statistics for all collections
     */
    static async getIndexStats() {
        const collections = [
            'users',
            'products',
            'cropanalyses',
            'chatmessages',
            'weathercaches',
            'weatheralerts',
            'farmingroadmaps'
        ];
        const stats = {};
        for (const collectionName of collections) {
            try {
                if (!mongoose_1.default.connection.db) {
                    stats[collectionName] = { error: 'Database connection not available' };
                    continue;
                }
                const collection = mongoose_1.default.connection.db.collection(collectionName);
                const indexes = await collection.indexes();
                stats[collectionName] = {
                    indexCount: indexes.length,
                    indexes: indexes.map((idx) => ({
                        name: idx.name,
                        key: idx.key,
                        unique: idx.unique || false,
                        sparse: idx.sparse || false
                    }))
                };
            }
            catch (error) {
                stats[collectionName] = { error: 'Collection not found or error retrieving indexes' };
            }
        }
        return stats;
    }
    /**
     * Drop all custom indexes (for maintenance)
     */
    static async dropCustomIndexes() {
        console.log('🗑️ Dropping custom indexes...');
        const customIndexNames = [
            // User indexes
            'user_location_active_created',
            'user_language_location_active',
            'user_crops_location_active',
            'user_farmsize_location_active',
            // Product indexes
            'product_category_location_active_created',
            'product_price_category_location_active',
            'product_quantity_unit_category_active',
            'product_seller_category_active_updated',
            'product_geolocation_active',
            // CropAnalysis indexes
            'crop_user_health_created',
            'crop_type_health_created',
            'crop_user_type_created',
            'crop_confidence_created',
            // ChatMessage indexes
            'chat_user_type_language_created',
            'chat_language_confidence_created',
            'chat_topics_language_created',
            // Weather indexes
            'weather_cache_location_expires',
            'weather_cache_coords_expires',
            'weather_alert_user_active_expires_created',
            'weather_alert_type_severity_active_created',
            // Roadmap indexes
            'roadmap_user_crop_active_created',
            'roadmap_crop_location_active',
            'roadmap_user_stage_active',
            'roadmap_harvest_active'
        ];
        const collections = [
            User_1.User.collection,
            Product_1.Product.collection,
            CropAnalysis_1.CropAnalysis.collection,
            ChatMessage_1.ChatMessage.collection,
            Weather_1.WeatherCache.collection,
            Weather_1.WeatherAlert.collection,
            FarmingRoadmap_1.FarmingRoadmap.collection
        ];
        for (const collection of collections) {
            for (const indexName of customIndexNames) {
                try {
                    await collection.dropIndex(indexName);
                    console.log(`✅ Dropped index: ${indexName}`);
                }
                catch (error) {
                    // Index might not exist, which is fine
                }
            }
        }
        console.log('✅ Custom indexes cleanup completed');
    }
}
exports.DatabaseIndexingService = DatabaseIndexingService;
//# sourceMappingURL=indexing.js.map