import mongoose, { Document, Schema } from 'mongoose';

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

const CommentSchema = new Schema<IComment>({
  postId: {
    type: String,
    required: true,
    index: true,
  },
  authorId: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  likedBy: [{
    type: String,
    index: true,
  }],
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  parentCommentId: {
    type: String,
    index: true,
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, createdAt: -1 });


// Virtual for reply count
CommentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Simple validation middleware
CommentSchema.pre('save', function(next) {
  // Just basic validation, no complex moderation
  next();
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);