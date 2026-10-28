> Sesión dictada en vivo por el docente, no es trabajo independiente del
> estudiante: no hay guía de laboratorio. El estudiante ya leyó la lección
> "Filtrado, agregación y limpieza de datos" y respondió el cuestionario de
> cierre (aula invertida), así que la clase no la explica de nuevo: la **usa**.
> El hilo conductor es el dataset de pingüinos (344 filas) que ya conocen de la
> sesión anterior: todo el guion trabaja sobre una sola tabla, `pinguinos`, y
> cada paso responde una pregunta que de verdad se le haría a esa tabla. En
> cada paso se vuelve a la pregunta "¿qué haría yo con esto en la hoja de
> cálculo?" antes de escribir la línea de pandas. Todo corre en Google Colab,
> sin terminal ni instalación, y las celdas están pensadas para pegarse **en
> orden** en un solo cuaderno: corren de punta a punta sin errores.
>
> **Alcance de hoy:** seleccionar, filtrar, ordenar, resumir por una clave,
> detectar nulos y atípicos, y decidir con criterio entre eliminar e imputar,
> anotando cada decisión. El bloque inicial de la clase (presentación de los
> datasets del proyecto) **no está en estos apuntes**: lo conduce el docente por
> su cuenta antes del Paso 1.
>
> **Antes de clase:** abrir un cuaderno nuevo de Colab y pegar la primera celda
> (imports y carga) sin ejecutarla, para ejecutarla en vivo. Necesita internet:
> `sns.load_dataset` descarga el dataset. Las salidas de estos apuntes se
> verificaron con pandas 3.0.2 y seaborn 0.13.2 en una ejecución local de todo
> el guion de corrido. Colab puede traer pandas 2 (no se probó ahí): se espera que las
> salidas coincidan, y la diferencia conocida está en el Paso 8
> (el comportamiento de `inplace=True` sobre una columna). Si alguien
> nota que algún `dtype` dice `object` donde estos apuntes dirían `str`, es lo
> mismo: texto.

## Paso 1 — La misma pregunta, dos respuestas

Situación: "¿qué proporción de los pingüinos son hembras?". Primero la
pregunta a la hoja de cálculo: contar las hembras y dividir. ¿Entre cuántas
filas? Dejar la pregunta en el aire y escribir las dos fórmulas. Los imports
van todos en esta primera celda, y no se repiten más adelante:

```python
import pandas as pd                          # alias estándar: pd (en Colab ya viene instalado)
import seaborn as sns                        # alias estándar: sns; aquí solo lo usamos para descargar el dataset

pd.set_option("display.max_columns", None)   # que print muestre todas las columnas sin cortar con ...
pd.set_option("display.width", 200)          # ancho de línea mayor, para que no salte de renglón

pinguinos = sns.load_dataset("penguins")     # descarga el dataset (necesita internet)
print(pinguinos.shape)                       # (filas, columnas): 344 pingüinos, 7 variables
```

```text
(344, 7)
```

```python
# Fórmula 1: ¿en qué fracción de TODAS las filas la comparación da True?
print(round((pinguinos["sex"] == "Female").mean(), 3))

# Fórmula 2: fracción de Female entre las filas que SÍ tienen sexo
print(round(pinguinos["sex"].value_counts(normalize=True)["Female"], 3))
```

```text
0.48
0.495
```

Punto a resaltar: dos códigos sin error de sintaxis, dos respuestas (48 % y
49.5 %). Preguntar al grupo: "¿cuál es la correcta?". Esperar a que alguien diga
"depende". Revelar la causa con una línea:

```python
print(pinguinos["sex"].isna().sum())   # isna() marca True donde la celda está vacía; sum() cuenta los True
```

```text
11
```

Punto a resaltar: 11 celdas vacías. La primera fórmula divide entre las 344
filas; la segunda, entre las 333 que tienen sexo. Ninguna avisa. Este es el hilo
de toda la clase: para preguntarle algo a una tabla se necesita **seleccionar,
filtrar y resumir**, y antes de confiar en la respuesta, saber **qué hay de raro
en los datos** y qué se hizo con ello. Dejar la duda abierta: se resuelve en el
Paso 8.

## Paso 2 — Elegir lo que importa: columnas, `loc` e `iloc`

Situación: en la hoja de cálculo se ocultan las columnas que no se usan. En
pandas se hace al revés: se nombran las que sí. Primero, solo columnas, con una
**lista** de nombres dentro de los corchetes (de ahí los corchetes dobles):

```python
solo_dos = pinguinos[["species", "body_mass_g"]]   # lista de nombres -> un DataFrame con esas columnas
print(solo_dos.head(3))                            # head(3): solo las tres primeras filas
```

```text
  species  body_mass_g
0  Adelie       3750.0
1  Adelie       3800.0
2  Adelie       3250.0
```

Punto a resaltar: los corchetes dobles no son un error: el de adentro es la
lista de Python y el de afuera es el acceso a la tabla. Con un solo par y un
solo nombre (`pinguinos["species"]`) se obtiene una Series, no una tabla.

Ahora filas **y** columnas a la vez. `loc` trabaja con **etiquetas**: el
nombre de la fila (su índice) y el nombre de la columna. Se escribe
`df.loc[filas, columnas]` y las filas pueden venir de una condición:

```python
# Filas: las de la isla Dream. Columnas: especie y peso.
en_dream = pinguinos.loc[pinguinos["island"] == "Dream", ["species", "body_mass_g"]]
print(en_dream.head(3))
```

```text
   species  body_mass_g
30  Adelie       3250.0
31  Adelie       3900.0
32  Adelie       3300.0
```

Punto a resaltar: las filas conservan su número original (30, 31, 32 y no 0, 1,
2). **El índice es una etiqueta, no una posición.** Ahora la misma tabla del
principio, pero por posición con `iloc`, que cuenta como una lista de Python:
desde 0 y sin incluir el final.

```python
print(pinguinos.iloc[0:3, [0, 5]])   # filas en las posiciones 0, 1 y 2; columnas en las posiciones 0 y 5
```

```text
  species  body_mass_g
0  Adelie       3750.0
1  Adelie       3800.0
2  Adelie       3250.0
```

Punto a resaltar: es el mismo resultado que `pinguinos[["species", "body_mass_g"]].head(3)`
sin escribir un solo nombre. Pregunta al grupo: "¿qué columna es la posición 5
y cómo lo saben?" Respuesta: `body_mass_g`; contando desde 0 en `pinguinos.columns`.
Regla para dejar en la pizarra: **`loc` si piensas en nombres o condiciones,
`iloc` si piensas en posiciones.**

## Paso 3 — Filtrado booleano: la máscara

Situación: "¿cuáles pesan más de 5500 g?". En la hoja sería un filtro sobre la
columna. En pandas, **dos pasos**: primero una máscara de `True` y `False`, una
por fila, y después se usa como filtro. Mostrar la máscara sola antes de
filtrar:

```python
pesados = pinguinos["body_mass_g"] > 5500   # una Series de bool: True donde el peso supera 5500
print(pesados.head(5))                      # las primeras cinco; ninguna cumple
print(pesados.sum())                        # True vale 1, así que sum() cuenta cuántas filas cumplen
print(pinguinos[pesados].shape)             # la máscara como filtro: solo quedan las filas True
```

```text
0    False
1    False
2    False
3    False
4    False
Name: body_mass_g, dtype: bool
28
(28, 7)
```

Punto a resaltar: `pesados.sum()` y las filas de `pinguinos[pesados]` dan el
mismo número (28). Esa coincidencia es la prueba de que la máscara **es** el
filtro. Combinar condiciones: `&` (y), `|` (o), y **un paréntesis por
condición**:

```python
biscoe_pesados = (pinguinos["island"] == "Biscoe") & (pinguinos["body_mass_g"] > 5500)
dream_o_torgersen = (pinguinos["island"] == "Dream") | (pinguinos["island"] == "Torgersen")
print(pinguinos[biscoe_pesados].shape)      # los 28 son de Biscoe
print(pinguinos[dream_o_torgersen].shape)   # Dream + Torgersen
```

```text
(28, 7)
(176, 7)
```

Punto a resaltar: los 28 pesados son todos de Biscoe. Pregunta al grupo:
"¿qué especie vive allí?" (lo verifican en el Paso 4, con el ordenamiento).
Ahora el error que casi todos cometen, **hecho a propósito** antes de que
ocurra solo: escribir `and`, como se haría en Python normal. Pedir al grupo que
prediga qué pasa:

```python
try:
    pinguinos[(pinguinos["island"] == "Biscoe") and (pinguinos["body_mass_g"] > 5500)]
except ValueError as e:                     # try/except solo para que el cuaderno no se detenga
    print("ValueError:", e)
```

```text
ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().
```

Punto a resaltar: `and` le pide a Python que decida si **una Series entera** es
verdadera o falsa, y no hay una respuesta; pandas se niega y lo dice. La
corrección es `&`, con paréntesis. Si se usa `&` pero se olvidan los paréntesis,
el error es otro (un `TypeError`, porque `&` se evalúa antes que `>` y
pandas intenta combinar un número con un `bool`): por eso la regla es un
paréntesis por condición. Y la trampa que conecta con el Paso 1:

```python
hombres = (pinguinos["sex"] == "Male").sum()
mujeres = (pinguinos["sex"] == "Female").sum()
print(hombres, mujeres, hombres + mujeres)   # ¿suman 344?
```

```text
168 165 333
```

Punto a resaltar: suman 333, no 344. **Una celda vacía no cumple una
comparación de igualdad**: no es `Male` y no es `Female`. Las 11 filas sin sexo
no caen en ninguno de los dos grupos y ningún filtro avisa. (Con `!=` pasa lo
contrario: el vacío sí es "distinto de `Male`", y entra; es una de las
preguntas del final.)

## Paso 4 — Ordenar con `sort_values`

Situación: "¿cuál es el pingüino más pesado?". En la hoja: ordenar la columna de
mayor a menor. No hace falta filtrar:

```python
mas_pesados = pinguinos.sort_values("body_mass_g", ascending=False)   # de mayor a menor
print(mas_pesados[["species", "island", "body_mass_g"]].head(3))      # las tres primeras
print(pinguinos["body_mass_g"].head(1))                               # la tabla original no cambió
```

```text
    species  island  body_mass_g
237  Gentoo  Biscoe       6300.0
253  Gentoo  Biscoe       6050.0
297  Gentoo  Biscoe       6000.0
0    3750.0
Name: body_mass_g, dtype: float64
```

Punto a resaltar: arriba están los Gentoo de Biscoe, y eso responde la pregunta
que quedó en el aire en el Paso 3. `sort_values` **devuelve una tabla nueva**: la
original sigue con el orden de siempre (la fila 0 vale 3750). Si se quiere
conservar el resultado hay que asignarlo a un nombre, como `mas_pesados`.
Dejar dicho también que los nulos quedan **por defecto al final**, en cualquier
orden que se pida, así que no aparecen entre los "más pesados" ni entre los "más
livianos".

## Paso 5 — Resumir por grupos: `groupby` y agregación

Situación: "¿cuánto pesa en promedio cada especie?". En la hoja sería una tabla
dinámica, o tres fórmulas con filtros. La receta tiene tres piezas que se dicen
en voz alta: **separar** la tabla por una columna, **elegir** qué columna
resumir y **aplicar** una o varias estadísticas.

```python
resumen = pinguinos.groupby("species")["body_mass_g"].agg(["count", "mean", "min", "max"])
#                   1. separar por especie     2. elegir el peso    3. cuatro estadísticas
print(resumen.round(1))                     # round(1): un decimal, para que quepa en pantalla
```

```text
           count    mean     min     max
species                                 
Adelie       151  3700.7  2850.0  4775.0
Chinstrap     68  3733.1  2700.0  4800.0
Gentoo       123  5076.0  3950.0  6300.0
```

Punto a resaltar: cada fila es un grupo y cada columna una estadística. Pedir
que miren `count` **antes** de decir nada del promedio: 151, 68 y 123. Contrastar
con la tabla real:

```python
print(pinguinos["species"].value_counts())   # cuántas filas tiene cada especie, con o sin peso
```

```text
species
Adelie       152
Gentoo       124
Chinstrap     68
Name: count, dtype: int64
```

Punto a resaltar: Adelie tiene 152 filas y 151 pesos; Gentoo, 124 y 123. `count`
y `mean` **ignoran las celdas vacías**; solo `count` lo delata. Un promedio sin su
`count` al lado es un número sin contexto. Cierre del paso: pedir una frase del
tipo "el peso medio de Gentoo es 5076 g, calculado con 123 de 124 pingüinos".

## Paso 6 — Nulos: cuántos hay y dónde están

Situación: antes de limpiar hay que saber qué se va a limpiar. `isna()` marca
cada celda vacía con `True`, y `sum()` las cuenta por columna:

```python
print(pinguinos.isna().sum())   # nulos por columna
```

```text
species               0
island                0
bill_length_mm        2
bill_depth_mm         2
flipper_length_mm     2
body_mass_g           2
sex                  11
dtype: int64
```

Punto a resaltar: las cuatro medidas tienen 2 nulos cada una, y `sex` tiene 11.
**Cada columna tiene su propia historia.** Pero saber cuántos no basta:
importa **cuáles filas**. `isna()` también sirve como máscara:

```python
sin_peso = pinguinos[pinguinos["body_mass_g"].isna()]        # la máscara del Paso 3, ahora con isna()
print(sin_peso[["species", "island", "body_mass_g", "sex"]])
print(pinguinos.loc[[3, 339]].isna().sum().sum())            # celdas vacías en esas dos filas juntas (5 por fila)
```

```text
    species     island  body_mass_g  sex
3    Adelie  Torgersen          NaN  NaN
339  Gentoo     Biscoe          NaN  NaN
10
```

Punto a resaltar: las dos filas con peso vacío (3 y 339) son también las que no
tienen medidas del pico ni de la aleta ni sexo: **observaciones casi sin
datos**. Ahora el contraste: las filas con al menos un nulo y, de ellas, las que
solo fallan en `sex`.

```python
con_algun_nulo = pinguinos.isna().any(axis=1)                # any(axis=1): True si la FILA tiene algún nulo
print(con_algun_nulo.sum())                                  # 11 filas
print(round(100 * con_algun_nulo.mean(), 1))                 # qué porcentaje de la tabla es
solo_sex = pinguinos["sex"].isna() & pinguinos["body_mass_g"].notna()   # sexo vacío pero con peso
print(solo_sex.sum())                                        # 9
```

```text
11
3.2
9
```

Punto a resaltar: 11 filas con algún nulo (3.2 % de la tabla), y de los 11 sexos
vacíos, 9 son de pingüinos que sí tienen todas sus medidas. Los nulos no caen al
azar. Guardar esa cifra (9): vuelve en el Paso 8.

## Paso 7 — Atípicos: señalar sin borrar

Situación: un **atípico** es un valor muy distinto del resto. No es un nulo: está
ahí, y puede ser un error de captura o un caso real y raro. Regla para decir en
voz alta: **se señala para investigar, no se borra de oficio.** Dos criterios.
Primero el **rango de dominio**: con conocimiento de lo que se mide, se define
qué es imposible. Se empieza mirando mínimo y máximo:

```python
columnas = ["bill_length_mm", "flipper_length_mm", "body_mass_g"]
print(pinguinos[columnas].describe().round(1).loc[["min", "max"]])   # solo las filas min y max de describe
```

```text
     bill_length_mm  flipper_length_mm  body_mass_g
min            32.1              172.0       2700.0
max            59.6              231.0       6300.0
```

Punto a resaltar: de 2700 a 6300 g, de 172 a 231 mm de aleta: todo plausible
para un pingüino. Preguntar al grupo qué peso sería imposible para un adulto
(respuesta razonable: menos de 2000 g o más de 7000 g, el criterio que se fija
aquí) y probar la máscara:

```python
fuera_de_dominio = (pinguinos["body_mass_g"] < 2000) | (pinguinos["body_mass_g"] > 7000)   # la regla de dominio
print(fuera_de_dominio.sum())   # cuántas filas la incumplen
```

```text
0
```

Punto a resaltar: 0 filas. **Encontrar cero atípicos también es un resultado**
y vale anotarlo. Segundo criterio, cuando no se sabe qué es imposible: el
**rango intercuartílico (IQR)**. Se toman el primer y el tercer cuartil con
`quantile`, se calcula su distancia y se sospecha de lo que queda a más de
1.5 IQR por fuera:

```python
q1 = pinguinos["body_mass_g"].quantile(0.25)   # cuartil 1: el 25 % de los pesos queda por debajo
q3 = pinguinos["body_mass_g"].quantile(0.75)   # cuartil 3: el 75 % de los pesos queda por debajo
iqr = q3 - q1                                  # distancia entre cuartiles
limite_inf = q1 - 1.5 * iqr                    # por debajo de esto, sospechoso
limite_sup = q3 + 1.5 * iqr                    # por encima de esto, sospechoso
print(q1, q3, iqr, limite_inf, limite_sup)

atipicos_global = (pinguinos["body_mass_g"] < limite_inf) | (pinguinos["body_mass_g"] > limite_sup)
print(atipicos_global.sum())                   # cuántas filas quedan fuera de los límites
```

```text
3550.0 4750.0 1200.0 1750.0 6550.0
0
```

Punto a resaltar: los límites son 1750 g y 6550 g; el máximo (6300) queda
adentro. De nuevo 0. Ahora la pregunta que cambia todo: "¿con quién se compara
cada pingüino?". Un pingüino de 2700 g es liviano **para un Gentoo**, pero
normal para un Adelie. Repetir el criterio **solo dentro de Chinstrap**:

```python
chinstrap = pinguinos[pinguinos["species"] == "Chinstrap"]   # la sub-tabla de una especie
c_q1 = chinstrap["body_mass_g"].quantile(0.25)
c_q3 = chinstrap["body_mass_g"].quantile(0.75)
c_iqr = c_q3 - c_q1
c_inf = c_q1 - 1.5 * c_iqr
c_sup = c_q3 + 1.5 * c_iqr
print(c_inf, c_sup)                                          # límites propios de Chinstrap

c_atipicos = chinstrap[(chinstrap["body_mass_g"] < c_inf) | (chinstrap["body_mass_g"] > c_sup)]
print(c_atipicos[["species", "body_mass_g"]])
```

```text
2793.75 4643.75
       species  body_mass_g
189  Chinstrap       4800.0
190  Chinstrap       2700.0
```

Punto a resaltar: con los límites de Chinstrap (2793.75 y 4643.75 g) salen **dos
filas**: 4800 g y 2700 g, el más pesado y el más liviano de la especie. El
criterio depende de la población con que se compare. Y son pesos perfectamente
posibles: son **señales para mirar con atención, no para eliminar**. Pedir al
grupo qué harían a continuación (respuesta esperada: mirar las otras medidas de
esas dos filas, buscar la fuente, decidir con un motivo).

## Paso 8 — Decidir: eliminar o imputar

Situación: ya se sabe qué falta y qué es raro. Ahora se decide, y cada opción
tiene un costo que se puede **medir**. Primero **eliminar** con `dropna`. Sin
argumentos descarta toda fila con *cualquier* nulo; con `subset`, solo mira las
columnas que importan para la pregunta:

```python
sin_nulos = pinguinos.dropna()                           # descarta cualquier fila con algún nulo
sin_peso_nulo = pinguinos.dropna(subset=["body_mass_g"])   # solo descarta las que tienen el peso vacío
print(pinguinos.shape, sin_nulos.shape, sin_peso_nulo.shape)
print(pinguinos.shape[0] - sin_nulos.shape[0], pinguinos.shape[0] - sin_peso_nulo.shape[0])   # filas perdidas
```

```text
(344, 7) (333, 7) (342, 7)
11 2
```

Punto a resaltar: si la pregunta es sobre el peso, `subset` pierde 2 filas
(0.6 %) y `dropna()` a secas pierde 11 (3.2 %), y 9 de esas 11 tenían un peso
perfectamente bueno (el 9 del Paso 6). **El costo de eliminar es cuántas filas
se pierden.** Ahora **imputar** con `fillna`, que rellena el hueco con un valor.
Para una columna numérica lo habitual es la **mediana** y no el promedio, porque
un valor extremo arrastra el promedio y la mediana no se mueve:

```python
mediana = pinguinos["body_mass_g"].median()                          # el valor del medio, ignora los nulos
imputado = pinguinos.copy()                                          # copia: la tabla original queda intacta
imputado["body_mass_g"] = imputado["body_mass_g"].fillna(mediana)    # patrón de pandas 3: asignar el resultado de vuelta
print(mediana, imputado["body_mass_g"].isna().sum())                 # la mediana usada y cuántos nulos quedan
print(pinguinos["body_mass_g"].isna().sum())                         # la original sigue con sus 2 nulos
```

```text
4050.0 0
2
```

Punto a resaltar: se usó 4050 g y ya no quedan nulos. **Escribir siempre
`df["col"] = df["col"].fillna(...)`.** No usar `inplace=True` sobre una columna
ni encadenar asignaciones del tipo `df["col"].fillna(..., inplace=True)`: en
pandas 3 eso **no modifica la tabla**; solo avisa y los nulos siguen ahí. En
Colab con pandas 2 esa forma puede comportarse distinto (no se verificó ahí);
no depender de ella, porque el mismo código no debe cambiar de resultado según
la versión. No ejecutarla en vivo. El costo de imputar es **cuánto se inventa**:
aquí, 2 valores de 344. Y el relleno puede ser injusto, ejercicio para el grupo:

```python
print(pinguinos.loc[339, "species"])                                 # ¿qué especie es la fila 339?
print(pinguinos.groupby("species")["body_mass_g"].median())          # mediana de cada especie
print(imputado.loc[339, "body_mass_g"])                              # qué valor recibió
```

```text
Gentoo
species
Adelie       3700.0
Chinstrap    3700.0
Gentoo       5000.0
Name: body_mass_g, dtype: float64
4050.0
```

Punto a resaltar: la fila 339 es un Gentoo, una especie con mediana de 5000 g, y
recibió 4050 g, el valor típico de **toda la tabla**. Con dos filas casi vacías,
eliminar era la decisión más honesta; con muchos huecos en una columna que sí se
necesita, imputar tendría más sentido. Para `sex` no hay mediana que valga: o se
filtran las filas sin sexo cuando la pregunta lo requiere, o se dejan fuera de
ese cálculo y se dice. Con esto se cierra el Paso 1: la fórmula 2 divide entre
las 333 con sexo, y eso, dicho en voz alta, es una decisión:

```python
con_sexo = pinguinos.dropna(subset=["sex"])                          # la pregunta es sobre sexo: solo mira esa columna
print(round((con_sexo["sex"] == "Female").mean(), 3))                # 0.495: la fórmula 2, ahora con su decisión explícita
```

```text
0.495
```

Punto a resaltar: el 0.495 deja de ser un resultado misterioso. Es "proporción
de hembras entre los 333 pingüinos con sexo registrado", y por eso es la
respuesta que se puede defender.

## Paso 9 — Documentar cada decisión de limpieza

Situación: dentro de una semana nadie recordará por qué la tabla tiene 342
filas. La práctica de trabajo es **anotar cada decisión**: qué columna, cuántas
filas afectó y por qué. Se puede escribir en una celda de texto, pero también
se puede construir la nota con los números reales, para que no se desactualice:

```python
antes = len(pinguinos)                                      # filas antes de la decisión
despues = len(sin_peso_nulo)                                # filas después de dropna(subset=["body_mass_g"])
perdidas = antes - despues

decisiones = [
    f"body_mass_g: {pinguinos['body_mass_g'].isna().sum()} nulos (filas 3 y 339), "
    f"eliminadas con dropna(subset); {antes} a {despues} filas ({perdidas / antes:.1%}). "
    "Motivo: no tenían ninguna medida corporal.",
    f"sex: {pinguinos['sex'].isna().sum()} nulos, sin imputar. "
    "Motivo: no hay valor típico para una categoría; se excluyen solo en los cálculos sobre sexo.",
    f"body_mass_g, atípicos: {int(atipicos_global.sum())} por IQR global y {len(c_atipicos)} por IQR "
    "dentro de Chinstrap (4800 g y 2700 g). Conservados: pesos plausibles, solo señalados.",
]
for linea in decisiones:
    print("-", linea)
```

```text
- body_mass_g: 2 nulos (filas 3 y 339), eliminadas con dropna(subset); 344 a 342 filas (0.6%). Motivo: no tenían ninguna medida corporal.
- sex: 11 nulos, sin imputar. Motivo: no hay valor típico para una categoría; se excluyen solo en los cálculos sobre sexo.
- body_mass_g, atípicos: 0 por IQR global y 2 por IQR dentro de Chinstrap (4800 g y 2700 g). Conservados: pesos plausibles, solo señalados.
```

Punto a resaltar: la nota responde las tres preguntas de quien lea el resultado:
**qué** se tocó, **cuántas** filas afectó y **por qué**. Con ella, el 342 ya
no es un número sin origen. Pedir al grupo que escriba su propia nota para
`dropna()` a secas y que compare cuántas filas quedan (333) y cuántas de ellas
se perdieron sin necesidad (9).

## Preguntas socráticas

Para lanzar al grupo si se estanca, con la respuesta esperada:

- **"Calculé el promedio de peso por especie y me dio un número razonable para
  cada una. ¿Qué más necesito mirar antes de publicarlo?"** Esperada: el
  `count` de cada grupo, porque `mean` ignora los nulos en silencio y el número
  puede salir de menos filas de las que se creen.
- **"Filtro `pinguinos[pinguinos['sex'] != 'Male']`. ¿Obtengo solo las hembras?"**
  Esperada: no; también entran las 11 filas con sexo vacío (176 filas en
  total, no 165), porque el vacío es distinto de `Male` y la comparación lo deja
  pasar. Para ver solo las
  hembras hay que comparar con `== "Female"`, y para ver las vacías, usar `isna()`.
- **"`loc[0:2]` y `iloc[0:2]` ¿devuelven lo mismo?"** Esperada: en esta tabla
  el índice coincide con la posición, pero `iloc[0:2]` excluye el final y
  devuelve dos filas, mientras que `loc[0:2]` incluye la etiqueta 2 y devuelve
  tres (se verifica con `len`). Con una tabla filtrada, cuyo índice ya no empieza en 0, la diferencia
  es todavía más visible.
- **"Dos compañeros encuentran cero atípicos por IQR en el peso de toda la tabla
  y concluyen que los datos están limpios. ¿Qué les dirían?"** Esperada: que
  falta comparar dentro de cada especie, que es la población real de
  comparación; y que cero atípicos tampoco prueba que no haya errores de otro
  tipo, como un nulo o un valor plausible pero mal copiado.
- **"Una columna tiene 40 % de nulos y la pregunta del proyecto depende de ella.
  ¿Eliminan las filas o imputan?"** Esperada: eliminar costaría casi la mitad de
  la tabla e imputar inventaría casi la mitad de la columna; ninguna es gratis.
  Hay que medir ambos costos, decidir con un motivo, anotarlo y, si es posible,
  consultar la fuente del dato para ver por qué falta.
- **"¿Por qué conviene `imputado = pinguinos.copy()` antes de rellenar, en vez de
  modificar `pinguinos` directamente?"** Esperada: porque la tabla original es la
  evidencia; si la modificas, ya no se puede comparar antes y después, ni
  rehacer la decisión con otro criterio.
