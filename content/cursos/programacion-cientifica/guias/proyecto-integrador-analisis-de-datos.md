---
title: "Proyecto integrador — Análisis de datos con pandas, Matplotlib y Seaborn"
updatedAt: "2026-10-28"
---

# Proyecto integrador — Análisis de datos con pandas, Matplotlib y Seaborn

> **El proyecto integrador vale el 35 % de la nota final del curso** y se
> entrega en dos partes: el **Entregable 1 (pandas, 15 %)** el jueves 5 de
> noviembre y el **Entregable 2 (Matplotlib, Seaborn y exposición, 20 %)** el
> jueves 19 de noviembre de 2026. Se desarrolla **en parejas**, y cada pareja
> trabaja sobre un conjunto de datos asignado por el docente.

## Objetivo

Analizar un conjunto de datos con los problemas de los datos reales —faltantes,
valores sospechosos, variables categóricas y numéricas— para responder preguntas que
apoyen una decisión importante en un campo del conocimiento: salud pública,
seguridad, logística, ciberseguridad, medio ambiente o educación. El proyecto
reúne lo visto en las lecciones **"Carga e inspección de datos y selección del
proyecto"**, **"Filtrado, agregación y limpieza de datos"** y **"Matplotlib y
Seaborn"**.

Competencias esperadas:
- Cargar e inspeccionar un dataset desconocido con pandas y describirlo con
  precisión.
- Diagnosticar la calidad de los datos: faltantes, faltantes que significan
  "no aplica", atípicos, códigos centinela e inconsistencias.
- Decidir con criterio entre eliminar e imputar, medir el costo de cada decisión
  y documentarla.
- Responder preguntas de análisis con filtrado, ordenamiento y agregación por
  grupos.
- Construir gráficas univariadas y multivariadas pertinentes, claras y bien
  interpretadas con Matplotlib y Seaborn.
- Comunicar los hallazgos por escrito (README) y oralmente (exposición), y
  trabajar en equipo y publicar el proyecto en un repositorio de GitHub.

---

## Grupos y conjuntos de datos

Cada pareja trabaja **solo** con el dataset de su grupo. El docente asigna los
grupos en clase. Todos los datasets tienen entre 1.850 y 4.505 filas y
traen su **diccionario de datos**: léalo completo antes de empezar.

| Grupo | Campo | Conjunto de datos | Diccionario | Integrantes |
|---|---|---|---|---|
| 1 | Salud pública | [Casos de dengue en Antioquia (2025)](/documentos/programacion-cientifica/datasets/salud_dengue_antioquia_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/salud_dengue_antioquia_2025.md) | Por asignar en clase |
| 2 | Seguridad | [Incidentes de seguridad en Medellín (2025)](/documentos/programacion-cientifica/datasets/seguridad_incidentes_medellin_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/seguridad_incidentes_medellin_2025.md) | Por asignar en clase |
| 3 | Logística | [Entregas de última milla en el Valle de Aburrá (2025)](/documentos/programacion-cientifica/datasets/logistica_entregas_valle_aburra_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/logistica_entregas_valle_aburra_2025.md) | Por asignar en clase |
| 4 | Ciberseguridad | [Incidentes de ciberseguridad en Colombia (2023-2025)](/documentos/programacion-cientifica/datasets/ciberseguridad_incidentes_colombia_2023_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/ciberseguridad_incidentes_colombia_2023_2025.md) | Por asignar en clase |
| 5 | Ambiental | [Calidad del aire en el Valle de Aburrá (2025)](/documentos/programacion-cientifica/datasets/ambiental_calidad_aire_valle_aburra_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/ambiental_calidad_aire_valle_aburra_2025.md) | Por asignar en clase |
| 6 | Educación | [Resultados tipo Saber 11 en Antioquia (2025)](/documentos/programacion-cientifica/datasets/educacion_saber11_antioquia_2025.csv) | [diccionario](/documentos/programacion-cientifica/datasets/educacion_saber11_antioquia_2025.md) | Por asignar en clase |

> ⚠️ **Los datos son sintéticos:** se generaron para este curso a partir de
> fenómenos reales de Colombia. Los lugares existen, las cifras no. Sus
> conclusiones valen para el dataset, no para la realidad: dígalo así en el
> README y en la exposición.

**Cómo cargarlo:** descargue el CSV desde esta página (con su sesión de Nodo
iniciada) o desde el Google Drive del curso, súbalo a la carpeta `data/` de su
repositorio y léalo con una ruta relativa, por ejemplo
`pd.read_csv("data/salud_dengue_antioquia_2025.csv")`. No lo lea desde la URL
de Nodo: Colab no tiene su sesión y recibiría la página de inicio de sesión en
lugar del archivo.

---

## Repositorio del proyecto

GitHub es el lugar donde su pareja guarda y entrega el proyecto. **Úselo como
usaría una carpeta compartida de Google Drive:** crea carpetas, sube archivos
arrastrándolos desde el navegador y los abre para leerlos. **No necesita
comandos, terminal ni conocimientos de Git.** Cada pareja crea **un único
repositorio** (la "carpeta" del proyecto) que se usa para los dos entregables:
el Entregable 2 completa los mismos archivos del Entregable 1, no crea otros
nuevos.

### Paso 1. Cree el repositorio (un solo integrante)

1. Entre a [github.com](https://github.com) con su cuenta. Si no tiene, cree una
   con su correo (es gratis) y confírmela desde el correo que le llega.
2. Arriba a la derecha pulse el botón **`+`** y elija **`New repository`**.
3. En **`Repository name`** escriba `proyecto-integrador-pc-grupo-N`, cambiando
   `N` por el número de su grupo (por ejemplo `proyecto-integrador-pc-grupo-3`).
4. En **`Description`** puede escribir el tema de su dataset (opcional).
5. Elija **`Private`** (solo lo ven quienes usted invite).
6. Marque la casilla **`Add a README file`**: así el repositorio ya nace con su
   `README.md`.
7. Pulse el botón verde **`Create repository`**.

### Paso 2. Invite a su compañero o compañera y al docente

1. Dentro del repositorio, pulse **`Settings`** (pestaña de arriba, a la derecha).
2. En el menú de la izquierda elija **`Collaborators`**. GitHub puede pedirle su
   contraseña otra vez: es normal.
3. Pulse **`Add people`**, escriba el usuario de GitHub de su compañero o
   compañera y selecciónelo en la lista.
4. Repita el paso 3 con el usuario del docente: **`santiagoSuarez219`**.
5. Cada invitado recibe un correo de GitHub con un botón **`Accept invitation`**;
   debe aceptarlo para poder entrar al repositorio.

> Si el docente no puede ver su repositorio al calificar, el entregable se
> califica con 0. Revise que la invitación quedó enviada (aparece como
> `Pending invite` hasta que se acepta).

### Paso 3. Cree las carpetas y suba los archivos

El repositorio debe quedar con esta estructura:

```
proyecto-integrador-pc-grupo-N/
├── data/
│   └── <archivo-del-dataset>.csv
├── notebooks/
│   └── analisis.ipynb          ← Entregable 1 (pandas) + Entregable 2 (gráficas)
├── visualizaciones/            ← Entregable 2: las gráficas exportadas en PNG
│   └── ...
└── README.md                   ← Entregable 1 + Entregable 2
```

**Cómo crear una carpeta.** GitHub no permite crear carpetas vacías: se crean
junto con su primer archivo.

1. En la página principal del repositorio pulse **`Add file`** y luego
   **`Create new file`**.
2. En la casilla de nombre escriba `data/LEEME.md`. Al escribir la barra `/`,
   GitHub convierte `data` en una carpeta.
3. En el cuadro grande escriba una línea cualquiera, por ejemplo
   `Datos del proyecto`.
4. Pulse **`Commit changes...`** (botón verde arriba a la derecha) y luego
   **`Commit changes`** en la ventana que aparece. Dejar el mensaje que GitHub
   propone está bien.
5. Repita para `notebooks/LEEME.md` y `visualizaciones/LEEME.md`. Esos archivos
   `LEEME.md` solo sirven para crear la carpeta; puede dejarlos.

**Cómo subir el CSV a `data/`:**

1. Descargue el CSV de su grupo (enlace en la tabla de grupos) a su computador.
2. En el repositorio, entre a la carpeta `data` (haga clic en su nombre).
3. Pulse **`Add file`** y luego **`Upload files`**.
4. Arrastre el CSV a la zona punteada (o pulse `choose your files`), espere a
   que termine la barra de carga y pulse **`Commit changes`**.

Así sube cualquier archivo a cualquier carpeta: **primero entre a la carpeta,
luego `Add file` → `Upload files`.** Si sube un archivo con el mismo nombre que
uno que ya existe, lo reemplaza.

**Cómo ver, cambiar o borrar un archivo:** haga clic en el archivo. Arriba a la
derecha aparece el lápiz (`Edit this file`) para editar texto y el menú `...`
con la opción `Delete file`.

### Paso 4. Lleve el notebook de Colab al repositorio

Trabajen el análisis en **un solo cuaderno de Colab**, como lo harían en un
documento de Google Docs:

1. Uno de los dos crea el cuaderno en Colab y lo **comparte** con el otro desde
   el botón **`Compartir`** (arriba a la derecha), con permiso de
   **`Editor`**. Así los dos trabajan sobre el mismo cuaderno.
2. Para leer el CSV en Colab, súbalo al panel de archivos (icono de carpeta a
   la izquierda, botón de subir) y léalo con
   `pd.read_csv("nombre-del-archivo.csv")`. Al reiniciar el entorno de
   Colab los archivos subidos se borran: súbalo de nuevo cuando lo necesite.
3. Para guardar el cuaderno en GitHub use el menú de Colab
   **`Archivo` → `Guardar una copia en GitHub`**. La primera vez, Colab pide
   permiso para conectarse con su cuenta de GitHub: acéptelo.
4. En la ventana que aparece elija su repositorio
   (`proyecto-integrador-pc-grupo-N`), la rama **`main`**, y en
   **`Nombre del archivo`** escriba `notebooks/analisis.ipynb`. Deje marcada la
   casilla **`Incluir un enlace a Colab`**. Pulse **`Aceptar`**.
5. Guardar de nuevo con **el mismo nombre de archivo** reemplaza la versión
   anterior. Haga esto **al terminar cada sesión de trabajo** y, sobre todo,
   **antes del plazo de cada entregable**.

> Si el repositorio es del compañero o la compañera, Colab solo le mostrará el
> repositorio al integrante dueño o a quien haya aceptado la invitación como
> colaborador. Acuerden **quién guarda en GitHub**; basta con que lo haga uno.

**Alternativa si `Guardar una copia en GitHub` le da problemas:** en Colab elija
`Archivo` → `Descargar` → `Descargar .ipynb`, entre a la carpeta `notebooks`
del repositorio y súbalo con `Add file` → `Upload files`.

### Paso 5. Suba las gráficas (Entregable 2)

1. En el cuaderno, guarde cada gráfica con `plt.savefig(...)` (ver el
   Entregable 2) y descárguela a su computador con esta celda:

```python
from google.colab import files

files.download("visualizaciones/casos-por-semana-y-lluvia.png")
```

   (cambie el nombre por el de su gráfica; si usó otra ruta en `savefig`, use la misma aquí).
2. En el repositorio, entre a la carpeta `visualizaciones`, pulse
   **`Add file` → `Upload files`**, arrastre todas las imágenes juntas y pulse
   **`Commit changes`**.

### Paso 6. Escriba el README

El `README.md` es la página de presentación de su proyecto: GitHub la muestra
automáticamente al entrar al repositorio. Se escribe en **Markdown**, un texto
sencillo con unos pocos símbolos.

**Cómo editarlo:**

1. En la página principal del repositorio haga clic en `README.md`.
2. Pulse el icono del lápiz (`Edit this file`).
3. Escriba o pegue su texto. Con la pestaña **`Preview`** (arriba del cuadro) ve
   cómo va a quedar, sin guardar todavía.
4. Pulse **`Commit changes...`** y luego **`Commit changes`**.

Si prefieren, pueden redactarlo primero en un documento de Google Docs o en
las celdas de texto de Colab y pegarlo después; Markdown se pega tal cual.

**Los símbolos de Markdown que necesita:**

| Quiere escribir | Escriba | Resultado |
|---|---|---|
| Un título grande | `# Título` | Título de primer nivel |
| Un subtítulo | `## Subtítulo` | Título de sección |
| Negrita | `**texto**` | **texto** |
| Una lista | `- primer punto` (una línea por punto) | Lista con viñetas |
| Una lista numerada | `1. primer punto` | Lista numerada |
| Código | una línea con tres tildes invertidas antes y otra después del código | Bloque de código |
| Una imagen | `![descripción](visualizaciones/mi-grafica.png)` | La imagen insertada |
| Un enlace | `[texto](https://enlace)` | Enlace |

**Una tabla** se escribe con barras verticales; la segunda línea separa el
encabezado:

```markdown
| Columna | Problema | % afectado | Decisión |
|---|---|---|---|
| plaquetas | Faltantes | 8 % | Mediana por clasificación |
```

**Una imagen en el README:** suba primero el PNG a `visualizaciones/` (Paso 5) y
escriba la ruta **exactamente igual que el nombre del archivo**, con minúsculas
y sin espacios.

**Deje una línea en blanco** entre un párrafo, una lista o una tabla y lo que
sigue; si no, GitHub los mezcla.

En el Entregable 1 y en el Entregable 2 encontrará qué secciones debe tener el
README y una plantilla para copiar.

### Reglas para trabajar en pareja sin pisarse

- No hay que hacer "commits" a mano ni escribir mensajes: cada vez que pulsa
  `Commit changes` GitHub guarda los cambios. **No se exige que ambos suban
  archivos ni que los mensajes sean descriptivos.**
- Acuerden **quién edita cada archivo y cuándo**, igual que con un Google Doc.
  Si los dos editan el mismo notebook o el mismo README a la vez, GitHub avisa
  que el archivo cambió y uno de los dos puede perder su trabajo.
- Antes de editar un archivo en GitHub, recargue la página para ver la
  última versión.
- Revise el resultado: abra la dirección del repositorio en una ventana de
  incógnito o pídale a su compañero que lo abra, y confirme que se ven las tres
  carpetas, el `README.md` y el notebook.


---

## Entregable 1 — Análisis con pandas (15 %)

**Plazo:** jueves 5 de noviembre de 2026, 23:59. Se califica el contenido del
repositorio hasta esa hora.

### Qué debe contener el notebook `notebooks/analisis.ipynb`

Cada sección empieza con una celda de texto que explica qué se hace y por qué, y
cada resultado relevante se interpreta en una celda de texto propia (qué dice
el número, no solo el número).

1. **Portada:** título del proyecto, grupo, nombres completos de los
   integrantes, fecha y el enlace al notebook en Colab.
2. **Carga e inspección:** lectura del CSV con ruta relativa; `shape`, `head`,
   `info`, `dtypes` y `describe`; `value_counts` de las columnas categóricas
   principales. Si alguna columna tiene un tipo incorrecto (una fecha leída
   como texto, por ejemplo), conviértala y explique por qué.
3. **Diagnóstico de calidad:** cantidad **y porcentaje** de faltantes por
   columna; cuáles de esos faltantes significan "no aplica" según el
   diccionario; valores atípicos o imposibles detectados con `describe` y
   filtros; cualquier código raro, fila repetida o categoría escrita de varias
   formas que encuentre.
4. **Limpieza:**
   - Elimine al menos una columna con demasiados faltantes, o justifique con
     datos por qué la conserva.
   - Impute al menos **dos columnas con estrategias distintas** (por ejemplo,
     mediana, moda, mediana por grupo) y explique por qué cada estrategia es la
     adecuada para esa columna.
   - Decida qué hacer con los atípicos y valores imposibles: señalarlos,
     convertirlos en faltantes o excluirlos, con justificación.
   - **No impute** los faltantes que significan "no aplica".
   - Muestre el costo de cada decisión: filas antes y después de cada
     eliminación, cantidad de valores imputados.
5. **Preguntas de análisis:** responda **al menos cuatro preguntas** sobre la
   decisión que apoya su dataset (el diccionario sugiere algunas; puede
   proponer otras). Use selección con `loc`, filtrado booleano,
   `sort_values` y `groupby` con agregaciones. Incluya `count` en las
   agregaciones para saber con cuántos datos se calculó cada promedio.
6. **Conclusiones parciales:** qué responden los datos hasta aquí y qué queda
   por explorar con las gráficas.

### Qué debe contener el `README.md`

El README es el informe del proyecto: alguien que no abra el notebook debe
entender qué se hizo y qué se encontró. Use esta estructura:

```markdown
# Proyecto integrador — Grupo N: <título>

## Integrantes
## El conjunto de datos
   Contexto, origen (sintético), número de filas y columnas, qué es cada fila,
   tabla resumen de las columnas (nombre, tipo, descripción) y la decisión que apoya.
## Preguntas de análisis
   Las preguntas que responde el proyecto, numeradas.
## Calidad de los datos y limpieza
   Tabla de decisiones: columna | problema | % afectado | decisión | justificación.
## Hallazgos
   La respuesta a cada pregunta, con las cifras que la sostienen.
## Cómo ejecutar el notebook
   Enlace a Colab y pasos para correrlo de principio a fin.
```

**Antes de entregar:** ejecute `Entorno de ejecución → Reiniciar y ejecutar
todas` y confirme que no hay errores. Un notebook que solo funciona ejecutando
las celdas en desorden se califica como si no se ejecutara.

---

## Entregable 2 — Visualización con Matplotlib y Seaborn, y exposición (20 %)

**Plazo:** jueves 19 de noviembre de 2026, al inicio de la clase. Ese día cada
pareja expone en clase. Se califica el contenido del repositorio antes
del inicio de la clase.

### Qué debe agregar al notebook

Una nueva sección de visualización, al final del mismo `analisis.ipynb`, que
trabaja sobre los datos **ya limpios** del Entregable 1:

1. **Al menos tres gráficas univariadas** de tipos distintos (histograma,
   barras, caja, entre otras), sobre variables numéricas y categóricas.
2. **Al menos cuatro gráficas multivariadas** que relacionen dos o más
   variables, por ejemplo:
   - una numérica contra otra (dispersión);
   - una numérica por categoría (cajas por grupo o barras de un promedio por
     grupo);
   - una evolución en el tiempo (líneas), si su dataset tiene fechas;
   - un mapa de calor (de correlaciones o de una tabla de dos categorías).
3. **Matplotlib y Seaborn:** cada librería debe aparecer en al menos dos
   gráficas.
4. Cada gráfica con **título, ejes rotulados con su unidad y leyenda** cuando
   haya más de una serie o grupo.
5. Debajo de cada gráfica, una **celda de texto de interpretación**: qué
   pregunta responde, qué se observa (con cifras) y qué implica para la
   decisión.
6. Exporte cada gráfica a `visualizaciones/` con `plt.savefig(...)` en formato
   PNG, con un nombre que describa su contenido
   (`casos-por-semana-y-lluvia.png`, no `grafica1.png`).

### Qué debe agregar al `README.md`

- Una sección **`## Visualizaciones`** con las gráficas más importantes
  (mínimo cuatro) insertadas como imagen desde `visualizaciones/` y, debajo de
  cada una, su interpretación en dos o tres líneas.
- Una sección **`## Conclusiones y recomendaciones`**: la respuesta final a cada
  pregunta de análisis y al menos **tres recomendaciones concretas** para quien
  debe tomar la decisión, cada una respaldada por un hallazgo.
- Una sección **`## Limitaciones`**: qué no permite concluir el dataset
  (datos sintéticos, faltantes, grupos pequeños, correlación que no implica
  causa).

### Exposición final

- La exposición dura **15 minutos como máximo**, en total. Ensaye para no
  pasarse: al cumplirse el tiempo el docente la detiene.
- Hablan **los dos integrantes**, en partes equilibradas.
- Debe explicar cuatro cosas:
  1. **El problema:** qué decisión apoya el conjunto de datos y qué preguntas
     se quiso responder.
  2. **Los datos:** qué representa cada fila, cuántas filas y columnas hay, qué
     variables son categóricas y cuáles numéricas.
  3. **La limpieza y el procesamiento:** qué problemas de calidad encontraron
     y qué decidieron en cada caso (eliminar, imputar, excluir) y por qué.
  4. **Las gráficas:** de 3 a 5 gráficas con su interpretación: qué se observa,
     con cifras, y qué implica para la decisión.
- Puede usar diapositivas, el README o el notebook. Tenga el notebook abierto:
  el docente puede pedir que muestre y explique cualquier celda, y puede
  hacerle preguntas a **cualquiera de los dos** integrantes durante la
  exposición.

---

## Criterios de Evaluación

Cada entregable se califica sobre 100 puntos con su rúbrica, y ese puntaje se
convierte después a la escala institucional de 0 a 5.

### Rúbrica del Entregable 1 — Análisis con pandas (15 %)

| Criterio | Puntos | Descripción |
|---|---|---|
| **Repositorio y organización** | 10 | El repositorio se llama `proyecto-integrador-pc-grupo-N`, el docente es colaborador y puede verlo, tiene las carpetas pedidas (`data/`, `notebooks/`, `visualizaciones/` en el Entregable 2) con los archivos en su lugar, el `README.md` se ve en la página principal y el notebook se abre desde el repositorio. |
| **Descripción del conjunto de datos (README)** | 10 | El README explica el contexto del dataset, aclara que es sintético, indica filas y columnas y qué representa cada fila, resume las columnas en una tabla (nombre, tipo, descripción) y enuncia la decisión que apoya y las preguntas de análisis numeradas. |
| **Carga e inspección** | 10 | El CSV se carga con ruta relativa desde `data/`; se usan `shape`, `head`, `info`, `dtypes`, `describe` y `value_counts` de las categóricas principales, y cada salida se interpreta en una celda de texto. Los tipos incorrectos se corrigen y se explica por qué. |
| **Diagnóstico de calidad** | 15 | Se reporta la cantidad y el porcentaje de faltantes por columna; se distinguen los faltantes reales de los que significan "no aplica"; se identifican con evidencia (salida de `describe`, filtros) los atípicos, valores imposibles, códigos centinela, filas repetidas o categorías inconsistentes que tenga el dataset. |
| **Limpieza justificada** | 20 | Se elimina al menos una columna con muchos faltantes (o se justifica con datos conservarla); se imputan al menos dos columnas con estrategias distintas, cada una justificada según el tipo de dato y su distribución; los faltantes de "no aplica" no se imputan; los atípicos se tratan con justificación; se muestra el costo de cada decisión (filas antes/después, valores imputados). |
| **Filtrado y agregación** | 20 | Se responden al menos cuatro preguntas de análisis usando `loc`, filtrado booleano, `sort_values` y `groupby` con agregaciones (incluido `count`); cada respuesta tiene una celda de texto que la interpreta con cifras y la relaciona con la decisión. |
| **README del análisis** | 10 | El README contiene la tabla de decisiones de limpieza (columna, problema, % afectado, decisión, justificación), los hallazgos de cada pregunta con sus cifras y las instrucciones para ejecutar el notebook. Coincide con lo que hace el notebook. |
| **Notebook ejecutable y documentado** | 5 | El notebook corre completo con `Reiniciar y ejecutar todas` sin errores, tiene la portada pedida, cada sección empieza con una celda de texto, y las variables usan nombres descriptivos en `snake_case` sin tildes. |
| **TOTAL** | **100** | |

### Rúbrica del Entregable 2 — Visualización y exposición (20 %)

| Criterio | Puntos | Descripción |
|---|---|---|
| **Gráficas univariadas** | 15 | Hay al menos tres gráficas univariadas de tipos distintos, cada una adecuada al tipo de variable (histograma o caja para numéricas, barras para categóricas), construidas sobre los datos limpios. |
| **Gráficas multivariadas** | 20 | Hay al menos cuatro gráficas que relacionan dos o más variables, de tipos distintos y adecuadas a la relación que muestran (dispersión, cajas o barras por grupo, líneas en el tiempo, mapa de calor). Matplotlib y Seaborn aparecen cada una en al menos dos gráficas. |
| **Claridad y buenas prácticas** | 15 | Toda gráfica tiene título, ejes rotulados con unidad y leyenda cuando hay varios grupos; las etiquetas se leen sin superponerse; las categorías siguen un orden con sentido; las gráficas están exportadas en `visualizaciones/` en PNG con nombres descriptivos. |
| **Interpretación** | 20 | Debajo de cada gráfica hay una celda de texto que dice qué pregunta responde, qué se observa con cifras concretas y qué implica para la decisión; no se afirman causas que la gráfica no demuestra. |
| **README final** | 15 | El README tiene la sección `Visualizaciones` (mínimo cuatro imágenes desde `visualizaciones/` con su interpretación), `Conclusiones y recomendaciones` (respuesta a cada pregunta y al menos tres recomendaciones respaldadas por un hallazgo) y `Limitaciones`. |
| **Exposición** | 15 | Dura 15 minutos como máximo; exponen ambos integrantes; explica el problema, los datos, la limpieza y el procesamiento, y las gráficas con su interpretación; ambos explican con acierto el código y las decisiones del proyecto cuando el docente pregunta. |
| **TOTAL** | **100** | |

### Cómo se convierte el puntaje a nota

```
nota_entregable (0-5)      = (puntaje_obtenido / 100) x 5
aporte_entregable_1 (%)    = (puntaje_obtenido / 100) x 15
aporte_entregable_2 (%)    = (puntaje_obtenido / 100) x 20
```

Ejemplo: una pareja que obtiene **80 de 100** en el Entregable 1 saca **4.0**
en la escala de 0 a 5 y aporta **12 %** de los 15 % de ese entregable; si
obtiene **90 de 100** en el Entregable 2, saca **4.5** y aporta **18 %** de
los 20 %.

### Nota de cada integrante

Los dos integrantes reciben la misma nota de la pareja, con un **ajuste
individual**: el docente puede descontar hasta **1.0** (en la escala de 0 a 5)
a la nota de un integrante si, en la exposición o al preguntarle, no logra
explicar el código o las decisiones del proyecto. Repartan el trabajo de modo
que ambos conozcan todo el análisis.

### Entregas tardías y casos que no se califican

- Los cambios hechos en el repositorio después del plazo no se tienen en cuenta:
  GitHub registra la fecha y hora de cada cambio.
- Un repositorio que el docente no puede ver, o un notebook que analiza un
  dataset distinto al asignado, se califica con 0 en ese entregable.

---

## Dificultades Comunes

### "Rellené todos los faltantes con la mediana y ya no hay nulos"
- Eso no siempre es correcto. Si el faltante significa "no aplica" (los días de
  hospitalización de quien no fue hospitalizado, el valor de lo hurtado en una
  riña), imputarlo inventa un dato que no existe. Lea el diccionario y decida
  columna por columna.

### "La mediana general le asigna a un grupo un valor que no le corresponde"
- Si una variable cambia mucho entre grupos, impute con la mediana **de cada
  grupo**: calcule la mediana con `groupby` sobre la columna que define el
  grupo y úsela para rellenar solo las filas de ese grupo. Compare el resultado
  con la mediana general y explique cuál eligió.

### "El mínimo de una columna es -999 o el máximo es imposible"
- Es un código centinela o un error de digitación, no una medición. Señálelo,
  conviértalo en faltante o exclúyalo, y anote cuántas filas afectó. No lo deje
  dentro de un promedio.

### "`value_counts` muestra la misma categoría escrita de varias formas"
- Unifique el texto antes de agrupar (espacios al inicio y al final,
  mayúsculas y minúsculas, tildes). Si no unifica, `groupby` las cuenta como
  grupos distintos.

### "Mi compañero y yo cambiamos el mismo archivo y uno se perdió"
- Acuerden quién edita cada archivo y cuándo, como con un Google Doc. En Colab
  pueden trabajar a la vez en el mismo cuaderno compartido; en GitHub, el
  cuaderno lo guarda **una sola persona** con `Guardar una copia en GitHub`, y
  el README lo edita una persona a la vez.

### "Guardé el cuaderno en GitHub y no aparece en `notebooks/`"
- Revise que en `Nombre del archivo` escribió `notebooks/analisis.ipynb` (con la
  carpeta), que eligió la rama `main` y el repositorio correcto. Si lo guardó en
  otra ruta, entre a GitHub, abra el archivo y use `Delete file`, o súbalo de
  nuevo a la carpeta correcta.

### "La imagen no aparece en el README"
- Verifique que el archivo PNG está en la carpeta `visualizaciones/` del
  repositorio y que la ruta del README coincide **letra por letra** con el
  nombre del archivo (mayúsculas, guiones y extensión `.png`):
  `![Casos por semana](visualizaciones/casos-por-semana-y-lluvia.png)`.
  Use la pestaña `Preview` antes de guardar.

### "El notebook funciona, pero al reiniciar el entorno falla"
- Depende de variables que quedaron en memoria o de celdas ejecutadas en
  desorden. Ejecute `Reiniciar y ejecutar todas` antes de cada entrega: así se
  va a calificar.

---

## Recursos

- **Lecciones del curso:** "Carga e inspección de datos y selección del
  proyecto", "Filtrado, agregación y limpieza de datos" y "Matplotlib y
  Seaborn".
- **Diccionario de datos de su grupo:** enlazado en la tabla de grupos.
- **Documentación oficial:** guías de usuario de pandas
  (pandas.pydata.org), Matplotlib (matplotlib.org) y Seaborn
  (seaborn.pydata.org).
- **Asesorías:** use las sesiones de clase previas a cada entrega para resolver
  dudas del proyecto con el docente.

**Plazos de entrega:** Entregable 1, jueves 5 de noviembre de 2026 a las
23:59. Entregable 2 y exposición, jueves 19 de noviembre de 2026, al inicio de
la clase.
