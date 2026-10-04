> Sesión T (Semana 12, lunes 19 de octubre de 2026) — clase dictada en vivo
> por el docente; ese lunes no hay sesión P, así que aquí se reúne toda la
> práctica. Es la continuación práctica de la lección «Medianas,
> selección y estructuras elementales»: el estudiante ya la leyó y respondió el
> cuestionario de cierre, así que aquí no se re-explica; se construye. Hilo
> conductor: el escritorio del profesor el día del parcial (la pila de
> revisión, la fila de entrega, los post-its entre exámenes) y la pregunta de
> la lección, «¿qué nota ocupa el puesto `k`?». La lección resolvió la
> selección con **tres listas**; hoy se resuelve **sobre el mismo arreglo**
> (Cormen 9.2), se mide qué se gana y qué se pierde, y se completan las
> estructuras que la lección dejó en prosa (cola circular) y las que
> necesitan manos en el teclado (pila, cola, lista enlazada). Cierra midiendo
> selección contra ordenamiento completo y volviendo al caso de telemedición
> (1.850.000 lecturas diarias; contexto de trabajo, no una entrega
> calificable). El ordenamiento completo que se usa es el **merge sort** ya
> visto; `sorted()` aparece solo como referencia de tiempo. Todo el código
> sigue PEP 8 + *type hints* + docstring Google-style y los bloques están
> pensados para pegarse en un único archivo, en orden.

## Paso 1 — Instrumento de medida y punto de partida: la versión de tres listas

Enunciado breve: antes de mejorar nada hay que poder medir. Se crea un
`Contador` que acumula las comparaciones entre elementos y las copias a
listas auxiliares, y se instrumenta la versión de la lección (tres montones).
Esa será la línea base de comparaciones y de memoria extra.

```python
import math
import random
import statistics
import time
from collections.abc import Callable


class Contador:
    """Cuenta comparaciones entre elementos y copias a listas auxiliares."""

    def __init__(self) -> None:
        """Crea un contador con ambos acumuladores en cero."""
        self.comparaciones: int = 0
        self.copias: int = 0


def generar(n: int, distintos: int | None = None) -> list[int]:
    """Genera n enteros al azar, con o sin muchos valores repetidos.

    Args:
        n: Cantidad de valores.
        distintos: Cuántos valores diferentes pueden aparecer. Si es None,
            se usa un rango amplio (10 * n) y casi no hay repetidos.

    Returns:
        Lista de n enteros.
    """
    tope = distintos if distintos is not None else 10 * n
    return [random.randrange(tope) for _ in range(n)]


def repartir(
    valores: list[int], referencia: int, contador: Contador
) -> tuple[list[int], list[int], list[int]]:
    """Reparte los valores en tres listas según una referencia.

    Args:
        valores: Valores a repartir.
        referencia: Valor contra el que se compara cada elemento.
        contador: Acumula comparaciones y copias.

    Returns:
        Tres listas: menores, iguales y mayores que la referencia.
    """
    menores: list[int] = []
    iguales: list[int] = []
    mayores: list[int] = []
    for valor in valores:
        contador.comparaciones += 1  # valor < referencia
        if valor < referencia:
            menores.append(valor)
        else:
            contador.comparaciones += 1  # valor == referencia
            if valor == referencia:
                iguales.append(valor)
            else:
                mayores.append(valor)
        contador.copias += 1  # cada valor se copia a UNA de las tres listas
    return menores, iguales, mayores


def seleccionar_con_listas(
    valores: list[int], k: int, contador: Contador
) -> int:
    """Devuelve el valor de la posición k (desde 0) usando tres listas.

    Es la versión de la lección; se renombra para distinguirla de las dos
    versiones que se escriben hoy sobre el mismo arreglo.

    Args:
        valores: Lista no vacía de enteros.
        k: Posición buscada, con 0 <= k < len(valores).
        contador: Acumula comparaciones y copias.

    Returns:
        El k-ésimo valor en orden creciente.
    """
    referencia = random.choice(valores)
    menores, iguales, mayores = repartir(valores, referencia, contador)
    if k < len(menores):
        return seleccionar_con_listas(menores, k, contador)
    if k < len(menores) + len(iguales):
        return iguales[0]  # todos los iguales valen lo mismo
    return seleccionar_con_listas(
        mayores, k - len(menores) - len(iguales), contador
    )


notas = [72, 45, 90, 45, 60, 88, 30, 55]
conteo = Contador()
print(seleccionar_con_listas(notas, 5, conteo))  # 72: el 6.º puesto
print(conteo.comparaciones, conteo.copias)  # varía según el azar
```

Punto a resaltar: `copias` es la memoria extra. Cada ronda de
`repartir` reserva espacio para tantos elementos como tiene el montón actual;
en el pico, la primera ronda, son `n` elementos adicionales además del
arreglo original. Guardar ese número: en el paso 2 baja a cero. También: el
contador suma 1 o 2 comparaciones por elemento, porque cuenta cada `<` y cada
`==` que se evalúa; es la regla de medida para todo el laboratorio.

**Puente al paso 2.** Pregunta al grupo: «Esto funciona y da la respuesta
correcta, pero copió `n` elementos a listas nuevas en la primera ronda. ¿Se
puede hacer el mismo reparto, menores de un lado y mayores del otro, sin
crear ninguna lista, moviendo los exámenes dentro de la misma pila?». Deja
que respondan antes de pasar al paso 2: esa es la pregunta que `particionar`
contesta.

## Paso 2 — Partición sobre el mismo arreglo (Cormen 9.2)

Enunciado breve: en vez de crear tres montones, el profesor ahora reorganiza
los exámenes **dentro de la misma pila de escritorio**: toma el último como
referencia y deja a un lado, sin salir del escritorio, los que no superan esa
nota. La función `particionar` deja el arreglo de modo que la referencia
queda en su posición definitiva, todo lo anterior a ella es menor o igual y
todo lo posterior es mayor.

```python
def particionar(
    a: list[int], inicio: int, fin: int, contador: Contador
) -> int:
    """Particiona a[inicio..fin] alrededor del último elemento (Lomuto).

    Invariante en cada vuelta del bucle:
        a[inicio:frontera] son <= pivote y a[frontera:j] son > pivote.

    Args:
        a: Arreglo que se reorganiza en el sitio (se modifica).
        inicio: Primera posición del tramo (inclusive).
        fin: Última posición del tramo (inclusive); allí está el pivote.
        contador: Acumula comparaciones.

    Returns:
        La posición definitiva del pivote.
    """
    pivote = a[fin]
    frontera = inicio  # primera casilla de la zona de los "mayores"
    for j in range(inicio, fin):
        contador.comparaciones += 1
        if a[j] <= pivote:
            # a[j] pertenece a la zona de los menores: se intercambia con
            # el primer "mayor" y la frontera avanza una casilla.
            a[frontera], a[j] = a[j], a[frontera]
            frontera += 1
    # El pivote pasa de la última casilla a la frontera, su lugar final.
    a[frontera], a[fin] = a[fin], a[frontera]
    return frontera


# Las notas de la lección con 60 como referencia: se lleva al final primero.
arreglo = [72, 45, 90, 45, 60, 88, 30, 55]
arreglo[4], arreglo[7] = arreglo[7], arreglo[4]
conteo = Contador()
posicion = particionar(arreglo, 0, len(arreglo) - 1, conteo)
print(posicion, arreglo, conteo.comparaciones)
# 4 [45, 45, 55, 30, 60, 88, 72, 90] 7
```

Punto a resaltar: el resultado **no** está ordenado; solo está dividido
alrededor del 60 (`posicion = 4`: hay cuatro menores o iguales antes de él).
Son 7 comparaciones, `n - 1`, y **cero copias**: toda la reorganización son
intercambios dentro del mismo arreglo. Comparar con la línea base del paso 1,
que copiaba cada elemento a una lista nueva.

## 🗳️ Votación 1 — Qué deja la partición

**Cuándo:** justo después del paso 2, antes de escribir la selección. En
modalidad virtual: encuesta de la plataforma o respuesta en el chat con la
letra.

Con `a = [5, 2, 8, 2, 6]`, se ejecuta `particionar(a, 0, 4, contador)`
(el pivote es `a[4]`, es decir 6). ¿Qué devuelve y cómo queda `a`?

- (a) Devuelve `3` y `a` queda `[5, 2, 2, 6, 8]`.
- (b) Devuelve `3` y `a` queda `[2, 2, 5, 6, 8]`.
- (c) Devuelve `4` y `a` queda `[5, 2, 2, 8, 6]`.
- (d) Devuelve `2` y `a` queda `[5, 2, 2, 6, 8]`.

**Correcta:** (a). Traza: 5 y 2 pasan a la zona de menores sin moverse; el 8
se salta; el segundo 2 se intercambia con el 8 (`[5, 2, 2, 8, 6]`), y al
final el 6 se intercambia con el 8 de la frontera, que vale 3.

**Qué revela cada distractor:** (b) → cree que particionar *ordena* el tramo
de la izquierda; (c) → cree que el pivote no se mueve y que se devuelve su
posición original; (d) → devuelve el índice del último elemento menor en
lugar de la frontera (confunde «dónde cae el pivote» con «dónde quedó el
último menor»).

**Dinámica:** votan solos, sin hablar. Si hay entre 30 % y 70 % de aciertos,
discuten 2 minutos en parejas (en salas de 2 o por chat privado) y vuelven a
votar; si hay más de 70 %, explicas rápido la traza y sigues; si hay menos
de 30 %, vuelves a trazar el paso 2 en pantalla antes de discutir.

## Paso 3 — La selección sobre el mismo arreglo, y un error clásico

Enunciado breve: se arma `seleccionar_en_sitio` con un bucle: se elige una
referencia, se particiona, y según la posición `p` del pivote se descarta la
mitad que no contiene a `k`. Se escribe en vivo y se introduce el error de
elegir siempre la **misma** casilla como referencia.

**🐞 Error planeado:** al escribir la línea de la referencia, el docente
escribe `indice = inicio` (siempre el primer elemento) en lugar de un índice
al azar. Después prueba con un arreglo **ya ordenado**, que es el caso que
los estudiantes no imaginan: consumos que la red entregó ya en orden.

**Síntoma:** con `n` de 1.000, 2.000 y 4.000 el contador marca 375.249,
1.500.499 y 6.000.999 comparaciones: cada vez que `n` se duplica, el costo se
multiplica por casi 4. No es lineal, es cuadrático.

**Pregunta al grupo:** «Si el primer elemento siempre es el más pequeño del
tramo, ¿cuántos elementos descarta cada ronda? ¿Qué le pasó a la escalera de
n + n/2 + n/4 + … de la lección?»

**Corrección:** la referencia debe elegirse al azar (`random.randint`). Con
una referencia fija en un arreglo ordenado, cada ronda descarta **un solo**
elemento, el montón baja de tamaño en 1 y el costo suma `n + (n - 1) + (n - 2)
+ …`, que es Θ(n²). El azar rompe la dependencia entre el orden de la
entrada y la referencia elegida.

```python
def seleccionar_en_sitio(
    valores: list[int],
    k: int,
    contador: Contador,
    al_azar: bool = True,
) -> int:
    """Devuelve el valor de la posición k (desde 0) particionando en sitio.

    Trabaja sobre una copia de la entrada (una sola copia de n elementos),
    de modo que quien llama conserva su lista intacta.

    Args:
        valores: Lista no vacía de enteros.
        k: Posición buscada, con 0 <= k < len(valores).
        contador: Acumula comparaciones.
        al_azar: Si es False, usa siempre el primer elemento del tramo como
            referencia. Existe solo para reproducir el error planeado.

    Returns:
        El k-ésimo valor en orden creciente.
    """
    a = list(valores)
    inicio, fin = 0, len(a) - 1
    while inicio < fin:
        # Error planeado: aquí se escribe primero "indice = inicio".
        indice = random.randint(inicio, fin) if al_azar else inicio
        a[indice], a[fin] = a[fin], a[indice]  # la referencia va al final
        p = particionar(a, inicio, fin, contador)
        if k == p:
            return a[p]  # el pivote quedó justo en el puesto k
        if k < p:
            fin = p - 1  # nos quedamos con la parte izquierda
        else:
            inicio = p + 1  # nos quedamos con la parte derecha
    return a[inicio]  # el tramo quedó con un solo elemento: es el k-ésimo


# Demostración del error: arreglo ya ordenado, k = mediana.
for n in (1000, 2000, 4000):
    ordenado = list(range(n))
    c_fija = Contador()
    seleccionar_en_sitio(ordenado, n // 2, c_fija, al_azar=False)
    c_azar = Contador()
    seleccionar_en_sitio(ordenado, n // 2, c_azar)
    print(n, c_fija.comparaciones, c_azar.comparaciones)
# n    fija     azar (en una ejecución; cambia cada vez)
# 1000 375249   3906
# 2000 1500499  5129
# 4000 6000999  15606
```

Punto a resaltar: la columna del azar es cien veces menor o más y,
aunque salta de una ejecución a otra, crece de forma aproximadamente lineal
con `n`; la columna de referencia fija se multiplica por 4 cada vez que `n`
se duplica y no cambia entre ejecuciones. La referencia al azar no elimina el peor caso: lo vuelve **improbable**
para cualquier entrada. Hacerlo notar: la entrada ordenada no es «rara», es
el caso más natural.

## Paso 4 — Los valores repetidos: cuando el arreglo se llena de iguales

Enunciado breve: la lección dijo que las tres listas manejan bien los
repetidos porque los iguales tienen su propio montón. ¿Y la partición en
sitio? Dos verificaciones: primero **corrección** (¿devuelve el valor
correcto cuando hay muchos repetidos?) y luego **costo**.

```python
def verificar_contra_sorted(
    seleccionar: Callable[[list[int], int, Contador], int],
    intentos: int = 2000,
) -> None:
    """Compara una función de selección con sorted() en arreglos pequeños.

    Usa pocos valores distintos a propósito para forzar repetidos.

    Args:
        seleccionar: Función con firma (valores, k, contador) -> int.
        intentos: Cuántos arreglos aleatorios probar.
    """
    for _ in range(intentos):
        n = random.randint(1, 12)
        valores = generar(n, distintos=3)  # solo 0, 1 o 2: muchos repetidos
        k = random.randrange(n)
        obtenido = seleccionar(valores, k, Contador())
        esperado = sorted(valores)[k]  # solo como oráculo de prueba
        assert obtenido == esperado, (valores, k, obtenido, esperado)
    print("OK:", intentos, "arreglos con repetidos")


verificar_contra_sorted(seleccionar_con_listas)
verificar_contra_sorted(seleccionar_en_sitio)  # también es correcta

print("n, todos iguales, k = n // 2")
for n in (1000, 2000, 4000):
    c_iguales = Contador()
    seleccionar_en_sitio([7] * n, n // 2, c_iguales)
    print(n, c_iguales.comparaciones)
# 1000 374750
# 2000 1499500
# 4000 5999000
```

Punto a resaltar: la partición de Cormen es **correcta** con repetidos (las
dos verificaciones pasan), pero con todos los valores iguales cae a Θ(n²):
cada elemento cumple `a[j] <= pivote`, el pivote termina siempre al final y
cada ronda descarta un solo elemento, exactamente como en el error del paso
3, pero ahora **ningún azar lo salva**, porque todas las referencias valen
lo mismo. La versión de tres listas no sufre esto: todos los iguales caen en
un único montón y terminan en una ronda. La enseñanza: «correcto» y «rápido»
son propiedades distintas, y los repetidos ponen a prueba la segunda.

## Paso 5 — Tres zonas sobre el mismo arreglo: lo mejor de las dos versiones

Enunciado breve: se recupera la idea de los tres montones (menores, iguales,
mayores) pero **sin copiar**: el arreglo queda en tres zonas contiguas. Es la
partición de tres vías (la bandera holandesa de Dijkstra). Se escribe en vivo
con un segundo error planeado y una función de verificación.

Antes de escribirlo, pon las tres versiones frente a frente:

| | Tres listas (paso 1) | Dos zonas, Lomuto (paso 2) | Tres zonas (paso 5) |
|---|---|---|---|
| Resultado | menores, iguales y mayores en listas nuevas | menores o iguales, referencia, mayores | menores, iguales, mayores |
| Dónde trabaja | listas nuevas (copia cada valor) | el mismo arreglo | el mismo arreglo |
| Memoria extra | `n` elementos en la primera ronda | 0 | 0 |
| Qué devuelve | tres listas | una posición (dónde quedó la referencia) | dos posiciones (inicio y fin de los iguales) |
| Con muchos repetidos | bien | cuadrática: los iguales se mezclan con los menores | lineal: los iguales quedan aparte |
| Dificultad de escribirla | baja | media | alta (de ahí el error planeado) |

**🐞 Error planeado:** al intercambiar `a[i]` con la casilla `mayor`, el
docente escribe también `i += 1` «para avanzar, como en los otros casos».

**Síntoma:** con `[90, 90, 90, 70]` y referencia 70, la función declara que
`a[0..1]` es la zona de los iguales, pero la zona contiene un 90.
`es_particion_valida` devuelve `False`; en una selección completa, a veces
el resultado es correcto por casualidad y a veces no, así que el fallo es
intermitente y por eso es peligroso.

**Pregunta al grupo:** «Después de intercambiar, ¿qué elemento quedó en la
casilla `i`? ¿Ya lo miramos?»

**Corrección:** al intercambiar con la casilla `mayor`, el elemento que
llega a `i` viene del extremo derecho y **todavía no fue examinado**; hay
que mirarlo, así que `i` no avanza. Solo avanza `i` cuando el elemento
queda clasificado: menor (que además mueve `menor`) o igual.

```python
def es_particion_valida(
    a: list[int], inicio: int, fin: int, pivote: int, menor: int, mayor: int
) -> bool:
    """Comprueba que a[inicio..fin] está en tres zonas respecto al pivote.

    Args:
        a: Arreglo ya particionado.
        inicio: Primera posición del tramo (inclusive).
        fin: Última posición del tramo (inclusive).
        pivote: Valor de referencia.
        menor: Primera posición de la zona de iguales.
        mayor: Última posición de la zona de iguales.

    Returns:
        True si menores, iguales y mayores están en sus zonas.
    """
    return (
        all(x < pivote for x in a[inicio:menor])
        and all(x == pivote for x in a[menor:mayor + 1])
        and all(x > pivote for x in a[mayor + 1:fin + 1])
    )


def particionar_tres_con_error(
    a: list[int], inicio: int, fin: int, pivote: int
) -> tuple[int, int]:
    """Versión con el error planeado: avanza i tras el intercambio final.

    Args:
        a: Arreglo que se reorganiza en el sitio.
        inicio: Primera posición del tramo (inclusive).
        fin: Última posición del tramo (inclusive).
        pivote: Valor de referencia.

    Returns:
        Posiciones (menor, mayor) de la zona de iguales... mal calculada.
    """
    menor, i, mayor = inicio, inicio, fin
    while i <= mayor:
        if a[i] < pivote:
            a[menor], a[i] = a[i], a[menor]
            menor += 1
            i += 1
        elif a[i] > pivote:
            a[i], a[mayor] = a[mayor], a[i]
            mayor -= 1
            i += 1  # ERROR: el elemento que llegó a a[i] no se ha mirado
        else:
            i += 1
    return menor, mayor


datos = [90, 90, 90, 70]
m, M = particionar_tres_con_error(datos, 0, 3, 70)
print(m, M, datos, es_particion_valida(datos, 0, 3, 70, m, M))
# 0 1 [70, 90, 90, 90] False


def particionar_tres(
    a: list[int], inicio: int, fin: int, pivote: int, contador: Contador
) -> tuple[int, int]:
    """Particiona a[inicio..fin] en menores, iguales y mayores (Dijkstra).

    Invariante en cada vuelta del bucle:
        a[inicio:menor] < pivote, a[menor:i] == pivote,
        a[i:mayor + 1] sin examinar, a[mayor + 1:fin + 1] > pivote.

    Args:
        a: Arreglo que se reorganiza en el sitio (se modifica).
        inicio: Primera posición del tramo (inclusive).
        fin: Última posición del tramo (inclusive).
        pivote: Valor de referencia (no tiene que estar al final).
        contador: Acumula comparaciones.

    Returns:
        Posiciones (menor, mayor) de la primera y la última casilla de la
        zona de los iguales.
    """
    menor, i, mayor = inicio, inicio, fin
    while i <= mayor:
        contador.comparaciones += 1  # a[i] < pivote
        if a[i] < pivote:
            a[menor], a[i] = a[i], a[menor]
            menor += 1
            i += 1  # el que llega desde 'menor' ya estaba clasificado
        else:
            contador.comparaciones += 1  # a[i] > pivote
            if a[i] > pivote:
                a[i], a[mayor] = a[mayor], a[i]
                mayor -= 1  # i NO avanza: el recién llegado no se ha mirado
            else:
                i += 1  # es igual al pivote: queda en la zona del medio
    return menor, mayor


def seleccionar_tres_zonas(
    valores: list[int], k: int, contador: Contador
) -> int:
    """Devuelve el valor de la posición k con partición de tres zonas.

    Args:
        valores: Lista no vacía de enteros.
        k: Posición buscada, con 0 <= k < len(valores).
        contador: Acumula comparaciones.

    Returns:
        El k-ésimo valor en orden creciente.
    """
    a = list(valores)
    inicio, fin = 0, len(a) - 1
    while inicio < fin:
        pivote = a[random.randint(inicio, fin)]
        menor, mayor = particionar_tres(a, inicio, fin, pivote, contador)
        if k < menor:
            fin = menor - 1  # el puesto k está entre los menores
        elif k > mayor:
            inicio = mayor + 1  # el puesto k está entre los mayores
        else:
            return a[k]  # k cayó en la zona de los iguales: terminamos
    return a[inicio]


datos = [90, 90, 90, 70]
m, M = particionar_tres(datos, 0, 3, 70, Contador())
print(m, M, datos, es_particion_valida(datos, 0, 3, 70, m, M))
# 0 0 [70, 90, 90, 90] True

verificar_contra_sorted(seleccionar_tres_zonas)

for n in (1000, 2000, 4000):
    c_tres = Contador()
    seleccionar_tres_zonas([7] * n, n // 2, c_tres)
    print(n, c_tres.comparaciones)
# 1000 2000
# 2000 4000
# 4000 8000
```

Punto a resaltar: con todos los valores iguales, el costo pasa de 374.750 a
2.000 comparaciones para `n = 1000`: de Θ(n²) a una sola pasada. Y compare
las tres versiones en una tabla en pantalla:

| Versión | Memoria extra | Repetidos | Cuidado |
| --- | --- | --- | --- |
| Tres listas (lección) | Θ(n) por ronda | Los absorbe el montón de iguales | Más código, más memoria |
| Partición de Cormen | Θ(1) (más la copia inicial) | Correcta, pero Θ(n²) si todo es igual | Los repetidos degradan el costo |
| Tres zonas en sitio | Θ(1) (más la copia inicial) | Correcta y lineal | Orden de los índices, el error de este paso |

## 🗳️ Votación 2 — El estado de una cola circular

**Cuándo:** al terminar el paso 6 (pila y cola), antes de pasar a la lista
enlazada.

Una cola circular de capacidad 3 empieza vacía (`inicio = 0`, `tamano = 0`).
Se ejecuta: `enqueue(1)`, `enqueue(2)`, `enqueue(3)`, `dequeue()`,
`enqueue(4)`, `dequeue()`. ¿Qué devuelve el **último** `dequeue()` y cómo
queda el arreglo `datos`?

- (a) Devuelve `2` y `datos` es `[4, 2, 3]`.
- (b) Devuelve `4` y `datos` es `[4, 2, 3]`.
- (c) Devuelve `3` y `datos` es `[1, 2, 3]`.
- (d) Lanza `OverflowError` porque la cola «se llenó al dar la vuelta».

**Correcta:** (a). El primer `dequeue` saca 1 y deja `inicio = 1`,
`tamano = 2`; el `enqueue(4)` escribe en `(1 + 2) % 3 = 0`, que es la casilla
que quedó libre; el segundo `dequeue` lee en `inicio = 1`, devuelve 2 y deja
`inicio = 2`.

**Qué revela cada distractor:** (b) → cree que, al dar la vuelta, el
siguiente en salir es el recién llegado (mezcla la cola con una pila);
(c) → cree que `dequeue` borra el arreglo o que `datos` no cambia con
`enqueue(4)`, y que el valor leído es el último del arreglo; (d) → confunde
«el índice dio la vuelta» con «no queda espacio»: la cola solo está llena
cuando `tamano == capacidad`, y aquí `tamano` valía 2 antes del `enqueue(4)`.

**Dinámica:** votan solos; entre 30 % y 70 % de aciertos, 2 minutos en
parejas y se vota de nuevo; más de 70 %, explicas rápido y sigues; menos de
30 %, vuelves a trazar `inicio` y `tamano` sobre el arreglo antes de
discutir.

## Paso 6 — Pila y cola con arreglo (la cola circular, completa)

Enunciado breve: la bandeja de revisión (pila, LIFO) y la fila de entrega
(cola, FIFO) sobre un arreglo de capacidad fija. La pila es la de la lección;
la cola circular, que la lección dejó en prosa, se escribe completa hoy.

```python
class Pila:
    """Pila de enteros sobre un arreglo de capacidad fija."""

    def __init__(self, capacidad: int) -> None:
        """Crea una pila vacía.

        Args:
            capacidad: Número máximo de elementos.
        """
        self.datos: list[int] = [0] * capacidad
        self.tope: int = 0  # cantidad de elementos; también la próxima casilla

    def esta_vacia(self) -> bool:
        """Indica si no hay elementos.

        Returns:
            True si la pila está vacía.
        """
        return self.tope == 0

    def push(self, valor: int) -> None:
        """Apila un valor; falla si la pila está llena.

        Args:
            valor: Valor a apilar.

        Raises:
            OverflowError: Si la pila ya está en su capacidad máxima.
        """
        if self.tope == len(self.datos):
            raise OverflowError("pila llena")
        self.datos[self.tope] = valor
        self.tope += 1

    def pop(self) -> int:
        """Desapila el valor de arriba; falla si la pila está vacía.

        Returns:
            El último valor apilado.

        Raises:
            IndexError: Si la pila está vacía.
        """
        if self.esta_vacia():
            raise IndexError("pila vacía")
        self.tope -= 1
        return self.datos[self.tope]


class Cola:
    """Cola circular de enteros sobre un arreglo de capacidad fija."""

    def __init__(self, capacidad: int) -> None:
        """Crea una cola vacía.

        Args:
            capacidad: Número máximo de elementos.
        """
        self.datos: list[int] = [0] * capacidad
        self.inicio: int = 0  # casilla del próximo elemento en salir
        self.tamano: int = 0  # cuántos elementos hay ahora

    def enqueue(self, valor: int) -> None:
        """Encola un valor al final; falla si la cola está llena.

        Args:
            valor: Valor a encolar.

        Raises:
            OverflowError: Si la cola ya está en su capacidad máxima.
        """
        if self.tamano == len(self.datos):
            raise OverflowError("cola llena")
        # El módulo hace que la casilla liberada al frente se reutilice.
        posicion = (self.inicio + self.tamano) % len(self.datos)
        self.datos[posicion] = valor
        self.tamano += 1

    def dequeue(self) -> int:
        """Desencola el valor del frente; falla si la cola está vacía.

        Returns:
            El valor que llevaba más tiempo en la cola.

        Raises:
            IndexError: Si la cola está vacía.
        """
        if self.tamano == 0:
            raise IndexError("cola vacía")
        valor = self.datos[self.inicio]
        self.inicio = (self.inicio + 1) % len(self.datos)  # avanza y da vuelta
        self.tamano -= 1
        return valor


def probar_pila_y_cola() -> None:
    """Ejercita pila y cola, incluida la vuelta de la cola circular."""
    pila = Pila(3)
    for valor in (10, 20, 30):
        pila.push(valor)
    assert pila.pop() == 30 and pila.pop() == 20  # LIFO
    try:
        Pila(1).pop()
    except IndexError:
        print("pop en pila vacía: IndexError, como se esperaba")

    cola = Cola(4)
    for valor in (10, 20, 30, 40):
        cola.enqueue(valor)
    assert cola.dequeue() == 10 and cola.dequeue() == 20  # FIFO
    cola.enqueue(50)  # se escribe en la casilla 0, que quedó libre
    cola.enqueue(60)  # se escribe en la casilla 1
    print(cola.datos, cola.inicio, cola.tamano)  # [50, 60, 30, 40] 2 4
    try:
        cola.enqueue(70)
    except OverflowError:
        print("enqueue en cola llena: OverflowError, como se esperaba")
    assert [cola.dequeue() for _ in range(4)] == [30, 40, 50, 60]


probar_pila_y_cola()
```

Punto a resaltar: proyectar `[50, 60, 30, 40]` con `inicio = 2` y recorrer
con el dedo en el orden de salida: 30, 40, y luego **vuelve** a la casilla
0: 50, 60. Es la idea de la cola circular: el arreglo tiene un solo borde
físico, pero el módulo lo convierte en un anillo. Todas las operaciones de
pila y cola cuestan Θ(1). El precio: la capacidad es fija y, cuando se
agota, la estructura falla en lugar de crecer.

## Paso 7 — Lista simplemente enlazada

Enunciado breve: los exámenes con post-its. La clase `Nodo` es la de la
lección; `ListaEnlazada` agrega la cabeza, una referencia a la cola (último
nodo) y las operaciones básicas. La referencia a la cola es una decisión de
diseño: sin ella `insertar_al_final` costaría Θ(n).

```python
class Nodo:
    """Nodo de una lista enlazada simple."""

    def __init__(self, valor: int, siguiente: "Nodo | None" = None) -> None:
        """Crea un nodo.

        Args:
            valor: Dato que guarda el nodo.
            siguiente: Nodo al que apunta, o None si es el último.
        """
        self.valor = valor
        self.siguiente = siguiente


class ListaEnlazada:
    """Lista simplemente enlazada de enteros con cabeza y cola."""

    def __init__(self) -> None:
        """Crea una lista vacía."""
        self.cabeza: Nodo | None = None
        self.cola: Nodo | None = None
        self.tamano: int = 0

    def insertar_al_inicio(self, valor: int) -> None:
        """Inserta un valor antes de la cabeza en Θ(1).

        Args:
            valor: Valor a insertar.
        """
        self.cabeza = Nodo(valor, self.cabeza)  # el nuevo apunta a la vieja cabeza
        if self.cola is None:
            self.cola = self.cabeza  # lista que estaba vacía: un solo nodo
        self.tamano += 1

    def insertar_al_final(self, valor: int) -> None:
        """Inserta un valor después de la cola en Θ(1).

        Args:
            valor: Valor a insertar.
        """
        nuevo = Nodo(valor)
        if self.cola is None:
            self.cabeza = self.cola = nuevo
        else:
            self.cola.siguiente = nuevo  # el último apunta al nuevo
            self.cola = nuevo
        self.tamano += 1

    def buscar(self, valor: int) -> Nodo | None:
        """Busca un valor siguiendo los punteros desde la cabeza, Θ(n).

        Args:
            valor: Valor buscado.

        Returns:
            El primer nodo con ese valor, o None si no está.
        """
        actual = self.cabeza
        while actual is not None and actual.valor != valor:
            actual = actual.siguiente
        return actual

    def eliminar(self, valor: int) -> bool:
        """Elimina la primera aparición de un valor, Θ(n).

        Args:
            valor: Valor a eliminar.

        Returns:
            True si se eliminó un nodo; False si el valor no estaba.
        """
        anterior: Nodo | None = None
        actual = self.cabeza
        while actual is not None and actual.valor != valor:
            anterior = actual  # hay que recordar al antecesor: no hay marcha atrás
            actual = actual.siguiente
        if actual is None:
            return False
        if anterior is None:
            self.cabeza = actual.siguiente  # se borra la cabeza
        else:
            anterior.siguiente = actual.siguiente  # el antecesor salta al nodo
        if actual is self.cola:
            self.cola = anterior  # se borró el último: la cola retrocede
        self.tamano -= 1
        return True

    def a_lista(self) -> list[int]:
        """Recorre la lista de la cabeza a la cola.

        Returns:
            Los valores en el orden de la lista.
        """
        valores: list[int] = []
        actual = self.cabeza
        while actual is not None:
            valores.append(actual.valor)
            actual = actual.siguiente
        return valores


lista = ListaEnlazada()
for valor in (30, 20, 10):
    lista.insertar_al_inicio(valor)  # queda 10 -> 20 -> 30
lista.insertar_al_final(40)  # 10 -> 20 -> 30 -> 40
print(lista.a_lista(), lista.tamano)  # [10, 20, 30, 40] 4
assert lista.buscar(30) is not None and lista.buscar(99) is None
assert lista.eliminar(10) and lista.eliminar(40) and not lista.eliminar(99)
print(lista.a_lista(), lista.tamano)  # [20, 30] 2
lista.insertar_al_final(50)  # prueba de que la cola se actualizó
print(lista.a_lista())  # [20, 30, 50]
```

Punto a resaltar: dibujar en la pizarra los post-its y seguir `eliminar(40)`:
tiene que moverse la **cola**, no solo el puntero del antecesor; si no, el
`insertar_al_final(50)` posterior se engancharía a un nodo que ya no está en
la lista. Conectar con la tabla de la lección: acceso por posición Θ(n),
insertar al inicio Θ(1), buscar Θ(n). Una lista doble permitiría borrar un
nodo ya localizado en Θ(1) sin recordar al antecesor.

## Paso 8 — Experimento: el k-ésimo por selección contra el k-ésimo ordenando todo

Enunciado breve: se mide cuántas comparaciones cuesta hallar la mediana con
selección y cuántas con un ordenamiento completo. El ordenamiento es el
**merge sort** ya visto, con el mismo contador. Además se cronometra
`sorted()` de Python **solo como referencia de tiempo** (está escrito en C y
no se puede instrumentar, por eso no se compara por comparaciones).

```python
def ordenar_mezcla(valores: list[int], contador: Contador) -> list[int]:
    """Ordena por mezcla (merge sort) contando comparaciones.

    Args:
        valores: Lista a ordenar (no se modifica).
        contador: Acumula comparaciones.

    Returns:
        La lista ordenada de menor a mayor (si tiene 0 o 1 elementos,
        devuelve la misma lista recibida).
    """
    if len(valores) <= 1:
        return valores
    medio = len(valores) // 2
    izquierda = ordenar_mezcla(valores[:medio], contador)
    derecha = ordenar_mezcla(valores[medio:], contador)
    resultado: list[int] = []
    i = j = 0
    while i < len(izquierda) and j < len(derecha):
        contador.comparaciones += 1
        if izquierda[i] <= derecha[j]:
            resultado.append(izquierda[i])
            i += 1
        else:
            resultado.append(derecha[j])
            j += 1
    resultado.extend(izquierda[i:])
    resultado.extend(derecha[j:])
    return resultado


def medir(n: int, repeticiones: int = 9) -> dict[str, float]:
    """Mide selección y ordenamiento completo para hallar la mediana.

    Args:
        n: Tamaño de la entrada.
        repeticiones: Cuántas entradas aleatorias promediar (mediana).

    Returns:
        Comparaciones por método y tiempos en milisegundos, como medianas.
    """
    cmp_sel: list[int] = []
    cmp_mezcla: list[int] = []
    t_sel: list[float] = []
    t_mezcla: list[float] = []
    t_sorted: list[float] = []
    for _ in range(repeticiones):
        valores = generar(n)
        k = n // 2
        c_sel = Contador()
        t0 = time.perf_counter()
        a = seleccionar_tres_zonas(valores, k, c_sel)
        t_sel.append((time.perf_counter() - t0) * 1000)
        c_mezcla = Contador()
        t0 = time.perf_counter()
        b = ordenar_mezcla(valores, c_mezcla)[k]
        t_mezcla.append((time.perf_counter() - t0) * 1000)
        t0 = time.perf_counter()
        c = sorted(valores)[k]  # solo referencia de tiempo
        t_sorted.append((time.perf_counter() - t0) * 1000)
        assert a == b == c  # los tres métodos deben coincidir
        cmp_sel.append(c_sel.comparaciones)
        cmp_mezcla.append(c_mezcla.comparaciones)
    return {
        "n": float(n),
        "comparaciones_seleccion": statistics.median(cmp_sel),
        "comparaciones_mezcla": statistics.median(cmp_mezcla),
        "ms_seleccion": statistics.median(t_sel),
        "ms_mezcla": statistics.median(t_mezcla),
        "ms_sorted": statistics.median(t_sorted),
    }


tamanios = [1000, 2000, 4000, 8000, 16000, 32000]
resultados = [medir(n) for n in tamanios]
print("n, cmp selección, cmp merge sort, ms sel, ms merge, ms sorted")
for r in resultados:
    print(
        int(r["n"]),
        int(r["comparaciones_seleccion"]),
        int(r["comparaciones_mezcla"]),
        round(r["ms_seleccion"], 2),
        round(r["ms_mezcla"], 2),
        round(r["ms_sorted"], 2),
    )
```

Punto a resaltar: las cifras exactas **cambian en cada ejecución** (hay azar y
el reloj varía); lo estable es la forma. Esperado: las comparaciones de
selección crecen aproximadamente al doble cuando `n` se duplica (lineal),
las de merge sort un poco más del doble (`n log n`), y la brecha entre ambas
se abre con `n`. `sorted()` es rápido en tiempo real aunque haga
`n log n` comparaciones, porque cada comparación en C es mucho más barata
que en Python; por eso la comparación honesta de *algoritmos* se hace por
comparaciones, no por segundos. Si hay tiempo, graficar:

```python
import os

import matplotlib.pyplot as plt


def graficar(resultados: list[dict[str, float]]) -> None:
    """Grafica comparaciones vs n para selección y merge sort.

    Args:
        resultados: Salida de medir() para varios tamaños.
    """
    ns = [r["n"] for r in resultados]
    plt.figure()
    plt.plot(
        ns, [r["comparaciones_seleccion"] for r in resultados],
        marker="o", label="Selección (tres zonas)",
    )
    plt.plot(
        ns, [r["comparaciones_mezcla"] for r in resultados],
        marker="s", label="Merge sort completo",
    )
    plt.title("Hallar la mediana: comparaciones vs n")
    plt.xlabel("Tamaño de la entrada (n)")
    plt.ylabel("Comparaciones")
    plt.legend()
    plt.grid(True)
    os.makedirs("graficas/semana-12", exist_ok=True)
    plt.savefig("graficas/semana-12/seleccion-vs-ordenamiento.png")


graficar(resultados)
```

Cierre del paso, **de vuelta al caso de telemedición**: con las mediciones del
mayor `n` se extrapola a los 1.850.000 registros de un día. Es una estimación
por escala, no una medición:

```python
ultimo = resultados[-1]
n_medido = ultimo["n"]
constante_sel = ultimo["comparaciones_seleccion"] / n_medido
constante_ord = ultimo["comparaciones_mezcla"] / (
    n_medido * math.log2(n_medido)
)

n_real = 1_850_000
estimado_sel = constante_sel * n_real
estimado_ord = constante_ord * n_real * math.log2(n_real)
print(f"log2(1.850.000) = {math.log2(n_real):.2f}")  # 20.82
print(f"selección ≈ {estimado_sel:,.0f} comparaciones")
print(f"ordenar todo ≈ {estimado_ord:,.0f} comparaciones")
print(f"ordenar cuesta ≈ {estimado_ord / estimado_sel:.1f} veces más")
```

Qué concluir en voz alta: para la mediana, la selección de tres zonas gasta
del orden de 4 a 5 comparaciones por elemento (el contador suma hasta dos por
elemento en cada ronda) y merge sort gasta cerca de 0,9 veces `n` por
`log2 n`, que para 1.850.000 es unos 20,8. En la corrida de referencia la
extrapolación dio ordenar todo unas 4 veces más caro que seleccionar la
mediana. Es menos que el «unas 10 veces» de la lección porque aquel era un
cálculo de órdenes de magnitud con constante 1; la constante real de la
selección recorta la ventaja. Para las 500 lecturas de mayor consumo la
posición buscada está en un extremo y la selección sale más barata que con la
mediana: medida sobre 1.850.000 valores aleatorios, en 6 corridas gastó entre
2,4 y 9,7 millones de comparaciones según el azar, contra unos 35 millones de
ordenar todo; con la pasada final de filtrado (1,85 millones más), seleccionar
quedó entre 3 y 8 veces más barato. La conclusión no depende de la cifra
exacta: el sistema **sí** se beneficia de seleccionar antes que ordenar, y la
brecha crece con `n` porque un costo lleva el factor `log2 n` y el otro no.
La gráfica de operaciones vs. `n` que el estudiante produce en otras
sesiones cuenta la misma historia: lo que importa es la forma de la curva.

## 👥 Reto en parejas — Las 500 lecturas de mayor consumo

**Tiempo sugerido:** 20 min. En virtual: salas de dos; cada pareja comparte
pantalla y trabaja en un solo archivo. **Roles:** *driver* escribe;
*navigator* dirige y revisa; cambian de rol a la mitad.

**Enunciado:** el sistema de telemedición consolida 1.850.000 lecturas
diarias y necesita las `k = 500` de mayor consumo, **sin importar su orden**.
Escriban `mayores_k(consumos, k, contador)` que devuelva una lista con esos
`k` valores usando `seleccionar_tres_zonas` (nada de ordenar todo). Pistas de
diseño, no de código: la selección da un valor umbral; ¿qué hacer con los
valores que son *iguales* al umbral cuando hay más de los que caben?
Verifiquen con `sorted()` solo como prueba, sobre una entrada con muchos
repetidos.

**Solución completa:**

```python
def mayores_k(consumos: list[int], k: int, contador: Contador) -> list[int]:
    """Devuelve los k valores más grandes, sin garantizar su orden.

    Args:
        consumos: Lecturas de consumo (no vacía).
        k: Cuántos valores devolver, con 1 <= k <= len(consumos).
        contador: Acumula comparaciones.

    Returns:
        Una lista con k valores: los k mayores, con repetidos incluidos.
    """
    n = len(consumos)
    # El valor que ocuparía el puesto n - k deja k - 1 puestos por encima
    # de él (k contándolo a él).
    umbral = seleccionar_tres_zonas(consumos, n - k, contador)
    mayores = [x for x in consumos if x > umbral]  # estrictamente mayores
    # Son menos de k (a lo sumo k - 1). Los que faltan valen exactamente
    # el umbral: aquí es donde los repetidos importan.
    faltan = k - len(mayores)
    return mayores + [umbral] * faltan


# Prueba pequeña con muchos repetidos: el umbral aparece varias veces.
muestra = generar(5000, distintos=50)
obtenidas = mayores_k(muestra, 20, Contador())
assert sorted(obtenidas) == sorted(muestra)[-20:]
print(len(obtenidas), sorted(obtenidas)[:3])

# Escala real del caso (en Python puro tarda un instante, medio segundo o
# menos en una laptop actual; el tiempo depende del equipo).
consumos = generar(1_850_000)
c_real = Contador()
t0 = time.perf_counter()
top = mayores_k(consumos, 500, c_real)
print(len(top), f"{time.perf_counter() - t0:.1f} s", c_real.comparaciones)
```

Punto a resaltar: si la pareja descarta solo los `x > umbral` se queda con
menos de 500 valores cuando hay repetidos en el borde; si toma `x >= umbral`
se pasa. Por eso la última línea del diseño completa con `faltan` copias del
umbral. Debrief: la selección sola es lineal esperado; el filtrado final suma
una pasada más, `n` comparaciones adicionales; el total sigue siendo Θ(n).

## Preguntas socráticas

Para lanzar al grupo si se estanca:

1. **¿Por qué la referencia al azar resuelve el arreglo ordenado pero no el
   arreglo de todos iguales con la partición de Cormen?** Porque el azar
   rompe la relación entre el orden de la entrada y la referencia elegida, y
   en el arreglo de iguales no hay ninguna relación que romper: todas las
   referencias valen lo mismo. Lo que lo arregla es cambiar la partición
   (tres zonas), no el azar.
2. **¿Qué se ganó y qué se perdió al pasar de tres listas a partición en el
   sitio?** Se ganó la memoria extra (de Θ(n) por ronda a Θ(1) más la copia
   inicial) y se perdió simplicidad y facilidad de razonar con los repetidos.
3. **En la cola circular, ¿cómo se distingue «llena» de «vacía» si `inicio`
   puede coincidir con la posición de escritura en ambos casos?** Con el
   contador `tamano`: vacía es `tamano == 0`, llena es
   `tamano == capacidad`. Sin él habría que sacrificar una casilla.
4. **¿Por qué `eliminar` en una lista simple recorre dos referencias
   (`anterior` y `actual`)?** Porque desde un nodo solo se puede avanzar; para
   saltarse al que se borra hay que haber guardado a su antecesor.

## Práctica externa

Tres problemas reales para practicar en casa, uno por tema de la sesión:

- **LeetCode 215 — Kth Largest Element in an Array** (Medium):
  https://leetcode.com/problems/kth-largest-element-in-an-array/ . Es
  exactamente la selección de hoy. Intentar primero la versión de tres zonas
  y comparar con lo que se mide hoy; ojo, el problema pide el k-ésimo
  **mayor**, así que la posición equivalente es `n - k` desde 0.
- **LeetCode 622 — Design Circular Queue** (Medium):
  https://leetcode.com/problems/design-circular-queue/ . La cola circular
  del paso 6 con una interfaz de clase y sus casos de «llena» y «vacía».
- **LeetCode 206 — Reverse Linked List** (Easy):
  https://leetcode.com/problems/reverse-linked-list/ . Manipulación de
  punteros sobre la lista del paso 7.
