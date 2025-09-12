import mongoose, { Document } from 'mongoose';
export interface IComment extends Document {
    postId: string;
    authorId: string;
    content: string;
    likes: number;
    likedBy: string[];
    replies: string[];
    parentCommentId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Comment.d.ts.map