import mongoose, { Document, Schema } from 'mongoose';

export enum PostCategory {
  QUESTION = 'question',
  TIP = 'tip',
  SUCCESS_STORY = 'success_story',
  PROBLEM = 'problem',
  NEWS = 'news',
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

const PostSchema = new Schema<IPost>({
  authorId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  category: {
    type: String,
    enum: Object.values(PostCategory),
    required: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  photos: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid photo URL format'
    }
  }],
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  likedBy: [{
    type: String,
    index: true,
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  isExpertVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
PostSchema.index({ createdAt: -1 });
PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ isExpertVerified: 1, createdAt: -1 });

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Simple validation middleware
PostSchema.pre('save', function(next) {
  // Just basic validation, no complex moderation
  next();
});

export const Post = mongoose.model<IPost>('Post', PostSchema);