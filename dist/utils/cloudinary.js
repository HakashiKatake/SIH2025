"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUploadUrl = exports.testCloudinaryConnection = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const config_1 = require("./config");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinary.cloudName,
    api_key: config_1.config.cloudinary.apiKey,
    api_secret: config_1.config.cloudinary.apiSecret,
    secure: true
});
// Test connection function
const testCloudinaryConnection = async () => {
    try {
        const result = await cloudinary_1.v2.api.ping();
        console.log('Cloudinary connection successful:', result);
        return true;
    }
    catch (error) {
        console.error('Cloudinary connection failed:', error);
        return false;
    }
};
exports.testCloudinaryConnection = testCloudinaryConnection;
// Generate secure upload URL
const generateUploadUrl = (publicId) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
        timestamp,
        folder: 'farmer-app/crops'
    };
    if (publicId) {
        params.public_id = publicId;
    }
    return cloudinary_1.v2.utils.api_sign_request(params, config_1.config.cloudinary.apiSecret);
};
exports.generateUploadUrl = generateUploadUrl;
//# sourceMappingURL=cloudinary.js.map