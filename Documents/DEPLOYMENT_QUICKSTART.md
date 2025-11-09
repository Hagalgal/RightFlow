# Vercel Deployment Quick Start

**Goal**: Deploy Hebrew PDF Filler Studio to Vercel in 10-15 minutes

**Cost**: $0/month for 10 users (100GB bandwidth free)

---

## Prerequisites

- [x] Node.js 18+ installed
- [x] Git installed
- [x] Vercel account (sign up at https://vercel.com/signup)

---

## Step 1: Install Vercel CLI (2 minutes)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version

# Login to Vercel account
vercel login
```

Follow browser prompts to authenticate.

---

## Step 2: Prepare Project (1 minute)

```bash
# Navigate to project directory
cd c:\Dev\Dev\RightFlow

# Install dependencies (if not already done)
npm install

# Test build locally
npm run build
```

Verify build completes without errors.

---

## Step 3: First Deployment - Preview (3 minutes)

```bash
# Deploy to Vercel (preview deployment)
vercel
```

**Follow Prompts**:
1. `Set up and deploy?` → **Y**
2. `Which scope?` → Select your username
3. `Link to existing project?` → **N**
4. `What's your project's name?` → **hebrew-pdf-filler** (or your choice)
5. `In which directory is your code located?` → **./** (press Enter)

**Wait for deployment** (~30-60 seconds)

You'll receive a **preview URL** like:
```
https://hebrew-pdf-filler-abc123.vercel.app
```

**Test the preview URL** in your browser to verify everything works.

---

## Step 4: Production Deployment (1 minute)

```bash
# Deploy to production
vercel --prod

# Or use npm script
npm run deploy
```

**Production URL**: `https://hebrew-pdf-filler.vercel.app`

---

## Step 5: Connect to Git (Optional, 5 minutes)

Enable automatic deployments on every git push:

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select **GitHub** (or GitLab/Bitbucket)
6. Authorize Vercel to access your repository
7. Select the **RightFlow** repository
8. Click **Connect**

**Now every git push triggers automatic deployment**:
- Push to `main` → Production
- Push to other branches → Preview
- Pull requests → Preview with unique URL

### Option B: Via CLI
```bash
# Push code to GitHub first
git add .
git commit -m "Initial deployment setup"
git remote add origin https://github.com/your-username/RightFlow.git
git push -u origin main

# Vercel will detect the repository automatically
# in the dashboard under Project Settings → Git
```

---

## Step 6: Add Custom Domain (Optional, 5 minutes)

### If you have a domain (e.g., hebrew-pdf.co.il):

**Via Dashboard**:
1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `hebrew-pdf.co.il`
4. Follow DNS configuration instructions

**DNS Records to Add**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**SSL Certificate**: Auto-provisioned by Vercel (1-5 minutes after DNS propagation)

---

## You're Done!

Your Hebrew PDF Filler Studio is now deployed and accessible at:
- **Production**: `https://hebrew-pdf-filler.vercel.app`
- **Or Custom Domain**: `https://hebrew-pdf.co.il`

---

## Quick Reference

### Useful Commands
```bash
# Start local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to preview
vercel

# Deploy to production
vercel --prod
# or
npm run deploy

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Rollback to previous deployment
vercel promote <deployment-url>
```

### Dashboard Links
- **Project Dashboard**: https://vercel.com/dashboard
- **Deployments**: Check all deployments and their status
- **Analytics**: View traffic and performance metrics
- **Settings**: Configure domains, environment variables, etc.

---

## Monitoring & Management

### Check Bandwidth Usage
1. Go to **Account Settings** → **Usage**
2. Current usage: ~1-2GB/month for 10 users
3. Free tier limit: 100GB/month
4. You're using **1-2%** of free tier

### Set Usage Alert
1. **Account Settings** → **Usage** → **Set Alert**
2. Alert at: **80GB** (80% of free tier)
3. Get email notification before hitting limit

---

## Troubleshooting

### Build Failed
```bash
# Fix TypeScript/lint errors locally
npm run lint
npm run build

# Then redeploy
vercel --prod
```

### Hebrew Fonts Not Loading
```bash
# Verify fonts directory exists
ls public/fonts/

# Should contain:
# NotoSansHebrew-Regular.ttf

# If missing, download:
cd public/fonts
curl -L "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew" -o NotoSansHebrew-Regular.ttf
```

### Deployment Stuck
```bash
# Cancel and retry
Ctrl+C

# Clear build cache
vercel --force

# Redeploy
vercel --prod
```

---

## Cost Breakdown

**Current (10 users)**:
- Vercel Hosting: **$0/month** (free tier)
- Bandwidth usage: ~1-2GB/month (1-2% of 100GB free)
- Functions: **$0** (client-side only)
- Storage: **$0** (browser LocalStorage)

**Total: $0/month**

**If you need a custom .co.il domain**:
- Domain registration: ~$15/year = **$1.25/month**
- Everything else: **$0/month**

**Grand Total: $1.25/month** (with custom domain)

---

## Scaling Information

**Free tier supports**:
- Up to **50 users** comfortably (~6GB bandwidth)
- Up to **100 users** within limits (~12GB bandwidth)
- Beyond 100 users: Consider Vercel Pro ($20/month) or stay free if under 100GB

**When to add backend** (Supabase):
- Need user authentication
- Template sharing across users
- Usage analytics required
- Still **$0/month** with Supabase free tier (<50 users)

---

## Next Steps

1. **Test Hebrew PDF processing** on production URL
2. **Share production URL** with your 10 users
3. **Monitor usage** in Vercel dashboard
4. **Set up Git integration** for automatic deployments
5. **Add custom domain** (optional)

---

## Support

**Issues?**
- Check [Vercel_Deployment_Guide.md](Planning/Vercel_Deployment_Guide.md) for detailed troubleshooting
- Vercel Community: https://github.com/vercel/vercel/discussions
- Vercel Support: support@vercel.com

**Project Documentation**:
- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [Hebrew_PDF_Filler_PRD.md](Planning/Hebrew_PDF_Filler_PRD.md) - Product requirements
- [Vercel_Deployment_Guide.md](Planning/Vercel_Deployment_Guide.md) - Comprehensive deployment guide

---

**Congratulations!** Your Hebrew PDF Filler Studio is live and costs **$0/month**. 🎉
