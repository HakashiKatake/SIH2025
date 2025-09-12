import mongoose, { Document } from 'mongoose';
export declare enum PostCategory {
    QUESTION = "question",
    TIP = "tip",
    SUCCESS_STORY = "success_story",
    PROBLEM = "problem",
    NEWS = "news"
}
export interface IPost extends Document {
    authorId: string;
    title: string;
    content: string;
    category: PostCategory;
    tags: string[];
    photos: string[];
    likes: number;
    likedBy: string[];
    comments: string[];
    isExpertVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Post.d.ts.map