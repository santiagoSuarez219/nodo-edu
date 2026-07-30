# Lab 01 — Repositorio del curso · Guía del docente

## Ficha de la sesión

- **Curso:** Análisis de Algoritmos (virtual, Ingeniería de Sistemas, sin prerrequisitos)
- **Semana / sesión:** Semana 1 (3–9 de agosto de 2026), Sesión 2 (P) — laboratorio práctico
- **Duración:** 2 horas
- **Momento evaluativo:** Ninguno. No hay ★ esta semana; el primer laboratorio evaluativo (★ Laboratorio 1) es en la Semana 6. Esta sesión alimenta únicamente la nota de **Seguimiento** (consistencia de commits desde el día 1).
- **Lección teórica de la que depende:** "Fundamentos de control de versiones y flujo de trabajo" (Sesión 1 T, misma semana) — terminal y línea de comandos, repositorio, `.gitignore`, `README.md`, staging area, commit (y buenas prácticas de mensaje), HEAD, `git diff`, remotos (`push`/`pull`/`fetch`/`clone`), ramas (`branch`/`checkout`/`merge`, convención `main`/`development`/`feature`/`bug`/`hotfix`) y conflicto de fusión.
- **Sprint del proyecto:** No aplica — este curso no tiene proyecto de aula. En su lugar, esta sesión funda el **único repositorio** que el estudiante usará todo el semestre para sus 5 informes de laboratorio evaluativos (Semanas 6, 8, 11, 13, 16).

## Objetivo de la sesión

Al salir del aula, el estudiante debe poder:

- Crear un repositorio Git local con la estructura de carpetas exacta que usará durante los 17 semanas del curso (`laboratorios/`, `ejercicios-clase/`, `benchmarks/`, `README.md`, `.gitignore`).
- Vincular ese repositorio a GitHub y sincronizarlo con `push`.
- Redactar un `README.md` correcto en Markdown, con la misma sintaxis que usará en cada informe de laboratorio.
- Crear una rama con el prefijo `feature/` (siguiendo la convención de ramas vista en teoría), provocar un conflicto de fusión a propósito, leer el mensaje de Git y resolverlo manualmente sin pánico.

## Conexión con la teoría

La sesión T de hoy instaló el vocabulario (terminal, repositorio, `.gitignore`, `README.md`, staging, commit y sus buenas prácticas, HEAD, `diff`, remotos, ramas y su convención de nombres, conflicto) pero solo en abstracto — nadie ha tocado una terminal todavía. Este laboratorio es la primera vez que el estudiante ejecuta la secuencia completa `init → add → commit → remote → push → branch → merge → conflicto` sobre un repositorio que **no es un ejercicio desechable**: es el mismo que abrirá en la Semana 6 para el primer informe evaluado.

Pregunta de apertura para el grupo: *"Si perdieran ahora mismo la carpeta de este repositorio, ¿qué perderían exactamente — el código, el historial, o ambos? ¿Y si solo perdieran el `.git/`?"* (Respuesta esperada: perderían el historial completo pero no necesariamente el código actual; y sin repositorio remoto, perderían también el código si el disco local falla.)

## Minutado

| Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
|---|---|---|---|
| 0:00 – 0:05 | Apertura | Plantea la pregunta de conexión con la teoría. Anuncia que el repositorio de hoy es el que usarán los 17 semanas del curso — no es un ejercicio de una sola sesión. | Responde la pregunta de apertura. Abre terminal y editor. |
| 0:05 – 0:30 | Bloque 1 — `init` + estructura + `.gitignore` + primer commit | Proyecta la estructura de carpetas exacta del `info.md`. Guía la creación paso a paso, incluyendo el `.gitignore`. Circula verificando `git status` de cada estudiante antes de dejarlos avanzar al primer `commit`. | Ejecuta `git init`, crea las carpetas/archivos y el `.gitignore`, hace `add` + primer `commit`. |
| 0:30 – 1:00 | Bloque 2 — Vincular a GitHub + push | Demuestra en su propia pantalla: crear repo vacío en GitHub, `git remote add origin`, primer `push`. Resuelve en vivo el problema de autenticación (token, no contraseña). | Crea su cuenta/repo en GitHub (si no lo tenía), vincula, hace `push`. Verifica en el navegador que el código apareció. |
| 1:00 – 1:30 | Bloque 3 — README + rama + commits en paralelo | Explica el propósito del `README.md` como plantilla de los futuros informes. Introduce `git branch` / `git checkout -b`. Pide un cambio en la MISMA línea en `main` y en la rama. | Redacta el `README.md` con la sintaxis pedida. Crea la rama, hace commits en ambas líneas de trabajo sobre la misma línea del archivo. |
| 1:30 – 1:50 | Bloque 4 — Conflicto simulado + resolución | Guía el intento de `merge`, la lectura del mensaje de conflicto y la edición manual de los marcadores `<<<<<<<` / `=======` / `>>>>>>>`. Verifica que cada estudiante complete el `commit` de cierre del merge. | Ejecuta el `merge`, lee el conflicto, lo resuelve a mano, hace `git add` + `commit`. |
| 1:50 – 2:00 | Cierre | Resume el flujo completo en el tablero (diagrama de ramas). Anuncia la Semana 2 (Python) y recuerda que el repositorio de hoy sigue vivo hasta la Semana 16. | Hace el `push` final con el merge resuelto. Verifica en GitHub que el historial refleja los commits, la rama y el merge. |

Suma: 2 h 00 min.

## Desarrollo paso a paso

### Paso 1 — `git init`, estructura de carpetas y `.gitignore` (0:05–0:30)

Enunciado para el grupo: "Van a crear la carpeta que va a vivir con ustedes todo el semestre. Ábranla, entren, y conviértanla en un repositorio Git."

Solución de referencia:

```bash
mkdir curso-analisis-algoritmos
cd curso-analisis-algoritmos
git init

mkdir laboratorios ejercicios-clase benchmarks
touch README.md .gitignore

git status
```

`git status` en este punto debe mostrar las tres carpetas como "untracked" — recordar que **Git no versiona carpetas vacías**, solo archivos. Para que `laboratorios/`, `ejercicios-clase/` y `benchmarks/` queden registradas desde ya, dejar un archivo `.gitkeep` (vacío) dentro de cada una, o simplemente esperar a que reciban contenido real más adelante en el semestre. Para esta sesión basta con que las carpetas existan en disco; no es necesario forzar su registro con `.gitkeep` si el docente prefiere simplificar.

Antes del primer commit, pedir que abran el `.gitignore` y agreguen los patrones típicos que van a generar sus propios scripts y editores durante el semestre:

```text
__pycache__/
*.pyc
.vscode/
resultados_temporales/
```

```bash
git add .
git commit -m "Estructura inicial del repositorio del curso"
git log --oneline
```

Punto de control: verificar que `git log --oneline` muestra exactamente un commit, que el `.gitignore` quedó incluido en ese commit (`git show --stat HEAD`), y que `git status` queda limpio ("nothing to commit, working tree clean").

### Paso 2 — Vincular a GitHub y primer `push` (0:30–1:00)

Enunciado: "Ahora denle a este repositorio una copia de respaldo en la nube, y en el lugar donde vivirán sus cinco informes evaluados."

Solución de referencia:

1. En github.com, crear un repositorio **vacío** (sin README, sin `.gitignore`, sin licencia — para que no choque con el commit local ya hecho). Nombre sugerido: `analisis-algoritmos-<usuario>`.
2. Copiar la URL HTTPS del repositorio.

```bash
git remote add origin https://github.com/<usuario>/analisis-algoritmos-<usuario>.git
git remote -v
git branch -M main
git push -u origin main
```

Si Git pide usuario y contraseña: la contraseña de la cuenta **ya no funciona** para `push` desde 2022. El estudiante debe generar un token de acceso personal en GitHub (Settings → Developer settings → Personal access tokens) y pegarlo donde se pide la contraseña. Documentarlo en el tablero antes de que aparezca el error, para no perder tiempo de sesión.

Punto de control (minuto ~55): cada estudiante debe poder mostrar en el navegador su repositorio en GitHub con la estructura de carpetas y el primer commit visibles.

### Paso 3 — README.md, rama y commits en paralelo (1:00–1:30)

Enunciado: "Escriban el `README.md` que van a usar de plantilla en cada uno de sus cinco informes. Después vamos a trabajar dos líneas de desarrollo al tiempo: una en `main`, otra en una rama nueva — nómbrenla con el prefijo `feature/` de la convención de ramas vista en teoría."

Solución de referencia del `README.md` (contenido mínimo esperado, practicando la sintaxis):

```markdown
# Curso de Análisis de Algoritmos

Repositorio personal para los laboratorios, ejercicios de clase y
benchmarks del curso.

## Estructura del repositorio

- `laboratorios/`: los cinco informes evaluativos, uno por carpeta.
- `ejercicios-clase/`: código de las sesiones prácticas no evaluativas.
- `benchmarks/`: scripts compartidos de medición de tiempos y graficación.

## Cómo ejecutar el código

```bash
python3 --version
```

## Autor

Nombre del estudiante — Ingeniería de Sistemas.
```

Commit del README:

```bash
git add README.md
git commit -m "Agrega README inicial con estructura del repositorio"
git push
```

Ahora la rama y el conflicto simulado a propósito:

```bash
git checkout -b feature/agrega-seccion-contacto
```

En la rama, el estudiante edita **una línea específica** del `README.md` — por ejemplo la línea `## Autor` la cambia a `## Autor y contacto` y agrega su correo debajo.

```bash
git add README.md
git commit -m "Agrega correo de contacto en seccion de autor"
```

Antes de volver a `main`, el docente insiste en el punto de control: *"¿Hicieron commit de este cambio? Si cambian de rama sin hacer commit, lo pierden."*

```bash
git checkout main
```

En `main`, el estudiante edita la **misma línea** (`## Autor`) pero de otra forma — por ejemplo la cambia a `## Autor y semestre` y agrega el semestre debajo.

```bash
git add README.md
git commit -m "Agrega semestre en seccion de autor"
```

Punto de control (minuto ~1:25): `git log --oneline --all --graph` debe mostrar dos ramas divergentes desde el mismo commit padre, cada una con un commit propio que toca la misma línea.

### Paso 4 — Conflicto simulado, resolución y cierre (1:30–1:50)

Enunciado: "Intenten fusionar la rama en `main`. Van a ver un conflicto — es exactamente lo que la teoría de hoy anticipó. Van a resolverlo a mano."

Solución de referencia:

```bash
git merge feature/agrega-seccion-contacto
```

Salida esperada (aproximada):

```text
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

El archivo `README.md` ahora contiene marcadores de conflicto:

```markdown
<<<<<<< HEAD
## Autor y semestre

Nombre del estudiante — Ingeniería de Sistemas. Semestre 2026-2.
=======
## Autor y contacto

Nombre del estudiante — Ingeniería de Sistemas. correo@ejemplo.com
>>>>>>> feature/agrega-seccion-contacto
```

Resolución manual de referencia — combinar ambos cambios y borrar los tres marcadores (`<<<<<<<`, `=======`, `>>>>>>>`):

```markdown
## Autor, contacto y semestre

Nombre del estudiante — Ingeniería de Sistemas. Semestre 2026-2.
correo@ejemplo.com
```

Cierre del merge:

```bash
git add README.md
git commit -m "Resuelve conflicto: combina contacto y semestre en README"
git push
git branch -d feature/agrega-seccion-contacto
```

Punto de control final: `git log --oneline --graph --all` debe mostrar el commit de merge uniendo las dos ramas, y GitHub debe reflejar el mismo historial tras el `push`.

## Puntos de control

| Minuto | Qué revisar en pantalla | Señal de que va bien |
|---|---|---|
| ~0:25 | `git status` tras crear carpetas y `git log --oneline` | Working tree limpio, exactamente 1 commit |
| ~0:55 | Repositorio abierto en el navegador (GitHub) | Estructura de carpetas y primer commit visibles en remoto |
| ~1:25 | `git log --oneline --all --graph` | Dos ramas visibles, cada una con un commit propio sobre la misma línea del README |
| ~1:48 | `git log --oneline --graph --all` tras el merge, y GitHub actualizado | Commit de merge presente; sin marcadores `<<<<<<<` residuales en el archivo |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| El estudiante ejecuta `git commit` y no pasa nada tras `git add`, o dice "ya guardé pero no aparece en `git log`" | Confunde `add` (staging) con `commit` (guardar en la historia) | Recordar la analogía de la lección: `add` mete el cambio en la caja, `commit` sella y etiqueta la caja. Pedir que ejecute `git status` después de cada paso para ver el estado exacto |
| El estudiante ve el mensaje `CONFLICT` y se detiene, o pregunta "¿rompí todo?" | Pánico ante un mensaje que parece un error fatal | Aclarar que el conflicto es un evento normal y esperado, no un fallo. Mostrar que el repositorio sigue intacto: `git status` lista el archivo en conflicto, nada se perdió |
| El README del estudiante muestra `<<<<<<<`, `=======` o `>>>>>>>` después de "resolver" el conflicto y el `commit` de cierre | Guardó el archivo sin borrar los marcadores de Git | Pedir que abra el archivo y busque literalmente esas tres cadenas de texto antes de hacer `git add`. Ejecutar `git diff --check` puede ayudar a detectarlos |
| Al hacer `git checkout main` (o `git checkout -b`), el estudiante reporta que su cambio en la rama "desapareció" | Cambió de rama con cambios sin confirmar (sin `commit`) | Insistir en la regla del minuto 1:20: "siempre `commit` antes de cambiar de rama". Si el cambio se perdió, no hay forma de recuperarlo automáticamente — que lo vuelva a escribir y confirme el hábito para el resto del semestre |
| `git push` falla con un error de autenticación (403, o pide contraseña y la rechaza) | Intentó usar la contraseña de su cuenta de GitHub en vez de un token de acceso personal | Guiarlo a Settings → Developer settings → Personal access tokens en GitHub, generar un token, y usarlo como contraseña cuando el sistema operativo lo solicite |
| `git push` rechazado con mensaje sobre que el remoto tiene commits que el local no tiene | El repositorio remoto no se creó vacío (tenía README o licencia inicial de GitHub) | Verificar en el Paso 2 que el repo se creó sin ningún archivo inicial; si ya ocurrió, resolver con `git pull origin main --allow-unrelated-histories` y explicar brevemente qué hizo ese comando |

## Preguntas socráticas

- *"¿Qué diferencia hay entre lo que guarda `git add` y lo que guarda `git commit`?"* — Respuesta esperada: `add` solo prepara el cambio en el staging area; `commit` lo convierte en un punto permanente del historial con mensaje, autor y fecha.
- *"Si borraran ahora la carpeta `.git/` de este repositorio, ¿qué perderían?"* — Respuesta esperada: perderían todo el historial de commits, ramas y la posibilidad de volver a versiones anteriores; el contenido actual de los archivos seguiría en disco, pero ya no sería un repositorio Git.
- *"¿Por qué el conflicto apareció justo en esta línea y no en otra parte del archivo?"* — Respuesta esperada: porque ambas ramas modificaron la misma línea de forma distinta desde el mismo punto de partida; Git puede fusionar automáticamente cambios en líneas distintas, pero no puede decidir por sí solo cuál de dos cambios en la misma línea es el correcto.
- *"¿Por qué en un equipo real nunca conviene trabajar directamente sobre `main`?"* — Respuesta esperada: porque `main` debe reflejar siempre una versión estable; trabajar en ramas permite experimentar y cometer errores sin afectar esa versión hasta que el cambio esté listo para fusionarse.

## Diferenciación

- **Quien termina antes de tiempo (por ejemplo, termina el Paso 3 en 15 minutos):** pedirle que provoque un **segundo** conflicto, esta vez en una línea distinta del `README.md` o en un archivo nuevo dentro de `benchmarks/`, y que lo resuelva sin ayuda del docente. También puede investigar y ejecutar `git log --graph --oneline --all` para explicar en sus palabras el diagrama que produce.
- **Quien no logra avanzar (por ejemplo, se traba en la instalación de Git o en la autenticación con GitHub):** andamiaje mínimo aceptable para cerrar la sesión con el repositorio funcional: acompañarlo en los comandos exactos del Paso 1 y el Paso 2 dictados uno por uno, aceptando que quizás no llegue a producir el conflicto en vivo durante la clase. Como tarea mínima antes de la próxima sesión: completar el Paso 3 y el Paso 4 por su cuenta y traer capturas del historial con rama y merge.

## Cierre de la sesión

Se conecta directamente con la Semana 2 (Python): el mismo repositorio recibirá, en `ejercicios-clase/`, el primer script de Python de la próxima sesión práctica. Recordar al grupo que este repositorio **no se vuelve a crear**: es el mismo que abrirán en la Semana 6 para el primer informe evaluado (`laboratorios/lab1-fundamentos-complejidad-recurrencias/`). Como trabajo independiente: dejar el repositorio con el `push` final hecho y, si alguien no alcanzó a completar el conflicto en clase, resolverlo antes de la Semana 2.

## Materiales y preparación previa

- Verificar que Git está instalado en el entorno de cada estudiante (o guiarlos a instalarlo si el curso es remoto/virtual) antes de iniciar la sesión.
- Tener preparado, en la propia máquina del docente, un repositorio de demostración ya vinculado a GitHub para proyectar el flujo completo antes de que el grupo lo replique.
- Confirmar que todos los estudiantes ya tienen cuenta de GitHub creada — si el curso lo permite, pedirlo como tarea antes de esta sesión para no perder tiempo de clase en el registro.
- Tener a la mano la ruta exacta en GitHub para generar un token de acceso personal (Settings → Developer settings → Personal access tokens), para resolver rápido el bloqueo de autenticación del Paso 2.
- Revisar que la lección teórica de la Sesión 1 (T) ya cubrió remotos y ramas antes de esta sesión práctica; si por algún motivo esa sesión quedó incompleta, reforzar brevemente esos conceptos al inicio del Bloque 2 y del Bloque 3.
