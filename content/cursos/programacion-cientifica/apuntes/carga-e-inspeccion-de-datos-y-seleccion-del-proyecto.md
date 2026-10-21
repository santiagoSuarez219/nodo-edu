> Sesión dictada en vivo por el docente, no es trabajo independiente del
> estudiante: no hay guía de laboratorio. El estudiante ya leyó la lección
> "Carga e inspección de datos y selección del proyecto" y respondió el
> cuestionario de cierre (aula invertida), así que la clase no la explica de
> nuevo: la **usa**. El hilo conductor es el archivo `estaciones.csv`, la
> versión "real" de la tabla `temps` de la Semana 9: las mismas 4 estaciones,
> pero ahora con 9 días, texto, fechas y dos datos sucios que el grupo debe
> encontrar solo con las herramientas de inspección. En cada paso se vuelve a
> la pregunta "¿qué haría yo con este archivo en la hoja de cálculo?" antes de
> escribir la línea de pandas. Todo corre en Google Colab, sin terminal ni
> instalación. Los pasos siguen el orden de la lección. **Alcance de hoy:** cargar
> e inspeccionar; los dos datos sucios se **detectan, no se arreglan** (limpiar,
> filtrar, ordenar y agrupar es la sesión siguiente). La elección del dataset
> y del proyecto no se hace hoy: el Paso 6 deja los criterios para que cada
> estudiante los use después.
>
> **Antes de clase:** subir `estaciones.csv` a Drive y compartirlo con el
> grupo; el docente lo sube también al panel de archivos de su Colab (ícono de
> carpeta a la izquierda) antes de proyectar. Las salidas de estos apuntes se
> verificaron con pandas 3 en una ejecución local; Colab puede traer pandas 2,
> donde dos detalles se ven distinto y **no son errores**: el texto aparece como
> `object` en vez de `str`, y la primera línea de `info()` dice
> `<class 'pandas.core.frame.DataFrame'>`. Avisarlo al grupo si alguien lo nota.

## Paso 1 — Un DataFrame a mano: la hoja de cálculo en Python

En la hoja se escribe una fila de títulos y debajo los datos. Primero armar
una tablita pequeña a mano (es la forma más corta de ver qué es un
DataFrame) antes de abrir ningún archivo:

```python
import pandas as pd   # alias estandar: pd (en Colab ya viene instalado)

# Cada clave del diccionario es el titulo de una columna; cada lista, sus celdas.
lecturas = pd.DataFrame({
    "estacion": ["EST-01", "EST-02", "EST-03"],     # texto
    "temperatura_c": [24.5, 29.4, 14.2],            # decimales
    "activa": [True, True, False],                  # verdadero/falso
})
print(lecturas)           # las filas se numeran solas: 0, 1, 2
print(lecturas.shape)     # (filas, columnas)
print(lecturas.dtypes)    # UN tipo por columna
```

```text
  estacion  temperatura_c  activa
0   EST-01           24.5    True
1   EST-02           29.4    True
2   EST-03           14.2   False
(3, 3)
estacion          str
temperatura_c    float64
activa              bool
dtype: object
```

Punto a resaltar: la diferencia con un `ndarray` está en `dtypes`: tres
columnas, tres tipos distintos en la misma tabla (en un arreglo de NumPy todo
sería de un solo tipo). Si en Colab sale `object` en vez de `str`, es lo mismo:
texto. Ahora una columna sola:

```python
temp = lecturas["temperatura_c"]   # una columna completa por su nombre, entre corchetes
print(temp)
print(type(temp).__name__)         # el nombre del tipo del objeto
print(temp.mean())                 # las estadisticas de la Semana 9 siguen funcionando
```

```text
0    24.5
1    29.4
2    14.2
Name: temperatura_c, dtype: float64
Series
22.7
```

Punto a resaltar: una columna suelta es una **Series** (valores más su nombre);
la tabla completa es un **DataFrame**. Y `mean()` es el mismo que se usó con
NumPy: nada de lo aprendido se pierde. Pedir al grupo que calcule a mano
`(24.5 + 29.4 + 14.2) / 3 = 22.7`.

## Paso 2 — Cargar `estaciones.csv` con `pd.read_csv`

Situación: alguien manda el archivo y solo se sabe el nombre. **Antes de
cargar nada, abrirlo como texto** en el panel de archivos de Colab (doble clic)
y mostrar las primeras líneas: cada línea es una fila, los valores van separados
por comas. Es lo que `read_csv` va a convertir en tabla:

```python
df = pd.read_csv("estaciones.csv")   # una sola linea: el archivo ya esta junto al cuaderno
print(df.shape)                      # ¿cuantas filas y columnas llegaron?
print(df.columns.tolist())           # los nombres de las columnas, como lista
```

```text
(36, 6)
['estacion', 'municipio', 'fecha', 'temperatura_c', 'humedad_pct', 'sensor']
```

Punto a resaltar: 36 filas y 6 columnas. Preguntar: "¿36 estaciones?" Respuesta:
no, son 4 estaciones por 9 días; **cada fila es una lectura, no una estación**.
Esa es la definición de dataset de la lección: filas = observaciones, columnas =
variables.

Mostrar el error más común del día (lo comete alguien en cada grupo) **a
propósito**, antes de que ocurra solo:

```python
try:
    pd.read_csv("estaciones_2026.csv")   # un nombre que no esta en el panel de archivos
except FileNotFoundError as e:           # try/except solo para que el cuaderno no se detenga
    print("FileNotFoundError:", e)
```

```text
FileNotFoundError: [Errno 2] No such file or directory: 'estaciones_2026.csv'
```

Punto a resaltar: el mensaje dice exactamente qué falló. Casi siempre es una
de dos causas: el archivo no se subió al panel de archivos, o el nombre no
coincide letra por letra (mayúsculas incluidas). Pedir al grupo que mire el
panel de archivos para comprobarlo. Mencionar de pasada, sin ejecutarlo, que
si un CSV viene de Excel en español puede necesitar `sep=";"` y, si las tildes
salen raras, `encoding="latin-1"`; con `estaciones.csv` no hace falta
ninguno.

## Paso 3 — Primera lectura: head, tail, shape, info y dtypes

Regla para decir en voz alta: **nunca se calcula nada antes de mirar el
archivo**. Cuatro herramientas, una pregunta cada una:

```python
print(df.head())    # ¿Como se ve? Las primeras 5 filas
print(df.tail(3))   # las ultimas 3: tambien hay que ver el final del archivo
print(df.shape)     # ¿Que tan grande es? (filas, columnas)
```

```text
  estacion municipio       fecha  temperatura_c  humedad_pct sensor
0   EST-01  Medellín  2026-10-01           24.5         68.0  DHT22
1   EST-01  Medellín  2026-10-02           25.1         66.0  DHT22
2   EST-01  Medellín  2026-10-03           26.3         64.0  DHT22
3   EST-01  Medellín  2026-10-04           27.0         62.0  DHT22
4   EST-01  Medellín  2026-10-05           25.8         65.0  DHT22
   estacion   municipio       fecha  temperatura_c  humedad_pct sensor
33   EST-04  Valledupar  2026-10-07           34.5         49.0  BME280
34   EST-04  Valledupar  2026-10-08           33.4         53.0  BME280
35   EST-04  Valledupar  2026-10-09           34.0         51.0  BME280
(36, 6)
```

Punto a resaltar: `humedad_pct` aparece como `68.0`, con decimal, aunque en
el archivo decía `68`. Dejar la pregunta en el aire ("¿por qué?"): se responde
en el siguiente bloque. Ahora la radiografía:

```python
df.info()   # resumen columna por columna; info() ya imprime solo, no lleva print()
```

```text
<class 'pandas.DataFrame'>
RangeIndex: 36 entries, 0 to 35
Data columns (total 6 columns):
 #   Column         Non-Null Count  Dtype  
---  ------         --------------  -----  
 0   estacion       36 non-null     str    
 1   municipio      36 non-null     str    
 2   fecha          36 non-null     str    
 3   temperatura_c  36 non-null     float64
 4   humedad_pct    35 non-null     float64
 5   sensor         36 non-null     str    
dtypes: float64(2), str(4)
memory usage: 2.9 KB
```

Punto a resaltar (dos hallazgos, que el grupo los encuentre antes de decirlos):

1. **`Non-Null Count`**: todas las columnas tienen 36 valores menos
   `humedad_pct`, que tiene 35. Falta una lectura. Eso explica el `68.0`: una
   celda vacía obliga a la columna a ser decimal.
2. **`Dtype` de `fecha`**: es texto (`str`, `object` en Colab con pandas 2), no
   una fecha. Por hoy solo se **detecta**; convertirla es trabajo de la
   próxima sesión.

La línea `memory usage` y la primera línea (`<class ...>`) cambian según la
versión de pandas: no leerlas, no importan. Para confirmar los tipos sin el
resto:

```python
print(df.dtypes)   # solo la lista de tipos, una por columna
```

```text
estacion             str
municipio            str
fecha                str
temperatura_c    float64
humedad_pct      float64
sensor               str
dtype: object
```

Punto a resaltar: en esta salida el `dtype: object` del final es el del
resultado completo (una Series de tipos), no el de las columnas; no confundir
con el `object` que Colab puede mostrar para el texto.

## Paso 4 — Resumir con describe y value_counts: leer las señales de alerta

Para las columnas numéricas, `describe()` calcula de golpe lo que en la
Semana 9 se pedía por separado con `mean`, `std`, `min` y `max`. **Antes de
ejecutar**, pedir al grupo que prediga qué rango de valores es razonable para
una humedad relativa en porcentaje (respuesta: entre 0 y 100) y para una
temperatura de estas ciudades (entre 13 y 36 °C aproximadamente):

```python
print(df.describe())   # solo columnas numericas: count, mean, std, min, cuartiles y max
```

```text
       temperatura_c  humedad_pct
count      36.000000    35.000000
mean       26.122222    37.542857
std         7.442930   180.763632
min        13.500000  -999.000000
25%        22.225000    56.000000
50%        28.200000    68.000000
75%        31.950000    74.500000
max        35.100000    88.000000
```

Punto a resaltar: dos señales de alerta en `humedad_pct`. (1) El `count` es
35 y no 36, igual que en `info()`. (2) El `min` es `-999`: una humedad
negativa no existe. Muchos archivos usan `-999` para decir "no se pudo medir".
Por eso el promedio sale en 37.5 y la desviación en 180, mientras la
mediana (`50%`) dice 68, que es lo razonable. Pregunta al grupo: "¿Con cuál de
los dos números nos quedaríamos si no hubiéramos mirado el mínimo?" Respuesta:
con ninguno de forma confiable; el promedio es falso y no hay error ni
advertencia. La inspección existe para ver eso **antes** de calcular.

Confirmar cuántas hay de cada problema, sin tocar los datos:

```python
print(df.isna().sum())                  # celdas vacias por columna (isna marca True donde falta el valor)
print((df["humedad_pct"] == -999).sum())   # cuantas veces aparece el -999 (True cuenta como 1)
```

```text
estacion         0
municipio        0
fecha            0
temperatura_c    0
humedad_pct      1
sensor           0
dtype: int64
1
```

Punto a resaltar: un valor vacío y un `-999`: dos formas distintas de decir
"dato ausente", y solo una de ellas es visible para `info()`. Aclarar que
**hoy solo se cuentan**; saber en qué fila están, quitarlas o reemplazarlas
es la sesión siguiente. Ahora las columnas de texto: para ellas no hay
promedio, la pregunta es qué categorías hay y cuántas veces aparece cada una.

```python
print(df["sensor"].value_counts())      # frecuencia de cada categoria de la columna sensor
print(df["municipio"].value_counts())
print(df["municipio"].nunique())        # nunique: cuantas categorias distintas hay
```

```text
sensor
DHT22     18
BME280    18
Name: count, dtype: int64
municipio
Medellín        9
Barranquilla    9
Rionegro        9
Valledupar      9
Name: count, dtype: int64
4
```

Punto a resaltar: 9 lecturas por municipio y 18 por sensor, todo cuadra con
las 4 estaciones por 9 días. `value_counts()` también detecta una categoría
escrita de dos maneras (por ejemplo `Medellin` y `Medellín`): aquí no pasa, pero
es lo que se busca. Cerrar el paso con la tabla de la lección, proyectada, y
que el grupo diga cuál herramienta usó para cada pregunta:

```text
¿Cómo se ve?                    head / tail
¿Qué tan grande es?             shape
¿Qué tipo tiene cada columna?   dtypes / info
¿Falta algo?                    Non-Null Count de info, isna().sum()
¿Los valores tienen sentido?    describe
¿Qué categorías hay?            value_counts
```

## Paso 5 — Repetir el recorrido con otro dataset: pingüinos y un archivo de Colab

La idea de este paso es que el recorrido **no depende del archivo**. Primero un
dataset que no se sube: seaborn lo descarga con una línea (Colab ya trae
`seaborn`). Pedir al grupo que diga las cinco herramientas **antes** de
escribirlas:

```python
import seaborn as sns   # alias estandar: sns

pd.set_option("display.max_columns", None)   # que print muestre todas las columnas sin cortar con ...
pd.set_option("display.width", 200)          # ancho de linea mayor, para que no salte de renglon

pinguinos = sns.load_dataset("penguins")     # descarga el dataset (necesita internet)
print(pinguinos.head())
print(pinguinos.shape)
pinguinos.info()
```

```text
  species     island  bill_length_mm  bill_depth_mm  flipper_length_mm  body_mass_g     sex
0  Adelie  Torgersen            39.1           18.7              181.0       3750.0    Male
1  Adelie  Torgersen            39.5           17.4              186.0       3800.0  Female
2  Adelie  Torgersen            40.3           18.0              195.0       3250.0  Female
3  Adelie  Torgersen             NaN            NaN                NaN          NaN     NaN
4  Adelie  Torgersen            36.7           19.3              193.0       3450.0  Female
(344, 7)
<class 'pandas.DataFrame'>
RangeIndex: 344 entries, 0 to 343
Data columns (total 7 columns):
 #   Column             Non-Null Count  Dtype  
---  ------             --------------  -----  
 0   species            344 non-null    str    
 1   island             344 non-null    str    
 2   bill_length_mm     342 non-null    float64
 3   bill_depth_mm      342 non-null    float64
 4   flipper_length_mm  342 non-null    float64
 5   body_mass_g        342 non-null    float64
 6   sex                333 non-null    str    
dtypes: float64(4), str(3)
memory usage: 18.9 KB
```

Punto a resaltar: aquí los vacíos se ven distinto. En la fila 3 aparece
`NaN` (*not a number*, la marca de pandas para "falta este valor"); es lo que
`read_csv` pone cuando encuentra una celda vacía, como la de `estaciones.csv`.
Preguntar al grupo: "¿cuál columna tiene más datos faltantes y cuántos?"
Respuesta: `sex`, con 344 - 333 = 11. Y las demás numéricas, 2 cada una.
Continuar con el resumen:

```python
print(pinguinos.describe())
print(pinguinos["species"].value_counts())
print(pinguinos.isna().sum())
```

```text
       bill_length_mm  bill_depth_mm  flipper_length_mm  body_mass_g
count      342.000000     342.000000         342.000000   342.000000
mean        43.921930      17.151170         200.915205  4201.754386
std          5.459584       1.974793          14.061714   801.954536
min         32.100000      13.100000         172.000000  2700.000000
25%         39.225000      15.600000         190.000000  3550.000000
50%         44.450000      17.300000         197.000000  4050.000000
75%         48.500000      18.700000         213.000000  4750.000000
max         59.600000      21.500000         231.000000  6300.000000
species
Adelie       152
Gentoo       124
Chinstrap     68
Name: count, dtype: int64
species               0
island                0
bill_length_mm        2
bill_depth_mm         2
flipper_length_mm     2
body_mass_g          2
sex                  11
dtype: int64
```

Punto a resaltar: aquí los mínimos y máximos **sí tienen sentido** (longitud del pico
de 32 a 60 mm, masas de 2,7 a 6,3 kg): la señal de alerta de `estaciones.csv`
no aparece. Comparar: este dataset tiene 344 filas y vacíos, pero ningún
`-999`. Que el grupo concluya que cada archivo trae sus propios problemas y el
recorrido es el mismo.

Para cerrar el paso, la tercera forma de cargar: un archivo que Colab ya trae,
sin subir nada. Se llega a él por su ruta completa (la carpeta `sample_data`
vive en `/content/`):

```python
casas = pd.read_csv("/content/sample_data/california_housing_train.csv")   # ruta completa
print(casas.shape)
casas.info()
```

**Por verificar en Colab** (no se pudo ejecutar localmente: el archivo solo
existe en el entorno de Colab). Lo esperado, según el archivo estándar de
`sample_data`: unas 17 000 filas y 9 columnas numéricas (`longitude`,
`latitude`, `housing_median_age`, `total_rooms`, `total_bedrooms`,
`population`, `households`, `median_income`, `median_house_value`). Ejecutarlo
una vez antes de clase y apuntar la salida real. Punto a resaltar: aquí hay
**miles de filas**, no 36 ni 344; es el tamaño al que apunta un dataset para un
proyecto. Si no aparece la carpeta `sample_data` (el runtime se reinició), el
`FileNotFoundError` del Paso 2 vuelve a ser el protagonista: usarlo.

Y la tabla de lecturas por formato, sin ejecutarla (basta nombrarla):
`pd.read_excel(...)` para hojas de cálculo (con `sheet_name` se elige la hoja),
`pd.read_json(...)` para respuestas de una API, y las tres aceptan una URL. Todas
devuelven el mismo objeto: un DataFrame.

## Paso 6 — Aplicar la checklist: ¿este dataset sirve para un proyecto?

Cierre. La inspección que se acaba de hacer **es** la forma de evaluar un
dataset. Proyectar los cinco criterios de la lección y llenarlos con el grupo,
primero para `estaciones.csv` y después para los pingüinos. Este es el único
bloque de código del paso; reúne lo que ya se vio en una sola celda por dataset:

```python
for nombre, tabla in [("estaciones", df), ("pinguinos", pinguinos)]:   # recorre los dos DataFrames
    print("====", nombre, "====")
    print("filas y columnas:", tabla.shape)                             # criterio 1: tamaño
    print("tipos de columna:", sorted(set(tabla.dtypes.astype(str))))   # criterio 2: columnas variadas
    print("celdas vacias:", int(tabla.isna().sum().sum()))              # alerta: datos que faltan
```

```text
==== estaciones ====
filas y columnas: (36, 6)
tipos de columna: ['float64', 'str']
celdas vacias: 1
==== pinguinos ====
filas y columnas: (344, 7)
tipos de columna: ['float64', 'str']
celdas vacias: 19
```

Punto a resaltar: `str` (en Colab con pandas 2 saldrá `object`) y `float64`
son los dos tipos de ambos datasets; no hay un solo entero ni una sola fecha
real, así que la variedad es modesta en los dos. Mirar la celda `19`: son las
11 de `sex` más 2 por cada una de las 4 columnas numéricas, `11 + 8 = 19`.
Verificarlo a mano en voz alta.

Los cinco criterios, en la pizarra o en una diapositiva, llenos para
`estaciones.csv` (lo que el grupo debe poder decir sin mirar la lección):

```text
Criterio                      estaciones.csv
1. Tamaño manejable           36 filas: cabe de sobra, pero es muy pequeño para conclusiones
2. Columnas variadas          texto, decimales y fechas (leidas como texto): hay con que comparar
3. Una pregunta formulable    "¿que estacion es la mas calurosa?" "¿cambia la humedad segun el sensor?"
4. Licencia y fuente claras   no se ve con pandas: es un archivo de clase, sin fuente publicada
5. Carga sin sorpresas        read_csv abrio sin parametros extra ni errores
```

Punto a resaltar: el criterio 4 es el único que **ninguna línea de código
responde**: se revisa en la página de donde viene el dato (quién lo publica,
qué significan las columnas, qué uso permite). Cerrar con la idea de la
lección: un `-999` o una celda vacía **no descartan** un dataset, casi todos
los reales los traen; lo que importa es haberlos visto antes de elegirlo. Pedir
al grupo que aplique los mismos cinco criterios a los pingüinos y a
`california_housing_train.csv` como ejercicio mental para cuando llegue la
elección de dataset (no se elige hoy).

## Preguntas socráticas

Para lanzar al grupo si se estanca, con la respuesta esperada:

- **"`pd.read_csv("estaciones.csv")` devolvió 36 filas. ¿Cuántas estaciones
  hay y cómo lo saben sin contar?"** Esperada: 4, con `df["estacion"].nunique()`
  (o `value_counts()`); cada fila es una lectura, no una estación.
- **"`humedad_pct` en el archivo dice `68` y en el DataFrame `68.0`. ¿Por qué?"**
  Esperada: hay una celda vacía; pandas la lee como `NaN`, y `NaN` es un
  decimal, así que toda la columna pasa a decimales.
- **"`info()` solo reporta un valor faltante en `humedad_pct`. ¿Entonces el
  promedio de `describe()` es confiable?"** Esperada: no. El `-999` no cuenta
  como vacío para pandas, es un número cualquiera; solo el `min` de `describe()`
  lo delata. `info()` y `describe()` se complementan.
- **"¿Por qué la mediana de `humedad_pct` (68) es razonable y el promedio
  (37.5) no?"** Esperada: un solo valor extremo arrastra el promedio, pero la
  mediana solo depende del valor del medio.
- **"Tienen un archivo que Excel exportó y `read_csv` devuelve una sola
  columna con todo pegado. ¿Qué parámetro prueban primero?"** Esperada:
  `sep=";"`, porque el separador de Excel en español suele ser el punto y coma.
- **"Un dataset tiene 40 filas, 3 columnas y nadie sabe de dónde salió.
  ¿Sirve para un proyecto? ¿Qué criterio falla primero?"** Esperada: falla el
  tamaño y la fuente; con tan pocas filas no hay conclusiones, y sin fuente no
  se sabe si se puede usar ni qué significan las columnas.
