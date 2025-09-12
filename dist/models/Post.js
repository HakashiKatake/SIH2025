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
exports.Post = exports.PostCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var PostCategory;
(function (PostCategory) {
    PostCategory["QUESTION"] = "question";
    PostCategory["TIP"] = "tip";
    PostCategory["SUCCESS_STORY"] = "success_story";
    PostCategory["PROBLEM"] = "problem";
    PostCategory["NEWS"] = "news";
})(PostCategory || (exports.PostCategory = PostCategory = {}));
const PostSchema = new mongoose_1.Schema({
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
                validator: function (v) {
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
            type: mongoose_1.Schema.Types.ObjectId,
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
PostSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});
// Simple validation middleware
PostSchema.pre('save', function (next) {
    // Just basic validation, no complex moderation
    next();
});
exports.Post = mongoose_1.default.model('Post', PostSchema);
//# sourceMappingURL=Post.js.map