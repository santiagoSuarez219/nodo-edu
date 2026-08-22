> Cubre las dos sesiones de la Semana 4: la **T** (teórica) y la **P**
> (práctica, dictada en vivo por el docente — no es trabajo independiente del
> estudiante, así que esta semana no lleva guía de estudiante). El laboratorio
> no es evaluativo (el `★` de este módulo cae en la Semana 6); aquí la
> instrumentación y las gráficas se demuestran en vivo, sin entregable.

## Sesión T — la lección se presenta tal como está publicada

El `.mdx` de "Análisis de algoritmos y divide y vencerás" ya trae completo y
comentado todo lo necesario para dictar la sesión: la tabla de peor/mejor/caso
promedio sobre `insertion_sort`, el `factorial` recursivo como primer
contacto con la recursividad, y `merge_sort` + `merge` con la comparación
visual del árbol de división. No hace falta escribir código adicional para
esta sesión — el material ya es autosuficiente. Dictarla es presentar la
página en orden, deteniéndose en estos puntos:

- **Peor/mejor/caso promedio sobre `insertion_sort`:** conecta directo con lo
  que el grupo ya vio en la Semana 3 (invariante de ciclo). Insiste en que el
  costo depende de **cómo** llega la entrada, no solo de **cuántos** registros
  trae — es la pregunta que la empresa nunca se hizo.
- **La gráfica de barras `xychart-beta`** (peor caso: `n=10..50`): úsala para
  que el grupo note en voz alta que de `n=20` a `n=40` el trabajo no se
  duplica, se cuadruplica. Todavía no se nombra la notación O() — eso es
  Semana 5 — así que basta con "crece como el cuadrado de `n`".
- **`factorial`:** es el primer contacto del curso con recursividad. Remarca
  las dos partes obligatorias — caso base y caso recursivo — y traza en el
  tablero, a mano, la pila de llamadas para `factorial(4)`: sube hasta
  `factorial(0)`, después baja multiplicando (la lección no trae un diagrama
  para esto, así que hay que dibujarlo en vivo). Sin esta idea instalada,
  `merge_sort` es solo memorizar un patrón.
- **`merge_sort` + `merge`:** el diagrama `flowchart TB` de dividir
  `[5, 2, 4, 6, 1, 3]` hasta listas de un elemento y volver a combinar es la
  pieza central de la sesión. Traza en vivo, contra la pantalla, cómo cada
  nivel de `merge` recorre ambas mitades una sola vez — es la intuición que
  sostiene la recurrencia `T(n) = 2T(n/2) + Θ(n)`, que la lección deja
  planteada sin resolver (eso llega en el Módulo 5).
- **El cierre con el costo energético** (1.478 kWh/año con insertion sort
  frente a 27 kWh/año con merge sort): es el gancho hacia la Sesión P — ahí el
  grupo va a producir con sus propias manos los números que sostienen esa
  tabla.

Punto a resaltar: el hilo de toda la sesión — T y P — sigue siendo el mismo
caso, la empresa de energía con 1.850.000 medidores y una ventana de cuatro
horas. Todo lo que se mide hoy en la sesión P termina extrapolado a esa cifra
al cierre del laboratorio.

## Sesión P — merge sort y comparación empírica con insertion sort

> Contexto del curso (no calificable todavía): desde la Semana 3, este curso
> ancla sus sesiones prácticas al caso *Sistema de consolidación diaria de
> lecturas de telemedición* de la misma empresa de energía
> (`microdiseno/projects/caso-evaluacion-ra-2026-2.md`). Ese caso sigue en
> estado **PROPUESTA** hasta la reunión institucional del 19 de agosto de
> 2026 — se presenta como contexto motivador, nunca como trabajo calificable
> de esta sesión. El laboratorio evaluativo real de este módulo es el de la
> Semana 6.

### Paso 0 — retomar la instrumentación de insertion sort

Antes de tocar `merge_sort`, retoma la función instrumentada que el grupo ya
usó en la Semana 3 para contar operaciones. Hoy no se reescribe: se reutiliza
tal cual, porque es la base de la comparación empírica de esta sesión.

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

Punto a resaltar: cada vuelta del `while` es siempre una comparación; solo es
también un desplazamiento cuando la comparación obliga a mover el elemento —
el error más frecuente al instrumentar código así es incrementar ambos
contadores en la misma línea, contando un desplazamiento que nunca ocurrió.

Genera las tres entradas de siempre — ordenada, invertida, aleatoria — y mide
comparaciones para un rango de tamaños:

```python
import random

import matplotlib.pyplot as plt


def generar_entradas(n: int) -> dict[str, list[int]]:
    """Genera tres entradas de tamano n: ordenada, invertida y aleatoria.

    Cada una representa un escenario de entrega de la red de telemedicion.

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

Punto a resaltar: en la entrada ordenada, cada `clave` ya es mayor o igual que
su predecesor — el `while` hace una sola comparación y cero desplazamientos
por iteración, curva recta (mejor caso). En la invertida, el `while` recorre
hasta el principio en cada iteración, curva parábola muy por encima (peor
caso). La aleatoria queda entre ambas.

Y proyecta la extrapolación al caso de la empresa, con la que ya trabajó el
grupo:

```python
def estimar_comparaciones(n: int) -> float:
    """Estima las comparaciones de insertion sort en el caso promedio.

    En el caso promedio cada clave recorre aproximadamente la mitad del
    subarreglo ya ordenado, de donde sale la aproximacion n^2 / 4.

    Args:
        n: cantidad de registros a ordenar.

    Returns:
        Numero estimado de comparaciones.
    """
    return n ** 2 / 4


if __name__ == "__main__":
    registros_por_noche = 1_850_000
    estimado = estimar_comparaciones(registros_por_noche)
    print(f"Comparaciones estimadas: {estimado:.3e}")

    for por_segundo in (1e7, 1e8):
        horas = estimado / por_segundo / 3600
        print(f"A {por_segundo:.0e} comparaciones/s: {horas:.1f} horas")
```

Salida aproximada: `8.556e+11` comparaciones — cerca de un billón. A `1e7`
comparaciones por segundo son unas 23,8 horas; a `1e8`, unas 2,4 horas.

Punto a resaltar: el factor constante no es lo que se corrige, es el
exponente — si la empresa pasa de 1.850.000 a 3.000.000 de cuentas, el
trabajo no crece un 62%, sino más del 160%.

### Paso 1 — instrumentar merge sort para la misma comparación

El `merge_sort` de la lección ya está completo; para esta sesión se
instrumenta con un contador de comparaciones, siguiendo el mismo patrón que
`insertion_sort_instrumentado`, para poder graficar ambas curvas en los
mismos ejes.

```python
def merge_sort_instrumentado(arreglo: list[int]) -> tuple[list[int], int]:
    """Ordena `arreglo` mediante divide y venceras, contando comparaciones.

    Misma logica de merge_sort (lección teórica), con un contador de
    comparaciones que se propaga a traves de la recursion para poder
    compararlo contra insertion_sort_instrumentado.

    Args:
        arreglo: lista de elementos comparables entre si.

    Returns:
        Tupla (lista ordenada, comparaciones totales).
    """
    if len(arreglo) <= 1:
        return arreglo, 0  # caso base: una lista de 0 o 1 elemento ya esta ordenada

    mitad = len(arreglo) // 2
    izquierda, comparaciones_izq = merge_sort_instrumentado(arreglo[:mitad])
    derecha, comparaciones_der = merge_sort_instrumentado(arreglo[mitad:])
    combinado, comparaciones_merge = merge_instrumentado(izquierda, derecha)

    total = comparaciones_izq + comparaciones_der + comparaciones_merge
    return combinado, total


def merge_instrumentado(
    izquierda: list[int], derecha: list[int]
) -> tuple[list[int], int]:
    """Combina dos listas ordenadas, contando las comparaciones que hace.

    Args:
        izquierda: lista ordenada de menor a mayor.
        derecha: lista ordenada de menor a mayor.

    Returns:
        Tupla (lista combinada y ordenada, comparaciones realizadas).
    """
    resultado: list[int] = []
    comparaciones = 0
    i = j = 0

    while i < len(izquierda) and j < len(derecha):
        comparaciones += 1  # una comparacion por cada elemento que se decide
        if izquierda[i] <= derecha[j]:
            resultado.append(izquierda[i])
            i += 1
        else:
            resultado.append(derecha[j])
            j += 1

    resultado.extend(izquierda[i:])
    resultado.extend(derecha[j:])
    return resultado, comparaciones
```

Punto a resaltar: a diferencia de insertion sort, el número de comparaciones
de merge sort **no depende del orden de entrada** — divide y combina igual
para una lista ordenada, invertida o aleatoria. Es una consecuencia directa
de la recurrencia `T(n) = 2T(n/2) + Θ(n)` de la lección: no tiene un `if` que
se salte trabajo según el contenido, como sí lo tiene el `while` de
insertion sort.

### Paso 2 — graficar ambas curvas en los mismos ejes

```python
def medir_comparaciones_merge(tamanos: list[int]) -> list[int]:
    """Mide comparaciones de merge sort para entradas aleatorias.

    Args:
        tamanos: lista de tamanos de entrada a medir.

    Returns:
        Lista de comparaciones medidas para cada tamano en `tamanos`.
    """
    comparaciones_por_tamano = []
    for n in tamanos:
        aleatoria = list(range(n))
        random.shuffle(aleatoria)
        _, comparaciones = merge_sort_instrumentado(aleatoria)
        comparaciones_por_tamano.append(comparaciones)
    return comparaciones_por_tamano


def graficar_comparacion_insertion_merge(
    tamanos: list[int],
    comparaciones_insertion: list[int],
    comparaciones_merge: list[int],
    ruta_salida: str,
) -> None:
    """Grafica insertion sort vs. merge sort, comparaciones vs. n.

    Args:
        tamanos: tamanos de entrada usados en el eje x.
        comparaciones_insertion: comparaciones de insertion sort (entrada
            aleatoria) para cada tamano en `tamanos`.
        comparaciones_merge: comparaciones de merge sort para cada tamano
            en `tamanos`.
        ruta_salida: ruta del archivo donde se guarda la figura.
    """
    plt.figure(figsize=(8, 5))
    plt.plot(
        tamanos, comparaciones_insertion, marker="o", label="Insertion sort (aleatoria)"
    )
    plt.plot(tamanos, comparaciones_merge, marker="o", label="Merge sort")
    plt.xlabel("Tamano de la entrada (n)")
    plt.ylabel("Numero de comparaciones")
    plt.title("Insertion sort vs. merge sort: comparaciones vs. n")
    plt.legend()
    plt.grid(True)
    plt.savefig(ruta_salida)


if __name__ == "__main__":
    tamanos = [10, 50, 100, 200, 400, 800, 1_600, 3_200]

    resultados_insertion = medir_comparaciones(tamanos)
    comparaciones_merge = medir_comparaciones_merge(tamanos)

    graficar_comparacion_insertion_merge(
        tamanos,
        resultados_insertion["aleatoria"],
        comparaciones_merge,
        "graficas/insertion_vs_merge.png",
    )

    print(f"Insertion sort (n={tamanos[-1]}): {resultados_insertion['aleatoria'][-1]}")
    print(f"Merge sort     (n={tamanos[-1]}): {comparaciones_merge[-1]}")
```

Punto a resaltar: para los tamaños pequeños del arranque (`n=10`, `n=50`) las
dos curvas casi no se distinguen, y en algún punto incluso insertion sort
puede quedar por debajo — es exactamente el argumento de la sección
"Algoritmo A vs. Algoritmo B" de la Semana 3, ahora con números medidos por
el propio grupo en vez de una función analítica. El cruce llega rápido: para
`n=3200` la diferencia ya es notoria a simple vista en la gráfica.

### Paso 3 — cuándo insertion sort sigue siendo preferible

El microdiseño pide discutirlo explícitamente; no lo dejes implícito en la
gráfica. Dos escenarios, ambos verificables con el propio código de la
sesión:

- **Entradas pequeñas:** para `n` chico, el costo constante por operación de
  `merge_sort_instrumentado` — crear listas nuevas en cada `arreglo[:mitad]`
  y `arreglo[mitad:]`, apilar llamadas recursivas — puede pesar más que el
  ahorro asintótico. Ejecuta en vivo `medir_comparaciones([5])` y
  `medir_comparaciones_merge([5])`: para una entrada tan chica la diferencia
  en comparaciones es mínima, y en tiempo real (no solo en conteo de
  operaciones) insertion sort puede incluso ganar por tener menos
  sobrecarga de función.
- **Entradas casi ordenadas:** vuelve a `resultados["ordenada"]` del Paso 0.
  El mejor caso de insertion sort es lineal — si el archivo de la empresa
  llegara casi ordenado (el escenario típico: el archivo de ayer ya
  ordenado, más unos pocos registros nuevos), insertion sort hace muy poco
  trabajo. Merge sort, en cambio, **siempre** divide y combina igual, sin
  importar qué tan ordenada llegue la entrada — no tiene forma de
  aprovechar ese orden previo.

Punto a resaltar: esta es la fila "Cuándo preferirlo" de la tabla de
"Resumen operativo" de la lección teórica, ahora demostrada con código en vez
de solo enunciada.

### Cierre — de vuelta al caso de la empresa

Con los números ya medidos, cierra extrapolando a escala real. La empresa
recibe cerca de 1.850.000 registros por noche, casi siempre en desorden
aleatorio (nunca ya ordenado del todo, tampoco en el peor orden posible).

```python
import math


def estimar_comparaciones_merge(n: int) -> float:
    """Estima las comparaciones de merge sort para n elementos.

    Aproxima T(n) = 2T(n/2) + n resolviendola de forma cerrada como
    n * log2(n), la forma que la lección teórica deja planteada sin
    resolver formalmente (eso llega en el Modulo 5).

    Args:
        n: cantidad de registros a ordenar.

    Returns:
        Numero estimado de comparaciones.
    """
    return n * math.log2(n)


if __name__ == "__main__":
    registros_por_noche = 1_850_000

    estimado_insertion = estimar_comparaciones(registros_por_noche)  # n^2 / 4, Paso 0
    estimado_merge = estimar_comparaciones_merge(registros_por_noche)

    print(f"Insertion sort (caso promedio): {estimado_insertion:.3e} comparaciones")
    print(f"Merge sort:                     {estimado_merge:.3e} comparaciones")
    print(f"Razon insertion / merge:        {estimado_insertion / estimado_merge:.0f}x")
```

Salida aproximada: insertion sort en caso promedio ronda `8.556e+11`
comparaciones (el mismo número del Paso 0); merge sort ronda `3.876e+7` — casi
veintidós mil veces menos. Es la misma diferencia que la lección teórica
tradujo a energía (1.478 kWh/año frente a 27 kWh/año): hoy el grupo llegó a
esa conclusión midiendo y proyectando su propio código, no leyéndola en la
lección. Cierra remarcando que ninguno de los dos escenarios del Paso 3
—entradas pequeñas o casi ordenadas— aplica al archivo real de la empresa:
1.850.000 registros en desorden mayormente aleatorio es exactamente el
escenario donde merge sort gana por goleada.

## Preguntas socráticas

- *"Midieron que para `n=10` insertion sort y merge sort casi empatan en
  comparaciones, pero para `n=3200` la diferencia ya es enorme. ¿Por qué el
  tamaño de la entrada cambia quién gana, si el algoritmo es el mismo en
  ambos casos?"* — Respuesta esperada: porque insertion sort crece como el
  cuadrado de `n` y merge sort como `n` por el logaritmo de `n` — para `n`
  chico esas dos formas de crecimiento producen números parecidos, pero se
  separan cada vez más rápido a medida que `n` crece. No es que el algoritmo
  cambie: cambia cuánto pesa esa diferencia de forma.
- *"`merge_sort_instrumentado` cuenta las mismas comparaciones sin importar
  si la entrada llega ordenada, invertida o aleatoria. ¿Por qué
  `insertion_sort_instrumentado` sí varía tanto entre esos tres casos, y
  merge sort no?"* — Respuesta esperada: insertion sort tiene un `if`
  (`arreglo[j] <= clave`) que le permite saltarse trabajo cuando la entrada
  ya viene favorable; merge sort divide siempre por la mitad y combina
  siempre recorriendo ambas listas completas, sin ninguna condición que le
  permita aprovechar un orden previo en los datos.
- *"Si la empresa aceptara duplicar el tamaño de su servidor (el doble de
  operaciones por segundo), ¿le alcanzaría para seguir con insertion sort
  otro par de años, mientras el parque de medidores sigue creciendo?"* —
  Respuesta esperada: no de forma sostenible — duplicar la velocidad divide
  el tiempo entre dos una sola vez, pero el trabajo de insertion sort crece
  con el cuadrado del número de medidores, así que un crecimiento moderado
  del parque vuelve a comerse esa ganancia; con merge sort, en cambio, el
  crecimiento del trabajo es mucho más lento frente al mismo crecimiento del
  parque.
- *"En el Paso 3 vimos que insertion sort puede ganar para `n` muy pequeño o
  para entradas casi ordenadas. Si el archivo de la empresa llegara con
  1.800.000 registros ya ordenados de ayer y solo 5.000 nuevos al final,
  ¿seguiría siendo buena idea correr merge sort completo sobre todo el
  archivo?"* — Respuesta esperada: en principio no es obvio — merge sort no
  tiene forma de aprovechar que casi todo ya está ordenado, así que hace el
  mismo trabajo de siempre; un enfoque más inteligente insertaría solo los
  5.000 registros nuevos contra el archivo ya ordenado (más cercano al mejor
  caso de insertion sort), en vez de reordenar todo desde cero con merge
  sort. La respuesta "depende de cómo llega la entrada" es justamente el
  punto de la sesión.
- *"La recurrencia de merge sort es `T(n) = 2T(n/2) + Θ(n)`. ¿Qué representa
  cada uno de esos tres términos en el código de `merge_sort_instrumentado`?"*
  — Respuesta esperada: el `2` son las dos llamadas recursivas
  (`izquierda` y `derecha`); el `T(n/2)` es que cada una recibe la mitad del
  arreglo (`arreglo[:mitad]` y `arreglo[mitad:]`); y el `Θ(n)` es el costo de
  `merge_instrumentado`, que recorre ambas mitades una sola vez para
  combinarlas.
- *"¿Por qué `factorial(n)` no puede quedarse sin el `if n == 0: return 1`?"*
  — Respuesta esperada: sin caso base la función nunca deja de llamarse a sí
  misma — cada llamada generaría una llamada más pequeña indefinidamente,
  hasta agotar la pila de llamadas del intérprete (`RecursionError`); el caso
  base es lo único que le permite a la pila empezar a "deshacerse" y devolver
  resultados.
