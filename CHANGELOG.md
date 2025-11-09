# Changelog

All notable changes to RightFlow Hebrew PDF Filler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Open Source Preparation
- Prepared project for public GitHub release
- Added MIT License
- Created comprehensive contributing guidelines
- Added code of conduct (Contributor Covenant v2.1)
- Created security policy with Hebrew/RTL XSS warnings
- Added GitHub issue and PR templates
- Created CI/CD workflow with Hebrew validation tests

## [0.1.0] - 2025-01-09

### Added - Core Features

#### Phase 1: PDF Upload & Display
- PDF file upload with drag-and-drop support
- PDF rendering with react-pdf
- Multi-page PDF navigation with thumbnails
- Zoom controls (50%-200%)
- Page dimension tracking for coordinate conversion

#### Phase 2: Field Placement System
- Text field creation via drag-to-draw
- Checkbox field creation via click-to-place
- Real-time drag preview for text fields
- Field markers with color coding:
  - Text fields: Blue (#3B82F6)
  - Checkboxes: Green (#10B981)
- Resize handles for text fields
- Field repositioning via drag-and-drop

#### Phase 3: Field Management
- Field properties panel with:
  - Name editing (PDF-safe validation)
  - Label editing (Hebrew support)
  - Default value setting
  - Required field toggle
  - Direction control (RTL/LTR/Auto)
  - Font family selection
  - Font size control (8-72pt)
- Field deletion with confirmation
- Field list sidebar showing all fields by page
- Field selection and navigation

#### Phase 4: Advanced Features
- **Copy/Paste/Duplicate**: Full field duplication support
- **Undo/Redo System**: Command pattern with 50-action history
- **Crash Recovery**: Auto-save every 30 seconds to localStorage
- **Input Sanitization**: XSS protection for Hebrew text
  - HTML entity escaping
  - Dangerous Unicode control character removal
  - Field name validation (alphanumeric + underscore)
  - PDF magic byte validation

#### Phase 5: PDF Generation
- **Hebrew Font Embedding**: Noto Sans Hebrew with `subset: false`
- **AcroForm Field Generation**:
  - Text fields with Hebrew font support
  - Checkbox fields with default values
  - Required field enforcement
- PDF download with "_fillable" suffix
- Coordinate system conversion (viewport → PDF points)

### Features

#### Hebrew/RTL Support
- ✅ Native RTL text direction
- ✅ Hebrew font embedding (Noto Sans Hebrew)
- ✅ BiDi text handling
- ✅ RTL override attack protection
- ✅ Hebrew text validation
- ✅ Cross-browser Hebrew compatibility

#### User Interface
- ✅ RTL layout throughout application
- ✅ Hebrew tooltips and labels
- ✅ Toolbar with field type selection
- ✅ Properties panel for field configuration
- ✅ Page thumbnail sidebar
- ✅ Field list sidebar
- ✅ Keyboard shortcuts (Ctrl+Z/Y for undo/redo)

#### Code Quality
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Comprehensive error handling
- ✅ Console logging for debugging
- ✅ Crash recovery with localStorage

### Security

#### XSS Protection (BUG-005 Fix)
- Implemented comprehensive input sanitization
- HTML entity escaping for all user input
- Removal of dangerous Unicode control characters (U+202A-U+202E)
- Field name validation preventing injection
- PDF upload validation via magic bytes

### Bug Fixes

#### BUG-001: ESLint Configuration Missing
- Created `.eslintrc.cjs` with React + TypeScript rules
- Configured max line length (100 chars)
- Configured max function length (150 lines)
- Set up security rules (no-eval, no-implied-eval)

#### BUG-004: Copy/Paste Undo Support
- Refactored `pasteField()` to use `addFieldWithUndo()`
- Refactored `duplicateField()` to use `addFieldWithUndo()`
- Pasted/duplicated fields now properly tracked in undo history

#### BUG-005: XSS Vulnerability via Hebrew Text
- Created `src/utils/inputSanitization.ts` with comprehensive utilities
- Applied sanitization to all user input points
- Validated field names (alphanumeric + underscore only)
- Checked PDF uploads via magic bytes

#### Text Field Creation Bug
- Fixed drag position tracking (missing `dragCurrentX/Y` state)
- Fixed drag preview rendering (was always 0x0 pixels)
- Added `updateDragPosition()` action to store
- Users now see real-time drag preview when creating fields

### Testing

#### Phase 0: Hebrew Validation
- Created comprehensive Hebrew compatibility test suite
- Tests for:
  - Simple Hebrew text rendering
  - Hebrew font embedding validation
  - Mixed Hebrew/English content
  - RTL direction handling
  - Font subsetting requirements

### Known Limitations

- **Field Types**: Only text and checkbox implemented
  - Radio buttons: Planned (FR-2.1)
  - Dropdowns: Planned (FR-2.1)
- **Backend**: No server-side functionality (client-side only)
- **Authentication**: No user accounts (planned with Firebase)
- **Template Storage**: No cloud storage (planned with Firestore)
- **Collaboration**: No real-time collaboration features

### Performance

- Handles PDFs up to 50+ pages
- Hebrew text rendering < 100ms per field
- Crash recovery with minimal overhead (30s intervals)
- Build size: ~1.7MB (dist/, gzipped ~700KB)

### Browser Support

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+ (macOS)
- ✅ Edge 120+ (Windows)

### PDF Viewer Compatibility

Generated PDFs tested in:
- Adobe Acrobat Reader DC ✅
- Chrome PDF Viewer ✅
- Firefox PDF Viewer ✅
- Safari PDF Viewer ✅
- Edge PDF Viewer ✅

## Development Phases

### Completed Phases
- ✅ Phase 0: Technical Validation (Hebrew PDF-lib compatibility)
- ✅ Phase 1: PDF Upload & Display
- ✅ Phase 2: Field Placement System
- ✅ Phase 3: Field Management & Properties

### In Progress
- 🚧 Phase 4: Advanced Features (undo/redo, copy/paste - completed)
- 🚧 Phase 5: PDF Generation (basic implementation complete)

### Planned
- 📋 Firebase integration (Auth, Firestore, Storage)
- 📋 Radio button and dropdown field types
- 📋 Template management system
- 📋 Comprehensive testing suite (unit, component, E2E)
- 📋 Auto-save to cloud (Firestore)

## Links

- [Project Repository](https://github.com/YOUR-ORG/rightflow)
- [Issue Tracker](https://github.com/YOUR-ORG/rightflow/issues)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

---

**Note**: Version 0.1.0 represents the initial development release. The project is in active development with frequent updates.
