# MyPoems (verseskotetem.kiszely.work)

A Nuxt 4 web application for creating personalized printed poetry books. Users import poems, review/edit them, configure printing options, purchase via Stripe, and download the final product.

## Tech Stack

- **Framework:** Nuxt 4 with Vue 3
- **UI:** @nuxt/ui v4 (uses Tailwind CSS)
- **Auth:** nuxt-auth-utils (Google OAuth)
- **Database:** PostgreSQL via `postgres` (postgres.js)
- **Payments:** Stripe
- **Backend orchestration:** n8n workflows (webhook-driven)
- **Printing API:** Expresta
- **Package manager:** pnpm
- **Runtime:** Node 20
- **Deployment:** Railway (Docker, multi-stage build)

## Project Structure

```
app/                  # Frontend (Nuxt app directory)
  components/         # Vue components (WorkflowManager, workflow steps, menus)
  pages/              # Route pages (index, workflow/*, executions/*, legal pages)
  assets/css/         # Global styles
server/
  api/                # API endpoints (start, resume, cancel, checkout, executions, expresta)
  routes/             # Auth routes (Google OAuth) and webhooks (Stripe)
  utils/              # Shared utilities (db.ts, expresta.ts)
```

## Key Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check
```

## Architecture Notes

- The app uses n8n workflows as the backend orchestration engine. The Nuxt server acts as a proxy between the frontend and n8n webhooks.
- Workflow execution follows a multi-step pattern: start -> review poems -> review chapters -> configure printing -> purchase -> download.
- Runtime config secrets (n8n URLs/keys, Stripe keys, Expresta credentials) are set via environment variables.
- The app is deployed on Railway as the `mypoems` service in the `thriving-perfection` project.
- n8n runs as separate `Primary` and `Worker` services in the same Railway project.
- Railway is accessible via the Railway MCP tools (e.g. `mcp__Railway__*`) for managing services, variables, logs, and deployments.

## Documentation

- Keep this CLAUDE.md file up to date. After implementing a feature or making significant changes, sync this documentation to reflect the current state of the project.
- This file serves as persistent memory across sessions — accurate documentation ensures continuity.

## Code Style

- ESLint with stylistic rules: no trailing comma (`commaDangle: 'never'`), 1tbs brace style.
- TypeScript throughout.
- Hungarian-language pages for legal content (aszf, adatkezeles, kapcsolat).
