"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.PostCategory = exports.Post = exports.Notification = exports.FarmingRoadmap = exports.Order = exports.Product = exports.ChatMessage = exports.WeatherAlert = exports.WeatherCache = exports.CropAnalysis = exports.User = void 0;
// Export all models from this central location
var User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
var CropAnalysis_1 = require("./CropAnalysis");
Object.defineProperty(exports, "CropAnalysis", { enumerable: true, get: function () { return CropAnalysis_1.CropAnalysis; } });
var Weather_1 = require("./Weather");
Object.defineProperty(exports, "WeatherCache", { enumerable: true, get: function () { return Weather_1.WeatherCache; } });
Object.defineProperty(exports, "WeatherAlert", { enumerable: true, get: function () { return Weather_1.WeatherAlert; } });
var ChatMessage_1 = require("./ChatMessage");
Object.defineProperty(exports, "ChatMessage", { enumerable: true, get: function () { return ChatMessage_1.ChatMessage; } });
var Product_1 = require("./Product");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return Product_1.Product; } });
var Order_1 = require("./Order");
Object.defineProperty(exports, "Order", { enumerable: true, get: function () { return Order_1.Order; } });
var FarmingRoadmap_1 = require("./FarmingRoadmap");
Object.defineProperty(exports, "FarmingRoadmap", { enumerable: true, get: function () { return FarmingRoadmap_1.FarmingRoadmap; } });
var Notification_1 = require("./Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
var Post_1 = require("./Post");
Object.defineProperty(exports, "Post", { enumerable: true, get: function () { return Post_1.Post; } });
Object.defineProperty(exports, "PostCategory", { enumerable: true, get: function () { return Post_1.PostCategory; } });
var Comment_1 = require("./Comment");
Object.defineProperty(exports, "Comment", { enumerable: true, get: function () { return Comment_1.Comment; } });
// This file will be extended as we add more models in future tasks
//# sourceMappingURL=index.js.map