# Smart Form Field Creation - Implementation Tasks

**Version**: 1.0
**Date**: 2025-11-09
**Status**: Ready for Development

---

# Tasks Summary

- **Total High-Level Tasks**: 10 (added Task 10: Beta Testing & Rollout)
- **Total Sub-Tasks**: 65 (added accessibility sub-tasks to Tasks 2-4, cost monitoring and transactional saving to Task 6, beta testing sub-tasks)
- **Estimated Total Effort**: 7.5-9.5 weeks (38-48 working days)
- **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 8 → Task 9 → Task 10
- **Parallel Opportunities**: Task 7 can run parallel with Task 8 after Task 6 completes

---

## Task 1: Project Foundation & Setup

**Description**: Set up the React + TypeScript project structure, configure build tools, install core dependencies, and establish the basic application architecture with state management and routing foundation.

**Deliverables**: Vite + React 18 + TypeScript 5 project initialized, Tailwind CSS v4 configured, Zustand state management setup, Firebase SDK initialized, ESLint + Prettier configured, basic folder structure

**Estimated Duration**: 2-3 days

**Dependencies**: None

**Owner**: Frontend Engineer

### Sub-tasks:

#### 1.1 Initialize Vite + React + TypeScript Project

- **Description**: Create new Vite project with React 18 and TypeScript 5 template. Install core dependencies (react, react-dom, typescript). Configure tsconfig.json for strict type checking.
- **Acceptance Criteria**:
  - `npm create vite@latest` runs successfully
  - Project builds with `npm run dev`
  - TypeScript strict mode enabled
  - No compilation errors
- **Effort**: 2 hours
- **Notes**: Use Vite's official React-TS template as starting point
- **Related Requirements**: TR-1.1, TR-1.2

#### 1.2 Configure Tailwind CSS v4

- **Description**: Install Tailwind CSS v4, configure PostCSS, create tailwind.config.js with custom color scheme and RTL support. Set up base styles and utility classes.
- **Acceptance Criteria**:
  - Tailwind utilities work in components
  - Custom colors defined (field-text, field-checkbox, etc.)
  - RTL direction utilities available
  - Dark mode support configured
- **Effort**: 3 hours
- **Notes**: Reference existing project Tailwind config, add Hebrew-specific utilities
- **Related Requirements**: TR-1.3, DR-1.2

#### 1.3 Setup Zustand State Management

- **Description**: Install Zustand, create initial store structure for template editor (PDF state, field state, tool state). Implement TypeScript interfaces for store shape.
- **Acceptance Criteria**:
  - `templateEditorStore.ts` created with proper TypeScript types
  - Store accessible from components via `useTemplateStore()` hook
  - DevTools integration working
- **Effort**: 4 hours
- **Notes**: Use middleware for persistence (localStorage) and devtools
- **Related Requirements**: TR-1.4

#### 1.4 Initialize Firebase SDK

- **Description**: Install Firebase SDK (v10+), create firebase config file, initialize Auth, Firestore, and Storage services. Set up environment variables for Firebase project credentials.
- **Acceptance Criteria**:
  - Firebase app initialized successfully
  - `firebase/config.ts` exports auth, db, storage instances
  - Environment variables loaded from `.env.local`
  - Connection verified with Firestore ping
- **Effort**: 3 hours
- **Notes**: Use Firebase v10 modular SDK for tree-shaking
- **Related Requirements**: TR-2.1, TR-2.2, TR-2.3, IR-1.1

#### 1.5 Setup ESLint + Prettier

- **Description**: Configure ESLint with React and TypeScript rules, install Prettier for code formatting, add pre-commit hooks with Husky. Create .eslintrc and .prettierrc config files.
- **Acceptance Criteria**:
  - `npm run lint` runs without errors
  - Prettier formats code on save
  - Pre-commit hook prevents commits with lint errors
- **Effort**: 2 hours
- **Notes**: Use Airbnb style guide as base, customize for project needs
- **Related Requirements**: N/A (Developer experience)

#### 1.6 Create Folder Structure

- **Description**: Organize project into logical folders: /components (ui, layout, pdf, fields), /store, /utils, /types, /hooks. Create index files for clean imports.
- **Acceptance Criteria**:
  - All folders created with README.md explaining purpose
  - Barrel exports (index.ts) in each folder
  - No circular dependencies
- **Effort**: 1 hour
- **Notes**: Follow existing Frontend_Field_Definition_Interface.md structure
- **Related Requirements**: N/A (Code organization)

#### 1.7 Setup Git Repository & .gitignore

- **Description**: Initialize git repository (already done), create comprehensive .gitignore for Node.js, React, Firebase, and IDE files. Set up initial commit with project skeleton.
- **Acceptance Criteria**:
  - `.gitignore` excludes node_modules, .env.local, dist, .firebase
  - Initial commit pushed to feature branch
  - No sensitive files committed
- **Effort**: 1 hour
- **Notes**: Branch already created: feature/smart-form-field-creation
- **Related Requirements**: N/A (Version control)

---

## Task 2: PDF Upload & Canvas Rendering

**Description**: Implement PDF file upload functionality, render uploaded PDFs on HTML5 canvas using react-pdf, and create the coordinate conversion system between canvas pixels and PDF points.

**Estimated Duration**: 4-5 days

**Dependencies**: Task 1 (Project Foundation)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 2.1 Create PDF Upload Component

- **Description**: Build file upload component with drag-and-drop support and file picker fallback. Validate file type (PDF only), file size (max 10MB), and handle upload errors.
- **Acceptance Criteria**:
  - Drag-drop zone highlights on drag-over
  - File picker opens on click
  - Non-PDF files rejected with error message
  - Files >10MB rejected with error message
  - Selected PDF passed to parent component
- **Effort**: 6 hours
- **Notes**: Use react-dropzone or custom implementation
- **Related Requirements**: FR-1.1, NFR-2.1

#### 2.1a Implement Accessibility for PDF Upload

- **Description**: Add ARIA labels, keyboard accessibility, and screen reader support for PDF upload component.
- **Acceptance Criteria**:
  - Dropzone has `aria-label="Upload PDF form"`
  - Dropzone keyboard accessible (Enter key triggers file picker)
  - File picker button has proper `aria-label`
  - Upload progress announced to screen readers via `aria-live="polite"`
  - Error messages announced to screen readers
  - Success message announced when PDF loaded
  - Focus indicator visible on dropzone when tabbed to
- **Effort**: 3 hours
- **Notes**: Ensure WCAG 2.1 AA compliance from start
- **Related Requirements**: NFR-5.1, NFR-5.2, NFR-5.7

#### 2.2 Integrate react-pdf for PDF Rendering

- **Description**: Install react-pdf and pdf.js-dist, create PDFCanvas component to render PDF pages. Handle PDF loading states (loading, error, success). Configure worker for performance.
- **Acceptance Criteria**:
  - PDF renders on canvas within 3 seconds
  - Loading spinner shown during render
  - Error message shown if PDF corrupt or unsupported
  - Multiple pages supported
  - PDF.js worker loaded from CDN
- **Effort**: 8 hours
- **Notes**: Disable text and annotation layers for cleaner rendering
- **Related Requirements**: FR-1.2, FR-1.3, NFR-1.1

#### 2.3 Implement Zoom Controls

- **Description**: Add zoom in/out buttons, zoom percentage display, and fit-to-width/fit-to-page options. Store zoom level in Zustand store. Recalculate canvas dimensions on zoom change.
- **Acceptance Criteria**:
  - Zoom range: 50%-200%
  - Zoom in/out buttons work (±10% per click)
  - Zoom percentage displayed and editable
  - Fit Width and Fit Page buttons resize canvas appropriately
  - Canvas re-renders smoothly on zoom change
- **Effort**: 6 hours
- **Notes**: Debounce zoom changes to avoid excessive re-renders
- **Related Requirements**: NFR-1.2, NFR-4.5

#### 2.4 Build Coordinate Conversion Utilities

- **Description**: Create `viewportToPDFCoords()` and `pdfToViewportCoords()` functions to convert between canvas pixel coordinates and PDF point coordinates. Account for zoom level, canvas scaling, and Y-axis inversion.
- **Acceptance Criteria**:
  - Click at canvas (100, 150) → correct PDF coords calculated
  - PDF coords (50, 600) → correct viewport position rendered
  - Zoom level factored into calculations
  - Y-axis flip (canvas top-left vs PDF bottom-left) handled
  - Unit tests pass for 20+ coordinate pairs
- **Effort**: 8 hours
- **Notes**: Reference Frontend_Field_Definition_Interface.md implementation
- **Related Requirements**: FR-2.4, TR-5.1, TR-5.2, TR-5.3

#### 2.5 Implement Page Navigation

- **Description**: For multi-page PDFs, add previous/next page buttons, page number display/input, and page thumbnail sidebar (basic version). Update Zustand store with current page number.
- **Acceptance Criteria**:
  - Previous/Next buttons change pages
  - Page number shown (e.g., "Page 3 of 10")
  - Clicking page number allows direct input to jump to page
  - Page changes render new page within 500ms
  - Out-of-range page numbers prevented
- **Effort**: 6 hours
- **Notes**: Full thumbnail sidebar can be deferred to future version
- **Related Requirements**: FR-1.4

#### 2.6 Add Loading States & Error Handling

- **Description**: Implement loading spinners, progress indicators, and error messages for PDF operations. Handle edge cases: corrupt PDFs, network failures, unsupported PDF versions.
- **Acceptance Criteria**:
  - Loading spinner during PDF upload and rendering
  - Progress bar for large PDF uploads (>2MB)
  - Clear error messages for all failure scenarios
  - Retry button on network errors
  - User can cancel long-running operations
- **Effort**: 4 hours
- **Notes**: Use Tailwind CSS for spinner animations
- **Related Requirements**: NFR-3.2, NFR-4.1

---

## Task 3: Field Placement System

**Description**: Create the interactive field placement system allowing users to add text fields (click-drag) and checkboxes (click) on the PDF canvas. Implement visual field markers with color coding.

**Estimated Duration**: 5-6 days

**Dependencies**: Task 2 (PDF Canvas Rendering)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 3.1 Create Toolbar with Field Type Buttons

- **Description**: Build top toolbar component with buttons for each field type (Text, Checkbox, Radio, Dropdown). Implement active tool state highlighting. Add tooltips for each button.
- **Acceptance Criteria**:
  - Toolbar fixed at top of viewport (56px height)
  - 4 field type buttons rendered with icons
  - Active tool button highlighted (different background color)
  - Clicking button sets active tool in Zustand store
  - Tooltips appear on hover within 500ms
- **Effort**: 6 hours
- **Notes**: Use Lucide React icons for buttons
- **Related Requirements**: FR-2.1, DR-1.3

#### 3.2 Implement Tool Selection State Management

- **Description**: Add tool mode to Zustand store (`'select' | 'text-field' | 'checkbox-field' | 'radio-field' | 'dropdown-field'`). Create actions to change tool mode. Bind toolbar buttons to state.
- **Acceptance Criteria**:
  - `activeTool` state in store
  - `setActiveTool(tool)` action updates state
  - Toolbar buttons read from and update state
  - ESC key resets to 'select' mode
- **Effort**: 3 hours
- **Notes**: Default tool is 'select'
- **Related Requirements**: FR-2.1

#### 3.3 Implement Text Field Click-Drag Placement

- **Description**: Add mouse event handlers to canvas for text field creation. On mouse down, record start position. On mouse move, show preview rectangle. On mouse up, create field with calculated dimensions.
- **Acceptance Criteria**:
  - User clicks and drags → dotted rectangle preview shown
  - On release, field marker appears with final dimensions
  - Minimum width validation (36pt) enforced
  - If width <36pt, show error and don't create field
  - Tool resets to 'select' after field creation
- **Effort**: 10 hours
- **Notes**: Use temporary overlay div for preview rectangle
- **Related Requirements**: FR-2.2, FR-2.5

#### 3.4 Implement Checkbox Single-Click Placement

- **Description**: Add click handler for checkbox placement. On single click, create 20x20pt checkbox at cursor position. No drag interaction needed.
- **Acceptance Criteria**:
  - User clicks canvas → checkbox appears instantly
  - Checkbox size is exactly 20x20pt
  - Checkbox positioned at click coordinates (converted to PDF coords)
  - Tool resets to 'select' after placement
- **Effort**: 4 hours
- **Notes**: Simpler than text field (no drag preview needed)
- **Related Requirements**: FR-2.3

#### 3.5 Create Field Marker Components

- **Description**: Build TextField and CheckboxField React components to visually represent fields on canvas. Use react-rnd for drag/resize capabilities. Apply color coding per field type.
- **Acceptance Criteria**:
  - TextField renders as blue (#3B82F6) bordered rectangle
  - CheckboxField renders as green (#10B981) square
  - Field name displayed as label in top-left corner
  - Delete button (✕) in top-right corner
  - Fields draggable and resizable (text only)
  - Hover state shows purple (#8B5CF6) border
- **Effort**: 12 hours
- **Notes**: Use react-rnd for drag/resize, style with Tailwind
- **Related Requirements**: FR-2.7, DR-1.2

#### 3.6 Implement Auto-Generated Field Names

- **Description**: Create utility function to generate unique field names (field_1, field_2, etc.). Track highest field number in Zustand store. Ensure no duplicates across template.
- **Acceptance Criteria**:
  - First field named "field_1"
  - Second field named "field_2"
  - Deleting field doesn't reuse number
  - Counter persists across save/load
  - Names unique even after copy/paste
- **Effort**: 3 hours
- **Notes**: Use simple incrementing counter, stored in template metadata
- **Related Requirements**: FR-2.6

#### 3.7 Add Fields to Zustand Store

- **Description**: Create store actions: `addField()`, `updateField()`, `deleteField()`. Implement field array in store with proper TypeScript types. Ensure fields persist in store state.
- **Acceptance Criteria**:
  - `fields: FieldDefinition[]` array in store
  - `addField()` appends new field to array
  - `updateField(id, updates)` merges partial updates
  - `deleteField(id)` removes field from array
  - Store state updates trigger re-renders
- **Effort**: 4 hours
- **Notes**: Use immer middleware for immutable updates
- **Related Requirements**: FR-2.7, DR-1.1

---

## Task 4: Field Management System

**Description**: Implement field selection, properties panel, editing capabilities (move, resize, delete), and copy/paste/duplicate functionality.

**Estimated Duration**: 4-5 days

**Dependencies**: Task 3 (Field Placement)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 4.1 Implement Field Selection Logic

- **Description**: Add click handlers to field markers to select/deselect fields. Highlight selected field with amber border. Store selected field ID in Zustand. Clicking canvas background deselects.
- **Acceptance Criteria**:
  - Clicking field selects it (border changes to amber)
  - Clicking another field deselects previous, selects new
  - Clicking canvas background deselects all
  - ESC key deselects current field
  - Selected field ID stored in `selectedFieldId` state
- **Effort**: 4 hours
- **Notes**: Prevent selection when in field placement mode
- **Related Requirements**: FR-3.1

#### 4.2 Create Right-Side Properties Panel

- **Description**: Build sliding panel component (320px wide) that appears on right side when field is selected. Implement slide-in animation (200ms). Show field configuration form.
- **Acceptance Criteria**:
  - Panel hidden when no field selected
  - Panel slides in from right when field selected
  - Panel shows current field's properties
  - Panel updates when different field selected
  - Panel slides out when field deselected
- **Effort**: 6 hours
- **Notes**: Use Tailwind transition utilities for animation
- **Related Requirements**: FR-3.1, FR-3.2, DR-2.5

#### 4.3 Build Field Properties Form

- **Description**: Create form inputs for field properties: name (read-only), Hebrew caption (editable), type (display only), required checkbox, default value, RTL direction toggle, font selection, font size.
- **Acceptance Criteria**:
  - All 8 properties displayed with proper labels (Hebrew)
  - Name shown as read-only text (grayed out)
  - Caption input accepts Hebrew text
  - Required checkbox toggles boolean
  - Default value input accepts text
  - RTL toggle switches between 'rtl' and 'ltr'
  - Font dropdown shows Noto Sans Hebrew and Arial
  - Font size input restricted to 8-24pt range
- **Effort**: 8 hours
- **Notes**: Use controlled components, update on blur or Enter key
- **Related Requirements**: FR-3.2

#### 4.4 Implement Property Updates

- **Description**: Connect form inputs to Zustand store. On input change, update field in store. Debounce updates to avoid excessive re-renders. Validate inputs before storing.
- **Acceptance Criteria**:
  - Editing caption updates store after 300ms debounce
  - Toggling required updates store immediately
  - Changing font updates store immediately
  - Invalid font size (e.g., 5pt) shows validation error
  - Updates trigger field marker re-render
- **Effort**: 5 hours
- **Notes**: Use useDebouncedCallback for text inputs
- **Related Requirements**: FR-3.3, NFR-1.3

#### 4.5 Implement Field Deletion

- **Description**: Add delete button (✕) to field markers and Delete key handler. Show confirmation modal for deletion. Remove field from store on confirm.
- **Acceptance Criteria**:
  - Clicking ✕ button shows "Delete field?" confirmation
  - Pressing Delete key (when field selected) shows confirmation
  - Confirming removes field from canvas and store
  - Canceling keeps field
  - Deletion is undoable (via undo system in Task 5)
- **Effort**: 4 hours
- **Notes**: Use simple confirm() dialog or custom modal
- **Related Requirements**: FR-3.4

#### 4.6 Implement Field Repositioning

- **Description**: Enable drag-and-drop repositioning of field markers via react-rnd. Update field x/y coordinates in store on drag stop. Prevent dragging outside PDF boundaries.
- **Acceptance Criteria**:
  - User can drag field to new position
  - Position updates in store on drag stop
  - PDF coordinates calculated correctly
  - Field cannot be dragged outside PDF bounds
  - Drag operation is undoable
- **Effort**: 5 hours
- **Notes**: Use react-rnd onDragStop callback, boundary checking
- **Related Requirements**: FR-4.1

#### 4.7 Implement Field Resizing

- **Description**: Enable resizing of text fields via react-rnd corner handles. Update field width/height in store on resize stop. Enforce minimum size (36pt width). Checkboxes not resizable.
- **Acceptance Criteria**:
  - Text fields show 8 resize handles when selected
  - Dragging handle resizes field
  - Width cannot go below 36pt (validation enforced)
  - Checkboxes show no resize handles (fixed 20x20pt)
  - Resize updates store on resize stop
  - Resize operation is undoable
- **Effort**: 6 hours
- **Notes**: react-rnd provides resize handles by default
- **Related Requirements**: FR-4.2

#### 4.8 Implement Copy/Paste Functionality

- **Description**: Add Ctrl+C and Ctrl+V keyboard handlers. Copy selected field to clipboard state. Paste creates duplicate with new ID and name, offset by 20pt from original.
- **Acceptance Criteria**:
  - Ctrl+C copies selected field (no visual feedback needed)
  - Ctrl+V pastes field at offset position (20pt right, 20pt down)
  - Pasted field has unique name (field_N+1)
  - Pasted field auto-selected after paste
  - Copy/paste works across pages
  - Cannot paste if no field copied
- **Effort**: 5 hours
- **Notes**: Store copied field in Zustand, not system clipboard
- **Related Requirements**: FR-4.3

#### 4.9 Implement Duplicate Field Command

- **Description**: Add "Duplicate" option to field context menu or toolbar button. Create copy of selected field with offset positioning and unique name.
- **Acceptance Criteria**:
  - Right-clicking field shows context menu with "Duplicate"
  - Clicking "Duplicate" creates copy at 20pt offset
  - Duplicate has unique auto-generated name
  - Duplicate is auto-selected
  - Duplicate operation is undoable
- **Effort**: 4 hours
- **Notes**: Can reuse copy/paste logic internally
- **Related Requirements**: FR-4.4

---

## Task 5: Undo/Redo System

**Description**: Implement command pattern-based undo/redo system supporting all field operations. Build undo/redo UI controls and keyboard shortcuts.

**Estimated Duration**: 3-4 days

**Dependencies**: Task 4 (Field Management)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 5.1 Design UndoAction Interface

- **Description**: Create TypeScript interface for undoable actions with execute() and undo() methods. Define action types (ADD_FIELD, DELETE_FIELD, UPDATE_FIELD, MOVE_FIELD, RESIZE_FIELD).
- **Acceptance Criteria**:
  - `UndoAction` interface defined with required properties
  - Action types enumerated
  - Each action type has specific payload structure
  - Type guards for narrowing action types
- **Effort**: 3 hours
- **Notes**: Use discriminated union for type safety
- **Related Requirements**: FR-5.1, FR-5.2

#### 5.2 Implement UndoManager Class

- **Description**: Create UndoManager class with undo/redo stacks, execute(), undo(), redo(), canUndo(), canRedo() methods. Limit undo stack to 50 actions. Clear redo stack on new action.
- **Acceptance Criteria**:
  - UndoManager instantiated in Zustand store
  - `execute(action)` runs action and pushes to undo stack
  - `undo()` pops from undo stack, pushes to redo stack, runs undo()
  - `redo()` pops from redo stack, pushes to undo stack, runs execute()
  - Stack size limited to 50 (oldest removed when exceeded)
  - Redo stack cleared when new action executed
- **Effort**: 8 hours
- **Notes**: Reference Command Pattern best practices from research
- **Related Requirements**: FR-5.1, FR-5.2, FR-5.3, FR-5.4

#### 5.3 Create Undo Actions for Field Operations

- **Description**: Implement factory functions for each field operation: `addFieldAction()`, `deleteFieldAction()`, `updateFieldAction()`, `moveFieldAction()`, `resizeFieldAction()`. Each returns UndoAction with execute/undo methods.
- **Acceptance Criteria**:
  - `addFieldAction()` → execute adds field, undo removes it
  - `deleteFieldAction()` → execute removes, undo restores
  - `updateFieldAction()` → execute updates props, undo reverts to previous
  - `moveFieldAction()` → execute moves, undo returns to original position
  - `resizeFieldAction()` → execute resizes, undo returns to original size
  - All actions properly typed
- **Effort**: 10 hours
- **Notes**: Store previous state in action for reversal
- **Related Requirements**: FR-5.1

#### 5.4 Integrate Undo Actions with Field Operations

- **Description**: Modify all field operations (addField, deleteField, updateField, etc.) to use UndoManager.execute() instead of directly mutating store. Ensure all user actions create undo actions.
- **Acceptance Criteria**:
  - Creating field calls `undoManager.execute(addFieldAction(...))`
  - Deleting field calls `undoManager.execute(deleteFieldAction(...))`
  - All field ops wrapped in undo actions
  - No direct store mutations bypass undo system
  - Undo/redo correctly reverses all operations
- **Effort**: 6 hours
- **Notes**: Refactor existing field operations to use undo manager
- **Related Requirements**: FR-5.1

#### 5.5 Implement Keyboard Shortcuts

- **Description**: Add global keyboard event listeners for Ctrl+Z (undo) and Ctrl+Shift+Z (redo). Call UndoManager methods on key press. Prevent default browser behavior.
- **Acceptance Criteria**:
  - Ctrl+Z triggers undo
  - Ctrl+Shift+Z triggers redo
  - Shortcuts work from any focused element
  - Browser undo behavior prevented
  - Mac: Cmd+Z and Cmd+Shift+Z also work
- **Effort**: 3 hours
- **Notes**: Use useEffect with window.addEventListener
- **Related Requirements**: FR-5.1, FR-5.2, NFR-4.3

#### 5.6 Create Undo/Redo Toolbar Buttons

- **Description**: Add undo and redo buttons to toolbar with icons. Enable/disable based on stack state. Show tooltips with keyboard shortcuts.
- **Acceptance Criteria**:
  - Undo button in toolbar (left arrow icon)
  - Redo button in toolbar (right arrow icon)
  - Buttons disabled when respective stacks empty
  - Clicking buttons calls undo/redo methods
  - Tooltips show "Undo (Ctrl+Z)" and "Redo (Ctrl+Shift+Z)"
- **Effort**: 4 hours
- **Notes**: Use canUndo() and canRedo() for button states
- **Related Requirements**: FR-5.5, DR-2.4

---

## Task 6: Template Persistence & Firebase Integration

**Description**: Implement template saving to Firebase, auto-save functionality, and crash recovery using localStorage.

**Estimated Duration**: 4-5 days

**Dependencies**: Task 4 (Field Management), Firebase setup

**Owner**: Frontend Engineer + Backend Engineer

### Sub-tasks:

#### 6.1 Design Template Data Model

- **Description**: Define TypeScript interfaces for Template and FieldDefinition matching Firestore schema. Ensure all required fields included (id, userId, name, fields, metadata, timestamps).
- **Acceptance Criteria**:
  - `Template` interface matches Firestore document structure
  - `FieldDefinition` interface includes all 15+ properties
  - All fields properly typed (no `any`)
  - Validation functions for required fields
- **Effort**: 3 hours
- **Notes**: Reference PRD data models section
- **Related Requirements**: DR-1.1, DR-1.2

#### 6.2 Implement Save Template Functionality

- **Description**: Create saveTemplate() function that prompts for template name, validates input, serializes store state to Template object, saves to Firestore, and shows success/error message.
- **Acceptance Criteria**:
  - Clicking "Save" button prompts for template name (Hebrew input)
  - Empty name rejected with validation error
  - Template object created with all required fields
  - Firestore document created at `templates/{templateId}`
  - Success toast shown on save
  - Error toast shown on failure
- **Effort**: 8 hours
- **Notes**: Use Firestore addDoc() or setDoc() with generated ID
- **Related Requirements**: FR-6.1, FR-6.5

#### 6.3 Implement PDF Upload to Firebase Storage

- **Description**: Upload original PDF file to Firebase Storage at path `pdfs/{userId}/{templateId}.pdf`. Store download URL in template metadata. Handle upload progress and errors.
- **Acceptance Criteria**:
  - PDF uploaded to correct Storage path
  - Upload progress shown (progress bar)
  - Download URL retrieved after upload
  - URL stored in template.pdfUrl field
  - Upload errors caught and shown to user
  - Retry mechanism on network failure
- **Effort**: 6 hours
- **Notes**: Use Firebase Storage uploadBytes() or uploadBytesResumable()
- **Related Requirements**: FR-6.4, NFR-3.2

#### 6.4 Implement Auto-Save

- **Description**: Add auto-save timer (2 minutes) that saves template to Firestore without user action. Show subtle indicator when auto-save occurs. Only save if changes detected.
- **Acceptance Criteria**:
  - Auto-save triggers every 2 minutes
  - Only saves if template modified since last save
  - Subtle notification shown ("Auto-saved at 3:45 PM")
  - Does not interrupt user's work
  - Timer resets on manual save
- **Effort**: 5 hours
- **Notes**: Use setInterval in useEffect, track dirty state
- **Related Requirements**: FR-6.6

#### 6.5 Implement Crash Recovery with localStorage

- **Description**: Backup template state to localStorage every 30 seconds. On app load, check for unsaved work and prompt user to recover. Clear localStorage on successful save.
- **Acceptance Criteria**:
  - Template state written to localStorage every 30 seconds
  - On app load, check for recovery data
  - If found, show "Recover unsaved work?" modal
  - Clicking "Recover" loads state from localStorage
  - Clicking "Discard" clears localStorage
  - localStorage cleared after successful save
- **Effort**: 6 hours
- **Notes**: Use separate timer from auto-save
- **Related Requirements**: NFR-3.1

#### 6.6 Implement Download PDF Functionality

- **Description**: Add "Download" button that generates fillable PDF (using pdf-lib, from Task 8), creates Blob, triggers browser download with proper filename.
- **Acceptance Criteria**:
  - Clicking "Download" generates PDF
  - PDF contains all AcroForm fields
  - Browser download initiated with filename "{templateName}.pdf"
  - Loading spinner shown during generation
  - Error handling for generation failures
- **Effort**: 4 hours
- **Notes**: Depends on Task 8 (PDF generation). Can create placeholder for now.
- **Related Requirements**: FR-6.7

#### 6.7 Create Firebase Security Rules

- **Description**: Write Firestore Security Rules allowing users to read/write only their own templates. Write Storage Rules for PDF uploads. Test rules with Firebase Emulator.
- **Acceptance Criteria**:
  - Users can only query templates where `userId == auth.uid`
  - Users can only write templates with their own userId
  - Storage PDFs readable by owner only
  - Storage uploads restricted to authenticated users
  - Rules tested with emulator, all scenarios pass
- **Effort**: 5 hours
- **Notes**: Backend engineer task. Use Firebase Security Rules language.
- **Related Requirements**: NFR-2.4, IR-1.3, IR-1.4

---

## Task 7: Session Locking & Concurrency Control

**Description**: Implement session locking to prevent concurrent edits from multiple browser sessions.

**Estimated Duration**: 3-4 days

**Dependencies**: Task 6 (Firebase Integration)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 7.1 Design Session Lock Data Model

- **Description**: Define SessionLock interface with templateId, userId, sessionId, lockedAt, expiresAt fields. Create Firestore collection `session_locks` with template ID as document ID.
- **Acceptance Criteria**:
  - `SessionLock` interface properly typed
  - Firestore collection structure documented
  - Lock expires after 30 minutes (expiresAt calculation)
  - Session ID generated using UUID
- **Effort**: 2 hours
- **Notes**: Use Firestore Timestamp for timestamps
- **Related Requirements**: DR-2.1

#### 7.2 Implement Lock Acquisition

- **Description**: Create `acquireEditLock()` function using Firestore transaction to atomically check and create lock. Return success/failure boolean. Show error if lock already held by another session.
- **Acceptance Criteria**:
  - Function uses Firestore runTransaction()
  - Checks if lock exists and is not expired
  - Creates lock if available
  - Throws error if locked by different session
  - Transaction succeeds or fails atomically
  - Lock document created at `session_locks/{templateId}`
- **Effort**: 8 hours
- **Notes**: Reference research findings on Firestore pessimistic locking
- **Related Requirements**: FR-7.1, FR-7.2

#### 7.3 Implement Lock Heartbeat

- **Description**: Add heartbeat timer (every 5 minutes) that updates lock's expiresAt timestamp to extend lock while editing. Stop heartbeat on save/close.
- **Acceptance Criteria**:
  - Timer starts after lock acquired
  - Every 5 minutes, updates expiresAt to +30 minutes from now
  - Timer stops when user closes editor
  - Timer stops on save
  - Failed heartbeats logged but don't interrupt user
- **Effort**: 4 hours
- **Notes**: Use setInterval, clear on unmount
- **Related Requirements**: FR-7.3

#### 7.4 Implement Lock Release

- **Description**: Create `releaseEditLock()` function to delete lock document from Firestore. Call on save, close, or explicit user action. Handle errors gracefully.
- **Acceptance Criteria**:
  - Function deletes `session_locks/{templateId}` document
  - Called when user clicks "Close" or "Save"
  - Called when user navigates away (beforeunload event)
  - Errors logged but don't block user
  - Lock released even if save failed
- **Effort**: 3 hours
- **Notes**: Use Firestore deleteDoc()
- **Related Requirements**: FR-7.4

#### 7.5 Implement Auto-Expire Locks

- **Description**: Add Cloud Function (or client-side check) to auto-delete expired locks. Query locks where `expiresAt < now` and delete. Run every 10 minutes.
- **Acceptance Criteria**:
  - Function queries expired locks
  - Deletes all expired lock documents
  - Runs on schedule (every 10 minutes)
  - Logs deletions for debugging
  - Handles errors without crashing
- **Effort**: 5 hours
- **Notes**: Can use Firebase Functions scheduled trigger or client-side check
- **Related Requirements**: FR-7.3

#### 7.6 Implement Lock Status UI

- **Description**: Show lock status indicator in UI ("Editing", "Locked by User X", "Lock expires in Y minutes"). Provide "Force Unlock" button for template owner.
- **Acceptance Criteria**:
  - Status badge shown in toolbar
  - "Editing" shown when current user has lock
  - "Locked by [name]" shown when locked by others
  - Countdown timer shows minutes until lock expires
  - Template owner sees "Force Unlock" button
  - Force unlock prompts for confirmation
- **Effort**: 6 hours
- **Notes**: Use Firestore real-time listener for lock status
- **Related Requirements**: FR-7.2, FR-7.5

#### 7.7 Implement Conflict Detection

- **Description**: Detect when template was modified externally (by another session after lock expired). Show warning modal with options: "Reload", "Overwrite", "Save Copy".
- **Acceptance Criteria**:
  - Compare template.updatedAt on save with last known timestamp
  - If newer, show conflict warning modal
  - "Reload" discards local changes, loads latest version
  - "Overwrite" saves local changes, increments version
  - "Save Copy" creates new template with different name
- **Effort**: 6 hours
- **Notes**: Track template version number for conflict detection
- **Related Requirements**: FR-7.5

---

## Task 8: Hebrew Font Integration & PDF Generation

**Description**: Integrate Noto Sans Hebrew font embedding with pdf-lib, implement AcroForm field generation, and ensure 99% Hebrew text rendering accuracy.

**Estimated Duration**: 4-5 days

**Dependencies**: Task 6 (Template Persistence)

**Owner**: Frontend Engineer

### Sub-tasks:

#### 8.1 Add Noto Sans Hebrew Font to Project

- **Description**: Download Noto Sans Hebrew Regular font, add to `/public/fonts/` directory. Preload font in HTML head for performance. Verify font loads correctly.
- **Acceptance Criteria**:
  - NotoSansHebrew-Regular.ttf in `/public/fonts/`
  - Font preloaded with `<link rel="preload">`
  - Font loads successfully in browser
  - Font file size <2MB
- **Effort**: 2 hours
- **Notes**: Use Google Fonts or GitHub source (not raw URL from research findings)
- **Related Requirements**: TR-4.1

#### 8.2 Integrate pdf-lib and fontkit

- **Description**: Install pdf-lib and @pdf-lib/fontkit npm packages. Register fontkit with PDFDocument. Test basic PDF creation and font embedding.
- **Acceptance Criteria**:
  - `npm install pdf-lib @pdf-lib/fontkit` successful
  - Fontkit registered: `PDFDocument.registerFontkit(fontkit)`
  - Test PDF created with embedded font
  - No console errors
- **Effort**: 3 hours
- **Notes**: Use exact versions: pdf-lib@^1.17.1, @pdf-lib/fontkit@^1.1.1
- **Related Requirements**: TR-1.6, IR-2.1, IR-2.2

#### 8.3 Implement Hebrew Font Embedding

- **Description**: Create `embedHebrewFont()` function that fetches font file, loads bytes, embeds in PDF with `subset: false` option. Handle loading errors.
- **Acceptance Criteria**:
  - Function fetches `/fonts/NotoSansHebrew-Regular.ttf`
  - Font embedded with `pdfDoc.embedFont(fontBytes, { subset: false })`
  - Returns PDFFont instance
  - Errors caught and logged
  - Font embedding succeeds consistently
- **Effort**: 4 hours
- **Notes**: CRITICAL: `subset: false` to prevent Hebrew character mapping issues
- **Related Requirements**: TR-4.2, TR-4.3

#### 8.4 Implement AcroForm Text Field Creation

- **Description**: Create function to add text field to PDF using pdf-lib. Apply Hebrew font, set RTL alignment, configure field properties (name, default value, required).
- **Acceptance Criteria**:
  - `form.createTextField(name)` creates field
  - Field added to page with correct coordinates
  - Hebrew font applied with `textField.updateAppearances(hebrewFont)`
  - Default value set if provided
  - Required flag set correctly
  - Field is fillable in PDF viewers
- **Effort**: 6 hours
- **Notes**: Reference pdf-lib docs and research examples
- **Related Requirements**: FR-6.2, TR-4.4, IR-2.3

#### 8.5 Implement AcroForm Checkbox Creation

- **Description**: Create function to add checkbox to PDF. Position at correct coordinates (20x20pt), set name and default state.
- **Acceptance Criteria**:
  - `form.createCheckBox(name)` creates checkbox
  - Checkbox added to page at (x, y) coordinates
  - Size is exactly 20x20pt
  - Default state (checked/unchecked) set correctly
  - Checkbox is clickable in PDF viewers
- **Effort**: 4 hours
- **Notes**: Checkboxes don't need font embedding
- **Related Requirements**: FR-6.2, IR-2.3

#### 8.6 Implement Full PDF Generation Function

- **Description**: Create `generateFillablePDF()` function that loads original PDF, embeds Hebrew font, creates all AcroForm fields from template.fields array, returns PDF bytes.
- **Acceptance Criteria**:
  - Function accepts Template object as input
  - Loads original PDF from template.pdfUrl
  - Embeds Hebrew font once
  - Iterates through all fields, creates AcroForm fields
  - Handles multi-page PDFs correctly
  - Returns Uint8Array PDF bytes
  - Generated PDF is valid (opens in viewers)
- **Effort**: 8 hours
- **Notes**: This is the core PDF generation logic
- **Related Requirements**: FR-6.2, FR-6.3, IR-2.4

#### 8.7 Implement Font Selection in Properties Panel

- **Description**: Add font dropdown to properties panel with options: "Noto Sans Hebrew", "Arial". Update field.font property on change. Apply selected font to PDF generation.
- **Acceptance Criteria**:
  - Dropdown shows 2 font options
  - Default is "Noto Sans Hebrew"
  - Changing font updates field in store
  - PDF generation uses selected font per field
  - Arial embedded if any field uses it
- **Effort**: 4 hours
- **Notes**: Embed both fonts if template uses both
- **Related Requirements**: FR-3.2

#### 8.8 Test Hebrew Rendering in Multiple PDF Viewers

- **Description**: Create test suite that generates PDFs with various Hebrew scenarios (simple text, nikud, mixed Hebrew/English) and verifies rendering in Adobe Reader, Chrome, Firefox, Safari.
- **Acceptance Criteria**:
  - Test generates 5 sample PDFs with Hebrew content
  - Manual verification in Adobe Reader: Hebrew not reversed
  - Chrome PDF viewer: Hebrew renders correctly
  - Firefox PDF viewer: Hebrew renders correctly
  - Safari PDF viewer: Hebrew renders correctly
  - Edge PDF viewer: Hebrew renders correctly
  - Document test results with screenshots
- **Effort**: 8 hours
- **Notes**: Manual testing required, automated visual testing is bonus
- **Related Requirements**: AC-6, NFR-1.1

---

## Task 9: Testing, QA & Documentation

**Description**: Comprehensive testing across unit, component, integration, and E2E levels. Manual QA for Hebrew rendering, cross-browser compatibility, and accessibility.

**Estimated Duration**: 5-6 days

**Dependencies**: Tasks 1-8 (all features complete)

**Owner**: QA Engineer + Frontend Engineer

### Sub-tasks:

#### 9.1 Write Unit Tests for Utilities

- **Description**: Create Vitest unit tests for coordinate conversion functions, field validation, Hebrew text detection, field name generation. Aim for 90%+ coverage of utility functions.
- **Acceptance Criteria**:
  - `viewportToPDFCoords()`: 20+ test cases with various zoom levels
  - `pdfToViewportCoords()`: 20+ test cases
  - `validateFieldSize()`: 10+ test cases (valid, invalid widths)
  - `generateFieldName()`: 10+ test cases (uniqueness, incrementing)
  - `detectTextDirection()`: 8+ test cases (Hebrew, English, mixed)
  - All tests pass with `npm run test`
  - Coverage >90% for /utils folder
- **Effort**: 12 hours
- **Notes**: Use Vitest for fast unit testing
- **Related Requirements**: VM-1 (Unit Tests)

#### 9.2 Write Component Tests

- **Description**: Use React Testing Library to test field placement workflow, properties panel interactions, toolbar button clicks, keyboard shortcuts.
- **Acceptance Criteria**:
  - Toolbar: 10+ tests (button clicks, tool selection, active states)
  - Field placement: 15+ tests (click-drag, single-click, validation)
  - Properties panel: 15+ tests (form inputs, updates, validation)
  - Keyboard shortcuts: 10+ tests (Ctrl+Z, Ctrl+V, Delete, etc.)
  - All tests pass
  - Coverage >80% for /components folder
- **Effort**: 16 hours
- **Notes**: Mock Zustand store for isolated component testing
- **Related Requirements**: VM-1 (Component Tests)

#### 9.3 Write Integration Tests

- **Description**: Test Firebase operations (save template, upload PDF, acquire lock, release lock), Zustand store state management, PDF generation end-to-end.
- **Acceptance Criteria**:
  - Save template: 5+ scenarios (success, error, validation)
  - Upload PDF: 3+ scenarios (success, large file, network error)
  - Session locking: 6+ scenarios (acquire, release, expired, conflict)
  - PDF generation: 5+ scenarios (Hebrew text, multi-page, errors)
  - All tests pass
  - Use Firebase Emulator for testing
- **Effort**: 12 hours
- **Notes**: Set up Firebase Emulator Suite for offline testing
- **Related Requirements**: VM-1 (Integration Tests)

#### 9.4 Write E2E Tests with Playwright

- **Description**: Create Playwright tests for full template creation workflow, save/load, session locking, error scenarios.
- **Acceptance Criteria**:
  - E2E: Upload PDF → place fields → configure properties → save → success
  - E2E: Load template → edit fields → save → verify changes
  - E2E: Concurrent editing → session lock error shown
  - E2E: Undo/redo full workflow
  - E2E: Copy/paste fields workflow
  - All E2E tests pass in CI/CD
  - Screenshots captured for failures
- **Effort**: 16 hours
- **Notes**: Run in headless mode for CI, headed for debugging
- **Related Requirements**: VM-1 (Integration Tests)

#### 9.5 Manual QA Checklist

- **Description**: Execute manual testing checklist covering all functional requirements, edge cases, and user workflows. Document findings in QA report.
- **Acceptance Criteria**:
  - All items in AC-1 through AC-6 tested and passing
  - Edge cases tested (corrupt PDF, network failures, etc.)
  - Browser compatibility tested (Chrome, Firefox, Safari)
  - Hebrew rendering verified manually in 5+ PDF viewers
  - Performance tested with large PDFs (50 pages, 50 fields)
  - QA report created with pass/fail for each item
- **Effort**: 10 hours
- **Notes**: Involves manual verification, screenshots, and documentation
- **Related Requirements**: AC-1 through AC-6, VM-2

#### 9.6 Accessibility Audit

- **Description**: Run axe-core automated accessibility scan, test keyboard-only navigation, verify screen reader compatibility, check WCAG 2.1 AA compliance.
- **Acceptance Criteria**:
  - axe-core scan: 0 critical violations
  - Full app navigable with keyboard only
  - Screen reader (NVDA/VoiceOver) announces all UI elements
  - Focus indicators visible on all interactive elements
  - Color contrast meets WCAG AA (4.5:1 for text)
  - ARIA labels present on all buttons and inputs
- **Effort**: 8 hours
- **Notes**: Use axe DevTools browser extension
- **Related Requirements**: NFR-5.1, NFR-5.2, NFR-5.3, VM-2

#### 9.7 Performance Testing

- **Description**: Test performance with large PDFs (50+ pages), many fields (50+), and various network conditions. Measure and document load times, interaction responsiveness.
- **Acceptance Criteria**:
  - 50-page PDF renders in <5 seconds
  - 50 fields on canvas: drag/resize operations smooth (>30fps)
  - Auto-save completes in <2 seconds
  - PDF generation (50 fields) completes in <5 seconds
  - Network throttling: app remains usable on 3G
  - Performance report created with metrics
- **Effort**: 6 hours
- **Notes**: Use Chrome DevTools Performance profiler
- **Related Requirements**: NFR-1.1 through NFR-1.6, VM-2

#### 9.8 Create User Documentation

- **Description**: Write user-facing documentation: how to create templates, keyboard shortcuts reference, troubleshooting guide, FAQ.
- **Acceptance Criteria**:
  - "Getting Started" guide (5-10 minutes read)
  - "Creating Your First Template" tutorial with screenshots
  - Keyboard shortcuts reference card
  - Troubleshooting common issues (10+ scenarios)
  - FAQ (15+ questions)
  - All docs in Hebrew and English
- **Effort**: 8 hours
- **Notes**: Use markdown format, add to /Documents folder
- **Related Requirements**: N/A (User enablement)

#### 9.9 Create Developer Documentation

- **Description**: Write developer documentation: architecture overview, setup instructions, code structure, testing guide, deployment guide.
- **Acceptance Criteria**:
  - Architecture diagram (component hierarchy, data flow)
  - Local setup instructions (env variables, Firebase config)
  - Code structure explanation (/components, /store, etc.)
  - Testing guide (how to run tests, add new tests)
  - Deployment guide (build, Firebase deploy)
  - Contribution guidelines
- **Effort**: 8 hours
- **Notes**: Use markdown, include code examples
- **Related Requirements**: N/A (Developer enablement)

---

## Risk Mitigation Tasks

### RM-1: Hebrew Rendering Validation Suite

**Description**: Create automated validation suite that generates test PDFs with various Hebrew scenarios and allows manual verification.

**Effort**: 4 hours

**Owner**: Frontend Engineer

**Priority**: High

**When**: After Task 8.6 (PDF generation)

### RM-2: Coordinate System Visual Debugger

**Description**: Build debug mode that overlays grid, rulers, and coordinate labels on canvas to help verify field positioning accuracy.

**Effort**: 6 hours

**Owner**: Frontend Engineer

**Priority**: Medium

**When**: During Task 2.4 (coordinate conversion)

### RM-3: Session Lock Health Dashboard

**Description**: Create admin view showing all active session locks, their status, and ability to force-release locks.

**Effort**: 4 hours

**Owner**: Frontend Engineer

**Priority**: Low

**When**: After Task 7.6 (lock status UI)

---

## Critical Path Analysis

**Longest sequence of dependent tasks:**

1. Task 1 (Foundation) → 2-3 days
2. Task 2 (PDF Canvas) → 4-5 days
3. Task 3 (Field Placement) → 5-6 days
4. Task 4 (Field Management) → 4-5 days
5. Task 5 (Undo/Redo) → 3-4 days
6. Task 6 (Firebase) → 4-5 days
7. Task 8 (Hebrew/PDF) → 4-5 days
8. Task 9 (Testing) → 5-6 days

**Total Critical Path**: 31-39 days

**Parallel Task**: Task 7 (Session Locking) can run parallel with Task 8, saving 3-4 days.

**Optimistic Timeline**: 28 days (5.5 weeks)
**Realistic Timeline**: 35 days (7 weeks)
**Pessimistic Timeline**: 42 days (8.5 weeks)

---

## Definition of Done

A task is considered "done" when:

1. ✅ All sub-tasks completed
2. ✅ Code reviewed and approved
3. ✅ Unit tests written and passing (>80% coverage)
4. ✅ Component tests written and passing
5. ✅ Manual testing completed
6. ✅ Acceptance criteria met
7. ✅ No critical bugs
8. ✅ Documentation updated
9. ✅ Merged to feature branch

The feature is considered "done" when:

1. ✅ All 8 tasks completed
2. ✅ E2E tests passing
3. ✅ Hebrew rendering validated in 5+ PDF viewers
4. ✅ Cross-browser testing passed
5. ✅ Accessibility audit passed
6. ✅ Performance benchmarks met
7. ✅ User and developer docs complete
8. ✅ Deployed to staging environment
9. ✅ Product Owner sign-off

---

## Next Steps After Completion

1. **Beta Testing**: Deploy to 5-10 Israeli administrators for real-world testing
2. **Iterate**: Collect feedback, fix issues, improve UX
3. **Template Library Phase**: Implement main page with preview cards (Task scope expansion)
4. **Smart Features**: Add OCR-based field label detection (Option A from research)
5. **Mobile Support**: Adapt UI for tablet/phone screens
6. **Advanced Fields**: Add radio groups, dropdowns, signature fields
7. **API Integration**: Build API for external systems to submit form data

---

## Document History

- **v1.0 (2025-11-09)**: Initial task breakdown with 52 detailed sub-tasks

