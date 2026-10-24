> Sesión T (Semana 15, lunes 9 de noviembre) — dictada en vivo por el docente.
> Se encadena con la lectura previa «Fundamentos de programación dinámica»:
> misma cinta de la mercería, misma tabla de precios `PRECIOS`, mismas
> funciones `cortar_ingenuo`, `cortar_memo`, `cortar_tabulado` y
> `reconstruir_cortes`. La lectura *afirmó* que la recursión ingenua hace 2ⁿ
> llamadas y que la memoización y la tabla hacen n(n+1)/2 evaluaciones. Hoy
> **lo contamos en vivo**, con un contador que observa al algoritmo sin
> alterar su resultado. Dos convenciones para todo el apunte: una *llamada* es
> una entrada a la función; una *evaluación* es una vuelta del ciclo que
> calcula `p_i + r_{n-i}`. Todo el código sigue PEP 8 + *type hints* +
> docstring Google-style (regla vigente desde la Semana 3), salvo las
> funciones `def test_...`.
>
> Alcance: exactamente el de la lectura (rod cutting, Cormen 15.1). No se
> abre ningún otro problema de programación dinámica. Los números de la
> escala del Paso 4 son órdenes de magnitud con un supuesto explícito, no
> mediciones.

## Paso 1 — Contar las llamadas de la recursión ingenua

Enunciado breve: antes de mejorar nada, se mide. Se toma la recursión de la
lectura y se le agrega una clase `Cuenta` que anota cuántas veces se llama la
función, cuántas evaluaciones del ciclo se hacen y **con qué `n`** se llamó
cada vez. El resultado devuelto no cambia; el contador solo observa.

```python
from collections import Counter
from dataclasses import dataclass, field

PRECIOS: list[int] = [0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30]


@dataclass
class Cuenta:
    """Contadores que observan al algoritmo sin alterar su resultado."""

    llamadas: int = 0
    evaluaciones: int = 0
    por_argumento: Counter[int] = field(default_factory=Counter)


def precios_hasta(n: int) -> list[int]:
    """Devuelve una tabla de precios con al menos n tramos.

    Args:
        n: Longitud máxima de varilla que se va a necesitar.

    Returns:
        PRECIOS si n <= 10; si no, la misma tabla extendida con precios
        de relleno. Para contar llamadas el valor del precio no importa.
    """
    extra = [30 + 4 * k for k in range(1, max(0, n - 10) + 1)]
    return PRECIOS + extra


def cortar_ingenuo_contado(precios: list[int], n: int, cuenta: Cuenta) -> int:
    """Recursión ingenua que cuenta cuántas veces se llama.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.
        cuenta: Contadores que esta función incrementa.

    Returns:
        El ingreso máximo para una varilla de n metros.
    """
    cuenta.llamadas += 1  # cada entrada a la función es una llamada
    cuenta.por_argumento[n] += 1  # y anotamos con qué n se hizo
    if n == 0:
        return 0
    mejor = 0
    for i in range(1, n + 1):
        cuenta.evaluaciones += 1  # una evaluación de p_i + r_{n-i}
        mejor = max(
            mejor, precios[i] + cortar_ingenuo_contado(precios, n - i, cuenta)
        )
    return mejor


if __name__ == "__main__":
    for n in (4, 10, 15, 20):
        cuenta = Cuenta()
        ingreso = cortar_ingenuo_contado(precios_hasta(n), n, cuenta)
        print(f"n={n:2d}: ingreso={ingreso:3d} llamadas={cuenta.llamadas:>9,}"
              f" 2^n={2 ** n:>9,}")
```

Salida esperada (verificada):

```text
n= 4: ingreso= 10 llamadas=       16 2^n=       16
n=10: ingreso= 30 llamadas=    1,024 2^n=    1,024
n=15: ingreso= 50 llamadas=   32,768 2^n=   32,768
n=20: ingreso= 70 llamadas=1,048,576 2^n=1,048,576
```

Punto a resaltar: las llamadas coinciden **exactamente** con 2ⁿ, no «más o
menos». Con `n = 4` son las 16 del árbol de la lectura; al sumar 1 a `n` se
duplica el trabajo. Con `n = 20` ya es más de un millón de llamadas para
decidir cómo cortar una cinta de 20 m, y los ingresos de `n = 15` y `n = 20`
solo sirven para contar (los precios 11 a 20 son de relleno). Antes de mostrar
el desglose por argumento, se lanza la votación.

## 🗳️ Votación — cuántas veces aparece un subproblema

Cuándo: al terminar el Paso 1, **antes** de imprimir `cuenta.por_argumento`.
Encuesta o chat; votan solos y sin ejecutar nada.

En el árbol de llamadas de `cortar_ingenuo(precios, 6)`, ¿cuántas veces se
llama la función con el argumento `3`, es decir, `cortar(3)`?

- (a) 3.
- (b) 4.
- (c) 6.
- (d) 8.

Correcta: (b).

Qué revela cada distractor:
- (a) → calcula `6 - 3`: cree que el subproblema aparece una vez por cada
  «metro de diferencia», sin ver que cada aparición genera nuevas.
- (c) → responde con `n`: confunde cuántas veces se repite un subproblema con
  el tamaño del problema.
- (d) → aplica 2 elevado a `n - k` sin descontar el primer nivel; es la
  respuesta de quien recuerda «el doble cada vez» pero se pasa un paso.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir. Cierre de la
discusión: cada llamada con argumento `m` llama una vez a cada `k < m`, así
que `N(k)` es la suma de `N(m)` para todo `m > k`. Con `N(6) = 1`, resulta
`N(5) = 1`, `N(4) = 2` y `N(3) = 4`: la cuenta se duplica en cada paso hacia
abajo.

Para comprobarlo en pantalla:

```python
if __name__ == "__main__":
    cuenta = Cuenta()
    cortar_ingenuo_contado(precios_hasta(6), 6, cuenta)
    print(sorted(cuenta.por_argumento.items()))
```

```text
[(0, 32), (1, 16), (2, 8), (3, 4), (4, 2), (5, 1), (6, 1)]
```

Punto a resaltar: `cortar(0)` se llama 32 veces y `cortar(1)`, 16, en un
problema que solo tiene **7 subproblemas distintos** (`r_0` a `r_6`). Esa
disparidad —pocos subproblemas, muchísimas llamadas— es el traslape que la
lectura describió con la analogía del cuaderno.

## Paso 2 — Memoización: anotar y consultar

Enunciado breve: se agrega el cuaderno `memo` a la recursión. El contador es
el mismo, así que la comparación con el Paso 1 es directa. Se imprime una
tabla de cuatro columnas para varios `n`.

```python
def cortar_memo_contado(
    precios: list[int],
    n: int,
    cuenta: Cuenta,
    memo: dict[int, int] | None = None,
) -> int:
    """Memoización que cuenta llamadas y evaluaciones.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.
        cuenta: Contadores que esta función incrementa.
        memo: Cuaderno con los valores r_j ya calculados.

    Returns:
        El ingreso máximo para una varilla de n metros.
    """
    if memo is None:
        memo = {}  # cuaderno nuevo en cada consulta externa
    cuenta.llamadas += 1
    if n == 0:
        return 0
    if n in memo:  # ya estaba anotado: respuesta inmediata
        return memo[n]
    mejor = 0
    for i in range(1, n + 1):
        cuenta.evaluaciones += 1
        mejor = max(
            mejor,
            precios[i] + cortar_memo_contado(precios, n - i, cuenta, memo),
        )
    memo[n] = mejor  # se anota antes de salir
    return mejor


if __name__ == "__main__":
    print("   n  ingenuas  memo-llamadas  memo-eval  n(n+1)/2")
    for n in (4, 10, 20, 40, 240):
        memo_cuenta = Cuenta()
        cortar_memo_contado(precios_hasta(n), n, memo_cuenta)
        if n <= 20:
            ing = Cuenta()
            cortar_ingenuo_contado(precios_hasta(n), n, ing)
            ing_txt = f"{ing.llamadas:,}"
        else:
            ing_txt = f"2^{n}"  # ni se intenta: no terminaría
        print(f"{n:4d} {ing_txt:>10} {memo_cuenta.llamadas:>14,}"
              f" {memo_cuenta.evaluaciones:>10,} {n * (n + 1) // 2:>9,}")
    memo: dict[int, int] = {}
    cortar_memo_contado(PRECIOS, 10, Cuenta(), memo)
    print(memo)
```

Salida esperada (verificada):

```text
   n  ingenuas  memo-llamadas  memo-eval  n(n+1)/2
   4         16             11         10        10
  10      1,024             56         55        55
  20  1,048,576            211        210       210
  40       2^40            821        820       820
 240      2^240         28,921     28,920    28,920
{1: 1, 2: 5, 3: 8, 4: 10, 5: 13, 6: 17, 7: 18, 8: 22, 9: 25, 10: 30}
```

Punto a resaltar: la tercera y la cuarta columna son idénticas a la quinta,
**exactamente** n(n+1)/2, sin ruido. Y las llamadas son una más que las
evaluaciones (la llamada raíz). `n = 240` corre al instante con la memoización
mientras que la ingenua jamás terminaría. El diccionario final coincide con el
de la lectura. Nota para el docente: la memoización sigue siendo recursiva
(profundidad `n`), así que `n = 240` cabe en el límite por defecto de Python
(1000), pero `n = 5000` lo reventaría.

**🐞 Error planeado:** al escribir `cortar_memo`, firma la función «de una
vez» con el cuaderno como valor por defecto, que es lo que parece natural:

```python
def cortar_memo_mal(
    precios: list[int], n: int, memo: dict[int, int] = {}
) -> int:
    """Versión incorrecta: el cuaderno es un argumento por defecto mutable."""
    if n == 0:
        return 0
    if n in memo:
        return memo[n]
    mejor = 0
    for i in range(1, n + 1):
        mejor = max(mejor, precios[i] + cortar_memo_mal(precios, n - i, memo))
    memo[n] = mejor
    return mejor
```

**Síntoma:** funciona perfecto en la primera consulta, pero al cambiar la tabla
de precios la respuesta no cambia:

```python
if __name__ == "__main__":
    doble = [0, 2, 10, 16, 18, 20, 34, 34, 40, 48, 60]  # todos los precios x2
    print(cortar_memo_mal(PRECIOS, 4), cortar_memo_mal(doble, 4))
```

```text
10 10
```

La respuesta correcta para la segunda tabla es 20.

**Pregunta al grupo:** «Los precios se duplicaron y el resultado es igual.
¿De dónde sale ese 10, si no pasamos ninguna tabla vieja?»
**Corrección:** el valor por defecto `{}` se crea **una sola vez**, cuando se
define la función, y las llamadas siguientes reutilizan ese mismo diccionario
con los `r_j` de la tabla anterior. Un cuaderno solo sirve para *una* tabla de
precios. La versión correcta ya está arriba: el valor por defecto es `None` y
`if memo is None: memo = {}` crea un cuaderno nuevo en cada consulta externa,
que se pasa a las llamadas internas.

## Paso 3 — Tabulación y reconstrucción de los cortes

Enunciado breve: se llena la tabla de menor a mayor sin recursión, se guarda
`s[j]` junto a `r[j]` y se recupera la lista de tramos. Es el código de la
lectura, ahora con cada línea comentada.

```python
def cortar_tabulado(precios: list[int], n: int) -> tuple[list[int], list[int]]:
    """Calcula r y s llenando la tabla de menor a mayor longitud.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.

    Returns:
        Una pareja (r, s): r[j] es el ingreso máximo para j metros y
        s[j] es la longitud del primer tramo en una solución óptima.
    """
    r = [0] * (n + 1)  # r[0] = 0: una varilla de 0 m no vale nada
    s = [0] * (n + 1)
    for j in range(1, n + 1):  # de menor a mayor: r[j - i] ya está listo
        for i in range(1, j + 1):  # el primer tramo mide i, con i <= j
            if precios[i] + r[j - i] > r[j]:  # > estricto: gana el primero
                r[j] = precios[i] + r[j - i]
                s[j] = i
    return r, s


def reconstruir_cortes(s: list[int], n: int) -> list[int]:
    """Recorre s para listar los tramos de una solución óptima.

    Args:
        s: Longitud del primer tramo óptimo para cada j.
        n: Longitud de la varilla.

    Returns:
        Las longitudes de los tramos, en el orden en que se cortan.
    """
    tramos: list[int] = []
    while n > 0:
        tramos.append(s[n])  # primer tramo de la varilla actual
        n -= s[n]  # lo que queda por cortar
    return tramos


if __name__ == "__main__":
    r, s = cortar_tabulado(PRECIOS, 10)
    print("r:", r)
    print("s:", s)
    print(reconstruir_cortes(s, 4), reconstruir_cortes(s, 7),
          reconstruir_cortes(s, 9), reconstruir_cortes(s, 10))
```

Salida esperada (verificada):

```text
r: [0, 1, 5, 8, 10, 13, 17, 18, 22, 25, 30]
s: [0, 1, 2, 3, 2, 2, 6, 1, 2, 3, 10]
[2, 2] [1, 6] [3, 6] [10]
```

Punto a resaltar: `r` y `s` coinciden con las filas de la tabla de la
lectura. El orden de los dos ciclos es la clave: como `j` crece, cuando se
calcula `r[j]` todos los `r[j - i]` con `i >= 1` ya están escritos. Y
`reconstruir_cortes` no vuelve a calcular nada: solo sigue los `s`. Para
`n = 10` el mejor corte es **no cortar** (`[10]`); para `n = 9` conviene
`[3, 6]`.

**🐞 Error planeado:** al escribir el ciclo interno, copia el rango del
Paso 2, donde el ciclo iba hasta `n`:

```python
def cortar_tabulado_mal(
    precios: list[int], n: int
) -> tuple[list[int], list[int]]:
    """Versión incorrecta: el ciclo interno olvida el límite i <= j."""
    r = [0] * (n + 1)
    s = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(1, n + 1):  # BUG: debería ser range(1, j + 1)
            if precios[i] + r[j - i] > r[j]:
                r[j] = precios[i] + r[j - i]
                s[j] = i
    return r, s
```

**Síntoma:** no lanza ninguna excepción, pero la tabla es absurda: una cinta
de 1 m vale 30.

```python
if __name__ == "__main__":
    rm, sm = cortar_tabulado_mal(PRECIOS, 10)
    print("r:", rm)
    print(reconstruir_cortes(sm, 4))
```

```text
r: [0, 30, 31, 35, 38, 40, 43, 47, 48, 52, 55]
[3, 10]
```

**Pregunta al grupo:** «¿Cómo puede valer 30 una cinta de 1 m? ¿Y qué tramo de
10 m cabe en una cinta de 4?»
**Corrección:** con `i > j`, el índice `j - i` es **negativo**, y Python no
falla: un índice negativo cuenta desde el final de la lista. Así `r[j - i]`
lee casillas arbitrarias del otro extremo, casi todas todavía en 0, y
`precios[10] + 0 = 30` gana para `j = 1`. Python te deja equivocarte sin avisar. El ciclo correcto, ya
arriba, es `range(1, j + 1)`: el primer tramo nunca puede ser más largo que la
varilla.

## 🗳️ Votación — empates y reconstrucción

Cuándo: tras el error planeado del Paso 3, con `cortar_tabulado` en pantalla.
Encuesta o chat.

En `cortar_tabulado` cambiamos la comparación `>` por `>=`:

```python
if precios[i] + r[j - i] >= r[j]:  # antes: >
```

El valor `r[7]` sigue siendo 18. Pero, con el nuevo `s`, ¿qué devuelve
`reconstruir_cortes(s, 7)`? Recuerda que la lectura dice que 7 m tiene
varias formas de ganar 18.

- (a) `[1, 6]`, igual que antes.
- (b) `[6, 1]`.
- (c) `[2, 2, 3]`.
- (d) `[7]`.

Correcta: (b).

Qué revela cada distractor:
- (a) → cree que cambiar la comparación altera el *valor* y no *cuál* de los
  óptimos se elige; no ve que `>=` deja la última opción empatada.
- (c) → sabe que 2 + 2 + 3 también vale 18, pero `s[7]` guarda solo el
  **primer tramo**: ese resultado es un óptimo posible, no el que `s`
  produce.
- (d) → ignora que `p_7 = 17 < 18`: vender entera una cinta de 7 m no es
  óptimo.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir. Cierre de la
discusión, ejecutando la variante:

```python
def cortar_tabulado_empates(
    precios: list[int], n: int
) -> tuple[list[int], list[int]]:
    """Igual que cortar_tabulado, pero con >= en lugar de >."""
    r = [0] * (n + 1)
    s = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(1, j + 1):
            if precios[i] + r[j - i] >= r[j]:  # gana el ÚLTIMO empate
                r[j] = precios[i] + r[j - i]
                s[j] = i
    return r, s


if __name__ == "__main__":
    r_ge, s_ge = cortar_tabulado_empates(PRECIOS, 10)
    r_gt, s_gt = cortar_tabulado(PRECIOS, 10)
    print(r_ge[7], s_ge[7], reconstruir_cortes(s_ge, 7))
    print(r_gt[7], s_gt[7], reconstruir_cortes(s_gt, 7))
```

```text
18 6 [6, 1]
18 1 [1, 6]
```

La recurrencia garantiza el **valor** óptimo, no que la solución óptima sea
única. Con `>` gana el primer `i` que alcanza el máximo; con `>=`, el último.
Para `n = 7` los empates son `i = 1, 2, 3, 6` (todos dan 18), y `>=` se queda
con 6.

## 👥 Reto en parejas — reconstruir a mano y cortar con costo

Tiempo sugerido: 15 min. Roles: una persona es *driver* (escribe) y la otra
*navigator* (dirige y revisa); cambian al terminar la parte A. En salas.

Enunciado:

- **Parte A (sin código):** usando solo las filas `r` y `s` de la salida del
  Paso 3, reconstruyan a mano los cortes de `n = 9` y digan cuánto se gana.
  Después confirmen con `reconstruir_cortes`.
- **Parte B:** la mercería ahora cobra un costo fijo `c` **por cada corte**
  (Cormen, ejercicio 15.1-3). Vender la cinta entera no tiene costo; un corte
  parte la varilla en dos tramos y cuesta `c`. Escriban `cortar_con_costo`,
  que devuelva `r` y `s` como `cortar_tabulado`, y úsenla con `n = 8` y
  `c` igual a 0, 1, 2 y 3. ¿Para qué `c` deja de convenir cortar?

Solución completa:

Parte A: `s[9] = 3`, y quedan 6 m; `s[6] = 6`, y quedan 0. Los tramos son
`[3, 6]`, que ganan `p_3 + p_6 = 8 + 17 = 25` (coincide con `r[9]`).

Parte B:

```python
def cortar_con_costo(
    precios: list[int], n: int, costo: int
) -> tuple[list[int], list[int]]:
    """Calcula r y s cuando cada corte cuesta una cantidad fija.

    Args:
        precios: Precio de un tramo de i metros en la posición i.
        n: Longitud de la varilla.
        costo: Costo fijo de cada corte (0 reproduce el caso original).

    Returns:
        Una pareja (r, s) como en cortar_tabulado, con costos incluidos.
    """
    r = [0] * (n + 1)
    s = [0] * (n + 1)
    for j in range(1, n + 1):
        r[j] = precios[j]  # opción sin cortar: se vende entera, sin costo
        s[j] = j
        for i in range(1, j):  # cortar un tramo i < j deja un resto
            valor = precios[i] + r[j - i] - costo  # cobra el corte que se hace
            if valor > r[j]:
                r[j] = valor
                s[j] = i
    return r, s


if __name__ == "__main__":
    for c in (0, 1, 2, 3):
        rc, sc = cortar_con_costo(PRECIOS, 10, c)
        print(f"c={c}: r[8]={rc[8]} cortes={reconstruir_cortes(sc, 8)}")
```

Salida esperada (verificada):

```text
c=0: r[8]=22 cortes=[2, 6]
c=1: r[8]=21 cortes=[2, 6]
c=2: r[8]=20 cortes=[8]
c=3: r[8]=20 cortes=[8]
```

Punto a resaltar: el único cambio en la recurrencia es restar `c` cuando se
corta; el caso `i = j` (no cortar) se evalúa aparte, antes del ciclo, porque
no cobra. Con `c = 2`, `[2, 6]` gana `5 + 17 - 2 = 20`, un **empate** con
vender entera (20); como `valor > r[j]` es estricto, gana la opción sin
cortar. A partir de ahí, cortar ya no conviene. Pregunta de cierre: «¿Qué
cambiaría en la salida si la comparación fuera `>=`?» (Para `c = 2` devolvería
`[6, 2]`, con ese mismo valor 20: el empate lo gana ahora el corte en lugar de
la cinta entera, como en la votación anterior.) Esto
sigue siendo Θ(n²): lo único que cambia es una resta dentro del ciclo.

## Paso 4 — Volver a la escala real

Enunciado breve: cierre de la sesión con el mismo contraste, ahora en
horas. La lectura dio las cifras de `n = 20`, `n = 40` y `n = 240`; aquí se
calculan con una función para que no sean un número mágico.

```python
LLAMADAS_POR_SEGUNDO: int = 10_000_000  # supuesto, no una medición


def comparar_escalas(n: int) -> tuple[int, int, float]:
    """Compara el trabajo de la recursión ingenua con el de la tabla.

    Args:
        n: Longitud del problema.

    Returns:
        Tupla (llamadas ingenuas, operaciones con tabla, horas estimadas
        de la ingenua bajo el supuesto de 10 millones de llamadas por
        segundo).
    """
    ingenuas = 2 ** n
    con_tabla = n * (n + 1) // 2
    horas = ingenuas / LLAMADAS_POR_SEGUNDO / 3600
    return ingenuas, con_tabla, horas


if __name__ == "__main__":
    for n in (20, 40, 60):
        ingenuas, tabla, horas = comparar_escalas(n)
        print(f"n={n}: ingenuas={ingenuas:,} tabla={tabla:,} "
              f"horas={horas:,.2f}")
    _, tabla, horas = comparar_escalas(240)
    print(f"n=240: tabla={tabla:,} horas={horas:.3e}")
```

Salida esperada (verificada):

```text
n=20: ingenuas=1,048,576 tabla=210 horas=0.00
n=40: ingenuas=1,099,511,627,776 tabla=820 horas=30.54
n=60: ingenuas=1,152,921,504,606,846,976 tabla=1,830 horas=32,025,597.35
n=240: tabla=28,920 horas=4.908e+61
```

Punto a resaltar: con el supuesto de 10⁷ llamadas por segundo, `n = 40`
ya son unas 30,5 h (los 30,54 de la salida), y `n = 60`, unos 3.650 años,
mientras que la tabla pasa de 820 a 1.830 operaciones. En `n = 240` (la
ventana de 4 h en minutos del contexto de telemedición de la lectura) la
tabla cuesta 28.920 operaciones y la ingenua ni se estima: son del orden de
10⁶¹ horas. Recordatorio para el docente: el caso de telemedición del curso es
solo contexto narrativo y **no** usa programación dinámica; aquí lo único que
importa es la escala del contraste.

## Preguntas socráticas

- «Si ya tenemos la memoización, ¿qué ganó el código con la tabla?» → No hay
  llamadas recursivas, y por tanto no hay riesgo de desbordar la pila de
  llamadas; el trabajo en evaluaciones es el mismo, n(n+1)/2.
- «En el Paso 2, ¿por qué `memo[n] = mejor` va *después* del ciclo y no
  antes?» → Porque `mejor` solo vale la respuesta cuando el ciclo terminó; si
  se anotara antes, el cuaderno guardaría un valor parcial.
- «¿Por qué `reconstruir_cortes` cuesta Θ(n) y no Θ(n²)?» → Porque no vuelve
  a probar cortes: cada paso lee un `s[n]` y reduce `n` en al menos 1.
- «¿Qué otra información podría guardar la tabla, además de `s`, para dar
  más datos al operario?» → Por ejemplo, el número de cortes de cada solución;
  la idea es la misma: un arreglo auxiliar llenado junto a `r`.

## Práctica externa

Problemas de LeetCode que practican la misma idea (una tabla llenada de menor
a mayor, o una recursión con cuaderno). **Por verificar:** los nombres y
números salen de lo que el redactor conoce de la plataforma; no se pudieron
confirmar desde el entorno de redacción, y no se incluyen enlaces. El docente
debe buscar cada uno por su nombre y confirmar número y dificultad antes de
compartirlo.

- **LeetCode 70 — Climbing Stairs** (fácil): contar las maneras de subir una
  escalera de `n` escalones de a 1 o 2. Es la recursión de la lectura con solo
  dos opciones por paso; sin memoización repite subproblemas igual que el árbol
  de hoy.
- **LeetCode 746 — Min Cost Climbing Stairs** (fácil): subir pagando un costo
  por escalón. Se llena una tabla de menor a mayor; conecta con la parte B del
  reto, donde cada decisión tiene un costo.
- **LeetCode 322 — Coin Change** (media): menor número de monedas para una
  suma. Es el problema más cercano al corte de varillas: una tabla de tamaño
  `monto + 1` llenada de menor a mayor probando "el primer elemento" como en
  `r[j - i]`. Sugerido solo para quien termine rápido.
