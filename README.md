# woofdesk

Base frontend para un sistema genérico de gestión de turnos de peluquerías caninas. El proyecto toma como referencia la arquitectura de `gargano-wms-frontend` y usa Next.js App Router, TypeScript, pnpm, DaisyUI y componentes shadcn/Radix.

## Requisitos

- Node.js 24.10 o superior
- pnpm 9.15 o superior

## Inicio

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Comandos

```bash
pnpm dev          # desarrollo
pnpm typecheck    # TypeScript estricto
pnpm lint         # ESLint
pnpm format:check # Prettier
pnpm build        # build de producción
pnpm start        # servidor de producción
```

## Estructura

- `src/app`: rutas y layouts de Next.js.
- `src/components/shadcn`: componentes reutilizables adaptados a DaisyUI.
- `src/features`: schemas, tipos y lógica por dominio.
- `src/lib`: utilidades, errores y cliente HTTP.
- `src/providers`: providers globales de tema, queries y notificaciones.
- `src/stores`: estado compartido de interfaz con Zustand.
- `src/env`: validación Zod de variables de entorno.
- `.agents/skills`: skills heredadas y adaptadas del repositorio de referencia.

## Tema DaisyUI

El tema `woofdesk` usa la paleta diseñada en Pen:

- Primary: `#E98563`
- Secondary: `#D2B493`
- Accent: `#A8B6A0`
- Neutral: `#2E1B13`
- Base 100: `#FFF7EA`
- Base 200: `#F8EDDE`
- Base 300: `#E6D6C5`

Usá clases semánticas como `bg-primary`, `text-base-content` o `border-base-300` en vez de repetir valores hexadecimales dentro de componentes.
