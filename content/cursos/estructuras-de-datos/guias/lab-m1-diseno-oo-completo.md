---
title: "Laboratorio Evaluativo — Codificación de Diseño OO (Momento 1)"
updatedAt: "2026-08-18"
---

# Laboratorio Evaluativo — Codificación de Diseño OO (Momento 1)

## Objetivo

Leer e interpretar el diagrama UML de su proyecto de aula — entregado ya
resuelto en este documento, en la sección correspondiente a su caso de
estudio — e implementarlo fielmente en Java, aplicando encapsulamiento,
herencia, clases abstractas e interfaces.

---

## Punto de partida: las clases de su práctica de Semana 2

Este laboratorio **no empieza de cero**. En la práctica en clase "Modela una
clase de tu proyecto de aula" (Semana 2), su equipo ya repartió las cinco
entidades de su caso de estudio, un integrante por clase, y cada una quedó
como un archivo `.java` propio dentro de `model/domain/` en el repositorio
compartido: atributos públicos, un constructor que los asigna con `this`, y
un método que muestra la información del objeto por consola. Sin `private`,
sin herencia, sin interfaces todavía — ese era el alcance deliberado de esa
sesión.

Ese repositorio, con esos cinco archivos ya funcionando, es exactamente lo
que va a abrir para empezar este laboratorio. Lo que hace este laboratorio es
**evolucionar** esas mismas cinco clases: las encapsula (atributos `private`,
constructor validado, getters y setters), y a una de ellas la promueve a
clase abstracta que implementa una interfaz nueva, dejando un método sin
resolver que dos subtipos concretos —algunos de los cuales ya eran una de sus
cinco entidades, y ahora se convierten en subclases por herencia— resuelven
cada uno a su manera.

**Las cinco clases de la práctica siguen siendo de entrega obligatoria en
este laboratorio**, tengan o no un rol en la jerarquía de herencia. Las que
no participan de la interfaz ni de la herencia se entregan igual, ya
encapsuladas y relacionadas por composición o asociación con las demás —
no se descartan ni se reemplazan.

Ubique la sección de su proyecto más abajo: ahí encuentra, para cada una de
sus cinco clases, si ya existe de la práctica (y qué le falta agregar) o si
es un archivo nuevo que su proyecto no tenía todavía.

---

## Ubique su sección

Cada uno de los cinco proyectos elegibles tiene su diagrama UML ya resuelto
en la sección siguiente. **Ubique la sección de su proyecto asignado y
trabaje únicamente sobre ella** — no necesita leer ni implementar las otras
cuatro.

---

## Diagrama UML por proyecto

### 1. Papelería

Sus cinco clases de la práctica fueron `Producto`, `Venta`, `Proveedor`,
`Pedido` e `ItemVenta`. Las cinco siguen siendo obligatorias. A ellas se
suman dos archivos **nuevos**: `ProductoOficina` y `ProductoEscolar`, los
subtipos concretos que especializan a `Producto`.

```mermaid
classDiagram
  class Vendible {
    <<interface>>
    +vender(cantidad: int) void
    +calcularPrecioFinal() double
  }
  class Producto {
    <<abstract>>
    -codigo : String
    -nombre : String
    -precio : double
    -cantidadStock : int
    +vender(cantidad: int) void
  }
  class ProductoOficina {
    -categoria : String
    +calcularPrecioFinal() double
  }
  class ProductoEscolar {
    -nivelEscolar : String
    +calcularPrecioFinal() double
  }
  class ItemVenta {
    -cantidad : int
  }
  class Venta {
  }
  class Proveedor {
    -nombre : String
    -telefono : String
    -categoriaProductos : String
  }
  class Pedido {
    -fecha : LocalDate
    -estado : String
  }
  Vendible <|.. Producto
  Producto <|-- ProductoOficina
  Producto <|-- ProductoEscolar
  Venta "1" *-- "1..*" ItemVenta
  ItemVenta --> Producto
  Proveedor "1" --> "0..*" Pedido
```

**Requisitos de implementación:**
- Todas las clases van en el paquete `model.domain`.
- Los atributos son `private`; el acceso externo es siempre por getters (y
  setters solo donde el diagrama lo requiera).
- `Producto` **ya existe** como el archivo de su práctica de Semana 2. Ahora
  se convierte en clase abstracta, implementa `Vendible`, encapsula sus
  cuatro atributos y resuelve `vender()`. El constructor valida
  `precio > 0` y `cantidadStock >= 0`, lanzando `IllegalArgumentException`
  en caso contrario.
- `Producto.vender(cantidad)` valida que `cantidad` sea positiva y que haya
  stock suficiente antes de descontarlo; si no hay stock suficiente, lanza
  `IllegalStateException`.
- `calcularPrecioFinal()` queda **sin implementar en `Producto`**: cada
  subtipo la resuelve con su propia regla. `ProductoOficina` y
  `ProductoEscolar` son **archivos nuevos** — su proyecto no los tenía en la
  práctica. `ProductoOficina` aplica un recargo fijo del 8 % sobre `precio`
  (mayor margen por manejo de insumos especializados). `ProductoEscolar`
  aplica un descuento del 10 % sobre `precio` cuando `nivelEscolar` sea
  `"primaria"`, y ningún descuento en cualquier otro caso.
- `Venta` e `ItemVenta` **ya existen** de la práctica; ahora solo se
  encapsulan (no entran en la jerarquía de herencia). `ItemVenta` referencia
  un `Producto` por asociación (no composición): el producto existe
  independientemente de la venta.
- `Proveedor` y `Pedido` **ya existen** de la práctica; se encapsulan y se
  relacionan entre sí por asociación (`Proveedor "1" --> "0..*" Pedido`): un
  pedido puede seguir existiendo aunque cambie el proveedor que lo generó.

**Archivos de este proyecto:** `Vendible.java`, `Producto.java`,
`ProductoOficina.java`, `ProductoEscolar.java`, `Venta.java`,
`ItemVenta.java`, `Proveedor.java`, `Pedido.java`.

```java
package model.domain;

public interface Vendible {
    void vender(int cantidad);
    double calcularPrecioFinal();
}
```

```java
package model.domain;

public abstract class Producto implements Vendible {
    private String codigo;
    private String nombre;
    private double precio;
    private int cantidadStock;

    public Producto(String codigo, String nombre, double precio, int cantidadStock) {
        // TODO: validar precio > 0 y cantidadStock >= 0
    }

    @Override
    public void vender(int cantidad) {
        // TODO: validar cantidad positiva y stock suficiente, descontar cantidadStock
    }

    // calcularPrecioFinal() queda sin resolver: cada subtipo la implementa

    // TODO: getters de codigo, nombre, precio, cantidadStock
}
```

```java
package model.domain;

public class ProductoOficina extends Producto {
    private String categoria;

    public ProductoOficina(String codigo, String nombre, double precio, int cantidadStock, String categoria) {
        super(codigo, nombre, precio, cantidadStock);
        // TODO: asignar categoria
    }

    @Override
    public double calcularPrecioFinal() {
        // TODO: aplicar recargo del 8% sobre el precio base
        return 0;
    }
}
```

```java
package model.domain;

public class ProductoEscolar extends Producto {
    private String nivelEscolar;

    public ProductoEscolar(String codigo, String nombre, double precio, int cantidadStock, String nivelEscolar) {
        super(codigo, nombre, precio, cantidadStock);
        // TODO: asignar nivelEscolar
    }

    @Override
    public double calcularPrecioFinal() {
        // TODO: aplicar descuento del 10% si nivelEscolar es "primaria"
        return 0;
    }
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Venta {
    private final List<ItemVenta> items;

    public Venta() {
        this.items = new ArrayList<>();
    }

    public void agregarItem(ItemVenta item) {
        // TODO: agregar item a la lista (composicion: el ItemVenta solo existe dentro de una Venta)
    }

    // TODO: getter de items
}
```

```java
package model.domain;

public class ItemVenta {
    private Producto producto;
    private int cantidad;

    public ItemVenta(Producto producto, int cantidad) {
        // TODO: validar cantidad positiva, asignar producto y cantidad
    }

    // TODO: getters de producto y cantidad
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Proveedor {
    private String nombre;
    private String telefono;
    private String categoriaProductos;
    private final List<Pedido> pedidos;

    public Proveedor(String nombre, String telefono, String categoriaProductos) {
        // TODO: validar nombre no nulo ni vacio; asignar telefono y categoriaProductos
        this.pedidos = new ArrayList<>();
    }

    public void agregarPedido(Pedido pedido) {
        // TODO: agregar pedido a la lista (asociacion, no composicion)
    }

    // TODO: getters de nombre, telefono, categoriaProductos, pedidos
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Pedido {
    private LocalDate fecha;
    private String estado;

    public Pedido(LocalDate fecha, String estado) {
        // TODO: validar fecha no nula; asignar fecha y estado
    }

    // TODO: getter de fecha; getter y setter de estado (un pedido cambia de estado con el tiempo)
}
```

---

### 2. Consultorio Médico

Sus cinco clases de la práctica fueron `Paciente`, `Medico`, `Cita`,
`Consulta` y `Persona`. Las cinco siguen siendo obligatorias — sin archivos
nuevos en este proyecto, solo evolución de los cinco que ya tiene.

```mermaid
classDiagram
  class RolClinico {
    <<interface>>
    +datosResumen() String
    +rolEnConsulta() String
  }
  class Persona {
    <<abstract>>
    -identificacion : String
    -nombre : String
    -telefono : String
    +datosResumen() String
  }
  class Paciente {
    -edad : int
    -eps : String
    +rolEnConsulta() String
  }
  class Medico {
    -especialidad : String
    -numeroRegistro : String
    +rolEnConsulta() String
  }
  class Consulta {
    -motivo : String
    -diagnostico : String
    -tratamiento : String
    -fecha : LocalDate
  }
  class Cita {
    -fecha : LocalDate
    -hora : String
    -motivo : String
  }
  RolClinico <|.. Persona
  Persona <|-- Paciente
  Persona <|-- Medico
  Paciente "1" *-- "0..*" Consulta
  Cita --> Paciente
  Cita --> Medico
```

**Requisitos de implementación:**
- Todas las clases van en el paquete `model.domain`.
- Atributos `private`; acceso por getters y setters donde el diagrama lo
  requiera.
- `Persona` **ya existe** como el archivo de su práctica de Semana 2 (la
  quinta entidad que le tocó modelar a algún integrante del equipo). Ahora
  se convierte en clase abstracta, implementa `RolClinico`, y encapsula sus
  tres atributos. El constructor valida que `identificacion` no sea nula ni
  esté vacía, lanzando `IllegalArgumentException` en caso contrario.
- `datosResumen()` queda implementado en `Persona` (igual para todos los
  subtipos): retorna una cadena que combine `identificacion`, `nombre` y
  `telefono`.
- `Paciente` **ya existe** de la práctica. Ahora extiende `Persona` (sus
  atributos `identificacion`, `nombre`, `telefono` pasan a heredarse en vez
  de repetirse) y conserva `edad` y `eps` como atributos propios.
  `rolEnConsulta()` queda **sin implementar en `Persona`**: `Paciente` la
  resuelve incluyendo `eps` y `edad`.
- `Medico` **ya existe** de la práctica. Extiende `Persona` y conserva
  `especialidad` y `numeroRegistro` como atributos propios; resuelve
  `rolEnConsulta()` incluyendo ambos.
- `Consulta` **ya existe** de la práctica; ahora solo se encapsula (no entra
  en la jerarquía). No existe fuera de un `Paciente` (composición).
- `Cita` **ya existe** de la práctica; se encapsula y queda asociada tanto a
  `Paciente` como a `Medico` (no composición: la cita referencia a ambos,
  pero ninguno depende de ella para existir).

**Archivos de este proyecto:** `RolClinico.java`, `Persona.java`,
`Paciente.java`, `Medico.java`, `Consulta.java`, `Cita.java`.

```java
package model.domain;

public interface RolClinico {
    String datosResumen();
    String rolEnConsulta();
}
```

```java
package model.domain;

public abstract class Persona implements RolClinico {
    private String identificacion;
    private String nombre;
    private String telefono;

    public Persona(String identificacion, String nombre, String telefono) {
        // TODO: validar identificacion no nula ni vacia
    }

    @Override
    public String datosResumen() {
        // TODO: combinar identificacion, nombre y telefono en una cadena
        return null;
    }

    // rolEnConsulta() queda sin resolver: cada subtipo la implementa

    // TODO: getters de identificacion, nombre, telefono
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Paciente extends Persona {
    private int edad;
    private String eps;
    private final List<Consulta> consultas;

    public Paciente(String identificacion, String nombre, String telefono, int edad, String eps) {
        super(identificacion, nombre, telefono);
        // TODO: asignar edad y eps
        this.consultas = new ArrayList<>();
    }

    public void agregarConsulta(Consulta consulta) {
        // TODO: agregar consulta a la lista (composicion: no existe fuera de este Paciente)
    }

    @Override
    public String rolEnConsulta() {
        // TODO: incluir eps y edad
        return null;
    }

    // TODO: getters de edad, eps, consultas
}
```

```java
package model.domain;

public class Medico extends Persona {
    private String especialidad;
    private String numeroRegistro;

    public Medico(String identificacion, String nombre, String telefono, String especialidad, String numeroRegistro) {
        super(identificacion, nombre, telefono);
        // TODO: asignar especialidad y numeroRegistro
    }

    @Override
    public String rolEnConsulta() {
        // TODO: incluir especialidad y numeroRegistro
        return null;
    }
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Consulta {
    private String motivo;
    private String diagnostico;
    private String tratamiento;
    private LocalDate fecha;

    public Consulta(String motivo, String diagnostico, String tratamiento, LocalDate fecha) {
        // TODO: asignar los cuatro atributos
    }

    // TODO: getters de motivo, diagnostico, tratamiento, fecha
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Cita {
    private LocalDate fecha;
    private String hora;
    private String motivo;
    private Paciente paciente;
    private Medico medico;

    public Cita(LocalDate fecha, String hora, String motivo, Paciente paciente, Medico medico) {
        // TODO: asignar los cinco atributos
    }

    // TODO: getters de fecha, hora, motivo, paciente, medico
}
```

---

### 3. Clínica Veterinaria

Sus cinco clases de la práctica fueron `Animal`, `Dueño`, `Veterinario`,
`Consulta` y `Vacuna`. Las cinco siguen siendo obligatorias. A diferencia de
Consultorio Médico o Sistema Académico, este proyecto **no tenía** una
entidad `Persona` entre sus cinco de la práctica — aquí `Persona` es un
archivo nuevo, igual que la interfaz.

```mermaid
classDiagram
  class RolEnClinica {
    <<interface>>
    +datosResumen() String
    +rolEnClinica() String
  }
  class Persona {
    <<abstract>>
    -identificacion : String
    -nombre : String
    -telefono : String
    +datosResumen() String
  }
  class Dueño {
    -direccion : String
    +rolEnClinica() String
  }
  class Veterinario {
    -especialidad : String
    +rolEnClinica() String
  }
  class Animal {
    -numeroFicha : String
    -nombre : String
    -especie : String
    -raza : String
    -edadAnios : int
  }
  class Consulta {
    -motivo : String
    -diagnostico : String
    -tratamiento : String
    -fecha : LocalDate
  }
  class Vacuna {
    -nombre : String
    -fechaAplicacion : LocalDate
    -proximaFecha : LocalDate
  }
  RolEnClinica <|.. Persona
  Persona <|-- Dueño
  Persona <|-- Veterinario
  Dueño "1" *-- "1..*" Animal
  Consulta --> Animal
  Consulta --> Veterinario
  Vacuna --> Animal
```

**Requisitos de implementación:**
- Todas las clases van en el paquete `model.domain`.
- Atributos `private`; acceso por getters y setters donde el diagrama lo
  requiera.
- `Persona` es un **archivo nuevo** (igual que la interfaz `RolEnClinica`):
  su proyecto no la tenía en la práctica. El constructor valida que
  `identificacion` no sea nula ni esté vacía.
- `datosResumen()` queda implementado en `Persona` (igual para `Dueño` y
  `Veterinario`): retorna una cadena que combine `identificacion`, `nombre`
  y `telefono`.
- `Dueño` **ya existe** de la práctica. Ahora extiende `Persona` y conserva
  `direccion` como atributo propio. `rolEnClinica()` queda **sin implementar
  en `Persona`**: `Dueño` la resuelve mencionando cuántos animales tiene a
  cargo (el tamaño de su lista de `Animal`).
- `Veterinario` **ya existe** de la práctica. Extiende `Persona` y conserva
  `especialidad`; resuelve `rolEnClinica()` incluyéndola.
- `Animal` **ya existe** de la práctica. A diferencia de los otros cuatro
  proyectos, aquí `Animal` **no entra en la jerarquía de herencia ni
  implementa ninguna interfaz**: queda como una clase concreta plana,
  encapsulada, con `numeroFicha`, `nombre`, `especie`, `raza` y
  `edadAnios`. El constructor valida que `numeroFicha` no sea nulo ni esté
  vacío.
- Un `Animal` no existe fuera de un `Dueño` (composición, `"1"` a `"1..*"`):
  esta relación ya estaba en el diseño de la práctica y se mantiene igual.
- `Consulta` y `Vacuna` **ya existen** de la práctica; se encapsulan y
  quedan asociadas a `Animal` (`Consulta` además a `Veterinario`).

**Archivos de este proyecto:** `RolEnClinica.java`, `Persona.java`,
`Dueño.java`, `Veterinario.java`, `Animal.java`, `Consulta.java`,
`Vacuna.java`.

```java
package model.domain;

public interface RolEnClinica {
    String datosResumen();
    String rolEnClinica();
}
```

```java
package model.domain;

public abstract class Persona implements RolEnClinica {
    private String identificacion;
    private String nombre;
    private String telefono;

    public Persona(String identificacion, String nombre, String telefono) {
        // TODO: validar identificacion no nula ni vacia
    }

    @Override
    public String datosResumen() {
        // TODO: combinar identificacion, nombre y telefono en una cadena
        return null;
    }

    // rolEnClinica() queda sin resolver: cada subtipo la implementa

    // TODO: getters de identificacion, nombre, telefono
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Dueño extends Persona {
    private String direccion;
    private final List<Animal> animales;

    public Dueño(String identificacion, String nombre, String telefono, String direccion) {
        super(identificacion, nombre, telefono);
        // TODO: asignar direccion
        this.animales = new ArrayList<>();
    }

    public void agregarAnimal(Animal animal) {
        // TODO: agregar animal a la lista (composicion: no existe fuera de este Dueño)
    }

    @Override
    public String rolEnClinica() {
        // TODO: mencionar cuantos animales tiene a cargo (animales.size())
        return null;
    }

    // TODO: getters de direccion, animales
}
```

```java
package model.domain;

public class Veterinario extends Persona {
    private String especialidad;

    public Veterinario(String identificacion, String nombre, String telefono, String especialidad) {
        super(identificacion, nombre, telefono);
        // TODO: asignar especialidad
    }

    @Override
    public String rolEnClinica() {
        // TODO: incluir especialidad
        return null;
    }
}
```

```java
package model.domain;

public class Animal {
    private String numeroFicha;
    private String nombre;
    private String especie;
    private String raza;
    private int edadAnios;

    public Animal(String numeroFicha, String nombre, String especie, String raza, int edadAnios) {
        // TODO: validar numeroFicha no nulo ni vacio; asignar los demas atributos
    }

    // TODO: getters de numeroFicha, nombre, especie, raza, edadAnios
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Consulta {
    private String motivo;
    private String diagnostico;
    private String tratamiento;
    private LocalDate fecha;
    private Animal animal;
    private Veterinario veterinario;

    public Consulta(String motivo, String diagnostico, String tratamiento, LocalDate fecha, Animal animal, Veterinario veterinario) {
        // TODO: asignar los seis atributos
    }

    // TODO: getters de motivo, diagnostico, tratamiento, fecha, animal, veterinario
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Vacuna {
    private String nombre;
    private LocalDate fechaAplicacion;
    private LocalDate proximaFecha;
    private Animal animal;

    public Vacuna(String nombre, LocalDate fechaAplicacion, LocalDate proximaFecha, Animal animal) {
        // TODO: asignar los cuatro atributos
    }

    // TODO: getters de nombre, fechaAplicacion, proximaFecha, animal
}
```

---

### 4. Sistema Académico

Sus cinco clases de la práctica fueron `Estudiante`, `Profesor`, `Materia`,
`Matricula` y `Calificacion`. Las cinco siguen siendo obligatorias. Igual
que en Clínica Veterinaria, `Persona` es un archivo nuevo: su proyecto no la
tenía como una de las cinco entidades repartidas en la práctica.

```mermaid
classDiagram
  class RolAcademico {
    <<interface>>
    +datosResumen() String
    +identificarRol() String
  }
  class Persona {
    <<abstract>>
    -identificacion : String
    -nombre : String
    -correo : String
    +datosResumen() String
  }
  class Estudiante {
    -codigo : String
    -semestreActual : int
    +identificarRol() String
  }
  class Profesor {
    -codigo : String
    -departamento : String
    +identificarRol() String
  }
  class Matricula {
  }
  class Calificacion {
    -notaParcial1 : double
    -notaParcial2 : double
    -notaFinal : double
    -observaciones : String
  }
  class Materia {
  }
  RolAcademico <|.. Persona
  Persona <|-- Estudiante
  Persona <|-- Profesor
  Matricula "1" *-- "1..*" Calificacion
  Matricula --> Estudiante
  Calificacion --> Materia
```

**Requisitos de implementación:**
- Todas las clases van en el paquete `model.domain`.
- Atributos `private`; acceso por getters y setters donde el diagrama lo
  requiera.
- `Persona` es un **archivo nuevo** (igual que la interfaz `RolAcademico`):
  su proyecto no la tenía en la práctica. El constructor valida que
  `correo` contenga el carácter `@`, lanzando `IllegalArgumentException` en
  caso contrario.
- `datosResumen()` queda implementado en `Persona`: retorna una cadena que
  combine `identificacion`, `nombre` y `correo`.
- `Estudiante` y `Profesor` **ya existen** de la práctica. Ahora extienden
  `Persona` (heredan `identificacion`, `nombre`, `correo` en vez de
  repetirlos) y conservan sus atributos propios (`codigo` +
  `semestreActual` en `Estudiante`; `codigo` + `departamento` en
  `Profesor`). `identificarRol()` queda **sin implementar en `Persona`**:
  cada uno la resuelve incluyendo sus atributos propios.
- `Matricula` y `Calificacion` **ya existen** de la práctica; se encapsulan
  y quedan relacionadas por composición (`Matricula "1" *-- "1..*"
  Calificacion`): una `Calificacion` no existe fuera de una `Matricula`.
- `Materia` **ya existe** de la práctica; se encapsula y queda asociada
  desde `Matricula` (a `Estudiante`) y desde `Calificacion` (a `Materia`).

**Archivos de este proyecto:** `RolAcademico.java`, `Persona.java`,
`Estudiante.java`, `Profesor.java`, `Matricula.java`, `Calificacion.java`,
`Materia.java`.

```java
package model.domain;

public interface RolAcademico {
    String datosResumen();
    String identificarRol();
}
```

```java
package model.domain;

public abstract class Persona implements RolAcademico {
    private String identificacion;
    private String nombre;
    private String correo;

    public Persona(String identificacion, String nombre, String correo) {
        // TODO: validar que correo contenga '@'
    }

    @Override
    public String datosResumen() {
        // TODO: combinar identificacion, nombre y correo en una cadena
        return null;
    }

    // identificarRol() queda sin resolver: cada subtipo la implementa

    // TODO: getters de identificacion, nombre, correo
}
```

```java
package model.domain;

public class Estudiante extends Persona {
    private String codigo;
    private int semestreActual;

    public Estudiante(String identificacion, String nombre, String correo, String codigo, int semestreActual) {
        super(identificacion, nombre, correo);
        // TODO: asignar codigo y semestreActual
    }

    @Override
    public String identificarRol() {
        // TODO: incluir codigo y semestreActual
        return null;
    }
}
```

```java
package model.domain;

public class Profesor extends Persona {
    private String codigo;
    private String departamento;

    public Profesor(String identificacion, String nombre, String correo, String codigo, String departamento) {
        super(identificacion, nombre, correo);
        // TODO: asignar codigo y departamento
    }

    @Override
    public String identificarRol() {
        // TODO: incluir codigo y departamento
        return null;
    }
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Matricula {
    private Estudiante estudiante;
    private final List<Calificacion> calificaciones;

    public Matricula(Estudiante estudiante) {
        // TODO: validar estudiante no nulo; asignar; inicializar la lista de calificaciones
        this.calificaciones = new ArrayList<>();
    }

    public void agregarCalificacion(Calificacion calificacion) {
        // TODO: agregar calificacion a la lista (composicion: no existe fuera de esta Matricula)
    }

    // TODO: getters de estudiante, calificaciones
}
```

```java
package model.domain;

public class Calificacion {
    private double notaParcial1;
    private double notaParcial2;
    private double notaFinal;
    private String observaciones;
    private Materia materia;

    public Calificacion(double notaParcial1, double notaParcial2, double notaFinal, String observaciones, Materia materia) {
        // TODO: asignar los cinco atributos
    }

    // TODO: getters de notaParcial1, notaParcial2, notaFinal, observaciones, materia
}
```

---

### 5. Liga de Fútbol

Sus cinco clases de la práctica fueron `Jugador`, `Equipo`, `Partido`, `Gol`
y `Arbitro`. Las cinco siguen siendo obligatorias. `Persona` es un archivo
nuevo, igual que en Clínica Veterinaria y Sistema Académico.

```mermaid
classDiagram
  class RolEnPartido {
    <<interface>>
    +datosResumen() String
    +rolEnPartido() String
  }
  class Persona {
    <<abstract>>
    -identificacion : String
    -nombre : String
    +datosResumen() String
  }
  class Jugador {
    -numeroCamiseta : int
    -posicion : String
    -golesTotales : int
    +rolEnPartido() String
  }
  class Arbitro {
    -categoria : String
    +rolEnPartido() String
  }
  class Equipo {
  }
  class Partido {
    -fecha : LocalDate
    -resultado : String
  }
  class Gol {
    -minuto : int
    -tipo : String
  }
  RolEnPartido <|.. Persona
  Persona <|-- Jugador
  Persona <|-- Arbitro
  Equipo "1" *-- "1..*" Jugador
  Partido --> Equipo : equipoLocal
  Partido --> Equipo : equipoVisitante
  Gol --> Jugador
```

**Requisitos de implementación:**
- Todas las clases van en el paquete `model.domain`.
- Atributos `private`; acceso por getters y setters donde el diagrama lo
  requiera.
- `Persona` es un **archivo nuevo** (igual que la interfaz `RolEnPartido`,
  que reemplaza cualquier idea de `EstadisticasJugador` que haya manejado
  antes): el constructor valida que `identificacion` no sea nula ni esté
  vacía.
- `datosResumen()` queda implementado en `Persona`: retorna una cadena que
  combine `identificacion` y `nombre`.
- `Jugador` **ya existe** de la práctica, pero cambia de forma importante:
  ahora extiende `Persona` (deja de tener `identificacion`/`nombre` propios)
  y **deja de ser abstracta** — en este diseño es uno de los dos subtipos
  concretos, no la clase intermedia. Conserva `numeroCamiseta`, `posicion`
  y `golesTotales`. **Elimine el atributo `equipo` de tipo `String` suelto**
  que probablemente tenía en la práctica (el ejemplo guía de la práctica lo
  modeló así): esa relación ahora se resuelve con una composición real hacia
  la clase `Equipo` (ver más abajo), no con un nombre de equipo en texto
  plano. `rolEnPartido()` queda **sin implementar en `Persona`**: `Jugador`
  la resuelve incluyendo `numeroCamiseta`, `posicion` y `golesTotales`.
- `Arbitro` **ya existe** de la práctica, pero antes no participaba de
  ninguna jerarquía: ahora extiende `Persona` y conserva `categoria` como
  atributo propio; resuelve `rolEnPartido()` incluyéndola.
- `Equipo` **ya existe** de la práctica; se encapsula. Un `Jugador` no
  existe fuera de un `Equipo` (composición) — es la relación que reemplaza
  al atributo `equipo:String` que `Jugador` tenía antes.
- `Partido` y `Gol` **ya existen** de la práctica; se encapsulan y quedan
  asociados a `Equipo` (dos veces, como `equipoLocal` y `equipoVisitante`)
  y a `Jugador` respectivamente.

**Archivos de este proyecto:** `RolEnPartido.java`, `Persona.java`,
`Jugador.java`, `Arbitro.java`, `Equipo.java`, `Partido.java`, `Gol.java`.

```java
package model.domain;

public interface RolEnPartido {
    String datosResumen();
    String rolEnPartido();
}
```

```java
package model.domain;

public abstract class Persona implements RolEnPartido {
    private String identificacion;
    private String nombre;

    public Persona(String identificacion, String nombre) {
        // TODO: validar identificacion no nula ni vacia
    }

    @Override
    public String datosResumen() {
        // TODO: combinar identificacion y nombre en una cadena
        return null;
    }

    // rolEnPartido() queda sin resolver: cada subtipo la implementa

    // TODO: getters de identificacion, nombre
}
```

```java
package model.domain;

public class Jugador extends Persona {
    private int numeroCamiseta;
    private String posicion;
    private int golesTotales;

    public Jugador(String identificacion, String nombre, int numeroCamiseta, String posicion) {
        super(identificacion, nombre);
        // TODO: validar numeroCamiseta positivo; asignar posicion; golesTotales inicia en 0
    }

    @Override
    public String rolEnPartido() {
        // TODO: incluir numeroCamiseta, posicion y golesTotales
        return null;
    }

    // TODO: getters de numeroCamiseta, posicion, golesTotales
}
```

```java
package model.domain;

public class Arbitro extends Persona {
    private String categoria;

    public Arbitro(String identificacion, String nombre, String categoria) {
        super(identificacion, nombre);
        // TODO: asignar categoria
    }

    @Override
    public String rolEnPartido() {
        // TODO: incluir categoria
        return null;
    }
}
```

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Equipo {
    private String nombre;
    private final List<Jugador> jugadores;

    public Equipo(String nombre) {
        // TODO: validar nombre no nulo ni vacio; inicializar la lista de jugadores
        this.jugadores = new ArrayList<>();
    }

    public void agregarJugador(Jugador jugador) {
        // TODO: agregar jugador a la lista (composicion: no existe fuera de este Equipo)
    }

    // TODO: getters de nombre, jugadores
}
```

```java
package model.domain;

import java.time.LocalDate;

public class Partido {
    private LocalDate fecha;
    private String resultado;
    private Equipo equipoLocal;
    private Equipo equipoVisitante;

    public Partido(LocalDate fecha, Equipo equipoLocal, Equipo equipoVisitante) {
        // TODO: validar equipoLocal y equipoVisitante distintos; asignar fecha, equipoLocal, equipoVisitante; resultado inicia en "0-0"
    }

    // TODO: getters de fecha, equipoLocal, equipoVisitante, resultado; setter de resultado
}
```

```java
package model.domain;

public class Gol {
    private int minuto;
    private String tipo;
    private Jugador jugador;

    public Gol(int minuto, String tipo, Jugador jugador) {
        // TODO: validar minuto en rango 1-120; asignar tipo y jugador
    }

    // TODO: getters de minuto, tipo, jugador
}
```

---

## Desarrollo del Laboratorio

### Parte 1 — Codifique el diagrama de su proyecto

Parta del repositorio de su equipo con los cinco archivos `.java` de la
práctica de Semana 2 ya en `model/domain/`. Evolucione esos cinco archivos
según el diagrama de su proyecto: encapsule los atributos, agregue
`extends`/`implements` donde corresponda, y complete los métodos que el
diagrama le pide. Cree además los archivos nuevos que su sección indique
(la interfaz siempre es nueva; algunos proyectos también agregan una clase
`Persona` o subtipos concretos que no estaban en la práctica). Respete
exactamente los nombres de clase, atributo y método del diagrama — la
rúbrica evalúa la fidelidad de la codificación al UML entregado, no una
variación libre sobre él.

**Requisitos:**
- Todos los atributos son `private`; el acceso externo es siempre por
  métodos.
- Cada subclase invoca `super(...)` en su constructor.
- El método marcado en la interfaz pero no implementado en la clase
  abstracta queda declarado sin cuerpo en la clase abstracta (el compilador
  obliga a cada subtipo concreto a resolverlo con `@Override`).
- Los setters (donde el diagrama los requiera) validan antes de asignar.
- Las clases de su proyecto que no participan de la interfaz ni de la
  herencia (por ejemplo `Venta`/`ItemVenta`/`Proveedor`/`Pedido` en
  Papelería, o `Cita` en Consultorio Médico) también se entregan
  encapsuladas, con constructor validado y getters/setters — no basta con
  dejarlas como estaban en la práctica.

### Parte 2 — Escriba la clase de prueba

Escriba una clase de prueba, con un método `main`, que:
- Cree al menos una instancia de cada uno de los dos subtipos concretos de
  su proyecto.
- Las agregue a la clase de composición correspondiente (por ejemplo,
  agregue sus `Producto` a una `Venta` a través de `ItemVenta`, o sus
  `Animal` a un `Dueño`).
- Ejercite el método polimórfico (el que quedó sin resolver en la clase
  abstracta) sobre cada instancia **sin usar `instanceof`** — recórralas
  como referencias del tipo abstracto o de la interfaz y deje que cada una
  resuelva su propia versión.
- Imprima por consola el resultado de cada llamada, de modo que se vea en
  pantalla que las dos implementaciones se comportan distinto.

```java
public class PruebaCreacionObjetos {
    public static void main(String[] args) {
        // TODO: construya al menos una instancia de cada subtipo concreto de su proyecto
        // TODO: agreguelas a la clase de composicion correspondiente
        // TODO: recorra las instancias como referencias del tipo abstracto/interfaz
        //       e invoque el metodo polimorfico sin usar instanceof
        // TODO: imprima por consola el resultado de cada llamada
    }
}
```

> **Extensión opcional, no evaluada:** si su equipo ya tiene avanzada la
> coordinación de las capas `service`, `controller` y `view` sobre estas
> clases, puede integrarlas al menú de consola del proyecto. No es requisito
> de este laboratorio ni forma parte de su rúbrica.

---

## Entregable

Estructura de archivos dentro de su repositorio del proyecto de aula (los
nombres exactos de clase dependen de su proyecto — use la lista de
"Archivos de este proyecto" de la sección de su caso de estudio):

```
proyecto-aula/
  src/
    model/
      domain/
        <Interfaz>.java
        <ClaseAbstracta>.java
        <SubtipoConcretoA>.java
        <SubtipoConcretoB>.java
        <...resto de las clases de su proyecto, ya encapsuladas>
    PruebaCreacionObjetos.java
```

**Formato de entrega:** commit sobre la rama de su proyecto de aula, con
mensaje descriptivo (por ejemplo, `feat: codificacion UML momento 1`). No se
entrega por archivo `.zip` aparte — el entregable **es** el estado del
repositorio en esa rama al momento del plazo.

### Ejemplo de archivo de prueba esperado

El docente verifica la Parte 2 ejecutando directamente su
`PruebaCreacionObjetos`. Debe compilar y ejecutar sin errores, mostrando por
consola al menos dos resultados distintos (uno por cada subtipo concreto).

---

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Codificación correcta del UML** | 60 | Las clases, constructores, atributos, métodos, getters y setters, y la relación de herencia coinciden exactamente con el diagrama entregado: las clases ya construidas en la práctica de Semana 2 quedan correctamente extendidas (encapsuladas, con `extends`/`implements` donde corresponda) y las nuevas siguen el mismo patrón; la interfaz declara los métodos del contrato, la clase abstracta implementa solo el método que le corresponde y deja el otro pendiente, y cada subtipo concreto lo resuelve con `@Override` y lógica distinta entre ellos. |
| **Pruebas en el App — creación de objetos** | 20 | `PruebaCreacionObjetos` compila y se ejecuta sin errores, instancia al menos un objeto de cada subtipo concreto, las integra a la clase de composición, y ejercita el método polimórfico sobre cada una sin usar `instanceof`, imprimiendo el resultado por consola. |
| **Buenas prácticas de programación** | 20 | Commits descriptivos y frecuentes (no un único commit al final); uso correcto de ramas (trabajo sobre la rama del proyecto, no directo en `main`); nombres de clases, métodos y variables descriptivos y siguiendo las convenciones de Java (`PascalCase` para clases, `camelCase` para métodos y variables). |
| **TOTAL** | **100** | |

Cada ítem se califica en una escala de **0 a 5**. La nota final del
laboratorio es el promedio ponderado de los tres ítems, escalado al 5 % de
la nota del curso:

```
nota_laboratorio (0-5) = 0.60 × item1 + 0.20 × item2 + 0.20 × item3
nota_final_curso (%)   = (nota_laboratorio / 5) × 5%
```

**Ejemplo:** si obtiene 4.5 en "Codificación correcta del UML", 5 en
"Pruebas en el App" y 4 en "Buenas prácticas":

```
nota_laboratorio = 0.60 × 4.5 + 0.20 × 5 + 0.20 × 4 = 2.7 + 1.0 + 0.8 = 4.5
nota_final_curso = (4.5 / 5) × 5% = 4.5%
```

---

## Dificultades Comunes

### "No sé qué hacer con un método marcado en la interfaz pero no implementado en la clase abstracta"
- Es el comportamiento esperado: la clase abstracta puede dejar métodos de
  la interfaz sin resolver. Simplemente no escriba el método en la clase
  abstracta (o decláralo como `abstract` explícitamente); el compilador
  obliga a cada subclase **concreta** a implementarlo.

### "Mi clase abstracta no compila porque le falta un método"
- Revise si el método faltante es el que el diagrama deja pendiente a
  propósito. Si es así, no lo implemente ahí: impleméntelo en cada
  subclase concreta con `@Override`.

### "No entiendo la multiplicidad de la relación de composición"
- Lea la notación como "del lado del diamante relleno, cuántas instancias
  del otro extremo puede tener". Por ejemplo, `Dueño "1" *-- "1..*" Animal`
  se lee: un `Animal` pertenece exactamente a `1` `Dueño`, y un `Dueño`
  tiene `1` o más `Animal`.

### "¿Puedo cambiar los nombres de las clases o métodos del diagrama?"
- No. La rúbrica evalúa fidelidad al diagrama entregado: use exactamente
  los nombres de clase, atributo y método que aparecen en la sección de su
  proyecto.

### "Mi clase de la práctica tenía un atributo que ya no aparece en el diagrama"
- Revise si ese atributo se reemplazó por una relación de objetos (es el
  caso de `equipo:String` en `Jugador`, del proyecto de Liga de Fútbol,
  reemplazado por la composición con `Equipo`). Si el diagrama de su
  sección no lo menciona, elimínelo: la fidelidad al diagrama entregado
  incluye no dejar atributos de más.

---

## Extensiones Sugeridas (Bonus)

- Escribir una segunda clase de prueba que recorra un arreglo o lista de
  referencias del tipo abstracto/interfaz, mezclando instancias de los dos
  subtipos concretos, como en el laboratorio de la Semana 3.
- Adelantar la integración de estas clases con las capas `service`,
  `controller` y `view` de su proyecto de aula (no evaluado en este
  laboratorio).

---

## Recursos

- **Lecciones del curso:** "Encapsulamiento", "Herencia", "Polimorfismo",
  "Introducción al UML", "Composición, agregación y diagramas de
  paquetes".
- **Práctica anterior:** "Práctica en clase — Modela una clase de tu
  proyecto de aula" (Semana 2), donde escribió las cinco clases que este
  laboratorio evoluciona.
- **Guía anterior:** "Laboratorio — Jerarquía de Clases de Tres Niveles y
  Polimorfismo", donde practicó la lectura de un diagrama de clases similar.
- **Guía de proyecto:** "Guía — Elección del proyecto de aula", para
  confirmar cuál de los cinco casos de estudio le corresponde.

**Plazo de entrega:** antes de finalizar la sesión del viernes 28 de
agosto (bloque de laboratorio evaluativo ★ M1).
