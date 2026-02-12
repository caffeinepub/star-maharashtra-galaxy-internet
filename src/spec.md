# Specification

## Summary
**Goal:** Fix the registration flow so Step 1 (“Customer Details”) reliably opens/renders, remains responsive during typing, and shows a clear English fallback UI if an unexpected error occurs.

**Planned changes:**
- Fix the bug causing the Step 1 “Customer Details” page to sometimes not open/render after splash and when switching between Admin Panel and Registration.
- Stabilize the `onValidationChange` callback behavior so step validation effects don’t re-run due to changing function identities, avoiding render loops/freezes and keeping inputs responsive.
- Add an English error fallback UI for unexpected registration-step render failures, including at least a Refresh action to recover without showing a blank screen.

**User-visible outcome:** The app consistently lands on a working registration view with Step 1 visible after splash, Step 1 opens and remains usable when navigating back from Admin Panel, typing does not freeze/lag, and any unexpected Step 1 load failure shows an English error message with a Refresh option instead of a blank screen.
