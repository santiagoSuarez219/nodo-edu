> Cubre las dos sesiones de la Semana 3: la **T** (teórica) y la **P**
> (práctica, dictada en vivo por el docente — no es trabajo independiente del
> estudiante). Sirve además para explicar el flujo de trabajo del curso
> (entorno, commits, carpeta `ejercicios-clase/`).

## Sesión T — la lección se presenta tal como está publicada

El `.mdx` de "Algoritmos como tecnología" ya trae el `insertion_sort`
completo y comentado, su traza sobre `[5, 2, 4, 6, 1, 3]` y la demostración
de la invariante de ciclo (inicialización, mantenimiento, terminación).
Dictarla es presentar esa página en orden, deteniéndose en la tabla de
modelado ("¿Qué entra? ¿Qué sale? ¿Qué restringe? ¿Qué operación domina el
costo?") y en el argumento de "algoritmos como tecnología" (Algoritmo A vs.
Algoritmo B, la cuenta de energía, quién paga cuando el algoritmo se
equivoca).

Punto a resaltar: el hilo de toda la sesión — T y P — es el mismo caso, la
empresa de energía con 1.850.000 medidores y una ventana de cuatro horas.
Todo lo que se mide hoy en la sesión P termina extrapolado a esa cifra en el
Paso 3.

### Apoyo visual — Algoritmo A vs. Algoritmo B

La sección "Algoritmos como tecnología" de la lección compara el Algoritmo A
(las cartas en la mano, el que ya conocen) contra el Algoritmo B (uno tipo
divide y vencerás, que se ve más adelante) de forma puramente conceptual, sin
gráfica. Este bloque es solo para proyectar en pantalla mientras se explica
el argumento — **no se ejecuta ningún algoritmo real**, ni se mide tiempo: es
la ilustración matemática directa de las dos formas de crecimiento
(`n` al cuadrado contra `n` por el logaritmo de `n`) que ya se nombraron en
prosa en la lección. Todavía no se usa notación O/Θ/Ω — eso llega en la
Semana 5 — así que en el código y al explicarlo alcanza con decir "trabajo
aproximado" o "cómo crece el trabajo".

```python
import math

import matplotlib.pyplot as plt


def trabajo_aproximado_a(n: int) -> float:
    """Estima el trabajo del Algoritmo A (cartas en la mano) para tamano n.

    Es la misma forma de crecimiento del insertion sort ya visto: cuadratica.

    Args:
        n: tamano de la entrada.

    Returns:
        Trabajo aproximado, proporcional a n al cuadrado.
    """
    return n ** 2


def trabajo_aproximado_b(n: int) -> float:
    """Estima el trabajo del Algoritmo B (divide y venceras) para tamano n.

    Args:
        n: tamano de la entrada.

    Returns:
        Trabajo aproximado, proporcional a n por el logaritmo de n.
    """
    return n * math.log2(n)


def graficar_comparacion(tamanos: list[int], ruta_salida: str) -> None:
    """Grafica el trabajo aproximado de A y B para una lista de tamanos.

    Incluye una tercera curva: el Algoritmo A corriendo en un hardware el
    doble de rapido (la mitad del trabajo original), para mostrar que ni
    siquiera esa mejora lo salva de perder frente al Algoritmo B.

    Args:
        tamanos: tamanos de entrada a evaluar, en orden creciente.
        ruta_salida: ruta del archivo donde se guarda la figura.
    """
    trabajo_a = [trabajo_aproximado_a(n) for n in tamanos]
    trabajo_a_hardware_rapido = [valor / 2 for valor in trabajo_a]
    trabajo_b = [trabajo_aproximado_b(n) for n in tamanos]

    plt.figure(figsize=(8, 5))
    plt.plot(tamanos, trabajo_a, marker="o", label="Algoritmo A (n^2)")
    plt.plot(
        tamanos,
        trabajo_a_hardware_rapido,
        marker="o",
        linestyle="--",
        label="Algoritmo A en hardware 2x mas rapido (n^2 / 2)",
    )
    plt.plot(tamanos, trabajo_b, marker="o", label="Algoritmo B (n log n)")
    plt.xlabel("Tamano de la entrada (n)")
    plt.ylabel("Trabajo aproximado")
    plt.title("Algoritmo A vs. Algoritmo B: como crece el trabajo")
    plt.legend()
    plt.grid(True)
    plt.savefig(ruta_salida)


if __name__ == "__main__":
    tamanos = [10, 100, 500, 1_000, 5_000, 10_000, 30_000]
    graficar_comparacion(tamanos, "graficas/algoritmo_a_vs_b.png")
```

Punto a resaltar: para `n` pequeño las dos curvas casi no se distinguen —
incluso puede que el Algoritmo A se vea competitivo. El cruce ocurre en algún
punto de la gráfica, y a partir de ahí la distancia entre ambas curvas se
abre cada vez más rápido. Ese es el punto exacto en el que "el Algoritmo B en
una computadora modesta termina superando al Algoritmo A en la computadora
más rápida disponible": ningún factor constante de hardware compensa una vez
que `n` cruzó ese umbral.

Punto a resaltar: esta gráfica es la contraparte visual del argumento de
duplicar la computadora vs. duplicar `n` del `.mdx`. Duplicar la velocidad
del hardware solo desplaza la curva del Algoritmo A hacia abajo un factor
constante; no cambia su forma. Duplicar `n` sí cambia dónde cae cada curva,
y lo hace de forma muy distinta para cada una — por eso ninguna mejora de
hardware compensa indefinidamente la diferencia de forma entre las dos
curvas.

Punto a resaltar: la curva punteada (Algoritmo A con hardware 2x más rápido)
es literalmente la curva original de A a mitad de altura — un desplazamiento
constante hacia abajo, no un cambio de forma. Sigue siendo una parábola, así
que el Algoritmo B vuelve a cruzarla, solo que un poco más adelante en `n`.
Es la evidencia visual de que comprar hardware más rápido pospone el problema
una sola vez; no lo resuelve. Para el caso de la empresa: si compran un
servidor el doble de rápido, insertion sort tarda la mitad esta noche, pero
en cuanto el parque de medidores vuelva a crecer, el problema reaparece —
mientras que pasar al Algoritmo B cambia la forma de la curva, no solo su
altura.

## Sesión P — insertion sort: funcionamiento y validación de la invariante

> El conteo de operaciones (comparaciones/desplazamientos), la clasificación
> empírica de mejor/peor/caso promedio y la extrapolación al caso de la
> empresa quedan fuera de este apunte — se cubren en un apunte posterior.
> Ver nota de alcance abajo.

Partir del `insertion_sort` de la lección y extenderlo para verificar, en 2 o
3 valores de `i`, que `arreglo[0:i]` está ordenado antes de procesar
`arreglo[i]` — la invariante de ciclo de la lección teórica. Es código real,
no la demostración en papel. Este paso todavía no cuenta nada: el foco es el
algoritmo y su corrección, no su costo.

```python
def insertion_sort_con_invariante(
    arreglo: list, puntos_de_control: set[int] | None = None
) -> list:
    """Ordena `arreglo` in place por insercion, verificando opcionalmente
    la invariante de ciclo en los puntos indicados.

    Args:
        arreglo: lista de elementos comparables; se modifica in place.
        puntos_de_control: conjunto de valores de `i` en los que se
            verifica que arreglo[0:i] esta ordenado antes de procesar
            arreglo[i]. None desactiva la verificacion.

    Returns:
        La misma lista, modificada in place y ordenada de menor a mayor.
    """
    n = len(arreglo)
    puntos_de_control = puntos_de_control or set()

    for i in range(1, n):
        if i in puntos_de_control:
            assert arreglo[:i] == sorted(arreglo[:i]), (
                f"Invariante de ciclo rota antes de i={i}: {arreglo[:i]}"
            )
        clave = arreglo[i]
        j = i - 1
        while j >= 0 and arreglo[j] > clave:
            arreglo[j + 1] = arreglo[j]
            j -= 1
        arreglo[j + 1] = clave

    return arreglo
```

Caso de referencia (verificar en vivo contra la pantalla proyectada):

```python
>>> insertion_sort_con_invariante([5, 2, 4, 6, 1, 3])
[1, 2, 3, 4, 5, 6]
```

Caso de prueba, verificando la invariante en una iteración intermedia y en
la última:

```python
def test_invariante_de_ciclo_en_puntos_intermedios():
    arreglo = [5, 2, 4, 6, 1, 3]
    n = len(arreglo)
    puntos = {2, n // 2, n - 1}  # incluye una iteracion intermedia real

    resultado = insertion_sort_con_invariante(arreglo, puntos_de_control=puntos)
    assert resultado == sorted([5, 2, 4, 6, 1, 3])
```

Punto a resaltar: el rango válido de `puntos_de_control` es `1 <= i <= n - 1`.
La invariante se enuncia **antes** de procesar `arreglo[i]`, así que `i = n`
no tiene sentido — el ciclo `for` nunca llega ahí. Demostrar en vivo qué pasa
con `puntos_de_control={n}`: es redundante, no un error, porque el `for`
nunca alcanza ese valor.

## Preguntas socráticas

- *"En la traza de la lección de hoy, para ordenar `[5, 2, 4, 6, 1, 3]` la
  clave `1` viajó desde el índice 4 hasta el índice 0 — cuatro
  desplazamientos. ¿Qué tendría que tener esa lista para que **ningún**
  elemento se desplazara nunca?"* — Respuesta esperada: que la lista ya
  estuviera ordenada de entrada — cada `clave` ya estaría en su lugar frente
  a los elementos anteriores, y el `while` interno terminaría en la primera
  comparación sin desplazar nada.
- *"¿Por qué una lista ya ordenada es el mejor caso de insertion sort, y no
  el peor?"* — Respuesta esperada: porque en una lista ya ordenada, cada
  elemento nuevo ya es mayor o igual que todo lo que está a su izquierda,
  así que el `while` interno termina en la primera comparación sin
  desplazar nada; el algoritmo hace el mínimo trabajo posible por
  iteración.
- *"Si cuentan comparaciones, ¿aproximadamente cuántas hace insertion sort
  en el peor caso para `n` elementos?"* — Respuesta esperada: en el peor
  caso cada elemento `i` se compara con los `i` elementos anteriores, así
  que el total es aproximadamente `1 + 2 + ... + (n-1)`, que crece como el
  cuadrado de `n` — sin nombrar la notación O() todavía, basta con que el
  grupo note que duplicar `n` más que duplica el número de comparaciones.
- *"¿Por qué la invariante se verifica **antes** de procesar `arreglo[i]`, y
  no después?"* — Respuesta esperada: porque así lo enuncia la demostración
  de la lección teórica: la invariante describe lo que es cierto al
  **iniciar** cada iteración, y es justamente lo que le permite al cuerpo
  del ciclo confiar en que `arreglo[0..i-1]` ya está ordenado antes de
  insertar `clave`.
- *"La empresa del caso compró un servidor el doble de rápido. ¿Le alcanza
  para cerrar la noche con insertion sort?"* — Respuesta esperada: no, o
  solo transitoriamente. Duplicar la velocidad divide el tiempo entre dos
  una sola vez; en cambio, cada vez que crece el parque de medidores el
  trabajo crece con el cuadrado. Si la empresa pasa de 1.850.000 a
  3.000.000 de cuentas, el trabajo se multiplica por más de dos y medio, y
  el servidor nuevo ya quedó corto otra vez.
- *"Si el algoritmo se equivoca y descarta una lectura legítima, ¿quién se
  da cuenta y quién paga?"* — Respuesta esperada: el usuario, cuando le
  llega la factura; y es él quien tiene que reclamar y demostrar el error.
  El costo del fallo no lo asume quien escribió el algoritmo.
- *"¿Por qué no basta con un solo caso de prueba que ordene una lista y
  verifique el resultado final?"* — Respuesta esperada: un caso final solo
  demuestra que el algoritmo llegó a un resultado correcto para esa
  entrada, no que el proceso intermedio fue correcto en cada paso;
  verificar la invariante en un punto intermedio confirma que el
  razonamiento de la demostración —y no solo la suerte de esa entrada— es
  lo que sostiene la corrección.
