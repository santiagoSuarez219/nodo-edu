# spec-013 — [IN PROGRESS] Home privada como grilla de cursos + limpieza de navbar

> Estado `[IN PROGRESS]`: implementación en curso. Rama: `feat/spec-013-home-grilla-cursos`.

## Contexto

`middleware.ts` ya exige sesión activa para todo el sitio salvo `/login`,
`/registro`, `/recuperar-password`, `/auth/callback` y `/api`. Es decir, `/` ya
está protegida de facto: un visitante anónimo que entra a `/` es redirigido a
`/login`. Sin embargo, el contenido de `/` (`app/page.tsx`) sigue siendo la
landing de marketing "opción 1c" (spec-004, `[DONE]`), con hero, carrusel de
cursos de ejemplo, presentación del docente y footer — pensada originalmente
como página de conversión para visitantes, un propósito que ya no cumple
porque nunca la ve un usuario sin sesión.

En paralelo, `components/navbar/Navbar.tsx` (reorientado en spec-006,
`[DONE]`) conserva un enlace "Mis cursos" duplicado: existe tanto en el nivel
superior del navbar (desktop y mobile) como dentro del dropdown `UserMenu`.

Este spec reemplaza la landing de marketing por la home real de la
plataforma: una grilla con los cursos existentes del catálogo
(`lib/courses`), y termina de limpiar el navbar dejando únicamente el logo y
el dropdown de usuario.

## Alcance

### Incluye

- Reescribir `app/page.tsx` (ruta `/`) como grilla de cards de los cursos del
  catálogo de contenido, consumiendo `getAllCourses()` de `lib/courses/index.ts`
  (capa de dominio ya existente, sin cambios).
- Cada card enlaza a `/[courseSlug]` (`app/(cursos)/[courseSlug]/page.tsx`,
  ya protegido por matrícula desde spec-006/007; sin cambios en esa ruta).
- Conservar `LandingFooter` (`components/landing/LandingFooter.tsx`) y sus
  datos (`FOOTER_LINKS`) sin cambios de diseño ni de props, renderizado al
  final de la nueva home.
- Eliminar de `components/navbar/Navbar.tsx` el `<li>` "Mis cursos" del nivel
  superior (desktop y mobile); el acceso a "Mis cursos" queda únicamente
  dentro del dropdown `UserMenu`, que no cambia.
- Cambiar el `href` del logo del navbar de `/cuenta/cursos` a `/` (nueva home).
- Eliminar `components/landing/` y `lib/landing/` salvo `LandingFooter.tsx` y
  el tipo/dato `FOOTER_LINKS` que sigue en uso (mover o dejar en su lugar
  actual, ajustando los barrels `index.ts` de ambas carpetas para exportar
  solo lo que sobrevive).
- Actualizar `export const metadata` de `app/page.tsx` para reflejar que es
  el catálogo/home interno, no una landing pública de SEO.

### No incluye

- Cambios en `middleware.ts` (la protección de `/` ya existe).
- Cambios en `app/cuenta/cursos/page.tsx` ("Mis cursos"): sigue siendo la
  página de matrícula y seguimiento de notas, sin relación con la grilla de
  home. Se confirmó con el usuario que la grilla de home muestra el catálogo
  completo de cursos, no solo los matriculados.
- Migrar `lib/courses/data/*.ts` a JSON plano: se confirmó con el usuario
  mantener los objetos TypeScript tipados existentes (con sus validaciones
  de build en `lib/courses/index.ts`); no se crea ningún archivo de datos
  nuevo.
- Cambios en `components/navbar/UserMenu.tsx` (el dropdown ya contiene "Mis
  cursos", "Mi cuenta" y "Cerrar sesión"; no se modifica su contenido).
- Una landing pública de marketing para visitantes anónimos. Si se necesita
  en el futuro, es un spec nuevo que reconstruye esa experiencia desde cero.
- Cambios en `app/(cursos)/[courseSlug]/page.tsx` ni en el gate de matrícula.

## Impacto en el sistema

**Frontend público**
- `app/page.tsx` — reescritura completa: elimina imports de
  `components/landing` (salvo `LandingFooter`) y de `lib/landing` (salvo
  `FOOTER_LINKS`); pasa a ser un server component que llama a
  `getAllCourses()` y renderiza la grilla + footer.
- Nuevo `components/home/CourseGrid.tsx` — grilla responsive de cards.
- Nuevo `components/home/HomeCourseCard.tsx` — card individual por curso.

**Navbar**
- `components/navbar/Navbar.tsx`:
  - `href` del logo: `/cuenta/cursos` → `/`.
  - Elimina el `<ul>` desktop con el `<li>` "Mis cursos" (nivel superior).
  - Elimina el `<li>` "Mis cursos" duplicado del menú mobile.
  - La variable `misCursosHref` se sigue calculando (la sigue usando
    `UserMenu`), solo deja de usarse en el JSX propio del `Navbar`.
- `components/navbar/UserMenu.tsx` — sin cambios.

**Capa de datos**
- `lib/courses/*` — sin cambios de código; fuente de datos de la grilla vía
  `getAllCourses()`.
- `lib/landing/data.ts`, `lib/landing/types.ts` — se eliminan salvo lo
  relacionado con `FOOTER_LINKS` (tipo `FooterLink` y el dato en sí).
  `lib/landing/index.ts` se ajusta para exportar solo lo que sobrevive.
- `components/landing/Hero.tsx`, `CourseScroller.tsx`, `HowItWorks.tsx`,
  `TeacherBar.tsx`, `CourseCard.tsx`, `LevelBadge.tsx`, `ProgressBar.tsx`,
  `ResumeCard.tsx` — se eliminan. `LandingFooter.tsx` se conserva.
  `components/landing/index.ts` se ajusta para exportar solo `LandingFooter`.

**Middleware / Auth**
- `middleware.ts` — sin cambios (ya protege `/`).

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación según los criterios de `CLAUDE.md`:

- *¿Expone datos que un agente consultaría?* No: `getAllCourses()` ya es una
  función de solo lectura interna, sin API pública nueva; no se introduce un
  dominio de datos nuevo.
- *¿Permite acciones que un agente ejecutaría?* No: no hay operaciones de
  escritura nuevas.
- *¿Existe un MCP relacionado que extender?* No. Los MCPs activos
  (`question-bank-mcp`, `attendance-mcp`) cubren dominios distintos
  (evaluaciones y asistencia), sin relación con navegación o catálogo.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No.

No se añade fase de MCP.

## Fases de implementación

### Fase 1 — Limpieza de navbar
- [ ] Editar `components/navbar/Navbar.tsx`: cambiar `href` del logo a `/`.
- [ ] Eliminar el `<ul>` desktop "Mis cursos" (nivel superior).
- [ ] Eliminar el `<li>` "Mis cursos" duplicado del menú mobile.
- [ ] Confirmar que `UserMenu.tsx` sigue recibiendo `misCursosHref`
      correctamente sin cambios.

### Fase 2 — Nueva home (grilla de cursos)
- [ ] Crear `components/home/CourseGrid.tsx` y `components/home/HomeCourseCard.tsx`.
- [ ] Reescribir `app/page.tsx` como server component: `getAllCourses()` +
      render de la grilla + `LandingFooter` al final.
- [ ] Cada card enlaza a `/[courseSlug]`.
- [ ] Actualizar `metadata` de `app/page.tsx`.

### Fase 3 — Retiro de la landing de marketing
- [ ] Eliminar `components/landing/Hero.tsx`, `CourseScroller.tsx`,
      `HowItWorks.tsx`, `TeacherBar.tsx`, `CourseCard.tsx`, `LevelBadge.tsx`,
      `ProgressBar.tsx`, `ResumeCard.tsx`.
- [ ] Eliminar `lib/landing/data.ts` y `lib/landing/types.ts` salvo
      `FooterLink`/`FOOTER_LINKS`.
- [ ] Ajustar `components/landing/index.ts` y `lib/landing/index.ts` para
      exportar solo `LandingFooter`/`FOOTER_LINKS`.

## Criterios de aceptación

- Un usuario sin sesión que visita `/` es redirigido a `/login` (comportamiento
  ya existente vía middleware, se verifica que sigue intacto).
- Un usuario con sesión que visita `/` ve una grilla con una card por cada
  curso de `getAllCourses()` (hoy: Estructuras de datos, Programación
  científica, Análisis de algoritmos), con footer al final.
- Al hacer clic en una card, el usuario navega a `/[courseSlug]`. Si no está
  matriculado, el gate existente lo redirige a
  `/cuenta/cursos?sinAcceso={slug}` (comportamiento ya existente, sin cambios).
- El navbar muestra únicamente logo + dropdown de usuario (o botón "Iniciar
  sesión" si no hay sesión); no hay ningún enlace de nivel superior fuera de
  eso, en desktop ni en mobile.
- El logo del navbar enlaza a `/`.
- El dropdown de usuario (`UserMenu`) sigue ofreciendo "Mis cursos", "Mi
  cuenta" y "Cerrar sesión" sin cambios.
- `/cuenta/cursos` sigue funcionando igual que antes (matrícula + notas).
- No quedan referencias a `components/landing/Hero`, `CourseScroller`,
  `HowItWorks`, `TeacherBar`, `CourseCard`, `LevelBadge`, `ProgressBar`,
  `ResumeCard` en el código.
- `npm run build` y `npm run lint` pasan sin errores.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-013-home-grilla-cursos.md` — casos `TC-001`
  a `TC-008`.
- **Automáticas (e2e/unit):** no aplica — framework de testing automático aún
  "por definir" (ver sección "Testing" de `CLAUDE.md`).
