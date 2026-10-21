> Sesión teórica con demo en vivo, dictada por el docente. La lección `Lista doblemente enlazada y lista circular` es lectura
> previa: el grupo ya conoce el carrusel de fotos del celular (deslizar a la
> siguiente, deslizar a la anterior, bordes sin vecino) y la playlist en bucle,
> y respondió el cuestionario de cierre. Ese carrusel es el hilo de toda la
> sesión: cada línea de código se explica volviendo a "¿quién es el vecino de
> la izquierda y quién el de la derecha, y quién se enteró del cambio?". El
> grupo viene de `Nodo<T>` y la lista simple: aquí solo se agrega **una
> referencia por nodo** y se ve qué obliga a mantener coherente. Proyectar el
> código de este documento en orden; las cuatro clases (`NodoDoble<T>`,
> `ListaDoble<T>`, `ListaCircular<T>` y `Main`) viven en archivos separados y no
> se usa ninguna clase de `java.util`: todo se programa desde cero.

## Paso 1 — `NodoDoble<T>` y `ListaDoble<T>` con `insertarFinal`

Recordar en voz alta la analogía: cada foto es un nodo que guarda el dato y
**dos** referencias, la de la foto que sigue y la de la foto que precede. La
lista guarda los dos extremos —`head`, la primera foto, y `tail`, la última—
más un contador. Con `tail` se agrega al final en O(1), sin recorrer nada.

```java
public class NodoDoble<T> {
    private T dato;
    private NodoDoble<T> siguiente;   // foto que sigue; null si es la última
    private NodoDoble<T> anterior;    // foto que precede; null si es la primera

    public NodoDoble(T dato) {
        this.dato = dato;
        // "siguiente" y "anterior" quedan en null: una foto recién creada
        // todavía no tiene vecinos.
    }

    public T getDato() { return dato; }
    public NodoDoble<T> getSiguiente() { return siguiente; }
    public NodoDoble<T> getAnterior() { return anterior; }
    public void setSiguiente(NodoDoble<T> siguiente) { this.siguiente = siguiente; }
    public void setAnterior(NodoDoble<T> anterior) { this.anterior = anterior; }
}
```

```java
public class ListaDoble<T> {
    private NodoDoble<T> head;   // primera foto; null si la lista está vacía
    private NodoDoble<T> tail;   // última foto; null si la lista está vacía
    private int tamano;          // cantidad de nodos; evita recorrer para contar

    // vacía significa que no hay primera foto
    public boolean estaVacia() { return head == null; }

    public int getTamano() { return tamano; }

    // insertarFinal: agrega usando tail, sin recorrer. O(1)
    public void insertarFinal(T dato) {
        NodoDoble<T> nuevo = new NodoDoble<>(dato);
        if (estaVacia()) {
            head = nuevo;                 // única foto: es head y tail a la vez
        } else {
            tail.setSiguiente(nuevo);     // la última actual apunta a la nueva...
            nuevo.setAnterior(tail);      // ...y la nueva apunta de vuelta
        }
        tail = nuevo;                     // en ambos casos, la última es la nueva
        tamano++;
    }

    // recorrer: de head hacia tail, igual que en la lista simple. O(n)
    public void recorrer() {
        NodoDoble<T> actual = head;
        while (actual != null) {          // null marca el borde derecho
            System.out.println(actual.getDato());
            actual = actual.getSiguiente();
        }
    }

    // Pasos 2 y 3: aquí dentro, antes de esta llave final, se agregan
    // recorrerInverso, buscar y eliminar. Los bloques siguientes son
    // fragmentos de ListaDoble<T> y se pegan en ese lugar, en orden.
}
```

Punto a resaltar: comparar con `insertarFinal` de la lista simple —hay **una
línea más**, `nuevo.setAnterior(tail)`—, y es la primera de las "cuatro
referencias en juego" de la lección. Dibujar en el tablero [A, B] con flechas
en los dos sentidos y agregar C: nacen **dos** flechas (`B -> C` y `C -> B`) y
`tail` se mueve.

## Paso 2 — `recorrerInverso` y `buscar`

El premio de la referencia extra: ir hacia atrás cuesta lo mismo que ir hacia
adelante. Los dos métodos de este paso se agregan **dentro** de `ListaDoble<T>`. En la lista simple, esto obligaba a recorrer desde `head` hasta el
nodo previo en cada paso (O(n²) en total).

```java
    // recorrerInverso: de tail hacia head. O(n)
    public void recorrerInverso() {
        NodoDoble<T> actual = tail;           // se parte del final...
        while (actual != null) {              // null marca el borde izquierdo
            System.out.println(actual.getDato());
            actual = actual.getAnterior();    // ...y se retrocede un nodo por paso
        }
    }

    // buscar: devuelve el NODO (no el dato) para poder eliminarlo después. O(n)
    // Devuelve null si el dato no está.
    public NodoDoble<T> buscar(T dato) {
        NodoDoble<T> actual = head;
        while (actual != null) {
            if (actual.getDato().equals(dato)) {
                return actual;                // se queda con la referencia al nodo
            }
            actual = actual.getSiguiente();
        }
        return null;
    }
```

Punto a resaltar: `recorrerInverso` es `recorrer` con dos letras cambiadas
(`tail` por `head`, `getAnterior` por `getSiguiente`). Y `buscar` devuelve el
nodo y no el dato a propósito: localizar cuesta O(n), pero lo que viene
(`eliminar`) ya no necesita buscar a nadie.

## Paso 3 — `eliminar(NodoDoble<T>)`: cuatro referencias, tres casos

(Los dos bloques de este paso son el mismo método dentro de `ListaDoble<T>`:
primero la versión con el error, luego la corrección que la reemplaza.)

La lección dice que aquí la lista doble gana: el nodo mismo sabe quién está
antes y quién después. Pero "saber" no es "avisar": hay que **avisarle a los dos
vecinos**. Escribir primero la versión que olvida a uno.

**🐞 Error planeado:** escribir `eliminar` avisándole solo al vecino de
atrás, sin la línea `despues.setAnterior(antes)`:

```java
    public T eliminar(NodoDoble<T> nodo) {
        NodoDoble<T> antes = nodo.getAnterior();
        NodoDoble<T> despues = nodo.getSiguiente();
        if (antes == null) {
            head = despues;
        } else {
            antes.setSiguiente(despues);
        }
        if (despues == null) {
            tail = antes;
        } else {
            // falta: despues.setAnterior(antes);
        }
        nodo.setSiguiente(null);
        nodo.setAnterior(null);
        tamano--;
        return nodo.getDato();
    }
```

**Síntoma:** con la lista [A, B, C], ejecutar `eliminar(buscar("B"))`.
`recorrer()` imprime `A`, `C` (el grupo dirá "está bien") y `getTamano()` da
`2`. Pero `recorrerInverso()` imprime `C`, `B` y se detiene: `C` todavía cree
que su vecino de la izquierda es `B`, y `B`, ya desenlazado, no sabe de `A`. La
foto `A` desaparece del recorrido inverso y `B` aparece aunque fue borrada.

**Pregunta al grupo:** "Hacia adelante todo se ve bien y hacia atrás
aparece una foto que borramos. ¿Qué vecino no se enteró del cambio?"

**Corrección:** el bloque de abajo. Eliminar un nodo del medio repara
**dos** referencias en los vecinos (`antes.siguiente` y `despues.anterior`),
no una. Los dos `if` no son adorno: cada uno decide si hay vecino a quién
avisar o si el nodo era un extremo y hay que mover `head` o `tail`.

```java
    // eliminar: quita un nodo YA LOCALIZADO, sin buscar a su predecesor. O(1)
    public T eliminar(NodoDoble<T> nodo) {
        NodoDoble<T> antes = nodo.getAnterior();      // vecino de la izquierda
        NodoDoble<T> despues = nodo.getSiguiente();   // vecino de la derecha

        if (antes == null) {
            head = despues;                    // no había nadie antes: era el primero (o el único)
        } else {
            antes.setSiguiente(despues);       // el de atrás salta al de adelante
        }

        if (despues == null) {
            tail = antes;                      // no había nadie después: era el último (o el único)
        } else {
            despues.setAnterior(antes);        // el de adelante apunta al de atrás
        }

        nodo.setSiguiente(null);               // el nodo eliminado ya no enlaza a nadie
        nodo.setAnterior(null);
        tamano--;
        return nodo.getDato();                 // devuelve el dato del nodo retirado
    }
```

Punto a resaltar: pasar por los tres casos borde sobre una lista [A, B, C]:
eliminar `A` (`antes == null`: `head` avanza), eliminar `C` (`despues == null`:
`tail` retrocede) y, si queda un solo nodo, eliminarlo (**ambas** preguntas
verdaderas: `head` y `tail` quedan en `null`). Con la lista simple, esta
operación sobre un nodo ya localizado exigía recorrer desde `head` para hallar
al predecesor, O(n); aquí es O(1).

## 🗳️ Votación — qué imprime la lista cuando a `eliminar` le falta una línea

Cuándo: tras el Paso 3, antes de pasar a la lista circular. Proyectar la
versión de `eliminar` de abajo (ya con el error del Paso 3 corregido, pero con
otra línea ausente) y el código de uso, sin ejecutarlo:

```java
    public T eliminar(NodoDoble<T> nodo) {
        NodoDoble<T> antes = nodo.getAnterior();
        NodoDoble<T> despues = nodo.getSiguiente();
        if (antes == null) {
            head = despues;
        } else {
            // falta: antes.setSiguiente(despues);
        }
        if (despues == null) {
            tail = antes;
        } else {
            despues.setAnterior(antes);
        }
        nodo.setSiguiente(null);
        nodo.setAnterior(null);
        tamano--;
        return nodo.getDato();
    }
```

```java
ListaDoble<String> l = new ListaDoble<>();
l.insertarFinal("A");
l.insertarFinal("B");
l.insertarFinal("C");
l.insertarFinal("D");
l.eliminar(l.buscar("B"));
l.recorrerInverso();
l.recorrer();
```

¿Qué imprime, `recorrerInverso()` y luego `recorrer()`?

- (a) `D`, `C`, `A` y luego `A`, `C`, `D`
- (b) `D`, `C`, `A` y luego `A`, `B`
- (c) `D`, `C`, `B`, `A` y luego `A`, `B`, `C`, `D`
- (d) `D`, `C`, `B`, `A` y luego `A`, `B`

Correcta: (b). Traza: `despues.setAnterior(antes)` sí está, así que `C` apunta
hacia atrás a `A` y el recorrido inverso es correcto: `D`, `C`, `A`. Pero
`A.siguiente` nunca se reparó y sigue apuntando a `B`; `B` fue desenlazado
(`siguiente = null`), así que hacia adelante sale `A`, `B` y se detiene: `C` y
`D` quedan inalcanzables desde `head`.

Qué revela cada distractor:

- (a) → da por correcto el `eliminar` completo: cree que los dos recorridos
  quedan sanos aunque falte una de las cuatro asignaciones. No distingue qué
  referencia usa cada recorrido.
- (c) → cree que sin esa línea "no pasó nada": que `eliminar` solo hace
  efecto cuando están las cuatro referencias, y que ambos recorridos siguen
  viendo la lista original.
- (d) → acierta que algo falla hacia adelante, pero invierte la causa:
  supone que el enlace que falta afecta también al recorrido inverso
  (confunde `siguiente` con `anterior`). El inverso solo mira `anterior`, y
  esa referencia sí se reparó.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (dibuja las flechas
de [A, B, C, D] y tacha las que `eliminar` sí repara).

## Paso 4 — La lista circular: el carrusel da la vuelta

La playlist en bucle: al terminar la última canción vuelve a sonar la primera.
En código, el cambio es mínimo: al enlazar los extremos **no queda ningún
`null`**. Programar una clase mínima `ListaCircular<T>` que reutiliza el
`NodoDoble<T>` y mantiene la circularidad doble (`tail.siguiente` es `head` y
`head.anterior` es `tail`).

```java
public class ListaCircular<T> {
    private NodoDoble<T> head;
    private NodoDoble<T> tail;
    private int tamano;

    public boolean estaVacia() { return head == null; }

    public int getTamano() { return tamano; }

    // insertarFinal: igual que en ListaDoble, más cerrar el círculo. O(1)
    public void insertarFinal(T dato) {
        NodoDoble<T> nuevo = new NodoDoble<>(dato);
        if (estaVacia()) {
            head = nuevo;                  // único nodo: es head y tail a la vez
            tail = nuevo;
        } else {
            tail.setSiguiente(nuevo);      // igual que en la lista doble
            nuevo.setAnterior(tail);
            tail = nuevo;
        }
        tail.setSiguiente(head);           // el último vuelve al primero
        head.setAnterior(tail);            // el primero vuelve al último
        tamano++;
    }
```

Antes de escribir el recorrido correcto, escribir el que el grupo ya sabe.

**🐞 Error planeado:** escribir el recorrido con la condición de siempre,
`while (actual != null)`. Para que la clase no se cuelgue en pantalla, proyectar
esta versión con un tope de pasos:

```java
    // Versión errónea, con tope para no colgar la demo
    public void recorrerConLimite(int maximo) {
        NodoDoble<T> actual = head;
        int pasos = 0;
        while (actual != null && pasos < maximo) {   // "actual != null" nunca deja de cumplirse
            System.out.println(actual.getDato());
            actual = actual.getSiguiente();
            pasos++;
        }
    }
```

**Síntoma:** con una playlist de tres canciones y `recorrerConLimite(7)`
imprime `Cancion 1`, `Cancion 2`, `Cancion 3`, `Cancion 1`, `Cancion 2`,
`Cancion 3`, `Cancion 1`: da vueltas. Sin el tope (`pasos < maximo`) el
programa no termina nunca.

**Pregunta al grupo:** "¿Cuándo vale `null` el siguiente de una canción en
esta lista? ¿Con qué condición sabría el recorrido que ya dio una vuelta
completa?"

**Corrección:** detenerse al **volver al punto de partida**, y hacerlo con
`do { } while`, porque la condición compara con `head`, que es donde se empieza:
con un `while` normal, la primera comparación (`actual != head`) ya sería falsa
y no se imprimiría nada.

```java
    // recorrer: una vuelta completa, empezando y terminando en head. O(n)
    public void recorrer() {
        if (estaVacia()) {
            return;                              // sin head no hay vuelta que dar
        }
        NodoDoble<T> actual = head;
        do {
            System.out.println(actual.getDato());
            actual = actual.getSiguiente();
        } while (actual != head);                // al regresar a head, la vuelta terminó
    }
}
```

Punto a resaltar: la guarda `if (estaVacia())` no es decorativa: sin ella,
`head.getDato()` lanzaría `NullPointerException` sobre una lista vacía. Y en
`insertarFinal`, las dos últimas líneas (`tail.setSiguiente(head)` y
`head.setAnterior(tail)`) son lo único que convierte una lista doble en
circular: el resto del código es idéntico al de `ListaDoble<T>`.

## Paso 5 — Demo: la galería y la playlist

Ejecutar todo junto. Pedir al grupo que prediga la salida *antes* de correr.

```java
public class Main {
    public static void main(String[] args) {
        // Galería: lista doble
        ListaDoble<String> fotos = new ListaDoble<>();
        fotos.insertarFinal("A");
        fotos.insertarFinal("B");
        fotos.insertarFinal("C");

        System.out.println("-- adelante");
        fotos.recorrer();                     // A B C
        System.out.println("-- atras");
        fotos.recorrerInverso();              // C B A
        System.out.println("tamano = " + fotos.getTamano());

        // Eliminar la foto del medio: A y C pasan a ser vecinas
        NodoDoble<String> b = fotos.buscar("B");
        System.out.println("elimino " + fotos.eliminar(b));

        System.out.println("-- adelante");
        fotos.recorrer();                     // A C
        System.out.println("-- atras");
        fotos.recorrerInverso();              // C A
        System.out.println("tamano = " + fotos.getTamano());

        // Casos borde: quitar los extremos hasta vaciar la lista
        System.out.println("elimino " + fotos.eliminar(fotos.buscar("A")));
        System.out.println("elimino " + fotos.eliminar(fotos.buscar("C")));
        System.out.println("vacia = " + fotos.estaVacia());
        System.out.println("-- atras (vacia)");
        fotos.recorrerInverso();              // no imprime nada: tail es null

        // Playlist: lista circular
        ListaCircular<String> playlist = new ListaCircular<>();
        playlist.insertarFinal("Cancion 1");
        playlist.insertarFinal("Cancion 2");
        playlist.insertarFinal("Cancion 3");

        System.out.println("-- circular");
        playlist.recorrer();                  // una sola vuelta
        System.out.println("-- circular con while (null) limitado a 7 pasos");
        playlist.recorrerConLimite(7);        // da vueltas hasta que el tope lo corta
    }
}
```

Salida esperada:

```text
-- adelante
A
B
C
-- atras
C
B
A
tamano = 3
elimino B
-- adelante
A
C
-- atras
C
A
tamano = 2
elimino A
elimino C
vacia = true
-- atras (vacia)
-- circular
Cancion 1
Cancion 2
Cancion 3
-- circular con while (null) limitado a 7 pasos
Cancion 1
Cancion 2
Cancion 3
Cancion 1
Cancion 2
Cancion 3
Cancion 1
```

Punto a resaltar: tras `eliminar(b)`, `B` no se "corrió": se cambiaron dos
flechas y `A` y `C` pasaron a ser vecinas en **los dos** sentidos. Quitar `A` y
luego `C` recorre los casos borde de `head` y `tail`; en la última
eliminación, la lista queda con `head` y `tail` en `null` y `estaVacia()`
devuelve `true`. Cerrar con la playlist: la lista circular no tiene un "final";
quien decide cuándo parar es la condición del recorrido.

## 👥 Reto en parejas — `insertarInicio` en la lista doble

Tiempo sugerido: 15 min.

Roles: *driver* escribe el código, *navigator* dicta la idea y revisa; cambian
de rol a mitad del tiempo.

Enunciado: a `ListaDoble<T>` le falta agregar una foto **al principio** del
carrusel. Escriban `insertarInicio(T dato)` en O(1), sin recorrer. Dos
preguntas guían: ¿qué pasa cuando la lista está vacía? ¿Cuáles son las
**cuatro** referencias que cambian cuando ya hay fotos? Comprueben con el
`Main` que, tras `insertarInicio("C")`, `insertarInicio("B")` e
`insertarInicio("A")`, el recorrido hacia adelante imprime `A`, `B`, `C` y el
inverso `C`, `B`, `A`.

Solución de referencia:

```java
    // insertarInicio: simétrico a insertarFinal, usando head. O(1)
    public void insertarInicio(T dato) {
        NodoDoble<T> nuevo = new NodoDoble<>(dato);
        if (estaVacia()) {
            tail = nuevo;                 // única foto: es head y tail a la vez
        } else {
            nuevo.setSiguiente(head);     // la nueva apunta a la primera actual...
            head.setAnterior(nuevo);      // ...y la primera actual apunta de vuelta
        }
        head = nuevo;                     // en ambos casos, la primera es la nueva
        tamano++;
    }
```

```java
ListaDoble<String> r = new ListaDoble<>();
r.insertarInicio("C");
r.insertarInicio("B");
r.insertarInicio("A");

r.recorrer();           // A B C
r.recorrerInverso();    // C B A
```

Punto a resaltar: es `insertarFinal` en espejo: se intercambian `head` por
`tail` y `siguiente` por `anterior`. En el caso vacío, el nodo nuevo se asigna
a `tail` (y `head` se asigna en la línea final común); si el grupo asigna
solo `head`, `recorrerInverso` no imprime nada, porque `tail` sigue en `null`.
Pregunta de extensión: ¿qué cambiaría para convertir esta lista en circular?
(Respuesta: solo dos referencias, `tail.siguiente = head` y
`head.anterior = tail`, pero entonces `recorrer()` y `recorrerInverso()` con
`while (actual != null)` ya no terminan.)

## Preguntas socráticas

- *"¿Por qué `buscar` devuelve el nodo y no el dato?"* — Respuesta esperada:
  porque `eliminar` recibe el nodo, y con el nodo en la mano se elimina sin
  recorrer; si solo tuviéramos el dato habría que volver a buscarlo, O(n) otra
  vez.
- *"¿Qué cuesta más, eliminar el nodo de la mitad de una lista doble o
  encontrarlo?"* — Respuesta esperada: encontrarlo, O(n); una vez localizado,
  eliminarlo es O(1).
- *"Si la lista tiene un solo nodo y lo eliminamos, ¿qué valores toman `head` y
  `tail`?"* — Respuesta esperada: ambos `null`, porque `antes == null` mueve
  `head` a `despues` (que es `null`) y `despues == null` mueve `tail` a `antes`
  (también `null`).
- *"¿Qué ganamos con una referencia más por nodo y qué pagamos?"* — Respuesta
  esperada: ganamos recorrido inverso O(n) y eliminación O(1) sobre un nodo
  localizado; pagamos memoria por nodo y una asignación más que se puede
  olvidar.
- *"¿Por qué un `while` común no sirve para recorrer la lista circular, y por
  qué `do { } while`?"* — Respuesta esperada: no hay `null` en los bordes, así
  que `actual != null` nunca deja de cumplirse; y se usa `do { } while`
  porque la condición compara con `head`, el punto de partida, que al empezar
  ya es igual a `actual`.
- *"¿Dónde ves una lista circular fuera de la computación?"* — Respuesta
  esperada: una playlist en bucle, los turnos rotativos de un equipo, la
  ronda de jugadores de un juego de mesa.

## Práctica externa

Problemas para practicar después de la sesión. Son opcionales y se resuelven
en la plataforma externa; no valen nota en el curso.

- **LeetCode 707 — Design Linked List** (Media):
  [leetcode.com/problems/design-linked-list](https://leetcode.com/problems/design-linked-list/).
  Pide implementar una lista enlazada con `get`, `addAtHead`, `addAtTail`,
  `addAtIndex` y `deleteAtIndex`; admite hacerla simple o doble, así que sirve
  para llevar `insertarInicio`, `insertarFinal` y `eliminar` a una lista con
  acceso por índice. Por confirmar.
- **LeetCode 146 — LRU Cache** (Media):
  [leetcode.com/problems/lru-cache](https://leetcode.com/problems/lru-cache/).
  La aplicación clásica de la lista doble: sacar un nodo del medio y
  llevarlo al frente en O(1) es justo `eliminar` sobre un nodo ya localizado.
  Por confirmar.
- **LeetCode 1823 — Find the Winner of the Circular Game** (Media):
  [leetcode.com/problems/find-the-winner-of-the-circular-game](https://leetcode.com/problems/find-the-winner-of-the-circular-game/).
  Jugadores sentados en círculo que se eliminan por turnos: modelo natural
  para la lista circular. Por confirmar.

> Existencia de los tres problemas (número, nombre y enlace) tomada de memoria
> del autor; LeetCode bloquea las consultas automáticas y no se pudo confirmar
> el contenido de ninguna página. Abrir cada enlace antes de asignarlo al
> grupo.
