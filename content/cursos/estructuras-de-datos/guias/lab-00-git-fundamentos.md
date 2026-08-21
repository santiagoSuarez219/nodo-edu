---
title: "Laboratorio 00 — Git: repositorio y flujo de trabajo"
updatedAt: "2026-07-30"
---

# Laboratorio 00 — Git: repositorio y flujo de trabajo

## Objetivo

Este laboratorio se realiza como **trabajo independiente
guiado**: usted lo trabaja por su cuenta, con esta guía como única referencia,
en un bloque de aproximadamente 2 horas. Va a construir, con sus propias manos, el repositorio de Git que va a alojar el proyecto de aula durante todo el semestre: un historial de commits real,
al menos una rama fusionada, un conflicto de fusión resuelto correctamente, y
el esqueleto de paquetes de las tres capas sobre el que se construirá cada
laboratorio de las próximas 16 semanas.

Competencias esperadas:
- Inicializar un repositorio Git y construir un historial de commits
  significativos.
- Crear y fusionar ramas siguiendo el flujo tipo feature branch.
- Reconocer, interpretar y resolver un conflicto de fusión.
- Organizar un proyecto Java en capas (`model/domain`, `model/structures`,
  `service`, `view`) desde el primer commit.

## Requisitos Previos

Antes de comenzar, debe dominar el contenido de las dos lecciones de esta
misma semana:

- **Fundamentos de Control de Versiones** (Clase T1, martes): repositorio,
  staging area, commit, HEAD, historial; comandos `init`, `add`, `commit`,
  `status`, `log`.
- **GitHub y flujo de trabajo con ramas** (Clase T2, jueves): repositorios
  remotos (`push`, `pull`, `fetch`, `clone`); ramas (`branch`, `checkout`,
  `merge`); convención de ramas del curso; conflictos de fusión.

Además, debe tener:
- Git instalado y configurado (`git --version` responde sin error).
- Una cuenta de GitHub creada.
- El caso de estudio de su equipo ya seleccionado (uno de los cinco casos de
  estudio del proyecto de aula).
- Un editor de código o IDE con Java configurado (VS Code o IntelliJ IDEA).

## Desarrollo del Laboratorio

Realice las cuatro tareas **en orden**. Cada una depende del resultado de la
anterior.

### Tarea 1 — Repositorio y secuencia de commits

Inicialice el repositorio local del proyecto de aula:

```bash
mkdir proyecto-aula
cd proyecto-aula
git init
```

Construya una secuencia de **al menos 3 a 4 commits significativos**. Un
commit significativo agrupa una única unidad lógica de cambio, no una mezcla
de cosas distintas ni un "guardado" sin criterio. Por ejemplo, en el orden
sugerido:

1. Un commit inicial con un `README.md` que describa brevemente el proyecto y
   el caso de estudio elegido.
2. Un commit que cree la estructura base de carpetas del proyecto Java
   (`src/main/java/<paquete>/`).
3. Un commit que agregue la primera clase de dominio de su caso de estudio
   (por ejemplo, la entidad principal — `Cliente`, `Producto`, `Paciente`,
   `Mascota`, `Estudiante` o `Equipo`, según corresponda).
4. Un commit que agregue una validación o mejora real sobre esa misma clase.

**Requisitos:**
- Mínimo 3 commits; se recomiendan 4.
- Cada mensaje de commit debe describir el cambio en modo imperativo
  ("Agrega...", "Valida...", "Crea..."), no en pasado ni con relleno genérico
  ("cambios", "avance", "commit 2").
- Verifique su propio avance con `git log --oneline`: debe mostrar la
  secuencia completa, del más reciente al más antiguo.

### Tarea 2 — Rama, commits en ella y fusión

Cree una rama siguiendo la convención `feature/<nombre-descriptivo>` (por
ejemplo `feature/cliente-telefono`, ajustado a la entidad de su caso de
estudio), agregue al menos un cambio real sobre la clase de dominio que creó
en la Tarea 1, y fusione la rama a `main`:

```bash
git checkout -b feature/<nombre-descriptivo>
# ... edite la clase de dominio, agregue un atributo nuevo con su accesor ...
git add <archivo>
git commit -m "<mensaje descriptivo>"

git checkout main
git merge feature/<nombre-descriptivo>
```

**Requisitos:**
- Al menos un commit hecho **dentro** de la rama, no en `main`.
- El `merge` debe completarse (para este caso, sin conflicto — el conflicto
  se provoca aparte, en la Tarea 3).
- Verifique con `git log --oneline --graph --all` que la rama aparece
  fusionada en el historial.

### Tarea 3 — Provocar y resolver un conflicto de fusión

Ahora va a provocar un conflicto **a propósito**, siguiendo el mismo
procedimiento que estudió en la lección T2 (sección "Cuando dos cambios
chocan").

Para lograrlo trabajando solo, edite la **misma línea** del mismo archivo
desde dos puntos distintos:

1. Cree una segunda rama a partir de `main` (después del merge de la Tarea
   2) y, en ella, edite la clase de dominio agregando un atributo nuevo en un
   punto específico del archivo. Comitee el cambio.
2. Vuelva a `main` sin fusionar todavía, y edite esa **misma zona exacta**
   del archivo agregando un atributo **distinto**. Comitee el cambio
   directamente en `main`.
3. Intente fusionar la rama nueva a `main` con `git merge`.

Git va a detener el merge y marcar el archivo con tres delimitadores:
`<<<<<<< HEAD`, `=======` y `>>>>>>> <nombre-de-la-rama>`. Ábralo en su editor,
decida qué contenido debe quedar (normalmente, conservar **ambas** ediciones
si no son incompatibles entre sí), y **borre los tres delimitadores a mano**.
Cierre el merge con un commit:

```bash
git add <archivo>
git commit -m "Resuelve conflicto: <describa la resolucion>"
```

**Requisitos:**
- El conflicto debe aparecer realmente en pantalla (si el merge se completa
  sin ningún aviso de `CONFLICT`, las dos ediciones no cayeron en la misma
  zona del archivo — revise el punto exacto donde edita en cada rama).
- El archivo resuelto no debe conservar **ningún** delimitador (`<<<<<<<`,
  `=======`, `>>>>>>>`) residual.
- El commit de resolución debe reflejar una decisión real sobre el contenido,
  no simplemente "aceptar una versión y descartar la otra sin evaluar".

### Tarea 4 — Estructura de paquetes del proyecto

Monte, dentro de `proyecto-aula/`, la estructura de paquetes completa que va
a usar durante todo el semestre:

```
proyecto-aula/
└── src/main/java/<paquete>/
    ├── Main.java
    ├── model/
    │   ├── domain/
    │   └── structures/
    ├── service/
    └── view/
```

Cree las cuatro carpetas (`model/domain`, `model/structures`, `service`,
`view`) dentro del paquete de su proyecto, y un `Main.java` en
la raíz del paquete con la siguiente firma:

```java
package <su-paquete>;

public class Main {
    public static void main(String[] args) {
        // TODO: imprimir un mensaje de bienvenida que incluya
        // el nombre de su proyecto y su caso de estudio
    }
}
```

**Requisitos:**
- Las cuatro carpetas deben existir, aunque algunas queden vacías por ahora.
  Git no versiona carpetas vacías: agregue un archivo `.gitkeep` dentro de
  cada carpeta que no tenga contenido todavía, para que sí quede rastreada.
- `Main.java` debe compilar y ejecutar sin errores, e imprimir al menos un
  mensaje de bienvenida.
- Comitee esta tarea como una unidad separada, con un mensaje descriptivo.

**Restricciones:**
- No cree contenido dentro de `model/domain/` ni `service/` más allá de lo ya
  hecho en las tareas anteriores — el resto de las clases se construyen en
  los laboratorios de las siguientes semanas.
- No use ningún paquete o estructura de carpetas distinta a la indicada: el
  resto del semestre asume exactamente esta organización.

## Entregable

Empaquete su trabajo como un repositorio de Git alojado en GitHub, con la
siguiente estructura mínima:

```
proyecto-aula/
├── README.md
└── src/
    └── main/java/<paquete>/
        ├── Main.java
        ├── model/
        │   ├── domain/
        │   │   └── <ClaseDeDominio>.java
        │   └── structures/
        │       └── .gitkeep
        ├── service/
        │   └── .gitkeep
        └── view/
            └── .gitkeep
```

Formato de entrega: cree el repositorio en GitHub (público o privado, con el
docente agregado como colaborador si es privado), haga `push` de su rama
`main` con todo el historial de commits, y comparta el enlace del repositorio
en el canal indicado por el docente antes del martes 11 de agosto.

### Ejemplo de verificación local antes de entregar

No es un archivo de prueba automatizada — es la verificación manual mínima
que debe correr usted mismo antes de hacer `push`:

```bash
# 1. El historial tiene la secuencia esperada
git log --oneline

# 2. No quedan residuos de conflicto en ningun archivo del proyecto
grep -rn "<<<<<<<\|=======\|>>>>>>>" src/

# 3. El proyecto compila y el Main ejecuta
javac -d out $(find src -name "*.java")
java -cp out <su-paquete>.Main

# 4. No queda nada pendiente de comitear
git status
```

Si el paso 2 devuelve alguna línea, o el paso 4 no muestra "nothing to
commit, working tree clean", el laboratorio todavía no está listo para
entregar.

## Criterios de Evaluación

Este laboratorio se evalúa como parte del **Seguimiento continuo** (20 % de
la nota final del curso), no como un momento evaluativo independiente.

| Criterio | Puntos | Descripción |
|---|---|---|
| **Secuencia de commits** | 20 | El historial (`git log --oneline`) tiene al menos 3 commits, cada uno con mensaje descriptivo en modo imperativo que corresponde a una unidad de cambio real, no a relleno genérico. |
| **Rama y fusión** | 20 | Existe al menos una rama con el prefijo `feature/`, con al menos un commit propio, fusionada a `main` mediante `git merge` visible en `git log --graph --all`. |
| **Resolución de conflicto** | 25 | El repositorio muestra evidencia de un `CONFLICT` real resuelto: existe un commit posterior a un merge conflictivo, y ningún archivo del proyecto conserva delimitadores `<<<<<<<`, `=======` o `>>>>>>>` residuales. |
| **Estructura de paquetes** | 20 | Las cuatro carpetas (`model/domain`, `model/structures`, `service`, `view`) existen dentro del paquete del proyecto, y `Main.java` compila y ejecuta sin errores desde la raíz del paquete. |
| **Entrega y estado del repositorio** | 15 | El repositorio está publicado en GitHub, accesible para el docente, con `git status` limpio en el momento de la entrega (nada pendiente de comitear). |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "¿Cómo provoco un conflicto si estoy trabajando solo?"
- Edite la **misma línea exacta** del mismo archivo desde dos ramas distintas
  que partan del mismo punto del historial. Si edita partes distintas del
  archivo, Git combina los cambios automáticamente y no hay conflicto.

### "Hice el merge y no apareció ningún conflicto, ¿hice algo mal?"
- No necesariamente. Revise en qué línea exacta editó cada rama: si no
  coinciden, Git no tiene nada que combinar manualmente. Repita el
  procedimiento asegurándose de tocar el mismo punto del archivo en ambas
  ramas.

### "Resolví el conflicto pero `git status` sigue mostrando el archivo como modificado"
- Falta el `git add <archivo>` después de editar el archivo para quitar los
  delimitadores, y el `git commit` final que cierra el merge. Resolver el
  contenido no es suficiente: hay que confirmarlo con `add` y `commit`.

### "`javac` no encuentra mis clases o falla con un error de paquete"
- Verifique que la ruta de carpetas coincide exactamente con la línea
  `package` declarada en cada archivo `.java`. Si el archivo declara
  `package proyecto.model.domain;`, debe vivir en
  `src/main/java/proyecto/model/domain/`.

## Extensiones Sugeridas (Bonus)

- Configurar un archivo `.gitignore` apropiado para proyectos Java (excluir
  `out/`, `.class`, archivos de IDE) antes del primer `push`.
- Provocar un segundo conflicto en un archivo distinto (por ejemplo,
  `README.md`) y documentar en un comentario del commit qué decisión tomó al
  resolverlo.
- Eliminar la rama `feature/` ya fusionada (`git branch -d
  <nombre-de-la-rama>`) para mantener el repositorio limpio.

## Recursos

- **Apuntes del curso:** Clase T1 — Fundamentos de Control de Versiones; Clase
  T2 — GitHub y flujo de trabajo con ramas.
- **Documentación oficial:** [Pro Git Book](https://git-scm.com/book/es/v2)
  (capítulos 1 a 3).
- **Herramienta recomendada:** VS Code con la extensión de GitLens para
  visualizar el historial de commits gráficamente.

**Plazo de entrega:** martes 11 de agosto de 2026, antes del inicio de la
clase (T1 de la Semana 2).
