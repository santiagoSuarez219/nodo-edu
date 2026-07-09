# Question Bank — Staging

Archivo de staging para extracción de ejercicios desde material fuente (PDFs).

El contenido extraído se clasifica y migra a su curso correspondiente:

- `courses/PC/exercises_bank.md` — Programación Científica
- `courses/LP/exercises_bank.md` — Lógica de Programación
- `courses/POO/exercises_bank.md` — Programación Orientada a Objetos

> Este archivo permanece vacío entre extracciones; se usa como área temporal antes de la clasificación final.
---
title: "Ejercicios extraídos — Semanas 4, 5 y 6 — Fundamentos de Programación (Misión TIC 2022)"
source: "Semana_4_FunProg.pdf, Semana_5_FunProg.pdf, Semana_6_FunProg.pdf"
course: "Programación Científica"
course_code: "PC"
type: "Extracción de ejercicios"
total_exercises: 6
date: "2026-07-01"
author: "Asistente de Docencia"
---

# Ejercicios extraídos — Semanas 4, 5 y 6 — Fundamentos de Programación (Misión TIC 2022)

> **Curso inferido:** Programación Científica (`PC`). Los documentos corresponden a las semanas 4, 5 y 6 del programa **Misión TIC 2022** (UNAB / MinTIC), desarrollado en Python. Los temas cubren estructuras de datos (listas anidadas, tuplas, conjuntos, diccionarios), ordenamiento, búsqueda y recursividad.

---

### Ejercicio # 01

**Asignatura:** Programación Científica  
**Tema:** Listas dentro de listas (Matrices) — Conteo de pares e impares  
**Fuente:** `Semana_4_FunProg.pdf`

**Enunciado**

Dada una lista dentro de lista (matriz) de 2 filas X 2 columnas que almacena números enteros, mostrar la cantidad de números pares e impares que hay en la matriz.

**Solución**

El análisis plantea el siguiente esquema Entrada – Proceso – Salida:

- **Entrada:** Una matriz de 2 × 2 con números enteros ingresados por el usuario.
- **Proceso:**
  1. Llenar la matriz con dos ciclos `for` anidados.
  2. Recorrer la matriz con dos ciclos `for` anidados.
  3. Evaluar con un condicional si cada elemento es par (`% 2 == 0`) o impar.
  4. Incrementar los contadores `cpares` y `cimpares` según corresponda.
- **Salida:** `cpares` (cantidad de pares) y `cimpares` (cantidad de impares).

**Versión 1 — Sin validación de entrada**

```python
# Programa de listas dentro de listas
# Autor: Sergio Medina
# Fecha: 15/05/2022

# Llenar la lista dentro de lista (matriz)
numeros = []
for i in range(2):
    numeros.append([])
    for j in range(2):
        numeros[i].append(int(input("Número: ")))

# Imprimir lista dentro de lista (matriz)
print(numeros)

# Procesar lista dentro de lista
cpares = 0
cimpares = 0
for i in range(2):
    for j in range(2):
        if numeros[i][j] % 2 == 0:
            cpares += 1
        else:
            cimpares += 1

print("Cantidad de pares: ", cpares)
print("Cantidad de impares: ", cimpares)
```

**Versión 2 — Con validación de entrada (función `valida_entero`)**

```python
# Programa de listas dentro de listas
# Autor: Sergio Medina
# Fecha: 15/05/2022

# Funciones
def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser entero")
    return dato

# Llenar la lista dentro de lista (matriz)
numeros = []
for i in range(2):
    numeros.append([])
    for j in range(2):
        num = valida_entero("Número: ")
        numeros[i].append(num)

# Imprimir lista dentro de lista (matriz)
print(numeros)

# Procesar lista dentro de lista
cpares = 0
cimpares = 0
for i in range(2):
    for j in range(2):
        if numeros[i][j] % 2 == 0:
            cpares += 1
        else:
            cimpares += 1

print("Cantidad de pares: ", cpares)
print("Cantidad de impares: ", cimpares)
```

---

### Ejercicio # 02

**Asignatura:** Programación Científica  
**Tema:** Diccionarios — Sistema de compra de artículos  
**Fuente:** `Semana_4_FunProg.pdf`

**Enunciado**

Se realiza la compra de N artículos, en donde se ingresa el código del artículo y la cantidad y mediante el uso de diccionarios para los nombres y valores unitarios de los artículos, el programa debe obtener el nombre de cada artículo, cantidad comprada, valor unitario, valor total de acuerdo a la cantidad comprada y finalmente calcular el valor total de la compra.

Se suministra el diccionario de nombres de artículo y otro con los valores unitarios.

```python
articulos = {1: "Lapiz", 2: "Cuadernos", 3: "Borrador", 4: "Calculadora", 5: "Escuadra"}
valores   = {1: 2500, 2: 3800, 3: 1200, 4: 35000, 5: 3700}
```

**Solución**

**Versión 1 — Básica**

```python
# Programa para manejo de diccionarios
# Autor: Sergio Medina
# Fecha: 14/05/2022

# Diccionarios
articulos = {1: "Lapiz", 2: "Cuadernos", 3: "Borrador", 4: "Calculadora", 5: "Escuadra"}
valores   = {1: 2500, 2: 3800, 3: 1200, 4: 35000, 5: 3700}

N = int(input("cantidad de artículos comprados: "))
total_compra = 0
for i in range(N):
    codigo = int(input("Código artículo: "))
    cantidad = int(input("Cantidad comprada: "))
    valor_articulo = cantidad * valores.get(codigo)
    total_compra += valor_articulo
    print("Artículo: ", articulos.get(codigo))
    print("Cantidad comprada: ", cantidad)
    print("Valor unitario: ", "{:,.2f}".format(valores.get(codigo)))
    print("Valor artículo: ", "{:,.2f}".format(valor_articulo))

print("Valor total compra: ", "{:,.2f}".format(total_compra))
```

**Versión 2 — Con validación de entrada y funciones**

```python
# Programa para manejo de diccionarios
# Autor: Sergio Medina
# Fecha: 14/05/2022

# Diccionarios
articulos = {1: "Lapiz", 2: "Cuadernos", 3: "Borrador", 4: "Calculadora", 5: "Escuadra"}
valores   = {1: 2500, 2: 3800, 3: 1200, 4: 35000, 5: 3700}

# Funciones
def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser un número entero")
    return dato

def valida_codigo(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            if articulos.get(dato, "ERROR") == "ERROR":
                print(etiqueta, " NO existe en el diccionario")
                continue
            break
        except ValueError:
            print(etiqueta, " debe ser un número entero")
    return dato

def calcular_valor_articulo(cantidad, valor_unitario):
    valor_articulo = cantidad * valor_unitario
    return valor_unitario  # ⚠️ Ver nota más abajo

# Programa principal
N = valida_entero("Cantidad de artículos comprados: ")
total_compra = 0
for i in range(N):
    codigo = valida_codigo("Código artículo: ")
    cantidad = valida_entero("Cantidad comprada: ")
    valor_articulo = calcular_valor_articulo(cantidad, valores.get(codigo))
    total_compra += valor_articulo
    print("Artículo: ", articulos.get(codigo))
    print("Cantidad comprada: ", cantidad)
    print("Valor unitario: ", "{:,.2f}".format(valores.get(codigo)))
    print("Valor artículo: ", "{:,.2f}".format(valor_articulo))

print("Valor total compra: ", "{:,.2f}".format(total_compra))
```

<!-- ⚠️ Posible error en el original: En la diapositiva 29 del documento fuente, la función `calcular_valor_articulo` calcula correctamente `valor_articulo = cantidad * valor_unitario`, pero la sentencia `return` devuelve `valor_unitario` en lugar de `valor_articulo`. Se transcribe tal como aparece en la fuente. Para el funcionamiento correcto, el `return` debería ser `return valor_articulo`. Verifique con el autor. -->

---

### Ejercicio # 03

**Asignatura:** Programación Científica  
**Tema:** Ordenamiento — Método Burbuja (iterativo)  
**Fuente:** `Semana_5_FunProg.pdf`

**Enunciado**

Dada una lista vector de N elementos, se pide ordenarla de menor a mayor (Ascendente) mediante el método de Burbuja tradicional.

**Entrada:**

| Lista de números |
|:---:|
| 5 |
| 3 |
| 4 |
| 2 |
| 1 |

**Salida esperada:**

| Lista de números |
|:---:|
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |

**Solución**

```python
# Programa para el método de ordenamiento Burbuja
# Autor: Sergio Medina
# Fecha: 03/06/2021

# Funciones
def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, "  debe ser entero  Intenta de nuevo...")
    return dato

def ordenamiento_burbuja(numeros):
    for i in range(0, N - 1):
        for j in range(i + 1, N):
            if numeros[i] > numeros[j]:
                t = numeros[i]
                numeros[i] = numeros[j]
                numeros[j] = t
    return numeros

# Programa principal
N = valida_entero("Ingrese cantidad de elementos: ")
numeros = []
for i in range(N):
    num = valida_entero("Número: ")
    numeros.append(num)

print("Lista Numeros: ", numeros)

# Llamado a la función
numeros = ordenamiento_burbuja(numeros)
print("Lista ordenada: ", numeros)
```

<!-- ⚠️ Nota del asistente: La función `ordenamiento_burbuja` referencia la variable global `N` directamente en los rangos de los ciclos. Esto funciona en Python porque `N` está declarada en el ámbito del programa principal, pero como buena práctica sería preferible usar `len(numeros)` dentro de la función o pasar `N` como parámetro adicional. -->

---

### Ejercicio # 04

**Asignatura:** Programación Científica  
**Tema:** Búsqueda — Búsqueda lineal o secuencial  
**Fuente:** `Semana_5_FunProg.pdf`

**Enunciado**

Dada una lista vector de N elementos y una información a buscar en la lista, se pide realizar el proceso de búsqueda lineal o secuencial e indicar en cual posición de la lista se encuentra la información.

**Entrada:**

| Lista de números |
|:---:|
| 2 |
| 4 |
| 1 |
| 5 |
| 3 |

Información a buscar: `5`

**Salida esperada:**

| Posición donde se encontró la información |
|:---:|
| 3 |

**Solución**

```python
# Programa para la búsqueda lineal o secuencial
# Autor: Sergio Medina
# Fecha: 04/06/2021

# Funciones
def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser dato ENTERO")
    return dato

def busqueda_lineal(numeros, buscar):
    for i in range(N):
        if numeros[i] == buscar:
            return i
    return -1

# Programa principal
numeros = []
N = valida_entero("Ingrese cantidad de elementos: ")
for i in range(N):
    num = valida_entero("Número: ")
    numeros.append(num)
print("Lista: ", numeros)

buscar = valida_entero("Información a buscar: ")
posicion = busqueda_lineal(numeros, buscar)
if posicion == -1:
    print("Información no encontrada")
else:
    print("Información encontrada en posición: ", posicion)
```

<!-- ⚠️ Posible error en el original: La diapositiva 18 del documento fuente presenta errores tipográficos en los mensajes de salida: "Información encntrada" y "posicipon". Se transcriben corregidos en el código anterior. Adicionalmente, `busqueda_lineal` referencia la variable global `N`; lo recomendable es usar `len(numeros)` dentro de la función. -->

---

### Ejercicio # 05

**Asignatura:** Programación Científica  
**Tema:** Búsqueda — Búsqueda binaria (no recursiva)  
**Fuente:** `Semana_5_FunProg.pdf`

**Enunciado**

Dada una lista vector de elementos y una información a buscar en la lista, se pide realizar el proceso de búsqueda binaria e indicar en cual posición de la lista se encuentra la información. (El vector está ordenado.)

**Entrada:**

| Lista de números |
|:---:|
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
| 6 |
| 7 |
| 8 |

Información a buscar: `3`

**Salida esperada:**

| Posición donde se encontró la información |
|:---:|
| 2 |

**Solución**

El algoritmo sigue estos pasos:

1. Definir `izq = 0` y `der = len(lista) - 1`.
2. Calcular el punto medio: `med = (izq + der) // 2`.
3. Comparar `lista[med]` con el elemento buscado:
   - Si son iguales → retornar la posición `med`.
   - Si el elemento buscado es menor → buscar en la mitad izquierda: `der = med - 1`.
   - Si el elemento buscado es mayor → buscar en la mitad derecha: `izq = med + 1`.
4. Repetir mientras `izq <= der`. Si se agota el rango, retornar `-1` (no encontrado).

```python
# Programa para la búsqueda binaria
# Autor: Sergio Medina
# Fecha: 04/06/2021

def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser dato ENTERO")
    return dato

def busqueda_binaria(vector, elemento):
    izq = 0
    der = len(vector) - 1
    while izq <= der:
        med = (izq + der) // 2
        if vector[med] == elemento:
            return med
        elif vector[med] > elemento:
            der = med - 1
        else:
            izq = med + 1
    return -1

# Programa principal
vector = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
elemento = valida_entero("Elemento: ")
if busqueda_binaria(vector, elemento) == -1:
    print("Elemento no encontrado en la lista")
else:
    print("Posición elemento: ", busqueda_binaria(vector, elemento))
```

---

### Ejercicio # 06

**Asignatura:** Programación Científica  
**Tema:** Recursividad — Cálculo del factorial  
**Fuente:** `Semana_6_FunProg.pdf`

**Enunciado**

Dado un número entero, calcular su factorial utilizando recursividad.

- Factorial de NUM = NUM × (NUM − 1) × (NUM − 2) × … × 1
- Ejemplo: Factorial de 3 o 3! = 3 × 2 × 1 = 6
- Casos especiales: Factorial(0) = 1 y Factorial(1) = 1

**Solución**

**Versión 1 — Sin recursividad (iterativa)**

```python
# Programa para el calculo del factorial sin recursividad
# Autor: Sergio Medina
# Fecha: 10/06/2021

# Funciones
def factorial(numero):
    if numero == 0 or numero == 1:
        return 1
    else:
        fact = 1
        for i in range(numero, 1, -1):
            fact = fact * i
        return fact

def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser dato ENTERO")
    return dato

# Programa principal
numero = valida_entero("Ingrese Número: ")
fact = factorial(numero)
print("Factorial: ", fact)
```

**Versión 2 — Con recursividad**

```python
# Programa para el calculo del factorial con recursividad
# Autor: Sergio Medina
# Fecha: 10/06/2021

# Funciones
def factorial_recursivo(numero):
    if numero == 0 or numero == 1:          # Condición de salida de la recursividad
        return 1
    else:
        return numero * factorial_recursivo(numero - 1)  # Llamada recursiva

def valida_entero(etiqueta):
    while True:
        try:
            dato = int(input(etiqueta))
            break
        except ValueError:
            print(etiqueta, " debe ser dato ENTERO")
    return dato

# Programa principal
numero = valida_entero("Ingrese Número: ")
fact = factorial_recursivo(numero)
print("Factorial: ", fact)

# Traza para numero = 3:
# 3 * factorial_recursivo(2)
# 3 * 2 * factorial_recursivo(1)
# 3 * 2 * 1 = 6
```

---

---
title: "Ejercicios extraídos — Quiz 3 (Biblioteca & Oftalmólogo)"
source: "POO_-_QUIZ_3_2021-2__1_.pdf / POO_-_Taller_Final.pdf"
course: "Programación Orientada a Objetos"
course_code: "TEC"
type: "Extracción de ejercicios"
language: "Java"
total_exercises: 2
date: "2026-07-01"
author: "Asistente de Docencia"
---

# Ejercicios extraídos — Quiz 3 (Biblioteca & Oftalmólogo)

> **Fuente:** Dos evaluaciones del curso *Programación Orientada a Objetos*, autoría de Alejandro Ramírez Hernández — Universidad Católica de Oriente.  
> **Nota de clasificación:** El curso POO no está en la tabla de cursos predefinidos; se clasifica como `TEC`. Ajustar si se incorpora un código propio (`POO`).

---

### Ejercicio # 01

**Asignatura:** Programación Orientada a Objetos  
**Tema:** Interfaces, herencia, clases abstractas y polimorfismo  

**Enunciado**

En la biblioteca solo se prestarán recursos que tengan la propiedad de ser **Prestables** y solo se fotocopian los que tengan la implementación de **Copiable**.

Construir una solución Orientada a Objetos que cumpla con las siguientes condiciones:

i) Agregar Recursos a la biblioteca. Simplemente incluye un nuevo recurso en la lista de recursos.

ii) En la biblioteca solo se prestan recursos que implementen la interfaz `Prestable`. Cualquier otro recurso que no tenga esa propiedad no puede ser prestado.

iii) Los métodos implementados `prestar()` y `devolver()` cambian el valor del atributo `prestado` del recurso según la operación.

iv) El método `prestarRecurso(Recurso r)` retornará `false` si no es un recurso prestable o si ya está prestado. Retornará `true` si se pudo prestar.

v) El método `devolverRecurso(Recurso r)` retornará `false` si no es un recurso prestable o si no está prestado. Retornará `true` si se pudo devolver.

vi) El método `fotocopiarRecurso(Recurso r)` retornará `false` si el recurso no es `Copiable`; en otro caso retornará `true`. Se debe validar si además es `Prestable` para validar su estado antes de fotocopiarlo y retornar según el caso.

vii) El método implementado `fotocopiar()` simplemente aumenta en uno el valor del atributo `copias`, que hace las veces de contador. Se debe validar que el recurso a fotocopiar sí sea `Copiable`.

viii) El método `listarPrestados()` muestra en pantalla todos los recursos prestados que tiene la biblioteca.

ix) El método `listarCopiasPorRecurso()` no retornará nada. Solo permitirá imprimir el número de veces que se ha fotocopiado cada uno de los recursos que permiten hacerlo.  
*Protip:* Con cada caso debería imprimir algo como: `"Ensayo sobre la ceguera se ha fotocopiado 6 veces"`.

x) Aparte de las clases que heredan de `Recurso`, debes adicionar tres subclases más: una que implemente `Prestable`, otra que implemente `Copiable` y otra que no implemente ninguna interfaz.

xi) Todas las clases que extiendan de `Recurso` deben redefinir (con `@Override`) el método `toString()` de la clase `Object` para que muestre la información básica del recurso en cuestión y no la dirección de memoria del objeto.

**Diagrama de clases (descripción)**

| Elemento | Detalle |
|---|---|
| **Biblioteca** | Agrega y gestiona una lista de `Recurso` (relación 1 a 0..*). Métodos: `addRecurso`, `prestarRecurso`, `devolverRecurso`, `fotocopiarRecurso`, `listarPrestados`, `listarCopiasPorRecurso`. |
| **Recurso** *(abstract)* | Atributos: `-prestado: boolean`, `-nombre: String`, `-copias: int`. |
| **Tesis, Libro, Revista** | Subclases concretas de `Recurso` (ya provistas en el enunciado). |
| **Copiable** *(interface)* | Método: `+fotocopiar()`. |
| **Prestable** *(interface)* | Métodos: `+prestar()`, `+devolver()`. |
| **Tres subclases adicionales** | Una implementa `Prestable`, otra `Copiable` y otra ninguna interfaz. |

**NOTA:** Debes crear una clase principal donde simules el comportamiento de la Biblioteca.

**Solución**

_Pendiente_

---

### Ejercicio # 02

**Asignatura:** Programación Orientada a Objetos  
**Tema:** Interfaces, herencia, polimorfismo, Java Streams y Lambdas  

**Enunciado**

Un Oftalmólogo atiende en una clínica y es especialista en cirugía correctiva de ojos para que sus pacientes no tengan que usar gafas. Antes de operar, el oftalmólogo revisa si su paciente es o no apto para ser operado en base a la edad.

**Consideraciones:**

- Un paciente **necesita operación** si su nombre contiene la letra `"a"` (sin distinguir mayúsculas o minúsculas).
- Un paciente es **apto para ser operado** si su nombre contiene la letra `"a"` (sin distinguir mayúsculas o minúsculas) **y además** tiene menos de 40 años.
- En el método `revisarPaciente(String nombre, int edad)` se debe verificar si el paciente necesita cirugía y si es apto o no para ser operado. Se debe crear el objeto que se acomode a su lógica. Al final se retorna un objeto de tipo `Paciente` (una de sus subclases).
- El método `operarPacientes()` recorrerá la lista de pacientes y llamará el método `operar()` de los pacientes que deban ser intervenidos. A los demás pacientes no hay que hacerles nada.
- La implementación del método `operar()` de la interfaz `Operable` pasará la variable `necesitaCirugia` de `true` a `false`.
- El método `getPacientesAOperar()` retornará los pacientes que sean aptos para cirugía y que no estén operados (`necesitaCirugia = true`). Para esto, **se debe usar Java Streams y Lambdas**.
- **SOLO PUEDE EXISTIR UNA LISTA DE PACIENTES DENTRO DE LA CLASE `Oftalmologo`**, desde allí se deben gestionar todas las necesidades.

**Diagrama de clases (descripción)**

| Elemento | Detalle |
|---|---|
| **Oftalmologo** | Atributo: `-nombre: String`. Gestiona una lista de `Paciente` (1 a 0..*). Métodos: `revisarPaciente(nombre, edad): Paciente`, `operarPacientes()`, `getPacientesAOperar(): List<PacienteApto>`. |
| **Paciente** *(abstract)* | Atributos: `-nombre: String`, `-edad: int`, `-necesitaCirugia: boolean`. Constructor: `Paciente(nombre, edad, necesitaCirugia)`. |
| **PacienteApto** | Subclase de `Paciente`. Implementa `Operable`. |
| **PacienteNoApto** | Subclase de `Paciente`. No implementa ninguna interfaz adicional. |
| **Operable** *(interface)* | Método: `+operar()`. |

**NOTA:** Se debe crear una clase con un método `main` que contenga la prueba de **todo** el programa orientado a objetos.

**Solución**

_Pendiente_

---