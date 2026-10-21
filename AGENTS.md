# AGENTS.md

## Scope

These instructions apply to the entire WoofDesk frontend repository. More specific `AGENTS.md` files override this file within their directories.

Use this repository as the source of truth. Before creating a new solution, inspect the nearest route and one or two similar implementations. Reuse existing components, schemas, request functions, query keys, providers, stores, utilities, and conventions when appropriate. Do not turn an ambiguous local pattern into a repository-wide convention.

## Toolchain

- Use pnpm, Next.js App Router, React 19, and strict TypeScript.
- Use the versions declared in `package.json`: Node `>=24.10.0`, pnpm package manager `10.6.1`, and pnpm engine `>=9.15.4`.
- Primary commands are `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm start`, `pnpm format`, and `pnpm format:check`.
- Use the configured `@/...` alias for cross-directory imports. Relative imports are acceptable for nearby modules within the same feature.
- Do not replace pnpm with npm, Yarn, or another package manager.

## Structure and architecture

- `src/app/`: App Router pages, layouts, metadata, loading/error boundaries, and route groups.
  - `(auth)`: authentication routes that must not render authenticated application chrome.
  - `(general)`: authenticated application routes. Shared application navigation belongs in this route group's layout.
- `src/components/`: shared and domain UI components.
- `src/components/layout/`: reusable application-shell and layout components.
- `src/components/shadcn/`: local shadcn/Radix wrappers adapted to DaisyUI.
- `src/features/`: domain schemas, types, request/query logic, and feature UI.
- `src/lib/`: generic helpers, the Axios client, query/error utilities, and shared infrastructure types.
- `src/providers/`: application-wide React providers.
- `src/stores/`: Zustand state shared across client-component boundaries.
- `src/env/`: Zod-backed environment-variable schemas and validated accessors.
- `src/utils/`: compatibility exports and generic utilities that do not belong to a domain.
- `public/`: static assets.

Preserve the App Router structure and route groups. Keep layouts and pages as Server Components by default. Add `"use client"` only at the smallest entry boundary that needs state, effects, event handlers, browser APIs, Zustand, React Query hooks, or navigation hooks such as `usePathname`.

Prefer extending an existing component, schema, request function, provider, store, or utility over creating a parallel implementation. Do not introduce a new architectural layer without a concrete requirement.

## React and Next.js

- Derive values during render or from query/form state instead of duplicating them in local state.
- Do not use `useEffect` to synchronize values that can be derived directly.
- Keep logically related state cohesive. Avoid many independent `useState` values for one transition or workflow, but do not overengineer simple state.
- Keep server/API state in TanStack React Query. Do not copy query results into local state unless the user is editing a deliberate local draft.
- Reuse existing query keys, request functions, loading states, error states, and invalidation paths.
- When changing a query key, inspect every reader, cache update, removal, and invalidation that depends on it.
- Use React Hook Form with `zodResolver` for forms when the surrounding feature follows that pattern.
- Prefer composition and explicit component variants over components with many boolean props.
- Avoid premature `useMemo`, `useCallback`, `memo`, custom hooks, compound components, and generic abstractions. Add them only for a demonstrated performance, identity, reuse, or clarity requirement.
- Hoist static configuration and static JSX outside components when it improves clarity and avoids repeated allocation.
- Do not define components inside other components.
- Use `next/link` for internal navigation and Next.js image primitives when image optimization is applicable.
- Do not perform broad component splitting or refactoring unless required by the task.

## Navigation and application shell

- All routes inside `src/app/(general)/` inherit the shared application shell from that route group's layout.
- Keep navigation configuration in one source of truth; desktop and mobile variants must render from the same data.
- Use semantic landmarks: `<aside>`, `<nav>`, `<main>`, and `<header>` where appropriate.
- Use real links for navigation and real buttons for actions. Do not use clickable `div` elements.
- Identify the active route with visible styling and `aria-current="page"`.
- Active matching must support nested detail routes without incorrectly activating unrelated routes.
- Desktop navigation must remain usable at short viewport heights. Mobile navigation must use an accessible drawer/sheet, close after navigation, and avoid horizontal overflow.
- Hardcoded organization or user information must be isolated so it can be replaced by session/API data without rewriting the presentation.

## TypeScript and Zod

- Preserve `strict: true` and fix the cause of type errors.
- Do not use `any`, `@ts-ignore`, or unsafe assertions merely to silence TypeScript.
- Infer domain types from existing Zod schemas with `z.infer` when available.
- Reuse existing domain types instead of creating duplicate shapes.
- Treat API responses, route parameters, query parameters, form values, storage values, and other external input as untrusted.
- Parse API responses with Zod where the surrounding feature establishes that pattern.
- Preserve backend field names at the API boundary. Map them explicitly to UI-friendly names when needed instead of silently changing the contract.
- Keep domain schemas and types next to the feature that consumes them.

## Comments

- Write comments in English.
- Add a brief comment only when logic, constraints, invariants, security reasoning, or tradeoffs are not evident at first glance.
- Explain why the implementation exists; do not narrate obvious code line by line.
- Do not leave commented-out implementations, temporary debugging code, or stale TODOs without a concrete follow-up.

## API and data access

- This frontend has no database, ORM, or repository layer. Do not describe or design it as if it does.
- Use the shared Axios client from `src/lib/http/client.ts` for new API work rather than creating ad hoc clients.
- Build API URLs from validated environment accessors in `src/env/`.
- Authenticated browser requests must use the established credential/cookie behavior.
- Keep read/query functions, schemas, and query keys with the relevant feature.
- Keep write mutations with the relevant feature or page unless a concrete reuse requirement justifies extraction.
- Use TanStack React Query for request state and invalidate every affected existing key after successful writes.
- Do not invent a global query-key factory, API envelope, or service layer as part of an unrelated change.
- Client validation is not authorization. Every sensitive operation must also be authorized by the backend.

## Authentication, authorization, and security

- Reuse the existing client, server, and common session helpers and preserve their boundaries.
- Authentication and authorization are separate. Hiding a control in the UI is not sufficient authorization.
- Preserve cookie, session, permission, and organization-scoping checks. Never trust a client-provided identity, organization ID, role, or permission without backend validation.
- If nearby authorization behavior is incomplete or contradictory, report it instead of silently choosing the least restrictive behavior.
- Never expose server-only environment variables, API keys, credentials, cookies, access tokens, or secrets in Client Components, logs, public files, or `NEXT_PUBLIC_*` variables.
- A `NEXT_PUBLIC_*` variable is public browser data.
- Do not import secret-dependent modules from a client boundary.
- Validate uploads by size, MIME type, and extension when uploads are introduced.
- Validate untrusted redirect targets, URL segments, query parameters, route parameters, and request values where injection or open redirects are possible.
- Avoid `dangerouslySetInnerHTML`. Use it only for a reviewed requirement with explicit sanitization.
- Do not copy an insecure implementation solely because similar code already exists.

## Environment variables

- Use `src/env/client.mjs`, `src/env/server.mjs`, and `src/env/schema.mjs`; do not read `process.env` ad hoc when a validated accessor exists.
- Add new variables to the correct Zod schema and environment mapping.
- Never convert a server-only variable to `NEXT_PUBLIC_*` for convenience.
- Do not assume a variable is optional merely because it is absent from `.env.example`.
- Do not print environment values during debugging or validation.

## Error and loading states

- Reuse `ServerError`, `getErrorMessage`, `ErrorAlert`, Sonner, and existing loading components where appropriate.
- Follow the surrounding feature's inline-error or toast behavior instead of adding another notification system.
- Every asynchronous user action must expose a pending state, prevent accidental duplicate submission when needed, and show a useful error state.
- Do not silently swallow errors. Preserve useful backend messages while avoiding disclosure of secrets, stack traces, or sensitive internals.
- API error shapes can vary by endpoint; do not impose a new global error envelope during an unrelated task.
- Do not introduce monitoring services solely to satisfy this document.

## Tailwind, DaisyUI, and UI

- Use Tailwind CSS v4, DaisyUI v5 semantic theme classes, and the local shadcn/Radix wrappers already configured in the repository.
- Reuse existing components, form helpers, primitives, theme classes, and nearby UI patterns before creating raw replacements.
- Use semantic colors such as `primary`, `secondary`, `accent`, `neutral`, `base-*`, and state colors. Do not hardcode hex colors inside components.
- Use Tailwind's standard spacing, sizing, radius, and typography tokens. Arbitrary values are acceptable only when required by an explicit design measurement or technical constraint.
- Keep design tokens and global component overrides in `src/app/globals.css`; keep feature-specific layout in component classes.
- Prefer utility classes in components over new global selectors.
- Use Lucide for interface iconography and `cn` from `@/lib/cn` for conditional class composition.
- Follow the configured Prettier Tailwind class ordering.
- Preserve visible keyboard focus. If a library's default focus treatment is replaced, provide a clear accessible alternative.
- Associate labels with controls, expose validation state accessibly, and use ARIA only when native semantics are insufficient.
- Maintain readable contrast, responsive hierarchy, touch targets, and no unintended horizontal scrolling.
- Match the established Pen design when it is the requested source of truth, while preserving accessibility and responsive behavior.

## Zustand and client state

- Use Zustand only for client state shared across component boundaries.
- Keep ephemeral local interaction state inside the component that owns it.
- Subscribe to the smallest store slice needed by a component.
- Do not store React Query server data in Zustand.
- Store actions must express meaningful state transitions and remain independent of presentation details.

## Simplicity and scope control

- Prefer the smallest maintainable change that fully solves the request; follow YAGNI.
- Do not add utilities, hooks, services, components, or abstractions for hypothetical future use.
- Avoid excessive indirection and repository-wide refactors unless explicitly requested.
- Do not modify unrelated files or fix unrelated pre-existing warnings during a focused task.
- Do not perform repository-wide formatting or cleanup during a focused task.
- Preserve public identifiers, route names, and filenames unless the task includes a coordinated rename and all consumers are updated.
- Investigation, diagnosis, explanation, and review requests are read-only unless the user explicitly requests changes.

## Generated files and documentation

- Never edit `.next/`, generated build output, dependency files inside `node_modules/`, or other generated artifacts directly.
- Edit source files or generator inputs instead.
- Keep `AGENTS.md` and `AGENTS_ES.md` semantically synchronized when changing repository instructions.
- Treat README and documentation as supporting context; verify runtime behavior from source and configuration.

## Local skills

- `security-review`: use for authentication, authorization, inputs, uploads, secrets, endpoints, or sensitive data.
- `settings-catalog-crud`: use for administrative catalogs; adapt its contract to the grooming-management domain and never invent endpoints.
- `vercel-composition-patterns`: use when designing reusable component APIs or refactoring component composition.
- `vercel-react-best-practices`: use whenever writing or reviewing React/Next.js code.

Read the selected skill's complete `SKILL.md` before making task changes and follow its referenced instructions as required.

## Before implementing

For non-trivial work:

1. Inspect the relevant files and search for one or two nearby implementations of the same pattern.
2. Reuse existing components, schemas, request functions, query keys, stores, error patterns, and conventions where appropriate.
3. If a similar pattern is not appropriate, identify the concrete reason for using a different approach.
4. Check client/server boundaries, responsive behavior, state ownership, validation, authentication, authorization, accessibility, and security implications.
5. Implement the smallest change that completely satisfies the request.

## Validation

Run checks from the repository root using the declared Node and pnpm versions. For code changes, run the relevant subset and normally finish with:

```text
pnpm exec prettier --check <changed-files>
git diff --check
pnpm typecheck
pnpm lint
pnpm build
```

Run `pnpm build` when a change affects runtime behavior, routing, bundling, environment handling, or production compilation.

There is currently no automated test suite. State what still requires manual verification. The repository can contain pre-existing warnings; do not fix them incidentally. Compare results with the baseline, distinguish new failures from existing ones, and never claim that a command passed if it failed or was not run.

## Final response

After implementation, briefly report:

- what changed and any important decision;
- any intentional deviation from a nearby pattern and why;
- files modified;
- validation commands and their real outcomes;
- unresolved issues or manual verification still required.

Keep the handoff concise and omit unrelated explanation.
