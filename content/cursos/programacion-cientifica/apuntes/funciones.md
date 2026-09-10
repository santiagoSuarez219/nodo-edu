> Sesión práctica en vivo (Semana 6, jueves): el docente escribe y ejecuta este
> guion en Colab, celda por celda, proyectado al grupo. No es trabajo
> independiente del estudiante — no hay guía de laboratorio para esta sesión.
> Continúa sobre `registros_estaciones`, el dataset del Taller evaluativo 01
> de la Semana 5. Todo corre en Google Colab, sin terminal ni comandos `!git`.

## Paso 0 — Retomar el dataset del taller

Antes de tocar nada nuevo, ejecutar esta celda para tener el dataset del
taller disponible en el notebook de la clase de hoy.

```python
registros_estaciones = [
    {"codigo": "EST-01", "sector": "Norte",  "coordenadas": (6.28, -75.57), "lecturas": [8.4, 12.7, 15.2]},
    {"codigo": "EST-02", "sector": "Centro", "coordenadas": (6.24, -75.58), "lecturas": [41.8, 58.3, 36.1]},
    {"codigo": "EST-03", "sector": "Sur",    "coordenadas": (6.19, -75.59), "lecturas": [9.6, 13.9, 7.5], "humedad_relativa": 68.0},
]

# sensor nuevo, todavia no integrado a registros_estaciones: llega en mg/m3
lecturas_sensor_nuevo_mg = [0.0084, 0.0127, 0.0152]
```

Punto a resaltar: recordar en voz alta que `registros_estaciones` es la misma
lista de diccionarios del taller — no se reescribe su estructura hoy, solo se
opera sobre ella.

## Paso 1 — Reproducir el problema: celdas duplicadas

Escribir en vivo, sin `def`, la conversión mg/m³ → µg/m³ tres veces, imitando
"un sensor más que llega tarde al notebook":

```python
# celda 1: convierte las lecturas del sensor nuevo (mg/m3 -> ug/m3)
lecturas_ug_nuevo = []
for valor in lecturas_sensor_nuevo_mg:
    lecturas_ug_nuevo.append(valor * 1000)  # mg/m3 -> ug/m3: se multiplica por 1000
print(lecturas_ug_nuevo)

# celda 2: "otro sensor de campo" que llega despues (mismo bucle, copiado y pegado)
lecturas_sensor_campo = [0.018, 0.022]
lecturas_ug_campo = []
for valor in lecturas_sensor_campo:
    lecturas_ug_campo.append(valor * 1000)  # exactamente la misma operacion, otro nombre
print(lecturas_ug_campo)
```

```text
[8.4, 12.7, 15.2]
[18.0, 22.0]
```

Punto a resaltar: señalar que las dos celdas son idénticas salvo el nombre de
variable. Preguntar al grupo qué pasa si mañana la constante de conversión
estuviera mal (por ejemplo `900` en vez de `1000`) — hay que acordarse de
corregirla en cada copia. Esa es la motivación de `def`, no un capricho de
estilo.

## Paso 2 — `def`, parámetros, valor por defecto y `return`

```python
def convertir_a_microgramos(valor, unidad="mg/m3"):
    # valor por defecto: si no se indica la unidad, se asume el caso mas comun
    # de la red (sensores de campo, que reportan en mg/m3)
    if unidad == "mg/m3":
        return valor * 1000
    return valor  # ya viene en ug/m3, no hay nada que convertir

directo = convertir_a_microgramos(15.2, unidad="ug/m3")  # ya esta en ug/m3
convertida = convertir_a_microgramos(0.0084)              # usa el default "mg/m3"
print(directo, convertida)
```

```text
15.2 8.4
```

Punto a resaltar: reescribir las dos celdas duplicadas del Paso 1 usando la
función nueva, en vivo, para que el grupo vea la reducción:

```python
lecturas_ug_nuevo = [convertir_a_microgramos(v) for v in lecturas_sensor_nuevo_mg]
lecturas_ug_campo = [convertir_a_microgramos(v) for v in lecturas_sensor_campo]
print(lecturas_ug_nuevo, lecturas_ug_campo)
```

```text
[8.4, 12.7, 15.2] [18.0, 22.0]
```

### `print` no es `return`

Bug clásico, mostrarlo en vivo con el error incluido:

```python
def convertir_mal(valor):
    print(valor * 1000)   # solo se ve en pantalla, no se puede reutilizar

def convertir_bien(valor):
    return valor * 1000   # se puede guardar y seguir operando

resultado = convertir_mal(0.0084)   # esto imprime 8.4 como efecto colateral...
print(resultado)                     # ...pero resultado es None, no 8.4

resultado = convertir_bien(0.0084)
print(resultado / 2)   # con return si se puede seguir operando
```

```text
8.4
None
4.2
```

Punto a resaltar: decir explícitamente "`convertir_mal` sí ejecutó el
`print(8.4)` — eso ya pasó y no se puede deshacer — pero la función en sí no
devolvió nada, así que `resultado` quedó en `None`". Es el error más común de
quien recién aprende `def`: confundir "se vio en pantalla" con "quedó
disponible para seguir usándose".

## Paso 3 — `map` y `filter`, comparados con comprensión de listas (Semana 4)

```python
# map: aplica convertir_a_microgramos a cada elemento de la lista
lecturas_ug = map(convertir_a_microgramos, lecturas_sensor_nuevo_mg)
print(list(lecturas_ug))  # map devuelve un objeto perezoso: hay que envolverlo en list()
```

```text
[8.4, 12.7, 15.2]
```

```python
def supera_moderada(valor):
    return valor > 35.4  # umbral oficial de la categoria "Moderada"

lecturas_criticas = filter(supera_moderada, registros_estaciones[1]["lecturas"])
print(list(lecturas_criticas))
```

```text
[41.8, 58.3, 36.1]
```

Reescribir la misma condición con `lambda`, mostrando que es la misma función
sin nombre propio:

```python
lecturas_criticas = filter(lambda valor: valor > 35.4, registros_estaciones[1]["lecturas"])
print(list(lecturas_criticas))
```

```text
[41.8, 58.3, 36.1]
```

Comparación lado a lado — proyectar ambas formas juntas y remarcar que
producen exactamente el mismo resultado:

```python
lecturas_est02 = registros_estaciones[1]["lecturas"]

# --- con map / filter ---
lecturas_ug_map = list(map(convertir_a_microgramos, lecturas_sensor_nuevo_mg))
criticas_filter = list(filter(lambda v: v > 35.4, lecturas_est02))

# --- equivalente con comprension de listas (ya vista en Semana 4) ---
lecturas_ug_comp = [convertir_a_microgramos(v) for v in lecturas_sensor_nuevo_mg]
criticas_comp = [v for v in lecturas_est02 if v > 35.4]

print("map:", lecturas_ug_map, " | comprension:", lecturas_ug_comp)
print("filter:", criticas_filter, " | comprension:", criticas_comp)
```

```text
map: [8.4, 12.7, 15.2]  | comprension: [8.4, 12.7, 15.2]
filter: [41.8, 58.3, 36.1]  | comprension: [41.8, 58.3, 36.1]
```

Punto a resaltar: decir en voz alta que en Python la comprensión de listas
suele preferirse por legibilidad, pero que `map`/`filter` aparecen en mucho
código existente (librerías, notebooks de otros autores) y por eso conviene
reconocerlos aunque no sean la primera opción para escribir código nuevo.

## Paso 4 — El bug de scope, reproducido a propósito

Escribir esta celda completa y ejecutarla dejando que falle en vivo —no
corregir el error antes de mostrarlo—:

```python
def calcular_promedio_estacion(lecturas):
    total = sum(lecturas)
    promedio = total / len(lecturas)
    return promedio

calcular_promedio_estacion(registros_estaciones[0]["lecturas"])
print(total)
```

```text
NameError: name 'total' is not defined
```

Punto a resaltar (qué decir mientras el error está en pantalla): "Vimos
`total` asignarse una línea antes, adentro de la función. Y sin embargo,
Python dice que no existe. Eso no es un bug del código — es la regla: `total`
vive únicamente mientras `calcular_promedio_estacion` se está ejecutando, y
desaparece apenas la función termina. Nunca existió *aquí afuera*, en el
scope del notebook." Dejar la pregunta abierta un momento antes de seguir:
"¿cómo hago entonces para usar ese promedio fuera de la función?" — la
respuesta es la celda siguiente.

Corrección, devolviendo lo que hace falta:

```python
def calcular_promedio_estacion(lecturas):
    total = sum(lecturas)
    promedio = total / len(lecturas)
    return promedio   # solo esto sale de la funcion

promedio_norte = calcular_promedio_estacion(registros_estaciones[0]["lecturas"])
print(promedio_norte)   # esto si existe afuera, porque se devolvio con return
```

```text
12.1
```

Punto a resaltar: cerrar la idea con la frase de la lección — "`return` es la
única puerta de salida de lo que se calculó adentro de una función hacia el
resto del notebook". `total` nunca sale; `promedio` sale porque se devuelve
explícitamente.

## Paso 5 — Buenas prácticas de modularización: `clasificar_calidad_aire`

```python
def clasificar_calidad_aire(concentracion):
    # una funcion, una transformacion: solo clasifica, no imprime ni convierte
    if concentracion <= 12.0:
        return "Buena"
    if concentracion <= 35.4:
        return "Moderada"
    if concentracion <= 55.4:
        return "Dañina para grupos sensibles"
    return "Dañina para la salud"

# probar con un caso simple conocido antes de aplicarla a todo el dataset
print(clasificar_calidad_aire(10.0))   # se espera "Buena"
print(clasificar_calidad_aire(40.0))   # se espera "Dañina para grupos sensibles"

categorias = list(map(clasificar_calidad_aire, registros_estaciones[1]["lecturas"]))
print(categorias)
```

```text
Buena
Dañina para grupos sensibles
['Dañina para grupos sensibles', 'Dañina para la salud', 'Dañina para grupos sensibles']
```

Punto a resaltar: recorrer en voz alta los cuatro criterios de la lección
apuntando a este mismo código en pantalla — el nombre es un verbo
(`clasificar_calidad_aire`, no `procesar`), recibe `concentracion` como
parámetro explícito (no asume una variable global), hace una sola cosa
(clasifica, no imprime ni convierte), y se probó con un valor conocido antes
de aplicarla a la lista completa de la estación Centro.

## Paso 6 — Cierre de la demo: aplicar todo junto sobre la red completa

Última celda de la sesión, encadenando las cuatro funciones sobre las tres
estaciones del taller:

```python
for estacion in registros_estaciones:
    promedio = calcular_promedio_estacion(estacion["lecturas"])
    categoria = clasificar_calidad_aire(promedio)
    print(f"{estacion['codigo']} ({estacion['sector']}): promedio {promedio:.1f} ug/m3 -> {categoria}")
```

```text
EST-01 (Norte): promedio 12.1 ug/m3 -> Moderada
EST-02 (Centro): promedio 45.4 ug/m3 -> Dañina para grupos sensibles
EST-03 (Sur): promedio 10.3 ug/m3 -> Buena
```

Punto a resaltar para cerrar: nombrar en voz alta, señalando cada línea, las
cuatro funciones construidas hoy — `convertir_a_microgramos`,
`supera_moderada`, `calcular_promedio_estacion`, `clasificar_calidad_aire` — y
decir que son justo las piezas que el **taller de funciones** (seguimiento,
no evaluativo, próxima sesión marcada `◇` en el cronograma) le va a pedir al
estudiante que practique por su cuenta con datos propios de su elección: no
hay guía formal para hoy porque la sesión fue en vivo, pero el taller de
seguimiento retoma exactamente este mismo patrón de trabajo. Mencionar
también, como cierre temático, que la próxima semana se va a ver cómo una
función puede "vivir dentro" de un objeto como uno de sus métodos.

## Preguntas socráticas

- **"¿Por qué `convertir_mal` no rompió con un error si `return` faltaba?"**
  Respuesta esperada: en Python toda función devuelve algo aunque no tenga
  `return` explícito — devuelve `None` por defecto. No es un error de
  sintaxis, es que el valor devuelto simplemente no es útil.

- **"Si dentro de `calcular_promedio_estacion` yo defino `total = 999` en la
  celda del notebook *antes* de llamarla, ¿el `total` de la función lo ve?"**
  Respuesta esperada: no — el `total` de adentro de la función es una
  variable local nueva, independiente de cualquier `total` que exista afuera.
  Asignarle un valor dentro de la función no toca ni lee el de afuera.

- **"¿`map(clasificar_calidad_aire, ...)` y la comprensión de listas
  equivalente hacen lo mismo con el dataset completo de las tres
  estaciones?"** Respuesta esperada: sí, siempre que se aplique a la misma
  lista de lecturas — la diferencia es de forma (`map` separa la función del
  dato, la comprensión los junta en una sola expresión), no de resultado.

- **"¿Por qué `supera_moderada` se volvió `lambda valor: valor > 35.4` pero
  `calcular_promedio_estacion` no se convirtió en lambda?"** Respuesta
  esperada: `lambda` solo sirve para una función de una sola expresión, sin
  nombre. `calcular_promedio_estacion` tiene dos pasos (`total` y `promedio`)
  y se reutiliza con nombre propio en varias celdas — no cabe en una lambda y
  tampoco conviene, porque perdería el nombre que describe qué hace.
