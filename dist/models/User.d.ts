import mongoose, { Document } from 'mongoose';
export interface FarmerProfile {
    name: string;
    farmName?: string;
    farmSize?: number;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    crops: string[];
    experience: number;
    certifications: string[];
    avatar?: string;
}
export interface DealerProfile {
    name: string;
    businessName: string;
    businessType: string;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    serviceAreas: string[];
    certifications: string[];
    avatar?: string;
}
export interface IUser extends Document {
    email?: string;
    phone?: string;
    password: string;
    role: 'farmer' | 'dealer' | 'admin';
    profile: FarmerProfile | DealerProfile;
    language: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    name?: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
        state: string;
        district: string;
    };
    preferredLanguage?: string;
    farmSize?: number;
    crops?: string[];
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): any;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map