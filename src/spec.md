# Specification

## Summary
**Goal:** Fix the Admin Panel “Registration Details” view so it reliably shows customer personal details, Terms & Conditions acceptance/text, and uploaded document previews for each registration (including legacy/incomplete submissions) without runtime errors.

**Planned changes:**
- Update the Admin Panel Registration Details view to correctly read and display stored customer personal details (First Name, Middle Name, Surname, Date of Birth, Email ID, Address, Phone) when present, instead of showing “N/A”.
- Add/repair a clearly labeled “Terms and Conditions” section in Registration Details that shows the stored `termsAcceptedAt` timestamp (readable format) and the same Terms & Conditions text used in the customer registration flow (`frontend/src/features/registration/terms.ts`).
- Fix document rendering in Registration Details so Aadhaar, PAN, and optional receipt blobs (when present) load as image previews for authorized admins, with clear placeholder text when missing.
- Add a non-sensitive, user-visible warning in Registration Details when the selected registration is missing expected fields or appears to be a legacy/older submission shape, without exposing sensitive data.

**User-visible outcome:** Admins can open any registration and reliably see the saved personal information, Terms & Conditions acceptance details/text, and verification document/receipt previews (or clear English placeholders/warnings), with no blank panels or silent failures.
