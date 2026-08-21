# Proyecto de Aula — Papelería

## Descripción

Aplicación de consola para gestionar el inventario, las ventas y los pedidos a proveedores de una papelería. Permite registrar productos, realizar ventas, controlar el stock y generar reportes básicos.

## Evaluación de viabilidad

**Viabilidad: Media-Alta.**

El dominio es cotidiano y fácil de entender. El riesgo es que el caso de uso puede sentirse limitado si no se diseña bien el módulo de pedidos y el historial de ventas, que son los que habilitan las estructuras más avanzadas.

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Producto` → `ProductoOficina`, `ProductoEscolar`, `ProductoArte` |
| Lista simple | Inventario de productos, historial de ventas |
| Lista doble | Navegación de catálogo hacia adelante/atrás |
| Archivos | Persistencia de inventario y registro de ventas |
| Pila | Deshacer la última venta registrada |
| Cola | Cola de pedidos pendientes a proveedor |
| Recursividad | Búsqueda de producto por categoría anidada, cálculo de valor total del inventario |
| BST | Búsqueda de productos por código, tabla de productos ordenados por precio |

**Riesgo principal:** el dominio puede agotarse rápido. Para mantener el proyecto vivo hasta el Sprint 5 es clave introducir categorías de productos con herencia y un módulo de pedidos a proveedores que use la cola de forma significativa.

---

## Entidades del dominio

- `Producto` — código, nombre, precio, cantidad en stock *(clase abstracta)*
- `ProductoOficina` — (ej. resmas, carpetas)
- `ProductoEscolar` — (ej. cuadernos, lápices)
- `ProductoArte` — (ej. pinceles, lienzos)
- `Venta` — lista de ítems vendidos, total, fecha
- `ItemVenta` — producto y cantidad
- `Proveedor` — nombre, teléfono, categoría de productos que suministra
- `Pedido` — proveedor, lista de productos solicitados, fecha

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–4)*

**Entregable:** catálogo de productos modelado con herencia y menú de consola operativo.

- Configurar el repositorio Git con la estructura de paquetes
- Modelar `Producto` (abstracta), `ProductoOficina`, `ProductoEscolar`, `ProductoArte` en `model/domain/`
- Implementar encapsulamiento con validaciones (precio positivo, stock no negativo)
- Modelar `Proveedor` e `ItemVenta`
- Diseñar el diagrama UML de las tres capas
- Menú de consola para agregar, listar y buscar productos

---

### Sprint 2 — Listas *(Semanas 5–7)*

**Entregable:** inventario dinámico con ventas registradas, ordenamiento.

- Gestionar el inventario con `ListaSimple<Producto>` en el `Service`
- Registrar ventas como `ListaSimple<Venta>`; cada venta contiene su propia `ListaSimple<ItemVenta>`
- Actualizar el stock automáticamente al registrar una venta
- Ordenar el inventario por precio o por nombre

---

### Sprint 3 — Pilas y Colas *(Semanas 8–9)*

**Entregable:** deshacer ventas y gestión de pedidos a proveedor.

- Implementar `Pila<Venta>` para permitir anular la última venta (restaurando el stock)
- Implementar `Cola<Pedido>` para encolar pedidos a proveedores y procesarlos en orden de llegada
- El `Service` expone `deshacerVenta()` y `procesarSiguientePedido()`

---

### Sprint 4 — Persistencia y recursividad *(Semanas 10–13)*

**Entregable:** persistencia del sistema en archivos y al menos dos algoritmos recursivos integrados.

- Persistir inventario en `data/inventario.txt` y ventas en `data/ventas.txt`
- Calcular recursivamente el valor total del inventario (suma de precio × stock de cada producto)
- Buscar recursivamente un producto por código dentro de una categoría

---

### Sprint 5 — Árboles e integración final *(Semanas 14–16)*

**Entregable:** búsqueda eficiente por código y proyecto completo integrado.

- Implementar `BST<Producto>` ordenado por código para búsqueda rápida
- Comparar búsqueda lineal vs. BST con `System.nanoTime()`
- Revisión de separación de capas y presentación del diagrama UML final actualizado
