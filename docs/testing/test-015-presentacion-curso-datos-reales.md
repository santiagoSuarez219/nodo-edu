# test-015 — Presentación de curso con datos reales y footer de docente

> Casos manuales de UI para spec-015. Ejecutar en desktop (≥1280px) y en
> móvil (≤480px), en modo claro y modo oscuro salvo que el caso indique otra
> cosa.

## Casos de prueba

### TC-001 — Hero muestra Modalidad, Horas semanales y Horas independientes
**Precondición:** Sesión activa, en `/[courseSlug]/presentacion` de
cualquier curso.
**Pasos:**
1. Observar la fila de metadatos del hero (junto a Créditos).
**Resultado esperado:** Se muestran Créditos, Modalidad, Horas semanales y
Horas de trabajo independiente. Ya NO aparecen Duración, Clases disponibles
ni Cupos.
**Estado:** ✅ Aprobado

### TC-002 — Card de matrícula sin fechas de inscripción, con prerrequisito
**Precondición:** Estar en `/[courseSlug]/presentacion` de cualquier curso.
**Pasos:**
1. Observar la card de matrícula (columna derecha del hero).
**Resultado esperado:** Ya no aparecen las columnas "Inicio" / "Cierre
inscripción". Se muestra el botón CTA (Matricular/Ir al curso) y el
prerrequisito académico del curso (ej. "Lógica de Programación y
Laboratorio" para Estructuras de Datos).
**Estado:** ✅ Aprobado

### TC-003 — No existe sección standalone "Prerrequisitos"
**Precondición:** Estar en `/[courseSlug]/presentacion` de cualquier curso.
**Pasos:**
1. Recorrer la página completa buscando una sección titulada
   "Prerrequisitos".
**Resultado esperado:** No existe esa sección independiente (el
prerrequisito solo aparece en la card de matrícula, TC-002).
**Estado:** ✅ Aprobado

### TC-004 — Temario muestra la semana de cada unidad
**Precondición:** Estar en `/[courseSlug]/presentacion` de cualquier curso.
**Pasos:**
1. Observar la sección "Temario".
**Resultado esperado:** Cada unidad muestra su semana o rango de semanas
(ej. "Semana 1", "Semanas 4-5", "Opcional") junto al número y título de la
unidad.
**Estado:** ✅ Aprobado

### TC-005 — Estructuras de Datos: temario completo con 9 módulos + opcionales
**Precondición:** Estar en `/estructuras-de-datos/presentacion`.
**Pasos:**
1. Revisar la sección "Temario".
**Resultado esperado:** Se listan las 10 unidades: Git y GitHub (Semana 1),
POO clases/UML (Semanas 2-3), POO herencia/diseño avanzado (Semanas 4-5),
Introducción a estructuras (Semanas 6-7), Listas (Semanas 8-10), Manejo de
archivos (Semana 11), Pilas y colas (Semanas 12-13), Recursividad (Semana
14), Árboles (Semanas 15-16), Temas opcionales (Opcional).
**Estado:** ✅ Aprobado

### TC-006 — Estructuras de Datos: evaluación suma 100% y fechas reales
**Precondición:** Estar en `/estructuras-de-datos/presentacion`.
**Pasos:**
1. Revisar la sección "Evaluación": sumar los porcentajes.
2. Revisar la sección "Fechas importantes".
**Resultado esperado:** Los porcentajes de evaluación suman 100% (Momentos
1-5 + Seguimiento). Las fechas importantes son reales de 2026 (ej. "4 ago —
Inicio de clases", "4 sep — Cierre Momento 1...", etc.), no genéricas.
**Estado:** ✅ Aprobado

### TC-007 — Estructuras de Datos: herramientas correctas (Java, no Python)
**Precondición:** Estar en `/estructuras-de-datos/presentacion`.
**Pasos:**
1. Revisar la sección "Herramientas y tecnologías".
**Resultado esperado:** Se muestran herramientas de Java (Java JDK 21,
Visual Studio Code, Git y GitHub). Ya NO aparece Python ni Jupyter Notebook.
**Estado:** ✅ Aprobado

### TC-008 — Bloque de información del docente en los 3 cursos
**Precondición:** Sesión activa, en `/[courseSlug]/presentacion` de
cualquiera de los 3 cursos.
**Pasos:**
1. Recorrer la página hasta el final, después del contenido de la
   presentación y antes o junto al footer.
**Resultado esperado:** Aparece un bloque con la información del docente:
Santiago Suarez Cortes, formación académica, facultad/departamento, grupo
de investigación (MIRP), correo electrónico y oficina. El mismo bloque
aparece igual en los 3 cursos. El `LandingFooter` (enlaces + copyright)
también sigue presente.
**Estado:** ✅ Aprobado

### TC-009 — Condiciones del curso reflejan informacion-transversal.md
**Precondición:** Estar en `/[courseSlug]/presentacion` de cualquier curso.
**Pasos:**
1. Revisar la sección "Condiciones del curso".
**Resultado esperado:** Las condiciones incluyen: política de asistencia
(0.0 por >20% de inasistencias injustificadas), no habilitable, uso de
dispositivos móviles, uso de IA como apoyo, plagio, ponderación 50/50
teórico-práctico. Las mismas condiciones aparecen en los 3 cursos.
**Estado:** ✅ Aprobado

### TC-010 — Vista previa admin sigue funcionando con el nuevo shape de datos
**Precondición:** Sesión de docente/admin, con un curso académico vinculado
a cualquiera de los 3 `course_slug`.
**Pasos:**
1. Ir a `/admin/courses/[academicCourseId]/presentacion`.
**Resultado esperado:** Se muestra la vista previa completa de la
presentación con el nuevo hero, card, temario con semanas, etc. Sin bloque
de información del docente (ese bloque es exclusivo de la ruta pública). CTA
deshabilitado como ya ocurría antes.
**Estado:** ✅ Aprobado
