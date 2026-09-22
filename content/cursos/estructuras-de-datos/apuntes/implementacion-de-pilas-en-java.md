> Sesión T1 (Semana 8, martes), teórica con demo en vivo — no hay guía de
> laboratorio para esta sesión. El laboratorio de listas/pilas es una sesión
> aparte. Proyectar el código de este documento en orden; cada paso retoma
> directamente una sección de la lección `Implementación de pilas en Java`.

## Paso 1 — El contrato en código: las clases `Nodo<T>` y `Pila<T>`

Antes de mostrar aplicaciones, dejar viendo las dos clases completas.
Recordar en voz alta la idea antes de leer código: cada nodo es como una caja
que guarda un dato y, además, la dirección de la caja que quedó justo debajo.
La pila entera se reduce a una sola referencia — el `tope` — porque desde ahí,
siguiendo las direcciones, se llega a todas las demás cajas. No se usa ninguna
clase ya hecha de Java (nada de `java.util`): las cinco operaciones se
programan desde cero.

```java
public class Nodo<T> {
    T dato;
    Nodo<T> siguiente;

    Nodo(T dato) {
        this.dato = dato;
        // "siguiente" queda en null: al crear un nodo suelto todavía no
        // sabemos qué otro nodo va a quedar debajo de él.
    }
}
```

```java
public class Pila<T> {
    private Nodo<T> tope;
    private int tamano;

    // push: única forma de agregar, siempre en el tope
    public void push(T valor) {
        Nodo<T> nuevo = new Nodo<>(valor);
        nuevo.siguiente = tope; // 1. el nodo nuevo apunta a lo que hoy es el tope
        tope = nuevo;           // 2. recién ahora el tope pasa a ser el nodo nuevo
        tamano++;
    }

    // pop: retira y devuelve el tope. Precondición: la pila no está vacía
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("pop() sobre una pila vacía");
        }
        T valor = tope.dato;      // guardamos el dato antes de perder el nodo
        tope = tope.siguiente;    // el tope "baja" un lugar
        tamano--;
        return valor;
        // el nodo viejo ya no tiene ninguna referencia apuntándolo: Java lo
        // libera solo, no hay que borrarlo a mano.
    }

    // peek: consulta el tope SIN modificar la pila. Misma precondición que pop
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("peek() sobre una pila vacía");
        }
        return tope.dato; // solo lee, no toca "tope" ni "tamano"
    }

    // isEmpty: única forma segura de saber si pop()/peek() van a fallar
    public boolean isEmpty() {
        return tope == null; // "ninguna caja apuntada" es la pila vacía
    }

    // size: cantidad de elementos, ya la llevamos contada — no hay que recorrer nada
    public int size() {
        return tamano;
    }
}
```

Punto a resaltar: proyectar `push` y `pop` uno junto al otro y preguntar qué
línea de cada uno "mueve" el tope. En `push`, primero el nodo nuevo se conecta
hacia abajo (`nuevo.siguiente = tope`) y solo después el tope se mueve hacia
arriba (`tope = nuevo`); si se invierte ese orden, se pierde la referencia a
toda la pila que había debajo. En `pop` pasa lo simétrico: primero se guarda
el dato, luego el tope "baja" un lugar (`tope = tope.siguiente`). Señalar
también que `peek` es literalmente la primera línea de `pop`, sin la que
mueve el tope: la única diferencia entre "mirar" y "retirar" es esa mutación.

## Paso 2 — Demo: historial de navegación

Retomar el ejemplo de apertura de la lección. Cada `push` simula cargar una
página nueva; cada `pop` simula presionar "atrás".

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

Punto a resaltar: después del primer `pop()`, `"inicio.html"` sigue en la
pila, encadenado debajo de `"cursos.html"` a través del nodo `siguiente` —
nunca desapareció, solo dejó de ser el tope. Es la garantía LIFO haciendo
exactamente lo que promete el contrato, y también es la prueba de que la
pila no se "achica" de un lado como un arreglo: solo cambia a qué nodo
apunta `tope`.

## Paso 3 — Demo: verificación de paréntesis balanceados

Aplicación clásica que combina las cinco operaciones en un algoritmo real.
Como todavía no usamos ninguna clase de `java.util`, el "diccionario" de
cierres se resuelve con una comparación simple de caracteres en vez de un
`Map`. Proyectar el código completo y ejecutarlo primero con una entrada
válida y luego con una inválida.

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
dibujando la cadena de nodos carácter por carácter, hasta llegar al `)` que
no coincide con el `[` que está en el tope — ahí se ve por qué `coincide`
devuelve `false` y detecta el cruce.

## Paso 4 — Demo: por qué una recursión sin caso base revienta la pila

Retomar la afirmación de la lección: el entorno de ejecución de Java usa una
pila (la *call stack*) para recordar a qué línea volver cuando una función
termina. Es la misma idea que acabamos de programar a mano, aplicada por la
JVM a las llamadas de función en vez de a datos nuestros: cada llamada hace
un `push` implícito; cada `return` hace un `pop`.

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

- *"En el Paso 1, si dentro de `push` intercambio el orden de las dos
  líneas —primero `tope = nuevo` y luego `nuevo.siguiente = tope`— ¿qué se
  rompe?"* — Respuesta esperada: al mover `tope` primero, `nuevo.siguiente`
  terminaría apuntando al propio `nuevo` (porque `tope` ya es `nuevo` en ese
  momento), formando un ciclo de un solo nodo; se pierde para siempre la
  referencia al resto de la pila que había debajo.
- *"En el Paso 3, ¿por qué el algoritmo también falla (`return
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
