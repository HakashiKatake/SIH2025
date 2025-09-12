import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}
export interface IOrder extends Document {
    id: string;
    dealerId: mongoose.Types.ObjectId;
    farmerId: mongoose.Types.ObjectId;
    products: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    deliveryAddress: {
        address: string;
        city: string;
        state: string;
        country: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    orderDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    notes?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: string;
    trackingNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map