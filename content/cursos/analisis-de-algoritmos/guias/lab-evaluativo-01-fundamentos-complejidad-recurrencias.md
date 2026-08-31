---
title: "Laboratorio evaluativo 01 — Fundamentos, complejidad y recurrencias"
updatedAt: "2026-08-31"
---

# Laboratorio evaluativo 01 — Fundamentos, complejidad y recurrencias

> **Evaluación:** este laboratorio corresponde al **Laboratorio 1 (15 %)** de la nota del curso. Se entrega como informe en GitHub, en la carpeta `lab1-fundamentos-complejidad-recurrencias/` de su repositorio del curso.

## Objetivo

Demostrar que usted comprende **por qué** se analiza un algoritmo antes de escribirlo, **qué** significa cada caso de análisis y su notación, y que sabe **contrastar** una complejidad calculada en papel con el comportamiento medido de un programa real. La guía no busca que recite definiciones: busca que argumente, con ejemplos propios y con datos que usted mismo produzca, una recomendación técnica frente a un problema de ingeniería concreto.

Competencias esperadas:
- Justificar la importancia del análisis de algoritmos con ejemplos concretos, distinguiendo entre un algoritmo **correcto** y un algoritmo **viable**.
- Argumentar la responsabilidad ambiental y ética que asume quien decide qué algoritmo corre en producción.
- Explicar con sus propias palabras el peor caso, el mejor caso y el caso promedio, y asociar cada uno con la notación asintótica que le corresponde.
- Explicar uno de los tres métodos para resolver recurrencias y aplicarlo a la recurrencia de merge sort.
- Implementar insertion sort y merge sort en Python, instrumentarlos, medir su tiempo de ejecución frente al tamaño de entrada y graficar el resultado con `matplotlib`.
- Contrastar la curva medida con la complejidad teórica esperada y emitir una recomendación técnica defendible ante un cliente.

## Requisitos Previos

Debe dominar el contenido de las cuatro lecciones teóricas del bloque:
- **"Algoritmos como tecnología"** (Semana 3): qué es un algoritmo, modelado de un problema, eficiencia como energía y acceso, insertion sort y su invariante de ciclo.
- **"Análisis de algoritmos y divide y vencerás"** (Semana 4): complejidad temporal vs. espacial, peor/mejor/caso promedio, orden de crecimiento, merge sort.
- **"Notación O, Θ y Ω"** (Semana 5): definiciones formales de las tres notaciones y jerarquía de funciones comunes.
- **"Cómo resolver recurrencias"** (Semana 6): planteamiento de la recurrencia, método de sustitución, árbol de recursión y método maestro.

Además necesita, del **"Laboratorio 01 — Repositorio del curso"** y del **"Laboratorio 02 — Configuración del entorno de trabajo"**:
- Su repositorio del curso vinculado a GitHub, con commits descriptivos y frecuentes.
- El entorno virtual de la raíz del repositorio activado, con `matplotlib` instalado y registrado en `requirements.txt`.

## Desarrollo del Laboratorio

El laboratorio tiene **dos bloques**. El bloque conceptual (Partes 1 a 4) se responde en el `README.md` del informe; el bloque práctico (Partes 5 y 6) se responde con código, gráficas y un documento de recomendación.

Escriba las respuestas conceptuales **con sus propias palabras**. Una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente: lo que se evalúa es su comprensión, no su capacidad de transcribir.

### Parte 1 — ¿Por qué analizar algoritmos?

Responda, en un máximo de **400 palabras**, la siguiente pregunta:

> ¿Por qué es importante analizar un algoritmo antes de ponerlo en producción, si de todos modos el algoritmo entrega el resultado correcto?

**Requisitos:**
- Distinga explícitamente entre **corrección** (el algoritmo entrega la salida correcta) y **eficiencia** (la entrega dentro de las restricciones del problema), y explique por qué la primera no implica la segunda.
- Incluya **al menos dos ejemplos concretos y distintos** en los que un algoritmo correcto resulta inviable en la práctica. Un ejemplo es concreto cuando indica: qué se procesa, aproximadamente cuántos datos hay y qué restricción se incumple (una ventana de tiempo, una latencia máxima, una capacidad de memoria).
- **Al menos uno de los dos ejemplos debe ser suyo**: un sistema que usted use, conozca o haya programado. No repita el caso de la empresa de energía que se discutió en clase.
- Cierre explicando qué pregunta se hace un ingeniero cuando pasa de "¿esto funciona?" a "¿esto funciona a tiempo?", y por qué esa segunda pregunta solo se puede responder analizando el algoritmo y no probándolo una vez.

**Restricciones:**
- No transcriba definiciones del libro; toda definición que use debe estar redactada por usted.
- No use la palabra "eficiente" sin decir respecto a qué recurso y a qué restricción.

### Parte 2 — Responsabilidad ambiental y ética de quien diseña algoritmos

Responda, en un máximo de **500 palabras**, la siguiente pregunta:

> Como desarrollador de algoritmos, ¿qué responsabilidad ambiental y ética asume al decidir qué algoritmo se ejecuta en producción?

**Requisitos:**
- **Dimensión ambiental:** explique cómo el tiempo de ejecución se traduce en consumo energético y por qué ese consumo se multiplica cuando un proceso se repite a diario durante años. Acompañe el argumento con **una estimación numérica propia**: elija una potencia de servidor razonable (por ejemplo, entre 300 W y 600 W), dos tiempos de ejecución distintos para el mismo trabajo, y calcule los kilovatios-hora anuales de cada escenario. Muestre la operación, no solo el resultado.
- **Dimensión ética:** identifique **al menos dos formas concretas** en que un algoritmo que procesa datos de personas puede perjudicarlas cuando se equivoca o cuando es lento. Para cada una, responda explícitamente: **¿quién asume el costo del error?**
- Concluya con **tres decisiones verificables** que usted se compromete a tomar en sus propios proyectos como consecuencia de lo anterior. Una decisión es verificable cuando otra persona podría revisar su código o su informe y determinar si la cumplió o no (por ejemplo, "documentar la complejidad de cada función que escriba en el informe" es verificable; "programar de forma responsable" no lo es).

**Restricciones:**
- No repita las cifras exactas de la tabla de la lección: haga su propia estimación con sus propios supuestos y decláralos explícitamente.
- No convierta la respuesta en una lista de buenas intenciones: cada afirmación ética debe estar anclada a una consecuencia concreta sobre una persona identificable (un usuario, un cliente, un ciudadano).

### Parte 3 — Peor caso, mejor caso y caso promedio

Explique, con sus propias palabras, qué entendió por peor caso, mejor caso y caso promedio, y en qué se diferencian.

**Requisitos:**
- Defina los tres casos indicando, para cada uno, **sobre qué se toma el máximo, el mínimo o el promedio** (no basta con decir "el caso malo"): ¿sobre qué conjunto de entradas, y con qué tamaño fijo?
- Presente una tabla comparativa con al menos estas columnas: caso, qué entrada lo produce en insertion sort, qué entrada lo produce en merge sort, notación asintótica correspondiente.
- Explique **qué notación se usa para cada caso y por qué**: por qué el peor caso se expresa naturalmente con **O**, el mejor con **Ω**, y en qué condición un algoritmo admite una cota **Θ** para todos sus casos. Deje claro que la notación no es sinónimo del caso: se puede dar una cota **O** del mejor caso, y merge sort es **Θ(n log n)** en los tres.
- Responda de forma justificada: **¿cuál de los tres casos usaría para decidir si un algoritmo entra en producción en un sistema con una ventana de tiempo estricta, y por qué?**
- Justifique por qué el caso promedio es el más difícil de calcular de los tres.

**Restricciones:**
- No afirme que insertion sort "es O(n²)" sin especificar en qué caso; sea preciso en cada afirmación asintótica que escriba.
- Toda cota que escriba debe ir acompañada de la entrada que la produce.

### Parte 4 — Explicación de un método para resolver recurrencias

Elija **uno** de los tres métodos vistos en clase —sustitución, árbol de recursión o método maestro— y explíquelo con sus propias palabras, como si se lo estuviera enseñando a un compañero que faltó a esa sesión.

**Requisitos:**
- Explique en qué consiste el método, cuáles son sus pasos y **cuándo conviene usarlo** frente a los otros dos (incluya al menos una limitación del método que eligió).
- Aplíquelo completo a la recurrencia de merge sort: `T(n) = 2T(n/2) + Θ(n)`, con `T(1) = Θ(1)`, hasta obtener la cota final.
- Muestre el desarrollo paso a paso. Si eligió el árbol de recursión, incluya el árbol dibujado (puede ser una imagen escaneada, un diagrama digital o texto ASCII dentro de un bloque de código) con el costo por nivel, el número de niveles y el costo total. Si eligió sustitución, muestre la hipótesis inductiva, el paso inductivo y las constantes que la sostienen. Si eligió el método maestro, identifique `a`, `b` y `f(n)`, verifique la condición del caso que aplica y concluya.
- Plantee, adicionalmente, la recurrencia de **insertion sort en su peor caso** y explique en una o dos frases por qué el método que eligió resulta más fácil o más difícil de aplicar sobre ella que sobre la de merge sort.

**Restricciones:**
- No presente solo el resultado final: sin desarrollo intermedio, el criterio se califica en cero.
- No use el método maestro sin verificar explícitamente las condiciones del caso que invoca.

### Parte 5 — Caso de ingeniería: la ventana nocturna de EnerNorte

**El caso.** EnerNorte S. A. es una empresa distribuidora de energía con **1.200.000 medidores** instalados. Cada medidor reporta una lectura diaria y todas las lecturas se acumulan en un servidor durante el día. En la madrugada, un proceso automático debe **ordenar las lecturas por identificador de medidor** antes de facturar. El proceso tiene una ventana de **cuatro horas**, de medianoche a las 4:00 a. m.

El equipo de infraestructura de EnerNorte le informa que las lecturas no siempre llegan del mismo modo, y que la forma de llegada depende del canal:

| Escenario | Canal de origen | Cómo llega el lote de lecturas |
|---|---|---|
| **A — Aleatorio** | Red móvil de los medidores inteligentes | Las lecturas llegan en el orden en que la red las entrega: sin ningún orden respecto al identificador de medidor. |
| **B — Casi ordenado** | Concentradores por sector | El 98 % del lote ya viene ordenado por identificador, porque cada concentrador reporta su sector completo; el 2 % restante corresponde a medidores que reportaron tarde y se anexan al final del lote, desordenados. |
| **C — Orden inverso** | Migración desde el sistema legado | El sistema anterior exporta los registros del identificador mayor al menor. |

EnerNorte necesita saber **qué algoritmo de ordenamiento debe usar en cada escenario** y por qué.

Implemente, mida y grafique. El código va en la carpeta del informe, organizado en los archivos que se indican en el entregable.

#### 5.1 — Implementación instrumentada

Implemente ambos algoritmos en `algoritmos.py`, respetando las firmas y los *docstrings* siguientes:

```python
"""Algoritmos de ordenamiento instrumentados para el Laboratorio 1."""


def insertion_sort(datos: list[int]) -> tuple[list[int], int]:
    """Ordena una lista de enteros con el metodo de insercion.

    No modifica la lista recibida: trabaja sobre una copia.

    Args:
        datos: lista de enteros a ordenar.

    Returns:
        Una tupla con la lista ordenada y el numero total de
        comparaciones entre elementos realizadas durante el proceso.
    """
    # TODO: implemente el algoritmo contando cada comparacion
    # entre dos elementos de la lista.


def merge_sort(datos: list[int]) -> tuple[list[int], int]:
    """Ordena una lista de enteros con el metodo de mezcla.

    No modifica la lista recibida: trabaja sobre una copia.

    Args:
        datos: lista de enteros a ordenar.

    Returns:
        Una tupla con la lista ordenada y el numero total de
        comparaciones entre elementos realizadas durante el proceso.
    """
    # TODO: implemente dividir, conquistar y combinar, contando
    # cada comparacion realizada dentro de la mezcla.
```

**Requisitos:**
- Ambas funciones deben retornar una lista **nueva** ordenada de forma ascendente, sin alterar la lista recibida.
- Ambas deben contar las **comparaciones entre elementos** de la lista. No cuente comparaciones de índices ni de límites de ciclo: solo aquellas en las que se comparan dos valores de los datos.
- `merge_sort` debe implementar la recursión usted mismo, con su propia función de mezcla.

**Restricciones:**
- No use `sorted()`, `list.sort()` ni ninguna librería de ordenamiento. Detectarlo en el código entregado invalida el criterio de implementación completo.
- No modifique las firmas ni los *docstrings* del esqueleto.
- Todo el código debe cumplir PEP 8, con *type hints* en cada parámetro y valor de retorno y *docstring* Google-style en cada función, tal como se estableció en el Laboratorio 02.

#### 5.2 — Generación de los tres escenarios

Implemente en `datos.py` un generador para cada escenario del caso, con estas firmas:

```python
"""Generadores de lotes de lecturas para los escenarios de EnerNorte."""


def generar_aleatorio(n: int, semilla: int = 42) -> list[int]:
    """Genera un lote de n identificadores en orden aleatorio.

    Args:
        n: cantidad de lecturas del lote.
        semilla: semilla del generador aleatorio, para que el
            experimento sea reproducible.

    Returns:
        Lista de n identificadores enteros distintos, desordenada.
    """
    # TODO: implemente el escenario A.


def generar_casi_ordenado(n: int, semilla: int = 42) -> list[int]:
    """Genera un lote casi ordenado: 98% ordenado y 2% anexado al final.

    Args:
        n: cantidad de lecturas del lote.
        semilla: semilla del generador aleatorio.

    Returns:
        Lista de n identificadores enteros distintos, con el primer
        98% en orden ascendente y el 2% restante desordenado al final.
    """
    # TODO: implemente el escenario B.


def generar_inverso(n: int) -> list[int]:
    """Genera un lote en orden descendente de identificador.

    Args:
        n: cantidad de lecturas del lote.

    Returns:
        Lista de n identificadores enteros distintos, en orden
        descendente.
    """
    # TODO: implemente el escenario C.
```

**Requisitos:**
- Los tres generadores deben producir listas del mismo tamaño `n` y con identificadores distintos entre sí.
- Los escenarios que usan aleatoriedad deben aceptar una **semilla**, de modo que sus mediciones sean reproducibles por el docente.

#### 5.3 — Medición y gráficas

Implemente en `experimento.py` la medición y la generación de las gráficas.

**Requisitos:**
- Mida el **tiempo de ejecución** de cada algoritmo en cada escenario, para al menos **siete tamaños de entrada** distintos, en progresión geométrica (por ejemplo: 100, 200, 400, 800, 1600, 3200, 6400). Use `time.perf_counter()`.
- Repita cada medición **al menos tres veces** y reporte el promedio o la mediana; indique en el informe cuál de las dos usó.
- Registre también el **número de comparaciones** que retornan sus funciones, para los mismos tamaños y escenarios.
- Guarde los resultados numéricos en `resultados.csv`, con una fila por combinación de algoritmo, escenario y tamaño.
- Produzca **al menos cuatro gráficas** en formato PNG dentro de la carpeta `graficas/`:
  1. Tiempo vs. tamaño de entrada, ambos algoritmos, escenario A.
  2. Tiempo vs. tamaño de entrada, ambos algoritmos, escenario B.
  3. Tiempo vs. tamaño de entrada, ambos algoritmos, escenario C.
  4. Comparaciones vs. tamaño de entrada, ambos algoritmos, en el escenario que usted considere más revelador.
- Toda gráfica debe tener **título, etiquetas en ambos ejes con sus unidades y leyenda**. Una gráfica sin ejes rotulados no se califica.

**Restricciones:**
- No mida el tiempo de generación de los datos: cronometre únicamente la llamada al algoritmo de ordenamiento.
- No use tamaños tan grandes que insertion sort tarde más de un par de minutos por medición; el objetivo es ver la forma de la curva, no saturar su equipo.

#### 5.4 — Contraste con la complejidad teórica

En el `README.md` del informe, para **cada uno de los tres escenarios**:

**Requisitos:**
- Indique qué caso de análisis representa ese escenario para **cada** algoritmo (por ejemplo: el escenario C es el peor caso de insertion sort, pero para merge sort no cambia nada) y cuál es la complejidad teórica esperada en cada uno.
- Verifique numéricamente el crecimiento: tome dos tamaños consecutivos de su tabla y calcule la razón entre los tiempos medidos. Explique si esa razón se parece más a 2, a 4 o a otro factor, y qué implica eso sobre la curva. Recuerde que al duplicar `n`, un algoritmo cuadrático tiende a cuadruplicar su tiempo, mientras que uno **Θ(n log n)** lo aumenta un poco más del doble.
- Explique **toda discrepancia** entre lo que predice la teoría y lo que muestra su gráfica. Discrepancias esperables: constantes ocultas que hacen a insertion sort más rápido para `n` pequeño, ruido del sistema operativo en las mediciones cortas, y el hecho de que merge sort reserva memoria adicional.
- Indique en qué tamaño aproximado de entrada se **cruzan** las dos curvas en el escenario A, y qué significa ese punto de cruce para un ingeniero que debe elegir un algoritmo.

**Restricciones:**
- No afirme que la gráfica "confirma la teoría" sin mostrar el cálculo de las razones que lo respalda.

### Parte 6 — Recomendación técnica a EnerNorte

Escriba en `recomendacion.md` un documento dirigido al equipo de ingeniería de EnerNorte, de entre **500 y 800 palabras**, en el que recomiende qué algoritmo usar.

**Requisitos:**
- Emita una **recomendación explícita por escenario** (A, B y C). Las tres recomendaciones no tienen por qué coincidir; si coinciden, justifique por qué el escenario no altera la decisión.
- Para cada recomendación, exponga: la ventaja concreta del algoritmo elegido en ese escenario, la desventaja que se acepta al elegirlo, y el dato de su propio experimento que respalda la decisión (cite el número de la gráfica o la fila de `resultados.csv`).
- Estime si el proceso cabe en la ventana de **cuatro horas** con 1.200.000 registros. Extrapole a partir de sus mediciones: explique el razonamiento de la extrapolación y **declare que es una estimación**, no una medición.
- Discuta al menos una consideración distinta del tiempo puro: memoria adicional que consume merge sort, estabilidad del ordenamiento, complejidad de mantener el código, o el riesgo de que el escenario B deje de ser casi ordenado si cambia la infraestructura de concentradores.
- Cierre con una **recomendación única** para el sistema en producción, sabiendo que el canal de entrada puede cambiar sin aviso y que el equipo no quiere mantener tres implementaciones distintas. Justifique el criterio con el que resolvió ese compromiso.

**Restricciones:**
- El documento va dirigido a un equipo de ingeniería, no al docente: no escriba "en este laboratorio aprendí". Escriba una recomendación profesional.
- No recomiende un algoritmo apoyándose únicamente en la teoría: cada recomendación debe estar anclada a un dato medido por usted.

## Entregable

```
curso-analisis-algoritmos/
└── lab1-fundamentos-complejidad-recurrencias/
    ├── README.md
    ├── recomendacion.md
    ├── algoritmos.py
    ├── datos.py
    ├── experimento.py
    ├── resultados.csv
    └── graficas/
        ├── tiempo_escenario_a.png
        ├── tiempo_escenario_b.png
        ├── tiempo_escenario_c.png
        └── comparaciones.png
```

- `README.md`: el informe. Contiene, en este orden y con un encabezado por parte, las respuestas a las Partes 1, 2, 3 y 4, la tabla de resultados de la Parte 5, las gráficas incrustadas y el análisis de contraste de 5.4. Debe incluir al inicio su nombre completo y una sección de instrucciones para reproducir el experimento (cómo activar el entorno y qué comando ejecutar).
- `recomendacion.md`: el documento de la Parte 6.
- `algoritmos.py`, `datos.py`, `experimento.py`: el código de la Parte 5, ejecutable y documentado.
- `resultados.csv`: los datos crudos de las mediciones.
- `graficas/`: las cuatro gráficas en PNG, referenciadas desde el `README.md`.

Realice **al menos cinco commits descriptivos** que documenten el avance del trabajo (por ejemplo: respuestas conceptuales, implementación de los algoritmos, generadores de escenarios, experimento y gráficas, recomendación final). Un único commit con todo el laboratorio penaliza el criterio de documentación y organización.

Haga `push` a su repositorio antes del cierre del plazo. Se califica lo que esté publicado en GitHub en ese momento.

## Criterios de Evaluación

La rúbrica sigue la estructura común a los cinco laboratorios del curso, con los pesos ajustados al énfasis conceptual de esta entrega.

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 25 | Las Partes 1 y 2 responden lo que se pregunta: distinguen corrección de eficiencia, incluyen dos ejemplos concretos (uno propio) con datos y restricción, presentan la estimación energética con su operación visible, identifican dos perjuicios concretos indicando quién asume el costo, y cierran con tres decisiones verificables. |
| **Calidad de la explicación teórica** | 25 | La Parte 3 define los tres casos indicando sobre qué se toma el máximo, el mínimo y el promedio, incluye la tabla comparativa completa y asocia correctamente cada caso con **O**, **Ω** y **Θ** sin confundir caso con notación. La Parte 4 desarrolla el método elegido paso a paso hasta la cota final de `T(n) = 2T(n/2) + Θ(n)`, declara cuándo conviene usarlo y una limitación, y plantea la recurrencia de insertion sort. |
| **Corrección de la implementación** | 20 | `insertion_sort` y `merge_sort` ordenan correctamente los tres escenarios sin modificar la lista recibida, cuentan comparaciones entre elementos, no usan `sorted()` ni `list.sort()`, y los tres generadores producen los lotes especificados con semilla reproducible. El código cumple PEP 8, con *type hints* y *docstring* Google-style en cada función. |
| **Calidad del análisis de las gráficas** | 20 | Las cuatro gráficas existen, tienen título, ejes rotulados con unidades y leyenda. El contraste de 5.4 identifica el caso de análisis de cada escenario para ambos algoritmos, muestra el cálculo de las razones entre tiempos consecutivos, explica las discrepancias observadas y ubica el punto de cruce de las curvas. La Parte 6 recomienda por escenario con ventaja, desventaja y dato medido que la respalda, incluye la extrapolación a la ventana de cuatro horas declarada como estimación, y resuelve la recomendación única justificando el compromiso. |
| **Documentación y organización del informe** | 10 | El repositorio tiene la estructura de carpetas exacta del entregable, el `README.md` está organizado por partes con las gráficas incrustadas y las instrucciones de reproducción, y existen al menos cinco commits descriptivos que documentan el avance. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así: `nota_curso = (puntos / 100) x 15 %`.

## Dificultades Comunes

### "Mi merge sort es más lento que insertion sort y creo que lo implementé mal"

- Para entradas pequeñas —del orden de decenas o pocos cientos de elementos— eso es lo **esperado**, no un error: merge sort paga el costo de crear listas nuevas y llamar funciones recursivas, y esas constantes pesan más que la ventaja asintótica. Justamente por eso la guía pide identificar el punto de cruce. Verifique que la tendencia se invierte al aumentar el tamaño; si no se invierte nunca hasta 6400 elementos, sí revise su implementación.

### "En el escenario B insertion sort me da tiempos casi idénticos a los del escenario A"

- Revise su generador: probablemente el 2 % desordenado está quedando repartido por toda la lista en vez de anexado al final, o el 98 % no está realmente ordenado de forma ascendente. Imprima los primeros y los últimos veinte elementos de un lote pequeño (por ejemplo con `n` igual a 100) y verifíquelo a ojo antes de medir.

### "Mis tiempos varían mucho entre ejecuciones y las curvas salen con dientes de sierra"

- Es ruido del sistema operativo, y es normal en mediciones de milisegundos. Aumente el número de repeticiones por punto, reporte la mediana en vez del promedio, y cierre otras aplicaciones mientras mide. Documente en el informe cuántas repeticiones hizo: eso hace parte del rigor experimental, no es un detalle menor.

### "No sé si mi conteo de comparaciones está bien"

- Verifique con casos pequeños de resultado conocido: para una lista ya ordenada de `n` elementos, insertion sort hace exactamente `n - 1` comparaciones. Si su conteo no coincide con ese valor, está contando comparaciones de índices o de límites de ciclo además de las comparaciones entre elementos.

### "En el método maestro no sé qué caso aplicar a la recurrencia de merge sort"

- Empiece por identificar los tres ingredientes por separado: cuántos subproblemas genera cada llamada, en cuánto se reduce el tamaño en cada una, y cuál es el costo del trabajo de combinar. Compare después el costo de combinar con el crecimiento que imponen los dos primeros ingredientes. La condición del caso que invoque debe quedar escrita y verificada en el informe, no dada por supuesta.

### "Mis gráficas no se ven en el `README.md` de GitHub"

- La ruta de la imagen debe ser relativa a la ubicación del `README.md`, y la carpeta `graficas/` debe estar efectivamente subida al repositorio. Verifique en la vista web de GitHub, no solo en su editor local: es ahí donde se califica.

## Extensiones Sugeridas (Bonus)

- Implemente un ordenamiento **híbrido** que use insertion sort cuando el subproblema sea menor que un umbral y merge sort en los demás casos. Determine experimentalmente el mejor umbral y grafique el resultado frente a los dos algoritmos puros.
- Grafique, sobre los mismos ejes de sus mediciones, las curvas teóricas de `n al cuadrado` y de `n log n` escaladas por una constante ajustada a sus datos, y discuta qué tan bien se superponen.
- Mida también el **consumo de memoria** de ambos algoritmos con el módulo `tracemalloc` y agregue esa dimensión a su recomendación a EnerNorte.

## Recursos

- **Apuntes del curso:** lecciones "Algoritmos como tecnología", "Análisis de algoritmos y divide y vencerás", "Notación O, Θ y Ω" y "Cómo resolver recurrencias".
- **Libro de texto:** Cormen, Leiserson, Rivest y Stein, *Introduction to Algorithms* (3.ª ed.), capítulos 1 a 4.
- **Medición de tiempos:** módulo `time` de la biblioteca estándar, función `perf_counter()`.
- **Gráficas:** documentación de `matplotlib`, módulo `pyplot` (`https://matplotlib.org/stable/tutorials/pyplot.html`).
- **Guía de estilo:** PEP 8 — Style Guide for Python Code (`https://peps.python.org/pep-0008/`).

**Plazo de entrega:** cierre de la sesión práctica de la Semana 6. Se califica el estado del repositorio en GitHub a esa hora.
