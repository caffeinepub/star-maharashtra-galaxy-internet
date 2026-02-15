# Specification

## Summary
**Goal:** Extend customer registration and admin tools to support an optional “Applicant Photo” upload, enable admin download/print actions, and prevent registration data loss after publish/upgrade.

**Planned changes:**
- Add an optional image upload control labeled exactly “Applicant Photo” to the Verification Document step (alongside Aadhaar/PAN/Payment Receipt), include it in step validation and the registration submission payload.
- Extend backend registration storage and submitRegistration API to accept and persist an optional Applicant Photo ExternalBlob, and update frontend submission code to send it when provided.
- Show Applicant Photo in the admin registration detail view with an image preview and clear empty-state messaging when not available.
- Add admin actions in registration detail: “Download All Documents” (downloads all available documents, skipping missing optional ones) and “Print Full Form” (print-friendly layout with all captured customer fields plus document presence/missing indicators; English labels).
- Fix missing customer data after publishing by ensuring registrations survive canister upgrades/redeployments and are reliably returned by admin queries; add conditional migration only if required for schema changes.

**User-visible outcome:** Customers can optionally upload an Applicant Photo during registration, and admins can preview it, download all documents, and print a complete customer form; previously submitted customer registrations remain available after publish/upgrade.
