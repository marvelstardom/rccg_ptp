# Deploy and maintain

## Vercel

1. Put the folder in a private repository under the church’s ownership, install dependencies with `npm ci`, and connect it to Vercel as a Next.js project.
2. Add the real environment values from `.env.example` in Vercel. Set `DEMO_MODE=false` and the verified site URL. Never use `NEXT_PUBLIC_` for service-role, Inngest, AI or publishing secrets.
3. Apply both migrations to a dedicated Supabase project. Create authorised team accounts and profiles. Require appropriate account security, and restrict project administration.
4. Set church content and photo permissions; review the draft privacy notice and choose data retention/contact procedures.
5. Build with `npm run build`. Verify real sign-in, anonymous approved-programme access, media draft creation, pastor approval, member isolation and private prayer confidentiality.
6. Configure Inngest’s signing key and route sync. Verify a manual preparation run before enabling its cron. Leave social publishing paused until the documented provider work is complete.
7. Add the domain after checking mobile pages and exports. Measure performance/accessibility in the real hosted environment; no production Core Web Vitals targets have been claimed.

## Production fail-closed behavior

Demo data is never returned under `NODE_ENV=production`. Unconfigured production dashboard access redirects to sign-in. Public forms return an unavailable response until the database, service key, hash secret and trusted request IP are configured. Production form IP extraction currently supports Vercel’s trusted edge header; another host needs its own verified trust boundary.

## Backups and restore

- Configure Supabase-managed database backups/PITR as appropriate for the selected plan. Retain versioned migrations and a secured copy of editorial assets.
- Keep encrypted periodic database exports outside the active database account. Restrict backup access to designated church administrators; backups contain confidential enquiries.
- Restore into an isolated project first. Apply/verify migrations, test role policies, compare programme/member counts and approved content states, then rehearse the planned switch. Never test restores against production.
- Disable scheduled workflows while restoring, rotate affected keys if necessary and reconcile any provider jobs before re-enabling automation.
- No storage uploads are implemented yet. When added, include bucket contents and object policy restoration in the backup plan.

## Ongoing operations

Review dependencies and deployment logs, archive expired IP rate buckets, adopt an explicit enquiry/member retention schedule, audit user roles and review failed Inngest runs. Set provider budgets and monitoring alerts before enabling paid integrations. This package documents these tasks; it does not configure accounts, paid plans or alerts automatically.

Migrations are intended for an empty Supabase project. Do not run them against an unrelated existing database without reviewing conflicts and making a backup.
