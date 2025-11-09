# Claude Development Tools

This directory contains development tools and scripts designed to work with Claude Code.

## Scripts

### `init-dev-environment.js`
Comprehensive initialization script that verifies and fixes all configuration issues between frontend and backend.

**Usage:**
```bash
node .claude/init-dev-environment.js
```

**What it does:**
- ✅ Checks and fixes backend `.env` configuration (port 3000, CORS, etc.)
- ✅ Checks and fixes frontend `.env` configuration (VITE_BACKEND_URL, etc.)
- ✅ Resolves common variable name inconsistencies (VITE_API_URL vs VITE_BACKEND_URL)
- ✅ Kills processes using development ports (3000, 5173) if needed
- ✅ Verifies service dependencies are installed
- ✅ Tests backend health endpoint
- ✅ Generates startup script for both services

### `start-dev.js` (Auto-generated)
Startup script that launches both frontend and backend servers in the correct order.

**Usage:**
```bash
node .claude/start-dev.js
```

## Quick Setup Commands

Add these to your root `package.json` for easy access:

```json
{
  "scripts": {
    "init-dev": "node .claude/init-dev-environment.js",
    "start-dev": "node .claude/start-dev.js"
  }
}
```

## Common Issues Fixed

1. **Port Conflicts**: Automatically kills processes using ports 3000 and 5173
2. **Environment Variable Mismatches**: Fixes VITE_API_URL vs VITE_BACKEND_URL issues
3. **Backend URL Configuration**: Ensures frontend points to localhost:3000
4. **CORS Configuration**: Sets proper CORS origin for development
5. **Missing Configuration Files**: Creates .env files from examples when missing

## Manual Verification

After running the init script, verify:

1. **Backend**: http://localhost:3000/health should return status 200
2. **Frontend**: http://localhost:5173 should load the application
3. **API Communication**: Upload a PDF to test frontend-backend communication

## Troubleshooting

If issues persist after running the init script:

1. Check the console output for specific error messages
2. Verify both `packages/frontend/.env` and `packages/backend/.env` exist
3. Ensure dependencies are installed: `npm install`
4. Check firewall/antivirus isn't blocking ports 3000 or 5173