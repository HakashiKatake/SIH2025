import mongoose, { Document, Schema } from 'mongoose';

// Interface for the CropAnalysis document
export interface ICropAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  cloudinaryId: string;
  analysisResult: {
    healthStatus: 'healthy' | 'diseased' | 'pest_attack' | 'nutrient_deficiency';
    confidence: number;
    detectedIssues: string[];
    recommendations: string[];
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  cropType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const cropAnalysisSchema = new Schema<ICropAnalysis>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  analysisResult: {
    healthStatus: {
      type: String,
      enum: ['healthy', 'diseased', 'pest_attack', 'nutrient_deficiency'],
      required: true
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    detectedIssues: [{
      type: String
    }],
    recommendations: [{
      type: String,
      required: true
    }]
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    address: String
  },
  cropType: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
cropAnalysisSchema.index({ userId: 1, createdAt: -1 });
cropAnalysisSchema.index({ 'analysisResult.healthStatus': 1 });
cropAnalysisSchema.index({ cropType: 1 });

// Ensure virtual id field is included
cropAnalysisSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const CropAnalysis = mongoose.model<ICropAnalysis>('CropAnalysis', cropAnalysisSchema);