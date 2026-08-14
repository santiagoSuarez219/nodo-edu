---
title: "Laboratorio 03 — Insertion sort en Python"
updatedAt: "2026-08-13"
---

# Laboratorio 03 — Insertion sort en Python

## Objetivo

La lección de esta semana dejó planteado el caso de la empresa de energía: 1.850.000 lecturas de medidor que hay que depurar y ordenar cada madrugada, dentro de una ventana de cuatro horas que hoy no alcanza. Este laboratorio trabaja sobre la operación que domina ese costo —ordenar— en una escala que sí cabe en su máquina.

Implemente insertion sort en Python instrumentado con contadores de operaciones, verifique que su implementación respeta la invariante de ciclo demostrada en la lección teórica, y mida empíricamente su comportamiento para identificar el mejor y el peor caso de entrada.

Competencias esperadas:
- Implementar insertion sort con un contador de comparaciones y un contador de desplazamientos, distinguiendo con precisión qué operación cuenta como cada una.
- Escribir un caso de prueba que verifique la invariante de ciclo en una iteración intermedia de la ejecución, no solo al final.
- Generar y clasificar tres tipos de entrada (mejor caso, peor caso, entrada aleatoria) y justificar, con el conteo de operaciones, por qué cada una lo es.
- Interpretar el resultado empírico en términos del caso: qué implica la curva medida para una carga de 1.850.000 registros y una ventana de cuatro horas.

## Requisitos Previos

Antes de comenzar, debe dominar los conceptos de la lección teórica de esta semana:
- De "Algoritmos como tecnología": el modelado del caso de la empresa de energía (entradas, salidas, restricciones y operación crítica), qué es un algoritmo, por qué la eficiencia importa además de la corrección, la descripción de insertion sort (comparar y desplazar), y la invariante de ciclo demostrada por inicialización, mantenimiento y terminación.

También necesita, de sesiones anteriores:
- Su entorno virtual (`venv`) de la Semana 2, con `matplotlib` instalado y verificado.
- Su repositorio del curso, con la carpeta `ejercicios-clase/` en su raíz y al menos un `.gitignore` que excluya `venv/`.

## Desarrollo del Laboratorio

### Parte 1 — Insertion sort instrumentado

Parta del algoritmo `insertion_sort` de la lección teórica y agréguele dos contadores: uno de comparaciones y otro de desplazamientos. La función debe seguir ordenando exactamente igual que antes; el conteo es un efecto adicional, no un cambio de comportamiento.

Complete el siguiente esqueleto:

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
        # TODO: recorra hacia atras. En cada vuelta cuente la
        # comparacion entre arreglo[j] y clave. Si arreglo[j] es
        # mayor que clave, desplacelo una posicion a la derecha y
        # cuente ese desplazamiento por separado.
        arreglo[j + 1] = clave
    return arreglo, comparaciones, desplazamientos
```

**Requisitos:**
- Cada vuelta del bucle interno debe contar exactamente **una** comparación, se desplace o no un elemento.
- Un desplazamiento solo se cuenta cuando efectivamente mueve un elemento una posición a la derecha.
- Verifique su implementación con el caso `[5, 2, 4, 6, 1, 3]`: debe reportar **9 comparaciones** y **8 desplazamientos**.

**Restricciones:**
- No use `time.time()`, `timeit` ni ninguna medición de tiempo real en esta parte: el conteo debe ser de operaciones, no de segundos.
- No modifique el orden en que el algoritmo recorre el arreglo ni su lógica de inserción.

### Parte 2 — Verificar la invariante de ciclo

La invariante de ciclo de la lección teórica dice que, al empezar la iteración `i`, `arreglo[0:i]` ya está ordenado. Extienda su función para verificar esa afirmación con código real, en 2 o 3 valores de `i` — no en todos, porque ya la demostró en el papel.

Complete el siguiente esqueleto (a partir de su solución de la Parte 1):

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
        # TODO: si i esta en puntos_de_control, verifique con un
        # assert que arreglo[:i] es igual a sorted(arreglo[:i]).
        # Incluya un mensaje de error que muestre el valor de i y
        # el contenido de arreglo[:i].
        clave = arreglo[i]
        j = i - 1
        # ... (resto igual que en la Parte 1)
        arreglo[j + 1] = clave

    return arreglo, comparaciones, desplazamientos
```

Escriba en `test_insertion_sort.py` un caso de prueba que llame su función con `puntos_de_control` incluyendo al menos una iteración intermedia (ni la primera ni la última) y confirme que no se dispara ningún `AssertionError`. Por ejemplo, un archivo de prueba se ve así:

```python
from insertion_sort import insertion_sort_instrumentado


def test_ordena_correctamente():
    resultado, _, _ = insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])
    assert resultado == [1, 2, 3, 4, 5, 6]


def test_conteo_de_operaciones_caso_de_referencia():
    _, comparaciones, desplazamientos = insertion_sort_instrumentado([5, 2, 4, 6, 1, 3])
    assert comparaciones == 9
    assert desplazamientos == 8


def test_invariante_de_ciclo_en_iteracion_intermedia():
    arreglo = [5, 2, 4, 6, 1, 3]
    n = len(arreglo)
    puntos = {2, n // 2, n - 1}  # incluye una iteracion intermedia real

    resultado, _, _ = insertion_sort_instrumentado(arreglo, puntos_de_control=puntos)
    assert resultado == sorted([5, 2, 4, 6, 1, 3])
```

**Requisitos:**
- El rango válido de `puntos_de_control` es de `1` a `n - 1` (donde `n` es el tamaño del arreglo). La invariante se enuncia **antes** de procesar `arreglo[i]`, así que `i = n` no tiene sentido.
- Su archivo de prueba debe incluir al menos un `assert` sobre una iteración estrictamente intermedia (ni la primera que se verifica, ni la última).

**Restricciones:**
- No elimine ni debilite el `assert` de la invariante para que "pase" sin verificar realmente el contenido del arreglo.

### Parte 3 — Entradas, gráfica y clasificación de casos

Genere tres tipos de entrada del mismo tamaño para una lista creciente de tamaños de `n`. Cada uno corresponde a un escenario real de cómo la red de telemedición puede entregar las lecturas de la noche:

| Entrada | Escenario que representa |
|---|---|
| Ordenada | La red entregó las lecturas ya en orden de marca de tiempo, sin reintentos ni retrasos |
| Aleatoria | La red las entregó desordenadas, mezcladas por reintentos y por varias pasarelas en paralelo — el escenario habitual |
| Invertida | El peor caso teórico: cada lectura nueva es anterior a todas las ya recibidas |

Mida cuántas comparaciones hace insertion sort en cada una, grafique comparaciones vs. `n` con `matplotlib`, y determine cuál de las tres es el mejor caso y cuál el peor.

Complete el siguiente esqueleto en un archivo `experimento.py` (o intégrelo en `insertion_sort.py`, bajo `if __name__ == "__main__":`):

```python
import random

import matplotlib.pyplot as plt

from insertion_sort import insertion_sort_instrumentado


def generar_entradas(n: int) -> tuple[list, list, list]:
    """Genera tres entradas de tamano n: ordenada, invertida y aleatoria.

    Args:
        n: tamano de cada una de las tres listas generadas.

    Returns:
        Tupla (entrada_ordenada, entrada_invertida, entrada_aleatoria).
    """
    # TODO: construya las tres listas de tamano n.


def medir_comparaciones(tamanos: list[int]) -> dict[str, list[int]]:
    """Mide comparaciones de insertion sort para cada tipo de entrada
    y cada tamano en `tamanos`.

    Args:
        tamanos: lista de tamanos de entrada a medir.

    Returns:
        Diccionario con una clave por tipo de entrada ("ordenada",
        "invertida", "aleatoria") y, como valor, la lista de
        comparaciones medidas para cada tamano en `tamanos`.
    """
    # TODO: para cada n en tamanos, genere las tres entradas y mida
    # las comparaciones que hace insertion_sort_instrumentado sobre
    # cada una (use una copia de la lista para no reordenar la original
    # si la reutiliza).


def graficar_operaciones(
    tamanos: list[int], resultados: dict[str, list[int]], ruta_salida: str
) -> None:
    """Grafica comparaciones vs. n para cada tipo de entrada y guarda
    la figura en ruta_salida.

    Args:
        tamanos: lista de tamanos de entrada usados en el eje x.
        resultados: diccionario devuelto por medir_comparaciones.
        ruta_salida: ruta del archivo donde se guarda la figura.
    """
    # TODO: una curva por tipo de entrada, con leyenda, etiquetas de
    # ejes y titulo. Guarde con plt.savefig(ruta_salida).


if __name__ == "__main__":
    tamanos = [10, 50, 100, 200, 400, 800]
    resultados = medir_comparaciones(tamanos)
    graficar_operaciones(tamanos, resultados, "graficas/operaciones_vs_n.png")
```

**Requisitos:**
- El eje `y` de la gráfica debe ser **número de comparaciones**, nunca tiempo de ejecución en segundos.
- La gráfica debe mostrar las tres curvas (ordenada, invertida, aleatoria) con leyenda que las identifique.
- Use al menos 5 tamaños de `n` distintos, creciendo lo suficiente para que la diferencia entre curvas sea visible (por ejemplo, entre `10` y `800`).
- A partir de la curva del escenario aleatorio, estime el orden de magnitud de comparaciones que haría insertion sort sobre los 1.850.000 registros de una noche. No necesita medirlo: extrapole desde lo que midió y explique cómo llegó a esa cifra.

**Restricciones:**
- No reutilice la misma lista ya ordenada entre corridas: `insertion_sort_instrumentado` la modifica in place, así que debe generar (o copiar) una entrada nueva para cada medición.

## Entregable

Cree la carpeta `ejercicios-clase/semana-03-insertion-sort/` en su repositorio del curso con la siguiente estructura:

```
curso-analisis-algoritmos/
└── ejercicios-clase/
    └── semana-03-insertion-sort/
        ├── insertion_sort.py
        ├── test_insertion_sort.py
        ├── graficas/
        │   └── operaciones_vs_n.png
        └── README.md
```

- `insertion_sort.py`: la implementación de `insertion_sort_instrumentado` (Partes 1 y 2), la generación de entradas y la medición/graficación (Parte 3, directamente o llamando a un módulo auxiliar dentro de la misma carpeta), organizada con un punto de entrada `if __name__ == "__main__":`.
- `test_insertion_sort.py`: los casos de prueba de la Parte 2, incluida la verificación de la invariante de ciclo en una iteración intermedia.
- `graficas/operaciones_vs_n.png`: la gráfica de comparaciones vs. `n` de la Parte 3.
- `README.md`: documento breve (8–12 líneas) que explique qué se implementó, cómo se generó la gráfica, y un análisis que (a) identifique el mejor y el peor caso observado, justificándolo con los números de la gráfica —por ejemplo, cuántas comparaciones tomó cada tipo de entrada para el `n` más grande probado—, y (b) cierre con dos o tres líneas sobre el caso de la empresa: con la cifra que extrapoló para 1.850.000 registros, ¿insertion sort es una opción viable para el cierre nocturno? Responda sí o no y sustente la respuesta con su propio número.

Realice **al menos tres commits** descriptivos documentando el proceso (por ejemplo: insertion sort instrumentado; verificación de la invariante; gráfica y análisis) y haga `push` a su repositorio antes del plazo indicado.

### Ejemplo de verificación

Al ejecutar sus pruebas desde la carpeta `semana-03-insertion-sort/` con el entorno virtual activado:

```bash
pytest test_insertion_sort.py -v
```

Salida esperada (los tres casos deben pasar):

```text
test_insertion_sort.py::test_ordena_correctamente PASSED
test_insertion_sort.py::test_conteo_de_operaciones_caso_de_referencia PASSED
test_insertion_sort.py::test_invariante_de_ciclo_en_iteracion_intermedia PASSED
```

## Criterios de Evaluación

Esta sesión **no es evaluativa** (no corresponde a ninguno de los cinco laboratorios de la evaluación del curso), pero se retroalimenta con el siguiente checklist y alimenta la nota de **Seguimiento**:

- [ ] `insertion_sort_instrumentado` ordena correctamente cualquier lista de entrada, incluyendo el caso de referencia `[5, 2, 4, 6, 1, 3]`.
- [ ] El conteo de comparaciones y desplazamientos es correcto para el caso de referencia (`9` comparaciones, `8` desplazamientos) — comparación y desplazamiento se cuentan por separado, no como una sola operación.
- [ ] Existe al menos un `assert` que verifica la invariante de ciclo (`arreglo[:i] == sorted(arreglo[:i])`) en una iteración estrictamente intermedia, y ese `assert` corre sin `IndexError` ni `AssertionError`.
- [ ] La gráfica `graficas/operaciones_vs_n.png` mide comparaciones (no tiempo), muestra las tres curvas con leyenda, y las curvas son visiblemente distintas para los tamaños de `n` más grandes.
- [ ] El `README.md` identifica correctamente cuál entrada es el mejor caso y cuál el peor, con una justificación apoyada en los números de la gráfica (no solo una afirmación sin evidencia).
- [ ] El `README.md` extrapola la medición a los 1.850.000 registros del caso y concluye explícitamente si insertion sort sirve o no para el cierre nocturno, sustentado en esa cifra y no en una impresión general.
- [ ] Todas las funciones tienen *docstring* (Google-style, con `Args:`/`Returns:` cuando aplique), *type hints* en parámetros y retorno, y nombres claros en `snake_case`, siguiendo las convenciones PEP 8 practicadas en el Laboratorio 02 y en la lección "Algoritmos como tecnología".
- [ ] El repositorio tiene al menos tres commits descriptivos que documentan el proceso, no concentrados en uno solo.

## Dificultades Comunes

### "Mi conteo de comparaciones y desplazamientos da siempre el mismo número"
- Revise si está incrementando ambos contadores en la misma línea. Son dos preguntas distintas: "¿comparé algo?" ocurre en cada vuelta del bucle interno; "¿moví algo?" solo ocurre si esa comparación indicó que había que desplazar.

### "Mi `assert` de la invariante lanza `IndexError`"
- Revise que todo valor en `puntos_de_control` cumpla `1 <= i <= n - 1`, donde `n` es el tamaño del arreglo. La invariante se enuncia **antes** de procesar `arreglo[i]`, así que un valor igual o mayor que `n` no tiene sentido.

### "Mi gráfica muestra tiempo en segundos en vez de operaciones"
- Revise que está usando el valor de retorno `comparaciones` de `insertion_sort_instrumentado`, y no una medición con `time.time()` o `timeit`. El objetivo de esta parte es contar operaciones, que son deterministas para una entrada dada, no medir tiempo, que depende de la máquina.

### "No sé cómo extrapolar mi medición a 1.850.000 registros"
- No intente correr el algoritmo con ese tamaño: no terminaría. Use la forma de la curva que ya midió. Si al pasar de `n` a `2n` las comparaciones se multiplican aproximadamente por cuatro, el crecimiento es cuadrático, y basta con escalar desde el punto que sí midió. Una estimación de orden de magnitud bien argumentada vale más que una cifra exacta inventada.

### "Mis tres curvas salen casi idénticas"
- Revise que `generar_entradas(n)` se llama **dentro** del bucle sobre los tamaños de `n`, una vez por cada tamaño, y no una sola vez fuera del bucle con un `n` fijo.

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 4 (24 de agosto de 2026).

## Extensiones Sugeridas (Bonus)

- Implemente una variante de **insertion sort binario**, donde la posición de inserción de `clave` dentro de la parte ya ordenada se busca con búsqueda binaria en vez de comparación lineal. Agregue esa variante como una cuarta curva en su gráfica y compare cuánto bajó el número de comparaciones frente a cuánto bajó (o no) el número de desplazamientos.
- Agregue una cuarta entrada de prueba: un arreglo "casi ordenado" (por ejemplo, ordenado salvo dos elementos intercambiados) y compare su número de comparaciones contra los otros tres tipos.

## Recursos

- **Apuntes del curso:** lección "Algoritmos como tecnología" (Semana 3, Sesión 1).
- **Documentación oficial:** módulo `assert` de Python; documentación de `matplotlib.pyplot` para gráficas de líneas.
- **Herramienta de pruebas:** `pytest`, ya usado si siguió el ejemplo de verificación de esta guía.
