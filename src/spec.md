# Specification

## Summary
**Goal:** Add single-admin authorization and an Admin Panel so only one configured admin can view customer registration submissions.

**Planned changes:**
- Backend: store exactly one admin Principal in canister state and expose a one-time bootstrap method to set it (reject subsequent attempts), plus a query to read the current admin status for UI gating.
- Backend: secure existing registrations list and single-registration retrieval APIs so only the stored admin Principal can access them; return clear errors for anonymous/non-admin callers.
- Frontend: add an Admin Panel entry point in the main UI with Internet Identity sign-in prompting, “Access denied” handling for non-admin users, and a one-time “Claim Admin Access” flow when no admin is configured.
- Frontend: in the Admin Panel, show a readable registrations list (name, phone, category, payment method, router, terms acceptance timestamp) and allow selecting an item to view full details without disrupting the existing registration flow UI.
- Frontend: use React Query for admin operations (claim admin, fetch list, fetch single) with clear loading/error states and safeguards against double actions.

**User-visible outcome:** Users can still submit registrations as before; the single admin can sign in to an Admin Panel to claim admin access (only once ever) and then view a list of customer submissions and inspect individual submission details, while non-admins see an access-denied experience.
