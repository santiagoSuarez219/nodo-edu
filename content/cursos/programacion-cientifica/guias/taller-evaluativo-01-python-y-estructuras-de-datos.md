---
title: "Taller evaluativo 01 — Python y estructuras de datos"
updatedAt: "2026-09-08"
---

# Taller evaluativo 01 — Python y estructuras de datos

> **Momento evaluativo 1 del curso — vale el 15 % de la nota final.** Es el
> primero de los cinco cortes evaluativos del semestre y el único que cubre
> los fundamentos de programación con Python. Se resuelve de forma
> **individual**.

## Objetivo

Integrar en un solo notebook todo lo visto en las lecciones **"Variables,
tipos de datos y operadores"**, **"Condicionales y bucles"** y
**"Estructuras de datos nativas"**, resolviendo nueve ejercicios sobre un
problema real de programación científica: el **procesamiento de la serie de
mediciones de material particulado (PM2.5) de una red de monitoreo de
calidad del aire**.

Competencias esperadas:
- Declarar variables con el tipo de dato correcto (`int`, `float`, `str`,
  `bool`) y verificarlo con `type()`.
- Aplicar operadores aritméticos, de comparación y lógicos para convertir
  unidades, calcular errores de medición y validar una lectura.
- Clasificar una medición contra una escala de umbrales con una cadena
  `if` / `elif` / `else`.
- Recorrer una serie de mediciones con `for`, `while`, `break` y `continue`,
  acumulando sumas, contadores y extremos.
- Calcular estadísticas descriptivas (promedio, mínimo, máximo, rango y
  desviación estándar) con bucles, sin librerías.
- Representar registros heterogéneos con listas, tuplas y diccionarios,
  eligiendo la estructura correcta para cada caso.
- Documentar cada ejercicio en celdas de texto y entregar el notebook en
  GitHub con el Flujo A.

## Contexto: la red de monitoreo

Una red de monitoreo de calidad del aire tiene varias estaciones
distribuidas en un valle. Cada estación mide la concentración de material
particulado fino (**PM2.5**) en microgramos por metro cúbico (µg/m³) y
guarda una lectura cada cinco minutos.

Dos detalles del mundo real, que son justamente lo que hace interesante el
problema:

- Cuando el sensor falla o está en mantenimiento, el equipo **no deja el
  dato vacío: escribe el valor centinela `-999.0`**. Ese número no es una
  concentración: es la marca de "aquí no hay dato". Tratarlo como una
  medición más arruina cualquier promedio.
- El sensor de campo reporta en miligramos por metro cúbico (mg/m³),
  mientras que la escala oficial y el equipo patrón del laboratorio
  trabajan en µg/m³. Antes de comparar hay que **convertir a la misma
  unidad**: 1 mg/m³ equivale a 1000 µg/m³.

La escala oficial de calidad del aire para PM2.5 (promedio de 24 horas) que
se usa en todo el taller es esta:

| Categoría | Rango de PM2.5 (µg/m³) |
|---|---|
| Buena | hasta 12.0 |
| Moderada | más de 12.0 y hasta 35.4 |
| Dañina para grupos sensibles | más de 35.4 y hasta 55.4 |
| Dañina para la salud | más de 55.4 |

## Desarrollo del Taller

El taller tiene **nueve ejercicios**, en orden creciente de dificultad, que
se resuelven todos en el **mismo notebook** y en el orden en que aparecen:
varios reutilizan variables construidas en ejercicios anteriores. Cada
ejercicio debe ir precedido por una celda de texto que explique qué hace, y
cada resultado debe mostrarse con `print()`.

### Ejercicio 1 — Ficha de la campaña de medición

Los metadatos de la estación con la que va a trabajar son:

```text
Código de la estación: EST-01
Sector: Norte
Altitud sobre el nivel del mar: 1495 metros
Latitud (grados decimales): 6.28
El sensor fue calibrado en el último mes: sí
Lecturas descargadas en la campaña: 305
Factor de conversión de mg/m3 a ug/m3: 1000
```

```python
# TODO: declare codigo_estacion (str) y sector (str)
# TODO: declare altitud_m (int) y numero_lecturas (int)
# TODO: declare latitud (float)
# TODO: declare sensor_calibrado (bool)
# TODO: declare factor_conversion (int)
# TODO: verifique con type() el tipo de cada una de las siete variables
```

**Requisitos:** las siete variables deben quedar con el tipo exacto
indicado. Ninguna cantidad numérica puede quedar declarada como texto.

### Ejercicio 2 — Conversión de unidades y error frente al equipo patrón

El sensor de campo reportó una lectura y, en el mismo instante, el equipo
patrón del laboratorio midió el valor de referencia:

```text
lectura_sensor_mg = 0.0418   # en mg/m3, como lo entrega el sensor
valor_patron_ug = 40.0       # en ug/m3, medido por el equipo de referencia
```

```python
# TODO: declare lectura_sensor_mg (float) y valor_patron_ug (float)
# TODO: convierta la lectura del sensor a ug/m3 multiplicándola por
#       factor_conversion (del Ejercicio 1) y guárdela en lectura_sensor_ug
# TODO: calcule el error_absoluto restando el valor del patrón a la lectura
#       ya convertida
# TODO: calcule el error_relativo_porcentual dividiendo el error absoluto
#       entre el valor del patrón y multiplicando por 100
# TODO: calcule el error_cuadratico elevando el error absoluto al cuadrado
# TODO: muestre los cuatro resultados con print()
```

**Requisitos:** use multiplicación (`*`), resta (`-`), división (`/`) y
potencia (`**`). No escriba a mano el resultado de la conversión: debe salir
del producto con `factor_conversion`.

### Ejercicio 3 — Cobertura temporal del lote descargado

La estación toma una lectura cada cinco minutos, es decir 12 lecturas por
hora. Con las `numero_lecturas` del Ejercicio 1, calcule cuánto tiempo
cubre el lote descargado.

```python
# TODO: declare lecturas_por_hora (int) con el valor 12
# TODO: calcule horas_completas con división entera sobre numero_lecturas
# TODO: calcule lecturas_sobrantes con el módulo
# TODO: calcule dias_completos y horas_sobrantes aplicando la misma pareja
#       de operadores sobre horas_completas, usando 24 horas por día
# TODO: muestre los cuatro resultados con print()
```

**Requisitos:** use exclusivamente división entera (`//`) y módulo (`%`).
No use `/` ni redondee a mano.

### Ejercicio 4 — Validar una lectura sin decidir todavía

Antes de clasificar una medición hay que saber si es utilizable. Una lectura
es válida cuando **no** es el centinela de dato faltante **y** cae dentro
del rango físico que el sensor puede reportar.

```text
lectura = 41.8
codigo_dato_faltante = -999.0
limite_superior_sensor = 500.0
```

```python
# TODO: declare lectura, codigo_dato_faltante y limite_superior_sensor (float)
# TODO: evalúe es_dato_faltante comparando lectura con codigo_dato_faltante
# TODO: evalúe esta_en_rango combinando con "and" dos comparaciones:
#       lectura mayor o igual a 0 y lectura menor o igual al límite superior
# TODO: evalúe lectura_valida combinando esta_en_rango con la negación de
#       es_dato_faltante
# TODO: muestre los tres booleanos con print()
```

**Requisitos:** este ejercicio se resuelve **sin `if`**. Solo se evalúan las
condiciones y se muestran los booleanos resultantes. Use `and` y `not` al
menos una vez cada uno.

### Ejercicio 5 — Clasificar la lectura en la escala de calidad del aire

Ahora sí, use el booleano y la lectura del Ejercicio 4 para decidir.

```python
# TODO: use if / elif / else para guardar en la variable "categoria" la
#       clasificación de "lectura" según la tabla de la escala oficial:
#       "Buena", "Moderada", "Dañina para grupos sensibles" o
#       "Dañina para la salud"
# TODO: muestre "categoria" con print()
```

**Requisitos:** use exactamente una cadena `if` / `elif` / `else`, ordenada
de menor a mayor umbral. Ninguna concentración puede caer en dos categorías
a la vez ni quedar sin categoría.

### Ejercicio 6 — Limpiar la serie horaria

Estas son doce lecturas consecutivas descargadas de la estación, con dos
fallas de sensor entre ellas:

```text
lecturas_pm25 = [8.4, 12.7, -999.0, 15.2, 41.8, 9.6, -999.0, 58.3, 22.0, 13.9, 7.5, 36.1]
```

```python
# TODO: declare lecturas_pm25 (lista) con los valores de arriba
# TODO: declare la lista vacía lecturas_validas
# TODO: declare los acumuladores suma_pm25 en 0.0 y lecturas_descartadas en 0
# TODO: recorra lecturas_pm25 con un for directo sobre sus valores
# TODO: dentro del for, si la lectura es igual a -999.0, incremente
#       lecturas_descartadas y use continue para saltar a la siguiente
# TODO: dentro del for, agregue la lectura a lecturas_validas con append y
#       súmela a suma_pm25
# TODO: después del for, calcule promedio_pm25 dividiendo suma_pm25 entre
#       la cantidad de elementos de lecturas_validas
# TODO: muestre con print() la cantidad de lecturas válidas, la cantidad de
#       descartadas y el promedio
```

**Requisitos:** el descarte del centinela debe hacerse con `continue`, no
con un `else` que envuelva el resto del cuerpo del bucle. El promedio se
calcula **después** de que el `for` termina, y solo sobre las lecturas
válidas.

### Ejercicio 7 — Estadística descriptiva de la serie limpia

Con `lecturas_validas` y `promedio_pm25` del Ejercicio 6, calcule el resto
de la descripción de la serie. Necesitará **dos recorridos**: el primero
para los extremos, el segundo para la dispersión (que depende del promedio,
y por eso no puede calcularse en la misma pasada).

```python
# TODO: inicialice maximo_pm25 y minimo_pm25 con el primer elemento de
#       lecturas_validas
# TODO: recorra lecturas_validas con un for y, con if, actualice maximo_pm25
#       cuando encuentre un valor mayor y minimo_pm25 cuando encuentre uno menor
# TODO: calcule el rango restando el mínimo al máximo
# TODO: declare el acumulador suma_desviaciones en 0.0
# TODO: en un segundo for sobre lecturas_validas, acumule en suma_desviaciones
#       la diferencia entre cada lectura y promedio_pm25, elevada al cuadrado
# TODO: calcule desviacion_estandar elevando a la potencia 0.5 el cociente
#       entre suma_desviaciones y la cantidad de lecturas válidas
# TODO: muestre con print() el máximo, el mínimo, el rango y la desviación
```

**Requisitos:** no use `max()`, `min()` ni `sum()`: los extremos y las sumas
deben salir de los bucles. La raíz cuadrada se obtiene con el operador de
potencia (`** 0.5`), sin importar ninguna librería.

### Ejercicio 8 — Decaimiento tras cerrar la fuente de emisión

Al detectar el pico de contaminación se cierra la fuente de emisión cercana
a la estación. A partir de ese momento, la concentración medida baja un
**15 % cada hora**. Se quiere saber cuántas horas tardará en volver a
categoría "Buena" (12.0 µg/m³ o menos).

```text
concentracion = 58.3   # el pico registrado en la serie
factor_decaimiento = 0.85
umbral_buena = 12.0
```

```python
# TODO: declare concentracion, factor_decaimiento y umbral_buena (float)
# TODO: declare el contador horas_transcurridas en 0
# TODO: use while para repetir mientras concentracion sea mayor que umbral_buena:
#       - multiplique concentracion por factor_decaimiento
#       - incremente horas_transcurridas en 1
# TODO: después del while, muestre con print() cuántas horas pasaron y con
#       qué concentración final se cerró el episodio
```

**Requisitos:** use `while`, no `for`: el número de horas no se conoce de
antemano. Verifique que `concentracion` se actualiza **dentro** del bloque,
para no producir un bucle infinito.

### Ejercicio 9 — Registros de varias estaciones

La red no tiene una sola estación. Cada estación se representa como un
**diccionario** con su código, su sector, sus coordenadas en una **tupla** y
su propia lista de lecturas. Una de ellas, además, reporta humedad
relativa; las otras dos no tienen ese sensor.

```text
registros_estaciones = [
    {"codigo": "EST-01", "sector": "Norte",  "coordenadas": (6.28, -75.57), "lecturas": [8.4, 12.7, 15.2]},
    {"codigo": "EST-02", "sector": "Centro", "coordenadas": (6.24, -75.58), "lecturas": [41.8, 58.3, 36.1]},
    {"codigo": "EST-03", "sector": "Sur",    "coordenadas": (6.19, -75.59), "lecturas": [9.6, 13.9, 7.5], "humedad_relativa": 68.0},
]
```

```python
# TODO: declare registros_estaciones (lista de diccionarios) con los valores
#       de arriba
# TODO: recorra la lista con un for sobre sus elementos
# TODO: dentro del for, desempaquete la tupla de "coordenadas" en dos
#       variables: latitud y longitud
# TODO: dentro del for, calcule el promedio de la lista de "lecturas" de esa
#       estación usando un for interno y un acumulador
# TODO: dentro del for, obtenga la humedad con get y el valor por defecto
#       "no disponible", sin que las estaciones sin ese sensor produzcan error
# TODO: dentro del for, clasifique el promedio de la estación con la misma
#       cadena if / elif / else del Ejercicio 5
# TODO: dentro del for, muestre con print() una línea por estación con su
#       código, su sector, su latitud, su longitud, su promedio, su
#       categoría y su humedad
```

**Requisitos:** acceda a cada dato **por su clave** (`"codigo"`,
`"sector"`, …), nunca por posición. La humedad debe obtenerse con `get` y su
valor por defecto: si usa acceso directo con corchetes, dos de las tres
estaciones lanzarán `KeyError`.

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, usando `Archivo → Guardar una copia en
GitHub` (Flujo A), igual que en los talleres anteriores. No se usan comandos
de Git en este taller.

Nombre exacto del archivo: `taller-evaluativo-01-calidad-del-aire.ipynb`.

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   ├── taller-variables-tipos-operadores.ipynb
│   ├── taller-condicionales-bucles.ipynb
│   └── taller-evaluativo-01-calidad-del-aire.ipynb
└── README.md
```

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del taller, su nombre completo y la
   fecha.
2. Los nueve ejercicios completos, en el orden de esta guía, cada uno
   precedido por una celda de texto que explique qué hace.
3. La celda de verificación final (abajo), sin modificar.

**Antes de subir:** ejecute `Entorno de ejecución → Reiniciar y ejecutar
todas` y confirme que ninguna celda muestra un error. Un notebook que solo
funciona ejecutando las celdas en desorden se califica como si no ejecutara.

### Celda de verificación

Copie esta celda al final del notebook y ejecútela después de todo lo demás.
Comprueba tipos y algunos resultados intermedios; **no reemplaza** la
revisión de cada ejercicio, pero si alguna línea falla hay un error que debe
corregir antes de entregar.

```python
# Celda de verificación — ejecútela al final, después de todo lo demás
assert type(codigo_estacion) == str, "codigo_estacion debería ser str"
assert type(altitud_m) == int, "altitud_m debería ser int"
assert type(latitud) == float, "latitud debería ser float"
assert type(sensor_calibrado) == bool, "sensor_calibrado debería ser bool"
assert lectura_valida == True, "la lectura del Ejercicio 4 sí es válida"
assert len(lecturas_validas) == 10, "deberían quedar 10 lecturas válidas"
assert lecturas_descartadas == 2, "deberían descartarse 2 centinelas"
assert abs(promedio_pm25 - 22.55) < 0.01, "revise el promedio del Ejercicio 6"
assert maximo_pm25 == 58.3 and minimo_pm25 == 7.5, "revise los extremos"
print("Verificación completada sin errores.")
```

## Criterios de Evaluación

Este taller **es el Momento evaluativo 1 y vale el 15 % de la nota final del
curso**. Se califica sobre 100 puntos con la rúbrica de abajo, y ese puntaje
se convierte después a la escala institucional de 0 a 5.

| Criterio | Puntos | Descripción |
|---|---|---|
| **Variables, tipos y operadores (Ej. 1 a 4)** | 20 | Las siete variables del Ejercicio 1 tienen el tipo exacto pedido, verificado con `type()`; la conversión de unidades y los tres errores del Ejercicio 2 salen de operadores (no de valores escritos a mano); el Ejercicio 3 usa solo `//` y `%`; el Ejercicio 4 produce los tres booleanos correctos usando `and` y `not`, sin ningún `if`. |
| **Condicionales y clasificación (Ej. 5)** | 15 | La cadena `if` / `elif` / `else` clasifica correctamente en las cuatro categorías de la escala, en orden creciente de umbral, y devuelve "Dañina para grupos sensibles" para la lectura de 41.8. Ninguna concentración queda sin categoría ni en dos a la vez. |
| **Bucles, acumuladores y control de flujo (Ej. 6 a 8)** | 30 | El Ejercicio 6 descarta los dos centinelas con `continue` y obtiene 10 lecturas válidas y promedio 22.55; el Ejercicio 7 obtiene máximo 58.3, mínimo 7.5 y la desviación con dos recorridos y sin `max()`, `min()` ni `sum()`; el Ejercicio 8 usa `while`, actualiza la variable de la condición y termina. |
| **Estructuras de datos nativas (Ej. 9)** | 15 | El Ejercicio 9 accede a los diccionarios por clave, desempaqueta la tupla de coordenadas en dos variables y obtiene la humedad con `get` y su valor por defecto sin lanzar `KeyError`. |
| **Ejecución sin errores** | 10 | El notebook corre completo con `Reiniciar y ejecutar todas` sin ningún error, sin bucles que no terminen, y la celda de verificación imprime "Verificación completada sin errores." |
| **Documentación en celdas de texto** | 5 | Cada uno de los nueve ejercicios tiene una celda de texto previa que explica qué hace, y las variables usan nombres significativos en `snake_case`. |
| **Entrega correcta** | 5 | El notebook está en `ejercicios/` del repositorio del curso, con el nombre de archivo exacto indicado, subido con Flujo A y visible en GitHub antes del plazo. |
| **TOTAL** | **100** | |

### Cómo se convierte el puntaje a nota

```
nota_taller (0-5)        = (puntaje_obtenido / 100) x 5
aporte_a_la_nota_final % = (puntaje_obtenido / 100) x 15
```

Ejemplo: un notebook que obtiene **86 de 100** puntos saca **4.3** en la
escala de 0 a 5 y aporta **12.9 %** de los 15 % que vale este momento
evaluativo.

Las "Extensiones Sugeridas (Bonus)" del final de esta guía **no suman
puntos**: el máximo del taller son los 100 puntos de la tabla.

## Dificultades Comunes

### "Mi promedio da un número negativo enorme"
- Está incluyendo los `-999.0` en la suma. Ese valor no es una medición: es
  la marca de dato faltante. Revise que el `continue` del Ejercicio 6 esté
  **dentro** del `for` y **antes** de la línea que acumula en `suma_pm25`.

### "La desviación estándar me da un número raro o `nan`"
- Revise que esté dividiendo entre la cantidad de lecturas **válidas** y no
  entre `len(lecturas_pm25)`, y que el segundo recorrido use el promedio ya
  calculado, no el que estaba a medias durante el primer bucle.

### "Mi `while` del Ejercicio 8 nunca termina"
- La línea que multiplica `concentracion` por `factor_decaimiento` quedó
  fuera del bloque del `while`, o está reasignando otra variable. Si la
  concentración no baja en cada vuelta, la condición nunca se vuelve
  `False`. Interrumpa la celda con el botón de detener y revise la
  indentación.

### "`KeyError: 'humedad_relativa'` en el Ejercicio 9"
- Dos de las tres estaciones no tienen esa clave. El acceso con corchetes
  falla; `get` con un valor por defecto devuelve ese valor en su lugar sin
  lanzar error. Es exactamente el caso para el que existe `get`.

### "El notebook funciona, pero al reiniciar el entorno falla"
- Está dependiendo de variables que quedaron en memoria de ejecuciones
  anteriores o de celdas ejecutadas en desorden. Ejecute siempre
  `Reiniciar y ejecutar todas` antes de entregar: así se va a calificar.

## Extensiones Sugeridas (Bonus)

Estas extensiones **no suman puntos** dentro de los 100 del taller; son para
quien ya tenga los nueve ejercicios resueltos y quiera ir más allá.

- **Mediana sin librerías:** ordene `lecturas_validas` con `sort()` y calcule
  la mediana de la serie, distinguiendo con un `if` el caso de cantidad par
  (promedio de los dos valores centrales) del de cantidad impar.
- **Detección de valores atípicos:** marque como atípica toda lectura que se
  aleje del promedio más de dos desviaciones estándar, y construya con
  comprensión de listas la lista de las que sí lo son.
- **Ranking de estaciones:** construya, a partir de `registros_estaciones`,
  una lista de tuplas `(promedio, codigo)`, ordénela con `sort()` y muestre
  cuál estación tuvo la peor calidad del aire de la campaña.
- **Serie suavizada:** construya una lista nueva donde cada elemento sea el
  promedio de tres lecturas consecutivas de `lecturas_validas` (media móvil),
  recorriendo con `range()` y slicing.
- **Cobertura de la campaña:** calcule qué porcentaje de las lecturas
  descargadas quedó inutilizable por fallas del sensor, y clasifique con
  `if` / `elif` / `else` la campaña como "aceptable" (menos del 10 % perdido),
  "cuestionable" o "inválida" (más del 25 % perdido).

## Recursos

- **Apuntes del curso:** lecciones "Variables, tipos de datos y operadores",
  "Condicionales y bucles" y "Estructuras de datos nativas".
- **Talleres previos:** "Taller de variables, tipos de datos y operadores" y
  "Taller de condicionales y bucles".
- **Repaso del Flujo A:** lección "Configuración del entorno de trabajo
  (Colab y GitHub) y diagnóstico".
- **Entorno de trabajo:** Google Colab (`colab.research.google.com`), sin
  instalación local y sin librerías externas.
- **Documentación oficial:** secciones de tipos numéricos, sentencias de
  control de flujo y estructuras de datos de la documentación de Python 3.

**Plazo de entrega:** jueves 17 de septiembre de 2026, 11:59 p. m. Se
califica el estado del archivo en GitHub a esa hora.
