"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const config_1 = require("./utils/config");
const database_1 = require("./utils/database");
const healthCheck_1 = require("./utils/healthCheck");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const upload_1 = __importDefault(require("./routes/upload"));
const crops_1 = __importDefault(require("./routes/crops"));
const weather_1 = __importDefault(require("./routes/weather"));
const chat_1 = __importDefault(require("./routes/chat"));
const marketplace_1 = __importDefault(require("./routes/marketplace"));
const roadmap_1 = __importDefault(require("./routes/roadmap"));
const admin_1 = __importDefault(require("./routes/admin"));
const orders_1 = __importDefault(require("./routes/orders"));
const community_1 = __importDefault(require("./routes/community"));
// import notificationRoutes from './routes/notifications';
const app = (0, express_1.default)();
// Initialize database connections
const initializeApp = async () => {
    try {
        await (0, database_1.connectMongoDB)();
        await (0, database_1.connectRedis)();
        console.log("🚀 All database connections initialized");
    }
    catch (error) {
        console.error("❌ Failed to initialize database connections:", error);
        process.exit(1);
    }
};
// CORS configuration for mobile app
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin)
            return callback(null, true);
        // Allow localhost on any port for development
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return callback(null, true);
        }
        // Allow specific origins
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:8081", // Expo web development server
            "http://localhost:19006", // Expo development server
            "exp://localhost:19000", // Expo development server
            "capacitor://localhost", // Capacitor apps
            "ionic://localhost", // Ionic apps
        ];
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // For development, allow all origins
        if (process.env.NODE_ENV === "development") {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Cache-Control",
        "X-File-Name",
    ],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
    maxAge: 86400, // 24 hours
}));
// Additional CORS headers for all requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
app.use((0, compression_1.default)({
    filter: (req, res) => {
        // Don't compress responses if the request includes a cache-control: no-transform directive
        if (req.headers["cache-control"] &&
            req.headers["cache-control"].includes("no-transform")) {
            return false;
        }
        // Don't compress images and already compressed files
        const contentType = res.getHeader("content-type");
        if (contentType &&
            (contentType.includes("image/") ||
                contentType.includes("video/") ||
                contentType.includes("audio/") ||
                contentType.includes("application/zip") ||
                contentType.includes("application/gzip"))) {
            return false;
        }
        // Use compression filter function for other content
        return compression_1.default.filter(req, res);
    },
    level: 6, // Compression level (1-9, 6 is default)
    threshold: 1024, // Only compress responses larger than 1KB
    windowBits: 15, // Window size for compression
    memLevel: 8, // Memory level for compression
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Security headers for mobile apps
app.use((req, res, next) => {
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});
// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        const healthStatus = await (0, healthCheck_1.checkDatabaseHealth)();
        res.status(healthStatus.status === "healthy" ? 200 : 503).json({
            service: "Farmer Mobile App Backend",
            ...healthStatus,
        });
    }
    catch (error) {
        res.status(503).json({
            service: "Farmer Mobile App Backend",
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
});
// API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/crops", crops_1.default);
app.use("/api/weather", weather_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/marketplace", marketplace_1.default);
app.use("/api/roadmap", roadmap_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/community", community_1.default);
app.use("/api/admin", admin_1.default);
// app.use('/api/notifications', notificationRoutes);
// Basic route
app.get("/", (req, res) => {
    res.json({
        message: "Farmer Mobile App Backend API",
        version: "1.0.0",
        description: "Comprehensive API system for AI-powered agricultural assistance",
        features: [
            "Crop health analysis with AI",
            "Weather forecasting and alerts",
            "Multilingual chatbot support",
            "Digital marketplace",
            "Farming roadmaps and guidance",
            "Push notifications",
            "Community discussions and expert advice",
        ],
        endpoints: {
            health: "/health",
            auth: "/api/auth",
            upload: "/api/upload",
            crops: "/api/crops",
            weather: "/api/weather",
            chat: "/api/chat",
            marketplace: "/api/marketplace",
            roadmap: "/api/roadmap",
            orders: "/api/orders",
            community: "/api/community",
            admin: "/api/admin",
            // notifications: '/api/notifications',
            api: "/api",
        },
        documentation: {
            auth: "Authentication endpoints for user management",
            upload: "File upload utilities for images and media",
            crops: "Crop analysis and health monitoring",
            weather: "Location-based weather forecasts and alerts",
            chat: "AI chatbot for farming advice",
            marketplace: "Buy and sell crops and farming products",
            roadmap: "Personalized farming guidance and milestones",
            orders: "Order management and tracking system",
            community: "Community discussions, posts, and expert advice",
            notifications: "Push notifications and alerts management",
        },
    });
});
// API overview endpoint
app.get("/api", (req, res) => {
    res.json({
        message: "Farmer Mobile App API v1.0.0",
        services: {
            authentication: {
                base: "/api/auth",
                endpoints: [
                    "POST /register",
                    "POST /login",
                    "GET /profile",
                    "PUT /profile",
                    "POST /refresh",
                ],
            },
            fileUpload: {
                base: "/api/upload",
                endpoints: ["POST /image", "POST /document"],
            },
            cropAnalysis: {
                base: "/api/crops",
                endpoints: [
                    "POST /analyze",
                    "GET /history",
                    "GET /analysis/:id",
                    "GET /recommendations/:analysisId",
                ],
            },
            weather: {
                base: "/api/weather",
                endpoints: [
                    "GET /forecast/:lat/:lon",
                    "GET /alerts/:userId",
                    "POST /subscribe",
                ],
            },
            chatbot: {
                base: "/api/chat",
                endpoints: ["POST /query", "POST /voice", "GET /history/:userId"],
            },
            marketplace: {
                base: "/api/marketplace",
                endpoints: [
                    "POST /products",
                    "GET /products",
                    "GET /products/:id",
                    "PUT /products/:id",
                ],
            },
            roadmap: {
                base: "/api/roadmap",
                endpoints: [
                    "POST /generate",
                    "GET /:userId",
                    "PUT /:id/progress",
                    "GET /recommendations",
                ],
            },
            orders: {
                base: "/api/orders",
                endpoints: [
                    "POST /",
                    "GET /",
                    "GET /:id",
                    "PUT /:id",
                    "POST /:id/cancel",
                    "GET /dealer/my-orders",
                    "GET /farmer/my-orders",
                    "GET /statistics",
                ],
            },
            community: {
                base: "/api/community",
                endpoints: [
                    "POST /posts",
                    "GET /posts",
                    "GET /posts/search",
                    "GET /posts/:id",
                    "PUT /posts/:id",
                    "DELETE /posts/:id",
                    "POST /posts/:id/like",
                    "POST /posts/:id/comments",
                    "GET /posts/:id/comments",
                    "POST /comments/:id/like",
                    "DELETE /comments/:id",
                    "POST /posts/:id/verify",
                    "POST /posts/:id/moderate",
                    "POST /comments/:id/moderate",
                ],
            },
            // notifications: {
            //   base: '/api/notifications',
            //   endpoints: ['GET /', 'POST /', 'PUT /:id/read', 'DELETE /:id']
            // }
        },
        status: "All services operational",
        timestamp: new Date().toISOString(),
    });
});
// 404 handler for unmatched routes
app.use(errorHandler_1.notFoundHandler);
// Global error handling middleware (must be last)
app.use(errorHandler_1.globalErrorHandler);
// Start server with database initialization
const startServer = async () => {
    await initializeApp();
    app.listen(config_1.config.port, () => {
        console.log(`🌱 Farmer App Backend running on port ${config_1.config.port}`);
        console.log(`📍 Health check: http://localhost:${config_1.config.port}/health`);
        console.log(`📊 MongoDB: ${config_1.config.mongoUri}`);
        console.log(`🔄 Redis: ${config_1.config.redisUrl}`);
    });
};
startServer().catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map