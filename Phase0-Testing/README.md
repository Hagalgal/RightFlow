# Phase 0: PDF-lib Hebrew Compatibility Testing

## Purpose
Validate that PDF-lib can properly handle Hebrew text before committing to it as the core library for the Hebrew PDF Filler project.

## Setup Instructions

### 1. Download Hebrew Font
Download **Noto Sans Hebrew** font:
- Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Hebrew
- Click "Download family"
- Extract `NotoSansHebrew-Regular.ttf` to the `fonts/` directory

Alternative: Direct download
```bash
# Download using curl (if available)
curl -L "https://github.com/notofonts/hebrew/raw/main/fonts/NotoSansHebrew/hinted/ttf/NotoSansHebrew-Regular.ttf" -o fonts/NotoSansHebrew-Regular.ttf
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Tests
```bash
node tests/test1-simple-hebrew.js
node tests/test2-font-embedding.js
node tests/test3-mixed-content.js
node tests/test4-rtl-direction.js
```

## Test Objectives

### Test 1: Simple Hebrew Text
- Can PDF-lib render basic Hebrew text?
- Does the text appear or show as squares (□)?

### Test 2: Font Embedding
- Can we embed Hebrew fonts successfully?
- Does subsetting break character mapping?
- Test both subset: true and subset: false

### Test 3: Mixed Content
- Can we render mixed Hebrew/English text?
- Does punctuation appear in the correct position?
- Test: "Hello שלום World"

### Test 4: RTL Direction
- Does text flow right-to-left?
- Is the text reversed (שלום becomes םולש)?
- Do we need to manually reverse the text?

## Expected Outcomes

✅ **Success Criteria:**
- Hebrew text renders correctly
- Font embedding works with `subset: false`
- Mixed content displays properly
- Clear documentation of any workarounds needed

❌ **Failure Criteria:**
- Hebrew text shows as squares
- Font embedding consistently fails
- Text is always reversed
- No viable workaround exists

## Results
Results will be documented in `FINDINGS.md` after running all tests.
