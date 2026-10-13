> Sesión teórica con demo en vivo — no hay guía de laboratorio para esta
> sesión. La lección `Implementación de colas en Java` es lectura previa: el
> grupo ya conoce la fila de la caja del supermercado (Ana, Bruno y Carla) y
> respondió el cuestionario de cierre. Esa fila es el hilo de toda la sesión:
> cada línea de código se explica volviendo a "¿qué le pasa a quien está al
> frente y a quien está al final?". Se retoma la `Pila<T>` de la sesión
> anterior solo en el reto en parejas. Proyectar el código de este documento
> en orden. En los pasos 1 a 3 no se usa ninguna clase de `java.util`: la cola
> se programa desde cero; `java.util` aparece recién en los pasos 4 y 5.

## Paso 1 — `Nodo<T>` y `Cola<T>` con `enqueue`

Recordar en voz alta la analogía: cada persona de la fila es un nodo, una
cajita que guarda el dato y, además, la referencia a quien tiene **detrás**.
La cola guarda dos referencias —`frente`, el primero, y `fin`, el último— más
un contador. Con `frente` se atiende en O(1); con `fin` se llega al último
sin recorrer la fila.

```java
public class Nodo<T> {
    private T dato;
    private Nodo<T> siguiente;   // quien tiene detrás; null si es el último

    public Nodo(T dato) {
        this.dato = dato;
        // "siguiente" queda en null: al crear a una persona suelta todavía
        // no sabemos quién va a llegar detrás de ella.
    }

    public T getDato() { return dato; }
    public Nodo<T> getSiguiente() { return siguiente; }
    public void setSiguiente(Nodo<T> siguiente) { this.siguiente = siguiente; }
}
```

Para `enqueue`, escribir la primera versión con el error a la vista del grupo.

**🐞 Error planeado:** escribir `enqueue` como si la fila nunca estuviera
vacía: crear `nuevo`, hacer `fin.setSiguiente(nuevo);`, luego `fin = nuevo;` y
`tamano++;`, sin ningún `if`.

**Síntoma:** al ejecutar `fila.enqueue("Ana")` sobre la cola recién creada
salta un `NullPointerException` en la línea `fin.setSiguiente(nuevo);`:
`fin` vale `null` porque todavía no hay nadie en la fila.

**Pregunta al grupo:** "Llega la primera persona del día. ¿Detrás de quién se
pone? ¿Quién es el primero y el último a la vez?"

**Corrección:** el bloque de abajo. Con la fila vacía, el recién llegado es
`frente` **y** `fin`; solo cuando ya hay alguien se cuelga del último actual.
En ambos casos `fin` termina apuntando al nuevo.

```java
import java.util.NoSuchElementException;

public class Cola<T> {
    private Nodo<T> frente;   // primer nodo: el que sale; null si la cola está vacía
    private Nodo<T> fin;      // último nodo: detrás de él entra el siguiente; null si está vacía
    private int tamano;       // cantidad de nodos; evita recorrer la cadena para contar

    // enqueue: única forma de agregar, siempre al fin. O(1)
    public void enqueue(T elemento) {
        Nodo<T> nuevo = new Nodo<>(elemento);
        if (isEmpty()) {
            frente = nuevo;            // fila vacía: el nuevo es frente y fin a la vez
        } else {
            fin.setSiguiente(nuevo);   // el último actual ahora conoce a quien tiene detrás
        }
        fin = nuevo;                   // en ambos casos, el último es el nuevo
        tamano++;
    }

    // isEmpty: vacía significa que no hay primero
    public boolean isEmpty() {
        return frente == null;
    }

    // size: ya la llevamos contada, no hay que recorrer nada. O(1)
    public int size() {
        return tamano;
    }
}
```

Punto a resaltar: `enqueue` solo toca `fin` (y `frente` si la fila estaba
vacía): no recorre la cadena, por eso es O(1) sin importar cuántas personas
esperen. Dibujar en el tablero la fila [Ana, Bruno] con las flechas `frente`
y `fin`, y agregar a Carla: una sola flecha nueva (`Bruno -> Carla`) y `fin`
se mueve.

## Paso 2 — `dequeue` y `front`: la precondición y la última persona

Atender es lo simétrico: sale quien está al **frente**. Dos casos límite
aparecen en la vida real y ambos van en el código: la fila vacía (no hay a
quién llamar) y la última persona (al irse, no queda ni primero ni último).
Escribir primero la versión que olvida el segundo caso.

**🐞 Error planeado:** escribir `dequeue` con la validación de cola vacía
pero **sin** el `if (frente == null) { fin = null; }`:

```java
public T dequeue() {
    if (isEmpty()) {
        throw new NoSuchElementException("La cola está vacía");
    }
    T dato = frente.getDato();
    frente = frente.getSiguiente();
    tamano--;                        // falta: si frente quedó en null, fin = null
    return dato;
}
```

**Síntoma:** con el `enqueue` del Paso 1, el error es silencioso. Ejecutar:
`enqueue("Ana")`, `dequeue()`, y luego `size()` imprime `0`, `isEmpty()`
imprime `true` y un nuevo `enqueue("Bruno")` funciona (porque `isEmpty()` mira
solo `frente`). El grupo dirá "está bien". Pero `fin` sigue señalando a Ana,
una persona que ya se fue: la fila vacía no está realmente vacía. Hacerlo
visible reescribiendo, a propósito, la primera línea de `enqueue` como lo
haría un estudiante que piensa en términos de `fin`: `if (fin == null)` en
lugar de `if (isEmpty())`. Repetir la traza `enqueue("Ana")`, `dequeue()`,
`enqueue("Bruno")`: como `fin` aún apunta a Ana, `enqueue` entra por el `else`
(`Ana.setSiguiente(Bruno)`, con Ana ya fuera de la fila), `frente` queda en
`null` y `fin` pasa a Bruno. Ahora `size()` imprime `1`, pero `isEmpty()`
imprime `true` y `front()` lanza `NoSuchElementException("La cola está
vacía")`, aunque `size()` dice que hay alguien.

**Pregunta al grupo:** "`size()` dice que hay una persona y `isEmpty()` dice
que no hay ninguna. ¿Cuál de las dos miente? ¿Qué otra referencia quedó
apuntando a alguien que ya se fue?"

**Corrección:** el bloque de abajo (restaurar también `if (isEmpty())` en
`enqueue`). Vacía significa **ambos** extremos en `null`: cuando `frente`
queda en `null` después de avanzar, `fin` también debe quedar en `null`. Aun
con un `enqueue` que sí usa `isEmpty()`, olvidar esa línea deja una
referencia muerta que mantiene vivo un nodo que nadie debería alcanzar.

```java
    // dequeue: retira y devuelve el frente. Precondición: la cola no está vacía. O(1)
    public T dequeue() {
        if (isEmpty()) {
            // no se inventa un cliente de relleno ni se devuelve null
            throw new NoSuchElementException("La cola está vacía");
        }
        T dato = frente.getDato();        // 1. guarda el dato mientras el nodo aún es alcanzable
        frente = frente.getSiguiente();   // 2. el segundo de la fila pasa a ser el primero
        if (frente == null) {
            fin = null;                   // 3. se fue la última persona: ambos extremos en null
        }
        tamano--;
        return dato;
        // el nodo retirado ya no tiene nadie que lo apunte: Java lo libera solo.
    }

    // front: mira a quien sigue SIN atenderlo. Misma precondición que dequeue
    public T front() {
        if (isEmpty()) {
            throw new NoSuchElementException("La cola está vacía");
        }
        return frente.getDato();          // solo lee: no toca frente, fin ni tamano
    }
}
```

Punto a resaltar: `front` es literalmente las primeras líneas de `dequeue`
sin la mutación (`frente = frente.getSiguiente()`): la única diferencia entre
"ver quién sigue" y "atenderlo" es esa mutación. Y de los tres pasos de
`dequeue`, el 3 es el único que no sale de la analogía fácilmente: la pila
tenía una sola referencia (`tope`); la cola tiene dos, y hay que mantenerlas
coherentes.

## Paso 3 — Demo: clientes en la fila de la caja

Es el ejemplo de apertura de la lección, ahora en código. Cada `enqueue` es
llegar a la fila; cada `dequeue`, pasar a la caja.

```java
Cola<String> fila = new Cola<>();

fila.enqueue("Ana");     // [Ana]
fila.enqueue("Bruno");   // [Ana, Bruno]
fila.enqueue("Carla");   // [Ana, Bruno, Carla]  orden de llegada

System.out.println("Sigue: " + fila.front());   // Sigue: Ana (no se mueve nadie)
System.out.println("Hay " + fila.size());        // Hay 3

System.out.println("Atiendo a " + fila.dequeue());   // Atiendo a Ana
System.out.println("Atiendo a " + fila.dequeue());   // Atiendo a Bruno
System.out.println("Atiendo a " + fila.dequeue());   // Atiendo a Carla
// orden de salida: Ana, Bruno, Carla — el primero en entrar fue el primero en salir

System.out.println("¿Hay alguien? " + !fila.isEmpty());   // ¿Hay alguien? false

fila.dequeue();   // NoSuchElementException: La cola está vacía
```

Punto a resaltar: pedir al grupo que prediga la salida *antes* de ejecutar.
Tras el primer `dequeue`, Bruno y Carla siguen encadenados: no se "corrió" a
nadie, solo cambió a quién apunta `frente`. Y la última línea muestra la
precondición en acción: el error aparece donde ocurre, con un mensaje que
dice qué pasó, en vez de un `NullPointerException` más adelante.

## 🗳️ Votación — traza de enqueue, dequeue, front y size mezclados

Cuándo: tras el Paso 3, antes de pasar a la cola que Java ya trae. Proyectar
el código sin ejecutarlo:

```java
Cola<String> c = new Cola<>();
c.enqueue("A");
c.enqueue("B");
System.out.println(c.dequeue());
c.enqueue("C");
System.out.println(c.front());
System.out.println(c.size());
c.dequeue();
System.out.println(c.dequeue());
```

¿Qué imprime, línea por línea?

- (a) `A`, `B`, `2`, `C`
- (b) `B`, `C`, `2`, `A`
- (c) `A`, `B`, `1` y luego una excepción
- (d) `A`, `C`, `2`, `C`

Correcta: (a). Traza: tras dos `enqueue` la fila es [A, B] (A al frente);
`dequeue` imprime `A` y queda [B]; `enqueue("C")` deja [B, C]; `front`
imprime `B` sin retirarlo; `size` es 2; el `dequeue` sin `println` retira `B`
y queda [C]; el último `dequeue` imprime `C`.

Qué revela cada distractor:

- (b) → razona como pila (LIFO): con [A, B] el que sale es `B`; luego de
  `push("C")` la pila es [A, C], el `peek` ve `C`, `size` es 2, el `pop` sin
  imprimir retira `C` y el último `pop` entrega `A`. Es la salida real de
  quien cambió "primero en llegar" por "último en llegar".
- (c) → cree que `front` retira (confunde mirar con atender): `dequeue` saca
  `A`, el `front` retira y muestra `B` (queda [C]), `size` da 1, el
  `dequeue` sin imprimir retira `C` y el último `dequeue` lanza
  `NoSuchElementException`.
- (d) → cree que `front` devuelve al **último** (confunde `frente` con
  `fin`): imprime `A`, luego `C` (el último de [B, C]), `size` 2, y los dos
  `dequeue` siguientes retiran `B` y `C`, imprimiendo `C`. Revela que no
  tiene claro cuál extremo es el de salida.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (dibuja la fila en
el tablero, línea por línea).

## Paso 4 — La cola que Java ya trae: `Queue<E>` y `ArrayDeque<E>`

Ahora sí se abre `java.util`. El supermercado ya trae la fila armada:
`Queue<E>` es una `interface` (el contrato) y `ArrayDeque<E>` es una
implementación. Cada operación del TAD viene en dos familias: la que lanza
excepción con la fila vacía y la que devuelve un valor especial.

```java
import java.util.ArrayDeque;
import java.util.Queue;

// Declarada como Queue: solo se ve el contrato, no se puede colar a nadie en medio
Queue<String> turnos = new ArrayDeque<>();

turnos.offer("Ana");     // [Ana]; devuelve true. Equivale a enqueue
turnos.offer("Bruno");   // [Ana, Bruno]

System.out.println(turnos.peek());   // Ana, sin atenderla. Equivale a front
System.out.println(turnos.poll());   // Ana; la retira. Equivale a dequeue
System.out.println(turnos.poll());   // Bruno

// Con la fila vacía las dos familias se separan:
System.out.println(turnos.poll());   // null: no lanza nada, avisa con un valor especial
System.out.println(turnos.peek());   // null

turnos.add("Carla");                  // igual que offer; lanza excepción solo si no cabe
System.out.println(turnos.element()); // Carla; equivale a front, versión que lanza
turnos.remove();                      // retira a Carla; versión que lanza
turnos.remove();                      // NoSuchElementException: la cola está vacía
```

| TAD Cola | `Cola<T>` | `Queue<E>` lanza | `Queue<E>` devuelve valor especial |
| --- | --- | --- | --- |
| Encolar | `enqueue(x)` | `add(x)` | `offer(x)` |
| Retirar el frente | `dequeue()` | `remove()` | `poll()` |
| Consultar el frente | `front()` | `element()` | `peek()` |

Punto a resaltar: nuestra `Cola<T>` equivale a la familia que **lanza**
(`add`, `remove`, `element`), con la misma excepción:
`NoSuchElementException`. Preguntar por qué en un ciclo de atención conviene
`poll()` (el `null` es la condición de parada) y en cambio `dequeue()` o
`remove()` cuando vaciar la fila sería un bug. Y por qué `ArrayDeque<E>` y no
`LinkedList<E>`: esta última también es una `List`, y declarada como tal
permitiría `get(2)` o `add(1, x)`, es decir, colarse en medio de la fila, lo
que FIFO prohíbe; además admite `null`, que se confunde con el "vacía" de
`poll()`.

## Paso 5 — La fila preferencial: `PriorityQueue<E>`

En la misma caja hay un letrero de atención preferencial: quien lo necesita
pasa antes aunque haya llegado después. Ya no manda el orden de llegada sino
la prioridad. Se usa como cualquier `Queue<E>`; lo que cambia es la regla de
salida, y esa regla se entrega como **orden natural** del tipo (por ejemplo,
`Integer`: el menor sale primero) o como un `Comparator`.

```java
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Comparator;

record Cliente(String nombre, int prioridad) { }   // 0 es la más urgente

// Regla de salida: menor prioridad numérica primero. Comparator.comparingInt
// construye la comparación a partir del campo que elijamos.
Queue<Cliente> preferencial =
        new PriorityQueue<>(Comparator.comparingInt(Cliente::prioridad));

preferencial.offer(new Cliente("Ana", 2));     // llegó primero
preferencial.offer(new Cliente("Bruno", 2));
preferencial.offer(new Cliente("Carla", 0));   // atención preferencial
preferencial.offer(new Cliente("Diana", 1));

System.out.println(preferencial.poll().nombre());   // Carla (llegó tercera)
System.out.println(preferencial.poll().nombre());   // Diana
// Ana y Bruno tienen la misma prioridad: Java NO garantiza que salga
// primero Ana. Si importa el desempate por llegada, hay que codificarlo
// (p. ej. con un número de turno como segundo criterio).
```

Ahora el orden natural, y lo que **no** hace el recorrido:

```java
Queue<Integer> pq = new PriorityQueue<>();   // orden natural: el menor primero
pq.offer(3);
pq.offer(5);
pq.offer(1);
pq.offer(4);

System.out.println(pq.peek());   // 1: el que saldría primero
System.out.println(pq);          // [1, 4, 3, 5]  <- NO es el orden de salida

for (int n : pq) {
    System.out.print(n + " ");   // 1 4 3 5   <- tampoco
}

while (!pq.isEmpty()) {
    System.out.print(pq.poll() + " ");   // 1 3 4 5  <- este sí: solo poll() entrega en orden
}
```

Punto a resaltar: la fila preferencial real se ve ordenada de una vez; la
`PriorityQueue<E>` solo garantiza que el menor está **al frente**. El resto
se guarda en un orden interno que sirve para sacar rápido el siguiente
(`offer` y `poll` son O(log n), `peek` es O(1); se enuncian sin demostrar).
El `[1, 4, 3, 5]` es la disposición interna que produce el JDK para esas
cuatro inserciones: se muestra para que el grupo vea que `println` y
`for-each` no sirven para saber en qué orden saldrán. Tampoco admite `null`.

## 🗳️ Votación — qué sale de una PriorityQueue

Cuándo: tras el Paso 5, antes del reto en parejas. Proyectar el código sin
ejecutarlo:

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(5);
pq.offer(1);
pq.offer(4);
System.out.println(pq.peek());
System.out.println(pq);
System.out.println(pq.poll());
System.out.println(pq.poll());
```

¿Qué imprime, línea por línea?

- (a) `1`, `[1, 3, 4, 5]`, `1`, `3`
- (b) `1`, `[1, 4, 3, 5]`, `1`, `3`
- (c) `3`, `[3, 5, 1, 4]`, `3`, `5`
- (d) `4`, `[3, 5, 1, 4]`, `4`, `1`

Correcta: (b). Las inserciones dejan al menor en el primer lugar y el
`peek` imprime `1`. `println(pq)` muestra la disposición interna
`[1, 4, 3, 5]`, que no está ordenada. El primer `poll` entrega `1` y el
segundo entrega `3`: los siguientes menores.

Qué revela cada distractor:

- (a) → acierta con la regla de salida pero cree que imprimir la cola
  muestra el orden de salida (supone que `toString` ordena). Es la confusión
  que la lección advierte con el `for-each`.
- (c) → ignora la prioridad y razona como una cola FIFO normal: sale primero
  el que llegó primero (`3`), luego `5`, y la impresión sigue el orden de
  llegada.
- (d) → razona como pila (LIFO): sale el último en llegar (`4`) y luego `1`;
  imprime también en orden de llegada.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (ejecuta el código
y compara `println(pq)` contra la secuencia de `poll`).

## 👥 Reto en parejas — invertir una cola con una pila

Tiempo sugerido: 15 min.

Roles: *driver* escribe el código, *navigator* dicta la idea y revisa; cambian
de rol a mitad del tiempo.

Enunciado: usando la `Cola<T>` de esta sesión y la `Pila<T>` de la sesión
anterior (`push`, `pop`, `isEmpty`), escriban un método estático
`invertir(Cola<T> cola)` que deje la **misma cola** con sus elementos en
orden inverso: [Ana, Bruno, Carla] debe quedar [Carla, Bruno, Ana]. No pueden
usar arreglos, listas ni clases de `java.util`. Pista: una pila entrega los
elementos al revés de como los recibió; una cola los conserva.

Solución de referencia:

```java
public static <T> void invertir(Cola<T> cola) {
    Pila<T> auxiliar = new Pila<>();

    // 1. Vaciar la cola sobre la pila: Ana entra primero y queda en el fondo;
    //    Carla entra al final y queda en el tope
    while (!cola.isEmpty()) {
        auxiliar.push(cola.dequeue());
    }

    // 2. Vaciar la pila sobre la cola: sale primero el tope (Carla), así que
    //    Carla se encola primero y Ana al final
    while (!auxiliar.isEmpty()) {
        cola.enqueue(auxiliar.pop());
    }
    // ambos ciclos están protegidos por isEmpty(): ninguna precondición se viola
}
```

```java
Cola<String> fila = new Cola<>();
fila.enqueue("Ana");
fila.enqueue("Bruno");
fila.enqueue("Carla");

invertir(fila);

System.out.println(fila.dequeue());   // Carla
System.out.println(fila.dequeue());   // Bruno
System.out.println(fila.dequeue());   // Ana
```

Punto a resaltar: la cola conserva el orden y la pila lo invierte; al pasar
los elementos por la pila una sola vez, la inversión queda en la cola.
Preguntar qué pasaría con una cola
vacía (los dos ciclos no corren, queda vacía) y con un solo elemento (queda
igual). Es la base del problema de práctica externa "Queue using Stacks".

## Preguntas socráticas

- *"¿Por qué `Cola<T>` necesita `fin` y la `Pila<T>` solo `tope`? ¿Qué
  costaría quitar `fin`?"* — Respuesta esperada: la pila entra y sale por el
  mismo extremo; la cola entra por uno y sale por el otro. Sin `fin`, cada
  `enqueue` tendría que recorrer la cadena hasta el último nodo, O(n) por
  persona que llega.
- *"¿Por qué se entra por `fin` y se sale por `frente`, y no al revés?"* —
  Respuesta esperada: cada nodo conoce a su siguiente, no a su anterior.
  Quitar el primero solo exige leer `frente.getSiguiente()`; quitar el último
  exigiría recorrer hasta el penúltimo, O(n).
- *"En `dequeue`, ¿por qué hay que guardar `dato` antes de mover `frente`?"*
  — Respuesta esperada: porque después de avanzar `frente` el nodo viejo ya
  no es alcanzable y su dato se perdería.
- *"¿Qué diferencia hay entre `remove()` y `poll()` con la fila vacía? ¿Cuál
  equivale a nuestro `dequeue()`?"* — Respuesta esperada: `remove()` lanza
  `NoSuchElementException`, `poll()` devuelve `null`; `remove()` equivale a
  nuestro `dequeue()`.
- *"Un cliente con atención preferencial llega a una `PriorityQueue`. ¿Por
  qué no se ve primero al imprimir la cola?"* — Respuesta esperada: porque la
  estructura solo garantiza quién está al frente, no ordena todo el
  contenido; el orden completo solo aparece vaciándola con `poll()`.

## Práctica externa

Problemas para practicar después de la sesión. Son opcionales y se resuelven
en la plataforma externa; no valen nota en el curso.

- **LeetCode 232 — Implement Queue using Stacks** (Fácil):
  [leetcode.com/problems/implement-queue-using-stacks](https://leetcode.com/problems/implement-queue-using-stacks/).
  Es el reto en parejas llevado más lejos: construir `push`, `pop`, `peek` y
  `empty` de una cola usando solo pilas. Por verificar.
- **LeetCode 933 — Number of Recent Calls** (Fácil):
  [leetcode.com/problems/number-of-recent-calls](https://leetcode.com/problems/number-of-recent-calls/).
  Una cola donde se descartan por el frente las peticiones viejas: aplica
  `offer`, `peek`/`poll` y el ciclo `while` con la cola como ventana de
  tiempo. Por verificar.
- **HackerRank — Queues: A Tale of Two Stacks** (Media):
  [hackerrank.com/challenges/ctci-queue-using-two-stacks](https://www.hackerrank.com/challenges/ctci-queue-using-two-stacks/problem).
  La misma idea que LeetCode 232, con entradas por consola. Por verificar.

> Existencia de los tres problemas (número, nombre y enlace) tomada de memoria
> del autor; LeetCode bloquea las consultas automáticas (403) y no se pudo
> confirmar el contenido de ninguna página. Abrir cada enlace antes de
> asignarlo al grupo.
