---
title: "Taller evaluativo 03 — NumPy"
updatedAt: "2026-10-15"
---

# Taller evaluativo 03 — NumPy

> **Momento evaluativo 3 del curso — vale el 15 % de la nota final.** Es el
> tercero de los cinco cortes evaluativos del semestre y cubre arreglos,
> operaciones vectorizadas y álgebra lineal básica con NumPy. Se resuelve de
> forma **individual**.

## Objetivo

Integrar en un solo notebook lo visto en las lecciones **"Arreglos y
dimensiones (NumPy)"** y **"Operaciones vectorizadas y álgebra lineal
básica"**, resolviendo siete ejercicios sobre un problema real de programación
científica: **calibrar y resumir la semana de datos de una red de cinco
sensores de bajo costo de PM2.5**, la misma red de monitoreo de los talleres
anteriores.

Competencias esperadas:
- Crear arreglos 1D y 2D con `np.array`, `np.arange` y `np.ones`, y describirlos
  con `shape`, `ndim`, `size` y `dtype`.
- Seleccionar celdas, filas, columnas y bloques con indexación y slicing.
- Filtrar y contar datos con máscaras booleanas combinadas con `&` y `|`.
- Aplicar fórmulas a todo un arreglo sin escribir bucles, y alinear arreglos
  de formas distintas con broadcasting.
- Resumir un arreglo con `mean`, `max`, `std` y el parámetro `axis`, y usar
  funciones universales como `np.maximum`, `np.abs` y `np.round`.
- Documentar cada ejercicio en celdas de texto y entregar el notebook en
  GitHub.

## Contexto: cinco sensores por calibrar y resumir

La red de monitoreo del valle instaló cinco sensores de bajo costo,
**SBC-A, SBC-B, SBC-C, SBC-D y SBC-E**. Cada sensor registra el promedio diario
de PM2.5 durante una semana (7 días). Como estos sensores son imprecisos,
cada uno se calibra con su propia recta,
`valor calibrado = pendiente x lectura + intercepto`:

| Sensor | Pendiente | Intercepto |
|---|---|---|
| SBC-A | 1.2 | -0.5 |
| SBC-B | 0.9 | 1.0 |
| SBC-C | 1.1 | -2.0 |
| SBC-D | 1.0 | 0.5 |
| SBC-E | 1.3 | -1.5 |

SBC-A es el mismo sensor del Taller evaluativo 02, con la misma recta de
calibración. Los datos crudos de la semana, en µg/m³, son estos (cada fila es
un sensor, de SBC-A a SBC-E; cada columna es un día, del día 1 al día 7):

```text
lecturas_crudas = [
    [10.0, 14.5, 22.0, 30.5, 28.0, 18.0,  9.5],   # SBC-A
    [12.0, 20.0, 35.0, 48.0, 41.0, 25.0, 14.0],   # SBC-B
    [ 8.0, 11.0, 19.0, 27.0, 33.0, 21.0,  6.0],   # SBC-C
    [15.0, 24.0, 31.0, 44.0, 52.0, 36.0, 17.0],   # SBC-D
    [ 5.0,  9.0, 16.0, 22.0, 45.0, 30.0,  4.0],   # SBC-E
]
```

Dos detalles del mundo real, los mismos de siempre:

- Cuando un sensor falla, el equipo escribe el valor centinela `-999.0`.
  Además, algunas lecturas quedan fuera del rango físico del sensor (más de
  500.0 µg/m³): son ruido, no medición. Ninguna de las dos debe entrar a un
  promedio. Esto aparece en el Ejercicio 3, con las ocho lecturas de campaña
  de SBC-A del taller anterior.
- La escala oficial de calidad del aire para PM2.5 (promedio de 24 horas) que
  se usa en todo el taller es esta:

| Categoría | Rango de PM2.5 (µg/m³) |
|---|---|
| Buena | hasta 12.0 |
| Moderada | más de 12.0 y hasta 35.4 |
| Dañina para grupos sensibles | más de 35.4 y hasta 55.4 |
| Dañina para la salud | más de 55.4 |

## Desarrollo del Taller

El taller tiene **siete ejercicios**, en orden creciente de dificultad, que se
resuelven todos en el **mismo notebook** y en el orden en que aparecen: los
últimos reutilizan arreglos de los primeros. Los ejercicios 1 a 3 son de
creación, selección y filtrado; el 4 es de vectorización y broadcasting; el 5
y el 6 de estadística y funciones universales, y el 7 integra todo. Cada ejercicio debe ir precedido por una celda de texto que
explique qué hace, y cada resultado debe mostrarse con `print()`.

**En todo el taller no se permiten bucles `for` ni `while`, ni comprensiones
de listas** para recorrer los arreglos: el recorrido lo hace NumPy. Los nombres
de variables van en `snake_case` y sin tildes.

### Ejercicio 1 — Crear los arreglos y leer su etiqueta

Convierta los datos crudos en un arreglo y descríbalo, como quien mira cuántas
filas y columnas tiene una hoja de cálculo antes de trabajar con ella.

```python
# TODO: importe NumPy con el alias np
# TODO: cree lecturas_crudas, un arreglo 2D de 5 filas y 7 columnas con los
#       valores de la tabla de arriba (una lista de listas dentro de np.array)
# TODO: guarde en forma, dimensiones, total y tipo los atributos shape, ndim,
#       size y dtype de lecturas_crudas
# TODO: cree dias con np.arange: los días del 1 al 7 (el 7 incluido)
# TODO: cree pendientes e interceptos, dos arreglos 1D de cinco valores cada
#       uno, con la tabla de calibración (en el orden SBC-A a SBC-E)
# TODO: muestre con print() forma, dimensiones, total, tipo, dias,
#       pendientes e interceptos
```

**Requisitos:** `lecturas_crudas` se crea con `np.array` a partir de una lista
de listas, no con un bucle. `dias` se crea con `np.arange` y debe incluir el
día 7. Los atributos se leen de `lecturas_crudas`, no se escriben a mano.

### Ejercicio 2 — Señalar celdas y recortar bloques

Use indexación y slicing para leer partes de la tabla. Recuerde que Python
cuenta desde 0: el sensor SBC-A es la fila 0 y el día 1 es la columna 0.

```python
# TODO: guarde en lectura_c_dia4 la lectura de SBC-C en el día 4
# TODO: guarde en ultimo_primer la lectura del último sensor en el día 1,
#       usando un índice negativo para la fila
# TODO: guarde en dia5 todas las lecturas del día 5 (una columna completa)
# TODO: guarde en semana_b todas las lecturas de SBC-B (una fila completa)
# TODO: guarde en bloque las lecturas de SBC-B a SBC-D (filas 1 a 3) de los
#       días 3 a 6 (columnas 2 a 5)
# TODO: muestre los cinco resultados con print(), y la forma de bloque
```

**Requisitos:** cada resultado se obtiene con **una sola** expresión de
indexación o slicing sobre `lecturas_crudas`. No se copian valores a mano. El
bloque debe tener forma `(3, 4)`.

### Ejercicio 3 — Limpiar una campaña con máscaras booleanas

Esta es la serie de ocho lecturas de campaña de SBC-A del taller anterior, todas
en µg/m³ y sin calibrar:

```text
campana_sbc_a = [10.0, -999.0, 25.0, 40.0, -999.0, 8.0, 52.0, 600.0]
```

Una lectura es **útil** cuando está entre 0 y 500.0 inclusive: eso descarta
tanto el centinela `-999.0` como el ruido de más de 500.0.

```python
# TODO: cree campana_sbc_a como un arreglo 1D de NumPy con los valores de arriba
# TODO: cree faltantes: una máscara que sea True donde la lectura es -999.0
# TODO: cree es_util: una máscara que sea True donde la lectura está entre
#       0 y 500.0 inclusive (combine dos comparaciones con &)
# TODO: guarde en lecturas_utiles solo las lecturas que cumplen es_util
# TODO: guarde en promedio_utiles el promedio de lecturas_utiles
# TODO: muestre con print() cuántas lecturas faltantes hay (la suma de la
#       máscara faltantes), lecturas_utiles y promedio_utiles
```

**Requisitos:** la selección se hace usando la máscara como índice, no con un
bucle. Las dos comparaciones de `es_util` van entre paréntesis y se unen con
`&`; no se usa `and`. Debe resultar un arreglo de 5 lecturas útiles con
promedio 27.0.

### Ejercicio 4 — Calibrar todo con operaciones vectorizadas y broadcasting

Calibre las 35 lecturas de la red de un solo golpe, sin recorrerlas. Cada
sensor tiene su propia pendiente y su propio intercepto, así que hay que
alinear los arreglos de distinta forma.

```python
# TODO: en una celda de TEXTO, explique en dos o tres frases por qué
#       lecturas_crudas * pendientes produce un ValueError (compare las formas
#       (5, 7) y (5,)). No deje esa línea fallando en una celda de código.
# TODO: convierta pendientes e interceptos en columnas de forma (5, 1), con
#       reshape o con np.newaxis
# TODO: guarde en calibradas el resultado de aplicar la recta de cada sensor a
#       su fila: lecturas_crudas * pendientes_col + interceptos_col
# TODO: guarde en campana_calibrada el resultado de calibrar lecturas_utiles
#       (Ejercicio 3) con la recta de SBC-A: pendiente 1.2 e intercepto -0.5
# TODO: guarde en promedio_calibrado_sbc_a el promedio de campana_calibrada
# TODO: muestre con print() la forma de calibradas, la fila calibradas[0],
#       campana_calibrada y promedio_calibrado_sbc_a
```

**Requisitos:** ningún bucle; la calibración usa solo operadores sobre
arreglos. `calibradas` debe tener forma `(5, 7)` y no debe modificar
`lecturas_crudas`. La primera fila de `calibradas` es
`[11.5 16.9 25.9 36.1 33.1 21.1 10.9]`; y `promedio_calibrado_sbc_a` debe
coincidir con el promedio calibrado de SBC-A del taller anterior, 31.9.

### Ejercicio 5 — Resumir la semana con estadística por eje

Con `calibradas` de aquí en adelante, resuma la red completa y por dirección.
Recuerde: `axis=0` resume por día (un valor por columna) y `axis=1` resume por
sensor (un valor por fila).

```python
# TODO: guarde en promedio_general el promedio de las 35 lecturas calibradas
# TODO: guarde en promedio_por_sensor el promedio de cada sensor (5 valores)
# TODO: guarde en promedio_por_dia el promedio de cada día (7 valores)
# TODO: guarde en maximo_por_sensor el valor máximo calibrado de cada sensor
# TODO: guarde en media_sobre_limite el promedio de las lecturas calibradas
#       que superan 35.4 (use una máscara)
# TODO: muestre con print() todos los resultados, redondeados a 2 decimales
#       con np.round
```

**Requisitos:** cada resumen se calcula con un método o función de NumPy; no
se suman ni se dividen valores a mano. `promedio_por_sensor` y
`promedio_por_dia` deben tener 5 y 7 valores respectivamente.

### Ejercicio 6 — Funciones universales y reemplazo con máscara

Mida cuánto se pasó cada sensor del límite de 35.4 µg/m³ (la frontera entre
Moderada y Dañina para grupos sensibles), celda por celda.

```python
# TODO: guarde en excedente el resultado de np.maximum(calibradas - 35.4, 0):
#       0 donde la lectura está dentro del límite, y cuánto se pasó donde no
# TODO: guarde en excedente_por_sensor la suma de cada fila de excedente,
#       redondeada a 1 decimal con np.round
# TODO: guarde en desvio_sensor_b la distancia absoluta de cada lectura
#       calibrada de SBC-B al límite 35.4 (use np.abs), redondeada a 1 decimal
# TODO: guarde en en_alerta una COPIA de calibradas en la que toda lectura
#       que no supere 35.4 se reemplace por 0.0
# TODO: muestre con print() excedente_por_sensor, desvio_sensor_b y cuántas
#       celdas de en_alerta quedaron mayores que 0
```

**Requisitos:** use `np.maximum`, `np.abs` y `np.round`. `en_alerta` se
obtiene de `calibradas.copy()` y el reemplazo usa una máscara; al final,
`calibradas` debe seguir intacto. Las celdas de `en_alerta` mayores que 0 se
cuentan con una máscara y `sum`, y deben ser 8.

### Ejercicio 7 — Integración: el informe de la red

El último ejercicio junta todo: máscaras sobre los datos calibrados para contar
cuántas lecturas cayeron en cada categoría de la escala oficial, y la
identificación del día más contaminado.

```python
# TODO: con máscaras sobre calibradas, guarde en buenas, moderadas,
#       daninas_sensibles y daninas_salud cuántas de las 35 lecturas caen en
#       cada categoría de la escala oficial (cada intervalo con sus dos
#       extremos bien definidos: ninguna lectura puede quedar sin categoría ni
#       en dos a la vez)
# TODO: guarde en dia_pico el número de día (de dias, Ejercicio 1) en que
#       promedio_por_dia es máximo; use una máscara sobre promedio_por_dia
#       para filtrar dias, y el primer elemento del resultado
# TODO: muestre con print() exactamente estas dos líneas (el segundo valor del
#       día pico va redondeado a 1 decimal):
#       Lecturas por categoría: Buena=9, Moderada=18, Dañina para grupos sensibles=7, Dañina para la salud=1
#       Día más contaminado: 5 con 43.0 ug/m3
```

**Requisitos:** los conteos se obtienen con máscaras y `sum`, sin bucles. Los
cuatro conteos deben sumar 35. `dia_pico` debe resultar 5 filtrando `dias` con
una máscara. Los textos de salida deben coincidir carácter por carácter con
el pedido.

**Reto de extensión (opcional, sin puntos):** obtenga los mismos cuatro conteos
de otra forma, con `np.digitize(calibradas, [12.0, 35.4, 55.4], right=True)`.
Esa función devuelve para cada lectura un número de 0 a 3 (la categoría) y
con `(indices == 0).sum()` y sus equivalentes contará cada una. Compruebe que
coinciden con los del Ejercicio 7.

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, con la opción **Archivo → Guardar una copia
en GitHub** de Colab.

Nombre exacto del archivo: `taller-evaluativo-03-numpy.ipynb`.

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   ├── taller-variables-tipos-operadores.ipynb
│   ├── taller-condicionales-bucles.ipynb
│   ├── taller-evaluativo-01-calidad-del-aire.ipynb
│   ├── taller-evaluativo-02-funciones-y-poo.ipynb
│   └── taller-evaluativo-03-numpy.ipynb
└── README.md
```

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del taller, su nombre completo y la
   fecha.
2. Los siete ejercicios completos, en el orden de esta guía, cada uno
   precedido por una celda de texto que explique qué hace.
3. La celda de verificación final (abajo), sin modificar.

**Antes de subir:** ejecute `Entorno de ejecución → Reiniciar y ejecutar
todas` y confirme que ninguna celda muestra un error. Un notebook que solo
funciona ejecutando las celdas en desorden se califica como si no ejecutara.

### Celda de verificación

Copie esta celda al final del notebook y ejecútela después de todo lo demás.
Comprueba arreglos, formas y resultados intermedios; **no reemplaza** la
revisión de cada ejercicio, pero si alguna línea falla hay un error que debe
corregir antes de entregar.

```python
# Celda de verificación — ejecútela al final, después de todo lo demás
assert lecturas_crudas.shape == (5, 7) and lecturas_crudas.ndim == 2, "revise lecturas_crudas del Ejercicio 1"
assert forma == (5, 7) and dimensiones == 2 and total == 35 and tipo == np.float64, "revise los atributos del Ejercicio 1"
assert np.array_equal(dias, np.arange(1, 8)), "dias debe ir del 1 al 7 (el 7 incluido)"
assert np.allclose(pendientes, [1.2, 0.9, 1.1, 1.0, 1.3]) and np.allclose(interceptos, [-0.5, 1.0, -2.0, 0.5, -1.5]), "revise pendientes e interceptos"
assert lectura_c_dia4 == 27.0 and ultimo_primer == 5.0, "revise la indexación del Ejercicio 2"
assert np.array_equal(dia5, [28.0, 41.0, 33.0, 52.0, 45.0]) and semana_b.shape == (7,), "revise dia5 y semana_b del Ejercicio 2"
assert bloque.shape == (3, 4) and bloque[0, 0] == 35.0, "revise el bloque del Ejercicio 2"
assert int(faltantes.sum()) == 2 and lecturas_utiles.shape == (5,), "revise las máscaras del Ejercicio 3"
assert abs(promedio_utiles - 27.0) < 1e-9, "revise promedio_utiles del Ejercicio 3"
assert calibradas.shape == (5, 7), "calibradas debe tener forma (5, 7)"
assert np.allclose(calibradas[0], [11.5, 16.9, 25.9, 36.1, 33.1, 21.1, 10.9]), "revise la calibración del Ejercicio 4"
assert lecturas_crudas[0, 0] == 10.0, "lecturas_crudas no debe modificarse"
assert abs(promedio_calibrado_sbc_a - 31.9) < 1e-9, "revise promedio_calibrado_sbc_a del Ejercicio 4"
assert abs(promedio_general - 24.1086) < 1e-4, "revise promedio_general del Ejercicio 5"
assert np.allclose(np.round(promedio_por_sensor, 2), [22.21, 26.07, 17.64, 31.79, 22.83]), "revise promedio_por_sensor (axis=1)"
assert np.allclose(np.round(promedio_por_dia, 2), [10.12, 16.14, 25.62, 35.92, 42.96, 27.94, 10.06]), "revise promedio_por_dia (axis=0)"
assert np.allclose(maximo_por_sensor, [36.1, 44.2, 34.3, 52.5, 57.0]), "revise maximo_por_sensor"
assert abs(media_sobre_limite - 43.275) < 1e-9, "revise media_sobre_limite"
assert np.allclose(excedente_por_sensor, [0.7, 11.3, 0.0, 27.3, 23.7]), "revise excedente_por_sensor del Ejercicio 6"
assert np.allclose(desvio_sensor_b, [23.6, 16.4, 2.9, 8.8, 2.5, 11.9, 21.8]), "revise desvio_sensor_b"
assert en_alerta.shape == (5, 7) and int((en_alerta > 0).sum()) == 8, "revise en_alerta"
assert abs(calibradas[0, 3] - 36.1) < 1e-9, "calibradas no debe modificarse al crear en_alerta"
assert (buenas, moderadas, daninas_sensibles, daninas_salud) == (9, 18, 7, 1), "revise los conteos del Ejercicio 7"
assert buenas + moderadas + daninas_sensibles + daninas_salud == calibradas.size, "los cuatro conteos deben sumar 35"
assert dia_pico == 5, "revise dia_pico del Ejercicio 7"
print("Verificación completada sin errores.")
```

## Criterios de Evaluación

Este taller **es el Momento evaluativo 3 y vale el 15 % de la nota final del
curso**. Se califica sobre 100 puntos con la rúbrica de abajo, y ese puntaje
se convierte después a la escala institucional de 0 a 5.

| Criterio | Puntos | Descripción |
|---|---|---|
| **Creación y atributos de arreglos (Ej. 1)** | 10 | `lecturas_crudas` se crea con `np.array` a partir de una lista de listas y tiene forma `(5, 7)`, 2 dimensiones, 35 elementos y tipo `float64`, leídos de sus atributos; `dias` se crea con `np.arange` e incluye el día 7; `pendientes` e `interceptos` son arreglos 1D de cinco valores correctos. |
| **Indexación y slicing (Ej. 2)** | 10 | Cada resultado se obtiene con una sola expresión sobre `lecturas_crudas`: `lectura_c_dia4` vale 27.0, `ultimo_primer` vale 5.0 (con índice negativo), `dia5` y `semana_b` son una columna y una fila completas, y `bloque` tiene forma `(3, 4)` con las filas 1 a 3 y las columnas 2 a 5. |
| **Máscaras booleanas (Ej. 3)** | 15 | `faltantes` y `es_util` son máscaras, `es_util` combina dos comparaciones entre paréntesis con `&` (sin `and`), `lecturas_utiles` queda con 5 valores filtrados con la máscara, hay 2 lecturas faltantes y `promedio_utiles` es 27.0, todo sin bucles. |
| **Vectorización y broadcasting (Ej. 4)** | 15 | `pendientes` e `interceptos` se convierten en columnas `(5, 1)`; `calibradas` tiene forma `(5, 7)`, su primera fila es `[11.5 16.9 25.9 36.1 33.1 21.1 10.9]` y `lecturas_crudas` no se modifica; la celda de texto explica por qué fallaba `(5, 7)` con `(5,)`; `promedio_calibrado_sbc_a` es 31.9; no hay bucles. |
| **Estadística por eje y funciones universales (Ej. 5 y 6)** | 20 | Los promedios por sensor (`axis=1`) y por día (`axis=0`), el máximo por sensor, y la media sobre el límite (43.275) son correctos; `excedente` usa `np.maximum`, `desvio_sensor_b` usa `np.abs` y `np.round`, y `en_alerta` se hace sobre una copia con máscara y deja 8 celdas mayores que 0, sin alterar `calibradas`. |
| **Integración (Ej. 7)** | 10 | Los cuatro conteos por categoría (9, 18, 7 y 1) se obtienen con máscaras, suman 35 y ninguna lectura queda sin categoría ni en dos; `dia_pico` es 5 y las dos líneas de salida coinciden carácter por carácter con el pedido. |
| **Ejecución sin errores** | 10 | El notebook corre completo con `Reiniciar y ejecutar todas` sin ningún error (incluida la ausencia de celdas de prueba que lancen `ValueError`), y la celda de verificación imprime "Verificación completada sin errores." |
| **Documentación** | 5 | Cada uno de los siete ejercicios tiene una celda de texto previa que explica qué hace, y los nombres de variables siguen `snake_case` sin tildes. |
| **Entrega correcta** | 5 | El notebook está en `ejercicios/` del repositorio del curso, con el nombre de archivo exacto indicado, subido con Guardar una copia en GitHub y visible en GitHub antes del plazo. |
| **TOTAL** | **100** | |

### Cómo se convierte el puntaje a nota

```
nota_taller (0-5)        = (puntaje_obtenido / 100) x 5
aporte_a_la_nota_final % = (puntaje_obtenido / 100) x 15
```

Ejemplo: un notebook que obtiene **82 de 100** puntos saca **4.1** en la
escala de 0 a 5 y aporta **12.3 %** de los 15 % que vale este momento
evaluativo.

## Dificultades Comunes

### "`ValueError: operands could not be broadcast together with shapes (5,7) (5,)`"
- NumPy alinea las formas de derecha a izquierda: `(5,)` se compara con el eje
  de 7 columnas y no coincide. Convierta el vector en columna de forma `(5, 1)`
  con `reshape(5, 1)` o con `[:, np.newaxis]`; así el `1` se estira sobre los
  7 días.

### "`ValueError: The truth value of an array with more than one element is ambiguous`"
- Usó `and` u `or` para combinar máscaras. Con arreglos se usan `&` y `|`, y
  cada comparación va entre paréntesis: `(a >= 0) & (a <= 500.0)`.

### "Mi máscara devuelve una lista plana y ya no tengo filas ni columnas"
- Es lo esperado: `calibradas[mascara]` entrega solo los valores que cumplen,
  en una sola dimensión. Si necesita conservar la forma de tabla, reemplace los
  valores sobre una copia en lugar de filtrar.

### "Cambié `en_alerta` y también cambió `calibradas`"
- Escribió `en_alerta = calibradas` sin copiar: ambos nombres señalan la misma
  tabla. Cree la copia con `calibradas.copy()` antes de reemplazar valores. El
  mismo cuidado aplica a `lecturas_crudas` en el Ejercicio 4.

### "`axis=0` y `axis=1` me confunden"
- `axis=0` recorre las filas y deja un valor por columna: un resumen por **día**
  (7 valores). `axis=1` recorre las columnas y deja un valor por fila: un
  resumen por **sensor** (5 valores). Compruebe siempre la forma del resultado.

### "Mi `bloque` tiene una fila o una columna de más o de menos"
- En un slice `inicio:fin` el fin **no se incluye**. Las filas 1 a 3 se escriben
  `1:4`, y las columnas 2 a 5, `2:6`. Y el día 4 es la columna 3, porque se
  cuenta desde 0.

### "El notebook funciona, pero al reiniciar el entorno falla"
- Está dependiendo de variables que quedaron en memoria de ejecuciones
  anteriores, de celdas ejecutadas en desorden, o dejó una celda de prueba que
  lanza un error (por ejemplo, la suma de `lecturas_crudas * pendientes` sin
  corregir). Ejecute siempre `Reiniciar y ejecutar todas` antes de entregar: así
  se va a calificar.

**Plazo de entrega:** sábado 24 de octubre de 2026.
