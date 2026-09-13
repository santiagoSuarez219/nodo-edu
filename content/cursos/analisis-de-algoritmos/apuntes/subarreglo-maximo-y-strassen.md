> Sesión T (Semana 7, Sesión 1) — clase teórica dictada en vivo por el
> docente, sin trabajo independiente asociado a este apunte. El guion sigue
> el mismo orden que la lección: primero el subarreglo máximo (fuerza bruta
> vs. divide y vencerás), después el segundo ejemplo de partición que no
> ahorra nada (multiplicación de matrices ingenua) y el truco de Strassen que
> sí lo hace. Cierra con una medición empírica en vivo del subarreglo máximo.
> Todo el código sigue PEP 8 + type hints + docstring Google-style (regla
> vigente desde la Semana 3 del curso).

## Paso 1 — Fuerza bruta: `suma_entre`

Enunciado breve: antes de justificar por qué hace falta divide y vencerás,
se proyecta la solución directa —probar todos los pares `(i, j)`— para que
el grupo la vea correr y sienta su lentitud en el paso 4.

```python
import matplotlib.pyplot as plt
import random


def suma_entre(variaciones: list[float], i: int, j: int) -> float:
    """Suma la variación acumulada entre los días i y j, inclusive.
 
    Args:
        variaciones: Variación diaria de consumo, una por día.
        i: Índice del día inicial del tramo.
        j: Índice del día final del tramo.
 
    Returns:
        La suma de variaciones[i..j].
    """
    return sum(variaciones[i:j + 1])
 
 
def subarreglo_maximo_fuerza_bruta(
    variaciones: list[float],
) -> tuple[int, int, float, int]:
    """Encuentra el subarreglo de mayor suma probando todos los pares (i, j).
 
    Referencia de comparación para la versión de divide y vencerás: es
    Θ(n²) porque para cada uno de los ~n²/2 pares hace una suma en O(1)
    amortizado si se acumula en el propio bucle (ver comentario abajo), o
    Θ(n³) si se recalcula suma_entre desde cero en cada par, como se dejó
    escrito en la lección para que el estudiante la complete y mida.
 
    Args:
        variaciones: Variación diaria de consumo de un medidor.
 
    Returns:
        Una tupla (mejor_inicio, mejor_fin, suma_maxima, operaciones) del tramo óptimo.
    """
    n = len(variaciones)
    mejor_inicio, mejor_fin = 0, 0
    suma_maxima = float("-inf")
    operaciones = 0
    for i in range(n):
        suma = 0.0
        operaciones += 1
        for j in range(i, n):
            suma += variaciones[j]  # acumula en vez de volver a sumar_entre(i, j)
            operaciones += 1
            if suma > suma_maxima:
                suma_maxima = suma
                mejor_inicio, mejor_fin = i, j
    return mejor_inicio, mejor_fin, suma_maxima, operaciones

def graficar_operaciones(tamanios: list[int], resultados: list[int]) -> None:
    """
    Grafica comparaciones vs n para cada tipo de entrada
    """
    plt.figure()
    plt.plot(tamanios, resultados)
    plt.title("Subarreglo maximo por fuerza bruta: operaciones vs n")
    plt.xlabel("Tamano de la entrada (n)")
    plt.ylabel("Numero de operaciones")
    plt.grid(True)
    plt.savefig("graficas/clase-3/prueba.png")

def generar_entradas(n: int) -> list[int]:
    """
    Genera una entrada de tamanio n con valores negativos y positivos

    Args:
        n: tamanio de la entrada
    
    Returns:
        Lista de datos
    """
    entrada = [random.randint(-100, 100) for _ in range(n)]
    random.shuffle(entrada)
    return entrada

if __name__ == "__main__":
    tamanios = [10,50,100,200,400,800]
    cantidad_operaciones = []
    for tamano in tamanios:
        _, _, _, operaciones = subarreglo_maximo_fuerza_bruta(generar_entradas(tamano))
        cantidad_operaciones.append(operaciones)
    graficar_operaciones(tamanios, cantidad_operaciones)
```

Punto a resaltar: la versión acumulada de arriba ya es Θ(n²) (evita volver a
sumar desde cero en cada par); mencionar que la variante "ingenua" que llama
a `suma_entre(variaciones, i, j)` dentro del doble bucle es Θ(n³) — vale la
pena mostrarla en pantalla una sola vez para que el grupo vea de dónde sale
el cubo, sin dejarla como la versión de referencia para medir.

## Paso 2 — Divide y vencerás: `suma_cruzada` y `subarreglo_maximo`

Enunciado breve: se resuelve el caso cruzado primero (es la parte nueva
frente a merge sort) y después se ensambla la función principal que combina
los tres casos (izquierdo, derecho, cruzado).

```python
def suma_cruzada(
    variaciones: list[float], inicio: int, medio: int, fin: int
) -> tuple[int, int, float]:
    """Encuentra el subarreglo máximo que cruza el punto medio.

    Args:
        variaciones: Variación diaria de consumo.
        inicio: Índice inicial del rango considerado.
        medio: Índice del punto de división.
        fin: Índice final del rango considerado (inclusive).

    Returns:
        Una tupla (mejor_izquierda, mejor_derecha, suma_maxima) con los
        límites del tramo cruzado y su ganancia acumulada.
    """
    suma = 0.0
    suma_maxima_izquierda = float("-inf")
    mejor_izquierda = medio
    # Barre desde el medio hacia la izquierda, guardando el mejor corte.
    for i in range(medio, inicio - 1, -1):
        suma += variaciones[i]
        if suma > suma_maxima_izquierda:
            suma_maxima_izquierda = suma
            mejor_izquierda = i

    suma = 0.0
    suma_maxima_derecha = float("-inf")
    mejor_derecha = medio + 1
    # Simétrico: desde medio + 1 hacia la derecha.
    for j in range(medio + 1, fin + 1):
        suma += variaciones[j]
        if suma > suma_maxima_derecha:
            suma_maxima_derecha = suma
            mejor_derecha = j

    # El tramo cruzado óptimo es la unión de los dos mejores cortes.
    return mejor_izquierda, mejor_derecha, suma_maxima_izquierda + suma_maxima_derecha


def subarreglo_maximo(
    variaciones: list[float], inicio: int, fin: int
) -> tuple[int, int, float]:
    """Encuentra el subarreglo de mayor ganancia acumulada por divide y vencerás.

    Args:
        variaciones: Variación diaria de consumo de un medidor.
        inicio: Índice inicial del rango a considerar (inclusive).
        fin: Índice final del rango a considerar (inclusive).

    Returns:
        Una tupla (mejor_inicio, mejor_fin, suma_maxima) del tramo óptimo
        dentro de variaciones[inicio..fin].
    """
    if inicio == fin:  # caso base: un solo día, el tramo es él mismo
        return inicio, fin, variaciones[inicio]

    medio = (inicio + fin) // 2
    izq_inicio, izq_fin, suma_izq = subarreglo_maximo(variaciones, inicio, medio)
    der_inicio, der_fin, suma_der = subarreglo_maximo(variaciones, medio + 1, fin)
    cruz_inicio, cruz_fin, suma_cruz = suma_cruzada(variaciones, inicio, medio, fin)

    # El máximo global es el mayor de los tres casos: izquierdo, derecho, cruzado.
    if suma_izq >= suma_der and suma_izq >= suma_cruz:
        return izq_inicio, izq_fin, suma_izq
    if suma_der >= suma_izq and suma_der >= suma_cruz:
        return der_inicio, der_fin, suma_der
    return cruz_inicio, cruz_fin, suma_cruz
```

Punto a resaltar: recorrer en pantalla, con el mismo ejemplo de 8 días de la
lección, la llamada `subarreglo_maximo(variaciones, medio + 1, fin)` sobre la
mitad derecha, para que el grupo vea que el tramo real (días 2-7) cruza esa
división y que sin `suma_cruzada` el algoritmo lo perdería.

## Paso 3 — Prueba de escritorio guiada y verificación en vivo

Enunciado breve: antes de correr una sola línea de código, trazar a mano en
el tablero (o en una diapositiva, casilla por casilla) toda la recursión
sobre `variaciones = [-3, 5, -2, 8, -6, 3, 9, -4]` (índices 0 a 7, días 1 a
8). El objetivo es que el grupo **prediga** el resultado antes de verlo
correr — la verificación con `assert` del final solo confirma lo que ya se
razonó en el tablero.

**Orden de la traza:** como la función combina `izquierda`, `derecha` y
`cruzado` *después* de que ambas llamadas recursivas regresan, se traza de
abajo hacia arriba: primero los casos base (arreglos de un solo día),
después se combinan de a pares hasta llegar a la llamada raíz.

**Nivel 3 — casos base** (`inicio == fin`, retorna el propio valor):

| Llamada | Retorna |
|---|---|
| `subarreglo_maximo(0,0)` | `(0, 0, -3)` |
| `subarreglo_maximo(1,1)` | `(1, 1, 5)` |
| `subarreglo_maximo(2,2)` | `(2, 2, -2)` |
| `subarreglo_maximo(3,3)` | `(3, 3, 8)` |
| `subarreglo_maximo(4,4)` | `(4, 4, -6)` |
| `subarreglo_maximo(5,5)` | `(5, 5, 3)` |
| `subarreglo_maximo(6,6)` | `(6, 6, 9)` |
| `subarreglo_maximo(7,7)` | `(7, 7, -4)` |

**Nivel 2 — combinar pares de casos base** (`medio` es el índice izquierdo
del par; el cruce entre dos elementos sueltos es simplemente su suma):

| Llamada | `medio` | Izquierda | Derecha | Cruzado (`suma_cruzada`) | Máximo → retorna |
|---|---|---|---|---|---|
| `subarreglo_maximo(0,1)` | 0 | `(0,0,-3)` | `(1,1,5)` | barrido izq. desde 0: mejor `-3`; barrido der. desde 1: mejor `5` → `(0,1,2)` | derecha gana → `(1,1,5)` |
| `subarreglo_maximo(2,3)` | 2 | `(2,2,-2)` | `(3,3,8)` | izq. `-2`, der. `8` → `(2,3,6)` | derecha gana → `(3,3,8)` |
| `subarreglo_maximo(4,5)` | 4 | `(4,4,-6)` | `(5,5,3)` | izq. `-6`, der. `3` → `(4,5,-3)` | derecha gana → `(5,5,3)` |
| `subarreglo_maximo(6,7)` | 6 | `(6,6,9)` | `(7,7,-4)` | izq. `9`, der. `-4` → `(6,7,5)` | **izquierda gana** → `(6,6,9)` |

Punto a resaltar en este nivel: en las tres primeras filas gana la derecha
por casualidad de los datos, no por regla general — usar la fila de
`(6,7)` para mostrar que también puede ganar la izquierda o el cruzado; aquí
todavía no gana el cruzado, eso pasa en el nivel siguiente.

**Nivel 1 — combinar los pares de a cuatro:**

- `subarreglo_maximo(0,3)`, `medio = 1`:
  - Izquierda = `subarreglo_maximo(0,1)` = `(1,1,5)`
  - Derecha = `subarreglo_maximo(2,3)` = `(3,3,8)`
  - Cruzado: barrido desde `medio=1` hacia `inicio=0` → en `i=1` suma `5`
    (mejor hasta ahora), en `i=0` suma `5-3=2` (no mejora) → mejor
    izquierda del cruce: `5`, en el índice `1`. Barrido desde `medio+1=2`
    hacia `fin=3` → en `j=2` suma `-2`, en `j=3` suma `-2+8=6` (mejora) →
    mejor derecha del cruce: `6`, en el índice `3`. Cruzado total:
    `5 + 6 = 11` → `(1, 3, 11)`.
  - Comparar `5` (izq.) vs. `8` (der.) vs. `11` (cruzado) → **gana el
    cruzado** → retorna `(1, 3, 11)` (días 2-4, suma `+11`).

- `subarreglo_maximo(4,7)`, `medio = 5`:
  - Izquierda = `subarreglo_maximo(4,5)` = `(5,5,3)`
  - Derecha = `subarreglo_maximo(6,7)` = `(6,6,9)`
  - Cruzado: barrido desde `medio=5` hacia `inicio=4` → en `i=5` suma `3`,
    en `i=4` suma `3-6=-3` (no mejora) → mejor izquierda del cruce: `3`, en
    el índice `5`. Barrido desde `medio+1=6` hacia `fin=7` → en `j=6` suma
    `9` (mejora), en `j=7` suma `9-4=5` (no mejora) → mejor derecha del
    cruce: `9`, en el índice `6`. Cruzado total: `3 + 9 = 12` →
    `(5, 6, 12)`.
  - Comparar `3` (izq.) vs. `9` (der.) vs. `12` (cruzado) → **gana el
    cruzado** → retorna `(5, 6, 12)` (días 6-7, suma `+12`).

**Nivel 0 — llamada raíz**, `subarreglo_maximo(0,7)`, `medio = 3`:

- Izquierda = `subarreglo_maximo(0,3)` = `(1, 3, 11)`
- Derecha = `subarreglo_maximo(4,7)` = `(5, 6, 12)`
- Cruzado: barrido desde `medio=3` hacia `inicio=0` → `i=3` suma `8`
  (mejora), `i=2` suma `8-2=6` (no mejora), `i=1` suma `6+5=11` (**mejora**,
  supera al `8` anterior), `i=0` suma `11-3=8` (no mejora) → mejor
  izquierda del cruce: `11`, en el índice `1`. Barrido desde `medio+1=4`
  hacia `fin=7` → `j=4` suma `-6`, `j=5` suma `-6+3=-3` (mejora), `j=6`
  suma `-3+9=6` (mejora), `j=7` suma `6-4=2` (no mejora) → mejor derecha
  del cruce: `6`, en el índice `6`. Cruzado total: `11 + 6 = 17` →
  `(1, 6, 17)`.
- Comparar `11` (izq.) vs. `12` (der.) vs. `17` (cruzado) → **gana el
  cruzado** → retorna **`(1, 6, 17)`: días 2 a 7, suma `+17`**.

Punto a resaltar (el más importante de la traza): en **los tres niveles con
más de un elemento**, gana el caso cruzado — es la evidencia visual, trazada
a mano, de por qué `suma_cruzada` no es un caso secundario sino el corazón
del algoritmo. Sin él, la recursión encontraría como mucho `(3,3,8)` (el
mejor caso izquierdo o derecho puro en algún nivel), muy por debajo del
`+17` real.

Con la traza ya hecha en el tablero, se corre el código para confirmar:

```python
variaciones = [-3, 5, -2, 8, -6, 3, 9, -4]  # días 1 a 8 (índices 0 a 7)

inicio, fin, suma_maxima = subarreglo_maximo(variaciones, 0, len(variaciones) - 1)
print(f"Tramo óptimo: días {inicio + 1} a {fin + 1}")  # +1 porque los días son 1-indexados
print(f"Ganancia acumulada: {suma_maxima}")

assert (inicio, fin, suma_maxima) == (1, 6, 17)  # días 2 a 7, suma +17
```

```python
import random
import time


def medir_tiempos(tamanos: list[int]) -> None:
    """Compara el tiempo de fuerza bruta y divide y vencerás por tamaño.

    Genera un arreglo aleatorio por cada tamaño en `tamanos` y mide, con
    time.perf_counter, cuánto tarda cada algoritmo en encontrar el
    subarreglo máximo. Pensado para proyectarse en clase: la salida por
    consola ya deja ver la brecha creciente sin necesidad de graficar.

    Args:
        tamanos: Tamaños de arreglo a probar, en orden creciente.
    """
    print(f"{'n':>8} | {'fuerza bruta (s)':>18} | {'divide y vencerás (s)':>22}")
    for n in tamanos:
        variaciones = [random.uniform(-10, 10) for _ in range(n)]

        inicio_reloj = time.perf_counter()
        subarreglo_maximo_fuerza_bruta(variaciones)
        tiempo_fb = time.perf_counter() - inicio_reloj

        inicio_reloj = time.perf_counter()
        subarreglo_maximo(variaciones, 0, n - 1)
        tiempo_dv = time.perf_counter() - inicio_reloj

        print(f"{n:>8} | {tiempo_fb:>18.4f} | {tiempo_dv:>22.4f}")


medir_tiempos([500, 1000, 2000, 4000, 8000])
```

Punto a resaltar: el `assert` es la verificación en vivo — si pasa sin
error, confirma que el algoritmo reproduce exactamente lo que el grupo
predijo en la traza del tablero, casilla por casilla, antes de ejecutar
nada.

## Paso 4 — Multiplicación de matrices 2×2: escolar, partición ingenua y Strassen

Enunciado breve: sin `numpy` (el curso no lo usa hasta más adelante), se
implementa una matriz como `list[list[float]]` y se programan las tres
variantes que la lección compara: el algoritmo escolar de tres bucles, y
Strassen con sus 7 multiplicaciones. Se usa 2×2 (el caso base de la
recursión) porque es el tamaño en el que las fórmulas de `M1..M7` se
verifican a mano sin perderse en índices.

```python
Matriz = list[list[float]]


def multiplicar_escolar(a: Matriz, b: Matriz) -> Matriz:
    """Multiplica dos matrices cuadradas con el algoritmo escolar Θ(n³).

    Args:
        a: Matriz izquierda, n x n.
        b: Matriz derecha, n x n.

    Returns:
        El producto a · b, como matriz n x n.
    """
    n = len(a) # Tamanio de la matriz
    c = [[0.0] * n for _ in range(n)] # Crea la matriz de ceros de nxn
    for i in range(n): # permite pasar de una columna a otras columnas
        for j in range(n): # calcula toda una fila de terminos
            for k in range(n):  # calcula un termino (una multiplicacion)
                c[i][j] += a[i][k] * b[k][j]
    return c


def sumar(a: Matriz, b: Matriz) -> Matriz:
    """Suma dos matrices del mismo tamaño, elemento a elemento."""
    n = len(a)
    return [[a[i][j] + b[i][j] for j in range(n)] for i in range(n)]


def restar(a: Matriz, b: Matriz) -> Matriz:
    """Resta dos matrices del mismo tamaño, elemento a elemento."""
    n = len(a)
    return [[a[i][j] - b[i][j] for j in range(n)] for i in range(n)]
```

### Deduciendo el cubo antes de mostrar el truco de Strassen

Enunciado breve: **antes** de introducir las 7 multiplicaciones de Strassen,
hay que dejar instalada la pregunta que las motiva: ¿cuántas multiplicaciones
escalares hace realmente `multiplicar_escolar`, y cómo crece ese número con
`n`? Se instrumenta la misma función para contarlas, se corre sobre tamaños
crecientes y se deja que el grupo **deduzca** el exponente 3 a partir de la
razón de crecimiento — no se anuncia, se mide.

```python
import random


def multiplicar_escolar_contada(a: Matriz, b: Matriz) -> tuple[Matriz, int]:
    """Multiplica dos matrices cuadradas y cuenta las multiplicaciones escalares.

    Idéntica a `multiplicar_escolar`, pero además devuelve cuántas
    multiplicaciones `a[i][k] * b[k][j]` se ejecutaron — la cifra que se usa
    para deducir empíricamente el orden de crecimiento del algoritmo.

    Args:
        a: Matriz izquierda, n x n.
        b: Matriz derecha, n x n.

    Returns:
        Una tupla (c, multiplicaciones) con el producto y el conteo.
    """
    n = len(a)
    c = [[0.0] * n for _ in range(n)]
    multiplicaciones = 0
    for i in range(n):
        for j in range(n):
            for k in range(n):
                c[i][j] += a[i][k] * b[k][j]
                multiplicaciones += 1
    return c, multiplicaciones


def generar_matriz(n: int) -> Matriz:
    """Genera una matriz n x n con valores aleatorios pequeños."""
    return [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)] # Genera una matriz de nxn con numeros entre -5 y 5 


def deducir_complejidad_multiplicacion(tamanos: list[int]) -> None:
    """Corre `multiplicar_escolar_contada` sobre tamaños crecientes y muestra
    la razón de crecimiento entre cada tamaño y el siguiente, para que el
    grupo deduzca el exponente antes de que se lo digamos.

    Args:
        tamanos: Tamaños de matriz a probar, cada uno el doble del anterior
            (p. ej. [2, 4, 8, 16, 32]) para que la razón de crecimiento sea
            directamente comparable con 2^3 = 8.
    """
    anterior = None
    print(f"{'n':>4} | {'multiplicaciones':>17} | {'razon vs. anterior':>19}")
    for n in tamanos:
        _, multiplicaciones = multiplicar_escolar(generar_matriz(n), generar_matriz(n))
        print(f"n = {n}, multiplicaciones = {multiplicaciones} ")


deducir_complejidad_multiplicacion([2, 4, 8, 16, 32])
```

Salida esperada (los conteos son exactos, `n³`, no aproximados — no hay
aleatoriedad en cuántas multiplicaciones se hacen, solo en los valores):

```text
   n | multiplicaciones | razon vs. anterior
   2 |                8 |                  -
   4 |               64 |               8.00
   8 |              512 |               8.00
  16 |             4096 |               8.00
  32 |            32768 |               8.00
```

Punto a resaltar (el más importante del paso, se resalta antes de seguir):
cada vez que `n` se duplica, las multiplicaciones se multiplican por
**8 = 2³** — esa razón constante de 8 es la evidencia empírica de que el
algoritmo escolar es `Θ(n³)`, sin necesidad de contar a mano los tres bucles
anidados (aunque contar los bucles da la misma conclusión: son exactamente
`n³` multiplicaciones, una por cada combinación de `i`, `j`, `k`). Y para
`n = 2` —el caso base con el que se trabaja el resto de la sección— el
conteo da exactamente **8 multiplicaciones**: es el número que Strassen va a
bajar a 7 en el siguiente bloque. Vale la pena dejar esa cifra escrita en el
tablero (`n=2 → 8 multiplicaciones`) antes de pasar a `strassen_2x2`, para
que la comparación "8 vs. 7" no aparezca de la nada.

```python
def strassen_2x2(a: Matriz, b: Matriz) -> Matriz:
    """Multiplica dos matrices 2x2 con las 7 multiplicaciones de Strassen.

    Args:
        a: Matriz izquierda 2x2 (cada submatriz es un escalar 1x1 en este
            caso base, por eso a11 = a[0][0], etc.).
        b: Matriz derecha 2x2.

    Returns:
        El producto a · b, como matriz 2x2.
    """
    a11, a12 = a[0][0], a[0][1]
    a21, a22 = a[1][0], a[1][1]
    b11, b12 = b[0][0], b[0][1]
    b21, b22 = b[1][0], b[1][1]

    # Las 7 multiplicaciones: una menos que las 8 de la partición ingenua.
    m1 = a11 * (b12 - b22)
    m2 = (a11 + a12) * b22
    m3 = (a21 + a22) * b11
    m4 = a22 * (b21 - b11)
    m5 = (a11 + a22) * (b11 + b22)
    m6 = (a12 - a22) * (b21 + b22)
    m7 = (a11 - a21) * (b11 + b12)

    # Reconstrucción de C con solo sumas y restas de m1..m7.
    c11 = m5 + m4 - m2 + m6
    c12 = m1 + m2
    c21 = m3 + m4
    c22 = m5 + m1 - m3 - m7

    return [[c11, c12], [c21, c22]]
```

Caso de prueba numérico, verificable a mano en el tablero mientras se
proyecta:

```python
a = [[2.0, 3.0], [4.0, 1.0]]  # [[fila1], [fila2]]
b = [[3.0, 2.0], [4.0, 5.0]]

# A · B a mano:
# C11 = 2*3 + 3*4 = 18    C12 = 2*2 + 3*5 = 19
# C21 = 4*3 + 1*4 = 16    C22 = 4*2 + 1*5 = 13
esperado = [[18.0, 19.0], [16.0, 13.0]]

assert multiplicar_escolar(a, b) == esperado
assert strassen_2x2(a, b) == esperado
```


### De 2×2 a cualquier tamaño: la versión recursiva

Enunciado breve: `strassen_2x2` es solo el caso base. Este bloque adicional
(fuera de las secciones de la lección, es material de profundización para
quien pregunte "¿y para matrices grandes?") muestra la recursión completa:
partir cada matriz en 4 bloques `n/2 × n/2`, aplicar las mismas 7
multiplicaciones **recursivamente** sobre esos bloques, y ensamblar el
resultado.

**Sobre matrices de tamaño impar o que no son potencia de 2:** la recursión
solo puede partir en dos mitades enteras si `n` es par. La solución estándar
(la misma que usa Cormen) es rellenar la matriz con ceros hasta la siguiente
potencia de 2, multiplicar, y recortar el resultado al tamaño original al
final — el relleno no cambia el producto porque multiplicar por columnas o
filas de ceros aporta cero al resultado.

```python
import random
import matplotlib.pyplot as plt
Matriz = list[list[float]]


def multiplicar_escolar(a: Matriz, b: Matriz) -> Matriz:
    """Multiplica dos matrices cuadradas con el algoritmo escolar Θ(n³).

    Args:
        a: Matriz izquierda, n x n.
        b: Matriz derecha, n x n.

    Returns:
        El producto a · b, como matriz n x n.
    """
    n = len(a) 
    c = [[0.0] * n for _ in range(n)] 
    # multiplicaciones = 0
    for i in range(n): 
        for j in range(n): 
            for k in range(n):
                c[i][j] += a[i][k] * b[k][j]
                # multplicaciones += 1
    # return c, multiplicaciones
    return c


def sumar(a: Matriz, b: Matriz) -> Matriz:
    """Suma dos matrices del mismo tamaño, elemento a elemento."""
    n = len(a)
    return [[a[i][j] + b[i][j] for j in range(n)] for i in range(n)]


def restar(a: Matriz, b: Matriz) -> Matriz:
    """Resta dos matrices del mismo tamaño, elemento a elemento."""
    n = len(a)
    return [[a[i][j] - b[i][j] for j in range(n)] for i in range(n)]


def generar_matriz(n: int) -> Matriz:
    """Genera una matriz n x n con valores aleatorios pequeños."""
    return [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)]


def deducir_complejidad_multiplicacion(tamanos: list[int]) -> None:
    """Corre `multiplicar_escolar_contada` sobre tamaños crecientes y muestra
    la razón de crecimiento entre cada tamaño y el siguiente, para que el
    grupo deduzca el exponente antes de que se lo digamos.

    Args:
        tamanos: Tamaños de matriz a probar, cada uno el doble del anterior
            (p. ej. [2, 4, 8, 16, 32]) para que la razón de crecimiento sea
            directamente comparable con 2^3 = 8.
    """
    for n in tamanos:
        _, multiplicaciones = multiplicar_escolar(generar_matriz(n), generar_matriz(n))
        print(f"n = {n}, multiplicaciones = {multiplicaciones} ")

def strassen_2x2(a: Matriz, b: Matriz) -> tuple[Matriz, int]:
    """Multiplica dos matrices 2x2 con las 7 multiplicaciones de Strassen."""
    a11, a12 = a[0][0], a[0][1]
    a21, a22 = a[1][0], a[1][1]
    b11, b12 = b[0][0], b[0][1]
    b21, b22 = b[1][0], b[1][1]

    m1 = a11 * (b12 - b22)
    m2 = (a11 + a12) * b22
    m3 = (a21 + a22) * b11
    m4 = a22 * (b21 - b11)
    m5 = (a11 + a22) * (b11 + b22)
    m6 = (a12 - a22) * (b21 + b22)
    m7 = (a11 - a21) * (b11 + b12)

    c11 = m5 + m4 - m2 + m6
    c12 = m1 + m2
    c21 = m3 + m4
    c22 = m5 + m1 - m3 - m7

    return [[c11, c12], [c21, c22]], 7


def dividir_en_bloques(a: Matriz) -> tuple[Matriz, Matriz, Matriz, Matriz]:
    """Parte una matriz n x n (n par) en sus 4 submatrices n/2 x n/2."""
    n = len(a)
    medio = n // 2
    a11 = [fila[:medio] for fila in a[:medio]]
    a12 = [fila[medio:] for fila in a[:medio]]
    a21 = [fila[:medio] for fila in a[medio:]]
    a22 = [fila[medio:] for fila in a[medio:]]
    return a11, a12, a21, a22

def unir_bloques(c11: Matriz, c12: Matriz, c21: Matriz, c22: Matriz) -> Matriz:
    """Reconstruye una matriz n x n a partir de sus 4 submatrices n/2 x n/2."""
    superior = [fila_izq + fila_der for fila_izq, fila_der in zip(c11, c12)]
    inferior = [fila_izq + fila_der for fila_izq, fila_der in zip(c21, c22)]
    return superior + inferior

def strassen(a: Matriz, b: Matriz, tamano_base: int = 2) -> tuple[Matriz, int]:
    """Multiplica dos matrices cuadradas de cualquier tamaño con Strassen,
    contando las multiplicaciones escalares realizadas en toda la recursión.
    """
    n = len(a)
    if n <= tamano_base:
        return strassen_2x2(a, b)

    a11, a12, a21, a22 = dividir_en_bloques(a)
    b11, b12, b21, b22 = dividir_en_bloques(b)

    m1, c1 = strassen(a11, restar(b12, b22), tamano_base)
    m2, c2 = strassen(sumar(a11, a12), b22, tamano_base)
    m3, c3 = strassen(sumar(a21, a22), b11, tamano_base)
    m4, c4 = strassen(a22, restar(b21, b11), tamano_base)
    m5, c5 = strassen(sumar(a11, a22), sumar(b11, b22), tamano_base)
    m6, c6 = strassen(restar(a12, a22), sumar(b21, b22), tamano_base)
    m7, c7 = strassen(restar(a11, a21), sumar(b11, b12), tamano_base)

    c11 = sumar(restar(sumar(m5, m4), m2), m6)
    c12 = sumar(m1, m2)
    c21 = sumar(m3, m4)
    c22 = restar(restar(sumar(m5, m1), m3), m7)

    multiplicaciones = c1 + c2 + c3 + c4 + c5 + c6 + c7
    return unir_bloques(c11, c12, c21, c22), multiplicaciones

def contar_multiplicaciones(algoritmo, tamanio: int) -> int:
    """
    Cuenta las multiplicaciones escalares que usa un algoritmo de
    multiplicacion de matrices sobre una entrada de un tamano dado.

    Args:
        algoritmo: funcion que recibe dos matrices n x n y devuelve una
            tupla (producto, multiplicaciones)
        tamanio: dimension n de las matrices cuadradas a multiplicar

    Returns:
        La cantidad de multiplicaciones escalares realizadas.
    """
    a = generar_matriz(tamanio)
    b = generar_matriz(tamanio)
    _, multiplicaciones = algoritmo(a, b)
    return multiplicaciones

def graficar_multiplicaciones(tamanios: list[int], resultados_escolar: list[int], resultados_strassen: list[int]) -> None:
    """
    Grafica cantidad de multiplicaciones vs n para cada algoritmo de
    multiplicacion de matrices.
    """
    plt.figure()
    plt.plot(tamanios, resultados_escolar, label="Multiplicacion escolar")
    plt.plot(tamanios, resultados_strassen, label="Strassen")
    plt.title("Multiplicacion escolar vs Strassen")
    plt.xlabel("Tamano de la matriz (n)")
    plt.ylabel("Cantidad de multiplicaciones")
    plt.legend()
    plt.grid(True)
    plt.savefig("graficas/clase-4/escolar-vs-strassen.png")

if __name__ == "__main__":
    # deducir_complejidad_multiplicacion([2, 4, 8, 16, 32])

    # a = [[2.0, 3.0], [4.0, 1.0]]  
    # b = [[3.0, 2.0], [4.0, 5.0]]

    # A · B a mano:
    # C11 = 2*3 + 3*4 = 18    C12 = 2*2 + 3*5 = 19
    # C21 = 4*3 + 1*4 = 16    C22 = 4*2 + 1*5 = 13
    # esperado = [[18.0, 19.0], [16.0, 13.0]]

    # assert multiplicar_escolar(a, b) == esperado
    # assert strassen_2x2(a, b) == esperado

    # for n in [1, 2, 3, 4, 5, 8, 9, 16]:
    #     a = [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)]
    #     b = [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)]
    #     esperado = multiplicar_escolar(a, b)
    #     obtenido = strassen(a, b)
    #     diferencia = max(
    #         abs(esperado[i][j] - obtenido[i][j]) for i in range(n) for j in range(n)
    #     )
    #     assert diferencia < 1e-9, f"strassen difiere de multiplicar_escolar para n={n}"

    # print("strassen coincide con multiplicar_escolar para n = 1..16, incluyendo n=3, 5, 9")

    a = [[random.randint(-5, 5) for _ in range(4)] for _ in range(4)]
    b = [[random.randint(-5, 5) for _ in range(4)] for _ in range(4)]
    esperado = multiplicar_escolar(a, b)
    obtenido = strassen(a, b)

    # Tamanios potencias de 2 para que Strassen no necesite relleno.
    # tamanios = [2, 4, 8, 16, 32, 64, 128, 256]
    # multiplicaciones_escolar = []
    # multiplicaciones_strassen = []

    # for n in tamanios:
    #     multiplicaciones_escolar.append(contar_multiplicaciones(multiplicar_escolar, n))

    # for n in tamanios:
    #     multiplicaciones_strassen.append(contar_multiplicaciones(strassen, n))

    # graficar_multiplicaciones(tamanios, multiplicaciones_escolar, multiplicaciones_strassen)

```

Caso de prueba: verificar contra `multiplicar_escolar` para varios tamaños,
incluyendo uno que **no** es potencia de 2 (para mostrar que el relleno
funciona):

```python
import random

random.seed(0)
for n in [1, 2, 3, 4, 5, 8, 9, 16]:
    a = [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)]
    b = [[random.uniform(-5, 5) for _ in range(n)] for _ in range(n)]
    esperado = multiplicar_escolar(a, b)
    obtenido = strassen(a, b)
    diferencia = max(
        abs(esperado[i][j] - obtenido[i][j]) for i in range(n) for j in range(n)
    )
    assert diferencia < 1e-9, f"strassen difiere de multiplicar_escolar para n={n}"

print("strassen coincide con multiplicar_escolar para n = 1..16, incluyendo n=3, 5, 9")
```

Punto a resaltar: `n = 3, 5, 9` no son potencias de 2 y aun así el resultado
es correcto — es la demostración en vivo de que Strassen **sí** sirve para
cualquier matriz cuadrada, no solo para tamaños "convenientes"; el precio es
el relleno con ceros (trabajo extra que no cambia el orden asintótico). Si
alguien pregunta por qué `tamano_base = 2` y no `1`: es una decisión
práctica — parar la recursión antes, en matrices más grandes que 1×1,
suele compensar mejor el overhead de las llamadas recursivas; el valor
óptimo depende de la máquina y se ajusta empíricamente, no hay una regla
fija.