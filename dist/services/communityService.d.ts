import { IPost, PostCategory, IComment } from '../models';
export declare class CommunityService {
    createPost(postData: {
        authorId: string;
        title: string;
        content: string;
        category: PostCategory;
        tags?: string[];
        photos?: string[];
    }): Promise<IPost>;
    getPosts(options?: {
        page?: number;
        limit?: number;
        category?: PostCategory;
        tags?: string[];
        authorId?: string;
        isExpertVerified?: boolean;
    }): Promise<{
        posts: IPost[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPostById(postId: string): Promise<IPost | null>;
    updatePost(postId: string, authorId: string, updates: {
        title?: string;
        content?: string;
        category?: PostCategory;
        tags?: string[];
        photos?: string[];
    }): Promise<IPost | null>;
    deletePost(postId: string, authorId: string): Promise<boolean>;
    togglePostLike(postId: string, userId: string): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    createComment(commentData: {
        postId: string;
        authorId: string;
        content: string;
        parentCommentId?: string;
    }): Promise<IComment>;
    getComments(postId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        comments: IComment[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    toggleCommentLike(commentId: string, userId: string): Promise<{
        liked: boolean;
        likesCount: number;
    }>;
    deleteComment(commentId: string, authorId: string): Promise<boolean>;
    verifyExpertPost(postId: string, adminId: string): Promise<IPost | null>;
    searchPosts(query: string, options?: {
        page?: number;
        limit?: number;
        category?: PostCategory;
    }): Promise<{
        posts: IPost[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    private clearPostCaches;
}
export declare const communityService: CommunityService;
//# sourceMappingURL=communityService.d.ts.map