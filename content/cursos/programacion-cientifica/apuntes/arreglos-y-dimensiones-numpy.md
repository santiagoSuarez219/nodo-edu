> Sesión dictada en vivo por el docente, no es trabajo independiente del
> estudiante: no hay guía de laboratorio. El estudiante ya leyó la lección
> "Arreglos y dimensiones (NumPy)" y respondió el cuestionario de cierre
> (aula invertida), así que la clase no la explica de nuevo: la **usa**. El
> hilo conductor es el libro de hojas de cálculo con temperaturas: una sola
> tabla, `temps` (4 estaciones por 7 días, los mismos valores de la lección),
> y en cada paso se vuelve a la pregunta "¿qué haría yo en la hoja?" antes de
> escribir la línea de NumPy. Todo corre en Google Colab, sin terminal ni
> instalación (NumPy ya viene en Colab). El orden es: pasos 1 a 3, votación 1,
> paso 4, paso 5, votación 2, reto en parejas, reto de extensión opcional,
> práctica externa y preguntas socráticas.

## Paso 1 — Construir la hoja y leer su etiqueta

En la hoja de cálculo, lo primero es mirar cuántas filas y columnas hay.
Construir `temps` en vivo, fila por fila, comentando a qué estación
corresponde cada una:

```python
import numpy as np   # alias estandar: np

temps = np.array([
    [24.5, 25.1, 26.3, 27.0, 25.8, 24.9, 26.1],   # EST-01
    [29.4, 30.8, 31.5, 32.1, 30.2, 29.8, 31.0],   # EST-02
    [14.2, 13.8, 15.1, 14.6, 13.5, 14.9, 15.4],   # EST-03
    [33.0, 34.2, 35.1, 33.8, 32.6, 31.9, 34.5],   # EST-04
])   # una lista de listas: cada lista interna es una FILA de la hoja

print(temps)
print(temps.shape, temps.ndim, temps.size, temps.dtype)
```

```text
[[24.5 25.1 26.3 27.  25.8 24.9 26.1]
 [29.4 30.8 31.5 32.1 30.2 29.8 31. ]
 [14.2 13.8 15.1 14.6 13.5 14.9 15.4]
 [33.  34.2 35.1 33.8 32.6 31.9 34.5]]
(4, 7) 2 28 float64
```

Punto a resaltar: `shape` es `(4, 7)`, o sea 4 filas y 7 columnas, y `size`
es 4 × 7 = 28 celdas. Pedir al grupo que prediga la salida **antes** de
ejecutar. Señalar también que `27.0` se imprime como `27.` y `31.0` como
`31.`: NumPy solo recorta la presentación, el valor sigue siendo decimal.

Ahora una sola columna de la hoja (los siete días de EST-01) para comparar
una dimensión con dos:

```python
est01 = np.array([24.5, 25.1, 26.3, 27.0, 25.8, 24.9, 26.1])   # lista plana
print(est01, est01.shape, est01.ndim)
print(np.array([1, 2, 3.5]).dtype, np.array([1, 2, 3]).dtype)
```

```text
[24.5 25.1 26.3 27.  25.8 24.9 26.1] (7,) 1
float64 int64
```

Punto a resaltar: `(7,)` lleva coma porque es una tupla de un solo
elemento: un eje, siete celdas. Un solo decimal en la lista vuelve decimal
todo el arreglo (`float64`); sin decimales, el tipo es entero (`int64`).

## Paso 2 — Crear arreglos sin escribirlos celda por celda

En la hoja no se teclean 28 ceros: se llena y se arrastra. Ejecutar cada
línea por separado y pedir al grupo que adivine la salida antes:

```python
print(np.zeros((2, 3)))      # hoja de 2 filas x 3 columnas llena de ceros
print(np.ones(4))            # una columna de cuatro unos
print(np.arange(0, 10, 2))   # serie de 0 a 10 saltando de 2 en 2 (el 10 NO entra)
print(np.linspace(0, 1, 5))  # 5 valores equidistantes entre 0 y 1 (el 1 SI entra)
```

```text
[[0. 0. 0.]
 [0. 0. 0.]]
[1. 1. 1. 1.]
[0 2 4 6 8]
[0.   0.25 0.5  0.75 1.  ]
```

Punto a resaltar: en `np.zeros((2, 3))` hay **dos** paréntesis: el de la
llamada y el de la tupla de forma. Es el primer tropiezo del novato. Luego
contrastar `arange` y `linspace` con el mismo rango:

```python
print(np.arange(0, 10, 2).size)      # arange: yo elijo el PASO, la cantidad sale sola
print(np.linspace(0, 10, 5))         # linspace: yo elijo la CANTIDAD, el paso sale solo
print(np.zeros((2, 4, 7)).shape)     # el libro de dos semanas: 2 hojas de 4 x 7
```

```text
5
[ 0.   2.5  5.   7.5 10. ]
(2, 4, 7)
```

Punto a resaltar: en `arange` se fija el paso y en `linspace` la cantidad.
Y la tupla de forma se lee "de afuera hacia adentro": hojas, filas,
columnas.

## Paso 3 — Señalar una celda y recortar un bloque

En la hoja: "fila 2, columna 3" para una celda; arrastrar el mouse para un
rango. Ir pidiendo al grupo la coordenada antes de escribirla:

```python
print(temps[1, 2])        # fila 1, columna 2: EST-02, tercer dia
print(temps[-1, 0])       # -1 = la ULTIMA fila; columna 0: EST-04, primer dia
print(temps[:, 2])        # ":" = todo el eje; toda la columna 2 (un dia, 4 estaciones)
print(temps[1, :])        # toda la fila 1 (una estacion, 7 dias)
print(temps[0:2, 1:4])    # bloque: filas 0-1 y columnas 1-3 (el fin NO se incluye)
```

```text
31.5
33.0
[26.3 31.5 15.1 35.1]
[29.4 30.8 31.5 32.1 30.2 29.8 31. ]
[[25.1 26.3 27. ]
 [30.8 31.5 32.1]]
```

Punto a resaltar: el primer número siempre es el eje 0 (las filas, hacia
abajo) y el segundo el eje 1 (las columnas, hacia la derecha). Dibujar la
hoja en el tablero y sombrear el bloque `0:2, 1:4` para que se vea que son
dos filas por tres columnas.

**🐞 Error planeado:** escribir primero `temps[:][2]`, pretendiendo "la
columna 2" porque en una lista de listas se escribe `lista[fila][columna]`.
**Síntoma:** no hay ningún error: imprime `[14.2 13.8 15.1 14.6 13.5 14.9 15.4]`,
que es la **fila** 2 (EST-03), no la columna.

```python
print(temps[:][2])
print(temps[:][2].shape)
```

```text
[14.2 13.8 15.1 14.6 13.5 14.9 15.4]
(7,)
```

**Pregunta al grupo:** "¿Qué hace `[:]` y qué se quedó esperando el
segundo `[2]`?"
**Corrección:** `temps[:]` devuelve toda la hoja, sin quitar nada; el segundo `[2]` se aplica sobre esa hoja y vuelve a elegir una
**fila**. Son dos operaciones encadenadas, no dos ejes a la vez. La forma
correcta es una sola indexación con una coma:

```python
print(temps[:, 2])   # fila: todas (:), columna: la 2 -> un dia en las 4 estaciones
```

```text
[26.3 31.5 15.1 35.1]
```

## 🗳️ Votación — índice negativo y paso

Cuándo: al terminar el Paso 3, antes de pasar al libro de tres ejes.

¿Qué imprime `print(temps[-1, ::2])`?

- (a) `[33.  35.1 32.6 34.5]`
- (b) `[14.2 15.1 13.5 15.4]`
- (c) `[33.  34.2]`
- (d) `[26.1 31.  15.4 34.5]`

Correcta: (a). La fila `-1` es la última (EST-04) y `::2` toma una celda sí
y una no desde la primera: columnas 0, 2, 4 y 6.

Qué revela cada distractor:

- (b) → confunde `-1` con la penúltima fila (es la fila EST-03, con paso 2).
  Quien elige esto cuenta los negativos desde 0 en vez de desde 1 hacia atrás.
- (c) → lee `::2` como "los dos primeros" en vez de "de dos en dos". Confunde
  el **paso** con una **cantidad**.
- (d) → intercambia los ejes: entrega la última **columna** (`temps[:, -1]`).
  Confunde cuál índice va a las filas y cuál a las columnas.

Dinámica: votan solos (mano, tarjeta o encuesta de Colab) → si hay entre 30 %
y 70 % de aciertos, discuten en parejas 2 min y vuelven a votar; si hay más
de 70 %, explicas rápido y sigues; si hay menos de 30 %, vuelves a explicar
`inicio:fin:paso` y el índice negativo sobre la hoja del tablero antes de
discutir. Comprobarlo ejecutando la celda.

## Paso 4 — El libro de tres ejes

En la hoja de cálculo: "hoja 2, fila 3, columna 5". Se apila la hoja de la
semana dos veces para simular dos semanas:

```python
libro = np.array([temps, temps])    # dos semanas (aqui, la misma hoja repetida)
print(libro.shape)                  # (hojas, filas, columnas)
print(libro[0, 1, 2])               # hoja 0, fila 1, columna 2
print(libro[1, -1, 0])              # hoja 1, ultima fila, primera columna
print(libro[:, 0, 0])               # la celda (0, 0) de CADA hoja
print(libro[0].shape)               # elegir solo la hoja 0 devuelve una hoja 2D
```

```text
(2, 4, 7)
31.5
33.0
[24.5 24.5]
(4, 7)
```

Punto a resaltar: cada coma agrega un eje y el eje 0 pasa a ser el de las
hojas; lo que antes eran filas y columnas queda en los ejes 1 y 2. Un `:`
en el primer lugar significa "en todas las hojas". `libro[0]` regresa la
misma hoja `temps`: fijar un eje elimina una dimensión.

## Paso 5 — Filtrar con máscaras booleanas

En la hoja: marcar las celdas que cumplen una condición. Primero la máscara
sola, para que se vea que es una tabla de `True` y `False` del mismo tamaño:

```python
mascara = temps > 30              # una comparacion celda por celda: tabla de True/False
print(mascara[1])                 # la fila de EST-02
print(temps[mascara])             # al usarla como indice, conserva solo los True
print(temps[(temps > 20) & (temps < 30)])   # dos condiciones: & con parentesis
```

```text
[False  True  True  True  True False  True]
[30.8 31.5 32.1 30.2 31.  33.  34.2 35.1 33.8 32.6 31.9 34.5]
[24.5 25.1 26.3 27.  25.8 24.9 26.1 29.4 29.8]
```

Punto a resaltar: la máscara tiene la misma forma que `temps` (4 × 7), pero
`temps[mascara]` devuelve una lista **plana** de 12 valores: ya no hay filas
ni columnas, porque las celdas que sobreviven no forman un rectángulo.
Mostrar `mascara` completa en una celda para ver los `True` de EST-04.

**🐞 Error planeado:** escribir `temps[(temps > 20) and (temps < 30)]`,
porque en un `if` el grupo ya escribió `and` muchas veces.
**Síntoma:** `ValueError: The truth value of an array with more than one
element is ambiguous. Use a.any() or a.all()`.

```python
temps[(temps > 20) and (temps < 30)]
```

```text
ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()
```

**Pregunta al grupo:** "¿Por qué en un `if` sí funcionaba `and`?"
**Corrección:** `and` espera **un** único verdadero o falso, y `temps > 20`
son 28 valores a la vez (una celda con `True` y otra con `False`): Python no
sabe cuál tomar. El operador `&` compara celda por celda y entrega otra
máscara; como `&` se evalúa antes que las comparaciones, cada comparación va
entre paréntesis. La versión correcta es la que ya está en el bloque
principal: `temps[(temps > 20) & (temps < 30)]`. Con `|` ("o"):

```python
print(temps[(temps > 30) | (temps < 15)])   # muy calurosas O muy frias
```

```text
[30.8 31.5 32.1 30.2 31.  14.2 13.8 14.6 13.5 14.9 33.  34.2 35.1 33.8
 32.6 31.9 34.5]
```

## 🗳️ Votación — qué forma tiene la máscara y qué forma tiene el resultado

Cuándo: al terminar el Paso 5, antes del reto en parejas.

```python
mascara = temps > 30
print(mascara.shape, temps[mascara].shape)
```

¿Qué imprime?

- (a) `(4, 7) (12,)`
- (b) `(4, 7) (4, 7)`
- (c) `(4, 7) (4,)`
- (d) `(12,) (12,)`

Correcta: (a). La máscara conserva la forma de la hoja; el resultado de
filtrar con ella es una sola dimensión con los 12 valores que cumplen.

Qué revela cada distractor:

- (b) → cree que filtrar "borra" las celdas que no cumplen pero conserva la
  forma de tabla, como si fueran huecos en la hoja.
- (c) → cree que se queda con una fila por estación (o una por fila con algún
  `True`); no entiende que el filtro mira celda por celda.
- (d) → cree que la comparación `temps > 30` ya aplana la máscara.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en parejas 2 min y vuelven a votar;
si hay más de 70 %, explicas rápido y sigues; si hay menos de 30 %, vuelves a mostrar `mascara` completa y
`temps[mascara]` antes de discutir.

> **Ajuste respecto del plan:** la votación 2 propuesta (asignar `9.7` en un
> arreglo de enteros y ver que se trunca a `9`) usa un comportamiento que la
> lección no cubre, así que no diagnostica la lectura previa. Se cambió por
> esta pregunta, que sí cae en lo leído (máscaras y forma) y es distinta de
> las del cuestionario de cierre. Revisar contra `list_lesson_questions` una
> vez creado el cuestionario. El truncamiento de `dtype` queda como pregunta
> socrática opcional, marcada como fuera de la lectura.

## 👥 Reto en parejas — matriz de notas

Tiempo sugerido: 15 min. Roles: el *driver* escribe en su Colab y el
*navigator* dicta la coordenada o el filtro mirando la tabla; cambian de
rol a mitad del reto (después del punto 3). Sin ejecutar nada hasta
que ambos hayan acordado la línea.

Una profesora tiene las notas de 5 estudiantes en 4 evaluaciones (filas:
estudiantes; columnas: evaluaciones):

| Estudiante | Eval. 1 | Eval. 2 | Eval. 3 | Eval. 4 |
|---|---|---|---|---|
| 1 | 3.5 | 4.0 | 2.8 | 4.2 |
| 2 | 2.5 | 3.0 | 3.8 | 3.4 |
| 3 | 4.5 | 4.8 | 3.9 | 5.0 |
| 4 | 2.9 | 3.2 | 2.7 | 3.6 |
| 5 | 3.8 | 4.1 | 4.4 | 3.0 |

1. Construya `notas` con `np.array` y lea `shape`, `ndim`, `size` y `dtype`.
2. Obtenga la nota del tercer estudiante en la segunda evaluación.
3. Obtenga la cuarta evaluación de todos los estudiantes (una columna).
4. Obtenga las notas de los dos primeros estudiantes en las dos últimas
   evaluaciones (un bloque).
5. Obtenga, con una máscara, todas las notas por debajo de 3,0.

Solución completa:

```python
import numpy as np

# 1. Construir la hoja: 5 filas (estudiantes) x 4 columnas (evaluaciones)
notas = np.array([
    [3.5, 4.0, 2.8, 4.2],   # estudiante 1
    [2.5, 3.0, 3.8, 3.4],   # estudiante 2
    [4.5, 4.8, 3.9, 5.0],   # estudiante 3
    [2.9, 3.2, 2.7, 3.6],   # estudiante 4
    [3.8, 4.1, 4.4, 3.0],   # estudiante 5
])
print(notas.shape, notas.ndim, notas.size, notas.dtype)

# 2. Tercer estudiante = fila 2 (se cuenta desde 0); segunda evaluacion = columna 1
print(notas[2, 1])

# 3. Cuarta evaluacion = columna 3; todas las filas (:)
print(notas[:, 3])

# 4. Dos primeros estudiantes = filas 0:2; dos ultimas evaluaciones = columnas 2:4
print(notas[0:2, 2:4])

# 5. Mascara: True donde la nota es menor que 3.0; al indexar quedan solo esas
print(notas[notas < 3.0])
```

```text
(5, 4) 2 20 float64
4.8
[4.2 3.4 5.  3.6 3. ]
[[2.8 4.2]
 [3.8 3.4]]
[2.8 2.5 2.9 2.7]
```

Punto a resaltar: la nota `3.0` (estudiantes 2 y 5) no sale en el punto 5
porque la condición es `< 3.0` estricta; es el momento de recordar la
diferencia con `<= 3.0`. Verificar con `.size` que hay 4 notas
reprobatorias: `notas[notas < 3.0].size` imprime `4`.

## 🚀 Reto de extensión (opcional, para quien termine antes)

Solo para quien ya domine los puntos anteriores; no se evalúa ni se exige.
Comparar el tiempo de **crear** un millón de números como lista y como
arreglo, con la herramienta de medición de tiempos de Colab (un
`%timeit` por celda):

```python
import numpy as np

%timeit list(range(1_000_000))     # lista de Python con un millon de enteros
%timeit np.arange(1_000_000)       # arreglo de NumPy con los mismos valores
```

Los tiempos dependen de la máquina de Colab y cambian en cada ejecución;
como referencia (valores de ejemplo, no una salida exacta), la lista tarda
del orden de varios milisegundos y el arreglo, del orden de décimas de
milisegundo: unas decenas de veces menos. Para el avanzado, preguntar
por qué ocurre (el arreglo guarda valores del mismo tipo, contiguos en
memoria; la lista guarda referencias a objetos separados) y revisar
`np.arange(1_000_000).nbytes`, que da `8000000` bytes (8 bytes por
`int64`).

> **Fuera de alcance:** no hacer operaciones entre arreglos (sumar, multiplicar,
> `reshape`, agregaciones). Eso es la Semana 10; aquí solo se mide la
> **creación**.

## 🏆 Práctica externa

Problemas verificados el 2026-10-07 (se abrió cada enlace y coincide el
nombre). Todos son de dificultad *Easy* en el dominio NumPy de HackerRank.
Aviso al docente: piden leer la entrada con `input()`, algo que el grupo
todavía no domina; son **opcionales** y se recomiendan solo para el estudiante
avanzado (la parte de NumPy es corta, la lectura de la entrada es lo difícil).

- **Arrays** — https://www.hackerrank.com/challenges/np-arrays/problem —
  convertir una línea de números en un arreglo `float` y devolverlo al revés.
  Practica `np.array` y `dtype`.
- **Shape and Reshape** — https://www.hackerrank.com/challenges/np-shape-reshape/problem —
  convertir nueve enteros en una hoja de 3 × 3. Practica `shape` y `reshape`
  (este último llega en la Semana 10: aquí es una vista previa; marcarlo así).
- **Zeros and Ones** — https://www.hackerrank.com/challenges/np-zeros-and-ones/problem —
  crear arreglos de ceros y unos con una forma dada. Practica `np.zeros`,
  `np.ones` y la tupla de forma.

Alternativa sin cuenta ni lectura de la entrada: la sección oficial
**"NumPy: the absolute basics for beginners"** —
https://numpy.org/doc/stable/user/absolute_beginners.html — ejecutar en Colab
los ejemplos de "How to create a basic array" y "Indexing and slicing".

## Preguntas socráticas

Para lanzar al grupo si se estanca, con la respuesta esperada:

- **"¿Qué pasa con la hoja de cálculo si una fila tiene seis celdas y las
  otras siete?"** Esperada: la hoja deja de ser rectangular; `np.array` no
  puede construir una tabla con filas de largo distinto (la regla de
  "forma rectangular" de la definición de arreglo).
- **"Si `temps[1, 2]` es una celda, ¿por qué `temps[1, :]` es una fila y
  no una celda?"** Esperada: `:` deja libre el eje de las columnas, así que
  quedan todas; fijar un eje elimina una dimensión, dejarlo libre la conserva.
- **"¿Por qué `arange` no incluye el final y `linspace` sí?"** Esperada:
  `arange` es "desde, hasta (sin llegar), paso", como `range`; `linspace`
  fija los dos extremos y reparte la cantidad pedida.
- **(Fuera de la lectura previa, solo diagnóstico)** "`a = np.array([1, 2, 3])`;
  después `a[0] = 9.7`. ¿Qué vale `a[0]`?" Esperada: `9`. El arreglo conserva
  su `dtype` entero y trunca el decimal sin avisar; por eso se decide el
  tipo al crearlo (`np.array([1.0, 2, 3])`). Ejecutarlo en vivo.
