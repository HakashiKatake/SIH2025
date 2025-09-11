import express from "express";
import cors from "cors";
import compression from "compression";
import { config } from "./utils/config";
import { connectMongoDB, connectRedis } from "./utils/database";
import { checkDatabaseHealth } from "./utils/healthCheck";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import uploadRoutes from "./routes/upload";
import cropsRoutes from "./routes/crops";
import weatherRoutes from "./routes/weather";
import chatRoutes from "./routes/chat";
import marketplaceRoutes from "./routes/marketplace";
import roadmapRoutes from "./routes/roadmap";
import adminRoutes from "./routes/admin";
import orderRoutes from "./routes/orders";
import communityRoutes from "./routes/community";
// import notificationRoutes from './routes/notifications';

const app = express();

// Initialize database connections
const initializeApp = async () => {
  try {
    await connectMongoDB();
    await connectRedis();
    console.log("🚀 All database connections initialized");
  } catch (error) {
    console.error("❌ Failed to initialize database connections:", error);
    process.exit(1);
  }
};

// CORS configuration for mobile app
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

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
  })
);

// Additional CORS headers for all requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(
  compression({
    filter: (req, res) => {
      // Don't compress responses if the request includes a cache-control: no-transform directive
      if (
        req.headers["cache-control"] &&
        req.headers["cache-control"].includes("no-transform")
      ) {
        return false;
      }

      // Don't compress images and already compressed files
      const contentType = res.getHeader("content-type") as string;
      if (
        contentType &&
        (contentType.includes("image/") ||
          contentType.includes("video/") ||
          contentType.includes("audio/") ||
          contentType.includes("application/zip") ||
          contentType.includes("application/gzip"))
      ) {
        return false;
      }

      // Use compression filter function for other content
      return compression.filter(req, res);
    },
    level: 6, // Compression level (1-9, 6 is default)
    threshold: 1024, // Only compress responses larger than 1KB
    windowBits: 15, // Window size for compression
    memLevel: 8, // Memory level for compression
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
    const healthStatus = await checkDatabaseHealth();
    res.status(healthStatus.status === "healthy" ? 200 : 503).json({
      service: "Farmer Mobile App Backend",
      ...healthStatus,
    });
  } catch (error) {
    res.status(503).json({
      service: "Farmer Mobile App Backend",
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/crops", cropsRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
// app.use('/api/notifications', notificationRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Farmer Mobile App Backend API",
    version: "1.0.0",
    description:
      "Comprehensive API system for AI-powered agricultural assistance",
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
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Start server with database initialization
const startServer = async () => {
  await initializeApp();

  app.listen(config.port, () => {
    console.log(`🌱 Farmer App Backend running on port ${config.port}`);
    console.log(`📍 Health check: http://localhost:${config.port}/health`);
    console.log(`📊 MongoDB: ${config.mongoUri}`);
    console.log(`🔄 Redis: ${config.redisUrl}`);
  });
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
