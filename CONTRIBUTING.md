# Contributing to RightFlow Hebrew PDF Filler

First off, thank you for considering contributing to RightFlow! It's people like you that make RightFlow such a great tool for the Hebrew-speaking community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** (include PDF files if relevant)
* **Describe the behavior you observed and what you expected**
* **Include screenshots** showing the problem
* **For Hebrew/RTL issues:** Specify the browser, OS, and PDF viewer used

#### Hebrew/RTL Specific Bug Reports

When reporting Hebrew or RTL-related bugs, please include:

* Browser and version (Chrome, Firefox, Safari, Edge)
* Operating system
* PDF viewer used to test generated PDFs
* Screenshots showing text reversal or alignment issues
* Sample Hebrew text that reproduces the issue

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List any similar features in other tools**

### Pull Requests

* Fill in the pull request template
* Follow the JavaScript/TypeScript style guide (we use ESLint)
* Include thoughtful commit messages
* Update documentation for any changed functionality
* **For Hebrew/RTL features:** Include testing checklist (see below)

## Development Process

### 1. Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/YOUR-ORG/rightflow.git
cd rightflow

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Code Style Guidelines

We follow these principles:

* **KISS (Keep It Simple, Stupid)** - Simplicity over complexity
* **YAGNI (You Aren't Gonna Need It)** - Build features when needed, not in advance
* **Max line length:** 100 characters
* **Max function length:** 150 lines (see .eslintrc.cjs)
* **File size limit:** 500 lines of code

Run ESLint before committing:

```bash
npm run lint
```

### 3. TypeScript Requirements

* Use strict TypeScript typing
* Avoid `any` types unless absolutely necessary (PDF library integration)
* Document complex type definitions

### 4. Component Structure

* Keep components under 500 lines
* Use functional components with hooks
* Separate business logic from presentation
* Use Zustand for state management

## Hebrew/RTL Testing Requirements

**CRITICAL:** All Hebrew/RTL features MUST be tested manually in addition to automated tests.

### Testing Checklist for Hebrew Features

When submitting a PR that affects Hebrew text or RTL layout:

- [ ] **Text Input:** Hebrew text can be typed correctly
- [ ] **Text Display:** Hebrew text displays in correct direction (RTL)
- [ ] **Font Rendering:** Hebrew characters render without reversal
- [ ] **PDF Generation:** Generated PDF displays Hebrew correctly
- [ ] **Cross-browser:** Tested in Chrome, Firefox, Safari
- [ ] **PDF Viewers:** Generated PDF tested in:
  - [ ] Adobe Acrobat Reader
  - [ ] Chrome PDF viewer
  - [ ] Firefox PDF viewer
  - [ ] Safari PDF viewer (macOS)
  - [ ] Edge PDF viewer (Windows)
- [ ] **Mobile:** Tested iOS Hebrew keyboard (if applicable)
- [ ] **XSS Protection:** Input sanitization prevents RTL override attacks
- [ ] **Unicode:** No dangerous control characters (U+202A-U+202E)

### Running Hebrew Validation Tests

We have a Phase 0 test suite specifically for Hebrew compatibility:

```bash
cd Phase0-Testing
npm install
npm test
```

These tests validate:
* Hebrew text rendering in PDFs
* Font embedding (subset: false requirement)
* Mixed Hebrew/English content
* RTL direction handling

### Known Hebrew Challenges

Be aware of these common issues when working with Hebrew:

1. **Text Reversal:** Hebrew may appear backwards (שלום becomes םולש) depending on PDF viewer
2. **Font Subsetting:** MUST use `subset: false` to prevent character mapping bugs
3. **BiDi Text:** Mixed Hebrew/English requires careful handling
4. **Unicode Security:** RTL override characters can hide malicious code
5. **Browser Differences:** Chrome, Firefox, Safari handle Unicode BiDi differently

See [docs/HEBREW-RTL-GUIDE.md](docs/HEBREW-RTL-GUIDE.md) for detailed guidance.

## Testing

### Running Tests

```bash
# Lint check
npm run lint

# Build test
npm run build

# Hebrew validation tests
cd Phase0-Testing
npm test
```

### Writing Tests

* Include unit tests for new utilities
* Include component tests for UI changes
* Include integration tests for field creation
* **Always include manual PDF inspection** for Hebrew features

## Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters
* Reference issues and pull requests after the first line

### Commit Message Format

```
Add Hebrew font size validation

- Validates font size is between 8pt and 72pt
- Prevents crashes from invalid font sizes
- Adds sanitization for user input

Fixes #123
```

## Project Structure

```
RightFlow/
├── src/
│   ├── components/     # React components
│   ├── utils/          # Utility functions (PDF, Hebrew, sanitization)
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles and Tailwind
├── public/
│   └── fonts/          # Hebrew fonts (Noto Sans Hebrew)
├── Phase0-Testing/     # Hebrew compatibility validation
├── docs/               # Public documentation
└── Documents/          # Internal planning documents
```

## Documentation

* Update README.md for user-facing changes
* Update docs/ for technical architecture changes
* Include code comments for complex logic
* Document Hebrew-specific behavior

## Questions?

Feel free to ask questions by:

* Opening an issue with the "question" label
* Joining our community discussions
* Reviewing our [documentation](docs/)

## Recognition

Contributors will be recognized in:

* README.md contributors section
* Release notes
* Project documentation

Thank you for contributing to RightFlow! 🙏

---

**Special Note for International Contributors:**

This project focuses on Hebrew/RTL text handling, which may be unfamiliar if you primarily work with LTR languages. Don't hesitate to ask questions about Hebrew requirements or RTL behavior - we're here to help!
