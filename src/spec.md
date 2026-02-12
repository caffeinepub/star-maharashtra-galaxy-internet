# Specification

## Summary
**Goal:** Fix the Admin Panel Customer Registrations detail panel so selecting a registration reliably shows details (with proper loading/error/empty states) and restore a dependable “Edit Details” + save flow for admins.

**Planned changes:**
- Make selecting any item in the “Customer Registrations” list consistently load and render the selected registration’s details in the right-side panel.
- Add explicit right-panel UI states: placeholder when nothing is selected, loading state while details are fetching, and a clear English error with a retry action if fetching fails.
- Ensure an “Edit Details” button appears for authorized admins when a registration is selected (and not currently editing), and that entering edit mode always renders the existing `EditRegistrationDetailsForm` pre-filled with current values.
- Stabilize edit-save UX: show an in-progress saving state to prevent double submissions, show English save errors while staying in edit mode, and refresh list/detail after successful save via React Query invalidation.

**User-visible outcome:** Admins can click any customer registration and always see its details on the right (never blank), can enter edit mode via “Edit Details,” and can save changes with clear loading/error feedback and see updated details afterward.
