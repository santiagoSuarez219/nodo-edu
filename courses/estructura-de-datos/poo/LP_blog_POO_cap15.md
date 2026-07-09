---
title: "Programación Orientada a Objetos: del mundo real al código"
source: "Fundamentos de Programación, 4.ª edición — Luis Joyanes Aguilar, Capítulo 15"
course: "Lógica de Programación"
course_code: "LP"
level: "Primeros semestres"
type: "Resumen teórico"
language: "Java / Pseudocódigo"
difficulty: "Básico"
estimated_time: "30 minutos de lectura"
date: "2026-07-02"
author: "Asistente de Docencia"
---

# Programación Orientada a Objetos: del mundo real al código

> Este artículo acompaña la clase magistral sobre el Capítulo 15 de *Fundamentos de Programación* (Joyanes Aguilar, 4.ª ed.). Su propósito es consolidar los conceptos vistos en sesión con explicaciones adicionales, ejemplos desarrollados y ejercicios ilustrativos.

---

## ¿Por qué cambiar de paradigma?

Durante la mayor parte del semestre hemos programado de forma **estructurada o procedimental**: escribimos instrucciones paso a paso, agrupamos tareas en funciones y organizamos el programa en módulos. Este enfoque funciona muy bien para problemas pequeños.

Sin embargo, cuando el problema crece, la programación estructurada comienza a mostrar sus limitaciones. El matemático y científico de la computación Niklaus Wirth lo resumió con una ecuación sencilla:

```
Algoritmos + Datos = Programas
```

El problema es que en la programación estructurada los **algoritmos** (funciones) y los **datos** (variables globales) están **separados**. Cualquier función puede acceder a cualquier dato global. En un programa con 50 funciones y 30 variables globales, eso produce potencialmente 1 500 conexiones posibles. El código se vuelve difícil de leer, modificar y mantener.

Pero hay algo más profundo: la programación estructurada **no modela bien el mundo real**.

Piénselo así: en el mundo real, un automóvil no es "una variable `marca` más una variable `velocidad` más una función `acelerar()`". Un automóvil es una **entidad completa** que tiene sus propios datos y su propio comportamiento. La función `acelerar` *le pertenece* al automóvil, no existe suelta en algún lugar del programa.

La **Programación Orientada a Objetos (POO)** nació precisamente para resolver estos dos problemas: la complejidad del código a gran escala y el modelado natural del mundo real.

---

## El giro conceptual: pensar en objetos

La pregunta clave cambia:

| Paradigma | Pregunta central |
|---|---|
| Estructurado | ¿**Qué hace** este programa? |
| Orientado a Objetos | ¿Qué **objetos del mundo real** puede modelar? |

En POO, el programa se organiza en **objetos** que contienen tanto sus datos (llamados **atributos**) como sus operaciones (llamadas **métodos**). Los objetos se comunican entre sí enviándose **mensajes** (es decir, llamando a los métodos del otro).

---

## Los bloques fundamentales: Clase y Objeto

Antes de hablar de las propiedades de la POO, necesitamos tener claro qué es una **clase** y qué es un **objeto**, porque se confunden con facilidad.

### La analogía del molde

Imaginen una fábrica de galletas. El **molde** define la forma, el tamaño y el patrón de la galleta. Pero el molde *no es* la galleta: es la plantilla para crearlas. Con un mismo molde se pueden producir cientos de galletas idénticas, pero cada una existe por separado.

En POO:
- La **clase** es el molde. Define qué atributos y métodos tendrán los objetos de ese tipo.
- El **objeto** (también llamado **instancia**) es la galleta: un ejemplar concreto creado a partir de la clase.

### Ejemplo: la clase `Lavadora`

Tomemos el ejemplo del libro. Una lavadora tiene características (datos) y comportamiento (operaciones). En UML, una clase se representa así:

```
+---------------------+
|      Lavadora       |
+---------------------+
| - nombreMarca       |
| - numeroDeSerie     |
| - capacidad         |
| - potencia          |
+---------------------+
| + encender()        |
| + apagar()          |
| + lavar()           |
| + aclarar()         |
+---------------------+
```

En Java, esa clase se escribiría así:

```java
public class Lavadora {
    // Atributos (datos del objeto)
    private String nombreMarca;
    private String numeroDeSerie;
    private double capacidad;
    private int potencia;

    // Métodos (operaciones del objeto)
    public void encender() {
        System.out.println("Lavadora encendida.");
    }

    public void lavar() {
        System.out.println("Iniciando ciclo de lavado...");
    }

    public void apagar() {
        System.out.println("Lavadora apagada.");
    }
}
```

Y así se crearían **objetos** (instancias) de esa clase:

```java
public class Main {
    public static void main(String[] args) {
        // Crear dos objetos distintos de la misma clase
        Lavadora lavadora1 = new Lavadora();
        Lavadora lavadora2 = new Lavadora();

        // Enviar mensajes a los objetos
        lavadora1.encender();
        lavadora1.lavar();
        lavadora2.encender();
    }
}
```

`lavadora1` y `lavadora2` son dos **objetos** distintos, aunque los dos son de tipo `Lavadora`. Esto es clave: la clase define la estructura, los objetos son las instancias concretas.

### Atributo, Método y Mensaje

| Concepto | Definición | Equivale a (en estructurado) |
|---|---|---|
| **Atributo** | Dato o propiedad que describe al objeto | Variable |
| **Método** | Operación que el objeto puede realizar | Función |
| **Mensaje** | Llamada a un método de un objeto | Llamada a función |

### Estado, comportamiento e identidad

Todo objeto tiene tres características:

- **Estado:** el conjunto de valores de sus atributos en un momento dado. El estado de `lavadora1` puede ser: marca = "Samsung", capacidad = 12 kg, encendida = true.
- **Comportamiento:** las operaciones disponibles (`encender()`, `lavar()`, etc.).
- **Identidad:** cada objeto es único, aunque tenga exactamente los mismos valores que otro. `lavadora1` y `lavadora2` son dos entidades diferentes aunque sean idénticas en sus datos.

---

## Las 4 propiedades fundamentales de la POO

La POO no es solo "poner datos y funciones juntos". Su verdadero poder viene de cuatro propiedades que trabajan en conjunto.

### 1. Abstracción

> Solo modelamos los aspectos **relevantes** del objeto para el problema que estamos resolviendo.

El mundo real es infinitamente complejo. Una persona tiene nombre, edad, altura, color de cabello, historial médico, historial bancario, gustos musicales, etc. Para un **sistema académico**, nos interesan: nombre, código, carrera y promedio. El resto simplemente no forma parte del modelo.

Esto es abstracción: ignorar lo irrelevante para exponer solo lo esencial.

La abstracción también nos permite **usar** un objeto sin conocer cómo funciona internamente. Cuando llamamos `Math.sqrt(25)` en Java no necesitamos conocer el algoritmo que calcula la raíz cuadrada. Solo conocemos la **interfaz**: qué recibe y qué devuelve.

### 2. Encapsulamiento y Ocultación de Datos

> Los datos del objeto están **ocultos** del exterior. Solo se accede a ellos a través de los métodos de la clase.

El encapsulamiento y la ocultación de datos van de la mano. La idea es que el objeto es una "caja negra": desde afuera solo se ve lo que hace, no cómo lo hace.

**Analogía:** El mando a distancia del televisor. Los botones son la **interfaz pública**: cualquiera puede usarlos. El circuito interno es la **implementación privada**: no es necesario conocerla para cambiar el canal.

**¿Por qué es importante?** Porque permite modificar la implementación interna de una clase sin afectar el código que la usa. Mientras la interfaz (los métodos públicos) permanezca igual, el mundo exterior no nota ninguna diferencia.

**Ejemplo desarrollado — Clase `CuentaBancaria`:**

```java
public class CuentaBancaria {
    // Atributo privado: nadie puede modificarlo directamente desde fuera
    private double saldo;
    private String titular;

    // Constructor
    public CuentaBancaria(String titular, double saldoInicial) {
        this.titular = titular;
        this.saldo = saldoInicial;
    }

    // Método público para consultar el saldo (getter)
    public double getSaldo() {
        return saldo;
    }

    // Método público para depositar (con validación)
    public void depositar(double monto) {
        if (monto > 0) {
            saldo += monto;
            System.out.println("Depósito exitoso. Saldo actual: " + saldo);
        } else {
            System.out.println("Error: el monto debe ser positivo.");
        }
    }

    // Método público para retirar (con validación)
    public void retirar(double monto) {
        if (monto > 0 && monto <= saldo) {
            saldo -= monto;
            System.out.println("Retiro exitoso. Saldo actual: " + saldo);
        } else {
            System.out.println("Error: fondos insuficientes o monto inválido.");
        }
    }
}
```

En el ejemplo anterior, nadie desde fuera puede escribir `cuenta.saldo = -9999`. El acceso está controlado por los métodos, que incluyen validaciones. Eso es encapsulamiento en acción.

### 3. Herencia

> Una clase puede **heredar** los atributos y métodos de otra clase más general, y agregar los suyos propios.

La herencia modela el hecho de que los objetos del mundo real tienden a organizarse en **jerarquías**. Los animales se dividen en mamíferos, reptiles, aves. Los vehículos se dividen en autos, motos, camiones. Los electrodomésticos se dividen en lavadoras, neveras, tostadoras.

En cada jerarquía, los elementos más específicos **comparten** las características del nivel superior y **agregan** las suyas propias.

**Terminología:**

| Término en Java | Significado |
|---|---|
| Superclase / clase padre | La clase más general, de la que se hereda |
| Subclase / clase derivada | La clase más específica, que hereda |

**Relación fundamental:** La herencia expresa la relación **es-un** (*is-a*). Un `Auto` ES UN `Vehículo`. Un `Mono` ES UN `Animal`. Esta relación justifica la herencia.

**Ejemplo visual:**

```
              Figura
             /   |   \
       Circulo  Rectangulo  Triangulo
```

- `Figura` tiene: `color`, `posicionX`, `posicionY`, `mover()`, `calcularArea()`
- `Rectangulo` hereda todo eso y agrega: `base`, `altura`
- `Circulo` hereda todo eso y agrega: `radio`

**Beneficio de la herencia:** El código definido en `Figura` (por ejemplo, el método `mover()`) está disponible automáticamente en `Circulo`, `Rectangulo` y `Triangulo`. Si necesitamos modificarlo, lo cambiamos en un solo lugar.

### 4. Polimorfismo

> El mismo nombre de método puede tener **implementaciones diferentes** en clases distintas.

El polimorfismo es quizás el concepto más poderoso de la POO. La palabra viene del griego: *poli* = muchos, *morphos* = formas. Una misma operación, muchas formas de realizarla.

**Analogía cotidiana:** La acción "abrir" tiene significados completamente distintos dependiendo del objeto: abrir una puerta, abrir un libro, abrir una cuenta bancaria, abrir un congreso. Misma palabra, comportamiento diferente.

**Ejemplo desarrollado — jerarquía de figuras:**

Retomando el ejemplo anterior, cada figura calcula su área de forma diferente:

```java
public class Figura {
    protected String color;

    // Método que será redefinido por las subclases
    public double calcularArea() {
        return 0;
    }
}

public class Rectangulo extends Figura {
    private double base;
    private double altura;

    public Rectangulo(double base, double altura) {
        this.base = base;
        this.altura = altura;
    }

    @Override
    public double calcularArea() {
        return base * altura;  // Implementación específica para rectángulo
    }
}

public class Circulo extends Figura {
    private double radio;

    public Circulo(double radio) {
        this.radio = radio;
    }

    @Override
    public double calcularArea() {
        return Math.PI * radio * radio;  // Implementación específica para círculo
    }
}

public class Triangulo extends Figura {
    private double base;
    private double altura;

    public Triangulo(double base, double altura) {
        this.base = base;
        this.altura = altura;
    }

    @Override
    public double calcularArea() {
        return (base * altura) / 2;  // Implementación específica para triángulo
    }
}
```

La magia del polimorfismo se ve al usarlas:

```java
public class Main {
    public static void main(String[] args) {
        Figura[] figuras = {
            new Rectangulo(5, 3),
            new Circulo(4),
            new Triangulo(6, 8)
        };

        // El mismo llamado, comportamientos distintos en tiempo de ejecución
        for (Figura f : figuras) {
            System.out.println("Área: " + f.calcularArea());
        }
    }
}
```

El método `calcularArea()` es el mismo nombre para las tres clases, pero Java sabe cuál implementación ejecutar según el tipo real del objeto. Eso es polimorfismo.

---

## Introducción a UML: el lenguaje visual del diseño

Antes de escribir una sola línea de código, los programadores profesionales **diseñan** su sistema. Para eso utilizan UML (*Unified Modeling Language*), el lenguaje visual estándar de la industria del software.

UML no es un lenguaje de programación: es un lenguaje de **modelado**. Tiene su propia sintaxis (cómo se escriben los símbolos) y semántica (qué significan). Sus creadores fueron Grady Booch, James Rumbaugh e Ivar Jacobson —conocidos como "los tres amigos"— quienes unificaron los mejores métodos de la época a mediados de los 90. En 1997, la OMG lo adoptó como estándar oficial.

### ¿Para qué sirve UML?

- Diseñar software antes de codificarlo.
- Comunicar arquitecturas entre equipos.
- Documentar sistemas existentes.
- Capturar requisitos en las fases de análisis.

### Tipos de diagramas

UML define dos grandes categorías:

**Diagramas estructurales** — capturan la organización estática del sistema:
- Diagrama de clases *(el más usado en POO)*
- Diagrama de objetos
- Diagrama de componentes
- Diagrama de despliegue

**Diagramas de comportamiento** — capturan cómo se comporta el sistema:
- Diagrama de casos de uso
- Diagrama de secuencia
- Diagrama de actividad
- Diagrama de estados

### El diagrama de clases

El **diagrama de clases** es el corazón de UML en el diseño orientado a objetos. Cada clase se representa con un rectángulo de tres compartimentos:

```
+----------------------------+
|         NombreClase        |  ← Compartimento 1: Nombre
+----------------------------+
| - atributo1 : tipo         |  ← Compartimento 2: Atributos
| - atributo2 : tipo         |
| # atributoProtegido : tipo |
+----------------------------+
| + metodoPublico()          |  ← Compartimento 3: Métodos
| - metodoPrivado()          |
| + metodoConParam(p : tipo) |
+----------------------------+
```

**Modificadores de visibilidad:**

| Símbolo | Modificador | Significado |
|---|---|---|
| `+` | `public` | Accesible desde cualquier lugar |
| `-` | `private` | Solo accesible dentro de la clase |
| `#` | `protected` | Accesible dentro de la clase y sus subclases |

### Herencia en UML

La herencia se representa con una flecha con punta de triángulo **vacío**, apuntando de la subclase hacia la superclase:

```
        Vehículo
            △
           / \
          /   \
        Auto  Moto
```

---

## Ejercicios desarrollados en clase

### Ejercicio A — Diseño de la clase `Luz` (Semáforo)

**Enunciado:** Construir una clase llamada `Luz` que simule una luz de tráfico. El atributo `color` debe cambiar de Verde a Amarillo, a Rojo y de nuevo a Verde, mediante una operación `cambiar()`. Cuando se crea un objeto `Luz`, su color inicial será Rojo.

**Análisis previo — Diagrama UML:**

```
+---------------------+
|        Luz          |
+---------------------+
| - color : String    |
+---------------------+
| + Luz()             |
| + cambiar()         |
| + getColor()        |
+---------------------+
```

**Implementación en Java:**

```java
public class Luz {
    // Atributo privado: el color actual de la luz
    private String color;

    // Constructor: estado inicial es Rojo
    public Luz() {
        this.color = "Rojo";
    }

    // Método para avanzar al siguiente color en el ciclo
    public void cambiar() {
        if (color.equals("Rojo")) {
            color = "Verde";
        } else if (color.equals("Verde")) {
            color = "Amarillo";
        } else {
            color = "Rojo";
        }
    }

    // Método para consultar el color actual
    public String getColor() {
        return color;
    }

    // Método para mostrar el estado
    public void mostrarEstado() {
        System.out.println("Color actual: " + color);
    }
}
```

**Programa de prueba:**

```java
public class PruebaLuz {
    public static void main(String[] args) {
        Luz semaforo = new Luz();
        semaforo.mostrarEstado();  // Color actual: Rojo

        semaforo.cambiar();
        semaforo.mostrarEstado();  // Color actual: Verde

        semaforo.cambiar();
        semaforo.mostrarEstado();  // Color actual: Amarillo

        semaforo.cambiar();
        semaforo.mostrarEstado();  // Color actual: Rojo (ciclo completo)
    }
}
```

**Salida esperada:**

```text
Color actual: Rojo
Color actual: Verde
Color actual: Amarillo
Color actual: Rojo
```

---

### Ejercicio B — Diseño de la clase `Rectangulo`

**Enunciado:** Crear una clase que describa un rectángulo. Debe permitir conocer su área, su perímetro y modificar sus dimensiones.

**Análisis previo — Diagrama UML:**

```
+-----------------------------+
|         Rectangulo          |
+-----------------------------+
| - base   : double           |
| - altura : double           |
| - color  : String           |
+-----------------------------+
| + Rectangulo(b, a, c)       |
| + calcularArea() : double   |
| + calcularPerimetro():double|
| + cambiarTamanio(b, a)      |
| + cambiarColor(c)           |
| + mostrarInfo()             |
+-----------------------------+
```

**Implementación en Java:**

```java
public class Rectangulo {
    private double base;
    private double altura;
    private String color;

    // Constructor
    public Rectangulo(double base, double altura, String color) {
        this.base = base;
        this.altura = altura;
        this.color = color;
    }

    // Calcular el área
    public double calcularArea() {
        return base * altura;
    }

    // Calcular el perímetro
    public double calcularPerimetro() {
        return 2 * (base + altura);
    }

    // Modificar dimensiones
    public void cambiarTamanio(double nuevaBase, double nuevaAltura) {
        if (nuevaBase > 0 && nuevaAltura > 0) {
            this.base = nuevaBase;
            this.altura = nuevaAltura;
        } else {
            System.out.println("Error: las dimensiones deben ser positivas.");
        }
    }

    // Modificar color
    public void cambiarColor(String nuevoColor) {
        this.color = nuevoColor;
    }

    // Mostrar información completa
    public void mostrarInfo() {
        System.out.println("Rectángulo:");
        System.out.println("  Base   : " + base);
        System.out.println("  Altura : " + altura);
        System.out.println("  Color  : " + color);
        System.out.println("  Área   : " + calcularArea());
        System.out.println("  Perímetro: " + calcularPerimetro());
    }
}
```

**Programa de prueba:**

```java
public class PruebaRectangulo {
    public static void main(String[] args) {
        Rectangulo r1 = new Rectangulo(5.0, 3.0, "Azul");
        r1.mostrarInfo();

        System.out.println("--- Después de cambiar tamaño y color ---");
        r1.cambiarTamanio(8.0, 4.0);
        r1.cambiarColor("Rojo");
        r1.mostrarInfo();
    }
}
```

**Salida esperada:**

```text
Rectángulo:
  Base   : 5.0
  Altura : 3.0
  Color  : Azul
  Área   : 15.0
  Perímetro: 16.0
--- Después de cambiar tamaño y color ---
Rectángulo:
  Base   : 8.0
  Altura : 4.0
  Color  : Rojo
  Área   : 32.0
  Perímetro: 24.0
```

---

### Ejercicio C — Diseño de la clase `Persona`

**Enunciado:** Construir una clase `Persona` con los atributos y métodos que se consideren adecuados para representar a una persona en un sistema académico.

**Análisis previo — Diagrama UML:**

```
+----------------------------+
|          Persona           |
+----------------------------+
| - nombre    : String       |
| - edad      : int          |
| - documento : String       |
| - correo    : String       |
+----------------------------+
| + Persona(n, e, doc, mail) |
| + getNombre()  : String    |
| + getEdad()    : int       |
| + setCorreo(c)             |
| + saludar()                |
| + mostrarInfo()            |
+----------------------------+
```

**Implementación en Java:**

```java
public class Persona {
    private String nombre;
    private int edad;
    private String documento;
    private String correo;

    // Constructor
    public Persona(String nombre, int edad, String documento, String correo) {
        this.nombre = nombre;
        this.edad = edad;
        this.documento = documento;
        this.correo = correo;
    }

    // Métodos de acceso (getters)
    public String getNombre() { return nombre; }
    public int getEdad()      { return edad; }
    public String getDocumento() { return documento; }
    public String getCorreo() { return correo; }

    // Modificar correo
    public void setCorreo(String correo) {
        this.correo = correo;
    }

    // Comportamiento propio
    public void saludar() {
        System.out.println("Hola, mi nombre es " + nombre + " y tengo " + edad + " años.");
    }

    // Mostrar información completa
    public void mostrarInfo() {
        System.out.println("Nombre   : " + nombre);
        System.out.println("Edad     : " + edad);
        System.out.println("Doc.     : " + documento);
        System.out.println("Correo   : " + correo);
    }
}
```

---

## Conceptos clave — Glosario de la sesión

| Término | Definición |
|---|---|
| **Abstracción** | Representar solo los aspectos esenciales de un objeto, ignorando los detalles irrelevantes. |
| **Atributo** | Dato o propiedad que caracteriza a un objeto. Equivale a una variable en la programación estructurada. |
| **Clase** | Plantilla o molde que define la estructura y comportamiento de un conjunto de objetos. Implementación de un Tipo Abstracto de Dato (TAD). |
| **Clase base / superclase** | Clase de la que otras clases heredan atributos y métodos. |
| **Clase derivada / subclase** | Clase que hereda de otra y puede añadir sus propias características. |
| **Encapsulamiento** | Agrupamiento de atributos y métodos en una sola unidad (clase), ocultando los datos del exterior. |
| **Herencia** | Propiedad que permite a una clase adquirir los atributos y métodos de otra, modelando la relación es-un. |
| **Instancia** | Objeto concreto creado a partir de una clase. "Un `Auto` creado con `new Auto()`" es una instancia de la clase `Auto`. |
| **Mensaje** | Llamada a un método de un objeto. Forma en que los objetos se comunican entre sí. |
| **Método** | Operación o comportamiento de un objeto. Equivale a una función en la programación estructurada. |
| **Objeto** | Instancia de una clase. Tiene estado (atributos), comportamiento (métodos) e identidad única. |
| **Ocultación de datos** | Principio que impide el acceso directo a los atributos de un objeto desde el exterior. |
| **Polimorfismo** | Capacidad de un método de tener implementaciones distintas en clases diferentes, con el mismo nombre. |
| **Reutilización** | Capacidad de usar una clase ya definida en nuevos proyectos o de extenderla mediante herencia. |
| **Sobrecarga** | Tipo especial de polimorfismo: mismo nombre de método con diferentes parámetros. |
| **TAD (Tipo Abstracto de Dato)** | Descripción de un tipo de dato por sus valores y operaciones, sin especificar su implementación. |
| **UML** | Lenguaje Unificado de Modelado. Estándar visual para diseñar y documentar sistemas de software. |

---

## Breve historia de UML

El UML no apareció de la nada. A comienzos de los 90 coexistían tres métodos influyentes de modelado orientado a objetos:

- **OMT** de James Rumbaugh
- **OOSE** de Ivar Jacobson
- **Booch'93** de Grady Booch

Estos tres autores se unieron en Rational Corporation y comenzaron a fusionar sus métodos. En 1994 publicaron el primer borrador unificado. En enero de 1997 lanzaron la versión 1.0 de UML, y ese mismo año la OMG (Object Management Group) lo adoptó como estándar oficial. Desde entonces, UML se convirtió en el lenguaje de modelado más usado del mundo.

La versión actual, UML 2.1 (y su revisión 2.1.1), amplió significativamente el metamodelo y agregó nuevos tipos de diagramas. En 2004 se publicó UML 2.0, la versión más madura hasta la fecha.

---

## Reflexión final

La programación orientada a objetos no es solo una técnica: es una **forma de pensar**. En lugar de preguntar "¿qué instrucciones debe ejecutar el computador?", preguntamos "¿qué objetos participan en este problema y cómo interactúan?".

Esta perspectiva nos acerca más al mundo real y nos permite construir software que es:

- **Más fácil de entender**, porque los objetos corresponden a entidades reales conocidas.
- **Más fácil de mantener**, gracias al encapsulamiento y la separación de responsabilidades.
- **Más fácil de extender**, gracias a la herencia y el polimorfismo.
- **Más reutilizable**, porque las clases bien diseñadas pueden usarse en múltiples proyectos.

Los ejercicios del banco de ejercicios del Capítulo 15 son el siguiente paso: poner en práctica la identificación de objetos, atributos y métodos en contextos variados.

---

## Referencias

- Joyanes Aguilar, L. (2008). *Fundamentos de programación* (4.ª ed.). McGraw-Hill. Capítulo 15.
- OMG Unified Modeling Language (UML). Versión 2.5.1. https://www.omg.org/spec/UML/
