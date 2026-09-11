# Quiz — Clases, objetos y relaciones entre clases

> Curso: **Estructuras de datos** · Momento: **Quiz POO (5%)**
> 10 preguntas de selección múltiple con única respuesta · Total: **5.0 puntos**
> Tiempo: **2 horas** desde que se abre el intento (envío automático al cumplirse).
>
> Cada estudiante recibe **una sola** de las tres variantes, asignada al azar por
> la plataforma. Las tres evalúan los mismos conceptos con la misma dificultad,
> cambiando el caso de aplicación.
>
> ⚠️ Este documento **no incluye la clave de respuestas** — el repositorio es
> público. La clave se consulta en el panel de la evaluación.
> En la plataforma el orden de preguntas y de opciones se baraja por estudiante,
> así que no coincide con el de este documento.

---

## Variante A

_Caso de aplicación: sistema de biblioteca_

### A1. (0.2 pts · dificultad 1/5)

```java
public class Libro {
    String titulo;
    String autor;
    boolean disponible;

    void prestar() {
        disponible = false;
    }
}
```
En esta clase `Libro`, ¿cuáles elementos son atributos y cuál es un método?

- **a)** `titulo`, `autor` y `disponible` son atributos (guardan datos del objeto); `prestar()` es un método (comportamiento que puede ejecutar)
- **b)** `disponible` es un método porque cambia de valor cuando se ejecuta `prestar()`; los demás son atributos
- **c)** No hay diferencia entre atributo y método en Java: ambos son "campos" de la clase
- **d)** Los tres (`titulo`, `autor`, `disponible`) son métodos porque están declarados dentro de la clase; `prestar()` es un atributo especial de control

### A2. (0.4 pts · dificultad 2/5)

```java
public class Socio {
    private String numeroCarnet;

    public String getNumeroCarnet() {
        return numeroCarnet;
    }
}
```
Desde la clase `Bibliotecario`, ubicada en otro paquete, ¿a cuál de los dos puede accederse: al atributo `numeroCarnet` o al método `getNumeroCarnet()`?

- **a)** A ninguno: al haber un atributo `private` en la clase, el método también queda restringido
- **b)** Solo a `getNumeroCarnet()`: `public` lo hace visible desde cualquier clase del programa, mientras que `private` restringe `numeroCarnet` a la propia clase `Socio`
- **c)** Solo a `numeroCarnet`, porque los atributos siempre son accesibles desde otras clases y los métodos requieren herencia
- **d)** A ambos, porque `getNumeroCarnet()` es público y, al devolver `numeroCarnet`, vuelve público también al atributo

### A3. (0.6 pts · dificultad 3/5)

Un compañero de equipo propone estos dos métodos dentro de la misma clase `Prestamo` para "sobrecargar" `registrar`:

```java
public void registrar(String socio) { ... }
public int registrar(String socio) { ... }
```

¿Compila esto como una sobrecarga válida?

- **a)** No, porque un método no puede llamarse igual que el atributo `socio` de la clase
- **b)** No — Java distingue métodos sobrecargados por su lista de parámetros, no por el tipo de retorno; con parámetros idénticos (`String socio` en ambos), esto es un error de compilación por método duplicado
- **c)** Sí — Java permite dos métodos con el mismo nombre y los mismos parámetros siempre que difieran en el tipo de retorno
- **d)** Sí, pero solo si uno de los dos métodos se declara `static`

### A4. (0.4 pts · dificultad 2/5)

El sistema de biblioteca necesita dos datos nuevos en la clase `Libro`: (1) cuántos libros distintos se han registrado en total desde que arrancó el programa, y (2) si un ejemplar concreto está `disponible` en este momento. ¿Cuál de los dos debería declararse `static`?

- **a)** Ninguno debe ser `static`: los contadores globales no existen en Java, cada objeto debe llevar su propia copia del total
- **b)** Solo el contador total de libros registrados: describe a la clase como concepto, no a un libro en particular; `disponible` debe seguir siendo un atributo de instancia porque varía de un ejemplar a otro
- **c)** Solo `disponible`, porque cambia con más frecuencia que el contador total
- **d)** Ambos deben ser `static`, porque así se accede a los dos con `Libro.dato` sin necesitar un objeto

### A5. (0.4 pts · dificultad 2/5)

En un diagrama de clases ves `#codigoSocio: String` dentro del recuadro de `Socio`. ¿Qué modificador de Java representa el símbolo `#`, y qué visibilidad implica?

- **a)** `public` — visible desde cualquier parte del programa
- **b)** `protected` — visible dentro del mismo paquete y, además, en cualquier subclase de `Socio`, sin importar su paquete
- **c)** No corresponde a ningún modificador de Java: `#` es solo una marca visual sin equivalente en código
- **d)** `private` — visible únicamente dentro de la propia clase `Socio`

### A6. (0.6 pts · dificultad 3/5)

`Prestamo` declara `public void devolver()`. Su subclase `PrestamoDigital` intenta sobreescribirlo así:

```java
@Override
public void devolver(String observacion) {
    // ...
}
```

¿Qué ocurre al compilar `PrestamoDigital`?

- **a)** Error de compilación: `@Override` obliga a que la firma coincida exactamente con la del método heredado; como esta versión agrega un parámetro `String observacion`, no está sobreescribiendo nada — es una sobrecarga nueva, no una sobreescritura, y `@Override` lo detecta y lo rechaza
- **b)** Compila y, al invocar `devolver()` sin argumentos sobre un `PrestamoDigital`, se ejecuta la versión con `observacion` usando `null` por defecto
- **c)** Compila sin problema: `@Override` solo exige que el nombre del método coincida, los parámetros pueden variar libremente
- **d)** Compila, y ahora `Prestamo` queda con dos versiones de `devolver()` disponibles para cualquier objeto `PrestamoDigital`, según se llame con o sin argumento

### A7. (0.4 pts · dificultad 2/5)

```java
public abstract class RecursoBibliografico {
    protected String titulo;

    public abstract double calcularMultaAtraso(int diasAtraso);

    public String getTitulo() {
        return titulo;
    }
}

public class Libro extends RecursoBibliografico {
    // no declara calcularMultaAtraso()
}
```
¿Cuál afirmación describe correctamente lo que pasa al intentar compilar y usar este código?

- **a)** Ambas clases compilan sin problema: `Libro` hereda automáticamente un cuerpo vacío para `calcularMultaAtraso()`, igual que con cualquier otro método heredado
- **b)** El único problema está en `Libro`; `RecursoBibliografico` sí podría instanciarse porque su método abstracto es `public`, no `private`
- **c)** `new RecursoBibliografico()` no compila porque es una clase `abstract`; y `Libro`, tal como está, tampoco compila porque hereda un método `abstract` (`calcularMultaAtraso`) que ninguna clase concreta puede dejar sin implementar
- **d)** `new RecursoBibliografico()` sí compila, porque la clase tiene un atributo y un método (`getTitulo()`) con implementación completa

### A8. (0.6 pts · dificultad 3/5)

```java
public interface Prestable {
    void prestar();
    void devolver();
}

public interface Reservable {
    void reservar();
}

public class Libro extends RecursoBibliografico implements Prestable, Reservable {
    // implementa los tres metodos de las interfaces
}
```
¿Cuál afirmación sobre esta declaración de `Libro` es correcta?

- **a)** Como `Libro` ya extiende una clase (`RecursoBibliografico`), no le queda permitido implementar ninguna interfaz adicional
- **b)** `Prestable` y `Reservable` le aportan a `Libro` atributos heredados (como un `disponible` interno), de la misma forma que lo haría una clase abstracta
- **c)** `Libro` puede implementar varias interfaces (`Prestable` y `Reservable`) a la vez, aunque solo puede extender una única superclase (`RecursoBibliografico`); las interfaces no aportan atributos, solo el contrato de métodos que `Libro` debe implementar
- **d)** Java no permite implementar más de una interfaz al mismo tiempo; este código no compilaría por declarar `Prestable, Reservable` juntas

### A9. (0.6 pts · dificultad 3/5)

```java
public class Sede {
    private String direccion;
    private List<Socio> socios;

    public Sede(String direccion) {
        this.direccion = direccion;
        this.socios = new ArrayList<>();
    }

    public void registrarSocio(Socio socio) {
        socios.add(socio);   // el Socio ya existia antes de registrarlo
    }
}
```
Si se elimina el objeto `Sede`, ¿qué ocurre con los objetos `Socio` que había registrado, y qué relación UML es esta?

- **a)** Asociación — porque `Sede` guarda una referencia a cada `Socio`, igual que cualquier otro atributo de tipo objeto
- **b)** Agregación — los `Socio`s siguen existiendo de forma independiente (pueden trasladarse a otra `Sede`); `Sede` los reúne en una colección, pero nunca los creó con `new` ni controla su ciclo de vida
- **c)** Composición — al eliminar `Sede`, sus `Socio`s deberían eliminarse también, porque `registrarSocio` los agrega a una lista propia de la sede
- **d)** No hay ninguna relación UML porque `List<Socio>` es una estructura de datos de Java, no una clase del dominio del proyecto

### A10. (0.8 pts · dificultad 4/5)

```java
public class Prestamo {
    private String codigo;
    private List<Renovacion> renovaciones;

    public Prestamo(String codigo) {
        this.codigo = codigo;
        this.renovaciones = new ArrayList<>();
    }

    public void renovar(int diasExtra) {
        renovaciones.add(new Renovacion(diasExtra));   // Prestamo la crea
    }
}
```
Si el diagrama de clases se dibuja como `Prestamo "1" *-- "0..*" Renovacion`, ¿qué combinación de afirmaciones es correcta?

- **a)** Es agregación porque `renovaciones` se guarda en una `List`, y toda relación uno-a-muchos con una colección es agregación por definición
- **b)** Es composición, pero la multiplicidad `"0..*"` está mal: debería ser `"1..*"`, porque un préstamo sin ninguna renovación no tendría sentido como objeto
- **c)** Es asociación, porque `Renovacion` podría, en teoría, reutilizarse en otro `Prestamo` distinto más adelante
- **d)** Es composición porque `Prestamo` crea sus propias `Renovacion`es con `new` y nadie más las conserva si el `Prestamo` se elimina; la multiplicidad `"0..*"` indica que un préstamo puede empezar sin ninguna renovación registrada

---

## Variante B

_Caso de aplicación: taller mecánico_

### B1. (0.2 pts · dificultad 1/5)

```java
public class Vehiculo {
    String placa;
    int kilometraje;

    void registrarIngreso() {
        System.out.println(placa + " ingreso al taller");
    }
}
```
En esta clase `Vehiculo`, ¿cuáles elementos son atributos y cuál es un método?

- **a)** `registrarIngreso()` es un atributo especial de tipo texto porque imprime una cadena; `placa` y `kilometraje` son métodos
- **b)** `placa` es un método porque se usa dentro de `registrarIngreso()`; `kilometraje` es el único atributo real
- **c)** Todo lo declarado con tipo (`String`, `int`, `void`) es atributo; solo lo que no tiene tipo es método
- **d)** `placa` y `kilometraje` son atributos (datos del objeto); `registrarIngreso()` es un método (comportamiento)

### B2. (0.4 pts · dificultad 2/5)

```java
public class Mecanico {
    private String documento;

    public String getDocumento() {
        return documento;
    }
}
```
Desde la clase `OrdenDeTrabajo`, ubicada en otro paquete, ¿qué puede hacerse con un objeto `Mecanico`?

- **a)** Puede llamarse `mecanico.getDocumento()`, pero no escribirse `mecanico.documento`: `public` abre el método a todo el programa y `private` limita el atributo a la clase `Mecanico`
- **b)** No puede usarse ninguno de los dos, porque un método `public` que devuelve un dato privado se vuelve inaccesible
- **c)** Pueden usarse ambos mientras se esté en el mismo proyecto: `private` solo bloquea el acceso desde proyectos externos
- **d)** Puede escribirse `mecanico.documento` directamente, pero no llamarse `getDocumento()`, porque los getters solo se invocan desde la propia clase

### B3. (0.6 pts · dificultad 3/5)

Un compañero de equipo propone estos dos métodos dentro de la misma clase `OrdenDeTrabajo` para "sobrecargar" `registrar`:

```java
public void registrar(double costo) { ... }
public boolean registrar(double costo) { ... }
```

¿Compila esto como una sobrecarga válida?

- **a)** Sí, siempre que se llamen desde clases distintas
- **b)** No, porque `costo` debería llamarse diferente en cada método para poder sobrecargar
- **c)** No — el tipo de retorno (`void` vs. `boolean`) no es un criterio de sobrecarga en Java; con la misma lista de parámetros (`double costo`), el compilador lo trata como un método duplicado
- **d)** Sí, porque `void` y `boolean` son tipos incompatibles y eso basta para que el compilador los distinga

### B4. (0.4 pts · dificultad 2/5)

El taller necesita dos datos nuevos en la clase `Vehiculo`: (1) cuántos vehículos distintos han ingresado al taller en total, y (2) el `kilometraje` actual de un vehículo concreto. ¿Cuál de los dos debería declararse `static`?

- **a)** Solo el contador total de ingresos: describe al taller como concepto, no a un vehículo en particular; `kilometraje` debe seguir siendo de instancia porque cada vehículo tiene el suyo
- **b)** Solo `kilometraje`, porque es un número que cambia constantemente y `static` sirve para datos que cambian mucho
- **c)** Ninguno: un contador de vehículos ingresados no puede implementarse con atributos de clase, se necesita una base de datos externa
- **d)** Ambos, porque cualquier atributo numérico puede declararse `static` sin problema

### B5. (0.4 pts · dificultad 2/5)

En un diagrama de clases ves `#placa: String` dentro del recuadro de `Vehiculo`. ¿Qué modificador de Java representa el símbolo `#`, y qué visibilidad implica?

- **a)** `protected` — visible dentro del mismo paquete y en cualquier subclase de `Vehiculo`, sin importar su paquete
- **b)** Visibilidad de paquete (sin modificador), porque `#` no aparece explícitamente en la tabla de modificadores de Java vista en Encapsulamiento
- **c)** `private`, igual que `-`, porque ambos símbolos restringen el acceso de alguna forma
- **d)** `public`, porque el símbolo `#` recuerda a una reja abierta que deja pasar a cualquiera

### B6. (0.6 pts · dificultad 3/5)

`Vehiculo` declara `public double calcularSoat()`. Su subclase `Motocicleta` intenta sobreescribirlo así:

```java
@Override
public int calcularSoat() {
    // ...
}
```

¿Qué ocurre al compilar `Motocicleta`?

- **a)** Error de compilación: `@Override` exige que la firma coincida con la heredada, incluido el tipo de retorno (o un subtipo compatible); cambiar `double` por `int` rompe esa coincidencia y el compilador lo rechaza de inmediato
- **b)** `@Override` no revisa tipos de retorno, solo nombres de método, así que esto es una sobrecarga válida de `calcularSoat`
- **c)** Compila, porque `int` puede convertirse a `double` automáticamente en Java, así que el compilador acepta el cambio como válido
- **d)** Compila sin advertencias, y `Vehiculo` simplemente ignora la versión de `Motocicleta` en tiempo de ejecución

### B7. (0.4 pts · dificultad 2/5)

```java
public abstract class Servicio {
    protected String descripcion;

    public abstract double calcularCosto();

    public String getDescripcion() {
        return descripcion;
    }
}

public class ManoDeObra extends Servicio {
    // no declara calcularCosto()
}
```
¿Cuál afirmación describe correctamente lo que pasa al intentar compilar y usar este código?

- **a)** Solo falla `ManoDeObra`; `Servicio` sí puede instanciarse porque declara un atributo `protected` accesible desde afuera del paquete
- **b)** `ManoDeObra` compila si se le agrega un constructor propio, sin necesidad de implementar `calcularCosto()`
- **c)** `new Servicio()` no compila porque es `abstract`; y `ManoDeObra` tampoco compila porque no implementó el método `abstract` heredado (`calcularCosto`), obligatorio para cualquier subclase concreta
- **d)** Ambas clases compilan: Java asigna a `calcularCosto()` una implementación por defecto que retorna `0.0` cuando la subclase no la sobreescribe

### B8. (0.6 pts · dificultad 3/5)

```java
public interface Facturable {
    double calcularValorFactura();
}

public interface Garantizable {
    int diasDeGarantia();
}

public class ManoDeObra extends Servicio implements Facturable, Garantizable {
    // implementa los tres metodos
}
```
¿Cuál afirmación sobre esta declaración de `ManoDeObra` es correcta?

- **a)** Solo es válido implementar dos interfaces si ambas provienen de la misma superclase
- **b)** Al implementar dos interfaces distintas, `ManoDeObra` queda obligada a elegir cuál de las dos "gana" en caso de que compartan algún método con el mismo nombre
- **c)** `ManoDeObra` puede implementar varias interfaces (`Facturable` y `Garantizable`) a la vez, mientras que solo puede extender una superclase (`Servicio`); las interfaces definen el contrato de métodos, sin aportar atributos propios
- **d)** `Garantizable` le da a `ManoDeObra` un atributo `diasGarantia` ya inicializado en 0, que la subclase puede sobreescribir

### B9. (0.6 pts · dificultad 3/5)

```java
public class Sucursal {
    private String direccion;
    private List<Mecanico> mecanicos;

    public Sucursal(String direccion) {
        this.direccion = direccion;
        this.mecanicos = new ArrayList<>();
    }

    public void asignarMecanico(Mecanico mecanico) {
        mecanicos.add(mecanico);   // el Mecanico ya existia antes de asignarlo
    }
}
```
Si se elimina el objeto `Sucursal`, ¿qué ocurre con los objetos `Mecanico` que tenía asignados, y qué relación UML es esta?

- **a)** No aplica ninguna relación porque `asignarMecanico` es un método, no un atributo
- **b)** Agregación — los `Mecanico`s siguen existiendo de forma independiente (pueden trasladarse a otra `Sucursal`); `Sucursal` los reúne, pero nunca los creó ni controla su ciclo de vida
- **c)** Asociación simple — porque técnicamente solo se está guardando una lista de referencias, sin ninguna semántica especial de "tener un"
- **d)** Composición — porque un `Mecanico` sin `Sucursal` asignada no tiene sentido operativo dentro del sistema del taller

### B10. (0.8 pts · dificultad 4/5)

```java
public class OrdenDeTrabajo {
    private String numero;
    private List<RepuestoUsado> repuestosUsados;

    public OrdenDeTrabajo(String numero) {
        this.numero = numero;
        this.repuestosUsados = new ArrayList<>();
    }

    public void registrarRepuesto(String nombre, double costo) {
        repuestosUsados.add(new RepuestoUsado(nombre, costo));   // la Orden lo crea
    }
}
```
Si el diagrama de clases se dibuja como `OrdenDeTrabajo "1" *-- "0..*" RepuestoUsado`, ¿qué combinación de afirmaciones es correcta?

- **a)** Es composición porque `OrdenDeTrabajo` crea cada `RepuestoUsado` con `new` dentro de su propio método, y ninguno sobrevive fuera de esa orden; la multiplicidad `"0..*"` permite una orden sin repuestos registrados todavía
- **b)** Es agregación, porque un mismo tipo de repuesto (por ejemplo, "filtro de aceite") puede usarse en muchas órdenes de trabajo distintas a lo largo del tiempo
- **c)** Es asociación, porque `registrarRepuesto` recibe `nombre` y `costo` como parámetros simples, no un objeto `RepuestoUsado` ya construido
- **d)** Es composición, pero la multiplicidad correcta sería `"1..*"`, ya que registrar una orden sin repuestos no tendría ningún propósito

---

## Variante C

_Caso de aplicación: plataforma universitaria_

### C1. (0.2 pts · dificultad 1/5)

```java
public class Estudiante {
    String codigo;
    double promedio;

    void inscribir(String materia) {
        System.out.println(codigo + " inscrito en " + materia);
    }
}
```
En esta clase `Estudiante`, ¿cuáles elementos son atributos y cuál es un método?

- **a)** `materia` es un atributo de `Estudiante` porque aparece dentro de la clase; `codigo` y `promedio` son métodos
- **b)** Los atributos y métodos son intercambiables en Java: cualquiera podría reescribirse como el otro sin cambiar el comportamiento del programa
- **c)** `codigo` y `promedio` son atributos (datos del objeto); `inscribir(String materia)` es un método (comportamiento)
- **d)** `inscribir` es un atributo porque no devuelve ningún valor (`void`); `codigo` y `promedio` son métodos porque sí "devuelven" su valor al leerse

### C2. (0.4 pts · dificultad 2/5)

```java
public class Docente {
    private double salario;

    public void asignarCurso(String curso) {
        // ...
    }
}
```
Desde la clase `Facultad`, ubicada en otro paquete, se escribe:

```java
Docente d = new Docente();
d.asignarCurso("Estructuras de Datos");
d.salario = 5000000;
```
¿Qué ocurre al compilar?

- **a)** La llamada a `asignarCurso(...)` compila porque es `public` y es visible desde cualquier clase, pero `d.salario = 5000000;` falla porque `salario` es `private` y solo es accesible dentro de la propia clase `Docente`
- **b)** Falla todo: si una clase tiene al menos un atributo `private`, ninguno de sus métodos puede invocarse desde fuera
- **c)** Compila todo: al crear el objeto con `new` desde `Facultad`, sus miembros privados quedan accesibles para quien lo creó
- **d)** `d.salario = 5000000;` compila, pero `asignarCurso(...)` falla porque los métodos `public` exigen que la clase se declare `public static`

### C3. (0.6 pts · dificultad 3/5)

Un compañero de equipo propone estos dos métodos dentro de la misma clase `Matricula` para "sobrecargar" `matricular`:

```java
public void matricular(String materia) { ... }
public String matricular(String materia) { ... }
```

¿Compila esto como una sobrecarga válida?

- **a)** Sí, porque uno devuelve `void` y el otro devuelve un valor concreto, y esa es justamente la señal que usa el compilador para elegir cuál ejecutar
- **b)** No — ambos métodos tienen exactamente la misma lista de parámetros (`String materia`); el tipo de retorno distinto (`void` vs. `String`) no alcanza para que Java los considere métodos diferentes
- **c)** No, porque una clase solo puede tener un método público por nombre
- **d)** Sí, si se agrega la anotación `@Override` a uno de los dos métodos

### C4. (0.4 pts · dificultad 2/5)

La universidad necesita dos datos nuevos en la clase `Estudiante`: (1) cuántos estudiantes distintos se han registrado en el sistema en total, y (2) el `promedio` académico de un estudiante concreto. ¿Cuál de los dos debería declararse `static`?

- **a)** Solo `promedio`, porque un promedio es un valor `double` y los `double` deben declararse `static` por convención en Java
- **b)** Ninguno: el total de estudiantes registrados solo puede calcularse recorriendo una lista completa cada vez que se necesita, nunca con un contador
- **c)** Solo el contador total de estudiantes registrados: describe al sistema como concepto, no a un estudiante en particular; `promedio` debe seguir siendo de instancia porque cada estudiante tiene el suyo
- **d)** Ambos, porque así cualquier clase del proyecto puede leerlos sin necesitar un objeto `Estudiante` ya creado

### C5. (0.4 pts · dificultad 2/5)

En un diagrama de clases ves `#codigo: String` dentro del recuadro de `Estudiante`. ¿Qué modificador de Java representa el símbolo `#`, y qué visibilidad implica?

- **a)** `protected` — visible dentro del mismo paquete y en cualquier subclase de `Estudiante`, sin importar su paquete
- **b)** `public`, porque en algunos lenguajes `#` se usa para comentarios y por lo tanto no restringe nada
- **c)** No existe una `EstudianteSubclase` en este diagrama, así que `#` se comporta exactamente igual que `-` mientras no haya herencia
- **d)** `private`, porque cualquier atributo que empiece con un símbolo distinto de `+` debe tratarse como privado por seguridad

### C6. (0.6 pts · dificultad 3/5)

`Matricula` declara `public double calcularCosto()`. Su subclase `MatriculaPosgrado` intenta sobreescribirlo así:

```java
@Override
public double calcularCosto(double descuento) {
    // ...
}
```

¿Qué ocurre al compilar `MatriculaPosgrado`?

- **a)** Compila sin errores porque el tipo de retorno (`double`) sigue siendo idéntico al de la superclase, y eso es lo único que valida `@Override`
- **b)** Error de compilación: al agregar el parámetro `double descuento`, la firma ya no coincide con la heredada; `@Override` detecta que esto no es una sobreescritura y rechaza la compilación
- **c)** Compila, y `MatriculaPosgrado` queda con `calcularCosto()` inaccesible desde fuera de la clase a partir de ese momento
- **d)** Compila, y Java trata automáticamente el nuevo parámetro `descuento` como opcional, asignándole `0.0` cuando no se indica

### C7. (0.4 pts · dificultad 2/5)

```java
public abstract class Evaluacion {
    protected String tema;

    public abstract double calcularNota();

    public String getTema() {
        return tema;
    }
}

public class Parcial extends Evaluacion {
    // no declara calcularNota()
}
```
¿Cuál afirmación describe correctamente lo que pasa al intentar compilar y usar este código?

- **a)** El error solo ocurre en tiempo de ejecución, cuando se intenta llamar a `calcularNota()` sobre un objeto `Parcial` ya creado
- **b)** `new Evaluacion()` no compila porque es `abstract`; y `Parcial` tampoco compila porque no implementó `calcularNota()`, el método `abstract` que hereda y que toda subclase concreta está obligada a definir
- **c)** `Parcial` compila igual, porque en Java toda subclase hereda automáticamente el cuerpo del método `abstract` de su superclase, aunque esté vacío
- **d)** `new Evaluacion()` compila si se le pasa `null` como argumento al constructor por defecto

### C8. (0.6 pts · dificultad 3/5)

```java
public interface Calificable {
    void asignarNota(double nota);
}

public interface Reprogramable {
    void reprogramar(String nuevaFecha);
}

public class Parcial extends Evaluacion implements Calificable, Reprogramable {
    // implementa los tres metodos
}
```
¿Cuál afirmación sobre esta declaración de `Parcial` es correcta?

- **a)** `Parcial` puede implementar varias interfaces (`Calificable` y `Reprogramable`) a la vez, aunque solo puede extender una superclase (`Evaluacion`); las interfaces solo aportan el contrato de métodos, no atributos
- **b)** `Calificable` y `Reprogramable` deben implementarse en clases separadas: una clase de Java no puede combinar dos interfaces distintas
- **c)** Implementar `Reprogramable` obliga a que `Parcial` también extienda una clase llamada `Reprogramable`, además de implementar la interfaz
- **d)** Como `Evaluacion` ya es una clase concreta con estado, `Parcial` no puede además implementar interfaces

### C9. (0.6 pts · dificultad 3/5)

```java
public class Facultad {
    private String nombre;
    private List<Docente> docentes;

    public Facultad(String nombre) {
        this.nombre = nombre;
        this.docentes = new ArrayList<>();
    }

    public void vincularDocente(Docente docente) {
        docentes.add(docente);   // el Docente ya existia antes de vincularlo
    }
}
```
Si se elimina el objeto `Facultad`, ¿qué ocurre con los objetos `Docente` que tenía vinculados, y qué relación UML es esta?

- **a)** Agregación — los `Docente`s siguen existiendo de forma independiente (pueden vincularse a otra `Facultad`); `Facultad` los reúne en una colección, pero nunca los creó con `new`
- **b)** Depende de si `docentes` se declara `final` o no
- **c)** Composición — porque `vincularDocente` construye el vínculo dentro del propio código de `Facultad`, así que la relación "nace" ahí
- **d)** Asociación — porque cada `Docente` solo guarda, a lo sumo, una referencia hacia su `Facultad` actual

### C10. (0.8 pts · dificultad 4/5)

```java
public class Matricula {
    private String codigo;
    private List<PagoCuota> pagos;

    public Matricula(String codigo) {
        this.codigo = codigo;
        this.pagos = new ArrayList<>();
    }

    public void registrarPago(double monto) {
        pagos.add(new PagoCuota(monto));   // la Matricula lo crea
    }
}
```
Si el diagrama de clases se dibuja como `Matricula "1" *-- "0..*" PagoCuota`, ¿qué combinación de afirmaciones es correcta?

- **a)** Es asociación, porque `PagoCuota` podría, en teoría, transferirse a otra `Matricula` si el estudiante cambia de programa
- **b)** Es agregación, porque los pagos se van acumulando con el tiempo y ese "ir creciendo" es justo la definición de agregación frente a composición
- **c)** Es composición porque `Matricula` crea cada `PagoCuota` con `new` dentro de su propio método y ninguno existe fuera de esa matrícula; la multiplicidad `"0..*"` permite una matrícula recién creada sin pagos registrados todavía
- **d)** Es composición, pero con multiplicidad `"1..*"`, porque toda matrícula debería tener al menos un pago desde su creación

---
