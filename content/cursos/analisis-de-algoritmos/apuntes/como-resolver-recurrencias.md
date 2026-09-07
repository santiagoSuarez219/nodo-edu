> Cubre la **única sesión** de la Semana 6 (T — teórica). La lección ya trae
> las tres secciones formales (sustitución, árbol de recursión, método
> maestro); estos apuntes son el guion de cómo dictarlas, con el desarrollo
> completo del método de sustitución sobre varios ejemplos, no solo merge
> sort.

## Sesión T — la lección se presenta tal como está publicada

### Método de sustitución

La lección resuelve $T(n) = 2T(n/2) + \Theta(n)$ (merge sort) con este
método en su sección "El método de sustitución". El guion de abajo
desarrolla el mismo ejemplo con más detalle del que cabe en la página, y
agrega tres ejemplos adicionales (búsqueda binaria, factorial, Fibonacci)
para mostrar en vivo dónde el método es fácil, dónde se pone medio y dónde
se pone difícil.

**Idea a transmitir antes de tocar el álgebra:** el método de sustitución es
el más "manual" de los tres — consiste en **adivinar** la forma de la
solución y luego **demostrar por inducción** que esa adivinanza es correcta.
No es "adivinar y ya": es "adivinar y demostrar".

#### Ejemplo guía — merge sort, paso a paso

**1. Planteamos la recurrencia.** Merge sort divide el arreglo en 2 mitades,
ordena cada una recursivamente, y luego combina (`merge`) en tiempo lineal:

$$T(n) = 2T(n/2) + O(n)$$

Para simplificar el álgebra, se reemplaza el `O(n)` por una constante `c`
multiplicando a `n`:

$$T(n) = 2T(n/2) + cn$$

**2. Adivinamos la solución.** La intuición (que da el árbol de recursión,
la siguiente sección de la lección) es que la respuesta es
$T(n) = O(n\log n)$. La conjetura a demostrar es:

$$T(n) \leq c\, n \log n \quad \text{para algún } c > 0$$

**3. Demostramos por inducción — el paso clave.** Se asume que la hipótesis
es cierta para tamaños **menores** que `n` (hipótesis inductiva) y se
verifica que se cumple para `n`. Si $T(n/2) \leq c\,(n/2)\log(n/2)$, se
sustituye en la recurrencia original:

$$T(n) \leq 2\left[c\,\frac{n}{2}\log\left(\frac{n}{2}\right)\right] + cn$$

Se simplifica paso a paso — vale la pena escribir cada uno en el tablero, no
saltar directo al resultado:

$$T(n) \leq c\,n\log\left(\frac{n}{2}\right) + cn$$

$$T(n) \leq c\,n(\log n - \log 2) + cn$$

$$T(n) \leq c\,n\log n - c\,n\log 2 + cn$$

Como $\log 2 = 1$:

$$T(n) \leq c\,n\log n - cn + cn = c\,n\log n$$

Se llega exactamente a lo que se quería demostrar: $T(n) \leq c\,n\log n$,
la misma forma de la hipótesis. Eso confirma que la conjetura era correcta y
cierra la inducción.

**4. Caso base.** No hay que olvidar verificarlo (por ejemplo `n = 1` o
`n = 2`): ahí simplemente se elige una constante `c` suficientemente grande
para que la desigualdad se cumpla también en ese punto. Esto "ancla" la
inducción — sin caso base, el paso inductivo por sí solo no prueba nada.

**Punto a resaltar — por qué esta hipótesis y no otra.** El término `-cn`
que aparece al expandir $\log(n/2)$ es justo lo que cancela el `+cn` del
costo de combinar. Esa cancelación exacta es la razón por la que
$c\,n\log n$ funciona. Conviene mostrarlo fallando con una hipótesis más
débil, $T(n) \leq cn$ (lineal):

$$T(n) \leq 2(c \cdot n/2) + cn = cn + cn = 2cn$$

Y $2cn \not\leq cn$. Esto le dice al grupo que la conjetura era **demasiado
optimista** — hace falta algo que crezca más rápido que `n`, como
`n log n`. Vale la pena dejar este fallo escrito al lado del éxito: es lo
que más ayuda a entender que el método no es magia, es prueba y error
guiado por el álgebra.

#### Ejemplos adicionales — mismo método, tres dificultades distintas

Sirven para mostrar que el método aplica más allá de merge sort, y que la
dificultad real no está en el álgebra sino en **adivinar bien la forma de
la respuesta**.

**Búsqueda binaria — el caso más simple.**

Recurrencia: $T(n) = T(n/2) + c$ (una sola llamada recursiva, no dos, más
trabajo constante para comparar).

Conjetura: $T(n) \leq c_1 \log n$ para algún $c_1$.

Sustitución, asumiendo $T(n/2) \leq c_1 \log(n/2)$:

$$T(n) \leq c_1\log(n/2) + c = c_1(\log n - 1) + c = c_1\log n - c_1 + c$$

Se quiere que esto sea $\leq c_1 \log n$, así que hace falta
$-c_1 + c \leq 0$, es decir $c_1 \geq c$. Con $c_1 = c$ queda demostrado:
$T(n) = O(\log n)$. Es el caso más fácil de los cuatro — una sola resta en
el argumento (no una división que produzca dos términos) y el álgebra es
casi mecánica.

**Factorial — igual de mecánico, pero sin división.**

Recurrencia: $T(n) = T(n-1) + c$.

Conjetura: $T(n) \leq c_1 n$.

Sustitución, asumiendo $T(n-1) \leq c_1(n-1)$:

$$T(n) \leq c_1(n-1) + c = c_1 n - c_1 + c$$

Hace falta $-c_1 + c \leq 0 \Rightarrow c_1 \geq c$. Con $c_1 = c$:
$T(n) = O(n)$. Patrón a nombrar en voz alta: cada vez que la recurrencia
resta una constante al tamaño (en vez de dividir), el método tiende a dar
resultados **lineales**.

**Fibonacci recursivo ingenuo — donde el método se pone interesante.**

Recurrencia: $T(n) = T(n-1) + T(n-2) + c$.

*Primer intento — conjetura ingenua* (calcada del patrón anterior):
$T(n) \leq c_1 n$.

$$T(n) \leq c_1(n-1) + c_1(n-2) + c = c_1(2n - 3) + c$$

Esto es $2c_1 n - 3c_1 + c$, que **no** es $\leq c_1 n$ para `n` grande — el
coeficiente de `n` es $2c_1$, no $c_1$. La conjetura lineal falla, y con
razón: Fibonacci crece exponencialmente, no linealmente. Vale la pena
detenerse aquí y preguntar al grupo *por qué* falló, antes de mostrar el
segundo intento.

*Segundo intento — conjetura exponencial:* $T(n) \leq c_1 \cdot 2^n$.

$$T(n) \leq c_1 2^{n-1} + c_1 2^{n-2} + c = c_1 2^n\left(\frac{1}{2} + \frac{1}{4}\right) + c = c_1 2^n \cdot \frac{3}{4} + c$$

Como $\frac{3}{4} \cdot 2^n \leq 2^n$, y la constante `c` se absorbe con un
caso base adecuado, esto sí funciona: $T(n) = O(2^n)$.

**Detalle importante para cerrar el ejemplo:** esta cota es correcta pero
**no es ajustada** (*tight*). El valor real de Fibonacci crece como
$\phi^n \approx 1.618^n$ (la razón áurea), mucho menor que $2^n$. Demostrar
la cota ajustada con sustitución exige una conjetura más fina,
$T(n) \leq c_1 \phi^n$, y el álgebra usa la propiedad especial
$\phi^2 = \phi + 1$ — mencionarlo como algo que existe, sin necesidad de
desarrollarlo en clase, para que el grupo no se quede pensando que
`O(2^n)` es "la" respuesta final para Fibonacci.

#### Tabla de cierre del bloque — para proyectar o copiar al tablero

| Algoritmo | Recurrencia | Resultado | Dificultad |
| --- | --- | --- | --- |
| Búsqueda binaria | $T(n/2) + c$ | $O(\log n)$ | Fácil |
| Factorial | $T(n-1) + c$ | $O(n)$ | Fácil |
| Merge sort | $2T(n/2) + cn$ | $O(n\log n)$ | Media |
| Fibonacci | $T(n-1)+T(n-2)+c$ | $O(2^n)$ (real: $\Theta(\phi^n)$) | Difícil — la conjetura correcta no es obvia |

**Punto a resaltar al cerrar el bloque:** la fila de dificultad no es
decorativa — es literalmente la lección del método de sustitución. Cuando
la recurrencia resta (búsqueda binaria, factorial), adivinar es casi
automático. Cuando divide con dos llamadas del mismo tamaño (merge sort),
hace falta ya haber visto el árbol de recursión (siguiente sección) para no
adivinar a ciegas. Cuando suma dos llamadas de tamaños distintos y
decrecientes (Fibonacci), ni siquiera el árbol de recursión da la conjetura
ajustada a simple vista — ahí es donde el método de sustitución muestra su
límite real, y por qué el método maestro (dos secciones más adelante) no lo
puede resolver.

### Método del árbol de recursión

La lección resuelve $T(n) = 2T(n/2) + \Theta(n)$ (merge sort) con este
método en su sección "El método del árbol de recursión", con un diagrama
`flowchart` de 3 niveles y la fórmula final ya cerrada. El guion de abajo
desarrolla el mismo dibujo con el detalle de cada nivel, y agrega búsqueda
binaria y factorial como los dos casos "en cadena" — el contraste que más
ayuda a ver qué determina la forma del árbol.

**Idea a transmitir antes de dibujar nada:** el árbol de recursión es el
método más visual e intuitivo de los tres — dibuja cada llamada recursiva
como un nodo, suma el trabajo en cada nivel, y luego suma todos los
niveles. No reemplaza a la sustitución: es la herramienta para **generar**
la conjetura que la sustitución después verifica por inducción.

#### Ejemplo guía — merge sort, nivel por nivel

**1. Partimos de la misma recurrencia** que en el bloque de sustitución:

$$T(n) = 2T(n/2) + cn$$

**2. Construimos el árbol nivel por nivel.** Dibujar cada nivel en el
tablero según se avanza, no de una vez:

```
Nivel 0:              cn                    → costo total: cn
Nivel 1:       c(n/2)        c(n/2)          → costo total: 2·c(n/2) = cn
Nivel 2:   c(n/4) c(n/4)  c(n/4) c(n/4)      → costo total: 4·c(n/4) = cn
```

Nivel 0 (la raíz): una sola llamada de tamaño `n`, con costo `cn` (el
trabajo de hacer el `merge`, sin contar las llamadas recursivas). Nivel 1:
esa llamada se parte en 2 subllamadas de tamaño `n/2`, cada una con costo
`c(n/2)`, pero hay 2 nodos. Nivel 2: cada uno de esos 2 nodos se parte en 2
más, dando 4 nodos de tamaño `n/4`, cada uno con costo `c(n/4)`.

**Punto a resaltar:** en cada nivel, sin importar cuántos nodos haya, el
costo total suma exactamente `cn`. Es porque cada vez que el tamaño se
divide a la mitad, la cantidad de nodos se duplica — se cancelan
perfectamente. Vale la pena dejar que el grupo lo verifique en voz alta con
el nivel 2 antes de generalizar.

**3. Generalizamos al nivel `i`.** Hay $2^i$ nodos, cada uno de tamaño
$n/2^i$, con costo $c \cdot (n/2^i)$. Costo total del nivel:

$$2^i \cdot c \cdot \frac{n}{2^i} = cn$$

Cada nivel cuesta `cn`, sin importar en qué nivel se esté. Esto reduce el
problema a una sola pregunta: cuántos niveles tiene el árbol.

**4. ¿Cuándo termina el árbol?** Cuando el tamaño del subproblema llega a 1
(el caso base):

$$\frac{n}{2^i} = 1 \quad \Rightarrow \quad 2^i = n \quad \Rightarrow \quad i = \log_2 n$$

El árbol tiene $\log_2 n + 1$ niveles (del nivel 0 al nivel $\log_2 n$).

**5. Sumamos todos los niveles:**

$$T(n) = \underbrace{cn + cn + \cdots + cn}_{\log_2 n + 1 \text{ veces}} = cn(\log_2 n + 1) = cn\log_2 n + cn$$

En notación asintótica, dejando solo el término dominante:

$$T(n) = O(n\log n)$$

**Punto a resaltar:** exactamente lo que ya se verificó con sustitución —
pero aquí se **derivó** la respuesta desde cero con un dibujo, en vez de
tener que adivinarla. Es el argumento para presentar este método después
del de sustitución y no antes: primero se vio que adivinar mal cuesta caro
(la hipótesis lineal fallida), y ahora se ve una forma sistemática de no
tener que adivinar.

**6. El detalle de las hojas — no saltárselo.** El último nivel (las hojas,
donde $n/2^i = 1$) ya no cuesta `cn` por la fórmula del merge — cada hoja
cuesta una constante `c` (el costo de "ordenar" un elemento). Como hay
$2^{\log_2 n} = n$ hojas, el costo de ese nivel es $n \cdot c = cn$, que
casualmente es el mismo orden de magnitud que los demás niveles y no
cambia el resultado. Advertir al grupo que esto **no siempre pasa** — en
otras recurrencias el costo de las hojas puede ser el término que domina
toda la suma (es exactamente lo que ocurre en Fibonacci, mencionado más
abajo).

#### Ejemplos adicionales — los árboles "en cadena", sin ramificar

**Búsqueda binaria — el árbol no se ramifica.**

Recurrencia: $T(n) = T(n/2) + c$ (una sola llamada recursiva, no dos, y
trabajo extra constante — comparar el elemento medio y decidir hacia qué
mitad seguir).

```
Nivel 0:        c              (tamaño n)
Nivel 1:        c              (tamaño n/2)
Nivel 2:        c              (tamaño n/4)
```

**Punto a resaltar — el contraste con merge sort:** ahí en cada nivel el
número de nodos se duplicaba (1, 2, 4, 8…) pero el tamaño de cada nodo se
reducía a la mitad, y esos dos efectos se cancelaban dando `cn` por nivel.
Aquí el número de nodos es **siempre 1** — el árbol es literalmente una
cadena, no un árbol ramificado. Por eso cada nivel cuesta simplemente `c`
(constante), no `cn`.

Generalizando al nivel `i`: 1 nodo, tamaño $n/2^i$, costo `c` — costo total
del nivel: `c`. El árbol termina cuando $n/2^i = 1$, es decir
$i = \log_2 n$, así que hay $\log_2 n + 1$ niveles. Sumando:

$$T(n) = \underbrace{c + c + \cdots + c}_{\log_2 n + 1 \text{ veces}} = c(\log_2 n + 1) = O(\log n)$$

Exactamente lo mismo que con sustitución, ahora derivado en vez de
adivinado.

**Factorial — la misma cadena, pero que se reduce lento.**

Recurrencia: $T(n) = T(n-1) + c$ (una sola llamada recursiva, trabajo extra
constante — multiplicar `n` por el resultado de la llamada recursiva es
`O(1)`).

```
Nivel 0:        c              (tamaño n)
Nivel 1:        c              (tamaño n-1)
Nivel 2:        c              (tamaño n-2)
```

**Punto a resaltar:** hasta aquí se ve idéntico a búsqueda binaria — una
cadena, un nodo por nivel, costo constante `c` por nodo. La diferencia está
en cómo cambia el tamaño: aquí es `n, n-1, n-2, …` (resta 1), mientras que
en búsqueda binaria era `n, n/2, n/4, …` (divide entre 2). Esa diferencia lo
cambia todo.

Generalizando al nivel `i`: 1 nodo, tamaño `n - i`, costo `c`. El árbol
termina cuando $n - i = 1$, es decir $i = n - 1$, así que hay `n` niveles —
no $\log_2 n$. Restar 1 reduce el tamaño lentamente: hace falta hacerlo `n`
veces para llegar a 1, mientras que dividir entre 2 lo hace en apenas
$\log_2 n$ pasos. Sumando:

$$T(n) = \underbrace{c + c + \cdots + c}_{n \text{ veces}} = cn = O(n)$$

Exactamente lo mismo que con sustitución.

#### Tabla de cierre del bloque — para proyectar o copiar al tablero

| | Búsqueda binaria | Factorial | Merge sort |
| --- | --- | --- | --- |
| Recurrencia | $T(n/2) + c$ | $T(n-1) + c$ | $2T(n/2) + cn$ |
| Forma del árbol | Cadena (1 hijo por nodo) | Cadena (1 hijo por nodo) | Se ramifica (2 hijos por nodo) |
| Cómo se reduce el tamaño | Divide entre 2 | Resta 1 | Divide entre 2 |
| Costo por nivel | $c$ | $c$ | $cn$ |
| Número de niveles | $\log_2 n + 1$ | $n$ | $\log_2 n + 1$ |
| Resultado | $O(\log n)$ | $O(n)$ | $O(n\log n)$ |

**Punto a resaltar al cerrar el bloque — los tres ingredientes del árbol.**
Con estos tres ejemplos ya está completo el vocabulario para predecir la
forma de cualquier árbol **antes de dibujarlo**:

1. ¿El árbol se ramifica o es una cadena? → determina cuántos nodos hay por
   nivel (búsqueda binaria/factorial: 1 nodo; merge sort: se duplica).
2. ¿Cómo se reduce el tamaño en cada llamada? → determina cuántos niveles
   tiene el árbol (dividir: $\log n$ niveles; restar: `n` niveles).
3. ¿Cuánto trabajo hay en cada nodo, aparte de recursar? → determina el
   costo por nivel (constante `c`, o proporcional al tamaño `cn`).

Vale la pena decirlo explícitamente antes de pasar al método maestro: esos
mismos tres ingredientes (cuántas llamadas recursivas hay, en qué factor se
divide el tamaño, y cómo crece el trabajo no recursivo) son exactamente lo
que el método maestro empaqueta en una fórmula, sin dibujar nada — el grupo
va a reconocer de dónde sale cada parte de esa fórmula.

**Mención rápida de Fibonacci (sin dibujarlo en detalle):** con
$T(n) = T(n-1) + T(n-2) + c$ el árbol **no es balanceado** — una rama baja
de a 1 en 1 y la otra de a 2 en 2, así que unas ramas son mucho más
profundas que otras. Como cada nodo interno solo aporta la constante `c`
(no algo proporcional a `n`), casi todo el costo total viene de contar
cuántos nodos hoja hay — y ese conteo es justo lo que lleva, de forma
natural, a la fórmula con $\phi^n$ ya vista en el bloque de sustitución. No
hace falta dibujarlo completo en clase; basta con nombrar por qué es el
caso difícil también para este método: el árbol no balanceado hace que
"sumar nivel por nivel" deje de ser tan directo como en los tres ejemplos
de arriba.

### Método maestro

La lección resuelve $T(n) = 2T(n/2) + \Theta(n)$ (merge sort) con este
método en su sección "El método maestro", con la tabla de los tres casos y
el `flowchart` de decisión. El guion de abajo agrega el desarrollo completo
de búsqueda binaria (Caso 2 también, para reforzar el patrón) y el punto
más importante para esta sesión: **por qué el método no aplica** a
factorial ni a Fibonacci, que son justo los dos ejemplos que ya se
resolvieron con los otros dos métodos.

**Idea a transmitir antes de la fórmula:** el método maestro es el más
rápido de los tres cuando aplica — es literalmente una receta que empaqueta
todo el razonamiento del árbol de recursión en una fórmula, sin dibujar ni
adivinar nada. Pero solo funciona para un tipo específico de recurrencia,
así que lo primero es reconocer esa forma, no memorizar los tres casos.

#### La forma que exige la recurrencia

$$T(n) = a\,T\!\left(\frac{n}{b}\right) + f(n)$$

- $a \geq 1$: cuántas llamadas recursivas hay (cuántos "hijos" tiene cada
  nodo del árbol).
- $b > 1$: por qué factor se divide el tamaño en cada llamada.
- $f(n)$: el trabajo hecho en cada nodo, **sin contar** las llamadas
  recursivas.

**Punto a resaltar:** son exactamente los tres ingredientes que el grupo ya
identificó dibujando árboles en el bloque anterior — ramificación (`a`),
qué tan rápido se reduce el tamaño (`b`), y trabajo por nodo (`f(n)`). Vale
la pena decirlo así, en esas palabras, para que el método maestro no se
sienta como una fórmula nueva y aislada sino como el mismo análisis ya
hecho, ahora empaquetado.

#### La idea detrás de la fórmula — qué compara

El método maestro compara dos cantidades: el trabajo total en las hojas
(el "fondo" del árbol), que resulta ser $n^{\log_b a}$ — el **costo
recursivo** —, y el trabajo en la raíz, $f(n)$ — el **costo
no-recursivo**. La pregunta central es cuál de los dos domina, y de ahí
salen los tres casos ya presentados en la lección:

- **Caso 1:** $f(n)$ crece **más lento** que $n^{\log_b a}$ (polinomialmente
  menor) → $T(n) = \Theta(n^{\log_b a})$. Las hojas dominan — el trabajo
  está "abajo" del árbol.
- **Caso 2:** $f(n)$ crece **al mismo ritmo** que $n^{\log_b a}$ →
  $T(n) = \Theta(n^{\log_b a}\log n)$. Todos los niveles aportan lo mismo.
- **Caso 3:** $f(n)$ crece **más rápido** que $n^{\log_b a}$ (y cumple la
  condición de regularidad) → $T(n) = \Theta(f(n))$. La raíz domina — el
  trabajo está "arriba" del árbol.

#### Ejemplo guía — merge sort, paso a paso

**1. Identificar `a`, `b` y `f(n)` comparando contra la forma general.**
Se escribe la recurrencia de merge sort al lado de la forma que exige el
método, término a término:

$$T(n) = \underbrace{2}_{a}\,T\!\left(\frac{n}{\underbrace{2}_{b}}\right) + \underbrace{cn}_{f(n)}$$

De ahí sale directo: $a = 2$ (dos llamadas recursivas — dos mitades del
arreglo), $b = 2$ (cada mitad tiene tamaño $n/2$), $f(n) = cn$ (el costo de
`merge`, sin contar las llamadas recursivas).

**2. Calcular $n^{\log_b a}$.** Se sustituyen los valores de `a` y `b`:

$$n^{\log_b a} = n^{\log_2 2}$$

$\log_2 2 = 1$ (2 elevado a la 1 da 2), así que:

$$n^{\log_b a} = n^1 = n$$

**Punto a resaltar:** este número, `n`, es el **costo recursivo** — lo que
costaría el árbol si `f(n)` no aportara nada y todo el trabajo viniera de
las hojas. Vale la pena conectar esto con el bloque de árbol de recursión:
ahí se contó que hay `n` hojas en el nivel final, cada una con costo
constante — el mismo `n` que aparece aquí no es casualidad.

**3. Comparar `f(n)` contra $n^{\log_b a}$.** Se tiene $f(n) = cn$ y
$n^{\log_b a} = n$. Ambas son de orden `n` — $f(n) = \Theta(n^{\log_b a})$,
ni más lento ni más rápido. Esto ubica la recurrencia exactamente en el
**Caso 2** (el "empate"), no en el 1 ni en el 3.

**4. Aplicar la fórmula del caso que corresponde.** El Caso 2 dice
$T(n) = \Theta(n^{\log_b a}\log n)$. Sustituyendo $n^{\log_b a} = n$:

$$T(n) = \Theta(n\log n)$$

**Punto a resaltar al cerrar el ejemplo:** exactamente el mismo resultado
que costó una demostración completa por inducción (sustitución) y un
dibujo de árbol nivel por nivel (árbol de recursión) — aquí salió de
identificar tres letras y comparar dos expresiones. Es el argumento central
de por qué el método maestro es "el atajo": no reemplaza el razonamiento de
los otros dos métodos, lo empaqueta en una comparación.

#### Ejemplo — búsqueda binaria, el mismo paso a paso

**1. Identificar `a`, `b` y `f(n)`.**

$$T(n) = \underbrace{1}_{a}\,T\!\left(\frac{n}{\underbrace{2}_{b}}\right) + \underbrace{c}_{f(n)}$$

Aquí $a = 1$ (una sola llamada recursiva — solo se sigue por una mitad, la
otra se descarta), $b = 2$ (esa mitad tiene tamaño $n/2$), $f(n) = c$ (el
costo de comparar contra el elemento medio, constante).

**Punto a resaltar:** conviene detenerse en `a = 1` — es el detalle que más
se presta a confusión. No hay "cero llamadas ramificadas": `a` cuenta
cuántas llamadas recursivas hace el algoritmo, y aquí es exactamente una,
no dos como en merge sort. Compararlo con el árbol de recursión del bloque
anterior ayuda: ahí ya se vio que este árbol es una cadena, no que se
ramifica.

**2. Calcular $n^{\log_b a}$.**

$$n^{\log_b a} = n^{\log_2 1}$$

$\log_2 1 = 0$ (2 elevado a la 0 da 1), así que:

$$n^{\log_b a} = n^0 = 1$$

**Punto a resaltar:** un exponente 0 hace que el costo recursivo sea
literalmente constante, `1` — no depende de `n`. Vale la pena preguntar al
grupo por qué tiene sentido que sea así antes de seguir: con una sola rama
por nivel, el "ancho" del árbol nunca crece, así que el trabajo de las
hojas no puede depender de `n` de la misma forma que en un árbol que se
ramifica.

**3. Comparar `f(n)` contra $n^{\log_b a}$.** Se tiene $f(n) = c$
(constante) y $n^{\log_b a} = 1$ (también constante, no depende de `n`).
Son del mismo orden — $f(n) = \Theta(n^{\log_b a})$. Otra vez el Caso 2, el
"empate".

**4. Aplicar la fórmula del Caso 2.** $T(n) = \Theta(n^{\log_b a}\log n)$,
sustituyendo $n^{\log_b a} = 1$:

$$T(n) = \Theta(1 \cdot \log n) = \Theta(\log n)$$

**Punto a resaltar al cerrar el ejemplo:** coincide con lo ya obtenido por
sustitución y por árbol de recursión. Con merge sort y búsqueda binaria
resueltos paso a paso, el grupo tiene dos aplicaciones completas del método
—ambas caen en el Caso 2, pero por razones distintas ($n^{\log_b a}$ vale
`n` en un caso y `1` en el otro)— antes de ver, en el siguiente bloque, por
qué la fórmula ni siquiera se puede intentar con factorial o Fibonacci.

#### El punto más importante de la sesión — por qué NO aplica a factorial ni a Fibonacci

Esto es la trampa que hay que remarcar explícitamente, no dejar que el
grupo lo infiera solo:

- **Factorial:** $T(n) = T(n-1) + c$. El argumento es $n - 1$, **no**
  $n/b$. El método maestro exige que el tamaño se divida por un factor
  constante, no que se le reste una constante. Como la recurrencia no tiene
  la forma $aT(n/b) + f(n)$, el método maestro **no aplica** — hay que
  volver a sustitución o árbol de recursión, exactamente los métodos ya
  usados para resolverla en los bloques anteriores.
- **Fibonacci:** $T(n) = T(n-1) + T(n-2) + c$. Hay dos llamadas recursivas,
  pero con argumentos *distintos* ($n-1$ y $n-2$), y ambas son restas, no
  divisiones. Tampoco encaja en la forma exigida. De nuevo, no aplica.

**Punto a resaltar:** no es una limitación menor del método — es la razón
por la que el curso enseña los tres métodos y no solo el más rápido. El
método maestro cubre exactamente la familia de recurrencias "divide y
vencerás con subproblemas de tamaño igual"; fuera de esa familia (restas en
vez de divisiones, o términos con argumentos distintos) no hay forma de
forzarlo a aplicar, y los otros dos métodos — más laboriosos pero más
generales — son los que quedan.

#### Tabla de cierre del bloque — para proyectar o copiar al tablero

| Algoritmo | Recurrencia | ¿Encaja en $aT(n/b)+f(n)$? | Método maestro |
| --- | --- | --- | --- |
| Merge sort | $2T(n/2)+cn$ | Sí ($a=2,\ b=2$) | Caso 2 → $\Theta(n\log n)$ |
| Búsqueda binaria | $T(n/2)+c$ | Sí ($a=1,\ b=2$) | Caso 2 → $\Theta(\log n)$ |
| Factorial | $T(n-1)+c$ | No (resta, no divide) | No aplica |
| Fibonacci | $T(n-1)+T(n-2)+c$ | No (dos términos distintos, restas) | No aplica |

**Punto a resaltar al cerrar el bloque — y al cerrar la sesión completa:**
esta tabla es la misma tabla de algoritmos que acompañó los tres bloques de
la sesión (sustitución y árbol de recursión), pero con una columna nueva.
Es el cierre natural para la Semana 6: los cuatro algoritmos ya se
resolvieron por al menos dos métodos independientes cada uno, y el grupo
puede ver de un vistazo que el método maestro, siendo el más rápido, es
también el que menos alcance tiene de los tres.

### Comprobación experimental — merge sort vs. insertion sort en Python

Cierre de la sesión: los tres métodos dijeron que merge sort es
$\Theta(n\log n)$ mientras que insertion sort es $\Theta(n^2)$. Este script se
proyecta al final para **ver** esa diferencia con un cronómetro real
(`time.perf_counter`) y contrastarla contra las curvas teóricas.

**Punto a resaltar antes de correrlo:** la pregunta no es "¿cuál es más
rápido?" — es "¿la forma de la curva medida coincide con la forma que predijo
la recurrencia?". Se mide, se normaliza la curva teórica con **una sola
constante** ajustada al último punto, y se superpone. Si la teoría es
correcta, ambas curvas deben quedar prácticamente encima una de la otra.

#### Parte 1 — los dos algoritmos, instrumentados

```python
"""Comparación experimental: merge sort vs. insertion sort.

Mide el tiempo real de ejecución de ambos algoritmos sobre entradas de
tamaño creciente y lo contrasta con las cotas teóricas O(n log n) y O(n^2)
obtenidas al resolver sus recurrencias.
"""

import math
import random
from time import perf_counter

import matplotlib.pyplot as plt


def insertion_sort(datos: list[int]) -> list[int]:
    """Ordena una lista con inserción directa — T(n) = T(n-1) + cn.

    Args:
        datos: Lista de enteros a ordenar. No se modifica.

    Returns:
        Una lista nueva con los mismos elementos en orden ascendente.
    """
    arreglo = list(datos)  # copia: no mutamos la entrada del experimento
    for i in range(1, len(arreglo)):
        actual = arreglo[i]
        j = i - 1
        # Desplaza a la derecha todo lo que sea mayor que 'actual'.
        # Este while es el trabajo cn de la recurrencia: en el peor caso
        # recorre los i elementos ya ordenados.
        while j >= 0 and arreglo[j] > actual:
            arreglo[j + 1] = arreglo[j]
            j -= 1
        arreglo[j + 1] = actual
    return arreglo


def merge(izquierda: list[int], derecha: list[int]) -> list[int]:
    """Combina dos listas ya ordenadas en una sola ordenada.

    Es el trabajo no recursivo f(n) = cn del método maestro: cada elemento
    de ambas mitades se copia exactamente una vez.

    Args:
        izquierda: Primera mitad, ya ordenada.
        derecha: Segunda mitad, ya ordenada.

    Returns:
        Una lista ordenada con todos los elementos de ambas mitades.
    """
    resultado: list[int] = []
    i = j = 0
    while i < len(izquierda) and j < len(derecha):
        if izquierda[i] <= derecha[j]:
            resultado.append(izquierda[i])
            i += 1
        else:
            resultado.append(derecha[j])
            j += 1
    # Una de las dos mitades quedó sin agotar: se anexa completa.
    resultado.extend(izquierda[i:])
    resultado.extend(derecha[j:])
    return resultado


def merge_sort(datos: list[int]) -> list[int]:
    """Ordena una lista dividiendo y venciendo — T(n) = 2T(n/2) + cn.

    Args:
        datos: Lista de enteros a ordenar. No se modifica.

    Returns:
        Una lista nueva con los mismos elementos en orden ascendente.
    """
    if len(datos) <= 1:  # caso base: una lista de 0 o 1 elemento ya está ordenada
        return list(datos)
    medio = len(datos) // 2  # b = 2: el tamaño se divide entre dos
    izquierda = merge_sort(datos[:medio])  # a = 2: primera llamada recursiva
    derecha = merge_sort(datos[medio:])    # a = 2: segunda llamada recursiva
    return merge(izquierda, derecha)
```

**Punto a resaltar:** señalar en pantalla las tres líneas comentadas de
`merge_sort` — `medio` es la `b`, las dos llamadas recursivas son la `a`, y
`merge` es la `f(n)`. Es literalmente la recurrencia
$T(n) = 2T(n/2) + cn$ escrita en Python; no hay que creerle a la fórmula, se
lee en el código.

#### Parte 2 — la medición con `perf_counter`

```python
def medir(algoritmo, tamano: int, repeticiones: int = 3) -> float:
    """Cronometra un algoritmo de ordenamiento sobre datos aleatorios.

    Usa perf_counter (reloj monótono de alta resolución) y se queda con el
    MEJOR tiempo de varias repeticiones: el mínimo es el menos contaminado
    por el sistema operativo, el recolector de basura u otros procesos.

    Args:
        algoritmo: Función que recibe una lista y devuelve la lista ordenada.
        tamano: Cantidad de elementos de la entrada de prueba.
        repeticiones: Cuántas veces medir antes de quedarse con el mínimo.

    Returns:
        El menor tiempo observado, en segundos.
    """
    tiempos: list[float] = []
    for _ in range(repeticiones):
        datos = [random.randint(0, 10_000) for _ in range(tamano)]
        inicio = perf_counter()   # se arranca el cronómetro DESPUÉS de generar los datos
        algoritmo(datos)
        fin = perf_counter()      # y se detiene apenas termina: solo se mide el ordenamiento
        tiempos.append(fin - inicio)
    return min(tiempos)


# Tamaños en progresión geométrica (se duplican): así el eje x cubre dos
# órdenes de magnitud con pocos puntos y la diferencia de forma se nota.
TAMANOS = [250, 500, 1000, 2000, 4000, 8000]

tiempos_insertion = [medir(insertion_sort, n) for n in TAMANOS]
tiempos_merge = [medir(merge_sort, n) for n in TAMANOS]

print(f"{'n':>6} | {'insertion (s)':>14} | {'merge (s)':>10} | {'razón':>6}")
for n, t_ins, t_mer in zip(TAMANOS, tiempos_insertion, tiempos_merge):
    print(f"{n:>6} | {t_ins:>14.5f} | {t_mer:>10.5f} | {t_ins / t_mer:>6.1f}x")
```

**Punto a resaltar mientras corre:** pedir al grupo que mire la columna
`razón` **antes** de ver la gráfica. Al duplicar `n`, insertion sort
cuadruplica su tiempo (porque $\left(2n\right)^2 = 4n^2$) mientras que merge
sort apenas lo duplica y un poquito más. La ventaja de merge sort no es
constante: **crece con `n`**. Eso es exactamente lo que significa que una
función sea de mayor orden que otra.

> ⚠️ No subir `TAMANOS` mucho más allá de 8000 con insertion sort en vivo: a
> `n = 16000` ya son varios segundos y la clase se detiene. Si sobra tiempo,
> subirlo solo para merge sort.

#### Parte 3 — la gráfica: medición vs. teoría

```python
def curva_teorica(tamanos: list[int], modelo, tiempo_ancla: float) -> list[float]:
    """Escala una curva teórica para que sea comparable con lo medido.

    La notación asintótica no fija constantes: O(n^2) describe la FORMA de
    la curva, no su altura. Para superponerla sobre los datos reales se
    ajusta una única constante c tal que la curva teórica pase exactamente
    por el último punto medido.

    Args:
        tamanos: Valores de n del experimento.
        modelo: Función de crecimiento teórico, p. ej. lambda n: n * n.
        tiempo_ancla: Tiempo medido para el mayor n (punto de anclaje).

    Returns:
        Los valores teóricos ya escalados, en segundos.
    """
    constante = tiempo_ancla / modelo(tamanos[-1])
    return [constante * modelo(n) for n in tamanos]


teorico_cuadratico = curva_teorica(
    TAMANOS, lambda n: n**2, tiempos_insertion[-1]
)
teorico_n_log_n = curva_teorica(
    TAMANOS, lambda n: n * math.log2(n), tiempos_merge[-1]
)

figura, (ejes_izq, ejes_der) = plt.subplots(1, 2, figsize=(13, 5))

# Panel izquierdo: lo medido, sin teoría — la comparación cruda.
ejes_izq.plot(TAMANOS, tiempos_insertion, "o-", label="Insertion sort (medido)")
ejes_izq.plot(TAMANOS, tiempos_merge, "s-", label="Merge sort (medido)")
ejes_izq.set_title("Tiempo real de ejecución")
ejes_izq.set_xlabel("Tamaño de la entrada (n)")
ejes_izq.set_ylabel("Tiempo (segundos)")
ejes_izq.legend()
ejes_izq.grid(True, alpha=0.3)

# Panel derecho: cada medición contra su curva teórica (línea punteada).
ejes_der.plot(TAMANOS, tiempos_insertion, "o", label="Insertion sort (medido)")
ejes_der.plot(TAMANOS, teorico_cuadratico, "--", label=r"Teórico $\Theta(n^2)$")
ejes_der.plot(TAMANOS, tiempos_merge, "s", label="Merge sort (medido)")
ejes_der.plot(TAMANOS, teorico_n_log_n, "--", label=r"Teórico $\Theta(n\log n)$")
ejes_der.set_title("Medición vs. cota teórica")
ejes_der.set_xlabel("Tamaño de la entrada (n)")
ejes_der.set_ylabel("Tiempo (segundos)")
ejes_der.set_yscale("log")  # escala log: sin ella merge sort queda aplastado contra el eje
ejes_der.legend()
ejes_der.grid(True, which="both", alpha=0.3)

figura.suptitle("Recurrencias resueltas vs. cronómetro real")
figura.tight_layout()
plt.savefig("comparacion_ordenamientos.png", dpi=150)
plt.show()
```

**Punto a resaltar en la gráfica:** los puntos medidos caen casi exactamente
sobre las líneas punteadas. Eso es lo que hay que señalar con el cursor: la
recurrencia se resolvió con álgebra en el tablero, sin tocar un computador, y
predijo la forma de una curva que un cronómetro real reprodujo. Vale la pena
nombrar también las dos desviaciones esperables — los `n` pequeños suelen
quedar fuera de la línea (las constantes ocultas y el ruido de medición pesan
más que el término dominante) y algún punto aislado puede saltarse por carga
del sistema operativo. Que la teoría sea *asintótica* significa justamente
eso: describe el comportamiento **para `n` grande**, no promete nada sobre
`n = 250`.

#### Preguntas socráticas

**¿Por qué se toma el mínimo de varias repeticiones y no el promedio?**
Porque el ruido de medición solo puede hacer que un tiempo se vea *más
grande* (interrupciones del sistema, recolección de basura), nunca más
pequeño. El mínimo es la muestra menos contaminada; el promedio arrastra los
valores atípicos hacia arriba.

**Si insertion sort es cuadrático, ¿por qué a `n = 250` puede llegar a ganarle
a merge sort?** Porque la notación asintótica descarta constantes, y las
constantes de merge sort son mayores (crea listas nuevas en cada nivel del
árbol, hace llamadas recursivas, asigna memoria). Para `n` pequeño esas
constantes dominan. Es la razón por la que las implementaciones reales de
ordenamiento (incluido el `sorted` de Python) cambian a inserción cuando el
subarreglo baja de unas pocas decenas de elementos.

**¿Qué pasaría con la gráfica si a `insertion_sort` se le pasara una lista ya
ordenada?** El `while` interno no ejecutaría ni una iteración, así que el
costo caería a $\Theta(n)$ — su mejor caso — y la curva se volvería una recta
por debajo de merge sort. Es el recordatorio de que la recurrencia
$T(n) = T(n-1) + cn$ describe el **peor caso**, y de que merge sort es
$\Theta(n\log n)$ en todos los casos: su recurrencia no depende de cómo
vengan los datos.
