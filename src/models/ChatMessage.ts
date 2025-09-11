import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  response: string;
  language: string;
  messageType: 'text' | 'voice';
  confidence: number;
  relatedTopics: string[];
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa']
  },
  messageType: {
    type: String,
    required: true,
    enum: ['text', 'voice'],
    default: 'text'
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.8
  },
  relatedTopics: [{
    type: String,
    trim: true
  }],
  audioUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ChatMessageSchema.index({ userId: 1, createdAt: -1 });
ChatMessageSchema.index({ language: 1 });

// Additional indexes for common chat queries
ChatMessageSchema.index({ messageType: 1, createdAt: -1 });
ChatMessageSchema.index({ userId: 1, language: 1, createdAt: -1 });
ChatMessageSchema.index({ confidence: -1 });
ChatMessageSchema.index({ relatedTopics: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);