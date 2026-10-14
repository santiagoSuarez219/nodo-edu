> Sesión dictada en vivo por el docente, no es trabajo independiente del
> estudiante: no hay guía de laboratorio. El estudiante ya leyó la lección
> "Operaciones vectorizadas y álgebra lineal básica" y respondió el
> cuestionario de cierre (aula invertida), así que la clase no la explica de
> nuevo: la **usa**. El hilo conductor es el mismo de la Semana 9: la hoja de
> cálculo de temperaturas, `temps` (4 estaciones por 7 días, con los mismos
> valores de la lección). En cada paso se vuelve a la pregunta "¿qué haría yo
> en la hoja?" (arrastrar la fórmula, sumar una columna, promediar) antes de
> escribir la línea de NumPy. Todo corre en Google Colab, sin terminal ni
> instalación. Cada paso corresponde a una sección de la lección, en el mismo
> orden. Los errores (`ValueError` de broadcasting y de `temps @ zonas`) se
> muestran **a propósito**: predecir antes de ejecutar y leer el mensaje
> completo es parte del guion. Al final hay preguntas socráticas y un reto de
> extensión opcional.

## Paso 1 — La fórmula que se arrastra

En la hoja se escribe `=A1*1.8+32` y se arrastra. Primero construir `temps`
(es la celda inicial de todo el cuaderno; las demás celdas la reutilizan) y
mostrar el camino largo, el del bucle:

```python
import numpy as np   # alias estandar: np

temps = np.array([
    [24.5, 25.1, 26.3, 27.0, 25.8, 24.9, 26.1],   # EST-01
    [29.4, 30.8, 31.5, 32.1, 30.2, 29.8, 31.0],   # EST-02
    [14.2, 13.8, 15.1, 14.6, 13.5, 14.9, 15.4],   # EST-03
    [33.0, 34.2, 35.1, 33.8, 32.6, 31.9, 34.5],   # EST-04
])   # cada lista interna es una FILA de la hoja (una estacion)

f_bucle = np.zeros((4, 7))             # hoja vacia del mismo tamano, para ir llenandola
for i in range(4):                     # i recorre las 4 filas (estaciones)
    for j in range(7):                 # j recorre las 7 columnas (dias)
        f_bucle[i, j] = temps[i, j] * 1.8 + 32   # la formula, celda por celda
print(f_bucle[0])                      # solo la fila de EST-01
```

```text
[76.1  77.18 79.34 80.6  78.44 76.82 78.98]
```

Ahora la versión que "arrastra la esquina":

```python
fahrenheit = temps * 1.8 + 32          # la formula completa, sin bucle
print(fahrenheit[0])                   # mismo resultado que el bucle
print(fahrenheit.shape)                # la forma se conserva: 4 filas x 7 columnas
print(np.allclose(f_bucle, fahrenheit))      # ¿el bucle y la version vectorizada coinciden?
```

```text
[76.1  77.18 79.34 80.6  78.44 76.82 78.98]
(4, 7)
True
```

Punto a resaltar: lo que importa en pantalla es cuatro líneas contra una, con
el mismo resultado. `np.allclose` compara decimales con tolerancia, porque dos
cálculos decimales casi nunca son idénticos bit a bit.

Ahora el contraste que la lección destaca, para que nadie lo pase por alto:

```python
print([1, 2] * 2)                      # lista de Python: REPITE la lista
print(np.array([1, 2]) * 2)            # arreglo de NumPy: multiplica CADA celda
```

```text
[1, 2, 1, 2]
[2 4]
```

Punto a resaltar: el mismo operador `*` hace dos cosas distintas según el
objeto. Con una lista es repetición; con un arreglo es aritmética celda por
celda. Pedir al grupo que prediga las dos salidas antes de ejecutar.

## Paso 2 — Operar celda por celda y reemplazar con máscaras

En la hoja: restar dos columnas, dividir una columna entre 2, marcar las
celdas que pasan de cierto valor. Partir de dos filas de siete días:

```python
a = temps[0]               # EST-01, 7 dias (shape (7,))
b = temps[1]               # EST-02, 7 dias (shape (7,))
print(b - a)               # diferencia dia por dia: misma posicion con misma posicion
print(temps[2] / 2)        # un numero se aplica a TODAS las celdas
print(temps[2] ** 2)       # cada temperatura de EST-03 al cuadrado
```

```text
[4.9 5.7 5.2 5.1 4.4 4.9 4.9]
[7.1  6.9  7.55 7.3  6.75 7.45 7.7 ]
[201.64 190.44 228.01 213.16 182.25 222.01 237.16]
```

Punto a resaltar: con otro arreglo del mismo `shape`, la operación empareja
las celdas que ocupan la misma posición (`b[0] - a[0]`, `b[1] - a[1]`, ...).
Preguntar: "¿qué pasaría si `b` tuviera cinco días y `a` siete?" y ejecutarlo:

```python
try:
    print(temps[0] + temps[2, :5])     # siete celdas contra cinco: no se pueden emparejar
except ValueError as e:                # try/except solo para que el cuaderno no se detenga
    print("ValueError:", e)
```

```text
ValueError: operands could not be broadcast together with shapes (7,) (5,)
```

Punto a resaltar: es el primer contacto con este mensaje, y vuelve en el
Paso 3. Leerlo en voz alta: "dos formas que no se pueden alinear".

Las comparaciones también son vectorizadas y devuelven una máscara:

```python
print(temps[0] > 26)                   # mascara de EST-01: True donde la celda pasa de 26
topada = temps.copy()                  # COPIA: temps queda intacta
topada[topada > 30] = 30               # donde la mascara es True, la celda vale 30
print(topada[3])                       # EST-04, que tenia todo por encima de 30
print(temps.max(), topada.max())       # el maximo original contra el recortado
```

```text
[False False  True  True False False  True]
[30. 30. 30. 30. 30. 30. 30.]
35.1 30.0
```

Punto a resaltar: es el "reemplazar todas las celdas que cumplen una
condición" de la hoja. Preguntar por qué se hizo `.copy()`: sin la copia,
`topada` y `temps` serían el mismo arreglo y se perderían las temperaturas
originales. Comprobar que `temps.max()` sigue en `35.1`.

## Paso 3 — Broadcasting: primero el caso feliz, luego el error

En la hoja: sumar a cada día un ajuste de calibración. Un ajuste por día son
siete valores (uno por columna):

```python
ajuste_dia = np.array([0.5, 0.5, 0.0, -0.5, 0.0, 0.5, 0.0])   # shape (7,): uno por dia
resultado = temps + ajuste_dia         # (4, 7) + (7,): el ajuste se "estira" sobre las 4 filas
print(resultado[0])                    # EST-01 con el ajuste aplicado
print(resultado.shape)                 # la forma es la de temps
```

```text
[25.  25.6 26.3 26.5 25.8 25.4 26.1]
(4, 7)
```

Punto a resaltar: se sumó una fila de 7 a una tabla de 4 por 7 sin ningún
bucle. Verificar a mano la primera celda: `24.5 + 0.5 = 25.0`.

Ahora el ajuste por estación, cuatro valores, uno por fila. **Pedir al grupo
que prediga:** "¿funciona igual?" Ejecutarlo:

```python
ajuste_est = np.array([1.0, -1.0, 0.5, 0.0])   # shape (4,): uno por estacion
try:
    temps + ajuste_est                 # (4, 7) + (4,)
except ValueError as e:
    print("ValueError:", e)
```

```text
ValueError: operands could not be broadcast together with shapes (4,7) (4,)
```

Pregunta al grupo: "¿Con cuál eje se está tratando de emparejar el 4?"
Dibujar en el tablero las dos formas una debajo de la otra, alineadas **por
la derecha**:

```text
temps       (4, 7)
ajuste_dia     (7,)   -> 7 con 7: coincide, se repite en las 4 filas
ajuste_est     (4,)   -> 4 con 7: no coincide, error
ajuste_est  (4, 1)    -> 1 con 7: el 1 se estira, 4 con 4: coincide
```

Corrección: NumPy alinea de derecha a izquierda, así que el 4 de
`ajuste_est` cae frente al 7 de los días. Para que sea una columna, hay que
darle forma de 4 filas y 1 columna:

```python
col = ajuste_est.reshape(4, 1)         # equivale a ajuste_est[:, np.newaxis]
print(col.shape)                       # (4, 1): 4 filas, 1 columna
print(col)                             # se ve como una columna de la hoja
con_ajuste = temps + col               # (4, 7) + (4, 1): la columna se estira sobre los 7 dias
print(con_ajuste[:, 0])                # el dia 0 de las 4 estaciones
print(con_ajuste.shape)
```

```text
(4, 1)
[[ 1. ]
 [-1. ]
 [ 0.5]
 [ 0. ]]
[25.5 28.4 14.7 33. ]
(4, 7)
```

Punto a resaltar: verificar el día 0: `24.5 + 1.0 = 25.5`, `29.4 - 1.0 = 28.4`,
`14.2 + 0.5 = 14.7`, `33.0 + 0.0 = 33.0`. Mostrar también la otra forma de
escribirlo, que el grupo verá en código ajeno:

```python
print(ajuste_est[:, np.newaxis].shape)   # newaxis agrega un eje de tamano 1 en esa posicion
```

```text
(4, 1)
```

Regla para decir en voz alta: en cada eje, los tamaños deben ser **iguales o
uno de ellos debe ser 1**; el que vale 1 se repite.

## Paso 4 — Funciones universales

Se aplican celda por celda, igual que los operadores. Ir una por una y pedir
la predicción de la forma del resultado antes de ejecutar:

```python
print(np.round(temps[0] / 3, 1))         # redondea cada celda a 1 decimal
desv = temps - temps.mean()              # desviacion de cada celda frente al promedio global
print(np.abs(desv[0]).round(2))          # valor absoluto de la desviacion, a 2 decimales
print(np.maximum(temps[2], 20))          # el mayor entre cada celda y 20
print(np.sqrt(temps[2]).round(2))        # raiz cuadrada de cada celda, a 2 decimales
```

```text
[8.2 8.4 8.8 9.  8.6 8.3 8.7]
[1.61 1.01 0.19 0.89 0.31 1.21 0.01]
[20. 20. 20. 20. 20. 20. 20.]
[3.77 3.71 3.89 3.82 3.67 3.86 3.92]
```

Punto a resaltar: `np.maximum` recibe **dos** entradas, y el `20` se estira
por broadcasting, igual que la columna del paso anterior; por eso toda la
fila de EST-03 (entre 13,5 y 15,4) queda en 20. Verificar a mano la primera
celda de la tercera línea: `max(14.2, 20) = 20`. Con dos arreglos del mismo
tamaño el comportamiento es celda con celda:

```python
print(np.maximum(temps[2], temps[3] - 20))   # temps[3] - 20 es otra fila de 7: se comparan celda con celda
```

```text
[14.2 14.2 15.1 14.6 13.5 14.9 15.4]
```

Punto a resaltar: `temps[3] - 20` vale `[13.  14.2 15.1 13.8 12.6 11.9 14.5]`.
Preguntar: "¿en qué día gana EST-04?" Respuesta: solo en el día 1, donde `14.2`
supera a `13.8`; por eso la salida trae `14.2` en esa posición. En el día 2 los
dos valores son `15.1` (en realidad el segundo es `15.100000000000001`, otro
ejemplo de que los decimales no siempre son exactos, y el resultado se ve
igual).

## Paso 5 — Estadística por eje y `keepdims`

En la hoja: el promedio de toda la tabla, el de cada columna, el de cada fila.
Primero los números globales:

```python
print(np.round(temps.mean(), 2), np.median(temps), temps.min(), temps.max(), temps.sum())
```

```text
26.11 28.2 13.5 35.1 731.1
```

Punto a resaltar: cinco resúmenes de las 28 celdas, cada uno es un solo
número. Ahora elegir la dirección con `axis`. Antes de ejecutar, escribir en
el tablero: "¿cuántos valores salen en cada caso?"

```python
print(np.round(temps.mean(axis=0), 2))   # axis=0: colapsa las filas -> un valor por DIA (7)
print(np.round(temps.mean(axis=1), 2))   # axis=1: colapsa las columnas -> un valor por ESTACION (4)
print(temps.max(axis=1))                 # maximo de cada estacion
print(temps.mean(axis=0).shape, temps.mean(axis=1).shape)   # las formas confirman el conteo
```

```text
[25.28 25.98 27.   26.88 25.52 25.38 26.75]
[25.67 30.69 14.5  33.59]
[27.  32.1 15.4 35.1]
(7,) (4,)
```

Punto a resaltar: el eje que se nombra es el que **desaparece**. `axis=0`
recorre las filas hacia abajo y deja una columna de resultados (7 valores);
`axis=1` recorre las columnas hacia la derecha y deja uno por fila (4
valores). Comprobar la primera cifra de `axis=1`: la suma de EST-01 es
`179.7`, y `179.7 / 7 = 25.67`.

Con una máscara se resume solo lo que cumple la condición:

```python
print(np.round(temps[temps > 30].mean(), 2))   # media solo de las temperaturas sobre 30
print(np.round(temps.std(), 2))                # desviacion estandar (divide entre n)
```

```text
32.56
7.33
```

Ahora el caso que hace necesario `keepdims`: restar a cada estación su propio
promedio. **Pedir al grupo que prediga**, después de lo visto en el Paso 3:

```python
try:
    temps - temps.mean(axis=1)           # (4, 7) - (4,): vuelve el error del Paso 3
except ValueError as e:
    print("ValueError:", e)
```

```text
ValueError: operands could not be broadcast together with shapes (4,7) (4,)
```

Pregunta al grupo: "¿Dónde ya vimos este mensaje y cómo lo arreglamos?"
Respuesta: es el `ajuste_est` del Paso 3, y se arregló convirtiendo el
vector en columna. Aquí no hace falta `reshape`:

```python
medias = temps.mean(axis=1, keepdims=True)   # el eje resumido se CONSERVA con tamano 1
print(medias.shape)                          # (4, 1): ya es una columna
centradas = temps - medias                   # (4, 7) - (4, 1): broadcasting
print(np.round(centradas[0], 2))             # EST-01 centrada en su propio promedio
```

```text
(4, 1)
[-1.17 -0.57  0.63  1.33  0.13 -0.77  0.43]
```

Punto a resaltar: `keepdims=True` evita escribir el `reshape(4, 1)` a mano.
Verificar a mano la primera celda: `24.5 - 25.67 = -1.17`. La fila centrada
debe sumar casi cero (el promedio de la fila ahora es 0), pero en decimales
puede salir un valor muy pequeño y no un cero exacto; por eso no se imprime
ese `sum()` sin redondear.

## Paso 6 — Vectores y producto punto

En la hoja: la fórmula del promedio ponderado, `=SUMAPRODUCTO(pesos; dia)`.
Una columna de `temps` es un vector con las cuatro estaciones de un día:

```python
pesos = np.array([0.4, 0.3, 0.2, 0.1])    # un peso por estacion (suman 1)
dia0 = temps[:, 0]                        # las 4 estaciones del dia 0
print(dia0)
print(pesos * dia0)                       # celda por celda: los cuatro terminos
print(np.round((pesos * dia0).sum(), 2))  # sumarlos a mano
print(np.round(pesos @ dia0, 2))          # producto punto: multiplicar y sumar en un paso
print(np.round(np.dot(pesos, dia0), 2))   # np.dot hace lo mismo con vectores
```

```text
[24.5 29.4 14.2 33. ]
[9.8  8.82 2.84 3.3 ]
24.76
24.76
24.76
```

Punto a resaltar: con `*` salen cuatro números (uno por estación); con `@`
sale **uno solo**. Escribir el cálculo a mano: `0.4*24.5 + 0.3*29.4 +
0.2*14.2 + 0.1*33.0 = 9.8 + 8.82 + 2.84 + 3.3 = 24.76`. Se redondea con
`np.round` porque la suma decimal puede dar `24.759999999999998`, y no hace
falta explicarlo más que como "los decimales no siempre son exactos".

Extender el mismo producto punto a los siete días a la vez:

```python
print(np.round(pesos @ temps, 2))         # (4,) @ (4, 7): el vector se multiplica con cada columna
print((pesos @ temps).shape)
```

```text
[24.76 25.46 26.5  26.73 25.34 25.07 26.27]
(7,)
```

Punto a resaltar: la primera celda, `24.76`, es la del producto punto de
arriba. Un vector de pesos por una tabla da un promedio ponderado **por día**.
Es la puerta de entrada al paso siguiente.

## Paso 7 — Producto matricial y la regla de las formas

En la hoja: agrupar las estaciones en dos zonas. La zona norte promedia
EST-01 y EST-02; la zona sur, EST-03 y EST-04. Cada fila de `zonas` es un
vector de pesos:

```python
zonas = np.array([[0.5, 0.5, 0.0, 0.0],      # norte: EST-01 y EST-02
                  [0.0, 0.0, 0.5, 0.5]])     # sur: EST-03 y EST-04
print(zonas.shape)                           # (2, 4)
por_zona = zonas @ temps                     # (2, 4) @ (4, 7) -> (2, 7)
print(por_zona.shape)
print(por_zona[:, 0])                        # dia 0, las dos zonas
print(np.round(por_zona, 2))                 # toda la tabla de zonas
```

```text
(2, 4)
(2, 7)
[26.95 23.6 ]
[[26.95 27.95 28.9  29.55 28.   27.35 28.55]
 [23.6  24.   25.1  24.2  23.05 23.4  24.95]]
```

Punto a resaltar: verificar `26.95` a mano: `0.5*24.5 + 0.5*29.4 =
12.25 + 14.7 = 26.95`. Cada celda de `zonas @ temps` es un producto punto
(el del Paso 6): una fila de `zonas` con una columna de `temps`. Comprobarlo
con el vector del paso anterior:

```python
print(np.round(zonas @ temps[:, 0], 2))      # (2, 4) @ (4,): las dos zonas del dia 0, igual que arriba
```

```text
[26.95 23.6 ]
```

Dibujar en el tablero la regla y pedir que la completen:

```text
(n, m) @ (m, p) = (n, p)

zonas (2, 4) @ temps (4, 7) = (2, 7)   -> el 4 con 4 coincide
temps (4, 7) @ zonas (2, 4)            -> el 7 con 2 no coincide, error
```

**Pedir al grupo que prediga** si `temps @ zonas` funciona, y por qué:

```python
try:
    temps @ zonas                            # (4, 7) @ (2, 4): el eje interno es 7 contra 2
except ValueError as e:
    print("ValueError:", e)
```

```text
ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 2 is different from 7)
```

Punto a resaltar: el mensaje es largo e intimidante, pero la última parte lo
dice todo: `size 2 is different from 7`. La multiplicación matricial **no es
conmutativa**: `zonas @ temps` existe y `temps @ zonas` no. Contrastar con
el error de broadcasting del Paso 3: aquel hablaba de `broadcast`, este de
`matmul`, y son reglas distintas (en `@` el eje interno debe ser **igual**;
no hay "estirar el 1").

## Preguntas socráticas

Para lanzar al grupo si se estanca, con la respuesta esperada:

- **"¿Por qué `temps * 1.8 + 32` es una sola línea y no necesita un `for`?
  ¿Quién hace el recorrido?"** Esperada: el recorrido sigue existiendo, pero
  ocurre dentro de NumPy, en código compilado; nosotros solo describimos la
  fórmula de una celda y NumPy la repite en las 28.
- **"`np.array([1, 2]) * 2` y `[1, 2] * 2` se escriben casi igual. ¿Qué
  diferencia hay y por qué importa en un programa científico?"** Esperada: la
  lista se repite, el arreglo multiplica cada celda; confundirlas produce
  resultados incorrectos sin ningún error visible.
- **"`temps + ajuste_dia` funciona y `temps + ajuste_est` no. Sin ejecutar,
  ¿qué cambio mínimo haría que el segundo funcione?"** Esperada: darle forma
  de columna, `ajuste_est.reshape(4, 1)` o `ajuste_est[:, np.newaxis]`, para
  que el 1 se estire sobre los 7 días.
- **"Si `temps` fuera de forma `(7, 4)` (siete días por cuatro estaciones),
  ¿qué `axis` usaría para el promedio de cada estación y funcionaría
  `ajuste_est` tal cual?"** Esperada: `axis=0`, porque ahora las estaciones
  son columnas; y `temps + ajuste_est` sí funcionaría, porque `(4,)` se
  alinea con el último eje, que vale 4.
- **"¿Qué devuelve `pesos @ pesos` y qué significa?"** Esperada: un único
  número, la suma de los cuadrados de los pesos (`0.16 + 0.09 + 0.04 + 0.01 =
  0.3`); es un producto punto de un vector consigo mismo. Ejecutarlo en vivo:
  sin redondear imprime `0.30000000000000004`, y con `np.round(pesos @ pesos,
  2)` imprime `0.3`.
- **"¿Por qué `zonas @ temps` y `temps @ zonas` no son lo mismo, si ambos
  usan los mismos números?"** Esperada: porque el orden decide qué eje queda
  "al medio" y debe coincidir: en `zonas @ temps` ese eje es el de las 4
  estaciones; en `temps @ zonas` sería 7 contra 2, y no se puede.

## 🚀 Reto de extensión (opcional, para quien termine antes)

Solo para quien ya domine los pasos anteriores; no se evalúa ni se exige.
La Semana 9 prometió comparar tiempos; ahora que ya hay operaciones, se
puede medir la **fórmula arrastrada** del Paso 1 sobre un millón de
temperaturas, con lista de Python y con arreglo, usando `%timeit` de Colab
(un `%timeit` por celda; la línea debe ir sola en la primera línea de la
celda):

```python
import numpy as np

grados = np.linspace(10, 40, 1_000_000)   # un millon de temperaturas entre 10 y 40 C (arreglo)
lista = grados.tolist()                   # los mismos valores, como lista de Python
print(len(lista), grados.shape)           # confirmar el tamano de las dos versiones
```

```text
1000000 (1000000,)
```

```python
%timeit [c * 1.8 + 32 for c in lista]     # la formula con un bucle (comprension de lista)
```

```python
%timeit grados * 1.8 + 32                 # la misma formula vectorizada
```

Los tiempos dependen de la máquina de Colab y cambian en cada ejecución. Como
referencia, en una ejecución local con Python 3 y NumPy (no en Colab) se
midieron, en promedio, unos 23 ms para la lista y unos 0,5 ms para el arreglo:
decenas de veces menos. Tomarlo como orden de magnitud, no como una salida
exacta.

Antes de medir, comprobar que las dos versiones dan lo mismo:

```python
f_lista = [c * 1.8 + 32 for c in lista]
f_arreglo = grados * 1.8 + 32
print(np.allclose(f_lista, f_arreglo))    # compara con tolerancia: los decimales no son identicos bit a bit
print(f_arreglo[:3], f_arreglo[-1])       # primeros tres valores y el ultimo
```

```text
True
[50.       50.000054 50.000108] 104.0
```

Preguntas para el avanzado: ¿por qué gana el arreglo? (guarda valores del
mismo tipo, contiguos en memoria, y el recorrido ocurre en código compilado;
la lista guarda referencias a objetos separados y el bucle lo ejecuta
Python). Revisar `grados.nbytes`, que da `8000000` (8 bytes por `float64`).
Pedir que repita la medición con un arreglo de 10 elementos y comente qué
pasa con la ventaja cuando los datos son pocos.
