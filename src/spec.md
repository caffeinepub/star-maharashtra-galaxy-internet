# Specification

## Summary
**Goal:** Remove the hardcoded Terms & Conditions website link from the Step 3 print/PDF proof and restore the prior (link-free) proof layout while keeping the print flow safe.

**Planned changes:**
- Update Step 3 Terms & Conditions print-only proof content to stop rendering the hardcoded `http://star-maharashtra-galaxy-network` link.
- Ensure the Step 3 print flow continues to sanitize the URL for print so no deployment URL or any `#caffeineAdminToken=...` fragment can appear in the printed/PDF output.
- Keep the on-screen Step 3 Terms & Conditions UI and “Print / Save Proof” functionality working as before (including printing after the agreement checkbox is checked).

**User-visible outcome:** Users can still print/save the Step 3 proof after agreeing, and the printed/PDF proof no longer contains the website link, deployment URL, or any admin-token hash fragment.
