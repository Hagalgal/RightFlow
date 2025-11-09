#!/usr/bin/env node
/**
 * FormFlowAI Development Environment Initialization Script
 * 
 * This script verifies and fixes all configuration settings for both 
 * frontend and backend to ensure they work together properly in development.
 * 
 * Run this script whenever you encounter configuration issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DevEnvironmentInitializer {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.frontendDir = path.join(this.rootDir, 'packages', 'frontend');
        this.backendDir = path.join(this.rootDir, 'packages', 'backend');
        this.errors = [];
        this.fixes = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '🔍',
            'success': '✅',
            'error': '❌',
            'fix': '🔧',
            'warning': '⚠️'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        
        if (type === 'error') {
            this.errors.push(message);
        } else if (type === 'fix') {
            this.fixes.push(message);
        }
    }

    readEnvFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return null;
            }
            const content = fs.readFileSync(filePath, 'utf8');
            const env = {};
            content.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim();
                    }
                }
            });
            return env;
        } catch (error) {
            this.log(`Error reading ${filePath}: ${error.message}`, 'error');
            return null;
        }
    }

    writeEnvFile(filePath, env) {
        try {
            const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
            fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
            return true;
        } catch (error) {
            this.log(`Error writing ${filePath}: ${error.message}`, 'error');
            return false;
        }
    }

    updateEnvFile(filePath, updates) {
        const env = this.readEnvFile(filePath) || {};
        let hasChanges = false;

        Object.entries(updates).forEach(([key, value]) => {
            if (env[key] !== value) {
                this.log(`Updating ${key} from "${env[key] || 'undefined'}" to "${value}"`, 'fix');
                env[key] = value;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            return this.writeEnvFile(filePath, env);
        }
        return true;
    }

    checkPortAvailability(port) {
        try {
            const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            return output.trim().length === 0;
        } catch (error) {
            // If netstat fails or port is free, assume it's available
            return true;
        }
    }

    killProcessOnPort(port) {
        try {
            const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            const lines = output.trim().split('\n');
            
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0' && !isNaN(pid)) {
                    try {
                        execSync(`taskkill //PID ${pid} //F`, { stdio: ['pipe', 'pipe', 'ignore'] });
                        this.log(`Killed process ${pid} using port ${port}`, 'fix');
                        return true;
                    } catch (killError) {
                        this.log(`Failed to kill process ${pid}: ${killError.message}`, 'warning');
                    }
                }
            }
        } catch (error) {
            // Port might already be free
        }
        return false;
    }

    async initializeBackend() {
        this.log('🔧 Initializing Backend Configuration...');

        const backendEnvPath = path.join(this.backendDir, '.env');
        const expectedConfig = {
            'NODE_ENV': 'development',
            'PORT': '3000',
            'CORS_ORIGIN': 'http://localhost:5173'
        };

        // Check if backend .env exists
        if (!fs.existsSync(backendEnvPath)) {
            this.log('Backend .env file missing, creating from example...', 'fix');
            const examplePath = path.join(this.backendDir, '.env.example');
            if (fs.existsSync(examplePath)) {
                fs.copyFileSync(examplePath, backendEnvPath);
            } else {
                // Create minimal .env
                this.writeEnvFile(backendEnvPath, expectedConfig);
            }
        }

        // Update backend configuration
        const success = this.updateEnvFile(backendEnvPath, expectedConfig);
        if (!success) {
            this.log('Failed to update backend .env file', 'error');
            return false;
        }

        // Check port availability
        if (!this.checkPortAvailability(3000)) {
            this.log('Port 3000 is in use, attempting to free it...', 'warning');
            this.killProcessOnPort(3000);
        }

        this.log('Backend configuration verified', 'success');
        return true;
    }

    async initializeFrontend() {
        this.log('🔧 Initializing Frontend Configuration...');

        const frontendEnvPath = path.join(this.frontendDir, '.env');
        const expectedConfig = {
            'VITE_BACKEND_URL': 'http://localhost:3000',
            'VITE_AI_PROVIDER': 'anthropic',
            'VITE_AI_MODEL': 'claude-4-20250514'
        };

        // Check if frontend .env exists
        if (!fs.existsSync(frontendEnvPath)) {
            this.log('Frontend .env file missing, creating from example...', 'fix');
            const examplePath = path.join(this.frontendDir, '.env.example');
            if (fs.existsSync(examplePath)) {
                fs.copyFileSync(examplePath, frontendEnvPath);
                // Update the copied file to use correct backend URL
                this.updateEnvFile(frontendEnvPath, { 'VITE_API_URL': 'http://localhost:3000/api' });
            } else {
                // Create minimal .env
                this.writeEnvFile(frontendEnvPath, expectedConfig);
            }
        }

        // Fix common variable name issues
        const frontendEnv = this.readEnvFile(frontendEnvPath);
        if (frontendEnv) {
            const fixes = {};
            
            // Fix VITE_API_URL vs VITE_BACKEND_URL inconsistency
            if (frontendEnv['VITE_API_URL'] && !frontendEnv['VITE_BACKEND_URL']) {
                // Extract base URL from API URL
                const apiUrl = frontendEnv['VITE_API_URL'];
                if (apiUrl.includes('/api')) {
                    fixes['VITE_BACKEND_URL'] = apiUrl.replace('/api', '');
                } else {
                    fixes['VITE_BACKEND_URL'] = apiUrl;
                }
                this.log('Converting VITE_API_URL to VITE_BACKEND_URL', 'fix');
            }

            // Ensure backend URL points to localhost:3000
            if (!frontendEnv['VITE_BACKEND_URL'] || !frontendEnv['VITE_BACKEND_URL'].includes('localhost:3000')) {
                fixes['VITE_BACKEND_URL'] = 'http://localhost:3000';
            }

            // Apply fixes
            if (Object.keys(fixes).length > 0) {
                this.updateEnvFile(frontendEnvPath, fixes);
            }
        }

        // Update frontend configuration with expected values
        const success = this.updateEnvFile(frontendEnvPath, expectedConfig);
        if (!success) {
            this.log('Failed to update frontend .env file', 'error');
            return false;
        }

        // Check if Vite is configured correctly
        const viteConfigPath = path.join(this.frontendDir, 'vite.config.ts');
        if (fs.existsSync(viteConfigPath)) {
            const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
            
            // Check if proxy is configured for development
            if (!viteConfig.includes('proxy') && !viteConfig.includes('server')) {
                this.log('Vite dev server proxy not configured - API calls may fail', 'warning');
                this.log('Consider adding server.proxy configuration to vite.config.ts', 'info');
            }
        }

        // Check port availability
        if (!this.checkPortAvailability(5173)) {
            this.log('Port 5173 is in use, attempting to free it...', 'warning');
            this.killProcessOnPort(5173);
        }

        this.log('Frontend configuration verified', 'success');
        return true;
    }

    checkApiService() {
        this.log('🔧 Checking API Service Configuration...');

        const apiServicePath = path.join(this.frontendDir, 'src', 'services', 'api', 'formFlowApi.ts');
        if (fs.existsSync(apiServicePath)) {
            const apiService = fs.readFileSync(apiServicePath, 'utf8');
            
            // Check for correct environment variable usage
            if (apiService.includes('VITE_API_URL') && !apiService.includes('VITE_BACKEND_URL')) {
                this.log('API service uses VITE_API_URL instead of VITE_BACKEND_URL', 'warning');
                this.log('This may cause connection issues', 'warning');
            }

            // Check for hardcoded localhost:3001
            if (apiService.includes('localhost:3001')) {
                this.log('API service has hardcoded localhost:3001 - should be localhost:3000', 'error');
            }

            this.log('API service configuration checked', 'success');
        } else {
            this.log('API service file not found', 'warning');
        }
    }

    checkCorsConfiguration() {
        this.log('🔧 Checking CORS Configuration...');

        // Check what headers the frontend sends
        const apiServicePath = path.join(this.frontendDir, 'src', 'services', 'api', 'formFlowApi.ts');
        const backendMainPath = path.join(this.backendDir, 'src', 'main.ts');
        
        const frontendHeaders = [];
        const backendAllowedHeaders = [];

        if (fs.existsSync(apiServicePath)) {
            const apiService = fs.readFileSync(apiServicePath, 'utf8');
            
            // Extract headers from frontend
            const headerMatches = apiService.match(/'X-[\w-]+'/g) || [];
            headerMatches.forEach(match => {
                const header = match.replace(/'/g, '');
                if (!frontendHeaders.includes(header)) {
                    frontendHeaders.push(header);
                }
            });

            // Also check for headers in config.headers
            const configHeaderMatch = apiService.match(/headers:\s*{[^}]*}/s);
            if (configHeaderMatch) {
                const headerBlock = configHeaderMatch[0];
                const additionalHeaders = headerBlock.match(/'[^']*':/g) || [];
                additionalHeaders.forEach(match => {
                    const header = match.replace(/['":]/g, '');
                    if (header.startsWith('X-') && !frontendHeaders.includes(header)) {
                        frontendHeaders.push(header);
                    }
                });
            }
        }

        if (fs.existsSync(backendMainPath)) {
            const backendMain = fs.readFileSync(backendMainPath, 'utf8');
            
            // Extract allowedHeaders from CORS config
            const corsMatch = backendMain.match(/allowedHeaders:\s*\[[^\]]*\]/s);
            if (corsMatch) {
                const allowedHeadersStr = corsMatch[0];
                const headerMatches = allowedHeadersStr.match(/'[^']+'/g) || [];
                headerMatches.forEach(match => {
                    const header = match.replace(/'/g, '');
                    backendAllowedHeaders.push(header);
                });
            }
        }

        // Check for mismatches
        const missingHeaders = frontendHeaders.filter(header => 
            !backendAllowedHeaders.some(allowed => 
                allowed.toLowerCase() === header.toLowerCase()
            )
        );

        if (missingHeaders.length > 0) {
            this.log(`Found CORS header mismatches - frontend sends: ${missingHeaders.join(', ')}`, 'error');
            this.log('This will cause CORS preflight errors', 'error');
            
            // Attempt to fix CORS configuration
            if (fs.existsSync(backendMainPath)) {
                let backendContent = fs.readFileSync(backendMainPath, 'utf8');
                const corsMatch = backendContent.match(/(allowedHeaders:\s*\[)([^\]]*)\]/s);
                
                if (corsMatch) {
                    const existingHeaders = corsMatch[2].split(',').map(h => h.trim().replace(/['"]/g, ''));
                    const allHeaders = [...new Set([...existingHeaders, ...missingHeaders])];
                    const newHeadersStr = allHeaders.map(h => `'${h}'`).join(', ');
                    
                    const newCorsConfig = `${corsMatch[1]}${newHeadersStr}]`;
                    backendContent = backendContent.replace(corsMatch[0], newCorsConfig);
                    
                    try {
                        fs.writeFileSync(backendMainPath, backendContent, 'utf8');
                        this.log(`Fixed CORS configuration - added headers: ${missingHeaders.join(', ')}`, 'fix');
                    } catch (error) {
                        this.log(`Failed to fix CORS configuration: ${error.message}`, 'error');
                    }
                }
            }
        } else {
            this.log('CORS configuration is correct', 'success');
        }
    }

    async verifyServices() {
        this.log('🔧 Verifying Services...');

        // Check if dependencies are installed
        const frontendNodeModules = path.join(this.frontendDir, 'node_modules');
        const backendNodeModules = path.join(this.backendDir, 'node_modules');

        if (!fs.existsSync(frontendNodeModules)) {
            this.log('Frontend dependencies not installed', 'error');
            this.log('Run: npm install --workspace=packages/frontend', 'info');
        }

        if (!fs.existsSync(backendNodeModules)) {
            this.log('Backend dependencies not installed', 'error');
            this.log('Run: npm install --workspace=packages/backend', 'info');
        }

        // Check if backend is running
        try {
            const { execSync } = require('child_process');
            const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health', { 
                encoding: 'utf8', 
                timeout: 5000,
                stdio: ['pipe', 'pipe', 'ignore']
            });
            
            if (response.trim() === '200') {
                this.log('Backend service is running and healthy', 'success');
            } else {
                this.log(`Backend service returned status: ${response}`, 'warning');
            }
        } catch (error) {
            this.log('Backend service is not running', 'warning');
            this.log('Start it with: npm run dev:backend', 'info');
        }

        this.log('Service verification completed', 'success');
    }

    generateStartupScript() {
        const scriptPath = path.join(this.rootDir, '.claude', 'start-dev.js');
        const scriptContent = `#!/usr/bin/env node
/**
 * Development Startup Script
 * Auto-generated by init-dev-environment.js
 */

const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🚀 Starting FormFlowAI Development Environment...');

// Kill any existing processes on development ports
try {
    execSync('taskkill //f //im node.exe', { stdio: 'ignore' });
} catch (e) {
    // Ignore errors
}

// Start backend
console.log('🔧 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev:backend'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

backend.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString());
});

backend.stderr.on('data', (data) => {
    console.error('[Backend Error]', data.toString());
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
    console.log('🎨 Starting Frontend Server...');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
    });

    frontend.stdout.on('data', (data) => {
        console.log('[Frontend]', data.toString());
    });

    frontend.stderr.on('data', (data) => {
        console.error('[Frontend Error]', data.toString());
    });
}, 5000);

console.log('✅ Development servers starting...');
console.log('📱 Frontend: http://localhost:5173');
console.log('🔧 Backend: http://localhost:3000');
console.log('💾 Backend Health: http://localhost:3000/health');
`;

        try {
            // Ensure .claude directory exists
            const claudeDir = path.join(this.rootDir, '.claude');
            if (!fs.existsSync(claudeDir)) {
                fs.mkdirSync(claudeDir, { recursive: true });
            }

            fs.writeFileSync(scriptPath, scriptContent);
            this.log('Generated startup script: .claude/start-dev.js', 'success');
        } catch (error) {
            this.log(`Failed to generate startup script: ${error.message}`, 'error');
        }
    }

    async run() {
        console.log('🚀 FormFlowAI Development Environment Initializer');
        console.log('================================================');

        try {
            // Initialize components
            await this.initializeBackend();
            await this.initializeFrontend();
            this.checkApiService();
            this.checkCorsConfiguration();
            await this.verifyServices();
            this.generateStartupScript();

            // Summary
            console.log('\n📊 Initialization Summary');
            console.log('========================');
            
            if (this.fixes.length > 0) {
                console.log(`\n🔧 Applied ${this.fixes.length} fixes:`);
                this.fixes.forEach(fix => console.log(`  • ${fix}`));
            }

            if (this.errors.length > 0) {
                console.log(`\n❌ Found ${this.errors.length} errors:`);
                this.errors.forEach(error => console.log(`  • ${error}`));
            } else {
                console.log('\n✅ No critical errors found!');
            }

            console.log('\n🎯 Next Steps:');
            console.log('  • Start backend: npm run dev:backend');
            console.log('  • Start frontend: npm run dev');
            console.log('  • Or run both: node .claude/start-dev.js');
            console.log('  • Access app: http://localhost:5173');
            console.log('  • Backend API: http://localhost:3000');
            console.log('  • Health check: http://localhost:3000/health');

        } catch (error) {
            this.log(`Initialization failed: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const initializer = new DevEnvironmentInitializer();
    initializer.run().catch(console.error);
}

module.exports = DevEnvironmentInitializer;