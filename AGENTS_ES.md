# AGENTS_ES.md

## Alcance

Estas instrucciones aplican a todo el repositorio frontend de WoofDesk. Los archivos `AGENTS.md` más específicos reemplazan este archivo dentro de sus directorios.

Usá este repositorio como fuente de verdad. Antes de crear una solución nueva, revisá la ruta más cercana y una o dos implementaciones similares. Reutilizá componentes, schemas, funciones de requests, query keys, providers, stores, utilidades y convenciones existentes cuando sean apropiados. No conviertas un patrón local ambiguo en una convención para todo el repositorio.

## Herramientas y versiones

- Usá pnpm, Next.js App Router, React 19 y TypeScript estricto.
- Usá las versiones declaradas en `package.json`: Node `>=24.10.0`, pnpm package manager `10.6.1` y pnpm engine `>=9.15.4`.
- Los comandos principales son `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm start`, `pnpm format` y `pnpm format:check`.
- Usá el alias configurado `@/...` para imports entre carpetas. Los imports relativos son aceptables para módulos cercanos dentro de la misma feature.
- No reemplaces pnpm por npm, Yarn u otro package manager.

## Estructura y arquitectura

- `src/app/`: páginas, layouts, metadata, límites de loading/error y route groups de App Router.
  - `(auth)`: rutas de autenticación que no deben renderizar la estructura de la aplicación autenticada.
  - `(general)`: rutas de la aplicación autenticada. La navegación compartida pertenece al layout de este route group.
- `src/components/`: componentes compartidos y de dominio.
- `src/components/layout/`: componentes reutilizables de layout y estructura de la aplicación.
- `src/components/shadcn/`: wrappers locales de shadcn/Radix adaptados a DaisyUI.
- `src/features/`: schemas, tipos, lógica de requests/queries y UI de cada dominio.
- `src/lib/`: helpers genéricos, cliente Axios, utilidades de queries/errores y tipos compartidos de infraestructura.
- `src/providers/`: providers globales de la aplicación.
- `src/stores/`: estado Zustand compartido entre Client Components.
- `src/env/`: schemas de variables de entorno respaldados por Zod y accessors validados.
- `src/utils/`: exports de compatibilidad y utilidades genéricas que no pertenecen a un dominio.
- `public/`: archivos estáticos.

Conservá la estructura de App Router y sus route groups. Mantené layouts y páginas como Server Components por defecto. Agregá `"use client"` únicamente en el límite de entrada más pequeño que necesite estado, effects, event handlers, APIs del navegador, Zustand, hooks de React Query o hooks de navegación como `usePathname`.

Preferí extender un componente, schema, función de request, provider, store o utilidad existente antes que crear una implementación paralela. No introduzcas una nueva capa arquitectónica sin un requisito concreto.

## React y Next.js

- Derivá valores durante el render o desde el estado de queries/forms en lugar de duplicarlos en estado local.
- No uses `useEffect` para sincronizar valores que se pueden derivar directamente.
- Mantené cohesivo el estado relacionado lógicamente. Evitá muchos `useState` independientes para una misma transición o flujo, sin sobrearquitectar estados simples.
- Mantené el estado del servidor/API en TanStack React Query. No copies resultados de queries a estado local salvo que el usuario esté editando un borrador local deliberado.
- Reutilizá query keys, funciones de request, estados de loading/error y rutas de invalidación existentes.
- Cuando cambies una query key, revisá todos los lectores, actualizaciones de caché, eliminaciones e invalidaciones que dependan de ella.
- Usá React Hook Form con `zodResolver` para formularios cuando la feature cercana siga ese patrón.
- Preferí composición y variantes explícitas antes que componentes con muchas props booleanas.
- Evitá `useMemo`, `useCallback`, `memo`, hooks personalizados, compound components y abstracciones genéricas prematuras. Agregalos solo por una necesidad demostrada de rendimiento, identidad, reutilización o claridad.
- Mové configuraciones y JSX estático fuera de los componentes cuando mejore la claridad y evite asignaciones repetidas.
- No definas componentes dentro de otros componentes.
- Usá `next/link` para navegación interna y las primitivas de imágenes de Next.js cuando corresponda optimización.
- No dividas ni refactorices componentes de forma amplia salvo que la tarea lo requiera.

## Navegación y estructura de la aplicación

- Todas las rutas dentro de `src/app/(general)/` heredan la estructura compartida desde el layout de ese route group.
- Mantené la configuración de navegación en una sola fuente de verdad; las variantes desktop y mobile deben usar los mismos datos.
- Usá landmarks semánticos: `<aside>`, `<nav>`, `<main>` y `<header>` cuando corresponda.
- Usá links reales para navegar y botones reales para acciones. No uses `div` clickeables.
- Identificá la ruta activa con estilos visibles y `aria-current="page"`.
- El matching activo debe soportar rutas de detalle anidadas sin activar rutas no relacionadas.
- La navegación desktop debe funcionar en viewports de poca altura. La navegación mobile debe usar un drawer/sheet accesible, cerrarse después de navegar y evitar scroll horizontal.
- Los datos hardcodeados de organización o usuario deben estar aislados para poder reemplazarlos por sesión/API sin reescribir la presentación.

## TypeScript y Zod

- Conservá `strict: true` y corregí la causa de los errores de tipos.
- No uses `any`, `@ts-ignore` ni assertions inseguras solo para silenciar TypeScript.
- Inferí tipos de dominio desde schemas Zod existentes mediante `z.infer` cuando estén disponibles.
- Reutilizá tipos de dominio existentes en lugar de crear shapes duplicados.
- Tratá respuestas de API, parámetros de ruta, query params, valores de formularios, almacenamiento y otras entradas externas como datos no confiables.
- Parseá respuestas de API con Zod cuando la feature cercana establezca ese patrón.
- Conservá los nombres de campos del backend en el límite de la API. Mapealos explícitamente a nombres amigables para la UI cuando sea necesario, sin cambiar silenciosamente el contrato.
- Mantené schemas y tipos de dominio junto a la feature que los consume.

## Comentarios

- Escribí los comentarios en inglés.
- Agregá un comentario breve solo cuando la lógica, restricciones, invariantes, razonamiento de seguridad o tradeoffs no sean evidentes a primera vista.
- Explicá por qué existe la implementación; no narres código obvio línea por línea.
- No dejes implementaciones comentadas, código temporal de debugging ni TODOs obsoletos sin un seguimiento concreto.

## API y acceso a datos

- Este frontend no tiene base de datos, ORM ni repository layer. No lo describas ni diseñes como si los tuviera.
- Usá el cliente Axios compartido de `src/lib/http/client.ts` para nuevo trabajo de API en lugar de crear clientes ad hoc.
- Construí las URLs de API desde los accessors validados de `src/env/`.
- Las solicitudes autenticadas del navegador deben conservar el comportamiento establecido de credenciales/cookies.
- Mantené funciones de lectura/queries, schemas y query keys junto a la feature correspondiente.
- Mantené las mutaciones de escritura junto a la feature o página correspondiente salvo que una necesidad concreta de reutilización justifique extraerlas.
- Usá TanStack React Query para el estado de requests e invalidá todas las keys existentes afectadas después de escrituras exitosas.
- No inventes una fábrica global de query keys, envelope de API o service layer como parte de un cambio no relacionado.
- La validación del cliente no es autorización. Toda operación sensible también debe ser autorizada por el backend.

## Autenticación, autorización y seguridad

- Reutilizá los helpers de sesión client, server y common existentes y conservá sus límites.
- Autenticación y autorización son conceptos separados. Ocultar un control en la UI no es autorización suficiente.
- Conservá las verificaciones de cookies, sesión, permisos y alcance de organización. Nunca confíes en una identidad, organization ID, rol o permiso enviado por el cliente sin validación del backend.
- Si la autorización cercana está incompleta o es contradictoria, informalo en lugar de elegir silenciosamente el comportamiento menos restrictivo.
- Nunca expongas variables de entorno server-only, API keys, credenciales, cookies, access tokens ni secretos en Client Components, logs, archivos públicos o variables `NEXT_PUBLIC_*`.
- Una variable `NEXT_PUBLIC_*` es información pública del navegador.
- No importes módulos que dependen de secretos desde un límite cliente.
- Validá uploads por tamaño, MIME type y extensión cuando se incorporen.
- Validá destinos de redirección, segmentos de URL, query params, route params y valores de requests no confiables cuando sean posibles inyecciones u open redirects.
- Evitá `dangerouslySetInnerHTML`. Usalo únicamente ante un requisito revisado y con sanitización explícita.
- No copies una implementación insegura únicamente porque exista código similar.

## Variables de entorno

- Usá `src/env/client.mjs`, `src/env/server.mjs` y `src/env/schema.mjs`; no leas `process.env` de forma ad hoc cuando exista un accessor validado.
- Agregá nuevas variables al schema Zod y al mapeo de entorno correspondientes.
- Nunca conviertas una variable server-only en `NEXT_PUBLIC_*` por comodidad.
- No asumas que una variable es opcional únicamente porque no aparezca en `.env.example`.
- No imprimas valores de entorno durante debugging o validación.

## Estados de error y carga

- Reutilizá `ServerError`, `getErrorMessage`, `ErrorAlert`, Sonner y los componentes de loading existentes cuando corresponda.
- Seguí el comportamiento de error inline o toast de la feature cercana en lugar de agregar otro sistema de notificaciones.
- Toda acción asíncrona iniciada por el usuario debe mostrar un estado pendiente, impedir envíos duplicados accidentales cuando corresponda y mostrar un error útil.
- No ignores errores silenciosamente. Conservá mensajes útiles del backend sin revelar secretos, stack traces ni detalles internos sensibles.
- Las formas de error de API pueden variar por endpoint; no impongas un nuevo envelope global durante una tarea no relacionada.
- No incorpores servicios de monitoreo únicamente para satisfacer este documento.

## Tailwind, DaisyUI y UI

- Usá Tailwind CSS v4, clases semánticas del tema DaisyUI v5 y los wrappers locales de shadcn/Radix ya configurados.
- Reutilizá componentes, helpers de formularios, primitivas, clases del tema y patrones de UI cercanos antes de crear reemplazos con HTML crudo.
- Usá colores semánticos como `primary`, `secondary`, `accent`, `neutral`, `base-*` y colores de estado. No hardcodees colores hexadecimales dentro de componentes.
- Usá los tokens estándar de spacing, sizing, radius y tipografía de Tailwind. Los valores arbitrarios son aceptables únicamente cuando los requiere una medida explícita de diseño o una restricción técnica.
- Mantené tokens de diseño y overrides globales de componentes en `src/app/globals.css`; mantené el layout específico de una feature en las clases de su componente.
- Preferí utilities dentro de componentes antes que nuevos selectores globales.
- Usá Lucide para iconografía y `cn` desde `@/lib/cn` para componer clases condicionales.
- Respetá el orden de clases Tailwind configurado por Prettier.
- Conservá un foco de teclado visible. Si reemplazás el tratamiento de foco de una librería, proporcioná una alternativa accesible y clara.
- Asociá labels con controles, exponé el estado de validación de forma accesible y usá ARIA solo cuando la semántica nativa no sea suficiente.
- Conservá contraste legible, jerarquía responsive, targets táctiles y evitá scroll horizontal no intencional.
- Respetá el diseño establecido en Pen cuando sea la fuente solicitada, conservando accesibilidad y comportamiento responsive.

## Zustand y estado de cliente

- Usá Zustand únicamente para estado cliente compartido entre componentes.
- Conservá el estado efímero de interacción dentro del componente que lo posee.
- Suscribite al fragmento más pequeño del store que necesite cada componente.
- No guardes datos de servidor de React Query dentro de Zustand.
- Las acciones del store deben expresar transiciones de estado significativas y ser independientes de detalles de presentación.

## Simplicidad y control de alcance

- Preferí el cambio mantenible más pequeño que resuelva completamente la solicitud; seguí YAGNI.
- No agregues utilidades, hooks, servicios, componentes ni abstracciones para usos futuros hipotéticos.
- Evitá indirection excesiva y refactors de todo el repositorio salvo pedido explícito.
- No modifiques archivos no relacionados ni arregles warnings preexistentes durante una tarea enfocada.
- No hagas formateo o limpieza de todo el repositorio durante una tarea enfocada.
- Conservá identificadores públicos, nombres de rutas y nombres de archivos salvo que la tarea incluya un rename coordinado y se actualicen todos los consumidores.
- Las solicitudes de investigación, diagnóstico, explicación y revisión son de solo lectura salvo que el usuario pida cambios explícitamente.

## Archivos generados y documentación

- Nunca edites directamente `.next/`, outputs generados, archivos de dependencias dentro de `node_modules/` ni otros artefactos generados.
- Editá archivos fuente o inputs del generador.
- Mantené `AGENTS.md` y `AGENTS_ES.md` sincronizados semánticamente al cambiar instrucciones del repositorio.
- Tratá README y documentación como contexto complementario; verificá el comportamiento real desde el código y la configuración.

## Skills locales

- `security-review`: usala para autenticación, autorización, inputs, uploads, secretos, endpoints o datos sensibles.
- `settings-catalog-crud`: usala para catálogos administrativos; adaptá su contrato al dominio de gestión de peluquerías y nunca inventes endpoints.
- `vercel-composition-patterns`: usala al diseñar APIs de componentes reutilizables o refactorizar composición.
- `vercel-react-best-practices`: usala siempre que escribas o revises código React/Next.js.

Leé el `SKILL.md` completo de la skill seleccionada antes de modificar la tarea y seguí sus referencias cuando corresponda.

## Antes de implementar

Para trabajo no trivial:

1. Revisá los archivos relevantes y buscá una o dos implementaciones cercanas del mismo patrón.
2. Reutilizá componentes, schemas, funciones de request, query keys, stores, patrones de error y convenciones existentes cuando corresponda.
3. Si un patrón similar no es apropiado, identificá el motivo concreto para usar otra alternativa.
4. Revisá límites client/server, comportamiento responsive, propiedad del estado, validación, autenticación, autorización, accesibilidad e implicaciones de seguridad.
5. Implementá el cambio más pequeño que satisfaga completamente la solicitud.

## Validación

Ejecutá las verificaciones desde la raíz del repositorio usando las versiones declaradas de Node y pnpm. Para cambios de código, ejecutá el subconjunto relevante y normalmente terminá con:

```text
pnpm exec prettier --check <archivos-modificados>
git diff --check
pnpm typecheck
pnpm lint
pnpm build
```

Ejecutá `pnpm build` cuando un cambio afecte comportamiento en runtime, routing, bundling, variables de entorno o compilación de producción.

Actualmente no hay una suite automatizada de tests. Indicá qué requiere verificación manual. El repositorio puede contener warnings preexistentes; no los arregles incidentalmente. Compará los resultados con el baseline, distinguí fallas nuevas de las existentes y nunca afirmes que un comando pasó si falló o no se ejecutó.

## Respuesta final

Después de implementar, informá brevemente:

- qué cambió y cualquier decisión importante;
- cualquier desviación intencional de un patrón cercano y por qué fue necesaria;
- archivos modificados;
- comandos de validación ejecutados y sus resultados reales;
- problemas pendientes o verificaciones manuales necesarias.

Mantené el cierre conciso y omití explicaciones no relacionadas.
