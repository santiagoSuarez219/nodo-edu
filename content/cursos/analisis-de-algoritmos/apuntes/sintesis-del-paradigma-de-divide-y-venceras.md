> Sesión T de la Semana 8. Es sesión teórica de cierre de módulo — la Sesión
> P de esta semana es el **Laboratorio evaluativo 2** (`★`, 15%, informe en
> GitHub con formato propio del microdiseño) y no se toca en este documento.
> El hilo de la sesión es el mismo de toda la lección: `maximo_iterativo` vs.
> `maximo_divide_y_venceras` como contraejemplo de que dividir siempre gana.

## Paso 1 — proyectar el código de la lección tal cual está

El `.mdx` ya trae las dos funciones completas; no hay que escribir nada
nuevo para presentarlas, solo tenerlas a mano para ejecutarlas en vivo.

```python
def maximo_iterativo(numeros: list[float]) -> float:
    """Calcula el máximo de una lista recorriéndola una sola vez.

    Args:
        numeros: Lista no vacía de números.

    Returns:
        El valor máximo de la lista.
    """
    mayor = numeros[0]
    for valor in numeros[1:]:
        if valor > mayor:      # cada elemento se compara una sola vez
            mayor = valor
    return mayor


def maximo_divide_y_venceras(numeros: list[float]) -> float:
    """Calcula el máximo de una lista partiéndola recursivamente por la mitad.

    Args:
        numeros: Lista no vacía de números.

    Returns:
        El valor máximo de la lista.
    """
    if len(numeros) == 1:           # caso base: una lista de un elemento
        return numeros[0]           # es, trivialmente, su propio máximo
    medio = len(numeros) // 2
    izquierda = maximo_divide_y_venceras(numeros[:medio])   # numeros[:medio] COPIA
    derecha = maximo_divide_y_venceras(numeros[medio:])     # numeros[medio:] COPIA
    return izquierda if izquierda > derecha else derecha    # combinar: una comparación
```

Punto a resaltar: antes de medir nada, pide al grupo que prediga en voz alta
si `maximo_divide_y_venceras` va a ser más rápida, igual o más lenta que
`maximo_iterativo`. La mayoría predice "más rápida" por asociación con merge
sort y Strassen — esa expectativa equivocada es exactamente lo que el
Paso 2 va a desmontar con números.

## Paso 2 — medir en vivo: `time.perf_counter` sobre tamaños crecientes

```python
import random
import time


def generar_lista(n: int) -> list[float]:
    """Genera una lista de n números aleatorios para medir tiempos.

    Args:
        n: cantidad de elementos a generar.

    Returns:
        Lista de n números flotantes aleatorios.
    """
    return [random.random() for _ in range(n)]


def medir_tiempo(funcion, numeros: list[float], repeticiones: int = 5) -> float:
    """Mide el tiempo promedio de ejecución de una función sobre una lista.

    Repite la medición varias veces porque una sola corrida es ruidosa
    (el sistema operativo puede interrumpir el proceso a mitad de la
    llamada); el promedio suaviza ese ruido.

    Args:
        funcion: función de un solo argumento (la lista) a medir.
        numeros: lista de entrada, no se modifica.
        repeticiones: cuántas veces repetir la medición.

    Returns:
        Tiempo promedio en segundos de una sola ejecución.
    """
    inicio = time.perf_counter()
    for _ in range(repeticiones):
        funcion(numeros)
    fin = time.perf_counter()
    return (fin - inicio) / repeticiones


if __name__ == "__main__":
    tamanos = [1_000, 5_000, 10_000, 50_000, 100_000]

    print(f"{'n':>10} | {'iterativo (s)':>14} | {'divide y venceras (s)':>22}")
    for n in tamanos:
        lista = generar_lista(n)
        tiempo_iterativo = medir_tiempo(maximo_iterativo, lista)
        tiempo_dyv = medir_tiempo(maximo_divide_y_venceras, lista)
        print(f"{n:>10} | {tiempo_iterativo:>14.6f} | {tiempo_dyv:>22.6f}")
```

Punto a resaltar: proyecta la tabla de salida completa. Para cada fila, la
columna `divide y venceras` va a estar por encima de `iterativo` — a veces
por poco, a veces claramente más del doble. Señala en voz alta las dos
razones exactas, ya anticipadas en la lección: cada llamada recursiva reserva
un marco nuevo en la pila, y `numeros[:medio]` / `numeros[medio:]` **copian**
una porción de la lista en cada partición (la iterativa no copia nada). Si
`n=100_000` no muestra diferencia clara en la máquina del salón, sube a
`n=500_000` en vivo — con listas más grandes la brecha se vuelve inconfundible.

> ⚠️ Con `n` muy grande (por encima de `~5_000_000` según el intérprete),
> `maximo_divide_y_venceras` puede agotar la pila de recursión
> (`RecursionError`) mucho antes de que `maximo_iterativo` muestre cualquier
> problema — otra desventaja práctica de la versión recursiva que vale la
> pena mencionar si alguien pregunta por qué no se prueba con `n` todavía
> mayor.

Cierra el paso con la cuenta exacta de copias (no está en la lección
publicada, es material propio de este apunte): cada uno de los `log₂ n`
niveles de recursión copia, entre todas sus llamadas, los `n` elementos de
esa "capa", así que el total de copias es `≈ n log₂ n` elementos, contra
cero de la versión iterativa — sin que el resultado final cambie en
absoluto. Los tiempos medidos en pantalla son la evidencia empírica de ese
mismo argumento.

## Paso 3 — repaso del checklist de 4 señales con preguntas socráticas

Retoma el diagrama de flujo de la lección ("Señales para decidir si divide y
vencerás es la técnica adecuada") y recórrelo con el grupo aplicándolo a dos
problemas nuevos, improvisados en el tablero — ninguno usa técnicas que el
curso no haya visto todavía (nada de búsqueda binaria ni estructuras de datos
posteriores).

**Problema A — "Buscar si un valor aparece en una lista sin ordenar de `n`
elementos".**

- *"¿El problema se descompone en subproblemas independientes del mismo
  tipo?"* — Respuesta esperada: sí, buscar en la mitad izquierda y buscar en
  la mitad derecha son ambos "buscar un valor en una lista", el mismo
  problema en tamaño menor.
- *"¿Los subproblemas son sustancialmente más pequeños?"* — Respuesta
  esperada: sí, cada mitad tiene `n/2` elementos, igual que en merge sort o
  en el máximo.
- *"¿Combinar cuesta menos que resolver todo de una vez?"* — Respuesta
  esperada: combinar aquí es solo "¿lo encontró la izquierda o la derecha?",
  una operación booleana casi gratis — igual que combinar en
  `maximo_divide_y_venceras`.
- *"¿La recurrencia resultante mejora la complejidad de la alternativa
  directa?"* — Respuesta esperada: no. La recurrencia es
  `T(n) = 2T(n/2) + Θ(1)`, que resuelve a `Θ(n)` — exactamente lo mismo que
  recorrer la lista una vez de punta a punta buscando el valor. Mismo
  veredicto que el máximo: dividir no aporta nada aquí porque la lista no
  tiene ningún orden que aprovechar.

**Problema B — "Contar cuántos números pares hay en una lista de `n`
elementos".**

- *"¿El problema se descompone en subproblemas independientes del mismo
  tipo?"* — Respuesta esperada: sí, contar pares en la mitad izquierda y en
  la mitad derecha son ambos "contar pares en una lista", el mismo problema
  en tamaño menor.
- *"¿Los subproblemas son sustancialmente más pequeños?"* — Respuesta
  esperada: sí, cada mitad tiene `n/2` elementos, igual que en merge sort o
  en el máximo.
- *"¿Combinar cuesta menos que resolver todo de una vez?"* — Respuesta
  esperada: combinar es sumar dos números (el conteo de cada mitad), Θ(1) —
  otra vez casi gratis.
- *"¿La recurrencia resultante mejora la complejidad de la alternativa
  directa?"* — Respuesta esperada: no. `T(n) = 2T(n/2) + Θ(1)` vuelve a
  resolver a `Θ(n)`, y recorrer la lista una vez incrementando un contador
  cuando el elemento es par también es `Θ(n)`, sin overhead de recursión ni
  copias de sublistas.

Punto a resaltar tras los dos problemas: en ambos, la respuesta a la primera
pregunta del checklist ("¿se descompone en subproblemas independientes?") es
sí, y aun así el veredicto final es "no aporta mejora" — es la prueba en vivo
de que **hay que recorrer las cuatro preguntas completas**, no basta con la
primera. Un problema puede pasar las primeras tres señales y fallar solo en
la cuarta (como el máximo, la búsqueda sin ordenar y el conteo de pares), y
eso ya es motivo suficiente para preferir la alternativa directa.

Si el grupo propone variantes propias en el tablero (es común que alguien
sugiera "sumar todos los números pares" o "contar cuántos elementos son
mayores que un umbral"), recórrelas con el mismo checklist en vivo: todas
comparten la misma forma `T(n) = 2T(n/2) + Θ(1)` y el mismo veredicto,
porque combinar siempre termina siendo una operación aritmética simple sobre
dos resultados parciales.

## Cierre — de divide y vencerás a ordenamiento

Cierra retomando la tabla de "Resumen operativo" de la lección: cinco filas,
tres con veredicto "Mejora" (merge sort, subarreglo máximo, Strassen) y dos
con veredicto "No mejora" (máximo, suma). El módulo completo — desde la
Semana 4 hasta hoy — se sostuvo en un solo criterio de decisión: comparar la
recurrencia que resulta de dividir contra la alternativa directa, nunca
asumir por parecido superficial con un algoritmo ya visto.

Anuncia la transición sin adelantar contenido: el Módulo 6 deja el paradigma
de divide y vencerás para volver sobre el problema de **ordenamiento**, esta
vez con una estructura de datos nueva que la próxima lección introduce desde
cero — heaps y heapsort. Punto a resaltar: no reveles todavía cómo un heap
resuelve el ordenamiento ni su complejidad; basta con dejar planteada la
pregunta de cierre — "¿existe una forma de ordenar que no sea ni por
inserción, ni por partición como merge sort, y que aun así sea eficiente?" —
para que la próxima lección la responda.
