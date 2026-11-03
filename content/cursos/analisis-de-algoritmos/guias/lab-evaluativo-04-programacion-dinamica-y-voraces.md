---
title: "Laboratorio evaluativo 04 — Programación dinámica y algoritmos voraces"
updatedAt: "2026-11-02"
---

# Laboratorio evaluativo 04 — Programación dinámica y algoritmos voraces

> **Evaluación:** este laboratorio es el **Laboratorio 4 (15 %)** de la nota del curso y es la parte del proyecto final que usa programación dinámica o estrategia voraz: cada equipo resuelve la **operación de su caso que admite programación dinámica o estrategia voraz** (la operación 4 en el Caso 1 y la operación 3 en los Casos 2 y 3), que es obligatoria. Se entrega **en equipo** (máximo 4 integrantes) **dentro del repositorio y del informe del proyecto final**, **a más tardar el miércoles 18 de noviembre de 2026**: todo lo que produzca aquí es parte del proyecto, no un documento aparte. Todos los integrantes reciben la misma nota; el aporte de cada uno se evidencia con el historial de commits.

## Objetivo

Resolver la operación de programación dinámica o voraz del caso de su proyecto con la estrategia que el problema admite (programación dinámica o estrategia voraz), demostrar con un contraejemplo calculado por qué falla la regla que usa hoy la organización, y medir con datos sintéticos cuánto mejora la solución, qué costaría en el volumen real del caso y cuánta energía consumiría.

Competencias esperadas:
- Reconocer en un problema real la subestructura óptima y los subproblemas traslapados, o la propiedad de elección voraz, y justificar la estrategia elegida.
- Plantear la recurrencia (o el criterio de elección) y calcular la complejidad temporal y espacial de la estrategia y del enfoque exhaustivo.
- Implementar la estrategia, la solución exhaustiva y la regla actual de la organización, y verificar que la estrategia coincide con la exhaustiva en instancias pequeñas.
- Medir y graficar con `matplotlib` el tiempo y el número de operaciones frente al tamaño de la entrada, y contrastar lo medido con la complejidad esperada.
- Extrapolar la medición al volumen real del caso, compararla con la ventana operativa del cliente y estimar el consumo de energía.

## Requisitos Previos

Debe dominar el contenido de las lecciones:
- **"Fundamentos de programación dinámica"** (estudio autónomo): subestructura óptima, subproblemas traslapados, memoización y tabulación, reconstrucción de la solución óptima y la receta para plantear una programación dinámica.
- **"Estrategia voraz"** (estudio autónomo): selección de actividades, búsqueda exhaustiva, reglas voraces que fallan y cómo encontrar sus contraejemplos, propiedad de elección voraz, verificación y medición.
- **"Programación dinámica: decidir, verificar y medir"** (estudio autónomo): contraejemplos de reglas voraces, verificación con una solución exhaustiva y medición.
- La guía complementaria de **su caso**, publicada junto a este laboratorio:
  - **Caso 1:** "Complemento del Laboratorio 4 — Cubrir días con pases".
  - **Caso 2,** solo si elige maximizar los pacientes atendidos: "Complemento del Laboratorio 4 — Intervalos ponderados".
  - **Caso 3:** "Complemento del Laboratorio 4 — Mochila 0/1".

Además necesita:
- El repositorio del equipo del proyecto, con todos los integrantes como colaboradores y el entorno virtual con `matplotlib` registrado en `requirements.txt`.
- El texto de su caso de estudio (la operación de este laboratorio, cifras del cliente y restricciones del negocio).

El patrón que necesita cada caso está resuelto completo, con escenarios distintos a los de los casos: cubrir días con pases (Caso 1) y la mochila 0/1 (Caso 3) en sus guías complementarias; la selección de actividades (Caso 2) en la lección "Estrategia voraz", y los intervalos ponderados, si el equipo del Caso 2 elige ese criterio, en su guía complementaria. **Ese material no resuelve su caso:** adaptar el patrón a las reglas exactas de su organización (productos, unidades, restricciones, la regla que se usa hoy) es parte del trabajo y de lo que se califica.

## La situación problema

La operación de este laboratorio tiene la misma forma en los tres casos: hay una regla que la organización usa hoy y que no es óptima, y una estrategia algorítmica que sí lo es. Su trabajo es demostrarlo, medirlo y recomendarlo. Trabaje **únicamente su caso**.

**Caso 1 — Recaudo del transporte: liquidación del tope tarifario (operación 4).**
Al cierre de cada mes, a ningún usuario con tarjeta personalizada se le puede haber cobrado más que la combinación más barata de pasajes y pases que cubra todos sus viajes del mes; la diferencia se devuelve como saldo en la tarjeta. Los productos del perfil general son: pasaje sencillo de 3.900 pesos (un viaje), pase diario de 9.500 pesos (viajes ilimitados en un día calendario), pase semanal de 36.000 pesos (7 días consecutivos) y pase mensual de 135.000 pesos (30 días consecutivos). La entrada es la serie de viajes por día del mes de una tarjeta. El programa actual explora todas las combinaciones posibles de pases; como no termina para las tarjetas que viajan muchos días, a esas se les aplica una regla simplificada: cada día se cobra lo más barato entre los pasajes sencillos y el pase diario, y se aplica el pase semanal o mensual si la suma ya lo supera. Atención al Usuario recibe quejas porque esa regla, en algunos meses, cobra más que el mínimo. Volumen real: cerca de 950.000 tarjetas usadas al menos una vez al mes, en la ventana de 4 horas (00:00 a 04:00) de la noche de cierre de mes, en un servidor de unos 500 W. Restricción: la devolución debe ser exactamente la diferencia frente a la combinación más barata, ni un peso de menos para el usuario ni un peso de más para el sistema. Estrategia esperada: programación dinámica sobre los días del mes, explicada con un problema análogo en la guía "Complemento del Laboratorio 4 — Cubrir días con pases".

**Caso 2 — Plataforma Pulso: programación de las jornadas de las unidades móviles (operación 3).**
Cada una de las 9 subregiones tiene **una** unidad móvil de valoración. Cada mes, los municipios solicitan jornadas; cada solicitud trae una hora de inicio, una hora de fin (incluido el desplazamiento) y el número de pacientes de alto riesgo pendientes en el municipio. La unidad no puede estar en dos jornadas a la vez. Hoy el coordinador asigna por orden de llegada de las solicitudes y rechaza las que se cruzan con una ya aceptada; cada mes quedan sin atender municipios con muchos pacientes de alto riesgo. Volumen real: entre 40 y 120 solicitudes por mes en cada subregión, en un servidor de unos 380 W. Restricción: la programación de una unidad nunca puede tener dos jornadas que se crucen. Estrategia esperada: selección de actividades voraz. **Elija qué criterio implementa:** maximizar el **número de jornadas** (voraz) o maximizar los **pacientes de alto riesgo atendidos** (programación dinámica de intervalos ponderados, explicada en la guía "Complemento del Laboratorio 4 — Intervalos ponderados"). Ambas opciones son válidas si justifica en el `README.md` por qué eligió ese criterio y la estrategia es correcta para él. Quién debe tomar esa decisión en la Secretaría es una de las preguntas de impacto del proyecto: se responde en el informe del 23 de noviembre, no en este laboratorio.

**Caso 3 — Banco de alimentos: cargue de los vehículos (operación 3).**
Cada vehículo tiene una capacidad máxima en kilogramos. Para cada ruta hay un conjunto de lotes candidatos, cada uno con su peso (entero, en kilogramos) y su valor nutricional (raciones ponderadas por la prioridad de la categoría). Hay que escoger qué lotes suben para que el valor nutricional transportado sea el máximo sin superar la capacidad; un lote no se fracciona: sube completo o no sube. Hoy el coordinador carga por orden de vencimiento hasta que ya no cabe el siguiente lote, y los vehículos salen, en promedio, al 78 % de su capacidad. Volumen real: 14 vehículos con capacidades entre 2.500 y 4.000 kg, y entre 300 y 600 lotes candidatos por ruta, dentro de la ventana de planeación de 2 horas (03:00 a 05:00) que comparten las operaciones 1 a 3, en un computador de unos 150 W. Restricción: ningún vehículo supera su capacidad y el valor cargado es el **máximo**, no una aproximación. Estrategia esperada: mochila 0/1 por programación dinámica, explicada en la guía "Complemento del Laboratorio 4 — Mochila 0/1". Como segundo contraste, la variante voraz que ordena los lotes por **densidad** (valor por kilogramo) es una regla tentadora que **no garantiza el óptimo**: debe incluirla y mostrarlo.

El texto completo de su caso es el instrumento que le entregó el docente: allí están las demás operaciones, que no son objeto de este laboratorio.

## Desarrollo del Laboratorio

El laboratorio tiene **cuatro partes**: modelar y resolver a mano, implementar y verificar, medir y graficar, y analizar. **Todo se escribe directamente en el informe del proyecto**: el `README.md` de la raíz del repositorio del equipo, con los apartados que exige el enunciado del proyecto final. Cada parte indica en qué apartado va. El 23 de noviembre el equipo completa ese mismo informe con la otra operación y los apartados que faltan; nada de lo que haga aquí se reescribe.

Escriba **con las palabras del equipo**: una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente.

### Parte 1 — Modelar y resolver a mano

Antes de programar, deje por escrito en el informe (apartados **Análisis del problema** y **Diseño de la solución**, en la parte de esta operación):

1. **Entradas, salida y restricciones** de la operación, con las unidades y los límites que informa el caso.
2. **Por qué el problema admite la estrategia elegida.** Si es programación dinámica, identifique la subestructura óptima y los subproblemas que se repiten. Si es voraz, enuncie la propiedad de elección voraz y por qué la elección no necesita reconsiderarse. Apóyese en un ejemplo pequeño (entre 4 y 8 elementos) **resuelto a mano**, paso a paso: es la "representación equivalente" que el proyecto pide para explicar cómo funciona cada propuesta.
3. **Un contraejemplo calculado** (va en **Análisis comparativo**, como limitación de la estrategia actual) que muestre por qué falla la regla que usa hoy la organización (Caso 1: la regla de pasaje diario y pases; Caso 2: la asignación por orden de llegada; Caso 3: cargar por orden de vencimiento y, además, por densidad). Entregue la instancia, el resultado de la regla, el resultado óptimo y la diferencia.
4. **La condición contraria** (va en **Análisis comparativo**, como parte de la justificación de la estrategia recomendada). Diga qué tendría que cambiar en el problema para que la otra familia de estrategias (voraz si eligió programación dinámica, y viceversa) fuera la adecuada.

### Parte 2 — Implementar y verificar

Implemente los módulos siguientes en una carpeta **de la operación** dentro de `src/` del repositorio del proyecto: `src/tope_tarifario/` (Caso 1), `src/jornadas_unidades/` (Caso 2) o `src/cargue_vehiculos/` (Caso 3). Así, la otra operación del proyecto tendrá su propia carpeta junto a esta y el código no se mueve ni se copia después. Respete firmas y *docstrings*. Los esqueletos son el **mínimo**: puede agregar funciones auxiliares, pero no cambiar lo que devuelven estas. Use solo el esqueleto de **su** caso.

Módulos de la carpeta de la operación (los mismos nombres en los tres casos):
- `estrategia.py`: la estrategia (programación dinámica o voraz).
- `exhaustivo.py`: la solución que prueba todas las combinaciones; en el proyecto es la solución exacta con la que se verifica la estrategia.
- `regla_actual.py`: la regla que usa hoy la organización; en el proyecto es la línea base del proceso actual.
- `datos.py`: el generador de instancias sintéticas con semilla fija.
- `pruebas.py`: las pruebas con `assert`.
- `medicion.py`: los experimentos y las gráficas.

**Esqueleto del Caso 1 — tope tarifario.**

```python
"""Liquidación del tope tarifario de una tarjeta."""

PASAJE = 3900
DIARIO = 9500
SEMANAL = 36000
MENSUAL = 135000


def costo_minimo(viajes_por_dia: list[int]) -> int:
    """Calcula el costo de la combinación más barata que cubre los viajes.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada día del mes. El índice 0
            es el primer día; un día sin viajes vale 0.

    Returns:
        El costo mínimo en pesos.
    """
    # TODO: programación dinámica sobre los días del mes.


def costo_exhaustivo(viajes_por_dia: list[int]) -> int:
    """Calcula el mismo costo probando todas las combinaciones de productos.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada día del mes.

    Returns:
        El costo mínimo en pesos.
    """
    # TODO: solo para instancias pequeñas; su costo es exponencial.


def costo_regla_actual(viajes_por_dia: list[int]) -> int:
    """Calcula lo que cobra hoy la regla simplificada del sistema.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada día del mes.

    Returns:
        El costo cobrado en pesos.
    """
    # TODO: documente en el README cómo interpretó la regla del caso.


def liquidar_tope(viajes_por_dia: list[int], cobrado: int) -> int:
    """Calcula la devolución que corresponde al usuario.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada día del mes.
        cobrado: pesos que se le cobraron durante el mes.

    Returns:
        La diferencia entre lo cobrado y el costo mínimo, nunca negativa.
    """
    # TODO: use costo_minimo.
```

**Esqueleto del Caso 2 — jornadas de la unidad móvil.**

```python
"""Programación de las jornadas de una unidad móvil."""

# (inicio, fin, pacientes_alto_riesgo); inicio y fin en minutos.
Jornada = tuple[int, int, int]


def seleccionar_jornadas(solicitudes: list[Jornada]) -> list[Jornada]:
    """Elige las jornadas que atiende la unidad, sin cruces.

    Args:
        solicitudes: solicitudes del mes de una subregión.

    Returns:
        Las jornadas elegidas, ordenadas por hora de inicio. Optimiza el
        criterio que el equipo declaró en el README.
    """
    # TODO: estrategia voraz (o programación dinámica si el criterio es el
    # número de pacientes de alto riesgo).


def seleccionar_exhaustivo(solicitudes: list[Jornada]) -> list[Jornada]:
    """Elige el mejor subconjunto sin cruces probando todos los subconjuntos.

    Args:
        solicitudes: solicitudes del mes de una subregión.

    Returns:
        Un subconjunto óptimo para el mismo criterio.
    """
    # TODO: solo para instancias pequeñas; su costo es exponencial.


def asignar_por_llegada(solicitudes: list[Jornada]) -> list[Jornada]:
    """Reproduce el procedimiento actual: orden de llegada, rechazando cruces.

    Args:
        solicitudes: solicitudes en el orden en que llegaron.

    Returns:
        Las jornadas aceptadas.
    """
    # TODO: acepte cada solicitud que no se cruce con una ya aceptada.


def hay_cruce(jornadas: list[Jornada]) -> bool:
    """Indica si alguna pareja de jornadas se cruza.

    Args:
        jornadas: jornadas a revisar.

    Returns:
        True si dos jornadas se cruzan; False en caso contrario.
    """
    # TODO: declare en el README si una jornada que empieza justo cuando
    # otra termina se considera cruce.
```

**Esqueleto del Caso 3 — cargue de los vehículos.**

```python
"""Cargue de un vehículo del banco de alimentos."""

Lote = tuple[int, int, int]  # (peso_kg, valor_nutricional, dias_para_vencer)


def cargar_vehiculo(
    lotes: list[Lote], capacidad_kg: int
) -> tuple[int, list[int]]:
    """Elige los lotes de mayor valor nutricional que caben en el vehículo.

    Args:
        lotes: lotes candidatos de la ruta; no se fraccionan.
        capacidad_kg: capacidad máxima del vehículo en kilogramos.

    Returns:
        El valor nutricional máximo y los índices de los lotes cargados.
    """
    # TODO: programación dinámica (mochila 0/1) y reconstrucción de los lotes.


def cargar_exhaustivo(
    lotes: list[Lote], capacidad_kg: int
) -> tuple[int, list[int]]:
    """Calcula el mismo resultado probando todos los subconjuntos de lotes.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad máxima del vehículo en kilogramos.

    Returns:
        El valor nutricional máximo y los índices de los lotes cargados.
    """
    # TODO: solo para instancias pequeñas; su costo es exponencial.


def cargar_por_vencimiento(
    lotes: list[Lote], capacidad_kg: int
) -> tuple[int, list[int]]:
    """Reproduce el procedimiento actual: carga por vencimiento.

    Se detiene en el primer lote que ya no cabe.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad máxima del vehículo en kilogramos.

    Returns:
        El valor nutricional cargado y los índices de los lotes cargados.
    """
    # TODO: ordene por días para vencer y deje de cargar en el primer lote
    # que no cabe.


def cargar_por_densidad(
    lotes: list[Lote], capacidad_kg: int
) -> tuple[int, list[int]]:
    """Carga por mayor valor por kilogramo; no garantiza el óptimo.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad máxima del vehículo en kilogramos.

    Returns:
        El valor nutricional cargado y los índices de los lotes cargados.
    """
    # TODO: ordene por densidad y agregue cada lote que quepa, sin fraccionar.
```

**Requisitos:**
- La estrategia, la solución exhaustiva y la regla actual se escriben a mano en `src/`; no use bibliotecas que resuelvan el problema (por ejemplo, de optimización o de mochila).
- Escriba en `pruebas.py` un script con `assert` que verifique, como mínimo:
  - los **casos límite** del problema (entrada vacía, un solo elemento, el caso en que nada cabe o nada se cruza, el caso en que todo se cruza);
  - el ejemplo pequeño que **resolvió a mano** en la Parte 1, con el resultado que usted calculó;
  - al menos **veinte instancias aleatorias pequeñas** (generadas con semilla fija) en las que la estrategia y la solución exhaustiva obtienen el mismo valor óptimo;
  - la **restricción del negocio** de su caso (Caso 1: la devolución es exactamente la diferencia frente al mínimo; Caso 2: ninguna unidad tiene dos jornadas que se crucen; Caso 3: ningún vehículo supera su capacidad y ningún lote se fracciona);
  - la instancia donde la **regla actual da un resultado peor** que la estrategia, la misma del contraejemplo de la Parte 1.
- Documente en el informe, en **Análisis del problema → Supuestos**, cualquier supuesto de interpretación que haya tomado (por ejemplo, cómo trató un mes de 31 días o dos jornadas que se tocan en un extremo).

Ejemplo del estilo de prueba esperado (sirve para su caso con los nombres que correspondan):

```python
from estrategia import seleccionar_jornadas

assert seleccionar_jornadas([]) == []
assert seleccionar_jornadas([(60, 120, 5)]) == [(60, 120, 5)]
```

**Restricciones:**
- El código sigue PEP 8, con *type hints* y *docstring* Google-style en cada función (las funciones `def test_...` de pytest, si las usa, están exentas).
- La solución exhaustiva solo se ejecuta con tamaños pequeños; su único fin es validar la estrategia y medir el contraste.

### Parte 3 — Medir y graficar

Implemente en `medicion.py` los experimentos y las gráficas, con datos **sintéticos** generados en `datos.py`, representativos de la estructura que describe el caso. **No se pide procesar el volumen real:** se mide en tamaños crecientes y se extrapola.

- Mida el tiempo de la estrategia y de la solución exhaustiva para al menos **seis tamaños de entrada**, dentro de lo que la solución exhaustiva alcanza a ejecutar. Incluya al menos una pareja de tamaños donde el segundo sea el **doble** del primero. El tamaño es: Caso 1, los días `d` del periodo, con viajes en todos o casi todos los días, de modo que los días con viaje crezcan con `d` (la estrategia recorre todos los días del periodo, con o sin viajes; la exhaustiva crece con los días con viaje, así que para ella use periodos cortos); Caso 2, el número de solicitudes; Caso 3, el número de lotes candidatos.
- Mida también la **regla actual**, para ver si su costo difiere de verdad del de la estrategia o solo su resultado.
- Para tamaños donde la solución exhaustiva ya no puede ejecutarse, mida solo la estrategia y llévela hasta tamaños mucho mayores: son los que sostienen la extrapolación.
- Cuente además las **operaciones elementales** (comparaciones, celdas calculadas o combinaciones exploradas, según el caso) con un contador propio, para contrastarlas con el tiempo.
- **Caso 3, adicionalmente:** repita la medición de la estrategia con el número de lotes fijo y la capacidad `W` creciente, para mostrar que su costo depende de `W` y no solo del número de lotes.
- Produzca la gráfica `graficas/<operacion>/tiempo_vs_n.png` (con el mismo nombre de carpeta de la operación que usó en `src/`): tiempo medio frente al tamaño, con la **estrategia y el enfoque exhaustivo en los mismos ejes**, con título, ejes rotulados con unidades y leyenda.
- Produzca la gráfica `graficas/<operacion>/operaciones_vs_n.png`, con el mismo criterio, para el número de operaciones.
- Caso 3: produzca además `graficas/cargue_vehiculos/tiempo_vs_capacidad.png`.

**Requisitos:**
- Genere los datos con una **semilla fija**, de modo que el docente pueda reproducir sus mediciones, y use las mismas instancias para todas las soluciones en cada tamaño.
- Cronometre únicamente la ejecución de cada solución, con `time.perf_counter()`, nunca la generación de los datos.
- Verifique dentro del propio experimento que la estrategia y la exhaustiva dan el mismo valor en los tamaños donde ambas corren.
- Una gráfica sin ejes rotulados no se califica.

**Restricciones:**
- No use tamaños tan grandes que la solución exhaustiva tarde más de un par de minutos en una medición.
- No concluya con la teoría: lo que diga en la Parte 4 debe poder leerse en sus propias gráficas.

### Parte 4 — Análisis en el informe

Responda, con sus palabras, las cinco preguntas siguientes, cada una en el apartado del informe que se indica. Sea concreto: el informe completo del proyecto tiene una extensión sugerida de 10 a 15 páginas para todo, y esta operación es una parte.

1. **La recurrencia o el criterio** (apartado **Diseño de la solución**). Si usó programación dinámica, plantee la recurrencia y explique cada término, el caso base y el orden en que se llenan los subproblemas. Si usó estrategia voraz, enuncie el criterio de elección y justifique por qué no necesita reconsiderar lo elegido.
2. **Complejidad** (apartado **Evaluación del desempeño**). Calcule la complejidad **temporal y espacial** de la estrategia y del enfoque ingenuo o exhaustivo, y contrástelas. (Caso 1: `Θ(d)` frente a exponencial en los días con viaje; Caso 2: `Θ(n log n)` frente a `Θ(n·2ⁿ)`, o la que corresponda si optó por intervalos ponderados; Caso 3: `Θ(n·W)` frente a `Θ(n·2ⁿ)`, explicando que el costo depende de la capacidad `W` y no solo de `n`.)
3. **Lo medido contra lo esperado** (apartado **Evaluación del desempeño**: es el contraste explícito entre lo empírico y lo teórico que exige el proyecto). Con sus gráficas, tome la pareja de tamaños donde el segundo es el doble del primero y calcule cuánto se multiplicó el tiempo (y el número de operaciones) de cada solución; diga si coincide con la complejidad de la pregunta 2 y explique las diferencias.
4. **Escala real, ventana y energía** (apartados **Evaluación del desempeño** e **Implicaciones éticas, sociales y ambientales → Consumo energético**). Extrapole el tiempo de la estrategia, de la regla actual y de la solución exhaustiva al volumen real de su caso. Compare con la ventana operativa del cliente y diga si cabe. Estime el consumo de energía con la potencia del servidor que informa el caso, con la relación kWh = kW × h, para cada solución. Declare que son **estimaciones** y explique el razonamiento: no use una regla de tres sin justificar la forma de la curva, y diga en qué casos la solución exhaustiva sencillamente no terminaría. Si el caso no fija una ventana para esta operación, diga cuál toma como referencia y por qué. **Proyecte además la diferencia de consumo entre la regla actual y la estrategia a un año de operación**, como pide el proyecto.
5. **Recomendación** (apartado **Análisis comparativo**). Recomiende a la organización qué estrategia adoptar para esta operación, qué ganaría frente a lo que hace hoy y qué riesgo o límite debe conocer (por ejemplo, qué pasaría si el volumen o la capacidad crecieran).

## Entregable

Todo se entrega en el **repositorio del equipo del proyecto**, con la estructura que tendrá el 23 de noviembre:

```
repositorio-del-equipo/
├── README.md                    # informe técnico del proyecto
├── requirements.txt
├── src/
│   └── <operacion>/             # tope_tarifario, jornadas_unidades o cargue_vehiculos
│       ├── estrategia.py
│       ├── exhaustivo.py
│       ├── regla_actual.py
│       ├── datos.py
│       ├── pruebas.py
│       └── medicion.py
└── graficas/
    └── <operacion>/
        ├── tiempo_vs_n.png
        └── operaciones_vs_n.png
```

El Caso 3 agrega `graficas/cargue_vehiculos/tiempo_vs_capacidad.png`. La otra operación del proyecto irá, después, en su propia carpeta junto a esta.

El `README.md` es el **informe técnico del proyecto** y el único documento que se califica como texto. Para esta entrega debe tener **todos los apartados del enunciado del proyecto**, en su orden, con lo siguiente:

1. **Encabezado:** el nombre completo de los integrantes y el caso asignado.
2. **Análisis del problema:** entradas, salida, restricciones y supuestos **de esta operación** (Parte 1).
3. **Diseño de la solución:** la estrategia, por qué el problema la admite, el ejemplo resuelto a mano y la recurrencia o el criterio (Parte 1 y pregunta 1 de la Parte 4).
4. **Implementación:** enlaces en Markdown a `estrategia.py`, `exhaustivo.py`, `regla_actual.py` y `pruebas.py`, y las decisiones de implementación relevantes.
5. **Evaluación del desempeño:** la complejidad, cómo verificó las implementaciones y qué casos cubrió, enlaces a `datos.py` y `medicion.py`, las gráficas incrustadas con una nota sobre cómo midió (repeticiones, semilla y tamaños), lo medido contra lo esperado y la extrapolación al volumen real (Partes 2 y 3, preguntas 2 a 4).
6. **Análisis comparativo:** el contraejemplo de la regla actual, la condición contraria y la recomendación (Parte 1 y pregunta 5).
7. **Implicaciones éticas, sociales y ambientales:** por ahora, solo el **consumo energético** de esta operación: regla actual frente a estrategia y proyección a un año (pregunta 4).
8. **Conclusiones:** puede quedar marcado como pendiente.
9. **Sección final de reproducción:** cómo activar el entorno y qué comandos ejecutar para las pruebas y para la medición.

Los apartados o las partes de apartado que correspondan a la otra operación o al proceso completo se dejan con el título y la marca **"Pendiente para la entrega del 23 de noviembre"**. Un informe que describe resultados sin enlazar el código que los produjo pierde el criterio de documentación.

Las gráficas se incrustan con la sintaxis de imagen de Markdown y **ruta relativa** a la ubicación del `README.md`; no basta con dejarlas en la carpeta.

**Trabajo en equipo.** El historial del repositorio debe tener **al menos tres commits descriptivos y cada integrante debe aparecer en él** con su propia cuenta. Se califica por equipo, con la misma nota para todos, pero un integrante sin commits no puede acreditar su aporte.

Haga `push` a la rama `main` del repositorio del equipo antes del cierre del plazo (**miércoles 18 de noviembre de 2026**). Se califica lo que esté publicado en GitHub en ese momento, solo con la rúbrica de abajo. El 23 de noviembre el mismo repositorio, ya completo, se califica con la rúbrica institucional del proyecto.

## Del laboratorio al proyecto final

Este laboratorio adelanta, aproximadamente, **entre el 40 % y el 50 % del proyecto final** (es una estimación de referencia, no parte de la nota), y todo lo que produce queda ya en su lugar definitivo: el código en `src/`, las gráficas en `graficas/` y el texto en los apartados del informe. Entre esta entrega y la del proyecto, el lunes 23 de noviembre, hay solo cinco días: organice al equipo desde ahora.

**Lo que queda adelantado:**

- Una de las dos operaciones que exige el proyecto, completa: modelado, tres estrategias implementadas y verificadas (la propuesta, la exacta y la actual), complejidad, mediciones, gráficas, extrapolación, energía con proyección anual y recomendación.
- El requisito de que al menos una estrategia sea de dividir y vencer, voraz o programación dinámica fuera del ordenamiento.
- La estructura del repositorio y del informe, y el método de pruebas y de medición, que la segunda operación reutiliza tal cual.

**Lo que falta para el proyecto:**

1. **La segunda operación**, con al menos dos estrategias, implementación, verificación, mediciones y gráficas, en su propia carpeta de `src/` y `graficas/`. Suele apoyarse en lo trabajado en los laboratorios 2 y 3.
2. **El análisis del proceso completo:** las cuatro operaciones críticas, cuáles cuestan más y el costo energético del proceso actual como línea base.
3. **El diseño:** las estructuras de datos seleccionadas y diagramas o pseudocódigo de cada propuesta.
4. **La comparación entre las estrategias de las dos operaciones** y la justificación de la solución recomendada.
5. **El resto de las implicaciones éticas, sociales y ambientales:** las preguntas de impacto de su caso, el marco normativo con sus fuentes y el escenario de crecimiento. Este apartado pesa el 20 % de la rúbrica del proyecto.
6. **Las conclusiones y el PDF** con el mismo contenido del `README.md`.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 20 | El informe explica por qué el problema admite la estrategia elegida: identifica la subestructura óptima y los subproblemas traslapados (programación dinámica) o la propiedad de elección voraz (voraz) y los ilustra con un ejemplo pequeño resuelto a mano. Muestra con un **contraejemplo calculado** por qué falla la regla que usa hoy la organización (Caso 1: la regla simplificada de pasaje diario y pases; Caso 2: la asignación por orden de llegada; Caso 3: cargar por orden de vencimiento o por densidad de valor) y dice qué condición del problema haría adecuada a la otra familia de estrategias. |
| **Calidad de la explicación teórica** | 20 | Plantea la recurrencia de la programación dinámica y explica cada término, o el criterio de elección voraz con su justificación de por qué no necesita reconsiderar. Calcula la complejidad temporal y espacial de la estrategia y del enfoque ingenuo o exhaustivo, y las contrasta (Caso 1: Θ(d) frente a exponencial en los días con viaje; Caso 2: Θ(n log n) frente a Θ(n·2ⁿ); Caso 3: Θ(n·W) frente a Θ(n·2ⁿ), explicando que el costo depende de la capacidad W y no solo de n). |
| **Corrección de la implementación** | 25 | El código cumple el estándar del curso (PEP 8, *type hints* y *docstrings* en cada función). Devuelve el resultado correcto en casos pequeños resueltos a mano, en los casos límite del problema y en al menos veinte instancias aleatorias pequeñas donde coincide con la solución exhaustiva. Cumple las restricciones del negocio del caso (Caso 1: devuelve exactamente la diferencia frente a la combinación más barata; Caso 2: ninguna unidad móvil tiene dos jornadas que se crucen; Caso 3: ningún vehículo supera su capacidad, el valor es el máximo y ningún lote se fracciona). Implementa también la regla actual y muestra una instancia donde da un resultado peor. |
| **Calidad del análisis de las gráficas** | 25 | Existen las gráficas con título, ejes rotulados con unidades y leyenda, y la estrategia y el enfoque con el que se contrasta van en los mismos ejes. Cubren al menos seis tamaños de entrada, dentro de lo que el enfoque exhaustivo alcanza a ejecutar. El análisis calcula el factor de crecimiento al duplicar el tamaño y lo compara con el esperado por la complejidad. Extrapola el tiempo al volumen real del caso, lo compara con la ventana operativa del cliente, estima el consumo de energía con la potencia que informa el caso y proyecta a un año la diferencia entre la regla actual y la estrategia. |
| **Documentación y organización del informe** | 10 | El repositorio del proyecto tiene el `README.md` con los apartados del informe técnico del proyecto, en su orden, con esta operación completa en ellos y lo pendiente marcado; el código en `src/<operacion>/` y las gráficas en `graficas/<operacion>/`. El informe muestra las gráficas visibles en GitHub, enlaza el código y trae la sección final para reproducir los datos sintéticos y las mediciones. El historial tiene al menos tres commits y **cada integrante aparece** en él. Se entrega a más tardar el 18 de noviembre. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así: `nota_curso = (puntos / 100) x 15 %`. Por ejemplo, 80 puntos equivalen a `0,80 x 15 % = 12 %` de la nota del curso.

## Dificultades Comunes

### "Mi solución exhaustiva no termina"

- Su costo es exponencial: con 25 o 30 elementos ya tarda minutos u horas. Use esa solución solo con tamaños pequeños (hasta unas dos decenas de elementos) y corte los tamaños grandes; la caída de la curva exhaustiva es justamente lo que el experimento debe mostrar.

### "Mi estrategia no coincide con la exhaustiva en algunas instancias aleatorias"

- Es la mejor señal que puede darle una prueba: o la estrategia tiene un error, o el criterio que eligió no es correcto para el problema. Reduzca la instancia que falla hasta que tenga pocos elementos y resuélvala a mano; esa instancia suele ser su contraejemplo.

### "No sé si mi regla actual está bien interpretada"

- El texto del caso la describe en lenguaje natural y puede admitir más de una lectura. Elija una, escríbala en el `README.md` con un ejemplo y úsela de forma consistente en el código, en el contraejemplo y en las mediciones.

### "La extrapolación me da un tiempo absurdo"

- Revise las unidades (segundos, minutos, horas) y qué multiplica a qué: el tiempo de una instancia por el número de instancias del volumen real (tarjetas, subregiones o rutas). Si la solución exhaustiva da un tiempo mayor que la edad del universo, no lo oculte: es un resultado válido y debe decirlo.

### "Mis tiempos varían mucho entre ejecuciones"

- Es ruido del sistema operativo, normal cuando se miden milisegundos. Repita cada medición varias veces, promedie y cierre otras aplicaciones mientras mide. Si lo hace, dígalo en el informe.

### "Mis gráficas no se ven en el `README.md` de GitHub"

- La ruta de la imagen debe ser relativa a la ubicación del `README.md`, y la carpeta `graficas/` debe estar efectivamente subida al repositorio. Verifique en la vista web de GitHub, no solo en su editor local: es ahí donde se califica.

### "Solo un integrante aparece en el historial"

- Cada integrante debe hacer sus propios commits con su cuenta de GitHub, aunque trabajen juntos en una sola máquina. Configure `git config user.name` y `user.email` en cada equipo y distribuya el trabajo desde el principio, no en la última noche.

## Recursos

- **Lecciones del curso:** "Fundamentos de programación dinámica", "Estrategia voraz" y "Programación dinámica: decidir, verificar y medir".
- **Guías complementarias:** "Cubrir días con pases" (Caso 1), "Intervalos ponderados" (Caso 2, opcional) y "Mochila 0/1" (Caso 3).
- **Libro de texto:** Cormen et al., *Introduction to Algorithms*, 3.ª ed., capítulos 15 (programación dinámica) y 16 (algoritmos voraces).
- **Documentación:** `time.perf_counter()` en la biblioteca estándar de Python y `matplotlib.pyplot.plot`.

**Plazo de entrega:** miércoles 18 de noviembre de 2026.
