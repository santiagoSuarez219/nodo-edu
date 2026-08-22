> Cubre la **única sesión** de la Semana 5 (T — teórica). La Sesión P
> (laboratorio de clasificación asintótica y verificación empírica con
> gráficas) se **eliminó del curso** (decisión del docente, 2026-08-22) — no
> se dicta en ninguna semana. No hay guía de estudiante para esta sesión T:
> la lección ya trae todo el desarrollo formal, y el único apoyo adicional
> que pidió el docente es el bloque de código de apertura de más abajo.

## Sesión T — la lección se presenta tal como está publicada

El `.mdx` de "Notación O, Θ y Ω" ya trae completo el desarrollo formal: las
tres definiciones con su cuantificador existencial, el diagrama `flowchart`
de cota ajustada, la tabla de jerarquía de funciones estándar y el cierre
que retoma merge sort e insertion sort con el vocabulario nuevo. Dictarla es
presentar la página en orden, arrancando con el bloque de código de abajo
como apoyo de la segunda sección — antes de llegar a las definiciones
formales de `O`, `Ω` y `Θ`.

### Apoyo de código — por qué el término dominante gana

La sección "Por qué ignoramos constantes y términos pequeños" de la lección
ya trae la tabla (`n = 10, 100, 1.000, 10.000`). Este bloque es solo el
complemento numérico que pidió el docente para proyectar **antes** de esa
tabla — o junto a ella —, con `f(n) = 2n²` y `g(n) = n² + 100n + 500`
evaluadas en código real en lugar de ya calculadas en la página. Es
deliberadamente simple: dos funciones, un bucle, una tabla impresa por
consola — no hace falta una gráfica de matplotlib, el print ya deja ver el
número exacto del argumento de la lección.

```python
def f(n: int) -> int:
    """Calcula 2n^2, la funcion de tiempo del primer algoritmo.

    Args:
        n: tamano de la entrada.

    Returns:
        El valor de 2 * n al cuadrado.
    """
    return 2 * n ** 2


def g(n: int) -> int:
    """Calcula n^2 + 100n + 500, la funcion de tiempo del segundo algoritmo.

    Args:
        n: tamano de la entrada.

    Returns:
        El valor de n al cuadrado mas 100n mas 500.
    """
    return n ** 2 + 100 * n + 500


if __name__ == "__main__":
    tamanos = [10, 100, 1_000, 10_000]

    encabezado = (
        f"{'n':>7} | {'f(n)=2n^2':>12} | {'g(n)':>12} | "
        f"{'resto=100n+500':>15} | {'% del total de g(n)':>20}"
    )
    print(encabezado)

    for n in tamanos:
        valor_f = f(n)
        valor_g = g(n)
        resto = 100 * n + 500  # la parte de g(n) que la notacion asintotica ignora
        porcentaje_resto = resto / valor_g * 100

        print(
            f"{n:>7} | {valor_f:>12} | {valor_g:>12} | "
            f"{resto:>15} | {porcentaje_resto:>19.1f}%"
        )
```

Salida esperada (los mismos valores que ya están en la tabla de la lección,
ahora calculados en vivo):

```
      n |    f(n)=2n^2 |         g(n) |  resto=100n+500 |  % del total de g(n)
     10 |          200 |         1600 |            1500 |                93.8%
    100 |        20000 |        20500 |           10500 |                51.2%
   1000 |      2000000 |      1100500 |          100500 |                 9.1%
  10000 |    200000000 |    101000500 |         1000500 |                 1.0%
```

Punto a resaltar: la columna de porcentaje es el argumento de la lección
hecho número — en `n = 10` el resto (`100n + 500`) es casi el 94 % de
`g(n)`; en `n = 10.000` cae a apenas el 1 %. El término `n²` no cambió de
naturaleza, solo se volvió aplastantemente más grande que todo lo demás. Es
exactamente la frase de la lección: "en `n = 10.000`, el resto apenas suma
poco más del 1 %".

Punto a resaltar: para `n = 10` y `n = 100`, `g(n) > f(n)` — el grupo puede
notar que la función "más complicada" (tres términos) da un valor mayor. Es
el momento de preguntar qué pasa si siguen aumentando `n`: la tabla ya
publicada en la lección (que este código reproduce) muestra que entre
`n = 100` y `n = 1.000` la relación se invierte — `f(n)` pasa a ser mayor y
ya no vuelve a ceder terreno.

Punto a resaltar: no cambies el rango de `tamanos` para "ajustar" el
cruce — el rango de la tabla en prosa (`10, 100, 1.000, 10.000`) es el que
el grupo ya vio en la sección, así que mantenerlo evita introducir números
nuevos que no están en la página.

### El resto de la sesión — la lección ya es autosuficiente

No hace falta código adicional para las demás secciones: son definición
formal, no cómputo. Puntos a resaltar al dictarlas:

- **Notación O:** antes de mostrar la definición con cuantificadores, plantea
  la situación en prosa tal como la lección lo hace — "nunca va a tardar más
  de tanto, sin importar qué tan mal venga la entrada". Al llegar a
  $$O(g(n)) = \{f(n) : \exists\, c, n_0 > 0 \text{ tal que } 0 \le f(n) \le c\,g(n)\ \forall n \ge n_0\}$$
  léela en voz alta término por término, señalando en el `flowchart` de la
  lección qué representa `n₀` (el punto de corte) y qué representa `c`
  (cuánto se permite estirar `g(n)` hacia arriba). Cierra con el ejemplo ya
  resuelto: el peor caso de insertion sort pertenece a `O(n²)`.
- **Notación Ω:** insiste en que es el espejo exacto de `O` — la misma
  definición con la desigualdad invertida. Vale la pena escribir ambas
  fórmulas una debajo de la otra en el tablero o remarcarlas en pantalla, no
  solo leerlas por separado, para que el grupo vea de un vistazo que
  únicamente cambió $f(n) \le c\,g(n)$ por $c\,g(n) \le f(n)$. El ejemplo de
  la lección es el mejor caso de insertion sort en `Ω(n)`: usa la pregunta
  "¿por qué nunca puede bajar de lineal?" (hay que revisar cada uno de los
  `n` elementos al menos una vez) antes de que el grupo la vea respondida en
  la página.
- **Notación Θ:** es el punto donde conviene detenerse más tiempo, porque es
  la afirmación que el curso va a usar de aquí en adelante para casi todo.
  Remarca la lectura: `Θ` no es una tercera cota independiente, es `O` y `Ω`
  cumpliéndose **a la vez** sobre la misma `g(n)`. El `flowchart` de "cota
  ajustada" de la lección (`f(n)` encajonada entre `c₁·g(n)` y `c₂·g(n)`) es
  el diagrama que sostiene esta idea — dibújalo de nuevo a mano si el grupo
  no lo sigue en la pantalla. Cierra con el contraste que la lección deja
  explícito: insertion sort **no tiene** un único `Θ` — es `Θ(n)` en su
  mejor caso y `Θ(n²)` en su peor caso — y eso es correcto, no una
  contradicción: cada cota ajustada describe un caso distinto del mismo
  algoritmo.
- **Jerarquía de funciones estándar:** la tabla de familias es el material
  más fácil de subestimar — insiste en que la separación entre familias no
  es gradual, es un salto de escala: proponle al grupo evaluar un par de
  familias consecutivas en un `n` concreto (por ejemplo `n = 20`) para que
  vean en vivo cuánto se dispara el valor al pasar de una familia a la
  siguiente, en vez de solo leer el orden de la tabla.
- **Comparación final merge sort vs. insertion sort:** aquí es donde el
  vocabulario nuevo paga su lugar. Antes de mostrar el bloque de código con
  `trabajo_cuadratico` y `trabajo_linearitmico`, pregunta al grupo: "¿cómo se
  dice ahora, con notación, lo que la semana pasada llamábamos 'insertion
  sort crece como el cuadrado'?" — la respuesta es `Θ(n²)`. Ejecuta el
  script ya publicado en la lección en vivo (no hace falta reescribirlo) y
  deja que el grupo vea el número exacto de la razón entre ambos trabajos
  para `n = 1.850.000`. Cierra retomando el cálculo de energía de la Semana
  4 (1.451 kWh/año de diferencia): con el vocabulario de hoy, esa brecha
  tiene nombre — es la distancia entre `Θ(n²)` y `Θ(n log n)`.
- **Enlace hacia la Semana 6:** la síntesis de la lección afirma directamente
  que `T(n) = 2T(n/2) + Θ(n)` resulta `Θ(n log n)` en todos los casos, sin
  marcar en la página que esa resolución queda pendiente — así que es el
  docente quien debe decirlo en voz alta: ese resultado queda **anticipado**
  hoy sin demostrarse todavía. La demostración formal (sustitución, árbol de
  recursión, método maestro) es exactamente el contenido de la Semana 6, y
  reutiliza `O`, `Θ` y `Ω` tal como quedaron definidas hoy, sin volver a
  introducirlas. Vale la pena decirlo explícitamente para que el grupo no
  espere ver la resolución de la recurrencia en esta sesión.

## Preguntas socráticas

- *"`g(n) = n² + 100n + 500` da un valor más alto que `f(n) = 2n²` para
  `n = 10` y `n = 100`, pero más bajo para `n = 1.000` y `n = 10.000`. Si
  tuvieran que elegir una sola función para describir el crecimiento de
  `g(n)` cuando `n` es grande, ¿por qué no seguiría siendo justo decir
  '`g(n)` es una función de tres términos, más grande que `f(n)`'?"* —
  Respuesta esperada: porque esa afirmación describe solo un rango chico de
  `n`, y la notación asintótica está pensada para lo que pasa cuando `n`
  crece sin límite; ahí el término `n²` domina por completo a `100n + 500` —
  el resto cae a apenas el 1 % del total en `n = 10.000` — así que ambas
  funciones son, en esencia, del mismo orden de crecimiento (`Θ(n²)`),
  aunque para `n` chico una parezca más grande que la otra.
- *"¿Por qué la definición de `O(g(n))` exige que la desigualdad se cumpla
  solo a partir de un `n₀`, y no para todo `n` desde el principio?"* —
  Respuesta esperada: porque para valores chicos de `n` es común que `f(n)`
  supere a `c · g(n)` sin que eso diga nada sobre el crecimiento real del
  algoritmo — es exactamente lo que se vio con `f(n)` y `g(n)` en `n = 10`;
  exigir la desigualdad desde `n = 0` haría que casi ninguna función
  perteneciera a ninguna clase asintótica útil.
- *"Insertion sort no tiene un único `Θ`: es `Θ(n)` en su mejor caso y
  `Θ(n²)` en su peor caso. ¿Es eso una contradicción con la idea de que `Θ`
  es 'la afirmación más precisa posible' sobre un algoritmo?"* — Respuesta
  esperada: no, porque `Θ` describe con precisión un comportamiento dado, no
  garantiza que un algoritmo tenga uno solo; insertion sort simplemente se
  comporta distinto según la entrada, y cada uno de esos comportamientos
  (mejor caso, peor caso) tiene su propia cota ajustada, ambas igual de
  precisas para lo que describen.
- *"¿Por qué decir que el peor caso de insertion sort es `O(n²)` es una
  afirmación más débil que decir que es `Θ(n²)`, si en ambos casos el
  algoritmo hace el mismo trabajo?"* — Respuesta esperada: `O(n²)` solo
  garantiza que el algoritmo nunca es peor que cuadrático, pero sería
  igualmente correcto (aunque poco informativo) decir que insertion sort en
  su peor caso es `O(n³)` o `O(2ⁿ)` — cotas superiores válidas pero flojas;
  `Θ(n²)` en cambio afirma que el crecimiento es exactamente ese, ni más
  rápido ni más lento, lo que descarta esas cotas superiores más flojas.
- *"En la jerarquía de funciones, pasar de `n²` a `2ⁿ` en `n = 20` multiplica
  el valor por más de 2.600 veces. Si un algoritmo exponencial resolviera el
  archivo de 1.850.000 lecturas de la empresa, ¿alcanzaría con esperar a que
  salga hardware más rápido, como se discutió en la Semana 3 con el
  Algoritmo A y B?"* — Respuesta esperada: no — un salto de familia de
  crecimiento (de polinomial a exponencial) no se compensa con mejoras de
  hardware, que solo dividen el tiempo por un factor constante; para
  `n = 1.850.000` un algoritmo exponencial sería inviable sin importar qué
  tan rápida sea la máquina, mientras que la diferencia entre `Θ(n²)` y
  `Θ(n log n)` — la que sí importa hoy para la empresa — es precisamente el
  tipo de brecha que la notación asintótica permite cuantificar con
  precisión.
- *"La recurrencia de merge sort, `T(n) = 2T(n/2) + Θ(n)`, quedó anticipada
  hoy como `Θ(n log n)` sin demostrarlo. ¿Por qué no basta con confiar en el
  resultado y seguir usándolo, en vez de demostrarlo formalmente en la
  Semana 6?"* — Respuesta esperada: porque el resultado adelantado solo vale
  para esta recurrencia particular; sin un método general (sustitución,
  árbol de recursión, método maestro) el curso no tendría forma de resolver
  otras recurrencias que aparezcan más adelante con estructuras distintas —
  la demostración no es un formalismo de más, es la herramienta reutilizable
  que generaliza lo que hoy se aceptó solo para merge sort.
