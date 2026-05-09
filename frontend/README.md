# ChatGPT Clone — Frontend

Next.js 15 frontend for the ChatGPT Clone application.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN-style components (custom-built)
- **State Management**: React Query (server state) + React Context (auth state)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **HTTP Client**: Axios with automatic JWT injection
- **Icons**: Lucide React
- **Toasts**: Sonner

## Architecture

```
src/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── chat/           # Protected chat layout
│   │   ├── [id]/       # Chat conversation view
│   │   └── page.tsx    # Default "new chat" page
│   ├── layout.tsx      # Root layout with providers
│   ├── globals.css     # Global styles
│   └── page.tsx        # Root redirect
├── components/
│   ├── chat/           # Chat-specific components
│   │   ├── chat-sidebar.tsx
│   │   ├── chat-input.tsx
│   │   ├── message-list.tsx
│   │   └── message-item.tsx
│   └── ui/             # Reusable UI primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── skeleton.tsx
│       └── avatar.tsx
├── hooks/              # Custom React Query hooks
│   ├── useAuth.ts
│   ├── useChats.ts
│   └── useMessages.ts
├── lib/                # Utilities and clients
│   ├── api.ts          # Axios instance with JWT interceptor
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # cn() utility
├── providers/          # React providers
│   ├── auth-provider.tsx
│   └── query-provider.tsx
└── types/              # Shared TypeScript types
    └── index.ts
```

## Key Design Decisions

1. **Conditional polling** — React Query's `refetchInterval` dynamically polls messages only when the last message is from the user or has PENDING status. One line of elegant logic replaces WebSocket complexity.
2. **Protected routes** — Chat layout checks auth state and redirects to login. No chat data renders until auth is confirmed.
3. **Session persistence** — Supabase handles session storage and auto-refresh. Sessions survive page refreshes.
4. **Duplicate send prevention** — Send button and input are disabled while mutation is pending or while waiting for assistant reply.
5. **Non-blocking UX** — Users can switch chats, create new chats, and browse while waiting for the assistant reply.

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project (for auth)

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3001/api`) |

### Running

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

The app starts at `http://localhost:3000`.

## User Flow

1. **Sign up** → Create account with email/password or Google
2. **Login** → Authenticate and get session
3. **Chat** → Create new chats, send messages
4. **Wait** → See typing indicator while assistant "thinks" (10-20s)
5. **Reply** → Assistant response appears automatically via polling
6. **Navigate** → Switch between chats freely, even while waiting

## Trade-offs

- **Custom UI components over ShadCN CLI** — Hand-built for full control and to avoid CLI dependency issues
- **No WebSockets** — Polling is sufficient for 10-20s delays and dramatically simpler
- **No Zustand** — React Query + Context covers all state needs without another dependency
