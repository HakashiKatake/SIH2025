import { create } from 'zustand';
import { CommunityService, Post, Comment, PostCategory, CreatePostRequest, CreateCommentRequest } from '../services/communityService';

// Re-export types from service
export { PostCategory, type Post, type Comment } from '../services/communityService';

interface CommunityState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  selectedCategory: PostCategory | 'all';
  hasMore: boolean;
  currentPage: number;
  
  // Actions
  fetchPosts: (token: string, page?: number, category?: PostCategory) => Promise<void>;
  createPost: (postData: CreatePostRequest, token: string) => Promise<void>;
  likePost: (postId: string, token: string) => Promise<void>;
  addComment: (commentData: CreateCommentRequest, token: string) => Promise<void>;
  likeComment: (commentId: string, token: string) => Promise<void>;
  searchPosts: (query: string, token: string) => Promise<void>;
  setSelectedCategory: (category: PostCategory | 'all') => void;
  clearError: () => void;
  loadMorePosts: (token: string) => Promise<void>;
}

// Mock data for demonstration
const mockPosts: Post[] = [
  {
    id: '1',
    authorId: 'farmer1',
    authorName: 'Rajesh Kumar',
    authorAvatar: 'https://via.placeholder.com/40',
    authorRole: 'farmer',
    title: 'Best practices for organic tomato farming',
    content: 'I have been growing organic tomatoes for 5 years now. Here are some tips that have helped me increase yield while maintaining organic standards...',
    category: PostCategory.TIP,
    tags: ['organic', 'tomatoes', 'farming'],
    photos: ['https://via.placeholder.com/300x200'],
    likes: 24,
    comments: [
      {
        id: 'c1',
        postId: '1',
        authorId: 'farmer2',
        authorName: 'Priya Sharma',
        content: 'Very helpful tips! I will try these methods in my farm.',
        likes: 5,
        replies: [],
        createdAt: new Date('2024-01-15T10:30:00Z'),
      }
    ],
    isExpertVerified: false,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z'),
  },
  {
    id: '2',
    authorId: 'expert1',
    authorName: 'Dr. Suresh Patel',
    authorAvatar: 'https://via.placeholder.com/40',
    authorRole: 'expert',
    title: 'Managing pest attacks in monsoon season',
    content: 'During monsoon, crops are more susceptible to pest attacks. Here are scientifically proven methods to protect your crops...',
    category: PostCategory.TIP,
    tags: ['pest-control', 'monsoon', 'expert-advice'],
    photos: [],
    likes: 45,
    comments: [],
    isExpertVerified: true,
    createdAt: new Date('2024-01-14T14:00:00Z'),
    updatedAt: new Date('2024-01-14T14:00:00Z'),
  },
  {
    id: '3',
    authorId: 'farmer3',
    authorName: 'Amit Singh',
    authorAvatar: 'https://via.placeholder.com/40',
    authorRole: 'farmer',
    title: 'Need help with wheat crop disease',
    content: 'My wheat crop is showing yellow spots on leaves. Can anyone help identify what this might be?',
    category: PostCategory.QUESTION,
    tags: ['wheat', 'disease', 'help-needed'],
    photos: ['https://via.placeholder.com/300x200'],
    likes: 8,
    comments: [
      {
        id: 'c2',
        postId: '3',
        authorId: 'expert1',
        authorName: 'Dr. Suresh Patel',
        content: 'This looks like yellow rust. Apply fungicide immediately and ensure proper drainage.',
        likes: 12,
        replies: [],
        createdAt: new Date('2024-01-13T16:45:00Z'),
      }
    ],
    isExpertVerified: false,
    createdAt: new Date('2024-01-13T15:30:00Z'),
    updatedAt: new Date('2024-01-13T15:30:00Z'),
  },
];

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  selectedCategory: 'all',
  hasMore: true,
  currentPage: 1,

  fetchPosts: async (token: string, page: number = 1, category?: PostCategory) => {
    set({ loading: true, error: null });
    try {
      const response = await CommunityService.getPosts(
        page,
        10,
        category === 'all' ? undefined : category
      );
      
      if (page === 1) {
        set({ 
          posts: response.posts, 
          loading: false, 
          hasMore: response.hasMore,
          currentPage: 1
        });
      } else {
        set(state => ({ 
          posts: [...state.posts, ...response.posts], 
          loading: false, 
          hasMore: response.hasMore,
          currentPage: page
        }));
      }
    } catch (error: any) {
      console.error('Fetch posts failed:', error);
      set({ error: error.message || 'Failed to fetch posts', loading: false });
      
      // Fallback to mock data on error
      if (page === 1) {
        set({ posts: mockPosts, loading: false, hasMore: false });
      }
    }
  },

  createPost: async (postData: CreatePostRequest, token: string) => {
    set({ loading: true, error: null });
    try {
      const newPost = await CommunityService.createPost(postData);
      
      set(state => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }));
    } catch (error: any) {
      console.error('Create post failed:', error);
      set({ error: error.message || 'Failed to create post', loading: false });
      
      // Fallback to local creation for demo
      const mockPost: Post = {
        id: Date.now().toString(),
        authorId: 'current-user',
        authorName: 'Current User',
        authorRole: 'farmer',
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: postData.tags,
        photos: postData.photos || [],
        likes: 0,
        comments: [],
        isExpertVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set(state => ({
        posts: [mockPost, ...state.posts],
        loading: false,
      }));
    }
  },

  likePost: async (postId: string, token: string) => {
    try {
      const result = await CommunityService.togglePostLike(postId);
      
      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? { ...post, likes: result.likesCount }
            : post
        ),
      }));
    } catch (error: any) {
      console.error('Like post failed:', error);
      
      // Fallback to local update
      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        ),
      }));
    }
  },

  addComment: async (commentData: CreateCommentRequest, token: string) => {
    set({ loading: true, error: null });
    try {
      const newComment = await CommunityService.addComment(commentData);

      set(state => ({
        posts: state.posts.map(post =>
          post.id === commentData.postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        ),
        loading: false,
      }));
    } catch (error: any) {
      console.error('Add comment failed:', error);
      set({ error: error.message || 'Failed to add comment', loading: false });
      
      // Fallback to local addition
      const mockComment: Comment = {
        id: Date.now().toString(),
        postId: commentData.postId,
        authorId: 'current-user',
        authorName: 'Current User',
        content: commentData.content,
        likes: 0,
        replies: [],
        createdAt: new Date(),
      };

      set(state => ({
        posts: state.posts.map(post =>
          post.id === commentData.postId
            ? { ...post, comments: [...post.comments, mockComment] }
            : post
        ),
        loading: false,
      }));
    }
  },

  likeComment: async (commentId: string, token: string) => {
    try {
      const result = await CommunityService.toggleCommentLike(commentId);
      
      set(state => ({
        posts: state.posts.map(post => ({
          ...post,
          comments: post.comments.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: result.likesCount }
              : comment
          ),
        })),
      }));
    } catch (error: any) {
      console.error('Like comment failed:', error);
      
      // Fallback to local update
      set(state => ({
        posts: state.posts.map(post => ({
          ...post,
          comments: post.comments.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          ),
        })),
      }));
    }
  },

  searchPosts: async (query: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const response = await CommunityService.searchPosts(query);
      set({ 
        posts: response.posts, 
        loading: false, 
        hasMore: response.hasMore,
        currentPage: 1
      });
    } catch (error: any) {
      console.error('Search posts failed:', error);
      set({ error: error.message || 'Failed to search posts', loading: false });
    }
  },

  loadMorePosts: async (token: string) => {
    const { currentPage, hasMore, selectedCategory } = get();
    if (!hasMore) return;
    
    await get().fetchPosts(token, currentPage + 1, selectedCategory === 'all' ? undefined : selectedCategory);
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  clearError: () => {
    set({ error: null });
  },
}));