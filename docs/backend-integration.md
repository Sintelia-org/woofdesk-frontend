# Backend integration — WoofDesk

Source reviewed: `../woofdesk-backend/src/main/java/com/peluqueria/turnos`, including controllers, request/response records, services, security configuration and error handler. Reference structure: Gargano's `configuracion/clientes/page.tsx` (SubClientsPage), its request module and `components/modals/settings/subClients.tsx`.

## Implemented screens

| Screen             | Endpoint                                                         | Supported operations                                                                                 |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Clients            | /api/clients                                                     | Paginated search, create, edit, activate, deactivate                                                 |
| Pets               | /api/pets                                                        | Paginated search, create, edit, activate, deactivate                                                 |
| Employees          | /api/employees                                                   | Paginated search, create, edit, activate, deactivate; optional user link                             |
| Users              | /api/users                                                       | Paginated search, create, edit, activate, deactivate, assign password                                |
| Services           | /api/services                                                    | Search, create, edit; displayed as cards                                                             |
| Breeds             | /api/breeds                                                      | Search, read-only catalog                                                                            |
| Roles              | /api/roles                                                       | Read-only catalog and role explanations                                                              |
| Appointments       | /api/appointments                                                | Month/week/day calendar and table, drag rescheduling, detail, create, edit, delete, complete, reopen |
| Agenda             | /api/appointments                                                | Daily grouped cards with the same appointment modals                                                 |
| Summary            | /api/appointments                                                | Today's counts and completed-appointment amounts; not a cash ledger                                  |
| My account         | /api/account/password, /api/account/logout-all                   | Change own password, revoke all sessions                                                             |
| Login and recovery | /api/auth/login, /me, /logout, /forgot-password, /reset-password | Cookie session and password recovery                                                                 |

### Deliberate limits

- Breeds and roles have no write endpoints. Services have no delete or deactivate endpoints. No unsupported controls or fictitious mutations were added.
- There are no inventory, cash-ledger or report endpoints. Navigation no longer advertises those screens.
- `/api/platform/**` provisions organizations with a separate secret key. It is platform administration, not a tenant screen, and is intentionally excluded from the browser application. No platform key is consumed.
- Clients, pets, employees and users use deactivation; their history is retained. Appointment deletion is permanent and requires confirmation.
- The backend's `/me` response provides userId, orgId and role, but no organization handle, user name or organization name. Authenticated routes currently use the numeric orgId in `[org]`; the shell shows actual IDs rather than invented names. A persistent friendly handle/name requires a backend contract extension.
- Date-range filters are organization-local dates and accept at most 62 days inclusive. Displayed times and datetime-local inputs use the device timezone, with an explicit label. Absolute timestamps sent to the backend include a timezone (ISO UTC). The backend preserves the instant and returns the organization's offset. The organization timezone is not exposed by /me; the UI must not guess it.
- Tables sort the loaded page. Catalogs and appointment lists return arrays and use client pagination; other entities use server pagination (API zero-based, UI one-based).

## Structure and behavior

Every CRUD page owns its search, pagination, query, columns and modal selection, following Gargano. Requests and Zod response schemas live in each feature. Entity forms/mutations live in `src/components/modals/{entity}.tsx`, with React Hook Form, zodResolver, pending/disabled actions, inline errors, success feedback and query invalidation. Shared headers and field primitives keep visual consistency without a metadata-driven CRUD engine.

Query keys include the organization ID. SessionGuard waits for /me, handles expired sessions, and redirects a mismatched URL to the authenticated organization. Backend authorization and Hibernate tenant isolation remain the authority. All queries are cleared on login/logout to prevent cached tenant data crossing sessions.

## Roles

- All roles can read clients, pets, services, breeds, roles and appointments.
- ADMIN and RECEPTIONIST can create/edit clients, pets and scheduled appointments and change client/pet activation.
- ADMIN alone manages users, employees and services, completes/reopens/deletes appointments.
- UI controls respect these distinctions. The server enforces the same rules independently.

## API details

- Axios uses the shared client, credentials, and XSRF-TOKEN → X-XSRF-TOKEN.
- Deploy frontend/API so the readable CSRF cookie is available to the frontend (same hostname/proxy or an explicitly configured shared cookie domain). HttpOnly access_token is never read by browser code. Cross-site cookie/CORS deployment needs backend configuration.
- Spring ProblemDetail errors use detail, code and field errors. Error helpers support that shape, preserve actionable validation/conflict messages, and hide server internals.
- DUPLICATE_PHONE requires explicit user confirmation before resending with confirmDuplicate=true.
- Completed appointments cannot be edited/deleted. ADMIN can reopen them first.
- Appointment forms retain the optimistic-lock version and adjustment IDs; discounts and surcharges send full replacement lists. Prices have at most two decimal places and a nonnegative net total.
- Employee and user activation are independent. User passwords are changed separately from profile data.
- Public recovery always shows the same response regardless of whether an email exists.

## Verification

2026-11-10: 43 browser checks passed using an isolated headless Chrome profile and intercepted API fixtures matching the Java DTOs. The checks covered 12 desktop screens, 7 mobile screens at 390px, form validation, client duplicate-phone confirmation, client creation/edit/activation, pet creation with empty optional fields, pet detail, employee/user/service creation, appointment creation/edit/completion, retained appointment version/adjustment IDs, password changes/recovery/reset, login/logout-all, organization mismatch, read-only permissions, drawer navigation and CSRF headers. No browser runtime exceptions were recorded. No writes were sent to the real backend.

TypeScript, production build and changed-file Prettier checks passed. ESLint passed with two pre-existing type-import warnings in the login layout. Backend credentials, database constraints, email delivery, session revocation and deployment cookie/CORS behavior still require a live-backend integration run.

Run `pnpm typecheck`, `pnpm lint`, `pnpm build`, Prettier on changed files and `git diff --check`. Runtime checks must distinguish local fixture tests from live-backend verification. No existing account credentials or external production data should be assumed or modified to test CRUD.

## Appointment calendar

The Turnos screen opens an independently implemented calendar inspired by Untitled UI's public calendar example. Month, week and day views share the existing organization-scoped query, search, state/maintenance filters and entity modals. The table remains available; Agenda keeps its grouped cards. The calendar chunk loads only when its presentation is selected.

Mouse, touch-handle and keyboard drag use `@dnd-kit/core`. Month drops retain the device-local time; timed drops select a half-hour start. A separate edit action provides an alternative to dragging. Completed appointments and read-only roles cannot drag; backend authorization still applies. Creation from an empty cell pre-fills the existing form.

Rescheduling first reads the current detail and then sends a complete PUT, retaining service IDs, prices, notes, adjustment IDs and the optimistic-lock version. The pending projection is derived from mutation state rather than duplicating server data. Controls prevent another move while saving; failures restore the previous position, show the server error and refresh affected appointment queries.

The backend exposes only a start datetime: no duration, end time, employee assignment or occupancy restriction exists. Calendar blocks indicate start time; multiple appointments can share a slot. Do not imply that slot height is service duration. Display and editing use the device timezone and send absolute ISO timestamps. Queries pad the visible date range by two days on each side because API filters use an organization timezone that is not exposed to the browser; returned instants are filtered to the device-local visible range. All calendar requests remain below the 62-day API limit.

Validation uses isolated browser fixtures, never a production account or live backend writes. Live-backend verification remains required for database concurrency, deployment cookies and organization timezone settings.

Calendar verification (2026-11-10): 20 browser checks passed with intercepted DTO fixtures, covering month/week/day rendering, mouse/keyboard/touch drag, preserved full-PUT values and CSRF, pending state, conflict rollback, create/edit/complete/reopen/delete flows, table/Agenda compatibility, search/state filters and desktop/mobile/read-only behavior. No browser runtime exceptions or real-backend writes occurred. Nine additional date checks passed for leap years, month boundaries, local-time preservation, invalid dates and DST gaps. Production build, TypeScript, source formatting and diff checks passed; ESLint reported only the three existing warnings.
