# Banco de Ejercicios — Programación Científica (PC)

---

## Ejercicio # 01

**Tema:** Estructura secuencial — Variables y operadores aritméticos

**Enunciado:**

Dado la base y la altura de un triángulo, construye un programa que calcule y muestre su área usando la fórmula:

```
area = (base * altura) / 2
```

El programa debe leer los dos valores desde el teclado y mostrar el resultado con dos decimales.

**Solución:**

```python
# Entrada
base   = float(input("Ingrese la base: "))
altura = float(input("Ingrese la altura: "))

# Proceso
area = (base * altura) / 2

# Salida
print("El área del triángulo es:", '{:,.2f}'.format(area))
```

---

## Ejercicio # 02

**Tema:** Estructura secuencial — Operadores aritméticos y formateo de salida

**Enunciado:**

Sobre un tripulante se conocen las calificaciones parciales obtenidas en cinco retos y en inglés. Los porcentajes asignados a cada nota son los siguientes:

| Componente | Porcentaje |
|---|---|
| Reto 1 | 10 % |
| Reto 2 | 10 % |
| Reto 3 | 20 % |
| Reto 4 | 20 % |
| Reto 5 | 20 % |
| Inglés  | 20 % |

Construye un programa que lea las seis notas y calcule y muestre la calificación definitiva del tripulante.

**Solución:**

```python
# Entrada
n1 = float(input("Nota reto 1: "))
n2 = float(input("Nota reto 2: "))
n3 = float(input("Nota reto 3: "))
n4 = float(input("Nota reto 4: "))
n5 = float(input("Nota reto 5: "))
ni = float(input("Nota Inglés: "))

# Proceso
nd = n1*0.1 + n2*0.1 + n3*0.2 + n4*0.2 + n5*0.2 + ni*0.2

# Salida
print("Nota definitiva:", '{:,.2f}'.format(nd))
```

---

## Ejercicio # 03

**Tema:** Tuplas — Manejo de cadenas de texto y ciclos

**Enunciado:**

Construye un programa que lea desde el teclado una cadena de palabras separadas por un espacio en blanco y construya una nueva cadena con los plurales de esas palabras. Para formar el plural se siguen estas dos reglas:

- Las palabras que terminan en **vocal** añaden `s`.
- Las palabras que terminan en **consonante** añaden `es`.

El programa debe almacenar cada par (singular, plural) como una tupla y mostrar al final la lista completa de parejas.

**Solución:**

```python
VOCALES = "aeiouáéíóúAEIOUÁÉÍÓÚ"

cadena  = input("Ingrese palabras separadas por espacio: ")
palabras = cadena.split()

# Construir lista de tuplas (singular, plural)
pares = []
for palabra in palabras:
    if palabra[-1] in VOCALES:
        plural = palabra + "s"
    else:
        plural = palabra + "es"
    pares.append((palabra, plural))

# Mostrar resultado
print("\n{:<20} {}".format("Singular", "Plural"))
print("-" * 35)
for par in pares:
    print("{:<20} {}".format(par[0], par[1]))
```

---

## Ejercicio # 04

**Tema:** Tuplas — Estructuras condicionales y ciclos

**Enunciado:**

En una ciudad se incentiva el reciclaje pagando por la devolución de envases plásticos según su capacidad:

- **$100**: envases de 1 litro o menos.
- **$250**: envases de más de 1 litro hasta 1 galón (≈ 3.785 litros).
- **$800**: envases de más de 1 galón.

La información de cada categoría (valor y capacidad máxima) debe almacenarse en **tuplas**. El programa lee los tamaños de las botellas que entrega el usuario (hasta que escriba `fin`), muestra cuántos envases hay de cada categoría y calcula el valor total que recibirá.

**Solución:**

```python
# Tuplas de categoría: (valor_en_pesos, capacidad_máxima_en_litros)
GALÓN = 3.785
categoria_pequena = (100, 1.0)
categoria_mediana = (250, GALÓN)
categoria_grande  = (800, float('inf'))

conteo_100 = 0
conteo_250 = 0
conteo_800 = 0

print("Ingrese el tamaño de cada botella en litros. Escriba 'fin' para terminar.\n")

while True:
    entrada = input("Tamaño (litros): ")
    if entrada.lower() == 'fin':
        break
    tamano = float(entrada)
    if tamano <= categoria_pequena[1]:
        conteo_100 += 1
    elif tamano <= categoria_mediana[1]:
        conteo_250 += 1
    else:
        conteo_800 += 1

total = (conteo_100 * categoria_pequena[0] +
         conteo_250 * categoria_mediana[0] +
         conteo_800 * categoria_grande[0])

print("\n===== RESUMEN =====")
print(f"Envases de ${categoria_pequena[0]} (≤ 1 L):         {conteo_100}")
print(f"Envases de ${categoria_mediana[0]} (1 L – 1 galón): {conteo_250}")
print(f"Envases de ${categoria_grande[0]} (> 1 galón):      {conteo_800}")
print(f"\nTotal a recibir: ${'{:,.0f}'.format(total)}")
```

---

## Ejercicio # 05

**Tema:** Tuplas — Listas de tuplas, ciclos y cálculos acumulados

**Enunciado:**

El programa tiene almacenada en el código una lista de tuplas con el catálogo del restaurante. Cada tupla contiene: código, nombre y valor del producto. El programa lee los códigos de los productos que pidió el usuario y calcula:

- Subtotal (suma de los productos pedidos).
- Impuesto del **19 %** sobre el subtotal.
- Propina del **10 %** sobre el subtotal (voluntaria).

Al finalizar, debe mostrar la cuenta desglosada: subtotal, impuesto, total sin propina, propina y total con propina, indicando explícitamente que la propina es voluntaria.

**Solución:**

```python
# Catálogo: (código, nombre, valor)
menu = [
    (1, "Hamburguesa Clásica",  18000),
    (2, "Pizza Personal",       15000),
    (3, "Jugo Natural",          6000),
    (4, "Ensalada César",       12000),
    (5, "Agua Mineral",          3000)
]

TASA_IVA     = 0.19
TASA_PROPINA = 0.10

print("========== MENÚ ==========")
for p in menu:
    print(f"  [{p[0]}] {p[1]:<25} ${'{:,.0f}'.format(p[2])}")
print()

pedido = []
while True:
    codigo = int(input("Código del producto (0 para cerrar pedido): "))
    if codigo == 0:
        break
    encontrado = False
    for producto in menu:
        if producto[0] == codigo:
            pedido.append(producto)
            print(f"  ✓ Agregado: {producto[1]}")
            encontrado = True
            break
    if not encontrado:
        print("  ✗ Código no encontrado.")

subtotal          = sum(p[2] for p in pedido)
impuesto          = subtotal * TASA_IVA
propina           = subtotal * TASA_PROPINA
total_sin_propina = subtotal + impuesto
total_con_propina = total_sin_propina + propina

print("\n========== CUENTA ==========")
for p in pedido:
    print(f"  - {p[1]:<25} ${'{:,.0f}'.format(p[2])}")
print(f"\nSubtotal:              ${'{:,.0f}'.format(subtotal)}")
print(f"IVA (19 %):            ${'{:,.0f}'.format(impuesto)}")
print(f"Total sin propina:     ${'{:,.0f}'.format(total_sin_propina)}")
print(f"\nPropina (10 %):        ${'{:,.0f}'.format(propina)}  ← voluntaria")
print(f"Total con propina:     ${'{:,.0f}'.format(total_con_propina)}")
```

---

## Ejercicio # 06

**Tema:** Búsqueda lineal — Listas de tuplas

**Enunciado:**

Hacer el programa en Python que permita registrar una compra de supermercado. Se tiene precargada la siguiente lista de tuplas con la información de los productos disponibles (código, nombre, unidades disponibles, precio unitario, porcentaje de IVA):

```
[(021, "Queso Alpina 100gr",         3, 4000, 19),
 (087, "Mortadela Zenú 450gr",       1, 7800, 19),
 (105, "Pan Integral Bimbo Mediano", 1, 3850, 14),
 (032, "Aguacate Hass",              2, 2200,  0)]
```

El programa debe:
1. Leer los códigos de los productos que desea comprar el usuario.
2. Usar **búsqueda lineal** para localizar cada producto en la lista.
3. Imprimir la factura al final con el listado de productos, subtotal, IVA y total.

**Solución:**

```python
# Inventario: (código, nombre, unidades, precio, %IVA)
inventario = [
    (21,  "Queso Alpina 100gr",         3, 4000, 19),
    (87,  "Mortadela Zenú 450gr",       1, 7800, 19),
    (105, "Pan Integral Bimbo Mediano", 1, 3850, 14),
    (32,  "Aguacate Hass",              2, 2200,  0)
]

factura = []

print("=== REGISTRO DE COMPRA === (0 para terminar)\n")
while True:
    codigo = int(input("Código del producto: "))
    if codigo == 0:
        break
    encontrado = False
    for producto in inventario:          # búsqueda lineal
        if producto[0] == codigo:
            cantidad = int(input(f"Unidades de '{producto[1]}': "))
            factura.append((producto[1], cantidad, producto[3], producto[4]))
            encontrado = True
            break
    if not encontrado:
        print("  ✗ Producto no encontrado.\n")

subtotal  = 0
iva_total = 0
print("\n========== FACTURA ==========")
print(f"{'Producto':<30} {'Cant':>4} {'Precio':>9} {'Total':>10}")
print("-" * 57)
for item in factura:
    nombre, cantidad, precio, porc_iva = item
    valor_item = cantidad * precio
    iva_item   = valor_item * porc_iva / 100
    subtotal  += valor_item
    iva_total += iva_item
    print(f"{nombre:<30} {cantidad:>4} {'{:,.0f}'.format(precio):>9} {'{:,.0f}'.format(valor_item):>10}")

total = subtotal + iva_total
print("-" * 57)
print(f"{'Subtotal':>45} ${'{:,.0f}'.format(subtotal)}")
print(f"{'IVA':>45} ${'{:,.0f}'.format(iva_total)}")
print(f"{'TOTAL':>45} ${'{:,.0f}'.format(total)}")
```

---

## Ejercicio # 07

**Tema:** Análisis de Algoritmos — Complejidad algorítmica y notación Big-O (búsqueda lineal)

**Enunciado:**

Con base en el programa del Ejercicio # 06 (lista de 4 productos en el orden: 021, 087, 105, 032) y usando **búsqueda lineal**, responde de forma justificada las siguientes preguntas:

1. ¿Cuántas iteraciones se requieren para encontrar el producto con código **032**?
2. ¿Cuántas iteraciones se requieren para buscar el producto con código **015**, que no existe en la lista?
3. ¿Cuál es el número máximo de iteraciones para encontrar cualquier producto en una lista de n elementos con búsqueda lineal?
4. Si se ordena la lista por código, ¿se podría reducir el número de iteraciones? ¿Con qué algoritmo?

**Solución:**

**Pregunta 1 — Producto 032:**
La lista original sigue el orden `[021, 087, 105, 032]`. El código 032 se encuentra en la posición 4 (índice 3). La búsqueda recorre: 021 → 087 → 105 → 032. Requiere **4 iteraciones**.

**Pregunta 2 — Producto 015 (no existe):**
Como el código 015 no está en la lista, el algoritmo la recorre completa sin encontrarlo. Requiere **4 iteraciones** (peor caso).

**Pregunta 3 — Máximo de iteraciones:**
El máximo es **n iteraciones**, donde n es el tamaño de la lista. La búsqueda lineal tiene complejidad **O(n)**: el tiempo de ejecución crece de manera directamente proporcional al número de elementos.

**Pregunta 4 — Optimización con lista ordenada:**
Sí. Con la lista ordenada `[021, 032, 087, 105]` se puede aplicar **búsqueda binaria**, que divide el espacio de búsqueda a la mitad en cada iteración. Para n = 4 elementos, el máximo de iteraciones sería `⌈log₂(4)⌉ = 2`, frente a las 4 de la búsqueda lineal. La búsqueda binaria tiene complejidad **O(log₂ n)**.

| Algoritmo | n = 4 | n = 100 | n = 1 000 000 |
|---|---|---|---|
| Búsqueda lineal O(n) | 4 | 100 | 1 000 000 |
| Búsqueda binaria O(log₂ n) | 2 | 7 | 20 |

---

## Ejercicio # 08

**Tema:** Análisis de Algoritmos — Búsqueda binaria en listas de tuplas ordenadas

**Enunciado:**

Modificar el programa del Ejercicio # 06 para que use **búsqueda binaria** en lugar de búsqueda lineal. El programa debe:

1. Contar con la lista de productos **ordenada por código** antes de iniciar el registro.
2. Implementar la función de búsqueda binaria.
3. Leer los códigos de los productos que desea comprar el usuario e imprimir la factura al final con subtotal, IVA y total.

**Solución:**

```python
# Inventario ordenado por código: (código, nombre, unidades, precio, %IVA)
inventario = [
    (21,  "Queso Alpina 100gr",         3, 4000, 19),
    (32,  "Aguacate Hass",              2, 2200,  0),
    (87,  "Mortadela Zenú 450gr",       1, 7800, 19),
    (105, "Pan Integral Bimbo Mediano", 1, 3850, 14)
]

def busqueda_binaria(lista, codigo):
    izquierda = 0
    derecha   = len(lista) - 1
    while izquierda <= derecha:
        central = (izquierda + derecha) // 2
        if lista[central][0] == codigo:
            return central            # encontrado: retorna índice
        elif lista[central][0] < codigo:
            izquierda = central + 1  # buscar en la mitad derecha
        else:
            derecha = central - 1    # buscar en la mitad izquierda
    return -1                        # no encontrado

factura = []

print("=== REGISTRO DE COMPRA === (0 para terminar)\n")
while True:
    codigo = int(input("Código del producto: "))
    if codigo == 0:
        break
    indice = busqueda_binaria(inventario, codigo)
    if indice != -1:
        producto = inventario[indice]
        cantidad = int(input(f"Unidades de '{producto[1]}': "))
        factura.append((producto[1], cantidad, producto[3], producto[4]))
    else:
        print("  ✗ Producto no encontrado.\n")

subtotal  = 0
iva_total = 0
print("\n========== FACTURA ==========")
print(f"{'Producto':<30} {'Cant':>4} {'Precio':>9} {'Total':>10}")
print("-" * 57)
for item in factura:
    nombre, cantidad, precio, porc_iva = item
    valor_item = cantidad * precio
    iva_item   = valor_item * porc_iva / 100
    subtotal  += valor_item
    iva_total += iva_item
    print(f"{nombre:<30} {cantidad:>4} {'{:,.0f}'.format(precio):>9} {'{:,.0f}'.format(valor_item):>10}")

total = subtotal + iva_total
print("-" * 57)
print(f"{'Subtotal':>45} ${'{:,.0f}'.format(subtotal)}")
print(f"{'IVA':>45} ${'{:,.0f}'.format(iva_total)}")
print(f"{'TOTAL':>45} ${'{:,.0f}'.format(total)}")
```

---

## Ejercicio # 09

**Tema:** Listas con listas — Estructuras de datos bidimensionales

**Enunciado:**

Hacer el programa en Python que permita registrar una compra de supermercado usando una **lista de listas**. Cada producto debe guardarse como una lista con los campos: código, nombre, cantidad, valor unitario y porcentaje de IVA.

El programa debe:
1. Permitir al usuario ingresar productos uno a uno hasta que indique que no desea agregar más.
2. Almacenar cada producto como una sublista dentro de la lista principal.
3. Imprimir la factura al final con el listado de productos, subtotal, IVA y total.

**Solución:**

```python
# Cada producto se almacena como: [código, nombre, cantidad, valor, %IVA]
factura = []

print("=== REGISTRO DE COMPRA ===\n")
while True:
    continuar = input("¿Agregar producto? (s/n): ").lower()
    if continuar != 's':
        break
    codigo   = int(input("   Código:          "))
    nombre   = input("   Nombre:          ")
    cantidad = int(input("   Cantidad:        "))
    valor    = float(input("   Valor unitario:  "))
    porc_iva = float(input("   % IVA:           "))
    factura.append([codigo, nombre, cantidad, valor, porc_iva])
    print()

subtotal  = 0
iva_total = 0
print("\n========== FACTURA ==========")
print(f"{'Producto':<28} {'Cant':>4} {'V.Unit':>9} {'Total':>10}")
print("-" * 55)
for producto in factura:
    cod, nom, cant, val, iva = producto
    valor_item = cant * val
    iva_item   = valor_item * iva / 100
    subtotal  += valor_item
    iva_total += iva_item
    print(f"{nom:<28} {cant:>4} {'{:,.0f}'.format(val):>9} {'{:,.0f}'.format(valor_item):>10}")

total = subtotal + iva_total
print("-" * 55)
print(f"{'Subtotal':>44} ${'{:,.0f}'.format(subtotal)}")
print(f"{'IVA':>44} ${'{:,.0f}'.format(iva_total)}")
print(f"{'TOTAL':>44} ${'{:,.0f}'.format(total)}")
```

---

## Ejercicio # 10

**Tema:** Listas con listas — Matrices y recorrido con doble ciclo

**Enunciado:**

Como parte de un programa de gestión contable, se necesita una estructura de datos capaz de almacenar los gastos mensuales en distintos conceptos para cada departamento de una empresa.

Los departamentos son: Marketing, Contabilidad, Recursos Humanos, Distribución, Ingeniería.
Los conceptos de gasto son: Salarios, Suministros, Mobiliario, Equipamiento, Otros.

Define la estructura de datos como una **lista de listas (matriz)** con valores de ejemplo y escribe un programa que:

a) Muestre en pantalla la **suma de gastos por cada departamento**.
b) Muestre en pantalla la **suma de gastos por cada concepto**.

**Solución:**

```python
# Estructura: gastos[i][j] = gasto del departamento i en el concepto j

departamentos = [
    "Marketing", "Contabilidad", "Recursos Humanos", "Distribución", "Ingeniería"
]

conceptos = [
    "Salarios", "Suministros", "Mobiliario", "Equipamiento", "Otros"
]

# Matriz 5x5 con datos de ejemplo (en pesos)
gastos = [
    #  Salarios    Sumin.    Mobil.   Equip.    Otros
    [5_000_000, 200_000, 150_000, 300_000, 100_000],  # Marketing
    [4_000_000, 150_000, 100_000, 200_000,  80_000],  # Contabilidad
    [6_000_000, 180_000, 120_000, 250_000,  90_000],  # Recursos Humanos
    [3_500_000, 160_000,  90_000, 180_000,  70_000],  # Distribución
    [7_000_000, 300_000, 200_000, 500_000, 150_000]   # Ingeniería
]

# a) Suma de gastos por departamento
print("=== GASTOS TOTALES POR DEPARTAMENTO ===")
for i in range(len(departamentos)):
    total_dept = sum(gastos[i])
    print(f"  {departamentos[i]:<20} ${'{:>12,.0f}'.format(total_dept)}")

# b) Suma de gastos por concepto
print("\n=== GASTOS TOTALES POR CONCEPTO ===")
for j in range(len(conceptos)):
    total_concepto = sum(gastos[i][j] for i in range(len(departamentos)))
    print(f"  {conceptos[j]:<15} ${'{:>12,.0f}'.format(total_concepto)}")
```

---

## Ejercicio # 11

**Tema:** Juego de lógica — Razonamiento lógico (fuente: `3-Diccionarios.pdf`, Slide 2)

**Enunciado:**

La convención.

Cien economistas participan en una convención. De pronto, uno se pone de pie y grita a voz en cuello: «Todos ustedes son unos mentirosos». Acto seguido, el que está a su derecha también se para y grita exactamente lo mismo. Y luego lo hace el otro, y el otro, y así hasta que los cien terminan acusándose mutuamente.

Admitamos que todos los economistas son o bien veraces (y siempre dicen la verdad) o bien mentirosos (y siempre mienten). ¿Cuántos economistas veraces hay, si es que hay alguno?

**Solución:**

_Pendiente_

---

## Ejercicio # 12

**Tema:** Diccionarios — Tuplas — Cálculo de cuenta en restaurante (fuente: `3-Diccionarios.pdf`, Slide 5)

**Enunciado:**

La propina.

El programa que cree para este ejercicio comenzará leyendo la lista de varios productos consumidos por clientes en un restaurante. El programa debe permitir ingresar pedidos de varios clientes hasta que decida terminar.

El programa tiene almacenada una lista de tuplas, cada tupla con el código, nombre y valor del producto. Entonces su programa calculará el costo de la comida, el impuesto y propina para entregar la cuenta. Utilice una tasa de impuestos del 19% sobre la comida. Utilice un porcentaje del 10% para el valor de la propina.

Para terminar, muestre la cuenta desglosando los valores de la comida, el impuesto y la propina, el total sin propina y el total con propina, especificando en un mensaje que la propina es voluntaria.

Almacene en un diccionario los datos de todos los productos facturados.

**Solución:**

_Pendiente_

---

## Ejercicio # 13

**Tema:** Juego de lógica — Razonamiento deductivo (fuente: `4-Funciones.pdf`, Slide 2)

**Enunciado:**

El asesino.

Atendiendo una llamada anónima, la policía allana una casa para arrestar a un supuesto asesino. No saben cómo es, pero saben que su nombre es John y que está dentro de la casa. La policía encuentra a cuatro personas jugando al póquer: una se dedica a la carpintería, la otra maneja un camión, la otra trabaja en un taller de mecánica y al final está un hombre que trabaja en la estación de bomberos. Sin ningún tipo de preguntas y sin vacilación, inmediatamente arrestan a quien trabaja en la estación de bomberos.

¿Cómo estaban seguros de que arrestaron a la persona correcta?

**Solución:**

_Pendiente_

---

## Ejercicio # 14

**Tema:** Funciones — Validación de entradas — Condicionales (fuente: `4-Funciones.pdf`, Slide 4)

**Enunciado:**

Depósito de reciclaje.

> **Requisito técnico:** Utilizar funciones para lectura y validación de las entradas de usuario y funciones para el cálculo de los valores correspondientes a cada envase.

En muchas ciudades se agrega un pequeño valor en los depósitos por los envases plásticos de bebidas para alentar a las personas para reciclarlos.

En una ciudad en particular, los recipientes para bebidas que contengan un litro o menos tienen un valor de $100, y los envases de bebidas que contienen más de un litro tienen un valor de $250, pero si el envase es de más de un galón, recibirá $800.

Escriba un programa que lea el tamaño de 5 contenedores que llevará al depósito el usuario, muestre cuántos envases de $100 entregará, cuántos de $250 y cuántos de $800 y calcule y muestre el valor que recibirá por ellos en total.

**Solución:**

_Pendiente_

---

## Ejercicio # 15

**Tema:** Funciones — Validación de entradas — Cálculo de cuenta en restaurante (fuente: `4-Funciones.pdf`, Slide 5)

> ⚠️ **Nota:** Este ejercicio comparte nombre con el **Ejercicio # 12** ("La propina"), pero es una versión diferente: trabaja con funciones, recibe un único pedido y calcula la propina según el nivel de satisfacción del usuario. Son enunciados distintos que deben tratarse por separado.

**Enunciado:**

La propina.

> **Requisito técnico:** Utilizar funciones para lectura y validación de las entradas de usuario y funciones para el cálculo de los valores correspondientes al pedido.

El programa que cree para este ejercicio comenzará leyendo el costo de una comida de un pedido en un restaurante al que ha ido el usuario. Entonces su programa calculará el impuesto y propina para entregar la cuenta. Utilice una tasa de impuestos del 19% sobre la comida.

Calcule la propina como el 14 por ciento del monto de la comida (sin el impuesto), cuando el usuario esté muy satisfecho con el servicio.

Calcule la propina como el 10 por ciento del monto de la comida (sin el impuesto), cuando el usuario esté satisfecho con el servicio.

Calcule la propina como el 5 por ciento del monto de la comida (sin el impuesto), cuando el usuario esté insatisfecho con el servicio.

Para terminar, muestre la cuenta con impuesto y propina.

**Solución:**

_Pendiente_

---

## Ejercicio # 16

**Tema:** Condicional simple (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Dado el nombre y salario de un empleado, calcular el subsidio de transporte, teniendo en cuenta que si el salario es menor o igual a $1.000.000 entonces tiene derecho a un subsidio de transporte por valor de $120.000, de lo contrario no tiene derecho al subsidio de transporte. Se debe visualizar el nombre, salario y subsidio de transporte.

**Solución:**

```python
nombre  = input("Nombre empleado: ")
salario = float(input("Salario: "))

if salario <= 1000000:
    subsidio = 120000
else:
    subsidio = 0

print("Nombre empleado: ", nombre)
print("Salario: ", '{:,.2f}'.format(salario))
print("Subsidio de transporte: ", '{:,.2f}'.format(subsidio))
```

---

## Ejercicio # 17

**Tema:** Condicional anidado (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Dado el nombre del estudiante y la calificación cuantitativa de una evaluación (0-100), se pide hallar la calificación cualitativa, de acuerdo a la siguiente información:

| Rango Evaluación | Evaluación cualitativa |
|-----------------|----------------------|
| 0 – 59 | D |
| 60 – 79 | C |
| 80 – 89 | B |
| 90 – 100 | A |

Se pide visualizar, nombre, calificación cuantitativa y cualitativa.

**Solución:**

```python
nombre = input("Nombre estudiante: ")
eva_cuantitativa = int(input("Evaluación Cuantitativa: "))

if eva_cuantitativa <= 59:
    eva_cualitativa = "D"
elif eva_cuantitativa <= 79:
    eva_cualitativa = "C"
elif eva_cuantitativa <= 89:
    eva_cualitativa = "B"
else:
    eva_cualitativa = "A"

print("Nombre estudiante: ", nombre)
print("Evaluación Cuantitativa: ", eva_cuantitativa)
print("Evaluación Cualitativa: ", eva_cualitativa)
```

---

## Ejercicio # 18

**Tema:** Condicional anidado (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Dado el nombre y estrato (1, 2, 3, 4, 5) de un usuario del servicio de energía eléctrica, calcular lo que pagaría de tarifa básica del servicio de energía eléctrica, que depende del estrato, así:

| Estrato | Tarifa Básica |
|---------|--------------|
| 1 | $10.000 |
| 2 | $15.000 |
| 3 | $30.000 |
| 4 | $50.000 |
| 5 | $65.000 |

Se pide visualizar el nombre y tarifa básica.

**Solución:**

```python
nombre  = input("Nombre del usuario: ")
estrato = int(input("Estrato (1,2,3,4,o 5): "))

if estrato == 1:
    tarifa_basica = 10000
elif estrato == 2:
    tarifa_basica = 15000
elif estrato == 3:
    tarifa_basica = 30000
elif estrato == 4:
    tarifa_basica = 50000
else:
    tarifa_basica = 65000

print("Nombre usuario: ", nombre)
print("Tarifa Básica: ", '{:,.2f}'.format(tarifa_basica))
```

---

## Ejercicio # 19

**Tema:** Ciclo FOR — Iteración controlada por cantidad, con condicional anidado (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Se tiene la siguiente información sobre los N (N es suministrado) usuarios del servicio de AGUA:

- Código
- Nombre
- Estado: Puede ser V=Vigente o S=Suspendido
- Estrato: Puede ser 1, 2, 3, 4, 5 o 6
- Consumo del mes (en cm³)

Se pide calcular el valor a pagar por concepto de servicio de AGUA de cada usuario, teniendo en cuenta que este valor es la suma del valor de tarifa más el valor del consumo. También nos indican que el valor de la tarifa básica depende del estrato así:

| Estrato | Tarifa Básica |
|---------|--------------|
| 1 | $10.000 |
| 2 | $20.000 |
| 3 | $30.000 |
| 4 | $45.000 |
| 5 | $60.000 |
| 6 | $70.000 |

Además el valor del consumo es el consumo del mes por el valor de 1 cm³ que de $200.

Se debe imprimir el nombre del usuario, el valor de la tarifa básica, el valor del consumo y el valor a pagar por concepto del servicio de AGUA.

**NOTA:** Se liquida servicio de AGUA a los usuarios con estado V (Vigente).

**Solución:**

```python
N = int(input("Cantidad de usuarios: "))
for i in range(N):
    codigo  = int(input("Código usuario: "))
    nombre  = input("Nombre: ")
    estado  = input("Estado (V=Vigente,S=Suspendido): ")
    estrato = int(input("Estrato (1,2,3,4,5,6): "))
    consumo = float(input("Consumo del mes: "))
    if estado == "V":
        if estrato == 1:
            tarifa_basica = 10000
        elif estrato == 2:
            tarifa_basica = 20000
        elif estrato == 3:
            tarifa_basica = 30000
        elif estrato == 4:
            tarifa_basica = 45000
        elif estrato == 5:
            tarifa_basica = 60000
        else:
            tarifa_basica = 70000
        valor_consumo = consumo * 200
        valor_pagar = tarifa_basica + valor_consumo
        print("Nombre usuario: ", nombre)
        print("Tarifa básica: ", '{:,.2f}'.format(tarifa_basica))
        print("Valor consumo: ", '{:,.2f}'.format(valor_consumo))
        print("Valor a Pagar: ", '{:,.2f}'.format(valor_pagar))
```

---

## Ejercicio # 20

**Tema:** Ciclo FOR — Acumuladores (contadores y sumadores) (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Se tiene la siguiente información de los N docentes de una institución educativa:

- Documento de identidad
- Nombre
- Categoría docente (A, B o C)
- Horas laboradas en el mes

También suministran el valor de la hora que la institución paga a los docentes, dependiendo de su categoría, así:

| Categoría | Valor hora |
|-----------|-----------|
| A | $25.000 |
| B | $35.000 |
| C | $50.000 |

Con base en la información suministrada se pide:

- Valor a pagar por honorarios para cada docente
- Valor total a pagar (Todos los docentes)
- Cantidad de docentes de cada una de las categorías

**Solución:**

```python
N = int(input("Cantidad de docentes: "))
total_honorarios = 0
cont_a = 0
cont_b = 0
cont_c = 0
for k in range(N):
    documento = int(input("Documento Docente: "))
    nombre    = input("Nombre Docente: ")
    categoria = input("Categoría (A,B,C): ")
    horas     = int(input("Horas laboradas: "))
    if categoria == "A":
        honorarios = horas * 25000
        cont_a += 1
    elif categoria == "B":
        honorarios = horas * 35000
        cont_b += 1
    else:
        honorarios = horas * 50000
        cont_c += 1
    total_honorarios += honorarios
    print("Nombre docente: ", nombre)
    print("Honorarios: ", '{:,.2f}'.format(honorarios))
print("Total honorarios: ", '{:,.2f}'.format(total_honorarios))
print("Cantidad docentes categoría A: ", cont_a)
print("Cantidad docentes categoría B: ", cont_b)
print("Cantidad docentes categoría C: ", cont_c)
```

---

## Ejercicio # 21

**Tema:** Ciclo WHILE — Iteración controlada por condición, bandera (fuente: `Semana_2_FunProg.pdf`, Misión TIC 2022)

**Enunciado:**

Dada una lista de números enteros, se pide calcular e imprimir:

- Cuáles y cuántos números son pares
- Cuáles y cuántos números son impares

La lista se termina cuando el número ingresado es -1 (Bandera).

**Solución:**

```python
can_pares = 0
can_impares = 0
num = int(input("Número entero: "))
while num != -1:
    if num % 2 == 0:
        print(num, " es PAR")
        can_pares += 1
    else:
        print(num, " es IMPAR")
        can_impares += 1
    num = int(input("Número entero: "))
print("Cantidad de pares: ", can_pares)
print("Cantidad de impares: ", can_impares)
```

---
