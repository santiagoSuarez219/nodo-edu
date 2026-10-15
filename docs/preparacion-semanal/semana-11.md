# Semana 11 — 12–18 oct (PC: jue. 15 oct)

**Rama:** `feat/semana-11-programacion-cientifica`
**Estado:** ⬜ En preparación · ⬜ Mergeada a `development` · ⬜ Desplegada y abierta

> Una ronda cubre **un curso**. Esta semana solo tiene la ronda de `programacion-cientifica`.

---

## Ronda — `programacion-cientifica` (2026-10-15)

**Alcance confirmado por el usuario:** únicamente el **Taller evaluativo 03 — NumPy**
(Momento evaluativo 3, 15 %), con la misma estructura de los talleres evaluativos 01 y 02.
Sin lección teórica, apuntes ni cuestionario: la semana 11 no tiene contenido nuevo
(las lecciones de NumPy son las semanas 9 y 10).

### Sesiones cubiertas

| Sesión | Fecha | Tema | ★/◇ |
|---|---|---|---|
| Sesión evaluativa | jue. 15 oct | Momento evaluativo 3 — NumPy | ★ (15 %) |

### Etapas y aprobaciones

| Etapa | Resultado | Aprobada por el usuario |
|---|---|---|
| E2 · Plan de lección | No aplica — sesión evaluativa | — |
| E3 · Lección `.mdx` + registro TS | No aplica; solo registro de la guía (`order: 8.5`) | — |
| E4 · Apuntes del docente | No pedidos | — |
| E5 · Cuestionario de cierre | No aplica — el taller no lleva cuestionario | — |
| E6 · Guía del estudiante | Sí — taller evaluativo individual | ✅ (pedido directo) |
| E6 · Quiz A/B/C | No | — |

### Artefactos producidos

| Artefacto | Ruta | Publicado |
|---|---|---|
| Guía del estudiante | `content/cursos/programacion-cientifica/guias/taller-evaluativo-03-numpy.md` | ⬜ |
| Registro TS | `lib/courses/data/programacion-cientifica.ts` (`order: 8.5`, `kind: "guide"`) | — |

### Cuestionario de cierre

No aplica.

### Quiz calificable A/B/C

No aplica.

### Decisiones tomadas por Claude en nombre del docente

- **Plazo de entrega: sábado 24 de octubre de 2026** — **motivo:** mismos 9 días que el taller 02; las evaluaciones institucionales son del 16 al 20 de octubre. Confirmado al aprobar el plan de despliegue.
- **Datos sin centinelas en la matriz 5×7** — **motivo:** las lecciones no cubren NaN; el centinela `-999.0` aparece solo en el arreglo 1D del Ejercicio 3 (las lecturas de campaña de SBC-A del taller 02).
- **Taller de siete ejercicios, sin producto punto ni matricial ni `centradas`/`keepdims`** — **motivo:** el usuario retiró esos temas de la evaluación.
- **Rúbrica** (suma 100): Ej. 1 → 10, Ej. 2 → 10, Ej. 3 → 15, Ej. 4 → 15, Ej. 5 y 6 → 20, Ej. 7 → 10, ejecución → 10, documentación → 5, entrega → 5.

### Verificación (E7)

- [x] `npm run build` en verde
- [x] `npm run lint` en verde (0 errores, 10 warnings previos)
- [x] La celda de verificación de la guía pasa con una solución de referencia en Python/NumPy
- [x] Rúbrica suma 100
- [ ] `@reviewer`: no invocado (cambio de contenido de una sola guía; revisión del usuario en el servidor de desarrollo)

---

## Despliegue

| Paso | Estado | Fecha / detalle |
|---|---|---|
| D0 · Alcance y checklist pre-despliegue | ✅ | 2026-10-15: sin cambios de esquema; catálogo prod con órdenes 9, 10 y 11 cerradas, sin filas huérfanas |
| D1 · Lecciones nuevas cerradas por adelantado | ⬜ | No se cierra: el usuario pidió abrirla al desplegar |
| D2 · Merge a `main` y deploy en Vercel | ⬜ | rama `deploy/semana-11` |
| D3 · Banco de preguntas replicado a producción | — | No aplica |
| D4 · Lecciones abiertas a los estudiantes | ⬜ | `programacion-cientifica` → `taller-evaluativo-03-numpy` (nace abierta) |
| D5 · Verificación end-to-end en producción | ⬜ | |
| D6 · Bitácora cerrada y rama `deploy/` borrada | ⬜ | |

- [ ] Verificado que las lecciones de semanas futuras siguen **cerradas** (órdenes 9, 10 y 11)

## Pendientes

- Registrar `feat/semana-11-...` como borrada tras el merge.
