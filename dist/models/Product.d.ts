import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    sellerId: mongoose.Types.ObjectId;
    name: string;
    category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
    subcategory?: string;
    price: number;
    quantity: number;
    unit: string;
    description: string;
    images: string[];
    location: {
        latitude: number;
        longitude: number;
        address: string;
        state: string;
        district: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map