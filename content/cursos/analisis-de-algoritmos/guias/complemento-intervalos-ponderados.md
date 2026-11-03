---
title: "Complemento del Laboratorio 4 — Intervalos ponderados"
updatedAt: "2026-11-02"
---

# Complemento del Laboratorio 4 — Intervalos ponderados

> 📘 **Material complementario y opcional.** Sirve a los equipos del **Caso 2 — Plataforma Pulso** que decidan maximizar los **pacientes de alto riesgo atendidos** en la programación de las jornadas de las unidades móviles, en vez del número de jornadas. Si su equipo elige maximizar el número de jornadas, le basta la lección "Estrategia voraz". Tenga abierto un editor de Python y ejecute cada bloque de código; cuando la guía haga una traza a mano, hágala primero en papel y después compare.

## Antes de empezar

Este complemento supone que ya estudió **"Fundamentos de programación dinámica"** (en especial, la receta de siete preguntas) y **"Estrategia voraz"** (la regla de terminación más temprana). Aquí aplica la receta a un problema en el que esa regla deja de funcionar: cuando los turnos no valen todos lo mismo.

El ejemplo es deliberadamente distinto de las jornadas de las unidades móviles: una sala de estudio con seis solicitudes. **El complemento no resuelve el Caso 2.** Traducir el patrón a las solicitudes, los horarios y las reglas de la Secretaría (y justificar en el `README.md` por qué eligió ese criterio) es parte del trabajo del equipo y de lo que se califica.

---

## El problema

Una sala de estudio recibe solicitudes de turno para el sábado. Cada solicitud trae hora de inicio, hora de fin y cuántos estudiantes usarían la sala. La sala no puede tener dos turnos a la vez; un turno que empieza **exactamente** cuando otro termina sí es compatible (uno sale y el otro entra).

| Grupo       | A    | B    | C     | D     | E     | F     |
| ----------- | ---- | ---- | ----- | ----- | ----- | ----- |
| Horario     | 8–10 | 9–12 | 10–11 | 11–13 | 12–15 | 14–16 |
| Estudiantes | 3    | 10   | 2     | 4     | 9     | 5     |

¿Qué turnos debe aceptar para atender al mayor número de estudiantes?

Un primer atajo es la regla de la lección "Estrategia voraz": **aceptar primero el turno que termina más temprano**, después el siguiente que termine más temprano entre los que no se cruzan, y así. Esa regla deja la sala libre lo antes posible y logra el **mayor número de turnos**: aquí acepta A (8–10), C (10–11), D (11–13) y F (14–16). Son 4 turnos, pero solo 3 + 2 + 4 + 5 = **14 estudiantes**. En cambio, B (9–12) y E (12–15) son compatibles (B termina a las 12, justo cuando empieza E) y atienden 10 + 9 = **19**. Maximizar cuántos turnos y maximizar cuántos estudiantes son problemas distintos.

Un segundo atajo: **aceptar primero el turno con más estudiantes**. En este ejemplo funciona (B, después E), pero falla con algo tan simple como tres turnos: X de 0 a 10 con 10 estudiantes, Y de 0 a 5 con 6 y Z de 5 a 10 con 6. El atajo acepta X (10) y ya nada cabe; Y + Z atienden 12.

> **Intervalos ponderados:** dados `n` intervalos con inicio `s_j`, fin `f_j` y peso `v_j`, elegir un subconjunto de intervalos que no se crucen con peso total máximo.

---

## Intervalos y varillas: qué cambia

Aquí la decisión es más simple que en la cinta: **turno por turno, ¿lo acepto o no?** La diferencia está en qué pasa cuando se acepta uno: no se gasta capacidad, sino que quedan **descartados todos los turnos que se cruzan con él**.

Eso complica el estado: si los turnos se deciden en cualquier orden, "los que quedan disponibles" puede ser una mezcla desordenada. El truco es **ordenar los turnos por hora de fin** antes de empezar y decidir siempre sobre **el último de la lista** (el que termina más tarde). Observe por qué funciona: si se acepta el último turno `j`, los turnos que **no** se cruzan con él son los que terminan antes de que `j` empiece, y como la lista está ordenada por fin, esos son **un bloque al principio de la lista**. Lo que queda siempre es "los primeros tantos turnos de la lista": un solo número describe el estado.

|              | Corte de varillas             | Intervalos ponderados                                                                                          |
| ------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Preparación  | Ninguna                       | Ordenar los turnos por hora de fin                                                                             |
| La decisión  | Cuánto mide el primer tramo   | ¿Acepto el último turno de la lista?                                                                           |
| Las opciones | Cualquier longitud de 1 a `n` | Solo dos: no aceptarlo o aceptarlo                                                                             |
| Lo que queda | Una cinta más corta           | Los primeros turnos de la lista: todos menos el último, o solo los que terminan antes de que el último empiece |

---

## La receta de los intervalos, pregunta por pregunta

Primero, la preparación: ordene los turnos por hora de fin y numérelos del 1 al 6 en ese orden.

| `j` (orden por fin) | 1    | 2     | 3    | 4     | 5     | 6     |
| ------------------- | ---- | ----- | ---- | ----- | ----- | ----- |
| Grupo               | A    | C     | B    | D     | E     | F     |
| Horario             | 8–10 | 10–11 | 9–12 | 11–13 | 12–15 | 14–16 |
| Estudiantes         | 3    | 2     | 10   | 4     | 9     | 5     |

**1. ¿Qué decisión se toma?** Sobre el último turno de la lista, el `j`: ¿lo acepto o no?

**2. ¿Qué queda? (el estado)** Siempre los **primeros turnos de la lista**, así que el estado es cuántos: `j`. Se define:

> **M[j]:** la mayor cantidad de estudiantes que se atiende eligiendo **solo entre los turnos 1 a `j`** de la lista ordenada.

La respuesta del problema completo es `M[6]`.

**3. ¿Cuál es la recurrencia?** Para el turno `j`, con `v_j` estudiantes:

- **(a) No aceptarlo:** quedan los turnos 1 a `j − 1`. Lo mejor para ellos es `M[j − 1]`.
- **(b) Aceptarlo:** se gana `v_j`, pero solo se puede combinar con los turnos que terminan a más tardar cuando `j` empieza. Se llama **`p(j)`** a cuántos son: como la lista está ordenada por fin, son exactamente los turnos 1 a `p(j)`. Total: `v_j + M[p(j)]`.

`M[j]` es la mejor de las dos:

```text
M[j] = max( M[j-1],  v_j + M[p(j)] )        con M[0] = 0
```

Calcule `p(j)` con un caso concreto, E (turno 5, de 12 a 15). Recorra los turnos anteriores y pregunte si terminan a más tardar a las 12: A termina a las 10 (sí), C a las 11 (sí), B a las 12 (sí: se tocan, y eso se permite), D a las 13 (no). Son los tres primeros, así que `p(5) = 3`. Si se acepta E, lo mejor que se le puede sumar es `M[3]`: lo mejor entre A, C y B. Los turnos que quedan entre `p(j) + 1` y `j − 1` (aquí, solo D) se cruzan con E y se descartan.

**4. ¿Cuál es el caso base?** Sin turnos no se atiende a nadie: `M[0] = 0`. Un turno sin compatibles anteriores tiene `p(j) = 0`, y aceptarlo vale solo `v_j + M[0] = v_j`.

**5. ¿En qué orden se llena la tabla?** `M[j]` depende de `M[j − 1]` y de `M[p(j)]`, y `p(j)` siempre es menor que `j`. Así que se llena **de izquierda a derecha**, de `j = 1` a `j = 6`, como la cinta.

**6. ¿Qué se guarda para reconstruir?** Los valores `p(j)` y la tabla `M`: con ellos se puede saber, para cada `j`, cuál opción ganó.

**7. ¿Cuánto cuesta?** Ordenar cuesta Θ(n log n). Calcular cada `p(j)` con búsqueda binaria cuesta Θ(log n), en total Θ(n log n). Llenar `M` y reconstruir, Θ(n). Total: **Θ(n log n)**, frente a Θ(n·2ⁿ) de revisar todos los subconjuntos de turnos.

---

## La tabla de los intervalos a mano

Primero calcule `p(j)` para cada turno, como hizo con E: cuente los turnos anteriores de la lista que terminan a más tardar cuando empieza `j`.

| `j` | Turno     | Empieza | Anteriores que terminan a esa hora o antes | `p(j)` |
| --- | --------- | ------- | ------------------------------------------ | ------ |
| 1   | A (8–10)  | 8       | ninguno                                    | 0      |
| 2   | C (10–11) | 10      | A (10)                                     | 1      |
| 3   | B (9–12)  | 9       | ninguno: A y C terminan después de las 9   | 0      |
| 4   | D (11–13) | 11      | A (10) y C (11)                            | 2      |
| 5   | E (12–15) | 12      | A (10), C (11) y B (12)                    | 3      |
| 6   | F (14–16) | 14      | A, C, B (12) y D (13); E termina a las 15  | 4      |

Después llene `M` de izquierda a derecha, con las dos opciones de cada turno:

| `j` | Turno | (a) No aceptar: `M[j − 1]` | (b) Aceptar: `v_j + M[p(j)]` | `M[j]` | Gana       |
| --- | ----- | -------------------------- | ---------------------------- | ------ | ---------- |
| 0   | —     | —                          | —                            | 0      | caso base  |
| 1   | A     | `M[0]` = 0                 | 3 + `M[0]` = 3               | 3      | aceptar    |
| 2   | C     | `M[1]` = 3                 | 2 + `M[1]` = 5               | 5      | aceptar    |
| 3   | B     | `M[2]` = 5                 | 10 + `M[0]` = 10             | 10     | aceptar    |
| 4   | D     | `M[3]` = 10                | 4 + `M[2]` = 9               | 10     | no aceptar |
| 5   | E     | `M[4]` = 10                | 9 + `M[3]` = 19              | **19** | aceptar    |
| 6   | F     | `M[5]` = 19                | 5 + `M[4]` = 15              | **19** | no aceptar |

Revise tres filas:

- **`j = 3` (B):** aceptar B vale 10 + `M[0]` = 10, porque B se cruza con A y con C. Aun así le gana a no aceptarlo (5): un turno grande vale más que dos pequeños.
- **`j = 5` (E):** aceptar E vale 9 + `M[3]` = 9 + 10 = 19. `M[3]` = 10 ya sabe que, entre A, C y B, lo mejor es quedarse con B.
- **`j = 6` (F):** aceptar F vale 5 + `M[4]` = 15, pero no aceptarlo conserva 19.

Fíjese en una trampa común: en las filas 1 y 2 "gana aceptar" A y C, pero ninguno de los dos queda en la solución final. Cada fila responde "¿qué es lo mejor si la lista terminara aquí?"; la solución final la dice la reconstrucción.

---

## Reconstruir los turnos

Se recorre la tabla **desde `j = 6` hacia atrás**. En cada paso se pregunta si aceptar `j` le gana a no aceptarlo:

1. **`j = 6` (F):** aceptar daría 5 + `M[4]` = 15, no aceptar da `M[5]` = 19. **F no entra.** Se pasa a `j = 5`.
2. **`j = 5` (E):** aceptar da 9 + `M[3]` = 19, no aceptar da `M[4]` = 10. **E entra.** Como E descarta a los que se cruzan con él, se salta a `j = p(5) = 3`.
3. **`j = 3` (B):** aceptar da 10 + `M[0]` = 10, no aceptar da `M[2]` = 5. **B entra.** Se salta a `j = p(3) = 0`: fin.

Resultado: B (9–12) y E (12–15), con 10 + 9 = **19** estudiantes, igual a `M[6]`. El salto del paso 2 pasa por encima de D, C y A sin mirarlos: D se cruza con E, y A y C se cruzan con B.

---

## Intervalos ponderados en código

El código separa los tres momentos que usted hizo a mano: calcular `p`, llenar `M` y reconstruir. Para calcular `p(j)` usa **búsqueda binaria** con `bisect_right` del módulo `bisect`: en una lista ordenada, `bisect_right(lista, x)` dice cuántos elementos son menores o iguales que `x`. Con los fines `[10, 11, 12, 13, 15, 16]` y el inicio de E, `bisect_right(fines, 12)` da 3: los tres fines que son 12 o menos. Los argumentos `0, j - 1` limitan la búsqueda a los turnos anteriores a `j`.

```python
from bisect import bisect_right

Turno = tuple[int, int, int]  # (inicio, fin, estudiantes)


def hora_de_fin(turno: Turno) -> int:
    """Devuelve la hora de fin de un turno; sirve como clave para ordenar.

    Args:
        turno: Inicio, fin y estudiantes de una solicitud.

    Returns:
        La hora de fin del turno.
    """
    return turno[1]


def calcular_p(orden: list[Turno]) -> list[int]:
    """Calcula p(j) para cada turno de una lista ordenada por hora de fin.

    Args:
        orden: Turnos ordenados por hora de fin; orden[0] es el turno 1.

    Returns:
        La lista p, con p[j] = cuántos turnos anteriores a j terminan a
        más tardar cuando j empieza. La posición 0 no se usa.
    """
    fines: list[int] = []
    for turno in orden:
        fines.append(turno[1])
    p = [0] * (len(orden) + 1)
    for j in range(1, len(orden) + 1):
        inicio_j = orden[j - 1][0]
        # Cuántos de los j - 1 fines anteriores son <= inicio_j.
        p[j] = bisect_right(fines, inicio_j, 0, j - 1)
    return p


def intervalos_ponderados(
    turnos: list[Turno],
) -> tuple[list[Turno], list[int], list[int]]:
    """Llena la tabla M de los intervalos ponderados.

    Dos turnos son compatibles si uno empieza cuando el otro ya terminó
    (se permite que se toquen en un extremo).

    Args:
        turnos: Inicio, fin y estudiantes de cada solicitud.

    Returns:
        Una tripleta (orden, p, mejor): los turnos ordenados por fin, la
        lista p y la tabla M, donde mejor[n] es el máximo de estudiantes.
    """
    orden = sorted(turnos, key=hora_de_fin)  # preparación
    p = calcular_p(orden)
    n = len(orden)
    mejor = [0] * (n + 1)  # mejor[0] = 0: caso base
    for j in range(1, n + 1):  # pregunta 5: de izquierda a derecha
        no_aceptar = mejor[j - 1]  # opción (a)
        aceptar = orden[j - 1][2] + mejor[p[j]]  # opción (b)
        if aceptar > no_aceptar:
            mejor[j] = aceptar
        else:
            mejor[j] = no_aceptar
    return orden, p, mejor


def reconstruir_turnos(
    orden: list[Turno], p: list[int], mejor: list[int]
) -> list[Turno]:
    """Recupera los turnos de una solución óptima.

    Args:
        orden: Turnos ordenados por hora de fin.
        p: Lista devuelta por calcular_p.
        mejor: Tabla M devuelta por intervalos_ponderados.

    Returns:
        Los turnos elegidos, ordenados por hora de fin.
    """
    elegidos: list[Turno] = []
    j = len(orden)
    while j > 0:
        if orden[j - 1][2] + mejor[p[j]] > mejor[j - 1]:  # j entró
            elegidos.append(orden[j - 1])
            j = p[j]  # salta los turnos que se cruzan con j
        else:
            j -= 1
    elegidos.reverse()
    return elegidos


SOLICITUDES: list[Turno] = [
    (8, 10, 3), (9, 12, 10), (10, 11, 2),
    (11, 13, 4), (12, 15, 9), (14, 16, 5),
]
orden, p, mejor = intervalos_ponderados(SOLICITUDES)
print(p)  # [0, 0, 1, 0, 2, 3, 4]
print(mejor)  # [0, 3, 5, 10, 10, 19, 19]
print(reconstruir_turnos(orden, p, mejor))  # [(9, 12, 10), (12, 15, 9)]
```

| Pregunta de la receta | En el código                                                        |
| --------------------- | ------------------------------------------------------------------- |
| Preparación           | `sorted(turnos, key=hora_de_fin)`                                   |
| 2. Estado             | El índice `j` de `mejor[j]`                                         |
| 3. Recurrencia        | `no_aceptar` y `aceptar` dentro del ciclo, quedándose con la mayor  |
| 4. Caso base          | `mejor[0] = 0`, que ya viene en cero                                |
| 5. Orden              | `range(1, n + 1)`: de izquierda a derecha                           |
| 6. Reconstrucción     | `reconstruir_turnos`, saltando a `p[j]` cada vez que un turno entra |
| 7. Costo              | Ordenar y las búsquedas binarias, Θ(n log n); el resto, Θ(n)        |

La convención de "se tocan en un extremo" vive en una sola línea: `bisect_right` cuenta los fines **iguales** al inicio como compatibles (B termina a las 12 y E empieza a las 12). Si en su problema dos turnos que se tocan sí se cruzan, use `bisect_left`, que cuenta solo los fines estrictamente menores.

---

## Costo y verificación

La pregunta 7 de la receta da **Θ(n log n)**: lo mismo que la regla de terminación más temprana, frente a Θ(n·2ⁿ) de revisar todos los subconjuntos de turnos. Es decir, maximizar los estudiantes no cuesta más que maximizar el número de turnos; solo cambia lo que se optimiza.

Para verificar, siga el método de la lección "Programación dinámica: decidir, verificar y medir": una solución exhaustiva que pruebe todos los subconjuntos de turnos, descarte los que tengan dos turnos que se crucen y se quede con el de más estudiantes. Igual que en la lección "Estrategia voraz", los subconjuntos se recorren con una **máscara de bits** (los números de 0 a 2ⁿ − 1 escritos en binario) y, como los turnos van ordenados por hora de fin, basta comparar cada turno con el anterior del subconjunto. Escriba este código **en el mismo archivo**: reutiliza `Turno`, `hora_de_fin`, `intervalos_ponderados` y `reconstruir_turnos`.

```python
import random


def se_cruzan(a: Turno, b: Turno) -> bool:
    """Indica si dos turnos se cruzan; tocarse en un extremo no es cruce.

    Args:
        a: Inicio, fin y estudiantes de un turno.
        b: Inicio, fin y estudiantes del otro turno.

    Returns:
        True si los dos turnos ocupan la sala al mismo tiempo.
    """
    return a[0] < b[1] and b[0] < a[1]


def intervalos_exhaustivo(turnos: list[Turno]) -> int:
    """Calcula el máximo de estudiantes probando todos los subconjuntos.

    Args:
        turnos: Inicio, fin y estudiantes de cada solicitud.

    Returns:
        El máximo de estudiantes de un subconjunto sin cruces; costo
        Θ(n·2ⁿ).
    """
    orden = sorted(turnos, key=hora_de_fin)  # así basta comparar vecinos
    n = len(orden)
    mejor = 0
    for mascara in range(1 << n):  # cada número es un subconjunto
        ultimo_fin = 0  # las horas no son negativas
        total = 0
        valido = True
        for i in range(n):
            if mascara & (1 << i):  # ¿el turno i está en el subconjunto?
                if orden[i][0] < ultimo_fin:  # se cruza con el anterior
                    valido = False
                    break
                ultimo_fin = orden[i][1]
                total += orden[i][2]
        if valido and total > mejor:
            mejor = total
    return mejor


def verificar_intervalos(casos: int = 200, semilla: int = 2026) -> None:
    """Compara la programación dinámica con la exhaustiva al azar.

    Args:
        casos: Número de instancias aleatorias a probar.
        semilla: Semilla fija para que el resultado sea reproducible.
    """
    # Casos límite: sin turnos, uno solo, todos cruzados y en cadena.
    assert intervalos_ponderados([])[2] == [0]
    assert intervalos_ponderados([(8, 10, 5)])[2][1] == 5
    cruzados = [(8, 12, 3), (9, 11, 7), (10, 13, 4)]
    assert intervalos_ponderados(cruzados)[2][-1] == 7
    cadena = [(8, 9, 1), (9, 10, 2), (10, 11, 3)]
    assert intervalos_ponderados(cadena)[2][-1] == 6
    rng = random.Random(semilla)  # generador propio con semilla fija
    for _ in range(casos):
        turnos: list[Turno] = []
        for _ in range(rng.randint(1, 10)):
            inicio = rng.randint(0, 20)
            fin = inicio + rng.randint(1, 6)
            turnos.append((inicio, fin, rng.randint(1, 15)))
        orden, p, mejor = intervalos_ponderados(turnos)
        esperado = intervalos_exhaustivo(turnos)
        assert mejor[-1] == esperado, turnos  # el valor coincide
        elegidos = reconstruir_turnos(orden, p, mejor)
        total = 0
        for a in range(len(elegidos)):
            total += elegidos[a][2]
            for b in range(a + 1, len(elegidos)):
                assert not se_cruzan(elegidos[a], elegidos[b]), turnos
        assert total == esperado, turnos  # la reconstrucción suma el óptimo


verificar_intervalos()
print("Todas las instancias coinciden")
```

Tres detalles importan:

- **La regla de cruce está en un solo lugar,** `se_cruzan`, y coincide con la de `bisect_right`: dos turnos que se tocan en un extremo no se cruzan. Si su caso decide lo contrario, cambie las dos.
- **No basta verificar el valor.** También se revisa que los turnos de la reconstrucción no se crucen entre sí y que sumen el óptimo.
- **El mensaje de cada `assert`** es la instancia que falló: el punto de partida para depurar. Haga la prueba de fuego: cambie `bisect_right` por `bisect_left` y vuelva a ejecutar. La verificación debe fallar.

---

## Número de turnos frente a estudiantes atendidos

Las dos estrategias responden preguntas distintas:

| Se quiere maximizar        | Estrategia                                        | Costo      | En el ejemplo                |
| -------------------------- | ------------------------------------------------- | ---------- | ---------------------------- |
| El **número** de turnos    | Voraz: terminación más temprana                   | Θ(n log n) | 4 turnos, 14 estudiantes     |
| Los **estudiantes** (peso) | Programación dinámica de intervalos ponderados    | Θ(n log n) | 2 turnos, 19 estudiantes     |

Si todos los turnos pesaran lo mismo, maximizar el peso sería maximizar el número, y la regla voraz bastaría: esa es la condición que hace adecuada a una familia de estrategias o a la otra. Elegir qué se maximiza no es una decisión técnica sino de política, y conviene que el informe diga quién debe tomarla.

---

## Dificultades Comunes

### "Mi tabla da un valor mayor que el de la exhaustiva"

- Revise que los turnos estén **ordenados por hora de fin** antes de calcular `p`. Si no lo están, los compatibles con `j` no son un bloque al principio de la lista y `M[p(j)]` mezcla turnos que se cruzan.

### "Mis turnos elegidos se cruzan"

- Revise la convención de los extremos: `bisect_right` considera compatibles dos turnos que se tocan (uno termina cuando el otro empieza); `bisect_left`, no. Use la que corresponda a su problema y declárela.

### "La reconstrucción no suma el óptimo"

- Cuando un turno entra, el salto es a `p(j)`, no a `j − 1`: los turnos entre `p(j) + 1` y `j − 1` se cruzan con él y deben quedar fuera.

## Recursos

- **Lecciones del curso:** "Fundamentos de programación dinámica", "Estrategia voraz" y "Programación dinámica: decidir, verificar y medir".
- **Libro de texto:** Kleinberg y Tardos, _Algorithm Design_, sección 6.1 (_Weighted Interval Scheduling_); Cormen et al., _Introduction to Algorithms_, 3.ª ed., sección 16.1 y ejercicio 16.1-5 (selección de actividades con valores).
