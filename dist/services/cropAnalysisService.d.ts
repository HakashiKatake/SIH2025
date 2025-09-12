import { ICropAnalysis } from '../models/CropAnalysis';
export declare class MockAIAnalysisService {
    private static readonly HEALTH_STATUSES;
    private static readonly DISEASE_ISSUES;
    private static readonly PEST_ISSUES;
    private static readonly NUTRIENT_ISSUES;
    private static readonly HEALTHY_OBSERVATIONS;
    private static readonly RECOMMENDATIONS;
    /**
     * Generate mock AI analysis based on image characteristics
     * In a real implementation, this would call an actual AI service
     */
    static generateMockAnalysis(imageUrl: string, cropType?: string): Partial<ICropAnalysis['analysisResult']>;
    /**
     * Get random items from an array
     */
    private static getRandomItems;
    /**
     * Simulate AI processing delay
     */
    static simulateProcessingDelay(): Promise<void>;
}
//# sourceMappingURL=cropAnalysisService.d.ts.map