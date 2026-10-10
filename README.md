# RCCG Peculiar Treasures Parish — website & church workspace

A downloadable Next.js project for **RCCG Peculiar Treasures Parish **. Warm public pages, purple administration UI, programme management, private enquiries, branded graphic exports and a human-reviewed content workflow.

**This is a working first implementation, not a fully launched church management system.** Production services need configuration. Social posting and AI generation are not connected. Several operational modules are clearly labelled as planned. See `docs/SCOPE.md` and `docs/INTEGRATIONS.md` before deployment.

## Start locally

Install Node.js 22 LTS or newer and open a terminal in this folder:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

Open http://localhost:3000. `DEMO_MODE=true` enables a **development-only** demonstration at `/dashboard`. It does not persist changes and does not send form submissions. No Supabase credentials are needed to preview the design or export demonstration graphics. Demo mode is disabled when `NODE_ENV=production`, even if the environment flag is true.

## Enable real data and sign-in

1. Create a Supabase project under the church’s account.
2. Run `supabase/migrations/001_initial.sql` and then `002_worker.sql` in order using Supabase migrations or its SQL editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and a strong random `FORM_IP_HASH_SECRET` in `.env.local`. Never commit the actual file.
4. Set `DEMO_MODE=false`.
5. Create the initial team user in Supabase Auth. Add their UUID and role using a trusted SQL administration session:

```sql
insert into public.profiles (id, role, display_name)
values ('REPLACE_WITH_AUTH_USER_UUID', 'admin', 'Church administrator');
```

Only trusted SQL/service administration can assign roles. Users cannot elevate their own access. Create a separate `pastor` user for prayer requests and editorial approval. Admin access alone does **not** grant access to prayer requests.

6. Sign in at `/login`. Create programmes, review their details, and approve them. Only approved programmes appear publicly. Edit a programme and its approval resets; previously generated content is canceled.
7. Create a caption version in Content Studio, submit it in Approvals and approve it using an authorised role. Export graphics/captions for manual posting.

Public submission rate limiting trusts Vercel’s edge-supplied IP header. Production submissions fail closed on other hosts until a trusted IP source is implemented. On localhost real submissions use one shared local rate bucket.

## Configure church content

Edit `lib/config.ts` with the confirmed name, full venue, service schedule, streaming link and contacts. Set `church.confirmed=true` only after those details have been verified. Upcoming programme records come from Supabase; website editorial content is currently managed in source.

The supplied build prompt references a PRD that was not attached. The Figma file was not inspectable because the account had reached its MCP call limit; the dashboard uses the purple identity and module list in the prompt, **not a claim of an exact Figma implementation**.

## Included photography and brand assets

Church photos were downloaded from the supplied October Thanksgiving 2026 Drive folder. Selected adult congregation photographs are converted to WebP, EXIF orientation is corrected and metadata stripped. Faces, skin and clothing were not retouched. Both supplied logos are preserved. The included photo manifest records origins and sizes. Child portraits collected during selection are excluded from the delivered project.

Confirm the church’s publication permissions before launch. Avoid exposing unapproved or private images in the public folder. DM Sans is self-hosted from Fontsource; its bundled license is in `docs/font-license.txt`.

## Validate

```bash
npm run test
npm run typecheck
npm run build
```

Tests include programme validation, source changes, Lagos timezone, fifth Sundays, idempotency identities, unknown delivery handling and all 18 graphic template/size combinations. SQL role and approval tests use PGlite to check the policies locally; real Supabase deployment still requires acceptance testing.

## Weekly preparation

The included Inngest function prepares upcoming-programme caption drafts at Friday 09:00 Africa/Lagos, idempotently by source revision and preparation date. It does **not** approve, render scheduled assets or publish social posts. Register `/api/inngest` in your Inngest application, configure signing/event keys, and review its logs. The frequency is defined in `lib/inngest.ts`.

See `docs/DEPLOYMENT.md` for deployment and backups; `docs/INTEGRATIONS.md` for pending provider work and `docs/VALIDATION.md` for checks performed.

## Folder map

| Folder | Purpose |
|---|---|
| `app/` | Public routes, private dashboard, API handlers |
| `components/` | Public UI, administration and content studio |
| `lib/` | Configuration, Supabase, graphic renderer and workflows |
| `supabase/migrations/` | Tables, role policies, approval and worker procedures |
| `public/images/` | Church photographs and exact supplied logos |
| `tests/` | Workflow, graphic and database policy verification |
| `docs/` | Setup, limitations, deployment and original build prompt |

The ZIP excludes installed dependencies, build outputs and real secrets. `npm ci` installs the exact dependency versions recorded in the lockfile.
