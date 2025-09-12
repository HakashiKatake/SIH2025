"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAIAnalysisService = void 0;
// Mock AI analysis response generator
class MockAIAnalysisService {
    /**
     * Generate mock AI analysis based on image characteristics
     * In a real implementation, this would call an actual AI service
     */
    static generateMockAnalysis(imageUrl, cropType) {
        // Simple mock logic based on image URL or random selection
        const randomIndex = Math.floor(Math.random() * this.HEALTH_STATUSES.length);
        const healthStatus = this.HEALTH_STATUSES[randomIndex];
        // Generate confidence score (higher for healthy, variable for others)
        const confidence = healthStatus === 'healthy'
            ? 0.85 + Math.random() * 0.15 // 85-100%
            : 0.65 + Math.random() * 0.25; // 65-90%
        let detectedIssues = [];
        // Select appropriate issues based on health status
        switch (healthStatus) {
            case 'diseased':
                detectedIssues = this.getRandomItems(this.DISEASE_ISSUES, 1, 3);
                break;
            case 'pest_attack':
                detectedIssues = this.getRandomItems(this.PEST_ISSUES, 1, 2);
                break;
            case 'nutrient_deficiency':
                detectedIssues = this.getRandomItems(this.NUTRIENT_ISSUES, 1, 2);
                break;
            case 'healthy':
                detectedIssues = this.getRandomItems(this.HEALTHY_OBSERVATIONS, 2, 3);
                break;
        }
        // Get recommendations based on health status
        const recommendations = [...this.RECOMMENDATIONS[healthStatus]];
        // Add crop-specific recommendations if crop type is provided
        if (cropType) {
            recommendations.push(`Specific care for ${cropType}: Monitor growth stage`);
        }
        return {
            healthStatus,
            confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
            detectedIssues,
            recommendations
        };
    }
    /**
     * Get random items from an array
     */
    static getRandomItems(array, min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    /**
     * Simulate AI processing delay
     */
    static async simulateProcessingDelay() {
        const delay = 1000 + Math.random() * 2000; // 1-3 seconds
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}
exports.MockAIAnalysisService = MockAIAnalysisService;
MockAIAnalysisService.HEALTH_STATUSES = [
    'healthy',
    'diseased',
    'pest_attack',
    'nutrient_deficiency'
];
MockAIAnalysisService.DISEASE_ISSUES = [
    'Leaf spot disease detected',
    'Fungal infection on leaves',
    'Bacterial blight symptoms',
    'Powdery mildew presence',
    'Root rot indicators'
];
MockAIAnalysisService.PEST_ISSUES = [
    'Aphid infestation detected',
    'Caterpillar damage visible',
    'Whitefly presence',
    'Thrips damage on leaves',
    'Spider mite infestation'
];
MockAIAnalysisService.NUTRIENT_ISSUES = [
    'Nitrogen deficiency symptoms',
    'Phosphorus deficiency detected',
    'Potassium deficiency signs',
    'Iron chlorosis visible',
    'Magnesium deficiency symptoms'
];
MockAIAnalysisService.HEALTHY_OBSERVATIONS = [
    'Healthy leaf color and texture',
    'Good plant structure',
    'No visible disease symptoms',
    'Optimal growth indicators'
];
MockAIAnalysisService.RECOMMENDATIONS = {
    healthy: [
        'Continue current care routine',
        'Monitor regularly for any changes',
        'Maintain proper watering schedule'
    ],
    diseased: [
        'Apply appropriate fungicide treatment',
        'Remove affected plant parts',
        'Improve air circulation around plants',
        'Reduce watering frequency to prevent spread'
    ],
    pest_attack: [
        'Apply organic neem oil spray',
        'Introduce beneficial insects if possible',
        'Remove heavily infested plant parts',
        'Monitor daily and treat early'
    ],
    nutrient_deficiency: [
        'Apply balanced fertilizer as recommended',
        'Test soil pH and adjust if needed',
        'Consider organic compost application',
        'Ensure proper drainage and watering'
    ]
};
//# sourceMappingURL=cropAnalysisService.js.map