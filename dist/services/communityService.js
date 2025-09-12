"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityService = exports.CommunityService = void 0;
const models_1 = require("../models");
const cache_1 = require("../utils/cache");
class CommunityService {
    // Post management
    async createPost(postData) {
        try {
            const post = new models_1.Post({
                ...postData,
                tags: postData.tags || [],
                photos: postData.photos || [],
            });
            await post.save();
            // Clear relevant caches
            await this.clearPostCaches();
            return post;
        }
        catch (error) {
            throw new Error('Failed to create post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async getPosts(options = {}) {
        try {
            const { page = 1, limit = 20, category, tags, authorId, isExpertVerified, } = options;
            const cacheKey = `posts:${JSON.stringify(options)}`;
            const cached = await cache_1.cache.get(cacheKey);
            if (cached && typeof cached === 'string') {
                return JSON.parse(cached);
            }
            const query = {};
            if (category)
                query.category = category;
            if (authorId)
                query.authorId = authorId;
            if (isExpertVerified !== undefined)
                query.isExpertVerified = isExpertVerified;
            if (tags && tags.length > 0)
                query.tags = { $in: tags };
            const skip = (page - 1) * limit;
            const [posts, total] = await Promise.all([
                models_1.Post.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('comments', 'authorId content likes createdAt')
                    .lean(),
                models_1.Post.countDocuments(query),
            ]);
            const result = {
                posts: posts,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
            // Cache for 5 minutes
            await cache_1.cache.set(cacheKey, JSON.stringify(result), 300);
            return result;
        }
        catch (error) {
            throw new Error('Failed to fetch posts: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async getPostById(postId) {
        try {
            const cacheKey = `post:${postId}`;
            const cached = await cache_1.cache.get(cacheKey);
            if (cached && typeof cached === 'string') {
                return JSON.parse(cached);
            }
            const post = await models_1.Post.findById(postId)
                .populate('comments', 'authorId content likes createdAt replies')
                .lean();
            if (post) {
                // Cache for 10 minutes
                await cache_1.cache.set(cacheKey, JSON.stringify(post), 600);
            }
            return post;
        }
        catch (error) {
            throw new Error('Failed to fetch post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async updatePost(postId, authorId, updates) {
        try {
            const post = await models_1.Post.findOneAndUpdate({ _id: postId, authorId }, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true });
            if (post) {
                await this.clearPostCaches(postId);
            }
            return post;
        }
        catch (error) {
            throw new Error('Failed to update post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async deletePost(postId, authorId) {
        try {
            const post = await models_1.Post.findOneAndDelete({ _id: postId, authorId });
            if (post) {
                // Delete all comments for this post
                await models_1.Comment.deleteMany({ postId });
                await this.clearPostCaches(postId);
                return true;
            }
            return false;
        }
        catch (error) {
            throw new Error('Failed to delete post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    // Like/Unlike functionality
    async togglePostLike(postId, userId) {
        try {
            const post = await models_1.Post.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }
            const isLiked = post.likedBy.includes(userId);
            if (isLiked) {
                // Unlike
                post.likedBy = post.likedBy.filter(id => id !== userId);
                post.likes = Math.max(0, post.likes - 1);
            }
            else {
                // Like
                post.likedBy.push(userId);
                post.likes += 1;
            }
            await post.save();
            await this.clearPostCaches(postId);
            return {
                liked: !isLiked,
                likesCount: post.likes,
            };
        }
        catch (error) {
            throw new Error('Failed to toggle post like: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    // Comment management
    async createComment(commentData) {
        try {
            const comment = new models_1.Comment(commentData);
            await comment.save();
            // Add comment to post
            const post = await models_1.Post.findById(commentData.postId);
            if (post) {
                post.comments.push(comment._id);
                await post.save();
            }
            // If it's a reply, add to parent comment
            if (commentData.parentCommentId) {
                const parentComment = await models_1.Comment.findById(commentData.parentCommentId);
                if (parentComment) {
                    parentComment.replies.push(comment._id);
                    await parentComment.save();
                }
            }
            await this.clearPostCaches(commentData.postId);
            return comment;
        }
        catch (error) {
            throw new Error('Failed to create comment: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async getComments(postId, options = {}) {
        try {
            const { page = 1, limit = 50 } = options;
            const query = {
                postId,
                parentCommentId: { $exists: false } // Only top-level comments
            };
            const skip = (page - 1) * limit;
            const [comments, total] = await Promise.all([
                models_1.Comment.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('replies', 'authorId content likes createdAt')
                    .lean(),
                models_1.Comment.countDocuments(query),
            ]);
            return {
                comments: comments,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new Error('Failed to fetch comments: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async toggleCommentLike(commentId, userId) {
        try {
            const comment = await models_1.Comment.findById(commentId);
            if (!comment) {
                throw new Error('Comment not found');
            }
            const isLiked = comment.likedBy.includes(userId);
            if (isLiked) {
                // Unlike
                comment.likedBy = comment.likedBy.filter(id => id !== userId);
                comment.likes = Math.max(0, comment.likes - 1);
            }
            else {
                // Like
                comment.likedBy.push(userId);
                comment.likes += 1;
            }
            await comment.save();
            await this.clearPostCaches(comment.postId);
            return {
                liked: !isLiked,
                likesCount: comment.likes,
            };
        }
        catch (error) {
            throw new Error('Failed to toggle comment like: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    async deleteComment(commentId, authorId) {
        try {
            const comment = await models_1.Comment.findOneAndDelete({ _id: commentId, authorId });
            if (comment) {
                // Remove from post's comments array
                await models_1.Post.findByIdAndUpdate(comment.postId, {
                    $pull: { comments: commentId }
                });
                // Remove from parent comment's replies if it's a reply
                if (comment.parentCommentId) {
                    await models_1.Comment.findByIdAndUpdate(comment.parentCommentId, {
                        $pull: { replies: commentId }
                    });
                }
                // Delete all replies to this comment
                await models_1.Comment.deleteMany({ parentCommentId: commentId });
                await this.clearPostCaches(comment.postId);
                return true;
            }
            return false;
        }
        catch (error) {
            throw new Error('Failed to delete comment: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    // Expert verification (simplified)
    async verifyExpertPost(postId, adminId) {
        try {
            const post = await models_1.Post.findByIdAndUpdate(postId, {
                isExpertVerified: true,
                updatedAt: new Date()
            }, { new: true });
            if (post) {
                await this.clearPostCaches(postId);
            }
            return post;
        }
        catch (error) {
            throw new Error('Failed to verify expert post: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    // Search functionality
    async searchPosts(query, options = {}) {
        try {
            const { page = 1, limit = 20, category } = options;
            const searchQuery = {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { content: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } }
                ]
            };
            if (category) {
                searchQuery.category = category;
            }
            const skip = (page - 1) * limit;
            const [posts, total] = await Promise.all([
                models_1.Post.find(searchQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                models_1.Post.countDocuments(searchQuery),
            ]);
            return {
                posts: posts,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new Error('Failed to search posts: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    // Cache management
    async clearPostCaches(postId) {
        try {
            // Simple cache clearing - in a real app you'd use pattern matching
            if (postId) {
                await cache_1.cache.del(`post:${postId}`);
            }
            // Clear other cache keys as needed
        }
        catch (error) {
            console.error('Failed to clear post caches:', error);
        }
    }
}
exports.CommunityService = CommunityService;
exports.communityService = new CommunityService();
//# sourceMappingURL=communityService.js.map