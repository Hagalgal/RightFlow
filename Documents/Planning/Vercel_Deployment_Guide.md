# Vercel Deployment Guide for Hebrew PDF Filler

## 1. Architecture Overview

### 1.1 Client-Side Processing Philosophy
This application uses a **pure client-side architecture** optimized for 10 users:

```
┌─────────────────────────────────────────────┐
│         User's Browser (Client)             │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   React App (Vite + TypeScript)      │  │
│  │                                      │  │
│  │   • pdf-lib (PDF processing)        │  │
│  │   • Hebrew font embedding           │  │
│  │   • RTL text rendering              │  │
│  │   • Form field manipulation         │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   Browser LocalStorage               │  │
│  │   • Form templates (~20 max)         │  │
│  │   • User preferences                 │  │
│  │   • Draft forms                      │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
                      ↓
         ┌────────────────────────┐
         │   Vercel Edge CDN      │
         │   (300+ locations)     │
         │                        │
         │   • Static assets      │
         │   • Hebrew fonts       │
         │   • Aggressive caching │
         └────────────────────────┘
```

**Key Benefits**:
- Zero server costs
- No cold starts
- Instant processing
- Privacy-first (data never leaves browser)
- No scaling concerns

### 1.2 Why No Backend?
For 10 users processing PDFs manually:
- No need for user authentication
- LocalStorage sufficient for templates
- Client devices handle all compute
- No concurrent request limits
- Simpler development and maintenance

## 2. Initial Setup

### 2.1 Prerequisites
```bash
# Node.js 18+ required
node --version

# Git for version control
git --version

# Vercel account (free)
# Sign up at: https://vercel.com/signup
```

### 2.2 Install Vercel CLI
```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version

# Login to Vercel
vercel login
```

### 2.3 Project Configuration
The project already includes `vercel.json` with optimal settings:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["fra1"],  // Frankfurt - closest to Israel
  "headers": [
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 3. Local Development

### 3.1 Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### 3.2 Build and Preview
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

# Test at http://localhost:4173
```

### 3.3 Testing Hebrew PDF Processing
```bash
# Run Phase 0 validation tests
cd Phase0-Testing
npm install
npm test

# Verify Hebrew rendering works correctly
# Check output/ directory for generated PDFs
```

## 4. Deployment

### 4.1 First Deployment
```bash
# Link project to Vercel (first time only)
vercel

# Follow prompts:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [Your username]
# ? Link to existing project? [N/y] N
# ? What's your project's name? hebrew-pdf-filler
# ? In which directory is your code located? ./
```

This creates a preview deployment with a unique URL like:
`https://hebrew-pdf-filler-abc123.vercel.app`

### 4.2 Production Deployment
```bash
# Deploy to production
vercel --prod

# Or use npm script
npm run deploy
```

Production URL: `https://hebrew-pdf-filler.vercel.app`

### 4.3 Deployment from Git (Recommended)
```bash
# Connect GitHub repository
# 1. Push code to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Import project in Vercel dashboard
# Go to: https://vercel.com/new
# Select your repository
# Vercel auto-detects Vite configuration

# 3. Configure deployment
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install

# 4. Deploy
# Click "Deploy"
```

**Automatic Deployments**:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

## 5. Custom Domain Setup

### 5.1 Add Custom Domain
```bash
# Via CLI
vercel domains add hebrew-pdf.co.il

# Or via Vercel Dashboard:
# Project Settings → Domains → Add Domain
```

### 5.2 DNS Configuration
For `.co.il` domain, add these DNS records:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Verification TXT Record:**
```
Type: TXT
Name: _vercel
Value: [provided by Vercel]
TTL: 3600
```

### 5.3 SSL Certificate
Vercel automatically provisions SSL certificates (Let's Encrypt):
- Takes 1-5 minutes after DNS propagation
- Auto-renews before expiration
- Forced HTTPS redirect included

## 6. Environment Variables

### 6.1 Configure via CLI
```bash
# Add production environment variable
vercel env add VITE_APP_NAME

# Select environment: Production
# Enter value: Hebrew PDF Filler Studio

# Add more variables
vercel env add VITE_APP_LOCALE
# Value: he-IL
```

### 6.2 Configure via Dashboard
```
Project Settings → Environment Variables

Variable Name: VITE_APP_NAME
Value: Hebrew PDF Filler Studio
Environment: Production, Preview, Development

Variable Name: VITE_APP_LOCALE
Value: he-IL
Environment: Production, Preview, Development
```

### 6.3 Access in Code
```typescript
// Vite automatically exposes VITE_* variables
const appName = import.meta.env.VITE_APP_NAME;
const locale = import.meta.env.VITE_APP_LOCALE;
```

## 7. Performance Optimization

### 7.1 Hebrew Font Optimization
```typescript
// Preload critical Hebrew font
// In index.html:
<link
  rel="preload"
  href="/fonts/NotoSansHebrew-Regular.ttf"
  as="font"
  type="font/ttf"
  crossorigin
/>

// Service Worker for font caching
// In src/serviceWorker.ts:
const FONT_CACHE = 'hebrew-fonts-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FONT_CACHE).then((cache) => {
      return cache.addAll([
        '/fonts/NotoSansHebrew-Regular.ttf',
        '/fonts/NotoSansHebrew-Bold.ttf'
      ]);
    })
  );
});
```

### 7.2 pdf-lib Lazy Loading
```typescript
// Lazy load pdf-lib only when needed
const loadPDFLib = async () => {
  const { PDFDocument } = await import('pdf-lib');
  const fontkit = await import('@pdf-lib/fontkit');
  return { PDFDocument, fontkit };
};

// Use when PDF processing starts
const { PDFDocument, fontkit } = await loadPDFLib();
```

### 7.3 Code Splitting
```typescript
// In vite.config.ts:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['pdf-lib', '@pdf-lib/fontkit'],
          'ui-vendor': ['react', 'react-dom'],
          'hebrew': ['./src/utils/hebrew-processor.ts']
        }
      }
    }
  }
});
```

## 8. Monitoring & Analytics

### 8.1 Vercel Analytics (Free)
```bash
# Enable in dashboard
# Project Settings → Analytics → Enable

# Or add to code:
npm install @vercel/analytics

// In src/main.tsx:
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 8.2 Error Tracking (Optional)
```bash
# Install Sentry (free tier: 5K errors/month)
npm install @sentry/react @sentry/vite-plugin

// In src/main.tsx:
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-dsn-here',
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});
```

### 8.3 Performance Monitoring
```typescript
// Use Web Vitals
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  console.log(`${name}: ${delta}ms (ID: ${id})`);
  // Send to your analytics service
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

## 9. LocalStorage Management

### 9.1 Template Storage
```typescript
// Template manager for LocalStorage
class TemplateManager {
  private STORAGE_KEY = 'hebrew_pdf_templates';
  private MAX_STORAGE = 10 * 1024 * 1024; // 10MB

  saveTemplate(template: FormTemplate): void {
    const templates = this.getAllTemplates();
    templates.push(template);

    // Check storage limit
    const size = new Blob([JSON.stringify(templates)]).size;
    if (size > this.MAX_STORAGE) {
      throw new Error('Storage limit exceeded. Delete old templates.');
    }

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(templates)
    );
  }

  getAllTemplates(): FormTemplate[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  deleteTemplate(id: string): void {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(filtered)
    );
  }

  exportTemplates(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '[]';
  }

  importTemplates(jsonData: string): void {
    // Validate JSON
    const templates = JSON.parse(jsonData);
    localStorage.setItem(this.STORAGE_KEY, jsonData);
  }

  getStorageUsage(): { used: number; available: number } {
    const used = new Blob(
      Object.values(localStorage)
    ).size;
    return {
      used,
      available: this.MAX_STORAGE - used
    };
  }
}
```

### 9.2 Storage Persistence
```typescript
// Request persistent storage (optional)
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((persistent) => {
    if (persistent) {
      console.log('Storage will not be cleared automatically');
    } else {
      console.log('Storage may be cleared by the browser');
    }
  });
}

// Check storage quota
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then((estimate) => {
    console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
  });
}
```

## 10. Deployment Best Practices

### 10.1 Pre-Deployment Checklist
```bash
# 1. Run linter
npm run lint

# 2. Build locally
npm run build

# 3. Test production build
npm run preview

# 4. Test Hebrew PDF processing
cd Phase0-Testing && npm test

# 5. Check bundle size
npm run build -- --analyze

# 6. Deploy to preview first
vercel

# 7. Test preview URL
# Open preview URL and test all Hebrew features

# 8. Deploy to production
vercel --prod
```

### 10.2 Rollback Strategy
```bash
# List recent deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# Promote previous deployment to production
vercel promote <deployment-url>

# Or use aliases
vercel alias <deployment-url> production-url.vercel.app
```

### 10.3 Deployment Hooks
```bash
# Add to package.json for automation:
{
  "scripts": {
    "predeploy": "npm run lint && npm run build",
    "deploy": "vercel --prod",
    "postdeploy": "echo 'Deployment completed!'"
  }
}
```

## 11. Cost Management

### 11.1 Free Tier Limits
**Vercel Hobby (Free) Tier**:
- Bandwidth: 100GB/month
- Build execution: 100 hours/month
- Serverless function executions: 100GB-hours
- Deployments: Unlimited
- Team members: 1
- Domains: Unlimited

**Current Usage (10 users)**:
- Bandwidth: ~1-2GB/month (1-2%)
- Build time: ~5 minutes/deployment
- Functions: 0 (client-side only)
- **Well within free tier limits**

### 11.2 Monitoring Usage
```bash
# Check usage via CLI
vercel inspect

# Or via Dashboard:
# Account Settings → Usage
```

### 11.3 Cost Alerts
Set up alerts in Vercel dashboard:
```
Account Settings → Usage → Set Alert
Alert at: 80GB bandwidth (80% of free tier)
Email notification when threshold reached
```

## 12. Troubleshooting

### 12.1 Build Failures
```bash
# Check build logs
vercel logs <deployment-url>

# Common issues:
# 1. TypeScript errors
npm run build  # Fix errors locally first

# 2. Missing dependencies
npm install

# 3. Environment variables
vercel env ls  # Verify all required vars
```

### 12.2 Hebrew Font Loading Issues
```typescript
// Debug font loading
const fontUrl = '/fonts/NotoSansHebrew-Regular.ttf';

fetch(fontUrl)
  .then(res => {
    console.log('Font loaded:', res.ok);
    console.log('Content-Type:', res.headers.get('content-type'));
    return res.arrayBuffer();
  })
  .then(buffer => {
    console.log('Font size:', buffer.byteLength);
  })
  .catch(err => {
    console.error('Font loading failed:', err);
  });
```

### 12.3 LocalStorage Issues
```typescript
// Check if LocalStorage is available
function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Handle quota exceeded errors
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    alert('Storage full. Please delete old templates.');
  }
}
```

## 13. Security Best Practices

### 13.1 Content Security Policy
Add to `index.html`:
```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    font-src 'self' data:;
    img-src 'self' data: blob:;
    worker-src 'self' blob:;
  "
/>
```

### 13.2 Hebrew Input Sanitization
```typescript
// Remove dangerous Unicode control characters
function sanitizeHebrewInput(text: string): string {
  return text.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
}

// Validate Hebrew text
function isValidHebrewText(text: string): boolean {
  // Allow Hebrew, numbers, basic punctuation
  const hebrewRegex = /^[\u0590-\u05FF\s0-9.,!?()-]+$/;
  return hebrewRegex.test(text);
}
```

### 13.3 XSS Prevention
```typescript
// Use React's built-in XSS protection
// React automatically escapes text content
<div>{userInput}</div>  // Safe

// For HTML rendering, use DOMPurify
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

## 14. Scaling Beyond 10 Users

### 14.1 When to Add Backend
**Triggers**:
- More than 10 active users
- Need for user authentication
- Template sharing required
- Usage analytics needed

### 14.2 Recommended Backend: Supabase
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Initialize Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'your-project-url',
  'your-anon-key'
);

// Authentication
const { user } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Store templates in PostgreSQL
await supabase
  .from('templates')
  .insert({ name: 'My Template', data: templateData });
```

**Supabase Free Tier**:
- 500MB database
- 1GB file storage
- 10,000 MAUs
- Still $0/month for <50 users

### 14.3 Hybrid Architecture
```
┌─────────────────────────────┐
│    Vercel Static Hosting    │
│    (Frontend + pdf-lib)     │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│     Supabase Backend        │
│   • PostgreSQL (templates)  │
│   • Auth (user accounts)    │
│   • Storage (shared PDFs)   │
└─────────────────────────────┘
```

**Cost**: Still $0/month with both free tiers

## 15. Quick Reference

### 15.1 Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
npm run deploy           # Deploy using npm script

# Management
vercel ls                # List deployments
vercel logs <url>        # View deployment logs
vercel inspect <url>     # Inspect deployment
vercel domains           # Manage domains
vercel env               # Manage environment variables

# Rollback
vercel promote <url>     # Promote deployment to production
vercel alias <url> <domain>  # Alias deployment
```

### 15.2 Important URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/[username]/[project]/settings
- **Deployments**: https://vercel.com/[username]/[project]/deployments
- **Analytics**: https://vercel.com/[username]/[project]/analytics
- **Documentation**: https://vercel.com/docs

### 15.3 Support Resources
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Vercel Support**: support@vercel.com
- **Vite Docs**: https://vitejs.dev/guide/
- **pdf-lib Docs**: https://pdf-lib.js.org/

---

## Conclusion

This deployment guide provides everything needed to deploy and maintain your Hebrew PDF Filler Studio on Vercel for **$0/month** with 10 users. The client-side architecture eliminates backend complexity while maintaining excellent performance and user experience.

**Key Advantages**:
- Zero monthly costs
- No server management
- Instant deployments
- Global CDN
- Privacy-first (client-side processing)
- Simple scaling path if needed

For questions or issues, refer to the troubleshooting section or contact Vercel support.
