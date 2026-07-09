---
title: "Banco de Ejercicios — Git y GitHub: Control de Versiones"
source: "Apuntes de clase 'Curso Profesional de Git y GitHub' + Git Cheat Sheet (GitHub Education)"
course: "Tecnología"
course_code: "TEC"
type: "Extracción de ejercicios"
language: "Bash / Git"
level: "Primeros semestres"
total_exercises: 16
date: "2026-07-02"
author: "Asistente de Docencia"
---

<!-- 
⚠️ NOTA DE EXTRACCIÓN:
El documento fuente es un conjunto de apuntes de clase tutoriales (tipo notas de curso),
no un documento con sección de ejercicios formales. Todo el contenido es explicativo y demostrativo.
Los ejercicios de este banco han sido FORMALIZADOS a partir de las actividades prácticas 
implícitas en el documento, organizadas por unidad temática y graduadas por dificultad.
-->

# Banco de Ejercicios — Git y GitHub

---

## Unidad 1: Primeros pasos con Git

*Comandos de referencia: `git init`, `git config`, `git status`, `git add`, `git commit`, `git log`*

---

### Ejercicio # 01

**Asignatura:** Tecnología  
**Tema:** Instalación y configuración de Git  
**Dificultad:** Básico | **Tiempo estimado:** 20 minutos

**Enunciado**

Realiza la instalación y configuración inicial de Git en tu computador siguiendo los pasos a continuación:

a) Descarga e instala Git desde https://git-scm.com/downloads según tu sistema operativo.

b) Abre Git Bash (Windows) o la Terminal (macOS/Linux) y verifica que la instalación fue exitosa ejecutando:
```bash
git --version
```
Registra en tu cuaderno el número de versión que aparece.

c) Configura tu identidad global en Git con los siguientes comandos (reemplaza los valores entre comillas con tu información real):
```bash
git config --global user.name "Tu Nombre Completo"
git config --global user.email "tu@correo.com"
```

d) Verifica que la configuración quedó guardada correctamente ejecutando:
```bash
git config --list
```
Confirma que `user.name` y `user.email` aparecen con los valores correctos.

e) Responde en tu cuaderno:
   - ¿Qué hace la bandera `--global` en los comandos de configuración?
   - ¿Dónde guarda Git esta información de configuración en tu sistema?

**Solución**

_Pendiente_

---

### Ejercicio # 02

**Asignatura:** Tecnología  
**Tema:** Crear el primer repositorio y hacer el primer commit  
**Dificultad:** Básico | **Tiempo estimado:** 25 minutos

**Enunciado**

Crea tu primer repositorio de Git y registra los primeros cambios en él:

a) Abre la terminal y navega hasta la carpeta donde guardarás tus proyectos (por ejemplo, tu Escritorio o una carpeta llamada `proyectos`). Usa los comandos:
```bash
pwd          # ver dónde estás
cd ~/Desktop # ir al Escritorio (ajusta según tu sistema)
```

b) Crea una nueva carpeta llamada `mi-primer-repo` y entra en ella:
```bash
mkdir mi-primer-repo
cd mi-primer-repo
```

c) Inicializa el repositorio:
```bash
git init
```
Verifica que se creó la carpeta oculta `.git` ejecutando `ls -la`.

d) Crea un archivo llamado `historia.txt` con cualquier contenido (puede ser un párrafo corto sobre ti). Luego verifica el estado del repositorio:
```bash
git status
```
¿En qué color aparece el archivo? ¿Qué significa ese estado?

e) Agrega el archivo al área de staging y vuelve a revisar el estado:
```bash
git add historia.txt
git status
```
¿Qué cambió en la salida del comando?

f) Realiza tu primer commit con un mensaje descriptivo:
```bash
git commit -m "Crear archivo con historia personal"
```

g) Verifica el historial de commits:
```bash
git log
```
Identifica y registra en tu cuaderno: el hash del commit, el autor, la fecha y el mensaje.

**Solución**

_Pendiente_

---

### Ejercicio # 03

**Asignatura:** Tecnología  
**Tema:** Ciclo completo — modificar archivos y confirmar cambios  
**Dificultad:** Básico | **Tiempo estimado:** 30 minutos

**Enunciado**

Usando el repositorio creado en el Ejercicio # 02, practica el ciclo completo de trabajo con Git:

a) Abre el archivo `historia.txt` y agrega al menos dos líneas nuevas de contenido.

b) Crea un segundo archivo llamado `notas.txt` con al menos tres comandos de Git que hayas aprendido, junto con una descripción de para qué sirve cada uno.

c) Ejecuta `git status`. Identifica:
   - ¿Qué archivo aparece como modificado (*modified*)?
   - ¿Qué archivo aparece como sin rastrear (*untracked*)?

d) Agrega **solo** `historia.txt` al staging (no agregues `notas.txt` todavía). Ejecuta `git status` nuevamente y observa la diferencia entre los dos archivos en la salida.

e) Realiza un commit con el mensaje `"Actualizar historia personal"`.

f) Ahora agrega `notas.txt` al staging y haz un segundo commit con el mensaje `"Agregar archivo de notas de Git"`.

g) Ejecuta `git log --stat` y observa el resumen de cambios de cada commit. ¿Qué información adicional ofrece `--stat` comparado con `git log` simple?

h) **Punto adicional:** Usa el comando `git commit -am "mensaje"` para modificar `notas.txt` y hacer el commit en un solo paso. ¿En qué situaciones funciona este comando? ¿En qué situaciones NO funciona?

**Solución**

_Pendiente_

---

## Unidad 2: Historial y control de versiones

*Comandos de referencia: `git log`, `git show`, `git diff`, `git checkout`, `git reset`, `git rm`*

---

### Ejercicio # 04

**Asignatura:** Tecnología  
**Tema:** Explorar el historial con `git log` y `git diff`  
**Dificultad:** Básico | **Tiempo estimado:** 25 minutos

**Enunciado**

Con el repositorio que has construido en los ejercicios anteriores (o uno nuevo con al menos 3 commits), practica la exploración del historial:

a) Ejecuta cada una de las siguientes variantes de `git log` y registra qué información adicional ofrece cada una comparada con `git log` simple:

```bash
git log
git log --stat
git log --oneline
git log --all --graph --decorate --oneline
```

b) Identifica el hash completo del primer commit que hiciste. Ejecuta:
```bash
git show <hash-del-primer-commit>
```
¿Qué información muestra este comando? Identifica cada parte del output.

c) Modifica el archivo `historia.txt` sin hacer commit todavía. Luego ejecuta:
```bash
git diff
```
Interpreta el output: ¿qué líneas se removieron? ¿qué líneas se agregaron? ¿cómo las identifica Git?

d) Agrega el archivo al staging (`git add historia.txt`) y ejecuta:
```bash
git diff          # ¿muestra algo ahora?
git diff --staged # ¿qué diferencia hay?
```
Explica con tus palabras la diferencia entre ambos comandos.

e) Compara el primer commit con el último usando sus hashes:
```bash
git diff <hash-primer-commit> <hash-ultimo-commit>
```

**Solución**

_Pendiente_

---

### Ejercicio # 05

**Asignatura:** Tecnología  
**Tema:** Volver a versiones anteriores con `git checkout` y `git reset`  
**Dificultad:** Intermedio | **Tiempo estimado:** 35 minutos

**Enunciado**

Practica los mecanismos de Git para regresar a versiones anteriores. Lee cada paso con cuidado antes de ejecutarlo.

a) Con tu repositorio actual (mínimo 3 commits), obtén el hash del **segundo commit** usando `git log --oneline`.

b) Usa `git checkout` para ver cómo estaba el archivo `historia.txt` en ese commit:
```bash
git checkout <hash-segundo-commit> -- historia.txt
```
Abre el archivo y observa su contenido. ¿Qué cambió? Ejecuta `git status`. ¿En qué estado está el archivo?

c) Vuelve a la versión más reciente del archivo:
```bash
git checkout master -- historia.txt
```
Confirma que el archivo recuperó su contenido actual.

d) **Usando `git reset --soft`:** Crea un nuevo commit con un mensaje genérico como `"commit de prueba"`. Luego ejecuta:
```bash
git reset HEAD~1 --soft
```
Responde: ¿Qué pasó con el commit? ¿Dónde quedaron los cambios de ese commit? ¿Qué muestra `git status`?

e) **Usando `git reset --hard`:** Crea otro commit de prueba. Luego ejecuta:
```bash
git reset HEAD~1 --hard
```
¿Qué diferencia notas respecto al `--soft`? ¿Los cambios siguen visibles en el archivo?

f) ¿Cuándo usarías `--soft` y cuándo `--hard`? Argumenta tu respuesta en al menos 3 oraciones.

> ⚠️ **Advertencia:** No ejecutes `git reset --hard` en un repositorio con trabajo importante sin entender completamente sus consecuencias.

**Solución**

_Pendiente_

---

### Ejercicio # 06

**Asignatura:** Tecnología  
**Tema:** `git rm` vs `git reset HEAD` — diferencias y casos de uso  
**Dificultad:** Intermedio | **Tiempo estimado:** 20 minutos

**Enunciado**

Dos comandos que se confunden frecuentemente son `git rm` y `git reset HEAD`. Este ejercicio busca que comprendas su diferencia:

a) Crea un nuevo archivo llamado `temporal.txt` con cualquier contenido y agrégalo al staging con `git add`.

b) Ejecuta `git status` y confirma que el archivo está en el área de staging.

c) Ahora ejecuta:
```bash
git rm --cached temporal.txt
```
¿Qué pasó con el archivo en el sistema de archivos? ¿Y en el staging? Ejecuta `git status` para confirmarlo.

d) Vuelve a agregar `temporal.txt` al staging. Luego ejecuta:
```bash
git reset HEAD temporal.txt
```
¿Qué pasó esta vez? ¿En qué se diferencia del resultado del punto c)?

e) Crea una tabla comparativa en tu cuaderno con las diferencias entre `git rm --cached`, `git rm --force` y `git reset HEAD`. Incluye columnas: "¿Elimina el archivo del disco?", "¿Lo saca del staging?", "¿Elimina el historial?".

**Solución**

_Pendiente_

---

## Unidad 3: Ramas y fusiones

*Comandos de referencia: `git branch`, `git checkout`, `git merge`, `git show-branch`*

---

### Ejercicio # 07

**Asignatura:** Tecnología  
**Tema:** Crear y fusionar ramas sin conflictos  
**Dificultad:** Intermedio | **Tiempo estimado:** 35 minutos

**Enunciado**

Practica el trabajo con ramas para desarrollar funcionalidades en paralelo sin afectar la rama principal:

a) Sobre tu repositorio actual, crea una nueva rama llamada `feature/nueva-seccion`:
```bash
git branch feature/nueva-seccion
git branch   # verifica que la rama fue creada
```

b) Cambia a la nueva rama:
```bash
git checkout feature/nueva-seccion
```
Confirma en qué rama estás con `git branch` (la rama activa tiene un `*`).

c) Crea un nuevo archivo llamado `seccion.txt` con el contenido: `"Esta es una nueva sección del proyecto"`. Haz un commit en esta rama.

d) Modifica `seccion.txt` agregando una segunda línea. Haz un segundo commit en esta rama.

e) Vuelve a `master`:
```bash
git checkout master
```
¿El archivo `seccion.txt` existe en `master`? ¿Por qué?

f) Fusiona la rama `feature/nueva-seccion` con `master`:
```bash
git merge feature/nueva-seccion
```
¿Qué tipo de merge realizó Git (fast-forward o merge commit)? ¿Cómo lo identifica en el output?

g) Verifica el historial:
```bash
git log --all --graph --decorate --oneline
```

h) Elimina la rama ya fusionada:
```bash
git branch -d feature/nueva-seccion
```

**Solución**

_Pendiente_

---

### Ejercicio # 08

**Asignatura:** Tecnología  
**Tema:** Provocar y resolver un conflicto de merge  
**Dificultad:** Intermedio | **Tiempo estimado:** 40 minutos

**Enunciado**

Los conflictos de merge son una parte normal del trabajo en equipo. Este ejercicio te enseñará a crearlos y resolverlos:

a) Asegúrate de estar en la rama `master` de tu repositorio. Abre el archivo `historia.txt` y modifica la **primera línea**. Haz un commit con el mensaje `"Modificar primera línea desde master"`.

b) Crea una nueva rama llamada `rama-alternativa` y cámbiate a ella:
```bash
git checkout -b rama-alternativa
```

c) Abre el mismo archivo `historia.txt` y modifica la **misma primera línea** (con un texto diferente al que pusiste en el paso a). Haz un commit con el mensaje `"Modificar primera línea desde rama-alternativa"`.

d) Vuelve a `master` e intenta fusionar:
```bash
git checkout master
git merge rama-alternativa
```
Git debería reportar un conflicto. Lee el mensaje de error con atención.

e) Abre el archivo `historia.txt` en tu editor. Localiza los marcadores de conflicto:
```
<<<<<<< HEAD
[contenido de master]
=======
[contenido de rama-alternativa]
>>>>>>> rama-alternativa
```

f) Resuelve el conflicto: elige cuál versión conservar (o crea una combinación de ambas). Elimina los marcadores de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`).

g) Finaliza el merge:
```bash
git add historia.txt
git commit -m "Resolver conflicto entre master y rama-alternativa"
```

h) Verifica el resultado con `git log --all --graph --decorate --oneline`.

i) Responde: ¿Qué deberías haber hecho *antes* del merge para evitar el conflicto? ¿Siempre es posible evitarlos?

**Solución**

_Pendiente_

---

## Unidad 4: Repositorios remotos

*Comandos de referencia: `git remote`, `git push`, `git pull`, `git fetch`, `git clone`*

---

### Ejercicio # 09

**Asignatura:** Tecnología  
**Tema:** Conectar el repositorio local a GitHub  
**Dificultad:** Básico | **Tiempo estimado:** 30 minutos

**Prerrequisitos:** Cuenta activa en GitHub y token de acceso personal generado.

**Enunciado**

Sube tu repositorio local a GitHub por primera vez:

a) Inicia sesión en GitHub (https://github.com). Crea un nuevo repositorio con las siguientes características:
   - Nombre: `mi-primer-repo-git` (o el nombre que prefieras).
   - Visibilidad: **Público**.
   - Sin inicializar con README ni .gitignore (para poder conectarlo al local).

b) Copia la URL HTTPS del repositorio recién creado (formato: `https://github.com/tuusuario/mi-primer-repo-git.git`).

c) En tu repositorio local, agrega el remoto:
```bash
git remote add origin https://github.com/tuusuario/mi-primer-repo-git.git
git remote -v   # verificar
```

d) Sube la rama `master` al remoto:
```bash
git push origin master
```
Cuando Git pida usuario y contraseña, ingresa tu nombre de usuario de GitHub y tu **token de acceso personal** (no tu contraseña normal).

e) Recarga la página de GitHub. Verifica que todos tus archivos y el historial de commits aparecen correctamente.

f) Edita directamente en GitHub: haz clic en `historia.txt` → icono de lápiz → modifica una línea → haz commit desde la interfaz web.

g) Trae ese cambio a tu repositorio local:
```bash
git pull origin master
```
Abre `historia.txt` en tu computador y confirma que el cambio apareció.

**Solución**

_Pendiente_

---

### Ejercicio # 10

**Asignatura:** Tecnología  
**Tema:** Flujo push / pull y colaboración básica  
**Dificultad:** Intermedio | **Tiempo estimado:** 35 minutos

**Prerrequisitos:** Ejercicio # 09 completado. Trabajar con un compañero.

**Enunciado**

Simula un flujo de trabajo colaborativo básico con un compañero o contigo mismo usando dos carpetas diferentes:

a) El **estudiante A** crea el repositorio en GitHub y agrega al **estudiante B** como colaborador: Settings → Collaborators → Add people.

b) El **estudiante B** clona el repositorio:
```bash
git clone https://github.com/estudianteA/mi-primer-repo-git.git
cd mi-primer-repo-git
```

c) El **estudiante B** crea un archivo llamado `contribucion-b.txt` con al menos 5 líneas de contenido, hace el commit y lo sube:
```bash
git add contribucion-b.txt
git commit -m "Agregar contribución de estudiante B"
git push origin master
```

d) El **estudiante A** trae los cambios del remoto a su repositorio local:
```bash
git pull origin master
```
Verifica que el archivo `contribucion-b.txt` apareció en su carpeta local.

e) El **estudiante A** también crea un archivo `contribucion-a.txt`, lo sube y el **estudiante B** lo trae con `git pull`.

f) **Escenario de conflicto:** Ambos estudiantes modifican la misma línea del mismo archivo **sin hacer `git pull` primero**. El primero en hacer `git push` tendrá éxito. El segundo recibirá un error. ¿Cómo lo resuelve? Documenta el proceso.

g) Responde: ¿Por qué se recomienda siempre hacer `git pull` antes de `git push` en trabajo colaborativo?

**Solución**

_Pendiente_

---

### Ejercicio # 11

**Asignatura:** Tecnología  
**Tema:** Diferencia entre `git fetch` y `git pull`  
**Dificultad:** Intermedio | **Tiempo estimado:** 25 minutos

**Enunciado**

Comprende la diferencia entre traer cambios con `fetch` vs. con `pull`:

a) En GitHub, realiza al menos 2 commits directamente desde la interfaz web (edita archivos existentes o crea nuevos).

b) En tu repositorio local, ejecuta:
```bash
git fetch origin
```
¿Qué ocurrió? Ejecuta `git log --all --graph --oneline`. ¿Ves los nuevos commits? ¿Están aplicados a tu directorio de trabajo?

c) Ejecuta `git status`. ¿Qué mensaje muestra? ¿Cómo sabe Git que tu rama local está "detrás" de la remota?

d) Aplica los cambios traídos con `fetch`:
```bash
git merge origin/master
```
Ahora verifica que los cambios aparecen en tu directorio de trabajo.

e) Compara este flujo con lo que hace `git pull`. Construye un esquema o tabla que muestre: `git pull = git _____ + git _____`.

f) ¿En qué situación preferirías usar `git fetch` + `git merge` en lugar de `git pull` directamente?

**Solución**

_Pendiente_

---

## Unidad 5: Colaboración en GitHub

*Temas: Pull Requests, Forks, .gitignore, Tags*

---

### Ejercicio # 12

**Asignatura:** Tecnología  
**Tema:** Crear un Pull Request en GitHub  
**Dificultad:** Intermedio | **Tiempo estimado:** 40 minutos

**Enunciado**

Practica el flujo profesional de colaboración mediante Pull Requests:

a) En tu repositorio de GitHub, crea una nueva rama llamada `mejora/documentacion` **desde la interfaz web** (en el selector de ramas, escribe el nombre y selecciona "Create branch").

b) Desde tu repositorio **local**, trae la nueva rama:
```bash
git pull origin mejora/documentacion
git checkout mejora/documentacion
```

c) En esta rama, crea o mejora el archivo `README.md` con la siguiente estructura mínima:

```markdown
# Nombre del proyecto

## Descripción
[Descripción breve del proyecto]

## Cómo usarlo
[Instrucciones paso a paso]

## Autor
[Tu nombre]
```

d) Haz commit y sube la rama al remoto:
```bash
git add README.md
git commit -m "Mejorar documentación del README"
git push origin mejora/documentacion
```

e) En GitHub, abre un **Pull Request** de la rama `mejora/documentacion` hacia `master`:
   - Escribe un título descriptivo.
   - Agrega una descripción explicando qué cambios hiciste y por qué.
   - Asigna un revisor (un compañero o el docente).

f) El revisor debe dejar al menos **un comentario** sobre los cambios (puede ser una sugerencia de mejora).

g) Responde al comentario realizando el ajuste sugerido, haciendo commit en la misma rama y subiendo el cambio. El PR se actualizará automáticamente.

h) Una vez aprobado, haz el merge desde GitHub. Luego, en tu local:
```bash
git checkout master
git pull origin master
```

**Solución**

_Pendiente_

---

### Ejercicio # 13

**Asignatura:** Tecnología  
**Tema:** Fork y contribución a un repositorio externo  
**Dificultad:** Intermedio | **Tiempo estimado:** 40 minutos

**Prerrequisito:** El docente debe preparar un repositorio de práctica en su cuenta de GitHub.

**Enunciado**

Contribuye al repositorio de práctica del docente mediante el flujo de fork y PR:

a) Accede al repositorio de práctica proporcionado por el docente. Haz clic en el botón **Fork** (esquina superior derecha). GitHub creará una copia del repositorio en tu cuenta.

b) Clona **tu fork** (no el repositorio original):
```bash
git clone https://github.com/TU-USUARIO/repositorio-practica.git
cd repositorio-practica
```

c) Agrega el repositorio original como una fuente remota adicional llamada `upstream`:
```bash
git remote add upstream https://github.com/USUARIO-DOCENTE/repositorio-practica.git
git remote -v   # verifica que tienes origin (tu fork) y upstream (el original)
```

d) Crea una rama con tu nombre para tu contribución:
```bash
git checkout -b contribucion/tu-nombre
```

e) En la carpeta `contribuciones/`, crea un archivo llamado `tu-nombre.md` con el siguiente contenido:
```markdown
# Contribución de [Tu Nombre]

## Lo que aprendí de Git esta semana
[Escribe al menos 3 cosas que aprendiste]

## El comando que más me costó entender
[Nombre del comando y por qué te resultó difícil]

## Un consejo para futuros estudiantes
[Tu consejo personal]
```

f) Haz commit y push a **tu fork**:
```bash
git add contribuciones/tu-nombre.md
git commit -m "Agregar contribución de tu-nombre"
git push origin contribucion/tu-nombre
```

g) En GitHub, abre un **Pull Request** desde tu fork hacia el repositorio original del docente.

h) Para mantener tu fork actualizado si el original recibe nuevos cambios:
```bash
git pull upstream master
git push origin master
```

**Solución**

_Pendiente_

---

## Unidad 6: Herramientas de productividad

*Temas: `.gitignore`, Tags, Git Stash, Alias, Blame*

---

### Ejercicio # 14

**Asignatura:** Tecnología  
**Tema:** Configurar `.gitignore` en un proyecto  
**Dificultad:** Básico | **Tiempo estimado:** 20 minutos

**Enunciado**

Aprende a excluir archivos innecesarios o sensibles de tu repositorio:

a) En tu repositorio local, crea los siguientes archivos de prueba:
```bash
touch config.env
touch debug.log
touch resultado.class
mkdir node_modules
touch node_modules/paquete.js
```

b) Ejecuta `git status`. Observa que Git los detecta como archivos sin rastrear.

c) Crea el archivo `.gitignore` en la raíz del repositorio con las siguientes reglas:
```
# Archivos de entorno (variables de configuración y contraseñas)
*.env

# Archivos de log
*.log

# Archivos compilados de Java
*.class

# Dependencias de Node.js
node_modules/
```

d) Ejecuta `git status` nuevamente. ¿Cuáles de los archivos que creaste ya no aparecen en la lista? ¿Por qué `.gitignore` sí aparece?

e) Agrega y haz commit del `.gitignore`:
```bash
git add .gitignore
git commit -m "Configurar .gitignore para excluir archivos sensibles y generados"
```

f) Verifica que los archivos ignorados no subirían al repositorio remoto con:
```bash
git push origin master
```
Confirma en GitHub que los archivos ignorados no aparecen.

g) **Reflexión:** ¿Qué consecuencias tendría subir un archivo `.env` con contraseñas a un repositorio público en GitHub?

**Solución**

_Pendiente_

---

### Ejercicio # 15

**Asignatura:** Tecnología  
**Tema:** Git Stash — guardar cambios temporalmente  
**Dificultad:** Intermedio | **Tiempo estimado:** 25 minutos

**Enunciado**

Aprende a guardar trabajo en progreso sin hacer commit para poder cambiar de rama sin perder cambios:

a) Asegúrate de estar en la rama `master`. Modifica el archivo `historia.txt` agregando una nueva sección, pero **no hagas commit**.

b) Ahora necesitas cambiar urgentemente a otra rama para corregir un error. Intenta cambiar de rama directamente:
```bash
git checkout feature/nueva-seccion
```
¿Qué mensaje aparece? ¿Por qué Git no te deja cambiar?

c) Guarda tus cambios en el stash:
```bash
git stash save "Trabajo en progreso — nueva sección de historia"
```

d) Verifica que el directorio de trabajo está limpio:
```bash
git status
git stash list
```

e) Ahora sí cambia a la otra rama, simula una corrección y vuelve a `master`:
```bash
git checkout feature/nueva-seccion
echo "Corrección urgente" >> seccion.txt
git commit -am "Corrección urgente en feature"
git checkout master
```

f) Recupera tu trabajo guardado en el stash:
```bash
git stash pop
```
Confirma que los cambios de `historia.txt` volvieron a aparecer.

g) **Practica con múltiples stashes:** Crea dos stashes diferentes, lístalos con `git stash list` y recupera un stash específico (no el último) usando:
```bash
git stash apply stash@{1}
```

h) Limpia los stashes restantes:
```bash
git stash drop     # eliminar el último
git stash clear    # eliminar todos
```

**Solución**

_Pendiente_

---

### Ejercicio # 16 — Proyecto Integrador

**Asignatura:** Tecnología  
**Tema:** Flujo colaborativo completo en parejas  
**Dificultad:** Intermedio — Avanzado | **Tiempo estimado:** 45 minutos

**Enunciado**

Este ejercicio integra todos los conceptos aprendidos en un flujo de trabajo real de equipo. Trabaja en **parejas**.

**Parte A — Configuración del repositorio compartido (Estudiante A)**

a) Crea un nuevo repositorio en GitHub llamado `proyecto-colaborativo`. Inicialízalo con un `README.md` básico.

b) Agrega al Estudiante B como colaborador (Settings → Collaborators).

c) Clona el repositorio en tu máquina local. Crea y configura un `.gitignore`. Haz push.

**Parte B — Trabajo paralelo en ramas (Ambos estudiantes)**

d) Ambos clonan el repositorio (el Estudiante A ya lo tiene; el B hace `git clone`).

e) **Estudiante A:** Crea la rama `feature/seccion-introduccion`. Crea el archivo `introduccion.md` con contenido relevante. Hace 2 commits en esta rama.

f) **Estudiante B:** Crea la rama `feature/seccion-desarrollo`. Crea el archivo `desarrollo.md` con contenido relevante. Hace 2 commits en esta rama.

g) Ambos suben sus ramas al remoto:
```bash
git push origin feature/seccion-introduccion   # Estudiante A
git push origin feature/seccion-desarrollo      # Estudiante B
```

**Parte C — Pull Requests y revisión (Ambos estudiantes)**

h) **Estudiante A** abre un PR de su rama hacia `master`. **Estudiante B** lo revisa, deja un comentario y lo aprueba. **Estudiante A** hace el merge.

i) **Estudiante B** actualiza su rama con los cambios de `master` (que ahora incluye la introducción):
```bash
git checkout feature/seccion-desarrollo
git merge master
```

j) **Estudiante B** abre un PR de su rama hacia `master`. **Estudiante A** lo revisa y aprueba. **Estudiante B** hace el merge.

**Parte D — Sincronización final y entrega (Ambos estudiantes)**

k) Ambos sincronizan su `master` local:
```bash
git checkout master
git pull origin master
```

l) Ambos verifican el historial final:
```bash
git log --all --graph --decorate --oneline
```

**Entregable:** Comparte con el docente la URL del repositorio en GitHub. El docente verificará:
- Al menos 4 commits con mensajes descriptivos.
- Evidencia de trabajo en ramas separadas.
- Al menos 2 PRs aprobados y fusionados.
- `README.md` y `.gitignore` presentes.

**Solución**

_Pendiente_

---

## Resumen del banco de ejercicios

| N.° | Tema | Unidad | Dificultad | Tiempo est. |
|-----|------|--------|-----------|-------------|
| 01 | Instalación y configuración de Git | Primeros pasos | Básico | 20 min |
| 02 | Crear el primer repositorio y primer commit | Primeros pasos | Básico | 25 min |
| 03 | Ciclo completo: modificar y confirmar cambios | Primeros pasos | Básico | 30 min |
| 04 | Explorar historial con `log` y `diff` | Historial y versiones | Básico | 25 min |
| 05 | Volver a versiones anteriores (`checkout` y `reset`) | Historial y versiones | Intermedio | 35 min |
| 06 | `git rm` vs `git reset HEAD` | Historial y versiones | Intermedio | 20 min |
| 07 | Crear y fusionar ramas sin conflictos | Ramas y fusiones | Intermedio | 35 min |
| 08 | Provocar y resolver un conflicto de merge | Ramas y fusiones | Intermedio | 40 min |
| 09 | Conectar repositorio local a GitHub | Repositorios remotos | Básico | 30 min |
| 10 | Flujo push / pull colaborativo | Repositorios remotos | Intermedio | 35 min |
| 11 | `git fetch` vs `git pull` | Repositorios remotos | Intermedio | 25 min |
| 12 | Crear un Pull Request en GitHub | Colaboración | Intermedio | 40 min |
| 13 | Fork y contribución a repositorio externo | Colaboración | Intermedio | 40 min |
| 14 | Configurar `.gitignore` | Productividad | Básico | 20 min |
| 15 | Git Stash — guardar cambios temporalmente | Productividad | Intermedio | 25 min |
| 16 | Proyecto integrador — flujo colaborativo en parejas | Integrador | Intermedio — Avanzado | 45 min |

**Total de ejercicios:** 16  
**Tiempo total estimado:** ~490 minutos (~8 horas de práctica)
