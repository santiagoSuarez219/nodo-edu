> Sesión dictada en vivo por el docente (demo), no es trabajo independiente
> del estudiante — no hay guía de laboratorio para esta sesión. El hilo
> conductor es un solo dominio: el inventario y las ventas de la ferretería.
> El paso 1 reproduce en vivo el error del taller pasado (listas paralelas
> desalineadas); los pasos 2 a 6 resuelven, uno a uno, por qué esa forma de
> guardar los datos no alcanza; el paso 7 cierra reconstruyendo el
> inventario completo como lista de diccionarios, la estructura que
> finalmente lo resuelve.

## Paso 1 — El problema: listas paralelas desalineadas

Reproducir en vivo, en una celda de Colab, el inventario tal como quedó en
el taller pasado:

```python
nombres_herramientas = ["Martillo", "Taladro", "Sierra", "Destornillador", "Nivel", "Llave inglesa"]
cantidades_herramientas = [5, 0, 2, 8, 0, 1]

# para saber cuantas unidades hay de "Destornillador":
indice = nombres_herramientas.index("Destornillador")
print(cantidades_herramientas[indice])
```

```text
8
```

Ahora, simular que llega una herramienta nueva y **cometer el error a
propósito**, sin corregirlo todavía:

```python
nombres_herramientas.append("Alicate")
# ejecutar la celda anterior y detenerse aqui: NO agregar el append
# correspondiente en cantidades_herramientas todavia

print(nombres_herramientas)
print(cantidades_herramientas)
print(len(nombres_herramientas), len(cantidades_herramientas))
```

```text
['Martillo', 'Taladro', 'Sierra', 'Destornillador', 'Nivel', 'Llave inglesa', 'Alicate']
[5, 0, 2, 8, 0, 1]
7 6
```

Punto a resaltar: Python **no lanza ningún error**. El programa sigue
corriendo con dos listas de largo distinto. Preguntar al grupo qué pasaría
si alguien intenta `cantidades_herramientas[6]` ahora mismo — ejecutarlo en
vivo y mostrar el `IndexError`:

```python
print(cantidades_herramientas[6])
```

```text
IndexError: list index out of range
```

Cerrar el paso agregando el `append` que faltaba, para dejar el estado
consistente antes de seguir:

```python
cantidades_herramientas.append(15)   # ahora si, las dos listas quedan alineadas
```

Punto a resaltar: el error de fondo no es haberse olvidado una línea — es
que nombre y cantidad de una misma herramienta viven en dos contenedores
separados, unidos solo por una coincidencia de posición que el programador
debe mantener a mano. El resto de la sesión resuelve eso.

## Paso 2 — La lista a fondo

La lista ya es conocida del curso; en este paso se demuestran sus métodos y
el slicing, que sí son nuevos.

```python
inventario = ["Martillo", "Destornillador", "Taladro"]

inventario.append("Llave inglesa")     # agrega al final
inventario.insert(1, "Serrucho")       # inserta en la posicion 1, desplaza el resto
inventario.remove("Destornillador")    # elimina la PRIMERA coincidencia por valor
ultimo = inventario.pop()              # elimina y devuelve el ultimo elemento
inventario.sort()                      # ordena in-place (alfabeticamente, para strings)

print(inventario)
print(f"Se retiro: {ultimo}")
print(inventario[0:2])   # slicing: elementos en posicion 0 y 1 (el 2 no se incluye)
```

```text
['Martillo', 'Serrucho', 'Taladro']
Se retiro: Llave inglesa
['Martillo', 'Serrucho']
```

Punto a resaltar: ejecutar `print(inventario)` inmediatamente después de
cada línea (una celda por método, o comentando y descomentando) para que
el grupo vea que la lista se modifica **in-place** — no hay que reasignar
`inventario = inventario.append(...)`; de hecho, hacerlo rompe el código
porque `append` devuelve `None`. Demostrarlo en vivo:

```python
resultado = inventario.append("Pala")
print(resultado)   # None: append no devuelve la lista
```

```text
None
```

## Paso 3 — La tupla

Situación a plantear en voz alta: una venta ya cerrada — fecha y monto no
deberían poder cambiar después de registrada.

```python
venta = ("2026-08-20", 45990.0)

fecha, monto = venta   # desempaquetado: dos variables en una linea
print(f"Venta del {fecha} por ${monto}")
```

```text
Venta del 2026-08-20 por $45990.0
```

Ahora, intentar mutarla en vivo y dejar que falle:

```python
venta[1] = 99999.0
```

```text
TypeError: 'tuple' object does not support item assignment
```

Punto a resaltar: contrastar con la lista del paso 2, donde `insert`,
`remove` y la asignación por índice sí funcionan. La tupla es la misma idea
de "agrupar valores" que la lista, pero con la mutabilidad apagada a
propósito — útil cuando el dato, una vez registrado, no debería cambiar. Aun
así, el acceso sigue siendo por posición (`venta[0]`, `venta[1]`): para un
producto con nombre, precio y cantidad, recordar qué posición es cada cosa
vuelve a ser tan frágil como las listas paralelas del paso 1.

## Paso 4 — El diccionario

Este es el paso central de la sesión: resuelve de raíz el problema
planteado en el paso 1.

Primero, un solo producto como diccionario:

```python
producto = {
    "nombre": "Taladro",
    "precio": 189900.0,
    "cantidad": 0,
}

print(producto["precio"])
print(producto.get("descuento", 0))   # clave inexistente: devuelve el default, sin lanzar error
```

```text
189900.0
0
```

Mostrar en vivo la diferencia entre `[clave]` y `.get()` provocando el
`KeyError`:

```python
print(producto["descuento"])
```

```text
KeyError: 'descuento'
```

Ahora, mutar el diccionario — a diferencia de la tupla, sí es posible:

```python
producto["cantidad"] = 3   # los diccionarios si son mutables
print(producto.keys())
print(producto.values())
print(producto.items())
```

```text
dict_keys(['nombre', 'precio', 'cantidad'])
dict_values(['Taladro', 189900.0, 3])
dict_items([('nombre', 'Taladro'), ('precio', 189900.0), ('cantidad', 3)])
```

**Construcción en vivo del inventario como lista de diccionarios** — dar
tiempo a este bloque, es el cierre conceptual del problema de entrada.
Escribir cada producto con el grupo, uno a la vez:

```python
inventario = [
    {"nombre": "Martillo", "precio": 15990.0, "cantidad": 5},
    {"nombre": "Taladro", "precio": 189900.0, "cantidad": 0},
    {"nombre": "Destornillador", "precio": 8990.0, "cantidad": 8},
]

# agregar la herramienta nueva del paso 1, ahora sin riesgo de desalinear nada:
inventario.append({"nombre": "Alicate", "precio": 22000.0, "cantidad": 15})

for herramienta in inventario:
    print(f"{herramienta['nombre']}: {herramienta['cantidad']} unidades a ${herramienta['precio']}")
```

```text
Martillo: 5 unidades a $15990.0
Taladro: 0 unidades a $189900.0
Destornillador: 8 unidades a $8990.0
Alicate: 15 unidades a $22000.0
```

Punto a resaltar: volver explícitamente al paso 1. Ahora agregar una
herramienta es **un solo `append`** con un diccionario completo — no hay una
segunda lista con la que sincronizarse, porque nombre y cantidad viven
juntos en el mismo objeto. Preguntar al grupo: "¿cómo se vería el error del
paso 1 si el inventario ya fuera una lista de diccionarios?" — la respuesta
esperada es que no podría ocurrir, porque no existen dos colecciones para
desalinear.

## Paso 5 — El conjunto

Situación: la lista de clientes del día, con nombres repetidos.

```python
clientes_del_dia = ["Ana", "Luis", "Ana", "Marta", "Luis", "Ana"]

clientes_unicos = set(clientes_del_dia)
print(clientes_unicos)
print(f"Clientes distintos: {len(clientes_unicos)}")

clientes_unicos.add("Pedro")
print(clientes_unicos)
```

```text
{'Ana', 'Luis', 'Marta'}
Clientes distintos: 3
{'Ana', 'Luis', 'Marta', 'Pedro'}
```

Punto a resaltar: el orden de impresión de un `set` puede no coincidir con
el orden en que se escribieron los elementos — señalarlo si Colab imprime
en un orden distinto al de este documento, para que el grupo no piense que
algo salió mal.

Unión e intersección, con dos días de clientes:

```python
clientes_lunes = {"Ana", "Luis", "Marta"}
clientes_martes = {"Luis", "Pedro"}

print(clientes_lunes | clientes_martes)   # union: todos, sin repetir
print(clientes_lunes & clientes_martes)   # interseccion: en ambos dias
```

```text
{'Ana', 'Luis', 'Marta', 'Pedro'}
{'Luis'}
```

## Paso 6 — Comprensión de listas

Primero, el patrón `for` + `append` del Paso 2 aplicado a construir una lista
nueva, para tenerlo en pantalla antes de comprimirlo:

```python
precios = [15990.0, 189900.0, 25000.0, 8990.0]

precios_con_iva = []
for precio in precios:
    precios_con_iva.append(precio * 1.19)

print(precios_con_iva)
```

```text
[19028.1, 225981.0, 29750.0, 10698.1]
```

Reescribir la misma celda **en vivo**, borrando las cuatro líneas y
escribiendo la comprensión, para que el grupo vea la transformación paso a
paso y no como un bloque ya terminado:

```python
precios_con_iva = [precio * 1.19 for precio in precios]
print(precios_con_iva)
```

```text
[19028.1, 225981.0, 29750.0, 10698.1]
```

Agregar la condición sobre el mismo ejemplo:

```python
caros = [precio for precio in precios if precio > 20000]
print(caros)
```

```text
[189900.0, 25000.0]
```

Punto a resaltar: leer la comprensión en voz alta como una frase —
"`precio` por cada `precio` en `precios`, si `precio` es mayor a 20000" — la
lectura ayuda más que explicar la sintaxis de memoria.

## Paso 7 — Cierre

Recorrer con el grupo la tabla resumen de la lección (`## Elegir la
estructura correcta`), columna por columna, contrastando con lo demostrado
en los pasos 1 a 6: mutabilidad (paso 2 vs. paso 3), orden (paso 4 vs. paso
5), duplicados (paso 5).

Si el tiempo alcanza, construir junto con el grupo 1-2 filas más del
inventario, combinando estructuras — un diccionario cuya `"proveedores"` es
un conjunto (sin proveedores repetidos) y cuya `"reposiciones"` es una lista
de tuplas `(fecha, cantidad)` (registros fijos, uno por reposición):

```python
inventario.append({
    "nombre": "Serrucho",
    "precio": 25000.0,
    "cantidad": 9,
    "proveedores": {"Ferretera Andina", "Import Herramientas"},
    "reposiciones": [("2026-08-10", 6), ("2026-08-24", 3)],
})

ultimo_producto = inventario[-1]
print(ultimo_producto["proveedores"])
for fecha, cantidad in ultimo_producto["reposiciones"]:
    print(f"Reposicion del {fecha}: +{cantidad} unidades")
```

```text
{'Ferretera Andina', 'Import Herramientas'}
Reposicion del 2026-08-10: +6 unidades
Reposicion del 2026-08-24: +3 unidades
```

Punto a resaltar: no hay una única estructura "correcta" — el inventario
final combina las cuatro, cada una en el rol para el que sirve mejor.

## Preguntas socráticas

- **¿Por qué un conjunto no sirve para guardar el inventario completo?**
  Respuesta esperada: un conjunto no admite duplicados y no está indexado
  por clave ni por posición — no hay forma de asociar un nombre con su
  precio y cantidad dentro de un `set`. Además, dos herramientas con el
  mismo nombre pero cantidades distintas no podrían coexistir como
  elementos iguales de un conjunto.

- **¿Por qué la tupla no resuelve el problema del inventario, si también
  agrupa varios valores en una unidad?** Respuesta esperada: agrupa, pero
  sigue accediendo por posición (`producto[0]`, `producto[1]`) — el mismo
  riesgo de memorizar qué posición es cada dato que tenían las listas
  paralelas. Le falta el acceso por nombre que sí da el diccionario.

- **Si `cantidades_herramientas.append(15)` nunca se hubiera olvidado en el
  paso 1, ¿seguiría siendo un mal diseño usar dos listas paralelas?**
  Respuesta esperada: sí — el riesgo de desalineación no depende de si el
  error ya ocurrió, sino de que nada en el lenguaje garantiza que las dos
  listas se mantengan del mismo largo; cualquier `remove`, `pop` o `sort`
  futuro sobre una sola de las dos lo rompería igual.
