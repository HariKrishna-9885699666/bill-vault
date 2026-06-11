# BillVault

> A mobile-first Progressive Web App to capture, categorize, and back up every bill & receipt directly to your Google Drive.

Built with **TanStack Start** (SSR), **React 19**, **Redux Toolkit**, **Tailwind CSS v4**, and the **Google Drive API v3**.

---

## Features

- **Google Drive storage** — bill metadata stored as `bills.json`; attachments uploaded into organized folders
- **Category folders** — files sorted into `BillVault/<category>/` on Drive automatically
- **Patient sub-folders** — Medical bills further sorted by family member (`Hari`, `Monika`, `Divith`, `Father`, `Mother`)
- **16 bill categories** — Medical, Groceries, Dining, Travel, Electronics, and more
- **Rich bill form** — title, amount, currency (INR/USD/EUR/GBP), date, vendor, payment method, tags, notes, and up to 5 attachments
- **Attachment viewer** — image previews + in-app PDF viewer via Google Drive embed
- **Search & filter** — full-text search across title/vendor/notes; filter by category, payment method, date range, amount range, and tag
- **Grid / list view** — toggleable from the bills page
- **Dark mode** — persisted per-device via `localStorage`
- **PWA** — installable on Android/iOS/desktop with offline shell via Workbox
- **About modal** — floating ℹ button with developer contact & links

---

## Tech Stack

| Layer           | Library / Tool                                                           |
| --------------- | ------------------------------------------------------------------------ |
| Framework       | [TanStack Start](https://tanstack.com/start) v1 (SSR + Server Functions) |
| Routing         | [TanStack Router](https://tanstack.com/router) v1 (file-based)           |
| UI              | React 19, Radix UI primitives, Tailwind CSS v4                           |
| State           | Redux Toolkit + redux-persist (UI preferences only)                      |
| Icons           | react-icons v5 (Font Awesome subset)                                     |
| Charts          | Recharts                                                                 |
| Toasts          | Sonner                                                                   |
| Storage         | Google Drive API v3 (bills + attachments)                                |
| Auth            | OAuth 2.0 refresh-token **or** Google Service Account JWT                |
| Testing         | Vitest + @testing-library/react + jsdom                                  |
| PWA             | vite-plugin-pwa + Workbox                                                |
| Package manager | pnpm                                                                     |

---

## Project Structure

```
bill-vault/
├── public/
│   ├── favicon.svg          # SVG favicon (receipt icon)
│   ├── icon-192.png         # PWA icon
│   ├── icon-512.png         # PWA icon (large)
│   └── manifest.json        # Web App Manifest
├── src/
│   ├── components/
│   │   ├── Bills/           # BillCard, BillDetail, BillFilters, BillForm, BillList
│   │   ├── Common/          # AboutModal, CategoryIcon, EmptyState, FileUploader
│   │   ├── Dashboard/       # Dashboard, SpendingChart
│   │   ├── Layout/          # AppShell (sidebar + mobile bottom nav)
│   │   └── PWA/             # InstallPrompt
│   ├── hooks/               # use-blob-url, use-mobile
│   ├── routes/              # File-based routes (TanStack Router)
│   │   ├── __root.tsx       # Root layout + BillsLoader + metadata
│   │   ├── index.tsx        # Dashboard
│   │   ├── bills.index.tsx  # Bills list
│   │   ├── bills.add.tsx    # Add bill
│   │   ├── bills.$id.tsx    # Layout for bill detail/edit
│   │   ├── bills.$id.index.tsx  # Bill detail
│   │   ├── bills.$id.edit.tsx   # Edit bill
│   │   └── settings.tsx    # Settings
│   ├── services/
│   │   ├── drive.functions.ts      # TanStack Server Functions (client-callable)
│   │   ├── googleDrive.server.ts   # Google Drive API helpers (server-only)
│   │   └── storage.ts              # IndexedDB blob store (legacy)
│   ├── store/               # Redux store, billSlice, uiSlice, StoreProvider
│   ├── types/               # Bill, Attachment, CategoryType, PaymentMethod
│   └── utils/               # constants, formatters
├── test/                    # Vitest unit tests (87 tests)
├── .env.example             # Environment variable template
└── vitest.config.ts
```

---

## Google Drive Setup

BillVault stores everything in your Google Drive under a `BillVault/` root folder. You need valid credentials before the app can save or load bills.

### Option A — OAuth 2.0 Refresh Token (easiest)

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID → add `https://developers.google.com/oauthplayground` to **Authorized redirect URIs** → Save
3. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
4. Click the gear icon → enable **"Use your own OAuth credentials"** → enter your Client ID & Secret
5. In Step 1 select scope: `https://www.googleapis.com/auth/drive.file`
6. Click **Authorize APIs** → sign in → **Exchange authorization code for tokens**
7. Copy the `refresh_token` value
8. Add to `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REFRESH_TOKEN=1//your-refresh-token
```

> **Note:** Your Google Cloud app must have your email listed as a **Test User** (OAuth consent screen → Test users) while it remains in Testing mode.

### Option B — Service Account (recommended for production)

1. [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) → **Create Service Account**
2. Skip optional role/permission steps → **Done**
3. Open the service account → **Keys** tab → **Add Key → JSON** → download
4. Add to `.env` (paste the entire JSON as a single line or use the file path):

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n...","client_email":"...@....iam.gserviceaccount.com","token_uri":"https://oauth2.googleapis.com/token"}
```

> Service accounts never expire and don't require browser-based consent flows.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

```bash
npm install -g pnpm
```

### Installation

```bash
git clone https://github.com/HariKrishna-9885699666/bill-vault.git
cd bill-vault
pnpm install
```

### Environment

Copy the example and fill in your Google credentials:

```bash
cp .env.example .env
```

Minimum required variables:

```env
# Option A — OAuth refresh token
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# Option B — Service Account (takes precedence if set)
GOOGLE_SERVICE_ACCOUNT_JSON=
```

### Development

```bash
pnpm dev
```

Opens at [http://localhost:8080](http://localhost:8080) (or next available port).

### Build

```bash
pnpm build
pnpm preview        # preview production build locally
```

---

## Running Tests

```bash
pnpm test           # run all tests once
pnpm test:watch     # watch mode
pnpm test:ui        # Vitest UI in the browser
```

87 unit tests covering:

- `src/store` — billSlice (add/update/delete/setBills), uiSlice (theme/filters/viewMode)
- `src/utils` — formatters (currency, date, bytes), constants (categories, payment methods)
- `src/components` — CategoryIcon, EmptyState (render + conditional action)
- `src/hooks` — useMobile (breakpoint detection + resize events)
- `src/types` — Bill and Attachment shape validation

---

## Google Drive Folder Structure

```
My Drive/
└── BillVault/
    ├── bills.json           ← all bill metadata (auto-managed)
    ├── medical/
    │   ├── Hari/            ← patient sub-folder
    │   ├── Monika/
    │   ├── Divith/
    │   ├── Father/
    │   └── Mother/
    ├── groceries/
    ├── dining/
    ├── travel/
    └── ...                  ← one folder per category
```

Folders are created automatically on first upload. Bills are never stored locally — all data lives in Drive.

---

## Environment Variables Reference

| Variable                      | Required   | Description                   |
| ----------------------------- | ---------- | ----------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | One of A/B | Full service account key JSON |
| `GOOGLE_CLIENT_ID`            | One of A/B | OAuth 2.0 client ID           |
| `GOOGLE_CLIENT_SECRET`        | One of A/B | OAuth 2.0 client secret       |
| `GOOGLE_REFRESH_TOKEN`        | One of A/B | Long-lived refresh token      |

---

## Author

**Hari Krishna Anem**

|           |                                                                                      |
| --------- | ------------------------------------------------------------------------------------ |
| Email     | [anemharikrishna@gmail.com](mailto:anemharikrishna@gmail.com)                        |
| Phone     | [+91 98856 99666](tel:+919885699666)                                                 |
| GitHub    | [github.com/HariKrishna-9885699666](https://github.com/HariKrishna-9885699666)       |
| LinkedIn  | [linkedin.com/in/anemharikrishna](https://linkedin.com/in/anemharikrishna)           |
| Blog      | [hashnode.com/@HariKrishna-9885699666](https://hashnode.com/@HariKrishna-9885699666) |
| Portfolio | [harikrishna.is-a-good.dev](https://harikrishna.is-a-good.dev)                       |

---

## License

This project is private. All rights reserved © 2026 Hari Krishna Anem.
