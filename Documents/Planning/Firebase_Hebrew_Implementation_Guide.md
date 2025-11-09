# Firebase Implementation Guide for Hebrew PDF Filler

## 1. Firebase Project Setup for Hebrew Support

### 1.1 Initial Configuration
```bash
# Create new Firebase project
firebase init

# Select services
✓ Firestore
✓ Functions (TypeScript)
✓ Hosting
✓ Storage
✓ Emulators

# Configure for Hebrew/RTL
firebase functions:config:set \
  app.locale="he-IL" \
  app.direction="rtl" \
  app.timezone="Asia/Jerusalem"
```

### 1.2 Firebase Project Structure
```
hebrew-pdf-filler/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── hosting/
│   └── public/
│       └── fonts/           # Hebrew fonts
├── functions/
│   ├── src/
│   │   ├── hebrew/          # Hebrew processing
│   │   ├── pdf/             # PDF operations
│   │   └── index.ts
│   └── package.json
└── src/                      # React app
    ├── firebase/
    │   ├── config.ts
    │   ├── firestore.ts
    │   └── storage.ts
    └── components/
```

## 2. Firestore Schema for Hebrew Forms

### 2.1 Collections Structure
```typescript
// Firestore collections design
interface FirestoreSchema {
  forms: {
    [formId: string]: {
      title: string;           // Hebrew title
      titleHe: string;         // Explicit Hebrew
      titleEn?: string;        // Optional English
      originalPdfUrl: string;  // URL of uploaded pre-built form
      fields: FormField[];     // Field definitions for form filling
      metadata: {
        direction: 'rtl' | 'ltr';
        language: 'he' | 'en' | 'mixed';
        encoding: 'utf-8';
      };
      userId: string;
      createdAt: Timestamp;
      updatedAt: Timestamp;
      version: number;
    }
  };
  
  templates: {
    [templateId: string]: {
      name: string;
      nameHe: string;
      category: 'government' | 'legal' | 'business' | 'medical';
      popularity: number;
      pdfUrl: string;
      fields: TemplateField[];
      hebrewValidation: ValidationRules;
    }
  };
  
  users: {
    [userId: string]: {
      displayName: string;
      preferredLanguage: 'he' | 'en';
      organization?: string;
      hebrewKeyboardLayout: 'standard' | 'phonetic';
      recentForms: string[];
    }
  };
}
```

### 2.2 Hebrew Text Indexing
```javascript
// Cloud Function for Hebrew text search indexing
exports.indexHebrewText = functions.firestore
  .document('forms/{formId}')
  .onWrite(async (change, context) => {
    const form = change.after.data();
    
    // Create searchable Hebrew tokens
    const hebrewTokens = tokenizeHebrew(form.title);
    
    // Store in search-optimized subcollection
    await change.after.ref
      .collection('search')
      .doc('hebrew')
      .set({
        tokens: hebrewTokens,
        // Store reversed for suffix search
        reversedTokens: hebrewTokens.map(t => reverse(t)),
        normalizedTitle: normalizeHebrew(form.title)
      });
  });

function tokenizeHebrew(text) {
  // Remove nikud for search
  const withoutNikud = text.replace(/[\u0591-\u05C7]/g, '');
  
  // Split by words and create n-grams
  return withoutNikud.split(/\s+/).flatMap(word => [
    word,
    ...createNGrams(word, 2),
    ...createNGrams(word, 3)
  ]);
}
```

## 3. Firebase Storage for Hebrew PDFs

### 3.1 Storage Structure
```javascript
// Storage path structure for Hebrew files
class HebrewStorageManager {
  getStoragePath(userId, filename, type) {
    // Sanitize Hebrew filename
    const sanitized = this.sanitizeHebrewFilename(filename);
    const timestamp = Date.now();
    
    const paths = {
      original: `users/${userId}/pdfs/original/${timestamp}_${sanitized}`,
      filled: `users/${userId}/pdfs/filled/${timestamp}_${sanitized}`,
      template: `templates/hebrew/${sanitized}`,
      temp: `temp/${userId}/${timestamp}_${sanitized}`
    };
    
    return paths[type];
  }
  
  sanitizeHebrewFilename(filename) {
    // Keep Hebrew chars but remove problematic ones
    return filename
      .replace(/[^\u0590-\u05FF\w\s.-]/g, '') // Keep Hebrew + safe chars
      .replace(/\s+/g, '_')
      .substring(0, 100); // Limit length
  }
}
```

### 3.2 Upload with Hebrew Metadata
```javascript
async function uploadHebrewPDF(file, hebrewMetadata) {
  const storage = firebase.storage();
  const storageRef = storage.ref();
  
  // Generate storage path
  const path = new HebrewStorageManager().getStoragePath(
    auth.currentUser.uid,
    hebrewMetadata.originalName,
    'original'
  );
  
  const fileRef = storageRef.child(path);
  
  // Prepare metadata
  const metadata = {
    contentType: 'application/pdf',
    contentLanguage: 'he',
    customMetadata: {
      originalNameHebrew: hebrewMetadata.originalName,
      direction: 'rtl',
      encoding: 'utf-8',
      formTitle: hebrewMetadata.title,
      pageCount: String(hebrewMetadata.pageCount),
      hasHebrewText: 'true'
    }
  };
  
  // Upload with progress tracking
  const uploadTask = fileRef.put(file, metadata);
  
  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`העלאה: ${progress.toFixed(0)}%`);
    },
    (error) => {
      console.error('שגיאה בהעלאה:', error);
    },
    async () => {
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      
      // Save reference in Firestore
      await firestore.collection('userFiles').add({
        userId: auth.currentUser.uid,
        url: downloadURL,
        path: path,
        hebrewMetadata,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  );
}
```

## 4. Firebase Functions for Hebrew Processing

### 4.1 Hebrew PDF Processing Function
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PDFDocument } from 'pdf-lib';

export const processHebrewPDF = functions
  .region('europe-west1') // Closer to Israel
  .runWith({
    memory: '2GB',
    timeoutSeconds: 540
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'נדרשת הזדהות למילוי טפסים'
      );
    }
    
    const { pdfUrl, formData } = data;
    
    try {
      // Download PDF from Storage
      const pdfBuffer = await downloadFromStorage(pdfUrl);
      
      // Process with Hebrew support
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Apply Hebrew text with proper RTL
      const hebrewProcessor = new HebrewPDFProcessor(pdfDoc);
      await hebrewProcessor.fillForm(formData);
      
      // Save processed PDF
      const processedBytes = await pdfDoc.save();
      
      // Upload to Storage
      const outputUrl = await uploadProcessedPDF(
        processedBytes,
        context.auth.uid
      );
      
      // Log for analytics
      await logHebrewProcessing(context.auth.uid, formData);
      
      return { 
        success: true, 
        downloadUrl: outputUrl,
        message: 'הטופס מולא בהצלחה'
      };
      
    } catch (error) {
      console.error('Hebrew processing error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'שגיאה בעיבוד הטופס העברי'
      );
    }
  });
```

### 4.2 Form Data Validation Function
```typescript
export const validateHebrewFormData = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'נדרשת הזדהות לאימות נתונים'
      );
    }

    const { formId, fieldData } = data;

    // Validate Hebrew text fields
    const validation = {
      valid: true,
      errors: []
    };

    for (const field of fieldData) {
      if (field.type === 'hebrew-text') {
        // Validate Hebrew characters
        if (!isValidHebrew(field.value)) {
          validation.valid = false;
          validation.errors.push({
            field: field.name,
            message: 'טקסט עברי לא תקין'
          });
        }
      }
    }

    return validation;
  });
```

## 5. Firebase Authentication with Hebrew

### 5.1 Hebrew Phone Authentication
```javascript
// Setup Hebrew phone auth
async function setupHebrewPhoneAuth() {
  firebase.auth().languageCode = 'he';
  
  // Israeli phone number format
  const phoneNumber = '+972' + userPhone.replace(/^0/, '');
  
  // Configure reCAPTCHA in Hebrew
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
    'size': 'invisible',
    'callback': (response) => {
      console.log('אימות הושלם');
    },
    'expired-callback': () => {
      console.log('אימות פג תוקף');
    }
  });
  
  // Send Hebrew SMS
  const confirmationResult = await firebase.auth()
    .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
  
  // Custom Hebrew UI for code entry
  const code = await promptHebrewCodeEntry();
  
  await confirmationResult.confirm(code);
}
```

### 5.2 Hebrew Custom Claims
```typescript
// Set Hebrew-specific custom claims
export const setHebrewUserClaims = functions.auth
  .user()
  .onCreate(async (user) => {
    const customClaims = {
      language: 'he',
      region: 'IL',
      timezone: 'Asia/Jerusalem',
      direction: 'rtl'
    };
    
    // Detect if user name is in Hebrew
    if (user.displayName && /[\u0590-\u05FF]/.test(user.displayName)) {
      customClaims.hasHebrewName = true;
    }
    
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
  });
```

## 6. Firebase Performance Monitoring

### 6.1 Hebrew-Specific Metrics
```javascript
import { getPerformance, trace } from 'firebase/performance';

class HebrewPerformanceMonitor {
  constructor() {
    this.perf = getPerformance();
  }
  
  async measureHebrewRendering(operation) {
    const trace = this.perf.trace('hebrew_rendering');
    trace.putAttribute('operation', operation);
    trace.putAttribute('direction', 'rtl');
    
    trace.start();
    
    try {
      // Measure Hebrew text rendering time
      const startTime = performance.now();
      await this.renderHebrewText();
      const renderTime = performance.now() - startTime;
      
      trace.putMetric('render_time_ms', Math.round(renderTime));
      trace.putAttribute('font', 'NotoSansHebrew');
      
    } finally {
      trace.stop();
    }
  }
  
  trackHebrewFormMetrics(formId) {
    const trace = this.perf.trace('hebrew_form_interaction');
    trace.putAttribute('form_id', formId);
    
    // Track Hebrew-specific interactions
    trace.incrementMetric('rtl_field_count', 1);
    trace.incrementMetric('hebrew_validation_errors', 1);
  }
}
```

## 7. Firebase Hosting Configuration

### 7.1 Hebrew-Optimized hosting.json
```json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|pdf)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/fonts/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          },
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          },
          {
            "key": "Content-Language",
            "value": "he"
          },
          {
            "key": "X-Content-Direction",
            "value": "rtl"
          }
        ]
      }
    ],
    "i18n": {
      "root": "/locales"
    }
  }
}
```

## 8. Error Handling for Hebrew Users

### 8.1 Hebrew Error Messages
```typescript
// Hebrew error messages mapping
const hebrewErrors = {
  'auth/invalid-phone-number': 'מספר הטלפון אינו תקין',
  'auth/user-not-found': 'המשתמש לא נמצא במערכת',
  'storage/unauthorized': 'אין הרשאה לגשת לקובץ',
  'storage/quota-exceeded': 'חרגת ממכסת האחסון',
  'functions/deadline-exceeded': 'הפעולה לוקחת יותר מדי זמן, נסה שוב',
  'firestore/permission-denied': 'אין הרשאה לביצוע פעולה זו'
};

// Error handler wrapper
export function handleHebrewError(error: any): string {
  const code = error.code || error.message;
  return hebrewErrors[code] || 'אירעה שגיאה, נסה שוב מאוחר יותר';
}
```

## 9. Testing Firebase with Hebrew

### 9.1 Emulator Setup for Hebrew Testing
```bash
# Start emulators with Hebrew data
firebase emulators:start --import ./hebrew-test-data

# Test data structure
hebrew-test-data/
├── firestore_export/
│   └── hebrew_forms.json
├── auth_export/
│   └── hebrew_users.json
└── storage_export/
    └── hebrew_pdfs/
```

### 9.2 Hebrew Test Suite
```javascript
describe('Hebrew Firebase Integration', () => {
  beforeAll(async () => {
    // Connect to emulators
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  });
  
  test('Hebrew form creation', async () => {
    const formData = {
      title: 'טופס בדיקה',
      fields: [
        { name: 'שם מלא', type: 'text', direction: 'rtl' },
        { name: 'כתובת', type: 'text', direction: 'rtl' }
      ]
    };
    
    const result = await functions.httpsCallable('createHebrewForm')(formData);
    expect(result.data.formId).toBeDefined();
  });
  
  test('Hebrew text search', async () => {
    // Test Hebrew search functionality
    const results = await firestore
      .collection('forms')
      .where('searchTokens', 'array-contains', 'טופס')
      .get();
    
    expect(results.docs.length).toBeGreaterThan(0);
  });
});
```

This comprehensive Firebase implementation guide ensures optimal Hebrew PDF processing with proper RTL support throughout the stack.