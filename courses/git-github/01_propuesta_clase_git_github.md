---
title: "Propuesta de Desarrollo de Clase — Git y GitHub: Control de Versiones"
course: "Tecnología"
course_code: "TEC"
level: "Primeros semestres"
type: "Propuesta de clase"
language: "Bash / Git"
difficulty: "Básico — Intermedio"
estimated_time: "8 horas (4 sesiones de 2 horas)"
date: "2026-07-02"
author: "Asistente de Docencia"
---

# Propuesta de Desarrollo de Clase
## Git y GitHub: Control de Versiones para Desarrolladores

---

## 1. Información General

| Campo | Detalle |
|---|---|
| **Asignatura** | Tecnología / Herramientas de Desarrollo |
| **Código** | TEC |
| **Semestre** | Primeros semestres |
| **Duración total** | 8 horas — 4 sesiones de 2 horas cada una |
| **Modalidad** | Presencial con práctica en laboratorio |
| **Prerrequisitos** | Manejo básico del computador; conocimiento elemental de la terminal (deseable) |
| **Recursos necesarios** | Computador con conexión a internet, cuenta en GitHub (crear antes de la Sesión 3) |

---

## 2. Justificación

El control de versiones es una competencia fundamental para cualquier persona que trabaje con archivos de texto, código fuente o documentos que evolucionan con el tiempo. **Git** es hoy el estándar de la industria para gestionar el historial de un proyecto, revertir errores y colaborar en equipo. **GitHub** complementa Git con una plataforma visual que facilita la colaboración, la revisión de código y la publicación de proyectos.

Incorporar estas herramientas desde los primeros semestres permite al estudiante:

- Proteger su trabajo contra pérdidas accidentales.
- Gestionar el historial de cualquier proyecto de forma ordenada.
- Colaborar con compañeros sin sobrescribir el trabajo del otro.
- Construir un portafolio profesional visible en GitHub desde el inicio de su carrera.

---

## 3. Competencias a Desarrollar

### Competencia general
Utilizar Git y GitHub para gestionar el ciclo de vida de un proyecto de manera individual y colaborativa, aplicando buenas prácticas de documentación y trabajo en equipo.

### Competencias específicas

| N.° | Tipo | Competencia |
|-----|------|-------------|
| 1 | **Conceptual** | Comprender el propósito de los sistemas de control de versiones y los estados por los que atraviesa un archivo en Git. |
| 2 | **Procedimental** | Ejecutar el flujo básico `init → add → commit → push/pull` en proyectos locales y remotos. |
| 3 | **Colaborativa** | Participar en flujos de trabajo de equipo usando ramas, pull requests y forks en GitHub. |
| 4 | **Actitudinal** | Adoptar el hábito de documentar cambios con mensajes de commit claros, descriptivos y consistentes. |

---

## 4. Objetivos de Aprendizaje

Al finalizar esta unidad, el estudiante será capaz de:

- [ ] Explicar qué es un sistema de control de versiones y por qué Git es el estándar de la industria.
- [ ] Instalar y configurar Git en su máquina local (nombre, correo, editor).
- [ ] Navegar en la terminal usando los comandos básicos (`pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`).
- [ ] Crear un repositorio local con `git init` y realizar su primer `commit`.
- [ ] Distinguir entre el directorio de trabajo, el área de staging y el repositorio local.
- [ ] Analizar el historial de cambios usando `git log`, `git log --stat`, `git show` y `git diff`.
- [ ] Regresar a versiones anteriores con `git checkout` y `git reset` (soft y hard).
- [ ] Crear, cambiar y fusionar ramas con `git branch`, `git checkout` y `git merge`.
- [ ] Resolver conflictos de fusión en un editor de código.
- [ ] Conectar un repositorio local con GitHub usando HTTPS o SSH.
- [ ] Subir y bajar cambios con `git push` y `git pull`.
- [ ] Crear un Pull Request y revisar el trabajo de un colaborador.
- [ ] Hacer un fork de un repositorio público y abrir un PR hacia el original.
- [ ] Configurar un archivo `.gitignore` para excluir archivos no deseados del repositorio.

---

## 5. Plan de Sesiones

---

### Sesión 1 — Introducción a Git: del caos al control

**Duración:** 2 horas | **Modalidad:** Teórico-práctica

#### Objetivo de la sesión
Comprender el concepto de control de versiones, instalar y configurar Git, y realizar el primer commit en un repositorio local.

#### Materiales requeridos
- Computador con acceso a internet
- Git instalado (o acceso al instalador: https://git-scm.com/downloads)
- Terminal / Git Bash (Windows) o Terminal nativa (macOS / Linux)
- Editor de código (se recomienda VS Code)

#### Secuencia de actividades

| Tiempo | Actividad | Tipo | Descripción detallada |
|--------|-----------|------|-----------------------|
| 0:00 – 0:10 | **Motivación: el problema** | Discusión grupal | Preguntar: *"¿Cómo guardan versiones de sus archivos actualmente? ¿Usan nombres como `proyecto_final_v2_ESTE_SI.docx`?"* Mostrar el problema que resuelve VCS. |
| 0:10 – 0:30 | **Conceptos fundamentales** | Magistral | ¿Qué es un sistema de control de versiones? ¿Por qué Git? Diferencia entre archivos de texto y binarios. Los 3 estados de Git: Directorio → Staging → Repositorio. |
| 0:30 – 0:50 | **Instalación y configuración** | Práctica guiada | Instalar Git Bash en Windows (u otro SO). Verificar con `git --version`. Configurar `user.name` y `user.email`. Revisar con `git config --list`. |
| 0:50 – 1:05 | **Terminal básica** | Práctica guiada | Practicar: `pwd`, `ls -la`, `cd`, `mkdir`, `touch`, `cat`, `clear`. Diferencias entre rutas Windows y Unix. |
| 1:05 – 1:40 | **Primer repositorio** | Práctica dirigida | `git init` en una carpeta nueva. Crear un archivo `.txt`. Ciclo completo: `git status` → `git add` → `git commit -m`. Ver resultado con `git log`. Repetir con un segundo archivo. |
| 1:40 – 1:55 | **Actividad libre** | Taller individual | Cada estudiante crea un tercer archivo, lo modifica y realiza un segundo commit. Verifican el historial con `git log --stat`. |
| 1:55 – 2:00 | **Cierre y pregunta de reflexión** | Plenaria | *"¿Qué diferencia hay entre `git add` y `git commit`?"* Resumir en el tablero: el staging como "zona de preparación". |

#### Comandos clave de la sesión

```bash
# Configuración inicial
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
git config --list

# Crear y usar un repositorio
git init
git status
git add archivo.txt
git add .                        # agregar todos los archivos modificados
git commit -m "Mensaje claro"
git log
git log --stat
git commit -am "Mensaje"         # add + commit en un paso (solo para archivos ya rastreados)
```

#### Evaluación formativa
- ¿El estudiante distingue entre el directorio de trabajo y el área de staging?
- ¿Los mensajes de commit son descriptivos o genéricos como "cambio" / "asdf"?

#### Dificultades frecuentes y cómo abordarlas

> ⚠️ **Confusión `add` vs `commit`:** El error más común en esta sesión. Reforzar con la analogía: `git add` = meter cosas en una caja, `git commit` = sellar y etiquetar la caja.

> ⚠️ **Git Bash en Windows:** Asegurarse de que los estudiantes usen Git Bash y no PowerShell ni CMD, para evitar diferencias en rutas y comandos.

> ⚠️ **Commit sin mensaje:** Si el estudiante ejecuta `git commit` sin `-m`, abrirá el editor VIM. Enseñar cómo salir: `Esc` → escribir `:q!` → `Enter` para cancelar, o `Esc + Shift + Z + Z` para guardar.

---

### Sesión 2 — Historial, ramas y fusiones

**Duración:** 2 horas | **Modalidad:** Teórico-práctica

#### Objetivo de la sesión
Analizar el historial de cambios de un repositorio, regresar a versiones anteriores y gestionar el desarrollo paralelo mediante ramas.

#### Materiales requeridos
- Repositorio creado en la Sesión 1 (con al menos 2 commits)
- Terminal / Git Bash
- Editor de código (VS Code para visualizar conflictos)

#### Secuencia de actividades

| Tiempo | Actividad | Tipo | Descripción detallada |
|--------|-----------|------|-----------------------|
| 0:00 – 0:10 | **Repaso** | Preguntas y respuestas | Revisión rápida del flujo `add → commit → log`. Resolver dudas de la Sesión 1. |
| 0:10 – 0:30 | **Analizando cambios** | Práctica guiada | `git show` para ver el último commit. `git diff` para ver cambios sin confirmar. `git diff idViejo idReciente` para comparar dos commits. Interpretar el output: rojo = removido, verde = agregado. |
| 0:30 – 0:50 | **Volver en el tiempo** | Magistral + práctica | Diferencia entre `git checkout` (ver sin afectar) y `git reset` (mover el puntero). `git reset --soft` vs `--hard`. Advertencia: `--hard` borra cambios de forma irreversible. Demo en vivo. |
| 0:50 – 1:10 | **Introducción a ramas** | Magistral | ¿Qué es una rama? Analogía: "una línea de tiempo alternativa donde puedes experimentar sin dañar el original". La rama `master`/`main` como rama principal. |
| 1:10 – 1:35 | **Creando y fusionando ramas** | Práctica guiada | `git branch`, `git branch nombreRama`, `git checkout nombreRama`. Hacer cambios en la nueva rama y commit. Volver a `master` y ejecutar `git merge nombreRama`. |
| 1:35 – 1:55 | **Resolviendo un conflicto** | Práctica dirigida | Crear intencionalmente un conflicto: modificar la misma línea de un archivo en dos ramas distintas. Intentar el merge. Leer el mensaje de conflicto. Abrirlo en VS Code y resolverlo usando los botones de interfaz. Hacer el commit de cierre. |
| 1:55 – 2:00 | **Cierre** | Diagrama en tablero | Dibujar el árbol de commits: rama `master` + rama `feature` + punto de merge. *"¿Por qué nunca trabajaríamos directamente en master en un equipo?"* |

#### Comandos clave de la sesión

```bash
# Analizar cambios
git show
git show archivo.txt
git diff
git diff idCommitViejo idCommitNuevo

# Volver en el tiempo
git checkout idCommit -- archivo.txt    # ver versión anterior de un archivo
git checkout master -- archivo.txt      # volver al último commit de master
git reset idCommit --soft               # regresa HEAD, conserva staging
git reset idCommit --hard               # regresa HEAD y borra staging y directorio
git reset HEAD archivo.txt              # sacar un archivo del staging

# Ramas
git branch                              # listar ramas
git branch nombreRama                   # crear rama
git checkout nombreRama                 # cambiar a rama
git checkout -b nombreRama              # crear y cambiar en un paso
git merge nombreRama                    # fusionar rama al branch actual
git branch -d nombreRama                # eliminar rama después del merge
```

#### Dificultades frecuentes y cómo abordarlas

> ⚠️ **`git reset --hard`:** Hacer énfasis en que esta opción borra cambios de forma permanente. Recomendación: preferir `--soft` en caso de duda.

> ⚠️ **Conflictos de merge:** Muchos estudiantes entran en pánico al ver un conflicto. Mostrar que VS Code los presenta de forma visual con opciones "Accept Current Change" / "Accept Incoming Change". Resaltar que es un proceso normal del trabajo en equipo.

> ⚠️ **`CUIDADO` con cambios sin commit al cambiar de rama:** Si el estudiante tiene cambios en una rama sin hacer commit y cambia de rama, puede perder esos cambios. Insistir: *"siempre haz commit antes de cambiar de rama"*.

---

### Sesión 3 — Repositorios remotos y colaboración en GitHub

**Duración:** 2 horas | **Modalidad:** Teórico-práctica

#### Objetivo de la sesión
Conectar un repositorio local con GitHub, sincronizar cambios con el repositorio remoto y colaborar mediante pull requests y forks.

#### Materiales requeridos
- Cuenta activa en GitHub (crear con anticipación)
- Repositorio local de las sesiones anteriores
- Token de acceso personal generado en GitHub (o llave SSH configurada)

#### Secuencia de actividades

| Tiempo | Actividad | Tipo | Descripción detallada |
|--------|-----------|------|-----------------------|
| 0:00 – 0:10 | **Motivación** | Discusión | *"¿Qué pasa con tu repositorio local si se daña el disco duro? ¿Cómo entregarías tu proyecto a un compañero?"* Introducir el repositorio remoto como solución. |
| 0:10 – 0:25 | **Creando repositorio en GitHub** | Práctica guiada | Crear cuenta (si no existe). Crear nuevo repositorio en GitHub. Explorar la interfaz: código, ramas, historial de commits, issues, settings. |
| 0:25 – 0:50 | **Conectando local con remoto** | Práctica guiada | `git remote add origin URL`. Verificar con `git remote -v`. Generar token de acceso personal (Settings → Developer Settings → Tokens). `git push origin master`. Ver el resultado en GitHub. |
| 0:50 – 1:10 | **Clonar y sincronizar** | Práctica guiada | `git clone URL` en una carpeta diferente (simula un segundo desarrollador). Editar un archivo en GitHub directamente (editar en la interfaz web + commit). Ejecutar `git pull` desde el local para traer el cambio. |
| 1:10 – 1:35 | **Pull Requests** | Magistral + demo | ¿Qué es un PR? ¿Por qué usarlo? Flujo completo: crear rama → hacer cambios → push → abrir PR → asignar reviewer → aprobar → merge. Demo en vivo con repositorio del docente. |
| 1:35 – 1:55 | **Forks y contribución open source** | Magistral + demo | ¿Qué es un fork? Diferencia fork vs. clon. Hacer fork del repositorio de demostración del docente. Clonar el fork. Hacer cambio. Push. Abrir PR hacia el repositorio original. |
| 1:55 – 2:00 | **Cierre** | Diagrama | Diagrama en tablero del flujo completo: local → remoto → PR → merge. Pregunta: *"¿Cuál es la diferencia entre `git fetch` y `git pull`?"* |

#### Comandos clave de la sesión

```bash
# Conectar con remoto
git remote add origin https://github.com/usuario/repositorio.git
git remote -v
git remote set-url origin git@github.com:usuario/repositorio.git  # cambiar a SSH

# Subir y bajar cambios
git push origin master
git push origin nombreRama
git pull origin master
git pull origin nombreRama
git fetch origin               # trae cambios sin aplicarlos
git merge origin/master        # aplica los cambios traídos con fetch

# Clonar
git clone https://github.com/usuario/repositorio.git

# Ramas remotas
git pull origin nombreRama
git push origin nombreRama
git push origin --tags         # publicar etiquetas
```

#### Dificultades frecuentes y cómo abordarlas

> ⚠️ **Autenticación en GitHub:** Desde 2022, GitHub ya no acepta la contraseña del usuario para hacer `push`. Asegurarse de que todos los estudiantes generen un **token de acceso personal** (PAT) antes de esta parte de la clase. El token se usa como contraseña cuando Git lo solicite.

> ⚠️ **`git pull` antes de `git push`:** Insistir en que SIEMPRE se debe hacer `git pull` antes de `git push` cuando se trabaja con un repositorio compartido. Si el remoto tiene commits que el local no tiene, el push será rechazado.

> ⚠️ **URL HTTPS vs SSH:** Ambas funcionan, pero SSH requiere configuración previa de llaves. Para primeros semestres se recomienda HTTPS con token. Si se tiene tiempo, SSH se puede introducir como tema adicional.

---

### Sesión 4 — Buenas prácticas, herramientas avanzadas y proyecto integrador

**Duración:** 2 horas | **Modalidad:** Taller integrador

#### Objetivo de la sesión
Consolidar el aprendizaje de las sesiones anteriores mediante un proyecto colaborativo, e introducir herramientas de productividad como `.gitignore`, tags, stash y alias.

#### Materiales requeridos
- Repositorios de las sesiones anteriores
- Parejas de trabajo asignadas previamente

#### Secuencia de actividades

| Tiempo | Actividad | Tipo | Descripción detallada |
|--------|-----------|------|-----------------------|
| 0:00 – 0:10 | **Repaso rápido** | Q&A | Preguntas sobre los conceptos de las sesiones anteriores. Aclarar dudas antes del taller. |
| 0:10 – 0:30 | **Buenas prácticas** | Magistral breve | `.gitignore`: para qué sirve, sintaxis básica, ejemplos prácticos (`.env`, `node_modules/`, `*.class`). `README.md`: importancia y estructura. Convención de mensajes de commit. |
| 0:30 – 0:45 | **Herramientas de productividad** | Demo guiada | Tags y versiones (`git tag -a v1.0.0 -m "mensaje" idCommit`). Git stash (guardar trabajo temporal). Alias de Git (`git config --global alias.lg "log --all --graph --decorate --oneline"`). `git blame` y `git shortlog`. |
| 0:45 – 1:00 | **GitHub Pages** | Demo | Publicar un sitio web estático desde un repositorio de GitHub. Configuración desde Settings → Pages. Ver el sitio en `usuario.github.io/repositorio`. |
| 1:00 – 1:45 | **Proyecto integrador colaborativo** | Taller en parejas | **Flujo completo en parejas:** (1) El estudiante A crea el repositorio y agrega al B como colaborador. (2) Ambos clonan. (3) Cada uno trabaja en su propia rama con al menos 2 commits. (4) Cada uno abre un PR hacia `master`. (5) El compañero revisa y aprueba el PR. (6) Ambos hacen merge y sincronizan. (7) Agregan `.gitignore` y `README.md`. |
| 1:45 – 2:00 | **Cierre y socialización** | Plenaria | Cada pareja comparte la URL del repositorio colaborativo. Reflexión: *"¿Qué fue lo más difícil? ¿Qué harían diferente?"* Recomendaciones finales para seguir practicando. |

#### Comandos clave de la sesión

```bash
# .gitignore
echo "*.log" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Agregar .gitignore"

# Tags
git tag -a v1.0.0 -m "Primera versión estable" idCommit
git tag                                    # listar tags
git push origin --tags

# Stash
git stash                                  # guardar cambios temporalmente
git stash save "descripción del trabajo"
git stash list
git stash pop                              # recuperar el último stash
git stash drop                             # eliminar el último stash
git stash clear                            # limpiar todos los stashes

# Alias
git config --global alias.lg "log --all --graph --decorate --oneline"
git lg                                     # usar el alias

# Información de colaboradores
git shortlog -sn                           # commits por autor
git blame archivo.txt                      # quién modificó cada línea
```

---

## 6. Estrategias Metodológicas

| Estrategia | Aplicación en el curso |
|---|---|
| **Aprendizaje activo** | El 60% del tiempo de clase es práctica directa en el computador. El estudiante aprende haciendo. |
| **Analogías cotidianas** | El staging se compara con "meter cosas en una caja antes de sellarla". Las ramas son "líneas de tiempo alternativas". El fork es "hacer tu propia copia de un libro para poder escribir en los márgenes". |
| **Error-first learning** | Se provocan errores intencionalmente (conflictos de merge, commits vacíos, push rechazados) para que el estudiante aprenda a leer mensajes de error y resolverlos. |
| **Construcción progresiva** | Cada sesión parte del repositorio construido en la anterior, generando un proyecto continuo con historial real. |
| **Pair programming** | La Sesión 4 es completamente colaborativa para simular el trabajo real en equipo. |
| **Documentación viva** | Los estudiantes mantienen un archivo `notas.md` dentro de su propio repositorio con los comandos aprendidos cada día. |

---

## 7. Sistema de Evaluación

| Componente | Peso | Descripción |
|---|---|---|
| **Participación activa** | 20% | Realización de actividades durante las sesiones de clase. |
| **Repositorio personal en GitHub** | 40% | Repositorio individual con historial documentado (ver criterios abajo). |
| **Proyecto colaborativo** | 30% | Repositorio compartido con evidencia de trabajo en ramas, PR aprobado y merge exitoso. |
| **Reflexión escrita** | 10% | Archivo `README.md` o `reflexion.md` dentro del repositorio describiendo el flujo de trabajo seguido y lecciones aprendidas. |

### Criterios de evaluación — Repositorio personal

- ✅ Al menos **10 commits** con mensajes descriptivos y significativos (no "asdf", "cambio", "fix").
- ✅ Al menos **2 ramas** creadas y fusionadas (aparte de `main`/`master`).
- ✅ Archivo `README.md` con descripción del proyecto.
- ✅ Archivo `.gitignore` presente y configurado correctamente.
- ✅ Al menos **1 merge** documentado en el historial de commits.
- ✅ Repositorio **público** y visible en GitHub.

### Criterios de evaluación — Proyecto colaborativo

- ✅ Al menos **2 colaboradores** con commits propios.
- ✅ Al menos **1 Pull Request** por colaborador, revisado y aprobado por el otro.
- ✅ Trabajo realizado en **ramas separadas** (no directamente en `master`).
- ✅ Evidencia de **resolución de al menos un conflicto** en el historial.

---

## 8. Recursos y Bibliografía

### Para el estudiante

| Recurso | URL |
|---|---|
| Documentación oficial de Git | https://git-scm.com/doc |
| Pro Git Book (gratuito, en español) | https://git-scm.com/book/es/v2 |
| GitHub Docs | https://docs.github.com |
| GitHub Education (descuentos para estudiantes) | https://education.github.com |
| Editor de Markdown online | https://pandao.github.io/editor.md/en.html |
| Generador de `.gitignore` | https://gitignore.io |
| Referencia de sintaxis Markdown | https://www.markdownguide.org |

### Herramientas recomendadas

| Herramienta | Propósito | URL |
|---|---|---|
| Git for Windows | Cliente Git + Git Bash | https://git-scm.com/downloads |
| Visual Studio Code | Editor con soporte nativo para Git | https://code.visualstudio.com |
| GitHub Desktop (opcional) | Cliente gráfico de Git/GitHub | https://desktop.github.com |

### Para el docente

| Recurso | Propósito |
|---|---|
| **GitHub Classroom** | Gestionar repositorios de estudiantes y distribuir tareas de forma automatizada |
| **Gitk** | Visor gráfico del historial incluido con Git (`sudo apt-get install gitk` en Linux) |
| **GitHub Insights** | Analítica de repositorios: commits, contributors, actividad |

---

## 9. Notas para el Docente

> 💡 **GitHub Classroom:** Se recomienda crear una organización en GitHub y usar GitHub Classroom para distribuir las actividades. Facilita enormemente la revisión de repositorios y la calificación. Los estudiantes aceptan la "tarea" con un solo clic.

> 💡 **Crear cuenta en GitHub antes de la Sesión 3:** Pedir a los estudiantes que creen su cuenta y generen su token de acceso personal con al menos una semana de anticipación. En la práctica, esto consume tiempo valioso de clase.

> 💡 **Repositorio demo del docente:** Preparar un repositorio de demostración propio para mostrar los flujos antes de que los estudiantes los repliquen. Este repo puede tener conflictos, ramas y PRs preconfigurados para agilizar las demos.

> 💡 **Sesión de conflictos:** La parte de resolución de conflictos (Sesión 2) suele generar más confusión y ansiedad en los estudiantes. Considerar extenderla o agregar ejercicios adicionales si el grupo lo necesita. Mostrar repetidamente que el conflicto no es un error: es una situación normal y tratable.

> 💡 **Niveles de avance:** Algunos estudiantes avanzarán más rápido que otros. Tener preparados ejercicios adicionales (stash, cherry-pick, rebase, SSH) para los que terminen antes y no interrumpan al resto.

> 💡 **La regla de oro del commit:** Repetir en cada sesión: *"Un commit por idea, un mensaje que explique el QUÉ y el POR QUÉ, no el cómo."*
