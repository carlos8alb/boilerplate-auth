# AGENTS.md - Agent Coding Guidelines

Monorepo with Express/TypeScript backend + Angular 17+ frontend. JWT auth, strict TypeScript.

---

## Commands

### Root (Monorepo)
```bash
npm install              # Install all dependencies
npm run dev              # Run all workspaces
npm run build            # Build all
npm run lint             # Lint all
npm run test             # Test all
```

### Backend (apps/backend)
```bash
cd apps/backend
npm run dev              # ts-node-dev
npm run build            # tsc
npm start                # production
npm run lint             # ESLint
npm run lint:fix         # Auto-fix
npm run format           # Prettier
npm run typecheck        # TSC check
npm test                 # Jest
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

**Single test:**
```bash
npm test -- src/services/jwt.service.test.ts    # File
npm test -- --testNamePattern="login"            # Pattern
npm test -- --testPathPattern="auth"              # Directory
```

### Frontend (apps/frontend)
```bash
cd apps/frontend
npm start                # ng serve
npm run build            # Production build
npm test                 # Karma/Jasmine
npm test -- --include=**/auth*.spec.ts            # Single file
```

---

## Code Style

- 2 spaces, single quotes, semicolons
- Max 100 chars, trailing commas
- Prefix unused vars with `_` (e.g., `_unusedVar`)
- ESLint + Prettier (backend), Angular lint (frontend)

### Import Order
```typescript
// External → Internal → Relative
import { Request, Response } from "express";
import { JWTService } from "../services/jwt.service";
import { UserModel } from "./user.model";
```

### Naming
| Element      | Convention   | Example              |
|--------------|--------------|----------------------|
| Files        | kebab-case   | auth-middleware.ts   |
| Classes      | PascalCase   | AuthController       |
| Interfaces   | PascalCase   | User                 |
| Functions    | camelCase    | generateToken()      |
| Constants    | UPPER_SNAKE  | TOKEN_EXPIRY         |
| Boolean      | is/has/should| isAuthenticated      |

### TypeScript
- Return types required
- `interface` over `type` for objects
- `unknown` over `any`
- Strict mode enabled

### Error Handling
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) { super(message); }
}
```

### Security
- HTTP-only cookies for JWT
- Token rotation for refresh tokens
- Rate limiting on auth endpoints
- Constant-time comparison
- Never expose secrets in errors
- Validate inputs with Zod

---

## Testing

### Backend (Jest)
```
src/__tests__/
  unit/services/jwt.service.test.ts
  integration/auth.controller.test.ts
  mocks/user.mock.ts
```
- AAA pattern
- Mock external deps
- Descriptive: `should[Expected]When[Condition]`

### Frontend (Karma/Jasmine)
- Use TestBed, ComponentFixture
- Mock services with Jasmine spies

---

## Git

### Commits
`type(scope): description`  
Types: feat, fix, docs, style, refactor, test, chore

### Branches
- feature/description
- fix/description

---

## Project Structure

### Backend
```
apps/backend/src/
├── config/      # env.ts, prisma.ts
├── controllers/# Route handlers
├── middlewares/# Express middleware
├── routes/      # Route definitions
├── services/    # Business logic
├── schemas/     # Zod validation
├── types/       # TypeScript types
└── index.ts     # Entry point
```

### Frontend
```
apps/frontend/src/app/
├── components/
├── services/
├── guards/
└── interceptors/
```

---

## Environment

```env
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DATABASE_URL=
PORT=3000
NODE_ENV=development
MAILTRAP_TOKEN=
```

---

## Prisma

```bash
npm run prisma:generate  # Generate client
npm run prisma:push     # Push schema
npm run prisma:migrate   # Migrate
npm run prisma:studio   # GUI
npm run prisma:seed     # Seed data
```

---

## Key Notes

- Run `npm run typecheck` before committing
- Run tests before pushing
- Regenerate Prisma client after schema changes
- Angular 17+ uses standalone components
