> Punto de partida: el `insertion_sort` sin instrumentar de la lección "Algoritmos como tecnología", con su traza sobre `[5, 2, 4, 6, 1, 3]`. El hilo de la sesión es el caso de la empresa de energía que la lección modeló: 1.850.000 lecturas por noche, ventana de cuatro horas. Todo lo que se mide hoy termina extrapolado a esa cifra en el Paso 3.

## Paso 1 — Insertion sort instrumentado

Agregar a `insertion_sort` un contador de comparaciones y un contador de desplazamientos, sin cambiar el comportamiento del algoritmo.

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

Caso de referencia:

```python
>>> insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])
([1, 2, 3, 4, 5, 6], 9, 8)
```

Punto a resaltar: cada vuelta del `while` es **siempre** una comparación; solo es también un desplazamiento cuando la comparación obliga a mover el elemento. Son dos preguntas distintas, no una sola línea que suma a ambos contadores.

## Paso 2 — Verificar la invariante con `assert`

Extender la función para verificar, en 2 o 3 valores de `i`, que `arreglo[0:i]` está ordenado antes de procesar `arreglo[i]` — la invariante de ciclo de la lección teórica.

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
            arreglo[i]. None desactiva la verificacion.

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

Caso de prueba, verificando la invariante en una iteración intermedia y en la última:

```python
def test_invariante_de_ciclo_en_puntos_intermedios():
    arreglo = [5, 2, 4, 6, 1, 3]
    n = len(arreglo)
    puntos = {2, n // 2, n - 1}  # incluye una iteracion intermedia real

    resultado, _, _ = insertion_sort_instrumentado(arreglo, puntos_de_control=puntos)
    assert resultado == sorted([5, 2, 4, 6, 1, 3])
```

Punto a resaltar: el rango válido de `puntos_de_control` es `1 <= i <= n - 1`. La invariante se enuncia **antes** de procesar `arreglo[i]`, así que `i = n` no tiene sentido — el ciclo `for` nunca llega ahí.

## Paso 3 — Entradas, gráfica y clasificación de casos

Generar entrada ordenada, invertida y aleatoria para una lista creciente de tamaños de `n`, medir comparaciones con `insertion_sort_instrumentado`, graficar con `matplotlib` (operaciones vs. `n`, no tiempo) y clasificar mejor/peor caso.

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

Punto a resaltar: en la entrada **ordenada**, cada `clave` ya es mayor o igual que su predecesor — el `while` hace una sola comparación y cero desplazamientos por iteración, así que la curva de comparaciones vs. `n` es una recta (mejor caso). En la entrada **invertida**, cada `clave` es menor que todos los elementos ya colocados — el `while` recorre hasta el principio en cada iteración, así que la curva es una parábola muy por encima de la recta (peor caso). La entrada aleatoria queda entre ambas.

## Paso 4 — Volver al caso: extrapolar a 1.850.000 registros

Cerrar la sesión devolviendo la medición al caso de la empresa. No se corre insertion sort con ese tamaño: se extrapola desde lo medido.

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

Salida aproximada: `8.556e+11` comparaciones — cerca de un billón. A `1e7` comparaciones por segundo son unas 23,8 horas; a `1e8`, unas 2,4 horas.

Punto a resaltar: **el factor constante no es lo que se corrige, es el exponente.** Las estimaciones de los estudiantes van a diferir mucho según cuántas comparaciones por segundo supongan, y eso está bien. Lo que cada uno debe poder defender es que el crecimiento es cuadrático — y por lo tanto que si la empresa pasa de 1.850.000 a 3.000.000 de cuentas, el trabajo no crece un 62%, sino más del 160%. Ese es el argumento de "algoritmos como tecnología" de la lección, ahora con un número que el estudiante produjo.
