---
title: "Laboratorio 01 — Repositorio del curso"
updatedAt: "2026-08-02"
---

# Laboratorio 01 — Repositorio del curso

## Objetivo

Cree el repositorio de Git que usará durante **todo el semestre** para entregar sus cinco informes de laboratorio evaluativos, y practique el flujo básico de trabajo con Git y GitHub que va a repetir en cada sesión práctica del curso.

Competencias esperadas:
- Crear un repositorio local con `git init`, una estructura de carpetas fija y un `.gitignore` inicial.
- Vincular un repositorio local a GitHub y sincronizarlo con `push`.
- Redactar un `README.md` correcto en Markdown.
- Realizar una secuencia de commits descriptivos, siguiendo buenas prácticas de mensaje.
- Agregar al docente como colaborador de su repositorio en GitHub, otorgándole permiso de `push` y `pull` sobre él.

## Requisitos Previos

Antes de comenzar, debe dominar los conceptos de la lección "Fundamentos de control de versiones y flujo de trabajo" (Sesión 1, Semana 1):
- Cómo moverse por carpetas y archivos desde la terminal (`pwd`, `ls`, `cd`, `mkdir`).
- Qué es un repositorio y qué guarda la carpeta `.git/`.
- Para qué sirve un `.gitignore` y cómo documentar un proyecto con un `README.md`.
- El flujo directorio de trabajo → staging area (`git add`) → historial (`git commit`), y qué hace bueno a un mensaje de commit.
- Qué es `HEAD` y cómo consultar el historial con `git log`.
- Qué hace `git diff`.
- Los comandos de repositorios remotos (`push`, `pull`, `fetch`, `clone`), aunque hoy es la primera vez que los ejecuta.
- Qué es un colaborador en GitHub y qué permisos (`push`/`pull`) otorga sobre un repositorio que no es el suyo.

También necesita:
- Git instalado en su equipo (`git --version` debe responder sin error).
- Una cuenta activa en GitHub.
- Un editor de código (se recomienda Visual Studio Code) para redactar el `README.md` con comodidad.

## Desarrollo del Laboratorio

### Parte 1 — Estructura del repositorio local

Cree una carpeta nueva para el curso e inicialícela como repositorio Git. Dentro debe quedar exactamente esta estructura:

```
curso-analisis-algoritmos/
├── laboratorios/
├── ejercicios-clase/
├── benchmarks/
├── README.md
└── .gitignore
```

Estas carpetas son las que usará durante todo el semestre:

- `laboratorios/`: aquí irá, más adelante, una carpeta por cada uno de los cinco informes de laboratorio evaluativos.
- `ejercicios-clase/`: código de las sesiones prácticas no evaluativas, incluyendo los ejercicios de Python de la Semana 2.
- `benchmarks/`: scripts compartidos de medición de tiempos y graficación que usará en los laboratorios evaluativos.
- `.gitignore`: patrones de archivos que no quiere versionar (por ejemplo, `__pycache__/`, `.vscode/`).

**Requisitos:**
- El repositorio debe iniciarse con `git init` dentro de la carpeta del proyecto (no en una carpeta superior).
- Las tres carpetas, el archivo `README.md` y el `.gitignore` deben quedar registrados en al menos un commit.
- El `.gitignore` debe excluir al menos dos patrones típicos de este curso (por ejemplo `__pycache__/` y `.vscode/`).
- Verifique con `git status` que no queda ningún archivo sin rastrear antes de pasar a la siguiente parte.

### Parte 2 — Repositorio remoto en GitHub

Cree un repositorio **vacío** en GitHub (sin README, sin licencia, sin `.gitignore` generado automáticamente) y vincúlelo a su repositorio local.

**Requisitos:**
- El repositorio remoto debe llamarse de forma reconocible (por ejemplo, incluyendo su usuario o su nombre).
- Debe quedar vinculado como `origin`.
- Su primer `push` debe subir la estructura de carpetas y el commit inicial de la Parte 1.
- Al finalizar, la página del repositorio en GitHub debe mostrar exactamente lo que tiene en su copia local.

### Parte 3 — README.md y commits descriptivos

Redacte el contenido de `README.md`. Este archivo es la **misma plantilla** que usará para documentar cada uno de sus cinco informes de laboratorio evaluativos, así que practique bien su sintaxis.

**Requisitos:**
- Al menos un encabezado principal y dos encabezados de segundo nivel.
- Al menos una lista (con viñetas o numerada) describiendo el propósito de cada carpeta del repositorio.
- Al menos un bloque de código.

Realice una secuencia de al menos **cuatro commits** documentando el armado progresivo de su repositorio (por ejemplo: estructura inicial, redacción del README, y los dos commits de la Parte 4 descritos abajo). Cada mensaje de commit debe describir con precisión qué cambió — evite mensajes genéricos como "cambios" o "arreglos".

**Restricciones:**
- No agrupe todo el trabajo en un único commit gigante: la secuencia de commits debe reflejar pasos identificables del proceso.
- No deje su repositorio local sin sincronizar con GitHub: haga `push` después de cada avance significativo.

### Parte 4 — Agregar al docente como colaborador

Para que el docente pueda revisar este repositorio directamente desde su propia cuenta —incluyendo `push` y `pull` sobre él, tal como usted— debe agregarlo como colaborador.

Pasos a seguir:

1. En la página de su repositorio en GitHub, entre a `Settings → Collaborators and teams`.
2. Haga clic en `Add people` y busque la cuenta `santiagoSuarez219`.
3. Envíe la invitación.
4. Verifique en `Settings → Collaborators and teams` que la invitación quedó registrada — aparecerá como `Pending` hasta que el docente la acepte desde su propia cuenta; usted no puede aceptarla por él.

**Requisitos:**
- La cuenta `santiagoSuarez219` debe quedar agregada (invitada o ya aceptada) como colaboradora del repositorio, con permiso de escritura que incluya `push` y `pull`.
- La invitación debe quedar visible en `Settings → Collaborators and teams` al finalizar la sesión.

**Restricciones:**
- No revoque el acceso del docente después de agregarlo: lo necesitará durante el semestre para los laboratorios evaluativos que usted entregará en este mismo repositorio.

## Entregable

Formato de entrega: enlace al repositorio en GitHub (no un archivo comprimido), con la siguiente estructura verificable al final de la sesión:

```
curso-analisis-algoritmos/
├── laboratorios/
├── ejercicios-clase/
├── benchmarks/
├── README.md
└── .gitignore
```

Junto con el enlace, incluya en un comentario o mensaje aparte:
- Confirmación de que agregó a `santiagoSuarez219` como colaborador del repositorio (por ejemplo, una captura de `Settings → Collaborators and teams`).

### Ejemplo de verificación del historial

Al ejecutar el siguiente comando desde la raíz de su repositorio, el resultado debe mostrar al menos cuatro commits:

```bash
git log --oneline
```

Salida esperada (los mensajes y hashes serán distintos en su caso):

```text
a1b2c3d (HEAD -> main) Agrega semestre en seccion de autor
h7i8j9k Agrega correo de contacto en seccion de autor
k1l2m3n Agrega README inicial con estructura del repositorio
n4o5p6q Estructura inicial del repositorio del curso
```

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 2 (10 de agosto de 2026).

## Criterios de Evaluación

Esta sesión **no es evaluativa**, pero se retroalimenta con los siguientes ejes para prepararlo de cara a los cinco informes calificados del semestre:

| Criterio | Puntos | Descripción |
|---|---|---|
| **Estructura de carpetas** | 20 | Existen exactamente `laboratorios/`, `ejercicios-clase/`, `benchmarks/`, `README.md` y `.gitignore` en la raíz del repositorio, y quedan registrados en el historial de Git; el `.gitignore` excluye al menos dos patrones reales del curso. |
| **Calidad del README.md** | 25 | El archivo usa correctamente Markdown: al menos un encabezado principal, dos encabezados de segundo nivel, una lista y un bloque de código; el contenido describe el propósito real de cada carpeta. |
| **Calidad y frecuencia de los commits** | 25 | Existen al menos cuatro commits con mensajes descriptivos y específicos (no genéricos), distribuidos a lo largo del proceso y no concentrados en uno solo. |
| **Colaborador agregado** | 30 | La cuenta `santiagoSuarez219` aparece en `Settings → Collaborators and teams` del repositorio, invitada o ya aceptada, con permiso de escritura (`push`/`pull`). |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "Hice `git add` pero al revisar `git log` no aparece nada nuevo"
- Revise que después de `git add` haya ejecutado también `git commit -m "mensaje"`. `add` solo prepara el cambio; `commit` es el que lo guarda en la historia.

### "Agregué a `santiagoSuarez219` pero no aparece como colaborador confirmado"
- Es normal: GitHub deja la invitación en estado `Pending` hasta que el docente la acepta desde su propia cuenta. Verifique que aparece listada en `Settings → Collaborators and teams`, aunque diga pendiente — eso ya cumple el requisito de esta parte.

### "No encuentro la opción de `Collaborators and teams` en `Settings`, o busco `santiagoSuarez219` y no aparece"
- Solo el dueño del repositorio (o alguien con permiso de administrador) ve esa opción. Verifique que está en el repositorio que acaba de crear, con la sesión iniciada en la cuenta que lo creó, y que escribió el nombre de usuario exactamente `santiagoSuarez219`.

### "`git push` me pide usuario y contraseña, y la contraseña no funciona"
- GitHub ya no acepta la contraseña de su cuenta para `push`. Genere un token de acceso personal desde la configuración de su cuenta en GitHub y úselo en su lugar.

### "`git push` fue rechazado por historiales no relacionados"
- Es probable que haya creado el repositorio remoto con un README u otro archivo inicial. Verifique que el repositorio en GitHub estaba vacío antes del primer `push`.

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 2 (10 de agosto de 2026).
