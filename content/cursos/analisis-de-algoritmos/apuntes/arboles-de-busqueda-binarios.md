> Sesión T (Semana 13, lunes 26 de octubre) — clase teórica dictada en vivo
> por el docente. Este apunte cubre solo la parte del árbol de búsqueda
> binario (BST); la parte de tablas hash tiene su propio apunte. Encadena con
> la lectura previa: el mismo tablero de carpetas colgantes, el `Nodo` con
> `clave`, `izquierdo` y `derecho`, `buscar` e `insertar` iterativos y
> `en_orden` recursivo. El borrado no se desarrolla (la lección lo omite).
> Todo el código sigue PEP 8 + type hints + docstring Google-style. Las cifras
> de los pasos 3 y 4 salen de ejecutar este mismo código con
> `random.seed(2026)` en Python 3.13; con otra semilla la altura exacta
> cambia, la tendencia no.

## Paso 1 — `Nodo`, `insertar` y `buscar` con contador de pasos

Enunciado breve: se reconstruye en vivo el tablero de la lectura previa, pero
cada operación devuelve también cuántas carpetas visitó. Ese contador es la
unidad de medida de toda la sesión: un paso es una comparación con una carpeta.

```python
class Nodo:
    """Carpeta del tablero: una clave y dos huecos para colgar otras."""

    def __init__(self, clave: int) -> None:
        """Crea un nodo hoja.

        Args:
            clave: Código de la carpeta.
        """
        self.clave = clave
        self.izquierdo: "Nodo | None" = None  # carpetas con código menor
        self.derecho: "Nodo | None" = None  # carpetas con código mayor


def buscar(raiz: "Nodo | None", clave: int) -> tuple["Nodo | None", int]:
    """Busca una clave bajando por el árbol y cuenta las carpetas visitadas.

    Args:
        raiz: Raíz del árbol (o None si está vacío).
        clave: Código que se busca.

    Returns:
        Una tupla (nodo, pasos): el nodo con esa clave (o None si no está) y
        el número de carpetas con las que se comparó.
    """
    actual = raiz
    pasos = 0
    while actual is not None:
        pasos += 1  # una carpeta visitada = un paso
        if clave == actual.clave:
            return actual, pasos
        # Se descarta todo un lado del tablero en cada comparación.
        actual = actual.izquierdo if clave < actual.clave else actual.derecho
    return None, pasos  # llegó a un hueco: la clave no está


def insertar(raiz: "Nodo | None", clave: int) -> tuple[Nodo, int]:
    """Inserta una clave (ignora las repetidas) y cuenta las carpetas visitadas.

    Args:
        raiz: Raíz del árbol (o None si está vacío).
        clave: Código de la carpeta nueva.

    Returns:
        Una tupla (raiz, pasos): la raíz del árbol y las comparaciones hechas.
    """
    nuevo = Nodo(clave)
    if raiz is None:
        return nuevo, 0  # árbol vacío: la primera carpeta es la raíz
    actual = raiz
    pasos = 0
    while True:
        pasos += 1
        if clave == actual.clave:
            return raiz, pasos  # repetida: no se cuelga nada
        if clave < actual.clave:
            if actual.izquierdo is None:  # hueco encontrado: se cuelga aquí
                actual.izquierdo = nuevo
                return raiz, pasos
            actual = actual.izquierdo
        else:
            if actual.derecho is None:
                actual.derecho = nuevo
                return raiz, pasos
            actual = actual.derecho


def construir(claves: list[int]) -> tuple["Nodo | None", int]:
    """Inserta las claves en el orden dado.

    Args:
        claves: Claves a insertar, en orden de llegada.

    Returns:
        Una tupla (raiz, pasos_totales) con todas las comparaciones hechas.
    """
    raiz: "Nodo | None" = None
    total = 0
    for clave in claves:
        raiz, pasos = insertar(raiz, clave)
        total += pasos
    return raiz, total


raiz, total = construir([40, 20, 60, 10, 30, 50, 70])
print(total)                 # 10 comparaciones para colgar las siete carpetas
print(buscar(raiz, 30)[1])   # 3: se visita 40, luego 20, luego 30
print(buscar(raiz, 55))      # (None, 3): visita 40, 60, 50 y cae en un hueco
```

**🐞 Error planeado:** al escribir `insertar`, el docente invierte la
comparación a propósito: `if clave > actual.clave:` va a la izquierda, y el
`else` va a la derecha. El resto del código queda igual y, para el grupo, "se
ve razonable".

**Síntoma:** se construye el árbol con `[40, 20, 60, 10, 30, 50, 70]` y se
llama a `en_orden` (paso 2): imprime `[70, 60, 50, 40, 30, 20, 10]`, de mayor a
menor. Y `buscar` falla: con la versión correcta de `buscar` solo encuentra el
40 (la raíz); las otras seis claves devuelven `None`.

**Pregunta al grupo:** "El árbol tiene las siete carpetas. ¿Por qué `buscar`
no encuentra el 20?" (Se lanza después de mostrar el síntoma.)

**Corrección:** `buscar` baja a la izquierda cuando `clave < actual.clave`,
pero `insertar` había colgado el 20 a la derecha del 40. Las dos funciones
tienen que obedecer la misma propiedad del BST (menores a la izquierda,
mayores a la derecha): un `insertar` que la viola deja un árbol que ninguna
búsqueda correcta puede recorrer. El bloque de arriba ya trae la comparación
correcta (`clave < actual.clave` va a la izquierda).

Punto a resaltar: el contador. Buscar el 30 cuesta 3 pasos en un árbol de 7
carpetas; buscar el 55, que no está, también cuesta 3 y termina en un hueco.
Ningún paso revisó un lado completo del tablero.

## 🗳️ Votación — contar pasos de una búsqueda

Cuándo: al terminar el paso 1, antes de pasar al recorrido.

Se insertan las claves `8, 3, 10, 1, 6, 14, 4`, en ese orden, en un BST
vacío. ¿Cuántas carpetas visita `buscar(raiz, 4)`, contando la raíz y la
carpeta 4?

- (a) 7: hay que revisar las siete carpetas.
- (b) 4: se visita 8, 3, 6 y 4.
- (c) 3: se bajan tres niveles.
- (d) 2: la 4 cuelga cerca de la raíz.

Correcta: (b)

Qué revela cada distractor: (a) → piensa en búsqueda lineal; no ve que cada
comparación descarta un lado. (c) → cuenta aristas (niveles bajados) en vez de
carpetas visitadas; confunde "altura de la 4" con "pasos del contador". (d) →
supone que las claves pequeñas quedan cerca de la raíz, sin dibujar el
árbol: el 4 cuelga a la derecha del 3 y luego a la izquierda del 6.

Dinámica: votan solos (encuesta o chat) → si hay entre 30 % y 70 % de
aciertos, discuten en parejas 2 min (en salas o por chat) y vuelven a votar;
si hay más de 70 %, explicas rápido y sigues; si hay menos de 30 %, dibujas el
árbol y vuelves a explicar antes de discutir.

## Paso 2 — `en_orden`: el tablero se lee ordenado

Enunciado breve: sin ordenar nada, recorrer el árbol de izquierda a derecha
entrega las claves ordenadas. Se verifica con un árbol de 1000 claves
aleatorias.

```python
import random


def en_orden(nodo: "Nodo | None", salida: list[int]) -> None:
    """Agrega a salida las claves del subárbol, de menor a mayor.

    Args:
        nodo: Raíz del subárbol (o None).
        salida: Lista donde se acumulan las claves.
    """
    if nodo is not None:
        en_orden(nodo.izquierdo, salida)  # primero todo lo menor
        salida.append(nodo.clave)         # luego la carpeta
        en_orden(nodo.derecho, salida)    # al final todo lo mayor


raiz, _ = construir([40, 20, 60, 10, 30, 50, 70])
lectura: list[int] = []
en_orden(raiz, lectura)
print(lectura)  # [10, 20, 30, 40, 50, 60, 70]

# Verificación con datos al azar: el recorrido debe coincidir con sorted().
random.seed(2026)
claves = random.sample(range(1, 10001), 1000)  # 1000 claves distintas
raiz, _ = construir(claves)
lectura = []
en_orden(raiz, lectura)
print(lectura == sorted(claves))  # True
```

Punto a resaltar: el recorrido cuesta Θ(n) (cada nodo se visita una vez) y la
lista sale ordenada porque la regla de colgado ya hizo el trabajo de
comparar. Si `insertar` violó la propiedad, esta comparación con `sorted`
lo delata de inmediato: es la prueba que habría atrapado el error del paso 1.

## Paso 3 — Altura y degeneración: azar contra orden

Enunciado breve: la lectura dice que buscar e insertar cuestan Θ(h). Se mide
`h` con las mismas claves en dos órdenes de llegada: al azar y ya ordenadas,
como llega el archivo de consolidación por cuenta. La altura se calcula por
niveles, sin recursión, porque un árbol degenerado de miles de niveles
rompería una versión recursiva.

```python
import math


def altura(raiz: "Nodo | None") -> int:
    """Calcula la altura bajando nivel por nivel, sin recursión.

    Args:
        raiz: Raíz del árbol (o None si está vacío).

    Returns:
        Niveles entre la raíz y la hoja más profunda; -1 si el árbol es vacío.
    """
    if raiz is None:
        return -1
    nivel_actual = [raiz]
    h = -1
    while nivel_actual:
        h += 1  # cada vuelta recorre un nivel completo
        siguiente: list[Nodo] = []
        for nodo in nivel_actual:
            if nodo.izquierdo is not None:
                siguiente.append(nodo.izquierdo)
            if nodo.derecho is not None:
                siguiente.append(nodo.derecho)
        nivel_actual = siguiente
    return h


print(f"{'n':>5} {'h azar':>7} {'h ordenado':>11} {'log2 n':>7}"
      f" {'pasos azar':>11} {'pasos ordenado':>15}")
for n in (7, 100, 500, 900):
    random.seed(2026)
    claves = random.sample(range(1, 10 * n), n)  # n claves distintas
    arbol_azar, pasos_azar = construir(claves)
    arbol_fila, pasos_fila = construir(sorted(claves))  # mismas claves, ordenadas
    print(f"{n:>5} {altura(arbol_azar):>7} {altura(arbol_fila):>11}"
          f" {math.log2(n):>7.2f} {pasos_azar:>11} {pasos_fila:>15}")
```

Salida esperada (verificada ejecutando el código):

```text
    n  h azar  h ordenado  log2 n  pasos azar  pasos ordenado
    7       3           6    2.81          12              21
  100      13          99    6.64         708            4950
  500      18         499    8.97        4772          124750
  900      23         899    9.81        9724          404550
```

Punto a resaltar:

- Con claves ordenadas, `h = n - 1` exacto (6, 99, 499, 899) y los pasos
  totales son `n(n - 1)/2` (por ejemplo, 900 · 899 / 2 = 404.550): el árbol
  es una fila y construirlo es Θ(n²).
- Con claves al azar, `h` queda por encima de `log2 n` (23 frente a 9,81 para
  n = 900) pero crece como un múltiplo pequeño de él, nada parecido a `n`: 13
  frente a 6,64 con n = 100 y 23 frente a 9,81 con n = 900. Con n = 900 son 9724 pasos
  contra 404.550.
- Misma entrada, mismas claves: lo único que cambió fue el orden de llegada.
  Eso es lo que la lección llama "la forma depende del orden". Enlazar con el
  archivo de 1.850.000 cuentas que llega ordenado.

**🐞 Error planeado:** el docente prueba primero `en_orden` (recursivo,
del paso 2) sobre el árbol degenerado de 1500 claves ordenadas, en lugar de
`altura`, y anuncia que "es solo otro árbol".

```python
fila, _ = construir(list(range(1, 1501)))  # 1500 claves ya ordenadas
lectura = []
en_orden(fila, lectura)
```

**Síntoma:** `RecursionError: maximum recursion depth exceeded`. El mismo
código que ordenó 1000 claves al azar sin problema se cae con 1500 claves en
fila.

**Pregunta al grupo:** "Es el mismo `en_orden` y el mismo número de claves
del orden de magnitud anterior. ¿Qué cambió?"

**Corrección:** la recursión de `en_orden` llega a tantos niveles como la
altura del árbol, y la altura de esta fila es 1499, por encima del límite por
defecto de Python (alrededor de 1.000 llamadas). El árbol de 1000 claves
aleatorias tenía altura 23. Por eso `buscar`, `insertar` y `altura` son
iterativos: su consumo de pila no depende de la forma del árbol. Se
resuelve evitando la degeneración (árboles balanceados), no subiendo el
límite de recursión.

## 🗳️ Votación — qué se descarta al podar

Cuándo: al cerrar el paso 3, antes de lanzar el paso 4. (Es una votación de
predicción: el grupo adelanta lo que el paso 4 va a mostrar.)

Con el árbol de la lectura (raíz 40; 20 y 60 como hijos; 10, 30, 50 y 70 como
hojas), se quieren todas las claves entre 45 y 65, inclusive, sin recorrer el
árbol completo. ¿Cuántas carpetas hay que visitar como mínimo para estar
seguros del resultado?

- (a) 7: no se puede evitar mirar todas.
- (b) 4: se visita 40, 60, 50 y 70.
- (c) 3: solo 50, 60 y las que caen dentro del rango.
- (d) 2: solo las dos claves del rango.

Correcta: (b)

Qué revela cada distractor: (a) → no cree que la propiedad del BST sirva para
rangos (piensa en una tabla hash, que no ordena). (c) → olvida que para
saber que el 70 queda fuera hay que verlo, y también el 40; confunde
"carpetas que se devuelven" con "carpetas que se visitan". (d) → cree que la
poda es perfecta; para saber qué subárbol descartar hay que visitar la
carpeta que lo separa.

Dinámica: votan solos (encuesta o chat) → entre 30 % y 70 % de aciertos,
parejas 2 min y se vota de nuevo; más de 70 %, explicas rápido; menos de 30 %,
dibujas el árbol y marcas las carpetas visitadas antes de discutir.

## Paso 4 — Rangos con poda frente a recorrer todo

Enunciado breve: "todas las claves entre `a` y `b`". La propiedad del BST
permite saltarse subárboles enteros: si la carpeta actual ya es menor o igual
que `a`, nada de su izquierda puede estar en el rango; si es mayor o igual
que `b`, nada de su derecha puede estarlo. Se mide cuántas carpetas se
visitan frente a recorrer todo con `en_orden`.

```python
def rango(
    nodo: "Nodo | None", a: int, b: int
) -> tuple[list[int], int]:
    """Lista las claves entre a y b (inclusive) podando subárboles.

    Args:
        nodo: Raíz del subárbol (o None).
        a: Cota inferior del rango (inclusive).
        b: Cota superior del rango (inclusive).

    Returns:
        Una tupla (claves, visitados): las claves halladas, de menor a mayor,
        y cuántas carpetas se visitaron.
    """
    if nodo is None:
        return [], 0
    izquierda: list[int] = []
    derecha: list[int] = []
    visitados = 1  # esta carpeta cuenta aunque su clave no esté en el rango
    if a < nodo.clave:  # solo si hay algo útil a la izquierda
        izquierda, v = rango(nodo.izquierdo, a, b)
        visitados += v
    propia = [nodo.clave] if a <= nodo.clave <= b else []
    if nodo.clave < b:  # solo si hay algo útil a la derecha
        derecha, v = rango(nodo.derecho, a, b)
        visitados += v
    return izquierda + propia + derecha, visitados


# Árbol pequeño de la lectura: la misma consulta de la votación.
pequeno, _ = construir([40, 20, 60, 10, 30, 50, 70])
print(rango(pequeno, 45, 65))  # ([50, 60], 4): 4 carpetas de 7

# Árbol grande: 1000 claves al azar, rango estrecho.
random.seed(2026)
claves = random.sample(range(1, 10001), 1000)
grande, _ = construir(claves)
poda, visitados = rango(grande, 4000, 4100)
print(len(poda), visitados)  # 7 16
print(poda == sorted(c for c in claves if 4000 <= c <= 4100))  # True

# Sin poda: recorrer todo y filtrar visita las 1000 carpetas.
todas: list[int] = []
en_orden(grande, todas)
sin_poda = [c for c in todas if 4000 <= c <= 4100]
print(sin_poda == poda, len(todas))  # True 1000
```

Punto a resaltar: la misma respuesta (7 claves) con 16 carpetas visitadas
frente a 1000. El costo de la poda es Θ(h + k), con `h` la altura (23 en este
árbol) y `k` las claves devueltas (7), tal como dice la lectura. Una tabla
hash no puede hacer esto: no conserva el orden, así que un rango obligaría a
mirar todo. Y la consulta depende de `h`: en el árbol degenerado de 1000
claves, la poda también sirve, pero el camino hasta el rango tiene 1000
niveles de longitud.

## 👥 Reto en parejas — contar lecturas en un rango

Tiempo sugerido: 15 min. Roles: *driver* escribe, *navigator* dirige y
verifica con el dibujo; cambian a mitad del tiempo. En salas virtuales, el
*driver* comparte pantalla.

Enunciado: el sistema de consolidación tiene un BST con los códigos de cuenta
`[4417, 2300, 5100, 1200, 3100, 4800, 6000, 2900, 3500]`, insertados en ese
orden. Escriban `contar_rango(nodo, a, b)`, que devuelva cuántas cuentas
tienen un código entre `a` y `b` (inclusive) **y también cuántas carpetas
visitó**, sin recorrer el árbol completo. Antes de ejecutar, dibujen el árbol
y predigan el resultado para el rango `[3000, 4800]`.

Solución completa:

```python
def contar_rango(nodo: "Nodo | None", a: int, b: int) -> tuple[int, int]:
    """Cuenta las claves entre a y b (inclusive) y las carpetas visitadas.

    Args:
        nodo: Raíz del subárbol (o None).
        a: Cota inferior del rango (inclusive).
        b: Cota superior del rango (inclusive).

    Returns:
        Una tupla (cuantas, visitados).
    """
    if nodo is None:
        return 0, 0
    cuantas = 0
    visitados = 1  # visitar la carpeta cuesta un paso, entre o no en el rango
    if a < nodo.clave:  # si nodo.clave <= a, la izquierda es toda menor que a
        c, v = contar_rango(nodo.izquierdo, a, b)
        cuantas += c
        visitados += v
    if a <= nodo.clave <= b:
        cuantas += 1
    if nodo.clave < b:  # si nodo.clave >= b, la derecha es toda mayor que b
        c, v = contar_rango(nodo.derecho, a, b)
        cuantas += c
        visitados += v
    return cuantas, visitados


lecturas = [4417, 2300, 5100, 1200, 3100, 4800, 6000, 2900, 3500]
cuentas, _ = construir(lecturas)
print(contar_rango(cuentas, 3000, 4800))  # (4, 7)
print(altura(cuentas))                    # 3
```

Verificación a mano: las claves en `[3000, 4800]` son 3100, 3500, 4417 y 4800
(4 cuentas). Se visitan 7 de las 9 carpetas: 4417, 2300, 3100, 2900, 3500,
5100 y 4800. Quedan fuera sin visitar el 1200 (hijo izquierdo del 2300, que ya
es menor que 3000) y el 6000 (hijo derecho del 5100, mayor que 4800).

Cierre del reto: pidan que comparen su predicción con `(4, 7)`. Si la
diferencia fue la carpeta 2300 o la 5100, es la misma pregunta de la votación:
hay que visitar la carpeta frontera para saber que su otro lado sobra.

## Práctica externa

Tres problemas de LeetCode para consolidar el BST. Los tres se verificaron
consultando la API pública de LeetCode (GraphQL, por *slug*): número, título y
dificultad coinciden con lo indicado. Las páginas devuelven 403 a
herramientas automáticas, así que el contenido del enunciado no se leyó; abre
los enlaces desde el navegador.

- [LeetCode 700 — Search in a Binary Search Tree](https://leetcode.com/problems/search-in-a-binary-search-tree/)
  (Easy). Es el `buscar` del paso 1; sirve de calentamiento y para decidir
  entre versión iterativa y recursiva.
- [LeetCode 701 — Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/)
  (Medium). Es el `insertar` del paso 1, con la salvedad de que el árbol no
  tiene claves repetidas.
- [LeetCode 98 — Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
  (Medium). La trampa clásica: comparar solo un nodo con sus hijos no basta;
  la propiedad vale para todo el subárbol. Sirve para ver por qué la verificación
  con `en_orden` y `sorted` del paso 2 sí funciona.

## Nota opcional para el docente — borrado (fuera de la sesión)

No se desarrolla ni se evalúa en esta sesión. Si alguien lo pregunta, el
esquema son tres casos según los hijos del nodo a borrar:

- **Sin hijos (hoja):** se descuelga; el padre apunta a `None`.
- **Un hijo:** el padre apunta directamente al hijo del nodo borrado.
- **Dos hijos:** se reemplaza la clave por la de su sucesor (el mínimo del
  subárbol derecho, es decir, la siguiente clave en el recorrido en orden) y
  se borra el sucesor, que tiene a lo sumo un hijo.

El costo es Θ(h), igual que buscar e insertar.

## Preguntas socráticas

- **"Si insertamos las mismas claves en otro orden, ¿cambia el árbol? ¿Y el
  resultado de `en_orden`?"** Sí cambia la forma y la altura; `en_orden` no
  cambia, siempre sale la lista ordenada. Es la diferencia entre forma y
  contenido.
- **"El archivo de consolidación llega ordenado por cuenta. ¿Qué haríamos
  antes de insertarlo en un BST?"** Mezclar el orden de llegada (aunque solo
  baja la probabilidad de degenerar, no la elimina) o usar un árbol
  balanceado, que se reacomoda al insertar y garantiza Θ(log n).
- **"¿Por qué una tabla hash no resuelve el rango, si es más rápida para
  buscar?"** Porque no conserva el orden: las claves quedan dispersas por la
  función hash y un rango obliga a mirar todas.
