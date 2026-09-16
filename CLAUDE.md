# vocab-app-backend

NestJS + TypeORM + PostgreSQL backend for a vocabulary learning app.

## Commands

- `npm run start:dev` — run with watch mode (dev)
- `npm run build` — compile (`nest build`)
- `npm run lint` — eslint with `--fix`
- `npm run format` — prettier on `src/**/*.ts` and `test/**/*.ts`
- `npm run test` — unit tests (jest, spec files under `src/`)
- `npm run test:e2e` — e2e tests (`test/jest-e2e.json`)
- `npm run test:cov` — coverage

Before considering a change done, run `npm run lint` and `npm run test`.

## Architecture

- Standard Nest module-per-domain layout under `src/`: `user`, `vocabulary`, `verb-form`, `category`, `conversation-quiz`, `listening`, `admin`, `script-runner`, `common`.
- Each domain module typically has: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts` (TypeORM), `*.dto.ts`. Larger modules split services further (e.g. `vocabulary-bookmark.service.ts`, `vocabulary-progress.service.ts`).
- `TypeOrmModule.forRoot` in `src/app.module.ts` auto-loads all `*.entity.ts` files — a new entity just needs to exist under `src/**`, no manual registration beyond its module's `TypeOrmModule.forFeature([...])`.
- `synchronize: true` outside production — schema follows entities directly in dev, no manual migrations. Be careful with destructive entity changes against a real dev DB.
- Global exception handling: `src/common/filters/all-exceptions.filter.ts` — never leak stack traces or internal paths in responses; keep the `{ statusCode, success, message, total, body }` response shape.
- Auth: `UidAuthGuard` (`src/user/uid-auth.guard.ts`) and `AdminGuard` (`src/user/admin.guard.ts`), with `@CurrentUser()` decorator to pull the authenticated user in controllers.
- One-off data/maintenance scripts live next to their domain as `*.script.ts` (e.g. `src/vocabulary/generate-vocab.script.ts`) and are run via `ts-node` through `npm run <script-name>` entries in `package.json`, using `tsconfig.seed.json`.

## Conventions

- DTOs use `class-validator` decorators; controllers rely on Nest's global validation pipe behavior — validate at the boundary, not deeper in services.
- Entities are the source of truth for schema; don't hand-write SQL migrations unless working against `backup-*.sql` dumps (these are gitignored, local-only).
- Prefer editing existing service/controller files over adding new abstraction layers — this codebase favors one service per concern, not generic repositories/base classes.
- Env vars are read via `process.env` + `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true })`); see `.env.example` for the full list. Never commit `.env` or real credentials.

## Common mistakes to avoid

- Don't register a new entity only in `app.module.ts`'s glob — it also needs `TypeOrmModule.forFeature([Entity])` in its own module to be injectable.
- Don't return raw error objects/stack traces from controllers — let `AllExceptionsFilter` handle formatting.
- Don't run scripts under `src/*/*.script.ts` directly with `node`/`ts-node` without `-r tsconfig-paths/register` and `tsconfig.seed.json` — path aliases will fail to resolve (see existing `package.json` script entries for the correct invocation).
