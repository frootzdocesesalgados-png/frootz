# Frootz - Doces & Salgados

A Brazilian online food store with a public product catalog and a full admin panel for product management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/frootz run dev` — run frontend locally
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

Required env vars: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME` (default: admin), `ADMIN_PASSWORD` (default: frootz2024)

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **TypeScript**: 5.9
- **Frontend**: React + Vite, TailwindCSS, Shadcn/ui, Wouter, TanStack Query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Session auth**: express-session (cookie-based, admin only)
- **Build**: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validators (server-side)
- `lib/db/src/schema/products.ts` — DB tables: categories, products
- `artifacts/api-server/src/routes/` — auth.ts, products.ts, categories.ts, health.ts
- `artifacts/frootz/src/` — React frontend (public store + admin panel)

## Architecture decisions

- `lib/api-zod/src/index.ts` exports ONLY from `./generated/api` — the orval `schemas` type output was removed from `orval.config.ts` to prevent duplicate export conflicts; after running codegen, manually overwrite this file to only export from `./generated/api`
- Admin auth uses express-session (cookie-based), no JWT; session is stored server-side
- Admin credentials stored as env vars (ADMIN_USERNAME / ADMIN_PASSWORD); defaults provided for dev
- Products use numeric(10,2) in DB but are serialized as JS numbers in the API response
- `categoryName` is joined from categories table at query time (not stored on products)

## Product

- Public storefront: product catalog with category filtering, promotional offers section, featured highlights, price display with original/sale prices
- Admin panel at `/admin`: login, dashboard with stats, full CRUD for products and categories
- Data persisted in PostgreSQL via Drizzle ORM

## User preferences

- Language: Portuguese (pt-BR) for all user-facing content
- Site name: Frootz - Doces & Salgados

## Gotchas

- After running `pnpm --filter @workspace/api-spec run codegen`, the file `lib/api-zod/src/index.ts` gets overwritten with stale exports — immediately overwrite it with just `export * from "./generated/api";`
- The codegen script runs `tsc --build` after orval; the index.ts fix must happen between orval and typecheck if running them separately

## Pointers

- See `.local/skills/pnpm-workspace/` for monorepo conventions
- See `.local/skills/react-vite/` for frontend patterns
