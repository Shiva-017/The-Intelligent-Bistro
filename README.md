# The Intelligent Bistro

An AI-powered restaurant ordering experience. Browse the menu and manage your cart through a conversational interface — just tell it what you want.

## Structure

```
apps/
  mobile/   Expo React Native app (menu, cart, AI chat)
  api/      Node.js Express backend (menu API, AI intent parsing)
packages/
  types/    Shared TypeScript types used by both apps
```

## Getting Started

### API

```bash
cd apps/api
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm install
npm run dev
```

### Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

## Tech Stack

| Layer    | Choice                          | Why                                      |
|----------|---------------------------------|------------------------------------------|
| Mobile   | Expo SDK 52 + Expo Router v4    | File-based routing, fast iteration       |
| Styling  | NativeWind v4 (Tailwind CSS)    | Consistent design system, no StyleSheet clutter |
| State    | Zustand                         | Minimal boilerplate, cart + chat stores  |
| Backend  | Express + TypeScript            | Lightweight, typed, easy to extend       |
| AI       | Anthropic Claude API            | Reliable NLP → structured JSON actions   |
