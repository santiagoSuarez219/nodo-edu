---
title: "Laboratorio evaluativo 02 — Dividir y vencer"
updatedAt: "2026-10-03"
---

# Laboratorio evaluativo 02 — Dividir y vencer

> **Evaluación:** este laboratorio es el **Momento evaluativo 2 (Dividir y vencer)** y corresponde al **Laboratorio 2 (15 %)** de la nota del curso. Se entrega como informe en GitHub, en la carpeta `lab2-divide-y-vencer/` de su repositorio del curso.

## Objetivo

Resolver un problema real con dos algoritmos —uno de fuerza bruta y uno de divide y vencerás—, medir cuánto tarda cada uno y demostrar con sus propios datos cuál conviene y por qué. El problema es el del **subarreglo máximo**, visto en clase.

Competencias esperadas:
- Implementar el subarreglo máximo por fuerza bruta y por divide y vencerás, resolviendo correctamente el caso cruzado.
- Verificar que ambas soluciones coinciden con casos de prueba de resultado conocido.
- Medir y graficar con `matplotlib` el tiempo de ejecución de ambos algoritmos frente al tamaño de entrada.
- Contrastar lo medido con la complejidad teórica `Θ(n²)` y `Θ(n log n)`, y explicar cuándo conviene dividir un problema.

## Requisitos Previos

Debe dominar el contenido de las lecciones:
- **"Cómo resolver recurrencias"**: planteamiento de la recurrencia y método maestro.
- **"Subarreglo máximo y Strassen"**: fuerza bruta, división en tres casos (izquierdo, derecho y cruzado) y su recurrencia.
- **"Síntesis del paradigma de divide y vencerás"**: el esquema dividir, conquistar y combinar, y el criterio que decide cuándo dividir aporta algo.

Además necesita, de los laboratorios anteriores del curso:
- Su repositorio del curso vinculado a GitHub, con commits descriptivos y frecuentes.
- El entorno virtual de la raíz del repositorio activado, con `matplotlib` instalado y registrado en `requirements.txt`.

## La situación problema

**Cooperativa de tiendas de barrio.**

Una cooperativa agrupa 1.500 tiendas de barrio. Cada tienda registra, al cierre de cada día, su **variación de caja**: lo que ganó o perdió ese día respecto al día anterior, en miles de pesos (puede ser negativa). La gerente financiera quiere saber, para cada tienda, cuál fue su **mejor racha**: el tramo de días consecutivos cuya variación acumulada es la mayor de todo el historial. Esa racha le sirve para entender qué promoción o temporada le funcionó mejor a cada tienda.

Una serie de ejemplo, de ocho días:

```text
día:        1    2    3    4    5    6    7    8
variación: -3   +5   -2   +8   -6   +3   +9   -4
```

La mejor racha va del día 2 al día 7 y suma `+17`; es más que la suma de toda la serie (`+10`).

El historial de una tienda tiene unos 2.000 días, pero el equipo de datos planea analizar también series de sensores con cientos de miles de registros. Por eso la gerente pide un concepto técnico: **¿qué algoritmo debe usarse para encontrar la mejor racha, y por qué?**

## Desarrollo del Laboratorio

El laboratorio tiene **tres partes**: implementar y verificar, medir y graficar, y analizar. Escriba las respuestas del análisis **con sus propias palabras**: una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente.

### Parte 1 — Implementar y verificar las dos soluciones

Implemente en `subarreglo.py` las tres funciones siguientes, respetando firmas y *docstrings*.

```python
"""Subarreglo maximo: fuerza bruta y divide y venceras."""


def subarreglo_fuerza_bruta(valores: list[float]) -> tuple[int, int, float]:
    """Encuentra la mejor racha probando todos los pares de dias (i, j).

    Args:
        valores: variacion diaria de caja, una por dia. Tiene al menos
            un elemento.

    Returns:
        Una tupla (inicio, fin, suma) con los indices inclusivos del
        tramo de mayor suma y el valor de esa suma.
    """
    # TODO: implemente la solucion en Θ(n²): acumule la suma dentro del
    # ciclo en vez de recalcularla desde cero para cada par.


def suma_cruzada(
    valores: list[float], inicio: int, medio: int, fin: int
) -> tuple[int, int, float]:
    """Encuentra el mejor tramo que cruza el punto medio.

    Args:
        valores: variacion diaria de caja.
        inicio: indice inicial del rango considerado (inclusive).
        medio: indice del ultimo elemento de la mitad izquierda.
        fin: indice final del rango considerado (inclusive).

    Returns:
        Una tupla (inicio, fin, suma) del mejor tramo que incluye al
        menos un elemento de cada mitad.
    """
    # TODO: barrido lineal desde el punto medio hacia cada lado.


def subarreglo_maximo(
    valores: list[float], inicio: int, fin: int
) -> tuple[int, int, float]:
    """Encuentra la mejor racha por divide y venceras.

    Args:
        valores: variacion diaria de caja.
        inicio: indice inicial del rango a considerar (inclusive).
        fin: indice final del rango a considerar (inclusive).

    Returns:
        Una tupla (inicio, fin, suma) del mejor tramo dentro de
        valores[inicio..fin].
    """
    # TODO: caso base, dos llamadas recursivas, caso cruzado y combinar.
```

**Requisitos:**
- `subarreglo_maximo` debe resolver los **tres casos** (izquierdo, derecho y cruzado) y devolver el mejor de los tres. No puede llamar a `subarreglo_fuerza_bruta`.
- Ninguna función modifica la lista recibida.
- Si hay varios tramos con la misma suma máxima, cualquiera es válido: sus pruebas deben comparar la **suma**, no los índices.
- Escriba en `pruebas.py` un script con `assert` que verifique, como mínimo: la serie de ocho días de la situación problema (suma `17`), una serie de un solo elemento, una serie con todos los valores negativos, una serie con todos los valores positivos, un caso donde el mejor tramo **cruza** el punto medio, y al menos **veinte listas aleatorias** en las que ambas funciones deben dar la misma suma.

Ejemplo del estilo de prueba esperado:

```python
from subarreglo import subarreglo_fuerza_bruta, subarreglo_maximo

serie = [-3, 5, -2, 8, -6, 3, 9, -4]
assert subarreglo_fuerza_bruta(serie)[2] == 17
assert subarreglo_maximo(serie, 0, len(serie) - 1)[2] == 17
```

**Restricciones:**
- No use `max()` sobre sumas de subarreglos generadas por comprensión, ni librerías externas que resuelvan el problema. Cada algoritmo debe estar escrito por usted.
- El código sigue PEP 8, con *type hints* y *docstring* Google-style en cada función (las pruebas están exentas).

### Parte 2 — Medir y graficar

Implemente en `medicion.py` el experimento y la gráfica.

**Requisitos:**
- Mida el tiempo de ejecución de **ambas** funciones para al menos **seis tamaños de entrada**, que incluyan al menos dos menores de 100 y uno de 4000 o más (por ejemplo: 10, 50, 100, 500, 1000, 4000, 8000).
- Genere los datos con una **semilla fija** (valores enteros entre -100 y 100), de modo que el docente pueda reproducir sus mediciones. Use la misma lista para ambos algoritmos en cada tamaño.
- Cronometre únicamente la llamada al algoritmo, con `time.perf_counter()`, nunca la generación de los datos.
- Produzca la gráfica `graficas/tiempo_vs_n.png`: tiempo vs. tamaño de entrada, **ambas curvas en los mismos ejes**, con **título, etiquetas en ambos ejes con sus unidades y leyenda**. Una gráfica sin ejes rotulados no se califica.
- Verifique dentro del propio experimento que, en cada tamaño, ambos algoritmos devuelven la misma suma.

**Restricciones:**
- No use tamaños tan grandes que la fuerza bruta tarde más de un par de minutos en una medición; el objetivo es ver la forma de las curvas.
- No concluya con la teoría: lo que diga en la Parte 3 debe poder leerse en su propia gráfica.

### Parte 3 — Análisis en el `README.md`

Responda, con sus palabras, las cinco preguntas siguientes. Entre todas, no pase de **700 palabras**.

1. **Recurrencia.** Plantee la recurrencia de su `subarreglo_maximo` explicando de dónde sale cada término (cuántos subproblemas, de qué tamaño, qué cuesta el caso cruzado) y resuélvala con el método maestro, verificando la condición del caso que aplica. Explique también por qué la fuerza bruta de la Parte 1 es `Θ(n²)`.
2. **Lo medido contra lo esperado.** A partir de su gráfica, describa qué hace cada curva cuando el tamaño de entrada crece. Tome dos tamaños consecutivos en los que `n` se duplique y calcule cuánto se multiplicó el tiempo de cada algoritmo; diga si coincide con lo que predicen `Θ(n²)` y `Θ(n log n)`.
3. **Tamaños pequeños.** Diga si en sus mediciones hay un tamaño a partir del cual divide y vencerás empieza a ganar. Si no lo hay en su rango, o si la ventaja aparece más tarde de lo que esperaba, explique por qué.
4. **¿Cuándo conviene dividir?** Compare con un problema distinto: hallar el máximo de un arreglo de `n` números. ¿Mejora dividirlo a la mitad frente a recorrerlo una vez? Justifique con el costo de combinar y la recurrencia resultante.
5. **Concepto para la gerente.** Recomiende un algoritmo para la cooperativa y estime, a partir de su medición, cuánto tardaría cada uno con una serie de 1.000.000 de registros. Declare que es una **estimación** y explique el razonamiento (no use una regla de tres lineal).

## Entregable

```
curso-analisis-algoritmos/
└── lab2-divide-y-vencer/
    ├── README.md
    ├── subarreglo.py
    ├── pruebas.py
    ├── medicion.py
    └── graficas/
        └── tiempo_vs_n.png
```

El `README.md` es el informe completo y **el único documento que se califica como texto**. Debe contener, en este orden:

1. Su nombre completo y las instrucciones para reproducir el experimento (cómo activar el entorno y qué comando ejecutar para las pruebas y para la medición).
2. **Parte 1** — breve descripción de cómo verificó las soluciones y qué casos cubrió.
3. **Parte 2** — la gráfica incrustada y una nota sobre cómo midió (por ejemplo, si repitió cada medición).
4. **Parte 3** — las cinco respuestas del análisis.

**Cada parte práctica debe enlazar su código**: al inicio de la Parte 1 incluya un enlace en Markdown a `subarreglo.py` y a `pruebas.py`, y al inicio de la Parte 2 un enlace a `medicion.py`, apuntando a los archivos dentro del repositorio. Un informe que describe resultados sin enlazar el código que los produjo pierde el criterio de documentación.

La gráfica se incrusta con la sintaxis de imagen de Markdown y **ruta relativa** a la ubicación del `README.md`; no basta con dejarla en la carpeta.

Haga `push` a su repositorio en la rama `main` antes del cierre del plazo. Se califica lo que esté publicado en GitHub en ese momento.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 20 | Las preguntas 3, 4 y 5 de la Parte 3 responden lo que se pregunta: identifican el tamaño desde el cual divide y vencerás gana (o explican por qué no aparece en su rango), comparan con el máximo de un arreglo justificando con el costo de combinar, y recomiendan un algoritmo con una estimación a 1.000.000 de registros declarada como estimación. |
| **Calidad de la explicación teórica** | 20 | La pregunta 1 plantea la recurrencia explicando cada término, la resuelve con el método maestro verificando la condición del caso, y justifica el `Θ(n²)` de la fuerza bruta. |
| **Corrección de la implementación** | 25 | Las tres funciones devuelven la suma correcta en la serie de ocho días, en el caso de un elemento, con todos los valores negativos, con todos positivos y en un caso cruzado; coinciden entre sí en al menos veinte listas aleatorias; `subarreglo_maximo` resuelve los tres casos sin llamar a la fuerza bruta; el código cumple PEP 8, con *type hints* y *docstring* Google-style. |
| **Calidad del análisis de las gráficas** | 25 | La gráfica existe, con ambas curvas en los mismos ejes, título, ejes rotulados con unidades y leyenda; cubre al menos seis tamaños; la pregunta 2 calcula el factor de crecimiento al duplicar `n` para cada algoritmo y lo contrasta con `Θ(n²)` y `Θ(n log n)`; las afirmaciones de desempeño se apoyan en valores leídos de la gráfica. |
| **Documentación y organización del informe** | 10 | El repositorio tiene la estructura de carpetas exacta del entregable, el `README.md` sigue el orden pedido con la gráfica visible en GitHub, cada parte práctica enlaza su código, hay instrucciones de reproducción y existen al menos tres commits descriptivos. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así: `nota_curso = (puntos / 100) x 15 %`. Por ejemplo, 80 puntos equivalen a `0,80 x 15 % = 12 %` de la nota del curso.

## Dificultades Comunes

### "Mi divide y vencerás da una suma menor que la fuerza bruta"

- Casi siempre es el caso cruzado. Verifique que el barrido hacia la izquierda parte **del punto medio** y que el de la derecha parte de `medio + 1`, y que el tramo cruzado incluye al menos un elemento de cada lado. Pruebe con una lista pequeña donde el mejor tramo cruce el centro, como la serie de ocho días.

### "Mi recursión no termina o da un índice fuera de rango"

- Revise el caso base: cuando `inicio` es igual a `fin`, el único tramo posible es ese elemento y no debe haber más llamadas. Revise también que las mitades sean `inicio..medio` y `medio + 1..fin`, sin traslape.

### "Mis tiempos varían mucho entre ejecuciones"

- Es ruido del sistema operativo, normal cuando se miden milisegundos. Repita cada medición unas tres veces y grafique el promedio o la mediana, y cierre otras aplicaciones mientras mide. Si lo hace, dígalo en el informe.

### "En la gráfica solo veo una curva o no distingo los tamaños pequeños"

- Con la fuerza bruta en tamaños grandes, la curva de divide y vencerás queda pegada al eje horizontal en escala lineal. Es una lectura legítima, pero puede agregar una segunda gráfica con escala logarítmica en ambos ejes, o una tabla en el `README.md` con los valores medidos, para analizar los tamaños pequeños.

### "Mis gráficas no se ven en el `README.md` de GitHub"

- La ruta de la imagen debe ser relativa a la ubicación del `README.md`, y la carpeta `graficas/` debe estar efectivamente subida al repositorio. Verifique en la vista web de GitHub, no solo en su editor local: es ahí donde se califica.

## Recursos

- **Lecciones del curso:** "Subarreglo máximo y Strassen" y "Síntesis del paradigma de divide y vencerás".
- **Libro de texto:** Cormen et al., *Introduction to Algorithms*, capítulo 4 (Divide y vencerás).
- **Documentación:** `time.perf_counter()` en la biblioteca estándar de Python y `matplotlib.pyplot.plot`.

**Plazo de entrega:** domingo 11 de octubre.
