import { IFarmingRoadmap, IMilestone, IMRLRecommendation } from '../models/FarmingRoadmap';
export interface RoadmapGenerationRequest {
    cropType: string;
    variety?: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
        state: string;
        district: string;
    };
    farmSize?: number;
    sowingDate: Date;
    preferredLanguage?: string;
}
export interface MilestoneUpdate {
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completedDate?: Date;
    notes?: string;
}
export interface ProgressUpdate {
    milestoneId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completedDate?: Date;
    notes?: string;
}
export declare class RoadmapService {
    /**
     * Generate a farming roadmap based on crop type and location
     */
    static generateRoadmap(roadmapData: RoadmapGenerationRequest, userId: string): Promise<IFarmingRoadmap>;
    /**
     * Get user's active roadmaps
     */
    static getUserRoadmaps(userId: string): Promise<IFarmingRoadmap[]>;
    /**
     * Get roadmap by ID
     */
    static getRoadmapById(roadmapId: string, userId?: string): Promise<IFarmingRoadmap | null>;
    /**
     * Update milestone progress
     */
    static updateMilestoneProgress(roadmapId: string, milestoneId: string, progressUpdate: ProgressUpdate, userId: string): Promise<IFarmingRoadmap | null>;
    /**
     * Get upcoming milestones for a user
     */
    static getUpcomingMilestones(userId: string, days?: number): Promise<Array<{
        roadmap: IFarmingRoadmap;
        milestones: IMilestone[];
    }>>;
    /**
     * Get overdue milestones for a user
     */
    static getOverdueMilestones(userId: string): Promise<Array<{
        roadmap: IFarmingRoadmap;
        milestones: IMilestone[];
    }>>;
    /**
     * Get MRL-based recommendations for a location
     */
    static getMRLRecommendations(location: {
        state: string;
        district?: string;
    }, cropType?: string): Promise<IMRLRecommendation[]>;
    /**
     * Update roadmap settings
     */
    static updateRoadmapSettings(roadmapId: string, settings: {
        weatherAlerts?: boolean;
        isActive?: boolean;
    }, userId: string): Promise<IFarmingRoadmap | null>;
    /**
     * Delete roadmap (soft delete)
     */
    static deleteRoadmap(roadmapId: string, userId: string): Promise<boolean>;
    /**
     * Get roadmap statistics for a user
     */
    static getRoadmapStatistics(userId: string): Promise<{
        totalRoadmaps: number;
        activeRoadmaps: number;
        completedRoadmaps: number;
        totalMilestones: number;
        completedMilestones: number;
        overdueMilestones: number;
        upcomingMilestones: number;
    }>;
}
//# sourceMappingURL=roadmapService.d.ts.map