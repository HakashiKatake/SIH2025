import { api } from './apiClient';

export enum PostCategory {
  QUESTION = "question",
  TIP = "tip",
  SUCCESS_STORY = "success_story",
  PROBLEM = "problem",
  NEWS = "news",
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'farmer' | 'dealer' | 'expert';
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  photos: string[];
  likes: number;
  comments: Comment[];
  isExpertVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  photos?: string[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string; // For replies
}

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  hasMore: boolean;
}

export class CommunityService {
  /**
   * Get community posts with pagination and filtering
   */
  static async getPosts(
    page: number = 1,
    limit: number = 10,
    category?: PostCategory,
    tags?: string[],
    search?: string
  ): Promise<PostsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (category) queryParams.append('category', category);
      if (tags && tags.length > 0) queryParams.append('tags', tags.join(','));
      if (search) queryParams.append('search', search);

      const response = await api.get<PostsResponse>(`/community/posts?${queryParams}`);
      return response;
    } catch (error: any) {
      console.error('Get posts error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load posts.');
      }
    }
  }

  /**
   * Get a specific post by ID
   */
  static async getPost(postId: string): Promise<Post> {
    try {
      const response = await api.get<{ post: Post }>(`/community/posts/${postId}`);
      return response.post;
    } catch (error: any) {
      console.error('Get post error:', error);
      
      if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load post.');
      }
    }
  }

  /**
   * Create a new post
   */
  static async createPost(postData: CreatePostRequest): Promise<Post> {
    try {
      const response = await api.post<{ post: Post }>('/community/posts', postData);
      return response.post;
    } catch (error: any) {
      console.error('Create post error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid post data. Please check all fields and try again.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to create post.');
      }
    }
  }

  /**
   * Update a post
   */
  static async updatePost(postId: string, updates: Partial<CreatePostRequest>): Promise<Post> {
    try {
      const response = await api.put<{ post: Post }>(`/community/posts/${postId}`, updates);
      return response.post;
    } catch (error: any) {
      console.error('Update post error:', error);
      
      if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own posts.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update post.');
      }
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(postId: string): Promise<void> {
    try {
      await api.delete(`/community/posts/${postId}`);
    } catch (error: any) {
      console.error('Delete post error:', error);
      
      if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 403) {
        throw new Error('You can only delete your own posts.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to delete post.');
      }
    }
  }

  /**
   * Like or unlike a post
   */
  static async togglePostLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await api.post<{ liked: boolean; likesCount: number }>(`/community/posts/${postId}/like`);
      return response;
    } catch (error: any) {
      console.error('Toggle post like error:', error);
      
      if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to like post.');
      }
    }
  }

  /**
   * Add a comment to a post
   */
  static async addComment(commentData: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await api.post<{ comment: Comment }>('/community/comments', commentData);
      return response.comment;
    } catch (error: any) {
      console.error('Add comment error:', error);
      
      if (error.status === 400) {
        throw new Error('Invalid comment data. Please check your message and try again.');
      } else if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to add comment.');
      }
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const response = await api.put<{ comment: Comment }>(`/community/comments/${commentId}`, { content });
      return response.comment;
    } catch (error: any) {
      console.error('Update comment error:', error);
      
      if (error.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.status === 403) {
        throw new Error('You can only update your own comments.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to update comment.');
      }
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`/community/comments/${commentId}`);
    } catch (error: any) {
      console.error('Delete comment error:', error);
      
      if (error.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.status === 403) {
        throw new Error('You can only delete your own comments.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to delete comment.');
      }
    }
  }

  /**
   * Like or unlike a comment
   */
  static async toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await api.post<{ liked: boolean; likesCount: number }>(`/community/comments/${commentId}/like`);
      return response;
    } catch (error: any) {
      console.error('Toggle comment like error:', error);
      
      if (error.status === 404) {
        throw new Error('Comment not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to like comment.');
      }
    }
  }

  /**
   * Get trending tags
   */
  static async getTrendingTags(): Promise<string[]> {
    try {
      const response = await api.get<{ tags: string[] }>('/community/trending-tags');
      return response.tags;
    } catch (error: any) {
      console.error('Get trending tags error:', error);
      
      if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to load trending tags.');
      }
    }
  }

  /**
   * Search posts
   */
  static async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PostsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await api.get<PostsResponse>(`/community/search?${queryParams}`);
      return response;
    } catch (error: any) {
      console.error('Search posts error:', error);
      
      if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to search posts.');
      }
    }
  }

  /**
   * Report a post
   */
  static async reportPost(postId: string, reason: string, description?: string): Promise<void> {
    try {
      await api.post(`/community/posts/${postId}/report`, { reason, description });
    } catch (error: any) {
      console.error('Report post error:', error);
      
      if (error.status === 404) {
        throw new Error('Post not found.');
      } else if (error.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.type === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to report post.');
      }
    }
  }
}