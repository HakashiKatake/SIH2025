import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Enhanced interfaces for role-specific profiles
export interface FarmerProfile {
  name: string;
  farmName?: string;
  farmSize?: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  crops: string[];
  experience: number;
  certifications: string[];
  avatar?: string;
}

export interface DealerProfile {
  name: string;
  businessName: string;
  businessType: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  serviceAreas: string[];
  certifications: string[];
  avatar?: string;
}

// Interface for User document
export interface IUser extends Document {
  email?: string;
  phone?: string;
  password: string;
  role: 'farmer' | 'dealer' | 'admin';
  profile: FarmerProfile | DealerProfile;
  language: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Legacy fields for backward compatibility
  name?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  preferredLanguage?: string;
  farmSize?: number;
  crops?: string[];
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

// Location sub-schema for reuse
const LocationSchema = new Schema({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India'
  },
  coordinates: {
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
    }
  }
}, { _id: false });

// Farmer Profile Schema
const FarmerProfileSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  farmName: {
    type: String,
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  farmSize: {
    type: Number,
    min: [0.1, 'Farm size must be at least 0.1 acres'],
    max: [10000, 'Farm size cannot exceed 10000 acres']
  },
  location: {
    type: LocationSchema,
    required: [true, 'Location is required']
  },
  crops: [{
    type: String,
    trim: true,
    maxlength: [50, 'Crop name cannot exceed 50 characters']
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [100, 'Experience cannot exceed 100 years'],
    default: 0
  },
  certifications: [{
    type: String,
    trim: true,
    maxlength: [100, 'Certification name cannot exceed 100 characters']
  }],
  avatar: {
    type: String,
    trim: true
  }
}, { _id: false });

// Dealer Profile Schema
const DealerProfileSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true,
    enum: {
      values: ['retailer', 'wholesaler', 'distributor', 'processor', 'exporter'],
      message: 'Please select a valid business type'
    }
  },
  location: {
    type: LocationSchema,
    required: [true, 'Location is required']
  },
  serviceAreas: [{
    type: String,
    trim: true,
    maxlength: [50, 'Service area cannot exceed 50 characters']
  }],
  certifications: [{
    type: String,
    trim: true,
    maxlength: [100, 'Certification name cannot exceed 100 characters']
  }],
  avatar: {
    type: String,
    trim: true
  }
}, { _id: false });

// User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true // Allows multiple null values
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
    sparse: true // Allows multiple null values
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['farmer', 'dealer', 'admin'],
      message: 'Please select a valid role'
    }
  },
  profile: {
    type: Schema.Types.Mixed,
    required: [true, 'Profile is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: {
      values: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'],
      message: 'Please select a valid language'
    },
    default: 'en'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Legacy fields for backward compatibility
  name: {
    type: String,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    district: {
      type: String,
      trim: true,
      maxlength: [50, 'District cannot exceed 50 characters']
    }
  },
  preferredLanguage: {
    type: String,
    enum: {
      values: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa'],
      message: 'Please select a valid language'
    }
  },
  farmSize: {
    type: Number,
    min: [0.1, 'Farm size must be at least 0.1 acres'],
    max: [10000, 'Farm size cannot exceed 10000 acres']
  },
  crops: [{
    type: String,
    trim: true,
    maxlength: [50, 'Crop name cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation for email or phone requirement
UserSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required'));
  } else {
    next();
  }
});

// Validation for profile based on role
UserSchema.pre('validate', function(next) {
  if (this.role === 'farmer') {
    if (!this.profile || !this.profile.name || !this.profile.location) {
      next(new Error('Farmer profile must include name and location'));
      return;
    }
  } else if (this.role === 'dealer') {
    const dealerProfile = this.profile as DealerProfile;
    if (!this.profile || !this.profile.name || !dealerProfile.businessName || !dealerProfile.businessType || !this.profile.location) {
      next(new Error('Dealer profile must include name, business name, business type, and location'));
      return;
    }
  }
  next();
});

// Indexes for better query performance
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ language: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ createdAt: -1 });

// Role-specific indexes
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ role: 1, language: 1 });
UserSchema.index({ 'profile.location.coordinates.latitude': 1, 'profile.location.coordinates.longitude': 1 });
UserSchema.index({ 'profile.location.state': 1, 'profile.location.city': 1 });

// Legacy indexes for backward compatibility
UserSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
UserSchema.index({ 'location.state': 1, 'location.district': 1 });
UserSchema.index({ preferredLanguage: 1 });
UserSchema.index({ crops: 1, isActive: 1 });
UserSchema.index({ farmSize: 1, isActive: 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Override toJSON to remove sensitive fields and add compatibility
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  
  // Add compatibility fields for frontend
  if (!userObject.name && userObject.profile && userObject.profile.name) {
    userObject.name = userObject.profile.name;
  }
  
  if (!userObject.location && userObject.profile && userObject.profile.location) {
    userObject.location = {
      latitude: userObject.profile.location.coordinates.latitude,
      longitude: userObject.profile.location.coordinates.longitude,
      address: userObject.profile.location.address,
      state: userObject.profile.location.state,
      district: userObject.profile.location.city
    };
  }
  
  if (!userObject.preferredLanguage && userObject.language) {
    userObject.preferredLanguage = userObject.language;
  }
  
  if (!userObject.farmSize && userObject.profile && userObject.profile.farmSize) {
    userObject.farmSize = userObject.profile.farmSize;
  }
  
  return userObject;
};

// Virtual for full location string
UserSchema.virtual('fullLocation').get(function() {
  if (this.location) {
    return `${this.location.address}, ${this.location.district}, ${this.location.state}`;
  }
  return 'Location not set';
});

// Static method to find users by location (updated for new schema)
UserSchema.statics.findByLocation = function(state: string, city?: string) {
  const query: any = { 
    $or: [
      { 'profile.location.state': state },
      { 'location.state': state } // Legacy support
    ],
    isActive: true 
  };
  if (city) {
    query.$or = [
      { 'profile.location.state': state, 'profile.location.city': city },
      { 'location.state': state, 'location.district': city } // Legacy support
    ];
  }
  return this.find(query);
};

// Static method to find users by language
UserSchema.statics.findByLanguage = function(language: string) {
  return this.find({ 
    $or: [
      { language: language },
      { preferredLanguage: language } // Legacy support
    ],
    isActive: true 
  });
};

// Static method to find users by role
UserSchema.statics.findByRole = function(role: string) {
  return this.find({ role: role, isActive: true });
};

export const User = mongoose.model<IUser>('User', UserSchema);