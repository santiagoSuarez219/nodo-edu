---
title: "Laboratorio Evaluativo — Diseño OO Completo (Momento 1)"
updatedAt: "2026-08-17"
---

# Laboratorio Evaluativo — Diseño OO Completo (Momento 1)

## Objetivo

Diseñar el diagrama UML completo de su proyecto de aula, mostrando las
cuatro capas (`view`, `controller`, `service`, `model`) con las clases que
ya tiene hasta hoy, e implementarlo en Java aplicando encapsulamiento,
herencia y polimorfismo. Este diagrama es el **plano de referencia** que
va a usar el resto del semestre: cada laboratorio posterior le agrega
clases y relaciones sobre esta misma base, así que su corrección y
completitud importan más que cualquier laboratorio anterior.

Este laboratorio cierra el **Momento evaluativo 1 — Programación orientada
a objetos (15 %)**.

Competencias esperadas:
- Diseñar un diagrama de clases UML con las cuatro capas del proyecto, sus
  relaciones (asociación, agregación, composición) y multiplicidades
  correctas.
- Diseñar el TAD de al menos una entidad de su dominio mediante una
  interfaz, y hacerla implementar por una clase abstracta.
- Implementar encapsulamiento, herencia y polimorfismo fieles a ese
  diagrama.
- Coordinar las cuatro capas de forma que ninguna se salte a la siguiente
  (la `view` nunca llama directo al `model`, por ejemplo).
- Ejecutar una revisión entre pares que contraste diseño contra código.

---

## Requisitos Previos

Antes de comenzar, debe dominar:
- La lección "Encapsulamiento": modificadores de acceso, getters y
  setters con validación.
- La lección "Introducción al UML": anatomía de una clase en UML,
  visibilidad, atributos y métodos.
- La lección "Herencia": `extends`, sobreescritura con `@Override`,
  invocación del constructor de la superclase con `super(...)`.
- La lección "Polimorfismo": binding dinámico, clases abstractas
  (`abstract`) e interfaces (`interface`, `implements`).
- La guía "Laboratorio — Jerarquía de Clases de Tres Niveles y
  Polimorfismo": la jerarquía de su entidad principal que su equipo ya
  extendió a tres niveles.
- La lección "Composición, agregación y diagramas de paquetes":
  diferencias conceptuales entre asociación, agregación y composición;
  multiplicidades, roles y flechas de navegación en UML.
- La lección "Diseño con TAD y orientación a objetos": cómo modelar el
  TAD de una estructura mediante clases e interfaces.
- La guía "Guía — Elección del proyecto de aula": debe tener su caso de
  estudio asignado y las entidades del dominio modeladas parcialmente
  desde la Semana 2.

---

## Desarrollo del Laboratorio

### Parte 1 — Diagrama UML completo de las cuatro capas

Diseñe el diagrama de clases completo de su proyecto de aula tal como
está **hoy**, organizado por las cuatro capas de la arquitectura
(`view`, `controller`, `service`, `model`). No es un diagrama de una sola
clase nueva: es el mapa acumulado de todo lo que su equipo construyó
desde la Semana 2, más lo que agregue en este laboratorio.

**Requisitos:**
- Debe mostrar explícitamente las cuatro capas, aunque `view` y
  `controller` tengan pocas clases todavía.
- Debe incluir al menos una relación de herencia: la jerarquía de tres
  niveles de la entidad principal de su caso de estudio.
- Debe incluir al menos una interfaz, marcada con la notación
  `<<interface>>`, y la clase que la implementa mediante una relación de
  realización (línea punteada).
- Debe incluir al menos una relación de asociación, agregación o
  composición entre dos entidades de su dominio, con su multiplicidad
  correctamente anotada en ambos extremos.
- Debe representar la visibilidad de cada atributo y método (`+`, `-`,
  `#`) siguiendo la notación vista en clase.
- Entréguelo como un archivo aparte de su código (imagen, PDF o diagrama
  en texto), no como comentarios dentro del código Java.

### Parte 2 — Defina el TAD de su entidad principal

Diseñe una interfaz que capture el comportamiento común de la entidad
principal de su caso de estudio — la misma jerarquía que extendió en el
laboratorio anterior. La interfaz debe tener al menos dos métodos que
representen operaciones reales de su dominio (por ejemplo, una operación
que modifica el estado del objeto y otra que solo lo consulta).

```java
public interface MiOperacionesEntidad {
    void operacionQueModificaEstado(/* parametros de su dominio */);
    TipoDeRetorno operacionQueConsultaEstado();
}
```

Haga que la clase **abstracta** de su jerarquía (el primer nivel, el que
extendieron sus subtipos desde la Semana 2) implemente esta interfaz.
Al menos uno de los métodos debe quedar **sin implementar** en la clase
abstracta, de modo que cada subtipo concreto lo resuelva con su propia
regla de negocio — el mismo patrón que `retirar()` en una jerarquía de
cuentas bancarias, donde cada tipo de cuenta valida el sobregiro distinto.

```java
public abstract class MiClaseBase implements MiOperacionesEntidad {
    // atributos heredados por toda la jerarquia, encapsulados

    @Override
    public TipoDeRetorno operacionQueConsultaEstado() {
        // TODO: implemente aqui si el comportamiento es igual
        // para todos los subtipos
        return null;
    }

    // operacionQueModificaEstado() queda sin implementar aqui:
    // cada subtipo concreto la resuelve con su propia regla
}
```

**Requisitos:**
- La interfaz debe estar en el paquete `model/domain/` de su repositorio.
- Al menos dos de sus subtipos concretos (los del tercer nivel de la
  jerarquía) deben implementar el método que la clase base dejó sin
  resolver, con lógica distinta entre ellos.
- Use `@Override` en cada implementación.

### Parte 3 — Coordine las cuatro capas para una operación completa

Elija una operación concreta de su dominio que atraviese las cuatro capas
de principio a fin (por ejemplo: registrar una nueva entidad, o ejecutar
la operación que definió en la Parte 2 sobre una entidad ya existente).
Implemente el flujo completo:

- **`service`**: un método que reciba los objetos del `model` ya
  construidos y coordine la operación de negocio, sin decidir tipos
  concretos cuando pueda delegar en polimorfismo.
- **`controller`**: un método que reciba datos primitivos (`String`,
  `double`, etc.), construya o busque los objetos del `model` que
  necesite, y llame al `service`. El `controller` es el único lugar del
  proyecto que puede decidir qué subtipo concreto instanciar.
- **`view`**: una opción de menú que pida los datos por consola y
  delegue en el `controller`. La `view` nunca instancia clases de
  `model/domain/` directamente.

```java
// view/MenuPrincipal.java (esqueleto)
private void miOpcionDeMenu() {
    // TODO: pedir los datos necesarios por consola
    // TODO: llamar al metodo correspondiente del controller
    // TODO: mostrar el resultado o la confirmacion al usuario
}
```

**Requisitos:**
- El `service` debe invocar el método polimórfico definido en la
  Parte 2 sin usar `instanceof` para distinguir el subtipo concreto.
- El `controller` no debe contener lógica de negocio (validaciones de
  dominio, cálculos): esa lógica va en el `service`.
- El menú de consola debe ejecutarse sin errores para al menos dos
  operaciones distintas (la registrada en esta parte y al menos una ya
  existente de laboratorios anteriores).

### Parte 4 — Revisión entre pares

Intercambie su diagrama de la Parte 1 y su repositorio con otro equipo.
Revise el trabajo del equipo que le corresponda respondiendo, por
escrito, esta pregunta guía: **¿el código que está viendo es exactamente
lo que el diagrama promete, ni más ni menos?** Verifique en particular:

- ¿La clase que el diagrama marca como abstracta lo es también en el
  código?
- ¿El método que el diagrama deja pendiente en la clase base aparece
  implementado en cada subtipo concreto, con una lógica distinta entre
  ellos?
- ¿Alguna clase de `view` o `controller` instancia objetos de
  `model/domain/` sin pasar por el `service` cuando no debería?

**Requisitos:**
- Entregue la revisión como un párrafo corto por cada pregunta, con el
  nombre del equipo revisado.
- Si encuentra una inconsistencia entre diagrama y código, descríbala
  concretamente (qué clase, qué línea, qué se esperaba según el
  diagrama).

---

## Entregable

Estructura de archivos dentro de su repositorio del proyecto de aula (los
nombres exactos de clase dependen de su caso de estudio):

```
proyecto-aula/
  docs/
    diagrama-uml-momento1.png (o .pdf, o .md con el diagrama en texto)
  src/
    model/
      domain/
        <InterfazTAD>.java
        <ClaseBaseAbstracta>.java
        <SegundoNivel>.java
        <TercerNivelA>.java
        <TercerNivelB>.java
      structures/
    service/
      <NombreService>.java
    controller/
      <NombreController>.java
    view/
      MenuPrincipal.java
    Main.java
  revision-entre-pares.md
```

**Formato de entrega:** commit sobre la rama de su proyecto de aula, con
mensaje descriptivo (por ejemplo, `feat: diseno OO completo momento 1`).
No se entrega por archivo `.zip` aparte — el entregable **es** el estado
del repositorio en esa rama al momento del plazo, junto con el archivo
del diagrama en `docs/` y el archivo `revision-entre-pares.md` con las
respuestas de la Parte 4.

### Ejemplo de archivo de prueba esperado

Para que el docente verifique el flujo de la Parte 3, incluya una clase
de prueba que ejercite el `Main` o el método coordinado directamente:

```java
public class PruebaFlujoCompleto {
    public static void main(String[] args) {
        // TODO: construya los objetos necesarios de su dominio
        // TODO: invoque la operacion coordinada de la Parte 3
        // TODO: imprima por consola el resultado, mostrando que
        // paso correctamente por controller, service y model
    }
}
```

---

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Fidelidad del diagrama UML a las cuatro capas** | 35 | El diagrama muestra explícitamente `view`, `controller`, `service` y `model`, incluye toda las clases del proyecto hasta hoy (no solo las nuevas), representa la interfaz con `<<interface>>` y su realización, la herencia de la jerarquía de tres niveles, y al menos una relación de asociación/agregación/composición con multiplicidad correcta en ambos extremos. |
| **Encapsulamiento** | 15 | Todos los atributos de las clases de `model/domain/` son `private` o `protected`; el acceso externo es siempre por métodos; los setters validan antes de asignar. |
| **Herencia** | 15 | La jerarquía de tres niveles del código coincide exactamente con la del diagrama; cada subclase invoca `super(...)` en su constructor. |
| **Polimorfismo** | 15 | El método sin implementar de la clase base está correctamente sobreescrito con `@Override` en cada subtipo concreto, con lógica distinta entre ellos; el `service` lo invoca sin usar `instanceof`. |
| **Calidad de código y organización en capas** | 10 | Cada clase está en el paquete que le corresponde; el `controller` no contiene lógica de negocio; la `view` no instancia clases de `model/domain/` directamente. |
| **Funcionamiento del menú de consola** | 10 | El menú ejecuta sin errores la operación nueva de la Parte 3 y al menos una operación de un laboratorio anterior. |
| **TOTAL** | **100** | |

---

## Dificultades Comunes

### "No sé si mi relación es asociación, agregación o composición"
- Pregúntese: si el objeto "todo" se elimina, ¿el objeto "parte" tiene
  sentido por sí solo? Si no, es composición. Si el objeto "parte" puede
  seguir existiendo o ser compartido por otro "todo", es agregación. Si
  simplemente una clase usa a otra sin ser dueña de su ciclo de vida, es
  asociación.

### "Mi clase abstracta compila aunque dejé un método de la interfaz sin implementar"
- Es el comportamiento esperado: una clase abstracta puede dejar métodos
  de una interfaz sin resolver. El error solo aparece cuando intenta
  instanciar la clase abstracta directamente, o cuando una clase
  **concreta** no implementa el método heredado.

### "El diagrama que dibujé no incluye clases de laboratorios anteriores"
- Revíselo: el diagrama de este laboratorio debe ser **acumulado**, no
  solo de lo nuevo. Si su jerarquía de tres niveles de la semana pasada no
  aparece, el diagrama no es el plano de referencia completo que este
  laboratorio pide.

### "No sé en qué capa va el método que decide qué subtipo concreto crear"
- Va en el `controller`. Es el único punto del proyecto donde es
  aceptable escribir `new MiSubtipoConcreto(...)` a partir de una decisión
  tomada por el usuario (por ejemplo, la opción de menú elegida).

---

## Extensiones Sugeridas (Bonus)

- Agregar al diagrama un segundo método a su interfaz TAD y su
  implementación correspondiente en cada subtipo.
- Documentar en el diagrama una segunda relación de composición o
  agregación entre otras dos entidades de su dominio, además de la
  mínima requerida.
- Escribir, además de `PruebaFlujoCompleto`, una segunda clase de prueba
  que recorra un arreglo de referencias de su interfaz TAD con
  instancias de sus distintos subtipos concretos, como en el laboratorio
  de la Semana 3.

---

## Recursos

- **Lecciones del curso:** "Encapsulamiento", "Herencia", "Polimorfismo",
  "Introducción al UML", "Composición, agregación y diagramas de
  paquetes", "Diseño con TAD y orientación a objetos".
- **Guía anterior:** "Laboratorio — Jerarquía de Clases de Tres Niveles y
  Polimorfismo", de donde sale la jerarquía que este laboratorio
  extiende con el TAD.
- **Guía de proyecto:** "Guía — Elección del proyecto de aula", para
  recordar las entidades y la arquitectura de cuatro capas de su caso de
  estudio.

**Plazo de entrega:** antes de finalizar la sesión del viernes 28 de
agosto (bloque de laboratorio evaluativo ★ M1).
