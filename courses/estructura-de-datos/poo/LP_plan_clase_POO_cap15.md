---
title: "Plan de Clase — Introducción a la Programación Orientada a Objetos y UML 2.1"
source: "Fundamentos de Programación, 4.ª edición — Luis Joyanes Aguilar, Capítulo 15"
course: "Lógica de Programación"
course_code: "LP"
level: "Primeros semestres"
type: "Plan de clase"
language: "Java / Pseudocódigo"
difficulty: "Básico"
estimated_time: "120 minutos"
date: "2026-07-02"
author: "Asistente de Docencia"
---

# Plan de Clase — Introducción a la Programación Orientada a Objetos y UML 2.1

---

## 1. Datos generales de la sesión

| Campo | Detalle |
|---|---|
| **Asignatura** | Lógica de Programación |
| **Unidad temática** | Paradigma Orientado a Objetos |
| **Capítulo de referencia** | Cap. 15 — Joyanes Aguilar (4.ª ed.) |
| **Duración total** | 120 minutos |
| **Modalidad** | Presencial / Virtual (adaptable) |
| **Herramientas sugeridas** | Tablero o pizarra digital, IDE Java (NetBeans / IntelliJ) |

---

## 2. Objetivos de aprendizaje

Al finalizar la sesión, el estudiante estará en capacidad de:

1. **Distinguir** las diferencias fundamentales entre la programación estructurada y la programación orientada a objetos.
2. **Identificar** los elementos básicos de la POO: objeto, clase, instancia, atributo, método y mensaje.
3. **Explicar** con sus propias palabras las cuatro propiedades esenciales: abstracción, encapsulamiento, herencia y polimorfismo.
4. **Reconocer** la notación básica de UML para diagramar una clase con atributos y métodos.
5. **Modelar** objetos simples del mundo real identificando sus atributos y operaciones.

---

## 3. Prerrequisitos del estudiante

Antes de esta sesión, el estudiante debe dominar:

- Algoritmos y estructuras de control (secuencial, condicional, iterativa).
- Concepto de función o procedimiento en programación estructurada.
- Variables, tipos de datos primitivos y operadores.
- Lectura e interpretación de pseudocódigo básico.

> **⚠️ Nota docente:** Si el grupo tiene debilidades con funciones/procedimientos, reserve 10 minutos adicionales al inicio para un repaso rápido. La transición conceptual procedimental → OO lo requiere.

---

## 4. Materiales y recursos

| Recurso | Descripción |
|---|---|
| Diapositivas de apoyo | Esquemas visuales de clases, jerarquías de herencia y diagramas UML |
| Documento base | Capítulo 15 — *Fundamentos de Programación*, Joyanes Aguilar |
| Tablero / pizarra | Para modelado participativo y diagramas en tiempo real |
| IDE Java (opcional) | Para demostración en vivo de una clase sencilla |
| Hoja de trabajo | Actividad de identificación de objetos (ver Sección 7) |

---

## 5. Cronograma de la sesión

### ⏱ Fase 1 — Apertura y enganche `[15 min]`

**Propósito:** Activar conocimientos previos y crear una necesidad cognitiva del paradigma OO.

#### Actividad: Pregunta detonante

Plantear al grupo la siguiente situación:

> *"Imaginen que deben programar un sistema para gestionar los vehículos de un concesionario. El sistema maneja datos de autos, motos y camiones. Con lo que saben hasta ahora —funciones y variables— ¿cómo organizarían ese programa?"*

**Dinámica:**
1. Dar 3 minutos para que los estudiantes piensen en parejas.
2. Recoger 2–3 respuestas orales y anotarlas en el tablero.
3. Mostrar visualmente cómo la solución procedimental crece en complejidad: muchas variables globales, funciones interdependientes, difícil de mantener.
4. Anunciar: la POO ofrece una solución más natural a este tipo de problemas porque modela el mundo real.

**Resultado esperado:** El estudiante reconoce que la programación estructurada tiene limitaciones cuando el problema es complejo.

---

### ⏱ Fase 2 — Programación estructurada vs. POO `[20 min]`

**Propósito:** Presentar las limitaciones del paradigma procedimental y la filosofía de base de la POO.

#### 2.1 La ecuación de Niklaus Wirth

Escribir en el tablero:

```
Algoritmos + Datos = Programas
```

Explicar: en la programación estructurada, los algoritmos (funciones) y los datos (variables globales) están **separados** y cualquier función puede acceder a cualquier dato. En programas grandes, esto produce un número muy alto de conexiones posibles y dificulta el mantenimiento.

#### 2.2 El problema del mundo real

Plantear la diferencia de modelado:

| Objeto real: Automóvil | Programación estructurada | Programación Orientada a Objetos |
|---|---|---|
| Tiene **datos** (marca, velocidad, color) | Variables globales separadas | Atributos dentro del objeto |
| Tiene **comportamiento** (acelerar, frenar) | Funciones independientes | Métodos del propio objeto |

**Reflexión guiada:** ¿Tiene sentido separar "la función frenar" del "objeto automóvil"? En el mundo real, el freno *pertenece* al automóvil. La POO respeta esa relación natural.

#### 2.3 La idea central de la POO

> La POO **combina** datos y funciones en una única entidad llamada **objeto**. Esto modela los objetos del mundo real de forma mucho más eficiente.

**Transición al tablero:**

```
Procedimental:                    Orientado a Objetos:
+---------+  +---------+          +---------------------+
| funcion |  | funcion |          |       Objeto        |
+---------+  +---------+          | - datos (atributos) |
     |            |               | - operaciones (mét.)|
[DATOS GLOBALES]                  +---------------------+
```

---

### ⏱ Fase 3 — Conceptos fundamentales de POO `[25 min]`

**Propósito:** Presentar los bloques conceptuales esenciales: clase, objeto, instancia, atributo, método y mensaje.

#### 3.1 Clase y Objeto `[10 min]`

**Analogía recomendada — El molde y la galleta:**

- La **clase** es el molde para hacer galletas: define la forma, pero no *es* la galleta.
- El **objeto** (o instancia) es la galleta concreta producida con ese molde.
- Pueden existir muchas galletas del mismo molde; cada una es independiente.

**Ejemplo visual — Notación UML básica:**

```
+---------------------+
|      Lavadora       |   ← Nombre de la clase
+---------------------+
| - nombreMarca       |   ← Atributos (datos del objeto)
| - numeroDeSerie     |
| - capacidad         |
| - potencia          |
+---------------------+
| + encender()        |   ← Métodos (operaciones del objeto)
| + apagar()          |
| + lavar()           |
| + aclarar()         |
+---------------------+
```

> **Convenciones UML a destacar:**
> - Nombre de la clase: comienza con **mayúscula** (`Lavadora`).
> - Atributos: comienzan con **minúscula** (`nombreMarca`).
> - Métodos: siguen el mismo patrón y siempre llevan paréntesis (`lavar()`).
> - El símbolo `-` indica miembro **privado**; `+` indica **público**.

**Preguntas de verificación rápida:**
- ¿Un objeto es lo mismo que una clase? *(No: la clase es el tipo, el objeto es la instancia concreta.)*
- ¿Qué diferencia hay entre un atributo y un método? *(Atributo = dato; método = operación.)*

#### 3.2 Atributos, Métodos y Mensajes `[10 min]`

- **Atributo:** propiedad o característica de un objeto. Equivale a los datos.
- **Método:** operación que un objeto puede realizar. Equivale a las funciones.
- **Mensaje:** la forma en que un objeto invoca la operación de otro. Equivale a llamar una función.

**Ejemplo en pseudocódigo:**

```pseudocode
INICIO
    OBJETO miAuto DE TIPO Auto
    miAuto.encender()           // Envío de mensaje: activar operación
    miAuto.acelerar(60)         // Mensaje con parámetro
    ESCRIBIR miAuto.velocidad   // Lectura de un atributo
FIN
```

**Regla clave:** En POO, no se accede directamente a los datos. Se *envía un mensaje* al objeto para que él mismo los manipule.

#### 3.3 Estado, Comportamiento e Identidad `[5 min]`

| Propiedad | Definición | Ejemplo (objeto: `miAuto`) |
|---|---|---|
| **Estado** | Conjunto de valores de todos los atributos en un momento dado | velocidad = 60, color = rojo |
| **Comportamiento** | Conjunto de operaciones disponibles | `acelerar()`, `frenar()`, `encender()` |
| **Identidad** | Cada objeto es único, aunque tenga los mismos valores que otro | `auto1` ≠ `auto2` aunque sean del mismo modelo |

---

### ⏱ Fase 4 — Las 4 propiedades fundamentales de la POO `[30 min]`

**Propósito:** Explicar abstracción, encapsulamiento, herencia y polimorfismo con ejemplos concretos y analogías del mundo real.

#### 4.1 Abstracción `[6 min]`

> **Definición:** Proceso de identificar solo los aspectos **relevantes** de un objeto para el problema que se está resolviendo. El resto se ignora.

**Analogía:** Un televisor tiene circuitos complejos internamente, pero el usuario solo interactúa con los botones. La abstracción separa *qué hace* de *cómo lo hace*.

**Ejemplo en contexto:**

Para un sistema académico, de una `Persona` nos interesa:
- ✅ `nombre`, `código`, `carrera`, `semestre`
- ❌ `colorDeCabello`, `tallaDeZapatos` *(irrelevante para el problema)*

> **Principio clave:** En el análisis se pregunta **¿qué hace?**, no **¿cómo lo hace?**

#### 4.2 Encapsulamiento y Ocultación de Datos `[8 min]`

> **Definición:** Los datos del objeto están **ocultos** del exterior. Solo se puede acceder a ellos a través de métodos definidos por la propia clase.

**Analogía:** El mando a distancia del televisor. No necesitas saber cómo funciona el circuito interno para cambiar de canal. Solo usas los botones (la **interfaz**).

**Demostración en Java:**

```java
public class CuentaBancaria {
    private double saldo;  // Nadie puede acceder directamente desde fuera

    // Acceso controlado a través de métodos
    public double getSaldo() {
        return saldo;
    }

    public void depositar(double monto) {
        if (monto > 0) {
            saldo += monto;
        }
    }
}
```

**Beneficio:** Si el mecanismo interno de cálculo del saldo cambia, el código que usa la clase *no necesita cambiar*, porque la interfaz (los métodos públicos) sigue siendo la misma.

#### 4.3 Herencia `[10 min]`

> **Definición:** Una clase puede **heredar** atributos y métodos de otra clase más general. La clase que hereda se llama **subclase** o clase derivada; la que da sus características se llama **superclase** o clase base.

**Dibujar en el tablero:**

```
              Vehículo
            (superclase)
           /      |      \
        Auto     Moto   Camión
     (subclases)
```

- `Vehículo` tiene: `marca`, `velocidad`, `acelerar()`, `frenar()`
- `Auto` **hereda** todo eso y **añade**: `numeroDePuertas`, `abrirMaletero()`
- `Moto` **hereda** todo eso y **añade**: `tieneSidecar`, `hacerWheeling()`

**Relación fundamental:** **es-un** (*un Auto ES UN Vehículo*)

**Beneficio clave:** El código definido una vez en la superclase es **reutilizado** automáticamente por todas las subclases. Si `frenar()` cambia en `Vehículo`, el cambio aplica a `Auto`, `Moto` y `Camión`.

**Otro ejemplo visual:**

```
          Electrodoméstico
         /    |     |     \
   Lavadora Horno Tostadora Frigorífico
```

#### 4.4 Polimorfismo `[6 min]`

> **Definición:** El mismo nombre de método puede tener **comportamientos diferentes** según la clase del objeto que lo implementa.

**Analogía cotidiana:** La palabra "abrir" significa algo distinto para: una puerta, un libro, una cuenta bancaria, un congreso. Misma palabra, comportamiento diferente.

**Ejemplo en Java:**

```java
// Tres clases diferentes, mismo nombre de método
triangulo.calcularArea();    // Fórmula: base * altura / 2
rectangulo.calcularArea();   // Fórmula: base * altura
circulo.calcularArea();      // Fórmula: PI * radio^2

// En tiempo de ejecución, Java sabe cuál usar
Figura f = new Triangulo();
f.calcularArea();  // Llama la implementación de Triangulo
```

**Punto de cierre:** El polimorfismo permite escribir código genérico que funciona con objetos de tipos diferentes, siempre que compartan un método común.

---

### ⏱ Fase 5 — Introducción a UML `[15 min]`

**Propósito:** Presentar UML como el lenguaje estándar de modelado y mostrar la notación básica del diagrama de clases.

#### 5.1 ¿Qué es UML?

- **UML** = Lenguaje Unificado de Modelado (*Unified Modeling Language*).
- No es un lenguaje de programación: es un lenguaje de **modelado visual**.
- Tiene su propia sintaxis y semántica (vocabulario + reglas de uso).
- Creado por Booch, Rumbaugh y Jacobson — los "tres amigos" — en los años 90.
- Estándar oficial de la industria desde 1997 (OMG). Versión actual: 2.1.

#### 5.2 ¿Para qué sirve?

- Diseñar software antes de codificarlo.
- Comunicar arquitecturas entre equipos de desarrollo.
- Documentar sistemas existentes.
- Capturar requisitos en las fases de análisis.

#### 5.3 Tipos de diagramas (mención breve)

| Categoría | Diagramas principales |
|---|---|
| **Estructurales** | Diagrama de clases, de objetos, de componentes |
| **De comportamiento** | Diagrama de secuencia, de casos de uso, de actividad, de estados |

> **Énfasis para esta sesión:** Nos concentramos en el **diagrama de clases**, el más utilizado en POO.

#### 5.4 Actividad rápida — Primer diagrama UML `[5 min]`

Pedir a los estudiantes que en sus cuadernos dibujen el diagrama UML de una clase `Estudiante` con:
- Al menos 3 atributos (con su tipo de dato).
- Al menos 2 métodos.

Socializar 2–3 respuestas en plenaria y corregir la notación.

---

### ⏱ Fase 6 — Cierre y síntesis `[15 min]`

**Actividad de cierre — Modelado colaborativo:**

Dividir el grupo en equipos de 3–4 personas. Asignar uno de los siguientes objetos a cada equipo:

| Equipo | Objeto asignado |
|---|---|
| 1 | Teléfono celular |
| 2 | Cuenta bancaria |
| 3 | Libro de biblioteca |
| 4 | Partido de fútbol |
| 5 (si aplica) | Ascensor de edificio |

**Cada equipo debe:**
1. Identificar 4 atributos del objeto.
2. Identificar 3 métodos del objeto.
3. Dibujar el diagrama UML de la clase.
4. Presentar en 2 minutos.

**Preguntas de reflexión final (en plenaria):**

1. ¿Cuál es la diferencia principal entre una clase y un objeto?
2. ¿Por qué el encapsulamiento facilita el mantenimiento del código?
3. ¿Qué relación existe entre herencia y reutilización?
4. ¿Qué tiene de especial el polimorfismo frente a tener métodos con nombres distintos?

---

## 6. Evaluación de la sesión

### Indicadores de logro

| Indicador | Evidencia observable |
|---|---|
| Distingue clase de objeto | Da un ejemplo propio de cada uno sin confundirlos |
| Identifica atributos y métodos | Completa el diagrama UML correctamente en la actividad de cierre |
| Explica las 4 propiedades | Describe cada propiedad con sus propias palabras y un ejemplo |
| Modela objetos simples | Entrega el diagrama de la actividad final con notación correcta |

### Tarea para la próxima sesión

> Resolver los **Ejercicios 15.1, 15.2 y 15.5** del banco de ejercicios del Capítulo 15 (entregados por separado). Traer el análisis escrito: objetos identificados, atributos y operaciones para cada uno.

---

## 7. Hoja de trabajo — Para imprimir o compartir digitalmente

### Actividad: Identificación de objetos y clases

**Instrucciones:** Para cada uno de los siguientes objetos, identifica mínimo 3 atributos y 2 métodos. Luego dibuja el diagrama UML básico en el espacio disponible.

| Objeto | Atributos (mínimo 3) | Métodos (mínimo 2) |
|---|---|---|
| Televisor | | |
| Biblioteca | | |
| Médico | | |
| Partido de fútbol | | |

---

### Reflexión escrita

Responde brevemente con tus propias palabras:

1. ¿Por qué la programación orientada a objetos modela mejor el mundo real que la programación estructurada?

2. Da un ejemplo de herencia que no aparezca en las notas de clase.

3. ¿Qué significa que un objeto tenga "identidad"?

---

## 8. Notas para el docente

- **Fases 3 y 4** son las más densas conceptualmente. Si el grupo muestra confusión en herencia, dedique 5 minutos adicionales con un ejemplo más cercano al contexto del estudiante (familia, universidad, etc.) antes de pasar a polimorfismo.
- **Polimorfismo:** Es el concepto más abstracto para niveles iniciales. En esta sesión basta con que el estudiante lo identifique e intuya; la implementación concreta (`@Override`, métodos virtuales) se trabaja en sesiones posteriores.
- **UML:** No se espera dominio de la notación completa. El objetivo es que el estudiante pueda leer y construir un diagrama de clases básico (nombre + atributos + métodos).
- **Actividad de cierre:** Si el tiempo es limitado, puede realizarse individualmente en lugar de grupal.
- **Demostración en IDE:** Si el tiempo y la infraestructura lo permiten, mostrar en NetBeans una clase `Persona` con atributos privados y métodos públicos refuerza significativamente los conceptos de encapsulamiento.

### Próxima sesión sugerida

Implementación de clases en Java: declaración de `class`, constructores, métodos getter y setter, y creación de objetos con `new`.

---

## 9. Referencias

- Joyanes Aguilar, L. (2008). *Fundamentos de programación* (4.ª ed.). McGraw-Hill. Capítulo 15.
- OMG Unified Modeling Language (UML). Versión 2.5.1. Disponible en: https://www.omg.org/spec/UML/
