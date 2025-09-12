"use strict";
/**
 * Start server and run comprehensive tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const test_all_endpoints_1 = require("./test-all-endpoints");
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
async function waitForServer(maxAttempts = 30) {
    const axios = require('axios');
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await axios.get('http://localhost:3000/health', { timeout: 2000 });
            return true;
        }
        catch (error) {
            if (i === 0) {
                log('⏳ Waiting for server to start...', colors.yellow);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
}
async function startServerAndTest() {
    log(`${colors.bold}🚀 Starting Farmer Mobile App Backend${colors.reset}`);
    // Start the server
    const serverProcess = (0, child_process_1.spawn)('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
    });
    let serverStarted = false;
    // Handle server output
    serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Farmer App Backend running')) {
            serverStarted = true;
            log('✅ Server started successfully', colors.green);
        }
        // Only show important server messages
        if (output.includes('running on port') ||
            output.includes('database connections initialized') ||
            output.includes('Error') ||
            output.includes('Failed')) {
            process.stdout.write(`[SERVER] ${output}`);
        }
    });
    serverProcess.stderr?.on('data', (data) => {
        process.stderr.write(`[SERVER ERROR] ${data}`);
    });
    // Handle server process exit
    serverProcess.on('exit', (code) => {
        if (code !== 0) {
            log(`❌ Server exited with code ${code}`, colors.red);
            process.exit(1);
        }
    });
    // Wait for server to be ready
    log('⏳ Waiting for server to be ready...', colors.yellow);
    const isServerReady = await waitForServer();
    if (!isServerReady) {
        log('❌ Server failed to start within timeout period', colors.red);
        serverProcess.kill();
        process.exit(1);
    }
    log('✅ Server is ready for testing', colors.green);
    // Wait a bit more to ensure all services are initialized
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        // Run comprehensive tests
        await (0, test_all_endpoints_1.runAllTests)();
        log('\n🎉 All tests completed successfully!', colors.green);
    }
    catch (error) {
        log(`\n❌ Tests failed: ${error}`, colors.red);
    }
    finally {
        // Clean shutdown
        log('\n🛑 Shutting down server...', colors.yellow);
        serverProcess.kill('SIGTERM');
        // Force kill after 5 seconds if graceful shutdown fails
        setTimeout(() => {
            if (!serverProcess.killed) {
                log('⚠️  Force killing server process', colors.yellow);
                serverProcess.kill('SIGKILL');
            }
        }, 5000);
        // Wait for server to shut down
        await new Promise(resolve => setTimeout(resolve, 1000));
        log('👋 Goodbye!', colors.blue);
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\n👋 Interrupted by user', colors.yellow);
    process.exit(0);
});
// Run if this file is executed directly
if (require.main === module) {
    startServerAndTest().catch((error) => {
        log(`❌ Failed to start and test: ${error}`, colors.red);
        process.exit(1);
    });
}
//# sourceMappingURL=start-and-test.js.map