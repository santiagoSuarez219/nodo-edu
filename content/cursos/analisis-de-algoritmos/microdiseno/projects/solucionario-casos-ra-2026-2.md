# Solucionario — Casos de estudio RA 2026-2 — Análisis de Algoritmos

> **Uso exclusivo del docente.** No se entrega a los estudiantes ni a la
> Facultad. Ruta de solución de cada operación de los tres casos de
> `casos-evaluacion-ra-2026-2.md`, construida con contenido dictado en el
> curso. Sirve como referencia al calificar.

**Convenciones**

- **S** = semana del curso. **n** = registros, **k** = elementos a
  seleccionar, **W** = capacidad en kg, **h** = altura del árbol de búsqueda,
  **α** = factor de carga de la tabla hash.
- Las estrategias en **negrita** en la columna "Estrategia" cumplen la
  actividad 3 del instrumento: dividir y vencer, voraz o programación dinámica
  aplicada a una operación distinta del ordenamiento.

---

## Caso 1 — Recaudo del sistema integrado de transporte

| Operación | Hoy | Solución con lo visto | Estrategia | Complejidad | Dónde se vio |
|---|---|---|---|---|---|
| 1. Deduplicación | Compara cada validación con todas las aceptadas, Θ(n²) | Tabla hash con clave (validador, tarjeta, marca de tiempo); si la clave ya está, es repetida. Alternativas: árbol de búsqueda, u ordenar y comparar vecinos | Estructura de datos | Hash Θ(n) esperado; árbol Θ(n log n) promedio, Θ(n²) si degenera; ordenar Θ(n log n) | S13, Lab 3 |
| 2. Orden por tarjeta y hora | Insertion sort, Θ(n²) | Merge sort con clave compuesta (tarjeta, marca de tiempo). Es estable, así que también se puede ordenar en dos pasadas | Dividir y vencer | Θ(n log n) | S3–4, Lab 1 |
| 3. Franjas de congestión | Evalúa todos los tramos, Θ(n²) por estación | Subarreglo máximo sobre el saldo neto por intervalo | **Dividir y vencer** | Θ(n log n) por estación | S7 y S10, Lab 2 |
| 4. Tope tarifario | Explora todas las combinaciones de pases (exponencial) o aplica una regla voraz que cobra de más | El costo mínimo desde el día i es el menor entre: pasajes sencillos o pase diario de ese día + costo desde i+1; pase semanal + costo desde i+7; pase mensual + costo desde i+30. Se resuelve con memoización o tabulación, como el corte de varillas. La regla voraz actual sirve de contraejemplo | **Programación dinámica** frente a voraz | Θ(d) por tarjeta (d ≤ 30 días); Θ(tarjetas · 30) en total | S15, Lab 4 |

## Caso 2 — Pulso, tamizaje de diabetes

| Operación | Hoy | Solución con lo visto | Estrategia | Complejidad | Dónde se vio |
|---|---|---|---|---|---|
| 1. Pacientes repetidos | Busca a cada paciente recorriendo la lista consolidada, Θ(n²) | Tabla hash con clave (tipo, número de documento); si el paciente ya está, se conserva el resultado con la fecha más reciente. Alternativa: árbol de búsqueda | Estructura de datos | Hash Θ(n) esperado; árbol Θ(n log n) promedio | S13, Lab 3 |
| 2. Los 9.000 de mayor riesgo | Insertion sort de los 1.450.000 registros, Θ(n²) | Merge sort con clave (riesgo descendente, fecha ascendente) y se toman los primeros k. Alternativa: mantener una lista ordenada con los k mayores, Θ(n·k). Con k = 9.000 esa alternativa **pierde** (≈ 1,3·10¹⁰ frente a ≈ 3·10⁷ operaciones), y descubrirlo es parte del hallazgo esperado | Dividir y vencer (en el ordenamiento: no cuenta para la actividad 3) | Θ(n log n) | S3–4 |
| 3. Jornadas de la unidad móvil | Orden de llegada; la alternativa exhaustiva es Θ(2ⁿ) | Selección de actividades: ordenar por hora de fin y tomar cada jornada que no se cruce. Maximiza el **número** de jornadas | **Voraz** | Θ(n log n) | S15, Lab 4 |
| 4. Laboratorio descalibrado | Evalúa todos los tramos, Θ(n²) por laboratorio | Subarreglo máximo sobre el exceso de positivos por lote | **Dividir y vencer** | Θ(n log n) por laboratorio | S7 y S10, Lab 2 |

## Caso 3 — Banco de alimentos

| Operación | Hoy | Solución con lo visto | Estrategia | Complejidad | Dónde se vio |
|---|---|---|---|---|---|
| 1. Consulta de inventario | Recorre la lista completa, Θ(n) por consulta | Tabla hash por código para la consulta puntual y árbol de búsqueda por fecha de vencimiento para el rango. La hash **no** sirve para rangos: es la misma discusión del Lab 3 | Estructura de datos | Hash Θ(1 + α); árbol Θ(h + m), con m = lotes del rango | S13, Lab 3 |
| 2. Orden FEFO | Insertion sort sobre la lista de ayer más los lotes nuevos, Θ(n·m) | Ordenar con merge sort solo los m lotes nuevos y mezclarlos con la lista ya ordenada usando el paso de combinación de merge sort. Alternativa: merge sort completo | Dividir y vencer (en el ordenamiento: no cuenta para la actividad 3) | Θ(n + m log m) frente a Θ(n log n) | S3–4, Lab 1 |
| 3. Cargue de vehículos | Carga por orden de vencimiento hasta que no cabe el siguiente lote (78 % de capacidad); la alternativa exhaustiva es Θ(2ⁿ) | Mochila 0/1 con tabla lotes × kg y reconstrucción de qué lotes suben. El voraz por densidad (valor/kg) es rápido pero no garantiza el óptimo | **Programación dinámica** frente a voraz | Θ(n·W); con 600 lotes y 4.000 kg son ≈ 2,4·10⁶ celdas por vehículo | S15, Lab 4 (mochila 0/1 es una opción de la guía) |
| 4. Saturación de la bodega | Evalúa todos los tramos, Θ(n²) por categoría | Subarreglo máximo sobre el cambio neto por hora | **Dividir y vencer** | Θ(n log n) por categoría | S7 y S10, Lab 2 |

---

## Lo que sale de la tabla

- **Todos los equipos pueden cumplir la actividad 3 con dividir y vencer.**
  Cada caso tiene un subarreglo máximo (operaciones 1.3, 2.4 y 3.4), que es el
  contenido más practicado del curso, en el Lab 2. Programación dinámica y
  voraz (1.4, 2.3 y 3.3) son la ruta más exigente, porque se dictaron en una
  sola sesión.
- **Hallazgos no obvios, buenos para los niveles Crítico y Reflexivo:**
  - En el Caso 2, la idea "inteligente" de quedarse solo con los k mayores
    pierde contra ordenar todo.
  - En el Caso 3, la tabla hash es mejor para la consulta puntual y el árbol
    para la consulta por rango.
  - En el Caso 1, la regla voraz del tope tarifario parece razonable pero
    cobra de más.
  - En el Caso 3, ordenar con insertion sort una lista "casi ordenada" no
    sirve aquí: cada uno de los 6.000 a 9.000 lotes nuevos se desplaza en
    promedio la mitad de los 220.000 lotes (del orden de 10⁹ movimientos).
- **Extensiones por autoestudio (no exigidas):**
  - Kadane, Θ(n), para el subarreglo máximo.
  - Montículo de tamaño k, Θ(n log k), para el Caso 2.
  - Programación dinámica ponderada por pacientes en las jornadas del Caso 2.
    Es la respuesta técnica a la pregunta ética del caso: optimizar el número
    de jornadas o el número de pacientes de alto riesgo atendidos.
