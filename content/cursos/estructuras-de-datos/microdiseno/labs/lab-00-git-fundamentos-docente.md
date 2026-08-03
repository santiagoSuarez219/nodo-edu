# Lab 00 — Git: repositorio y flujo de trabajo · Guía del docente

## Ficha de la sesión

| Campo | Valor |
|---|---|
| Curso | Estructuras de Datos |
| Semana | 1 — Viernes 7 de agosto de 2026 |
| Modalidad | **Sin sesión presencial.** Festivo (Batalla de Boyacá). Trabajo independiente guiado. |
| Duración equivalente | 2 h de trabajo autónomo (igual a la sesión P regular) |
| Momento evaluativo | Seguimiento continuo (no es un momento evaluativo ★) |
| Lección teórica de la que depende | T1 — *Fundamentos de Control de Versiones* (martes 4 ago) y T2 — *GitHub y flujo de trabajo con ramas* (jueves 6 ago) |
| Sprint del proyecto | Sprint 1 — POO y arquitectura base (semanas 1–4). Este laboratorio crea el repositorio único del equipo y el esqueleto de paquetes sobre el que se construye todo el sprint. |
| Revisión en clase | Martes 11 de agosto (T1 de la Semana 2, *Diagnóstico y revisión de clases*) — apertura de 10-15 min para resolver dudas y verificar avance antes de continuar con el contenido nuevo. |

Este laboratorio **no lo dirige el docente en vivo**. La guía del estudiante
(`content/cursos/estructuras-de-datos/guias/lab-00-git-fundamentos.md`) es
autocontenida y el estudiante la trabaja por su cuenta el viernes 7 de agosto.
Esta guía sirve para: (a) que el docente sepa exactamente qué se le pidió al
estudiante y con qué nivel de detalle, (b) tener la solución de referencia a
mano para la revisión del martes, y (c) anticipar los bloqueos típicos de
quien hace esto por primera vez sin acompañamiento.

## Objetivo de la sesión

Al terminar el trabajo independiente, el estudiante debe poder:

- Inicializar un repositorio Git local y construir un historial de al menos
  3-4 commits con mensajes descriptivos en modo imperativo.
- Crear una rama `feature/`, trabajar en ella de forma aislada y fusionarla a
  `main` con `git merge`.
- Reconocer un conflicto de fusión real en pantalla, entender los tres
  delimitadores (`<<<<<<<`, `=======`, `>>>>>>>`) y resolverlo sin dejar
  residuos en el archivo.
- Tener montada la estructura de paquetes del proyecto de aula
  (`model/domain`, `model/structures`, `service`, `controller`, `view`) con
  un `Main.java` que compila y ejecuta, lista para recibir código desde la
  Semana 2.

## Conexión con la teoría

Este laboratorio no introduce ningún comando nuevo: es la puesta en práctica
exacta de lo visto el martes y el jueves. La propia lección T2 cierra con la
sección "Lo que te espera el viernes", que enumera las cuatro tareas en el
mismo orden que la guía del estudiante:

1. Crear el repositorio con `git init` y una secuencia de commits — cubierto
   por T1 (`init`, `add`, `commit`, `status`, `log`, `diff`).
2. Crear una rama, comitear en ella y fusionarla a `main` — cubierto por T2
   (`branch`, `checkout`, `checkout -b`, `merge`).
3. Provocar y resolver un conflicto de fusión — cubierto por T2, sección
   "Cuando dos cambios chocan", que **usa el mismo ejemplo** (`Cliente.java`,
   atributos `telefono` / `direccion`) que se resuelve en este laboratorio.
   No es coincidencia: se reutiliza a propósito para que el estudiante
   reconozca el patrón exacto que ya vio resuelto en la teoría.
4. Montar la estructura de paquetes de cuatro capas — presentada en T2,
   sección "La estructura que vas a versionar".

Si el docente necesita reforzar algo el martes siguiente, la pregunta de
apertura recomendada es: *"¿En qué paso se sintieron más perdidos: creando la
rama, o resolviendo el conflicto?"* — permite detectar en segundos si el
bloqueo fue de ramas o de conflictos sin revisar pantalla por pantalla.

## Guía de tiempos de trabajo autónomo

No hay minutado de aula porque no hay docente presente. Esta tabla es la
estimación que se comunica al estudiante en la guía publicada, para que
distribuya sus 2 horas de trabajo independiente sin quedarse atascado en un
solo paso.

| Tiempo estimado | Bloque | Punto de control que el propio estudiante puede verificar |
|---|---|---|
| 0–10 min | Preparación: crear la carpeta del proyecto, verificar `git --version`, decidir el caso de estudio (si el equipo aún no lo ha hecho) | `git --version` responde sin error |
| 10–35 min | Tarea 1 — `git init` + secuencia de 3-4 commits | `git log --oneline` muestra los commits en orden, cada uno con mensaje descriptivo |
| 35–65 min | Tarea 2 — rama `feature/`, commits en ella, `merge` a `main` | `git log --oneline --graph --all` muestra la rama fusionada; `git branch` sigue listando la rama (aún no se elimina, eso se ve en T2 del proyecto real) |
| 65–95 min | Tarea 3 — provocar y resolver un conflicto de fusión | El archivo en conflicto ya no contiene `<<<<<<<`, `=======` ni `>>>>>>>`; `git status` reporta el working tree limpio |
| 95–115 min | Tarea 4 — estructura de paquetes + `Main.java` | El proyecto compila (`javac`) y `Main.java` imprime el mensaje al ejecutarlo |
| 115–120 min | Cierre: `git status` limpio, revisar que todo quedó comiteado, (si aplica) `push` al remoto del equipo | `git status` → "nothing to commit, working tree clean" |

Si el estudiante reporta el martes que se quedó atascado antes del minuto 65
(rama y merge simple), es una señal de que no completó ni siquiera la Tarea 2
— prioridad de refuerzo individual antes de seguir con Encapsulamiento.

## Desarrollo paso a paso — solución de referencia

> Ejemplo construido sobre el caso de estudio **Sistema Bancario** con la
> entidad `Cliente`, reutilizando el mismo ejemplo de la lección T2 para que
> el conflicto de la Tarea 3 sea reconocible. La lógica es idéntica para
> cualquiera de los seis casos de estudio: solo cambia el nombre de la clase
> de dominio.

### Paso 1 — Repositorio y secuencia de commits

```bash
mkdir proyecto-aula && cd proyecto-aula
git init

echo "# Proyecto de Aula — Sistema Bancario" > README.md
git add README.md
git commit -m "Agrega README inicial del proyecto"

mkdir -p src/main/java/proyecto
git add src
git commit -m "Crea estructura base de directorios"

mkdir -p src/main/java/proyecto/model/domain
cat > src/main/java/proyecto/model/domain/Cliente.java << 'EOF'
package proyecto.model.domain;

public class Cliente {
    private String nombre;

    public Cliente(String nombre) {
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}
EOF
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Agrega clase Cliente en model/domain"

# cuarto commit: un ajuste real, no relleno
cat > src/main/java/proyecto/model/domain/Cliente.java << 'EOF'
package proyecto.model.domain;

public class Cliente {
    private String nombre;

    public Cliente(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede ser vacio");
        }
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }
}
EOF
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Valida que el nombre del cliente no sea vacio"
```

Verificación: `git log --oneline` debe mostrar 4 commits, del más reciente al
más antiguo, cada uno describiendo una unidad de cambio real (no "commit 1",
"commit 2", "wip").

### Paso 2 — Rama `feature/`, commits y `merge`

```bash
git checkout -b feature/cliente-telefono

cat > src/main/java/proyecto/model/domain/Cliente.java << 'EOF'
package proyecto.model.domain;

public class Cliente {
    private String nombre;
    private String telefono;

    public Cliente(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede ser vacio");
        }
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
EOF
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Agrega atributo telefono a Cliente"

git checkout main
git merge feature/cliente-telefono
```

Como `feature/cliente-telefono` partió del último commit de `main` y nadie
más tocó `Cliente.java` mientras tanto, este merge es *fast-forward*: no hay
conflicto todavía. Eso se provoca a propósito en el Paso 3.

Verificación: `git log --oneline --graph --all` muestra la rama fusionada;
`git branch` sigue listando `feature/cliente-telefono` (se elimina más
adelante, como parte del hábito de limpieza, no es obligatorio en este
laboratorio).

### Paso 3 — Provocar y resolver un conflicto de fusión

Se necesitan **dos ramas que edan la misma línea** del mismo archivo desde el
mismo punto de partida. La forma más simple de lograrlo en solitario (sin un
segundo integrante disponible en el momento) es simular las dos ediciones
desde dos ramas creadas a partir del mismo commit:

```bash
# Rama A: agrega direccion en la misma zona del archivo
git checkout -b feature/cliente-direccion
```

Editar `Cliente.java` agregando, **en el mismo lugar donde antes se agregó
`telefono`**, un nuevo atributo `direccion`:

```java
package proyecto.model.domain;

public class Cliente {
    private String nombre;
    private String telefono;
    private String direccion;

    public Cliente(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede ser vacio");
        }
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getDireccion() {
        return direccion;
    }
}
```

```bash
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Agrega atributo direccion a Cliente"

# Volver a main y editar la MISMA linea de forma distinta
git checkout main
```

Editar `Cliente.java` en `main`, agregando en el mismo punto un atributo
distinto (`ciudad`, por ejemplo) para forzar el choque:

```java
    private String nombre;
    private String telefono;
    private String ciudad;
```

```bash
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Agrega atributo ciudad a Cliente directamente en main"

git merge feature/cliente-direccion
```

Git detiene el merge:

```text
Auto-merging src/main/java/proyecto/model/domain/Cliente.java
CONFLICT (content): Merge conflict in src/main/java/proyecto/model/domain/Cliente.java
Automatic merge failed; fix conflicts and then commit the result.
```

El archivo queda así:

```text
    private String nombre;
    private String telefono;
<<<<<<< HEAD
    private String ciudad;
=======
    private String direccion;
>>>>>>> feature/cliente-direccion
```

Resolución — conservar ambos atributos y sus accesores, borrar los tres
delimitadores:

```java
package proyecto.model.domain;

public class Cliente {
    private String nombre;
    private String telefono;
    private String ciudad;
    private String direccion;

    public Cliente(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede ser vacio");
        }
        this.nombre = nombre;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getCiudad() {
        return ciudad;
    }

    public String getDireccion() {
        return direccion;
    }
}
```

```bash
git add src/main/java/proyecto/model/domain/Cliente.java
git commit -m "Resuelve conflicto: conserva atributos ciudad y direccion"
```

Verificación: `grep -rn "<<<<<<<\|=======\|>>>>>>>" src/` no debe devolver
nada; `git status` reporta el working tree limpio.

### Paso 4 — Estructura de paquetes completa y `Main.java`

```bash
mkdir -p src/main/java/proyecto/model/structures
mkdir -p src/main/java/proyecto/service
mkdir -p src/main/java/proyecto/controller
mkdir -p src/main/java/proyecto/view

cat > src/main/java/proyecto/Main.java << 'EOF'
package proyecto;

public class Main {
    public static void main(String[] args) {
        System.out.println("Bienvenido al Sistema Bancario — Proyecto de Aula");
        System.out.println("Estructura de paquetes lista: model/domain, model/structures, service, controller, view");
    }
}
EOF

# Los paquetes vacios no se rastrean en Git (Git no versiona carpetas vacias);
# un .gitkeep por carpeta evita que desaparezcan al clonar el repo en otra maquina.
touch src/main/java/proyecto/model/structures/.gitkeep
touch src/main/java/proyecto/service/.gitkeep
touch src/main/java/proyecto/controller/.gitkeep
touch src/main/java/proyecto/view/.gitkeep

git add src/main/java/proyecto
git commit -m "Crea estructura de paquetes completa y Main.java de bienvenida"
```

Árbol final esperado:

```text
proyecto-aula/
├── README.md
└── src/
    └── main/java/proyecto/
        ├── Main.java
        ├── model/
        │   ├── domain/
        │   │   └── Cliente.java
        │   └── structures/
        │       └── .gitkeep
        ├── service/
        │   └── .gitkeep
        ├── controller/
        │   └── .gitkeep
        └── view/
            └── .gitkeep
```

Verificación: `javac -d out $(find src -name "*.java")` compila sin errores;
`java -cp out proyecto.Main` imprime el mensaje de bienvenida.

## Puntos de control (para la revisión del martes de la Semana 2)

No hay puntos de control en vivo porque no hay sesión presencial. Estos son
los que el docente revisa al abrir la clase del martes siguiente, pidiendo a
cada equipo que muestre su repositorio (local o el enlace de GitHub):

| Qué pedir que muestren | Señal de que va bien |
|---|---|
| `git log --oneline` | 4 o más commits con mensajes en modo imperativo, específicos ("Valida que el nombre..." y no "cambios") |
| `git log --oneline --graph --all` | Al menos una rama `feature/` visible, fusionada a `main` |
| El archivo donde se resolvió el conflicto | Sin delimitadores residuales; el diff del commit de resolución muestra un cambio deliberado, no solo "acepté una versión y borré la otra sin pensar" |
| El árbol de carpetas del proyecto | Las cinco carpetas existen (incluidas las vacías) y `Main.java` está en la raíz del paquete |
| `java -cp out proyecto.Main` (o el comando que use el estudiante) | Compila y corre sin error, imprime el mensaje de bienvenida |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| `git log` muestra un único commit gigante | El estudiante hizo todos los cambios y comiteó una sola vez al final | Explicar que cada commit debe ser una unidad lógica; pedir que a partir de ahora comitee por tarea, no al cerrar sesión |
| `fatal: not a git repository` al ejecutar cualquier comando | Está parado fuera de la carpeta `proyecto-aula/`, o nunca corrió `git init` | Verificar con `pwd` y `ls -la` que existe `.git/` en el directorio actual |
| El merge de la Tarea 2 no genera ni fast-forward ni conflicto, simplemente no cambia nada | Editó el archivo en la rama pero olvidó `git add` antes del `commit`, o comiteó en `main` por error en vez de en la rama | Revisar con `git log --all --graph` en qué rama quedaron realmente los commits |
| El conflicto de la Tarea 3 nunca aparece, el merge se completa solo | Las dos ediciones no cayeron en la misma línea/zona del archivo — Git combina automáticamente cambios en zonas distintas | Pedir que ambas ediciones se hagan **en el mismo punto exacto** del archivo, como en el ejemplo de esta guía |
| Tras "resolver" el conflicto, el archivo sigue con `<<<<<<<` o `=======` | Guardó sin borrar los delimitadores, o resolvió aceptando una versión sin fusionar el contenido de ambas | Ejecutar `grep -rn "<<<<<<<\|=======\|>>>>>>>" src/` para localizar el residuo exacto |
| `javac` falla con "package proyecto.model.domain does not exist" o similar | La carpeta no coincide con la declaración `package` del archivo, o el comando de compilación no incluyó todos los `.java` | Confirmar que la ruta de carpetas refleja exactamente el `package` declarado en cada archivo |
| Las carpetas vacías (`service/`, `controller/`, `view/`) "desaparecen" tras clonar en otra máquina | Git no versiona carpetas vacías; sin un archivo dentro (`.gitkeep`), la carpeta no se sube | Recordar el propósito del `.gitkeep`: es un archivo vacío cuyo único fin es que la carpeta tenga contenido rastreable |

## Preguntas socráticas

- *"Si borraran la carpeta `.git/` en este momento, ¿qué perderían exactamente
  y qué no?"* — Respuesta esperada: perderían todo el historial de commits y
  ramas; el código actual en disco seguiría existiendo tal como está en este
  instante, pero sin ninguna versión anterior recuperable.
- *"¿Por qué Git no pudo resolver el conflicto de la Tarea 3 solo, si en la
  Tarea 2 el merge sí fue automático?"* — Respuesta esperada: en la Tarea 2
  las ramas no tocaron la misma línea del mismo archivo (fast-forward); en la
  Tarea 3, ambas ramas editaron la misma zona, y Git no puede adivinar cuál
  versión es la correcta.
- *"¿Qué significa que el merge haya sido 'fast-forward' en la Tarea 2?"* —
  Respuesta esperada: que `main` no tenía commits nuevos propios desde que se
  creó la rama, así que Git simplemente movió el puntero de `main` hasta el
  último commit de la rama, sin necesidad de combinar nada.
- *"¿Por qué la carpeta `model/structures/` está vacía todavía y aun así hay
  que crearla hoy?"* — Respuesta esperada: porque el esqueleto de capas es la
  base sobre la que se va a construir todo el semestre; crearla ahora evita
  tener que reorganizar el proyecto más adelante cuando ya tenga código.

## Diferenciación

**Quien termina en 30-40 minutos (mucho antes de los 120):**
- Pedirle que elimine la rama `feature/` ya fusionada (`git branch -d
  feature/cliente-telefono`) y explique por qué es una buena práctica no
  dejar ramas fusionadas vivas.
- Pedirle que cree el repositorio remoto en GitHub y haga el primer `push`,
  adelantando trabajo que de todas formas necesitará para entregar.
- Retarlo a provocar un **segundo** conflicto en un archivo distinto
  (`README.md`, por ejemplo) y documentar en un comentario qué decisión tomó
  al resolverlo y por qué.

**Andamiaje mínimo aceptable para quien no logra completar el laboratorio
solo (sin docente presente, el bloqueo más probable es no saber si su
resultado es "correcto"):**
- Aceptar como válido un repositorio con **3 commits** en vez de 4, siempre
  que cada uno sea una unidad de cambio real y no relleno — la meta es el
  hábito, no el conteo exacto.
- Si no logró provocar el conflicto por su cuenta, aceptar que documente por
  escrito (en el `README.md` o un comentario) los pasos que intentó y qué
  pasó, para revisarlo juntos el martes en los primeros minutos de clase.
- Si el grupo del curso tiene un canal de comunicación (WhatsApp, foro), es
  válido que resuelvan la Tarea 3 en pareja de forma remota — el objetivo
  pedagógico es que cada estudiante *entienda* la resolución de conflictos,
  no que la descubra en aislamiento total.
- La estructura de paquetes (Tarea 4) es mecánica y de bajo riesgo: si un
  estudiante llega bloqueado únicamente en las Tareas 1-3, priorizar que
  complete al menos la Tarea 4 para no perder la base del proyecto.

## Cierre de la sesión

Como no hay cierre en vivo el viernes, el "cierre" ocurre al abrir la clase
del martes 11 de agosto (T1 — *Diagnóstico y revisión de clases*):

- Dedicar los primeros 10-15 minutos a la verificación rápida de la tabla de
  "Puntos de control" — pedir a 2-3 equipos al azar que compartan pantalla.
- Recoger en el momento quién no completó el laboratorio y por qué, para dar
  seguimiento individual sin detener el avance del resto del grupo.
- Conectar explícitamente con lo que viene: la Semana 2 empieza a llenar
  `model/domain/` con clases encapsuladas de verdad — el repositorio y la
  estructura de carpetas de este laboratorio son la base literal sobre la que
  se trabaja desde ese mismo día.
- Recordar que las ramas `feature/` que se abran desde ahora deben salir de
  `development`, no de `main` (la convención completa de la lección T2), algo
  que este primer laboratorio, al ser un ejercicio individual sin repositorio
  de equipo aún consolidado, no exige todavía.

## Materiales y preparación previa

Antes del jueves 6 de agosto (para poder anunciarlo al cierre de la sesión
T2), el docente debe tener listo:

- La guía del estudiante publicada y accesible en la plataforma, para que se
  pueda anunciar en la clase del jueves.
- Confirmación de que cada equipo ya seleccionó su caso de estudio entre los
  seis disponibles (`microdiseno/projects/`) — si algún equipo no lo ha
  hecho, resolverlo antes del viernes para que no sea un bloqueo adicional.
- Un canal de comunicación asincrónico habilitado (foro, WhatsApp, correo)
  para que los estudiantes puedan reportar bloqueos durante el viernes sin
  esperar hasta el martes.
- Verificar que todos los estudiantes tienen Git instalado y una cuenta de
  GitHub creada — esto debería venir de los prerrequisitos técnicos del
  curso, pero conviene confirmarlo antes del festivo, no descubrirlo el
  martes siguiente.
- Tener a mano esta guía docente (con la solución de referencia) para la
  revisión rápida del martes, en vez de tener que reconstruir el ejercicio en
  el momento.
