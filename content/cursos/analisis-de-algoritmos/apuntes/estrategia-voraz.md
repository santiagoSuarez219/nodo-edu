> Sesión P (Semana 15, lunes 9 de noviembre) — dictada en vivo por el docente.
> Se encadena con la lectura previa «Estrategia voraz» (la sala de estudio de
> la biblioteca, los 11 turnos de Cormen 16.1 con intervalos `[s, f)` y la
> función `seleccionar_actividades`) y con «Fundamentos de programación
> dinámica» (la cinta de la mercería y su tabla `PRECIOS`). La lectura
> *afirmó* que la regla de terminación más temprana cuesta Θ(n log n) y que la
> recurrencia de programación dinámica cuesta O(n³). Hoy lo **ejecutamos y lo
> medimos**: el voraz en vivo, la recurrencia de Cormen con un contador, el
> contraste de tiempos contra `n`, las reglas que fallan con contraejemplos
> que corren, y el puente con la cinta de la mercería. Todo el código sigue
> PEP 8 + *type hints* + docstring Google-style (regla vigente desde la
> Semana 3), salvo las funciones `def test_...`.
>
> Dos convenciones para todo el apunte. Los índices del código son base 0 y
> los números que se dicen en voz alta son base 1 (el grupo 1 es el índice 0).
> Las horas de la sección de tiempos **dependen de la máquina**: antes de la
> clase conviene correr el Paso 3 una vez para saber qué números van a salir;
> lo que no cambia son los factores de crecimiento.
>
> Alcance: selección de actividades y su contraste con programación dinámica.
> No se desarrolla ningún otro algoritmo voraz.

## Paso 1 — El voraz en vivo sobre los 11 turnos

Enunciado breve: se escribe `seleccionar_actividades` de la lectura y se
ejecuta con una versión que **narra** cada decisión, para ver cómo la
variable `ultimo_fin` filtra a los demás.

```python
S: list[int] = [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12]
F: list[int] = [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16]


def seleccionar_actividades(s: list[int], f: list[int]) -> list[int]:
    """Elige un máximo de actividades compatibles por terminación más temprana.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad (misma longitud que s).

    Returns:
        Los índices (base 0) de las actividades elegidas, en orden de fin.
    """
    # Índices ordenados por hora de fin; el orden es todo el truco.
    orden = sorted(range(len(s)), key=lambda i: f[i])
    elegidas: list[int] = []
    ultimo_fin = 0  # hora en que se libera la sala
    for i in orden:
        if s[i] >= ultimo_fin:  # >= : el intervalo [s, f) deja cabida al borde
            elegidas.append(i)
            ultimo_fin = f[i]  # la sala vuelve a quedar ocupada hasta f[i]
    return elegidas


def seleccionar_con_traza(s: list[int], f: list[int]) -> list[int]:
    """Igual que seleccionar_actividades, pero imprime cada decisión.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.

    Returns:
        Los índices (base 0) de las actividades elegidas, en orden de fin.
    """
    orden = sorted(range(len(s)), key=lambda i: f[i])
    elegidas: list[int] = []
    ultimo_fin = 0
    for i in orden:
        turno = f"{i + 1:2d} [{s[i]},{f[i]})"  # se muestra en base 1
        if s[i] >= ultimo_fin:
            print(f"  toma  {turno}  sala libre desde {ultimo_fin}")
            elegidas.append(i)
            ultimo_fin = f[i]
        else:
            print(f"  salta {turno}  empieza en {s[i]}, antes de {ultimo_fin}")
    return elegidas


if __name__ == "__main__":
    elegidas = seleccionar_con_traza(S, F)
    print("grupos (base 1):", [i + 1 for i in elegidas])
    print("turnos:", [(S[i], F[i]) for i in elegidas])
```

Salida esperada (verificada):

```text
  toma   1 [1,4)  sala libre desde 0
  salta  2 [3,5)  empieza en 3, antes de 4
  salta  3 [0,6)  empieza en 0, antes de 4
  toma   4 [5,7)  sala libre desde 4
  salta  5 [3,9)  empieza en 3, antes de 7
  salta  6 [5,9)  empieza en 5, antes de 7
  salta  7 [6,10)  empieza en 6, antes de 7
  toma   8 [8,11)  sala libre desde 7
  salta  9 [8,12)  empieza en 8, antes de 11
  salta 10 [2,14)  empieza en 2, antes de 11
  toma  11 [12,16)  sala libre desde 11
grupos (base 1): [1, 4, 8, 11]
turnos: [(1, 4), (5, 7), (8, 11), (12, 16)]
```

Punto a resaltar: la decisión nunca se revisa. Cuando se toma el grupo 1 ya
no se vuelve a mirar. El grupo 3, que pide desde las 0, se **salta** sin
discusión porque llega antes de que se libere la sala; es justamente el que
arruinaba la prueba a mano de la lectura. Y la numeración: el código devuelve
`[0, 3, 7, 10]` y se lee «grupos 1, 4, 8 y 11». Los cuatro turnos son
consecutivos pero con huecos (el 4 al 5, el 7 al 8, el 11 al 12): el orden
por fin no garantiza una sala llena, garantiza un número máximo de turnos.

**🐞 Error planeado:** al escribir la compatibilidad, pon el signo «natural»
para «empieza después de que termina»: `s[i] > ultimo_fin`.

```python
def seleccionar_mal_estricto(s: list[int], f: list[int]) -> list[int]:
    """Versión incorrecta: exige empezar estrictamente después del fin."""
    orden = sorted(range(len(s)), key=lambda i: f[i])
    elegidas: list[int] = []
    ultimo_fin = 0
    for i in orden:
        if s[i] > ultimo_fin:  # BUG: debería ser >=
            elegidas.append(i)
            ultimo_fin = f[i]
    return elegidas
```

**Síntoma:** con los 11 turnos de Cormen pasa la prueba (sigue dando 4), y el
error solo aparece cuando hay turnos que se tocan en el borde:

```python
if __name__ == "__main__":
    seguidos_s, seguidos_f = [0, 2, 4], [2, 4, 6]  # [0,2) [2,4) [4,6)
    print(len(seleccionar_mal_estricto(S, F)))
    print(seleccionar_mal_estricto(seguidos_s, seguidos_f),
          seleccionar_actividades(seguidos_s, seguidos_f))
```

```text
4
[1] [0, 1, 2]
```

**Pregunta al grupo:** «Tres turnos que caben perfectamente uno tras otro, y
el código elige uno solo. ¿Qué pasó con el primero, que empieza en 0?»
**Corrección:** con `>`, el turno `[0, 2)` se rechaza porque `0 > 0` es falso
(`ultimo_fin` arranca en 0), y el `[4, 6)` se rechaza porque `4 > 4` también.
La lectura define intervalos `[s, f)`: si un grupo termina a las 4 y otro
empieza a las 4, caben seguidos, así que la compatibilidad es `s[i] >= ultimo_fin`,
la que ya está en el bloque principal. Moraleja: **un conjunto de prueba que
no tiene casos de borde no prueba el borde**.

## Paso 2 — La recurrencia de Cormen con un contador

Enunciado breve: ahora resolvemos el **mismo** problema con programación
dinámica, tal como lo plantea Cormen (16.1): `c[i][j]` es el tamaño máximo de
un conjunto de actividades compatibles que caben **entre** la actividad `i` y
la actividad `j`, y

`c[i][j] = max sobre k de (c[i][k] + c[k][j] + 1)`

donde `k` recorre las actividades que empiezan cuando o después de que
termina `i` y terminan cuando o antes de que empiece `j`. Si no hay ninguna,
`c[i][j] = 0`.

Convención de centinelas (se dice en voz alta): se ordenan las actividades
por hora de fin y se agregan dos actividades inventadas. La **a0** tiene
`f = 0` («terminó antes de que abriera la sala») y la **a(n+1)** tiene
`s = infinito` («empieza después de todo»). Así la respuesta es `c[0][n + 1]`
y las actividades reales ocupan las posiciones 1 a `n`. Dos convenciones de
conteo: una **prueba** es cada vez que el ciclo examina un `k` con
`i < k < j`; una **evaluación** es cada vez que ese `k` resulta compatible y
se calcula `c[i][k] + c[k][j] + 1`.

```python
import math
from dataclasses import dataclass


@dataclass
class ConteoPD:
    """Contadores que observan a la programación dinámica sin alterarla."""

    pruebas: int = 0  # k examinados (i < k < j)
    evaluaciones: int = 0  # k compatibles, para los que se calcula la suma


def seleccionar_pd(
    s: list[int], f: list[int], conteo: ConteoPD
) -> tuple[int, list[int]]:
    """Resuelve la selección de actividades con la recurrencia de Cormen.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.
        conteo: Contadores que esta función incrementa.

    Returns:
        Una pareja (tamaño, índices base 0 de una solución óptima).
    """
    n = len(s)
    orden = sorted(range(n), key=lambda i: f[i])  # Cormen supone orden por fin
    # Posición 0 = a0 (f = 0); posición n + 1 = a(n+1) (s = infinito).
    ini: list[float] = [0.0] + [float(s[i]) for i in orden] + [math.inf]
    fin: list[float] = [0.0] + [float(f[i]) for i in orden] + [math.inf]
    c = [[0] * (n + 2) for _ in range(n + 2)]  # c[i][j], todo en 0 al inicio
    mejor_k = [[-1] * (n + 2) for _ in range(n + 2)]  # para reconstruir
    for largo in range(2, n + 2):  # de intervalos cortos (j - i) a largos
        for i in range(n + 2 - largo):
            j = i + largo
            for k in range(i + 1, j):  # k estrictamente entre i y j
                conteo.pruebas += 1
                if fin[i] <= ini[k] and fin[k] <= ini[j]:  # k cabe entre i y j
                    conteo.evaluaciones += 1
                    # Lo de la izquierda de k, k mismo y lo de la derecha.
                    valor = c[i][k] + c[k][j] + 1
                    if valor > c[i][j]:  # > estricto: gana el primer k
                        c[i][j] = valor
                        mejor_k[i][j] = k

    def recolectar(i: int, j: int) -> list[int]:
        """Recorre mejor_k para listar las actividades de c[i][j].

        Args:
            i: Posición de la actividad izquierda.
            j: Posición de la actividad derecha.

        Returns:
            Los índices (base 0) de las actividades elegidas entre i y j.
        """
        k = mejor_k[i][j]
        if k == -1:  # no cabe nada entre i y j
            return []
        # orden[k - 1] deshace el corrimiento que causó el centinela a0.
        return recolectar(i, k) + [orden[k - 1]] + recolectar(k, j)

    return c[0][n + 1], recolectar(0, n + 1)


if __name__ == "__main__":
    conteo = ConteoPD()
    tamano, conjunto = seleccionar_pd(S, F, conteo)
    print("PD   :", tamano, [i + 1 for i in conjunto])
    voraz = seleccionar_actividades(S, F)
    print("voraz:", len(voraz), [i + 1 for i in voraz])
    print(conteo)
    assert tamano == len(voraz)  # las dos estrategias coinciden
```

Salida esperada (verificada):

```text
PD   : 4 [1, 4, 8, 11]
voraz: 4 [1, 4, 8, 11]
ConteoPD(pruebas=286, evaluaciones=78)
```

Punto a resaltar: **las dos estrategias coinciden en 4**, y aquí incluso en el
mismo conjunto. Pero miren lo que costó: 286 pruebas y 78 evaluaciones para
11 turnos, frente a un ordenamiento y un barrido. El 286 no es casual: son
todas las ternas `i < k < j` entre 13 posiciones (11 actividades más los dos
centinelas), es decir `C(13, 3) = 286`; en general las pruebas son
`C(n + 2, 3)`, un polinomio cúbico en `n`. Las 78 evaluaciones son las ternas
donde `k` además cabe entre `i` y `j`, y dependen de los datos; las pruebas
no. Idea para decir en voz alta: la PD **no sabe** cuál es la mejor primera
actividad, así que prueba todas; el voraz lo sabe por la propiedad de
elección voraz de la lectura. Las dos dan 4 porque esa propiedad se cumple
aquí; el costo de no saberlo es el cúbico.

## 🗳️ Votación — cuánto tarda la PD al duplicar n

Cuándo: al terminar el Paso 2, **antes** de correr el contraste del Paso 3.
Encuesta o chat; votan solos, sin ejecutar nada.

Con conjuntos de actividades de tamaño `n`, la `seleccionar_pd` que acabamos
de escribir tarda, digamos, 1 ms con `n = 40`. ¿Cuánto esperas que tarde con
`n = 80`?

- (a) Cerca de 2 ms.
- (b) Cerca de 4 ms.
- (c) Cerca de 8 ms.
- (d) Cerca de 16 ms.

Correcta: (c).

Qué revela cada distractor:
- (a) → piensa en tiempo lineal: duplicar la entrada duplica el tiempo; es la
  intuición de quien solo ha visto un ciclo.
- (b) → piensa en tiempo cuadrático: cuenta dos ciclos anidados y olvida el
  tercero, el de `k`.
- (d) → piensa en cuarta potencia: suma un ciclo que no existe (por ejemplo,
  cuenta también la reconstrucción o el recorrido de la tabla).

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir. Cierre de la
discusión: `C(n + 2, 3)` crece como `n` al cubo, y 2 al cubo es 8. Se guarda
la predicción de cada quien y se compara con la tabla del Paso 3.

## Paso 3 — El contraste empírico: tiempo contra n

Enunciado breve: se genera una familia de conjuntos aleatorios de tamaño
creciente, se resuelve cada uno con las dos estrategias, se verifica que den
el **mismo tamaño** y se mide el tiempo con `time.perf_counter`. La
proporción de solapamiento se mantiene constante (los inicios se reparten en
un rango de `10 n` y cada duración va de 1 a 20), así que al crecer `n` el
problema no se vuelve más fácil ni más difícil por otra razón que el tamaño.
La PD cúbica en Python se dispara, por eso `n` llega solo a 320.

```python
import random
import time
from collections.abc import Callable


def generar_actividades(n: int, semilla: int) -> tuple[list[int], list[int]]:
    """Genera n actividades aleatorias con densidad de solapamiento fija.

    Args:
        n: Cantidad de actividades.
        semilla: Semilla del generador, para que la corrida sea repetible.

    Returns:
        Una pareja (s, f) con inicios y fines enteros, s[i] < f[i].
    """
    azar = random.Random(semilla)
    s = [azar.randrange(0, 10 * n) for _ in range(n)]
    f = [inicio + azar.randint(1, 20) for inicio in s]
    return s, f


def medir(funcion: Callable[[], object], repeticiones: int) -> float:
    """Mide el tiempo promedio de una función sin argumentos.

    Args:
        funcion: Función que se va a cronometrar.
        repeticiones: Veces que se ejecuta en cada tanda; el promedio de
            la tanda suaviza el ruido.

    Returns:
        Segundos por ejecución en la mejor de tres tandas (el mínimo
        descarta los picos que mete el sistema operativo).
    """
    mejor = float("inf")
    for _ in range(3):
        inicio = time.perf_counter()
        for _ in range(repeticiones):
            funcion()
        mejor = min(mejor, (time.perf_counter() - inicio) / repeticiones)
    return mejor


def comparar_tiempos(tamanos: tuple[int, ...]) -> tuple[float, float]:
    """Imprime la tabla voraz contra PD y devuelve los últimos tiempos.

    Args:
        tamanos: Tamaños n que se van a medir, de menor a mayor.

    Returns:
        Los segundos del voraz y de la PD para el último tamaño.
    """
    print(f"{'n':>4} {'voraz ms':>9} {'PD ms':>9} {'x voraz':>8} "
          f"{'x PD':>6} {'pruebas':>8} {'eval.':>7}")
    t_voraz_ant = t_pd_ant = 0.0
    t_voraz = t_pd = 0.0
    for n in tamanos:
        s, f = generar_actividades(n, semilla=n)
        t_voraz = medir(lambda: seleccionar_actividades(s, f), 200)
        conteo = ConteoPD()
        tamano, _ = seleccionar_pd(s, f, conteo)  # una pasada para contar
        assert tamano == len(seleccionar_actividades(s, f))  # mismo óptimo
        t_pd = medir(lambda: seleccionar_pd(s, f, ConteoPD()), 1)
        # Factor respecto al tamaño anterior; la primera fila no tiene.
        x_voraz = x_pd = "-"
        if t_voraz_ant:
            x_voraz = f"{t_voraz / t_voraz_ant:.1f}"
            x_pd = f"{t_pd / t_pd_ant:.1f}"
        print(f"{n:4d} {t_voraz * 1e3:9.4f} {t_pd * 1e3:9.2f} {x_voraz:>8} "
              f"{x_pd:>6} {conteo.pruebas:8d} {conteo.evaluaciones:7d}")
        t_voraz_ant, t_pd_ant = t_voraz, t_pd
    return t_voraz, t_pd


if __name__ == "__main__":
    comparar_tiempos((10, 20, 40, 80, 160, 320))
```

Salida típica (los milisegundos **varían por máquina**; las columnas de
factor y de conteo son las que se comentan en clase):

```text
   n  voraz ms     PD ms  x voraz   x PD  pruebas   eval.
  10    0.0007      0.03        -      -      220     146
  20    0.0012      0.17      1.9    6.5     1540    1237
  40    0.0025      1.25      2.1    7.3    11480   10195
  80    0.0052      9.81      2.1    7.8    88560   83006
 160    0.0117     79.52      2.2    8.1   695520  664627
 320    0.0214    644.58      1.8    8.1  5512640 5418068
```

Punto a resaltar: cada vez que `n` se duplica, el voraz **multiplica por cerca
de 2** su tiempo (lo que se espera de `n log n`: 2 por el doble de elementos,
más un poquito por el logaritmo, que el ruido tapa con `n` pequeños) y la PD lo multiplica por **cerca
de 8** (el cubo de 2), con algo de ruido en los `n` pequeños. Las `pruebas`
son exactamente `C(n + 2, 3)`: 220, 1.540, 11.480... ; las `evaluaciones`
se les parecen pero no coinciden, porque dependen de los datos. En `n = 320`
la PD ya tarda más de medio segundo y el voraz, unas dos centésimas de
milisegundo: del orden de 30.000 veces más. ¿Qué dice la tabla completa? Tres cosas: (1) las dos estrategias dieron **el mismo tamaño** en
todos los `n` (el `assert` no saltó), así que la diferencia no es de
calidad, solo de costo; (2) la razón entre los dos tiempos no se mantiene
constante, **crece** con `n`; (3) la curva de la PD se ve como un cubo, la del
voraz casi como una recta.

Para ponerlo en una escala que se sienta (suposición explícita: el tiempo
sigue el mismo ritmo al seguir creciendo):

```python
def extrapolar(n_base: int, t_voraz: float, t_pd: float, n_meta: int) -> None:
    """Proyecta los tiempos medidos a un n mayor (suposición, no medición).

    Args:
        n_base: Tamaño en el que se midieron los tiempos.
        t_voraz: Segundos medidos del voraz con n_base.
        t_pd: Segundos medidos de la PD con n_base.
        n_meta: Tamaño al que se quiere proyectar.
    """
    factor_pd = (n_meta / n_base) ** 3  # la PD crece como n al cubo
    factor_voraz = (n_meta * math.log2(n_meta)) / (n_base * math.log2(n_base))
    print(f"n={n_meta:,}: voraz ≈ {t_voraz * factor_voraz * 1e3:.2f} ms, "
          f"PD ≈ {t_pd * factor_pd / 3600:,.1f} h")


if __name__ == "__main__":
    t_v, t_p = comparar_tiempos((160, 320))
    extrapolar(320, t_v, t_p, 10_000)
```

Salida típica (varía por máquina):

```text
   n  voraz ms     PD ms  x voraz   x PD  pruebas   eval.
 160    0.0103     75.78        -      -   695520  664627
 320    0.0207    633.47      2.0    8.4  5512640 5418068
n=10,000: voraz ≈ 1.03 ms, PD ≈ 5.4 h
```

Punto a resaltar: con diez mil actividades el voraz sigue siendo
inmediato (del orden de un milisegundo) y la PD pasaría **horas** (y su tabla de `n` por `n` ocuparía del
orden de 100 millones de casillas). No es una medición: es lo que obtienes si
el costo sigue el mismo ritmo, que es justo lo que dice la teoría. Es la
tabla `n³` frente a `n log n` de la lectura, pero ahora con tus tiempos en la
columna.

## Paso 4 — Las reglas que fallan, con contraejemplos que corren

Enunciado breve: la lectura **afirmó** que tres reglas razonables fallan.
Aquí se prueba. Se escribe un barrido voraz genérico donde lo único que
cambia entre reglas es la clave de orden, y se compara cada una contra el
óptimo calculado por fuerza bruta (solo viable con pocas actividades).

Declaración de desempates (se dice en voz alta, porque importa): cuando dos
actividades empatan en la clave de la regla, gana la de menor índice, salvo
en «menos conflictos», donde el desempate es la **hora de inicio** y después
el índice.

```python
from collections.abc import Callable
from itertools import combinations


def compatibles(s: list[int], f: list[int], i: int, j: int) -> bool:
    """Indica si las actividades i y j caben en la sala sin solaparse.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.
        i: Índice de una actividad.
        j: Índice de la otra actividad.

    Returns:
        True si una empieza cuando o después de que termina la otra.
    """
    return s[j] >= f[i] or s[i] >= f[j]


def voraz_con_regla(
    s: list[int], f: list[int], clave: Callable[[int], tuple[int, ...]]
) -> list[int]:
    """Barrido voraz genérico: solo cambia el criterio de orden.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.
        clave: Criterio de orden; recibe el índice de una actividad.

    Returns:
        Los índices (base 0) de las actividades elegidas.
    """
    elegidas: list[int] = []
    for i in sorted(range(len(s)), key=clave):
        # Se toma si es compatible con TODAS las ya elegidas.
        if all(compatibles(s, f, i, j) for j in elegidas):
            elegidas.append(i)
    return elegidas


def optimo_por_fuerza_bruta(s: list[int], f: list[int]) -> int:
    """Halla el tamaño óptimo probando todos los subconjuntos (n pequeño).

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.

    Returns:
        El mayor tamaño de un subconjunto de actividades compatibles.
    """
    n = len(s)
    for tamano in range(n, 0, -1):  # del más grande al más pequeño
        for grupo in combinations(range(n), tamano):
            if all(compatibles(s, f, a, b) for a, b in combinations(grupo, 2)):
                return tamano  # el primero que cabe es el máximo
    return 0


def conflictos(s: list[int], f: list[int], i: int) -> int:
    """Cuenta con cuántas otras actividades se solapa la actividad i.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.
        i: Índice de la actividad.

    Returns:
        Número de actividades j distintas de i que no son compatibles con i.
    """
    return sum(
        1 for j in range(len(s)) if j != i and not compatibles(s, f, i, j)
    )


def reglas(
    s: list[int], f: list[int]
) -> dict[str, Callable[[int], tuple[int, ...]]]:
    """Devuelve las cuatro reglas de orden que se comparan.

    Args:
        s: Hora de inicio de cada actividad.
        f: Hora de fin de cada actividad.

    Returns:
        Un diccionario nombre de regla -> clave de orden.
    """
    return {
        "termina primero": lambda i: (f[i], i),
        "menor duración": lambda i: (f[i] - s[i], i),
        "inicio más temprano": lambda i: (s[i], i),
        # Se cuentan los conflictos UNA vez, sobre el conjunto original.
        "menos conflictos": lambda i: (conflictos(s, f, i), s[i], i),
    }


CASOS: dict[str, tuple[list[int], list[int]]] = {
    "A,B,C": ([0, 5, 6], [6, 7, 12]),
    "(0,10),(1,2),(3,4)": ([0, 1, 3], [10, 2, 4]),
    "Cormen (11)": (S, F),
}
```

**🐞 Error planeado:** el grupo propone, con buena intención, ordenar por
duración («los turnos cortos caben más fácil»). Escribe la clave, ejecútala
solo sobre los 11 turnos y celebra:

```python
def seleccionar_mal_orden(s: list[int], f: list[int]) -> list[int]:
    """Versión incorrecta: ordena por duración en vez de por hora de fin."""
    return voraz_con_regla(s, f, lambda i: (f[i] - s[i], i))  # BUG


if __name__ == "__main__":
    print(len(seleccionar_mal_orden(S, F)))  # con Cormen: 4, «funciona»
    a_s, a_f = CASOS["A,B,C"]
    elegidas = seleccionar_mal_orden(a_s, a_f)
    print(len(elegidas), [(a_s[i], a_f[i]) for i in elegidas])
```

**Síntoma:** en los 11 turnos devuelve 4 y parece correcto; con
`A = (0,6)`, `B = (5,7)`, `C = (6,12)` devuelve un solo turno:

```text
4
1 [(5, 7)]
```

**Pregunta al grupo:** «Con los 11 turnos funcionaba. ¿Qué tiene este
ejemplo que no tenía el anterior? ¿Qué le hace el turno B, tan corto, a los
otros dos?»
**Corrección:** `B = (5,7)` es el más corto, así que va primero, y choca con
`A` y con `C`; en cambio `A` y `C` caben juntas (`[0, 6)` y `[6, 12)`). La
duración no dice **cuánto estorba** un turno al resto; la hora de fin sí,
porque es la hora en que se libera la sala. La clave correcta es `f[i]`, la
de `seleccionar_actividades`. Moraleja: tras una regla que «parece
funcionar», lo útil no es otro ejemplo bueno sino buscar uno malo.

## 🗳️ Votación — una regla que acierta en Cormen

Cuándo: tras el error planeado del Paso 4, **antes** de correr la tabla
comparativa de abajo. Encuesta o chat; votan solos, contando a mano si
quieren.

La regla «menos conflictos primero» ordena los turnos por cuántos otros
turnos se les solapan (de menos a más) y los va tomando si caben. La
lectura dijo que esta regla **también** tiene contraejemplo. Aplicada a los
11 turnos de Cormen, ¿cuántos turnos elige?

- (a) 3.
- (b) 4.
- (c) 5.
- (d) No se puede saber sin ejecutarla.

Correcta: (b).

Qué revela cada distractor:
- (a) → generaliza «la regla falla» a «falla en este conjunto»: confunde
  tener un contraejemplo en algún lugar con fallar en todos.
- (c) → cree que una regla distinta de la de terminación podría superar al
  óptimo; el máximo de este conjunto es 4.
- (d) → sabe que la regla no tiene garantía, pero no ve que en un conjunto
  concreto sí se puede decidir a mano: el turno 11, `[12, 16)`, solo choca
  con el 10, así que va primero, y de ahí en adelante cabe la cadena
  1, 4, 8.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir. Cierre de la
discusión: se revela el resultado en la tabla de abajo (fila de Cormen) y se
contrasta con el detalle que sigue a la tabla. La lección: **el ejemplo de
Cormen es demasiado «amable»**; hay que buscar el que no lo es.

## Tabla comparativa de las cuatro reglas

Se ejecuta ahora la comparación completa sobre tres casos.


```python
if __name__ == "__main__":
    nombres = list(reglas([0], [1]))
    encabezado = "".join(f"{k:>21s}" for k in nombres)
    print(f"{'caso':20s}{'óptimo':>7s}{encabezado}")
    for nombre, (s, f) in CASOS.items():
        fila = [len(voraz_con_regla(s, f, c)) for c in reglas(s, f).values()]
        optimo = optimo_por_fuerza_bruta(s, f)
        print(f"{nombre:20s}{optimo:7d}" + "".join(f"{x:21d}" for x in fila))
```

Salida esperada (verificada):

```text
caso                 óptimo      termina primero       menor duración  inicio más temprano     menos conflictos
A,B,C                     2                    2                    1                    2                    2
(0,10),(1,2),(3,4)        2                    2                    2                    1                    2
Cormen (11)               4                    4                    4                    3                    4
```

Punto a resaltar: la columna «termina primero» **nunca baja** del óptimo;
cada una de las otras tiene un renglón donde pierde. Y lean la fila de
Cormen: «menor duración» da 4 y «menos conflictos» da 4. **Pasar los 11
turnos de Cormen no prueba nada**: un solo contraejemplo basta para descartar
una regla, pero un solo ejemplo donde acierta no basta para aceptarla. Para
«menos conflictos» todavía no hay contraejemplo en la tabla: encontrarlo es el
reto en parejas, así que no lo adelanten.

Detalle de la fila de Cormen para «menos conflictos» (confirma la votación):

```python
if __name__ == "__main__":
    clave = reglas(S, F)["menos conflictos"]
    print([conflictos(S, F, i) for i in range(len(S))])
    print([(S[i], F[i]) for i in voraz_con_regla(S, F, clave)])
```

```text
[4, 4, 6, 5, 9, 7, 6, 5, 5, 10, 1]
[(12, 16), (1, 4), (5, 7), (8, 11)]
```

Cuatro turnos, los mismos que el voraz aunque en otro orden. Verificado con
cinco desempates distintos (por índice, por índice inverso, por inicio, por
fin y por inicio inverso): en Cormen siempre da 4.

## Paso 5 — El puente: el voraz por precio por metro en la cinta

Enunciado breve: la lectura dijo que en el corte de varillas con `n = 4`
elegir el tramo de mejor precio por metro da 9 frente a 10. Aquí se
ejecuta, y se ve que esa regla, que *parece* tan razonable como «terminar
primero», solo falla en **un** valor de `n`.

```python
PRECIOS: list[int] = [0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30]


def cortar_voraz_por_metro(
    precios: list[int], n: int
) -> tuple[int, list[int]]:
    """Corta siempre el tramo de mayor precio por metro que quepa.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.

    Returns:
        Una pareja (ingreso, tramos) con lo que logra esta regla voraz.
    """
    ingreso = 0
    tramos: list[int] = []
    resto = n
    while resto > 0:
        # Mejor precio por metro entre los tramos que caben en lo que queda.
        mejor = max(range(1, resto + 1), key=lambda i: precios[i] / i)
        tramos.append(mejor)
        ingreso += precios[mejor]
        resto -= mejor  # y se sigue con lo que sobra, sin volver atrás
    return ingreso, tramos


def cortar_tabulado(precios: list[int], n: int) -> tuple[list[int], list[int]]:
    """Calcula r y s llenando la tabla de menor a mayor longitud.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.

    Returns:
        Una pareja (r, s): r[j] es el ingreso máximo para j metros y
        s[j] es la longitud del primer tramo en una solución óptima.
    """
    r = [0] * (n + 1)
    s = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(1, j + 1):
            if precios[i] + r[j - i] > r[j]:
                r[j] = precios[i] + r[j - i]
                s[j] = i
    return r, s


if __name__ == "__main__":
    r, _ = cortar_tabulado(PRECIOS, 10)
    print("precio por metro:", [round(PRECIOS[i] / i, 2) for i in range(1, 5)])
    for n in range(1, 11):
        voraz_ingreso, tramos = cortar_voraz_por_metro(PRECIOS, n)
        marca = "" if voraz_ingreso == r[n] else "  <-- falla"
        print(f"n={n:2d}: voraz={voraz_ingreso:2d} {tramos!s:8} "
              f"óptimo={r[n]:2d}{marca}")
```

Salida esperada (verificada):

```text
precio por metro: [1.0, 2.5, 2.67, 2.25]
n= 1: voraz= 1 [1]      óptimo= 1
n= 2: voraz= 5 [2]      óptimo= 5
n= 3: voraz= 8 [3]      óptimo= 8
n= 4: voraz= 9 [3, 1]   óptimo=10  <-- falla
n= 5: voraz=13 [3, 2]   óptimo=13
n= 6: voraz=17 [6]      óptimo=17
n= 7: voraz=18 [6, 1]   óptimo=18
n= 8: voraz=22 [6, 2]   óptimo=22
n= 9: voraz=25 [6, 3]   óptimo=25
n=10: voraz=30 [10]     óptimo=30
```

Punto a resaltar: con `n = 4` la regla toma los 3 m (el mejor precio por
metro, 2,67) y le sobra 1 m: 8 + 1 = 9. El óptimo es cortar `[2, 2]` y ganar
5 + 5 = 10. Dos cosas para decir en voz alta. Primera: la regla acierta en 9
de 10 valores de `n`, y por eso es una trampa seductora; un buen conjunto de
prueba tiene que contener justo el caso malo. Segunda: **la misma idea,
«elige lo mejor ahora y no vuelvas atrás», funciona en la sala y falla en la
cinta**. La diferencia es la propiedad de elección voraz: en la sala,
reemplazar la primera actividad de cualquier óptimo por la que termina primero
nunca empeora la solución; en la cinta, tomar el tramo de mejor precio por
metro sí puede empeorarla. Cuando esa propiedad no está garantizada, se
prueban todas las opciones y se comparan: es la programación dinámica de
la sesión T de hoy.

## 👥 Reto en parejas — la regla de «menos conflictos» tiene un contraejemplo

Tiempo sugerido: 15 min. Roles: una persona es *driver* (escribe) y la otra
*navigator* (dirige y revisa); cambian a mitad. En salas.

Enunciado: la regla «menos conflictos primero» acierta en los 11 turnos de
Cormen, pero la lectura dice que tiene contraejemplo. **Encuentren un
conjunto de actividades donde la regla elija menos que el óptimo.**

- **Parte A:** diseñen el conjunto con un lápiz, pensando en cómo un turno
  «aislado» (con pocos conflictos) puede **estorbar** a una cadena de
  turnos que sí caben juntos. Pista: busquen una cadena óptima de 4 turnos
  y agreguen turnos que no pertenecen a ella pero que tienen tantos
  conflictos como los de la cadena (o menos), de modo que la regla los
  prefiera y rompan la cadena.
- **Parte B:** verifíquenlo con `voraz_con_regla`, `reglas` y
  `optimo_por_fuerza_bruta` del Paso 4. Declaren su desempate: el resultado
  puede depender de él.

Solución completa (del docente):

```python
def reto_menos_conflictos() -> None:
    """Muestra un contraejemplo de 8 actividades para «menos conflictos»."""
    s = [9, 0, 0, 0, 7, 2, 6, 4]
    f = [10, 1, 4, 3, 11, 5, 9, 7]
    actividades = list(zip(s, f))
    print("actividades:", actividades)
    print("conflictos :", [conflictos(s, f, i) for i in range(len(s))])
    print("óptimo     :", optimo_por_fuerza_bruta(s, f))
    clave = reglas(s, f)["menos conflictos"]  # desempate: inicio, luego índice
    elegidas = voraz_con_regla(s, f, clave)
    print("la regla   :", len(elegidas), [actividades[i] for i in elegidas])
    por_indice = voraz_con_regla(
        s, f, lambda i: (conflictos(s, f, i), i)  # otro desempate
    )
    print("desempate por índice:", len(por_indice))


if __name__ == "__main__":
    reto_menos_conflictos()
```

Salida esperada (verificada):

```text
actividades: [(9, 10), (0, 1), (0, 4), (0, 3), (7, 11), (2, 5), (6, 9), (4, 7)]
conflictos : [1, 2, 3, 3, 2, 3, 2, 2]
óptimo     : 4
la regla   : 3 [(9, 10), (0, 1), (4, 7)]
desempate por índice: 4
```

Explicación: el óptimo es `(0,1), (2,5), (6,9), (9,10)`, de tamaño 4. El
turno `(9,10)` tiene un solo conflicto (con `(7,11)`), así que la regla lo
toma primero, y hasta ahí va bien. El daño viene después: entre los de 2
conflictos hay un empate (`(0,1)`, `(7,11)`, `(6,9)`, `(4,7)`), y con el
desempate por **inicio más temprano** la regla elige `(0,1)` y luego
`(4,7)`, que choca con `(2,5)` y con `(6,9)` y rompe la cadena óptima. Quedan 3.

Punto a resaltar: el contraejemplo es **sensible al desempate**. Con
desempate por índice (el orden en que están escritos) la misma regla da 4,
y por eso el enunciado exige declararlo. Si una pareja propone un conjunto
distinto, se verifica con las mismas funciones y su propio desempate, no se
descarta por no coincidir con este. Si alguien pregunta cuál es un
contraejemplo que no dependa del desempate, existe (con 11 actividades);
ver la última pregunta socrática.

## Preguntas socráticas

- «En el Paso 2 usamos `>` estricto al elegir `k`. ¿Cambia el tamaño si
  usamos `>=`?» → No: el tamaño `c[i][j]` es el máximo en ambos casos. Lo que
  puede cambiar es *cuál* `k` se guarda y, con él, qué conjunto óptimo se
  reconstruye.
- «¿Por qué la PD necesita la actividad a0 con `f = 0` y la a(n+1) con
  `s = infinito`?» → Para que el problema completo sea un caso más de
  `c[i][j]`: `c[0][n + 1]` considera todas las actividades reales, porque
  todas empiezan después de a0 y terminan antes de a(n+1).
- «El voraz da 4 y la PD da 4. ¿Por qué entonces usar la PD?» → En este
  problema, por nada: el voraz es más barato y la propiedad de elección voraz
  garantiza que acierta. La PD es la herramienta cuando esa propiedad no está
  garantizada, como en la cinta con `n = 4`.
- «¿Qué pasa con el tiempo del voraz si los datos ya vienen ordenados por
  fin?» → El ordenamiento ya no cuesta `n log n` y el barrido es Θ(n); el
  tiempo total baja a lineal. La PD seguiría siendo cúbica.
- «¿Existe un contraejemplo de «menos conflictos» que no dependa de cómo se
  desempata?» → Sí; por ejemplo, con 11 actividades:
  `(5,8) (0,6) (14,16) (3,7) (12,16) (7,12) (13,15) (1,4) (10,14) (0,4)
  (13,16)`. Con el conteo hecho una vez sobre el conjunto original, la regla
  da 3, menos que el óptimo (4), con los siete desempates que se probaron
  (índice, índice inverso, inicio, inicio inverso, fin, fin inverso y
  duración), y lo mismo si se recalcula el conteo tras cada elección.
  Conviene que el docente lo corra antes de usarlo en clase.

## Práctica externa

Problemas de LeetCode sobre intervalos. **Por verificar:** los nombres y
números salen de lo que el redactor conoce de la plataforma; no se pudieron
confirmar desde el entorno de redacción, y no se incluyen enlaces. El docente
debe buscar cada uno por su nombre y confirmar número, dificultad y si exige
suscripción antes de compartirlo.

- **LeetCode 435 — Non-overlapping Intervals** (media): dado un arreglo de
  intervalos, el menor número de intervalos que hay que eliminar para que los
  demás no se solapen. Es la selección de actividades de hoy con otra salida:
  respuesta = total menos el tamaño del conjunto máximo. Ojo con el borde:
  allí los intervalos que solo se tocan se consideran no solapados, igual que
  nuestro `>=` del Paso 1.
- **LeetCode 452 — Minimum Number of Arrows to Burst Balloons** (media):
  mínimo de flechas para reventar globos que ocupan intervalos. Se resuelve
  ordenando también por el extremo derecho, pero con **otro** criterio de
  borde (globos que apenas se tocan sí se revientan con la misma flecha):
  sirve para recordar que `>` frente a `>=` depende del enunciado.
- **LeetCode 253 — Meeting Rooms II** (media; suele ser de pago): número
  mínimo de salas para atender todas las reuniones. Es el problema hermano
  («cuántas salas», no «cuántos turnos en una sala») y sirve para contrastar:
  el orden que ayuda es otro, el de inicio. Sugerido solo para quien
  termine rápido.
