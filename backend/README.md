# ChatGPT Clone — Backend

NestJS REST API backend for the ChatGPT Clone application.

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript (strict mode)
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase JWT verification
- **Validation**: class-validator + class-transformer

## Architecture

```
src/
├── auth/           # JWT verification guard, user sync service
├── chats/          # Chat CRUD (controller, service, DTOs)
├── messages/       # Message CRUD + async LLM triggering
├── llm/            # Simulated LLM service (10-20s delay)
├── prisma/         # Database client (global module)
├── common/         # Shared filters, decorators, interceptors
├── app.module.ts   # Root module
└── main.ts         # Bootstrap with CORS, validation, prefix
```

## Key Design Decisions

1. **Ownership enforcement**: Every data query uses `WHERE userId = :authenticatedUserId` in a single query — no separate authorization check.
2. **Async LLM**: `POST /chats/:id/messages` stores the user message + creates a PENDING assistant placeholder, then triggers LLM generation asynchronously (fire-and-forget). The frontend polls for completion.
3. **404 over 403**: When a user tries to access another user's chat, we return 404 (not 403) to avoid leaking resource existence.
4. **Auto-titling**: First user message in a chat auto-updates the chat title.

## API Endpoints

All endpoints require `Authorization: Bearer <supabase_access_token>` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/chats` | List user's chats |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/:id` | Get chat details |
| DELETE | `/api/chats/:id` | Delete chat |
| GET | `/api/chats/:id/messages` | Get chat messages |
| POST | `/api/chats/:id/messages` | Send message (triggers async reply) |

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase dashboard |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:3000`) |
| `PORT` | Server port (default: `3001`) |

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

### Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server starts at `http://localhost:3001`.

## LLM Simulation

The `LlmService` simulates an external LLM API:
- Random delay between 10-20 seconds
- Multi-sentence responses from a curated pool
- Timeout handling (30s timeout)
- Error recovery (marks messages as FAILED)
- Structured like a real HTTP integration

## Trade-offs

- **Polling over WebSockets**: Simpler, reliable, sufficient for the test scope
- **No queue system**: Async is handled via fire-and-forget promises — acceptable for demo scale but would need a proper job queue (Bull, etc.) in production
- **User sync on /me**: Users are created in our DB on first authenticated request rather than via webhook
