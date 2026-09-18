---
title: "Laboratorio Evaluativo — Lista Simple (Momento 2)"
updatedAt: "2026-09-18"
---

# Laboratorio Evaluativo — Lista Simple (Momento 2)

## Objetivo

Consolidar el manejo de `ListaSimple<T>` — la clase genérica que se construyó
 y sobre la que implementó inserción, búsqueda y eliminación
en las lecciones "Operaciones sobre la lista simple" y "Eliminación en
lista simple y comparación con arreglos" — a través de dos entregables
complementarios: una exposición por equipos que explica el fundamento de
las listas enlazadas, y una implementación que integra `ListaSimple<T>` a
su propio proyecto de aula.

**Competencias esperadas:**
- Explicar con rigor el algoritmo de las operaciones de inserción, búsqueda
  o eliminación sobre una lista enlazada, con su análisis de complejidad.
- Comunicar gráficamente, nodo por nodo, el efecto de cada operación sobre
  la cadena de nodos.
- Reconocer relaciones uno-a-muchos entre entidades de un dominio y decidir
  cuándo representarlas con una lista enlazada en vez de un arreglo.
- Reemplazar una estructura de datos elegida en el momento evaluativo anterior por otra
  más adecuada, sin dejar código muerto.

---

## Este laboratorio tiene dos entregables independientes

| Parte | Entregable | Peso del curso |
|---|---|---|
| Parte 1 | Exposición por equipos | 10 % |
| Parte 2 | Implementación en el proyecto de aula | 5 % |

Ambas partes cierran el **Momento evaluativo 2 — Listas: lista simple
(15 %)**. Léalas completas: no son alternativas, son complementarias.

**Fechas:** exposición el **viernes 25 de septiembre**; implementación en
GitHub antes del **domingo 27 de septiembre**.

---

## Parte 1 — Exposición por equipos (10 %)

El curso está organizado en los mismos 10 equipos de trabajo del proyecto
de aula. A cada equipo se le asigna **una operación general** sobre la
lista simple: **inserción**, **búsqueda/recorrido** o **eliminación**. Como
hay 3 operaciones generales y 10 equipos, varios equipos exponen la misma
operación general:

| Equipo | Operación general asignada |
|---|---|
| Equipo 1 | Inserción |
| Equipo 2 | Inserción |
| Equipo 3 | Inserción |
| Equipo 4 | Inserción |
| Equipo 5 | Búsqueda/recorrido |
| Equipo 6 | Búsqueda/recorrido |
| Equipo 7 | Búsqueda/recorrido |
| Equipo 8 | Eliminación |
| Equipo 9 | Eliminación |
| Equipo 10 | Eliminación |

Según la operación general que le fue asignada a su equipo, debe explicar
las **3 variantes** correspondientes:

- **Inserción:** `insertarInicio`, `insertarFinal`, `insertarEnPosicion`.
- **Búsqueda/recorrido:** `buscarPorIndice`, `buscarPorValor`,
  `recorrerEImprimir` (listar los datos de la lista).
- **Eliminación:** `eliminarInicio`, `eliminarFinal`, `eliminarPorValor`.

### Contenido obligatorio de la exposición

1. **Qué son las listas enlazadas y sus ventajas** frente a arreglos, en
   general (no específico a su operación todavía).
2. **El algoritmo de cada una de las 3 variantes**, en pseudocódigo.
3. **Explicación muy gráfica** de cada variante: diagramas nodo por nodo,
   mostrando el estado de la cadena antes y después de cada operación.
4. **Comparación con arreglos específica a su operación general**: por qué
   insertar/buscar/eliminar en una lista cuesta lo que cuesta frente a
   hacerlo en un arreglo, con la notación Big O de cada caso.
5. **Cómo implementaron esa funcionalidad en su propio proyecto de aula**:
   qué entidad o entidades usan esa operación general y para qué la usan.

### Formato de la exposición

- **Fecha: viernes 25 de septiembre.**
- Duración y medio de apoyo (diapositivas, pizarra, o ambos) a definir por
  el docente.
- Participación de todos los integrantes del equipo: la rúbrica evalúa
  trabajo en equipo como criterio propio.

### Criterios de Evaluación — Exposición

| Criterio | Puntos | Descripción |
|---|---|---|
| **Claridad conceptual de las listas enlazadas y sus ventajas** | 15 | El equipo explica con sus propias palabras qué es una lista enlazada, qué es un nodo, y por qué existe frente a un arreglo, sin errores conceptuales. |
| **Rigor del pseudocódigo de las 3 variantes** | 20 | El pseudocódigo de cada una de las 3 variantes asignadas refleja el reenlace de referencias correcto (orden de las reasignaciones), incluyendo el manejo de los casos borde (lista vacía, un solo nodo). |
| **Calidad de los diagramas gráficos** | 20 | Cada variante tiene al menos un diagrama nodo por nodo con el estado de la cadena antes y después de la operación, con las referencias (`head`, `siguiente`) etiquetadas de forma legible. |
| **Comparación con arreglos específica a la operación** | 15 | El equipo explica, con la notación Big O correspondiente, por qué su operación general cuesta lo que cuesta en una lista frente a un arreglo — no una comparación genérica repetida para las tres operaciones del curso. |
| **Conexión con su propio proyecto de aula** | 15 | El equipo muestra en qué entidad o entidades de su caso de estudio usa esa operación general, con un ejemplo concreto (no solo "la usamos en el proyecto"). |
| **Manejo de preguntas del grupo/docente** | 10 | Los integrantes responden preguntas sobre el contenido expuesto con seguridad y precisión, sin depender de leer las diapositivas. |
| **Trabajo en equipo** | 5 | Todos los integrantes exponen una parte sustancial; no hay un solo integrante cargando toda la presentación. |
| **TOTAL** | **100** | |

La nota de esta parte se calcula sobre 100 y se escala al **10 %** del
curso:

```
nota_exposicion (0-100) = suma de los 7 criterios anteriores
peso_exposicion_curso (%) = (nota_exposicion / 100) x 10%
```

---

## Parte 2 — Implementación en el proyecto de aula (5 %)

Su equipo debe implementar **dos `ListaSimple<T>`** dentro de su propio
proyecto de aula, cada una representando una relación **uno-a-muchos**
distinta entre entidades de su caso de estudio.

### Cómo identificar las relaciones

Piense en su caso de estudio: ¿qué entidad tiene "muchas" de otra entidad?
Esa es una relación uno-a-muchos, y el lado "muchos" es candidato a
representarse con `ListaSimple<T>` en vez de un arreglo o un `ArrayList`.

Para cada uno de los cinco proyectos elegibles, dos relaciones candidatas
(puede usar estas o justificar otras igual de válidas de su propio caso):

| Proyecto | Relación candidata 1 | Relación candidata 2 |
|---|---|---|
| Papelería | `Proveedor` (1) → `Pedido` (muchos) | `Venta` (1) → `ItemVenta` (muchos) |
| Consultorio Médico | `Paciente` (1) → `Cita` (muchos) | `Paciente` (1) → `Consulta` (muchos) |
| Clínica Veterinaria | `Animal` (1) → `Consulta` (muchos) | `Animal` (1) → `Vacuna` (muchos) |
| Sistema Académico | `Estudiante` (1) → `Matricula` (muchos) | `Estudiante` (1) → `Calificacion` (muchos) |
| Liga de Fútbol | `Equipo` (1) → `Jugador` (muchos) | `Partido` (1) → `Gol` (muchos) |

### Requisitos de implementación

- Reutilice la clase `ListaSimple<T>` genérica que ya construyó en
  `model/structures/` — no la reescriba.
- Para cada una de las dos relaciones elegidas, la entidad del lado "uno"
  debe guardar el lado "muchos" en un atributo de tipo `ListaSimple<T>` (por
  ejemplo, `private ListaSimple<Pedido> pedidos;` dentro de `Proveedor`).
- **Si esa relación ya estaba implementada con un arreglo o un
  `ArrayList`** (de la práctica de POO del Sprint 1), debe **reemplazarlo**
  por `ListaSimple<T>` — no dejar ambas estructuras en paralelo. Elimine el
  atributo anterior y ajuste cualquier método que lo usara.
- Los métodos del `Service` que agregan, consultan o eliminan elementos de
  esa colección deben usar los métodos de `ListaSimple<T>`
  (`insertarFinal`, `buscarPorValor`, `eliminarPorValor`, etc.) en vez de
  operar directamente sobre un arreglo.
- La `View` no debe referenciar `ListaSimple<T>` directamente: sigue
  llamando al `Service`.
- **Cree un menú en consola** (en `view/`) para interactuar con las
  operaciones de las dos `ListaSimple<T>` que implementó: agregar,
  buscar/listar y eliminar elementos de cada una de las dos relaciones,
  llamando siempre al `Service` correspondiente. Es la forma en que el
  docente va a probar su implementación al revisar la entrega.

Patrón general de referencia (no es la solución de ningún proyecto
concreto — adáptelo a sus propias entidades):

```java
// Dentro de la entidad del lado "uno" (paquete model/domain/)
public class Proveedor {
    private String nombre;
    private ListaSimple<Pedido> pedidos; // antes: Pedido[] o ArrayList<Pedido>

    public Proveedor(String nombre) {
        this.nombre = nombre;
        this.pedidos = new ListaSimple<>();
    }

    public ListaSimple<Pedido> getPedidos() {
        return pedidos;
    }
}
```

```java
// Dentro del Service correspondiente
public void registrarPedido(Proveedor proveedor, Pedido pedido) {
    proveedor.getPedidos().insertarFinal(pedido); // usa ListaSimple<T>, no un arreglo
}
```

### Criterios de Evaluación — Implementación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Identificación correcta de las relaciones uno-a-muchos** | 20 | Las dos relaciones elegidas son efectivamente uno-a-muchos entre entidades reales de su caso de estudio, y la justificación (si difiere de las candidatas sugeridas) es coherente con el dominio. |
| **Implementación correcta de `ListaSimple<T>` integrada al `Service`** | 30 | La entidad del lado "uno" guarda el lado "muchos" en un atributo `ListaSimple<T>`; el `Service` usa los métodos de `ListaSimple<T>` (no manipula nodos directamente ni referencia la lista desde la `View`) para las operaciones de alta, consulta y baja sobre esa colección. |
| **Menú en consola funcional** | 15 | El menú de `view/` permite agregar, buscar/listar y eliminar elementos de las dos `ListaSimple<T>` a través del `Service` correspondiente, sin errores al ejecutarlo. |
| **Reemplazo efectivo del arreglo previo, sin código muerto** | 20 | Cuando la relación ya existía como arreglo o `ArrayList`, quedó completamente reemplazada: no hay atributos, imports ni métodos del arreglo anterior sin usar. |
| **Buenas prácticas (commits y nombres)** | 15 | Commits descriptivos y frecuentes sobre la rama del proyecto (no un único commit al final ni trabajo directo en `main`); nombres de clases, métodos y variables siguiendo las convenciones de Java. |
| **TOTAL** | **100** | |

La nota de esta parte se calcula sobre 100 y se escala al **5 %** del
curso:

```
nota_implementacion (0-100) = suma de los 4 criterios anteriores
peso_implementacion_curso (%) = (nota_implementacion / 100) x 5%
```

---

## Nota final del Momento 2

```
peso_exposicion_curso (%)     = (nota_exposicion / 100) x 10%
peso_implementacion_curso (%) = (nota_implementacion / 100) x 5%
nota_momento2 (%)             = peso_exposicion_curso + peso_implementacion_curso
```

**Ejemplo:** si su equipo obtiene 85/100 en la exposición y 90/100 en la
implementación:

```
peso_exposicion_curso     = (85 / 100) x 10% = 8.5%
peso_implementacion_curso = (90 / 100) x 5%  = 4.5%
nota_momento2              = 8.5% + 4.5% = 13.0% (sobre 15% posible)
```

---

## Entregable

**Parte 1 (exposición):** presentación ante el grupo el **viernes 25 de
septiembre**. No requiere entrega de archivo aparte, salvo que el docente
pida el material de apoyo (diapositivas) por separado.

**Parte 2 (implementación):** commit sobre la rama `main` de su proyecto de
aula, con mensaje descriptivo (por ejemplo, `feat: reemplazo de arreglos
por ListaSimple en Proveedor y Venta`). El entregable **es** el estado del
repositorio en esa rama al momento del plazo — no se entrega por archivo
`.zip` aparte.

Estructura de archivos esperada (los nombres exactos dependen de las
entidades de su proyecto):

```
proyecto-aula/
  src/
    view/
      MenuListasView.java        # nuevo: menú en consola para probar las dos ListaSimple<T>
    service/
      <ServicioCorrespondiente1>.java   # usa insertarFinal/buscarPorValor/eliminarPorValor
      <ServicioCorrespondiente2>.java
    model/
      domain/
        <EntidadLadoUno1>.java     # ahora con atributo ListaSimple<T>
        <EntidadLadoMuchos1>.java
        <EntidadLadoUno2>.java
        <EntidadLadoMuchos2>.java
      structures/
        Nodo.java
        ListaSimple.java
    utils/
      ConsoleUtils.java           # lectura de datos por consola, si ya la usaba el proyecto
```

**Plazo de entrega:** Domingo 27 de septiembre — commit en GitHub sobre la
rama `main` del proyecto de aula.

---

## Dificultades Comunes

### "¿Cómo sé si una relación es uno-a-muchos y no uno-a-uno?"
- Pregúntese: ¿puede una instancia del lado "uno" tener **varias**
  instancias asociadas del otro lado al mismo tiempo? Si un `Proveedor`
  puede tener varios `Pedido` activos a la vez, es uno-a-muchos. Si cada
  `Pedido` solo puede tener un `Proveedor`, esa dirección es muchos-a-uno
  (no la que se representa con la lista).

### "Mi entidad ya tenía un arreglo de tamaño fijo para esta relación"
- Es justamente el caso que debe reemplazar. Revise todos los métodos que
  leían o escribían sobre ese arreglo (recorridos con `for`, comprobaciones
  de espacio disponible) y reescríbalos usando los métodos de
  `ListaSimple<T>` — no deje el arreglo declarado sin usar "por si acaso".

### "¿Puedo usar `ArrayList` en vez de `ListaSimple<T>`?"
- No para esta entrega. El objetivo del laboratorio es aplicar la
  estructura que construyó en el curso; use `ArrayList` únicamente donde ya
  lo tuviera antes de esta relación, sin extenderlo.

### "Mi caso de estudio no calza exactamente con las relaciones candidatas de la tabla"
- Las candidatas son un punto de partida, no una lista cerrada. Puede
  proponer otra relación uno-a-muchos real de su dominio, siempre que la
  justifique en la conversación con el docente antes de entregar.

---
