---
title: "Taller evaluativo 02 — Funciones y POO"
updatedAt: "2026-09-23"
---

# Taller evaluativo 02 — Funciones y POO

> **Momento evaluativo 2 del curso — vale el 15 % de la nota final.** Es el
> segundo de los cinco cortes evaluativos del semestre y cubre funciones y
> programación orientada a objetos con Python. Se resuelve de forma
> **individual**.

## Objetivo

Integrar en un solo notebook lo visto en las lecciones **"Funciones"** y
**"Clases y objetos en Python"**, resolviendo ocho ejercicios sobre un
problema real de programación científica: la **calibración de un sensor de
bajo costo de PM2.5 frente a la red de monitoreo de calidad del aire**.

Competencias esperadas:
- Definir funciones con parámetros, valores por defecto y `return`, y
  distinguir lo que una función devuelve de lo que solo imprime.
- Escribir funciones que reciben todo por parámetro y no dependen de
  variables globales.
- Aplicar `map`, `filter` y `lambda` para transformar y filtrar una serie de
  lecturas.
- Definir clases con `__init__`, `self`, atributos y métodos, y crear objetos
  a partir de ellas.
- Proteger los datos de un objeto con la convención `_atributo` y con
  validación mediante `raise ValueError`.
- Hacer que los objetos se describan solos con `__repr__` y `__str__`.
- Componer objetos (una estación que contiene lecturas) y hacer que los
  métodos de una clase reutilicen funciones auxiliares.
- Documentar cada ejercicio en celdas de texto y con docstrings, y entregar
  el notebook en GitHub.

## Contexto: un sensor de bajo costo por calibrar

La red de monitoreo de calidad del aire instaló en la estación **EST-04**,
sector Oriente, un sensor de bajo costo llamado **SBC-A** para ampliar la
cobertura del valle. Estos sensores son baratos pero imprecisos: antes de
usar sus datos hay que **calibrarlos** contra el equipo patrón con una
recta, `valor calibrado = pendiente x lectura + intercepto`. Para SBC-A el
laboratorio determinó una pendiente de 1.2 y un intercepto de -0.5.

Dos detalles del mundo real, los mismos de siempre:

- Cuando el sensor falla, el equipo escribe el valor centinela `-999.0`.
  Además, algunas lecturas quedan fuera del rango físico del sensor (más de
  500.0 µg/m³): son ruido, no medición. Ninguna de las dos debe entrar a un
  promedio.
- Algunas lecturas llegan en mg/m³ y otras en µg/m³. Antes de comparar hay
  que convertir a la misma unidad: 1 mg/m³ equivale a 1000 µg/m³.

La escala oficial de calidad del aire para PM2.5 (promedio de 24 horas) que
se usa en todo el taller es esta:

| Categoría | Rango de PM2.5 (µg/m³) |
|---|---|
| Buena | hasta 12.0 |
| Moderada | más de 12.0 y hasta 35.4 |
| Dañina para grupos sensibles | más de 35.4 y hasta 55.4 |
| Dañina para la salud | más de 55.4 |

## Desarrollo del Taller

El taller tiene **ocho ejercicios**, en orden creciente de dificultad, que se
resuelven todos en el **mismo notebook** y en el orden en que aparecen: los
últimos reutilizan funciones y objetos de los primeros. Los ejercicios 1 a 4
son de funciones, los 5 a 7 de clases y objetos, y el 8 integra ambos temas.
Cada ejercicio debe ir precedido por una celda de texto que explique qué
hace, y cada resultado debe mostrarse con `print()`.

Todas las funciones, clases y métodos que escriba llevan un **docstring de
una línea** (la frase entre triples comillas que va en la primera línea del
cuerpo, como en las lecciones) que diga qué hacen. Los nombres van en `snake_case` (funciones y
variables) y `PascalCase` (clases), sin tildes.

### Ejercicio 1 — Calibrar una lectura

Escriba la función que aplica la recta de calibración a una lectura. Sus
parámetros de calibración son opcionales: si no se indican, la función no
altera la lectura (pendiente 1.0 e intercepto 0.0).

```python
# TODO: defina calibrar_lectura(valor, pendiente=1.0, intercepto=0.0)
#       que devuelva valor * pendiente + intercepto
#       (no olvide el docstring de una línea)

# TODO: guarde en sin_calibrar el resultado de calibrar_lectura(10.0)
# TODO: guarde en calibrada el resultado de calibrar_lectura(10.0, 1.2, -0.5)
# TODO: guarde en con_intercepto el resultado de llamar la función con el
#       valor 10.0 e indicando solo el intercepto 2.0 por nombre
# TODO: muestre los tres resultados con print()
```

**Requisitos:** la función debe usar `return`, no `print`, para entregar el
resultado. Los valores por defecto deben estar en la firma de la función.
La llamada de `con_intercepto` debe usar el argumento por nombre
(`intercepto=...`).

### Ejercicio 2 — ¿Es utilizable la lectura?

Una lectura es válida cuando **no** es el centinela `-999.0` **y** está
entre 0 y 500.0 inclusive.

```text
lecturas_sbc_a = [10.0, -999.0, 25.0, 40.0, -999.0, 8.0, 52.0, 600.0]
```

```python
# TODO: declare lecturas_sbc_a (lista) con los valores de arriba
#       (son las lecturas crudas del sensor SBC-A, todas en ug/m3)

# TODO: defina es_lectura_valida(valor) que devuelva True o False según la
#       regla del enunciado (use "and" y una comparación encadenada o dos
#       comparaciones)

# TODO: muestre con print() el resultado de es_lectura_valida para 25.0,
#       -999.0, 600.0 y 0.0
```

**Requisitos:** la función devuelve un booleano con `return` y no contiene
ningún `print`. No puede leer `lecturas_sbc_a` ni ninguna otra variable
global: recibe el valor por parámetro.

### Ejercicio 3 — Promedio de las lecturas útiles

Ahora reutilice la función del Ejercicio 2 dentro de otra función.

```python
# TODO: defina promedio_valido(lecturas) que recorra la lista recibida con
#       un for, acumule solo las lecturas para las que es_lectura_valida
#       devuelve True, y devuelva el promedio de esas lecturas
# TODO: si ninguna lectura es válida, la función devuelve None en lugar de
#       dividir entre cero

# TODO: guarde en promedio_sbc_a el resultado de promedio_valido(lecturas_sbc_a)
# TODO: muestre con print() promedio_sbc_a y el resultado de
#       promedio_valido([-999.0, -999.0])
```

**Requisitos:** la función llama a `es_lectura_valida` (no repite la regla
escrita a mano), recibe la lista por parámetro y todas sus variables de
trabajo (acumulador, contador) son locales: no deben existir afuera de la
función. El resultado se devuelve con `return`.

### Ejercicio 4 — Calibrar la serie con `map`, `filter` y `lambda`

Con las funciones anteriores, calibre solo las lecturas útiles de SBC-A y
cuente cuántas superan la categoría Moderada.

```text
pendiente_sbc_a = 1.2
intercepto_sbc_a = -0.5
```

```python
# TODO: declare pendiente_sbc_a e intercepto_sbc_a (float)
# TODO: con filter y es_lectura_valida, quédese solo con las lecturas útiles
#       de lecturas_sbc_a
# TODO: con map y una función lambda que llame a calibrar_lectura con la
#       pendiente y el intercepto de SBC-A, calibre esas lecturas y guarde
#       el resultado, convertido a lista, en lecturas_calibradas
# TODO: con filter y una función lambda, cuente con len cuántas de
#       lecturas_calibradas superan 35.4 y guárdelo en excedencias
# TODO: muestre lecturas_calibradas y excedencias con print()
```

**Requisitos:** use `map`, `filter` y al menos una `lambda`. No use un
bucle `for` ni una comprensión de listas en este ejercicio. `filter` y `map`
devuelven objetos que hay que convertir con `list(...)` antes de usar
`len` o de mostrar el resultado.

### Ejercicio 5 — La clase `Lectura`

Convierta una lectura suelta en un objeto que sabe convertirse y sabe si es
un dato faltante. En este ejercicio la clase **no valida**: el centinela
`-999.0` es un valor legítimo que debe poder guardarse.

```python
# TODO: defina la clase Lectura con __init__(self, valor, unidad="ug/m3",
#       codigo_sensor="sin asignar") que guarde los tres datos como
#       atributos: valor, unidad y codigo_sensor
# TODO: defina el método a_microgramos(self) que devuelva el valor en
#       ug/m3: si la unidad es "mg/m3" lo multiplica por 1000; si no, lo
#       devuelve igual
# TODO: defina el método es_dato_faltante(self) que devuelva True cuando el
#       valor es el centinela -999.0

# TODO: cree lectura_campo = Lectura(0.0252, "mg/m3", "SBC-A"),
#       lectura_faltante = Lectura(-999.0, codigo_sensor="SBC-A") y
#       lectura_normal = Lectura(30.0)
# TODO: muestre con print() lectura_campo.a_microgramos(),
#       lectura_faltante.es_dato_faltante(), lectura_campo.es_dato_faltante(),
#       y la unidad y el código de sensor de lectura_normal
```

**Requisitos:** los métodos leen los datos con `self`, sin recibirlos por
parámetro. Los valores por defecto van en `__init__`. `lectura_normal` debe
quedar con la unidad y el código de sensor por defecto.

### Ejercicio 6 — La clase `Sensor`: validación y encapsulamiento

Un sensor con una pendiente de calibración inválida produciría resultados
absurdos en silencio. La clase debe impedir que ese objeto exista.

```python
# TODO: defina la clase Sensor con
#       __init__(self, codigo, pendiente=1.0, intercepto=0.0)
# TODO: dentro de __init__, antes de guardar nada, lance ValueError con
#       raise si el código es un texto vacío ("") y también si la pendiente
#       es menor o igual a cero; use un mensaje que diga qué salió mal
# TODO: guarde codigo como atributo público y la pendiente y el intercepto
#       como atributos internos con guion bajo: _pendiente e _intercepto
# TODO: defina el método calibrar(self, valor) que devuelva la lectura
#       calibrada llamando a la función calibrar_lectura del Ejercicio 1
# TODO: defina __repr__ para que repr(sensor_a) sea exactamente
#       Sensor(codigo='SBC-A', pendiente=1.2, intercepto=-0.5)
# TODO: defina __str__ para que print(sensor_a) muestre en una línea legible
#       el código, la pendiente y el intercepto (el formato es libre)

# TODO: cree sensor_a = Sensor("SBC-A", 1.2, -0.5) y sensor_b = Sensor("SBC-B")
# TODO: muestre con print() sensor_a, la lista [sensor_a, sensor_b], y el
#       resultado de calibrar 10.0 con cada sensor
```

**Requisitos:** ningún dato inválido puede llegar a los atributos. Ni la
pendiente ni el intercepto pueden quedar como atributos públicos
(`self.pendiente`). `calibrar` no repite la fórmula: reutiliza la función.
Compruebe la validación a mano en una celda aparte con `Sensor("")` y
`Sensor("X", 0)`: ambas deben fallar con `ValueError`. **Antes de entregar,
borre esa celda de prueba o deje sus líneas comentadas**: un error en el
notebook entregado se califica como si no ejecutara.

### Ejercicio 7 — La clase `Estacion`: objetos que contienen objetos

La estación EST-04 guarda las lecturas de su sensor como objetos `Lectura`
del Ejercicio 5. Las lecturas de la campaña, como pares de valor y unidad,
son estas (una llegó en mg/m³):

```text
datos_campana = [
    (10.0, "ug/m3"), (-999.0, "ug/m3"), (0.025, "mg/m3"), (40.0, "ug/m3"),
    (-999.0, "ug/m3"), (8.0, "ug/m3"), (52.0, "ug/m3"), (600.0, "ug/m3"),
]
```

```python
# TODO: defina la clase Estacion con __init__(self, codigo, sector) que
#       guarde codigo y sector como atributos públicos y una lista vacía en
#       el atributo interno _lecturas
# TODO: defina el método agregar(self, lectura) que guarde la Lectura en
#       _lecturas
# TODO: defina el método valores(self) que devuelva una lista con la
#       concentración en ug/m3 de cada lectura guardada, en el mismo orden
# TODO: defina __repr__ para que repr(estacion_oriente) sea exactamente
#       Estacion('EST-04', 'Oriente', lecturas=8)

# TODO: declare datos_campana con los pares de arriba
# TODO: cree estacion_oriente = Estacion("EST-04", "Oriente")
# TODO: recorra datos_campana con un for, desempaquetando cada par en valor
#       y unidad, y agregue a la estación una Lectura con esos datos y el
#       código de sensor "SBC-A"
# TODO: muestre con print() estacion_oriente y estacion_oriente.valores()
```

**Requisitos:** `valores` obtiene cada número llamando a
`a_microgramos()` de cada lectura; no accede a `valor` ni a `unidad`
directamente. Fuera de la clase no se toca `_lecturas`: solo se usan sus
métodos. Los valores de la lista deben coincidir con `lecturas_sbc_a` del
Ejercicio 2.

### Ejercicio 8 — Integración: el informe de la estación

El último ejercicio junta funciones y objetos: una clase cuyos métodos
trabajan con funciones auxiliares que usted ya escribió.

```python
# TODO: defina la función categoria_pm25(concentracion) que devuelva
#       "Buena", "Moderada", "Dañina para grupos sensibles" o
#       "Dañina para la salud" según la escala oficial, con una sola cadena
#       if / elif / else
# TODO: defina la clase InformeEstacion con __init__(self, estacion, sensor)
#       que guarde ambos objetos en atributos internos
# TODO: defina el método promedio_calibrado(self) que: (1) tome los valores
#       de la estación, (2) descarte con filter y es_lectura_valida los que
#       no sirven, (3) calibre el resto con map (con una lambda o con el propio
#       método calibrar del sensor), y (4) devuelva su promedio usando
#       promedio_valido
# TODO: defina el método categoria(self) que devuelva la categoría del
#       promedio calibrado usando categoria_pm25
# TODO: defina __str__ para que print(informe) muestre exactamente
#       EST-04: 31.9 ug/m3 - Moderada
#       (código de la estación, promedio calibrado redondeado a un decimal
#       con round(valor, 1), que redondea al número de decimales indicado,
#       y categoría)

# TODO: cree informe = InformeEstacion(estacion_oriente, sensor_a)
# TODO: muestre con print() informe y informe.promedio_calibrado()
```

**Requisitos:** los métodos de `InformeEstacion` **reutilizan**
`es_lectura_valida`, `promedio_valido` y `categoria_pm25`, y el método
`calibrar` de `Sensor`: no copian su lógica. Ninguna concentración puede
quedar sin categoría ni en dos a la vez. Los textos de salida deben
coincidir carácter por carácter con el pedido.

**Reto de extensión (opcional, sin puntos):** agregue a `InformeEstacion` un
método `excedencias(self, umbral=35.4)` que devuelva cuántas lecturas
calibradas superan el umbral, con `filter` y `lambda`. Para SBC-A y el
umbral por defecto debe dar 2.

## Entregable

Suba su notebook a la carpeta `ejercicios/` de su repositorio
`curso-programacion-cientifica`, con la opción **Archivo → Guardar una copia
en GitHub** de Colab.

Nombre exacto del archivo: `taller-evaluativo-02-funciones-y-poo.ipynb`.

Estructura esperada del repositorio tras la entrega:

```
curso-programacion-cientifica/
├── ejercicios/
│   ├── taller-variables-tipos-operadores.ipynb
│   ├── taller-condicionales-bucles.ipynb
│   ├── taller-evaluativo-01-calidad-del-aire.ipynb
│   └── taller-evaluativo-02-funciones-y-poo.ipynb
└── README.md
```

Su notebook debe contener, en este orden:
1. Una celda de texto con el título del taller, su nombre completo y la
   fecha.
2. Los ocho ejercicios completos, en el orden de esta guía, cada uno
   precedido por una celda de texto que explique qué hace.
3. La celda de verificación final (abajo), sin modificar.

**Antes de subir:** ejecute `Entorno de ejecución → Reiniciar y ejecutar
todas` y confirme que ninguna celda muestra un error. Un notebook que solo
funciona ejecutando las celdas en desorden se califica como si no ejecutara.

### Celda de verificación

Copie esta celda al final del notebook y ejecútela después de todo lo demás.
Comprueba funciones, objetos y algunos resultados intermedios; **no
reemplaza** la revisión de cada ejercicio, pero si alguna línea falla hay un
error que debe corregir antes de entregar.

```python
# Celda de verificación — ejecútela al final, después de todo lo demás
assert abs(calibrar_lectura(10.0, 1.2, -0.5) - 11.5) < 1e-9, "revise el Ejercicio 1"
assert calibrar_lectura(10.0) == 10.0, "sin parámetros no debe alterar la lectura"
assert abs(con_intercepto - 12.0) < 1e-9, "revise con_intercepto del Ejercicio 1"
assert es_lectura_valida(25.0) and not es_lectura_valida(-999.0), "revise el Ejercicio 2"
assert not es_lectura_valida(600.0), "600.0 excede el rango del sensor"
assert abs(promedio_sbc_a - 27.0) < 1e-9, "revise el promedio del Ejercicio 3"
assert promedio_valido([-999.0, -999.0]) is None, "sin lecturas válidas debe devolver None"
assert len(lecturas_calibradas) == 5, "deberían quedar 5 lecturas calibradas"
assert abs(lecturas_calibradas[0] - 11.5) < 1e-9, "revise la calibración del Ejercicio 4"
assert excedencias == 2, "deberían ser 2 lecturas sobre 35.4"
assert abs(lectura_campo.a_microgramos() - 25.2) < 1e-9, "revise a_microgramos"
assert lectura_faltante.es_dato_faltante() and not lectura_campo.es_dato_faltante()
assert repr(sensor_a) == "Sensor(codigo='SBC-A', pendiente=1.2, intercepto=-0.5)", "revise __repr__ de Sensor"
assert hasattr(sensor_a, "_pendiente") and not hasattr(sensor_a, "pendiente"), "la pendiente debe ser interna"
assert abs(sensor_b.calibrar(10.0) - 10.0) < 1e-9, "revise los valores por defecto de Sensor"
assert repr(estacion_oriente) == "Estacion('EST-04', 'Oriente', lecturas=8)", "revise __repr__ de Estacion"
assert estacion_oriente.valores() == lecturas_sbc_a, "revise valores() del Ejercicio 7"
assert abs(informe.promedio_calibrado() - 31.9) < 1e-9, "revise el Ejercicio 8"
assert informe.categoria() == "Moderada", "revise categoria()"
assert str(informe) == "EST-04: 31.9 ug/m3 - Moderada", "revise __str__ de InformeEstacion"
print("Verificación completada sin errores.")
```

## Criterios de Evaluación

Este taller **es el Momento evaluativo 2 y vale el 15 % de la nota final del
curso**. Se califica sobre 100 puntos con la rúbrica de abajo, y ese puntaje
se convierte después a la escala institucional de 0 a 5.

| Criterio | Puntos | Descripción |
|---|---|---|
| **Funciones: parámetros, valores por defecto y retorno (Ej. 1 a 3)** | 20 | `calibrar_lectura` tiene los valores por defecto en la firma, entrega con `return` y sin `print`, y da 11.5 para `(10.0, 1.2, -0.5)`; `es_lectura_valida` devuelve `False` para -999.0 y para 600.0 y `True` para 25.0 y 0.0; `promedio_valido` llama a `es_lectura_valida`, devuelve 27.0 para `lecturas_sbc_a` y `None` sin lecturas válidas, y no usa variables globales. |
| **`map`, `filter` y `lambda` (Ej. 4)** | 10 | Obtiene 5 lecturas calibradas (la primera 11.5 y la última 61.9) y 2 excedencias usando `filter`, `map` y al menos una `lambda`, sin bucles `for` ni comprensiones. |
| **Clases, atributos y métodos (Ej. 5 y 7)** | 15 | `Lectura` guarda sus tres atributos con valores por defecto y `a_microgramos` devuelve 25.2 para la lectura en mg/m³; `es_dato_faltante` distingue el centinela; `Estacion` guarda objetos `Lectura`, y `valores()` entrega los ocho valores en ug/m3 usando `a_microgramos()`, sin acceder a los atributos de la lectura. |
| **Encapsulamiento y validación (Ej. 6)** | 15 | `Sensor` lanza `ValueError` con `raise` para código vacío y para pendiente menor o igual a cero, antes de guardar los datos; la pendiente y el intercepto están guardados como `_pendiente` y `_intercepto` y no existen como atributos públicos; `calibrar` reutiliza `calibrar_lectura`. |
| **`__repr__` y `__str__` (Ej. 6 a 8)** | 10 | `repr(sensor_a)`, `repr(estacion_oriente)` y `str(informe)` producen exactamente los textos indicados en la guía; `print(sensor_a)` muestra código, pendiente e intercepto en una línea legible. |
| **Integración de funciones y clases (Ej. 8)** | 10 | `InformeEstacion` obtiene promedio calibrado 31.9 y categoría "Moderada" reutilizando `es_lectura_valida`, `promedio_valido`, `categoria_pm25` y el método `calibrar` del sensor; `categoria_pm25` usa una sola cadena `if` / `elif` / `else` y clasifica correctamente las cuatro categorías de la escala. |
| **Ejecución sin errores** | 10 | El notebook corre completo con `Reiniciar y ejecutar todas` sin ningún error (incluida la ausencia de celdas de prueba que lancen `ValueError`), y la celda de verificación imprime "Verificación completada sin errores." |
| **Documentación** | 5 | Cada uno de los ocho ejercicios tiene una celda de texto previa que explica qué hace, y cada función, clase y método tiene un docstring de una línea; los nombres siguen `snake_case` y `PascalCase` sin tildes. |
| **Entrega correcta** | 5 | El notebook está en `ejercicios/` del repositorio del curso, con el nombre de archivo exacto indicado, subido con Guardar una copia en GitHub y visible en GitHub antes del plazo. |
| **TOTAL** | **100** | |

### Cómo se convierte el puntaje a nota

```
nota_taller (0-5)        = (puntaje_obtenido / 100) x 5
aporte_a_la_nota_final % = (puntaje_obtenido / 100) x 15
```

Ejemplo: un notebook que obtiene **82 de 100** puntos saca **4.1** en la
escala de 0 a 5 y aporta **12.3 %** de los 15 % que vale este momento
evaluativo.

## Dificultades Comunes

### "Mi función imprime el resultado pero después vale `None`"
- La función usa `print` en lugar de `return`. `print` solo muestra el valor
  en pantalla; `return` lo entrega para que pueda guardarlo o seguir
  operando con él. Cambie el `print` del cuerpo por `return`.

### "`NameError` por una variable que sí calculé dentro de la función"
- Las variables creadas dentro de una función solo existen mientras ella se
  ejecuta. Si necesita el valor afuera, devuélvalo con `return` y guárdelo en
  una variable en la celda que llamó la función.

### "`print(list(...))` con `map` o `filter` me muestra algo raro, o `len` falla"
- `map` y `filter` no devuelven listas: devuelven objetos que se recorren una
  sola vez. Envuélvalos en `list(...)` antes de usar `len` o de mostrarlos, y
  recuerde que un objeto `filter` ya recorrido queda vacío.

### "`TypeError: __init__() missing 1 required positional argument`"
- Faltó un argumento al crear el objeto, o se olvidó `self` como primer
  parámetro del método. Al llamar un método no se escribe `self`: Python lo
  pasa solo.

### "`AttributeError` al usar un dato dentro de un método"
- Dentro de un método, los atributos se leen con `self.` (por ejemplo,
  `self._pendiente`). Si escribe solo `_pendiente`, Python busca una variable
  local que no existe.

### "Mi `print(sensor_a)` sigue mostrando `<__main__.Sensor object at ...>`"
- Falta `__str__` (o `__repr__`) en la clase, o quedó con la indentación
  fuera de ella o mal escrito (`__str__` lleva dos guiones bajos a cada
  lado). Además, si cambió la clase, vuelva a ejecutar la celda que crea los
  objetos: los objetos viejos conservan la definición anterior.

### "La celda de verificación falla en `hasattr(sensor_a, "pendiente")`"
- Guardó la pendiente como `self.pendiente` en lugar de `self._pendiente`. Es
  la convención que señala un dato interno del objeto.

### "El notebook funciona, pero al reiniciar el entorno falla"
- Está dependiendo de variables o clases que quedaron en memoria de
  ejecuciones anteriores, de celdas ejecutadas en desorden, o dejó una celda
  de prueba de `ValueError` sin borrar. Ejecute siempre `Reiniciar y
  ejecutar todas` antes de entregar: así se va a calificar.

**Plazo de entrega:** sábado 3 de octubre de 2026.
