> Sesión T1, Semana 6 — desarrollo en vivo del docente sobre el caso de
> referencia del Sistema Bancario. Continúa directo sobre `ListaSimple<T>`
> tal como quedó al cierre de la Semana 5 (constructor, `estaVacia()`,
> `getTamano()`, `recorrerEImprimir()`): hoy se agregan las cinco operaciones
> de la lección teórica — `insertarInicio`, `insertarFinal`,
> `insertarEnPosicion`, `buscarPorIndice` y `buscarPorValor` — y se instancia
> con `Transaccion` en vez de `String`, para que el ejemplo se vea con el
> tipo real del proyecto. Esta sesión no tiene laboratorio propio — la `P`
> de esta semana (`ListaDoble<T>` y `ListaCircular<T>`) es una práctica
> distinta, fuera de esta ronda.
>
> ⚠️ **Antes de empezar, renombra en el proyecto del estudiante**: la sesión
> práctica de la Semana 5 dejó un método `insertarAlFinal(T dato)` en
> `ListaSimple<T>` con el mismo cuerpo que el `insertarFinal(T dato)` de hoy
> — es la misma operación, solo con otro nombre. Antes de escribir el Paso 2,
> pide al estudiante que **renombre** `insertarAlFinal` a `insertarFinal`
> (y ajuste las llamadas que ya tenga en su propio `Main`), en vez de agregar
> un segundo método duplicado. La lección teórica publicada usa `insertarFinal`
> como nombre definitivo.

## Paso 0 — La clase `Transaccion` para el ejemplo

Antes de tocar `ListaSimple<T>`, se proyecta la clase de dominio que se va a
guardar en la lista durante toda la sesión. Va en `model/domain/`, no en
`model/structures/`: es un dato del caso de estudio, no parte de la
estructura genérica.

```java
package model.domain;

import java.util.Objects;

public class Transaccion {
    private String tipo;   // "Deposito", "Retiro" o "Transferencia"
    private double monto;

    public Transaccion(String tipo, double monto) {
        this.tipo = tipo;
        this.monto = monto;
    }

    public String getTipo() {
        return tipo;
    }

    public double getMonto() {
        return monto;
    }

    @Override
    public String toString() {
        // usado por recorrerEImprimir(): controla que se ve en consola por cada nodo
        return tipo + " " + monto;
    }

    @Override
    public boolean equals(Object otro) {
        // sin esto, buscarPorValor() solo encontraria el mismo objeto en memoria,
        // nunca una transaccion "equivalente" (mismo tipo y mismo monto)
        if (this == otro) {
            return true;
        }
        if (!(otro instanceof Transaccion)) {
            return false;
        }
        Transaccion t = (Transaccion) otro;
        // Objects.equals en vez de tipo.equals(t.tipo): evita NullPointerException
        // si algun dia "tipo" llega null (por ejemplo, un registro incompleto)
        return Objects.equals(tipo, t.tipo) && Double.compare(monto, t.monto) == 0;
    }

    @Override
    public int hashCode() {
        // obligatorio junto con equals(): dos objetos "iguales" deben devolver
        // el mismo hash, o la clase rompe su contrato con cualquier coleccion
        // que use tablas hash (HashSet, HashMap) mas adelante en el curso
        return Objects.hash(tipo, monto);
    }
}
```

Punto a resaltar: `equals()` está sobrescrito **a propósito**, siguiendo
exactamente la advertencia de la lección teórica. Sin este método,
`buscarPorValor()` compila y corre, pero nunca encuentra nada salvo que se
le pase la referencia exacta que ya estaba guardada.

Punto a resaltar: `hashCode()` se sobrescribe **siempre junto con**
`equals()`, aunque `ListaSimple<T>` no lo use todavía — es el contrato de
`Object` (Java lo documenta explícitamente): dos objetos que `equals()`
considera iguales deben devolver el mismo `hashCode()`. Vale la pena
mencionarlo ahora, antes de que el curso llegue a tablas hash, para que el
estudiante no arrastre el hábito de sobrescribir uno sin el otro.

## Paso 1 — Insertar al inicio: `insertarInicio`

Se abre con la operación más simple, la que no recorre nada.

```java
public void insertarInicio(T dato) {
    Nodo<T> nuevo = new Nodo<>(dato);
    nuevo.setSiguiente(head); // el nuevo nodo apunta a lo que hoy es el primero
    head = nuevo;             // la lista ahora empieza en el nuevo nodo
    tamano++;
}
```

Explicación línea a línea:
- `Nodo<T> nuevo = new Nodo<>(dato);` — crea el nodo en el heap; su
  `siguiente` nace en `null` por el constructor de `Nodo<T>`.
- `nuevo.setSiguiente(head);` — **antes** de mover `head`, el nuevo nodo se
  conecta a lo que hoy es el primero. Si se invirtiera el orden con la línea
  siguiente, `head` ya apuntaría al nuevo nodo y se perdería la única
  referencia al resto de la cadena.
- `head = nuevo;` — recién ahora la lista "empieza" un lugar antes.
- `tamano++;` — se actualiza el contador; a diferencia de `insertarFinal()`
  (Paso 2), aquí no hace falta recorrer nada antes de tocarlo.

No hay precondición que validar: insertar al inicio es válido con la lista
vacía (`head` es `null`, y `nuevo.setSiguiente(null)` es correcto) o con
cualquier tamaño.

Punto a resaltar: probarlo en vivo con `head == null` primero, para que se
vea que no hace falta un `if (estaVacia())` como en `insertarFinal()` — el
caso vacío ya queda cubierto sin rama especial.

## Paso 2 — Insertar al final: `insertarFinal`

A diferencia del paso anterior, aquí no hay una referencia guardada al
último nodo: hay que recorrer la cadena para encontrarlo.

```java
public void insertarFinal(T dato) {
    Nodo<T> nuevo = new Nodo<>(dato);
    if (estaVacia()) {
        head = nuevo; // no hay nodos que recorrer: el nuevo es el primero y el ultimo
    } else {
        Nodo<T> actual = head;
        while (actual.getSiguiente() != null) {
            actual = actual.getSiguiente(); // avanza hasta el ultimo nodo
        }
        actual.setSiguiente(nuevo); // enlaza el nuevo despues del ultimo
    }
    tamano++;
}
```

Explicación línea a línea:
- `if (estaVacia())` — caso borde obligatorio: si no hay nodos, no hay
  "último nodo" que recorrer, y el nuevo nodo se convierte directamente en
  `head`. Sin esta rama, `head` sería `null` y `actual.getSiguiente()`
  reventaría con `NullPointerException` en la primera vuelta del `while`.
- `while (actual.getSiguiente() != null)` — la condición de corte no busca
  un valor, busca la posición: el nodo cuyo `siguiente` es `null` es, por
  definición, el último.
- `actual.setSiguiente(nuevo);` — se ejecuta ya fuera del bucle, cuando
  `actual` apunta al último nodo real. Es la única línea que modifica la
  cadena.
- `tamano++;` en ambas ramas: se actualiza el contador sin importar por
  cuál de los dos caminos se llegó.

Punto a resaltar: a diferencia de `insertarInicio()`, aquí el costo sí
depende de cuántos nodos ya tiene la lista — para llegar al último hay que
pasar por todos los anteriores. Es la primera pista visible de que no todas
las operaciones cuestan lo mismo (se retoma formalmente en la sección de
complejidad de la lección teórica).

## Paso 3 — Insertar en una posición arbitraria: `insertarEnPosicion`

Generaliza los dos pasos anteriores: insertar al inicio, al final o en
cualquier punto intermedio son en realidad el mismo problema con distinto
punto de entrada.

```java
public void insertarEnPosicion(int indice, T dato) {
    if (indice < 0 || indice > tamano) {
        // precondicion: los indices validos para INSERTAR van de 0 a tamano
        // (tamano incluido, porque insertar en tamano equivale a insertar al final)
        throw new IndexOutOfBoundsException("Indice fuera de rango: " + indice);
    }
    if (indice == 0) {
        insertarInicio(dato); // caso extremo izquierdo: delega, no duplica logica
        return;
    }
    if (indice == tamano) {
        insertarFinal(dato); // caso extremo derecho: delega, no duplica logica
        return;
    }

    Nodo<T> anterior = head;
    for (int i = 0; i < indice - 1; i++) {
        anterior = anterior.getSiguiente(); // avanza hasta el nodo previo a "indice"
    }

    Nodo<T> nuevo = new Nodo<>(dato);
    nuevo.setSiguiente(anterior.getSiguiente()); // 1: el nuevo apunta a lo que seguia
    anterior.setSiguiente(nuevo);                // 2: el anterior ahora apunta al nuevo
    tamano++;
}
```

Explicación línea a línea:
- La validación de rango va **primero**, antes de cualquier otra cosa. El
  rango válido para insertar es `0 <= indice <= tamano` — con `tamano`
  incluido, a diferencia de las búsquedas, porque insertar justo después del
  último nodo es un caso legítimo (equivale a insertar al final).
- `indice == 0` y `indice == tamano` delegan a los métodos ya escritos en
  vez de repetir su lógica: evita mantener dos copias del mismo caso borde.
- El `for` avanza hasta el nodo **anterior** a la posición pedida —no hasta
  la posición misma— porque para insertar hay que reenlazar ese nodo previo.
- Las dos últimas líneas son el corazón del método, y **el orden es
  obligatorio**: primero se conecta el nodo nuevo con lo que seguía
  (`anterior.getSiguiente()`, todavía sin modificar), y solo después se
  redirige `anterior` hacia el nuevo nodo. Si se invierte el orden, la
  línea `nuevo.setSiguiente(anterior.getSiguiente())` ya leería el nuevo
  nodo como "lo que sigue" — el nuevo nodo terminaría apuntándose a sí
  mismo y el resto de la cadena, perdido.

Punto a resaltar: proyectar el `IndexOutOfBoundsException` en vivo —
llamarlo con `indice = tamano + 1` y con `indice = -1` — para que el mensaje
de error se vea, no solo se lea en el código.

## Paso 4 — Búsqueda por índice: `buscarPorIndice`

Cambia el objetivo: ya no se inserta, se **recorre** para leer un dato sin
modificar la lista.

```java
public T buscarPorIndice(int indice) {
    if (indice < 0 || indice >= tamano) {
        // precondicion: para BUSCAR el rango es 0 <= indice < tamano
        // (tamano EXCLUIDO: con tamano elementos, el ultimo indice valido es tamano - 1)
        throw new IndexOutOfBoundsException("Indice fuera de rango: " + indice);
    }
    Nodo<T> actual = head;
    for (int i = 0; i < indice; i++) {
        actual = actual.getSiguiente(); // avanza un nodo por cada posicion contada
    }
    return actual.getDato();
}
```

Explicación línea a línea:
- La condición de rango **cambia respecto a `insertarEnPosicion`**: aquí es
  `indice >= tamano`, no `indice > tamano`. Con una lista de `tamano`
  elementos, los índices ocupados van de `0` a `tamano - 1`; pedir
  `buscarPorIndice(tamano)` sobre una lista de tamaño 3 sería pedir la
  posición 4, que no existe. Vale la pena señalar en pantalla esta
  asimetría con el paso anterior — es la fuente más común de un
  `off-by-one` en este tema.
- Si la validación se omitiera, el `for` seguiría intentando
  `actual.getSiguiente()` sobre un `actual` que ya es `null`, y el error
  sería `NullPointerException` en vez de un mensaje claro sobre el índice.
- El `for` no calcula una posición como en un arreglo: **cuenta pasos**,
  avanzando la referencia `actual` un nodo a la vez. No hay otra forma de
  llegar a la posición `indice` en una lista enlazada.
- `actual.getDato()` se ejecuta ya fuera del bucle, cuando `actual` apunta
  exactamente al nodo buscado.

Punto a resaltar: `actual` es una variable local — moverla con
`actual = actual.getSiguiente()` nunca toca `head`. La lista real no se
altera por consultarla.

## Paso 5 — Búsqueda por valor: `buscarPorValor`

Cierra el desarrollo con la búsqueda que no conoce la posición de antemano.

```java
public boolean buscarPorValor(T dato) {
    Nodo<T> actual = head;
    while (actual != null) {
        if (actual.getDato().equals(dato)) {
            return true; // encontrado: se corta el recorrido, no hace falta seguir
        }
        actual = actual.getSiguiente();
    }
    return false; // se recorrio toda la lista sin encontrar coincidencia
}
```

Explicación línea a línea:
- No hay validación de rango porque no hay índice que validar: la única
  precondición implícita es que `T` tenga un `equals()` que compare por
  contenido — si no está sobrescrito (como en el `Paso 0`), el método sigue
  siendo correcto, pero solo "encuentra" el objeto exacto ya guardado.
- El `while` usa `actual != null` como condición de corte, no un contador:
  no se sabe de antemano cuántos nodos hay que recorrer.
- `actual.getDato().equals(dato)` — nótese el orden: se llama `equals()`
  **sobre el dato del nodo**, pasándole el dato buscado como argumento. Esto
  evita un `NullPointerException` cuando `dato` (el argumento buscado) es
  `null` y `actual.getDato()` no lo es. Pero si algún nodo llegara a guardar
  un dato `null` (`actual.getDato()` nulo), esta línea sí revienta: en ese
  caso conviene `Objects.equals(actual.getDato(), dato)`, que es seguro en
  ambos sentidos — vale la pena mencionarlo si algún estudiante pregunta por
  el caso.
- El `return true` dentro del `if` corta el recorrido apenas hay
  coincidencia — no sigue avanzando innecesariamente.
- Si el `while` termina sin haber retornado, es porque `actual` llegó a
  `null` tras pasar por todos los nodos sin coincidencia: de ahí el
  `return false` final.

Punto a resaltar: correr `buscarPorValor(new Transaccion("Deposito", 50000))`
dos veces en vivo — una vez con la sobrescritura de `equals()` activa (da
`true` si existe una transacción equivalente) y, comentando temporalmente el
`equals()` de `Transaccion`, otra vez (da `false` aunque los valores sean
idénticos, porque cae en la comparación de referencias de `Object`). Es la
demostración más directa de por qué la advertencia de la lección teórica no
es opcional.

## Paso 6 — Prueba completa con `Transaccion`

Se cierra el desarrollo instanciando `ListaSimple<Transaccion>` y ejercitando
las cinco operaciones nuevas sobre el mismo escenario del historial bancario.

```java
public class Main {
    public static void main(String[] args) {
        ListaSimple<Transaccion> historial = new ListaSimple<>();

        historial.insertarFinal(new Transaccion("Deposito", 50000));
        historial.insertarFinal(new Transaccion("Retiro", 20000));
        historial.insertarFinal(new Transaccion("Deposito", 15000));

        // insertarInicio: la mas reciente pasa a mostrarse primero
        historial.insertarInicio(new Transaccion("Transferencia", 10000));

        // insertarEnPosicion: una transaccion de ajuste despues de la posicion 2
        historial.insertarEnPosicion(2, new Transaccion("Ajuste", 500));

        historial.recorrerEImprimir();
        System.out.println("Tamano: " + historial.getTamano()); // 5

        // buscarPorIndice: la transaccion que quedo en la posicion 0
        System.out.println("Indice 0: " + historial.buscarPorIndice(0));

        // buscarPorValor: existe una transaccion equivalente a esta?
        boolean existe = historial.buscarPorValor(new Transaccion("Retiro", 20000));
        System.out.println("Existe Retiro 20000: " + existe);

        // precondicion violada a proposito, para mostrar la excepcion en pantalla
        try {
            historial.buscarPorIndice(10);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Error esperado: " + e.getMessage());
        }
    }
}
```

Salida esperada:

```
Transferencia 10000.0
Deposito 50000.0
Ajuste 500.0
Retiro 20000.0
Deposito 15000.0
Tamano: 5
Indice 0: Transferencia 10000.0
Existe Retiro 20000: true
Error esperado: Indice fuera de rango: 10
```

Punto a resaltar: recorrer en pantalla, nodo por nodo, cómo quedó la cadena
tras `insertarInicio` y `insertarEnPosicion(2, ...)` — dibujar las flechas
en el tablero ayuda a que se vea por qué el orden quedó
`Transferencia → Deposito(50000) → Ajuste → Retiro → Deposito(15000)` y no
otro.

## Preguntas socráticas

- *"¿Por qué `insertarEnPosicion` valida `indice > tamano` pero
  `buscarPorIndice` valida `indice >= tamano`?"* — Respuesta esperada:
  porque son rangos distintos por naturaleza. Insertar en la posición
  `tamano` es válido (es insertar al final, después del último nodo
  existente); buscar en la posición `tamano` no lo es, porque con `tamano`
  elementos el último índice ocupado es `tamano - 1`. Confundir estos dos
  rangos es el error más común al escribir estas dos operaciones.
- *"Si se llama a `insertarEnPosicion(0, dato)`, ¿por qué no hace falta
  manejar el caso de lista vacía por separado?"* — Respuesta esperada:
  porque el método delega en `insertarInicio(dato)`, y esa operación ya
  funciona correctamente con `head == null` — `nuevo.setSiguiente(null)` es
  válido y es la única situación posible cuando la lista está vacía.
- *"¿Qué pasaría si `buscarPorValor` no cortara con `return true` apenas
  encuentra la coincidencia, sino que siguiera recorriendo hasta el final
  de la lista?"* — Respuesta esperada: el resultado sería el mismo (sigue
  devolviendo `true` si existe), pero se perdería la posibilidad de ganar
  tiempo cuando la coincidencia está cerca del `head`: en vez de O(1) en el
  mejor caso y O(n) en el peor, el método pasaría a ser siempre O(n).
