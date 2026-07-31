# Proyecto de Aula — Sistema Bancario

## Descripción

Aplicación de consola que simula la gestión básica de un banco: clientes, cuentas de ahorro y corriente, depósitos, retiros y transferencias, con persistencia en archivos de texto.

## Evaluación de viabilidad

**Viabilidad: Alta.**

El dominio bancario es familiar para los estudiantes y ofrece casos de uso naturales para cada estructura del curso:

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Cuenta` → `CuentaAhorros`, `CuentaCorriente` |
| Lista simple | Historial de transacciones de una cuenta |
| Lista doble | Navegación hacia adelante/atrás en el historial |
| Archivos | Persistencia de cuentas y movimientos |
| Pila | Deshacer la última operación registrada |
| Cola | Cola de atención en ventanilla / transferencias pendientes |
| Recursividad | Cálculo de interés compuesto, búsqueda en historial |
| BST | Búsqueda de clientes por número de identificación |

**Riesgo principal:** los estudiantes pueden querer implementar lógica financiera compleja (intereses variables, créditos). Acotar el alcance a operaciones básicas desde el Sprint 1.

---

## Entidades del dominio

- `Cliente` — identificación, nombre, teléfono, dirección
- `Cuenta` — número de cuenta, saldo, fecha de apertura *(clase abstracta)*
- `CuentaAhorros` — tasa de interés
- `CuentaCorriente` — cupo de sobregiro
- `Transaccion` — tipo (depósito / retiro / transferencia), monto, fecha

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–5)*

**Entregable:** esqueleto del sistema con las capas definidas y las entidades del dominio modeladas.

- Configurar el repositorio Git con la estructura de paquetes (`model/domain`, `model/structures`, `service`, `controller`, `view`)
- Modelar `Cliente`, `Cuenta` (abstracta), `CuentaAhorros` y `CuentaCorriente` en `model/domain/`
- Implementar encapsulamiento con validaciones (saldo no negativo, identificación no vacía)
- Diseñar el diagrama UML de las cuatro capas con las entidades del sprint
- Menú de consola funcional en `view/` con opciones básicas (crear cliente, crear cuenta)
- Stub de `ClienteService` y `CuentaService` en `service/`

---

### Sprint 2 — Listas y persistencia *(Semanas 6–11)*

**Entregable:** gestión de múltiples clientes y cuentas con historial de transacciones y persistencia en archivos.

- Reemplazar los arreglos temporales por `ListaSimple<T>` para gestionar clientes y cuentas
- Implementar historial de transacciones con `ListaSimple<Transaccion>` por cuenta
- Agregar operaciones de depósito, retiro y transferencia desde el `Service`
- Ordenar el historial de transacciones por monto o por fecha (`InsertionSort` / `SelectionSort` en el `Service`)
- Persistir clientes y cuentas en `data/clientes.txt` y `data/cuentas.txt`; reconstruir la lista al iniciar

---

### Sprint 3 — Pilas y Colas *(Semanas 12–13)*

**Entregable:** operaciones de deshacer y simulación de cola de atención en ventanilla.

- Implementar `Pila<Transaccion>` para registrar las últimas operaciones y ofrecer la opción "deshacer última transacción"
- Implementar `Cola<Cliente>` para simular la cola de atención en ventanilla (turno, siguiente cliente)
- Integrar ambas estructuras a través del `Service`; el `Controller` solo llama métodos del servicio

---

### Sprint 4 — Recursividad *(Semana 14)*

**Entregable:** al menos dos algoritmos recursivos integrados al sistema.

- Búsqueda recursiva de una transacción por monto en el historial de una cuenta
- Cálculo recursivo del saldo total de todos las cuentas de un cliente

---

### Sprint 5 — Árboles e integración final *(Semanas 15–17)*

**Entregable:** proyecto completo con búsqueda eficiente por BST y demostración de las cuatro capas correctamente separadas.

- Implementar `BST<Cliente>` ordenado por número de identificación para búsqueda en O(log n)
- Comparar tiempos de búsqueda entre `ListaSimple` y `BST` con `System.nanoTime()`
- Revisión final de la separación de capas: ninguna clase de `view/` o `controller/` referencia estructuras de `model/structures/` directamente
- Presentación del diagrama UML actualizado con todas las clases del proyecto
