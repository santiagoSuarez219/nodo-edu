> Sesión T1 (Semana 8, martes), teórica con demo en vivo — no hay guía de
> laboratorio para esta sesión. El laboratorio de listas/pilas es una sesión
> aparte. La lección `Implementación de pilas en Java` es lectura previa: el
> grupo ya conoce la pila de platos del escurridor (A, B y C) y respondió el
> cuestionario de cierre. Esa pila de platos es el hilo de toda la sesión:
> cada línea de código se explica volviendo a "¿qué le pasa al plato de
> arriba?". Proyectar el código de este documento en orden.

## Paso 1 — El contrato en código: las clases `Nodo<T>` y `Pila<T>`

Antes de mostrar aplicaciones, escribir en vivo las dos clases. Recordar en voz
alta la analogía: cada plato es un nodo, una cajita que guarda el dato y,
además, la referencia al plato que quedó justo debajo. La pila entera se
reduce a una sola referencia —el `tope`, el plato de arriba— porque desde ahí,
bajando de plato en plato, se llega a todos los demás. No se usa ninguna clase
ya hecha de Java (nada de `java.util`): las cinco operaciones se programan
desde cero.

```java
public class Nodo<T> {
    T dato;
    Nodo<T> siguiente; // el "plato de abajo"; null si no hay ninguno

    Nodo(T dato) {
        this.dato = dato;
        // "siguiente" queda en null: al crear un plato suelto todavía no
        // sabemos sobre qué otro plato va a quedar apoyado.
    }
}
```

Para `push`, escribir la primera versión con el error a la vista del grupo.

**🐞 Error planeado:** escribir primero `tope = nuevo;` y, en la línea de abajo,
`nuevo.siguiente = tope;` (las dos líneas en el orden equivocado).

**Síntoma:** tras `push("A")`, `push("B")`, `push("C")`, `size()` dice 3, pero
los tres `pop()` devuelven `"C"`, `"C"`, `"C"`: `nuevo.siguiente` quedó
apuntando al propio `nuevo`, y `A` y `B` nunca vuelven a aparecer.

**Pregunta al grupo:** "Si apoyo el plato nuevo y *después* miro sobre qué
plato lo apoyé, ¿dónde quedaron A y B?"

**Corrección:** es el orden del bloque de abajo. Primero el plato nuevo se
apoya en el tope actual (`nuevo.siguiente = tope`) y solo después el tope pasa
a ser el nuevo (`tope = nuevo`). Con el orden invertido, `tope` ya vale
`nuevo` cuando se lee, y la referencia al resto de la torre se pierde para
siempre.

```java
public class Pila<T> {
    private Nodo<T> tope;
    private int tamano;

    // push: única forma de agregar, siempre encima (en el tope)
    public void push(T valor) {
        Nodo<T> nuevo = new Nodo<>(valor);
        nuevo.siguiente = tope; // 1. el plato nuevo se apoya en el que hoy es el tope
        tope = nuevo;           // 2. recién ahora el plato nuevo pasa a ser el tope
        tamano++;
    }

    // pop: retira y devuelve el tope. Precondición: la pila no está vacía
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("La pila está vacía");
        }
        T valor = tope.dato;      // guardamos el dato antes de perder el nodo
        tope = tope.siguiente;    // el tope "baja" un plato
        tamano--;
        return valor;
        // el nodo retirado ya no tiene ninguna referencia apuntándolo: Java lo
        // libera solo, no hay que borrarlo a mano.
    }

    // peek: mira el plato de arriba SIN tomarlo. Misma precondición que pop
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("La pila está vacía");
        }
        return tope.dato; // solo lee, no toca "tope" ni "tamano"
    }

    // isEmpty: única forma segura de saber si pop()/peek() van a fallar
    public boolean isEmpty() {
        return tope == null; // "ningún plato apuntado" es la pila vacía
    }

    // size: cantidad de platos, ya la llevamos contada — no hay que recorrer nada
    public int size() {
        return tamano;
    }
}
```

Punto a resaltar: proyectar `push` y `pop` uno junto al otro y preguntar qué
línea de cada uno "mueve" el tope. En `push`, primero el plato nuevo se conecta
hacia abajo y solo después el tope se mueve hacia arriba; en `pop` pasa lo
simétrico: primero se guarda el dato, luego el tope baja un plato. Señalar
también que `peek` es literalmente la primera línea de `pop`, sin la que mueve
el tope: la única diferencia entre "mirar el plato" y "tomarlo" es esa
mutación. Y que ninguna operación recorre la cadena: todas trabajan sobre
`tope`.

## Paso 2 — Demo: los platos A, B y C

Es el ejemplo de apertura de la lección, ahora en código. Cada `push` es lavar
y apilar un plato; cada `pop` es tomar el de arriba.

```java
Pila<String> escurridor = new Pila<>();

escurridor.push("A");
escurridor.push("B");
escurridor.push("C"); // orden de llegada: A, B, C

System.out.println("Arriba hay: " + escurridor.peek()); // mira, no toma
// Arriba hay: C

System.out.println("Tomo: " + escurridor.pop()); // Tomo: C
System.out.println("Tomo: " + escurridor.pop()); // Tomo: B
System.out.println("Tomo: " + escurridor.pop()); // Tomo: A
// orden de salida: C, B, A — el último en entrar fue el primero en salir

System.out.println("¿Quedan platos? " + !escurridor.isEmpty()); // false
```

Punto a resaltar: pedir al grupo que prediga la salida *antes* de ejecutar y
comparar con las respuestas del cuestionario de cierre. Después del primer
`pop()`, `"A"` y `"B"` siguen encadenados debajo: nunca desaparecieron, solo
dejaron de estar arriba. La pila no se "achica" de un lado como un arreglo:
solo cambia a qué nodo apunta `tope`.

Ahora la mano en el vacío. Antes de mostrar la versión final de `pop`, borrar
en vivo el `if (isEmpty())` para que el grupo vea qué pasa.

**🐞 Error planeado:** quitar la validación de `pop()` (dejar solo `T valor =
tope.dato;`...) y llamar `escurridor.pop()` una cuarta vez, con la pila ya vacía.

**Síntoma:** `NullPointerException` en la línea `T valor = tope.dato;`. El
mensaje habla de `tope`, no de "pila vacía": quien lea el error no sabe que el
problema real fue tomar de una pila sin platos.

**Pregunta al grupo:** "En la cocina, si extiendo la mano y no hay platos, ¿me
dan 'un plato nulo'? ¿Qué debería avisarme la pila en su lugar?"

**Corrección:** restaurar la validación. `pop()` lanza
`IllegalStateException("La pila está vacía")` en el punto exacto del error, y
la ejecución muestra ese mensaje en vez de un `NullPointerException` opaco. Un
`null` (o el NPE) puede viajar lejos y estallar donde nadie lo espera; la
excepción lo hace visible en el acto.

## 🗳️ Votación — traza de push, pop y peek mezclados

Cuándo: tras el Paso 2, antes de pasar al historial de navegación. Proyectar
el código sin ejecutarlo:

```java
Pila<String> p = new Pila<>();
p.push("A");
p.push("B");
System.out.println(p.pop());
p.push("C");
System.out.println(p.peek());
System.out.println(p.size());
p.pop();
System.out.println(p.pop());
```

¿Qué imprime, línea por línea?

- (a) `B`, `C`, `2`, `A`
- (b) `B`, `C`, `1` y luego una excepción
- (c) `A`, `B`, `2`, `C`
- (d) `B`, `C`, `3`, `A`

Correcta: (a). Traza: tras `push` A y B la pila es [A, B] (B arriba); `pop`
imprime `B` y queda [A]; `push("C")` deja [A, C]; `peek` imprime `C` sin
retirarlo; `size` es 2; el `pop` sin `println` retira `C`; el último `pop`
imprime `A`.

Qué revela cada distractor:

- (b) → cree que `peek` retira el elemento (confunde mirar con tomar): con
  ese modelo `size` da 1, el `pop` sin imprimir vacía la pila y el último
  `pop` lanza la excepción de pila vacía.
- (c) → razona como fila del supermercado (FIFO): el primero que entró sale
  primero. No interiorizó LIFO.
- (d) → cree que `pop` no reduce la cuenta, o que `size` cuenta los platos
  que han pasado por la pila en vez de los que hay.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (dibuja la pila en
el tablero, línea por línea).

## Paso 3 — Demo: historial de navegación

El botón "atrás" del navegador es la misma pila de platos: cada página nueva
se apoya encima; "atrás" retira solo la de arriba.

```java
Pila<String> historial = new Pila<>();

historial.push("inicio.html");
historial.push("cursos.html");
historial.push("leccion-implementacion-pilas.html");

System.out.println("Página actual: " + historial.peek()); // consulta, no retira
// Página actual: leccion-implementacion-pilas.html

System.out.println("Atrás -> " + historial.pop()); // retira y devuelve el tope
// Atrás -> leccion-implementacion-pilas.html

System.out.println("Página actual: " + historial.peek());
// Página actual: cursos.html
```

Punto a resaltar: la barra de direcciones que muestra la página actual es
`peek`; presionar "atrás" es `pop`. Después del primer `pop()`,
`"inicio.html"` sigue en la pila, debajo de `"cursos.html"`.

## 🗳️ Votación — qué secuencias de salida son posibles

Cuándo: tras el Paso 3, antes del reto en parejas. Se apilan, en este orden,
los valores 1, 2 y 3, pero se permite hacer `pop` entre un `push` y el
siguiente (no hace falta apilar los tres primero). ¿Cuál de estas secuencias
de salida es **imposible**?

- (a) `1, 2, 3`
- (b) `3, 2, 1`
- (c) `2, 1, 3`
- (d) `3, 1, 2`

Correcta: (d). Para sacar el `3` primero hay que haber apilado 1, 2 y 3; en
ese momento la pila es [1, 2, 3] y tras retirar el 3 el tope es el `2`, así
que el 2 debe salir antes que el 1. Las demás sí se pueden: (a) `push 1`,
`pop`, `push 2`, `pop`, `push 3`, `pop`; (b) apilar los tres y retirar; (c)
`push 1`, `push 2`, `pop` (sale 2), `pop` (sale 1), `push 3`, `pop`.

Qué revela cada distractor:

- (a) → cree que la salida siempre es al revés de la entrada y que "1, 2, 3"
  es imposible; olvida que se puede retirar entre push y push.
- (b) → si eligió esta, no entiende ni el caso más básico: LIFO puro con
  todo apilado antes de retirar.
- (c) → cree que el orden de salida solo puede ser totalmente invertido o
  totalmente igual; no ve que se puede intercalar.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (simulen con tres
platos reales o tres hojas de papel).

## 👥 Reto en parejas — invertir una palabra

Tiempo sugerido: 15 min.

Roles: *driver* escribe el código, *navigator* dicta la idea y revisa; cambian
de rol a mitad del tiempo.

Enunciado: usando la clase `Pila<Character>` que acabamos de construir (sin
`StringBuilder.reverse()` ni ninguna clase de `java.util`), escriban un
método estático `invertir(String palabra)` que devuelva la palabra al revés:
`invertir("platos")` devuelve `"sotalp"`. Pista de diseño: piensen qué le pasa
a las letras si las "apilan" una por una y luego las "toman" una por una.

Solución de referencia:

```java
public static String invertir(String palabra) {
    Pila<Character> pila = new Pila<>();

    // 1. Apilar: la primera letra queda abajo; la última, en el tope
    for (char c : palabra.toCharArray()) {
        pila.push(c);
    }

    // 2. Retirar: la pila entrega las letras en orden inverso (LIFO)
    StringBuilder resultado = new StringBuilder();
    while (!pila.isEmpty()) {
        resultado.append(pila.pop()); // pop() es seguro: isEmpty() lo protege
    }

    return resultado.toString();
}
```

```java
System.out.println(invertir("platos")); // sotalp
System.out.println(invertir("A"));       // A
System.out.println(invertir(""));        // (cadena vacía: el while no corre)
```

Punto a resaltar: el ciclo `while (!pila.isEmpty())` es el uso correcto de
`isEmpty()`: protegerse antes de `pop()`. Preguntar si el resultado cambiaría
al usar una fila (FIFO): saldría igual que entró, no invertida. Este patrón
—apilar para recordar, retirar para comparar— es exactamente el del siguiente
paso.

## Paso 4 — Demo: verificación de paréntesis balanceados

Aplicación clásica que combina `push`, `pop` e `isEmpty` en un algoritmo real: cada
apertura es un plato que se apila; cada cierre debe encontrar, arriba, la
apertura que le corresponde. Como todavía no usamos ninguna clase de
`java.util`, el "diccionario" de cierres se resuelve con una comparación
simple de caracteres en vez de un `Map`. Proyectar el código completo y
ejecutarlo primero con una entrada válida y luego con una inválida.

```java
public static boolean estaBalanceada(String expresion) {
    Pila<Character> pila = new Pila<>();

    for (char c : expresion.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            pila.push(c); // es apertura: se apila para recordar su cierre
        } else if (c == ')' || c == ']' || c == '}') {
            // es un cierre: debe coincidir con el tope actual
            if (pila.isEmpty() || !coincide(pila.pop(), c)) {
                return false; // cierre sin apertura pendiente, o no coincide
            }
        }
        // cualquier otro carácter (letras, espacios) se ignora
    }

    return pila.isEmpty(); // si algo quedó sin cerrar, la pila no está vacía
}

private static boolean coincide(char apertura, char cierre) {
    return (apertura == '(' && cierre == ')')
        || (apertura == '[' && cierre == ']')
        || (apertura == '{' && cierre == '}');
}
```

```java
System.out.println(estaBalanceada("f(x[i]) + (a - b)"));  // true
System.out.println(estaBalanceada("f(x[i) + (a - b]"));   // false: cierres cruzados
System.out.println(estaBalanceada("f(x)"));                // true
```

Punto a resaltar: correr paso a paso `"f(x[i) + (a - b]"` en el tablero,
dibujando la torre de platos carácter por carácter, hasta llegar al `)` que
no coincide con el `[` que está en el tope — ahí se ve por qué `coincide`
devuelve `false` y detecta el cruce.

## Paso 5 — Demo: por qué una recursión sin caso base revienta la pila

El entorno de ejecución de Java usa una pila (la *call stack*) para recordar a
qué línea volver cuando una función termina. Es la misma pila de platos
aplicada por la JVM a las llamadas de función en vez de a datos nuestros:
cada llamada apila un plato; cada `return` toma el de arriba.

```java
public static void contarSinCasoBase(int n) {
    System.out.println("Entrando con n = " + n); // "push" implícito de esta llamada
    contarSinCasoBase(n + 1);                     // nunca retorna: nunca hay "pop"
}
```

```java
contarSinCasoBase(0);
// Entrando con n = 0
// Entrando con n = 1
// Entrando con n = 2
// ...
// Exception in thread "main" java.lang.StackOverflowError
```

Comparar contra la versión correcta, con caso base:

```java
public static int factorial(int n) {
    if (n <= 1) {
        return 1; // caso base: aquí empiezan los "pop" en cadena
    }
    return n * factorial(n - 1); // "push": la multiplicación queda pendiente
}
```

Punto a resaltar: en `factorial`, cada llamada recursiva queda "pendiente"
—multiplicar por `n`— hasta que la llamada de adentro retorna. Ese
"pendiente hasta que la de adentro termine" es exactamente la disciplina
LIFO: la última llamada en entrar (`factorial(1)`) es la primera en
completarse y empezar la cadena de retornos.

## Preguntas socráticas

- *"¿Por qué `peek` puede ser la primera línea de `pop` sin la línea que mueve
  el tope? ¿Qué operación de la cocina es cada una?"* — Respuesta esperada:
  porque ambas necesitan el dato del plato de arriba; `pop` además lo saca
  (`tope = tope.siguiente`, `tamano--`) y `peek` solo lo mira. Mirar no
  modifica la torre; tomar sí.
- *"En el Paso 4, ¿por qué el algoritmo también falla (`return
  pila.isEmpty()` al final) con la entrada `"(a - b"`, que no tiene ningún
  cierre mal puesto?"* — Respuesta esperada: porque el `(` nunca se retiró
  de la pila — al terminar de recorrer la cadena todavía queda un nodo con
  ese dato, así que `isEmpty()` es `false` y la expresión no puede
  considerarse balanceada.
- *"¿Por qué `contarSinCasoBase` termina en `StackOverflowError` y no en un
  bucle infinito silencioso?"* — Respuesta esperada: cada llamada recursiva
  ocupa espacio nuevo en la pila de llamadas (variables locales, dirección
  de retorno) — igual que cada `push` nuestro crea un `Nodo<T>` nuevo—; esa
  pila tiene un tamaño máximo fijado por la JVM, así que cuando se llena,
  lanzar la excepción es la única salida posible.
- *"¿Por qué `size()` no recorre la cadena de nodos contando uno por uno,
  en vez de usar la variable `tamano`?"* — Respuesta esperada: recorrer la
  cadena costaría más tiempo mientras más elementos tenga la pila; llevar
  `tamano` actualizado en cada `push`/`pop` permite que `size()` responda de
  forma inmediata sin importar cuántos nodos haya.

## Práctica externa

Problemas para practicar después de la sesión. Son opcionales y se resuelven
en la plataforma externa; no valen nota en el curso.

- **LeetCode 20 — Valid Parentheses** (Fácil):
  [leetcode.com/problems/valid-parentheses](https://leetcode.com/problems/valid-parentheses/). Es exactamente el
  algoritmo del Paso 4 sobre `(`, `)`, `[`, `]`, `{`, `}`; sirve para
  consolidar el patrón "apilar aperturas, comparar al cerrar".
- **LeetCode 155 — Min Stack** (Media):
  [leetcode.com/problems/min-stack](https://leetcode.com/problems/min-stack/). Pide una pila con `push`,
  `pop`, `top` y `getMin` en tiempo constante; obliga a pensar qué más puede
  guardar cada nodo además del dato.
- **HackerRank — Balanced Brackets** (Media):
  [hackerrank.com/challenges/balanced-brackets](https://www.hackerrank.com/challenges/balanced-brackets/problem). La misma
  idea con varias cadenas de entrada y respuesta `YES`/`NO`; buena segunda
  ronda tras Valid Parentheses.

> Existencia de los tres problemas (número, nombre y enlace) tomada de memoria
> del autor, no comprobada en línea durante la redacción: abrir cada enlace
> antes de asignarlo al grupo.
