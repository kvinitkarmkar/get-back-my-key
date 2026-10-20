# Security Policy

## Supported versions

Only the latest release on the `main` branch receives security fixes.

## How this app handles data

- All data stays in your browser's `localStorage`. Nothing is sent to any server.
- Data is stored as **plain text** (not encrypted).
- Exported backup files are plain text JSON.

Please keep these limits in mind when using the app, and use it only on devices you trust.

## Reporting a vulnerability

If you find a security issue (for example XSS, unsafe handling of imported files, or any way data could leak), please report it **privately**:

- Use GitHub's **Report a vulnerability** option under the repository's **Security** tab, or
- Email: **[YOUR EMAIL]**

Please include:

- A description of the issue and its impact
- Steps to reproduce
- Browser and OS details

You can expect an acknowledgement within a few days. Please give us reasonable time to fix the issue before disclosing it publicly.

## Out of scope

- Anyone with access to your unlocked device or browser profile can read the stored data. This is a known limitation of unencrypted `localStorage`.
