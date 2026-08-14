---
title: "Laboratorio — Jerarquía de clases y polimorfismo"
updatedAt: "2026-08-13"
---

# Laboratorio — Jerarquía de Clases de Tres Niveles y Polimorfismo

## Objetivo

Extender la jerarquía de clases de su proyecto de aula a **tres niveles de
herencia**, definir un contrato compartido mediante una interfaz y demostrar,
con una prueba ejecutable, que el polimorfismo en tiempo de ejecución
funciona sobre esa jerarquía.

Competencias esperadas:
- Extender una jerarquía existente con un nuevo nivel de herencia (`extends`, `@Override`, `super`).
- Definir una interfaz y hacerla implementar por una clase abstracta.
- Sobreescribir un método de forma real en cada nivel de la jerarquía.
- Construir y recorrer un arreglo de referencias del tipo de la interfaz, demostrando binding dinámico.
- Leer un diagrama de clases UML e identificar clase abstracta, interfaz, herencia y realización.

---

## Requisitos Previos

Antes de comenzar, debe dominar:
- La lección "Herencia": `extends`, sobreescritura con `@Override`, invocación del constructor de la superclase con `super(...)`.
- La lección "Polimorfismo": binding dinámico, clases abstractas (`abstract`) e interfaces (`interface`, `implements`).
- La jerarquía de encapsulamiento que su equipo modeló en el laboratorio de la Semana 2: una clase de dominio abstracta con al menos un subtipo concreto, ya en `model/domain/` de su repositorio del proyecto de aula.

---

## Desarrollo del Laboratorio

### Parte 1 — Diseñe el tercer nivel de su jerarquía

Su equipo ya tiene, desde la Semana 2, una clase de dominio abstracta con al
menos un subtipo (por ejemplo, `Producto` → `ProductoOficina`). En esta parte
va a **agregar un tercer nivel**: una subclase concreta de la que su
subtipo actual pase a ser padre.

La siguiente tabla ofrece una idea de partida por caso de estudio. No es la
única partición válida — usted decide los atributos y la validación que
diferencian realmente a cada subtipo nuevo, y debe poder justificar por qué
esa diferencia amerita una clase aparte y no un simple atributo.

| Caso de estudio | Jerarquía existente (Semana 2) | Idea de tercer nivel |
|---|---|---|
| Papelería | `Producto` (abstracta) → subtipo propio | Extender su subtipo actual en dos variantes más específicas (por ejemplo, artículos de papelería frente a artículos de tecnología) |
| Consultorio Médico | `Persona` (abstracta) → `Paciente` | Extender `Paciente` distinguiendo, por ejemplo, un paciente en consulta regular de uno hospitalizado |
| Clínica Veterinaria | `Animal` (abstracta) → `Perro`/`Gato` | Extender uno de sus subtipos actuales según un criterio propio del dominio (por ejemplo, un servicio adicional que solo aplica a esa variante) |
| Sistema Académico | `Persona` (abstracta) → `Estudiante` | Extender `Estudiante` distinguiendo, por ejemplo, un estudiante regular de uno becado |
| Liga de Fútbol | `Persona` (abstracta) → `Jugador` (abstracta) → `Portero`/`JugadorDeCampo` | Su jerarquía **ya tiene tres niveles**. En este laboratorio no agregue un cuarto nivel: concéntrese en la Parte 2 sobre la jerarquía que ya tiene. |

**Requisitos:**
- El nuevo nivel debe extender una clase que **ya existe** en su `model/domain/`, no crear una jerarquía paralela.
- Cada nueva subclase debe declarar al menos un atributo propio, encapsulado (`private`, con getter/setter validado).
- El constructor de cada subclase nueva debe invocar `super(...)` para inicializar lo heredado.

### Parte 2 — Defina e implemente la interfaz `Reportable`

Defina en su proyecto una interfaz equivalente a la vista en clase, con un
único método:

```java
public interface Reportable {
    String generarResumen();
}
```

Haga que la clase **abstracta** de su jerarquía (el primer nivel, el que
extendieron sus subtipos desde la Semana 2) la implemente:

```java
public abstract class MiClaseBase implements Reportable {
    // atributos heredados por toda la jerarquía

    // TODO: implemente generarResumen() con la información
    // que toda la jerarquía comparte
}
```

Sobreescriba `generarResumen()` en **cada** nivel siguiente de su jerarquía
(el segundo nivel y el tercero que diseñó en la Parte 1), agregando en cada
sobreescritura la información propia de ese nivel sin repetir la del nivel
anterior.

**Requisitos:**
- La interfaz `Reportable` debe estar en el paquete correspondiente de `model/domain/`.
- Los tres niveles de la jerarquía deben sobreescribir `generarResumen()` — no basta con implementarlo una sola vez en la base y dejarlo heredado sin cambios en los niveles siguientes.
- Cada sobreescritura debe reutilizar la del nivel anterior con `super.generarResumen()`, en vez de reescribir el formato completo desde cero.
- Use `@Override` en cada sobreescritura.

### Parte 3 — Prueba con arreglo de referencias

Escriba una clase de prueba (`Main` o una clase dedicada) que construya un
arreglo de referencias del tipo de la interfaz, con instancias de sus dos
subtipos de tercer nivel, y lo recorra en un `for` invocando
`generarResumen()` sobre cada elemento:

```java
public class PruebaReportable {
    public static void main(String[] args) {
        Reportable[] elementos = {
            // TODO: instancie aquí sus dos subtipos de tercer nivel
        };

        for (Reportable r : elementos) {
            System.out.println(r.generarResumen());
        }
    }
}
```

**Requisitos:**
- El arreglo debe declararse con el tipo `Reportable`, nunca con el tipo concreto de cada subtipo ni con `Object[]`.
- No debe haber ningún casteo (`(ClienteVIP) elemento` o similar) dentro del `for`.
- La salida por consola debe mostrar, para cada elemento, información acumulada de los tres niveles de la jerarquía (evidencia de que las tres sobreescrituras se ejecutaron encadenadas).

### Parte 4 — Lectura guiada de un diagrama de clases (Opcional)

No se le pide construir un diagrama UML completo — eso lo trabajará en el
laboratorio evaluativo de la Semana 4. Esta parte es solo de **lectura**:
identifique en el siguiente diagrama los elementos que se le piden.

```
<<interface>> Reportable
  + generarResumen(): String
          ^
          : (realizacion, linea punteada)
          :
<<abstract>> Persona
  # nombre: String
  # identificacion: String
  + generarResumen(): String
          ^
          | (herencia, linea solida)
          |
       Cliente
  # numeroCuenta: String
  + generarResumen(): String
          ^
          | (herencia, linea solida)
          |
   -------------------
   |                 |
ClienteVIP      ClienteRegular
  - limiteCredito       - numeroTransaccionesMes
  + generarResumen()    + generarResumen()
```

Responda por escrito, en un párrafo corto por pregunta, e inclúyalo junto a
su entregable:

1. ¿Cuál elemento del diagrama es la interfaz y cómo se distingue visualmente de una clase?
2. ¿Cuál elemento es la clase abstracta y cómo se distingue de una clase concreta?
3. ¿Cuál línea representa herencia (`extends`) y cuál representa realización (`implements`)? Señale la diferencia entre ambas.
4. ¿Cuántos niveles de herencia tiene esta jerarquía, sin contar la interfaz?

---

## Entregable

Estructura de archivos dentro de `model/domain/` de su repositorio del
proyecto de aula (los nombres exactos de clase dependen de su caso de
estudio y de lo diseñado en la Parte 1):

```
src/
  model/
    domain/
      Reportable.java
      <ClaseBaseAbstracta>.java
      <SegundoNivel>.java
      <TercerNivelA>.java
      <TercerNivelB>.java
  PruebaReportable.java
```

**Formato de entrega:** commit sobre la rama de su proyecto de aula, con
mensaje descriptivo (por ejemplo, `feat: extiende jerarquia a tres niveles
con Reportable`). No se entrega por archivo `.zip` aparte — el entregable
**es** el estado del repositorio en esa rama al momento del plazo.

**Evidencia obligatoria:** captura de pantalla o copia de la salida por
consola de `PruebaReportable`, mostrando el `generarResumen()` de sus dos
subtipos de tercer nivel, adjunta en el `README.md` del repositorio o en un
comentario del commit.

### Ejemplo de clase de prueba esperada:

```java
public class PruebaReportable {
    public static void main(String[] args) {
        Reportable[] elementos = {
            // instancias de sus dos subtipos de tercer nivel,
            // con datos de ejemplo coherentes con su dominio
        };

        for (Reportable r : elementos) {
            System.out.println(r.generarResumen());
        }
    }
}
```

---

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Jerarquía de tres niveles y encapsulamiento** | 25 | La jerarquía tiene tres niveles reales de `extends`; cada subclase invoca `super(...)` en su constructor; todos los atributos son `private`/`protected` según corresponda, con acceso por métodos. |
| **Implementación de `Reportable`** | 25 | La interfaz existe con la firma correcta; la clase base la implementa; los tres niveles sobreescriben `generarResumen()` con `@Override`, reutilizando `super.generarResumen()` en cada uno. |
| **Prueba con arreglo de referencias** | 25 | El arreglo está declarado como `Reportable[]`; contiene instancias de los dos subtipos de tercer nivel; el `for` no tiene ningún casteo; la salida por consola muestra la información acumulada de los tres niveles. |
| **Lectura del diagrama de clases** | 15 | Las cuatro respuestas de la Parte 4 identifican correctamente interfaz, clase abstracta, herencia vs. realización y número de niveles. |
| **Calidad de código y separación de capas** | 10 | Las clases de dominio están en `model/domain/`; la clase de prueba no mezcla lógica de negocio; nombres de clases y métodos consistentes con el resto del proyecto. |
| **TOTAL** | **100** | |

---

## Dificultades Comunes

### "Mi método sobreescrito no se ejecuta — siempre sale la versión del padre"
- Verifique que escribió `@Override` encima del método. Si el compilador marca error ahí, la firma no coincide exactamente con la del método heredado (revise nombre, tipo de parámetros y tipo de retorno).

### "El compilador dice que mi clase no es abstracta pero no implementa un método abstracto"
- Alguna clase concreta de su jerarquía no sobreescribió `generarResumen()`. Revise que **todas** las clases hoja (las que no son padres de ninguna otra) tengan su propia versión del método.

### "Necesito castear dentro del `for` para poder usar un atributo específico"
- Si necesita castear, revise si ese atributo debería formar parte del contrato de `Reportable` (agregando otro método a la interfaz) en vez de accederse directamente sobre el tipo concreto.

### "No sé si mi atributo nuevo debe ir en `protected` o en `private`"
- Si solo lo usa la propia clase, `private`. Si una subclase de un nivel siguiente necesita acceder a él directamente (no a través de un getter), `protected` — pero prefiera siempre exponerlo por un método accesor cuando sea posible.

---

## Extensiones Sugeridas (Bonus)

- Agregar un segundo método al contrato de `Reportable` (por ejemplo, uno que devuelva una alerta o estado, con un valor por defecto distinto en cada nivel) e implementarlo en toda la jerarquía.
- Sobrecargar `toString()` además de `generarResumen()` y comparar en qué se parecen y en qué difieren ambos mecanismos.
- Extender el arreglo de la Parte 3 para incluir una tercera instancia de un subtipo distinto, si su dominio lo permite, y verificar que el mismo `for` sigue funcionando sin modificar una sola línea.

---

## Recursos

- **Lecciones del curso:** "Herencia" y "Polimorfismo".
- **Apuntes del laboratorio anterior:** clase de dominio encapsulada de la Semana 2, en su propio repositorio.
- **Guía de proyecto:** "Guía — Elección del proyecto de aula", para recordar las entidades de su caso de estudio.

**Plazo de entrega:** antes del inicio de la sesión del viernes 28 de agosto (laboratorio evaluativo ★ M1), que da por asumida esta jerarquía como parte del diseño OO completo a entregar ese día.
