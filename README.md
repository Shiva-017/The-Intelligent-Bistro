# The Intelligent Bistro

An AI-powered restaurant ordering app. Browse the menu, manage your cart, or just **call your waiter** — tell Claude what you want and it manages your tab through natural conversation.

> *"Add two spicy chicken sandwiches, a lemonade, and something sweet for after"* — and the cart updates itself.

---

## Features

- **Conversational ordering** — Claude Sonnet 4.6 with tool use; understands plurals, shorthand, swaps, and multi-item requests in one message.
- **Cart-aware AI** — the current cart is injected into every prompt, so quantity updates (`"make it two"`) and swaps (`"beef instead of chicken"`) work correctly.
- **Floating waiter bubble** — chat lives in a pageSheet modal accessible from any screen, with a pulsing FAB and on-screen status pill.
- **Polished UI** — Tamagui design system, Inter font in 5 weights, soft purple-on-cream palette, animated category pills, and tactile add/remove buttons.
- **Three input modes, one cart** — tap, type, or chat; all routes mutate the same Zustand store.

---

## Tech stack

| Layer       | Choice                                                      |
| ----------- | ----------------------------------------------------------- |
| Mobile      | Expo SDK 54 (Expo Go compatible) + expo-router v6           |
| Design      | Tamagui v3 (custom Bistro theme) + Inter via expo-font      |
| State       | Zustand — three small stores (`cart`, `chat`, `menu`)       |
| Backend     | Node.js + Express                                           |
| AI          | Anthropic Claude Sonnet 4.6 via `@anthropic-ai/sdk`, tool use forced via `tool_choice: { type: "any" }` |

---

## Prerequisites

- **Node.js 18+** and **npm**
- An **Anthropic API key** ([get one here](https://console.anthropic.com/))
- The **Expo Go** app on your iPhone or Android (App Store / Play Store)
- Your phone and computer on the **same WiFi network**

You do **not** need an Apple Developer account, Xcode, or Android Studio — everything runs through Expo Go.

---

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> The-Intelligent-Bistro
cd The-Intelligent-Bistro
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
PORT=3001
```

Start the API:

```bash
npm run dev
```

You should see `Server running on http://localhost:3001`. Leave this terminal open.

### 3. Find your computer's LAN IP

Expo Go runs on your phone and needs to reach the backend on your machine across WiFi — `localhost` won't work from the phone.

- **Windows**: open PowerShell → `ipconfig` → look for the IPv4 of your active adapter (e.g. `10.0.0.18`)
- **macOS / Linux**: `ifconfig` or `ip addr` → look for `en0` (Mac) or `wlan0` (Linux)

### 4. Frontend

```bash
cd ../frontend
npm install --legacy-peer-deps
```

> The `--legacy-peer-deps` flag is required because `react-native-screens` has a strict peer-dep range that doesn't match the version Expo Go ships with. It's harmless.

Open `frontend/constants/api.ts` and replace the IP with the one you found in step 3:

```ts
export const API_URL = "http://10.0.0.18:3001";  // ← your IP here
```

Start Expo:

```bash
npx expo start
```

### 5. Open on your phone

A QR code appears in the terminal. Scan it with the **Camera app** (iOS) or the **Expo Go app** (Android). The app should download and launch.

---

## Project structure

```
The-Intelligent-Bistro/
├── backend/
│   ├── index.js                     # Express server on :3001
│   ├── .env                         # ANTHROPIC_API_KEY (gitignored)
│   └── src/
│       ├── routes/
│       │   ├── menu.js              # GET /menu → JSON array
│       │   └── chat.js              # POST /chat → { reply, action, items }
│       ├── services/
│       │   └── claude.js            # System prompt, tool schema, price enrichment
│       └── data/menu.js             # Menu items (source of truth for prices)
│
└── frontend/
    ├── app/                         # expo-router file-based routes
    │   ├── _layout.tsx              # TamaguiProvider + Inter font loading
    │   ├── index.tsx                # Redirect to /(tabs)/menu
    │   └── (tabs)/
    │       ├── _layout.tsx          # Tab navigator + FloatingChatBubble overlay
    │       ├── menu.tsx             # Re-exports screens/MenuScreen
    │       └── cart.tsx             # Cart screen
    ├── components/
    │   ├── FloatingChatBubble.tsx   # Purple FAB with pulse animation
    │   └── ChatModal.tsx            # Chat sheet with manual keyboard handling
    ├── screens/
    │   └── MenuScreen.tsx           # Menu list with category filter
    ├── store/                       # Zustand stores
    │   ├── cartStore.ts             # Cart state + applyAIAction defensive layer
    │   ├── chatStore.ts             # Conversation history
    │   └── menuStore.ts             # Fetched menu cache
    ├── constants/api.ts             # API_URL (edit this with your LAN IP)
    └── tamagui.config.ts            # Design tokens
```

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Failed to load menu" on the Menu screen | Backend isn't running, or `API_URL` in `constants/api.ts` doesn't match your LAN IP. Verify with `curl http://<your-ip>:3001/menu` from your computer. |
| QR code scans but app won't load | Phone and computer must be on the **same WiFi**. Corporate / guest networks often block peer connections — try a personal hotspot. |
| Chat replies but cart doesn't update | Check the backend terminal for Claude errors. Most common: invalid `ANTHROPIC_API_KEY`. |
| AI assistant messages are blank | Force-reload Metro: stop Expo (Ctrl+C), then `npx expo start --clear`. |
| Keyboard covers the chat input | This was a known issue — fixed via a manual `Keyboard` listener in `ChatModal.tsx`. If you still see it, restart with `--clear`. |
| `npm install` fails with peer-dep errors | Use `npm install --legacy-peer-deps` in `frontend/`. |
| Expo Go shows "Unmatched route" on launch | Ensure `frontend/app/index.tsx` exists (it redirects to the Menu tab). |

---

## How the AI ordering works

The chat endpoint forces Claude to respond via a single `update_cart` tool. This guarantees structured JSON instead of free-form text we'd have to parse.

```jsonc
// What Claude returns to the backend
{
  "action": "changes" | "clear" | "none",
  "items": [
    { "op": "add" | "update" | "remove", "itemId": "...", "name": "...", "qty": 2 }
  ],
  "reply": "Sure — I've added two lemonades to your tab."
}
```

Three guardrails keep it reliable:

1. **System prompt injection** — every request rebuilds the prompt with the *current cart* + the full menu + the last 10 conversation turns. Claude never has to guess what's in the cart.
2. **Per-item ops** — each item carries its own `op`, so a single message can add one thing and update another (e.g. *"one more lemonade and a beef burger"*).
3. **Frontend defensive layer** — even if Claude misclassifies (`add` on an existing item), `applyAIAction` in `cartStore.ts` checks the current cart and applies the correct operation. The worst-case outcome is still correct.

---

## Scripts reference

### Backend (`backend/`)

```bash
npm run dev       # nodemon, auto-restarts on file change
npm start         # plain node, for production
```

### Frontend (`frontend/`)

```bash
npx expo start                # start Metro, show QR code
npx expo start --clear        # same, but clear Metro cache (use after font/asset changes)
npx expo start --tunnel       # use if phone can't reach computer on LAN
npx tsc --noEmit              # type-check without emitting JS
```

---

## Notes

- **No build needed.** Everything runs through Expo Go's pre-built native shell. No Xcode, no Android Studio, no EAS build.
- **Cart isn't persisted.** Closing the app empties it. Adding `@react-native-async-storage/async-storage` + Zustand `persist` middleware is a ~10-line change if you want persistence.
- **Voice input was scoped out.** Native STT requires a development build, which is outside Expo Go's constraints.
- **Backend has no auth.** Don't expose port 3001 to the public internet — it's a demo, not production.
