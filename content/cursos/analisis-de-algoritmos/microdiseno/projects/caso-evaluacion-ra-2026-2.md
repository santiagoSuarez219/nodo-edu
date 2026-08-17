# Evaluación Resultados de Aprendizaje 2026-2 — Análisis de Algoritmos

> **Estado: PROPUESTA.** Documento preparado para la reunión del 19 de agosto de
> 2026 con el docente encargado de resultados de aprendizaje (Gustavo Macías).
> No se ha socializado con los estudiantes ni se ha publicado en la plataforma.
> Ver `preguntas-reunion-ra-2026-08-19.md` para los puntos pendientes de
> definición institucional.

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
   distintas** que la resuelvan.
4. Implementar las estrategias diseñadas utilizando el lenguaje de programación
   definido por el docente.
5. Analizar la complejidad temporal y espacial de cada solución.
6. Diseñar pruebas experimentales utilizando diferentes tamaños de entrada.
7. Comparar el comportamiento de las soluciones mediante métricas objetivas y
   contrastar los resultados empíricos con la complejidad teórica esperada.
8. Justificar técnicamente las estrategias recomendadas para ser implementadas
   por la empresa, incluyendo las implicaciones éticas, sociales y ambientales
   de la decisión.

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
- Supuestos realizados por el equipo.

**Diseño de la solución**

- Descripción de las estructuras de datos seleccionadas.
- Diseño de al menos dos estrategias algorítmicas por cada operación abordada.
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

> Rúbrica institucional transcrita del instrumento remitido por la Facultad.
> **Pendiente de confirmar** si es fija para todas las asignaturas o admite
> ajuste (ver `preguntas-reunion-ra-2026-08-19.md`, pregunta 2).

| Criterio | % |
|---|---|
| Analiza el problema computacional (RADE1-1) | 25 |
| Diseña y compara estrategias algorítmicas (RADE1-2) | 25 |
| Evalúa el desempeño de la solución (RADT1) | 30 |
| Justifica la solución propuesta: desde los principios éticos (RAG2) | 10 |
| Justifica la solución propuesta: desde el impacto ambiental, social y futuro (RAG4) | 10 |
| **Total** | **100** |

Cada criterio se valora en seis niveles de desempeño: Emergente (0.0–1.9),
En desarrollo (2.0–2.9), Receptivo (3.0–3.4), Resolutivo (3.5–3.9), Crítico
(4.0–4.5) y Reflexivo (4.6–5.0).

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
| Programación académica | Satisfacción de restricciones, *backtracking* con poda, coloreado de grafos | *Backtracking* y coloreado: no se dictan. Heurísticas voraces: Semana 16, la última del curso |
| Rutas de emergencia | Grafo dirigido y ponderado, Dijkstra / Bellman-Ford / BFS | Grafos figuran en "Temas opcionales"; el taller de la antigua Semana 17 se absorbió en la Semana 16. Cobertura real: ninguna |

El correo de convocatoria establece que "cada asignatura contará con su
correspondiente caso de estudio y rúbrica de evaluación, los cuales deberán
guardar coherencia con sus contenidos, competencias y resultados de
aprendizaje". Este caso ejerce esa facultad.

## Cobertura del caso frente al microdiseño

Cada operación crítica del caso tiene una ruta de solución construida con
contenido efectivamente dictado, y con margen antes de cualquier fecha de
entrega razonable:

| Operación del caso | Estrategias esperables | Semana en que se dicta |
|---|---|---|
| Deduplicación | Comparación exhaustiva O(n²) → tabla hash con encadenamiento o direccionamiento abierto | Semana 13 (Lab 4) |
| Ordenamiento | Insertion sort → merge sort, heapsort, quicksort; counting/radix sort si el rango de claves lo permite | Semanas 4, 9, 10, 11 (Lab 3) |
| Mayores consumos (top-k) | Ordenar todo y tomar k → selección en tiempo lineal esperado, o heap de tamaño k | Semanas 9 y 12 |
| Consulta puntual | Búsqueda lineal → búsqueda binaria sobre el arreglo ordenado, o tabla hash | Semanas 12 y 13 |

El caso **no exige** grafos, *backtracking*, NP-completitud ni programación
paralela.

El contraste empírico-teórico que pide el apartado "Evaluación del desempeño" es
exactamente la práctica que los cinco laboratorios del curso vienen ejercitando
desde la Semana 3, de modo que el proyecto capitaliza el trabajo ya hecho en
lugar de abrir un frente nuevo.

## Mapeo del caso a los criterios de la rúbrica

| Criterio | % | Cómo lo provoca este caso | Estado en el curso |
|---|---|---|---|
| RADE1-1 — Analiza el problema | 25 | El caso se entrega como contexto organizacional, no como problema formalizado: el equipo debe extraer entradas, salidas, restricciones y operaciones críticas | ⚠️ Vacío parcial: los laboratorios entregan problemas ya definidos. Requiere al menos una sesión de modelado |
| RADE1-2 — Diseña y compara estrategias | 25 | Exige explícitamente dos operaciones × dos estrategias cada una | ✅ Cubierto (Labs 2, 3 y 5 ya comparan enfoques) |
| RADT1 — Evalúa el desempeño | 30 | Pruebas con tamaños crecientes, métricas objetivas y contraste con la complejidad teórica | ✅ Cubierto: es la marca declarada del curso |
| RAG2 — Principios éticos | 10 | Errores de depuración y falsos positivos de la detección de atípicos afectan a usuarios reales, con costo asignable | ❌ Sin cobertura. Requiere contenido nuevo |
| RAG4 — Impacto ambiental, social y futuro | 10 | El consumo eléctrico es **calculable** con los datos del caso (450 W, tiempo medido). La proyección a 3.000.000 de cuentas mide sostenibilidad | ❌ Sin cobertura. Requiere contenido nuevo |

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

Aun así, **este anclaje no sustituye la enseñanza del tema**: sigue siendo
necesario dictar contenido sobre implicaciones éticas y ambientales de las
decisiones algorítmicas antes de exigir esa evidencia.

## Impacto pendiente sobre el microdiseño

Este documento **no modifica** `info.md` ni `cronograma-dia-a-dia.md`. Los
ajustes que quedarían pendientes, una vez se confirmen las condiciones del
instrumento el 19 de agosto, son:

1. **Ubicación del proyecto en el sistema de evaluación.** El esquema actual ya
   suma 100% (5 laboratorios 80% + Seguimiento 20%). La opción recomendada es
   que el proyecto reemplace al Laboratorio 5 (20%) y opere como cierre
   integrador, manteniendo el dictado de programación dinámica y algoritmos
   voraces. Depende de la respuesta a la pregunta 3 de la reunión.
2. **Sesión de modelado** (RADE1-1): traducir un requisito organizacional en un
   problema computacional. No existe hoy en el microdiseño.
3. **Hilo transversal de ética e impacto** (RAG2, RAG4): integrarlo a sesiones
   existentes en lugar de abrir una semana nueva. El enganche natural está en la
   Semana 3, que ya argumenta que los algoritmos son una tecnología con
   consecuencias medibles en tiempo y dinero; extenderlo a energía, acceso y
   equidad cuesta media sesión.
4. **Trabajo en equipo.** El curso es hoy íntegramente individual: repositorio
   individual e informes individuales. Definir conformación de equipos,
   estrategia de repositorio compartido y trazabilidad individual por commits
   (este último criterio ya se valora en Seguimiento, de modo que transfiere sin
   fricción).
5. **Hitos intermedios del proyecto** en el cronograma, según lo que exija la
   Facultad.
