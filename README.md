# 🔑 Get Back My Key

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
![Privacy: local only](https://img.shields.io/badge/privacy-local--only-informational.svg)

[Live demo]((https://get-back-my-key.vercel.app)) · [Report a bug](../../issues/new/choose) · [Request a feature](../../issues/new/choose)

A private, local-only tracker for password attempts. If you forgot a password and are trying different combinations, this app helps you remember **what you already tried**, so you never test the same combination twice.

Everything runs in your browser. There is no server, no account, and no network request. Your data never leaves your device.

---

## Features

- **Add attempts**: type a password combination and press `Enter` or tap the add button.
- **Duplicate protection**: if a combination already exists, the app tells you which attempt number it is.
- **Three statuses**: `pending`, `failed`, `success`.
  - Tap *failed* to mark an attempt as failed (tap again to move it back to pending).
  - Marking *success* asks for confirmation first, then plays a celebration screen with particles and a sound.
- **Search**: filter attempts by text as you type.
- **Filters**: All / Pending / Failed / Success.
- **Stats**: live counters for total, tried, and successful attempts.
- **Copy**: copy any saved combination to the clipboard.
- **Delete** with a confirmation dialog.
- **Backup**: export all attempts to a JSON file and import them back later.
- **Persistent**: data is stored in `localStorage`, so it survives page reloads.
- **Keyboard**: `Enter` adds an attempt, `Esc` closes any open dialog, celebration, or toast.
- **Accessible**: respects `prefers-reduced-motion`, responsive for mobile and desktop.

---

## Getting started

No build step and no dependencies.

1. Download or clone the project.
2. Open `index.html` in any modern browser.

Optionally, serve it locally:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

---

## Project structure

```
get-back-my-key/
├── index.html            HTML structure, links CSS and loads scripts in order
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── .gitignore
├── .editorconfig
├── .github/              Issue templates, PR template, Pages deploy workflow
├── css/
│   └── style.css         All styling (layout, components, modals, animations, responsive, reduced-motion)
└── js/
    ├── state.js          Storage key and global state (passwords, filter, search, timers)
    ├── dom.js            Cached references to DOM elements
    ├── icons.js          Inline SVG icons used by the UI
    ├── storage.js        saveData / loadData (localStorage)
    ├── utils.js          createId, triggerHaptic, date helpers
    ├── passwords.js      addPassword, markStatus, deleteItem
    ├── modals.js         Success and delete confirmation dialogs
    ├── sound.js          Success sound (Web Audio API)
    ├── clipboard.js      copyText with fallback
    ├── search-filter.js  Search input and filter buttons
    ├── render.js         render(), card creation, stats
    ├── toast.js          Toast notifications
    ├── celebration.js    Celebration screen and particle animation
    ├── backup.js         Export / import JSON backup
    ├── keyboard.js       Keyboard shortcuts and add button
    └── main.js           Initial render on startup
```

### Script load order matters

The JS files are **classic scripts** (not ES modules) that share one global scope. They are loaded in this order in `index.html`:

```
state → dom → icons → storage → utils → passwords → modals → sound →
clipboard → search-filter → render → toast → celebration → backup →
keyboard → main
```

`state.js` and `dom.js` must come first because later files use their variables. `main.js` must stay last because it triggers the first render. Do not reorder them.

---

## How it works

### Data model

Each attempt is an object:

```json
{
  "id": "unique-id",
  "text": "the password combination",
  "status": "pending | failed | success",
  "createdAt": 1700000000000
}
```

All attempts live in the `passwords` array (newest first) and are saved to `localStorage` under the key `get-back-my-key-data-v1`.

### Flow

1. `main.js` loads saved data and calls `render()`.
2. Any change (add, mark, delete, import) updates `passwords`, calls `saveData()`, then `render()`.
3. `render()` applies the current filter and search term, rebuilds the list, and updates the stats.

### Backup format

Export creates `get-back-my-key-backup-<date>.json`:

```json
{
  "app": "Get Back My Key",
  "version": 1,
  "exportedAt": "2026-10-20T00:00:00.000Z",
  "attempts": [ ... ]
}
```

Import accepts this format (or a plain array of attempts), validates each entry, and **replaces** existing local data after confirmation.

---

## Privacy and security notes

- Data is stored **in plain text** in your browser's `localStorage`. Anyone with access to your browser profile can read it.
- Exported backup files are also plain text JSON. Keep them somewhere safe and delete them when no longer needed.
- Clearing site data or browser storage will erase your attempts, so export a backup first.
- Use this on a device you trust, and avoid shared or public computers.

---

## Customizing

| What to change | Where |
| --- | --- |
| Colors, spacing, fonts | CSS variables at the top of `css/style.css` |
| Storage key / data version | `js/state.js` |
| Add or edit icons | `js/icons.js` |
| Card layout and buttons | `js/render.js` |
| Celebration and particles | `js/celebration.js` |
| Success sound | `js/sound.js` |
| Backup format | `js/backup.js` |

---

## Browser support

Any modern browser (Chrome, Edge, Firefox, Safari) with `localStorage` and Web Audio support.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) first. For security issues, see [SECURITY.md](SECURITY.md).

## Roadmap ideas

- Optional passphrase encryption of stored data (Web Crypto API)
- PWA support for offline install
- Light / dark theme toggle
- Convert to ES modules
- Automated tests
- Multi-language support

## License

Released under the [MIT License](LICENSE).
