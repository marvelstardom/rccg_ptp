# Provider integration boundaries

| Service | Included | Current state |
|---|---|---|
| Supabase | SSR auth client, migration scripts, record operations and RLS | Working code; church project/credentials not supplied |
| Sharp | SVG-to-PNG renderer with exact supplied logo | Local export implemented and tested |
| Inngest | Signed route and weekly approved-source draft preparation | Requires account registration and credentials |
| OpenAI | Public programme-only caption-provider interface | Not connected; current drafts are deterministic |
| Buffer | Publisher capability, publish and reconcile interface | Not connected; no unverified endpoint calls |
| Google Drive | Downloaded local church photo selection | Static assets; no ongoing sync |
| Figma | Reference URL retained in original brief | Read blocked by Starter account call limit |

## Finish publishing safely

1. Confirm exact accounts, ownership, formats and provider capabilities against current provider documentation. Connect accounts through secure provider OAuth, never passwords in source.
2. Implement the `Publisher` interface. Store credentials encrypted on the server. Return Accepted when a provider acknowledges a request; mark Published only after reconciliation proves publication.
3. Add a transactional delivery reservation procedure. Recheck source revision and approval, create a unique idempotency key, and reserve a lease before contacting the provider. Make only one worker own an attempt.
4. Unknown results require reconciliation before retry. Accepted requests also require reconciliation. Retry Failed results within a bounded policy, recording attempts and understandable errors per destination. A provider without reliable idempotency must use a conservative unknown-result workflow.
5. Support disconnect, publication pause and cancellation. Programme changes must cancel or replace unsent provider schedules; local database invalidation alone cannot cancel a remote accepted schedule. Keep Published records and surface correction decisions to editors.
6. Run one specifically authorised test post on each initial channel. Add integration tests for partial-channel failure, provider webhooks, uncertain responses and cancellation races before normal publishing.

The included delivery table is a foundation, not a functioning publishing queue. No live posts, background provider retries or remote cancellation are performed by this package.

## Optional AI adapter

Provide only approved public programme fields and verified sermon excerpts with source references. Do not submit member lists, prayer requests, health, donor or disciplinary information. Validate returned caption structure and retain model/version/source metadata. Human approval stays mandatory initially. AI imagery may decorate templates; exact logo and essential text stay in the deterministic renderer.

## Graphic templates

The six initial layouts share one stable visual composition with different editorial headings: invitation, announcement, reminder, ministry, celebration and recap. Programme text is structured and editable through programme records. Birthday, anniversary, scripture and sermon-quote templates need additional approved source fields; they are not generated from assumptions.

Sharp is used for this SVG-only first renderer. Playwright rendering and more varied photo layouts can be added in a dedicated worker once runtime limits and licensed fonts are verified. No realistic AI portraits are produced.
