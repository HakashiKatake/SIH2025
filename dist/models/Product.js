"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema definition
const productSchema = new mongoose_1.Schema({
    sellerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller ID is required'],
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
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number']
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
    isActive: {
        type: Boolean,
        default: true,
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
productSchema.virtual('fullLocation').get(function () {
    return `${this.location.address}, ${this.location.district}, ${this.location.state}`;
});
// Virtual for seller information (populated)
productSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true
});
// Ensure virtual id field is included
productSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
// Static method to find products by location
productSchema.statics.findByLocation = function (state, district) {
    const query = { 'location.state': state, isActive: true };
    if (district) {
        query['location.district'] = district;
    }
    return this.find(query).sort({ createdAt: -1 });
};
// Static method to find products by category
productSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};
// Static method to search products
productSchema.statics.searchProducts = function (searchTerm) {
    return this.find({
        $text: { $search: searchTerm },
        isActive: true
    }).sort({ score: { $meta: 'textScore' } });
};
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map