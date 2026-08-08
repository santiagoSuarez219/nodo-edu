---
title: "Laboratorio — Variables, tipos de datos y operadores"
updatedAt: "2026-08-08"
---

# Laboratorio — Variables, tipos de datos y operadores

## Objetivo

Practicar la asignación de variables en Python y el uso de operadores
aritméticos, de comparación y lógicos, aplicándolos sobre dos conjuntos de
datos de juguete provistos por el docente: una lista de precios de una
tienda pequeña y un registro de temperaturas diarias.

Competencias esperadas:
- Declarar variables con nombres significativos y con el tipo de dato
  correcto (`int`, `float`, `str`, `bool`).
- Verificar el tipo de una variable con `type()`.
- Aplicar operadores aritméticos (`+`, `-`, `*`, `/`, `//`, `%`, `**`) sobre
  datos numéricos.
- Aplicar operadores de comparación (`==`, `!=`, `<`, `>`, `<=`, `>=`) y
  operadores lógicos (`and`, `or`, `not`), mostrando el resultado booleano
  obtenido.
- Documentar cada bloque de trabajo con celdas de texto en Colab.
- Subir el notebook resultante a `ejercicios/` usando el Flujo A.

## Requisitos Previos

Antes de comenzar, debe dominar lo visto en la lección **"Configuración del
entorno de trabajo (Colab y GitHub) y diagnóstico"**:
- Crear celdas de código y celdas de texto en Google Colab, y ejecutar una
  celda de código con `Shift + Enter`.
- Subir un notebook a GitHub con `Archivo → Guardar una copia en GitHub`
  (Flujo A), sin usar comandos ni terminal.
- Tener acceso a su repositorio `curso-programacion-cientifica`, con la
  carpeta `ejercicios/` ya creada.

De la lección **"Variables, tipos de datos y operadores"** debe conocer:
- Qué es una variable y qué significa que Python tenga tipado dinámico.
- Los cuatro tipos de datos básicos: `int`, `float`, `str`, `bool`.
- Los tres grupos de operadores: aritméticos, de comparación y lógicos.

> Este laboratorio **no utiliza** `if`, `elif`, `else` ni ningún tipo de
> condicional. Cuando un ejercicio pida evaluar una comparación o una
> condición lógica, el resultado esperado es que usted lo **muestre con
> `print()`** (el valor `True` o `False`), no que decida una acción distinta
> según ese resultado. Los condicionales se estudian en la siguiente sesión.

## Desarrollo del Laboratorio

### Parte 1 — Dataset de precios de una tienda pequeña

Trabaje con el siguiente conjunto de datos, provisto para este ejercicio:

```text
Productos y precios de una tienda pequeña (en pesos colombianos):
- Cuaderno: 3500
- Lápiz: 800
- Café: 6200.50
Cantidad a comprar: 3 cuadernos, 5 lápices
```

Cree, en una nueva celda de código, las variables de partida con nombres
significativos:

```python
# TODO: declare aquí las variables de precio y cantidad del dataset,
# con el tipo de dato correcto para cada una (int o float según corresponda)
```

**Requisitos:**
- Declare al menos cinco variables: precio de cada producto y cantidad a
  comprar de cuaderno y de lápiz.
- Verifique con `type()` que cada variable quedó con el tipo esperado.

Sobre esas variables, resuelva en celdas de código independientes (una por
grupo de operador, documentada con una celda de texto antes de cada una):

**Operadores aritméticos:**
- Calcule el total a pagar por los cuadernos y por los lápices por separado.
- Calcule el total general de la compra, incluyendo el café.
- Calcule el total con un descuento del 10% aplicado.
- Use división entera (`//`) y módulo (`%`) para repartir la cantidad de
  cuadernos en paquetes de 4 unidades: cuántos paquetes completos y cuántos
  cuadernos sueltos quedan.
- Use el operador de potencia (`**`) al menos una vez.

**Operadores de comparación:**
- Evalúe y muestre si el café es más caro que el cuaderno.
- Evalúe y muestre si el cuaderno cuesta lo mismo que el lápiz.
- Evalúe y muestre si el total de la compra es mayor o igual a 20000.

**Operadores lógicos:**
- Defina una variable booleana que indique si hay presupuesto suficiente
  (por ejemplo, si el total no supera un límite que usted elija) y otra que
  indique si hay stock disponible.
- Combine ambas con `and` y muestre el resultado.
- Use `or` para evaluar si aplica alguna de dos condiciones a su elección
  sobre el dataset (por ejemplo, un producto caro o una cantidad alta).
- Use `not` sobre alguna condición booleana ya calculada.

### Parte 2 — Dataset de temperaturas diarias

Trabaje con el siguiente conjunto de datos:

```text
Temperaturas registradas (en grados Celsius):
- Lunes: 18.5
- Martes: 21.0
- Miércoles: 19.8
Temperatura promedio de referencia de la semana: 20.0
```

Declare las variables correspondientes:

```python
# TODO: declare aquí las variables de temperatura de cada día
# y la temperatura promedio de referencia
```

**Requisitos:**
- Declare las cuatro variables del dataset con el tipo `float`.

Resuelva, con la misma organización de celdas de código y de texto que en la
Parte 1:

**Operadores aritméticos:**
- Calcule la suma de las tres temperaturas registradas.
- Calcule el promedio de esas tres temperaturas.
- Calcule la diferencia entre la temperatura del martes y la del lunes.

**Operadores de comparación:**
- Evalúe y muestre si el martes fue más caluroso que el promedio de
  referencia de la semana.
- Evalúe y muestre si el miércoles fue igual al promedio de referencia.
- Evalúe y muestre si el lunes fue el día más frío de los tres registrados
  (comparándolo con los otros dos).

**Operadores lógicos:**
- Evalúe y muestre si el lunes tuvo una temperatura "templada", entendida
  como un valor entre 15 y 25 grados (combine dos comparaciones con `and`).
- Evalúe y muestre si al menos uno de los tres días superó los 20 grados
  (combine tres comparaciones con `or`).

### Parte 3 — Reto de extensión (Opcional / Avanzado)

Dirigido a quien termine antes las Partes 1 y 2.

- Combine ambos datasets en un solo cálculo de su diseño (por ejemplo,
  estimar un "premio" en pesos proporcional a los grados que un día superó
  el promedio de la semana, usando alguno de los precios como factor).
- Use la función `round()` para redondear el resultado a 2 decimales.
- Use `type()` sobre el resultado de una operación que mezcle un `int` y un
  `float`, y sobre cada uno de los operandos por separado.
- Antes de ejecutar la celda, prediga en una celda de texto qué imprimirá la
  siguiente expresión, y luego verifique su predicción:
  `2 + 3 * 4 ** 2 - 1`

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, usando `Archivo → Guardar una copia en
GitHub` (Flujo A) — el mismo flujo practicado en la sesión anterior. No se
usan comandos de Git en este curso durante las primeras once semanas.

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   ├── sesion-01-demo.ipynb
│   └── sesion-02-variables-tipos-operadores.ipynb
└── README.md
```

Nombre sugerido para el archivo:
`sesion-02-variables-tipos-operadores.ipynb`.

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del laboratorio.
2. La Parte 1 completa: celdas de código con las variables y los tres grupos
   de operadores, cada bloque precedido por una celda de texto que explique
   qué hace.
3. La Parte 2 completa, con la misma organización.
4. (Opcional) la Parte 3, si la resolvió.

### Ejemplo de celda de verificación

Antes de subir, agregue una celda final como esta, para confirmar que sus
resultados son consistentes con los datos de partida:

```python
# Celda de verificación — ejecútela al final, después de todo lo demás
assert type(precio_cuaderno) == int, "precio_cuaderno debería ser int"
assert type(precio_cafe) == float, "precio_cafe debería ser float"
assert type(temp_lunes) == float, "temp_lunes debería ser float"
assert isinstance(precio_cafe > precio_cuaderno, bool), "la comparación debe dar un booleano"
print("Verificación completada sin errores.")
```

Si alguna línea falla, revise el tipo o el nombre de la variable
correspondiente antes de subir el notebook.

**Antes de subir:** ejecute `Entorno de ejecución → Ejecutar todas` y
confirme que ninguna celda muestra un error.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Variables y tipos** | 20 | Todas las variables solicitadas están declaradas, con nombres significativos y el tipo de dato correcto (verificable con `type()`). |
| **Operadores aritméticos** | 20 | Todos los cálculos aritméticos pedidos en ambas partes están presentes y producen el resultado numérico correcto. |
| **Operadores de comparación y lógicos** | 20 | Todas las comparaciones y combinaciones lógicas pedidas están presentes y muestran el resultado booleano correcto con `print()`. |
| **Ejecución sin errores** | 15 | El notebook ejecuta de principio a fin con `Ejecutar todas` sin ningún error. |
| **Documentación en celdas de texto** | 15 | Cada bloque de código (variables, aritméticos, comparación, lógicos, por cada parte) tiene una celda de texto previa que explica qué hace. |
| **Entrega correcta** | 10 | El notebook quedó subido a `ejercicios/` mediante Flujo A, con el nombre de archivo indicado, y es visible en el repositorio de GitHub. |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "Mi suma de precios da un número pegado y raro, no el total que esperaba"
- Verifique con `type()` que las variables de precio son `int` o `float` y
  no `str`. Si una variable quedó como texto (por ejemplo, escribió
  `"3500"` con comillas), el operador `+` concatena en vez de sumar.

### "Python me da un error al imprimir un texto junto con un número"
- No use `+` para unir un `str` con un número dentro de `print()`. Use
  `print("Total:", total_compra)` separando por comas, o convierta el
  número con `str()` antes de concatenar.

### "No sé por qué `/` y `//` no me dan el mismo resultado"
- `/` siempre devuelve un `float` con el resultado exacto de la división.
  `//` descarta la parte decimal y devuelve solo la parte entera. Pruebe
  ambas por separado con los mismos dos números para ver la diferencia.

### "Mi celda no muestra ningún resultado aunque escribí la comparación"
- En Colab, solo la **última línea** de una celda se muestra automáticamente
  si no está dentro de un `print()`. Si la comparación no es la última línea
  de la celda, o si hay líneas después, debe envolverla en `print()`.

### "No sé si `and` u `or` es el que necesito"
- `and` da `True` solo si **ambas** condiciones son `True`. `or` da `True`
  si **al menos una** de las dos lo es. Evalúe cada condición por separado
  con `print()` antes de combinarlas, para verificar cuál es cuál.

## Extensiones Sugeridas (Bonus)

- Agregar un tercer dataset de su elección (por ejemplo, distancias o
  calificaciones) y repetir los tres grupos de operadores sobre él.
- Investigar qué hace el operador `%` con números negativos y documentar el
  resultado en una celda de texto.
- Calcular el resultado de una expresión con varios operadores combinados y
  explicar en una celda de texto el orden exacto en que Python la evaluó.

## Recursos

- **Apuntes del curso:** lección "Variables, tipos de datos y operadores".
- **Repaso de Flujo A:** lección "Configuración del entorno de trabajo
  (Colab y GitHub) y diagnóstico".
- **Entorno de trabajo:** Google Colab (`colab.research.google.com`), sin
  instalación local.
- **Documentación oficial:** sección de tipos numéricos y operadores de la
  documentación de Python 3.

**Plazo de entrega:** antes del inicio de la sesión de la Semana 3 (jueves
20 de agosto de 2026).

## Ejercicios de práctica

Diez ejercicios cortos para reforzar variables, tipos de datos y operadores
sobre datos cotidianos distintos a los de las Partes 1 y 2. Cada uno se
resuelve asignando variables con el tipo correcto y aplicando operadores
aritméticos, de comparación y/o lógicos, mostrando siempre el resultado con
`print()`. Como en el resto del laboratorio, **no use `if`, bucles ni
`input()`**: los valores de partida van asignados directamente en el código.

Resuélvalos en orden: los primeros piden una sola operación y los últimos
combinan varios tipos y operadores.

### Ejercicio 1 — Receta de cocina

Una receta de galletas necesita 25.5 gramos de harina por porción. Va a
preparar 8 porciones.

```python
# TODO: declare gramos_por_porcion y numero_de_porciones con el tipo correcto
# TODO: calcule el total de gramos de harina necesarios y muéstrelo con print()
```

**Requisitos:** use el operador aritmético de multiplicación (`*`).

### Ejercicio 2 — Factura de servicios

Un hogar consumió 142 kWh este mes. La tarifa es de 623.5 pesos por kWh.

```python
# TODO: declare consumo_kwh y tarifa_kwh con el tipo correcto
# TODO: calcule el total a pagar y muéstrelo con print()
```

**Requisitos:** use el operador aritmético de multiplicación (`*`).

### Ejercicio 3 — Tiempo de un viaje

Un viaje por carretera tiene una distancia de 350.0 km. El vehículo mantiene
una velocidad promedio de 80 km/h.

```python
# TODO: declare distancia_km y velocidad_promedio con el tipo correcto
# TODO: calcule el tiempo estimado del viaje en horas y muéstrelo con print()
# TODO: verifique con type() el tipo del resultado
```

**Requisitos:** use el operador de división (`/`).

### Ejercicio 4 — Comparar precios de café

Dos marcas de café cuestan, respectivamente, 15900 y 14500 pesos la libra.

```python
# TODO: declare precio_marca_a y precio_marca_b
# TODO: evalúe y muestre con print() cuál marca es más barata
# TODO: evalúe y muestre con print() si ambas marcas cuestan lo mismo
```

**Requisitos:** use al menos dos operadores de comparación distintos
(`<`, `>`, `==`, etc.).

### Ejercicio 5 — Promedio de calificaciones

Un estudiante obtuvo tres notas parciales en un curso: 4.2, 3.5 y 4.8 (sobre
5.0).

```python
# TODO: declare las tres notas parciales
# TODO: calcule el promedio y muéstrelo con print()
# TODO: evalúe y muestre con print() si el promedio es mayor o igual a 3.0 (aprobación)
```

**Requisitos:** combine un operador aritmético (para el promedio) con uno de
comparación (para la aprobación).

### Ejercicio 6 — Consumo dentro del rango normal

Retome el `consumo_kwh` del Ejercicio 2. El proveedor considera "consumo
normal" un valor entre 100 y 200 kWh.

```python
# TODO: evalúe si consumo_kwh es mayor o igual a 100
# TODO: evalúe si consumo_kwh es menor o igual a 200
# TODO: combine ambas evaluaciones con "and" y muestre el resultado con print()
```

**Requisitos:** use el operador lógico `and` sobre dos comparaciones.

### Ejercicio 7 — Tramos de un viaje

Un viaje se divide en tres tramos, de 120.0 km, 180.0 km y 95.0 km.

```python
# TODO: declare las distancias de los tres tramos
# TODO: evalúe y muestre con print() si al menos uno de los tramos superó los 150 km
```

**Requisitos:** use el operador lógico `or` combinando tres comparaciones.

### Ejercicio 8 — Aprobación y asistencia

Retome el promedio del Ejercicio 5. El estudiante además tuvo una asistencia
de 85% al curso (el mínimo exigido es 80%).

```python
# TODO: declare asistencia_porcentaje
# TODO: evalúe si el promedio del Ejercicio 5 corresponde a una reprobación (menor a 3.0)
# TODO: muestre con print(), usando "not", si el estudiante NO reprobó
```

**Requisitos:** use el operador lógico `not` sobre una comparación.

### Ejercicio 9 — Descuento y promoción en la factura

Retome `consumo_kwh` y `tarifa_kwh` del Ejercicio 2. Si el usuario paga antes
del vencimiento, obtiene un 5% de descuento sobre el total. Además, el
proveedor ofrece una promoción si el consumo es menor a 100 kWh **o** si el
pago se hace anticipado.

```python
# TODO: declare pago_anticipado (bool)
# TODO: calcule el total de la factura (consumo_kwh * tarifa_kwh)
# TODO: calcule el total con el 5% de descuento aplicado
# TODO: evalúe y muestre con print() si aplica la promoción (combine "or" con las
#       condiciones de consumo y pago anticipado)
```

**Requisitos:** combine operadores aritméticos (multiplicación y porcentaje)
con un operador lógico (`or`).

### Ejercicio 10 — Intercambiar dos precios

Una ferretería tiene dos repuestos con precios mal registrados: el
`precio_tornillo` quedó guardado como el de la `tuerca`, y viceversa. Corrija
el error intercambiando los valores de las dos variables, **sin asignar los
valores correctos a mano** — debe usar una variable temporal para el
intercambio.

```python
precio_tornillo = 250
precio_tuerca = 180

# TODO: muestre con print() los valores antes de intercambiar
# TODO: intercambie los valores de precio_tornillo y precio_tuerca
#       usando una variable temporal (por ejemplo, "temporal")
# TODO: muestre con print() los valores después de intercambiar, para confirmar el intercambio
```

**Requisitos:** use una variable temporal adicional para el intercambio; no
reescriba los números directamente en cada variable.

**Entregable de esta sección:** los diez ejercicios se entregan en un
notebook **separado** del de las Partes 1 y 2, subido a la misma carpeta
`ejercicios/` de su repositorio `curso-programacion-cientifica`, con el mismo
Flujo A (`Archivo → Guardar una copia en GitHub`). Nombre sugerido para el
archivo: `sesion-02-ejercicios-practica.ipynb`. Súbalo junto con (o
inmediatamente después de) el notebook de las Partes 1 y 2.

Esta actividad **hace parte de su nota de Seguimiento (◇)** de la semana,
que es acumulada a lo largo del curso y no tiene un corte único en esta
sesión. Se evalúa con esta lista de verificación, más ligera que la rúbrica
de las Partes 1 y 2:

- Al menos 8 de los 10 ejercicios están resueltos correctamente.
- El notebook ejecuta de principio a fin (`Ejecutar todas`) sin ningún error.
- Cada ejercicio muestra su resultado con `print()`.
- El notebook fue subido correctamente a `ejercicios/` con el nombre
  sugerido y es visible en su repositorio de GitHub.
