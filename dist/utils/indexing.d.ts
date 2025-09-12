/**
 * Database indexing utility to ensure optimal query performance
 * This utility creates additional indexes beyond what's defined in the models
 */
export declare class DatabaseIndexingService {
    /**
     * Create all essential indexes for optimal query performance
     */
    static createEssentialIndexes(): Promise<void>;
    /**
     * Create additional indexes for User collection
     */
    private static createUserIndexes;
    /**
     * Create additional indexes for Product collection
     */
    private static createProductIndexes;
    /**
     * Create additional indexes for CropAnalysis collection
     */
    private static createCropAnalysisIndexes;
    /**
     * Create additional indexes for ChatMessage collection
     */
    private static createChatMessageIndexes;
    /**
     * Create additional indexes for Weather collections
     */
    private static createWeatherIndexes;
    /**
     * Create additional indexes for FarmingRoadmap collection
     */
    private static createRoadmapIndexes;
    /**
     * Get index statistics for all collections
     */
    static getIndexStats(): Promise<any>;
    /**
     * Drop all custom indexes (for maintenance)
     */
    static dropCustomIndexes(): Promise<void>;
}
//# sourceMappingURL=indexing.d.ts.map