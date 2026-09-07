---
title: "Laboratorio evaluativo 01 — Fundamentos, complejidad y recurrencias"
updatedAt: "2026-09-06"
---

# Laboratorio evaluativo 01 — Fundamentos, complejidad y recurrencias

> **Evaluación:** este laboratorio corresponde al **Laboratorio 1 (15 %)** de la nota del curso. Se entrega como informe en GitHub, en la carpeta `lab1-fundamentos-complejidad-recurrencias/` de su repositorio del curso.

## Objetivo

Analizar una situación problema del sector salud y responder, con argumentos y con datos que usted mismo produzca, qué algoritmo de ordenamiento debe ejecutarse en ese sistema. Las cuatro partes del laboratorio son cuatro miradas sobre el mismo caso: por qué se analiza el algoritmo antes de comprar hardware, qué responsabilidad ambiental y ética implica ponerlo en producción, cómo se comporta ante distintos tipos de entrada, y cuál es su complejidad calculada en papel y verificada en la máquina.

Competencias esperadas:
- Justificar la importancia del análisis de algoritmos frente a la alternativa de mejorar el hardware, distinguiendo entre un algoritmo **correcto** y un algoritmo **viable**.
- Argumentar la responsabilidad ambiental y ética que asume quien decide qué algoritmo corre en producción sobre datos de personas.
- Explicar el peor caso, el mejor caso y el caso promedio, y **demostrarlos experimentalmente** con una implementación instrumentada en Python.
- Calcular la complejidad **O** de merge sort resolviendo su recurrencia por uno de los tres métodos vistos en clase, y la de insertion sort analizando su código línea a línea.
- Instrumentar, medir y graficar con `matplotlib` el tiempo de ejecución y el número de comparaciones, y leer en la gráfica cuál de los dos algoritmos conviene.
- Emitir una recomendación técnica defendible ante un cliente, anclada en sus propias mediciones.

## Requisitos Previos

Debe dominar el contenido de las cuatro lecciones teóricas del bloque:
- **"Algoritmos como tecnología"** (Semana 3): qué es un algoritmo, modelado de un problema, eficiencia como energía y acceso, insertion sort y su invariante de ciclo.
- **"Análisis de algoritmos y divide y vencerás"** (Semana 4): complejidad temporal vs. espacial, peor/mejor/caso promedio, orden de crecimiento, merge sort.
- **"Notación O, Θ y Ω"** (Semana 5): definiciones formales de las tres notaciones y jerarquía de funciones comunes.
- **"Cómo resolver recurrencias"** (Semana 6): planteamiento de la recurrencia, método de sustitución, árbol de recursión y método maestro.

Además necesita, del **"Laboratorio 01 — Repositorio del curso"** y del **"Laboratorio 02 — Configuración del entorno de trabajo"**:
- Su repositorio del curso vinculado a GitHub, con commits descriptivos y frecuentes.
- El entorno virtual de la raíz del repositorio activado, con `matplotlib` instalado y registrado en `requirements.txt`.

## La situación problema

**Plataforma Tamiza — Secretaría de Salud departamental.**

La Secretaría de Salud opera un programa de **tamizaje cardiovascular** en 340 laboratorios e IPS del departamento. Cada laboratorio envía durante el día los resultados de las pruebas que procesó. Al cierre de la jornada, la plataforma Tamiza tiene acumulados **1.200.000 registros pendientes de gestión**: los resultados de los últimos treinta días que todavía no han sido contactados.

Cada registro trae un **índice de riesgo** entre 0 y 1000, calculado por la plataforma a partir de los valores de laboratorio y de la historia clínica del paciente. Entre las 2:00 a. m. y las 6:00 a. m. corre un proceso automático que debe **ordenar los 1.200.000 registros por índice de riesgo, de mayor a menor**, y generar la lista de llamadas del día. A las 6:00 a. m. el centro de contacto abre y empieza a llamar por esa lista, de arriba hacia abajo: los pacientes con mayor riesgo son contactados primero para citarlos a valoración médica. La ventana del proceso es, por lo tanto, de **cuatro horas** y no es negociable.

**El problema.** La plataforma fue escrita hace ocho años, cuando el programa cubría 4 municipios y unos 20.000 registros. El ordenamiento se implementó entonces con **insertion sort** y nunca se volvió a tocar: siempre funcionó. Con la ampliación del programa a todo el departamento, el proceso empezó a desbordar la ventana. En las últimas semanas, la lista de llamadas ha quedado incompleta tres veces: el proceso no alcanzó a terminar antes de las 6:00 a. m. y el centro de contacto trabajó con una lista parcial, **no ordenada por riesgo**.

**La decisión sobre la mesa.** El área de infraestructura propone **duplicar la capacidad del servidor** —contratar una máquina del doble de velocidad de reloj— y dejar el software como está. El argumento es que el algoritmo "ya está probado, lleva ocho años funcionando y entrega el resultado correcto". La Secretaría le pide a usted un concepto técnico antes de firmar el contrato.

**Cómo llega el lote de registros.** El equipo de la plataforma le informa que la forma en que llegan los datos depende del canal de origen, y que hay tres escenarios posibles:

| Escenario | Canal de origen | Cómo llega el lote de registros |
|---|---|---|
| **A — Aleatorio** | Cargue directo desde el portal web de los laboratorios | Los registros quedan en el orden en que cada laboratorio los subió: sin ninguna relación con el índice de riesgo. |
| **B — Casi ordenado** | Reproceso sobre la lista del día anterior | El 98 % del lote es la lista de ayer, que ya quedó ordenada por riesgo; el 2 % restante son los resultados nuevos del día, que se anexan al final sin ordenar. |
| **C — Orden inverso** | Migración desde el sistema legado de historia clínica | El sistema anterior exporta los registros del índice de riesgo **menor al mayor**, es decir, exactamente al revés de lo que Tamiza necesita. |

## Desarrollo del Laboratorio

El laboratorio tiene **cuatro partes**. Las Partes 1 y 2 son argumentativas y se responden en el `README.md`. Las Partes 3 y 4 son teórico-prácticas: cada afirmación se sostiene con código que usted escribe, con mediciones que usted produce y con gráficas que usted genera.

Escriba las respuestas argumentativas **con sus propias palabras**. Una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente: lo que se evalúa es su comprensión, no su capacidad de transcribir.

### Parte 1 — Analizar el algoritmo antes de comprar hardware

Responda, en un máximo de **500 palabras**, la siguiente pregunta:

> La Secretaría está por firmar la compra de un servidor del doble de velocidad para que el proceso de Tamiza quepa en la ventana de cuatro horas. ¿Por qué debe analizarse primero el algoritmo, si el que está en producción lleva ocho años entregando el resultado correcto?

**Requisitos:**
- Distinga explícitamente entre **corrección** (el ordenamiento que produce Tamiza es el correcto) y **eficiencia** (lo produce dentro de la ventana de cuatro horas), y explique por qué la primera no implica la segunda. Nombre la restricción concreta que el sistema incumple.
- Explique **por qué duplicar la velocidad del servidor no resuelve el problema de fondo**.
- Incluya **un segundo ejemplo, propio y distinto de Tamiza**, en el que un algoritmo correcto resulta inviable: un sistema que usted use, conozca o haya programado. Un ejemplo es concreto cuando indica qué se procesa, aproximadamente cuántos datos hay y qué restricción se incumple (una ventana de tiempo, una latencia máxima, una capacidad de memoria).

**Restricciones:**
- No transcriba definiciones del libro; toda definición que use debe estar redactada por usted.
- No use la palabra "eficiente" sin decir respecto a qué recurso y a qué restricción.
- No repita el caso de la empresa de energía discutido en clase: el caso de esta guía es Tamiza.

### Parte 2 — Responsabilidad ambiental y ética de la implementación

Responda, en un máximo de **600 palabras**, la siguiente pregunta:

> Como responsable técnico de Tamiza, ¿qué responsabilidad ambiental y ética asume al decidir qué algoritmo de ordenamiento se ejecuta cada madrugada sobre los datos de 1.200.000 pacientes?

**Requisitos:**
- **Dimensión ambiental:** explique cómo el tiempo de ejecución del proceso nocturno se traduce en consumo energético, y por qué ese consumo se multiplica cuando el proceso corre **todas las madrugadas durante años**.
- **Dimensión ética:** identifique **al menos dos formas concretas** en que la lentitud o el fallo de este algoritmo perjudica a una persona identificable. Para cada una, responda explícitamente: **¿quién asume el costo del error?** ¿El paciente, el operador del centro de contacto, la Secretaría, el equipo de desarrollo?
- Discuta brevemente una tensión propia de este caso: el orden de la lista **decide a quién se llama primero**. ¿Qué obligación adicional impone eso sobre la corrección del ordenamiento, más allá del tiempo?

### Parte 3 — Peor caso, mejor caso y caso promedio, demostrados en Python

Esta parte se responde en **dos niveles**: primero explica los tres casos con sus palabras, y después los **demuestra experimentalmente** sobre los tres escenarios de entrada de Tamiza.

#### 3.1 — Explicación

**Requisitos:**
- Defina peor caso, mejor caso y caso promedio indicando, para cada uno, **sobre qué se toma el máximo, el mínimo o el promedio**: ¿sobre qué conjunto de entradas, y con qué tamaño fijo? No basta con decir "el caso malo".
- Responda de forma justificada: **¿cuál de los tres casos usaría para decidir si el algoritmo de Tamiza entra en producción, sabiendo que la ventana de cuatro horas es estricta, y por qué?**
- Prediga, **antes de medir**, qué caso de análisis representa cada escenario de Tamiza para insertion sort: ¿el escenario A, el B o el C es su peor caso? ¿Cuál su mejor caso? Escriba la predicción en el informe y déjela ahí aunque el experimento la contradiga; si la contradice, explique por qué.

#### 3.2 — Demostración experimental

Implemente insertion sort instrumentado y los tres generadores de escenarios, y demuestre con datos los tres casos.

Implemente en `algoritmos.py` la siguiente función, respetando la firma y el *docstring*:

```python
"""Algoritmos de ordenamiento instrumentados para el Laboratorio 1."""


def insertion_sort(datos: list[int]) -> tuple[list[int], int]:
    """Ordena una lista de indices de riesgo con el metodo de insercion.

    No modifica la lista recibida: trabaja sobre una copia.

    Args:
        datos: lista de indices de riesgo a ordenar.

    Returns:
        Una tupla con la lista ordenada y el numero total de
        comparaciones entre elementos realizadas durante el proceso.
    """
    # TODO: implemente el algoritmo contando cada comparacion
    # entre dos elementos de la lista.
```

Implemente en `datos.py` un generador por escenario:

```python
"""Generadores de lotes de registros para los escenarios de Tamiza."""


def generar_aleatorio(n: int, semilla: int = 42) -> list[int]:
    """Genera un lote de n registros en orden aleatorio (escenario A).

    Args:
        n: cantidad de registros del lote.
        semilla: semilla del generador aleatorio, para que el
            experimento sea reproducible.

    Returns:
        Lista de n indices de riesgo enteros distintos, desordenada.
    """
    # TODO: implemente el escenario A.


def generar_casi_ordenado(n: int, semilla: int = 42) -> list[int]:
    """Genera un lote casi ordenado: 98% ordenado y 2% al final (escenario B).

    Args:
        n: cantidad de registros del lote.
        semilla: semilla del generador aleatorio.

    Returns:
        Lista de n indices de riesgo enteros distintos, con el primer
        98% en el orden que el algoritmo produce y el 2% restante
        desordenado al final.
    """
    # TODO: implemente el escenario B.


def generar_inverso(n: int) -> list[int]:
    """Genera un lote en el orden exactamente contrario (escenario C).

    Args:
        n: cantidad de registros del lote.

    Returns:
        Lista de n indices de riesgo enteros distintos, en el orden
        inverso al que el algoritmo debe producir.
    """
    # TODO: implemente el escenario C.
```

Implemente en `parte3_casos.py` el experimento de esta parte.

**Requisitos:**
- `insertion_sort` debe retornar una lista **nueva** ordenada, sin alterar la lista recibida, y contar las **comparaciones entre elementos** de la lista. No cuente comparaciones de índices ni de límites de ciclo.
- Los tres generadores deben producir listas del mismo tamaño `n`, con índices distintos entre sí, y los que usan aleatoriedad deben aceptar una **semilla** para que sus mediciones sean reproducibles por el docente.
- Ejecute `insertion_sort` sobre los tres escenarios, para al menos **siete tamaños de entrada** (por ejemplo: 100, 200, 400, 800, 1600, 3200, 6400), registrando **tiempo de ejecución** (con `time.perf_counter()`) y **número de comparaciones**.
- Produzca **dos gráficas** en `graficas/`:
  1. `parte3_comparaciones.png` — comparaciones vs. tamaño de entrada, los tres escenarios en los mismos ejes.
  2. `parte3_tiempo.png` — tiempo vs. tamaño de entrada, los tres escenarios en los mismos ejes.
- En el `README.md`, incruste las dos gráficas y responda: **qué escenario resultó ser el peor caso, cuál el mejor y cuál se aproxima al caso promedio**.
- Contraste el resultado con la predicción que escribió en 3.1.

**Restricciones:**
- No use `sorted()`, `list.sort()` ni ninguna librería de ordenamiento. Detectarlo en el código entregado invalida el criterio de implementación completo.
- No mida el tiempo de generación de los datos: cronometre únicamente la llamada al algoritmo.

### Parte 4 — Complejidad de merge sort e insertion sort: cálculo y validación

Esta parte también tiene dos niveles: primero **calcula** la complejidad en papel, después la **valida** en la máquina.

#### 4.1 — Cálculo teórico

**Requisitos:**
- Plantee la recurrencia de **merge sort**: `T(n) = 2T(n/2) + Θ(n)`. Explique de dónde sale cada término del planteamiento (cuántos subproblemas, de qué tamaño, y cuál es el costo de combinar).
- Resuélvala con **uno** de los tres métodos vistos en clase —sustitución, árbol de recursión o método maestro— hasta obtener la cota final. Muestre el desarrollo paso a paso:
  - Si eligió **árbol de recursión**: incluya el árbol dibujado (imagen escaneada, diagrama digital o texto ASCII dentro de un bloque de código) con el costo por nivel, el número de niveles y el costo total.
  - Si eligió **sustitución**: muestre la hipótesis inductiva, el paso inductivo y las constantes que la sostienen.
  - Si eligió **método maestro**: identifique `a`, `b` y `f(n)`, verifique explícitamente la condición del caso que aplica y concluya.
- Calcule la cota de insertion sort de forma manual, **línea a línea**: indique cuántas veces se ejecuta cada línea de su implementación, sume los costos y explique el resultado.
- Deje escrita, en una tabla, la complejidad esperada de cada algoritmo en el mejor, el peor y el caso promedio.

**Restricciones:**
- No presente solo el resultado final: sin desarrollo intermedio, el criterio se califica en cero.

#### 4.2 — Validación experimental

Agregue merge sort a `algoritmos.py`, respetando la firma y el *docstring*:

```python
def merge_sort(datos: list[int]) -> tuple[list[int], int]:
    """Ordena una lista de indices de riesgo con el metodo de mezcla.

    No modifica la lista recibida: trabaja sobre una copia.

    Args:
        datos: lista de indices de riesgo a ordenar.

    Returns:
        Una tupla con la lista ordenada y el numero total de
        comparaciones entre elementos realizadas durante el proceso.
    """
    # TODO: implemente dividir, conquistar y combinar, contando
    # cada comparacion realizada dentro de la mezcla.
```

Implemente en `parte4_complejidad.py` la medición comparativa y las gráficas de esta parte.

**Requisitos:**
- Mida el **tiempo de ejecución** de los dos algoritmos sobre el escenario A de Tamiza, con los mismos tamaños de entrada de la Parte 3 y con `time.perf_counter()`.
- Produzca la gráfica `parte4_tiempo.png` — tiempo vs. tamaño de entrada, con **una curva por algoritmo** en los mismos ejes. Debe tener **título, etiquetas en ambos ejes con sus unidades y leyenda**. Una gráfica sin ejes rotulados no se califica.
- Incruste la gráfica en el `README.md` y concluya, a partir de ella, **cuál de los dos algoritmos es mejor para Tamiza y por qué**: describa qué hace cada curva a medida que crece el tamaño de entrada.
- Diga si esa conclusión coincide con las complejidades que calculó en 4.1. Si para los tamaños pequeños la gráfica muestra algo distinto de lo esperado, explíquelo en una o dos frases.

**Restricciones:**
- No use tamaños tan grandes que insertion sort tarde más de un par de minutos por medición; el objetivo es ver la forma de la curva, no saturar su equipo.
- No concluya cuál algoritmo es mejor apoyándose solo en la teoría: la conclusión debe leerse en su propia gráfica.

#### 4.3 — Concepto técnico a la Secretaría de Salud

Cierre el informe con una sección de entre **400 y 600 palabras** dirigida al equipo de ingeniería de la Secretaría, respondiendo la consulta con la que abre la situación problema.

**Requisitos:**
- Recomiende explícitamente qué algoritmo debe ejecutar Tamiza, **sabiendo que el canal de entrada puede cambiar sin aviso** y que el equipo no quiere mantener tres implementaciones distintas. Justifique el criterio con el que resolvió ese compromiso.
- Estime si el proceso cabe en la ventana de **cuatro horas** con 1.200.000 registros, para el algoritmo actual y para el que recomienda. Extrapole a partir de sus mediciones: explique el razonamiento de la extrapolación y **declare que es una estimación**, no una medición.
- Responda de forma directa a la propuesta de comprar el servidor del doble de velocidad, apoyándose en un dato medido por usted (cite la gráfica y el tamaño de entrada del que lo tomó).
- Discuta al menos una consideración distinta del tiempo puro: la memoria adicional que consume merge sort, la estabilidad del ordenamiento, el costo de mantener el código, o el riesgo de que el escenario B deje de ser casi ordenado si cambia el flujo de reproceso.

**Restricciones:**
- El documento va dirigido a un equipo de ingeniería, no al docente: no escriba "en este laboratorio aprendí". Escriba un concepto técnico profesional.
- No recomiende un algoritmo apoyándose únicamente en la teoría: cada afirmación sobre desempeño debe estar anclada a un dato medido por usted.

## Entregable

```
curso-analisis-algoritmos/
└── lab1-fundamentos-complejidad-recurrencias/
    ├── README.md
    ├── algoritmos.py
    ├── datos.py
    ├── parte3_casos.py
    ├── parte4_complejidad.py
    └── graficas/
        ├── parte3_comparaciones.png
        ├── parte3_tiempo.png
        └── parte4_tiempo.png
```

El `README.md` es el informe completo y **el único documento que se califica como texto**. Debe contener, en este orden y con un encabezado por parte:

1. Su nombre completo y una sección de instrucciones para reproducir el experimento (cómo activar el entorno y qué comando ejecutar para cada parte).
2. **Parte 1** — la respuesta argumentativa.
3. **Parte 2** — la respuesta argumentativa.
4. **Parte 3** — la explicación y la predicción de 3.1, **las dos gráficas incrustadas** y el análisis de 3.2.
5. **Parte 4** — el desarrollo del método de recurrencias, la tabla de complejidades, **la gráfica de tiempo vs. tamaño incrustada** con la conclusión sobre cuál algoritmo es mejor, y el concepto técnico de 4.3.

Además, **cada parte práctica debe enlazar su código**: al inicio de la Parte 3 y de la Parte 4, incluya un enlace en Markdown al archivo `.py` correspondiente dentro del repositorio (por ejemplo, un enlace de texto "código de la Parte 3" apuntando a `parte3_casos.py`), y un enlace a `algoritmos.py` y `datos.py` donde los mencione por primera vez. Un informe que describe resultados sin enlazar el código que los produjo pierde el criterio de documentación.

Las gráficas se incrustan con la sintaxis de imagen de Markdown y **ruta relativa** a la ubicación del `README.md`; no basta con adjuntarlas en la carpeta. 

Haga `push` a su repositorio en la rama `main` antes del cierre del plazo. Se califica lo que esté publicado en GitHub en ese momento.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 25 | Las Partes 1 y 2 responden lo que se pregunta sobre el caso Tamiza: distinguen corrección de eficiencia nombrando la restricción incumplida, explican por qué duplicar la velocidad del servidor no resuelve el problema de fondo, incluyen un segundo ejemplo propio con datos y restricción, relacionan el tiempo de ejecución con el consumo energético acumulado del proceso diario, identifican dos perjuicios concretos indicando quién asume el costo, y discuten la obligación que impone el hecho de que el orden de la lista decida a quién se llama primero. |
| **Calidad de la explicación teórica** | 25 | La Parte 3.1 define los tres casos indicando sobre qué se toma el máximo, el mínimo y el promedio, justifica cuál usaría para decidir si el algoritmo entra en producción y declara la predicción previa al experimento. La Parte 4.1 plantea la recurrencia de merge sort explicando cada término, la resuelve paso a paso hasta la cota final por el método elegido, calcula la cota de insertion sort línea a línea y presenta la tabla de complejidades por caso. |
| **Corrección de la implementación** | 20 | `insertion_sort` y `merge_sort` ordenan correctamente los tres escenarios sin modificar la lista recibida, cuentan comparaciones entre elementos y no usan `sorted()` ni `list.sort()`; `merge_sort` implementa su propia mezcla recursiva. Los tres generadores producen los lotes especificados con semilla reproducible. El código cumple PEP 8, con *type hints* y *docstring* Google-style en cada función. |
| **Calidad del análisis de las gráficas** | 20 | Las tres gráficas existen, tienen título, ejes rotulados con unidades y leyenda. La Parte 3.2 identifica con evidencia cuál escenario es el peor, el mejor y el promedio. La Parte 4.2 grafica el tiempo de los dos algoritmos frente al tamaño de entrada en los mismos ejes, concluye cuál es mejor para Tamiza describiendo lo que hace cada curva, y contrasta esa conclusión con las complejidades calculadas en 4.1. El concepto técnico de 4.3 recomienda un algoritmo, responde a la propuesta del servidor con un dato medido, incluye la extrapolación a la ventana de cuatro horas declarada como estimación y discute una consideración distinta del tiempo. |
| **Documentación y organización del informe** | 10 | El repositorio tiene la estructura de carpetas exacta del entregable, el `README.md` está organizado por partes con las gráficas incrustadas y visibles en GitHub, **cada parte práctica enlaza su código**, hay instrucciones de reproducción, y existen al menos cinco commits descriptivos que documentan el avance. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así: `nota_curso = (puntos / 100) x 15 %`.

## Dificultades Comunes

### "Mi merge sort es más lento que insertion sort y creo que lo implementé mal"

- Para entradas pequeñas —del orden de decenas o pocos cientos de elementos— eso es lo **esperado**, no un error: merge sort paga el costo de crear listas nuevas y llamar funciones recursivas, y esas constantes pesan más que la ventaja asintótica. Es justo el tipo de detalle que la Parte 4.2 le pide explicar cuando la gráfica no se parece a lo esperado. Verifique que la tendencia se invierte al aumentar el tamaño; si no se invierte nunca hasta 6400 elementos, sí revise su implementación.

### "En el escenario B insertion sort me da tiempos casi idénticos a los del escenario A"

- Revise su generador: probablemente el 2 % desordenado está quedando repartido por toda la lista en vez de anexado al final, o el 98 % no está realmente ordenado. Imprima los primeros y los últimos veinte elementos de un lote pequeño (por ejemplo con `n` igual a 100) y verifíquelo a ojo antes de medir.

### "No sé en qué sentido debo ordenar: Tamiza necesita de mayor a menor riesgo"

- Elija un sentido, declárelo en el informe y sea consistente en todo el laboratorio: los tres generadores, los dos algoritmos y la interpretación de los escenarios deben referirse al mismo criterio. Ordenar de mayor a menor no cambia ninguna complejidad; lo que sí cambia es cuál escenario resulta ser el peor caso, así que una inconsistencia aquí arruina el análisis de la Parte 3.

### "Mis tiempos varían mucho entre ejecuciones y las curvas salen con dientes de sierra"

- Es ruido del sistema operativo, y es normal en mediciones de milisegundos. Repita cada medición unas tres veces y grafique el promedio o la mediana en vez de una sola corrida, y cierre otras aplicaciones mientras mide. Si lo hace, dígalo en el informe: la forma en que midió es parte del resultado.

### "No sé si mi conteo de comparaciones está bien"

- Verifique con casos pequeños de resultado conocido: para una lista que ya viene en el orden que el algoritmo produce, insertion sort hace exactamente `n - 1` comparaciones. Si su conteo no coincide con ese valor, está contando comparaciones de índices o de límites de ciclo además de las comparaciones entre elementos.

### "En el método maestro no sé qué caso aplicar a la recurrencia de merge sort"

- Empiece por identificar los tres ingredientes por separado: cuántos subproblemas genera cada llamada, en cuánto se reduce el tamaño en cada una, y cuál es el costo del trabajo de combinar. Compare después el costo de combinar con el crecimiento que imponen los dos primeros ingredientes. La condición del caso que invoque debe quedar escrita y verificada en el informe, no dada por supuesta.

### "No sé cómo extrapolar mis mediciones a 1.200.000 registros"

- No extrapole con una regla de tres: la relación no es lineal. Use la forma de la curva. Si midió un tiempo `t` para un tamaño `n` y el algoritmo es cuadrático, al pasar a un tamaño `k` veces mayor el tiempo se multiplica aproximadamente por `k` al cuadrado; si es `n log n`, por `k` multiplicado por el crecimiento del logaritmo. Escriba el razonamiento en el informe y declare explícitamente que el resultado es una estimación con supuestos, no una medición.

### "Mis gráficas no se ven en el `README.md` de GitHub"

- La ruta de la imagen debe ser relativa a la ubicación del `README.md`, y la carpeta `graficas/` debe estar efectivamente subida al repositorio. Verifique en la vista web de GitHub, no solo en su editor local: es ahí donde se califica.

**Plazo de entrega:** 20 de Septiembre 
