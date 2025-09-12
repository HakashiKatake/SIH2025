"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const communityService_1 = require("../services/communityService");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const response_1 = require("../utils/response");
const models_1 = require("../models");
const { body } = require('express-validator');
const router = express_1.default.Router();
// Simple validation middleware
const validatePost = [
    body('title').trim().isLength({ min: 5, max: 200 }),
    body('content').trim().isLength({ min: 10, max: 5000 }),
    body('category').isIn(Object.values(models_1.PostCategory)),
    validation_1.handleValidationErrors
];
const validateComment = [
    body('content').trim().isLength({ min: 1, max: 1000 }),
    validation_1.handleValidationErrors
];
// GET /api/community/posts - Get all posts
router.get('/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const result = await communityService_1.communityService.getPosts({ page, limit, category });
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'GET_POSTS_ERROR', 'Failed to get posts', 500);
    }
});
// POST /api/community/posts - Create a new post
router.post('/posts', auth_1.authenticateToken, validatePost, async (req, res) => {
    try {
        const { title, content, category, tags, photos } = req.body;
        const authorId = req.user.userId;
        const post = await communityService_1.communityService.createPost({
            authorId,
            title,
            content,
            category,
            tags: tags || [],
            photos: photos || [],
        });
        return (0, response_1.sendSuccess)(res, post, 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'CREATE_POST_ERROR', 'Failed to create post', 500);
    }
});
// GET /api/community/posts/search - Search posts
router.get('/posts/search', async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2) {
            return (0, response_1.sendError)(res, 'INVALID_QUERY', 'Search query must be at least 2 characters', 400);
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await communityService_1.communityService.searchPosts(q, { page, limit });
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'SEARCH_ERROR', 'Failed to search posts', 500);
    }
});
// GET /api/community/posts/:id - Get specific post
router.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await communityService_1.communityService.getPostById(id);
        if (!post) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Post not found', 404);
        }
        return (0, response_1.sendSuccess)(res, post);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'GET_POST_ERROR', 'Failed to get post', 500);
    }
});
// POST /api/community/posts/:id/like - Toggle like on post
router.post('/posts/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const result = await communityService_1.communityService.togglePostLike(id, userId);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'LIKE_ERROR', 'Failed to toggle like', 500);
    }
});
// POST /api/community/posts/:id/comments - Create comment
router.post('/posts/:id/comments', auth_1.authenticateToken, validateComment, async (req, res) => {
    try {
        const { id: postId } = req.params;
        const { content, parentCommentId } = req.body;
        const authorId = req.user.userId;
        const comment = await communityService_1.communityService.createComment({
            postId,
            authorId,
            content,
            parentCommentId,
        });
        return (0, response_1.sendSuccess)(res, comment, 201);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'CREATE_COMMENT_ERROR', 'Failed to create comment', 500);
    }
});
// GET /api/community/posts/:id/comments - Get comments
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const { id: postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = await communityService_1.communityService.getComments(postId, { page, limit });
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'GET_COMMENTS_ERROR', 'Failed to get comments', 500);
    }
});
// POST /api/community/comments/:id/like - Toggle like on comment
router.post('/comments/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const result = await communityService_1.communityService.toggleCommentLike(id, userId);
        return (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'LIKE_COMMENT_ERROR', 'Failed to toggle comment like', 500);
    }
});
// DELETE /api/community/posts/:id - Delete post
router.delete('/posts/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.userId;
        const deleted = await communityService_1.communityService.deletePost(id, authorId);
        if (!deleted) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Post not found or unauthorized', 404);
        }
        return (0, response_1.sendSuccess)(res, { deleted: true });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'DELETE_POST_ERROR', 'Failed to delete post', 500);
    }
});
// DELETE /api/community/comments/:id - Delete comment
router.delete('/comments/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.userId;
        const deleted = await communityService_1.communityService.deleteComment(id, authorId);
        if (!deleted) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Comment not found or unauthorized', 404);
        }
        return (0, response_1.sendSuccess)(res, { deleted: true });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'DELETE_COMMENT_ERROR', 'Failed to delete comment', 500);
    }
});
// Admin route for expert verification
router.post('/posts/:id/verify', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return (0, response_1.sendError)(res, 'FORBIDDEN', 'Admin access required', 403);
        }
        const { id } = req.params;
        const adminId = req.user.userId;
        const post = await communityService_1.communityService.verifyExpertPost(id, adminId);
        if (!post) {
            return (0, response_1.sendError)(res, 'NOT_FOUND', 'Post not found', 404);
        }
        return (0, response_1.sendSuccess)(res, post);
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'VERIFY_ERROR', 'Failed to verify post', 500);
    }
});
exports.default = router;
//# sourceMappingURL=community.js.map