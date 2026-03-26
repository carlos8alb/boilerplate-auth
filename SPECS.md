# SPECS — Sistema de Autenticación y Gestión de Usuarios

## Arquitectura

Monorepo con npm workspaces:
- `apps/backend` — API REST con Express + TypeScript
- `apps/frontend` — SPA con Angular 17+ (standalone components)

---

## Stack Tecnológico

### Backend
- **Runtime:** Node.js con TypeScript (strict mode)
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (access token + refresh token con rotación)
- **Documentación API:** Swagger (OpenAPI 3.0) via `swagger-jsdoc` + `swagger-ui-express`
- **Emails:** Resend
- **Validación:** Zod
- **Hashing:** bcryptjs
- **Rate Limiting:** express-rate-limit
- **Seguridad:** helmet, cors
- **Linting:** ESLint + Prettier
- **Testing:** Jest

### Frontend
- **Framework:** Angular 17+ (standalone components)
- **Estilos:** SCSS
- **Testing:** Karma/Jasmine

---

## Estructura del Proyecto

```
boilerplate-auth/
├── package.json              # Root monorepo
├── AGENTS.md                 # Guías para agentes
├── SPECS.md                  # Este archivo
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── env.ts
│   │   │   │   ├── prisma.ts
│   │   │   │   └── swagger.ts
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── middlewares/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   ├── services/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── app.component.ts
│       │   │   ├── app.routes.ts
│       │   │   └── app.config.ts
│       │   ├── assets/
│       │   ├── styles.scss
│       │   └── index.html
│       ├── angular.json
│       └── package.json
└── node_modules/
```

---

## Modelo de Base de Datos (Prisma)

```prisma
// apps/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoleName {
  ADMIN
  USER
  MODERATOR
  GUEST
  CLIENT
}

model Role {
  id          String   @id @default(uuid())
  name        RoleName @unique
  description String?
  users       User[]

  @@map("roles")
}

model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String
  firstName             String?
  lastName              String?
  isEmailVerified       Boolean   @default(false)
  roleId                String
  role                  Role      @relation(fields: [roleId], references: [id])
  emailVerificationToken  String?   @unique
  emailVerificationExpiry DateTime?
  passwordResetToken      String?   @unique
  passwordResetExpiry     DateTime?
  refreshTokens           RefreshToken[]
  deletedAt             DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}
```

**Seed inicial:** crear roles `ADMIN`, `USER`, `MODERATOR`, `GUEST`, `CLIENT`.

---

## Variables de Entorno

### Backend (`.env`)

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# JWT
JWT_SECRET="super_secret_access"
JWT_REFRESH_SECRET="super_secret_refresh"
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Servidor
PORT=3000
NODE_ENV=development

# Email (Resend)
RESEND_API_KEY=

# URL del frontend
CLIENT_URL=http://localhost:4200
```

---

## API Versioning

Se usa **URL Versioning**:

```
/api/v1/auth/...
/api/v1/users/...
/api/v1/docs        # Swagger
```

---

## Endpoints de la API

### Auth — `/api/v1/auth`

| Método | Ruta                   | Descripción                                    | Auth requerida |
| ------ | ---------------------- | ---------------------------------------------- | -------------- |
| POST   | `/register`            | Registrar nuevo usuario (rol USER por defecto) | No             |
| POST   | `/login`               | Login con email y password                     | No             |
| POST   | `/logout`              | Invalidar refresh token                        | No             |
| POST   | `/refresh`             | Obtener nuevo access token con refresh token   | No             |
| GET    | `/verify-email`        | Verificar email con token (`?token=...`)       | No             |
| POST   | `/resend-verification` | Reenviar email de verificación                 | No             |
| POST   | `/forgot-password`     | Solicitar email de recuperación de contraseña  | No             |
| POST   | `/reset-password`      | Resetear contraseña con token (`?token=...`)   | No             |

### Users — `/api/v1/users`

| Método | Ruta   | Descripción                           | Auth requerida |
| ------ | ------ | ------------------------------------- | -------------- |
| GET    | `/me`  | Obtener datos del usuario autenticado | JWT válido     |
| PATCH  | `/me`  | Actualizar datos propios              | JWT válido     |
| GET    | `/`    | Listar todos los usuarios (paginado)  | ADMIN          |
| DELETE | `/:id` | Eliminar usuario                      | ADMIN          |

### Health — `/api/v1/health`

| Método | Ruta | Descripción  | Auth requerida |
| ------ | ---- | ------------ | -------------- |
| GET    | `/`  | Health check | No             |

---

## Pagination

**Query Parameters:**
- `page` (default: 1, min: 1)
- `pageSize` (default: 20, min: 1, max: 100)

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "data": [{ "id": "...", "email": "..." }],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "pages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Rate Limiting

| Ruta                             | Límite       | Ventana    |
| -------------------------------- | ------------ | ---------- |
| POST `/auth/login`               | 5 intentos   | 15 minutos |
| POST `/auth/register`            | 3 intentos   | 15 minutos |
| POST `/auth/forgot-password`     | 3 intentos   | 15 minutos |
| POST `/auth/reset-password`      | 5 intentos   | 15 minutos |
| POST `/auth/resend-verification` | 3 intentos   | 15 minutos |
| Demás rutas                      | 100 requests | 15 minutos |

---

## Middlewares

### `authenticate.ts`
Extrae el JWT del header `Authorization: Bearer <token>`, verifica con `JWT_SECRET`, y adjunta `req.user = { id, role }`.

### `authorize.ts`
```typescript
export const authorize = (...roles: RoleName[]) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
```

### `validate.ts`
```typescript
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.body = result.data;
  next();
};
```

---

## Formato de Respuestas

**Éxito:**
```json
{
  "message": "Descripción del resultado",
  "data": {},
  "pagination": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error:**
```json
{
  "message": "Descripción del error",
  "error": "ErrorCode",
  "errors": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Idioma de los Mensajes

- **Todos los mensajes enviados al frontend deben estar en español**.

---

## Seguridad

- Nunca devolver `passwordHash` en respuestas
- Mensajes de error genéricos en login
- Tokens de email opacos (no JWTs)
- Aplicar `helmet` y `cors`
- Rate limiting en endpoints de auth
- HTTP-only cookies para JWT (opcional)
- Validación de inputs con Zod

---

## Comandos

### Root (Monorepo)
```bash
npm install              # Instalar todas las dependencias
npm run dev              # Ejecutar todos los workspaces
npm run build            # Compilar todos
npm run lint             # Lint todos
npm run test             # Tests todos
```

### Backend
```bash
cd apps/backend
npm run dev              # ts-node-dev
npm run build            # tsc
npm start                # producción
npm run lint             # ESLint
npm run test             # Jest
npm run prisma:generate  # Generar Prisma Client
npm run prisma:push      # Push schema
npm run prisma:migrate   # Migraciones
```

### Frontend
```bash
cd apps/frontend
npm start                # ng serve
npm run build           # Build producción
npm test                # Karma/Jasmine
```

---

## Testing

### Backend (Jest)
- Ubicación: `src/__tests__/`
- Patrón: AAA (Arrange, Act, Assert)
- Nombre: `should[Expected]When[Condition]`

### Frontend (Karma/Jasmine)
- Usar TestBed y ComponentFixture
- Mock services con Jasmine spies

---

## Git

### Commits
`type(scope): description`  
Types: feat, fix, docs, style, refactor, test, chore

### Branches
- `feature/description`
- `fix/description`