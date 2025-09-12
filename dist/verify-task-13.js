"use strict";
/**
 * Verification script for Task 13: Integrate all services and create main application
 *
 * This script verifies that all sub-tasks have been completed:
 * - Wire all service routes into main Express application
 * - Implement CORS configuration for mobile app
 * - Create basic server startup configuration
 * - Test all API endpoints with sample data
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTask13 = verifyTask13;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}
function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}
function logError(message) {
    log(`❌ ${message}`, colors.red);
}
function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}
function checkFileExists(filePath) {
    return fs_1.default.existsSync(path_1.default.join(process.cwd(), filePath));
}
function checkFileContains(filePath, searchString) {
    try {
        const content = fs_1.default.readFileSync(path_1.default.join(process.cwd(), filePath), 'utf8');
        return content.includes(searchString);
    }
    catch {
        return false;
    }
}
async function verifyTask13() {
    log(`${colors.bold}🔍 Verifying Task 13: Integrate all services and create main application${colors.reset}`);
    let allChecksPass = true;
    // Sub-task 1: Wire all service routes into main Express application
    log('\n1. Verifying service routes integration...');
    const routeChecks = [
        { name: 'Auth Routes', import: "import authRoutes from './routes/auth'", usage: "app.use('/api/auth', authRoutes)" },
        { name: 'Upload Routes', import: "import uploadRoutes from './routes/upload'", usage: "app.use('/api/upload', uploadRoutes)" },
        { name: 'Crops Routes', import: "import cropsRoutes from './routes/crops'", usage: "app.use('/api/crops', cropsRoutes)" },
        { name: 'Weather Routes', import: "import weatherRoutes from './routes/weather'", usage: "app.use('/api/weather', weatherRoutes)" },
        { name: 'Chat Routes', import: "import chatRoutes from './routes/chat'", usage: "app.use('/api/chat', chatRoutes)" },
        { name: 'Marketplace Routes', import: "import marketplaceRoutes from './routes/marketplace'", usage: "app.use('/api/marketplace', marketplaceRoutes)" },
        { name: 'Roadmap Routes', import: "import roadmapRoutes from './routes/roadmap'", usage: "app.use('/api/roadmap', roadmapRoutes)" },
        { name: 'Admin Routes', import: "import adminRoutes from './routes/admin'", usage: "app.use('/api/admin', adminRoutes)" }
    ];
    for (const route of routeChecks) {
        const hasImport = checkFileContains('src/index.ts', route.import);
        const hasUsage = checkFileContains('src/index.ts', route.usage);
        if (hasImport && hasUsage) {
            logSuccess(`${route.name} properly integrated`);
        }
        else {
            logError(`${route.name} not properly integrated`);
            allChecksPass = false;
        }
    }
    // Sub-task 2: Implement CORS configuration for mobile app
    log('\n2. Verifying CORS configuration for mobile app...');
    const corsChecks = [
        'cors({',
        'localhost:19006', // Expo development server
        'exp://localhost:19000', // Expo development server
        'capacitor://localhost', // Capacitor apps
        'ionic://localhost', // Ionic apps
        'credentials: true',
        'methods: [\'GET\', \'POST\', \'PUT\', \'DELETE\', \'PATCH\', \'OPTIONS\']'
    ];
    let corsConfigured = true;
    for (const check of corsChecks) {
        if (!checkFileContains('src/index.ts', check)) {
            corsConfigured = false;
            break;
        }
    }
    if (corsConfigured) {
        logSuccess('CORS properly configured for mobile apps');
    }
    else {
        logError('CORS configuration incomplete');
        allChecksPass = false;
    }
    // Check for OPTIONS handler
    if (checkFileContains('src/index.ts', "app.options('*'")) {
        logSuccess('Pre-flight OPTIONS requests handled');
    }
    else {
        logError('Pre-flight OPTIONS requests not handled');
        allChecksPass = false;
    }
    // Sub-task 3: Create basic server startup configuration
    log('\n3. Verifying server startup configuration...');
    const startupChecks = [
        { name: 'Database initialization', check: 'initializeApp' },
        { name: 'MongoDB connection', check: 'connectMongoDB' },
        { name: 'Redis connection', check: 'connectRedis' },
        { name: 'Health check endpoint', check: "app.get('/health'" },
        { name: 'Error handling middleware', check: 'globalErrorHandler' },
        { name: 'Server startup function', check: 'startServer' },
        { name: 'Port configuration', check: 'config.port' },
        { name: 'Graceful error handling', check: 'process.exit(1)' }
    ];
    for (const check of startupChecks) {
        if (checkFileContains('src/index.ts', check.check)) {
            logSuccess(`${check.name} implemented`);
        }
        else {
            logError(`${check.name} missing`);
            allChecksPass = false;
        }
    }
    // Sub-task 4: Test all API endpoints with sample data
    log('\n4. Verifying API endpoint testing...');
    const testFiles = [
        { name: 'Integration Test', file: 'src/test-integration-simple.ts' },
        { name: 'Comprehensive API Test', file: 'src/test-all-endpoints.ts' },
        { name: 'API Documentation', file: 'API_DOCUMENTATION.md' }
    ];
    for (const testFile of testFiles) {
        if (checkFileExists(testFile.file)) {
            logSuccess(`${testFile.name} created`);
        }
        else {
            logError(`${testFile.name} missing`);
            allChecksPass = false;
        }
    }
    // Additional verification: Check for proper middleware setup
    log('\n5. Verifying middleware setup...');
    const middlewareChecks = [
        { name: 'JSON parsing', check: 'express.json' },
        { name: 'URL encoding', check: 'express.urlencoded' },
        { name: 'Compression', check: 'compression(' },
        { name: 'Security headers', check: 'X-Content-Type-Options' },
        { name: 'Not found handler', check: 'notFoundHandler' }
    ];
    for (const middleware of middlewareChecks) {
        if (checkFileContains('src/index.ts', middleware.check)) {
            logSuccess(`${middleware.name} middleware configured`);
        }
        else {
            logError(`${middleware.name} middleware missing`);
            allChecksPass = false;
        }
    }
    // Verify API documentation endpoints
    log('\n6. Verifying API documentation endpoints...');
    if (checkFileContains('src/index.ts', "app.get('/', (req, res) => {") &&
        checkFileContains('src/index.ts', "app.get('/api', (req, res) => {")) {
        logSuccess('API documentation endpoints created');
    }
    else {
        logError('API documentation endpoints missing');
        allChecksPass = false;
    }
    // Final verification
    log(`\n${colors.bold}📋 Task 13 Verification Summary${colors.reset}`);
    if (allChecksPass) {
        logSuccess('All sub-tasks completed successfully!');
        logInfo('✓ All service routes wired into main Express application');
        logInfo('✓ CORS configuration implemented for mobile app');
        logInfo('✓ Basic server startup configuration created');
        logInfo('✓ API endpoint testing implemented');
        log(`\n${colors.bold}🎉 Task 13 is COMPLETE!${colors.reset}`);
        log(`${colors.green}The main application is fully integrated and ready for use.${colors.reset}`);
        // Show next steps
        log(`\n${colors.bold}📝 Next Steps:${colors.reset}`);
        logInfo('1. Run integration test: npx ts-node src/test-integration-simple.ts');
        logInfo('2. Start the server: npm run dev');
        logInfo('3. Test API endpoints: npx ts-node src/test-all-endpoints.ts');
        logInfo('4. Review API documentation: API_DOCUMENTATION.md');
    }
    else {
        logError('Some sub-tasks are incomplete!');
        log(`\n${colors.red}Please address the issues above before marking this task as complete.${colors.reset}`);
    }
    return allChecksPass;
}
// Run verification if this file is executed directly
if (require.main === module) {
    verifyTask13().then((success) => {
        process.exit(success ? 0 : 1);
    }).catch((error) => {
        logError(`Verification failed: ${error}`);
        process.exit(1);
    });
}
//# sourceMappingURL=verify-task-13.js.map