import express, { Request, Response } from 'express';
import { communityService } from '../services/communityService';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { sendSuccess, sendError } from '../utils/response';
import { PostCategory } from '../models';
const { body } = require('express-validator');

const router = express.Router();

// Simple validation middleware
const validatePost = [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('content').trim().isLength({ min: 10, max: 5000 }),
  body('category').isIn(Object.values(PostCategory)),
  handleValidationErrors
];

const validateComment = [
  body('content').trim().isLength({ min: 1, max: 1000 }),
  handleValidationErrors
];

// GET /api/community/posts - Get all posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as PostCategory;
    
    const result = await communityService.getPosts({ page, limit, category });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'GET_POSTS_ERROR', 'Failed to get posts', 500);
  }
});

// POST /api/community/posts - Create a new post
router.post('/posts', authenticateToken, validatePost, async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags, photos } = req.body;
    const authorId = (req as any).user.userId;

    const post = await communityService.createPost({
      authorId,
      title,
      content,
      category,
      tags: tags || [],
      photos: photos || [],
    });

    return sendSuccess(res, post, 201);
  } catch (error) {
    return sendError(res, 'CREATE_POST_ERROR', 'Failed to create post', 500);
  }
});

// GET /api/community/posts/search - Search posts
router.get('/posts/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return sendError(res, 'INVALID_QUERY', 'Search query must be at least 2 characters', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await communityService.searchPosts(q, { page, limit });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'SEARCH_ERROR', 'Failed to search posts', 500);
  }
});

// GET /api/community/posts/:id - Get specific post
router.get('/posts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await communityService.getPostById(id);

    if (!post) {
      return sendError(res, 'NOT_FOUND', 'Post not found', 404);
    }

    return sendSuccess(res, post);
  } catch (error) {
    return sendError(res, 'GET_POST_ERROR', 'Failed to get post', 500);
  }
});

// POST /api/community/posts/:id/like - Toggle like on post
router.post('/posts/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await communityService.togglePostLike(id, userId);
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'LIKE_ERROR', 'Failed to toggle like', 500);
  }
});

// POST /api/community/posts/:id/comments - Create comment
router.post('/posts/:id/comments', authenticateToken, validateComment, async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { content, parentCommentId } = req.body;
    const authorId = (req as any).user.userId;

    const comment = await communityService.createComment({
      postId,
      authorId,
      content,
      parentCommentId,
    });

    return sendSuccess(res, comment, 201);
  } catch (error) {
    return sendError(res, 'CREATE_COMMENT_ERROR', 'Failed to create comment', 500);
  }
});

// GET /api/community/posts/:id/comments - Get comments
router.get('/posts/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await communityService.getComments(postId, { page, limit });
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'GET_COMMENTS_ERROR', 'Failed to get comments', 500);
  }
});

// POST /api/community/comments/:id/like - Toggle like on comment
router.post('/comments/:id/like', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const result = await communityService.toggleCommentLike(id, userId);
    return sendSuccess(res, result);
  } catch (error) {
    return sendError(res, 'LIKE_COMMENT_ERROR', 'Failed to toggle comment like', 500);
  }
});

// DELETE /api/community/posts/:id - Delete post
router.delete('/posts/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authorId = (req as any).user.userId;

    const deleted = await communityService.deletePost(id, authorId);
    if (!deleted) {
      return sendError(res, 'NOT_FOUND', 'Post not found or unauthorized', 404);
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return sendError(res, 'DELETE_POST_ERROR', 'Failed to delete post', 500);
  }
});

// DELETE /api/community/comments/:id - Delete comment
router.delete('/comments/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authorId = (req as any).user.userId;

    const deleted = await communityService.deleteComment(id, authorId);
    if (!deleted) {
      return sendError(res, 'NOT_FOUND', 'Comment not found or unauthorized', 404);
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return sendError(res, 'DELETE_COMMENT_ERROR', 'Failed to delete comment', 500);
  }
});

// Admin route for expert verification
router.post('/posts/:id/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    if ((req as any).user.role !== 'admin') {
      return sendError(res, 'FORBIDDEN', 'Admin access required', 403);
    }

    const { id } = req.params;
    const adminId = (req as any).user.userId;

    const post = await communityService.verifyExpertPost(id, adminId);
    if (!post) {
      return sendError(res, 'NOT_FOUND', 'Post not found', 404);
    }

    return sendSuccess(res, post);
  } catch (error) {
    return sendError(res, 'VERIFY_ERROR', 'Failed to verify post', 500);
  }
});

export default router;