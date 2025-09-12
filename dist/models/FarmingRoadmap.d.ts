import mongoose, { Document } from 'mongoose';
export interface IMilestone {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'harvesting' | 'general';
    scheduledDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    priority: 'low' | 'medium' | 'high' | 'critical';
    weatherDependent: boolean;
    estimatedDuration: number;
    resources?: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMRLRecommendation {
    pesticide?: string;
    dosage?: string;
    applicationMethod?: string;
    safetyPeriod?: number;
    targetPest?: string;
    mrlLimit?: number;
    lastApplicationDate?: Date;
}
export interface IFarmingRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
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
    estimatedHarvestDate: Date;
    currentStage: 'planning' | 'sowing' | 'growing' | 'flowering' | 'harvesting' | 'completed';
    milestones: IMilestone[];
    mrlRecommendations: IMRLRecommendation[];
    weatherAlerts: boolean;
    isActive: boolean;
    completionPercentage: number;
    totalMilestones: number;
    completedMilestones: number;
    createdAt: Date;
    updatedAt: Date;
    updateProgress(): void;
    getUpcomingMilestones(days?: number): IMilestone[];
    getOverdueMilestones(): IMilestone[];
}
export declare const FarmingRoadmap: mongoose.Model<IFarmingRoadmap, {}, {}, {}, mongoose.Document<unknown, {}, IFarmingRoadmap, {}, {}> & IFarmingRoadmap & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FarmingRoadmap.d.ts.map