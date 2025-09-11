import mongoose, { Document, Schema } from 'mongoose';

// Interface for Milestone subdocument
export interface IMilestone {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_control' | 'harvesting' | 'general';
  scheduledDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  weatherDependent: boolean;
  estimatedDuration: number; // in days
  resources?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for MRL Recommendation
export interface IMRLRecommendation {
  pesticide?: string;
  dosage?: string;
  applicationMethod?: string;
  safetyPeriod?: number; // days before harvest
  targetPest?: string;
  mrlLimit?: number; // mg/kg
  lastApplicationDate?: Date;
}

// Interface for the FarmingRoadmap document
export interface IFarmingRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  cropType: string;
  variety?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  farmSize?: number; // in acres
  sowingDate: Date;
  estimatedHarvestDate: Date;
  currentStage: 'planning' | 'sowing' | 'growing' | 'flowering' | 'harvesting' | 'completed';
  milestones: IMilestone[];
  mrlRecommendations: IMRLRecommendation[];
  weatherAlerts: boolean;
  isActive: boolean;
  completionPercentage: number;
  totalMilestones: number;
  completedMilestones: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateProgress(): void;
  getUpcomingMilestones(days?: number): IMilestone[];
  getOverdueMilestones(): IMilestone[];
}

// Milestone Schema
const milestoneSchema = new Schema<IMilestone>({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [100, 'Milestone title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Milestone description is required'],
    trim: true,
    maxlength: [500, 'Milestone description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Milestone category is required'],
    enum: {
      values: ['sowing', 'irrigation', 'fertilizer', 'pest_control', 'harvesting', 'general'],
      message: 'Category must be one of: sowing, irrigation, fertilizer, pest_control, harvesting, general'
    },
    index: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    index: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'in_progress', 'completed', 'skipped'],
      message: 'Status must be one of: pending, in_progress, completed, skipped'
    },
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  resources: [{
    type: String,
    trim: true,
    maxlength: [100, 'Resource name cannot exceed 100 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// MRL Recommendation Schema
const mrlRecommendationSchema = new Schema<IMRLRecommendation>({
  pesticide: {
    type: String,
    trim: true,
    maxlength: [100, 'Pesticide name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  applicationMethod: {
    type: String,
    trim: true,
    maxlength: [100, 'Application method cannot exceed 100 characters']
  },
  safetyPeriod: {
    type: Number,
    min: [0, 'Safety period must be non-negative']
  },
  targetPest: {
    type: String,
    trim: true,
    maxlength: [100, 'Target pest cannot exceed 100 characters']
  },
  mrlLimit: {
    type: Number,
    min: [0, 'MRL limit must be non-negative']
  },
  lastApplicationDate: {
    type: Date
  }
});

// FarmingRoadmap Schema
const farmingRoadmapSchema = new Schema<IFarmingRoadmap>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    trim: true,
    maxlength: [50, 'Crop type cannot exceed 50 characters'],
    index: true
  },
  variety: {
    type: String,
    trim: true,
    maxlength: [50, 'Variety cannot exceed 50 characters']
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      maxlength: [50, 'District cannot exceed 50 characters']
    }
  },
  farmSize: {
    type: Number,
    min: [0.1, 'Farm size must be at least 0.1 acres'],
    max: [10000, 'Farm size cannot exceed 10000 acres']
  },
  sowingDate: {
    type: Date,
    required: [true, 'Sowing date is required'],
    index: true
  },
  estimatedHarvestDate: {
    type: Date,
    required: [true, 'Estimated harvest date is required'],
    index: true
  },
  currentStage: {
    type: String,
    required: [true, 'Current stage is required'],
    enum: {
      values: ['planning', 'sowing', 'growing', 'flowering', 'harvesting', 'completed'],
      message: 'Current stage must be one of: planning, sowing, growing, flowering, harvesting, completed'
    },
    default: 'planning',
    index: true
  },
  milestones: [milestoneSchema],
  mrlRecommendations: [mrlRecommendationSchema],
  weatherAlerts: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Completion percentage must be between 0 and 100'],
    max: [100, 'Completion percentage must be between 0 and 100']
  },
  totalMilestones: {
    type: Number,
    default: 0,
    min: [0, 'Total milestones must be non-negative']
  },
  completedMilestones: {
    type: Number,
    default: 0,
    min: [0, 'Completed milestones must be non-negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
farmingRoadmapSchema.index({ userId: 1, isActive: 1 });
farmingRoadmapSchema.index({ cropType: 1, 'location.state': 1 });
farmingRoadmapSchema.index({ currentStage: 1, isActive: 1 });
farmingRoadmapSchema.index({ sowingDate: 1, estimatedHarvestDate: 1 });
farmingRoadmapSchema.index({ 'milestones.scheduledDate': 1, 'milestones.status': 1 });
farmingRoadmapSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Additional indexes for roadmap queries
farmingRoadmapSchema.index({ userId: 1, currentStage: 1, isActive: 1 });
farmingRoadmapSchema.index({ cropType: 1, currentStage: 1, isActive: 1 });
farmingRoadmapSchema.index({ 'location.state': 1, 'location.district': 1, isActive: 1 });
farmingRoadmapSchema.index({ completionPercentage: -1, isActive: 1 });
farmingRoadmapSchema.index({ estimatedHarvestDate: 1, isActive: 1 });
farmingRoadmapSchema.index({ 'milestones.category': 1, 'milestones.status': 1 });
farmingRoadmapSchema.index({ 'milestones.priority': 1, 'milestones.status': 1 });

// Virtual for full location string
farmingRoadmapSchema.virtual('fullLocation').get(function() {
  return `${this.location.address}, ${this.location.district}, ${this.location.state}`;
});

// Virtual for days until harvest
farmingRoadmapSchema.virtual('daysUntilHarvest').get(function() {
  const today = new Date();
  const harvestDate = new Date(this.estimatedHarvestDate);
  const diffTime = harvestDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance method to update progress
farmingRoadmapSchema.methods.updateProgress = function(): void {
  const completedCount = this.milestones.filter((m: IMilestone) => m.status === 'completed').length;
  const totalCount = this.milestones.length;
  
  this.completedMilestones = completedCount;
  this.totalMilestones = totalCount;
  this.completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Update current stage based on completion
  if (this.completionPercentage === 100) {
    this.currentStage = 'completed';
  } else if (this.completionPercentage >= 80) {
    this.currentStage = 'harvesting';
  } else if (this.completionPercentage >= 60) {
    this.currentStage = 'flowering';
  } else if (this.completionPercentage >= 20) {
    this.currentStage = 'growing';
  } else if (this.completionPercentage > 0) {
    this.currentStage = 'sowing';
  }
};

// Instance method to get upcoming milestones
farmingRoadmapSchema.methods.getUpcomingMilestones = function(days: number = 7): IMilestone[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.milestones.filter((milestone: IMilestone) => {
    const schedDate = new Date(milestone.scheduledDate);
    return milestone.status === 'pending' && 
           schedDate >= today && 
           schedDate <= futureDate;
  }).sort((a: IMilestone, b: IMilestone) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
};

// Instance method to get overdue milestones
farmingRoadmapSchema.methods.getOverdueMilestones = function(): IMilestone[] {
  const today = new Date();
  
  return this.milestones.filter((milestone: IMilestone) => {
    const schedDate = new Date(milestone.scheduledDate);
    return milestone.status === 'pending' && schedDate < today;
  }).sort((a: IMilestone, b: IMilestone) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
};

// Pre-save middleware to update progress
farmingRoadmapSchema.pre('save', function(next) {
  if (this.isModified('milestones')) {
    this.updateProgress();
  }
  next();
});

// Ensure virtual id field is included
farmingRoadmapSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find active roadmaps by user
farmingRoadmapSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find roadmaps by crop type and location
farmingRoadmapSchema.statics.findByCropAndLocation = function(cropType: string, state: string, district?: string) {
  const query: any = { cropType, 'location.state': state, isActive: true };
  if (district) {
    query['location.district'] = district;
  }
  return this.find(query).sort({ createdAt: -1 });
};

export const FarmingRoadmap = mongoose.model<IFarmingRoadmap>('FarmingRoadmap', farmingRoadmapSchema);