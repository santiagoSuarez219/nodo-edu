> Solución de referencia para comparar contra las entregas del laboratorio y
> para demostrar en vivo si algún equipo se traba con `Node<T>` o con el
> mantenimiento de `size`.

## Paso 1 — `Node<T>`

```java
public class Node<T> {
    private T data;
    private Node<T> next;

    public Node(T data) {
        if (data == null) {
            throw new IllegalArgumentException("data no puede ser null");
        }
        this.data = data;
        this.next = null;
    }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    public Node<T> getNext() { return next; }
    public void setNext(Node<T> next) { this.next = next; }
}
```

Punto a resaltar: la validación de `data == null` en el constructor es lo que
distingue una entrega que solo "compila" de una que valida precondiciones —
criterio de evaluación "Validación" de la guía del estudiante.

## Paso 2 — `insert` y `getSize`

```java
public class SinglyLinkedList<T> {
    private Node<T> head;
    private int size;

    public void insert(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode;
        } else {
            Node<T> current = head;
            while (current.getNext() != null) {
                current = current.getNext();
            }
            current.setNext(newNode);
        }
        size++;
    }

    public int getSize() { return size; }
}
```

Demostrar en pantalla la traza de `current` avanzando hasta `next == null` —
es la dificultad común #2 de la guía del estudiante ("¿Cómo recorro la lista
si no sé su tamaño?").

## Paso 3 — `contains` y `remove`

```java
public boolean contains(T data) {
    Node<T> current = head;
    while (current != null) {
        if (current.getData().equals(data)) return true;
        current = current.getNext();
    }
    return false;
}

public boolean remove(T data) {
    if (head == null) return false;

    if (head.getData().equals(data)) {
        head = head.getNext();
        size--;
        return true;
    }

    Node<T> current = head;
    while (current.getNext() != null) {
        if (current.getNext().getData().equals(data)) {
            current.setNext(current.getNext().getNext());
            size--;
            return true;
        }
        current = current.getNext();
    }
    return false;
}
```

Punto a resaltar: `remove` sobre el `head` es un caso especial (no hay nodo
`prev` que actualizar) — la dificultad común #3 de la guía ("¿Eliminar un
nodo intermedio rompe la lista?") aplica igual al caso general con
`current.setNext(current.getNext().getNext())`.

## Paso 4 — `insertAt` y `removeAt` (validación de índices)

```java
public void insertAt(int index, T data) {
    if (index < 0 || index > size) {
        throw new IndexOutOfBoundsException("index fuera de rango: " + index);
    }
    if (index == 0) {
        Node<T> newNode = new Node<>(data);
        newNode.setNext(head);
        head = newNode;
        size++;
        return;
    }
    Node<T> current = head;
    for (int i = 0; i < index - 1; i++) {
        current = current.getNext();
    }
    Node<T> newNode = new Node<>(data);
    newNode.setNext(current.getNext());
    current.setNext(newNode);
    size++;
}
```

`removeAt(int index)` sigue el mismo patrón: validar rango primero, resolver
`index == 0` como caso especial, y en el resto avanzar hasta `index - 1` para
saltar el nodo objetivo.

## Verificación rápida en clase

```java
SinglyLinkedList<Integer> list = new SinglyLinkedList<>();
list.insert(10);
list.insert(20);
list.insert(30);
assert list.getSize() == 3;
assert list.contains(20);
list.remove(20);
assert list.getSize() == 2;
```

Si un equipo falla exactamente este bloque, casi siempre es porque `size` no
se decrementó en `remove`, o porque `remove(head)` no reasignó `head`.
