# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using GitHub's Security Advisories:
https://github.com/YOUR-ORG/rightflow/security/advisories/new

You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

Alternatively, you may email security concerns to: security@rightflow.org

Please include the following information in your report:

* Type of issue (e.g., XSS, injection, information disclosure)
* Full paths of source file(s) related to the vulnerability
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit it

## Security Considerations for Hebrew/RTL Text

### Critical: RTL Override Attacks

RightFlow handles Hebrew text, which makes it vulnerable to **Unicode RTL override attacks** (CVE-2021-42574). These attacks exploit Unicode bidirectional control characters to hide malicious code.

**Dangerous Unicode Characters:**
* U+202A (LEFT-TO-RIGHT EMBEDDING)
* U+202B (RIGHT-TO-LEFT EMBEDDING)
* U+202C (POP DIRECTIONAL FORMATTING)
* U+202D (LEFT-TO-RIGHT OVERRIDE)
* U+202E (RIGHT-TO-LEFT OVERRIDE)
* U+2066 (LEFT-TO-RIGHT ISOLATE)
* U+2067 (RIGHT-TO-LEFT ISOLATE)
* U+2068 (FIRST STRONG ISOLATE)
* U+2069 (POP DIRECTIONAL ISOLATE)

### How RightFlow Protects Against RTL Attacks

1. **Input Sanitization**: All user input is sanitized via `src/utils/inputSanitization.ts`
   - Dangerous Unicode control characters are stripped
   - HTML entities are escaped to prevent XSS
   - Input length is limited to prevent DoS

2. **Field Name Validation**: Field names are restricted to alphanumeric + underscore only
   - Prevents Unicode injection in PDF field names
   - Ensures PDF AcroForm compatibility

3. **PDF Upload Validation**: Uploaded PDFs are validated by magic bytes
   - Prevents file type confusion attacks
   - Checks for actual PDF structure (not just MIME type)

### Known Security Considerations

#### 1. XSS via Hebrew Text Input

**Risk**: Attackers could inject malicious scripts disguised within Hebrew text.

**Mitigation**:
* All user input sanitized before rendering
* React's built-in XSS protection
* No `dangerouslySetInnerHTML` usage
* HTML entities escaped in field labels and values

#### 2. BiDi Text Spoofing

**Risk**: Mixed Hebrew/English text could hide malicious intent through BiDi rendering.

**Mitigation**:
* Dangerous BiDi override characters removed
* Visual inspection required for generated PDFs
* Clear direction indicators in UI

#### 3. PDF Injection

**Risk**: Malicious PDFs could exploit parsing vulnerabilities.

**Mitigation**:
* PDF validation via magic bytes
* File size limits (10MB)
* pdf-lib library handles parsing securely
* No server-side PDF processing (client-side only)

#### 4. Font File Security

**Risk**: Malicious font files could exploit renderer vulnerabilities.

**Mitigation**:
* Only trusted fonts loaded (Noto Sans Hebrew from Google Fonts)
* Font files served from `/public/fonts/` directory
* No user-uploaded fonts accepted

#### 5. localStorage Security

**Risk**: Crash recovery data stored in localStorage could expose sensitive information.

**Mitigation**:
* Only field metadata stored (no PDF content)
* Data expires after 24 hours
* No sensitive user data in recovery storage
* Users can clear recovery data manually

### Testing for Security Issues

When testing for security vulnerabilities:

1. **Test Hebrew Input Sanitization**:
   ```javascript
   // Try injecting script tags in Hebrew field labels
   const malicious = '<script>alert("XSS")</script>';
   // Should be escaped to: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
   ```

2. **Test RTL Override Characters**:
   ```javascript
   // Try injecting BiDi override characters
   const malicious = 'שלום\u202Ealert("hidden")\u202C';
   // Should strip U+202A-U+202E characters
   ```

3. **Test PDF Upload Validation**:
   ```bash
   # Try uploading non-PDF files with .pdf extension
   # Should reject based on magic bytes, not extension
   ```

4. **Test Field Name Injection**:
   ```javascript
   // Try special characters in field names
   const malicious = 'field<script>alert(1)</script>';
   // Should reject (only alphanumeric + underscore allowed)
   ```

### Security Best Practices for Contributors

1. **Always sanitize user input** - Use `sanitizeUserInput()` utility
2. **Validate field names** - Use `validateFieldName()` utility
3. **Never trust PDF content** - Validate before processing
4. **Test with malicious input** - Include security test cases
5. **Review Unicode handling** - Be aware of BiDi attacks
6. **Keep dependencies updated** - Regular security patches

### Dependency Security

We use automated tools to monitor dependency vulnerabilities:

* **Dependabot** - Automated dependency updates
* **npm audit** - Vulnerability scanning
* **ESLint security rules** - Static analysis

Run security checks:

```bash
npm audit
npm audit fix  # Fix vulnerabilities automatically
```

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

## Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

* [Security researchers will be listed here]

## Additional Resources

* [OWASP Top 10](https://owasp.org/www-project-top-ten/)
* [Unicode Security Considerations](https://unicode.org/reports/tr36/)
* [CVE-2021-42574: BiDi Override Vulnerability](https://nvd.nist.gov/vuln/detail/CVE-2021-42574)
* [Hebrew Text Security Guide](docs/HEBREW-RTL-GUIDE.md)

Thank you for helping keep RightFlow and our users safe!
