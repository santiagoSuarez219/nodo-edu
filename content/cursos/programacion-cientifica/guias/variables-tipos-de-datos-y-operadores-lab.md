---
title: "Taller de variables, tipos de datos y operadores"
updatedAt: "2026-08-08"
---

# Taller de variables, tipos de datos y operadores

## Objetivo

Practicar la asignación de variables en Python y el uso de operadores
aritméticos, de comparación y lógicos, resolviendo diez ejercicios cortos
sobre distintos escenarios cotidianos: el inventario y la compra en una
tienda pequeña, un registro de temperaturas diarias, una taza de café, una
factura de servicios, un promedio de calificaciones y el inventario de una
ferretería.

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

## Desarrollo del Taller

El taller tiene **diez ejercicios**, en orden creciente de dificultad, que
se resuelven todos en el **mismo notebook**. Cada ejercicio debe ir
precedido por una celda de texto que explique brevemente qué hace el
ejercicio, y cada resultado debe mostrarse con `print()`. Resuélvalos en el
orden en que aparecen: varios de los últimos reutilizan variables de
ejercicios anteriores.

Recuerde: ningún ejercicio requiere `if`, bucles ni `input()`. Los valores
de partida van asignados directamente en el código.

### Ejercicio 1 — Inventario de la tienda

Una tienda pequeña tiene el siguiente inventario:

```text
Productos y precios (en pesos colombianos):
- Cuaderno: 3500
- Lápiz: 800
- Café: 6200.50
Cantidad a comprar: 3 cuadernos, 5 lápices
La tienda tiene actualmente descuentos activos: no
```

```python
# TODO: declare nombre_producto (str) con el nombre de un producto de su elección
# TODO: declare precio_cuaderno (int) y precio_lapiz (int)
# TODO: declare precio_cafe (float)
# TODO: declare hay_descuento (bool) indicando si la tienda tiene descuentos activos
# TODO: declare cantidad_cuadernos (int) y cantidad_lapices (int)
# TODO: verifique con type() el tipo de cada una de las variables anteriores
```

**Requisitos:**
- Declare las siete variables indicadas, con el tipo de dato correcto para
  cada una (`int`, `float`, `str`, `bool`).
- Verifique con `type()` que cada variable quedó con el tipo esperado.

### Ejercicio 2 — Total de la compra y descuento

Retome las variables del Ejercicio 1.

```python
# TODO: calcule total_cuadernos (precio_cuaderno * cantidad_cuadernos) y muéstrelo con print()
# TODO: calcule total_lapices (precio_lapiz * cantidad_lapices) y muéstrelo con print()
# TODO: calcule total_general sumando total_cuadernos, total_lapices y precio_cafe
# TODO: calcule un descuento del 10% sobre total_general
# TODO: calcule total_con_descuento restando el descuento a total_general
```

**Requisitos:** use los operadores de multiplicación (`*`), suma (`+`) y
resta (`-`).

### Ejercicio 3 — Reparto en paquetes

Retome `cantidad_cuadernos` del Ejercicio 1 y `precio_cafe` del Ejercicio 1.

```python
# TODO: calcule cuántos paquetes completos de 4 cuadernos se pueden armar con
#       cantidad_cuadernos (división entera)
# TODO: calcule cuántos cuadernos sueltos quedan (módulo)
# TODO: calcule el precio del café elevado al cuadrado
# TODO: muestre los tres resultados con print()
```

**Requisitos:** use división entera (`//`), módulo (`%`) y potencia (`**`).

### Ejercicio 4 — Comparar precios de café

Dos marcas de café cuestan, respectivamente, 15900 y 14500 pesos la libra.

```python
# TODO: declare precio_marca_a y precio_marca_b
# TODO: evalúe y muestre con print() cuál marca es más barata
# TODO: evalúe y muestre con print() si ambas marcas cuestan lo mismo
```

**Requisitos:** use al menos dos operadores de comparación distintos
(`<`, `>`, `==`, etc.).

### Ejercicio 5 — Promedio y comparación de temperaturas

Trabaje con el siguiente conjunto de datos:

```text
Temperaturas registradas (en grados Celsius):
- Lunes: 18.5
- Martes: 21.0
- Miércoles: 19.8
Temperatura promedio de referencia de la semana: 20.0
```

```python
# TODO: declare temp_lunes, temp_martes, temp_miercoles y temp_promedio_semana (float)
# TODO: calcule el promedio de los tres días y muéstrelo con print()
# TODO: calcule la diferencia entre la temperatura del martes y la del lunes
# TODO: evalúe y muestre con print() si el martes fue más caluroso que el promedio de referencia
# TODO: evalúe y muestre con print() si el miércoles fue igual al promedio de referencia
# TODO: evalúe y muestre con print() si el lunes fue el día más frío de los tres
#       (comparándolo con los otros dos)
```

**Requisitos:** use el operador de división (`/`) para el promedio y al
menos tres operadores de comparación distintos.

### Ejercicio 6 — Temperatura templada y día caluroso

Retome las variables de temperatura del Ejercicio 5.

```python
# TODO: evalúe y muestre con print() si el lunes tuvo una temperatura "templada",
#       entendida como un valor entre 15 y 25 grados (combine dos comparaciones con "and")
# TODO: evalúe y muestre con print() si al menos uno de los tres días superó los 20 grados
#       (combine tres comparaciones con "or")
```

**Requisitos:** use el operador lógico `and` sobre dos comparaciones y el
operador lógico `or` sobre tres comparaciones.

### Ejercicio 7 — Factura de servicios y consumo normal

Un hogar consumió 142 kWh este mes. La tarifa es de 623.5 pesos por kWh. El
proveedor considera "consumo normal" un valor entre 100 y 200 kWh.

```python
# TODO: declare consumo_kwh (int) y tarifa_kwh (float)
# TODO: calcule el total a pagar (consumo_kwh * tarifa_kwh) y muéstrelo con print()
# TODO: evalúe si consumo_kwh es mayor o igual a 100
# TODO: evalúe si consumo_kwh es menor o igual a 200
# TODO: combine ambas evaluaciones con "and" y muestre con print() si el consumo es normal
```

**Requisitos:** use el operador de multiplicación (`*`) y el operador
lógico `and` sobre dos comparaciones.

### Ejercicio 8 — Promedio de calificaciones y aprobación

Un estudiante obtuvo tres notas parciales en un curso: 4.2, 3.5 y 4.8 (sobre
5.0).

```python
# TODO: declare las tres notas parciales
# TODO: calcule el promedio y muéstrelo con print()
# TODO: evalúe y muestre con print() si el promedio es mayor o igual a 3.0 (aprobación)
```

**Requisitos:** combine un operador aritmético (para el promedio) con uno
de comparación (para la aprobación).

### Ejercicio 9 — Aprobación y asistencia

Retome el promedio del Ejercicio 8. El estudiante además tuvo una
asistencia de 85% al curso.

```python
# TODO: declare asistencia_porcentaje
# TODO: evalúe si el promedio del Ejercicio 8 corresponde a una reprobación (menor a 3.0)
# TODO: muestre con print(), usando "not", si el estudiante NO reprobó
```

**Requisitos:** use el operador lógico `not` sobre una comparación.

### Ejercicio 10 — Intercambiar dos precios

Una ferretería tiene dos repuestos con precios mal registrados: el
`precio_tornillo` quedó guardado como el de la `tuerca`, y viceversa.
Corrija el error intercambiando los valores de las dos variables, **sin
asignar los valores correctos a mano** — debe usar una variable temporal
para el intercambio.

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

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, usando `Archivo → Guardar una copia en
GitHub` (Flujo A) — el mismo flujo practicado en la sesión anterior. No se
usan comandos de Git en este curso durante las primeras once semanas.

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   └── taller-variables-tipos-operadores.ipynb
└── README.md
```

Nombre sugerido para el archivo:
`taller-variables-tipos-operadores.ipynb`.

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del taller.
2. Los diez ejercicios completos, en el orden en que aparecen en esta guía,
   cada uno precedido por una celda de texto que explique qué hace.
3. Una celda de verificación final (ver ejemplo abajo).

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
| **Variables y tipos** | 20 | Todas las variables solicitadas en los diez ejercicios están declaradas, con nombres significativos y el tipo de dato correcto (verificable con `type()`). |
| **Operadores aritméticos** | 20 | Todos los cálculos aritméticos pedidos en los diez ejercicios están presentes y producen el resultado numérico correcto. |
| **Operadores de comparación y lógicos** | 20 | Todas las comparaciones y combinaciones lógicas pedidas en los diez ejercicios están presentes y muestran el resultado booleano correcto con `print()`. |
| **Ejecución sin errores** | 15 | El notebook ejecuta de principio a fin con `Ejecutar todas` sin ningún error. |
| **Documentación en celdas de texto** | 15 | Cada uno de los diez ejercicios tiene una celda de texto previa que explica qué hace. |
| **Entrega correcta** | 10 | El notebook quedó subido a `ejercicios/` mediante Flujo A, con el nombre de archivo indicado, y es visible en el repositorio de GitHub. |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "Mi suma de precios da un número pegado y raro, no el total que esperaba"
- Verifique con `type()` que las variables de precio son `int` o `float` y
  no `str`. Si una variable quedó como texto (por ejemplo, escribió
  `"3500"` con comillas), el operador `+` concatena en vez de sumar.

### "Python me da un error al imprimir un texto junto con un número"
- No use `+` para unir un `str` con un número dentro de `print()`. Use
  `print("Total:", total_general)` separando por comas, o convierta el
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

- Investigar qué hace el operador `%` con números negativos y documentar el
  resultado en una celda de texto.
- Calcular el resultado de una expresión con varios operadores combinados y
  explicar en una celda de texto el orden exacto en que Python la evaluó.
- **Tiempo de un viaje:** dado un viaje de 350.0 km recorrido a una
  velocidad promedio de 80 km/h, calcule el tiempo estimado en horas con el
  operador de división (`/`) y verifique con `type()` el tipo del
  resultado.
- **Tramos de un viaje:** dado un viaje dividido en tres tramos (120.0 km,
  180.0 km y 95.0 km), evalúe y muestre con `print()` si al menos uno de
  los tramos superó los 150 km, combinando tres comparaciones con `or`.

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
