# Specification

## Summary
**Goal:** Ensure Aadhaar/PAN (and optional receipt) document photos reliably display in the Admin Panel’s Registration Details under “Verification Documents”, with safe error handling and admin-only access preserved.

**Planned changes:**
- Fix the Admin Panel Registration Details UI to render stored Aadhaar and PAN document image previews for existing and new registrations, and to render the optional receipt preview when present.
- Add clear English fallback states when a document is missing/invalid, preventing blank panels or crashes.
- Add per-document failure handling in the UI (Aadhaar/PAN/Receipt) with a visible retry action/re-attempt behavior without requiring a full page refresh.
- Add developer-only console diagnostics indicating which document type failed and the failure reason, without logging sensitive image bytes.
- Update backend document/blob access paths used by the Admin Panel so authorized admins can fetch/render stored document blobs while keeping non-admin access restricted.

**User-visible outcome:** Admins viewing a registration can see Aadhaar and PAN photo previews (and receipt if provided) in the “Verification Documents” section; if any preview can’t load, they see a readable English message and can retry without refreshing the page.
