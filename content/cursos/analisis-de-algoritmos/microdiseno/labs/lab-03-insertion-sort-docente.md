# Lab 03 — Insertion sort en Python · Guía del docente

## Ficha de la sesión

- **Curso:** Análisis de Algoritmos (virtual, Ingeniería de Sistemas, sin prerrequisitos)
- **Semana / sesión:** Semana 3 (17–23 de agosto de 2026), Sesión 2 (P) — laboratorio práctico
- **Duración:** 2 horas
- **Momento evaluativo:** Ninguno. No hay ★ esta semana; el primer laboratorio evaluativo (★ Laboratorio 1) es en la Semana 6 y cubre fundamentos, complejidad y recurrencias. Esta sesión alimenta únicamente la nota de **Seguimiento** (20%: quices cortos, participación, consistencia de commits, ejercicios de clase).
- **Lección teórica de la que depende (Sesión 1 T, misma semana):** "Algoritmos como tecnología" — qué es un algoritmo, por qué la eficiencia importa tanto como la corrección, el método de "insertar donde corresponde" formalizado como insertion sort, y la invariante de ciclo (inicialización, mantenimiento, terminación) como herramienta para demostrar su corrección.
- **Sprint del proyecto:** No aplica — este curso no tiene proyecto de aula (ver `info.md`). El entregable de hoy va en `ejercicios-clase/semana-03-insertion-sort/`, no en `laboratorios/`: no es uno de los cinco informes evaluativos oficiales.

## Objetivo de la sesión

Al salir del aula, el estudiante debe poder:

- Implementar insertion sort en Python con un contador de comparaciones y un contador de desplazamientos, distinguiendo con precisión qué operación cuenta como cada una.
- Escribir un caso de prueba que verifique la invariante de ciclo de insertion sort en una iteración intermedia de la ejecución, no solo al final.
- Generar y clasificar tres tipos de entrada (mejor caso, peor caso, entrada aleatoria) para insertion sort, y justificar con el conteo de operaciones por qué cada una lo es.

## Conexión con la teoría

La sesión T de hoy ("Algoritmos como tecnología") dejó cuatro piezas listas para materializar:

1. El **caso de la empresa de energía**: 1.850.000 lecturas por noche, ventana de cuatro horas, proceso que hoy tarda nueve. La lección lo modeló hasta aislar la operación crítica —ordenar— y este laboratorio trabaja justamente sobre esa operación, a una escala que cabe en la máquina del estudiante.
2. La implementación de referencia de `insertion_sort` (sin instrumentar), con la traza sobre `[5, 2, 4, 6, 1, 3]`.
3. La invariante de ciclo enunciada formalmente: "al iniciar cada iteración del ciclo `for` (índice `i`), el subarreglo `arreglo[0..i-1]` contiene los mismos elementos que tenía originalmente, pero ordenados", demostrada por inicialización, mantenimiento y terminación.
4. La idea —todavía informal, sin notación asintótica— de que el trabajo de un algoritmo depende de la entrada, no solo de su tamaño: el Algoritmo A (cartas en la mano) crece con $n^2$ en el peor caso.

Este laboratorio no agrega teoría nueva: convierte la invariante de un argumento en el papel a un `assert` que corre de verdad, y convierte "el trabajo depende de la entrada" en un número medible —comparaciones y desplazamientos— que el estudiante grafica con sus propios ojos y después devuelve al caso, extrapolando a los 1.850.000 registros de la noche.

> **Por qué importa cerrar el círculo con el caso.** El estudiante puede terminar el Paso 3 con una gráfica correcta y no haber entendido qué significa. La extrapolación es lo que convierte "la curva invertida está más arriba" en "insertion sort jamás cerraría la noche de esta empresa". Si el tiempo aprieta, es preferible recortar la variante binaria de la diferenciación antes que saltarse esta interpretación.

Pregunta de apertura para el grupo: *"En la traza de la lección de hoy, para ordenar `[5, 2, 4, 6, 1, 3]` la clave `1` viajó desde el índice 4 hasta el índice 0 — cuatro desplazamientos. ¿Qué tendría que tener esa lista para que **ningún** elemento se desplazara nunca?"* (Respuesta esperada: que la lista ya estuviera ordenada de entrada — cada `clave` ya estaría en su lugar frente a los elementos anteriores, y el `while` interno terminaría en la primera comparación sin desplazar nada.)

## Minutado

| Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
|---|---|---|---|
| 0:00 – 0:15 | Bloque 1 — Recapitulación y demo del contador | Plantea la pregunta de apertura. Proyecta el `insertion_sort` sin instrumentar de la lección teórica y pregunta, línea por línea, "¿esto es una comparación o un desplazamiento?". Anuncia el objetivo: instrumentar, verificar la invariante con código real, y medir. | Responde la pregunta de apertura. Abre su entorno (`venv` de la Semana 2) dentro de `ejercicios-clase/semana-03-insertion-sort/`. Identifica en el proyector cuál línea del algoritmo es comparación y cuál es desplazamiento. |
| 0:15 – 0:50 | Bloque 2 — Paso 1: insertion sort instrumentado | Demuestra en su pantalla cómo agregar los contadores sin cambiar el comportamiento del algoritmo, remarcando el error típico de contar el desplazamiento como si fuera una comparación. Circula verificando el conteo de cada estudiante contra un caso de referencia. | Implementa `insertion_sort_instrumentado` a partir del esqueleto, agregando `comparaciones` y `desplazamientos`. Verifica su conteo contra el caso de referencia dado por el docente. |
| 0:50 – 1:20 | Bloque 3 — Paso 2: verificar la invariante con `assert` | Explica el parámetro `puntos_de_control` y por qué el `assert` compara `arreglo[:i]` contra `sorted(arreglo[:i])` — exactamente el enunciado de la invariante de la lección teórica. Demuestra cómo un `assert` mal ubicado (fuera de rango) revienta con `IndexError` en vez de con una violación real de la invariante. | Agrega la verificación de la invariante en 2–3 puntos de control. Escribe un caso de prueba en `test_insertion_sort.py` que llame la función con esos puntos y confirme que no se dispara ningún `AssertionError`. |
| 1:20 – 1:50 | Bloque 4 — Paso 3: entradas, gráfica y vuelta al caso | Presenta la consigna amarrando cada entrada a un escenario de la red de telemedición (ordenada / aleatoria / invertida), no como tres listas abstractas. Circula resolviendo dudas sobre `matplotlib`. En los últimos 5 minutos exige la extrapolación a 1.850.000 registros. | Implementa la generación de las tres entradas, mide comparaciones para una lista creciente de tamaños, genera `graficas/operaciones_vs_n.png`, y responde en voz alta —para el compañero de al lado— cuál es el mejor caso, cuál el peor, y si insertion sort le sirve o no a la empresa del caso. |
| 1:50 – 2:00 | Cierre | Resume el flujo completo (instrumentar → verificar invariante → medir → graficar → clasificar) y anuncia que la Semana 4 compara este mismo insertion sort contra merge sort. Aclara el plazo y la ruta exacta del entregable (`ejercicios-clase/semana-03-insertion-sort/`, no `laboratorios/`). | Hace `commit` y `push` de lo avanzado. Anota lo pendiente si no terminó la gráfica o el análisis del `README.md`. |

Suma: 2 h 00 min.

## Desarrollo paso a paso

### Paso 1 — Insertion sort instrumentado (0:15–0:50)

Enunciado para el grupo: "Partan del `insertion_sort` de la lección de hoy y agréguenle dos contadores: uno de comparaciones (cada vez que comparan `arreglo[j]` contra `clave`) y otro de desplazamientos (cada vez que mueven un elemento una posición a la derecha). La función debe seguir ordenando exactamente igual que antes; el conteo es un efecto adicional, no un cambio de comportamiento."

Esqueleto de partida (proyectar):

```python
def insertion_sort_instrumentado(arreglo: list) -> tuple[list, int, int]:
    """Ordena `arreglo` in place por insercion, contando operaciones.

    Args:
        arreglo: lista de elementos comparables; se modifica in place.

    Returns:
        Tupla (arreglo, comparaciones, desplazamientos).
    """
    comparaciones = 0
    desplazamientos = 0
    n = len(arreglo)
    for i in range(1, n):
        clave = arreglo[i]
        j = i - 1
        # TODO: recorrer hacia atras, contando cada comparacion y
        # cada desplazamiento por separado.
        arreglo[j + 1] = clave
    return arreglo, comparaciones, desplazamientos
```

Solución de referencia:

```python
def insertion_sort_instrumentado(arreglo: list) -> tuple[list, int, int]:
    """Ordena `arreglo` in place por insercion, contando operaciones.

    Args:
        arreglo: lista de elementos comparables; se modifica in place.

    Returns:
        Tupla (arreglo, comparaciones, desplazamientos).
    """
    comparaciones = 0
    desplazamientos = 0
    n = len(arreglo)
    for i in range(1, n):
        clave = arreglo[i]
        j = i - 1
        while j >= 0:
            comparaciones += 1          # cada vez que se compara arreglo[j] con clave
            if arreglo[j] <= clave:
                break                    # clave encontro su lugar: no hay mas comparaciones
            arreglo[j + 1] = arreglo[j]  # desplazamiento: mover un elemento a la derecha
            desplazamientos += 1
            j -= 1
        arreglo[j + 1] = clave
    return arreglo, comparaciones, desplazamientos
```

Caso de referencia para verificar el conteo (proyectar y comparar contra la implementación de cada estudiante):

```python
>>> insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])
([1, 2, 3, 4, 5, 6], 9, 8)
```

Punto de control (minuto ~0:50): cada estudiante corre `insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])` y obtiene exactamente `(9 comparaciones, 8 desplazamientos)`. Si el conteo no coincide, revisar primero si está contando el desplazamiento también como comparación (error más frecuente, ver tabla de errores).

### Paso 2 — Verificar la invariante con `assert` (0:50–1:20)

Enunciado: "La invariante de ciclo de la lección de hoy dice que, al empezar la iteración `i`, `arreglo[0..i-1]` ya está ordenado. Agreguen a su función un mecanismo para verificar esa afirmación con código real, en 2 o 3 valores de `i`, no en todos — sería redundante verificarla en cada iteración cuando ya la demostraron en el papel."

Solución de referencia (extiende la función del Paso 1):

```python
def insertion_sort_instrumentado(
    arreglo: list, puntos_de_control: set[int] | None = None
) -> tuple[list, int, int]:
    """Ordena `arreglo` in place por insercion, contando operaciones y
    verificando opcionalmente la invariante de ciclo.

    Args:
        arreglo: lista de elementos comparables; se modifica in place.
        puntos_de_control: conjunto de valores de `i` en los que se
            verifica que arreglo[0:i] esta ordenado antes de procesar
            arreglo[i] (la invariante de ciclo). None desactiva la
            verificacion.

    Returns:
        Tupla (arreglo, comparaciones, desplazamientos).
    """
    comparaciones = 0
    desplazamientos = 0
    n = len(arreglo)
    puntos_de_control = puntos_de_control or set()

    for i in range(1, n):
        if i in puntos_de_control:
            assert arreglo[:i] == sorted(arreglo[:i]), (
                f"Invariante de ciclo rota antes de i={i}: {arreglo[:i]}"
            )
        clave = arreglo[i]
        j = i - 1
        while j >= 0:
            comparaciones += 1
            if arreglo[j] <= clave:
                break
            arreglo[j + 1] = arreglo[j]
            desplazamientos += 1
            j -= 1
        arreglo[j + 1] = clave

    return arreglo, comparaciones, desplazamientos
```

Caso de prueba de referencia (`test_insertion_sort.py`), verificando la invariante en una iteración intermedia y en la última:

```python
def test_invariante_de_ciclo_en_puntos_intermedios():
    arreglo = [5, 2, 4, 6, 1, 3]
    n = len(arreglo)
    puntos = {2, n // 2, n - 1}  # incluye una iteracion intermedia real

    # No debe lanzar AssertionError: la implementacion correcta
    # preserva la invariante en cada punto verificado.
    resultado, _, _ = insertion_sort_instrumentado(arreglo, puntos_de_control=puntos)
    assert resultado == sorted([5, 2, 4, 6, 1, 3])
```

Demostración deliberada del error de rango (proyectar, no ejecutar como parte de la solución): `puntos_de_control={0}` dispara `IndexError` al evaluar `arreglo[:0] == sorted(arreglo[:0])` — en realidad no truena (`arreglo[:0]` es `[]`, comparación válida), **pero** `puntos_de_control={n}` sí sería redundante (el ciclo `for` nunca llega a `i = n`) y `puntos_de_control` con un valor negativo produce una comparación silenciosamente incorrecta por el slicing negativo de Python. Usar este segundo caso para mostrar por qué el rango de los puntos de control debe ser `1 <= i <= n - 1`.

Punto de control (minuto ~1:20): el `assert` corre sin `IndexError` para `puntos_de_control={2, n // 2, n - 1}` en al menos dos arreglos de prueba distintos (uno ya usado en el Paso 1, uno nuevo con longitud diferente).

### Paso 3 — Entradas, gráfica y clasificación de casos (1:20–1:50)

Enunciado: "Generen tres tipos de entrada del mismo tamaño — ya ordenada, invertida, y aleatoria — para una lista creciente de tamaños de `n`. Midan cuántas comparaciones hace insertion sort en cada una, grafiquen comparaciones vs. `n` con `matplotlib`, y determinen cuál de las tres es el mejor caso y cuál el peor."

Amarrar cada entrada al caso al presentarla, para que no queden como tres listas abstractas: la **ordenada** es la red entregando las lecturas ya en orden de marca de tiempo; la **aleatoria** es la red real, con reintentos y varias pasarelas en paralelo; la **invertida** es el peor caso teórico, que en producción no ocurre pero acota el desastre posible.

Solución de referencia:

```python
import random

import matplotlib.pyplot as plt


def generar_entradas(n: int) -> dict[str, list[int]]:
    """Genera tres entradas de tamano n: ordenada, invertida y aleatoria.

    Cada una representa un escenario de entrega de la red de telemedicion:
    lecturas ya en orden de marca de tiempo, el peor caso teorico, y la
    entrega desordenada habitual.

    Args:
        n: tamano de cada una de las tres listas generadas.

    Returns:
        Diccionario con las claves "ordenada", "invertida" y "aleatoria".
    """
    ordenada = list(range(n))
    invertida = list(range(n, 0, -1))
    aleatoria = ordenada.copy()
    random.shuffle(aleatoria)
    return {"ordenada": ordenada, "invertida": invertida, "aleatoria": aleatoria}


def medir_comparaciones(tamanos: list[int]) -> dict[str, list[int]]:
    """Mide comparaciones de insertion sort para cada tipo de entrada.

    Args:
        tamanos: lista de tamanos de entrada a medir.

    Returns:
        Diccionario con una clave por tipo de entrada y, como valor, la
        lista de comparaciones medidas para cada tamano en `tamanos`.
    """
    resultados = {"ordenada": [], "invertida": [], "aleatoria": []}
    for n in tamanos:
        entradas = generar_entradas(n)
        for tipo, arreglo in entradas.items():
            _, comparaciones, _ = insertion_sort_instrumentado(list(arreglo))
            resultados[tipo].append(comparaciones)
    return resultados


def graficar_operaciones(
    tamanos: list[int], resultados: dict[str, list[int]], ruta_salida: str
) -> None:
    """Grafica comparaciones vs. n para cada tipo de entrada.

    Args:
        tamanos: tamanos de entrada usados en el eje x.
        resultados: diccionario devuelto por medir_comparaciones.
        ruta_salida: ruta del archivo donde se guarda la figura.
    """
    plt.figure(figsize=(8, 5))
    for tipo, valores in resultados.items():
        plt.plot(tamanos, valores, marker="o", label=tipo)
    plt.xlabel("Tamano de la entrada (n)")
    plt.ylabel("Numero de comparaciones")
    plt.title("Insertion sort: comparaciones vs. n")
    plt.legend()
    plt.grid(True)
    plt.savefig(ruta_salida)


if __name__ == "__main__":
    tamanos = [10, 50, 100, 200, 400, 800]
    resultados = medir_comparaciones(tamanos)
    graficar_operaciones(tamanos, resultados, "graficas/operaciones_vs_n.png")

    print(f"Ordenada  (n={tamanos[-1]}): {resultados['ordenada'][-1]} comparaciones")
    print(f"Invertida (n={tamanos[-1]}): {resultados['invertida'][-1]} comparaciones")
    print(f"Aleatoria (n={tamanos[-1]}): {resultados['aleatoria'][-1]} comparaciones")
```

Clasificación esperada, con la que cada estudiante debe salir de la sesión:

- **Mejor caso — entrada ordenada:** cada `clave` ya es mayor o igual que su predecesor, así que el `while` interno hace **una sola comparación** (la que falla de inmediato) y **cero desplazamientos** por iteración. La curva de comparaciones vs. `n` es una recta.
- **Peor caso — entrada invertida:** cada `clave` es menor que **todos** los elementos ya colocados, así que el `while` interno recorre hasta el principio del subarreglo ordenado en cada iteración. La curva de comparaciones vs. `n` es una parábola, muy por encima de la recta del mejor caso.
- **Caso aleatorio:** queda entre ambas curvas — no es el caso de referencia para "peor caso", aunque en promedio también crece más rápido que linealmente.

Vuelta al caso (los últimos 5 minutos del bloque, no opcional): pedirle a cada estudiante que extrapole su curva del escenario aleatorio a los 1.850.000 registros de una noche.

Cifra de referencia para el docente: en el caso promedio insertion sort hace del orden de $n^2/4$ comparaciones, así que para $n = 1{,}85 \times 10^6$ el resultado ronda las $8{,}6 \times 10^{11}$ — cerca de un billón de comparaciones. Traducirlo a tiempo depende de cuántas comparaciones por segundo suponga el estudiante, y ahí las respuestas van a variar mucho: con $10^8$ por segundo da unas 2,4 horas; con $10^7$ —más realista en Python puro— da casi 24 horas. **No corrijas el factor constante: corrige el exponente.** Lo que el estudiante debe defender es que el crecimiento es cuadrático y que por eso duplicar el parque de medidores cuadruplica el trabajo; si llega a un orden de magnitud razonable y explica cómo lo obtuvo, el objetivo está cumplido.

Punto de control (final del bloque): la gráfica muestra tres curvas claramente distintas, con la de "invertida" muy por encima de "ordenada" para `n` grande, cada estudiante puede señalar en su propia gráfica cuál es cuál sin mirar la leyenda, y sabe decir en voz alta si insertion sort le sirve o no a la empresa del caso, con un número propio detrás.

## Puntos de control

| Minuto | Qué revisar en pantalla | Señal de que va bien |
|---|---|---|
| ~0:50 | `insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])` | Devuelve `(9 comparaciones, 8 desplazamientos)`; el contador incrementa correctamente y en el lugar correcto del cuerpo del `while` |
| ~1:20 | Ejecución de `test_insertion_sort.py` con los `assert` de invariante activos | Los `assert` pasan sin `IndexError` para `puntos_de_control={2, n // 2, n - 1}` en al menos dos arreglos distintos |
| ~1:50 | `graficas/operaciones_vs_n.png` | Tres curvas distintas; la de entrada invertida crece visiblemente más rápido que la de entrada ordenada al aumentar `n` |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| El conteo de comparaciones y desplazamientos da el mismo número en cada iteración | Se está incrementando `comparaciones` y `desplazamientos` en la misma línea, contando el desplazamiento también como comparación | Pedir que separen mentalmente las dos preguntas: "¿comparé algo?" (siempre, en cada vuelta del `while`) vs. "¿moví algo?" (solo si la comparación dio que había que desplazar) — cada pregunta incrementa un contador distinto |
| `AssertionError` o `IndexError` al correr la verificación de la invariante | `puntos_de_control` incluye `0` (arreglo vacío, no es error real pero es redundante) o un valor `>= n` (el ciclo `for` nunca llega a ese `i`, y si además se usa para indexar directamente el arreglo puede leer fuera de rango) | Revisar que todo valor en `puntos_de_control` cumpla `1 <= i <= n - 1`; recordar que la invariante se enuncia **antes** de procesar `arreglo[i]`, así que `i = n` no tiene sentido |
| La gráfica muestra tiempo de ejecución (segundos) en el eje `y` en vez de número de operaciones | Se midió con `time.time()` o `timeit` en vez de usar el contador de `insertion_sort_instrumentado` | Recordar que el objetivo de hoy es contar **operaciones**, no tiempo — el tiempo depende de la máquina y varía entre corridas; las comparaciones y desplazamientos son deterministas para una entrada dada |
| Las tres curvas de la gráfica son casi idénticas | Se generaron las tres entradas para el mismo `n` fijo en vez de para la lista creciente de tamaños, o `generar_entradas` se llamó una sola vez fuera del bucle sobre `tamanos` | Revisar que `medir_comparaciones` llama `generar_entradas(n)` **dentro** del bucle, una vez por cada tamaño de `tamanos` |
| El `assert` de la invariante nunca se dispara ni siquiera cuando se prueba deliberadamente con una entrada corrupta | El `puntos_de_control` pasado está vacío (`None` por defecto) porque se olvidó pasar el argumento al llamar la función | Verificar que la llamada de prueba pasa explícitamente `puntos_de_control={...}`, no la llamada por defecto del Paso 1 |

## Preguntas socráticas

- *"¿Por qué una lista ya ordenada es el mejor caso de insertion sort, y no el peor?"* — Respuesta esperada: porque en una lista ya ordenada, cada elemento nuevo ya es mayor o igual que todo lo que está a su izquierda, así que el `while` interno termina en la primera comparación sin desplazar nada; el algoritmo hace el mínimo trabajo posible por iteración.
- *"Si cuentan comparaciones, ¿aproximadamente cuántas hace insertion sort en el peor caso para `n` elementos?"* — Respuesta esperada: en el peor caso cada elemento `i` se compara con los `i` elementos anteriores, así que el total es aproximadamente `1 + 2 + ... + (n-1)`, que crece como el cuadrado de `n` — sin nombrar la notación O() todavía, basta con que el grupo note que duplicar `n` más que duplica el número de comparaciones.
- *"¿Por qué la invariante se verifica **antes** de procesar `arreglo[i]`, y no después?"* — Respuesta esperada: porque así lo enuncia la demostración de la lección teórica: la invariante describe lo que es cierto al **iniciar** cada iteración, y es justamente lo que le permite al cuerpo del ciclo confiar en que `arreglo[0..i-1]` ya está ordenado antes de insertar `clave`.
- *"La empresa del caso compró un servidor el doble de rápido. ¿Le alcanza para cerrar la noche con insertion sort?"* — Respuesta esperada: no, o solo transitoriamente. Duplicar la velocidad divide el tiempo entre dos una sola vez; en cambio, cada vez que crece el parque de medidores el trabajo crece con el cuadrado. Si la empresa pasa de 1.850.000 a 3.000.000 de cuentas, el trabajo se multiplica por más de dos y medio, y el servidor nuevo ya quedó corto otra vez. Es exactamente el argumento de "algoritmos como tecnología" de la lección, ahora con los números del estudiante.
- *"Si el algoritmo se equivoca y descarta una lectura legítima, ¿quién se da cuenta y quién paga?"* — Respuesta esperada: el usuario, cuando le llega la factura; y es él quien tiene que reclamar y demostrar el error. El costo del fallo no lo asume quien escribió el algoritmo. Sirve para instalar, sin discurso, que la decisión técnica tiene un destinatario humano.
- *"¿Por qué no basta con un solo caso de prueba que ordene una lista y verifique el resultado final?"* — Respuesta esperada: un caso final solo demuestra que el algoritmo llegó a un resultado correcto para esa entrada, no que el proceso intermedio fue correcto en cada paso; verificar la invariante en un punto intermedio confirma que el razonamiento de la demostración (y no solo la suerte de esa entrada) es lo que sostiene la corrección.

## Diferenciación

- **Quien termina antes de tiempo (por ejemplo, termina el Paso 3 en 20 minutos):** pedirle que implemente una variante de **insertion sort binario**, donde la posición de inserción de `clave` dentro de la parte ya ordenada se busca con búsqueda binaria en vez de comparación lineal, y que agregue esa variante a la gráfica del Paso 3 como una cuarta curva. Preguntarle explícitamente: "¿cuánto bajó el número de comparaciones? ¿Bajó también el número de desplazamientos?" — la respuesta esperada es que las comparaciones caen a aproximadamente `n log n`, pero los desplazamientos siguen siendo del mismo orden que antes, porque insertar sigue exigiendo correr los elementos mayores una posición a la derecha, sin importar cómo se encontró la posición.
- **Quien no logra avanzar (por ejemplo, se traba distinguiendo comparación de desplazamiento en el Paso 1):** andamiaje mínimo aceptable para cerrar la sesión con algo funcional: dictarle línea por línea el cuerpo del `while` del Paso 1, señalando explícitamente cuál línea es la comparación (`if arreglo[j] <= clave`) y cuál el desplazamiento (`arreglo[j + 1] = arreglo[j]`). Aceptar que el Paso 2 (invariante) y el Paso 3 (gráfica) queden como tarea de refuerzo antes de la Semana 4, con el conteo del Paso 1 ya verificado como mínimo indispensable.

## Cierre de la sesión

Se conecta directamente con la Semana 4, y el caso da el puente: si insertion sort no cierra la noche de la empresa, la pregunta que queda abierta es qué algoritmo sí lo haría. La sesión teórica de esa semana introduce merge sort por divide y vencerás, y el laboratorio práctico compara empíricamente su tiempo de ejecución contra el insertion sort de hoy — el mismo `insertion_sort_instrumentado` (o una versión sin contadores) se reutiliza como punto de comparación, no se reescribe desde cero. Recordar al grupo que el entregable de hoy vive en `ejercicios-clase/semana-03-insertion-sort/` de su repositorio (no en `laboratorios/`: esta sesión no es uno de los cinco informes evaluativos). Como trabajo independiente: quien no haya terminado la gráfica o el `README.md` debe completarlos y hacer `push` antes del inicio de la Semana 4.

## Materiales y preparación previa

- Verificar que cada estudiante tiene su `venv` de la Semana 2 accesible y `matplotlib` instalado dentro de él (`pip list` debe mostrarlo); si alguien perdió su entorno, tener a la mano el procedimiento de recreación desde `requirements.txt`.
- Tener preparado, en la propia máquina del docente, el `insertion_sort` sin instrumentar de la lección teórica listo para proyectar al inicio del Bloque 1, sin los contadores agregados todavía.
- Tener resuelto de antemano el caso de referencia (`[5, 2, 4, 6, 1, 3]` → `9` comparaciones, `8` desplazamientos) para poder verificarlo contra la pantalla de cada estudiante sin recalcularlo en vivo.
- Confirmar que la sesión T de la misma semana ("Algoritmos como tecnología") ya cubrió insertion sort y su invariante de ciclo por completo antes de esta sesión práctica; si quedó incompleta, reforzar brevemente la invariante al inicio del Bloque 1 antes de pasar al Paso 1.
- Tener lista la carpeta `ejercicios-clase/semana-03-insertion-sort/` de referencia (vacía, solo con la estructura esperada) para mostrarla al grupo al anunciar el entregable.
