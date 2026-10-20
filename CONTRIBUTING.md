# Contributing to Get Back My Key

Thanks for your interest in improving this project! Contributions of all sizes are welcome: bug reports, ideas, docs, and code.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Ways to contribute

- Report a bug or suggest a feature using the [issue templates](../../issues/new/choose).
- Improve the documentation or fix typos.
- Pick an issue labeled `good first issue` or `help wanted`.

## Development setup

There is no build step and there are no dependencies.

```bash
git clone https://github.com/kvinitkarmkar/get-back-my-key.git
cd get-back-my-key
python3 -m http.server 8000   # or: npx serve .
```

Open `http://localhost:8000` in your browser.

## Project rules

1. **Plain HTML, CSS and JavaScript only.** Please do not add frameworks or heavy dependencies without discussing it in an issue first.
2. **Script load order matters.** JS files are classic scripts sharing one global scope, loaded in the order set in `index.html`. Do not reorder them. If you add a new file, place it before `main.js`.
3. **Keep the app local-only.** No analytics, no tracking, no network requests, and no sending user data anywhere.
4. **Never commit real passwords** or exported backup files.
5. Follow the `.editorconfig` settings (2 spaces, LF line endings).
6. Keep the UI accessible: labels, focus states, and `prefers-reduced-motion` support.

## Pull request workflow

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/short-description
   ```
2. Make your change and test it manually in a browser (add, mark, delete, search, filter, export/import).
3. Commit with a clear message, for example `fix: prevent empty import file crash`.
4. Push your branch and open a Pull Request. Fill in the PR template.
5. Respond to review comments. Maintainers will merge once everything looks good.

## Commit message style

Use a short prefix: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`.

## Reporting security issues

Please do **not** open a public issue for security problems. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
