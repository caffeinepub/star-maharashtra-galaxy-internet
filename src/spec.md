# Specification

## Summary
**Goal:** Refresh the splash screen company name appearance by applying a more stylized display font and noticeable color styling, without changing any existing splash behavior.

**Planned changes:**
- Update `frontend/src/components/SplashScreen.tsx` to render the company name "STAR MAHARASHTRA GALAXY INTERNET" using a clearly different, more stylized display font than the current default.
- Add visible color styling to the company name text (e.g., multi-color per word or a gradient), while keeping the tagline text unchanged and readable.
- Preserve existing splash screen behavior (auto-transition, fade out, and skip), and ensure reduced-motion mode still disables animations while keeping the new font/color styling.

**User-visible outcome:** The splash screen shows the same company name and tagline, but the company name appears with a new stylized font and noticeable color styling, while all existing transitions/skip behavior remain the same.
