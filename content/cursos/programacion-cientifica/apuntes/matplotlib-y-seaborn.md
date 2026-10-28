> Sesión dictada en vivo por el docente, no es trabajo independiente del
> estudiante: no hay guía de laboratorio. El estudiante ya leyó la lección
> "Matplotlib y Seaborn" y respondió el cuestionario de cierre (aula invertida),
> así que la clase no la explica de nuevo: la **usa**. El hilo conductor es el
> dataset de pingüinos (344 filas) de las sesiones anteriores y la pregunta con
> la que abre la lección: un número, la correlación de -0.24 entre el largo y la
> profundidad del pico, parece decir algo y el gráfico dice otra cosa. Todo el
> guion trabaja sobre una sola tabla, `pinguinos`, en un solo cuaderno de Colab
> que corre de punta a punta, y cada paso responde una pregunta de las que de
> verdad se le haría a esa tabla.
>
> **Alcance de hoy:** elegir el gráfico según el tipo de variable, construirlo
> con Matplotlib (figura y ejes) y con Seaborn, leer un boxplot, un mapa de calor
> y un `pairplot`, resolver la pregunta inicial (paradoja de Simpson), guardar el
> gráfico en `visualizaciones/` y subirlo al repositorio. La entrega y la
> evaluación del proyecto **no se tratan en estos apuntes**.
>
> **Antes de clase:** abrir un cuaderno nuevo de Colab y pegar la primera celda
> (imports y carga) sin ejecutarla, para ejecutarla en vivo. Necesita internet:
> `sns.load_dataset` descarga el dataset. Las salidas de estos apuntes se
> verificaron con pandas 3.0.2, matplotlib 3.10.8 y seaborn 0.13.2 en una
> ejecución local de todo el guion de corrido (con el backend sin pantalla, así
> que las imágenes no se vieron en pantalla: se comprobaron las cifras). Colab
> puede traer otras versiones: se espera que las cifras coincidan, y si algún
> `dtype` dice `object` donde estos apuntes dirían `str`, es lo mismo: texto. El
> Paso 7 usa `!git` y se comprobó solo la sintaxis, no se ejecutó contra un
> repositorio real.

## Paso 1 — La pregunta del pico

Situación: "¿los pingüinos de pico más largo tienen también el pico más
profundo?". Primero a la hoja de cálculo: la función de correlación entre dos
columnas, y una respuesta con un solo número. Los imports van todos en esta
primera celda y no se repiten más adelante:

```python
import os                                        # para crear la carpeta de gráficos en el Paso 7
import pandas as pd                              # alias estándar: pd
import seaborn as sns                            # alias estándar: sns; también descarga el dataset
import matplotlib.pyplot as plt                  # alias estándar: plt; la base de todos los gráficos

pd.set_option("display.max_columns", None)   # que print muestre todas las columnas sin cortar con ...
pd.set_option("display.width", 200)          # ancho de línea mayor, para que no salte de renglón

pinguinos = sns.load_dataset("penguins")         # descarga el dataset (necesita internet)
print(pinguinos.shape)                           # (filas, columnas): 344 pingüinos, 7 variables

# corr() calcula la correlación entre dos columnas; round(..., 2) la deja en dos decimales
print(round(pinguinos["bill_length_mm"].corr(pinguinos["bill_depth_mm"]), 2))
# dropna() quita las filas con algún nulo en esas dos columnas: ¿con cuántos pares se calculó?
print(pinguinos[["bill_length_mm", "bill_depth_mm"]].dropna().shape)
```

```text
(344, 7)
-0.24
(342, 2)
```

Punto a resaltar: -0.24 es negativo, así que "a más largo el pico, menos
profundo". Pregunta al grupo: "¿se lo creen?". Dejar que alguien diga "habría
que verlo". Ese es el hilo de toda la clase: **un número resume y un gráfico
dice si el resumen miente**. Se calculó con 342 pares (dos filas tienen nulos),
dato que Matplotlib también va a respetar en silencio. Dejar la pregunta abierta
hasta el Paso 6.

## Paso 2 — Elegir el gráfico según la variable

Situación: antes de escribir una línea de Matplotlib, la pregunta es **qué
tipo de variable es cada columna**. En la hoja de cálculo, el asistente de
gráficos propone uno; aquí lo decide uno:

```python
print(pinguinos.dtypes)   # el tipo de cada columna: texto (categórica) o decimal (numérica)
```

```text
species                  str
island                   str
bill_length_mm       float64
bill_depth_mm        float64
flipper_length_mm    float64
body_mass_g          float64
sex                      str
dtype: object
```

Punto a resaltar: tres categóricas (`species`, `island`, `sex`) y cuatro
numéricas. Con la tabla de la lección en pantalla, recorrer en voz alta cómo la
**pregunta** y el **tipo** eligen el gráfico:

```python
# Cómo se distribuye la masa?       -> 1 numérica               -> histograma
# Cuántos pingüinos hay por isla?   -> 1 categórica             -> barras
# Cómo se compara la masa por especie? -> numérica + categórica -> boxplot
# Se relacionan aleta y masa?       -> 2 numéricas              -> dispersión
# Cómo cambia algo en el tiempo?    -> numérica + orden         -> líneas
```

Punto a resaltar: el dataset no tiene fechas, así que ninguna pregunta de hoy
con el dataset pide líneas; las usaremos con una serie inventada en el Paso 4.
Insistir en que **no se elige por gusto**: pastel con más de cuatro porciones,
líneas sin orden y 3D casi siempre estorban.

## 🗳️ Votación — Un gráfico para el tiempo

Cuándo: justo después del Paso 2.

Una secretaría de salud quiere mostrar **cuántos casos de dengue se notificaron
cada semana de 2025** (52 números, uno por semana). ¿Qué gráfico elige?

- (a) Un gráfico de pastel con una porción por semana.
- (b) Un gráfico de líneas, con la semana en el eje x y los casos en el eje y.
- (c) Una dispersión con la semana en el eje x y los casos en el eje y, sin unir los puntos.
- (d) Un histograma de los 52 números de casos.

Correcta: (b)

Qué revela cada distractor: (a) → cree que "partes de un total" sirve para
cualquier conteo; con 52 porciones el ojo no compara nada. (c) → acierta con los
ejes pero ignora que la secuencia tiene orden; sin la línea, el ojo no sigue la
subida y la bajada (es la opción que más suele dividir al grupo). (d) → confunde
"distribución de valores" con "evolución en el tiempo": el histograma agrupa los
52 números y pierde en qué semana ocurrió cada uno.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en parejas
2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues; si hay
menos de 30 %, vuelves a explicar la tabla del Paso 2 antes de discutir.

## Paso 3 — Histograma con Matplotlib: figura, ejes y unidad

Situación: "¿cómo se reparte la masa corporal?". En la hoja sería un histograma
con el asistente. Aquí se construye: primero el lienzo y los ejes, después todo
lo demás **sobre `ax`**.

```python
# fig es el lienzo completo; ax es el área del gráfico. figsize = (ancho, alto) en pulgadas
fig, ax = plt.subplots(figsize=(8, 4.5))
ax.hist(pinguinos["body_mass_g"], bins=20)          # 20 columnas; Matplotlib ignora los 2 nulos en silencio
ax.set_title("Distribución de la masa corporal de los pingüinos")   # título: qué se ve
ax.set_xlabel("Masa corporal (g)")                  # eje x: nombre y unidad entre paréntesis
ax.set_ylabel("Número de pingüinos")                # eje y: qué se cuenta
plt.show()                                          # muestra la figura en el cuaderno
```

Punto a resaltar: hay **dos jorobas**, no una campana: un grupo cerca de 3700 g y
otro cerca de 5000 g. Un promedio describiría a muy pocos:

```python
print(pinguinos["body_mass_g"].isna().sum())        # nulos de la columna: Matplotlib los saltó sin avisar
print(round(pinguinos["body_mass_g"].mean()))       # el promedio: cae justo en el valle entre las jorobas
```

```text
2
4202
```

Punto a resaltar: dibujó 342 pingüinos, no 344, y no dijo nada; y 4202 g es un
valor que casi ningún pingüino tiene. Pedir que alguien cambie `bins=20` por
`bins=5` y mire qué pasa con las jorobas (desaparecen): **el número de columnas
también es una decisión**.

## Paso 4 — Barras, dispersión y líneas

Situación: tres preguntas, tres gráficos. Primero, "¿cuántos pingüinos hay de
cada especie?". Barras, y esta vez con un `count` explícito, igual que el
`count` del `groupby` de la sesión anterior:

```python
cuentas = pinguinos["species"].value_counts()       # conteo por categoría: Adelie 152, Gentoo 124, Chinstrap 68
print(cuentas)

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.bar(cuentas.index, cuentas.values)               # ax.bar(etiquetas, alturas): una barra por categoría
ax.set_title("Pingüinos por especie")
ax.set_xlabel("Especie")
ax.set_ylabel("Número de pingüinos")
plt.show()
```

```text
species
Adelie       152
Gentoo       124
Chinstrap     68
Name: count, dtype: int64
```

Punto a resaltar: las barras **empiezan en 0**: su altura es la cantidad. Pedir
que alguien estime a ojo cuántas veces más grande es Adelie que Chinstrap (2.2
veces: 152 sobre 68) y comprobar con la tabla. Si el eje empezara en 50, la barra de
Adelie parecería casi seis veces la de Chinstrap. Segunda pregunta: "¿se relacionan la aleta y la masa?". Dos
numéricas, dispersión:

```python
fig, ax = plt.subplots(figsize=(8, 4.5))
# ax.scatter(x, y): un punto por pingüino; los 2 con nulos no se dibujan
ax.scatter(pinguinos["flipper_length_mm"], pinguinos["body_mass_g"])
ax.set_title("Longitud de la aleta y masa corporal")
ax.set_xlabel("Longitud de la aleta (mm)")
ax.set_ylabel("Masa corporal (g)")
plt.show()

print(round(pinguinos["flipper_length_mm"].corr(pinguinos["body_mass_g"]), 2))   # el número que resume la nube
```

```text
0.87
```

Punto a resaltar: la nube sube de izquierda a derecha y el número (0.87) cuenta
la **misma historia**. Cuando número y gráfico coinciden, el resumen no miente
(todavía). Tercera, "¿cómo cambia algo en una secuencia?". Líneas, con una serie
**inventada** de siete pesajes (se dice en voz alta que es inventada, y el
título también):

```python
pesajes = [3750, 3800, 3880, 3950, 4020, 4090, 4150]   # siete pesajes de un pingüino imaginario, en g

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(range(1, 8), pesajes, marker="o")              # ax.plot(x, y) une los puntos; marker="o" marca cada uno
ax.set_title("Masa de un pingüino en siete pesajes (datos de ejemplo)")
ax.set_xlabel("Número de pesaje")
ax.set_ylabel("Masa corporal (g)")
ax.tick_params(axis="x", labelrotation=45)             # gira las marcas del eje x si se pisan
fig.tight_layout()                                     # reacomoda márgenes para que nada quede cortado
plt.show()
```

Punto a resaltar: la línea tiene sentido porque el eje x **tiene orden** (primer
pesaje, segundo, tercero). Preguntar qué pasaría si se unieran con una línea
`Adelie`, `Chinstrap` y `Gentoo`: la línea sugiere una continuidad que no existe.

## Paso 5 — Seaborn: lo mismo en una línea

Situación: "¿y si no quiero escribir todo eso?". Seaborn entiende el DataFrame:
se le dice qué columna va en cada eje y se encarga del resto. Se activa un tema
una sola vez, con una paleta que distingue colores incluso con daltonismo:

```python
sns.set_theme(palette="colorblind")                          # tema y paleta para todo lo que sigue

ax = sns.histplot(data=pinguinos, x="body_mass_g", bins=20)  # el mismo histograma del Paso 3, en una línea
ax.set_title("Distribución de la masa corporal de los pingüinos")   # devuelve un ax de Matplotlib: se usa igual
ax.set_xlabel("Masa corporal (g)")
plt.show()
```

Punto a resaltar: el resultado es el histograma del Paso 3, sin `fig` ni
`ax.hist`, y como `histplot` devuelve un `ax`, **todo lo aprendido sigue
valiendo**. Ahora el boxplot, para la pregunta "¿cómo se compara la masa por
especie?":

```python
fig, ax = plt.subplots(figsize=(8, 4.5))
sns.boxplot(data=pinguinos, x="species", y="body_mass_g", ax=ax)   # una caja por especie; ax=ax lo dibuja en nuestros ejes
ax.set_title("Masa corporal por especie")
ax.set_xlabel("Especie")
ax.set_ylabel("Masa corporal (g)")
plt.show()

print(pinguinos.groupby("species")["body_mass_g"].median())      # las medianas, para leer la línea del centro
```

```text
species
Adelie       3700.0
Chinstrap    3700.0
Gentoo       5000.0
Name: body_mass_g, dtype: float64
```

Punto a resaltar: se lee así: línea del centro = mediana, caja = del cuartil 1 al
cuartil 3 (el IQR que ya usaron para los atípicos), bigotes hasta 1.5 IQR y
puntos sueltos = atípicos. Gentoo (5000 g) es otro grupo; Adelie y Chinstrap
tienen la **misma mediana** (3700 g) y cajas que se traslapan: la diferencia entre
ellas no es clara. Y la dispersión con `hue`, que **pinta cada grupo de un
color**:

```python
fig, ax = plt.subplots(figsize=(8, 4.5))
sns.scatterplot(data=pinguinos, x="bill_length_mm", y="bill_depth_mm", hue="species", ax=ax)
ax.set_title("Largo y profundidad del pico por especie")
ax.set_xlabel("Largo del pico (mm)")
ax.set_ylabel("Profundidad del pico (mm)")
plt.show()
```

Punto a resaltar: no la comenten todavía; solo pedir al grupo que **describa lo
que ve**: tres nubes separadas, una por especie. Con esto en pantalla se abre el
siguiente paso.

## Paso 6 — Mapa de calor, pairplot y la pregunta del pico

Situación: "quiero ver todas las relaciones de una vez". El **mapa de calor**
pinta la matriz de correlaciones, pero hay un error que casi todos cometen al
primer intento, **hecho a propósito** antes de que ocurra solo:

**🐞 Error planeado:** escribir `sns.heatmap(pinguinos.corr())`, con la tabla
completa y sin `numeric_only=True`.
**Síntoma:** la celda falla con `ValueError: could not convert string to float:
'Adelie'` (en pandas 3; con pandas 2 el mensaje es el mismo).
**Pregunta al grupo:** "¿qué columna le pide a la correlación que convierta
`Adelie` en un número, y por qué tendría que poder?"
**Corrección:** las columnas de texto (`species`, `island`, `sex`) no tienen
correlación; hay que descartarlas con `numeric_only=True`, antes de dibujar:

```python
try:
    sns.heatmap(pinguinos.corr())      # el error: la tabla incluye columnas de texto
except ValueError as e:                # try/except solo para que el cuaderno no se detenga
    print("ValueError:", e)
```

```text
ValueError: could not convert string to float: 'Adelie'
```

Punto a resaltar: el error ocurre en `pinguinos.corr()`, **antes** de que
`heatmap` reciba nada; el mensaje nombra el primer valor de texto que encuentra.
Ahora, la corrección:

```python
corr = pinguinos.corr(numeric_only=True)     # solo las 4 columnas numéricas
print(corr.round(2))                         # la matriz que se va a pintar

fig, ax = plt.subplots(figsize=(7, 5))
# annot=True escribe el número en cada celda; fmt=".2f" lo deja en 2 decimales
# vmin=-1 y vmax=1 fijan la escala completa; cmap="vlag" separa positivos (rojo) de negativos (azul)
sns.heatmap(corr, annot=True, fmt=".2f", cmap="vlag", vmin=-1, vmax=1, ax=ax)
ax.set_title("Correlación entre las medidas de los pingüinos")
plt.show()
```

```text
                   bill_length_mm  bill_depth_mm  flipper_length_mm  body_mass_g
bill_length_mm               1.00          -0.24               0.66         0.60
bill_depth_mm                -0.24           1.00              -0.58        -0.47
flipper_length_mm             0.66          -0.58               1.00         0.87
body_mass_g                   0.60          -0.47               0.87         1.00
```

Punto a resaltar: ahí está de nuevo el -0.24 (largo contra profundidad del
pico) y el 0.87 de aleta y masa. Pero el mapa de calor, como el número, es el
**resumen global**. Para ver los datos detrás, `pairplot`:

```python
# pairplot dibuja todas las parejas de variables numéricas; hue separa por especie
sns.pairplot(pinguinos, hue="species")
plt.show()
```

Punto a resaltar: fijarse en la celda de largo del pico contra profundidad: tres
nubes, y **dentro de cada una la tendencia sube**. Ya es la dispersión del Paso 5.
Confirmarlo con los números por especie:

```python
for especie, grupo in pinguinos.groupby("species"):                  # una vez por cada especie
    r = grupo["bill_length_mm"].corr(grupo["bill_depth_mm"])         # la correlación solo dentro del grupo
    print(especie, round(r, 2))
```

```text
Adelie 0.39
Chinstrap 0.65
Gentoo 0.64
```

Punto a resaltar: **las tres son positivas y la global era -0.24.** Es la
**paradoja de Simpson**: Gentoo tiene picos más largos y menos profundos que
Adelie, y al mezclar las especies esa diferencia entre grupos tapa lo que pasa
dentro de cada una. El -0.24 estaba bien calculado y respondía mal a la
pregunta. Cerrar con la interpretación en tres partes de la lección:
"¿los picos más largos son más profundos? Dentro de cada especie sí (0.39, 0.65 y
0.64), aunque la global sea -0.24; implica que no se puede tratar el pico de
especies distintas como un solo grupo".

## 🗳️ Votación — Un número cerca de cero

Cuándo: después de la resolución del Paso 6.

En la tabla de dengue de Antioquia, la correlación entre los días que tarda un
paciente en consultar y sus plaquetas (en miles) es -0.10. Una compañera
concluye algo. ¿Cuál conclusión está **justificada** por ese número solo?

- (a) Tardar en consultar baja las plaquetas del paciente.
- (b) No hay ninguna relación entre las dos variables, de ningún tipo.
- (c) La relación lineal global es muy débil; para saber si hay otra forma de relación hay que mirar la dispersión.
- (d) El 10 % de los pacientes tiene plaquetas bajas porque tardó en consultar.

Correcta: (c)

Qué revela cada distractor: (a) → lee la correlación como causa (el distractor de
causalidad): el número solo dice que las dos variables se mueven juntas, no cuál
arrastra a cuál; quien llega tarde puede llegar más enfermo, o al revés. (b) →
cree que "cerca de 0" significa "nada": la correlación solo mide relaciones
lineales y globales; una relación curva, o una que cambia por grupo (como el
Simpson de hoy), puede dar un número cercano a cero. (d) → lee el coeficiente
como un porcentaje de pacientes, error muy común con cualquier valor de la
matriz.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en parejas
2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues; si hay
menos de 30 %, vuelves a explicar qué mide la correlación antes de discutir.

## Paso 7 — Guardar el gráfico y subirlo al repositorio

Situación: un gráfico que solo vive en el cuaderno no se entrega. Se guarda como
imagen en `visualizaciones/` y se sube con Git, igual que hicieron con los datos
(sin repasar el flujo: el que ya lo hizo, lo repite).

**🐞 Error planeado:** dibujar el histograma en una celda y escribir en la
**siguiente** `plt.savefig("visualizaciones/histograma-masa.png")`.
**Síntoma:** el archivo se crea y abrirlo muestra una imagen **en blanco**.
**Pregunta al grupo:** "¿dónde quedó el dibujo?"
**Corrección:** al terminar una celda, `plt.show()` cierra la figura y
`plt.savefig` guarda la figura *actual*, que ahora es una vacía. El `savefig` va
**antes** del `show` y **en la misma celda**; carpeta creada de antemano:

```python
os.makedirs("visualizaciones", exist_ok=True)       # crea la carpeta; sin ella savefig da FileNotFoundError

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.hist(pinguinos["body_mass_g"], bins=20)
ax.set_title("Distribución de la masa corporal de los pingüinos")
ax.set_xlabel("Masa corporal (g)")
ax.set_ylabel("Número de pingüinos")
# dpi=150: imagen nítida; bbox_inches="tight": no recorta títulos ni etiquetas
fig.savefig("visualizaciones/histograma-masa.png", dpi=150, bbox_inches="tight")
plt.show()                                          # show va DESPUÉS: al mostrar, la figura se cierra
```

Punto a resaltar: para reproducir el error en vivo, ejecutar primero la celda del
histograma **sin** el `savefig` y, en una celda aparte, `plt.savefig(...)`; abrir
el PNG desde el panel de archivos de Colab. (Se comprobó localmente: en esa
situación el archivo queda con todos los píxeles blancos.) Detalle para los
curiosos: llamar a `fig.savefig` sobre el **objeto** `fig` aún funcionaría en otra
celda, porque guarda esa figura y no la actual, pero la regla simple, guardar
antes de mostrar y en la misma celda, evita la duda. Ahora subirlo, desde la
carpeta del repositorio, con comandos de shell (el signo de exclamación los
manda a la terminal de Colab):

```python
!git add visualizaciones/
!git commit -m "Agrega histograma de masa corporal de pingüinos"
!git push
```

Punto a resaltar: no se comprobó localmente (no hay repositorio de Colab);
confirmar en el momento, con `!git status`, que el PNG quedó dentro del commit y,
en GitHub, que el archivo se abre con el dibujo y no en blanco.

## 👥 Reto en parejas — Dos gráficos, una interpretación

Tiempo sugerido: 15 a 20 min. Las parejas son las del proyecto. Roles: el
*driver* escribe, el *navigator* dirige y revisa el estándar mínimo; cambian de
rol a mitad.

Enunciado: con `pinguinos`, una **sola figura con dos gráficos lado a lado**,
con `plt.subplots(1, 2)`: a la izquierda, el histograma de `flipper_length_mm`;
a la derecha, la dispersión de aleta contra masa corporal con `hue` por especie.
Ambos con título, ejes con unidad y, el segundo, leyenda. Se guarda en
`visualizaciones/` **antes** de mostrar. Y se escriben **tres líneas de
interpretación**: qué se observa, con qué cifra y qué implica.

Solución de referencia:

```python
os.makedirs("visualizaciones", exist_ok=True)

# 1 fila, 2 columnas: ax1 a la izquierda, ax2 a la derecha. figsize más ancho para que quepan los dos
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5))

ax1.hist(pinguinos["flipper_length_mm"], bins=20)                 # gráfico 1: distribución de una numérica
ax1.set_title("Distribución de la longitud de la aleta")
ax1.set_xlabel("Longitud de la aleta (mm)")
ax1.set_ylabel("Número de pingüinos")

# gráfico 2: seaborn dibuja en el eje que se le pase con ax=ax2; hue pinta una especie de cada color
sns.scatterplot(data=pinguinos, x="flipper_length_mm", y="body_mass_g", hue="species", ax=ax2)
ax2.set_title("Aleta y masa corporal por especie")
ax2.set_xlabel("Longitud de la aleta (mm)")
ax2.set_ylabel("Masa corporal (g)")
ax2.legend(title="Especie")                                       # la leyenda con título

fig.tight_layout()                                                # evita que los dos gráficos se pisen
fig.savefig("visualizaciones/reto-aleta-masa.png", dpi=150, bbox_inches="tight")   # antes de mostrar
plt.show()

# Las cifras que sostienen la interpretación, calculadas en vez de leídas a ojo
print(round(pinguinos["flipper_length_mm"].median()))
print(pinguinos.groupby("species")["flipper_length_mm"].median())
datos = pinguinos.dropna(subset=["flipper_length_mm", "body_mass_g"])
for especie, grupo in datos.groupby("species"):
    print(especie, round(grupo["flipper_length_mm"].corr(grupo["body_mass_g"]), 2))
```

```text
197
species
Adelie       190.0
Chinstrap    196.0
Gentoo       216.0
Name: flipper_length_mm, dtype: float64
Adelie 0.47
Chinstrap 0.64
Gentoo 0.7
```

Interpretación de referencia (qué, cifra, implica):

- **Qué se observa:** la aleta tiene dos grupos de pingüinos (dos jorobas en el histograma), y a mayor aleta mayor masa, con Gentoo en la parte alta de la nube.
- **Con cifra:** la mediana de la aleta es 197 mm, pero Adelie tiene 190 mm y Gentoo 216 mm; dentro de cada especie la correlación entre aleta y masa es de 0.47, 0.64 y 0.70.
- **Qué implica:** una sola cifra para "la aleta típica" no describe bien a ninguna especie, y la relación aleta-masa se mantiene dentro de cada una; sirve para estimar la masa, no para afirmar que la aleta la causa.

Verificar en pantalla: la leyenda aparece y no tapa puntos, los dos ejes x dicen
`(mm)` y el archivo de `visualizaciones/` abre con los dos gráficos. Si falta
tiempo, basta con el segundo gráfico.

Luego, **cada pareja repite el reto con su propio CSV**. Mismo esqueleto, otras
columnas. Las columnas son las de cada diccionario de datos, y las cifras de la
última columna se calcularon sobre los CSV de `public/documentos/programacion-cientifica/datasets/`
(los datasets son sintéticos):

| Dataset | Histograma de | Dispersión (x, y, `hue`) | Lo que el gráfico va a delatar |
|---|---|---|---|
| Salud (dengue) | `edad` | `dias_sintomas_a_consulta`, `plaquetas_miles`, `clasificacion` | `edad` tiene 98 vacíos y tres valores de 135, 135 y 120 años. Las plaquetas medianas bajan con la gravedad: 144 sin alarma, 79.5 con alarma y 33 en dengue grave (normal: 150-450). La correlación global es -0.10 |
| Seguridad (Medellín) | `tiempo_respuesta_min` | `camaras_cercanas`, `tiempo_respuesta_min`, `iluminacion_zona` | 550 vacíos; mediana 21 min y máximo 122. `camaras_cercanas` son enteros de 0 a 12: los puntos caen en columnas y se solapan. Mediana de respuesta: 20 min con buena iluminación, 26 con deficiente; correlación global -0.23 |
| Logística (entregas) | `retraso_min` | `distancia_km`, `tiempo_real_min`, `tipo_vehiculo` | `retraso_min` y `tiempo_real_min` tienen 209 vacíos (entregas fallidas); retraso con mediana de 17 min, de -64 a 239. Hay distancias de 480 y 250 km con mediana de 8.7 km: sin las distancias de 60 km o más, la correlación global es 0.60 y por vehículo va de 0.10 (bicicleta eléctrica) a 0.81 (camión pequeño) |
| Ciberseguridad | `horas_deteccion` | `horas_deteccion`, `perdida_estimada_millones_cop`, `tiene_soc` | Tres filas con 8760 h (un año entero) estiran el eje: la mediana es 41.5 h. La mediana de detección es 70.5 h sin SOC y 10.9 h con SOC. Pérdida con 290 vacíos y un máximo de 25997 millones: una escala logarítmica (`ax.set_xscale("log")`) ayuda |
| Ambiental (aire) | `pm25` | `pm25`, `pm10`, `tipo_estacion` | 199 vacíos, 18 valores de -999 (código de "sin dato") y picos de 612, 612 y 480 µg/m³ con mediana de 16.4: la media sale en 12.1 por culpa de los -999. La correlación entre `pm25` y `pm10` es 0.10 con todo y 0.98 filtrando `pm25` entre 0 y 300 |
| Educación (Saber 11) | `puntaje_global` | `horas_estudio_semana`, `puntaje_global`, `tipo_colegio` | `puntaje_global` sin vacíos (mediana 262, de 96 a 493); `horas_estudio_semana` tiene 270 vacíos y cuatro valores de 168, 168, 90 y 90 horas (168 es la semana entera). Mediana de puntaje: 252 en colegios oficiales y 305 en privados; con 40 horas o menos, la correlación global es 0.25 |

Punto a resaltar: en varios datasets el **gráfico delata un dato sucio** antes de
cualquier cálculo (un -999 en la cola del histograma, una distancia de 480 km). Es
la limpieza de la sesión anterior, ahora con prueba visual: señalar sin borrar de
oficio y anotar la decisión en la bitácora.

## Preguntas socráticas

Para lanzar al grupo si se estanca, con la respuesta esperada:

- **"Para comparar la masa de tres especies, ¿histograma o boxplot? ¿Por qué no
  tres histogramas?"** Esperada: el boxplot resume cada grupo (mediana, IQR,
  atípicos) en un espacio pequeño y permite compararlos lado a lado con la misma
  escala; tres histogramas ocupan tres veces más lugar y comparar alturas entre
  paneles es difícil. El histograma gana cuando se quiere ver la **forma**
  (las dos jorobas), que el boxplot esconde: una caja no muestra que hay dos
  grupos.
- **"Una compañera dibuja barras de ingresos con el eje y desde 3500 para 'que se
  vea mejor la diferencia'. ¿Qué le dirían?"** Esperada: en las barras la
  **altura es la cantidad**; si el eje no parte de 0, la diferencia se exagera
  (en la lección, 3701 g contra 5076 g parecía una razón de ocho a uno cuando es
  de 1.4). Si lo que importa es la diferencia, mostrar la diferencia, o usar
  puntos, que no codifican la cantidad en la altura.
- **"Mi dispersión tiene 5000 puntos y es una mancha azul. ¿Qué pruebo?"**
  Esperada: bajar el tamaño del punto (`s=` en Matplotlib), hacerlos
  semitransparentes con `alpha=` (así las zonas densas se ven más oscuras),
  y si aun así no se lee, cambiar de gráfico: `ax.hexbin(x, y)` o
  `sns.histplot(x=..., y=...)` cuentan los puntos por celda en vez de dibujarlos
  uno por uno. Y si hay categorías, separar con `hue` o por paneles.
- **"El heatmap marca 0.87 y mi compañero dice que alargar la aleta engorda al
  pingüino. ¿Qué falta?"** Esperada: la correlación no prueba causa; ambas
  medidas dependen del tamaño del animal. Y, como se vio con el pico, un número
  global puede ocultar lo que pasa dentro de cada grupo: antes de afirmar, mirar
  la dispersión por especie.

## Práctica externa

- **Kaggle Learn, curso "Data Visualization"** — https://www.kaggle.com/learn/data-visualization.
  Curso gratuito y corto con Seaborn, con ejercicios en cuaderno. Cubre líneas,
  barras, mapas de calor, dispersión, histogramas y la elección del gráfico, es
  decir, lo de hoy. (Responde HTTP 200; no se revisó el temario lección a
  lección, por verificar los temas exactos antes de asignar lecciones concretas.)
- **Galería de ejemplos de Seaborn** — https://seaborn.pydata.org/examples/index.html.
  Muestra cada tipo de gráfico con el código que lo genera; sirve para encontrar
  el gráfico adecuado y copiar la llamada. Pedir que cada estudiante elija un
  ejemplo y lo reproduzca con su propio dataset del proyecto.
- **Guía rápida de Matplotlib** — https://matplotlib.org/stable/users/explain/quick_start.html.
  Documento oficial sobre `Figure` y `Axes`, útil para reforzar la idea de la
  figura y los ejes. (Responde HTTP 200; por verificar su contenido completo.)
