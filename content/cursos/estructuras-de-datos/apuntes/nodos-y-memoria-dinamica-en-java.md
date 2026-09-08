> Sesión T2, Semana 5 — desarrollo en vivo del docente sobre el caso de
> referencia del Sistema Bancario. El código de `Nodo<T>` y `ListaSimple<T>`
> es genérico y sirve como base directa del laboratorio de la semana
> (implementar la lista simple enlazada sobre el caso de estudio de cada
> equipo): estas clases van en `model/structures/`, sin depender de ningún
> dominio concreto.

## Paso 1 — El arreglo como primer intento: historial de transacciones

Antes de llegar al nodo, se demuestra en vivo por qué un arreglo se queda
corto para el historial de una cuenta bancaria.

```java
public class DemoArreglo {
    public static void main(String[] args) {
        String[] historial = new String[3]; // capacidad fija: 3 casillas
        historial[0] = "Deposito 50000";
        historial[1] = "Retiro 20000";
        historial[2] = "Deposito 15000";

        for (String movimiento : historial) {
            System.out.println(movimiento);
        }
    }
}
```

Con tres movimientos y capacidad 3, el arreglo está lleno. La siguiente
transacción ya no tiene dónde guardarse.

Punto a resaltar: la **capacidad** de un arreglo es la cantidad de casillas
reservadas al crearlo con `new String[3]` — no crece sola cuando se llena.

## Paso 2 — Qué pasa cuando el arreglo se desborda

```java
public class DemoDesborde {
    public static void main(String[] args) {
        String[] historial = new String[3];
        historial[0] = "Deposito 50000";
        historial[1] = "Retiro 20000";
        historial[2] = "Deposito 15000";

        // No hay casilla [3]: la capacidad es 3, los indices validos son 0..2
        historial[3] = "Deposito 30000"; // lanza ArrayIndexOutOfBoundsException
    }
}
```

Al ejecutarlo, Java lanza `ArrayIndexOutOfBoundsException: Index 3 out of
bounds for length 3`. No es una advertencia: el programa termina si nadie
captura la excepción. El arreglo no "avisa" que está lleno de ninguna otra
forma — simplemente no existe la casilla `[3]`.

Punto a resaltar: la excepción se lanza en tiempo de ejecución, no en
compilación — el compilador no sabe cuántos movimientos van a llegar.

## Paso 3 — La solución con arreglos: copiar a uno más grande

```java
public class DemoCrecerArreglo {
    public static void main(String[] args) {
        String[] historial = new String[3];
        historial[0] = "Deposito 50000";
        historial[1] = "Retiro 20000";
        historial[2] = "Deposito 15000";

        // 1. Crear un arreglo nuevo, mas grande (aqui: el doble de capacidad)
        String[] historialNuevo = new String[historial.length * 2];

        // 2. Copiar uno por uno todos los elementos del viejo al nuevo
        for (int i = 0; i < historial.length; i++) {
            historialNuevo[i] = historial[i];
        }

        // 3. Recien ahora hay espacio para el elemento que no cabia
        historialNuevo[3] = "Deposito 30000";

        historial = historialNuevo; // la variable ahora apunta al arreglo grande
    }
}
```

Esto sí funciona, pero fíjense en el costo: el paso 2 recorre y copia **todos**
los elementos existentes cada vez que el arreglo se queda sin espacio — con
`n` movimientos ya guardados, agrandar el arreglo cuesta `n` copias. Eso es
**O(n)**: el costo de crecer no es constante, crece con el tamaño del
historial. Si una cuenta acumula miles de movimientos y el arreglo se
desborda varias veces a lo largo de su vida, cada desborde vuelve a pagar
ese costo completo. Es exactamente el problema que abre la lección teórica:
el arreglo obliga a decidir el tamaño de antemano, y "agrandarlo" nunca es
gratis.

Punto a resaltar: `historial.length * 2` es solo una estrategia de
crecimiento entre varias — lo que importa para la discusión de complejidad
es que copiar `n` elementos es `O(n)`, sin importar qué tan grande se elija
el arreglo nuevo.

## Paso 4 — El nodo genérico: `Nodo<T>`

Con el problema del arreglo ya demostrado, se construye la alternativa que
trae la lección teórica: envolver cada dato en un objeto que además sepa
dónde está el siguiente.

```java
package model.structures;

public class Nodo<T> {
    private T dato; // el valor que este nodo guarda, de cualquier tipo T
    private Nodo<T> siguiente; // referencia al proximo nodo de la cadena

    public Nodo(T dato) {
        this.dato = dato;
        this.siguiente = null; // recien creado, todavia no esta enlazado a nada
    }

    public T getDato() {
        return dato;
    }

    public void setDato(T dato) {
        this.dato = dato;
    }

    public Nodo<T> getSiguiente() {
        return siguiente;
    }

    public void setSiguiente(Nodo<T> siguiente) {
        // reasigna la referencia al siguiente nodo; no copia datos, solo
        // apunta a un objeto que ya existe en el heap
        this.siguiente = siguiente;
    }
}
```

Punto a resaltar: `Nodo<T>` es genérico — la misma clase sirve para
encadenar `String` (como en la demo del historial), `Transaccion`,
`Cliente` o la entidad principal de cualquier caso de estudio, sin
reescribir una versión por tipo. Y no tiene ningún método de inserción,
búsqueda ni eliminación: esa responsabilidad no es suya.

## Paso 5 — La lista simple enlazada: `ListaSimple<T>`

Con `Nodo<T>` ya definido, se construye la clase que lleva la cuenta de
dónde empieza la cadena y cuántos nodos tiene, y se agregan las operaciones
mínimas para que el ejemplo tenga sentido: insertar al final y recorrer.

```java
package model.structures;

public class ListaSimple<T> {
    private Nodo<T> head; // referencia al primer nodo de la cadena
    private int tamano; // cuantos nodos tiene la lista actualmente

    public ListaSimple() {
        this.head = null; // lista vacia: ningun nodo enlazado todavia
        this.tamano = 0;
    }

    public boolean estaVacia() {
        return head == null; // unico criterio para decidir si la lista esta vacia
    }

    public int getTamano() {
        return tamano;
    }

    public void insertarAlFinal(T dato) {
        Nodo<T> nuevo = new Nodo<>(dato); // se crea el nodo, sin tocar los existentes

        if (estaVacia()) {
            head = nuevo; // primer nodo de la lista: head pasa a apuntarlo
        } else {
            Nodo<T> actual = head;
            while (actual.getSiguiente() != null) {
                // avanza nodo por nodo hasta llegar al ultimo (siguiente == null)
                actual = actual.getSiguiente();
            }
            actual.setSiguiente(nuevo); // enlaza el nuevo nodo al final de la cadena
        }

        tamano++; // se actualiza el contador, no se recalcula recorriendo la lista
    }

    public void recorrerEImprimir() {
        Nodo<T> actual = head; // puntero temporal, no mueve head de la lista real
        while (actual != null) {
            System.out.println(actual.getDato());
            actual = actual.getSiguiente(); // avanza al siguiente nodo de la cadena
        }
    }
}
```

Punto a resaltar: `insertarAlFinal` nunca copia ni desplaza los nodos que
ya estaban — solo recorre la cadena hasta el último y reescribe **una**
referencia (`actual.setSiguiente(nuevo)`). Compárenlo en pantalla con el
`for` de copiado del Paso 3: ahí se movían los `n` elementos existentes;
aquí no se toca ninguno.

## Paso 6 — Prueba con el caso del historial

Se cierra el desarrollo demostrando el mismo escenario del Paso 1, ahora
sin límite de capacidad.

```java
public class Main {
    public static void main(String[] args) {
        ListaSimple<String> historial = new ListaSimple<>();

        System.out.println("Vacia: " + historial.estaVacia()); // true

        historial.insertarAlFinal("Deposito 50000");
        historial.insertarAlFinal("Retiro 20000");
        historial.insertarAlFinal("Deposito 15000");
        historial.insertarAlFinal("Deposito 30000"); // el que desbordaba el arreglo

        System.out.println("Vacia: " + historial.estaVacia()); // false
        System.out.println("Tamano: " + historial.getTamano()); // 4

        historial.recorrerEImprimir();
    }
}
```

Salida esperada:

```
Vacia: true
Vacia: false
Tamano: 4
Deposito 50000
Retiro 20000
Deposito 15000
Deposito 30000
```

Punto a resaltar: el cuarto movimiento —el que en el Paso 2 lanzaba
`ArrayIndexOutOfBoundsException`— se inserta sin ningún cambio de código ni
de capacidad. `ListaSimple<T>` nunca necesitó saber de antemano cuántos
movimientos iba a recibir.

## Preguntas socráticas

- *"¿Por qué `insertarAlFinal` necesita recorrer toda la lista con el
  `while`, si con un arreglo el acceso a cualquier posición es directo?"* —
  Respuesta esperada: porque `ListaSimple<T>` solo guarda una referencia al
  primer nodo (`head`); para llegar al último hay que seguir la cadena de
  referencias uno por uno, no hay una posición calculable como en un
  arreglo (`historial[i]`). Es el costo que la lista paga a cambio de no
  tener que copiar al crecer.
- *"Si el arreglo del Paso 3 hubiera crecido de a una casilla por vez (en
  vez de duplicar), ¿cambiaría que el costo de copiar sea O(n)?"* —
  Respuesta esperada: no cambia el costo de *cada* copia individual, que
  sigue siendo proporcional a los elementos existentes; duplicar en vez de
  sumar de a uno reduce cuántas veces hay que pagar ese costo a lo largo de
  muchas inserciones, pero no elimina el `O(n)` de cada copia.
- *"¿Qué pasaría si se llama a `setSiguiente` sobre el último nodo con
  `null` como argumento?"* — Respuesta esperada: no pasa nada distinto a lo
  que ya vale por defecto — el último nodo de la cadena siempre tiene
  `siguiente == null`; es justamente esa condición la que el `while` de
  `insertarAlFinal` usa para reconocer que llegó al final.
