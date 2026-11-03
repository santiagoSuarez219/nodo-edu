---
title: "Complemento del Laboratorio 4 — Cubrir días con pases"
updatedAt: "2026-11-02"
---

# Complemento del Laboratorio 4 — Cubrir días con pases

> 📘 **Material complementario de estudio autónomo.** Es **indispensable para los equipos del Caso 1 — Recaudo del transporte**, cuya liquidación del tope tarifario tiene la forma de este problema. También es la lectura recomendada para cualquier estudiante que quiera ver la receta de la programación dinámica aplicada, pregunta por pregunta, a un problema distinto del corte de varillas. Tenga abierto un editor de Python y ejecute cada bloque de código; cuando la guía haga una traza a mano, hágala primero en papel y después compare.

## Antes de empezar

Este complemento supone que ya estudió **"Fundamentos de programación dinámica"**, en especial la receta de siete preguntas. Como recordatorio:

| #   | Pregunta de la receta                                      |
| --- | ---------------------------------------------------------- |
| 1   | ¿Qué **decisión** se toma primero?                         |
| 2   | Después de decidir, ¿qué **queda**? Eso es el **estado**   |
| 3   | ¿Cuál es la **recurrencia**? (la mejor opción entre todas) |
| 4   | ¿Cuál es el **caso base**?                                 |
| 5   | ¿En qué **orden** se llena la tabla?                       |
| 6   | ¿Qué se guarda para **reconstruir** la solución?           |
| 7   | ¿Cuánto cuesta? **Estados × trabajo por estado**           |

El ejemplo es deliberadamente distinto del tope tarifario: bicicletas públicas durante 10 días de vacaciones. **El complemento no resuelve el Caso 1.** Traducir el patrón a los productos, las tarifas y los meses del sistema de transporte (y a la regla simplificada que se usa hoy) es parte del trabajo del equipo y de lo que se califica.

---

## El problema

Su ciudad tiene un sistema de bicicletas públicas. Usted va a pasar 10 días de vacaciones en ella y ya sabe cuántos viajes hará cada día. Los productos son:

| Producto          | Precio       | Cubre                                    |
| ----------------- | ------------ | ---------------------------------------- |
| Viaje suelto      | 2.000 pesos  | Un viaje                                 |
| Pase de un día    | 5.000 pesos  | Viajes ilimitados en un día              |
| Pase de tres días | 11.000 pesos | Viajes ilimitados en 3 días consecutivos |
| Pase semanal      | 20.000 pesos | Viajes ilimitados en 7 días consecutivos |

| Día    | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ------ | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Viajes | 2   | 3   | 3   | 0   | 1   | 0   | 2   | 0   | 0   | 1   |

¿Cuál es la combinación de productos más barata que cubre todos sus viajes?

Lo más natural es decidir **día por día**: cada día se paga lo más barato entre los viajes sueltos y el pase de un día. El día 1 hay 2 viajes: sueltos cuestan 2 × 2.000 = 4.000, menos que el pase de un día. El día 2 hay 3 viajes: sueltos cuestan 6.000, así que conviene el pase de un día, 5.000. Siguiendo así:

| Día       | 1     | 2     | 3     | 4   | 5     | 6   | 7     | 8   | 9   | 10    | Total      |
| --------- | ----- | ----- | ----- | --- | ----- | --- | ----- | --- | --- | ----- | ---------- |
| Día a día | 4.000 | 5.000 | 5.000 | 0   | 2.000 | 0   | 4.000 | 0   | 0   | 2.000 | **22.000** |

¿Se puede pagar menos? Mire los días 1 a 3: día por día cuestan 4.000 + 5.000 + 5.000 = 14.000, pero un solo pase de tres días los cubre por **11.000**. Con ese cambio el total baja a 22.000 − 14.000 + 11.000 = **19.000**.

Decidir día por día falló porque los pases de varios días **amarran decisiones de días distintos**: si el día 1 se compra el pase de tres días, los días 2 y 3 ya no se deciden, quedan pagados. Mirar un día a la vez no puede ver esa combinación. Y probar a mano todas las combinaciones no escala: cada día con viajes se puede cubrir de varias formas, y las formas se multiplican de un día al siguiente. Necesitamos la receta.

---

## Pases y varillas: el mismo problema con otro disfraz

Antes de aplicar la receta, observe por qué este problema se parece al corte de varillas. Imagine los 10 días como una cinta de 10 metros, donde **cada metro es un día**. Comprar un producto es **cortar un tramo** que empieza en el primer día que todavía no está pagado:

- pagar solo hoy (viajes sueltos o pase de un día) es cortar un tramo de **1 día**;
- el pase de tres días es cortar un tramo de **3 días**;
- el pase semanal es cortar un tramo de **7 días**.

Después de cortar, lo que sobra son los días siguientes: el mismo problema, con menos días. Es exactamente lo que pasaba con la cinta de la mercería.

|                         | Corte de varillas             | Bicicletas                                  |
| ----------------------- | ----------------------------- | ------------------------------------------- |
| Qué se reparte          | Los metros de la cinta        | Los días del periodo                        |
| La decisión             | Cuánto mide el primer tramo   | Qué producto compro el primer día sin pagar |
| Las opciones            | Cualquier longitud de 1 a `n` | Solo tres: 1 día, 3 días o 7 días           |
| Lo que vale la decisión | El precio del tramo (se gana) | El precio del producto (se paga)            |
| Lo que queda            | Una cinta más corta           | Los días que el producto no cubre           |
| Se busca                | El **máximo** ingreso         | El **mínimo** costo                         |

Hay solo dos diferencias de fondo: aquí se **minimiza** en vez de maximizar, y los días **sin viajes** no cuestan nada, así que se saltan.

---

## La receta, pregunta por pregunta

Ahora sí, las siete preguntas de la receta. Para no confundir índices, en toda esta explicación los días se cuentan del **1 al 10**, como en el calendario.

**1. ¿Qué decisión se toma primero?** Ubíquese en el **primer día que todavía no está pagado**; llámelo día `t`. Si ese día tiene viajes, hay que comprar algo que lo cubra. Como todos los días anteriores ya están pagados, solo tiene sentido comprar algo que **empiece hoy**. Hay tres opciones:

- **(a) Pagar solo hoy:** lo más barato entre los viajes sueltos y el pase de un día. Esta elección sí se puede hacer "a ojo", porque solo afecta al día `t`.
- **(b) Pase de tres días:** cubre los días `t`, `t + 1` y `t + 2`.
- **(c) Pase semanal:** cubre los días `t` a `t + 6`.

**2. Después de decidir, ¿qué queda? (el estado)** Queda pagar los días que el producto no cubrió. Fíjese qué se necesita saber para seguir decidiendo: **solo desde qué día falta pagar**. No importa qué se compró antes ni cuánto costó. Por eso el estado es un solo número, el día `t`, y se define:

> **C(t):** lo mínimo que se paga por todos los viajes del día `t` al día 10, sabiendo que hasta el día `t − 1` todo ya está pagado.

La respuesta del problema completo es `C(1)`: lo mínimo para pagar del día 1 al 10.

**3. ¿Cuál es la recurrencia?** Cada opción cuesta **lo que se paga hoy más lo mínimo para lo que queda**:

- (a) Pagar solo hoy: `min(viajes × 2.000, 5.000)`, y quedan los días desde `t + 1`. Total: `min(viajes × 2.000, 5.000) + C(t + 1)`.
- (b) Pase de tres días: 11.000, y quedan los días desde `t + 3`. Total: `11.000 + C(t + 3)`.
- (c) Pase semanal: 20.000, y quedan los días desde `t + 7`. Total: `20.000 + C(t + 7)`.

`C(t)` es la más barata de las tres. Si el día `t` **no tiene viajes**, no se compra nada y se pasa al día siguiente: `C(t) = C(t + 1)`. Escrito en una sola fórmula, para un día con `viajes_t` viajes:

```text
C(t) = el menor de:
    (a) min(viajes_t × 2000, 5000) + C(t + 1)    pagar solo hoy
    (b) 11000 + C(t + 3)                         pase de tres días
    (c) 20000 + C(t + 7)                         pase semanal
```

Lea la opción (b) con un caso concreto: "si el día 1 compro el pase de tres días, pago 11.000 y me quedan por pagar los días 4 a 10; lo mínimo para eso es `C(4)`". El argumento de cortar y pegar de la lección Fundamentos de programación dinámica dice por qué basta con `C(4)`: si los días 4 a 10 no se pagaran de la forma más barata, se cambiaría esa parte y el total bajaría.

**4. ¿Cuál es el caso base?** Cuando ya no quedan días, no hay nada que pagar: `C(11) = 0`. ¿Y si un pase **se sale** del periodo? Si el día 9 se compra el semanal, cubriría del 9 al 15, pero las vacaciones terminan el día 10. Lo que queda por pagar es nada, es decir, `C(11) = 0`. Por eso, cuando `t + 3` o `t + 7` pasa de 11, se usa 11. Comprar un pase que sobra no es un error: solo puede convenir si es más barato que las otras opciones.

**5. ¿En qué orden se llena la tabla?** Observe de qué depende `C(1)`: de `C(2)`, `C(4)` y `C(8)`, todos días **posteriores**. Para calcular `C(1)` hay que tener listos los días de después, así que la tabla se llena **de atrás hacia adelante**: primero `C(11)`, después `C(10)`, `C(9)`, …, y al final `C(1)`. En el corte de varillas era al revés (de la cinta corta a la larga) porque `r_n` dependía de longitudes **menores**. La regla es la misma en los dos: **se llenan primero las casillas de las que se depende**.

**6. ¿Qué se guarda para reconstruir?** Junto a cada `C(t)`, qué opción ganó ese día: `eleccion(t)`.

**7. ¿Cuánto cuesta?** Hay 10 estados (más el caso base) y cada uno compara 3 opciones: unas 30 comparaciones. En general, con `d` días y `k` productos, **Θ(d·k)**: si se duplican los días, se duplica el trabajo. Probar todas las combinaciones de productos, en cambio, crece de forma exponencial con los días con viaje.

---

## La tabla a mano, del día 10 al día 1

Antes de ver el código, llene la tabla en papel siguiendo el orden de la pregunta 5. En cada fila, calcule las tres opciones con los valores de `C` que **ya** tiene (los de las filas de arriba, que son días posteriores), y quédese con la menor. Compare con esta tabla al terminar:

| Día | Viajes | (a) Pagar solo hoy    | (b) Pase de tres días   | (c) Pase semanal        | C(día)     | Elección  |
| --- | ------ | --------------------- | ----------------------- | ----------------------- | ---------- | --------- |
| 11  | —      | —                     | —                       | —                       | 0          | caso base |
| 10  | 1      | 2.000 + C(11) = 2.000 | 11.000 + C(11) = 11.000 | 20.000 + C(11) = 20.000 | 2.000      | viajes    |
| 9   | 0      | sin viajes: C(10)     |                         |                         | 2.000      | nada      |
| 8   | 0      | sin viajes: C(9)      |                         |                         | 2.000      | nada      |
| 7   | 2      | 4.000 + C(8) = 6.000  | 11.000 + C(10) = 13.000 | 20.000 + C(11) = 20.000 | 6.000      | viajes    |
| 6   | 0      | sin viajes: C(7)      |                         |                         | 6.000      | nada      |
| 5   | 1      | 2.000 + C(6) = 8.000  | 11.000 + C(8) = 13.000  | 20.000 + C(11) = 20.000 | 8.000      | viajes    |
| 4   | 0      | sin viajes: C(5)      |                         |                         | 8.000      | nada      |
| 3   | 3      | 5.000 + C(4) = 13.000 | 11.000 + C(6) = 17.000  | 20.000 + C(10) = 22.000 | 13.000     | día       |
| 2   | 3      | 5.000 + C(3) = 18.000 | 11.000 + C(5) = 19.000  | 20.000 + C(9) = 22.000  | 18.000     | día       |
| 1   | 2      | 4.000 + C(2) = 22.000 | 11.000 + C(4) = 19.000  | 20.000 + C(8) = 22.000  | **19.000** | tres días |

Revise tres filas con calma:

- **Día 10:** es el último. Un viaje suelto (2.000) más `C(11) = 0` gana: cualquier pase sería pagar de más por un solo viaje.
- **Día 3:** 3 viajes sueltos costarían 6.000, así que en la opción (a) se usa el pase de un día, 5.000. Con `C(4) = 8.000` ya calculado, la opción (a) da 13.000. El pase de tres días (17.000) pierde: cubriría los días 3, 4 y 5, pero los días 4 y 5 juntos solo tienen un viaje.
- **Día 1:** aquí aparece el ahorro. Pagar solo hoy cuesta 4.000 + `C(2)` = 22.000. El pase de tres días cuesta 11.000 + `C(4)` = 11.000 + 8.000 = **19.000**. No hace falta volver a pensar los días 4 a 10: `C(4)` ya dice lo mínimo que cuestan.

Fíjese en algo que suele confundir: la fila del día 2 eligió "día", pero en la solución final **el día 2 no compra nada**, porque el pase de tres días del día 1 ya lo cubre. Cada fila guarda la mejor decisión **si el problema empezara ese día**. La tabla las calcula todas, pero la solución final solo usa las de los días en que de verdad hay que comprar.

---

## Reconstruir las compras

`C(1) = 19.000` dice cuánto pagar, no qué comprar. Para saberlo, se recorre la columna "Elección" **desde el día 1**, saltando los días que cada compra ya cubre:

1. **Día 1:** elección "tres días". Se compra el pase de tres días; cubre los días 1, 2 y 3. Se salta al **día 4**.
2. **Día 4:** "nada" (sin viajes). Se pasa al día 5.
3. **Día 5:** "viajes". Un viaje suelto. Se pasa al día 6.
4. **Día 6:** "nada". Se pasa al día 7.
5. **Día 7:** "viajes". Dos viajes sueltos. Se pasa al día 8.
6. **Días 8 y 9:** "nada".
7. **Día 10:** "viajes". Un viaje suelto. Se pasa al día 11: fin.

Compras: pase de tres días el día 1 (11.000), viaje suelto el día 5 (2.000), dos viajes sueltos el día 7 (4.000) y un viaje suelto el día 10 (2.000). Total: **19.000**, igual a `C(1)`, y 3.000 menos que decidir día por día. Las elecciones de los días 2 y 3 nunca se leen: el salto del paso 1 las pasa por encima.

---

## Las bicicletas en código

El código hace exactamente lo que usted hizo a mano. Para que coincida con la explicación, las listas `costo` y `eleccion` se indexan **por día, del 1 al 10**: `costo[t]` es `C(t)` y `costo[11]` es el caso base. La posición 0 no se usa. Los viajes llegan en una lista normal de Python, así que los del día `t` están en `viajes[t - 1]`.

```python
VIAJE: int = 2000
PASE_DIA: int = 5000
PASES: list[tuple[str, int, int]] = [
    ("tres_dias", 11000, 3),  # (nombre, precio, días que cubre)
    ("semana", 20000, 7),
]


def costo_bicicletas(viajes: list[int]) -> tuple[list[int], list[str]]:
    """Calcula el costo mínimo de cubrir todos los viajes del periodo.

    Args:
        viajes: Viajes de cada día; viajes[0] son los del día 1.

    Returns:
        Una pareja (costo, eleccion) indexada por día, del 1 al d:
        costo[t] es C(t), lo mínimo para pagar del día t al final, y
        eleccion[t] es lo que se compra el día t ("nada" si no hay
        viajes). costo[d + 1] = 0 es el caso base.
    """
    d = len(viajes)
    costo = [0] * (d + 2)  # posiciones 0 a d + 1; costo[d + 1] = 0
    eleccion = ["nada"] * (d + 2)
    for t in range(d, 0, -1):  # pregunta 5: del último día al primero
        if viajes[t - 1] == 0:  # sin viajes: no se compra nada
            costo[t] = costo[t + 1]
            continue
        # Opción (a): pagar solo hoy, con viajes sueltos o pase de un día.
        sueltos = viajes[t - 1] * VIAJE
        if sueltos < PASE_DIA:
            costo[t] = sueltos + costo[t + 1]
            eleccion[t] = "viajes"
        else:
            costo[t] = PASE_DIA + costo[t + 1]
            eleccion[t] = "dia"
        # Opciones (b) y (c): un pase que empieza hoy y cubre varios días.
        for nombre, precio, dias in PASES:
            siguiente = min(t + dias, d + 1)  # primer día sin cubrir
            candidato = precio + costo[siguiente]
            if candidato < costo[t]:
                costo[t] = candidato
                eleccion[t] = nombre
    return costo, eleccion


def reconstruir_compras(eleccion: list[str]) -> list[tuple[int, str]]:
    """Lista qué se compra y qué día, siguiendo las elecciones óptimas.

    Args:
        eleccion: Elección de cada día devuelta por costo_bicicletas.

    Returns:
        Parejas (día, producto) de las compras de una solución óptima.
    """
    duracion = {"viajes": 1, "dia": 1, "tres_dias": 3, "semana": 7}
    d = len(eleccion) - 2
    compras: list[tuple[int, str]] = []
    t = 1
    while t <= d:
        if eleccion[t] == "nada":
            t += 1
            continue
        compras.append((t, eleccion[t]))
        t += duracion[eleccion[t]]  # salta los días que la compra cubre
    return compras


costo, eleccion = costo_bicicletas([2, 3, 3, 0, 1, 0, 2, 0, 0, 1])
print(costo[1])  # 19000
print(reconstruir_compras(eleccion))
# [(1, 'tres_dias'), (5, 'viajes'), (7, 'viajes'), (10, 'viajes')]
```

Cada parte del código corresponde a una pregunta de la receta:

| Pregunta de la receta | En el código                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------- |
| 2. Estado             | El índice `t` de `costo[t]`                                                                  |
| 3. Recurrencia        | Las opciones (a), (b) y (c) dentro del ciclo, quedándose con la menor                        |
| 4. Caso base          | `costo[d + 1] = 0`, que ya viene en cero, y `min(t + dias, d + 1)` para los pases que sobran |
| 5. Orden              | `range(d, 0, -1)`: del último día al primero                                                 |
| 6. Reconstrucción     | La lista `eleccion` y la función `reconstruir_compras`                                       |
| 7. Costo              | Un ciclo de `d` días con 3 opciones cada uno: Θ(d·k)                                         |

---

## Verificar con una solución exhaustiva

Como explica la lección "Programación dinámica: decidir, verificar y medir", una programación dinámica se verifica comparándola con una solución exhaustiva en muchas instancias pequeñas. Escriba este código **en el mismo archivo** de las bicicletas: reutiliza `VIAJE`, `PASE_DIA`, `PASES`, `costo_bicicletas` y `reconstruir_compras`.

La exhaustiva prueba **todas las combinaciones de compras**: desde el primer día sin pagar, intenta cada producto y sigue con lo que queda, sin anotar nada. Es la misma idea que `cortar_ingenuo` en el corte de varillas: correcta, pero exponencial, porque cada día con viajes abre hasta tres caminos.

```python
import random


def costo_exhaustivo(viajes: list[int], t: int = 1) -> int:
    """Calcula el costo mínimo probando todas las combinaciones de compras.

    Args:
        viajes: Viajes de cada día; viajes[0] son los del día 1.
        t: Primer día que todavía no está pagado.

    Returns:
        Lo mínimo para pagar del día t al final; costo exponencial.
    """
    d = len(viajes)
    if t > d:
        return 0  # no quedan días
    if viajes[t - 1] == 0:
        return costo_exhaustivo(viajes, t + 1)  # día sin viajes
    sueltos = viajes[t - 1] * VIAJE
    hoy = PASE_DIA
    if sueltos < PASE_DIA:
        hoy = sueltos
    mejor = hoy + costo_exhaustivo(viajes, t + 1)  # opción (a)
    for _, precio, dias in PASES:  # opciones (b) y (c)
        candidato = precio + costo_exhaustivo(viajes, t + dias)
        if candidato < mejor:
            mejor = candidato
    return mejor


def costo_de_compras(
    viajes: list[int], compras: list[tuple[int, str]]
) -> tuple[int, bool]:
    """Suma lo que cuestan unas compras y revisa que cubran todos los viajes.

    Args:
        viajes: Viajes de cada día; viajes[0] son los del día 1.
        compras: Parejas (día, producto) devueltas por reconstruir_compras.

    Returns:
        Una pareja (total, cubre): el costo total de las compras y si
        todos los días con viajes quedaron cubiertos.
    """
    precio = {"dia": PASE_DIA}
    duracion = {"viajes": 1, "dia": 1}
    for nombre, valor, dias in PASES:
        precio[nombre] = valor
        duracion[nombre] = dias
    d = len(viajes)
    cubierto = [False] * (d + 1)
    total = 0
    for t, producto in compras:
        if producto == "viajes":
            total += viajes[t - 1] * VIAJE
        else:
            total += precio[producto]
        for dia in range(t, min(t + duracion[producto], d + 1)):
            cubierto[dia] = True
    cubre = True
    for t in range(1, d + 1):
        if viajes[t - 1] > 0 and not cubierto[t]:
            cubre = False
    return total, cubre


def verificar_bicicletas(casos: int = 200, semilla: int = 2026) -> None:
    """Compara la programación dinámica con la exhaustiva al azar.

    Args:
        casos: Número de instancias aleatorias a probar.
        semilla: Semilla fija para que el resultado sea reproducible.
    """
    rng = random.Random(semilla)  # generador propio con semilla fija
    for _ in range(casos):
        d = rng.randint(0, 10)
        viajes: list[int] = []
        for _ in range(d):
            viajes.append(rng.randint(0, 4))
        costo, eleccion = costo_bicicletas(viajes)
        esperado = costo_exhaustivo(viajes)
        assert costo[1] == esperado, viajes  # el valor coincide
        compras = reconstruir_compras(eleccion)
        total, cubre = costo_de_compras(viajes, compras)
        assert cubre, viajes  # la reconstrucción paga todos los viajes
        assert total == esperado, viajes  # y cuesta exactamente el óptimo


verificar_bicicletas()
print("Todas las instancias coinciden")
```

Cuatro detalles importan:

- **La semilla fija** hace que cualquiera que ejecute el código obtenga las mismas instancias, así que un fallo se puede reproducir.
- **El mensaje del `assert`** muestra la instancia que falló (`viajes`): es el punto de partida para depurar o para construir un contraejemplo.
- **No basta verificar el valor.** También se revisa que la **reconstrucción** cumpla la restricción (todos los viajes quedan pagados) y que sus compras cuesten exactamente el óptimo. Por eso existe `costo_de_compras`: recalcula el costo desde las compras, sin mirar la tabla.
- **Los tamaños son pequeños a propósito** (hasta 10 días). La exhaustiva es exponencial; su único papel es ser el juez.

Una advertencia: esta exhaustiva usa la misma forma de decidir que la programación dinámica (qué comprar el primer día sin pagar). Por eso detecta errores de índices, de orden de llenado y de reconstrucción, pero no un error en el **modelo** mismo, por ejemplo, haber puesto mal la duración de un pase. Para eso sirven el ejemplo resuelto a mano y los **casos límite**: sin días, un solo día, ningún día con viajes, todos los días con muchos viajes y un pase que se sale del periodo.

---

## La regla día a día: contraejemplo calculado

Al comienzo de la guía, decidir **día por día** costó 22.000 pesos frente a 19.000. Esa forma de decidir es una **regla voraz**: en cada día toma la opción más barata para ese día y nunca reconsidera. La lección "Estrategia voraz" explica cómo se rompe una regla así: se escribe como función, se compara con el óptimo y se presenta el contraejemplo calculado (la instancia, el resultado de la regla, el óptimo y la diferencia). Agregue este código al mismo archivo:

```python
def costo_dia_a_dia(viajes: list[int]) -> int:
    """Regla voraz: cada día paga lo más barato solo para ese día.

    Args:
        viajes: Viajes de cada día; viajes[0] son los del día 1.

    Returns:
        Lo que se paga decidiendo un día a la vez, sin pases de varios días.
    """
    total = 0
    for viajes_del_dia in viajes:
        sueltos = viajes_del_dia * VIAJE
        if sueltos < PASE_DIA:
            total += sueltos
        else:
            total += PASE_DIA
    return total


def contraejemplo_mas_corto(
    intentos: int = 500, semilla: int = 2026
) -> list[int] | None:
    """Busca el periodo más corto donde la regla día a día paga de más.

    Args:
        intentos: Instancias aleatorias que se prueban por cada largo.
        semilla: Semilla fija para que el resultado sea reproducible.

    Returns:
        Los viajes por día de un contraejemplo, o None si no encontró.
    """
    rng = random.Random(semilla)
    for d in range(1, 11):  # primero los periodos más cortos
        for _ in range(intentos):
            viajes: list[int] = []
            for _ in range(d):
                viajes.append(rng.randint(0, 4))
            costo, _ = costo_bicicletas(viajes)
            if costo_dia_a_dia(viajes) > costo[1]:
                return viajes
    return None


viajes = [2, 3, 3, 0, 1, 0, 2, 0, 0, 1]
costo, _ = costo_bicicletas(viajes)
print(costo_dia_a_dia(viajes), costo[1])  # 22000 19000
corto = contraejemplo_mas_corto()
costo, eleccion = costo_bicicletas(corto)
print(corto, costo_dia_a_dia(corto), costo[1])
print(reconstruir_compras(eleccion))
```

Salida:

```text
22000 19000
[3, 2, 2] 13000 11000
[(1, 'tres_dias')]
```

El contraejemplo de las vacaciones ya muestra la diferencia: la regla paga 22.000, el óptimo 19.000, **3.000 de más**. La búsqueda encuentra además uno más corto, fácil de explicar a mano: tres días con 3, 2 y 2 viajes. Día por día se paga 5.000 + 4.000 + 4.000 = 13.000; un pase de tres días cubre todo por 11.000.

**La condición contraria.** ¿Cuándo sería óptima la regla día a día? Si **no existieran pases de varios días**. Con solo viajes sueltos y pase de un día, lo que se compra un día no cubre ningún otro: las decisiones de los días son independientes, y la suma de los mejores costos de cada día es el costo mínimo. Son los pases de varios días los que amarran decisiones de días distintos, y por eso hace falta la programación dinámica.

**Costo.** La regla día a día recorre los días una vez: Θ(d), igual que la programación dinámica con un número fijo de productos. Las dos cuestan lo mismo; lo que cambia es el resultado. Mídalas a las dos: es un hallazgo que el informe debe decir, porque la mejora no cuesta tiempo de cómputo adicional.

---

## Dificultades Comunes

### "Mi tabla da costos más bajos que la exhaustiva"

- Revise el **orden de llenado**. `C(t)` depende de días posteriores; si la tabla se llena del primer día al último, se leen casillas que todavía valen 0 y el resultado sale bajo sin ningún error visible.

### "Un pase que se sale del periodo me da un error de índice"

- Cuando `t + dias` pasa del último día, el resto por pagar es el caso base: use `min(t + dias, d + 1)`, como en el código.

### "La reconstrucción incluye compras en días que ya estaban cubiertos"

- Después de cada compra hay que **saltar** los días que cubre (`t += duracion[...]`). La elección guardada en esos días es la mejor "si el problema empezara ahí", no una compra que se haga.

## Recursos

- **Lecciones del curso:** "Fundamentos de programación dinámica", "Estrategia voraz" y "Programación dinámica: decidir, verificar y medir".
- **Libro de texto:** Cormen et al., _Introduction to Algorithms_, 3.ª ed., secciones 15.3 (_Elements of dynamic programming_) y 16.2 (_Elements of the greedy strategy_).
