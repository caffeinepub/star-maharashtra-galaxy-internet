# Specification

## Summary
**Goal:** Fix the Admin Setup Code reset flow so the legitimate configured admin can recover admin access, while preventing unauthorized resets, and ensure the Admin Panel unlocks automatically after a successful reset.

**Planned changes:**
- Update backend `resetAdminSetupCode()` to allow the configured admin Internet Identity to reset and rotate the Admin Setup Code even if current admin permission checks fail due to missing/invalid code.
- Keep unauthorized users blocked from resetting the Admin Setup Code, returning a clear English error and not rotating the code.
- Update Admin Panel recovery UI to show clear English error messaging on reset failure, including guidance to sign out and sign back in with the correct admin Internet Identity, and refer to “Admin Setup Code” (not “password”).
- Make reset success automatically apply the new Admin Setup Code by storing it in `sessionStorage` as `caffeineAdminToken`, re-initializing access control, and refreshing admin React Query state so the Admin Panel unlocks without a manual refresh.

**User-visible outcome:** The configured admin can successfully reset the Admin Setup Code to regain access; if signed in as the wrong identity, the app shows clear instructions and an error reason; after a successful reset, the Admin Panel becomes authorized automatically without reloading the page.
