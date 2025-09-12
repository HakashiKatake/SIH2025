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
exports.ChatMessage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChatMessageSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.ChatMessage = mongoose_1.default.model('ChatMessage', ChatMessageSchema);
//# sourceMappingURL=ChatMessage.js.map