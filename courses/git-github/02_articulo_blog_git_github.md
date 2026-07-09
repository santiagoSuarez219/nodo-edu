---
title: "Git y GitHub: Tu primer superpoder como desarrollador"
course: "Tecnología"
course_code: "TEC"
level: "Primeros semestres"
type: "Artículo — Resumen de clase"
language: "Bash / Git"
difficulty: "Básico — Intermedio"
date: "2026-07-02"
author: "Asistente de Docencia"
---

# Git y GitHub: Tu primer superpoder como desarrollador

> 📌 **Este artículo es un resumen de los temas vistos en clase.** Puedes usarlo como guía de referencia rápida, repaso antes de un parcial, o punto de partida para profundizar en cada tema.

---

## ¿Alguna vez has tenido una carpeta así?

```
Proyecto/
├── tarea_final.docx
├── tarea_final_v2.docx
├── tarea_final_v2_BUENA.docx
├── tarea_final_ESTA_SI.docx
└── tarea_final_ENTREGAR_v7_DEFINITIVA.docx
```

Si la respuesta es sí, este artículo es para ti. El caos de las versiones manuales es un problema real —y **Git** es la solución que la industria del software adoptó hace más de 20 años.

---

## 1. ¿Qué es un sistema de control de versiones?

Un **sistema de control de versiones (VCS)** es una herramienta que registra los cambios realizados sobre uno o más archivos a lo largo del tiempo, de modo que puedas:

- Ver quién hizo qué cambio y cuándo.
- Comparar versiones entre sí.
- Regresar a una versión anterior en cualquier momento.
- Trabajar en paralelo con otras personas sin pisarse los cambios.

Existen varios VCS (SVN, Mercurial, CVS), pero **Git** se convirtió en el estándar universal de la industria.

---

## 2. Git: el estándar de la industria

**Git** es un sistema de control de versiones *distribuido*, creado por Linus Torvalds (el mismo que creó Linux) en 2005. "Distribuido" significa que cada desarrollador tiene una copia completa del repositorio en su máquina —no depende de un servidor central para funcionar.

### Características clave de Git

| Característica | Qué significa en la práctica |
|---|---|
| **Distribuido** | Funciona sin conexión a internet. Puedes trabajar offline y sincronizar después. |
| **Incremental** | Solo guarda los *cambios*, no copias completas del archivo en cada versión. |
| **Local** | La mayoría de operaciones son locales: rápidas, sin depender de servidores externos. |
| **Confiable** | Casi imposible corromper el historial sin que Git lo detecte. |

### Los 3 estados de un archivo en Git

Entender estos tres estados es clave para no confundirse con los comandos:

```
┌────────────────────┐    git add     ┌─────────────┐    git commit    ┌──────────────────┐
│    DIRECTORIO      │ ─────────────► │   STAGING   │ ───────────────► │   REPOSITORIO    │
│  (Working Dir)     │                │  (Índice)   │                  │     (Local)      │
│                    │ ◄──────────── │             │ ◄──────────────  │                  │
│  Aquí editas       │  git rm        │  Zona de    │  git reset --soft│  Historial de    │
│  tus archivos      │  --cached      │  preparación│                  │  commits         │
└────────────────────┘                └─────────────┘                  └──────────────────┘
```

- **Directorio de trabajo:** Los archivos tal como los ves en tu carpeta. Aquí editas libremente.
- **Staging (área de preparación):** Zona temporal donde indicas qué cambios irán en el próximo commit.
- **Repositorio local:** El historial permanente de versiones guardado por Git.

> 💡 **Analogía útil:** El staging es como una caja donde metes las cosas que quieres enviar. El commit es el momento en que sellas la caja y le pegas una etiqueta con la fecha y el contenido.

---

## 3. Instalación y configuración de Git

### Instalación

| Sistema operativo | Cómo instalar |
|---|---|
| **Windows** | Descargar Git Bash desde https://git-scm.com/downloads |
| **macOS** | `brew install git` o instalar Xcode Command Line Tools |
| **Linux (Ubuntu/Debian)** | `sudo apt-get install git` |

Verificar que quedó instalado:

```bash
git --version
# git version 2.38.1
```

### Configuración inicial (obligatoria)

Antes de hacer cualquier commit, Git necesita saber quién eres:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
```

Para ver tu configuración actual:

```bash
git config --list
```

---

## 4. Terminal básica: los comandos que necesitas

Git se usa desde la terminal. Estos son los comandos esenciales para navegar:

| Comando | Qué hace | Ejemplo |
|---|---|---|
| `pwd` | Muestra en qué carpeta estás | `pwd` → `/c/Users/santi/Desktop` |
| `ls` | Lista los archivos de la carpeta actual | `ls -la` para ver también los ocultos |
| `cd` | Cambia de carpeta | `cd proyecto/` o `cd ..` para subir |
| `mkdir` | Crea una carpeta | `mkdir mi-proyecto` |
| `touch` | Crea un archivo vacío | `touch index.html` |
| `cat` | Muestra el contenido de un archivo | `cat README.md` |
| `clear` | Limpia la pantalla | `clear` o `Ctrl + L` |

> 💡 **Truco:** Presiona `Tab` para autocompletar nombres de archivos y carpetas. Presiona `↑` para ver el último comando ejecutado.

---

## 5. El flujo básico de trabajo con Git

### Crear un repositorio

```bash
mkdir mi-proyecto
cd mi-proyecto
git init
# Initialized empty Git repository in .../mi-proyecto/.git/
```

`git init` crea una carpeta oculta `.git` donde Git almacenará todo el historial.

### Revisar el estado del repositorio

```bash
git status
```

Este comando es tu mejor amigo. Te dice qué archivos han cambiado, cuáles están en staging y cuáles no están rastreados todavía.

### El ciclo add → commit

```bash
# 1. Crear o modificar un archivo
echo "Hola mundo" > hola.txt

# 2. Ver el estado
git status
# Changes not staged for commit: hola.txt (en rojo)

# 3. Agregar al staging
git add hola.txt
# O para agregar todos los archivos modificados:
git add .

# 4. Ver el estado de nuevo
git status
# Changes to be committed: hola.txt (en verde)

# 5. Hacer el commit
git commit -m "Crear archivo de bienvenida"
```

### Ver el historial

```bash
git log                    # historial completo
git log --stat             # historial con resumen de cambios por archivo
git log --oneline          # una línea por commit (muy útil para ver el árbol)
git log --all --graph --decorate --oneline   # árbol visual de ramas
```

---

## 6. Analizar los cambios

### Ver qué cambió en un archivo

```bash
git show archivo.txt       # muestra los cambios del último commit sobre ese archivo
git diff                   # cambios en el directorio de trabajo (no en staging)
git diff --staged          # cambios que ya están en staging
git diff idViejo idNuevo   # diferencia entre dos commits específicos
```

En el output de `git diff`:
- Las líneas en **rojo** con `-` son las que se **eliminaron**.
- Las líneas en **verde** con `+` son las que se **agregaron**.

---

## 7. Volver en el tiempo

Git no solo guarda versiones —también te permite viajar entre ellas. Hay dos formas principales, con propósitos distintos:

### `git checkout` — ver sin destruir

```bash
git checkout idDelCommit -- archivo.txt    # ver cómo era ese archivo en ese commit
git checkout master -- archivo.txt         # volver al último commit de master
```

`git checkout` es como abrir una fotografía del pasado: puedes verla sin borrar el presente.

### `git reset` — volver y borrar

```bash
git reset idDelCommit --soft    # mueve el puntero; conserva cambios en staging
git reset idDelCommit --hard    # mueve el puntero; BORRA todos los cambios
```

> ⚠️ **Cuidado con `--hard`:** Esta opción elimina cambios de forma permanente. Úsala solo cuando estés completamente seguro de que no necesitas los cambios posteriores al commit al que regresas.

| Comando | Staging | Directorio de trabajo | ¿Reversible? |
|---|---|---|---|
| `git reset --soft` | Conserva | Conserva | Sí |
| `git reset --mixed` (por defecto) | Borra | Conserva | Sí |
| `git reset --hard` | Borra | Borra | No |

---

## 8. Ramas: trabajando en paralelo

Una **rama (branch)** es una copia del estado actual del repositorio en la que puedes trabajar de forma independiente, sin afectar la rama principal.

### ¿Por qué usar ramas?

- Para desarrollar una nueva funcionalidad sin romper lo que ya funciona.
- Para probar ideas sin comprometer el proyecto principal.
- Para que varios desarrolladores trabajen en paralelo en el mismo proyecto.

### Comandos de ramas

```bash
git branch                        # listar ramas existentes
git branch nueva-funcionalidad    # crear una nueva rama
git checkout nueva-funcionalidad  # cambiar a esa rama
git checkout -b otra-rama         # crear y cambiar en un solo paso

# Después de trabajar y hacer commits en la nueva rama:
git checkout master               # volver a la rama principal
git merge nueva-funcionalidad     # fusionar los cambios

git branch -d nueva-funcionalidad # eliminar la rama (luego del merge)
```

### Fusionar ramas: `git merge`

El merge siempre ocurre **en la rama donde estás**. Los commits de la otra rama se incorporan a la rama actual:

```
Antes del merge:           Después del merge:
                           
master:   A → B → C        master:   A → B → C → M
                                                  ↑
feature:  A → B → D → E    feature: (fusionada)
```

### Resolución de conflictos

Un **conflicto** ocurre cuando dos ramas modificaron la misma parte del mismo archivo. Git no puede decidir cuál versión es la correcta: debes resolverlo tú.

Al hacer un merge con conflicto, el archivo afectado se ve así:

```
<<<<<<< HEAD (Current Change)
<span id="titulo">Tu blog maestro</span>
=======
<span id="titulo">Tu blog de cabecera</span>
>>>>>>> cabecera (Incoming Change)
```

Para resolverlo:
1. Abrir el archivo en VS Code (aparecerán botones visuales de ayuda).
2. Elegir la versión correcta (o combinar ambas manualmente).
3. Guardar el archivo.
4. Hacer `git add archivo.txt` y luego `git commit`.

---

## 9. GitHub: tu repositorio en la nube

**GitHub** es una plataforma web para alojar repositorios Git. No es lo mismo que Git —Git es la herramienta local; GitHub es el servidor remoto donde compartes tu trabajo.

### Lo que puedes hacer en GitHub

- Guardar una copia de tu repositorio en la nube (respaldo).
- Compartir tu código con el mundo (portafolio).
- Colaborar con otras personas en el mismo proyecto.
- Gestionar versiones, issues, documentación y mucho más.

### Conectar tu repositorio local con GitHub

```bash
# 1. Crear el repositorio en GitHub (desde la interfaz web)

# 2. Conectarlo desde la terminal
git remote add origin https://github.com/tuusuario/tu-repositorio.git

# 3. Verificar la conexión
git remote -v

# 4. Subir tus cambios al remoto
git push origin master
```

> ⚠️ **Autenticación en GitHub (desde 2022):** GitHub ya no acepta tu contraseña para hacer push. Debes generar un **token de acceso personal** (PAT): Settings → Developer Settings → Personal Access Tokens → Generate new token. Ese token es tu nueva "contraseña" cuando Git te la pida.

### Sincronización con el remoto

```bash
git push origin master           # subir cambios locales al remoto
git pull origin master           # traer cambios del remoto y aplicarlos
git fetch origin                 # traer cambios del remoto SIN aplicarlos
```

> 💡 **Regla de oro del trabajo colaborativo:** **Siempre haz `git pull` antes de `git push`** cuando trabajas en equipo. Si el remoto tiene cambios que tu local no tiene, Git rechazará el push.

### Clonar un repositorio

```bash
git clone https://github.com/usuario/repositorio.git
```

Clonar descarga el repositorio completo (con todo su historial) y lo configura automáticamente con el remoto de origen.

---

## 10. Colaboración: Pull Requests y Forks

### Pull Request (PR)

Un **Pull Request** es una solicitud formal para fusionar los cambios de una rama con otra, generalmente hacia `master` o `main`. Es una característica exclusiva de GitHub (no de Git).

El flujo típico de un PR en un equipo:

```
1. Creas una rama: git checkout -b fix/error-en-login
2. Haces commits con tus cambios.
3. Subes la rama al remoto: git push origin fix/error-en-login
4. En GitHub, abres un Pull Request hacia master.
5. Un compañero revisa tus cambios y comenta.
6. Haces los ajustes necesarios y confirmas.
7. El PR es aprobado y se hace el merge.
```

El PR es un estado intermedio que permite **revisión** antes del merge. En entornos profesionales, la rama `master`/`main` suele estar bloqueada para commits directos: todo debe pasar por un PR aprobado.

### Fork: contribuir sin ser colaborador

Un **fork** es una copia completa de un repositorio público directamente en tu cuenta de GitHub. Te permite trabajar con todos los permisos sobre esa copia, sin afectar el proyecto original.

Flujo para contribuir a un proyecto open source:

```bash
# 1. Hacer fork desde GitHub (botón "Fork" en la página del repositorio)

# 2. Clonar TU fork (no el original)
git clone https://github.com/TU-USUARIO/repositorio-forkeado.git

# 3. Agregar el repositorio original como "upstream"
git remote add upstream https://github.com/usuario-original/repositorio.git

# 4. Mantener tu fork actualizado con el original
git pull upstream master
git push origin master

# 5. Trabajar en una rama y abrir PR hacia el repositorio original
git checkout -b mi-mejora
# ... hacer cambios y commits ...
git push origin mi-mejora
# Luego abrir PR desde GitHub
```

---

## 11. Buenas prácticas

### .gitignore: qué no debe ir al repositorio

No todos los archivos de un proyecto deben subirse a GitHub. El archivo `.gitignore` le indica a Git cuáles ignorar:

```gitignore
# Archivos de entorno (contraseñas, claves API)
.env

# Dependencias generadas automáticamente
node_modules/
__pycache__/
*.class

# Archivos de sistema
.DS_Store
Thumbs.db

# Logs
*.log
```

> ⚠️ **Nunca subas contraseñas, tokens ni llaves API a un repositorio público.** Una vez subidas, aunque las elimines, quedan en el historial para siempre.

### README.md: la cara de tu proyecto

El archivo `README.md` es lo primero que alguien ve al entrar a tu repositorio. Debe incluir al menos:

- Nombre y descripción del proyecto.
- Cómo instalarlo / cómo usarlo.
- Cómo contribuir (si aplica).
- Autor(es) y licencia.

### Mensajes de commit: la regla de oro

| ❌ Mal mensaje | ✅ Buen mensaje |
|---|---|
| `asdf` | `Corregir error de validación en formulario de login` |
| `cambio` | `Agregar módulo de exportación a PDF` |
| `fix` | `Solucionar conflicto de merge en archivo de estilos` |
| `listo` | `Actualizar README con instrucciones de instalación` |

Un buen mensaje responde: **¿Qué hice? ¿Por qué lo hice?**

---

## 12. Herramientas avanzadas (para explorar)

Estos temas se mencionaron en clase como contenido para profundizar por cuenta propia:

### Tags y versiones

```bash
git tag -a v1.0.0 -m "Primera versión estable" idDelCommit
git tag                          # listar tags
git push origin --tags           # publicar tags en GitHub
```

### Git Stash: guardar cambios temporalmente

```bash
git stash                        # guardar cambios sin hacer commit
git stash list                   # ver los stashes guardados
git stash pop                    # recuperar el último stash
git stash drop                   # eliminar el último stash
```

Útil cuando necesitas cambiar de rama sin perder cambios en progreso.

### Alias: atajos de comandos

```bash
# Crear un alias para ver el árbol de ramas de forma visual
git config --global alias.lg "log --all --graph --decorate --oneline"

# Usarlo
git lg
```

### Git Blame: ¿quién escribió esto?

```bash
git blame archivo.txt            # muestra autor y commit de cada línea
```

### Git Shortlog: resumen de contribuciones

```bash
git shortlog -sn                 # número de commits por autor
```

### GitHub Pages: publicar un sitio web gratis

Desde tu repositorio en GitHub puedes publicar un sitio web estático:
1. Ve a Settings → Pages.
2. Selecciona la rama donde está tu `index.html`.
3. Tu sitio estará disponible en `tuusuario.github.io/tu-repositorio`.

---

## 13. Diagrama resumen del flujo completo

```
┌──────────────┐   git add   ┌──────────┐  git commit ┌────────────────┐  git push  ┌─────────────────┐
│   Directorio │ ──────────► │ Staging  │ ──────────► │ Repositorio    │ ──────────► │  GitHub (Remoto) │
│   de trabajo │             │  (RAM)   │             │ local (master) │            │                  │
└──────────────┘             └──────────┘             └────────────────┘            └─────────────────┘
       ▲                          │                           │                               │
       │                  git rm  │                    git reset                       git pull │
       │                  --cached│                    --soft / --hard                         │
       └──────────────────────────┘                           └───────────────────────────────┘
                                                              git fetch (sin aplicar)
```

---

## 14. Ejercicios desarrollados en clase

A continuación se listan los ejercicios prácticos realizados durante las sesiones. Puedes encontrar el enunciado completo de cada uno en el **Banco de Ejercicios** (`03_banco_ejercicios_git_github.md`).

### Sesión 1
- **Ejercicio # 01** — Instalar y configurar Git por primera vez.
- **Ejercicio # 02** — Crear el primer repositorio y hacer el primer commit.
- **Ejercicio # 03** — Ciclo completo: crear, modificar y confirmar archivos.

### Sesión 2
- **Ejercicio # 04** — Explorar el historial con `git log` y `git diff`.
- **Ejercicio # 05** — Regresar a una versión anterior con `git checkout`.
- **Ejercicio # 06** — Crear y fusionar ramas sin conflictos.
- **Ejercicio # 07** — Provocar y resolver un conflicto de merge.

### Sesión 3
- **Ejercicio # 08** — Conectar el repositorio local a GitHub.
- **Ejercicio # 09** — Flujo push / pull con repositorio remoto.
- **Ejercicio # 10** — Clonar un repositorio y sincronizar cambios.
- **Ejercicio # 11** — Crear un Pull Request en GitHub.
- **Ejercicio # 12** — Hacer un fork y contribuir con un PR.

### Sesión 4
- **Ejercicio # 13** — Configurar `.gitignore` en un proyecto.
- **Ejercicio # 14** — Crear y publicar tags de versión.
- **Ejercicio # 15** — Usar `git stash` para cambiar de contexto.
- **Ejercicio # 16** — Proyecto integrador: flujo colaborativo completo en parejas.

---

## 15. Recursos para seguir aprendiendo

| Recurso | Tipo | Enlace |
|---|---|---|
| **Pro Git Book** | Libro gratuito en español | https://git-scm.com/book/es/v2 |
| **GitHub Docs** | Documentación oficial | https://docs.github.com |
| **Oh My Git!** | Juego interactivo para aprender Git | https://ohmygit.org |
| **Learn Git Branching** | Simulador interactivo de ramas | https://learngitbranching.js.org |
| **GitHub Skills** | Cursos guiados en GitHub | https://skills.github.com |
| **gitignore.io** | Generador de archivos .gitignore | https://gitignore.io |

---

> ✏️ **Nota final:** Git tiene una curva de aprendizaje inicial. Es normal sentirse perdido las primeras veces. La clave es **practicar con proyectos reales**, no solo con ejercicios de clase. Empieza a versionar todo —tus tareas, tus proyectos personales, incluso este archivo de notas— y en pocas semanas los comandos serán instintivos.
