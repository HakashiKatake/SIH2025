import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Product document
export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  farmerId?: mongoose.Types.ObjectId; // Alias for sellerId
  name: string;
  category: 'crops' | 'seeds' | 'tools' | 'fertilizers';
  subcategory?: string;
  variety?: string;
  price: number;
  pricePerUnit?: number; // Alias for price
  quantity: number;
  unit: string;
  description: string;
  images: string[];
  photos?: string[]; // Alias for images
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  harvestDate?: Date;
  availableFrom?: Date;
  availableUntil?: Date;
  qualityCertificates?: string[];
  isOrganic?: boolean;
  isActive: boolean;
  status?: 'available' | 'reserved' | 'sold' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const productSchema = new Schema<IProduct>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters long'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['crops', 'seeds', 'tools', 'fertilizers'],
      message: 'Category must be one of: crops, seeds, tools, fertilizers'
    },
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  variety: {
    type: String,
    trim: true,
    maxlength: [50, 'Variety cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  pricePerUnit: {
    type: Number,
    min: [0, 'Price per unit must be a positive number']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    enum: {
      values: ['kg', 'quintal', 'ton', 'piece', 'liter', 'bag', 'packet'],
      message: 'Unit must be one of: kg, quintal, ton, piece, liter, bag, packet'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  photos: [{
    type: String
  }],
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
  harvestDate: {
    type: Date
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date
  },
  qualityCertificates: [{
    type: String,
    trim: true
  }],
  isOrganic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'expired'],
    default: 'available',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ sellerId: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'location.state': 1, 'location.district': 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ createdAt: -1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search index

// Additional indexes for common marketplace queries
productSchema.index({ category: 1, subcategory: 1, isActive: 1 });
productSchema.index({ price: 1, category: 1, isActive: 1 });
productSchema.index({ quantity: 1, isActive: 1 });
productSchema.index({ unit: 1, category: 1, isActive: 1 });

// Compound index for location and category filtering
productSchema.index({ 
  'location.state': 1, 
  category: 1, 
  price: 1, 
  isActive: 1 
});

// Compound index for seller's products with sorting
productSchema.index({ 
  sellerId: 1, 
  createdAt: -1, 
  isActive: 1 
});

// Virtual for full location string
productSchema.virtual('fullLocation').get(function() {
  return `${this.location.address}, ${this.location.district}, ${this.location.state}`;
});

// Virtual for seller information (populated)
productSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for farmerId (alias for sellerId)
productSchema.virtual('farmerId').get(function() {
  return this.sellerId;
});

// Virtual for pricePerUnit (alias for price)
productSchema.virtual('pricePerUnit').get(function() {
  return this.price;
});

// Virtual for photos (alias for images)
productSchema.virtual('photos').get(function() {
  return this.images;
});

// Pre-save middleware to handle aliases
productSchema.pre('save', function(next) {
  // Set farmerId as alias for sellerId
  if (this.sellerId && !this.farmerId) {
    this.farmerId = this.sellerId;
  }
  
  // Set pricePerUnit as alias for price
  if (this.price && !this.pricePerUnit) {
    this.pricePerUnit = this.price;
  }
  
  // Set photos as alias for images
  if (this.images && this.images.length > 0 && (!this.photos || this.photos.length === 0)) {
    this.photos = this.images;
  }
  
  next();
});

// Ensure virtual id field is included
productSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    // Add aliases for compatibility
    ret.farmerId = ret.sellerId;
    ret.pricePerUnit = ret.price;
    ret.photos = ret.images;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Static method to find products by location
productSchema.statics.findByLocation = function(state: string, district?: string) {
  const query: any = { 'location.state': state, isActive: true };
  if (district) {
    query['location.district'] = district;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

export const Product = mongoose.model<IProduct>('Product', productSchema);