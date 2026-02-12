# Specification

## Summary
**Goal:** Update the app splash screen to show the company name as “GALAXY INTERNET” and display a galaxy image background behind the name area while preserving existing splash behavior.

**Planned changes:**
- Replace the splash screen headline text in `frontend/src/components/SplashScreen.tsx` from “Star Maharashtra Galaxy Internet” to exactly “GALAXY INTERNET”.
- Add a static galaxy-themed background image behind the company-name text block, served from `frontend/public/assets/generated/`.
- Adjust splash screen CSS/Tailwind styling (in `frontend/src/index.css` and/or `frontend/src/components/SplashScreen.tsx`) to ensure readability/contrast across breakpoints while keeping fade-out, skip, auto-transition timing, and reduced-motion behavior unchanged.

**User-visible outcome:** On launch, users see a splash screen with the headline “GALAXY INTERNET” displayed over a galaxy image background behind the name area, with the same skip and transition behavior as before.
