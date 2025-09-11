import { Post, IPost, PostCategory, Comment, IComment } from '../models';
import { cache } from '../utils/cache';

export class CommunityService {
  // Post management
  async createPost(postData: {
    authorId: string;
    title: string;
    content: string;
    category: PostCategory;
    tags?: string[];
    photos?: string[];
  }): Promise<IPost> {
    try {
      const post = new Post({
        ...postData,
        tags: postData.tags || [],
        photos: postData.photos || [],
      });

      await post.save();
      
      // Clear relevant caches
      await this.clearPostCaches();
      
      return post;
    } catch (error) {
      throw new Error('Failed to create post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getPosts(options: {
    page?: number;
    limit?: number;
    category?: PostCategory;
    tags?: string[];
    authorId?: string;
    isExpertVerified?: boolean;
  } = {}): Promise<{
    posts: IPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        tags,
        authorId,
        isExpertVerified,
      } = options;

      const cacheKey = `posts:${JSON.stringify(options)}`;
      const cached = await cache.get(cacheKey);
      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      const query: any = {};
      
      if (category) query.category = category;
      if (authorId) query.authorId = authorId;
      if (isExpertVerified !== undefined) query.isExpertVerified = isExpertVerified;
      if (tags && tags.length > 0) query.tags = { $in: tags };

      const skip = (page - 1) * limit;
      
      const [posts, total] = await Promise.all([
        Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('comments', 'authorId content likes createdAt')
          .lean(),
        Post.countDocuments(query),
      ]);

      const result = {
        posts: posts as IPost[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, JSON.stringify(result), 300);
      
      return result;
    } catch (error) {
      throw new Error('Failed to fetch posts: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getPostById(postId: string): Promise<IPost | null> {
    try {
      const cacheKey = `post:${postId}`;
      const cached = await cache.get(cacheKey);
      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      const post = await Post.findById(postId)
        .populate('comments', 'authorId content likes createdAt replies')
        .lean();

      if (post) {
        // Cache for 10 minutes
        await cache.set(cacheKey, JSON.stringify(post), 600);
      }

      return post as IPost;
    } catch (error) {
      throw new Error('Failed to fetch post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updatePost(postId: string, authorId: string, updates: {
    title?: string;
    content?: string;
    category?: PostCategory;
    tags?: string[];
    photos?: string[];
  }): Promise<IPost | null> {
    try {
      const post = await Post.findOneAndUpdate(
        { _id: postId, authorId },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (post) {
        await this.clearPostCaches(postId);
      }

      return post;
    } catch (error) {
      throw new Error('Failed to update post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    try {
      const post = await Post.findOneAndDelete({ _id: postId, authorId });
      
      if (post) {
        // Delete all comments for this post
        await Comment.deleteMany({ postId });
        await this.clearPostCaches(postId);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error('Failed to delete post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Like/Unlike functionality
  async togglePostLike(postId: string, userId: string): Promise<{
    liked: boolean;
    likesCount: number;
  }> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      const isLiked = post.likedBy.includes(userId);
      
      if (isLiked) {
        // Unlike
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
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
    } catch (error) {
      throw new Error('Failed to toggle post like: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Comment management
  async createComment(commentData: {
    postId: string;
    authorId: string;
    content: string;
    parentCommentId?: string;
  }): Promise<IComment> {
    try {
      const comment = new Comment(commentData);
      await comment.save();

      // Add comment to post
      const post = await Post.findById(commentData.postId);
      if (post) {
        post.comments.push(comment._id as string);
        await post.save();
      }

      // If it's a reply, add to parent comment
      if (commentData.parentCommentId) {
        const parentComment = await Comment.findById(commentData.parentCommentId);
        if (parentComment) {
          parentComment.replies.push(comment._id as string);
          await parentComment.save();
        }
      }

      await this.clearPostCaches(commentData.postId);
      
      return comment;
    } catch (error) {
      throw new Error('Failed to create comment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getComments(postId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    comments: IComment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 50 } = options;
      
      const query = { 
        postId, 
        parentCommentId: { $exists: false } // Only top-level comments
      };

      const skip = (page - 1) * limit;
      
      const [comments, total] = await Promise.all([
        Comment.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('replies', 'authorId content likes createdAt')
          .lean(),
        Comment.countDocuments(query),
      ]);

      return {
        comments: comments as IComment[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error('Failed to fetch comments: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<{
    liked: boolean;
    likesCount: number;
  }> {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      const isLiked = comment.likedBy.includes(userId);
      
      if (isLiked) {
        // Unlike
        comment.likedBy = comment.likedBy.filter(id => id !== userId);
        comment.likes = Math.max(0, comment.likes - 1);
      } else {
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
    } catch (error) {
      throw new Error('Failed to toggle comment like: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deleteComment(commentId: string, authorId: string): Promise<boolean> {
    try {
      const comment = await Comment.findOneAndDelete({ _id: commentId, authorId });
      
      if (comment) {
        // Remove from post's comments array
        await Post.findByIdAndUpdate(comment.postId, {
          $pull: { comments: commentId }
        });

        // Remove from parent comment's replies if it's a reply
        if (comment.parentCommentId) {
          await Comment.findByIdAndUpdate(comment.parentCommentId, {
            $pull: { replies: commentId }
          });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentCommentId: commentId });
        
        await this.clearPostCaches(comment.postId);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error('Failed to delete comment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Expert verification (simplified)
  async verifyExpertPost(postId: string, adminId: string): Promise<IPost | null> {
    try {
      const post = await Post.findByIdAndUpdate(
        postId,
        { 
          isExpertVerified: true,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (post) {
        await this.clearPostCaches(postId);
      }

      return post;
    } catch (error) {
      throw new Error('Failed to verify expert post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Search functionality
  async searchPosts(query: string, options: {
    page?: number;
    limit?: number;
    category?: PostCategory;
  } = {}): Promise<{
    posts: IPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 20, category } = options;
      
      const searchQuery: any = {
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
        Post.find(searchQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments(searchQuery),
      ]);

      return {
        posts: posts as IPost[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error('Failed to search posts: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Cache management
  private async clearPostCaches(postId?: string): Promise<void> {
    try {
      // Simple cache clearing - in a real app you'd use pattern matching
      if (postId) {
        await cache.del(`post:${postId}`);
      }
      // Clear other cache keys as needed
    } catch (error) {
      console.error('Failed to clear post caches:', error);
    }
  }
}

export const communityService = new CommunityService();