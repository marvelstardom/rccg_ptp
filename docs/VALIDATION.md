# Validation evidence

Checks performed during package creation on 8 October 2026:

- `npm run build`: passed. Next.js production compilation, TypeScript checks and route generation completed.
- `npm run typecheck`: passed.
- `npm test`: 8 tests passed, none failed. This includes local PostgreSQL-compatible policy checks using PGlite and all 18 template/size render combinations.
- Production route smoke checks: Home, About, Visit, Programmes, Gallery, Contact, Ministries, Sermons, Privacy and Login returned HTTP 200.
- Production `/dashboard` returned HTTP 307 to sign-in when unconfigured. A demonstration programme calendar download returned HTTP 404. Demonstration labels did not appear on the production home page, even with `DEMO_MODE=true` in the launch environment.
- Graphic sample was visually inspected: exact logo, legible essential text and demonstration watermark were present without clipping.
- Browser screenshots of the home page at 1440px and 390px and the Content Studio were captured and visually inspected. All home images loaded and no horizontal page overflow was detected at either width. Screenshots are included in this folder.
- Browser interaction checks passed for mobile navigation, gallery open/close, grounded caption creation and a downloaded PNG from Content Studio. The mobile studio had no horizontal overflow. Preview form submissions returned HTTP 503 with an explicit unsent/unsaved message.
- Photos: local WebP assets were inspected; adult-photo selection totals approximately 2.4 MB. Orientation and compression were applied without retouching faces.

The database tests check administrator/member separation, media and finance isolation from prayer enquiries, pastoral-care access, blocked self-elevation, blocked media approval, source revision enforcement, immutable content writes, approval invalidation, anonymous public projections, worker deduplication and submission rate limiting.

## Limits

Tests ran against a local PGlite PostgreSQL engine, not the church’s Supabase project. Supabase Auth and hosted role isolation must be acceptance-tested after configuration. Actual provider credentials, social publication, unknown delivery reconciliation, Inngest registration, hosted performance, full WCAG audit, backups and restore are not verified. No claims of live service operation or production performance measurements are made.

The supplied Figma design could not be read because of its account tool limit. Exact design fidelity remains pending.
