import mongoose, { Document, Schema } from 'mongoose';

// Interface for Order Item
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

// Interface for the Order document
export interface IOrder extends Document {
  id: string;
  dealerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  products: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Order Item
const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price per unit must be positive']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be positive']
  }
}, { _id: false });

// Schema definition for Order
const orderSchema = new Schema<IOrder>({
  dealerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dealer ID is required'],
    index: true
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  products: {
    type: [orderItemSchema],
    required: [true, 'Products are required'],
    validate: {
      validator: function(products: IOrderItem[]) {
        return products && products.length > 0;
      },
      message: 'At least one product is required'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount must be positive']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, shipped, delivered, cancelled'
    },
    default: 'pending',
    index: true
  },
  deliveryAddress: {
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
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
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'India'
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be one of: pending, paid, failed, refunded'
    },
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Tracking number cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
orderSchema.index({ dealerId: 1, status: 1 });
orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ expectedDeliveryDate: 1, status: 1 });

// Compound indexes for common queries
orderSchema.index({ dealerId: 1, orderDate: -1 });
orderSchema.index({ farmerId: 1, orderDate: -1 });
orderSchema.index({ status: 1, paymentStatus: 1, orderDate: -1 });

// Virtual for dealer information (populated)
orderSchema.virtual('dealer', {
  ref: 'User',
  localField: 'dealerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for farmer information (populated)
orderSchema.virtual('farmer', {
  ref: 'User',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function() {
  if (this.actualDeliveryDate) {
    return Math.ceil((this.actualDeliveryDate.getTime() - this.orderDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') {
    return 'delivered';
  } else if (this.status === 'shipped') {
    return 'in_transit';
  } else if (this.status === 'confirmed') {
    return 'processing';
  } else if (this.status === 'cancelled') {
    return 'cancelled';
  }
  return 'pending';
});

// Ensure virtual id field is included
orderSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('products')) {
    this.totalAmount = this.products.reduce((total, item) => total + item.totalPrice, 0);
  }
  next();
});

// Pre-save middleware to validate product total prices
orderSchema.pre('save', function(next) {
  for (const item of this.products) {
    const calculatedTotal = item.quantity * item.pricePerUnit;
    if (Math.abs(item.totalPrice - calculatedTotal) > 0.01) {
      return next(new Error(`Invalid total price for product ${item.productId}. Expected ${calculatedTotal}, got ${item.totalPrice}`));
    }
  }
  next();
});

// Static method to find orders by dealer
orderSchema.statics.findByDealer = function(dealerId: string, status?: string) {
  const query: any = { dealerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ orderDate: -1 });
};

// Static method to find orders by farmer
orderSchema.statics.findByFarmer = function(farmerId: string, status?: string) {
  const query: any = { farmerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ orderDate: -1 });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ orderDate: -1 });
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus: string, trackingNumber?: string) {
  this.status = newStatus;
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
  if (newStatus === 'delivered') {
    this.actualDeliveryDate = new Date();
  }
  return this.save();
};

// Instance method to calculate delivery estimate
orderSchema.methods.calculateDeliveryEstimate = function(daysToAdd: number = 7) {
  const estimatedDate = new Date(this.orderDate);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
  this.expectedDeliveryDate = estimatedDate;
  return this.save();
};

export const Order = mongoose.model<IOrder>('Order', orderSchema);