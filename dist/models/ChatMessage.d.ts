import mongoose, { Document } from 'mongoose';
export interface IChatMessage extends Document {
    userId: mongoose.Types.ObjectId;
    message: string;
    response: string;
    language: string;
    messageType: 'text' | 'voice';
    confidence: number;
    relatedTopics: string[];
    audioUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatMessage: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage, {}, {}> & IChatMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ChatMessage.d.ts.map