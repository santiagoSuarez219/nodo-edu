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
  trabajar en equipo con Git y GitHub.

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

Cada pareja crea **un único repositorio** en GitHub, que se usa para los dos
entregables: el Entregable 2 completa los mismos archivos del Entregable 1, no
crea otros nuevos.

1. Uno de los integrantes crea el repositorio con el nombre
   `proyecto-integrador-pc-grupo-N` (cambie `N` por el número de su grupo).
2. Agrega a su compañero o compañera como colaborador
   (`Settings → Collaborators and teams → Add people`).
3. Agrega también al docente, cuenta `santiagoSuarez219`, como colaborador. Si
   el repositorio es privado y el docente no puede verlo, se califica como no
   entregado.
4. Ambos integrantes trabajan en Colab clonando el repositorio con su propio
   token, con comandos en celdas de Colab (`!git clone`, `!git add`,
   `!git commit`, `!git push`; el paso a paso está más abajo).
   **El historial debe mostrar commits de los dos integrantes**,
   con mensajes que describan el cambio ("Imputa plaquetas con la mediana por
   clasificación", no "cambios" ni "final").

Cómo trabajar el repositorio desde Colab (una sola vez por integrante):

1. En GitHub cree un token personal (`Settings → Developer settings → Personal
   access tokens`) con permiso de escritura sobre repositorios.
2. En Colab abra el icono de la llave (Secretos), cree un secreto llamado
   `GITHUB_TOKEN`, pegue allí el token y active "Acceso desde el cuaderno".
   Así el token nunca queda escrito en el cuaderno.
3. En la primera celda del cuaderno clone el repositorio y configure su
   identidad:

```python
from google.colab import userdata

token = userdata.get("GITHUB_TOKEN")
usuario = "su-usuario-de-github"        # cambie por su usuario
repo = "proyecto-integrador-pc-grupo-1" # cambie por el nombre de su repositorio

!git clone https://{usuario}:{token}@github.com/{usuario}/{repo}.git
%cd {repo}
!git config user.name "Su Nombre"
!git config user.email "su-correo@ejemplo.com"
```

   Si el repositorio pertenece a su compañero o compañera, `usuario` debe ser el
   dueño del repositorio, pero el token es el suyo.
4. Antes de subir, traiga los cambios del otro integrante con `!git pull`.
   Para subir: `!git add .`, `!git commit -m "mensaje claro"` y `!git push`.
5. No imprima el token ni lo escriba en una celda: si lo hace, bórrelo del
   cuaderno y genere uno nuevo.

Estructura esperada del repositorio al final del proyecto:

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

---

## Entregable 1 — Análisis con pandas (15 %)

**Plazo:** jueves 5 de noviembre de 2026, 23:59. Se califica el último commit
de la rama `main` hasta esa hora.

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
pareja expone en clase. Se califica el último commit de la rama `main` antes
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

- **10 minutos de exposición + 5 minutos de preguntas** del docente.
- Hablan **los dos integrantes**, en partes equilibradas.
- Contenido mínimo: el problema y la decisión que apoya el dataset, las
  decisiones de limpieza más importantes, 3 a 5 gráficas con su
  interpretación, y las conclusiones y recomendaciones.
- Puede usar diapositivas, el README o el notebook. Tenga el notebook abierto:
  el docente puede pedir que muestre y explique cualquier celda.
- Las preguntas se dirigen a **cualquiera de los dos** integrantes, sobre
  cualquier parte del proyecto.

---

## Criterios de Evaluación

Cada entregable se califica sobre 100 puntos con su rúbrica, y ese puntaje se
convierte después a la escala institucional de 0 a 5.

### Rúbrica del Entregable 1 — Análisis con pandas (15 %)

| Criterio | Puntos | Descripción |
|---|---|---|
| **Repositorio y trabajo en pareja** | 10 | El repositorio se llama `proyecto-integrador-pc-grupo-N`, el docente es colaborador y puede verlo, sigue la estructura pedida (`data/`, `notebooks/`, `README.md`), y el historial tiene commits de los dos integrantes con mensajes que describen el cambio. |
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
| **Exposición** | 15 | Dura 10 minutos (±2); exponen ambos integrantes; cubre problema, limpieza, gráficas con su interpretación y recomendaciones; ambos responden con acierto las preguntas sobre el código y las decisiones del proyecto. |
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
a la nota de un integrante si en ese entregable no tiene commits propios en el
repositorio, o si en la exposición o al preguntarle no logra explicar el código
o las decisiones del proyecto. Repartan el trabajo de modo que ambos conozcan
todo el análisis.

### Entregas tardías y casos que no se califican

- Los commits posteriores al plazo no se tienen en cuenta: se califica el
  último commit en `main` antes del plazo.
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

### "Mi compañero hizo push y ahora no puedo subir mis cambios"
- Antes de empezar a trabajar ejecute `!git pull` y no editen el mismo notebook
  al mismo tiempo: acuerden quién trabaja en cada momento o repártanse
  secciones y turnos. Un notebook editado en paralelo por dos personas produce
  conflictos difíciles de resolver.

### "La imagen no aparece en el README"
- Verifique que el archivo PNG está en `visualizaciones/`, que hizo commit y
  push de esa carpeta, y que la ruta en el README es relativa:
  `![Casos por semana](visualizaciones/casos-por-semana-y-lluvia.png)`.

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
