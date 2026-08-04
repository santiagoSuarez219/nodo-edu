# Curso de Introducción a la Programación Científica

**Programa:** Tecnología en Desarrollo de Software
**Créditos:** 2 | **Tipo de crédito:** Optativo | **Modalidad:** Presencial
**Horas presenciales:** 32 h (16 sesiones de 2 h) | **Horas independientes:** 64 h
**Prerrequisitos:** No aplica | **Correquisitos:** Ninguno

---

## ⚠️ Consideración pedagógica: diversidad de niveles

Al no tener prerrequisitos en el pensum, el curso recibe estudiantes de primer semestre (sin experiencia previa en programación), semestres intermedios y últimos semestres en una misma cohorte. El curso se calibra al nivel de entrada más bajo (primer semestre) y compensa la heterogeneidad con:

- **Semanas 1 a 11 con ejercicios guiados, no con proyecto propio.** Se trabaja sobre datasets de juguete provistos por el docente, para que la carga cognitiva esté en aprender a programar y no en gestionar un proyecto (elegir dataset, mantener bitácora, organizar entregas incrementales). Un estudiante de primer semestre no tiene aún la autonomía para sostener ambas cosas a la vez.
- **El proyecto integrador se introduce solo a partir de la semana 12**, una vez que ya se cubrió toda la base (Python, estructuras, POO, NumPy) y falta menos trecho hasta el final del semestre. En ese punto el proyecto es más manejable: 5 semanas, con Pandas y visualización como eje.
- **Diagnóstico inicial** (Semana 1): cuestionario corto + reto de codificación breve para identificar el nivel real de cada estudiante.
- **Retos de extensión opcionales** en cada laboratorio, dirigidos a estudiantes de semestres avanzados que ya dominan la base (p. ej. optimizar con vectorización, agregar una función adicional, explorar un caso más complejo del dataset).
- **Mentoría entre pares**: se recomienda emparejar estudiantes avanzados con estudiantes de primer semestre durante las sesiones prácticas.
- **Cero configuración local**: todo el curso —incluyendo Git y GitHub— se trabaja desde Google Colab. Ningún estudiante necesita instalar Python, Git ni librerías en su propio computador, lo que reduce otra fuente de fricción para quienes recién empiezan.

---

## **📝 Evaluación del curso**

| Actividad                                                                             | Porcentaje | Fecha                            |
| ---------------------------------------------------------------------------------------- | ---------- | ---------------------------------- |
| **Momento evaluativo 1:** Programación con Python — variables, condicionales, bucles     | 15%        | Semana 4 — jueves 27 de agosto de 2026     |
| **Momento evaluativo 2:** Estructuras de datos + POO                                     | 15%        | Semana 8 — jueves 24 de septiembre de 2026     |
| **Momento evaluativo 3:** NumPy                                                          | 15%        | Semana 11 — jueves 15 de octubre de 2026    |
| **Momento evaluativo 4:** Pandas (aplicado al proyecto integrador)                       | 15%        | Semana 14 — jueves 5 de noviembre de 2026    |
| **Momento evaluativo 5:** Matplotlib y Seaborn (portafolio + presentación del proyecto)  | 20%        | Semana 16 — jueves 19 de noviembre de 2026    |
| **Seguimiento**                                                                           | 20%        | Durante todo el semestre           |

*El **Seguimiento** agrupa actividades formativas cortas (quices, ejercicios de clase, avances de bitácora, participación) que no corresponden a un único corte, sino a evidencias recogidas semana a semana.*

*Cronograma completo con las 16 fechas de clase, festivos revisados y notas institucionales en `cronograma-2026-2.md`.*

### Estructura semanal

| Sesión           | Duración |
| ----------------- | -------- |
| 1 sesión/semana    | 2 h      |

**Convenciones:** `★` actividad evaluativa (momento evaluativo) · `◇` actividad de seguimiento · cada sesión combina teoría y práctica (la asignatura no tiene horas teóricas independientes; sus 32 h son teórico-prácticas)

---

## Prerrequisitos técnicos

**El curso se trabaja 100% en Google Colab. No se requiere instalar Python, Git ni ninguna librería en el computador del estudiante.**

- **Google Colab**: cuenta de Google para acceso a notebooks en la nube. Python 3 y las librerías básicas ya vienen disponibles; no requiere instalación local.
- **Cuenta de GitHub**: para versionar el trabajo. Git ya está disponible dentro de Colab (se usa desde celdas de código, sin instalarlo aparte).
- **Personal Access Token (PAT) de GitHub**: necesario para autenticar `git push` desde Colab (GitHub ya no acepta usuario/contraseña). Se genera una sola vez y se guarda como *Colab Secret*.
- **Librerías Python**: NumPy, Pandas, Matplotlib, Seaborn (preinstaladas en Colab).
- **Internet**: necesario para el trabajo en la nube y las entregas.

---

## Estructura del repositorio del curso

El repositorio se crea desde la semana 1 y se usa durante todo el semestre, primero para los ejercicios guiados y luego para el proyecto integrador. Todo el manejo de Git se hace **desde dentro de Colab**, con dos flujos según la complejidad del contenido a subir:

- **Flujo A — "Guardar una copia en GitHub"** (semanas 1-11): un notebook suelto por sesión. Colab tiene un botón nativo (`Archivo → Guardar una copia en GitHub`) que hace el commit y el push sin comandos ni terminal — ideal para el volumen de entregas pequeñas de los ejercicios guiados.
- **Flujo B — `git clone` + comandos por celda** (semana 12 en adelante): cuando ya hay varias carpetas (`data/`, `docs/`, `notebooks/`, `visualizaciones/`) dentro del proyecto integrador, se clona el repositorio dentro de Colab y se usa `!git add`, `!git commit`, `!git push` en celdas de código. El token de GitHub se guarda como *Colab Secret* y se referencia en la URL de clonado, así nunca queda escrito en texto plano en el notebook.

```
curso-programacion-cientifica/
├── ejercicios/            # notebooks de práctica semana a semana (semanas 1-11)
├── proyecto/               # proyecto integrador (semanas 12-16)
│   ├── notebooks/
│   ├── data/
│   │   ├── raw/             # datos originales sin modificar
│   │   └── processed/       # datos limpios y transformados
│   ├── docs/
│   │   ├── informe-tecnico.md
│   │   └── bitacora.md
│   └── visualizaciones/
└── README.md
```

Durante las semanas 1-11 no se exige bitácora ni documentación técnica: basta con subir el notebook de cada sesión con Flujo A. La bitácora y el informe técnico aparecen solo a partir de la semana 12, cuando arranca el proyecto y se pasa a Flujo B.

---

## Proyecto integrador (semanas 12-16)

A partir de la semana 12 se introduce un proyecto de análisis de datos, construido de forma incremental sobre lo ya aprendido (Python, estructuras, POO, NumPy), con Pandas y visualización como ejes. Se apoya en una versión comprimida de la metodología **ABP**:

```
Semana 12                    Semanas 13-15                  Semana 16
Exploración inicial   →      Desarrollo iterativo    →      Presentación final
+ Diseño del proyecto        + Socialización de avances
```

- **Semana 12 — Exploración inicial y diseño:** selección del dataset, definición del problema y los objetivos de análisis.
- **Semanas 13-15 — Desarrollo iterativo:** limpieza, análisis y visualización del dataset, con retroalimentación continua.
- **Semana 16 — Presentación final:** entrega y exposición del proyecto, con informe técnico, código y portafolio de visualizaciones.

### Fuentes de datos sugeridas

Para bajar la carga de decisión, especialmente a estudiantes de primer semestre, se recomienda ofrecer una **lista curada de 4-5 datasets** (repositorios oficiales, portales de datos abiertos gubernamentales, Kaggle, APIs públicas) ya revisados por el docente, junto con la opción de que estudiantes de semestres avanzados propongan uno propio si lo prefieren.

---

## Módulo 1 — Git, GitHub, Google Colab y diagnóstico inicial

### Semana 1

**Sesión — Presentación de Google Colab, GitHub y diagnóstico**
- Diagnóstico inicial: cuestionario de autoevaluación + reto breve de lógica (sin código) para identificar el nivel de cada estudiante
- Google Colab: qué es, celdas de código (Python, `Shift + Enter`) y celdas de texto (Markdown) para documentar el razonamiento
- Por qué guardar solo en Colab no basta: GitHub como lugar compartido que conserva versiones anteriores del trabajo
- *Se evita todo vocabulario formal de Git (repositorio/commit/historial como términos, comandos `add`/`commit`/`status`/`log`, ramas) — se explica solo en términos de "subir" y "traer" desde la interfaz de Colab. No se usa en el resto del curso y agrega carga innecesaria a un estudiante sin experiencia previa.*
- Autenticación con GitHub: qué es un Personal Access Token (PAT) y por qué ya no se usa usuario/contraseña
- Cómo guardar el PAT como *Colab Secret* para no exponerlo nunca en el notebook

**Práctica**
- Crear el proyecto del curso en GitHub
- Generar el PAT y guardarlo como Colab Secret (`GITHUB_TOKEN`)
- Crear la carpeta `ejercicios/` con un `README.md` inicial
- Escribir un notebook corto con una celda de código y una de texto
- Practicar el **Flujo A**: subir el notebook con `Archivo → Guardar una copia en GitHub` y volver a abrirlo con `Archivo → Abrir notebook → GitHub` para confirmar el cambio

**◇ Seguimiento:** resultado del diagnóstico + evidencia del primer notebook subido con Flujo A

---

## Módulo 2 — Programación con Python: fundamentos

*Módulo nivelador. Se explica desde cero, sin asumir experiencia previa en programación, para acoger a estudiantes de primer semestre.*

### Semana 2 — Variables, tipos de datos y operadores

**Sesión**
- Repaso rápido de Google Colab (celdas de código y de texto, vistas en la Semana 1) y mención de la alternativa local con Jupyter
- Variables y tipado dinámico en Python
- Tipos de datos básicos: `int`, `float`, `str`, `bool`
- Operadores aritméticos, de comparación y lógicos

**Práctica**
- Configurar el entorno de trabajo (Colab) y subir el primer notebook a `ejercicios/`
- Ejercicios cortos de asignación de variables y operadores sobre datasets de juguete provistos por el docente (ej. lista de precios, lista de temperaturas)

**◇ Seguimiento:** ejercicios de clase resueltos en el notebook

### Semana 3 — Condicionales y bucles

**Sesión**
- Estructuras condicionales: `if`, `elif`, `else`
- Bucles: `for`, `while`; uso de `range()`
- Control de flujo: `break`, `continue`
- Buenas prácticas: legibilidad e indentación en Python

**Práctica**
- Ejercicios progresivos combinando condicionales y bucles (ej. validaciones, conteos, recorridos simples) sobre datos de ejemplo provistos por el docente

**◇ Seguimiento:** ejercicios de clase resueltos en el notebook

---

## Semana 4 ★ — Momento evaluativo 1: Programación con Python (15%)

**Sesión evaluativa**
- Taller individual: ejercicios que combinan variables, condicionales y bucles aplicados a un problema sencillo, sobre un dataset de juguete provisto por el docente
- Evaluación mediante rúbrica: corrección lógica del código, manejo de estructuras de control, legibilidad y documentación básica

---

## Módulo 3 — Estructuras de datos y funciones en Python

### Semana 5 — Estructuras de datos nativas

**Sesión**
- Listas, tuplas, diccionarios y conjuntos: creación, acceso, métodos comunes
- Comprensión de listas (list comprehensions) — introducción
- Diferencias de uso entre cada estructura (mutabilidad, orden, duplicados)

**Práctica**
- Ejercicios de manipulación de estructuras nativas aplicados a datos de ejemplo (ej. una lista de diccionarios que simula registros de estudiantes o productos)

**◇ Seguimiento:** ejercicios de clase resueltos en el notebook

### Semana 6 — Funciones

**Sesión**
- Definición de funciones: parámetros, valores por defecto, retorno de valores
- Funciones de orden superior: `map`, `filter`, funciones `lambda` (introducción)
- Alcance de variables (scope) y buenas prácticas de modularización

**Práctica**
- Taller de funciones aplicado al procesamiento de la estructura de datos de ejemplo de la semana anterior

**◇ Seguimiento:** taller de funciones resuelto en el notebook

---

## Módulo 4 — Programación orientada a objetos en Python

### Semana 7

**Sesión**
- Clases y objetos en Python: `__init__`, `self`, atributos y métodos
- Encapsulamiento y convenciones de nombres
- Métodos especiales básicos: `__str__`, `__repr__`

**Práctica**
- Modelar una clase de dominio sobre un caso de ejemplo provisto por el docente (ej. una clase `Estudiante` o `Producto`)
- Documentar el código siguiendo buenas prácticas

**◇ Seguimiento:** avance de la clase modelada

---

## Semana 8 ★ — Momento evaluativo 2: Estructuras de datos + POO (15%)

**Sesión evaluativa**
- Taller aplicado a un caso de análisis: combina estructuras de datos nativas, funciones y al menos una clase, sobre un dataset de juguete provisto por el docente
- Evaluación mediante rúbrica: uso adecuado de estructuras y clases, lógica del código y documentación

---

## Módulo 5 — NumPy

### Semana 9 — Arreglos y dimensiones

**Sesión**
- Instalación e importación de NumPy
- Creación de arreglos 1D, 2D y n-D: `array`, `zeros`, `ones`, `arange`, `linspace`
- Atributos de un arreglo: `shape`, `dtype`, `ndim`, `size`
- Indexación, slicing y máscaras booleanas

**Práctica**
- Crear y manipular arreglos de diferentes dimensiones a partir de ejemplos guiados (ej. una matriz de notas, una serie de temperaturas)
- *Reto de extensión (opcional):* comparar tiempos de ejecución entre listas de Python y arreglos NumPy

**◇ Seguimiento:** ejercicios de indexación resueltos

### Semana 10 — Operaciones vectorizadas y álgebra lineal básica

**Sesión**
- Operaciones vectorizadas y *broadcasting*
- Funciones universales (ufuncs) y estadística descriptiva básica (media, mediana, desviación estándar)
- Álgebra lineal introductoria con NumPy: vectores, matrices, producto punto y producto matricial

**Práctica**
- Ejercicios de vectorización y operaciones matriciales sencillas sobre datos de ejemplo

**◇ Seguimiento:** ejercicios de vectorización resueltos

---

## Semana 11 ★ — Momento evaluativo 3: NumPy (15%)

**Sesión evaluativa**
- Taller práctico de manipulación de arreglos y operaciones básicas de álgebra lineal usando funciones de NumPy, sobre un dataset de juguete provisto por el docente
- Evaluación mediante rúbrica: uso adecuado de arreglos, operaciones, funciones de la librería, lógica del código y documentación

---

## Módulo 6 — Pandas y arranque del proyecto integrador

### Semana 12 — Carga e inspección de datos + selección del proyecto

**Sesión**
- Estructuras `Series` y `DataFrame`
- Carga de datos desde archivos (CSV, Excel), APIs o repositorios de datos abiertos
- Inspección inicial: `head`, `info`, `describe`, `dtypes`

**Práctica**
- Selección del dataset del proyecto integrador (a partir de la lista curada o uno propio, según el nivel del estudiante)
- Transición a **Flujo B**: clonar el repositorio del curso dentro de Colab (`!git clone` usando el PAT guardado como Colab Secret) para poder trabajar con la carpeta `proyecto/` completa
- Crear la carpeta `proyecto/` en el repositorio, cargar el dataset elegido en un `DataFrame` y realizar la inspección inicial
- Registrar la definición del conjunto de datos y los objetivos de análisis en `docs/bitacora.md`
- Subir los cambios con `!git add`, `!git commit`, `!git push`

**◇ Seguimiento:** dataset seleccionado + inspección inicial documentada + primer push con Flujo B

### Semana 13 — Filtrado, agregación y limpieza de datos

**Sesión**
- Selección con `loc`/`iloc`, filtrado booleano, ordenamiento (`sort_values`), agrupación (`groupby`) y agregación
- Identificación de valores nulos y datos atípicos; técnicas de imputación y eliminación

**Práctica**
- Aplicar filtrado y agregación sobre el dataset del proyecto
- Realizar la limpieza del conjunto de datos y documentar decisiones en la bitácora
- *Reto de extensión (opcional):* combinar dos fuentes de datos con `merge`/`concat`

**◇ Seguimiento:** avance de limpieza documentado en la bitácora

---

## Semana 14 ★ — Momento evaluativo 4: Pandas (15%)

**Sesión evaluativa**
- Entrega de un informe corto de análisis con Pandas: carga, inspección, filtrado/agregación y limpieza del dataset del proyecto
- Espacio de socialización de avances y retroalimentación como guía para el cierre del proyecto
- Evaluación mediante rúbrica: uso adecuado de funciones de Pandas, claridad del análisis y documentación

---

## Módulo 7 — Visualización de datos

### Semana 15 — Matplotlib y Seaborn

**Sesión**
- Matplotlib: gráficos básicos (líneas, barras, dispersión, histogramas)
- Seaborn: gráficos estadísticos (boxplot, heatmap, pairplot)
- Buenas prácticas de visualización: elección del tipo de gráfico según el tipo de dato

**Práctica**
- Generar al menos tres tipos distintos de visualizaciones sobre el dataset del proyecto
- Ajustar parámetros básicos e interpretar los gráficos producidos

**◇ Seguimiento:** avance del portafolio de visualizaciones

---

## Semana 16 ★ — Momento evaluativo 5: Matplotlib y Seaborn — portafolio y presentación final (20%)

**Sesión evaluativa**
- Consolidación del portafolio con al menos tres tipos distintos de visualizaciones, con descripción interpretativa de los resultados
- Presentación final del proyecto integrador (oral o escrita): informe técnico, hallazgos y bitácora de trabajo
- Evaluación mediante rúbrica de visualización (variedad, claridad, interpretación, pertinencia) + rúbrica de presentación final

---

## Temas opcionales

*No tienen semana asignada. Se abordan como reto de extensión para estudiantes de semestres avanzados, si el avance del curso lo permite.*

### Consumo de APIs de datos abiertos

- Solicitudes HTTP con la librería `requests`
- Parseo de respuestas JSON y carga directa a `DataFrame`
- Automatización de la actualización de datos del proyecto

### Introducción a scikit-learn

- Panorama general de la librería y su relación con NumPy/Pandas
- Preparación de datos para un modelo simple (train/test split)
- Ejemplo introductorio de un modelo de regresión o clasificación básico

---

*Documento elaborado para el programa Tecnología en Desarrollo de Software.*
*Basado en el microdiseño curricular FDE 058 V5, asignatura Introducción a la Programación Científica (12 de mayo de 2025), ajustado por el docente para un grupo sin prerrequisitos con niveles heterogéneos.*