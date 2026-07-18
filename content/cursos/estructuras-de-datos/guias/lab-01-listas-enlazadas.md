# Laboratorio 01 — Listas Enlazadas en Java

## Objetivo

Implementar una estructura de datos de **lista enlazada simple** y una **lista doblemente enlazada** en Java, consolidando los conceptos de encapsulamiento, métodos genéricos y manejo de referencias.

Competencias esperadas:
- Diseñar e implementar nodos con referencias.
- Implementar operaciones fundamentales: inserción, eliminación, búsqueda y recorrido.
- Usar genéricos para reutilizar código.
- Validar precondiciones y postcondiciones.

---

## Requisitos Previos

Antes de comenzar, debe dominar:
- Clases, constructores y atributos en Java (spec-009).
- Encapsulamiento: modificadores `private`, `public` y métodos accesores (spec-010).
- Manejo de referencias y null en Java.
- Recursión o iteración para recorridos.

---

## Desarrollo del Laboratorio

### Parte 1 — Nodo Simple

Implemente una clase genérica `Node<T>` que represente un nodo en una lista enlazada:

```java
public class Node<T> {
    private T data;
    private Node<T> next;

    public Node(T data) {
        this.data = data;
        this.next = null;
    }

    // Getters y setters
}
```

**Requisitos:**
- Encapsulamiento completo con getters y setters.
- No permitir crear un nodo sin datos (validar en constructor).

### Parte 2 — Lista Enlazada Simple

Implemente una clase genérica `SinglyLinkedList<T>`:

```java
public class SinglyLinkedList<T> {
    private Node<T> head;
    private int size;

    public SinglyLinkedList() { }

    public void insert(T data) { }
    public boolean remove(T data) { }
    public boolean contains(T data) { }
    public void clear() { }
    public int getSize() { }
}
```

**Operaciones obligatorias:**
- `insert(T data)`: Insertar al final.
- `insertAt(int index, T data)`: Insertar en posición específica (0 ≤ index ≤ size).
- `remove(T data)`: Eliminar la primera ocurrencia.
- `removeAt(int index)`: Eliminar por índice.
- `contains(T data)`: Búsqueda.
- `get(int index)`: Obtener elemento en posición.
- `clear()`: Limpiar la lista.
- `getSize()`: Retornar tamaño.

**Restricciones:**
- Mantener `size` actualizado en cada operación.
- Validar índices (lanzar `IndexOutOfBoundsException` si inválido).
- Retornar valores sensatos si la lista está vacía.

### Parte 3 — Lista Doblemente Enlazada (Opcional / Avanzado)

Implemente una clase genérica `DoublyLinkedList<T>` con nodos que tengan referencias `prev` y `next`.

**Operaciones adicionales:**
- Recorrer hacia atrás desde el final.
- Insertar y eliminar desde ambos extremos en O(1).

---

## Entregable

Empaquete su solución en un único archivo `.zip` con la siguiente estructura:

```
lab-01-listas-enlazadas.zip
├── Node.java
├── SinglyLinkedList.java
├── DoublyLinkedList.java (opcional)
├── TestNode.java
├── TestSinglyLinkedList.java
├── TestDoublyLinkedList.java (opcional)
└── LEEME.txt (instrucciones de compilación)
```

### Ejemplo de `TestSinglyLinkedList.java`:

```java
public class TestSinglyLinkedList {
    public static void main(String[] args) {
        SinglyLinkedList<Integer> list = new SinglyLinkedList<>();
        
        // Insertar
        list.insert(10);
        list.insert(20);
        list.insert(30);
        
        // Verificar tamaño
        assert list.getSize() == 3 : "Tamaño incorrecto";
        
        // Buscar
        assert list.contains(20) : "No encontró 20";
        
        // Remover
        list.remove(20);
        assert list.getSize() == 2 : "Size no decrementó";
        
        System.out.println("Todos los tests pasaron.");
    }
}
```

---

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Encapsulamiento** | 15 | Todos los atributos privados, métodos públicos bien diseñados. |
| **Genéricos** | 15 | Uso correcto de `<T>` en clases y métodos. |
| **Operaciones Básicas** | 30 | `insert`, `remove`, `contains` funcionan correctamente. |
| **Validación** | 15 | Índices validados, manejo de `null`, casos límite. |
| **Tests** | 15 | Mínimo 10 casos de prueba unitarios automatizados. |
| **Documentación** | 10 | Comentarios JavaDoc en métodos públicos. |
| **Código Limpio** | 5 | Nombre de variables, indentación, sin código muerto. |
| **TOTAL** | **100** | |

---

## Dificultades Comunes

### "¿Por qué mi código compila pero falla al ejecutar?"
- Verifique que no asume precondiciones sin validar (p. ej., `head != null`).
- Use un debugger para seguir paso a paso la inserción y eliminación.

### "¿Cómo recorro la lista si no sé su tamaño?"
- Mantenga una referencia `current` que avanza hasta `next == null`.

### "¿Eliminar un nodo intermedio rompe la lista?"
- No olvide actualizar `prev.next` para saltarse el nodo eliminado.

---

## Extensiones Sugeridas (Bonus)

- Implementar `Iterable` y un iterador personalizado.
- Añadir operaciones de búsqueda binaria (no aplica a listas enlazadas, pero sí a arrays).
- Visualizar la lista en consola con una representación ASCII.

---

## Recursos

- **Apuntes del curso:** Clase 08 (Encapsulamiento y TAD).
- **Libro de referencia:** *Introduction to Algorithms* (Cormen et al.), Cap. 10.
- **Editor de código recomendado:** IntelliJ IDEA Community Edition o Eclipse.

**Plazo de entrega:** 2 semanas desde la publicación de esta guía.
