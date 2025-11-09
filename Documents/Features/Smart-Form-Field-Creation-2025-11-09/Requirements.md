# Smart Form Field Creation - Requirements Specification

**Version**: 1.0
**Date**: 2025-11-09
**Status**: Draft

---

## Functional Requirements

### FR-1: PDF Upload and Display

**FR-1.1**: System SHALL accept PDF file uploads via drag-and-drop or file picker
- **Validation**: Max file size 10MB, PDF format only
- **Test**: Upload 5MB PDF → success, Upload 15MB PDF → error message

**FR-1.2**: System SHALL display uploaded PDF on canvas within 3 seconds
- **Test**: Measure time from file selection to canvas render < 3000ms

**FR-1.3**: System SHALL render PDF pages at native resolution without quality loss
- **Test**: Compare canvas render to original PDF in Adobe Reader

**FR-1.4**: System SHALL support multi-page PDFs (1-50 pages)
- **Test**: Upload 1-page, 10-page, 50-page PDFs → all render correctly

### FR-2: Field Placement

**FR-2.1**: System SHALL provide toolbar buttons for field types: Text, Checkbox, Radio, Dropdown
- **Test**: Click each button → tool mode changes, button highlights

**FR-2.2**: System SHALL allow text field creation by click-drag interaction
- **Test**: Click "Text Field" → click on PDF → drag → release → field appears with dimensions

**FR-2.3**: System SHALL create checkboxes at fixed size (20x20pt) on single click
- **Test**: Click "Checkbox" → click on PDF → 20x20pt checkbox appears immediately

**FR-2.4**: System SHALL convert canvas pixel coordinates to PDF point coordinates accurately
- **Test**: Place field at canvas (100, 150) → verify PDF coords match expected values within ±2pt

**FR-2.5**: System SHALL validate minimum text field width of 36pt (3× Hebrew "ש" character width)
- **Test**: Attempt to create 30pt wide field → error message, Attempt 40pt → success

**FR-2.6**: System SHALL auto-generate unique field names in format `field_N` where N increments
- **Test**: Create 3 fields → names are "field_1", "field_2", "field_3" (no duplicates)

**FR-2.7**: System SHALL display field markers as colored rectangles with labels on canvas
- **Test**: Place 5 fields → all visible with distinct colors (blue for text, green for checkbox)

### FR-3: Field Configuration

**FR-3.1**: System SHALL open properties panel on right when field is selected
- **Test**: Click field → panel appears in < 100ms with field data

**FR-3.2**: Properties panel SHALL display:
- Field name (auto-generated, read-only)
- Hebrew caption (editable text input)
- Field type (display only)
- Required checkbox
- Default value (text input)
- RTL direction toggle
- Font selection dropdown (Noto Sans Hebrew, Arial)
- Font size input (8-24pt range)
- **Test**: Verify all fields present and functional

**FR-3.3**: System SHALL save property changes when user clicks outside panel or presses Enter
- **Test**: Edit caption → click elsewhere → verify stored in state

**FR-3.4**: System SHALL allow field deletion via delete button or Delete key
- **Test**: Select field → press Delete → field removed from canvas and state

### FR-4: Field Editing Operations

**FR-4.1**: System SHALL support field repositioning via drag-and-drop
- **Test**: Drag field from (100, 100) to (200, 200) → position updates in state

**FR-4.2**: System SHALL support field resizing via corner handles (text fields only)
- **Test**: Drag field corner → width/height change, constrained to minimum size

**FR-4.3**: System SHALL support copy (Ctrl+C) and paste (Ctrl+V) of selected field
- **Test**: Select field → Ctrl+C → Ctrl+V → duplicate appears with new unique name

**FR-4.4**: System SHALL support duplicate field command
- **Test**: Right-click field → "Duplicate" → copy appears offset by 20pt

**FR-4.5**: System SHALL prevent field placement outside PDF boundaries
- **Test**: Attempt to drag field beyond PDF edge → stops at boundary

### FR-5: Undo/Redo System

**FR-5.1**: System SHALL implement undo (Ctrl+Z) for all field operations
- Supported operations: Add, Delete, Move, Resize, Edit properties
- **Test**: Add field → Ctrl+Z → field disappears from canvas and state

**FR-5.2**: System SHALL implement redo (Ctrl+Shift+Z) to restore undone actions
- **Test**: Add field → Ctrl+Z → Ctrl+Shift+Z → field reappears

**FR-5.3**: System SHALL maintain undo stack of up to 50 actions
- **Test**: Perform 51 actions → verify oldest action cannot be undone

**FR-5.4**: System SHALL clear redo stack when new action is performed after undo
- **Test**: Add field → Ctrl+Z → Add new field → Ctrl+Shift+Z → redo unavailable

**FR-5.5**: System SHALL display undo/redo button states (enabled/disabled)
- **Test**: Verify buttons disabled when stacks are empty, enabled when available

### FR-6: Template Saving

**FR-6.1**: System SHALL save template with user-provided name
- **Test**: Click Save → prompt for name → enter "טופס ביטוח" → template saved

**FR-6.2**: System SHALL generate fillable PDF with AcroForm fields
- **Test**: Open saved PDF in Adobe Reader → verify fields are fillable

**FR-6.3**: System SHALL embed Noto Sans Hebrew font in generated PDF (subset: false)
- **Test**: Extract fonts from PDF → verify NotoSansHebrew-Regular.ttf present

**FR-6.4**: System SHALL upload PDF to Firebase Storage
- **Test**: Save template → verify file exists in Storage bucket

**FR-6.5**: System SHALL save template metadata to Firestore
- **Test**: Save template → query Firestore → verify document with all required fields

**FR-6.6**: System SHALL auto-save work-in-progress every 2 minutes
- **Test**: Make changes → wait 2 minutes → verify Firestore update without user action

**FR-6.7**: System SHALL allow user to download fillable PDF locally
- **Test**: Click "Download" → PDF file downloads with embedded fonts and fields

**FR-6.8**: System SHALL implement transactional saving (all-or-nothing)
- If Firestore write succeeds but Storage upload fails, rollback Firestore changes
- If PDF generation fails, preserve field definitions in separate recovery document
- User can retry failed operations without losing work
- **Test**: Simulate Storage failure during save → verify Firestore rollback → verify user prompted to retry
- **Test**: Force PDF generation error → verify field definitions saved separately → verify user can retry

**FR-6.9**: System SHALL implement partial failure recovery
- When save operation fails, save field definitions to localStorage as backup
- On next app load, check for unsaved field definitions and prompt user to recover
- User can choose: "Retry Save", "Save Copy", or "Discard"
- **Test**: Simulate complete save failure → verify localStorage backup created → reload app → verify recovery prompt appears

### FR-7: Session Management

**FR-7.1**: System SHALL create session lock when template editing begins
- **Test**: Start editing → verify session_locks/{templateId} document created

**FR-7.2**: System SHALL prevent concurrent edits from multiple sessions
- **Test**: Open template in Tab A → attempt to open in Tab B → show "locked" error

**FR-7.3**: System SHALL auto-expire session locks after 30 minutes of inactivity
- **Test**: Start editing → wait 35 minutes → verify lock auto-released

**FR-7.4**: System SHALL release lock on explicit save/close
- **Test**: Edit template → click Close → verify lock document deleted

**FR-7.5**: System SHALL detect and warn about external template modifications
- **Test**: Edit in Tab A → modify in Tab B (after lock expires) → Tab A shows conflict warning

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1**: PDF rendering SHALL complete within 3 seconds for 10-page documents
- **Measurement**: Time from file upload to canvas display

**NFR-1.2**: Field placement interaction SHALL have <100ms response time
- **Measurement**: Time from mouse click to field marker appearance

**NFR-1.3**: Property panel updates SHALL apply within 50ms
- **Measurement**: Time from property change to state update

**NFR-1.4**: Undo/redo operations SHALL execute in <50ms
- **Measurement**: Time from keyboard shortcut to UI update

**NFR-1.5**: Auto-save SHALL complete in <2 seconds
- **Measurement**: Time from auto-save trigger to Firestore confirmation

**NFR-1.6**: Application SHALL support 50+ fields on canvas without lag
- **Test**: Place 50 fields → drag/resize operations remain smooth (>30fps)

### NFR-2: Security

**NFR-2.1**: System SHALL validate all PDF uploads for malicious content
- **Implementation**: Check file magic bytes, reject non-PDF files
- **Test**: Upload .exe renamed to .pdf → rejected

**NFR-2.2**: System SHALL sanitize file names before Storage upload
- **Implementation**: Remove special characters, limit length to 200 chars
- **Test**: Upload "test<script>.pdf" → saved as "test_script.pdf"

**NFR-2.3**: System SHALL implement XSS protection on PDF upload
- **Implementation**: Reject PDFs with embedded JavaScript
- **Test**: Upload PDF with JS → rejected with security warning

**NFR-2.4**: System SHALL enforce Firebase Security Rules
- Users can only read/write their own templates
- Session locks can only be modified by lock owner
- **Test**: User A attempts to edit User B's template → 403 Forbidden

**NFR-2.5**: System SHALL store session locks with expiration timestamps
- **Test**: Verify all lock documents have `expiresAt` field

### NFR-3: Reliability

**NFR-3.1**: System SHALL recover from browser crashes without data loss
- **Implementation**: Auto-save every 2 minutes + localStorage backup
- **Test**: Make changes → kill browser → reopen → verify work restored

**NFR-3.2**: System SHALL handle network failures gracefully
- **Implementation**: Retry failed uploads 3 times with exponential backoff
- **Test**: Disconnect network → save template → reconnect → verify save completes

**NFR-3.3**: System SHALL validate Firestore write success before confirming save
- **Test**: Force Firestore error → verify user sees error message, not success

**NFR-3.4**: System SHALL prevent data corruption from concurrent writes
- **Implementation**: Use Firestore transactions for critical operations
- **Test**: Simulate concurrent saves → verify final state is consistent

### NFR-4: Usability

**NFR-4.1**: System SHALL provide clear visual feedback for all user actions
- Field selected → border color changes
- Tool active → toolbar button highlighted
- Operation in progress → loading spinner
- **Test**: Manual usability testing with 5 users

**NFR-4.2**: System SHALL display error messages in Hebrew
- **Test**: Trigger each error condition → verify Hebrew error text

**NFR-4.3**: System SHALL provide keyboard shortcuts for common operations
- Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+C (copy), Ctrl+V (paste), Delete
- **Test**: Verify each shortcut works as expected

**NFR-4.4**: System SHALL show tooltips on toolbar buttons
- **Test**: Hover over each button → tooltip appears within 500ms

**NFR-4.5**: System SHALL support browser zoom (50%-200%) without breaking layout
- **Test**: Zoom to 50%, 100%, 150%, 200% → verify UI remains usable

### NFR-5: Accessibility

System SHALL comply with **WCAG 2.1 Level AA** accessibility standards.

**NFR-5.1**: System SHALL support keyboard-only navigation (WCAG 2.1.1 Keyboard)
- All functionality available via keyboard without timing requirements
- Tab order follows logical visual order
- **Test**: Navigate entire UI using only Tab, Enter, Arrow keys, Space
- **Test**: Verify no keyboard traps exist

**NFR-5.2**: System SHALL provide ARIA labels for all interactive elements (WCAG 4.1.2 Name, Role, Value)
- Toolbar buttons have `aria-label` describing purpose
- Field markers have `aria-labelledby` linking to field name
- Properties panel has `aria-live` region for updates
- Form inputs have associated `<label>` elements
- **Test**: Run axe-core accessibility audit → 0 critical issues
- **Test**: Screen reader announces all interactive elements correctly

**NFR-5.3**: System SHALL maintain visible focus indicators (WCAG 2.4.7 Focus Visible)
- Focus indicator has minimum 3:1 contrast ratio against background
- Focus indicator clearly visible on all focusable elements
- Focus indicator not obscured by other content
- **Test**: Tab through UI → verify visible focus ring on each element (minimum 2px outline)
- **Test**: Verify focus indicator meets 3:1 contrast ratio requirement

**NFR-5.4**: System SHALL use semantic HTML elements (WCAG 1.3.1 Info and Relationships)
- `<button>` for buttons, `<input>` for text fields, `<label>` for labels
- `<nav>` for toolbar navigation
- `<main>` for canvas editor area
- `<aside>` for properties panel
- Headings use `<h1>`-`<h6>` in logical hierarchy
- **Test**: HTML validation → no semantic errors
- **Test**: Automated accessibility audit passes structure checks

**NFR-5.5**: System SHALL support high contrast mode (WCAG 1.4.3 Contrast Minimum)
- Text has minimum 4.5:1 contrast ratio for normal text
- Large text (18pt+ or 14pt+ bold) has minimum 3:1 contrast ratio
- UI components and graphical objects have 3:1 contrast ratio
- **Test**: Enable Windows High Contrast → verify UI remains readable
- **Test**: Use color contrast checker tool → verify all text meets minimum ratios

**NFR-5.6**: System SHALL provide text alternatives for non-text content (WCAG 1.1.1 Non-text Content)
- PDF thumbnails have descriptive alt text (e.g., "Page 1 of insurance form")
- Icon-only buttons have `aria-label` describing action
- Field markers have accessible names describing field type and position
- **Test**: Screen reader announces descriptive text for all visual elements

**NFR-5.7**: System SHALL announce dynamic content changes (WCAG 4.1.3 Status Messages)
- Success/error messages announced to screen readers via `aria-live="polite"`
- Field count updates announced when fields added/removed
- Auto-save status announced via `aria-live="polite"`
- **Test**: Screen reader announces all status changes without requiring focus move

**NFR-5.8**: System SHALL support browser zoom up to 200% (WCAG 1.4.10 Reflow)
- Layout remains usable at 200% zoom
- No horizontal scrolling required at 200% zoom
- All functionality remains accessible
- **Test**: Zoom to 200% → verify all features functional without horizontal scroll

### NFR-6: Browser Compatibility

**NFR-6.1**: System SHALL work on Chrome 100+, Firefox 100+, Safari 15+
- **Test**: Manual testing on each browser → all features functional

**NFR-6.2**: System SHALL work on Windows 10+, macOS 11+
- **Test**: Test on both operating systems → consistent behavior

**NFR-6.3**: System SHALL display consistent UI across supported browsers
- **Test**: Visual regression testing → screenshots match within 2% pixel difference

### NFR-7: Scalability

**NFR-7.1**: System SHALL support 1000 templates per user without performance degradation
- **Test**: Create 1000 templates → template library loads in <3 seconds

**NFR-7.2**: System SHALL handle 50 concurrent editing sessions
- **Test**: Simulate 50 users editing different templates → all sessions responsive

**NFR-7.3**: Firebase costs SHALL remain under $50/month for 100 active users
- **Monitoring**: Track Firestore reads/writes, Storage bandwidth

### NFR-8: Cost Efficiency

**NFR-8.1**: Template creation SHALL cost <$0.10 in Firebase fees per template
- **Breakdown**:
  - 1 Firestore write ($0.0000018 × 1 = $0.0000018)
  - 1 Storage upload for PDF ($0.00004/GB × avg 2MB = $0.00008)
  - Total estimated cost: $0.00008018 per template
- **Test**: Create 100 templates → verify Firebase billing < $0.01 total
- **Alert**: If cost per template exceeds $0.15 → investigate optimization opportunities

**NFR-8.2**: Auto-save SHALL use debounced writes to minimize Firestore costs
- Maximum 1 write per 2 minutes (even if user makes changes every 10 seconds)
- Debounce implementation: queue changes, write only after 2min idle or manual save
- **Test**: Make 20 rapid changes over 1 minute → verify only 1 Firestore write occurs
- **Monitoring**: Track auto-save write frequency (target: <30 writes/user/day)

**NFR-8.3**: Template reads SHALL be optimized with client-side caching
- Cache template metadata in memory for 5 minutes
- Cache PDF blob URLs for 10 minutes
- Only re-fetch from Firestore/Storage if cache expired or user explicitly refreshes
- **Target**: Read/write ratio of 3:1 (3 reads per 1 write)
- **Test**: Load same template 5 times within 5 minutes → verify only 1 Firestore read

**NFR-8.4**: Firebase budget alerts SHALL trigger at defined thresholds
- **Alert Level 1** (Warning): Monthly spend reaches $40 → email to product owner
- **Alert Level 2** (Critical): Monthly spend reaches $75 → Slack alert + email to engineering lead
- **Alert Level 3** (Emergency): Daily spend exceeds $5 → immediate investigation, consider feature flag disable
- **Implementation**: Use Firebase Budget Alerts + Cloud Functions for custom monitoring
- **Test**: Simulate cost spike → verify alerts trigger at correct thresholds

**NFR-8.5**: Storage growth SHALL be monitored and optimized
- Target: <10GB storage growth per month for 100 users
- PDF compression: Apply lossy compression to reduce average PDF size by 30%
- Thumbnail optimization: Generate 200px width thumbnails (<50KB each)
- Cleanup: Delete templates inactive for 12+ months (with user notification)
- **Monitoring**: Weekly storage growth rate dashboard
- **Alert**: Storage growth >25GB/month → investigate large uploads or retention issues

---

## Technical Requirements

### TR-1: Frontend Technology

**TR-1.1**: Application SHALL be built with React 18+ and TypeScript 5+
**TR-1.2**: Application SHALL use Vite 5+ for build tooling
**TR-1.3**: Application SHALL use Tailwind CSS v4 for styling
**TR-1.4**: Application SHALL use Zustand for state management
**TR-1.5**: Application SHALL use react-pdf (PDF.js) for PDF rendering
**TR-1.6**: Application SHALL use pdf-lib + @pdf-lib/fontkit for AcroForm generation

### TR-2: Backend Technology

**TR-2.1**: Application SHALL use Firebase Firestore for database
**TR-2.2**: Application SHALL use Firebase Storage for PDF file storage
**TR-2.3**: Application SHALL use Firebase Authentication for user management
**TR-2.4**: Application SHALL use Firebase Hosting for deployment

### TR-3: Data Storage

**TR-3.1**: Template metadata SHALL be stored in Firestore collection `templates`
**TR-3.2**: Session locks SHALL be stored in Firestore collection `session_locks`
**TR-3.3**: PDF files SHALL be stored in Firebase Storage path `pdfs/{userId}/{templateId}.pdf`
**TR-3.4**: Thumbnail images SHALL be stored in Firebase Storage path `thumbnails/{userId}/{templateId}.png`

### TR-4: Font Handling

**TR-4.1**: Noto Sans Hebrew font SHALL be included in `/public/fonts/` directory
**TR-4.2**: Font SHALL be loaded via fetch() and embedded with pdf-lib
**TR-4.3**: Font SHALL be embedded with `subset: false` option
**TR-4.4**: Font embedding SHALL occur on every template save

### TR-5: Coordinate System

**TR-5.1**: Canvas coordinates SHALL use pixel units with origin at top-left
**TR-5.2**: PDF coordinates SHALL use point units (1pt = 1/72 inch) with origin at bottom-left
**TR-5.3**: Coordinate conversion functions SHALL account for zoom level
**TR-5.4**: All field positions SHALL be stored in PDF coordinates (points)

---

## Design Requirements

### DR-1: Visual Design

**DR-1.1**: UI SHALL follow RTL layout for Hebrew content
**DR-1.2**: Field markers SHALL use color coding:
- Text fields: Blue (#3B82F6)
- Checkboxes: Green (#10B981)
- Radio buttons: Purple (#8B5CF6)
- Dropdowns: Orange (#F59E0B)
- Selected field: Amber (#F59E0B)

**DR-1.3**: Toolbar SHALL be fixed at top of viewport (height: 56px)
**DR-1.4**: Properties panel SHALL appear on right side (width: 320px)
**DR-1.5**: Canvas SHALL fill remaining space with scrolling for large PDFs

### DR-2: Interaction Design

**DR-2.1**: Field selection SHALL provide visual feedback within 50ms
**DR-2.2**: Drag operations SHALL show real-time preview
**DR-2.3**: Resize handles SHALL appear only on selected text fields
**DR-2.4**: Toolbar buttons SHALL show active state when tool is selected
**DR-2.5**: Properties panel SHALL slide in from right with 200ms animation

### DR-3: Typography

**DR-3.1**: Hebrew text SHALL use Noto Sans Hebrew font family
**DR-3.2**: UI labels SHALL use 14px font size (body text)
**DR-3.3**: Button text SHALL use 12px font size
**DR-3.4**: Heading text SHALL use 18px font size (bold)

---

## Data Requirements

### DR-1: Template Data Structure

**DR-1.1**: Template documents SHALL include:
```typescript
{
  id: string;
  userId: string;
  name: string;
  pdfUrl: string;
  thumbnailUrl: string;
  fields: FieldDefinition[];
  metadata: {
    originalFilename: string;
    totalPages: number;
    fieldCount: number;
    hasHebrewText: boolean;
    category?: string;
    usageCount: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}
```

**DR-1.2**: Field definitions SHALL include:
```typescript
{
  id: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  name: string;
  caption: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  defaultValue?: string;
  direction: 'rtl' | 'ltr';
  font: string;
  fontSize: number;
  validation?: ValidationRule;
}
```

### DR-2: Session Lock Data Structure

**DR-2.1**: Session lock documents SHALL include:
```typescript
{
  templateId: string;
  userId: string;
  sessionId: string;
  lockedAt: Timestamp;
  expiresAt: Timestamp;
}
```

### DR-3: Data Validation

**DR-3.1**: Field names SHALL be unique within a template
**DR-3.2**: Template names SHALL be non-empty and max 200 characters
**DR-3.3**: Field positions SHALL be within PDF page boundaries
**DR-3.4**: Field dimensions SHALL be positive numbers
**DR-3.5**: Font sizes SHALL be between 8-24 points

---

## Integration Requirements

### IR-1: Firebase Integration

**IR-1.1**: Application SHALL initialize Firebase SDK on load
**IR-1.2**: Application SHALL authenticate users before template access
**IR-1.3**: Application SHALL implement Firestore Security Rules for templates
**IR-1.4**: Application SHALL implement Storage Security Rules for PDFs

### IR-2: pdf-lib Integration

**IR-2.1**: Application SHALL load pdf-lib via npm package
**IR-2.2**: Application SHALL register fontkit with pdf-lib
**IR-2.3**: Application SHALL create AcroForm fields programmatically
**IR-2.4**: Application SHALL generate PDF bytes for download/upload

### IR-3: Browser APIs

**IR-3.1**: Application SHALL use File API for PDF upload
**IR-3.2**: Application SHALL use Canvas API for PDF rendering
**IR-3.3**: Application SHALL use localStorage for crash recovery
**IR-3.4**: Application SHALL use Blob API for PDF download

---

## Acceptance Criteria

### AC-1: Canvas Editor Acceptance

- [ ] User can upload PDF and see it rendered on canvas within 3 seconds
- [ ] User can select text field tool and create field by click-drag
- [ ] User can select checkbox tool and create checkbox by click
- [ ] User can select field to see properties panel
- [ ] User can edit Hebrew caption and see it update immediately
- [ ] User can resize text field while maintaining minimum size
- [ ] User can drag field to new position
- [ ] User can delete field via Delete key or button

### AC-2: Undo/Redo Acceptance

- [ ] User can undo field addition via Ctrl+Z
- [ ] User can redo field addition via Ctrl+Shift+Z
- [ ] User can undo field move, resize, delete, property edit
- [ ] Undo/redo buttons are disabled when stacks are empty
- [ ] Redo stack clears after new action is performed

### AC-3: Copy/Paste Acceptance

- [ ] User can copy field via Ctrl+C
- [ ] User can paste field via Ctrl+V
- [ ] Pasted field has unique auto-generated name
- [ ] Pasted field appears at offset position from original

### AC-4: Template Saving Acceptance

- [ ] User can click Save and provide template name
- [ ] System generates fillable PDF with AcroForm fields
- [ ] Generated PDF renders Hebrew text correctly in Adobe Reader
- [ ] PDF includes embedded Noto Sans Hebrew font
- [ ] Template metadata is saved to Firestore
- [ ] PDF file is uploaded to Firebase Storage
- [ ] User receives success confirmation

### AC-5: Session Locking Acceptance

- [ ] User can edit template → session lock is created
- [ ] Second session attempting to edit sees "locked" error
- [ ] Lock expires after 30 minutes → second session can edit
- [ ] Closing editor releases lock immediately
- [ ] User sees clear indication of lock status

### AC-6: Hebrew Support Acceptance

- [ ] Fields default to RTL direction
- [ ] Hebrew captions display correctly in properties panel
- [ ] Generated PDF renders Hebrew text without reversal
- [ ] Hebrew text in PDF is selectable and copyable
- [ ] Mixed Hebrew/English content preserves correct order

---

## Validation Methods

### VM-1: Automated Testing

**Unit Tests (Vitest)**:
- Coordinate conversion functions: 20+ test cases
- Field validation logic: 15+ test cases
- Undo/Redo state management: 25+ test cases
- Data model validators: 10+ test cases

**Component Tests (React Testing Library)**:
- Field placement workflow: 10+ scenarios
- Properties panel interactions: 15+ scenarios
- Toolbar button clicks: 8+ scenarios
- Keyboard shortcuts: 10+ scenarios

**Integration Tests (Playwright)**:
- End-to-end template creation: 5+ flows
- Save and download PDF: 3+ scenarios
- Session locking: 4+ scenarios
- Error handling: 8+ scenarios

### VM-2: Manual Testing

**Hebrew Rendering Test**:
1. Create template with 10 Hebrew text fields
2. Add captions: "שם", "כתובת", "טלפון", etc.
3. Save template and download PDF
4. Open in Adobe Reader, Chrome, Firefox, Safari
5. Verify Hebrew text is not reversed
6. Verify text is selectable and correct

**Cross-Browser Test**:
1. Run full template creation flow in Chrome, Firefox, Safari
2. Compare screenshots for visual consistency
3. Test all keyboard shortcuts in each browser
4. Verify PDF generation produces identical results

**Performance Test**:
1. Upload 50-page PDF
2. Measure rendering time (should be <5 seconds)
3. Place 50 fields on canvas
4. Perform drag operations → verify smooth 30fps
5. Save template → verify completes in <5 seconds

**Accessibility Test**:
1. Navigate UI using only keyboard
2. Run axe-core automated scan
3. Test with screen reader (NVDA/VoiceOver)
4. Verify all interactive elements are accessible

### VM-3: User Acceptance Testing

**Beta Testing**:
- Recruit 5 Israeli administrators
- Provide test insurance forms
- Observe template creation sessions
- Collect feedback on usability, Hebrew support, performance
- Measure success rate (% who complete template without help)

**Success Threshold**: 80% of beta users successfully create template on first attempt

---

## Happy Path Scenarios

Complete end-to-end workflows demonstrating successful user journeys through the feature.

### HS-1: First-Time User Success

**Scenario**: New user creates their first template without assistance

**Steps**:
1. User logs in → sees welcome screen with "Create Template" button
2. User clicks "Create Template" → file picker opens
3. User selects "car-insurance-claim.pdf" from computer → PDF uploads
4. Canvas renders PDF in <2 seconds → helpful tooltip appears: "Click 'Add Text Field' to start"
5. User clicks "Add Text Field" button → cursor changes to crosshair
6. User clicks on "Driver Name" field location → drags to define size → releases
7. Field marker appears → properties panel slides in from right with tooltip: "Add a Hebrew caption"
8. User types "שם הנהג" in caption field → presses Enter → panel closes
9. User repeats for 4 more fields (total 5 fields in 3 minutes)
10. User clicks "Save" button → modal prompts for template name
11. User types "טופס תביעת ביטוח רכב" → clicks "Save"
12. Success message appears: "✅ Template saved! Ready to use." with button "What's next?"
13. User clicks "What's next?" → sees explanation: "Download your fillable PDF and send to clients"
14. User clicks "Download" → PDF downloads with all 5 fields properly embedded
15. User opens PDF in Adobe Reader → Hebrew text renders correctly → success!

**Expected Outcome**: User completes first template in <10 minutes with confidence and understanding

**Success Indicators**:
- No errors encountered
- All Hebrew text renders correctly
- User understands next steps
- Positive emotional response ("This was easy!")

---

### HS-2: Power User Efficiency

**Scenario**: Experienced user creates complex template using productivity shortcuts

**Steps**:
1. User opens app → immediately clicks "Create Template" (no hesitation)
2. User drags PDF file from file explorer → drops on upload zone → instant upload
3. PDF renders → user presses "T" keyboard shortcut → text field tool activated
4. User rapidly places 10 text fields using click-drag (30 seconds total)
5. User selects first field → presses Ctrl+C → presses Ctrl+V repeatedly → duplicates 5 fields
6. User selects all duplicated fields → adjusts positions with arrow keys (fine control)
7. User configures first field → presses Tab to move to next field → repeats (stays in keyboard flow)
8. User makes mistake → presses Ctrl+Z → field placement undone → fixes error
9. User presses Ctrl+S (keyboard save shortcut) → template saves without modal
10. User sees auto-generated name "Template-2025-11-09" → keeps it
11. User closes tab → returns to template library → sees new template in list

**Expected Outcome**: User creates 15-field template in <2 minutes using keyboard efficiency

**Success Indicators**:
- All keyboard shortcuts work flawlessly
- No mouse required for most operations
- Workflow feels fast and natural
- Template saved successfully

---

### HS-3: Error Recovery Success

**Scenario**: User encounters network failure during save but recovers gracefully

**Steps**:
1. User creates template with 12 fields over 8 minutes
2. User clicks "Save" → loading spinner appears
3. Network connection drops mid-save → Firebase upload fails
4. System detects failure → shows error toast: "⚠️ Save failed. Your work is safe. Retrying..."
5. System automatically retries save 3 times (exponential backoff)
6. Network still down → system saves field definitions to localStorage as backup
7. User sees message: "💾 Couldn't reach server. Your work is saved locally. We'll sync when you're back online."
8. User closes browser (accidentally or intentionally)
9. User returns 1 hour later → opens app
10. Network connection restored
11. System detects localStorage backup → shows recovery modal:
    - "🔄 Unsaved work detected from 1 hour ago"
    - "Template: 12 fields created"
    - Options: [Retry Save] [Save as Copy] [Discard]
12. User clicks "Retry Save" → system uploads to Firebase → success!
13. Success message: "✅ Template synced successfully!"
14. User verifies template in library → all 12 fields intact → relief!

**Expected Outcome**: Zero data loss despite network failure and browser closure

**Success Indicators**:
- Field definitions preserved in localStorage
- Recovery modal appears on return
- Successful save after network restoration
- User trusts the system won't lose work

---

### HS-4: Collaborative Workflow (Session Locking)

**Scenario**: Two administrators avoid editing conflicts through session locking

**Steps**:
1. **User A** opens template "Health Insurance Form" → editing begins
2. System creates session lock → User A sees green badge: "✏️ Editing"
3. **User B** (different browser/tab) tries to open same template
4. System detects active lock → shows modal:
   - "🔒 Template is being edited"
   - "User: admin@agency.com started editing 5 minutes ago"
   - "Lock expires in: 25 minutes"
   - Options: [Wait] [View Read-Only] [Force Unlock (admin only)]
5. User B clicks "View Read-Only" → template opens but fields not editable
6. User B sees grayed-out toolbar with tooltip: "Someone else is editing this template"
7. **User A** completes edits → clicks "Save" → lock released automatically
8. **User B** sees notification: "✅ Template unlocked. Reload to edit?"
9. User B clicks "Reload" → template opens in edit mode → User B now has lock
10. User B makes changes → saves → success!

**Expected Outcome**: Both users edit template without conflicts or data loss

**Success Indicators**:
- Session lock prevents simultaneous edits
- Clear communication of lock status
- Graceful lock release on save
- Read-only mode available for viewing

---

### HS-5: Accessible Workflow (Keyboard-Only User)

**Scenario**: User with motor disability creates template using only keyboard

**Steps**:
1. User navigates to app using Tab key → reaches "Create Template" button
2. User presses Enter → file picker opens
3. User navigates to PDF using arrow keys → presses Enter → PDF uploads
4. Canvas renders → user presses Tab to reach toolbar
5. User presses Tab to "Add Text Field" button → presses Enter → tool activated
6. User presses Tab to focus on canvas → presses Enter to start field placement
7. User uses arrow keys to position field cursor → presses Space to start drag
8. User uses arrow keys to adjust size → presses Enter to complete field
9. Field created → focus moves to properties panel automatically
10. User tabs through form inputs → enters Hebrew caption → presses Tab to next field
11. User configures all properties via keyboard → presses Enter to confirm
12. User presses Ctrl+S to save → focus moves to template name input
13. User types name → presses Enter → template saves
14. Success message appears → screen reader announces: "Template saved successfully"

**Expected Outcome**: User completes full template creation without using mouse

**Success Indicators**:
- All functionality accessible via keyboard
- Logical tab order throughout UI
- Clear focus indicators visible
- Screen reader announces all state changes
- User feels empowered, not frustrated

---

### HS-6: Hebrew Text Validation

**Scenario**: User creates template and verifies Hebrew renders correctly across viewers

**Steps**:
1. User creates template with 8 Hebrew text fields
2. User adds captions: "שם מלא", "מספר ת.ז.", "כתובת", "טלפון", "תאריך לידה", "אימייל", "מקצוע", "הערות"
3. User configures all fields with RTL direction and Noto Sans Hebrew font
4. User clicks "Save" → template saved to Firebase
5. User clicks "Download" → PDF downloads locally
6. User opens PDF in **Adobe Acrobat Reader** → all Hebrew text renders correctly → not reversed
7. User opens same PDF in **Chrome PDF viewer** → Hebrew correct → success
8. User opens in **Firefox PDF viewer** → Hebrew correct → success
9. User opens in **Safari Preview (macOS)** → Hebrew correct → success
10. User opens in **Edge PDF viewer** → Hebrew correct → success
11. User clicks on Hebrew field → types "מיכל כהן" → text appears RTL correctly
12. User selects Hebrew text → copies → pastes in Word → text pastes correctly
13. User saves filled PDF → reopens → all Hebrew text preserved perfectly

**Expected Outcome**: 100% Hebrew rendering accuracy across all PDF viewers

**Success Indicators**:
- Hebrew text not reversed in any viewer
- RTL alignment correct
- Text selectable and copyable
- Hebrew input works in fillable fields
- User confident sharing with clients

---

### HS-7: Template Reuse at Scale

**Scenario**: Administrator creates one template and uses it 50 times over a month

**Steps**:
1. User creates "Auto Insurance Claim" template with 20 fields (invests 15 minutes)
2. User saves template → downloads fillable PDF
3. **Week 1**: User sends fillable PDF to 10 clients via email
4. Clients fill forms on their computers → return PDFs
5. User reviews submissions → Hebrew text renders correctly in all 10 forms
6. **Week 2**: User sends to 15 more clients (same template, no recreation needed)
7. **Week 3**: Minor form change required (insurance company logo updated)
8. User opens template → loads in 2 seconds with all 20 fields intact
9. User adjusts one field position → saves → downloads updated PDF
10. User sends updated version to 12 new clients
11. **Week 4**: User sends to 13 final clients (total: 50 uses)
12. User checks analytics: "Template used 50 times, 0 errors reported, 100% client satisfaction"

**Expected Outcome**: 15-minute investment saves 40+ hours of manual form filling

**Success Indicators**:
- Template created once, reused 50+ times
- Zero Hebrew rendering errors across all uses
- Easy to update template when needed
- Massive time savings vs. paper workflow
- High client satisfaction (digital > handwritten)

---

## Traceability Matrix

| Requirement | User Story | Test Case | Priority |
|-------------|-----------|-----------|----------|
| FR-1.1 | US-1.1 | TC-001 | High |
| FR-2.2 | US-1.2 | TC-010 | High |
| FR-3.1 | US-2.1 | TC-020 | High |
| FR-4.3 | US-2.3 | TC-030 | Medium |
| FR-5.1 | US-2.4 | TC-040 | Medium |
| FR-6.1 | US-3.1 | TC-050 | High |
| FR-7.2 | US-3.5 | TC-060 | Medium |
| NFR-1.1 | - | PERF-001 | High |
| NFR-2.3 | - | SEC-001 | Critical |
| NFR-4.1 | - | UX-001 | Medium |

---

## Document History

- **v1.0 (2025-11-09)**: Initial requirements specification
- **v1.1 (2025-11-09)**: Senior PM review - added FR-6.8, FR-6.9 (Transactional Saving & Partial Failure Recovery), NFR-8 (Cost Efficiency), enhanced NFR-5 (Accessibility with WCAG 2.1 AA compliance), added Happy Path Scenarios

