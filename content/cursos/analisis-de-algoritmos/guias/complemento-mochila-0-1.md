---
title: "Complemento del Laboratorio 4 — Mochila 0/1"
updatedAt: "2026-11-02"
---

# Complemento del Laboratorio 4 — Mochila 0/1

> 📘 **Material complementario de estudio autónomo.** Es **indispensable para los equipos del Caso 3 — Banco de alimentos**, cuya operación de cargue de los vehículos es una mochila 0/1. Los demás equipos pueden leerlo como profundización; no hace falta para sus casos. Tenga abierto un editor de Python y ejecute cada bloque de código; cuando la guía haga una traza a mano, hágala primero en papel y después compare.

## Antes de empezar

Este complemento supone que ya estudió **"Fundamentos de programación dinámica"**, en especial la receta de siete preguntas. Aquí aplica la misma receta a un problema con una diferencia importante: el estado necesita **dos** números y la tabla es una cuadrícula.

El ejemplo es deliberadamente distinto del cargue de vehículos: una mochila de 7 kg con cuatro objetos. **El complemento no resuelve el Caso 3.** Traducir el patrón a los lotes, las capacidades y las reglas del banco (y a la regla de cargue por vencimiento que se usa hoy) es parte del trabajo del equipo y de lo que se califica.

---

## El problema

Para una salida de campo le dejan llevar una mochila de **7 kg**. Hay cuatro objetos posibles, cada uno con su peso y una utilidad que el equipo le asignó (cuánto aporta a la salida). Cada objeto va **entero o no va**: no se puede llevar media carpa.

| Objeto                 | Peso (kg) | Utilidad | Utilidad por kg |
| ---------------------- | --------- | -------- | --------------- |
| A — botella de agua    | 1         | 1        | 1,00            |
| B — kit de muestreo    | 3         | 4        | 1,33            |
| C — carpa liviana      | 4         | 5        | 1,25            |
| D — equipo de medición | 5         | 7        | 1,40            |

¿Qué objetos debe llevar para que la utilidad total sea la mayor posible sin pasar de 7 kg?

Un atajo tentador es **meter primero lo que más rinde por kilogramo**, mientras quepa. D rinde 1,40 por kg: entra, y la mochila queda con 5 kg. B (1,33) ya no cabe: 5 + 3 = 8 kg. C tampoco: 5 + 4 = 9 kg. A sí: 6 kg en total. Resultado: D y A, utilidad **8**.

¿Es lo mejor? Con solo 4 objetos se puede revisar todo. Cada objeto va o no va, así que hay 2⁴ = 16 combinaciones posibles. Estas son las que caben en 7 kg:

| Combinación | Ninguno | A   | B   | C   | D   | A + B | A + C | A + D | B + C |
| ----------- | ------- | --- | --- | --- | --- | ----- | ----- | ----- | ----- |
| Peso (kg)   | 0       | 1   | 3   | 4   | 5   | 4     | 5     | 6     | 7     |
| Utilidad    | 0       | 1   | 4   | 5   | 7   | 5     | 6     | 8     | **9** |

Las otras 7 combinaciones (B + D, C + D y todas las de tres o cuatro objetos) pesan más de 7 kg. La mejor es **B y C: 7 kg exactos y utilidad 9**. El atajo por densidad falló porque metió D, el objeto "más eficiente", y dejó un hueco de 2 kg que ningún objeto útil podía llenar. Y revisar todas las combinaciones no escala: con 30 objetos serían más de mil millones.

> **Mochila 0/1:** dados `n` objetos con peso entero `w_i` y valor `v_i`, y una capacidad `W`, elegir un subconjunto de peso total a lo sumo `W` con valor total máximo. "0/1" significa que cada objeto se toma completo (1) o no se toma (0).

---

## Mochila y varillas: qué cambia

En la cinta, la decisión era "cuánto mide el primer tramo". En la mochila la decisión es más simple: **objeto por objeto, ¿lo llevo o no?** Ponga los objetos en una fila, A, B, C, D, y decida sobre ellos uno a uno.

Lo que cambia es **qué queda** después de decidir. Suponga que ya decidió sobre D:

- Si **no** lleva D, quedan por decidir A, B y C, con **7 kg** libres.
- Si **sí** lleva D, quedan por decidir A, B y C, pero con solo **2 kg** libres.

Los objetos que quedan son los mismos, pero los dos problemas son distintos: con 7 kg puede llevar B y C; con 2 kg, como mucho A. Por eso aquí un solo número no basta para describir lo que queda. Hacen falta **dos**: qué objetos faltan por decidir y cuánta capacidad hay libre.

|                                        | Corte de varillas             | Mochila 0/1                                                    |
| -------------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| La decisión                            | Cuánto mide el primer tramo   | ¿Llevo este objeto o no?                                       |
| Las opciones                           | Cualquier longitud de 1 a `n` | Solo dos: no llevarlo o llevarlo (si cabe)                     |
| Lo que queda                           | Una cinta más corta           | Menos objetos por decidir y, si lo llevó, menos capacidad      |
| Cuántos números describen lo que queda | Uno (metros)                  | Dos (objetos y kilogramos)                                     |
| La tabla                               | Una fila                      | Una cuadrícula: una fila por objeto, una columna por kilogramo |

---

## La receta de la mochila, pregunta por pregunta

**1. ¿Qué decisión se toma?** Sobre un objeto a la vez: ¿se lleva o no? Se decide en orden y, para escribir la recurrencia, se mira siempre **el último objeto** del grupo que se está considerando.

**2. ¿Qué queda? (el estado)** Dos números: cuántos objetos se están considerando (`i`: los `i` primeros de la fila) y cuánta capacidad hay (`w` kilogramos). Se define:

> **K[i][w]:** la mayor utilidad que se logra eligiendo **solo entre los `i` primeros objetos**, con una mochila de **`w` kg**.

Por ejemplo, `K[2][3]` es lo mejor que se puede hacer con A y B en una mochila de 3 kg (llevar B: utilidad 4). La respuesta del problema completo es `K[4][7]`: los cuatro objetos y los 7 kg.

**3. ¿Cuál es la recurrencia?** Para calcular `K[i][w]` se decide sobre el objeto `i`, que pesa `w_i` y vale `v_i`:

- **(a) No llevarlo:** la capacidad sigue siendo `w` y quedan los `i − 1` objetos anteriores. Lo mejor para eso ya está en `K[i − 1][w]`.
- **(b) Llevarlo** (solo si cabe, es decir, si `w_i ≤ w`): gana `v_i` y le quedan `w − w_i` kg para los `i − 1` anteriores. Total: `v_i + K[i − 1][w − w_i]`.

`K[i][w]` es la mejor de las dos. Si el objeto no cabe, solo existe la opción (a):

```text
K[i][w] = K[i-1][w]                                   si w_i > w (no cabe)
K[i][w] = max( K[i-1][w],  v_i + K[i-1][w - w_i] )    si w_i <= w
```

Léala con un caso concreto, `K[3][7]` (A, B y C con 7 kg), decidiendo sobre C (4 kg, utilidad 5):

- (a) No llevar C: lo mejor con A y B en 7 kg es `K[2][7]` = 5 (A + B).
- (b) Llevar C: gana 5 y quedan 3 kg para A y B; lo mejor ahí es `K[2][3]` = 4 (B). Total: 5 + 4 = **9**.

Gana (b): `K[3][7] = 9`, que es justamente B + C. Como en la cinta, el argumento de cortar y pegar dice por qué basta usar `K[2][3]`: si los 3 kg restantes no se llenaran de la mejor manera, se cambiaría esa parte y la utilidad subiría.

**4. ¿Cuál es el caso base?** Sin objetos no hay utilidad: `K[0][w] = 0` para toda capacidad `w`. Con 0 kg tampoco cabe nada, así que la columna `w = 0` también queda en 0.

**5. ¿En qué orden se llena la tabla?** `K[i][w]` solo depende de casillas de la **fila anterior**, `K[i − 1][…]`. Así que se llena **fila por fila, de arriba hacia abajo**: primero la fila 0 (el caso base), después la fila de A, la de B, la de C y la de D. Dentro de una fila, las columnas se pueden llenar en cualquier orden.

**6. ¿Qué se guarda para reconstruir?** No hace falta una tabla aparte: basta con la tabla completa. Si `K[i][w]` es distinto de `K[i − 1][w]`, el objeto `i` cambió el resultado, así que se llevó.

**7. ¿Cuánto cuesta?** La cuadrícula tiene `(n + 1) × (W + 1)` casillas y cada una compara dos opciones: **Θ(n·W)**. En el ejemplo, 5 × 8 = 40 casillas, frente a las 16 combinaciones de revisar todo. Parece peor, pero con 30 objetos y 7 kg serían 31 × 8 = 248 casillas, frente a más de mil millones de combinaciones.

---

## La tabla a mano, fila por fila

Llene la cuadrícula en papel: filas `i` de 0 a 4 (objetos considerados) y columnas `w` de 0 a 7 (kilogramos). La fila 0 es todo ceros. Así queda al final:

| `i` \ `w`   | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7     |
| ----------- | --- | --- | --- | --- | --- | --- | --- | ----- |
| 0 (ninguno) | 0   | 0   | 0   | 0   | 0   | 0   | 0   | 0     |
| 1 (+A)      | 0   | 1   | 1   | 1   | 1   | 1   | 1   | 1     |
| 2 (+B)      | 0   | 1   | 1   | 4   | 5   | 5   | 5   | 5     |
| 3 (+C)      | 0   | 1   | 1   | 4   | 5   | 6   | 6   | **9** |
| 4 (+D)      | 0   | 1   | 1   | 4   | 5   | 7   | 8   | **9** |

Revise cómo se calculan las filas, con las dos opciones de cada casilla:

- **Fila 1 (A, 1 kg, utilidad 1):** con `w = 0`, A no cabe: 0. Con cualquier `w ≥ 1`, A cabe y llevarlo da 1 + 0 = 1. Se lee así: "con solo A disponible, lo mejor es 1 en cuanto haya al menos 1 kg".
- **Fila 2 (B, 3 kg, utilidad 4):** con `w` de 0 a 2, B no cabe y se copia la fila de arriba. Con `w = 3`: no llevar B da 1; llevarlo da 4 + `K[1][0]` = 4. Gana 4. Con `w = 4`: no llevar, 1; llevar, 4 + `K[1][1]` = 5. Gana 5: B y A juntos.

La fila 3 (C, 4 kg, utilidad 5) con todo detalle:

| `w` | (a) No llevar C: `K[2][w]` | (b) Llevar C: 5 + `K[2][w − 4]` | `K[3][w]`                  |
| --- | -------------------------- | ------------------------------- | -------------------------- |
| 0–3 | 0, 1, 1, 4                 | no cabe                         | 0, 1, 1, 4                 |
| 4   | 5                          | 5 + `K[2][0]` = 5               | 5 (empate: se queda sin C) |
| 5   | 5                          | 5 + `K[2][1]` = 6               | 6                          |
| 6   | 5                          | 5 + `K[2][2]` = 6               | 6                          |
| 7   | 5                          | 5 + `K[2][3]` = **9**           | **9**                      |

Y la fila 4 (D, 5 kg, utilidad 7):

| `w` | (a) No llevar D: `K[3][w]` | (b) Llevar D: 7 + `K[3][w − 5]` | `K[4][w]`     |
| --- | -------------------------- | ------------------------------- | ------------- |
| 0–4 | 0, 1, 1, 4, 5              | no cabe                         | 0, 1, 1, 4, 5 |
| 5   | 6                          | 7 + `K[3][0]` = 7               | 7             |
| 6   | 6                          | 7 + `K[3][1]` = 8               | 8             |
| 7   | **9**                      | 7 + `K[3][2]` = 8               | **9**         |

Fíjese en la última casilla: llevar D da 8 (D + A, lo mismo que el atajo por densidad), pero **no** llevarlo da 9, porque la fila de arriba ya sabía que B + C caben en 7 kg. La tabla no "prefiere" ningún objeto: compara las dos opciones con lo mejor que se puede hacer con el resto.

---

## Reconstruir los objetos

`K[4][7] = 9` dice cuánto se logra, no qué se lleva. Para saberlo se recorre la tabla **desde la esquina inferior derecha hacia arriba**, una fila por objeto, empezando con los 7 kg completos:

1. **Fila 4 (D), `w = 7`:** `K[4][7] = 9` y `K[3][7] = 9`. Son iguales: agregar D no cambió nada, así que **D no se lleva**. La capacidad sigue en 7 kg.
2. **Fila 3 (C), `w = 7`:** `K[3][7] = 9` y `K[2][7] = 5`. Cambió: **C sí se lleva**. Quedan 7 − 4 = 3 kg.
3. **Fila 2 (B), `w = 3`:** `K[2][3] = 4` y `K[1][3] = 1`. Cambió: **B sí se lleva**. Quedan 3 − 3 = 0 kg.
4. **Fila 1 (A), `w = 0`:** `K[1][0] = 0` y `K[0][0] = 0`. Iguales: **A no se lleva**.

Resultado: B y C, 7 kg y utilidad 4 + 5 = **9**, igual a `K[4][7]`. Observe que la columna cambia cada vez que se lleva un objeto: después de llevar C, ya no importa qué pasaba con 7 kg, sino con los 3 kg que quedaron.

La reconstrucción **necesita la tabla completa**. Existe un truco para calcular solo el valor con una fila de `W + 1` casillas, pero así se pierde la información para saber qué objetos se eligieron.

---

## La mochila en código

El código hace lo mismo que usted hizo a mano. La única convención que hay que cuidar: la fila `i` de la tabla corresponde al objeto `objetos[i - 1]`, porque la fila 0 es el caso base y las listas de Python empiezan en la posición 0.

```python
Objeto = tuple[int, int]  # (peso_kg, utilidad)


def mochila(objetos: list[Objeto], capacidad: int) -> list[list[int]]:
    """Llena la tabla de la mochila 0/1.

    Args:
        objetos: Peso entero y utilidad de cada objeto.
        capacidad: Capacidad de la mochila en kilogramos.

    Returns:
        La tabla K de (n + 1) filas y (capacidad + 1) columnas;
        K[n][capacidad] es la utilidad máxima.
    """
    n = len(objetos)
    tabla = []
    for _ in range(n + 1):  # n + 1 filas; la fila 0 es el caso base
        tabla.append([0] * (capacidad + 1))
    for i in range(1, n + 1):  # pregunta 5: fila por fila
        peso, valor = objetos[i - 1]  # la fila i es el objeto i - 1
        for w in range(capacidad + 1):
            no_llevar = tabla[i - 1][w]  # opción (a)
            tabla[i][w] = no_llevar
            if peso <= w:  # opción (b), solo si el objeto cabe
                llevar = valor + tabla[i - 1][w - peso]
                if llevar > no_llevar:
                    tabla[i][w] = llevar
    return tabla


def reconstruir_mochila(
    objetos: list[Objeto], tabla: list[list[int]], capacidad: int
) -> list[int]:
    """Recupera qué objetos forman una solución óptima.

    Args:
        objetos: Los mismos objetos con que se llenó la tabla.
        tabla: Tabla devuelta por mochila.
        capacidad: Capacidad con que se llenó la tabla.

    Returns:
        Las posiciones de los objetos elegidos, en orden creciente.
    """
    elegidos: list[int] = []
    w = capacidad
    for i in range(len(objetos), 0, -1):  # de la última fila a la primera
        if tabla[i][w] != tabla[i - 1][w]:  # cambió: se llevó el objeto
            elegidos.append(i - 1)
            w -= objetos[i - 1][0]  # la capacidad baja lo que pesa
    elegidos.reverse()
    return elegidos


OBJETOS: list[Objeto] = [(1, 1), (3, 4), (4, 5), (5, 7)]  # A, B, C, D
tabla = mochila(OBJETOS, 7)
print(tabla[4][7])  # 9
print(reconstruir_mochila(OBJETOS, tabla, 7))  # [1, 2]: B y C
```

| Pregunta de la receta | En el código                                                           |
| --------------------- | ---------------------------------------------------------------------- |
| 2. Estado             | Los dos índices de `tabla[i][w]`                                       |
| 3. Recurrencia        | `no_llevar` y `llevar` dentro del doble ciclo, quedándose con la mayor |
| 4. Caso base          | La fila 0, que se crea llena de ceros                                  |
| 5. Orden              | El ciclo externo recorre las filas de arriba hacia abajo               |
| 6. Reconstrucción     | `reconstruir_mochila`, comparando cada fila con la de arriba           |
| 7. Costo              | Dos ciclos anidados: `n` filas × `W + 1` columnas, Θ(n·W)              |

---

## El costo de la mochila depende de W

Por la pregunta 7 de la receta: hay `(n + 1)·(W + 1)` estados y cada uno cuesta Θ(1), así que la mochila cuesta **Θ(n·W)** en tiempo y en espacio. La alternativa exhaustiva prueba los `2ⁿ` subconjuntos y suma cada uno: Θ(n·2ⁿ).

Atención a una trampa: Θ(n·W) **no** depende solo del número de objetos. Si duplica la capacidad, duplica el número de columnas y el tiempo. Por eso se dice que la mochila es **pseudo-polinomial**: es polinomial en el _valor numérico_ de `W`, no en el tamaño de la entrada (escribir `W` solo ocupa unos log₂ W bits). Consecuencias prácticas:

- Con 500 objetos y `W = 5.000` kg hay unos 2,5 millones de casillas: rápido. Si la capacidad se expresara en **gramos** (`W = 5.000.000`), serían 2.500 millones: la misma mochila se vuelve impracticable solo por cambiar la unidad.
- La memoria también crece: una tabla de 2,5 millones de casillas en listas de Python ocupa decenas de megabytes.
- Para medir este algoritmo hay que variar `n` **y** `W` por separado: con `W` fijo, el tiempo crece lineal en `n` (al duplicar `n`, el tiempo se multiplica por ≈ 2); con `n` fijo, crece lineal en `W` (al duplicar `W`, también ≈ 2).

> **Algoritmo pseudo-polinomial:** su costo es polinomial en el valor numérico de un dato de la entrada (aquí `W`), pero puede ser exponencial en el número de bits con que ese dato se escribe.

---

## Verificar la mochila con una solución exhaustiva

Como explica la lección "Programación dinámica: decidir, verificar y medir", una programación dinámica se verifica comparándola con una solución exhaustiva en muchas instancias pequeñas. Para la mochila, la exhaustiva prueba todos los subconjuntos con una **máscara de bits**: los números de 0 a 2ⁿ − 1 escritos en binario recorren todos los subconjuntos, y el bit `i` en 1 significa "el objeto `i` está". Con 3 objetos, `0b101` (el 5) es el subconjunto con los objetos 0 y 2.

```python
import random


def mochila_exhaustiva(objetos: list[Objeto], capacidad: int) -> int:
    """Calcula la utilidad máxima probando todos los subconjuntos.

    Args:
        objetos: Peso entero y utilidad de cada objeto.
        capacidad: Capacidad de la mochila en kilogramos.

    Returns:
        La utilidad máxima; costo Θ(n·2^n).
    """
    n = len(objetos)
    mejor = 0
    for mascara in range(1 << n):  # 1 << n es 2 elevado a n
        peso = 0
        valor = 0
        for i in range(n):
            if mascara & (1 << i):  # ¿el objeto i está en el subconjunto?
                peso += objetos[i][0]
                valor += objetos[i][1]
        if peso <= capacidad and valor > mejor:
            mejor = valor
    return mejor


def verificar_mochila(casos: int = 200, semilla: int = 2026) -> None:
    """Compara la programación dinámica con la exhaustiva al azar.

    Args:
        casos: Número de instancias aleatorias a probar.
        semilla: Semilla fija para que el resultado sea reproducible.
    """
    rng = random.Random(semilla)  # generador propio con semilla fija
    for _ in range(casos):
        n = rng.randint(0, 10)
        objetos: list[Objeto] = []
        for _ in range(n):
            objetos.append((rng.randint(1, 8), rng.randint(1, 20)))
        capacidad = rng.randint(0, 25)
        tabla = mochila(objetos, capacidad)
        esperado = mochila_exhaustiva(objetos, capacidad)
        assert tabla[n][capacidad] == esperado, (objetos, capacidad)
        elegidos = reconstruir_mochila(objetos, tabla, capacidad)
        peso_total = 0
        valor_total = 0
        for i in elegidos:
            peso_total += objetos[i][0]
            valor_total += objetos[i][1]
        # La restricción se respeta y la reconstrucción suma el óptimo.
        assert peso_total <= capacidad, (objetos, capacidad)
        assert valor_total == esperado, (objetos, capacidad)


verificar_mochila()
print("Todas las instancias coinciden")
```

No basta verificar el valor: también se comprueba que la **reconstrucción** respete la capacidad y sume el valor óptimo. Pruebe además los **casos límite**: sin objetos, capacidad 0, un objeto que no cabe y todos los objetos cabiendo.

---

## El atajo por densidad en código

Al comienzo de la guía, el atajo de meter primero lo que más rinde por kilogramo dio 8 frente a 9. Ese atajo es una **regla voraz**: ordena una vez y nunca reconsidera lo que metió. La lección "Estrategia voraz" explica cómo se rompe una regla así: se escribe como función, se compara con el óptimo y se presenta el contraejemplo calculado. Agregue este código al mismo archivo:

```python
def mochila_por_densidad(
    objetos: list[Objeto], capacidad: int
) -> tuple[int, list[int]]:
    """Regla voraz: mete primero lo de mayor utilidad por kg, si cabe.

    Args:
        objetos: Peso entero (mayor que 0) y utilidad de cada objeto.
        capacidad: Capacidad de la mochila en kilogramos.

    Returns:
        Una pareja (utilidad, elegidos) con lo que logra la regla; los
        elegidos son posiciones en orden creciente. No garantiza el óptimo.
    """
    orden = sorted(
        range(len(objetos)),
        key=lambda i: objetos[i][1] / objetos[i][0],  # utilidad por kg
        reverse=True,  # de mayor a menor densidad
    )
    libre = capacidad
    utilidad = 0
    elegidos: list[int] = []
    for i in orden:  # no se detiene en el primero que no cabe
        peso, valor = objetos[i]
        if peso <= libre:
            elegidos.append(i)
            libre -= peso
            utilidad += valor
    elegidos.sort()
    return utilidad, elegidos


def comparar_densidad(casos: int = 1000, semilla: int = 2026) -> None:
    """Cuenta cuántas veces la regla por densidad no llega al óptimo.

    Args:
        casos: Número de instancias aleatorias a probar.
        semilla: Semilla fija para que el resultado sea reproducible.
    """
    rng = random.Random(semilla)
    fallos = 0
    peor = 0.0  # la mayor pérdida, como fracción del óptimo
    for _ in range(casos):
        objetos: list[Objeto] = []
        for _ in range(rng.randint(1, 10)):
            objetos.append((rng.randint(1, 8), rng.randint(1, 20)))
        capacidad = rng.randint(1, 25)
        optimo = mochila(objetos, capacidad)[len(objetos)][capacidad]
        obtenido, _ = mochila_por_densidad(objetos, capacidad)
        if obtenido < optimo:
            fallos += 1
            perdida = (optimo - obtenido) / optimo
            if perdida > peor:
                peor = perdida
    print(f"falla en {fallos} de {casos} instancias; "
          f"pérdida máxima: {peor:.0%} del óptimo")


print(mochila_por_densidad(OBJETOS, 7))  # (8, [0, 3]): A y D
print(mochila(OBJETOS, 7)[4][7])  # 9: B y C
comparar_densidad()
```

Salida:

```text
(8, [0, 3])
9
falla en 151 de 1000 instancias; pérdida máxima: 73% del óptimo
```

Tres observaciones:

- **El contraejemplo calculado** es el de la salida de campo: la regla lleva A y D (utilidad 8), el óptimo lleva B y C (9), una diferencia de 1. Preséntelo así: instancia, resultado de la regla, óptimo y diferencia.
- **La regla no falla siempre**, y eso la hace tentadora: en estas instancias acierta en 849 de 1.000. Pero cuando falla puede perder mucho, en alguna instancia casi tres cuartas partes del óptimo. Una instancia donde acierta no prueba nada.
- **No se detiene en el primer objeto que no cabe:** sigue buscando objetos más pequeños que sí quepan. Si la regla que debe reproducir se detiene en el primero que no cabe, el código cambia, y esa diferencia se documenta.

**Costo.** Ordenar cuesta Θ(n log n) y el recorrido Θ(n): la regla por densidad cuesta Θ(n log n) y **no depende de W**. La programación dinámica cuesta Θ(n·W). La regla es más barata, pero no garantiza el óptimo; esa es la comparación que hay que medir y explicar.

---

## Mochila 0/1 frente a mochila fraccionaria

El atajo por densidad no es siempre malo: si los objetos se pudieran **fraccionar** (llevar una parte de un lote y obtener la parte proporcional de su valor), meter primero lo de mayor valor por kilogramo y partir el último objeto sí da el óptimo. Esa es la **mochila fraccionaria**, y se resuelve con una regla voraz en Θ(n log n). La lección "Estrategia voraz" explica por qué una regla así puede ser correcta en un problema y fallar en otro.

En la mochila 0/1, la que exige que cada objeto vaya entero, la regla por densidad puede dejar un hueco imposible de llenar, como en el ejemplo (8 frente a 9). Que el problema permita o no fraccionar es justamente la condición que decide qué familia de estrategias es la adecuada.

---

## Dificultades Comunes

### "Mi tabla da un valor más alto que el de la exhaustiva"

- Revise que la opción (b) use la fila **anterior**, `tabla[i - 1][w - peso]`, y no la fila actual `tabla[i][w - peso]`. Con la fila actual, un mismo objeto se puede meter varias veces: eso resuelve otro problema (la mochila con repetición).

### "La reconstrucción no suma el valor óptimo"

- La capacidad `w` debe bajar **cada vez** que se lleva un objeto. Si no baja, la comparación de las filas siguientes se hace en la columna equivocada.

### "Mi programa se queda sin memoria o tarda demasiado"

- Revise la unidad de la capacidad: el tamaño de la tabla es proporcional a `W`. Si trabaja con unidades más finas de las necesarias, la tabla crece sin mejorar la respuesta.

## Recursos

- **Lecciones del curso:** "Fundamentos de programación dinámica", "Estrategia voraz" y "Programación dinámica: decidir, verificar y medir".
- **Libro de texto:** Cormen et al., _Introduction to Algorithms_, 3.ª ed., sección 16.2 y ejercicio 16.2-2 (mochila 0/1 por programación dinámica); Kleinberg y Tardos, _Algorithm Design_, sección 6.4 (_Subset Sums and Knapsacks_).
