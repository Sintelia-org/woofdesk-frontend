---
name: settings-catalog-crud
description: Crear o extender catálogos administrativos del sistema de turnos, incluyendo schemas Zod, tipos, queries, formularios y navegación. Usar para servicios, razas, tamaños, estados u otras entidades configurables; no para una query aislada.
---

# CRUD de catálogos administrativos

Usá esta skill cuando el usuario pida una vista para listar y administrar una entidad configurable. Respetá `AGENTS.md` y seguí el patrón más cercano del repositorio sin introducir una arquitectura paralela.

## Descubrimiento y contrato

1. Buscá la entidad y sus sinónimos en `src/app/`, `src/features/` y la navegación. Reutilizá schemas, tipos, queries, formularios y query keys existentes.
2. Inspeccioná una o dos entidades comparables y conservá su patrón de listado, búsqueda, paginación, modal, errores y metadata.
3. Confirmá cualquier contrato que no pueda deducirse: endpoint, métodos, payload, forma de respuesta y generación de IDs. No inventes el backend.

## Implementación

- Definí el schema Zod junto a la feature e inferí sus tipos con `z.infer`.
- Parseá datos externos antes de usarlos y realizá solicitudes con el cliente Axios compartido.
- Usá TanStack React Query para lectura y mutaciones; invalidá todas las query keys afectadas después de una escritura exitosa.
- Implementá formularios con React Hook Form y `zodResolver`, reutilizando componentes shadcn/DaisyUI.
- Mostrá errores con los helpers existentes y no expongas detalles sensibles.
- Agregá la ruta y navegación sólo cuando formen parte del pedido.
- Autenticación y autorización son responsabilidades separadas; no confíes en IDs o permisos recibidos desde el cliente.

## Cierre

Ejecutá las validaciones indicadas por `AGENTS.md`. Informá qué cambió, qué se verificó y qué falta probar contra el backend. Si el contrato no está confirmado, no describas la integración como funcional.
