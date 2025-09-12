import mongoose, { Document } from 'mongoose';
export interface ICropAnalysis extends Document {
    userId: mongoose.Types.ObjectId;
    imageUrl: string;
    cloudinaryId: string;
    analysisResult: {
        healthStatus: 'healthy' | 'diseased' | 'pest_attack' | 'nutrient_deficiency';
        confidence: number;
        detectedIssues: string[];
        recommendations: string[];
    };
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    cropType?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CropAnalysis: mongoose.Model<ICropAnalysis, {}, {}, {}, mongoose.Document<unknown, {}, ICropAnalysis, {}, {}> & ICropAnalysis & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CropAnalysis.d.ts.map