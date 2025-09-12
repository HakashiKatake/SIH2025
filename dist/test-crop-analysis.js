"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./utils/database");
const CropAnalysis_1 = require("./models/CropAnalysis");
const cropAnalysisService_1 = require("./services/cropAnalysisService");
const mongoose_1 = __importDefault(require("mongoose"));
async function testCropAnalysisService() {
    try {
        console.log('🧪 Testing Crop Analysis Service...');
        // Connect to database
        await (0, database_1.connectMongoDB)();
        console.log('✅ Connected to MongoDB');
        // Test 1: Mock AI Analysis Generation
        console.log('\n📊 Testing Mock AI Analysis Generation...');
        const mockAnalysis1 = cropAnalysisService_1.MockAIAnalysisService.generateMockAnalysis('https://example.com/healthy-crop.jpg', 'tomato');
        console.log('Mock Analysis 1 (Tomato):', JSON.stringify(mockAnalysis1, null, 2));
        const mockAnalysis2 = cropAnalysisService_1.MockAIAnalysisService.generateMockAnalysis('https://example.com/diseased-crop.jpg', 'wheat');
        console.log('Mock Analysis 2 (Wheat):', JSON.stringify(mockAnalysis2, null, 2));
        // Test 2: Database Model Creation
        console.log('\n💾 Testing CropAnalysis Model...');
        // Create a test user ID (in real scenario, this would be from authenticated user)
        const testUserId = new mongoose_1.default.Types.ObjectId();
        const testAnalysis = new CropAnalysis_1.CropAnalysis({
            userId: testUserId,
            imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/test-crop.jpg',
            cloudinaryId: 'test-crop-id',
            analysisResult: mockAnalysis1,
            location: {
                latitude: 28.6139,
                longitude: 77.2090,
                address: 'New Delhi, India'
            },
            cropType: 'tomato'
        });
        await testAnalysis.save();
        console.log('✅ Test analysis saved to database');
        console.log('Analysis ID:', testAnalysis.id);
        // Test 3: Query Analysis History
        console.log('\n📋 Testing Analysis History Query...');
        const analyses = await CropAnalysis_1.CropAnalysis.find({ userId: testUserId })
            .sort({ createdAt: -1 })
            .limit(5);
        console.log(`Found ${analyses.length} analyses for user`);
        analyses.forEach((analysis, index) => {
            console.log(`Analysis ${index + 1}:`, {
                id: analysis.id,
                healthStatus: analysis.analysisResult.healthStatus,
                confidence: analysis.analysisResult.confidence,
                cropType: analysis.cropType,
                createdAt: analysis.createdAt
            });
        });
        // Test 4: Health Status Filtering
        console.log('\n🔍 Testing Health Status Filtering...');
        const healthyAnalyses = await CropAnalysis_1.CropAnalysis.find({
            userId: testUserId,
            'analysisResult.healthStatus': 'healthy'
        });
        console.log(`Found ${healthyAnalyses.length} healthy analyses`);
        // Test 5: Crop Type Filtering
        console.log('\n🌱 Testing Crop Type Filtering...');
        const tomatoAnalyses = await CropAnalysis_1.CropAnalysis.find({
            userId: testUserId,
            cropType: /tomato/i
        });
        console.log(`Found ${tomatoAnalyses.length} tomato analyses`);
        // Test 6: Processing Delay Simulation
        console.log('\n⏱️ Testing Processing Delay Simulation...');
        const startTime = Date.now();
        await cropAnalysisService_1.MockAIAnalysisService.simulateProcessingDelay();
        const endTime = Date.now();
        console.log(`Processing delay: ${endTime - startTime}ms`);
        // Cleanup
        await CropAnalysis_1.CropAnalysis.deleteMany({ userId: testUserId });
        console.log('🧹 Cleaned up test data');
        console.log('\n✅ All Crop Analysis Service tests passed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('🔌 Database connection closed');
    }
}
// Run tests
testCropAnalysisService();
//# sourceMappingURL=test-crop-analysis.js.map