# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hebrew PDF Filler Studio - A web application for filling PDF forms with proper Hebrew/RTL text support. The project addresses the critical gap in existing PDF tools that fail to handle Hebrew text correctly.

**Target Market**: Israeli businesses, government agencies, legal firms requiring RTL document processing.

**Core Challenge**: Most PDF libraries reverse Hebrew text or misalign RTL content. This project validates and implements proper Hebrew text rendering in PDFs.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

## 📁 Project Organization & File Structure

### Root Directory Policy

**CRITICAL:** The root directory should remain clean and professional at all times. Only essential project configuration files belong in root.

### File Placement Rules

#### When Creating New Files

1. **New Documentation?**
   - Create in `Documents/[appropriate-category]/`
   - Add entry to `Documents/INDEX.md`
   - Include README.md in new directories

2. **New Script?**
   - Deployment-related → `scripts/deployment/`
   - Testing/diagnostics → `scripts/diagnostics/`
   - Monitoring/backup → `scripts/monitoring/`
   - Maintenance utilities → `scripts/maintenance/`

3. **New SQL File?**
   - Database dumps → `Documents/Database/dumps/`
   - Migrations → `Documents/Database/migrations/`
   - Queries/scripts → `Documents/Database/`

4. **Temporary File?**
   - Add to `.gitignore` immediately
   - Delete when no longer needed
   - Never commit to repository
   
 ### Documantation
- use the obsidian mcp server to write every md that can be useful for future project documentation. Save the file in the project folder and give it a obsidian tag. 

### Quick Visual Check
IMMEDIALTLY fater implementing any forn-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use the `mcp__palywright__browser_navigate` to visit each changed view
3. **Verify design comliance** - Compare against `Documents\Development-Implementation\context/design-principles.md` and `Documents\Development-Implementation\context/style-guide.md`
4. **Validate feature implementation** - Ensure the change filfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Captire evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user rquirements.

### Comprehensive Design Review
Invoke the `@agent-design-review` subagent for thorough design validation when:
- Completing significant UI.UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsivness testing

### shadcn/ ui Components    "shadcn": Unknown word.
- Modern component library built on Rdix UI primitives
- Component in `/src/components/ui`
- Tailwind CSS V4 with CSS variables for theming
- Lucide React icons throghout

###key features
- Dashboard for event mangment
- Content  moderation tools
- Export functionality
- Credit system
- Multi-tenant architecture with organization support

## Giudance Memories
- Please ask for clarification upfront, upon the inital prompts, when you need more direction.

##Linting and code quality
- Please run `npm run lint` after completing large additions or refactors to ensure adherence to syntactic 


## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line lenght should be max 100 characters** ruff rule in pyproject.toml
- **Use venv_linux** (the virtual environment) whenever executing Python commands, including for unit tests.
  
### Phase 0 Testing (Hebrew PDF-lib Validation)
```bash
cd Phase0-Testing

# Install dependencies
npm install

# Run all validation tests
npm test

# Run individual tests
npm run test1  # Simple Hebrew text (expects failure with standard fonts)
npm run test2  # Hebrew font embedding validation
npm run test3  # Mixed Hebrew/English content
npm run test4  # RTL direction validation

# Quick font test
node tests/test2-quick.js
```

### Font Setup
Download Noto Sans Hebrew font (required for Hebrew rendering):
```bash
cd Phase0-Testing
curl -L "https://github.com/notofonts/hebrew/raw/main/fonts/NotoSansHebrew/hinted/ttf/NotoSansHebrew-Regular.ttf" -o fonts/NotoSansHebrew-Regular.ttf
```

## Architecture & Critical Design Decisions

### Technology Stack
- **PDF Library**: pdf-lib (v1.17.1) - Only library supporting PDF modification + creation
- **Font Kit**: @pdf-lib/fontkit (v1.1.1) - Required for custom font embedding
- **Deployment**: Vercel (Static Hosting with Edge Network)
- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS
- **Architecture**: Client-side PDF processing (no backend needed for 10 users)

### Hebrew Text Handling - CRITICAL

**Font Embedding**: MUST use full font embedding (subset: false) for Hebrew to prevent character mapping issues. Font subsetting can break Hebrew character display.

```javascript
// CORRECT - Full font embedding
const fontBytes = await fetch('/fonts/NotoSansHebrew.ttf');
const hebrewFont = await pdfDoc.embedFont(fontBytes, { subset: false });
```

**Text Direction**: Hebrew text may render reversed (שלום becomes םולש) depending on PDF viewer. Phase 0 testing validates the required text processing strategy:
- Test variant A: Logical order (as typed)
- Test variant B: Manually reversed
- Test variant C: With Unicode RTL markers (‏...‏)

**Known Font Issue**: Noto Sans Hebrew from GitHub raw URL fails with "Unknown font format". Use Google Fonts API version instead.

### Project Structure
```
RightFlow/
├── Documents/Planning/          # Product specs and implementation guides
│   ├── Hebrew_PDF_Filler_PRD.md              # Complete product requirements
│   ├── Vercel_Deployment_Guide.md            # Vercel deployment & Hebrew handling
│   └── Hebrew_PDF_Difficulties_Prevention.md    # Critical pitfalls & solutions
├── Phase0-Testing/              # PDF-lib Hebrew compatibility validation
│   ├── tests/                   # Automated test suite
│   ├── fonts/                   # Hebrew fonts (Noto Sans Hebrew)
│   ├── output/                  # Generated test PDFs
│   ├── FINDINGS.md             # Test results documentation
│   └── TEST_RESULTS_SUMMARY.md # Validation status
├── vercel.json                  # Vercel deployment configuration
└── .claude/                    # Claude Code configuration
```

## Development Workflow

### Phase 0: Technical Validation (Current)
The project is in validation phase, testing if pdf-lib can handle Hebrew text before full development.

**Validation Process**:
1. Run automated tests to generate PDFs with various Hebrew scenarios
2. Manually review PDFs in `Phase0-Testing/output/` folder
3. Document findings in `FINDINGS.md`
4. Make GO/NO-GO decision on pdf-lib

**Critical Questions Being Answered**:
- Does pdf-lib reverse Hebrew text?
- Can we use font subsetting or must we embed full fonts?
- Does mixed Hebrew/English maintain logical order?
- Do we need a custom BiDi (Bidirectional) algorithm?

### When Writing Tests
Hebrew test cases must cover these scenarios:
- Simple Hebrew text: שלום
- Hebrew with nikud (vowels): שָׁלוֹם
- Mixed direction: "PDF טופס 2024"
- Numbers in Hebrew context: "מספר 123 ו-456"
- Punctuation: "שאלה?"
- Parentheses (critical edge case): "טקסט (בסוגריים)"
- Email in Hebrew context: "מייל: user@example.com"
- Hebrew acronyms: צה"ל

## Security Considerations

**XSS via Unicode**: RTL marks can hide malicious code. All Hebrew input MUST be sanitized by removing dangerous Unicode control characters:
- \u202A-\u202E (directional embeddings/overrides)
- \u2066-\u2069 (isolates)

Keep only safe RTL/LTR marks if needed for display.

**File Storage**: Hebrew filenames should be sanitized when downloading PDFs. Use safe ASCII names for file system compatibility.

## Common Pitfalls & Prevention

### Text Reversal
Hebrew may appear backwards. Solution depends on Phase 0 test results. May require manual reversal or Unicode BiDi markers.

### Font Loading Performance
Hebrew fonts are 2-5MB. Use preload + font-display: swap for web rendering, but ALWAYS use full font for PDF embedding.

### Canvas-to-PDF Coordinates
Canvas uses pixels, PDF uses points (1pt = 1.33px). Account for devicePixelRatio and DPI when converting coordinates.

### Browser Compatibility
Chrome, Firefox, and Safari implement Unicode BiDi differently. Phase 0 tests will inform browser-specific handling strategies.

### Mobile Input
iOS keyboard events fire differently for Hebrew. May require compositionend event handling instead of standard input events.

## Vercel Deployment Notes

**Region**: Vercel automatically uses 'fra1' (Frankfurt - closest to Israel) as configured in vercel.json

**Client-Side Processing**: All PDF processing happens in the browser using pdf-lib
- No server-side functions needed for 10 users
- User's device handles Hebrew text rendering
- No timeout limits (browser manages processing)
- Zero backend costs

**Browser Storage**: Templates stored in LocalStorage (10MB limit)
- Sufficient for ~20 form templates
- No database needed for 10 users
- Can export/import templates as JSON

**Font Caching**: Hebrew fonts (2-5MB) cached with aggressive CDN headers
```json
"Cache-Control": "public, max-age=31536000, immutable"
```

**Cost**: $0/month for up to 10 users (100GB bandwidth free tier)

## Next Development Phases

### Phase 1: MVP Foundation (Weeks 1-4)
PDF upload, display, field identification interface, basic Hebrew font integration (client-side)

### Phase 2: Form Filling Engine (Weeks 5-8)
Hebrew text input with RTL, form field population, BiDi text handling (browser-based)

### Phase 3: PDF Generation & Templates (Weeks 9-12)
Generate PDFs with embedded Hebrew (client-side), template management in LocalStorage

### Phase 4: Optional Backend (If Needed Beyond 10 Users)
Add Supabase for user accounts, shared templates, and database storage

## Testing Strategy

All code changes affecting Hebrew rendering must be tested with:
1. Unit tests using the comprehensive Hebrew test cases
2. Visual PDF inspection (automated tests can pass while PDFs render incorrectly)
3. Cross-browser validation (Chrome, Firefox, Safari)
4. Mobile device testing (especially iOS Hebrew keyboard)

## Performance Targets

- Support 10 concurrent users (current scope)
- Reduce Hebrew form filling time by 80%
- Handle 50+ page PDFs without browser freeze (client-side lazy rendering)
- Hebrew text rendering < 100ms per field
- Zero cold start delays (client-side processing)
- Fast global CDN delivery from Vercel Edge Network

## Documentation References

Key planning documents in `Documents/Planning/`:
- **Hebrew_PDF_Filler_PRD.md**: Complete product specification, timeline, Vercel architecture
- **Vercel_Deployment_Guide.md**: Deployment instructions, client-side architecture, cost analysis
- **Hebrew_PDF_Difficulties_Prevention.md**: Comprehensive list of Hebrew-specific pitfalls and solutions

## Quick Start Deployment

```bash
# Install dependencies
npm install

# Install Vercel CLI (if not already installed)
npm install -g vercel

# Build and test locally
npm run build
npm run preview

# Deploy to Vercel
npm run deploy

# Or deploy with Vercel CLI directly
vercel --prod
```

**First Time Setup:**
1. Create Vercel account at vercel.com
2. Run `vercel login` to authenticate
3. Run `vercel` to link project (follow prompts)
4. Run `vercel --prod` to deploy to production

**Estimated setup time**: 10-15 minutes
**Cost**: $0/month for 10 users (100GB free bandwidth)
