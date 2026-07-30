---
title: "Laboratorio 01 — Repositorio del curso"
updatedAt: "2026-07-30"
---

# Laboratorio 01 — Repositorio del curso

## Objetivo

Cree el repositorio de Git que usará durante **todo el semestre** para entregar sus cinco informes de laboratorio evaluativos, y practique el flujo básico de trabajo con Git y GitHub que va a repetir en cada sesión práctica del curso.

Competencias esperadas:
- Crear un repositorio local con `git init` y una estructura de carpetas fija.
- Vincular un repositorio local a GitHub y sincronizarlo con `push`.
- Redactar un `README.md` correcto en Markdown.
- Realizar una secuencia de commits descriptivos.
- Crear una rama, provocar un conflicto de fusión a propósito y resolverlo manualmente.

## Requisitos Previos

Antes de comenzar, debe dominar los conceptos de la lección "Fundamentos de control de versiones y flujo de trabajo" (Sesión 1, Semana 1):
- Qué es un repositorio y qué guarda la carpeta `.git/`.
- El flujo directorio de trabajo → staging area (`git add`) → historial (`git commit`).
- Qué es `HEAD` y cómo consultar el historial con `git log`.
- Qué hace `git diff`.
- Los comandos de repositorios remotos (`push`, `pull`, `fetch`, `clone`) y de ramas (`branch`, `checkout`, `merge`), aunque hoy es la primera vez que los ejecuta.

También necesita:
- Git instalado en su equipo (`git --version` debe responder sin error).
- Una cuenta activa en GitHub.
- Un editor de código (se recomienda Visual Studio Code) para poder ver y resolver el conflicto de fusión con comodidad.

## Desarrollo del Laboratorio

### Parte 1 — Estructura del repositorio local

Cree una carpeta nueva para el curso e inicialícela como repositorio Git. Dentro debe quedar exactamente esta estructura:

```
curso-analisis-algoritmos/
├── laboratorios/
├── ejercicios-clase/
├── benchmarks/
└── README.md
```

Estas carpetas son las que usará durante todo el semestre:

- `laboratorios/`: aquí irá, más adelante, una carpeta por cada uno de los cinco informes de laboratorio evaluativos.
- `ejercicios-clase/`: código de las sesiones prácticas no evaluativas, incluyendo los ejercicios de Python de la Semana 2.
- `benchmarks/`: scripts compartidos de medición de tiempos y graficación que usará en los laboratorios evaluativos.

**Requisitos:**
- El repositorio debe iniciarse con `git init` dentro de la carpeta del proyecto (no en una carpeta superior).
- Las tres carpetas y el archivo `README.md` deben quedar registrados en al menos un commit.
- Verifique con `git status` que no queda ningún archivo sin rastrear antes de pasar a la siguiente parte.

### Parte 2 — Repositorio remoto en GitHub

Cree un repositorio **vacío** en GitHub (sin README, sin licencia, sin `.gitignore` generado automáticamente) y vincúlelo a su repositorio local.

**Requisitos:**
- El repositorio remoto debe llamarse de forma reconocible (por ejemplo, incluyendo su usuario o su nombre).
- Debe quedar vinculado como `origin`.
- Su primer `push` debe subir la estructura de carpetas y el commit inicial de la Parte 1.
- Al finalizar, la página del repositorio en GitHub debe mostrar exactamente lo que tiene en su copia local.

**Restricciones:**
- No use la contraseña de su cuenta de GitHub para autenticar el `push`: genere un token de acceso personal desde la configuración de su cuenta y úselo en su lugar.
- No cree el repositorio remoto con archivos iniciales — si su `push` es rechazado por historiales no relacionados, revise que el repositorio en GitHub esté realmente vacío.

### Parte 3 — README.md y commits descriptivos

Redacte el contenido de `README.md`. Este archivo es la **misma plantilla** que usará para documentar cada uno de sus cinco informes de laboratorio evaluativos, así que practique bien su sintaxis.

**Requisitos:**
- Al menos un encabezado principal y dos encabezados de segundo nivel.
- Al menos una lista (con viñetas o numerada) describiendo el propósito de cada carpeta del repositorio.
- Al menos un bloque de código.
- Opcionalmente, una tabla o una imagen (por ejemplo, un logo o captura de pantalla del repositorio).

Realice una secuencia de al menos **cuatro commits** documentando el armado progresivo de su repositorio (por ejemplo: estructura inicial, redacción del README, y los dos commits de la Parte 4 descritos abajo). Cada mensaje de commit debe describir con precisión qué cambió — evite mensajes genéricos como "cambios" o "arreglos".

**Restricciones:**
- No agrupe todo el trabajo en un único commit gigante: la secuencia de commits debe reflejar pasos identificables del proceso.
- No deje su repositorio local sin sincronizar con GitHub: haga `push` después de cada avance significativo.

### Parte 4 — Rama, conflicto simulado y resolución

Esta es la parte central del laboratorio. Debe crear una rama nueva, provocar **a propósito** un conflicto de fusión, y resolverlo manualmente.

Pasos a seguir:

1. Cree una rama nueva a partir de `main`.
2. En esa rama, modifique una línea específica de su `README.md` (por ejemplo, la sección donde firma como autor) y haga un commit.
3. Regrese a la rama `main` **sin haber dejado cambios sin confirmar** en la rama anterior.
4. En `main`, modifique **esa misma línea** del `README.md` de una forma distinta, y haga un commit.
5. Intente fusionar la rama sobre `main`. Git le reportará un conflicto.
6. Abra el archivo en conflicto y observe los marcadores que Git insertó para delimitar las dos versiones en disputa.
7. Edite el archivo a mano para dejar el contenido final que usted decida (puede combinar ambos cambios, quedarse con uno, o escribir uno nuevo), y **borre por completo** los marcadores que insertó Git.
8. Confirme la resolución del conflicto con un commit que cierre la fusión.
9. Suba el resultado final a GitHub.

**Requisitos:**
- Debe existir al menos una rama distinta de `main` en el historial.
- El conflicto debe producirse porque dos ramas modificaron **la misma línea** del mismo archivo, no líneas distintas.
- El archivo final no debe contener ningún marcador de conflicto residual.
- El historial final (`git log`) debe mostrar el commit de fusión.

**Restricciones:**
- No use `git checkout --theirs` ni `--ours` para evitar leer el conflicto: la resolución debe hacerse editando el archivo a mano.
- No elimine la rama antes de confirmar que la fusión quedó completa y subida a GitHub.

## Entregable

Formato de entrega: enlace al repositorio en GitHub (no un archivo comprimido), con la siguiente estructura verificable al final de la sesión:

```
curso-analisis-algoritmos/
├── laboratorios/
├── ejercicios-clase/
├── benchmarks/
└── README.md
```

Junto con el enlace, incluya en un comentario o mensaje aparte:
- El nombre de la rama que creó.
- El hash corto (los primeros 7 caracteres) del commit de fusión, visible con:

```bash
git log --oneline --graph --all
```

### Ejemplo de verificación del historial

Al ejecutar el siguiente comando desde la raíz de su repositorio, el resultado debe mostrar al menos cuatro commits, una rama distinta de `main` y un commit de fusión:

```bash
git log --oneline --graph --all
```

Salida esperada (los mensajes y hashes serán distintos en su caso):

```text
*   a1b2c3d (HEAD -> main) Resuelve conflicto: combina cambios en README
|\
| * e4f5g6h (rama-nueva) Modifica seccion de autor en rama
* | h7i8j9k Modifica seccion de autor en main
|/
* k1l2m3n Agrega README inicial con estructura del repositorio
* n4o5p6q Estructura inicial del repositorio del curso
```

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 2 (10 de agosto de 2026).

## Criterios de Evaluación

Esta sesión **no es evaluativa** (no hay ★ esta semana), pero se retroalimenta con los siguientes ejes para prepararlo de cara a los cinco informes calificados del semestre:

| Criterio | Puntos | Descripción |
|---|---|---|
| **Estructura de carpetas** | 20 | Existen exactamente `laboratorios/`, `ejercicios-clase/`, `benchmarks/` y `README.md` en la raíz del repositorio, y quedan registrados en el historial de Git. |
| **Calidad del README.md** | 25 | El archivo usa correctamente Markdown: al menos un encabezado principal, dos encabezados de segundo nivel, una lista y un bloque de código; el contenido describe el propósito real de cada carpeta. |
| **Calidad y frecuencia de los commits** | 25 | Existen al menos cuatro commits con mensajes descriptivos y específicos (no genéricos), distribuidos a lo largo del proceso y no concentrados en uno solo. |
| **Rama, conflicto y resolución** | 30 | Existe una rama distinta de `main` fusionada correctamente; el conflicto se produjo sobre la misma línea en ambas ramas; el archivo final no contiene marcadores de conflicto residuales. |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "Hice `git add` pero al revisar `git log` no aparece nada nuevo"
- Revise que después de `git add` haya ejecutado también `git commit -m "mensaje"`. `add` solo prepara el cambio; `commit` es el que lo guarda en la historia.

### "Al intentar el `merge` apareció la palabra `CONFLICT` y no sé qué hacer"
- Es el comportamiento esperado de esta parte del laboratorio, no un error. Abra el archivo señalado por Git y busque los marcadores que delimitan las dos versiones en conflicto.

### "Cambié de rama y mi edición del README desapareció"
- Probablemente cambió de rama sin haber hecho `commit` de esa edición primero. Vuelva a hacer el cambio y confirme el hábito de hacer `commit` antes de cualquier `checkout`.

### "`git push` me pide usuario y contraseña, y la contraseña no funciona"
- GitHub ya no acepta la contraseña de su cuenta para `push`. Genere un token de acceso personal desde la configuración de su cuenta en GitHub y úselo en su lugar.

### "`git push` fue rechazado por historiales no relacionados"
- Es probable que haya creado el repositorio remoto con un README u otro archivo inicial. Verifique que el repositorio en GitHub estaba vacío antes del primer `push`.

## Extensiones Sugeridas (Bonus)

- Provocar un segundo conflicto en un archivo o línea distinta, y resolverlo sin apoyo del docente.
- Investigar y documentar en el `README.md`, en un párrafo aparte, qué diferencia hay entre `git fetch` y `git pull`.
- Explorar el historial gráfico de su repositorio con `git log --graph --oneline --all` y describir en sus propias palabras el diagrama que produce.

## Recursos

- **Apuntes del curso:** "Fundamentos de control de versiones y flujo de trabajo" (Sesión 1, Semana 1).
- **Documentación oficial:** Pro Git Book, disponible gratis en español.
- **Referencia de sintaxis:** guía de Markdown de referencia para escribir el `README.md`.
- **Editor recomendado:** Visual Studio Code, para visualizar y resolver el conflicto de fusión con comodidad.

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 2 (10 de agosto de 2026).
