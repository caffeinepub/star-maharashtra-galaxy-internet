# Specification

## Summary
**Goal:** Improve the Admin Panel registration edit and review experience by adding clear navigation in the edit flow and displaying uploaded document/receipt photos in the details view.

**Planned changes:**
- Add a clearly labeled “Back” or “Cancel” action in the Registration “Edit Details” mode to exit without saving and return to the read-only Registration Details view for the currently selected registration.
- Ensure edit mode has an explicit “Save” / “Save Changes” button that triggers the existing update flow, shows loading/error feedback in English, and prevents double submission.
- Disable “Save” when no fields have changed; enable it only when at least one editable field differs from the current registration values.
- Render image previews in the Registration Details view for uploaded Aadhaar Card, PAN Card, and (when present) Payment Receipt, with clear English labels and fallback messages when missing/unavailable.
- Update the backend/admin query layer (as needed) to return sufficient data for the frontend to render stored document/receipt images for admins.

**User-visible outcome:** Admins can enter edit mode and safely leave via Back/Cancel without saving, save only when changes exist with clear feedback, and visually inspect uploaded Aadhaar/PAN/receipt images directly within the Registration Details view.
