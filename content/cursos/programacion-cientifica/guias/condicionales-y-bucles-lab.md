---
title: "Taller de condicionales y bucles"
updatedAt: "2026-08-17"
---

# Taller de condicionales y bucles

## Objetivo

Practicar las estructuras de control de flujo de Python resolviendo diez
ejercicios cortos que retoman los mismos escenarios del taller anterior: el
inventario de la tienda pequeña, el registro de temperaturas diarias, la
factura de servicios, el promedio de calificaciones y el inventario de una
ferretería. Esta vez esas variables van a decidir y a repetirse, no solo a
mostrarse con `print()`.

Competencias esperadas:
- Ejecutar un bloque de código solo bajo cierta condición con `if`.
- Cubrir el camino contrario con `else` y encadenar más de dos caminos con
  `elif`, sin evaluar condiciones de más.
- Repetir un bloque de código un número conocido de veces con `for` y
  `range()`, recorriendo una lista por índice.
- Repetir un bloque de código mientras una condición siga siendo `True` con
  `while`, sin caer en un bucle infinito.
- Cortar un bucle por completo con `break` y saltar solo la vuelta actual
  con `continue`, cada uno en la situación que le corresponde.
- Mantener una indentación de 4 espacios consistente en cada bloque.

## Requisitos Previos

Antes de comenzar, debe dominar lo visto en la lección **"Condicionales y
bucles"**:
- La sintaxis de `if`, `elif` y `else`, y por qué la indentación en Python
  es sintaxis y no estilo.
- `for` con `range()` para repetir un número conocido de veces o recorrer
  una lista por índice.
- `while` para repetir mientras una condición sea `True`, y por qué olvidar
  actualizar la variable de la condición produce un bucle infinito.
- La diferencia entre `break` (corta el bucle por completo) y `continue`
  (salta solo la vuelta actual).

Del **"Taller de variables, tipos de datos y operadores"** debe tener
dominado:
- La declaración de variables `int`, `float`, `str` y `bool` con nombres
  significativos.
- Los operadores aritméticos, de comparación y lógicos, y cómo combinarlos
  con `and`, `or` y `not`.
- El Flujo A para subir un notebook a GitHub desde Colab.

## Desarrollo del Taller

El taller tiene **diez ejercicios**, en orden creciente de dificultad, que
se resuelven todos en el **mismo notebook**. Cada ejercicio debe ir
precedido por una celda de texto que explique brevemente qué hace, y cada
resultado debe mostrarse con `print()`. Resuélvalos en el orden en que
aparecen: varios de los últimos reutilizan variables de ejercicios
anteriores.


### Ejercicio 1 — Clasificar el stock de un producto

Un producto de la tienda tiene la siguiente cantidad en inventario:

```text
cantidad_en_stock = 3
```

```python
# TODO: declare cantidad_en_stock (int) con el valor de arriba
# TODO: use if / elif / else para clasificar el stock en una variable "nivel":
#       - "Agotado" si cantidad_en_stock es igual a 0
#       - "Stock bajo" si cantidad_en_stock es menor a 5
#       - "Stock suficiente" en cualquier otro caso
# TODO: muestre "nivel" con print()
```

**Requisitos:** use exactamente una cadena `if` / `elif` / `else`, en ese
orden.

### Ejercicio 2 — Alerta de reposición inmediata

Retome `cantidad_en_stock` y `nivel` del Ejercicio 1.

```python
# TODO: use if / else para decidir si se necesita reponer el producto:
#       - si nivel es "Agotado" o cantidad_en_stock es menor a 5, imprima
#         "Reponer pronto"
#       - en cualquier otro caso, imprima "Sin acción requerida"
```

**Requisitos:** use un operador lógico (`or`) dentro de la condición del
`if`.

### Ejercicio 3 — Clasificar el clima del lunes

Retome la temperatura del lunes que registró en el taller anterior:

```text
temp_lunes = 18.5
```

```python
# TODO: declare temp_lunes (float) con el valor de arriba
# TODO: use if / elif / else para clasificar el clima en una variable "clima":
#       - "Frío" si temp_lunes es menor a 15
#       - "Templado" si temp_lunes está entre 15 y 25 (inclusive)
#       - "Caluroso" si temp_lunes es mayor a 25
# TODO: muestre "clima" con print()
```

**Requisitos:** use exactamente una cadena `if` / `elif` / `else`.

### Ejercicio 4 — Validar el consumo de la factura

Retome los datos de la factura de servicios del taller anterior:

```text
consumo_kwh = 142
tarifa_kwh = 623.5
```

```python
# TODO: declare consumo_kwh (int) y tarifa_kwh (float) con los valores de arriba
# TODO: use if / else para evaluar si el consumo está entre 100 y 200 kWh
#       (inclusive):
#       - si está en ese rango, imprima "Consumo normal"
#       - si no, imprima "Consumo fuera de rango, revisar con el proveedor"
```

**Requisitos:** combine dos comparaciones con `and` dentro de la condición
del `if`.

### Ejercicio 5 — Aprobación con mensaje

Retome las tres notas parciales del taller anterior y su promedio:

```text
nota_1 = 4.2
nota_2 = 3.5
nota_3 = 4.8
```

```python
# TODO: declare nota_1, nota_2 y nota_3 con los valores de arriba
# TODO: calcule el promedio de las tres notas
# TODO: use if / elif / else para clasificar el resultado en una variable
#       "resultado":
#       - "Reprobado" si el promedio es menor a 3.0
#       - "Aprobado" si el promedio está entre 3.0 y 4.4 (inclusive)
#       - "Aprobado con excelencia" si el promedio es 4.5 o más
# TODO: muestre "resultado" con print()
```

**Requisitos:** la cadena `if` / `elif` / `else` debe cubrir los tres casos
sin solapamientos.

### Ejercicio 6 — Recorrer el inventario completo

La tienda tiene ahora un inventario con varios productos:

```text
cantidades_en_stock = [0, 3, 12, 0, 7, 2]
```

```python
# TODO: declare cantidades_en_stock (lista) con los valores de arriba
# TODO: use un for con range(len(...)) para recorrer la lista por índice
# TODO: dentro del for, obtenga la cantidad de la posición actual en una
#       variable "cantidad"
# TODO: dentro del for, clasifique "cantidad" con if / elif / else igual
#       que en el Ejercicio 1 ("Agotado" / "Stock bajo" / "Stock suficiente")
# TODO: dentro del for, muestre con print() un mensaje con el índice y el
#       nivel obtenido, por ejemplo: f"Producto {indice}: {nivel}"
```

**Requisitos:** use `for` con `range(len(...))`, no un valor fijo de
repeticiones.

### Ejercicio 7 — Promedio semanal de temperaturas

La semana de temperaturas quedó registrada así:

```text
temperaturas_semana = [18.5, 21.0, 19.8, 24.3, 17.2]
```

```python
# TODO: declare temperaturas_semana (lista) con los valores de arriba
# TODO: declare un acumulador suma_temperaturas en 0
# TODO: declare un contador dias_calurosos en 0
# TODO: use un for con range(len(...)) para recorrer la lista
# TODO: dentro del for, sume cada temperatura a suma_temperaturas
# TODO: dentro del for, use if para incrementar dias_calurosos cuando la
#       temperatura del día sea mayor a 20
# TODO: después del for, calcule el promedio de la semana dividiendo
#       suma_temperaturas entre la cantidad de días
# TODO: muestre con print() el promedio semanal y la cantidad de días
#       calurosos
```

**Requisitos:** el acumulador y el contador deben actualizarse dentro del
`for`, y el promedio se calcula después de que el `for` termina.

### Ejercicio 8 — Comprar tornillos mientras alcance el presupuesto

La ferretería tiene un presupuesto para reponer tornillos:

```text
presupuesto_ferreteria = 3000
precio_tornillo = 250
```

```python
# TODO: declare presupuesto_ferreteria (int) y precio_tornillo (int) con
#       los valores de arriba
# TODO: declare un contador tornillos_comprados en 0
# TODO: use while para repetir mientras presupuesto_ferreteria sea mayor o
#       igual a precio_tornillo:
#       - descuente precio_tornillo de presupuesto_ferreteria
#       - incremente tornillos_comprados en 1
# TODO: después del while, muestre con print() cuántos tornillos se
#       compraron y cuánto presupuesto quedó sin usar
```

**Requisitos:** use `while`, no `for`. Verifique que la variable de la
condición (`presupuesto_ferreteria`) se actualiza dentro del bloque, para
no producir un bucle infinito.

### Ejercicio 9 — Buscar la primera herramienta cara

La ferretería tiene los siguientes precios de herramientas:

```text
precios_herramientas = [12000.0, 8500.0, 25000.0, 9800.0]
```

```python
# TODO: declare precios_herramientas (lista) con los valores de arriba
# TODO: use un for para recorrer la lista directamente por sus valores
#       (sin range ni índice)
# TODO: dentro del for, si el precio es mayor a 20000, muestre con print()
#       un mensaje indicando que encontró la primera herramienta cara, con
#       su precio, y corte el bucle de inmediato
# TODO: si el precio no supera 20000, muestre con print() un mensaje
#       indicando que sigue revisando, con el precio actual
```

**Requisitos:** use `break` exactamente una vez, solo cuando encuentre el
primer precio mayor a 20000.

### Ejercicio 10 — Revisión completa del inventario de la ferretería

La ferretería tiene el siguiente inventario, con nombre y cantidad de cada
herramienta en la misma posición de cada lista:

```text
nombres_herramientas = ["Martillo", "Taladro", "Sierra", "Destornillador", "Nivel", "Llave inglesa"]
cantidades_herramientas = [5, 0, 2, 8, 0, 1]
```

```python
# TODO: declare nombres_herramientas y cantidades_herramientas con los
#       valores de arriba
# TODO: use un for con range(len(...)) para recorrer ambas listas por índice
# TODO: dentro del for, clasifique la cantidad de la posición actual con
#       if / elif / else en "Agotado" (0), "Stock bajo" (menor a 5) o
#       "Stock suficiente" (en cualquier otro caso)
# TODO: si el nivel es "Stock suficiente", use continue para saltar esa
#       herramienta sin imprimir nada — no requiere atención
# TODO: si el nivel es "Agotado", muestre con print() una alerta de
#       reposición urgente con el nombre de la herramienta, y use break
#       para detener la revisión de inmediato, sin seguir con el resto del
#       inventario
# TODO: si el nivel es "Stock bajo", muestre con print() el nombre de la
#       herramienta y su cantidad, y continúe con la siguiente vuelta con
#       normalidad (sin continue ni break)
```

**Requisitos:** el mismo `for` debe combinar `if`/`elif`/`else`, `continue`
y `break`, cada uno en el caso que le corresponde. El bucle debe detenerse
en la primera herramienta "Agotado" que encuentre, sin revisar las
siguientes posiciones de la lista.

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, usando `Archivo → Guardar una copia en
GitHub`

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   ├── taller-variables-tipos-operadores.ipynb
│   └── taller-condicionales-bucles.ipynb
└── README.md
```

Nombre sugerido para el archivo: `taller-condicionales-bucles.ipynb`.

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del taller.
2. Los diez ejercicios completos, en el orden en que aparecen en esta guía,
   cada uno precedido por una celda de texto que explique qué hace.
3. Una celda de verificación final (ver ejemplo abajo).

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Condicionales (`if`/`elif`/`else`)** | 25 | Todas las clasificaciones pedidas en los diez ejercicios usan la cadena de condicionales correcta, en el orden correcto, y producen el resultado esperado para los valores de partida dados. |
| **Bucles (`for`/`range()`, `while`)** | 25 | Los ejercicios 6 a 10 recorren o repiten con el tipo de bucle pedido (`for` con `range()` o directo sobre la lista, `while` con actualización de la condición), sin bucles infinitos. |
| **`break` y `continue`** | 15 | Los ejercicios 9 y 10 usan `break` y `continue` exactamente en el caso descrito en el enunciado, sin cortar ni saltar vueltas de más. |
| **Ejecución sin errores** | 15 | El notebook ejecuta de principio a fin con `Ejecutar todas` sin ningún error ni bucle que no termine. |
| **Documentación en celdas de texto** | 10 | Cada uno de los diez ejercicios tiene una celda de texto previa que explica qué hace. |
| **Entrega correcta** | 10 | El notebook quedó subido a `ejercicios/` mediante Flujo A, con el nombre de archivo indicado, y es visible en el repositorio de GitHub. |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "Python me marca `IndentationError` y no entiendo por qué"
- Revise que todas las líneas de un mismo bloque `if`, `elif`, `else`,
  `for` o `while` tengan exactamente la misma cantidad de espacios al
  inicio. Mezclar 3 y 4 espacios en el mismo bloque produce este error,
  aunque a simple vista se vean alineados.

### "Mi celda con `while` nunca termina de ejecutar"
- Es un bucle infinito: la variable que aparece en la condición del
  `while` no se está actualizando dentro del bloque. Revise que la línea
  que descuenta o incrementa esa variable esté indentada dentro del
  `while`, y no fuera de él.

### "Mi `for` con `range(len(...))` revisa una posición de más o de menos"
- `range(len(lista))` genera índices desde `0` hasta `len(lista) - 1`, no
  hasta `len(lista)`. Si su bucle intenta acceder a `lista[len(lista)]`,
  Python lanza `IndexError`.

### "Puse `elif` antes que `if` y Python marca error de sintaxis"
- `elif` y `else` siempre necesitan un `if` inmediatamente antes, en el
  mismo nivel de indentación. No pueden aparecer solos ni después de otra
  instrucción que no sea parte de la misma cadena condicional.

### "No sé si necesito `break` o `continue` en un ejercicio"
- `continue` es para "esta vuelta no me interesa, pero sigo revisando las
  demás". `break` es para "ya encontré lo que buscaba (o algo urgente),
  dejo de revisar por completo". Antes de escribir, pregúntese: ¿el bucle
  debe seguir después de este caso, o debe detenerse ahí mismo?

## Extensiones Sugeridas (Bonus)

- **Inventario completo con reposición:** extienda el Ejercicio 10 para que,
  en vez de detenerse con `break` en el primer "Agotado", acumule en una
  lista los nombres de todas las herramientas agotadas y las muestre juntas
  al final del recorrido.
- **Clima de toda la semana:** aplique la clasificación de clima del
  Ejercicio 3 a la lista completa `temperaturas_semana` del Ejercicio 7,
  usando `for` y `if`/`elif`/`else` juntos, y cuente cuántos días de la
  semana fueron "Templado".
- **Ahorro con `while` anidado a una meta:** dado un ahorro inicial de
  20000 pesos y un ingreso semanal de 5000 pesos, calcule con `while`
  cuántas semanas se necesitan para alcanzar una meta de 100000 pesos.

## Recursos

- **Apuntes del curso:** lección "Condicionales y bucles".
- **Repaso de variables y operadores:** lección "Variables, tipos de datos
  y operadores" y su taller.
- **Entorno de trabajo:** Google Colab (`colab.research.google.com`), sin
  instalación local.
- **Documentación oficial:** sección de sentencias de control de flujo de
  la documentación de Python 3.

