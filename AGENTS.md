# AGENTS.md

## Scope

Estas instrucciones aplican a todo este frontend. Los `AGENTS.md` más cercanos pueden agregar reglas específicas para una carpeta.

Usá este repositorio como fuente de verdad. Antes de crear una solución nueva, revisá una o dos implementaciones cercanas y reutilizá sus componentes, schemas, queries y convenciones.

## Toolchain

- Usá pnpm, Next.js App Router y TypeScript estricto.
- La versión mínima esperada es Node 24.10 y pnpm 9.15.
- Los comandos principales son `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm start`.
- Usá el alias `@/` para imports entre carpetas.

## Arquitectura

- `src/app/`: rutas, layouts, metadata y límites de servidor.
- `src/components/`: componentes compartidos y de dominio.
- `src/components/shadcn/`: wrappers shadcn/Radix adaptados a DaisyUI.
- `src/features/`: schemas, tipos, queries y UI de cada dominio.
- `src/lib/`: utilidades genéricas, cliente HTTP y manejo de errores.
- `src/providers/`: providers globales.
- `src/stores/`: estado de cliente compartido con Zustand.
- `src/env/`: variables de entorno validadas con Zod.

Mantené Server Components por defecto. Agregá `"use client"` únicamente en entradas que necesiten estado, efectos, eventos o APIs del navegador.

## React y datos

- Mantené el estado del servidor en TanStack React Query.
- No copies resultados de queries a estado local salvo que exista un borrador editable real.
- Para formularios usá React Hook Form con `zodResolver`.
- Evitá sincronizar estado derivable mediante `useEffect`.
- Preferí composición y variantes explícitas antes que componentes con muchas props booleanas.
- Evitá abstracciones prematuras y componentes genéricos sin un caso concreto.

## TypeScript y Zod

- Conservá `strict: true`; no uses `any` ni assertions para ocultar errores.
- Inferí tipos desde schemas Zod con `z.infer` cuando el dato provenga de formularios o APIs.
- Tratá respuestas, parámetros de URL y entradas de usuario como datos no confiables.
- Los schemas y tipos de dominio viven junto a la feature que los consume.

## API y seguridad

- Usá el cliente Axios de `src/lib/http/client.ts` y `withCredentials: true` para solicitudes autenticadas.
- Nunca leas `process.env` de forma ad hoc si existe un accessor validado en `src/env/`.
- Nunca expongas secretos en variables `NEXT_PUBLIC_*`, logs o Client Components.
- Validación de cliente no equivale a autorización: las operaciones sensibles deben autorizarse también en el servidor/backend.
- Validá uploads por tamaño, MIME y extensión cuando se incorporen.
- No uses `dangerouslySetInnerHTML` sin una necesidad revisada y sanitización explícita.

## UI

- Reutilizá primero los componentes de `src/components/shadcn/` y las clases semánticas de DaisyUI.
- No uses colores hexadecimales dentro de componentes; usá `primary`, `secondary`, `accent`, `neutral`, `base-*` y estados.
- Usá Lucide para iconografía y `cn` para clases condicionales.
- Conservá navegación accesible, foco visible y etiquetas asociadas a los campos.

## Skills locales

- `security-review`: activala al trabajar con autenticación, inputs, uploads, secretos, endpoints o datos sensibles.
- `settings-catalog-crud`: usala al crear catálogos administrativos; adaptá el contrato al dominio de turnos y no inventes endpoints.
- `vercel-composition-patterns`: usala al diseñar APIs de componentes reutilizables.
- `vercel-react-best-practices`: usala al escribir o revisar React/Next.js.

## Validación

Para cambios de código ejecutá, como mínimo:

```text
pnpm exec prettier --check <archivos-modificados>
pnpm typecheck
pnpm lint
pnpm build
```

Informá resultados reales y cualquier verificación manual pendiente.
