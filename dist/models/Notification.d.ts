import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'weather_alert' | 'roadmap_milestone' | 'crop_analysis' | 'marketplace' | 'system';
    title: string;
    message: string;
    data?: any;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    isSent: boolean;
    scheduledFor?: Date;
    sentAt?: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map