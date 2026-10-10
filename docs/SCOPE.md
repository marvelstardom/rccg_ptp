# Delivery scope

## Implemented

- Responsive Home, Plan Your Visit, About, Programmes, Sermons, Ministries, Gallery, Prayer/Contact and draft Privacy pages.
- Real church photography and both supplied logos; self-hosted DM Sans; mobile menus; keyboard focus; reduced-motion support; accessible gallery dialog.
- Supabase Auth sign-in, per-request user validation and cookie refresh; no signup or role assignment from the browser.
- Programme creation/editing and approval, public approved-only projection, calendar `.ics` download, Lagos scheduling.
- Administrator-only minimal member directory and record creation.
- Private enquiry intake with server validation, consent, honeypot and database-backed rate limiting; pastor/pastoral-care isolation of prayers.
- Content Studio: grounded deterministic captions, six reusable graphic copy variants, three export sizes, exact logo and essential text rendered using Sharp/SVG, caption export.
- Immutable content snapshots, draft/pending/approved/canceled review states, source-change invalidation, audit entries.
- Inngest weekly preparation of idempotent caption drafts; manual export fallback.
- Separate delivery states and publisher interface, with fail-closed unconfigured implementation.

## Requires configuration and acceptance testing

Supabase project, team identities, confirmed church content, production photo consent, Inngest registration and production secrets. Public form delivery is tested locally at the validation boundary, not against the church’s real database. Email notifications are not included; accepted enquiries are viewed in the dashboard.

## Pending implementation

Exact Figma screen alignment; full page/sermon/media CMS; editable department workflows; finance, inventory, notifications, reports and profile editing; department-head scoping; uploads and Storage policies; pastoral care triage and retention tooling; OpenAI caption/image integration; Buffer account connections and actual publishing; automatic graphic generation within weekly jobs; scheduling/rescheduling UI; provider reconciliation, retries and cancellation; monitoring, cost caps, production backups and restore rehearsal.

Giving, donation receipts, member portal, video clipping and additional platform integrations remain later phases from the supplied brief.

The navigation includes the requested modules, but planned modules display honest empty explanations. No fake finance data, leadership, testimonials, connection statuses or publishing successes are included.
