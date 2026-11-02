# Evaluación Resultados de Aprendizaje 2026-2 — Análisis de Algoritmos

> **⚠️ REEMPLAZADO (2026-10-24)** por `casos-evaluacion-ra-2026-2.md`, que
> propone tres casos de estudio. Este caso de telemedición se conserva como
> antecedente y no se envía a la Facultad.

> **Estado: PENDIENTE DE APROBACIÓN DE LA FACULTAD.** Las condiciones del
> instrumento se definieron en la reunión del 19 de agosto de 2026 con el
> docente encargado de resultados de aprendizaje (Gustavo Macías): el caso lo
> redacta el docente y lo aprueba la Facultad. Vale el 20 % de la nota y se
> entrega en la semana de finales (23–29 nov). No se ha socializado con los
> estudiantes ni se ha publicado en la plataforma. Ver
> `preguntas-reunion-ra-2026-08-19.md` → "Respuestas de la reunión".
> La rúbrica completa (desempeño esperado y descriptores por nivel) se
> transcribió el 2026-10-24 desde la plantilla institucional
> `Rubrica RA Análisis de Algoritmos.xlsx`.

---

## Objetivo

Como equipo de ingenieros de sistemas, deberán analizar un problema
computacional planteado por una organización, diseñar y comparar diferentes
estrategias algorítmicas para resolverlo, evaluar su eficiencia mediante el
análisis de complejidad y pruebas experimentales, y justificar la solución
seleccionada considerando criterios técnicos y el impacto de su implementación
en el contexto organizacional.

---

## CASO DE ESTUDIO

## SISTEMA DE CONSOLIDACIÓN DIARIA DE LECTURAS DE TELEMEDICIÓN

### Contexto organizacional

La Empresa Metropolitana de Energía es el operador del servicio de energía
eléctrica de un área metropolitana con aproximadamente 2.400.000 habitantes.
La empresa administra la medición, facturación y atención al usuario de todos
los predios conectados a su red.

Desde hace cuatro años la empresa viene reemplazando los medidores
convencionales por medidores de **telemedición**, que reportan automáticamente
el consumo acumulado sin necesidad de visita de un operario. Actualmente la
totalidad del parque de medidores está automatizada.

Cada noche, un proceso por lotes consolida las lecturas recibidas durante el
día, las depura y las deja disponibles para dos consumidores internos: el
sistema de facturación y el sistema de atención al usuario del call center.

La Gerencia de Tecnología desea rediseñar ese proceso de consolidación, cuyo
tiempo de ejecución ha venido creciendo hasta desbordar la ventana operativa
disponible.

### Situación actual

El proceso de consolidación diaria ejecuta las siguientes etapas, en orden:

1. **Carga** del archivo plano con todas las lecturas recibidas durante el día.
2. **Deduplicación:** los reintentos de red hacen que un mismo medidor reporte
   la misma lectura varias veces. El proceso actual compara cada registro con
   todos los registros ya aceptados para decidir si es un duplicado.
3. **Ordenamiento:** los registros llegan en el orden en que la red los entregó.
   Facturación exige el archivo ordenado por identificador de cuenta y, dentro
   de cada cuenta, por fecha y hora de lectura. El proceso actual utiliza un
   algoritmo de ordenamiento por inserción implementado hace varios años.
4. **Detección de consumos atípicos:** se identifican las 500 cuentas de mayor
   consumo del día, que alimentan el tablero de alertas por posible fuga,
   manipulación del medidor o fraude. El proceso actual ordena la totalidad del
   arreglo por consumo y toma los primeros 500 registros.
5. **Publicación** del archivo consolidado para el call center, que atiende
   consultas puntuales del historial de una cuenta recorriendo secuencialmente
   ese archivo.

La ventana operativa disponible para todo el proceso es de **4 horas**
(00:00 – 04:00). Actualmente la consolidación tarda **más de 9 horas**, por lo
que:

- la facturación del día se libera con retraso;
- las alertas de consumo atípico llegan cuando el evento ya lleva más de un día
  de ocurrido;
- las consultas del call center responden con lentitud durante la mañana,
  mientras el proceso todavía está corriendo.

### Problema identificado

La Gerencia de Tecnología considera que el problema no corresponde a la
infraestructura de cómputo disponible, sino a las **estrategias algorítmicas**
empleadas en las etapas de deduplicación, ordenamiento, detección de atípicos y
consulta.

Por esta razón requiere que un equipo de consultores analice diferentes
alternativas de solución y recomiende las estrategias algorítmicas más
adecuadas para implementar la nueva versión del proceso.

### Información suministrada por el cliente

Durante las reuniones de levantamiento de información, la empresa entregó los
siguientes datos.

**Parque de medidores**

- 1.850.000 medidores activos.
- Cada medidor reporta una lectura diaria.
- El archivo diario contiene aproximadamente 1.850.000 registros, más los
  duplicados generados por reintentos de red.
- Entre el 3% y el 7% de los registros de un día son duplicados.

**Estructura de un registro de lectura**

| Campo | Descripción |
|---|---|
| `id_medidor` | Identificador único del medidor |
| `id_cuenta` | Identificador de la cuenta del usuario |
| `marca_tiempo` | Fecha y hora de la lectura |
| `consumo_kwh` | Consumo acumulado reportado, en kWh |
| `codigo_estado` | Código de estado del reporte |

**Infraestructura**

- El proceso corre sobre un único servidor dedicado.
- El servidor consume aproximadamente 450 W bajo carga sostenida.
- No existe procesamiento distribuido ni en paralelo.

**Operación del call center**

- Entre 8.000 y 12.000 consultas puntuales por día.
- Cada consulta busca el historial de una cuenta específica.

### Restricciones del negocio

La solución deberá garantizar como mínimo que:

- El proceso completo de consolidación se ejecute dentro de la ventana de 4
  horas.
- Ninguna lectura válida se pierda durante la depuración.
- Una lectura duplicada nunca se contabilice dos veces en la facturación.
- Dos registros del mismo medidor con la **misma** marca de tiempo se consideran
  duplicados; con marcas de tiempo **distintas** son lecturas diferentes y ambas
  son válidas.
- Una consulta puntual del call center responda en menos de 2 segundos.
- El archivo original recibido de la red no se modifique, para conservar la
  trazabilidad de lo que efectivamente reportó cada medidor.

### Requerimiento del cliente

La empresa solicita desarrollar una propuesta técnica que permita mejorar el
proceso de consolidación diaria mediante el análisis de diferentes estrategias
algorítmicas.

No se espera construir el sistema de consolidación en producción.

El interés principal consiste en determinar qué estrategias algorítmicas
presentan un mejor comportamiento para este tipo de operaciones y cuáles serían
las alternativas más convenientes para ser incorporadas al nuevo proceso.

### Actividades a desarrollar

El equipo deberá:

1. Analizar el problema computacional y caracterizar sus elementos principales
   (entradas, salidas y restricciones).
2. Identificar las operaciones que representan el mayor costo computacional
   dentro del proceso actual.
3. Seleccionar **al menos dos** de las cuatro operaciones críticas del proceso
   (deduplicación, ordenamiento, detección de los mayores consumos, consulta
   puntual) y diseñar, para cada una, **al menos dos estrategias algorítmicas
   distintas** que la resuelvan. Una de las operaciones seleccionadas debe ser
   el **ordenamiento**, y el equipo debe identificar explícitamente la
   estrategia de diseño en que se apoya cada propuesta (dividir y vencer,
   voraz, programación dinámica u otra).
4. Implementar las estrategias diseñadas en Python.
5. Analizar la complejidad temporal y espacial de cada solución y estimar su
   consumo energético.
6. Diseñar pruebas experimentales utilizando diferentes tamaños de entrada.
7. Comparar el comportamiento de las soluciones mediante métricas objetivas y
   contrastar los resultados empíricos con la complejidad teórica esperada.
8. Justificar técnicamente las estrategias recomendadas para ser implementadas
   por la empresa, incluyendo el marco normativo aplicable y las implicaciones
   éticas, sociales y ambientales de la decisión.

### Supuestos permitidos

Con el fin de concentrar el proyecto en el análisis de algoritmos, el equipo
podrá asumir que:

- Todos los datos suministrados por la empresa son válidos y consistentes en su
  formato.
- No existen cambios en los datos durante la ejecución del algoritmo.
- No es necesario desarrollar una interfaz gráfica.
- No se requiere persistencia en bases de datos.
- Los datos pueden cargarse completamente en memoria.
- **No se exige procesar el volumen real.** El equipo generará conjuntos de
  datos sintéticos de tamaño creciente, representativos de la estructura
  descrita, para sustentar el análisis experimental.
- No se requiere procesamiento distribuido ni paralelo: el análisis se realiza
  sobre un único hilo de ejecución.

---

## ENTREGABLE

El proyecto deberá desarrollarse en equipos de máximo tres (3) estudiantes y
constará de los siguientes productos:

### 1. Informe técnico

Documento en formato PDF, con una extensión sugerida entre 10 y 15 páginas (sin
incluir anexos), que contenga como mínimo los siguientes apartados:

**Análisis del problema**

- Descripción del problema computacional.
- Identificación de entradas, salidas y restricciones.
- Identificación de las operaciones críticas del proceso.
- Costo energético del proceso actual (tiempo de ejecución × potencia del
  servidor), como línea base para la propuesta.
- Supuestos realizados por el equipo.

**Diseño de la solución**

- Descripción de las estructuras de datos seleccionadas.
- Diseño de al menos dos estrategias algorítmicas por cada operación abordada.
- Estrategia de diseño en que se apoya cada propuesta (dividir y vencer, voraz,
  programación dinámica u otra) y cómo reduce el consumo energético frente al
  proceso actual.
- Diagramas, pseudocódigo o representaciones equivalentes que permitan
  comprender el funcionamiento de cada propuesta.

**Implementación**

- Descripción de la solución desarrollada.
- Tecnologías y herramientas utilizadas.
- Decisiones de implementación relevantes.

**Evaluación del desempeño**

- Análisis de complejidad temporal y espacial de cada estrategia.
- Diseño y ejecución de pruebas experimentales.
- Presentación e interpretación de los resultados obtenidos mediante tablas o
  gráficas.
- Contraste explícito entre el comportamiento empírico observado y la
  complejidad teórica esperada.

**Análisis comparativo**

- Comparación de las estrategias implementadas.
- Ventajas y limitaciones de cada una.
- Justificación técnica de la solución seleccionada para el contexto planteado.

**Implicaciones éticas, sociales y ambientales**

- **Consumo energético:** estimación del consumo eléctrico del proceso actual
  frente al de la solución propuesta, a partir del tiempo de ejecución y la
  potencia del servidor informada por el cliente. Proyección de esa diferencia
  a un año de operación.
- **Consecuencias sobre las personas:** qué ocurre cuando la depuración
  descarta por error una lectura legítima, o cuando la detección de consumos
  atípicos señala equivocadamente a un usuario. Quién asume el costo de ese
  error y cómo puede mitigarse desde el diseño del algoritmo.
- **Marco normativo y buenas prácticas:** qué normas y buenas prácticas
  condicionan la solución —por ejemplo, la protección de datos personales
  (Ley 1581 de 2012) y el régimen de servicios públicos domiciliarios en lo
  relativo a la medición y facturación del consumo (Ley 142 de 1994)— y cómo
  las respeta el diseño propuesto, en particular la trazabilidad del archivo
  original.
- **Sostenibilidad de la decisión:** cómo se comportarían las estrategias
  recomendadas si el parque de medidores creciera a 3.000.000 de cuentas, o si
  la frecuencia de reporte pasara de una a cuatro lecturas diarias.

**Conclusiones**

- Principales hallazgos.
- Lecciones aprendidas.
- Recomendaciones para futuras mejoras.

### 2. Repositorio en GitHub

El código, las gráficas y los datos de prueba se entregan en una carpeta del
repositorio del curso, siguiendo la organización de trabajo ya establecida:
código Python estructurado (funciones con responsabilidad única, *type hints*,
*docstrings*), gráficas reproducibles y un `README.md` que documente cómo
ejecutar los experimentos.

Deberá evidenciarse el aporte de cada integrante mediante el historial de
commits.

---

## Rúbrica de evaluación

> Rúbrica institucional transcrita de la plantilla
> `Rubrica RA Análisis de Algoritmos.xlsx` remitida por la Facultad (Medición 1,
> Taxonomía Socioformativa, Tobón 2025). Es fija: criterios, códigos, pesos y
> descriptores no admiten ajuste por asignatura (reunión del 19 de agosto de
> 2026). En la transcripción solo se corrigieron erratas tipográficas.

### Criterios y pesos

| RA | Desempeño esperado | % |
|---|---|---|
| RADE1-1 | Análisis de un algoritmo empleando estrategias como dividir y vencer, algoritmos voraces o programación dinámica, de tal manera que reduzcan el consumo de energía para que sean más amigables con el medio ambiente. | 25 |
| RADE1-2 | Diseño de un algoritmo empleando estrategias como dividir y vencer, algoritmos voraces o programación dinámica, de tal manera que reduzcan el consumo de energía para que sean más amigables con el medio ambiente. | 25 |
| RADT1 | Analiza diferentes complejidades y escoge la opción que mejor se adapte al caso de uso. | 30 |
| RAG2 | Aplica de manera efectiva principios éticos establecidos para la práctica de la ingeniería en los que se evidencia la toma de decisiones responsables de acuerdo con aspectos regulatorios, normativos y de buenas prácticas. | 10 |
| RAG4 | Argumenta cómo sus acciones y decisiones planteadas impactan al medio ambiente, a la sociedad actual y a la del futuro. | 10 |
| | **Total** | **100** |

### Niveles de desempeño

| Nivel | Rango |
|---|---|
| Emergente | 0.0–0.9 |
| En desarrollo | 1.0–1.9 |
| Receptivo | 2.0–2.9 |
| Resolutivo | 3.0–3.9 |
| Crítico | 4.0–4.5 |
| Reflexivo | 4.6–5.0 |

### Cómo se calcula la nota

La rúbrica se aplica por equipo. Cada criterio recibe una nota entre 0.0 y 5.0
dentro del rango del nivel de desempeño alcanzado, y la nota del proyecto es la
suma ponderada de los cinco criterios, también en escala de 0.0 a 5.0:

```
Nota = 0.25·RADE1-1 + 0.25·RADE1-2 + 0.30·RADT1 + 0.10·RAG2 + 0.10·RAG4
```

### Descriptores por criterio

#### RADE1-1 — Análisis del problema (25 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra diseñar algoritmos coherentes ni aplica estrategias. |
| En desarrollo (1.0–1.9) | Analiza algoritmos básicos con errores en la aplicación de estrategias y sin considerar impacto ambiental. |
| Receptivo (2.0–2.9) | Aplica parcialmente análisis de algoritmos en las estrategias, con poca claridad en la reducción de consumo energético. |
| Resolutivo (3.0–3.9) | Analiza algoritmos coherentes aplicando estrategias adecuadas y considerando impacto ambiental. |
| Crítico (4.0–4.5) | Analiza algoritmos fundamentados, optimizando consumo energético y orientados a sostenibilidad. |
| Reflexivo (4.6–5.0) | Propone el análisis de algoritmos sólidos, anticipando necesidades futuras, aplicando estrategias avanzadas y maximizando eficiencia energética con visión ambiental. |

#### RADE1-2 — Diseño de estrategias (25 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra diseñar algoritmos coherentes ni aplica estrategias. |
| En desarrollo (1.0–1.9) | Diseña algoritmos básicos con errores en la aplicación de estrategias y sin considerar impacto ambiental. |
| Receptivo (2.0–2.9) | Aplica parcialmente el diseño de algoritmos según estrategias, con poca claridad en la reducción de consumo energético. |
| Resolutivo (3.0–3.9) | Diseña algoritmos coherentes aplicando estrategias adecuadas y considerando impacto ambiental. |
| Crítico (4.0–4.5) | Diseña algoritmos fundamentados, optimizando consumo energético y orientados a sostenibilidad. |
| Reflexivo (4.6–5.0) | Propone el diseño de algoritmos sólidos, anticipando necesidades futuras, aplicando estrategias avanzadas y maximizando eficiencia energética con visión ambiental. |

#### RADT1 — Evaluación del desempeño (30 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra analizar complejidades ni seleccionar opciones adecuadas. |
| En desarrollo (1.0–1.9) | Analiza complejidades básicas con errores en la selección de la opción. |
| Receptivo (2.0–2.9) | Analiza parcialmente, seleccionando opciones con poca claridad en la justificación. |
| Resolutivo (3.0–3.9) | Analiza complejidades de forma coherente, seleccionando opciones adecuadas al caso de uso. |
| Crítico (4.0–4.5) | Analiza y selecciona opciones fundamentadas, optimizando rendimiento y escalabilidad. |
| Reflexivo (4.6–5.0) | Realiza análisis integral de complejidades, seleccionando opciones estratégicas y anticipando impactos futuros en el rendimiento. |

#### RAG2 — Principios éticos (10 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No aplica principios éticos ni considera aspectos regulatorios. |
| En desarrollo (1.0–1.9) | Aplica principios básicos con errores en la toma de decisiones responsables. |
| Receptivo (2.0–2.9) | Aplica principios éticos parcialmente, con poca claridad en la responsabilidad y normatividad. |
| Resolutivo (3.0–3.9) | Aplica principios éticos de manera coherente, tomando decisiones responsables y considerando normativas. |
| Crítico (4.0–4.5) | Aplica principios éticos fundamentados, evidenciando responsabilidad y compromiso con buenas prácticas. |
| Reflexivo (4.6–5.0) | Integra principios éticos de manera ejemplar, anticipando riesgos, garantizando cumplimiento normativo y promoviendo sostenibilidad social. |

#### RAG4 — Impacto ambiental, social y futuro (10 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra argumentar impactos de sus acciones ni decisiones. |
| En desarrollo (1.0–1.9) | Argumenta de forma básica con errores en la identificación de impactos. |
| Receptivo (2.0–2.9) | Argumenta parcialmente, con poca claridad en los impactos ambientales y sociales. |
| Resolutivo (3.0–3.9) | Argumenta de manera coherente, identificando impactos ambientales y sociales actuales. |
| Crítico (4.0–4.5) | Argumenta con fundamentos sólidos, evidenciando impactos ambientales y sociales y proponiendo mejoras. |
| Reflexivo (4.6–5.0) | Argumenta de forma integral, anticipando impactos futuros, proponiendo soluciones sostenibles y con visión estratégica para sociedad y medio ambiente. |

---

---

# Anexo — Justificación docente

> Esta sección es de uso interno. **No se entrega a los estudiantes.**

## Por qué este caso y no el del ejemplo

El instrumento de ejemplo remitido por la Facultad contiene dos casos
(programación académica universitaria y rutas de atención de emergencias). Ambos
exigen contenidos que este curso **no dicta**:

| Caso del ejemplo | Contenido que exige | Estado en el microdiseño |
|---|---|---|
| Programación académica | Satisfacción de restricciones, *backtracking* con poda, coloreado de grafos | *Backtracking* y coloreado: no se dictan. Estrategia voraz: Semana 15, la última con clase |
| Rutas de emergencia | Grafo dirigido y ponderado, Dijkstra / Bellman-Ford / BFS | Grafos figuran en "Temas opcionales" y como lectura autónoma, sin sesión. Cobertura real: ninguna |

El correo de convocatoria establece que "cada asignatura contará con su
correspondiente caso de estudio y rúbrica de evaluación, los cuales deberán
guardar coherencia con sus contenidos, competencias y resultados de
aprendizaje", y en la reunión del 19 de agosto se confirmó que el caso lo
redacta cada docente. Aunque el instrumento admite temas de autoestudio, un
caso que se apoye principalmente en contenido dictado mide mejor los resultados
de aprendizaje del curso.

## Cobertura del caso frente al microdiseño

Cada operación crítica del caso tiene al menos una ruta de solución construida
con contenido dictado. Las alternativas marcadas como autoestudio son opcionales
para el equipo: el instrumento las admite (reunión del 19 de agosto), pero
ninguna es indispensable para cumplir "dos estrategias por operación".

| Operación del caso | Estrategias con contenido dictado | Alternativas por autoestudio | Semana en que se dicta |
|---|---|---|---|
| Deduplicación | Comparación exhaustiva O(n²) → tabla hash con encadenamiento o direccionamiento abierto; árbol de búsqueda binario | — | Semana 13 (Lab 3) |
| Ordenamiento | Insertion sort Θ(n²) → merge sort Θ(n log n) | Heapsort, quicksort; counting/radix sort si el rango de claves lo permite (Módulo 6, retirado del curso; las lecciones siguen publicadas) | Semanas 3 y 4 |
| Mayores consumos (top-k) | Ordenar todo con merge sort y tomar los k últimos, Θ(n log n) → recorrer una vez manteniendo una lista ordenada de los k mayores, Θ(n·k) | Montículo de mínimos de tamaño k, Θ(n log k) | Semanas 3 y 4 |
| Consulta puntual | Búsqueda lineal → tabla hash por `id_cuenta`; árbol de búsqueda binario | Búsqueda binaria sobre el arreglo ordenado | Semana 13 |

El caso **no exige** grafos, *backtracking*, NP-completitud ni programación
paralela.

**Estrategias de diseño (RADE1-1 y RADE1-2).** El desempeño esperado de la
rúbrica nombra dividir y vencer, voraces y programación dinámica. De las
estrategias del caso, solo merge sort es dividir y vencer en sentido estricto;
las tablas hash, los árboles de búsqueda y la búsqueda binaria son estructuras
o técnicas de búsqueda, no estrategias de diseño. Por eso el ordenamiento es
obligatorio entre las operaciones seleccionadas: garantiza que todo equipo
analice y diseñe al menos una estrategia de la familia que nombra la rúbrica
con contenido dictado. La programación dinámica no tiene una aplicación natural
en el caso; como la rúbrica dice "estrategias **como**", la lista se lee como
ilustrativa y no se fuerza.

El contraste empírico-teórico que pide el apartado "Evaluación del desempeño" es
exactamente la práctica que los cuatro laboratorios del curso vienen ejercitando
desde la Semana 3. En particular, la parte práctica del Laboratorio 3
(rediseñar con una tabla hash una solución basada en listas enlazadas) es la
base directa de la deduplicación y la consulta puntual. De este modo, el
proyecto capitaliza el trabajo ya hecho en lugar de abrir un frente nuevo.

## Mapeo del caso a los criterios de la rúbrica

| Criterio | % | Cómo lo provoca este caso | Estado en el curso |
|---|---|---|---|
| RADE1-1 — Analiza el problema | 25 | El caso se entrega como contexto organizacional, no como problema formalizado: el equipo debe extraer entradas, salidas, restricciones y operaciones críticas. El costo energético del proceso actual es la línea base del análisis | ⚠️ Vacío parcial: los laboratorios entregan problemas ya definidos. Requiere al menos una sesión de modelado |
| RADE1-2 — Diseña y compara estrategias | 25 | Exige dos operaciones × dos estrategias cada una, con el ordenamiento obligatorio (merge sort, dividir y vencer) y la estrategia de diseño y su efecto energético declarados | ✅ Cubierto (Labs 2, 3 y 4 ya comparan enfoques) |
| RADT1 — Evalúa el desempeño | 30 | Pruebas con tamaños crecientes, métricas objetivas y contraste con la complejidad teórica; la proyección de crecimiento evidencia escalabilidad (nivel Crítico en adelante) | ✅ Cubierto: es la marca declarada del curso |
| RAG2 — Principios éticos | 10 | Errores de depuración y falsos positivos de la detección de atípicos afectan a usuarios reales, con costo asignable; el marco normativo (datos personales, servicios públicos) cubre lo "regulatorio y normativo" del descriptor | Solo se evalúa (no se dicta, reunión del 19 de agosto). Evidencia anclada en dos fallas concretas del caso y en el marco normativo |
| RAG4 — Impacto ambiental, social y futuro | 10 | El consumo eléctrico es **calculable** con los datos del caso (450 W, tiempo medido). La proyección a 3.000.000 de cuentas mide sostenibilidad | Solo se evalúa (no se dicta, reunión del 19 de agosto). Evidencia anclada en kWh calculados y en la proyección de crecimiento |

## Decisión de diseño sobre RAG2 y RAG4

El instrumento asigna 20% a dos resultados de aprendizaje generales que ninguna
asignatura técnica cubre de forma natural. Para que sean evaluables con
evidencia y no con opinión, este caso los ancla en datos que el propio
estudiante produce:

- La potencia del servidor (450 W) y la ventana operativa están en el enunciado
  precisamente para que el consumo energético se **calcule**, no se declare. La
  diferencia entre O(n²) y O(n log n) sobre 1.850.000 registros es de varios
  órdenes de magnitud, y por lo tanto de kWh y de emisiones.
- Las consecuencias sobre personas se anclan en dos fallas concretas y
  verificables del algoritmo (descartar una lectura legítima; señalar
  equivocadamente a un usuario), no en una reflexión genérica sobre ética
  profesional.

En la reunión del 19 de agosto se definió que estos dos resultados **solo se
evalúan**: no hay que dictar contenido de ética ni de impacto, y la evidencia
suficiente queda a criterio del docente. Este anclaje es, por lo tanto, el
mecanismo con el que se califican.

En el instrumento de ejemplo los descriptores de RAG2 y RAG4 parecían idénticos;
la plantilla definitiva (`Rubrica RA Análisis de Algoritmos.xlsx`) los
diferencia: RAG2 evalúa decisiones responsables frente a aspectos regulatorios,
normativos y de buenas prácticas, y RAG4 la argumentación de impactos
ambientales y sociales, actuales y futuros. El informe pide evidencia distinta
para cada uno: consecuencias sobre las personas y marco normativo para RAG2;
consumo energético y proyección de crecimiento para RAG4.

El consumo energético no se califica solo en RAG4: los descriptores de RADE1-1
y RADE1-2 piden reducción del consumo energético en el análisis y en el diseño.
Por eso la línea base energética va en "Análisis del problema" y el efecto
energético de cada estrategia en "Diseño de la solución".

## Observaciones sobre la plantilla institucional

Detectadas al transcribir la rúbrica (2026-10-24); conviene reportarlas a
Gustavo Macías antes de consolidar resultados:

- **Error de fórmula:** en la hoja `Consolidado`, la celda F19 (RAG4 del
  Grupo 1) apunta a `'Eq 2'!B22` en lugar de `'Eq 1'!B22`: el Grupo 1 recibiría
  el RAG4 del Grupo 2.
- **Fórmula faltante:** la fila "Promedio RA" de `Consolidado` no tiene el
  promedio de RADE1-2 (celda C33 vacía).
- **Códigos que no coinciden con su descripción:** el criterio RAG2 evalúa
  principios éticos, pero el RA asociado en la hoja (RAG2, competencia C4) es
  "participa activamente en equipos de trabajo… comunicación efectiva"; el
  criterio RAG4 evalúa impacto ambiental y social, pero el RA asociado (C7) es
  "identifica, selecciona y aplica nuevos conocimientos". Los códigos también
  varían: "RAD1" y "RAT1" en las hojas por equipo, "RADE1" y "RADT1" en el
  resto.
- **Rangos de nivel:** los rangos de la plantilla (Emergente 0.0–0.9 … Resolutivo
  3.0–3.9) difieren de los que se habían tomado del instrumento de ejemplo
  (Emergente 0.0–1.9 … Resolutivo 3.5–3.9). Este documento usa los de la
  plantilla.

## Impacto sobre el microdiseño

Condiciones ya definidas (reunión del 19 de agosto y reajuste del 2026-10-03):

1. **Ubicación en la evaluación:** proyecto final, **20 %** de la nota, en la
   casilla abierta por el reajuste del 2026-10-03 (4 laboratorios de 15 % +
   proyecto 20 % + Seguimiento 20 %).
2. **Fecha:** semana de finales (23–29 nov). No se exigen hitos intermedios:
   solo hay entrega final. Esa misma semana es la ventana de registro del 100 %
   en el SIA, así que la fecha exacta debe dejar tiempo para calificar.
3. **Trabajo en equipo:** equipos de máximo 3 integrantes, obligatorios. La
   evidencia individual es el historial de commits, que ya se valora en
   Seguimiento.
4. **Ética e impacto:** solo se evalúan; no se abre espacio curricular.
5. **Reporte:** por estudiante, en la plantilla de Gustavo Macías
   (`Rubrica RA Análisis de Algoritmos.xlsx`), aparte del SIA. La plantilla
   tiene una hoja por equipo (hasta 12) con docente, título del proyecto,
   estudiantes y un campo de **valoración individual**, y una hoja
   `Consolidado` que también pide momento, fecha, número de estudiantes y de
   equipos, aula y horario. La no entrega se reporta como 0.0. Los informes se
   conservan como evidencia de acreditación.

Pendiente de decisión del docente:

- **Valoración individual:** la rúbrica se aplica por equipo, pero la plantilla
  trae un campo de valoración individual. Definir si todos los integrantes
  reciben la nota del equipo o si se ajusta por aporte (historial de commits).

- **Sustentación oral:** opcional según la Facultad.
- **Sesión de modelado** (RADE1-1): los laboratorios entregan problemas ya
  definidos y no hay sesión que enseñe a traducir un requisito organizacional en
  un problema computacional. Con el calendario actual no queda una sesión libre
  para ella.
- **Repositorio del equipo:** el curso usa un repositorio individual por
  estudiante; hay que definir dónde vive el proyecto de un equipo.
