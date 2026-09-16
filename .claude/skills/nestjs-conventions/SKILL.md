---
name: nestjs-conventions
description: Module/service/entity conventions for this repo's NestJS + TypeORM backend. Use when adding or modifying a domain module, entity, controller, or one-off script.
---

# NestJS conventions for vocab-app-backend

Use this when creating or touching a domain module (e.g. `vocabulary`, `user`, `listening`).

## Adding a new entity

1. Create `<name>.entity.ts` under the owning module's folder — `TypeOrmModule.forRoot` glob-loads it automatically, no changes needed in `app.module.ts`.
2. Register it in that module's own `TypeOrmModule.forFeature([Entity])` so it's injectable via `@InjectRepository`.
3. `synchronize` is on outside production, so the dev DB schema updates automatically on next boot — no manual migration needed locally.

## Adding a new module

1. Follow the existing layout: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.entity.ts`, `<name>.dto.ts`.
2. If the module grows multiple concerns (see `vocabulary`), split into `<name>-<concern>.service.ts` / `.entity.ts` rather than one large service.
3. Import the new module in `src/app.module.ts`.
4. Validate all incoming data with `class-validator` decorators on the DTO — controllers should not hand-check input.
5. Guard protected routes with `UidAuthGuard` (authenticated) or `AdminGuard` (admin-only), and pull the user via `@CurrentUser()`.
6. Let unhandled errors flow to `AllExceptionsFilter` — don't catch-and-reformat errors in controllers/services unless adding domain-specific context.

## Adding a one-off/maintenance script

1. Place it as `<name>.script.ts` next to the domain it operates on (see `src/vocabulary/generate-vocab.script.ts`).
2. Add an `npm run` entry in `package.json` using the existing pattern: `ts-node --project tsconfig.seed.json -r tsconfig-paths/register <path>`.
3. Never run it with plain `ts-node`/`node` — path aliases (`tsconfig-paths`) won't resolve.

## Response shape

Keep the existing envelope from `AllExceptionsFilter` / successful responses: `{ statusCode, success, message, total, body }`. Don't introduce a different shape for new endpoints.
