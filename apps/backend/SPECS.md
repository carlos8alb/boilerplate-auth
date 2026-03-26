# SPECS — Sistema de Autenticación y Gestión de Usuarios

## Stack Tecnológico

- **Runtime:** Node.js con TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (access token + refresh token)
- **Documentación API:** Swagger (OpenAPI 3.0) via `swagger-jsdoc` + `swagger-ui-express`
- **Emails:** Nodemailer (compatible con SMTP / SendGrid / Resend)
- **Validación:** Zod
- **Hashing:** bcryptjs
- **Rate Limiting:** express-rate-limit
- **Seguridad:** helmet, cors
- **Linting:** ESLint
- **Formatting:** Prettier

---

## Estructura del Proyecto

```
src/
├── config/
│   ├── env.ts              # Variables de entorno con validación Zod
│   ├── prisma.ts           # Instancia singleton de Prisma Client
│   └── swagger.ts          # Configuración de Swagger
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.schemas.ts  # Schemas Zod para validación de inputs
│   └── users/
│       ├── users.routes.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.schemas.ts
├── middlewares/
│   ├── authenticate.ts     # Verifica JWT y adjunta user al request
│   ├── authorize.ts        # Verifica roles
│   ├── validate.ts         # Middleware genérico de validación Zod
│   └── errorHandler.ts     # Handler global de errores
├── utils/
│   ├── jwt.ts              # Helpers: signAccessToken, signRefreshToken, verifyToken
│   ├── email.ts            # Helpers: sendVerificationEmail, sendPasswordResetEmail
│   └── crypto.ts           # Helpers: generateSecureToken (para tokens de email)
├── types/
│   └── express.d.ts        # Extensión de Request para req.user
└── app.ts                  # Setup de Express, middlewares globales, rutas
prisma/
└── schema.prisma
.env.example
```

---

## Modelo de Base de Datos (Prisma)

```prisma
// prisma/schema.prisma

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
}

model Role {
  id    Int      @id @default(autoincrement())
  name  RoleName @unique
  users User[]

  @@map("roles")
}

model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  passwordHash          String
  isEmailVerified       Boolean   @default(false)
  roleId                Int
  role                  Role      @relation(fields: [roleId], references: [id])
  emailVerificationToken  String?   @unique
  emailVerificationExpiry DateTime?
  passwordResetToken      String?   @unique
  passwordResetExpiry     DateTime?
  refreshTokens           RefreshToken[]
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("users")
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}
```

**Seed inicial:** crear roles `ADMIN` y `USER` en la tabla `roles`.

---

## Variables de Entorno

```env
# .env.example

# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# JWT
JWT_ACCESS_SECRET="super_secret_access"
JWT_REFRESH_SECRET="super_secret_refresh"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Email (SMTP genérico — reemplazar con proveedor real)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="no-reply@example.com"
SMTP_PASS="email_password"
EMAIL_FROM="no-reply@example.com"

# URL del frontend (para links en emails)
CLIENT_URL="http://localhost:4200"
```

---

## API Versioning

Se usa **URL Versioning** para mantener compatibilidad hacia atrás:

```
/api/v1/auth/...
/api/v1/users/...
```

Cuando haya cambios breaking, crear `/api/v2/...`.

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

Para endpoints que devuelven listas, usar **page-based pagination**:

**Query Parameters:**

- `page` (default: 1, min: 1)
- `pageSize` (default: 20, min: 1, max: 100)

**Response:**

```json
{
  "message": "Users retrieved successfully",
  "data": [{ "id": 1, "email": "..." }],
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

## Detalle de Flujos

### Registro (`POST /api/v1/auth/register`)

1. Validar body: `{ email, password }` con Zod (password mínimo 8 chars).
2. Verificar que el email no esté registrado.
3. Hashear password con `bcryptjs` (rounds: 12).
4. Crear usuario con `isEmailVerified: false` y rol `USER`.
5. Generar token de verificación de email: string aleatorio seguro + expiración de 24h.
6. Guardar `emailVerificationToken` y `emailVerificationExpiry` en el usuario.
7. Enviar email con link: `${CLIENT_URL}/verify-email?token=<token>`.
8. Responder `201` con mensaje de éxito (no devolver el token ni el hash).

### Verificación de Email (`GET /api/v1/auth/verify-email?token=...`)

1. Buscar usuario por `emailVerificationToken`.
2. Verificar que el token no haya expirado (`emailVerificationExpiry > now`).
3. Marcar `isEmailVerified: true`, limpiar `emailVerificationToken` y `emailVerificationExpiry`.
4. Responder `200` con mensaje de confirmación.

### Login (`POST /api/v1/auth/login`)

1. Validar body: `{ email, password }`.
2. Buscar usuario por email. Si no existe, responder `401` (mensaje genérico).
3. Verificar password con `bcryptjs.compare`. Si falla, responder `401`.
4. Verificar que `isEmailVerified === true`. Si no, responder `403` con mensaje para reenviar verificación.
5. Generar `accessToken` (JWT, payload: `{ sub: userId, role: roleName }`, expiración: 15m).
6. Generar `refreshToken` (JWT o string opaco, expiración: 7d).
7. Guardar `refreshToken` en la tabla `refresh_tokens`.
8. Responder `200` con `{ accessToken, refreshToken, user: { id, email, role } }`.

### Refresh Token (`POST /api/v1/auth/refresh`)

1. Recibir `{ refreshToken }` en el body.
2. Buscar el refresh token en la tabla `refresh_tokens` y verificar que no haya expirado.
3. Verificar el JWT del refresh token con `JWT_REFRESH_SECRET`.
4. Generar nuevo `accessToken`.
5. **Rotar el refresh token** (eliminar el anterior, crear uno nuevo) - mandatory por seguridad.
6. Responder `200` con `{ accessToken, refreshToken }`.

### Logout (`POST /api/v1/auth/logout`)

1. Recibir `{ refreshToken }` en el body.
2. Eliminar el registro de `refresh_tokens` correspondiente.
3. Responder `200`.

### Recuperación de Contraseña (`POST /api/v1/auth/forgot-password`)

1. Validar body: `{ email }`.
2. Buscar usuario por email. Si no existe, responder `200` igualmente (no revelar si el email existe).
3. Generar token de reset: string aleatorio seguro + expiración de 1h.
4. Guardar `passwordResetToken` y `passwordResetExpiry` en el usuario.
5. Enviar email con link: `${CLIENT_URL}/reset-password?token=<token>`.
6. Responder `200` con mensaje genérico.

### Reset de Contraseña (`POST /api/v1/auth/reset-password`)

1. Recibir `{ token, newPassword }` en el body.
2. Buscar usuario por `passwordResetToken`.
3. Verificar que el token no haya expirado.
4. Hashear nueva password.
5. Actualizar `passwordHash`, limpiar `passwordResetToken` y `passwordResetExpiry`.
6. Invalidar todos los refresh tokens del usuario (eliminar de la tabla).
7. Responder `200`.

### Listar Usuarios (`GET /api/v1/users`)

1. Autenticar con JWT válido.
2. Verificar que el usuario tenga rol ADMIN.
3. Obtener `page` y `pageSize` de query params.
4. Contar total de usuarios.
5. Obtener usuarios paginados.
6. Responder `200` con lista y metadata de paginación.

---

## Rate Limiting

Aplicar `express-rate-limit` en las siguientes rutas:

| Ruta                             | Límite       | Ventana    |
| -------------------------------- | ------------ | ---------- |
| POST `/auth/login`               | 5 intentos   | 15 minutos |
| POST `/auth/register`            | 3 intentos   | 15 minutos |
| POST `/auth/forgot-password`     | 3 intentos   | 15 minutos |
| POST `/auth/reset-password`      | 5 intentos   | 15 minutos |
| POST `/auth/resend-verification` | 3 intentos   | 15 minutos |
| Demás rutas                      | 100 requests | 15 minutos |

Cuando se exceda el límite, responder `429 Too Many Requests`.

---

## Middlewares

### `authenticate.ts`

- Extraer el JWT del header `Authorization: Bearer <token>`.
- Verificar con `JWT_ACCESS_SECRET`.
- Si es válido, adjuntar `req.user = { id, role }` y llamar `next()`.
- Si es inválido o expirado, responder `401`.

### `authorize.ts`

```typescript
// Uso: router.get('/', authenticate, authorize('ADMIN'), controller)
export const authorize =
  (...roles: RoleName[]) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
```

### `validate.ts`

```typescript
// Uso: router.post('/register', validate(registerSchema), controller)
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.body = result.data;
  next();
};
```

### `errorHandler.ts`

Handler global al final de `app.ts`. Captura errores, loguea en desarrollo, responde con formato consistente.

---

## Formato de Respuestas

Todas las respuestas siguen esta estructura:

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

Los códigos HTTP a usar:

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validación)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos / email no verificado)
- `404` - Not Found
- `409` - Conflict (email en uso)
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Idioma de los Mensajes

- **Todos los mensajes enviados al frontend deben estar en español**.
- Esto incluye mensajes de éxito, error, validación, y descripciones.
- Los mensajes de error deben ser claros y descriptivos en español.
- La descripción de los roles en la base de datos también debe estar en español.

---

## Configuración de Swagger

- Montar en `/api/v1/docs`.
- Documentar todos los endpoints con JSDoc usando la sintaxis OpenAPI 3.0.
- Incluir `securitySchemes` con `BearerAuth` (JWT).
- Marcar con `security: [{ BearerAuth: [] }]` los endpoints protegidos.
- Incluir ejemplos de request/response en cada operación.

---

## Seguridad — Consideraciones

- Nunca devolver el `passwordHash` en ninguna respuesta.
- Usar mensajes de error genéricos en login (no indicar si el email existe o si la password es incorrecta).
- Mismo comportamiento en `forgot-password` independientemente de si el email existe.
- Tokens de email (verificación y reset) deben ser opacos (no JWTs), generados con `crypto.randomBytes(32).toString('hex')`.
- Aplicar `helmet` y `cors` en `app.ts`.
- Aplicar `express-rate-limit` según la tabla de rate limiting.
- Usar `express-mongo-sanitize` para prevenir inyecciones.

---

## Health Check

`GET /api/v1/health`

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

## Dependencias Sugeridas

```json
{
  "dependencies": {
    "@prisma/client": "latest",
    "bcryptjs": "latest",
    "cors": "latest",
    "express": "latest",
    "express-rate-limit": "latest",
    "helmet": "latest",
    "jsonwebtoken": "latest",
    "nodemailer": "latest",
    "swagger-jsdoc": "latest",
    "swagger-ui-express": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/bcryptjs": "latest",
    "@types/cors": "latest",
    "@types/express": "latest",
    "@types/jsonwebtoken": "latest",
    "@types/nodemailer": "latest",
    "@types/swagger-jsdoc": "latest",
    "@types/swagger-ui-express": "latest",
    "@typescript-eslint/eslint-plugin": "latest",
    "@typescript-eslint/parser": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "prisma": "latest",
    "ts-node-dev": "latest",
    "typescript": "latest"
  }
}
```

---

## Scripts de `package.json`

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## ESLint Config (`.eslintrc.js`)

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
```

---

## Prettier Config (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```
