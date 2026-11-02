---
title: "Laboratorio evaluativo 04 — Programación dinámica y algoritmos voraces"
updatedAt: "2026-11-02"
---

# Laboratorio evaluativo 04 — Programación dinámica y algoritmos voraces

> **Evaluación:** este laboratorio es el **Laboratorio 4 (15 %)** de la nota del curso y es la parte del proyecto final que usa programación dinámica o estrategia voraz: cada equipo resuelve la **operación de su caso que admite programación dinámica o estrategia voraz** (la operación 4 en el Caso 1 y la operación 3 en los Casos 2 y 3), que es obligatoria. Se entrega **en equipo** (máximo 4 integrantes) como informe en GitHub, en la carpeta `lab4-pd-voraces/` del **repositorio del equipo del proyecto**, **a más tardar el miércoles 18 de noviembre de 2026**. Todos los integrantes reciben la misma nota; el aporte de cada uno se evidencia con el historial de commits.

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
- **"Fundamentos de programación dinámica"**: subestructura óptima, subproblemas traslapados, memoización y tabulación, y reconstrucción de la solución óptima.
- **"Estrategia voraz"**: selección de actividades, propiedad de elección voraz y por qué otras reglas fallan.

Además necesita:
- El repositorio del equipo del proyecto, con todos los integrantes como colaboradores y el entorno virtual con `matplotlib` registrado en `requirements.txt`.
- El texto de su caso de estudio (la operación de este laboratorio, cifras del cliente y restricciones del negocio).

Algunos de los problemas de este laboratorio **no se resuelven con un ejemplo de la lección**: la mochila 0/1, los intervalos ponderados o la cobertura de días con pases exigen que el equipo estudie el tema por su cuenta (Cormen et al., 3.ª ed., capítulos 15 y 16) y adapte el razonamiento visto en clase. Es parte del trabajo.

## La situación problema

La operación de este laboratorio tiene la misma forma en los tres casos: hay una regla que la organización usa hoy y que no es óptima, y una estrategia algorítmica que sí lo es. Su trabajo es demostrarlo, medirlo y recomendarlo. Trabaje **únicamente su caso**.

**Caso 1 — Recaudo del transporte: liquidación del tope tarifario (operación 4).**
Al cierre de cada mes, a ningún usuario con tarjeta personalizada se le puede haber cobrado más que la combinación más barata de pasajes y pases que cubra todos sus viajes del mes; la diferencia se devuelve como saldo en la tarjeta. Los productos del perfil general son: pasaje sencillo de 3.900 pesos (un viaje), pase diario de 9.500 pesos (viajes ilimitados en un día calendario), pase semanal de 36.000 pesos (7 días consecutivos) y pase mensual de 135.000 pesos (30 días consecutivos). La entrada es la serie de viajes por día del mes de una tarjeta. El programa actual explora todas las combinaciones posibles de pases; como no termina para las tarjetas que viajan muchos días, a esas se les aplica una regla simplificada: cada día se cobra lo más barato entre los pasajes sencillos y el pase diario, y se aplica el pase semanal o mensual si la suma ya lo supera. Atención al Usuario recibe quejas porque esa regla, en algunos meses, cobra más que el mínimo. Volumen real: cerca de 950.000 tarjetas usadas al menos una vez al mes, en la ventana de 4 horas (00:00 a 04:00) de la noche de cierre de mes, en un servidor de unos 500 W. Restricción: la devolución debe ser exactamente la diferencia frente a la combinación más barata, ni un peso de menos para el usuario ni un peso de más para el sistema. Estrategia esperada: programación dinámica sobre los días del mes.

**Caso 2 — Plataforma Pulso: programación de las jornadas de las unidades móviles (operación 3).**
Cada una de las 9 subregiones tiene **una** unidad móvil de valoración. Cada mes, los municipios solicitan jornadas; cada solicitud trae una hora de inicio, una hora de fin (incluido el desplazamiento) y el número de pacientes de alto riesgo pendientes en el municipio. La unidad no puede estar en dos jornadas a la vez. Hoy el coordinador asigna por orden de llegada de las solicitudes y rechaza las que se cruzan con una ya aceptada; cada mes quedan sin atender municipios con muchos pacientes de alto riesgo. Volumen real: entre 40 y 120 solicitudes por mes en cada subregión, en un servidor de unos 380 W. Restricción: la programación de una unidad nunca puede tener dos jornadas que se crucen. Estrategia esperada: selección de actividades voraz. **Elija qué criterio implementa:** maximizar el **número de jornadas** (voraz) o maximizar los **pacientes de alto riesgo atendidos** (programación dinámica de intervalos ponderados, tema de autoestudio). Ambas opciones son válidas si justifica en el `README.md` por qué eligió ese criterio y la estrategia es correcta para él. Quién debe tomar esa decisión en la Secretaría es una de las preguntas de impacto del proyecto: se responde en el informe del 23 de noviembre, no en este laboratorio.

**Caso 3 — Banco de alimentos: cargue de los vehículos (operación 3).**
Cada vehículo tiene una capacidad máxima en kilogramos. Para cada ruta hay un conjunto de lotes candidatos, cada uno con su peso (entero, en kilogramos) y su valor nutricional (raciones ponderadas por la prioridad de la categoría). Hay que escoger qué lotes suben para que el valor nutricional transportado sea el máximo sin superar la capacidad; un lote no se fracciona: sube completo o no sube. Hoy el coordinador carga por orden de vencimiento hasta que ya no cabe el siguiente lote, y los vehículos salen, en promedio, al 78 % de su capacidad. Volumen real: 14 vehículos con capacidades entre 2.500 y 4.000 kg, y entre 300 y 600 lotes candidatos por ruta, dentro de la ventana de planeación de 2 horas (03:00 a 05:00) que comparten las operaciones 1 a 3, en un computador de unos 150 W. Restricción: ningún vehículo supera su capacidad y el valor cargado es el **máximo**, no una aproximación. Estrategia esperada: mochila 0/1 por programación dinámica. Como segundo contraste, la variante voraz que ordena los lotes por **densidad** (valor por kilogramo) es una regla tentadora que **no garantiza el óptimo**: debe incluirla y mostrarlo.

El texto completo de su caso es el instrumento que le entregó el docente: allí están las demás operaciones, que no son objeto de este laboratorio.

## Desarrollo del Laboratorio

El laboratorio tiene **cuatro partes**: modelar y resolver a mano, implementar y verificar, medir y graficar, y analizar. Escriba el informe **con las palabras del equipo**: una respuesta copiada de la lección, del libro o de un asistente de inteligencia artificial se califica en cero en el criterio correspondiente.

### Parte 1 — Modelar y resolver a mano

Antes de programar, deje por escrito en el `README.md`:

1. **Entradas, salida y restricciones** de la operación, con las unidades y los límites que informa el caso.
2. **Por qué el problema admite la estrategia elegida.** Si es programación dinámica, identifique la subestructura óptima y los subproblemas que se repiten. Si es voraz, enuncie la propiedad de elección voraz y por qué la elección no necesita reconsiderarse. Apóyese en un ejemplo pequeño (entre 4 y 8 elementos) **resuelto a mano**, paso a paso.
3. **Un contraejemplo calculado** que muestre por qué falla la regla que usa hoy la organización (Caso 1: la regla de pasaje diario y pases; Caso 2: la asignación por orden de llegada; Caso 3: cargar por orden de vencimiento y, además, por densidad). Entregue la instancia, el resultado de la regla, el resultado óptimo y la diferencia.
4. **La condición contraria.** Diga qué tendría que cambiar en el problema para que la otra familia de estrategias (voraz si eligió programación dinámica, y viceversa) fuera la adecuada.

### Parte 2 — Implementar y verificar

Implemente en la carpeta `src/` los módulos siguientes, respetando firmas y *docstrings*. Los esqueletos son el **mínimo**: puede agregar funciones auxiliares, pero no cambiar lo que devuelven estas. Use solo el esqueleto de **su** caso.

Estructura de `src/` (nombres sugeridos, los mismos para los tres casos):
- `estrategia.py`: la estrategia (programación dinámica o voraz).
- `exhaustivo.py`: la solución que prueba todas las combinaciones.
- `regla_actual.py`: la regla que usa hoy la organización.
- `datos.py`: el generador de instancias sintéticas con semilla fija.
- `pruebas.py`: las pruebas con `assert`.
- `medicion.py`: los experimentos y las gráficas.

**Esqueleto del Caso 1 — tope tarifario.**

```python
"""Liquidacion del tope tarifario de una tarjeta."""

PASAJE = 3900
DIARIO = 9500
SEMANAL = 36000
MENSUAL = 135000


def costo_minimo(viajes_por_dia: list[int]) -> int:
    """Calcula el costo de la combinacion mas barata que cubre todos los viajes.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada dia del mes. El indice 0
            es el primer dia; un dia sin viajes vale 0.

    Returns:
        El costo minimo en pesos.
    """
    # TODO: programacion dinamica sobre los dias del mes.


def costo_exhaustivo(viajes_por_dia: list[int]) -> int:
    """Calcula el mismo costo probando todas las combinaciones de productos.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada dia del mes.

    Returns:
        El costo minimo en pesos.
    """
    # TODO: solo para instancias pequenas; su costo es exponencial.


def costo_regla_actual(viajes_por_dia: list[int]) -> int:
    """Calcula lo que cobra hoy la regla simplificada del sistema.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada dia del mes.

    Returns:
        El costo cobrado en pesos.
    """
    # TODO: documente en el README como interpreto la regla del caso.


def liquidar_tope(viajes_por_dia: list[int], cobrado: int) -> int:
    """Calcula la devolucion que corresponde al usuario.

    Args:
        viajes_por_dia: viajes de la tarjeta en cada dia del mes.
        cobrado: pesos que se le cobraron durante el mes.

    Returns:
        La diferencia entre lo cobrado y el costo minimo, nunca negativa.
    """
    # TODO: use costo_minimo.
```

**Esqueleto del Caso 2 — jornadas de la unidad móvil.**

```python
"""Programacion de las jornadas de una unidad movil."""

Jornada = tuple[int, int, int]  # (inicio, fin, pacientes_alto_riesgo), en minutos


def seleccionar_jornadas(solicitudes: list[Jornada]) -> list[Jornada]:
    """Elige las jornadas que atiende la unidad, sin cruces.

    Args:
        solicitudes: solicitudes del mes de una subregion.

    Returns:
        Las jornadas elegidas, ordenadas por hora de inicio. Optimiza el
        criterio que el equipo declaro en el README.
    """
    # TODO: estrategia voraz (o programacion dinamica si el criterio es el
    # numero de pacientes de alto riesgo).


def seleccionar_exhaustivo(solicitudes: list[Jornada]) -> list[Jornada]:
    """Elige el mejor subconjunto sin cruces probando todos los subconjuntos.

    Args:
        solicitudes: solicitudes del mes de una subregion.

    Returns:
        Un subconjunto optimo para el mismo criterio.
    """
    # TODO: solo para instancias pequenas; su costo es exponencial.


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
"""Cargue de un vehiculo del banco de alimentos."""

Lote = tuple[int, int, int]  # (peso_kg, valor_nutricional, dias_para_vencer)


def cargar_vehiculo(lotes: list[Lote], capacidad_kg: int) -> tuple[int, list[int]]:
    """Elige los lotes que maximizan el valor nutricional sin superar la capacidad.

    Args:
        lotes: lotes candidatos de la ruta; no se fraccionan.
        capacidad_kg: capacidad maxima del vehiculo en kilogramos.

    Returns:
        El valor nutricional maximo y los indices de los lotes cargados.
    """
    # TODO: programacion dinamica (mochila 0/1) y reconstruccion de los lotes.


def cargar_exhaustivo(lotes: list[Lote], capacidad_kg: int) -> tuple[int, list[int]]:
    """Calcula el mismo resultado probando todos los subconjuntos de lotes.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad maxima del vehiculo en kilogramos.

    Returns:
        El valor nutricional maximo y los indices de los lotes cargados.
    """
    # TODO: solo para instancias pequenas; su costo es exponencial.


def cargar_por_vencimiento(lotes: list[Lote], capacidad_kg: int) -> tuple[int, list[int]]:
    """Reproduce el procedimiento actual: por vencimiento hasta que no cabe el siguiente.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad maxima del vehiculo en kilogramos.

    Returns:
        El valor nutricional cargado y los indices de los lotes cargados.
    """
    # TODO: ordene por dias para vencer y deje de cargar en el primer lote
    # que no cabe.


def cargar_por_densidad(lotes: list[Lote], capacidad_kg: int) -> tuple[int, list[int]]:
    """Carga por mayor valor por kilogramo mientras quepa; no garantiza el optimo.

    Args:
        lotes: lotes candidatos de la ruta.
        capacidad_kg: capacidad maxima del vehiculo en kilogramos.

    Returns:
        El valor nutricional cargado y los indices de los lotes cargados.
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
- Documente en el `README.md` cualquier supuesto de interpretación que haya tomado (por ejemplo, cómo trató un mes de 31 días o dos jornadas que se tocan en un extremo).

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

- Mida el tiempo de la estrategia y de la solución exhaustiva para al menos **seis tamaños de entrada**, dentro de lo que la solución exhaustiva alcanza a ejecutar. Incluya al menos una pareja de tamaños donde el segundo sea el **doble** del primero. El tamaño es: Caso 1, los días con viaje de la tarjeta; Caso 2, el número de solicitudes; Caso 3, el número de lotes candidatos.
- Mida también la **regla actual**, para ver si su costo difiere de verdad del de la estrategia o solo su resultado.
- Para tamaños donde la solución exhaustiva ya no puede ejecutarse, mida solo la estrategia y llévela hasta tamaños mucho mayores: son los que sostienen la extrapolación.
- Cuente además las **operaciones elementales** (comparaciones, celdas calculadas o combinaciones exploradas, según el caso) con un contador propio, para contrastarlas con el tiempo.
- **Caso 3, adicionalmente:** repita la medición de la estrategia con el número de lotes fijo y la capacidad `W` creciente, para mostrar que su costo depende de `W` y no solo del número de lotes.
- Produzca la gráfica `graficas/tiempo_vs_n.png`: tiempo medio frente al tamaño, con la **estrategia y el enfoque exhaustivo en los mismos ejes**, con título, ejes rotulados con unidades y leyenda.
- Produzca la gráfica `graficas/operaciones_vs_n.png`, con el mismo criterio, para el número de operaciones.
- Caso 3: produzca además `graficas/tiempo_vs_capacidad.png`.

**Requisitos:**
- Genere los datos con una **semilla fija**, de modo que el docente pueda reproducir sus mediciones, y use las mismas instancias para todas las soluciones en cada tamaño.
- Cronometre únicamente la ejecución de cada solución, con `time.perf_counter()`, nunca la generación de los datos.
- Verifique dentro del propio experimento que la estrategia y la exhaustiva dan el mismo valor en los tamaños donde ambas corren.
- Una gráfica sin ejes rotulados no se califica.

**Restricciones:**
- No use tamaños tan grandes que la solución exhaustiva tarde más de un par de minutos en una medición.
- No concluya con la teoría: lo que diga en la Parte 4 debe poder leerse en sus propias gráficas.

### Parte 4 — Análisis en el `README.md`

Responda, con sus palabras, las cinco preguntas siguientes. Entre todas, no pase de **1.200 palabras**.

1. **La recurrencia o el criterio.** Si usó programación dinámica, plantee la recurrencia y explique cada término, el caso base y el orden en que se llenan los subproblemas. Si usó estrategia voraz, enuncie el criterio de elección y justifique por qué no necesita reconsiderar lo elegido.
2. **Complejidad.** Calcule la complejidad **temporal y espacial** de la estrategia y del enfoque ingenuo o exhaustivo, y contrástelas. (Caso 1: `Θ(d)` frente a exponencial en los días con viaje; Caso 2: `Θ(n log n)` frente a `Θ(2ⁿ)`, o la que corresponda si optó por intervalos ponderados; Caso 3: `Θ(n·W)` frente a `Θ(2ⁿ)`, explicando que el costo depende de la capacidad `W` y no solo de `n`.)
3. **Lo medido contra lo esperado.** Con sus gráficas, tome la pareja de tamaños donde el segundo es el doble del primero y calcule cuánto se multiplicó el tiempo (y el número de operaciones) de cada solución; diga si coincide con la complejidad de la pregunta 2 y explique las diferencias.
4. **Escala real, ventana y energía.** Extrapole el tiempo de la estrategia, de la regla actual y de la solución exhaustiva al volumen real de su caso. Compare con la ventana operativa del cliente y diga si cabe. Estime el consumo de energía con la potencia del servidor que informa el caso, con la relación kWh = kW × h, para cada solución. Declare que son **estimaciones** y explique el razonamiento: no use una regla de tres sin justificar la forma de la curva, y diga en qué casos la solución exhaustiva sencillamente no terminaría. Si el caso no fija una ventana para esta operación, diga cuál toma como referencia y por qué.
5. **Recomendación.** Recomiende a la organización qué estrategia adoptar para esta operación, qué ganaría frente a lo que hace hoy y qué riesgo o límite debe conocer (por ejemplo, qué pasaría si el volumen o la capacidad crecieran).

## Entregable

```
repositorio-del-equipo/
└── lab4-pd-voraces/
    ├── README.md
    ├── src/
    │   ├── estrategia.py
    │   ├── exhaustivo.py
    │   ├── regla_actual.py
    │   ├── datos.py
    │   ├── pruebas.py
    │   └── medicion.py
    └── graficas/
        ├── tiempo_vs_n.png
        └── operaciones_vs_n.png
```

El Caso 3 agrega `graficas/tiempo_vs_capacidad.png`. Las demás carpetas del repositorio del proyecto no forman parte de este laboratorio.

El `README.md` es el informe completo y **el único documento que se califica como texto**. Debe contener, en este orden:

1. El nombre completo de los integrantes, el caso asignado y las instrucciones para reproducir los datos sintéticos y las mediciones (cómo activar el entorno y qué comandos ejecutar para las pruebas y para la medición).
2. **Parte 1** — el modelado, el ejemplo resuelto a mano, el contraejemplo calculado y la condición contraria.
3. **Parte 2** — breve descripción de cómo verificó las implementaciones y qué casos cubrió.
4. **Parte 3** — las gráficas incrustadas y una nota sobre cómo midió (repeticiones, semilla y tamaños usados).
5. **Parte 4** — las cinco respuestas del análisis.

**Cada parte práctica debe enlazar su código**: al inicio de la Parte 2 incluya enlaces en Markdown a `estrategia.py`, `exhaustivo.py`, `regla_actual.py` y `pruebas.py`, y al inicio de la Parte 3 enlaces a `datos.py` y `medicion.py`, apuntando a los archivos dentro del repositorio. Un informe que describe resultados sin enlazar el código que los produjo pierde el criterio de documentación.

Las gráficas se incrustan con la sintaxis de imagen de Markdown y **ruta relativa** a la ubicación del `README.md`; no basta con dejarlas en la carpeta.

**Trabajo en equipo.** El historial del repositorio debe tener **al menos tres commits descriptivos y cada integrante debe aparecer en él** con su propia cuenta. Se califica por equipo, con la misma nota para todos, pero un integrante sin commits no puede acreditar su aporte.

Haga `push` a la rama `main` del repositorio del equipo antes del cierre del plazo (**miércoles 18 de noviembre de 2026**). Se califica lo que esté publicado en GitHub en ese momento. El resto del proyecto final se entrega por separado y se califica con su propia rúbrica; este laboratorio se califica solo con la de abajo.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 20 | El informe explica por qué el problema admite la estrategia elegida: identifica la subestructura óptima y los subproblemas traslapados (programación dinámica) o la propiedad de elección voraz (voraz) y los ilustra con un ejemplo pequeño resuelto a mano. Muestra con un **contraejemplo calculado** por qué falla la regla que usa hoy la organización (Caso 1: la regla simplificada de pasaje diario y pases; Caso 2: la asignación por orden de llegada; Caso 3: cargar por orden de vencimiento o por densidad de valor) y dice qué condición del problema haría adecuada a la otra familia de estrategias. |
| **Calidad de la explicación teórica** | 20 | Plantea la recurrencia de la programación dinámica y explica cada término, o el criterio de elección voraz con su justificación de por qué no necesita reconsiderar. Calcula la complejidad temporal y espacial de la estrategia y del enfoque ingenuo o exhaustivo, y las contrasta (Caso 1: Θ(d) frente a exponencial en los días con viaje; Caso 2: Θ(n log n) frente a Θ(2ⁿ); Caso 3: Θ(n·W) frente a Θ(2ⁿ), explicando que el costo depende de la capacidad W y no solo de n). |
| **Corrección de la implementación** | 25 | El código cumple el estándar del curso (PEP 8, *type hints* y *docstrings* en cada función). Devuelve el resultado correcto en casos pequeños resueltos a mano, en los casos límite del problema y en al menos veinte instancias aleatorias pequeñas donde coincide con la solución exhaustiva. Cumple las restricciones del negocio del caso (Caso 1: devuelve exactamente la diferencia frente a la combinación más barata; Caso 2: ninguna unidad móvil tiene dos jornadas que se crucen; Caso 3: ningún vehículo supera su capacidad, el valor es el máximo y ningún lote se fracciona). Implementa también la regla actual y muestra una instancia donde da un resultado peor. |
| **Calidad del análisis de las gráficas** | 25 | Existen las gráficas con título, ejes rotulados con unidades y leyenda, y la estrategia y el enfoque con el que se contrasta van en los mismos ejes. Cubren al menos seis tamaños de entrada, dentro de lo que el enfoque exhaustivo alcanza a ejecutar. El análisis calcula el factor de crecimiento al duplicar el tamaño y lo compara con el esperado por la complejidad. Extrapola el tiempo al volumen real del caso, lo compara con la ventana operativa del cliente y estima el consumo de energía con la potencia que informa el caso. |
| **Documentación y organización del informe** | 10 | La carpeta `lab4-pd-voraces/` tiene `README.md`, `src/` y `graficas/`. El `README.md` sigue el orden del enunciado, muestra las gráficas visibles en GitHub, enlaza el código de cada parte y trae instrucciones para reproducir los datos sintéticos y las mediciones. El historial tiene al menos tres commits y **cada integrante aparece** en él. Se entrega a más tardar el 18 de noviembre. |
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

- **Lecciones del curso:** "Fundamentos de programación dinámica" y "Estrategia voraz".
- **Libro de texto:** Cormen et al., *Introduction to Algorithms*, 3.ª ed., capítulos 15 (programación dinámica) y 16 (algoritmos voraces).
- **Documentación:** `time.perf_counter()` en la biblioteca estándar de Python y `matplotlib.pyplot.plot`.

**Plazo de entrega:** miércoles 18 de noviembre de 2026.
