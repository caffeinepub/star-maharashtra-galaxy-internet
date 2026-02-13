# Specification

## Summary
**Goal:** Fix Admin Panel login/setup unlock failures by ensuring Internet Identity sign-in is required and by making admin credential + role assignment work reliably across upgrades, with clearer English guidance and diagnostics.

**Planned changes:**
- Backend: Fix `loginAdmin(username, password)` so that when called by an Internet Identity–authenticated principal with valid credentials (`PrabhaPerkar@6` / `Prabha@1991`), it consistently grants admin access without internal authorization/role-assignment traps.
- Backend: Ensure `loginAdmin` traps with clear errors for anonymous callers (Internet Identity required) and for invalid credentials.
- Backend: Ensure the intended admin credentials (`PrabhaPerkar@6` / `Prabha@1991`) remain configured after upgrades and fresh deployments, adding conditional state migration if needed without breaking existing stored data.
- Frontend: Update Admin Panel access-recovery UI to clearly instruct users (in English) to sign in with Internet Identity before using username/password or setup code, and make all error states actionable (including rate-limit/too-many-attempts messaging).
- Frontend: Show diagnostics on access recovery and admin views: “Signed in as: <principal>” and “Admin: Yes/No”, without exposing secrets.

**User-visible outcome:** Users are clearly guided to sign in with Internet Identity first, can reliably log in to the Admin Panel using the provided admin credentials, see which principal is signed in and whether they are admin, and receive clear English error messages (including for anonymous access, invalid credentials, and rate limits).
