> Sesión práctica en vivo (Semana 7, jueves 17 de septiembre de 2026): el
> docente escribe y ejecuta este guion en Colab, celda por celda, proyectado al
> grupo. No es trabajo independiente del estudiante — no hay guía de
> laboratorio para esta sesión. Sigue el orden de la lección "Clases y objetos
> en Python" y continúa sobre `registros_estaciones` y la función
> `convertir_a_microgramos` de Funciones. Todo corre en Google Colab, sin
> terminal. Las salidas anotadas fueron obtenidas ejecutando el código.

## Paso 0 — Recargar el dataset y la función de Funciones

Ejecutar esta celda para tener disponible lo que el notebook de hoy necesita.
Es la misma lista de diccionarios y la misma función de la sesión anterior.

```python
registros_estaciones = [
    {"codigo": "EST-01", "sector": "Norte",  "coordenadas": (6.28, -75.57), "lecturas": [8.4, 12.7, 15.2]},
    {"codigo": "EST-02", "sector": "Centro", "coordenadas": (6.24, -75.58), "lecturas": [41.8, 58.3, 36.1]},
    {"codigo": "EST-03", "sector": "Sur",    "coordenadas": (6.19, -75.59), "lecturas": [9.6, 13.9, 7.5], "humedad_relativa": 68.0},
]


def convertir_a_microgramos(valor, unidad="mg/m3"):
    """Convierte una lectura a ug/m3."""
    if unidad == "mg/m3":
        return valor * 1000  # mg/m3 -> ug/m3: se multiplica por 1000
    return valor  # ya viene en ug/m3, no hay nada que convertir


print(registros_estaciones[0]["lecturas"])
print(convertir_a_microgramos(15.2, "ug/m3"))
```

```text
[8.4, 12.7, 15.2]
15.2
```

Punto a resaltar: decir en voz alta que hoy no se reescribe ni el dataset ni la
función; se usan para ver qué les falta.

## Paso 1 — Reproducir el problema: un dato inválido que nadie detiene

Escribir la celda y ejecutarla sin adelantar la explicación:

```python
lectura = {"valor": -5, "unidad": "kg"}
print(lectura)
print(convertir_a_microgramos(-5))
```

```text
{'valor': -5, 'unidad': 'kg'}
-5000
```

Punto a resaltar: dejar la salida en pantalla y preguntar al grupo qué está
mal. Una concentración negativa, en kilogramos, y Python no dijo nada: el
diccionario aceptó cualquier cosa y la función devolvió `-5000` como si fuera
un resultado válido. Ese dato viajaría por el notebook hasta contaminar un
promedio. Cerrar con la idea de fondo: la lectura es solo un puñado de datos,
no sabe qué es ni qué le está permitido, y la lógica vive lejos, en funciones
que hay que acordarse de llamar. Recordar la promesa del final de Funciones:
hoy una función va a vivir dentro de un objeto.

## Paso 2 — Primera clase: `__init__` y `self`

Definir `Medicion` con lo mínimo y crear dos objetos:

```python
class Medicion:
    """Una lectura de PM2.5 de una estacion."""

    def __init__(self, valor, unidad="ug/m3", estacion="sin asignar"):
        # self es el objeto que se esta creando; cada asignacion guarda
        # un dato DENTRO de ese objeto
        self.valor = valor
        self.unidad = unidad
        self.estacion = estacion


m = Medicion(15.2)                       # usa los valores por defecto
otra = Medicion(0.0084, "mg/m3", "EST-01")
print(m.valor, m.unidad, m.estacion)
print(otra.valor, otra.unidad, otra.estacion)
```

```text
15.2 ug/m3 sin asignar
0.0084 mg/m3 EST-01
```

Punto a resaltar: `Medicion(15.2)` no llama a `__init__` a mano; Python crea
un objeto vacío y se lo pasa como `self`. Por eso al llamar solo se escriben
tres argumentos y la función recibe cuatro. `m` y `otra` salen del mismo molde
pero guardan datos distintos. Señalar también que los valores por defecto
funcionan igual que en las funciones.

Mostrar dos cosas más, en celdas separadas, para motivar lo que viene:

```python
print(m)
```

```text
<__main__.Medicion object at 0x100cdf0e0>
```

```python
m.valor = -5
print(m.valor)
```

```text
-5
```

Punto a resaltar: la dirección de memoria cambia en cada ejecución y el texto
no dice qué medición es (se arregla en el Paso 5). Y el atributo se cambió
desde afuera a `-5` sin protesta: el problema del Paso 1 sigue vivo (se
arregla en el Paso 4).

## Paso 3 — Métodos: la función que vive dentro del objeto

Definir la escala oficial una sola vez, fuera de la clase, y mover la lógica
de conversión y clasificación adentro. Volver a ejecutar la clase completa
(en Colab, redefinir la celda reemplaza la clase anterior):

```python
ESCALA_OFICIAL = [
    (12.0, "Buena"),
    (35.4, "Moderada"),
    (55.4, "Dañina para grupos sensibles"),
]


class Medicion:
    """Una lectura de PM2.5 de una estacion."""

    def __init__(self, valor, unidad="ug/m3", estacion="sin asignar"):
        self.valor = valor
        self.unidad = unidad
        self.estacion = estacion

    def a_microgramos(self):
        """Devuelve la concentracion en ug/m3."""
        # el metodo no recibe valor ni unidad: los lee del propio objeto
        if self.unidad == "mg/m3":
            return self.valor * 1000
        return self.valor

    def categoria(self):
        """Clasifica la lectura segun la escala oficial."""
        # reutiliza a_microgramos() llamandolo con self
        concentracion = self.a_microgramos()
        for limite, nombre in ESCALA_OFICIAL:
            if concentracion <= limite:
                return nombre
        return "Dañina para la salud"  # supera el ultimo limite de la escala


m = Medicion(0.0084, "mg/m3", "EST-01")
print(m.a_microgramos())
print(m.categoria())
print([Medicion(v).categoria() for v in registros_estaciones[1]["lecturas"]])
```

```text
8.4
Buena
['Dañina para grupos sensibles', 'Dañina para la salud', 'Dañina para grupos sensibles']
```

Punto a resaltar: proyectar lado a lado `convertir_a_microgramos(0.0084,
"mg/m3")` y `m.a_microgramos()`. En la segunda no se repiten datos: el método
lee `self.valor` y `self.unidad`. Señalar que `categoria()` funciona con una
lectura en mg/m³ porque llama a `a_microgramos()` (8.4 cae en "Buena"), y que
si el umbral cambia se corrige en `ESCALA_OFICIAL`, en un solo lugar. La
tercera línea recorre la estación Centro con una comprensión de listas, ya
vista en la Semana 4.

## Paso 4 — Validación con `ValueError` y el guion bajo

Ahora el objeto se cuida solo. Redefinir la clase con validación en `__init__`
y `_valor` / `_unidad` en lugar de `valor` / `unidad`:

```python
UNIDADES_VALIDAS = ("ug/m3", "mg/m3")


class Medicion:
    """Una lectura de PM2.5 que valida sus datos al crearse."""

    def __init__(self, valor, unidad="ug/m3", estacion="sin asignar"):
        # se valida ANTES de guardar: si algo falla, el objeto no llega a existir
        if valor < 0:
            raise ValueError(f"concentración negativa: {valor}")
        if unidad not in UNIDADES_VALIDAS:
            raise ValueError(f"unidad no reconocida: {unidad}")
        self._valor = valor    # guion bajo: atributo interno, usar los metodos
        self._unidad = unidad
        self.estacion = estacion

    def a_microgramos(self):
        """Devuelve la concentracion en ug/m3."""
        if self._unidad == "mg/m3":
            return self._valor * 1000
        return self._valor

    def categoria(self):
        """Clasifica la lectura segun la escala oficial."""
        concentracion = self.a_microgramos()
        for limite, nombre in ESCALA_OFICIAL:
            if concentracion <= limite:
                return nombre
        return "Dañina para la salud"
```

Ejecutar la celda de creación inválida y dejar que falle en vivo, sin
corregirla antes de mostrarla:

```python
Medicion(-5)
```

```text
ValueError: concentración negativa: -5
```

Repetir con la unidad inválida, en otra celda:

```python
Medicion(10, "kg")
```

```text
ValueError: unidad no reconocida: kg
```

Punto a resaltar: es el mismo dato del Paso 1, ahora rechazado en el lugar
donde nace, con un mensaje que dice qué salió mal. Cualquier `Medicion` que
exista pasó la validación.

Mostrar en vivo que el guion bajo es una convención y no un candado:

```python
m = Medicion(15.2)
print(m.a_microgramos(), m.categoria())

m._valor = -5   # Python lo permite: se salta la validacion
print(m.a_microgramos())
```

```text
15.2 Moderada
-5
```

Punto a resaltar: `_valor` le dice a quien lee "no lo toques desde afuera,
usa los métodos", pero Python no lo impide. La garantía se apoya en el acuerdo
entre quienes programan. Mencionar de pasada que existe `__valor` con doble
guion bajo y que basta con reconocerlo si aparece en código ajeno. No se
introduce nada más sobre acceso a atributos hoy.

## Paso 5 — `__repr__` y `__str__`

Agregar los dos métodos al final de la clase `Medicion` del Paso 4 y volver a
ejecutar la celda de la clase completa. Solo se muestran los métodos nuevos;
el resto de la clase queda igual:

```python
    def __repr__(self):
        """Devuelve la forma tecnica, para quien programa."""
        return f"Medicion(valor={self._valor}, unidad='{self._unidad}')"

    def __str__(self):
        """Devuelve la forma legible, para quien lee el resultado."""
        return f"{self.a_microgramos()} µg/m³ — {self.categoria()}"
```

```python
m = Medicion(15.2)
print(m)
print(repr(m))
print([m, Medicion(41.8)])
```

```text
15.2 µg/m³ — Moderada
Medicion(valor=15.2, unidad='ug/m3')
[Medicion(valor=15.2, unidad='ug/m3'), Medicion(valor=41.8, unidad='ug/m3')]
```

Punto a resaltar: cada método responde a un lector distinto. `print(m)` usa
`__str__` (para personas); la lista usa `__repr__` (para quien programa, y se
parece al código que crea el objeto). Volver a la celda del Paso 2 donde
`print(m)` mostraba la dirección de memoria y comparar. Si se define solo
`__repr__`, `print` también lo usa; si no se define ninguno, cae en el texto
genérico.

## Paso 6 — De una medición a una estación: objetos que contienen objetos

Definir la segunda clase, que guarda una lista de objetos `Medicion`:

```python
class Estacion:
    """Una estacion de la red con sus mediciones."""

    def __init__(self, codigo, sector):
        self.codigo = codigo
        self.sector = sector
        self._mediciones = []  # cada estacion arranca con su propia lista vacia

    def agregar(self, medicion):
        """Guarda una Medicion en la estacion."""
        self._mediciones.append(medicion)

    def promedio(self):
        """Devuelve el promedio en ug/m3 de sus mediciones."""
        if not self._mediciones:
            raise ValueError(f"{self.codigo} no tiene mediciones")
        total = 0
        for medicion in self._mediciones:
            # se le pide el valor convertido al objeto; no se toca _valor
            total += medicion.a_microgramos()
        return total / len(self._mediciones)

    def __repr__(self):
        """Devuelve la forma tecnica de la estacion."""
        return f"Estacion('{self.codigo}', '{self.sector}', mediciones={len(self._mediciones)})"
```

Probar primero con una estación sin lecturas y dejar que falle:

```python
vacia = Estacion("EST-09", "Este")
print(vacia)
vacia.promedio()
```

```text
Estacion('EST-09', 'Este', mediciones=0)
ValueError: EST-09 no tiene mediciones
```

Construir las tres estaciones reales desde `registros_estaciones`:

```python
estaciones = []
for registro in registros_estaciones:
    estacion = Estacion(registro["codigo"], registro["sector"])
    for valor in registro["lecturas"]:
        # cada lectura pasa por la validacion de Medicion al entrar
        estacion.agregar(Medicion(valor, estacion=registro["codigo"]))
    estaciones.append(estacion)

print(estaciones)
for estacion in estaciones:
    promedio = estacion.promedio()
    print(estacion.codigo, round(promedio, 1), Medicion(promedio).categoria())
```

```text
[Estacion('EST-01', 'Norte', mediciones=3), Estacion('EST-02', 'Centro', mediciones=3), Estacion('EST-03', 'Sur', mediciones=3)]
EST-01 12.1 Moderada
EST-02 45.4 Dañina para grupos sensibles
EST-03 10.3 Buena
```

Punto a resaltar: los resultados coinciden con los de la sesión de Funciones
(EST-01 12.1 Moderada, EST-02 45.4 Dañina para grupos sensibles, EST-03 10.3
Buena), pero ahora cada lectura llegó validada. Señalar que se reutilizó
`Medicion(promedio).categoria()` para clasificar el promedio, que las tres
estaciones se ven en una lista gracias a `__repr__`, y que el diccionario de
EST-03 traía una clave extra (`humedad_relativa`) que aquí simplemente no se
usa.

Demostrar que `Estacion` delega y no depende de la unidad:

```python
mixta = Estacion("EST-04", "Este")
mixta.agregar(Medicion(0.0084, "mg/m3"))   # 8.4 ug/m3
mixta.agregar(Medicion(15.2))              # ya en ug/m3
print(mixta.promedio())
print(estaciones[1]._mediciones[1])
```

```text
11.8
58.3 µg/m³ — Dañina para la salud
```

Punto a resaltar: una medición en mg/m³ y otra en µg/m³ conviven en la misma
estación porque `promedio()` le pide a cada objeto `a_microgramos()`. La
última línea usa `_mediciones` solo para lucir el `__str__` de una medición
guardada; hacerlo notar como acceso interno de demostración, no como práctica.
Cada clase se ocupa de lo suyo: eso es composición.

## Paso 7 — Cierre: de los diccionarios a los objetos

Celda final, sin código nuevo: volver a la del Paso 1 y ejecutar una vez más
`Medicion(-5)` para cerrar el círculo con el dato inválido con el que empezó
la sesión.

```python
Medicion(-5)
```

```text
ValueError: concentración negativa: -5
```

Punto a resaltar para cerrar: nombrar en voz alta lo construido hoy,
señalando cada pieza en pantalla — `__init__` y `self` para guardar datos,
métodos para que el objeto opere sobre sí mismo, `raise ValueError` para no
dejar existir objetos inválidos, `_valor` como convención de dato interno,
`__repr__` y `__str__` para inspeccionarlo, y `Estacion` que contiene objetos
`Medicion`. Conectar con lo que sigue: un arreglo de NumPy o una tabla de
Pandas son objetos, y `estacion.promedio()` se llama igual que los métodos que
se aplicarán a ellos.

## Preguntas socráticas

- **"Al escribir `Medicion(15.2)` solo paso un argumento, pero `__init__`
  tiene cuatro parámetros. ¿Dónde quedó `self`?"**
  Respuesta esperada: Python crea el objeto vacío y lo pasa solo como primer
  argumento; `self` es ese objeto. Los otros tres parámetros son los que
  escribimos, y dos tienen valor por defecto.

- **"Si `m = Medicion(15.2)` y `otra = Medicion(41.8)`, ¿por qué cambiar
  `m._valor` no altera a `otra`?"**
  Respuesta esperada: porque `self` es distinto en cada objeto. Cada
  instancia guarda sus propios atributos; el molde solo describe qué atributos
  existen.

- **"Si `_valor` no está protegido de verdad, ¿para qué sirve el guion
  bajo?"**
  Respuesta esperada: es una señal a quien lee el código: este dato es
  interno y se usa a través de los métodos. La validación de `__init__` solo
  protege mientras todos respetemos el acuerdo; Python confía en quien
  programa.

- **"¿Qué pasaría si `Estacion.promedio()` sumara `medicion._valor` en lugar
  de llamar a `a_microgramos()`?"**
  Respuesta esperada: en la estación `mixta` sumaría 0.0084 con 15.2 sin
  convertir, y el promedio sería incorrecto. Delegar en el método hace que la
  conversión de unidades viva en un solo lugar, dentro de `Medicion`.

- **"¿Por qué `print(estaciones)` muestra `Estacion('EST-01', ...)` y no la
  dirección de memoria?"**
  Respuesta esperada: la lista muestra cada elemento con `__repr__`, y
  `Estacion` lo define. Sin `__repr__` mostraría el texto genérico con la
  dirección.
