# Sesión 01 — Google Colab, GitHub y diagnóstico · Guía del docente

## Ficha de la sesión

| Campo | Valor |
|---|---|
| Curso | Programación Científica |
| Semana | 1 — Jueves 6 de agosto de 2026 |
| Modalidad | Presencial, 100% en Google Colab (nada se instala) |
| Duración | 2 h (sesión única semanal) |
| Momento evaluativo | Seguimiento continuo (no es un momento evaluativo ★) |
| Lección teórica de la que depende | `fundamentos-de-control-de-versiones-colab-y-diagnostico.mdx` — el docente presenta esta misma lección en vivo (`presentation: true`, cada `##` es una diapositiva) |
| Sprint del proyecto | Ninguno todavía. El proyecto integrador arranca en la Semana 12; esta sesión crea el repositorio del curso que se reutiliza durante todo el semestre |
| Revisión en clase | No aplica — esta es la primera sesión, no hay contenido previo que revisar |

Esta sesión **sí la dirige el docente en vivo**, a diferencia del Lab 00 de
Estructuras de Datos (ese es trabajo independiente). Aquí el docente proyecta
Colab y GitHub en pantalla y el grupo replica cada paso en su propio equipo,
en tiempo real. Por eso el "desarrollo paso a paso" de esta guía es literalmente
el guion de lo que hay que hacer clic por clic frente al grupo.

## Objetivo de la sesión

Al terminar la clase, el estudiante debe poder:

- Diferenciar una celda de código de una celda de texto en Colab, y ejecutar
  ambas.
- Crear un repositorio en su cuenta de GitHub con la estructura inicial del
  curso (`ejercicios/` + `README.md`).
- Generar su propio Personal Access Token (PAT) y guardarlo como *Colab
  Secret* bajo el nombre exacto `GITHUB_TOKEN`.
- Subir un notebook a GitHub con `Archivo → Guardar una copia en GitHub`
  (**Flujo A**), sin usar terminal ni escribir un comando.
- Volver a abrir ese mismo notebook desde GitHub (`Archivo → Abrir notebook →
  GitHub`) para confirmar que ve la versión que acaba de subir.

## Conexión con la teoría

Esta sesión **es** la lección teórica: no hay una clase separada de
"contenido" y luego un laboratorio aparte. El docente presenta cada sección
`##` del `.mdx` como diapositiva y, en las secciones marcadas **"En la
práctica"**, se detiene a hacer la demostración en vivo antes de que el grupo
la replique. El orden de esta guía sigue exactamente el de la lección:

1. Diagnóstico inicial (cuestionario + reto de lógica) — abre la sesión, antes
   de tocar Colab.
2. Celdas de código y celdas de texto — sección "Bienvenidos a Google Colab" /
   "Celdas de código" / "Celdas de texto".
3. Por qué GitHub — sección "El problema" / "La solución: guardar tu trabajo
   en GitHub".
4. Crear el repositorio — sección "Crear el proyecto del curso en GitHub".
5. PAT y Colab Secret — secciones "Conectar Colab con GitHub" y "Guardar el
   token sin exponerlo".
6. Flujo A (push) y traer cambios (pull) — secciones "Subir tu notebook a
   GitHub" y "Traer los cambios más recientes a Colab".

Si un estudiante llega perdido a la Semana 2, la pregunta de apertura
recomendada es: *"¿En qué paso te trabaste: creando el repositorio, generando
el token, o subiendo el notebook?"* — permite ubicar en segundos si el bloqueo
fue de GitHub (cuenta, repo) o de Colab (secret, botón de guardar).

## Minutado

| Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
|---|---|---|---|
| 0–15 min | Diagnóstico inicial | Reparte/enlaza el cuestionario de autoevaluación y el reto de lógica; aclara que no suma nota | Responde el cuestionario y el reto de forma individual |
| 15–25 min | Bienvenida y tour de Colab | Proyecta un notebook nuevo; crea una celda de código y una de texto en vivo (Paso 1) | Abre su propio Colab y replica ambas celdas |
| 25–35 min | Por qué GitHub | Presenta el escenario del notebook perdido/desactualizado (sección "El problema") sin acción en pantalla todavía | Escucha y responde a las preguntas retóricas de la diapositiva |
| 35–50 min | Crear el repositorio | Crea en vivo el repositorio del curso en su propia cuenta de GitHub, con `ejercicios/` y `README.md` (Paso 2) | Crea su propio repositorio con la misma estructura |
| 50–70 min | PAT y Colab Secret | Genera un PAT de demostración (y lo revoca al terminar la clase) y lo guarda como Colab Secret `GITHUB_TOKEN` (Pasos 3–4) | Genera su propio PAT y su propio Colab Secret |
| 70–100 min | Flujo A: push | Escribe un notebook corto con una celda de código y una de texto, y lo sube con `Archivo → Guardar una copia en GitHub` (Paso 5) | Escribe su propio notebook corto y lo sube con el mismo botón |
| 100–115 min | Traer cambios: pull | Cierra el notebook y lo vuelve a abrir desde `Archivo → Abrir notebook → GitHub` para mostrar que trae la última versión (Paso 6) | Repite la acción sobre su propio notebook y confirma que ve su commit más reciente |
| 115–120 min | Cierre | Resume la síntesis de la lección y anuncia la evidencia de seguimiento | Verifica que su notebook quedó subido y visible en GitHub |

## Desarrollo paso a paso — guion de la demostración en vivo

> Hacer esta demostración con una **cuenta de GitHub de prueba del docente**
> (no la personal), para poder mostrar el flujo completo — incluida la
> generación de un PAT en pantalla — sin exponer credenciales propias.

### Paso 1 — Tour de Colab: celdas de código y de texto

En `colab.research.google.com`, crear un notebook nuevo (`Archivo → Notebook
nuevo`) y mostrar:

- Botón `+ Código` → nueva celda → escribir y ejecutar con `Shift + Enter`:

```python
nombre = "Ana"
print(f"Hola, {nombre}. Bienvenida al curso.")
```

- Botón `+ Texto` → nueva celda → escribir en Markdown:

```text
## Ejercicio 1: suma de dos números
Este ejercicio calcula la suma de dos valores ingresados por el usuario.
```

Punto a resaltar: la celda de texto **no ejecuta nada**, solo se formatea; la
de código sí corre y muestra su salida justo debajo.

### Paso 2 — Crear el repositorio del curso en GitHub

En `github.com`, con sesión iniciada:

1. `+` (esquina superior derecha) → **New repository**.
2. Nombre: `curso-programacion-cientifica`. Visibilidad: **Public** (así el
   docente puede ver el trabajo sin que el estudiante deba invitarlo como
   colaborador).
3. Marcar **Add a README file** al crear el repositorio.
4. Ya creado, usar el botón **Add file → Create new file** para crear
   `ejercicios/README.md` (basta con escribir `ejercicios/README.md` como
   nombre de archivo; GitHub crea la carpeta automáticamente).

Árbol resultante:

```text
curso-programacion-cientifica/
├── ejercicios/
│   └── README.md
└── README.md
```

### Paso 3 — Generar el Personal Access Token (PAT)

En GitHub: avatar (esquina superior derecha) → **Settings** → **Developer
settings** (al final del menú lateral) → **Personal access tokens** →
**Fine-grained tokens** → **Generate new token**.

Configurar en pantalla, explicando cada campo:

| Campo | Valor a usar en la demo |
|---|---|
| Token name | `colab-curso-programacion-cientifica` |
| Expiration | 90 días (o la duración del semestre, si el proveedor lo permite) |
| Repository access | **Only select repositories** → elegir `curso-programacion-cientifica` |
| Permissions | **Contents: Read and write** (es el único permiso que Colab necesita para leer y subir notebooks) |

Clic en **Generate token** → GitHub muestra el token **una sola vez**
(`ghp_xxxxxxxxxxxxxxxxxxxx`). Copiarlo de inmediato: si se pierde la pantalla
sin copiarlo, hay que generar uno nuevo.

> ⚠️ Punto de énfasis para el grupo: este token reemplaza a la contraseña.
> Nadie debe pegarlo en una celda del notebook ni compartirlo por chat.

### Paso 4 — Guardar el token como Colab Secret

De vuelta en Colab:

1. Ícono de llave 🔑 en la barra lateral izquierda → **Secrets**.
2. **+ Add new secret**.
3. Nombre: `GITHUB_TOKEN` (exacto, en mayúsculas — el estudiante lo va a
   necesitar tal cual más adelante en el curso).
4. Valor: pegar el PAT copiado en el Paso 3.
5. Activar el interruptor **Notebook access** para que el notebook actual
   pueda usarlo.

### Paso 5 — Flujo A: subir el notebook a GitHub (push)

En el notebook con la celda de código y la celda de texto del Paso 1:

1. `Archivo → Guardar una copia en GitHub`.
2. Colab pide autorizar el acceso a GitHub la primera vez — aceptar.
3. Seleccionar el repositorio `curso-programacion-cientifica`.
4. Ruta del archivo: `ejercicios/sesion-01-demo.ipynb`.
5. Mensaje describiendo el cambio: `Primer notebook de la sesión 1`.
6. Confirmar.

Verificación en pantalla: recargar la página del repositorio en GitHub y
mostrar que `ejercicios/sesion-01-demo.ipynb` ya aparece listado.

### Paso 6 — Traer los cambios más recientes (pull)

1. Cerrar la pestaña del notebook (o abrir uno nuevo en blanco).
2. `Archivo → Abrir notebook` → pestaña **GitHub**.
3. Buscar `curso-programacion-cientifica` en el campo de repositorio.
4. Seleccionar `ejercicios/sesion-01-demo.ipynb` de la lista.

Verificación en pantalla: el notebook que se abre debe mostrar exactamente el
contenido subido en el Paso 5 — misma celda de código, mismo resultado, misma
celda de texto.

> Al cerrar la sesión, **revocar el PAT de demostración** desde `Settings →
> Developer settings → Personal access tokens` — es una buena práctica de
> higiene de credenciales y refuerza en el grupo que un token se puede
> invalidar en cualquier momento sin tocar la contraseña.

## Puntos de control

| Cuándo | Qué revisar en pantalla del estudiante | Señal de que va bien |
|---|---|---|
| Minuto ~25 | Su notebook en Colab | Tiene al menos una celda de código ejecutada y una celda de texto renderizada |
| Minuto ~50 | Su repositorio en GitHub | Existe, es público (o el docente tiene acceso), y contiene `ejercicios/README.md` |
| Minuto ~70 | Panel de Secrets en Colab | Existe un secret llamado exactamente `GITHUB_TOKEN`, con el interruptor de acceso al notebook activado |
| Minuto ~100 | Repositorio en GitHub tras el push | El archivo `ejercicios/sesion-01-demo.ipynb` (o el nombre que haya usado) aparece listado con el mensaje que escribió |
| Minuto ~115 | Notebook reabierto desde GitHub | El contenido coincide con lo que subió; no aparece un notebook vacío ni uno antiguo |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| Al hacer clic en "Guardar una copia en GitHub", Colab no muestra el repositorio en la lista | El repositorio se creó como privado y el PAT no tiene permisos suficientes, o el estudiante nunca autorizó el acceso de Colab a GitHub | Revisar visibilidad del repo y repetir la autorización desde `Archivo → Guardar una copia en GitHub` |
| El secret no funciona / Colab pide autenticarse de nuevo cada vez | El interruptor **Notebook access** del secret quedó apagado | Volver al panel de llave 🔑 y activarlo para el notebook actual |
| El PAT "no sirve" al momento de subir | Se generó con **Repository access: Public repositories** en vez de seleccionar el repo específico, o el permiso de **Contents** quedó en solo lectura | Regenerar el token con **Only select repositories** → el repo del curso, y **Contents: Read and write** |
| El estudiante subió el notebook pero a la carpeta equivocada (o a la raíz) | No completó el campo de ruta (`ejercicios/...`) en el diálogo de "Guardar una copia en GitHub" | Repetir el paso especificando la ruta completa; mover el archivo desde la interfaz de GitHub si ya quedó mal ubicado |
| Al reabrir con `Archivo → Abrir notebook → GitHub`, ve una versión vieja o vacía | Buscó en el repositorio equivocado, o seleccionó un notebook distinto al que acaba de subir | Confirmar en GitHub cuál es el nombre exacto del archivo subido y repetir la búsqueda con ese nombre |
| El navegador bloquea la ventana emergente de autorización de GitHub | Bloqueador de pop-ups activo | Permitir pop-ups para `colab.research.google.com` y reintentar |
| El PAT copiado tiene espacios o quedó incompleto | Copió el token antes de que GitHub terminara de mostrarlo, o el portapapeles capturó texto adicional | Generar un token nuevo — el anterior no se puede recuperar, solo revocar |

## Preguntas socráticas

- *"Si borraran su notebook del Drive ahora mismo, ¿perderían el trabajo que
  ya subieron a GitHub?"* — Respuesta esperada: no; GitHub guardó su propia
  copia independiente al hacer el push, con la versión exacta de ese momento.
- *"¿Por qué GitHub no acepta usuario y contraseña para que Colab suba el
  notebook?"* — Respuesta esperada: una contraseña filtrada da acceso a toda
  la cuenta; un PAT tiene permisos limitados (solo ese repositorio) y se puede
  revocar sin cambiar la contraseña.
- *"¿Qué pasaría si pegaran el token directamente en una celda del
  notebook?"* — Respuesta esperada: quedaría visible para cualquiera que vea
  el notebook público, incluido el propio repositorio donde lo suben — hay
  que revocarlo de inmediato si eso ocurre.
- *"Si su compañero de equipo sube un notebook nuevo, ¿ustedes lo ven
  automáticamente en su Colab?"* — Respuesta esperada: no; hay que abrirlo
  explícitamente con `Archivo → Abrir notebook → GitHub` para traer esa
  versión más reciente.

## Diferenciación

**Estudiantes de semestres avanzados que terminan antes:**
- Pedirles que exploren la pestaña de historial del repositorio en GitHub
  (sin explicarla formalmente) y describan en una celda de texto qué
  información ven ahí.
- Retarlos a subir un segundo notebook a `ejercicios/` con un nombre distinto
  y luego practicar el pull sobre ambos.

**Estudiantes de primer semestre que se atrasan:**
- Priorizar que completen el Paso 2 (repositorio) y el Paso 5 (push) antes que
  el Paso 6 (pull) — el pull es menos crítico como evidencia de seguimiento
  de hoy y se puede reforzar la próxima semana.
- Si el bloqueo es la generación del PAT (Paso 3), es válido que el docente lo
  genere proyectado paso a paso una segunda vez solo para ese subgrupo,
  mientras el resto avanza.
- Emparejar con un estudiante avanzado que ya completó el flujo, siguiendo la
  recomendación de mentoría entre pares del curso.

## Cierre de la sesión

- Recoger el resultado del diagnóstico (para calibrar el ritmo de las
  próximas sesiones) y confirmar que cada estudiante tiene su primer notebook
  visible en GitHub — esa es la evidencia de seguimiento de hoy.
- Anunciar que desde la Semana 2 el flujo de subida (**Flujo A**) se repite
  cada sesión: un notebook por clase, un push por notebook.
- Adelantar que el repositorio creado hoy es el mismo que se usa durante todo
  el semestre — incluido el proyecto integrador de la Semana 12 en adelante,
  cuando se introduce un segundo flujo de trabajo (**Flujo B**, con comandos
  `git` dentro de Colab) para manejar una estructura de carpetas más compleja.

## Materiales y preparación previa

Antes del jueves 6 de agosto, el docente debe tener listo:

- Una cuenta de GitHub de prueba (no la personal) para hacer la demostración
  en vivo, incluida la generación de un PAT en pantalla.
- Verificar que el proyector/pantalla compartida permite mostrar con
  suficiente tamaño de letra tanto Colab como la interfaz de GitHub —
  varios pasos dependen de que el grupo lea nombres de botones y campos
  exactos.
- El cuestionario de autoevaluación y el reto breve de lógica del diagnóstico
  listos y enlazados (o impresos) para repartir al inicio de la sesión.
- Confirmar que la red del salón no bloquea `github.com` ni el pop-up de
  autorización de Colab hacia GitHub — probarlo con antelación, no
  descubrirlo en clase.
- Revisar que todos los estudiantes llegan con una cuenta de Google (para
  Colab) y de GitHub ya creadas — viene de los prerrequisitos técnicos del
  curso, pero conviene confirmarlo antes de la sesión.
