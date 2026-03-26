# AGENTS.md - Agent Coding Guidelines

## Project Overview

JWT authentication API with Express and TypeScript. Strict TypeScript mode enabled.

---

## Build, Lint, and Test Commands

### Package Manager

Use **npm** as the primary package manager.

### Core Commands

```bash
npm install              # Install dependencies
npm run dev             # Run development server (ts-node-dev)
npm run build           # Build for production (tsc)
npm start               # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues automatically
npm run typecheck       # TypeScript type checking
npm test                # Run all tests (Jest)
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Running Single Tests

```bash
npm test -- <test-file-path>           # Single test file
npm test -- --testNamePattern="login"  # Tests matching pattern
npm test -- --testPathPattern="auth"   # Tests in directory
```

---

## Code Style Guidelines

### General Principles

- **ESLint** with **Prettier** for formatting
- **TypeScript** strict mode enabled
- **Jest** for testing
- 2 spaces indentation, single quotes, semicolons
- Max line length: 100 characters, trailing commas
- Prefix unused variables with `_` (e.g., `_unusedVar`)

### Import Order

```typescript
// Order: external → internal → relative
import { Request, Response } from "express";
import { JWTService } from "../services/jwt.service";
import { UserModel } from "./user.model";
```

### Naming Conventions

| Element    | Convention    | Example              |
| ---------- | ------------- | -------------------- |
| Files      | kebab-case    | `auth-middleware.ts` |
| Classes    | PascalCase    | `AuthController`     |
| Interfaces | PascalCase    | `User` or `IUser`    |
| Functions  | camelCase     | `generateToken()`    |
| Variables  | camelCase     | `accessToken`        |
| Constants  | UPPER_SNAKE   | `TOKEN_EXPIRY`       |
| Boolean    | is/has/should | `isAuthenticated`    |

### TypeScript Guidelines

- Define return types for all functions
- Use `interface` over `type` for object shapes
- Use `unknown` over `any`
- Prefer generics over type casting
- Strict mode enabled in tsconfig.json

### Error Handling

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
  }
}

async function authenticate(req: Request, res: Response) {
  try {
    return await jwtService.verify(req.headers.authorization);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError(401, "Token expired");
    }
    throw new AppError(401, "Invalid token");
  }
}
```

### Security Best Practices

- Use HTTP-only cookies for JWT storage
- Implement token rotation for refresh tokens
- Add rate limiting on auth endpoints
- Use constant-time comparison for token validation
- Never expose sensitive data in error messages

---

## Testing Guidelines

### Test File Organization

```
src/__tests__/
  unit/services/jwt.service.test.ts
  integration/auth.controller.test.ts
  mocks/user.mock.ts
```

### Test Structure (AAA Pattern)

```typescript
describe("JWTService", () => {
  describe("generateToken", () => {
    it("should generate a valid access token", () => {
      const user = mockUser();
      const token = jwtService.generateToken(user);
      expect(token).toBeDefined();
    });
  });
});
```

- Mock external dependencies (database, external APIs)
- Use descriptive names: `should[ExpectedBehavior]When[Condition]`
- Test both success and error cases

---

## Git Conventions

### Commit Messages

Use conventional commits: `type(scope): description`  
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
Example: `feat(auth): add refresh token rotation`

### Branch Naming

- Feature: `feature/description`
- Bugfix: `fix/description`

---

## Project Structure

```
src/
├── config/       # Configuration (env.ts)
├── controllers/  # Route handlers
├── middlewares/  # Express middlewares
├── routes/       # Route definitions
├── services/     # Business logic
├── types/        # TypeScript types
└── index.ts      # Entry point
```

---

## Environment Variables

```env
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DATABASE_URL=
PORT=3000
NODE_ENV=development
```

---

## Key Dependencies

- **express**: Web framework
- **jsonwebtoken**: JWT signing/verification
- **bcryptjs**: Password hashing
- **zod**: Schema validation
- **dotenv**: Environment variables
