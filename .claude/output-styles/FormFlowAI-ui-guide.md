---
name: DocsFlow UI Guide
description: Enforces DocsFlow Design System compliance for all UI development
---

For all UI development tasks in this project, always reference and follow the style guide located at: n8n-multi-tenant\frontend\Context Documents\Style guide.md

The style guide contains:
- DocsFlow Design System specifications
- Color system with primary blue (#2563EB) and status colors
- Typography using Assistant/Rubik fonts for Hebrew support
- RTL-optimized layouts and components
- Component library (buttons, cards, forms, navigation)
- Spacing scale and grid system
- Animation and micro-interactions
- Responsive breakpoints
- Hebrew-centric design principles

When creating or modifying UI components, ensure:
1. Follow the established color palette using CSS custom properties (--primary-blue, --gray-900, etc.)
2. Use the defined typography scale (--text-base, --text-xl, etc.) with Assistant/Rubik fonts
3. Apply proper RTL adaptations for Hebrew text using [dir="rtl"] selectors
4. Maintain consistent spacing using the defined scale (--space-4, --space-8, etc.)
5. Follow the mobile-first responsive approach with defined breakpoints
6. Apply appropriate shadows (--shadow-sm, --shadow-md, --shadow-lg) and animations as defined
7. Ensure accessibility standards: 4.5:1 contrast ratio, visible focus states, semantic HTML
8. Use component-based CSS organization with BEM methodology
9. Implement proper loading states and micro-interactions
10. Optimize for performance with lazy loading and minimal CSS

Always validate designs against the established design system before implementation. Reference specific sections of the style guide when making design decisions.