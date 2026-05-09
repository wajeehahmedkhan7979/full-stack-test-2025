# ChatGPT Clone

A simplified ChatGPT-like web application built as a full-stack engineering assessment.

## Architecture

```
┌────────────────┐     HTTP/REST      ┌────────────────┐     SQL     ┌────────────────┐
│                │  ◄──────────────►  │                │  ◄────────► │                │
│   Next.js 15   │                    │    NestJS      │             │  PostgreSQL    │
│   (Frontend)   │                    │   (Backend)    │             │  (Supabase)    │
│                │                    │                │             │                │
└───────┬────────┘                    └───────┬────────┘             └────────────────┘
        │                                     │
        │  Supabase Auth                      │  JWT Verification
        ▼                                     ▼
┌────────────────┐                    ┌────────────────┐
│  Supabase Auth │  ◄──────────────► │  LLM Service   │
│   (Sessions)   │   JWT tokens      │  (Simulated)   │
└────────────────┘                    └────────────────┘
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Polling over WebSockets** | Dramatically simpler; sufficient for 10–20s LLM delays |
| **PENDING message pattern** | Non-blocking UX: user sees a thinking indicator immediately |
| **Atomic upsert for user sync** | Prevents race condition on concurrent first-login requests |
| **Single-query ownership checks** | Returns 404 (not 403) to avoid leaking resource existence |
| **Rate limiting** | `@nestjs/throttler` at 20 req/min on message endpoints |
| **Prisma 5.x** | Stable, production-proven; Prisma 7 has breaking config changes |

## Quick Start

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # fill in your Supabase credentials + DB password
npx prisma db push          # sync schema to Supabase PostgreSQL
npm run start:dev           # → http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # fill in your Supabase public keys
npm run dev                  # → http://localhost:3000
```


## Project Structure

```
├── backend/                    # NestJS REST API
│   ├── prisma/schema.prisma    # User, Chat, Message models
│   ├── src/
│   │   ├── auth/               # JWT guard + atomic user sync (upsert)
│   │   ├── chats/              # CRUD with single-query ownership
│   │   ├── messages/           # Send + async LLM trigger + tests
│   │   ├── llm/                # 10–20s delay simulation
│   │   ├── prisma/             # DB client module
│   │   └── common/filters/     # Global exception filter
│   └── README.md
│
├── frontend/                   # Next.js 15 App Router
│   ├── src/
│   │   ├── app/                # Pages: login, signup, chat/[id]
│   │   ├── components/         # Chat UI + reusable primitives
│   │   ├── hooks/              # React Query hooks (smart polling)
│   │   ├── lib/                # Supabase client, Axios + JWT
│   │   ├── providers/          # Auth + React Query context
│   │   ├── utils/supabase/     # SSR-compatible Supabase helpers
│   │   └── middleware.ts       # Session refresh middleware
│   └── README.md
│
└── README.md                   # ← you are here
```

## Security

- **JWT verification**: Backend validates Supabase JWTs using the project's JWT secret
- **Ownership enforcement**: Every query filters by `userId` — no cross-user data access
- **Rate limiting**: 20 requests per minute per IP via `@nestjs/throttler`
- **Input validation**: `class-validator` with whitelist + forbidNonWhitelisted
- **CORS**: Restricted to configured frontend origin

## Trade-offs & Known Limitations

- **No WebSocket/SSE streaming**: Polling is simpler and meets the 10–20s delay requirement
- **No queue system**: Fire-and-forget promises work at assessment scale
- **Client-side route protection**: SSR flash possible; middleware redirect would be ideal for production
- **No retry UI for failed LLM generations**: Shows error state but no retry button
