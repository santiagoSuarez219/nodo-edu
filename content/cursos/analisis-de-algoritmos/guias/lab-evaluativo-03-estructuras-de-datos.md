---
title: "Laboratorio evaluativo 03 — Estructuras de datos"
updatedAt: "2026-10-24"
---

# Laboratorio evaluativo 03 — Estructuras de datos

> **Evaluación:** este laboratorio es el **Laboratorio 3 (15 %)** de la nota del curso. Se inicia de forma guiada en la sesión del lunes 26 de octubre y se entrega como informe en GitHub, en la carpeta `lab3-estructuras-datos/` de su repositorio del curso, **a más tardar el sábado 31 de octubre**.

## Objetivo

Rediseñar un sistema de consulta que se volvió lento, reemplazando una lista enlazada por una tabla hash propia, y demostrar con sus propios datos cuánto mejora, por qué mejora y dónde la tabla hash deja de ser la herramienta adecuada.

Competencias esperadas:
- Implementar una lista enlazada y una tabla hash con encadenamiento, resolviendo correctamente las colisiones.
- Verificar que ambas estructuras responden lo mismo ante los mismos datos, incluidos los casos en que la clave no existe.
- Medir y graficar con `matplotlib` el tiempo de búsqueda frente al tamaño de la colección y frente al factor de carga.
- Contrastar lo medido con la complejidad teórica `Θ(n)` y `Θ(1 + α)`, y explicar el supuesto que sostiene la segunda.
- Explicar el manejo de colisiones y decidir, con argumentos, cuándo conviene una tabla hash y cuándo un árbol de búsqueda binario.

## Requisitos Previos

Debe dominar el contenido de las lecciones:
- **"Pilas, colas y listas enlazadas"**: listas enlazadas, costo de buscar e insertar.
- **"Tablas hash"**: función hash, encadenamiento, direccionamiento abierto y factor de carga.
- **"Árboles de búsqueda binarios"**: propiedad, búsqueda, inserción, recorrido en orden, altura y degeneración.

Además necesita, de los laboratorios anteriores del curso:
- Su repositorio del curso vinculado a GitHub, con commits descriptivos y frecuentes.
- El entorno virtual de la raíz del repositorio activado, con `matplotlib` instalado y registrado en `requirements.txt`.

## La situación problema

**Rutas del Caribe — empresa de mensajería.**

Rutas del Caribe mantiene unos **400.000 envíos activos**. Cada envío tiene un **número de guía** (un entero único de diez dígitos) y un **estado** (por ejemplo, `"en bodega"` o `"en reparto"`). La plataforma, escrita cuando la empresa movía unos pocos miles de envíos, guarda los envíos en una **lista enlazada**: cada guía nueva se agrega al inicio.

El call center atiende a los clientes que preguntan por el estado de su envío: el operador digita el número de guía y la plataforma recorre la lista hasta encontrarlo. Con el crecimiento de la empresa, en hora pico los operadores esperan varios segundos por cada consulta y los clientes cuelgan. Además, muchas consultas son por guías que **no existen** (números mal digitados), y esas obligan a recorrer la lista completa.

El área de operaciones tiene dos necesidades más:
- **Consulta puntual:** el estado de una guía, el caso del call center.
- **Monitoreo por rango:** un supervisor pide a diario "todas las guías entre el número X y el número Y", para revisar los lotes de una ruta.

La jefa de operaciones le pide un concepto técnico: **¿qué estructura debe reemplazar a la lista enlazada, y sirve para las dos necesidades?** Una serie de ejemplo, con pocas guías:

```text
guía:    1000000010   1000000024   1000000017   1000000005
estado:  en bodega    en reparto   en bodega    entregado
```

## Desarrollo del Laboratorio

El laboratorio tiene **tres partes**: implementar y verificar, medir y graficar, y analizar. Escriba las respuestas del análisis **con sus propias palabras**: una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente.

### Parte 1 — Implementar y verificar las dos estructuras

Implemente en `estructuras.py` las dos clases siguientes, respetando firmas y *docstrings*.

```python
"""Lista enlazada y tabla hash para consultar guias de envio."""


class Nodo:
    """Nodo de una lista enlazada que guarda una guia y su estado."""

    def __init__(self, guia: int, estado: str) -> None:
        """Crea un nodo sin siguiente.

        Args:
            guia: numero de guia del envio.
            estado: estado actual del envio.
        """
        self.guia = guia
        self.estado = estado
        self.siguiente: Nodo | None = None


class ListaEnlazada:
    """Lista simplemente enlazada de guias, con insercion al inicio."""

    def __init__(self) -> None:
        """Crea una lista vacia."""
        self.cabeza: Nodo | None = None
        self.tamano = 0

    def insertar(self, guia: int, estado: str) -> None:
        """Agrega una guia al inicio de la lista.

        Args:
            guia: numero de guia del envio.
            estado: estado actual del envio.
        """
        # TODO: cree el nodo, enlacelo con la cabeza actual y actualice
        # la cabeza y el tamano. Debe costar Θ(1).

    def buscar(self, guia: int) -> str | None:
        """Busca una guia recorriendo la lista.

        Args:
            guia: numero de guia a buscar.

        Returns:
            El estado del envio, o None si la guia no existe.
        """
        # TODO: recorra desde la cabeza con un ciclo while (iterativo).


class TablaHash:
    """Tabla hash con encadenamiento y funcion hash por division."""

    def __init__(self, m: int) -> None:
        """Crea una tabla con m casillas vacias.

        Args:
            m: numero de casillas de la tabla.
        """
        self.m = m
        self.casillas: list[ListaEnlazada] = [ListaEnlazada() for _ in range(m)]
        self.tamano = 0

    def hash(self, guia: int) -> int:
        """Calcula la casilla de una guia con el metodo de la division.

        Args:
            guia: numero de guia.

        Returns:
            Un indice entre 0 y m - 1.
        """
        # TODO: h(k) = k mod m.

    def insertar(self, guia: int, estado: str) -> None:
        """Inserta una guia en la lista de su casilla.

        Args:
            guia: numero de guia del envio.
            estado: estado actual del envio.
        """
        # TODO: calcule la casilla y delegue en la lista de esa casilla.

    def buscar(self, guia: int) -> str | None:
        """Busca una guia recorriendo solo la lista de su casilla.

        Args:
            guia: numero de guia a buscar.

        Returns:
            El estado del envio, o None si la guia no existe.
        """
        # TODO: calcule la casilla y busque solo en su lista.

    def factor_carga(self) -> float:
        """Calcula el factor de carga de la tabla.

        Returns:
            El cociente entre guias almacenadas y casillas (n / m).
        """
        # TODO: devuelva n / m.
```

**Requisitos:**
- Las guías son enteros. Se asume que no se repiten; no hace falta manejar actualización de una guía existente.
- `ListaEnlazada.buscar` es **iterativa**: una versión recursiva falla con `RecursionError` en listas de miles de nodos.
- `TablaHash` **reutiliza** `ListaEnlazada` para cada casilla (encadenamiento); no use `dict`, `set` ni la función `hash()` de Python.
- Ninguna operación se resuelve recorriendo toda la colección salvo `ListaEnlazada.buscar`.
- Escriba en `pruebas.py` un script con `assert` que verifique, como mínimo:
  - una búsqueda exitosa y una **infructuosa** en la lista y en la tabla;
  - la **colisión forzada**: con `m = 7`, las guías `10`, `24` y `17` caen todas en la casilla 3; verifique que las tres se pueden insertar y buscar después, y que la lista de esa casilla tiene longitud 3;
  - que `factor_carga()` da `3 / 7` tras esas tres inserciones;
  - al menos **veinte colecciones aleatorias** en las que, para guías existentes y para guías inexistentes, la lista y la tabla devuelven lo mismo.

Ejemplo del estilo de prueba esperado:

```python
from estructuras import ListaEnlazada, TablaHash

tabla = TablaHash(7)
for guia in (10, 24, 17):
    tabla.insertar(guia, "en bodega")

assert tabla.buscar(24) == "en bodega"
assert tabla.buscar(99) is None
assert tabla.factor_carga() == 3 / 7
```

**Restricciones:**
- Cada estructura debe estar escrita por usted; no use bibliotecas que la resuelvan.
- El código sigue PEP 8, con *type hints* y *docstring* Google-style en cada función (las pruebas están exentas).

### Parte 2 — Medir y graficar

Implemente en `medicion.py` los dos experimentos y sus gráficas.

**Experimento A — Lista frente a tabla.** Mida el tiempo de **búsqueda** en ambas estructuras para al menos **seis tamaños de colección**, que incluyan al menos dos menores de 1.000 y uno de 20.000 o más (por ejemplo: 100, 500, 1000, 5000, 20000, 50000). Para cada tamaño, la tabla usa `m` primo cercano a `n / 2`, de modo que `α` quede alrededor de 2.

- En cada tamaño ejecute **200 búsquedas de guías que no existen** y calcule el tiempo medio por búsqueda: es el caso que más duele a los operadores.
- Produzca la gráfica `graficas/lista_vs_tabla.png`: tiempo medio por búsqueda frente a `n`, **ambas curvas en los mismos ejes**, con título, etiquetas en ambos ejes con sus unidades y leyenda.

**Experimento B — Efecto del factor de carga.** Con `n` fijo (por ejemplo, 20.000 guías), construya varias tablas con distinto `m` para que `α` tome al menos **cinco valores** entre 0,25 y 10, y mida el tiempo medio de búsqueda de guías inexistentes en cada una.

- Produzca la gráfica `graficas/tiempo_vs_alfa.png`: tiempo medio por búsqueda frente a `α`, con título, ejes rotulados con unidades y leyenda si hay más de una serie.

**Requisitos:**
- Genere las guías con una **semilla fija** (enteros distintos de diez dígitos), de modo que el docente pueda reproducir sus mediciones. Use la misma colección para ambas estructuras en cada tamaño.
- Cronometre únicamente las búsquedas, con `time.perf_counter()`, nunca la construcción de las estructuras ni la generación de los datos.
- Verifique dentro del propio experimento que, para una muestra de guías existentes, la lista y la tabla devuelven el mismo estado.
- Una gráfica sin ejes rotulados no se califica.

**Restricciones:**
- No use tamaños tan grandes que la lista tarde más de un par de minutos en una medición; el objetivo es ver la forma de las curvas.
- No concluya con la teoría: lo que diga en la Parte 3 debe poder leerse en sus propias gráficas.

### Parte 3 — Análisis en el `README.md`

Responda, con sus palabras, las cinco preguntas siguientes. Entre todas, no pase de **700 palabras**.

1. **Costo teórico.** Justifique por qué buscar en la lista enlazada cuesta `Θ(n)` para una guía inexistente, y por qué buscar en la tabla con encadenamiento cuesta en promedio `Θ(1 + α)`. Diga qué supuesto sobre la función hash sostiene ese resultado y qué le pasaría a la tabla si todas las guías cayeran en la misma casilla.
2. **Lo medido contra lo esperado.** A partir de su primera gráfica, tome dos tamaños consecutivos en los que `n` crezca y calcule cuánto se multiplicó el tiempo de cada estructura; diga si coincide con `Θ(n)` y con `Θ(1)`. Con su segunda gráfica, describa cómo cambia el tiempo cuando `α` crece y si es coherente con `Θ(1 + α)`.
3. **Explique las colisiones.** Explique qué es una colisión y por qué ocurre aunque la tabla tenga más casillas que guías. Describa cómo la resuelven el encadenamiento y el direccionamiento abierto, y diga qué ventaja y qué costo tiene cada uno. Use la colisión de las guías `10`, `24` y `17` con `m = 7` como ejemplo.
4. **Tabla hash o árbol de búsqueda.** Para el monitoreo por rango ("guías entre X y Y"), ¿sirve la tabla hash? Justifique. Explique qué ofrece un árbol de búsqueda binario para esa consulta, y qué pasaría si las 400.000 guías llegaran ya ordenadas y se insertaran una a una: estime la altura resultante y el número aproximado de comparaciones, y compare con el caso de un árbol equilibrado.
5. **Concepto para la jefa de operaciones.** Recomiende una estructura (o una combinación) para cubrir las dos necesidades. Estime, a partir de su medición, cuánto tardaría una búsqueda de una guía inexistente en cada estructura con **5.000.000** de envíos. Declare que es una **estimación** y explique el razonamiento (no use una regla de tres sin justificar la forma de la curva).

## Entregable

```
curso-analisis-algoritmos/
└── lab3-estructuras-datos/
    ├── README.md
    ├── estructuras.py
    ├── pruebas.py
    ├── medicion.py
    └── graficas/
        ├── lista_vs_tabla.png
        └── tiempo_vs_alfa.png
```

El `README.md` es el informe completo y **el único documento que se califica como texto**. Debe contener, en este orden:

1. Su nombre completo y las instrucciones para reproducir el experimento (cómo activar el entorno y qué comando ejecutar para las pruebas y para la medición).
2. **Parte 1** — breve descripción de cómo verificó las estructuras y qué casos cubrió.
3. **Parte 2** — las dos gráficas incrustadas y una nota sobre cómo midió (por ejemplo, cuántas repeticiones hizo y qué `m` usó en cada tamaño).
4. **Parte 3** — las cinco respuestas del análisis.

**Cada parte práctica debe enlazar su código**: al inicio de la Parte 1 incluya un enlace en Markdown a `estructuras.py` y a `pruebas.py`, y al inicio de la Parte 2 un enlace a `medicion.py`, apuntando a los archivos dentro del repositorio. Un informe que describe resultados sin enlazar el código que los produjo pierde el criterio de documentación.

Las gráficas se incrustan con la sintaxis de imagen de Markdown y **ruta relativa** a la ubicación del `README.md`; no basta con dejarlas en la carpeta.

Haga `push` a su repositorio en la rama `main` antes del cierre del plazo (sábado 31 de octubre). Se califica lo que esté publicado en GitHub en ese momento.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 20 | Las preguntas 3, 4 y 5 de la Parte 3 responden lo que se pregunta: explican la colisión y comparan encadenamiento con direccionamiento abierto, justifican por qué la tabla no sirve para rangos y estiman la altura y las comparaciones del árbol degenerado frente al equilibrado, y recomiendan una estructura con una estimación a 5.000.000 de envíos declarada como estimación. |
| **Calidad de la explicación teórica** | 20 | La pregunta 1 justifica el `Θ(n)` de la lista y el `Θ(1 + α)` de la tabla, nombra el supuesto de hash uniforme y explica qué ocurre si todas las claves caen en una casilla. |
| **Corrección de la implementación** | 25 | Las dos estructuras devuelven el estado correcto en búsquedas exitosas e infructuosas; la colisión forzada con `m = 7` funciona; `factor_carga` es correcto; lista y tabla coinciden en al menos veinte colecciones aleatorias; la tabla reutiliza la lista sin usar `dict`, `set` ni `hash()`; el código cumple PEP 8, con *type hints* y *docstring* Google-style. |
| **Calidad del análisis de las gráficas** | 25 | Ambas gráficas existen, con título, ejes rotulados con unidades y leyenda; la primera cubre al menos seis tamaños con ambas curvas en los mismos ejes y la segunda al menos cinco valores de `α`; la pregunta 2 calcula factores de crecimiento y los contrasta con `Θ(n)`, `Θ(1)` y `Θ(1 + α)`; las afirmaciones de desempeño se apoyan en valores leídos de las gráficas. |
| **Documentación y organización del informe** | 10 | El repositorio tiene la estructura de carpetas exacta del entregable, el `README.md` sigue el orden pedido con las gráficas visibles en GitHub, cada parte práctica enlaza su código, hay instrucciones de reproducción y existen al menos tres commits descriptivos. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así: `nota_curso = (puntos / 100) x 15 %`. Por ejemplo, 80 puntos equivalen a `0,80 x 15 % = 12 %` de la nota del curso.

## Dificultades Comunes

### "Mi tabla hash no es más rápida que la lista"

- Revise que la tabla tenga muchas más casillas que una sola: con `m = 1` toda guía cae en la misma casilla y la tabla es una lista. Revise también que `buscar` recorra solo la lista de la casilla calculada, y no todas.

### "Mis búsquedas fallan con `RecursionError`"

- Una búsqueda recursiva en una lista de miles de nodos supera el límite de recursión de Python. Escriba `buscar` con un ciclo `while` que avance de nodo en nodo.

### "La colisión forzada no me da la casilla 3"

- Compruebe que `hash` calcula `guia % m` y que está probando con `m = 7`: `10 % 7`, `24 % 7` y `17 % 7` dan 3. Si usa otro `m`, las guías no colisionan y la prueba no demuestra nada.

### "Mis tiempos varían mucho entre ejecuciones"

- Es ruido del sistema operativo, normal cuando se miden microsegundos. Mida muchas búsquedas y promedie, repita cada medición unas tres veces y cierre otras aplicaciones mientras mide. Si lo hace, dígalo en el informe.

### "La curva de la tabla se ve plana y la de la lista se pega al eje"

- Es una lectura legítima: la tabla cuesta `Θ(1)` y la lista `Θ(n)`. Para ver la tabla por separado puede agregar una segunda gráfica con escala logarítmica, o una tabla en el `README.md` con los valores medidos.

### "Mis gráficas no se ven en el `README.md` de GitHub"

- La ruta de la imagen debe ser relativa a la ubicación del `README.md`, y la carpeta `graficas/` debe estar efectivamente subida al repositorio. Verifique en la vista web de GitHub, no solo en su editor local: es ahí donde se califica.

## Recursos

- **Lecciones del curso:** "Pilas, colas y listas enlazadas", "Tablas hash" y "Árboles de búsqueda binarios".
- **Libro de texto:** Cormen et al., *Introduction to Algorithms*, capítulos 10 (listas enlazadas), 11 (tablas hash) y 12 (árboles de búsqueda binarios).
- **Documentación:** `time.perf_counter()` en la biblioteca estándar de Python y `matplotlib.pyplot.plot`.

**Plazo de entrega:** sábado 31 de octubre.
