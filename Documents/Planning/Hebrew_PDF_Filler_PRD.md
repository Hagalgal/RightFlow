# Hebrew PDF Filler - Product Requirements Document (PRD)

## 1. Product Overview

**Product Name**: Hebrew PDF Filler Studio
**Target Market**: Israeli businesses, government agencies, legal firms, and organizations requiring RTL document processing
**Core Value Proposition**: First-class Hebrew PDF form creation and filling with native right-to-left support

### 1.1 Problem Statement
- Existing PDF form fillers lack proper Hebrew/RTL text support
- Filling pre-built government and business forms with Hebrew text is problematic
- Current solutions reverse text or misalign Hebrew content
- No solution exists for properly filling Hebrew PDF forms with RTL text

### 1.2 Success Metrics
- Support for complex Hebrew text rendering with proper RTL flow
- Reduce Hebrew form filling time by 80%
- Handle mixed Hebrew/English content seamlessly
- Support 10 concurrent users (current scope)
- Successfully fill pre-built government and business PDF forms
- Zero monthly hosting costs

## 2. Technical Architecture

### 2.1 Technology Stack

**Frontend Framework**
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling

**PDF Manipulation (Client-Side)**
- PDF-lib (primary) - Only library supporting PDF modification + creation
- All processing happens in the browser (no backend needed)
- Font embedding and Hebrew rendering client-side

**Canvas & Drag-Drop**
- Fabric.js for RTL-aware canvas editing
- react-dnd for drag-and-drop interface
- Konva.js as secondary option for complex interactions

**Form Builder Core**
- SurveyJS Creator (open source) - JSON-driven form builder
- Custom Hebrew RTL extensions
- FormEngine components for React integration

**Deployment & Storage**
- **Vercel Hosting**: Static site deployment with global Edge CDN
- **Browser LocalStorage**: Template storage (10MB = ~20 templates)
- **Client-Side Processing**: All PDF operations in browser (zero backend costs)
- **Optional Backend (Future)**: Supabase for user accounts if needed beyond 10 users

### 2.2 Hebrew RTL Implementation Strategy

**Text Rendering Engine**
```javascript
// Custom Hebrew text processor
class HebrewTextProcessor {
  // Bidirectional text algorithm implementation
  // Font embedding with Hebrew support
  // Right-to-left field positioning
}
```

**CSS RTL Framework**
```css
.hebrew-form {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Sans Hebrew', sans-serif;
}
```

### 2.3 Vercel Client-Side Architecture Advantages

**Browser-Based Hebrew Processing**
```javascript
// Client-side Hebrew PDF processing with pdf-lib
class HebrewPDFProcessor {
  async processHebrewPDF(pdfFile) {
    // All processing in user's browser
    // No server costs, no timeouts, no cold starts
    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const hebrewFont = await this.embedHebrewFont(pdfDoc);
    return await this.fillHebrewFields(pdfDoc, hebrewFont);
  }
}
```

**Benefits for 10-User Scope**
- Zero monthly costs ($0 for 100GB bandwidth on Vercel free tier)
- No cold start delays (everything runs in browser)
- Instant processing (no server round-trips)
- Privacy-first (sensitive data never leaves user's browser)
- No server management or scaling concerns

**Simple Deployment**
- Single command deployment: `vercel --prod`
- Automatic HTTPS and global CDN
- Preview deployments for testing
- Git integration for continuous deployment

## 3. Core Features Specification

### 3.1 Phase 0: Technical Validation (Week 0)
- **PDF-lib Hebrew Compatibility Testing**
  - Test PDF-lib with actual Hebrew text
  - Verify font embedding works with Hebrew
  - Validate RTL text rendering
  - Test mixed Hebrew/English content
  - Document any limitations or workarounds needed

### 3.2 Phase 1: Foundation (Weeks 1-4)
- **PDF Upload & Display**
  - Support for PDF 1.7+ format
  - Upload pre-built PDF forms (government forms, business forms, etc.)
  - PDF page rendering with zoom and pan controls
  - Hebrew text display verification

- **Field Identification Interface**
  - Click on PDF to mark fillable field locations
  - Define field types: text, checkbox, dropdown, signature
  - Set field properties (Hebrew/English, RTL/LTR)
  - Visual markers for defined fields

### 3.3 Phase 2: Form Filling Engine (Weeks 5-8)
- **Hebrew Text Input**
  - Hebrew text input with proper RTL cursor behavior
  - Auto-detect Hebrew and apply RTL direction
  - Support for mixed Hebrew/English input
  - Multi-line text areas with RTL flow

- **Form Field Population**
  - Fill text fields with Hebrew content
  - Check/uncheck checkboxes
  - Select dropdown options
  - Date fields with proper Hebrew formatting
  - Signature field support

### 3.4 Phase 3: PDF Generation & Templates (Weeks 9-12)
- **Filled PDF Generation**
  - Generate final PDF with Hebrew text properly embedded
  - Maintain original PDF formatting
  - Flatten form fields (non-editable output)
  - Download filled PDF

- **Template Management**
  - Save form field definitions as templates
  - Reuse templates for similar forms
  - Library of common government/business form templates
  - Auto-save functionality for work in progress

### 3.5 Phase 4: Enterprise Features (Weeks 13-16)
- **Batch Processing**
  - CSV data import for bulk filling
  - Fill same form template with multiple data rows
  - Batch download of generated PDFs
  - Progress tracking for batch operations

- **Integration APIs**
  - REST API for external systems
  - Webhook support for completed forms
  - API for programmatic form filling

## 4. Technical Implementation Details

### 4.1 Hebrew Text Handling

**Bidirectional Text Algorithm (BIDI)**
```javascript
class BiDirectionalProcessor {
  processHebrewText(text) {
    // Unicode BiDi algorithm implementation
    // Handle Hebrew-English mixed content
    // Proper punctuation positioning
  }
}
```

**Font Management**
- Embed Hebrew fonts: Noto Sans Hebrew, David, Arial Hebrew
- **IMPORTANT**: Use full font embedding (NO subsetting) for Hebrew to prevent character mapping issues
- Web font fallbacks for browser display

### 4.2 PDF-lib Integration

**Core PDF Operations**
```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

class HebrewPDFBuilder {
  async createHebrewForm(formDefinition) {
    const pdfDoc = await PDFDocument.create();
    // Hebrew form generation logic
    // RTL field positioning
    // Text rendering with proper direction
  }
}
```

### 4.3 Canvas Implementation with Fabric.js

**RTL Canvas Setup**
```javascript
import { fabric } from 'fabric';

class HebrewFormCanvas {
  initializeRTLCanvas() {
    const canvas = new fabric.Canvas('pdf-canvas', {
      selection: true,
      preserveObjectStacking: true
    });
    
    // RTL text object extensions
    // Hebrew input handling
    // Right-to-left field alignment
  }
}
```

## 5. Open Source Libraries Integration

### 5.1 Primary Stack
- **PDF-lib**: Core PDF manipulation and modification
- **SurveyJS Creator**: Drag-and-drop form builder foundation
- **Fabric.js**: Canvas-based editor with RTL extensions
- **react-dnd**: Drag-and-drop interface components

### 5.2 Supporting Libraries
- **Lodash**: Utility functions for complex form logic
- **Date-fns**: Date handling with Hebrew calendar support
- **React Hook Form**: Form state management
- **Zustand**: Global state management

### 5.3 Development Tools
- **ESLint + Prettier**: Code formatting
- **Jest + Testing Library**: Unit and integration testing
- **Storybook**: Component documentation
- **Husky**: Git hooks for code quality

## 6. Development Timeline

### Phase 1: MVP Foundation (Month 1)
**Week 1-2: Project Setup**
- Development environment configuration
- Core dependencies installation
- Basic React app structure
- Hebrew font integration testing

**Week 3-4: PDF Engine**
- PDF-lib integration
- Basic PDF upload and display
- Hebrew text rendering validation
- Canvas setup with Fabric.js

### Phase 2: Form Builder Core (Month 2)
**Week 5-6: Drag-Drop Interface**
- SurveyJS Creator integration
- Custom Hebrew field components
- Drag-and-drop functionality
- Property configuration panels

**Week 7-8: RTL Implementation**
- Bidirectional text algorithm
- Hebrew input field behaviors
- RTL layout calculations
- Field positioning logic

### Phase 3: Advanced Features (Month 3)
**Week 9-10: Form Management**
- Template save/load functionality
- Form validation engine
- Real-time preview system
- User interface polish

**Week 11-12: Data Integration**
- Form data collection
- Export functionality
- Basic API endpoints
- Testing and bug fixes

## 7. Technical Challenges & Solutions

### 7.1 Hebrew Text Rendering
**Challenge**: Proper RTL text flow in PDF documents
**Solution**: 
- Implement custom BiDi algorithm
- Use Unicode-aware text positioning
- Integrate Hebrew-specific font metrics

### 7.2 Mixed Language Support
**Challenge**: Hebrew-English mixed content alignment
**Solution**:
- Bidirectional text segmentation
- Context-aware text direction detection
- Smart punctuation positioning

### 7.3 PDF Compatibility
**Challenge**: Cross-platform PDF viewing consistency
**Solution**:
- Comprehensive PDF standard compliance
- Multiple PDF viewer testing
- Fallback rendering strategies

## 8. Client-Side Architecture Design
```javascript
// Browser-based form operations (no backend needed)
class FormManager {
  async createForm(formDefinition, hebrewMetadata) {
    // Save to browser LocalStorage
    const formId = `form_${Date.now()}`;
    const form = {
      ...formDefinition,
      hebrewMetadata,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(formId, JSON.stringify(form));
    return { formId };
  }

  async fillPDF(pdfFile, formData) {
    // Process entirely in browser with pdf-lib
    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const hebrewFont = await this.loadHebrewFont();

    // Fill fields with Hebrew text
    const filledPdf = await this.fillHebrewFields(pdfDoc, formData, hebrewFont);

    // Download directly to user's device
    const pdfBytes = await pdfDoc.save();
    this.downloadPDF(pdfBytes, 'filled-form.pdf');

    return { success: true };
  }

  // Export/Import for backup
  exportTemplates() {
    const templates = this.getAllTemplates();
    return JSON.stringify(templates);
  }

  importTemplates(jsonData) {
    const templates = JSON.parse(jsonData);
    templates.forEach(t => this.saveTemplate(t));
  }
}

## 9. Quality Assurance

### 9.1 Testing Strategy
- **Unit Tests**: Component-level Hebrew text handling
- **Integration Tests**: PDF generation and parsing
- **E2E Tests**: Complete form creation workflows
- **Accessibility Tests**: Screen reader compatibility

### 9.2 Hebrew-Specific Testing
- Text direction validation
- Font rendering verification
- Mixed language content testing
- Government document compliance

## 10. Deployment & DevOps

### 10.1 Vercel Infrastructure
- **Vercel Hosting**:
  - Global Edge CDN for React app (300+ locations)
  - Automatic SSL certificates
  - Custom domain support (hebrew-pdf.co.il)
  - Preview deployments for every git push
  - Zero configuration needed

- **vercel.json Configuration**:
  ```json
  {
    "version": 2,
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "regions": ["fra1"],
    "headers": [
      {
        "source": "/fonts/(.*)",
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

### 10.2 Performance Optimization
- **Hebrew Font Caching**:
  - Aggressive CDN caching (1 year)
  - Fonts served from Vercel Edge Network
  - Preload hints for critical Hebrew fonts
  - No server-side processing overhead

- **Client-Side Optimization**:
  ```javascript
  // Lazy load pdf-lib only when needed
  const loadPDFLib = () => import('pdf-lib');

  // Cache Hebrew fonts in browser
  const cacheHebrewFont = async () => {
    const cache = await caches.open('hebrew-fonts-v1');
    await cache.add('/fonts/NotoSansHebrew-Regular.ttf');
  };

  // Progressive PDF rendering for large files
  const renderPDFPages = async (pdf, startPage, endPage) => {
    // Render pages in chunks to avoid freezing
  };
  ```

- **LocalStorage Management**:
  ```javascript
  // Efficient template storage
  const STORAGE_LIMIT = 10 * 1024 * 1024; // 10MB

  class TemplateStorage {
    checkSpace() {
      const used = new Blob(Object.values(localStorage)).size;
      return STORAGE_LIMIT - used;
    }

    cleanOldTemplates() {
      // Auto-cleanup old templates if space running low
    }
  }
  ```

### 10.3 Vercel Deployment Commands
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod

# Or use npm scripts
npm run deploy

# Deploy preview (for testing)
npm run deploy:preview

# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

### 10.4 Continuous Deployment
```bash
# Connect GitHub repository
vercel --prod

# Automatic deployments on:
# - Push to main branch → Production
# - Push to other branches → Preview
# - Pull requests → Preview with unique URL
```

## 11. Future Roadmap

### 11.1 Advanced Features
- AI-powered form field detection
- Automatic Hebrew text correction
- Government form templates library
- Mobile app development

### 11.2 Market Expansion
- Arabic RTL support
- Persian/Farsi language support
- Integration with Israeli government APIs
- Enterprise security features

### 11.3 Scaling Path (If Needed Beyond 10 Users)
**When to add backend**:
- User accounts needed (email/password auth)
- Template sharing across team members
- Exceeding 10 active users
- Need for usage analytics

**Recommended Backend**: Supabase Free Tier
- 500MB PostgreSQL database
- 1GB file storage
- 10,000 monthly active users
- Still $0/month for <50 users

---

**Total Development Estimate**: 2-3 months for MVP (simplified from 3-4 months)
**Team Requirements**: 1 full-stack developer (you) + optional UI/UX consultant

**Cost Breakdown** (10 Users):

### Development Phase (Current)
**Platform**: Vercel Free Tier
- Hosting: 100GB bandwidth/month
- Deployments: Unlimited
- Build time: 100 hours/month
- Custom domains: Included
- **Cost: $0/month**

### Production Phase (10 Users)
**Monthly Usage Estimates**:
- 10 users × 20 sessions/month = 200 sessions
- 200 sessions × 6MB bandwidth = 1.2GB/month
- Templates: ~50MB in LocalStorage per user
- CDN requests: ~5,000/month

**Vercel Free Tier Coverage**:
- Bandwidth: 1.2GB used / 100GB free = 1.2% usage
- Functions: 0 (client-side only)
- Storage: 0 (browser LocalStorage)
- **Cost: $0/month**

**Additional Costs**:
- Domain name: $15/year (.co.il domain) = ~$1.25/month
- SurveyJS License: €900/year (optional) = ~$80/month
- Hebrew fonts license: Free (Noto Sans Hebrew)
- **Total: $1.25/month (or $81.25 with SurveyJS Pro)**

**Cost Comparison**:
- Original Firebase estimate: $50-200/month
- Vercel client-side: **$0-1.25/month**
- **Savings: $50-200/month → $0**

### Scaling Costs (If Needed)
**At 50 users** (still free):
- Bandwidth: ~6GB/month (6% of free tier)
- Cost: $0/month

**At 100 users** (need to upgrade):
- Option 1: Vercel Pro ($20/month) + Supabase Free
- Option 2: Netlify Free + Supabase Free (still $0)
- Option 3: Stay on Vercel Free (still fits in 100GB)

**At 1000+ users** (enterprise):
- Vercel Pro: $20/month (1TB bandwidth)
- Supabase Pro: $25/month (8GB database, 100GB bandwidth)
- Total: ~$45/month (still cheaper than original Firebase estimate)

---

This PRD provides a complete roadmap for developing your Hebrew PDF Filler Studio, leveraging client-side processing and Vercel's free tier to achieve **zero monthly costs** for 10 users, while maintaining the flexibility to scale if needed.