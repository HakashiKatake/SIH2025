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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Location sub-schema for reuse
const LocationSchema = new mongoose_1.Schema({
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
const FarmerProfileSchema = new mongoose_1.Schema({
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
const DealerProfileSchema = new mongoose_1.Schema({
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
const UserSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.Mixed,
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
UserSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        next(new Error('Either email or phone number is required'));
    }
    else {
        next();
    }
});
// Validation for profile based on role
UserSchema.pre('validate', function (next) {
    if (this.role === 'farmer') {
        if (!this.profile || !this.profile.name || !this.profile.location) {
            next(new Error('Farmer profile must include name and location'));
            return;
        }
    }
    else if (this.role === 'dealer') {
        const dealerProfile = this.profile;
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
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password'))
        return next();
    try {
        // Hash password with cost of 12
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error('Password comparison failed');
    }
};
// Override toJSON to remove sensitive fields
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};
// Virtual for full location string
UserSchema.virtual('fullLocation').get(function () {
    if (this.location) {
        return `${this.location.address}, ${this.location.district}, ${this.location.state}`;
    }
    return 'Location not set';
});
// Static method to find users by location (updated for new schema)
UserSchema.statics.findByLocation = function (state, city) {
    const query = {
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
UserSchema.statics.findByLanguage = function (language) {
    return this.find({
        $or: [
            { language: language },
            { preferredLanguage: language } // Legacy support
        ],
        isActive: true
    });
};
// Static method to find users by role
UserSchema.statics.findByRole = function (role) {
    return this.find({ role: role, isActive: true });
};
exports.User = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map