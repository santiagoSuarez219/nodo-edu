> Sesión evaluativa (Momento 1, 15 %). Se resuelve aquí el Sistema Bancario
> completo, como referencia de lo que cada equipo debe producir sobre su
> propio caso de estudio: el diagrama UML de las cuatro capas (`view` /
> `controller` / `service` / `model`) del proyecto tal como está hoy, y su
> implementación en Java con encapsulamiento, herencia y polimorfismo.
> Proyectar el diagrama completo primero, después bajar capa por capa hasta
> el menú de consola funcional.

## Paso 1 — Diagrama de paquetes: las cuatro capas

Antes del detalle de clases, ubicar cada paquete y quién depende de quién.
Flecha = "conoce a / llama a".

```mermaid
flowchart TB
  subgraph View["view"]
    MenuPrincipal["MenuPrincipal"]
  end
  subgraph Controller["controller"]
    BancoController["BancoController"]
  end
  subgraph Service["service"]
    ClienteService["ClienteService"]
    CuentaService["CuentaService"]
  end
  subgraph Model["model"]
    subgraph Domain["domain"]
      Cliente["Cliente"]
      Cuenta["Cuenta (TAD)"]
    end
    subgraph Structures["structures"]
      Vacio["(vacio en este sprint)"]
    end
  end
  View --> Controller
  Controller --> Service
  Service --> Domain
```

Punto a resaltar: `model/structures/` existe como paquete desde ya (así lo
pide la estructura de carpetes de la Semana 1), pero queda vacío hasta el
Sprint 2 — el diagrama de paquetes no miente sobre el estado real del
proyecto, y eso también se evalúa.

## Paso 2 — Diagrama de clases del dominio: el TAD `Cuenta`

Este es el plano de referencia que se va a reutilizar todo el semestre.
Muestra la interfaz (el TAD, contrato de la Semana 4 T2), la jerarquía de
`Cuenta` y la relación de composición con `Cliente`.

```mermaid
classDiagram
  class OperacionesCuenta {
    <<interface>>
    +depositar(monto: double) void
    +retirar(monto: double) void
    +consultarSaldo() double
  }
  class Cuenta {
    <<abstract>>
    -numeroCuenta : String
    -saldo : double
    -fechaApertura : LocalDate
    +depositar(monto: double) void
    +consultarSaldo() double
    #debitar(monto: double) void
  }
  class CuentaAhorros {
    -tasaInteres : double
    +retirar(monto: double) void
  }
  class CuentaCorriente {
    -cupoSobregiro : double
    +retirar(monto: double) void
  }
  class Cliente {
    -identificacion : String
    -nombre : String
    -telefono : String
    -direccion : String
    +agregarCuenta(cuenta: Cuenta) void
  }
  OperacionesCuenta <|.. Cuenta
  Cuenta <|-- CuentaAhorros
  Cuenta <|-- CuentaCorriente
  Cliente "1" *-- "1..*" Cuenta
```

Puntos a resaltar mientras se proyecta:

- **`OperacionesCuenta <|.. Cuenta`** es realización (línea punteada): el
  TAD se define primero como contrato, después `Cuenta` lo implementa —
  el puente diseño OO → TAD de la T2.
- **`Cuenta <|-- CuentaAhorros`** y su hermana son herencia (línea sólida):
  la jerarquía de dos niveles ya vista en el laboratorio de la Semana 3.
- **`Cliente "1" *-- "1..*" Cuenta`** es composición: el diamante relleno
  del lado de `Cliente`, más la multiplicidad "una cuenta pertenece
  exactamente a un cliente y no sobrevive fuera de él" — distinto de una
  agregación, donde la parte podría existir sin el todo.
- `retirar()` no aparece en `Cuenta`: la interfaz lo exige, pero cada
  subtipo lo implementa con su propia regla (sin sobregiro vs. con cupo).
  Eso es lo que hace `Cuenta` abstracta sin necesidad de la palabra clave
  `abstract` sobre el método — ya está pendiente por herencia de interfaz.

## Paso 3 — El TAD `OperacionesCuenta`

```java
package model.domain;

public interface OperacionesCuenta {
    void depositar(double monto);
    void retirar(double monto);
    double consultarSaldo();
}
```

Contrato de tres operaciones. Cualquier tipo de cuenta que exista en el
sistema, presente o futuro, tiene que poder responder a las tres.

## Paso 4 — `Cuenta`, clase abstracta que implementa el TAD

```java
package model.domain;

import java.time.LocalDate;

public abstract class Cuenta implements OperacionesCuenta {
    private final String numeroCuenta;
    private double saldo;
    private final LocalDate fechaApertura;

    public Cuenta(String numeroCuenta, double saldoInicial) {
        if (saldoInicial < 0) {
            // Validacion en el constructor: nunca se construye una
            // cuenta con saldo negativo, sin importar el subtipo.
            throw new IllegalArgumentException("El saldo inicial no puede ser negativo");
        }
        this.numeroCuenta = numeroCuenta;
        this.saldo = saldoInicial;
        this.fechaApertura = LocalDate.now();
    }

    @Override
    public void depositar(double monto) {
        // Depositar es igual para cualquier cuenta: se resuelve una sola
        // vez aqui y las subclases lo heredan sin sobreescribirlo.
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto a depositar debe ser positivo");
        }
        this.saldo += monto;
    }

    @Override
    public double consultarSaldo() {
        return saldo;
    }

    protected void debitar(double monto) {
        // 'protected': solo las subclases pueden mover saldo directamente,
        // despues de que cada una valido su propia regla de retiro.
        this.saldo -= monto;
    }

    protected double getSaldo() {
        return saldo;
    }

    public String getNumeroCuenta() {
        return numeroCuenta;
    }

    public LocalDate getFechaApertura() {
        return fechaApertura;
    }
}
```

Punto a resaltar: `retirar()` no se escribe aquí. `Cuenta` sigue siendo
abstracta porque deja sin resolver un método de la interfaz — el
compilador obliga a que cada subclase concreta lo implemente.

## Paso 5 — `CuentaAhorros` y `CuentaCorriente`, la implementación polimórfica

```java
package model.domain;

public class CuentaAhorros extends Cuenta {
    private double tasaInteres;

    public CuentaAhorros(String numeroCuenta, double saldoInicial, double tasaInteres) {
        super(numeroCuenta, saldoInicial);
        this.tasaInteres = tasaInteres;
    }

    @Override
    public void retirar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser positivo");
        }
        if (monto > getSaldo()) {
            // Regla propia de la cuenta de ahorros: no hay sobregiro.
            throw new IllegalStateException("Saldo insuficiente: las cuentas de ahorro no permiten sobregiro");
        }
        debitar(monto);
    }

    public double getTasaInteres() {
        return tasaInteres;
    }
}
```

```java
package model.domain;

public class CuentaCorriente extends Cuenta {
    private double cupoSobregiro;

    public CuentaCorriente(String numeroCuenta, double saldoInicial, double cupoSobregiro) {
        super(numeroCuenta, saldoInicial);
        this.cupoSobregiro = cupoSobregiro;
    }

    @Override
    public void retirar(double monto) {
        if (monto <= 0) {
            throw new IllegalArgumentException("El monto a retirar debe ser positivo");
        }
        if (monto > getSaldo() + cupoSobregiro) {
            // Regla propia de la cuenta corriente: puede quedar en saldo
            // negativo hasta el limite del cupo autorizado.
            throw new IllegalStateException("Saldo insuficiente: supera el cupo de sobregiro autorizado");
        }
        debitar(monto);
    }

    public double getCupoSobregiro() {
        return cupoSobregiro;
    }
}
```

Punto a resaltar: `retirar()` es la misma firma en las dos clases, pero el
cuerpo es distinto — esto es polimorfismo real, no una coincidencia de
nombre. Más adelante, `CuentaService` va a llamar `cuenta.retirar(monto)`
sin saber ni importarle cuál de las dos es.

## Paso 6 — `Cliente`, la composición con `Cuenta`

```java
package model.domain;

import java.util.ArrayList;
import java.util.List;

public class Cliente {
    private final String identificacion;
    private String nombre;
    private String telefono;
    private String direccion;
    private final List<Cuenta> cuentas;

    public Cliente(String identificacion, String nombre, String telefono, String direccion) {
        if (identificacion == null || identificacion.isBlank()) {
            throw new IllegalArgumentException("La identificacion no puede estar vacia");
        }
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
        this.cuentas = new ArrayList<>();
    }

    public void agregarCuenta(Cuenta cuenta) {
        // Composicion en codigo: la unica forma de que una Cuenta exista
        // en el sistema es colgada de un Cliente ya construido.
        this.cuentas.add(cuenta);
    }

    public List<Cuenta> getCuentas() {
        return cuentas;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
```

Punto a resaltar: `cuentas` se expone como `List<Cuenta>` — un `ArrayList`
temporal, no un `ListaSimple<T>` propia todavía. Eso llega recién en el
Sprint 2 (Semana 5); adelantarlo hoy sería contenido que el curso no ha
enseñado.

## Paso 7 — Capa `service`: coordina, no decide sola

```java
package service;

import model.domain.Cliente;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ClienteService {
    private final List<Cliente> clientes = new ArrayList<>();

    public Cliente registrar(Cliente cliente) {
        boolean existe = clientes.stream()
            .anyMatch(c -> c.getIdentificacion().equals(cliente.getIdentificacion()));
        if (existe) {
            throw new IllegalStateException("Ya existe un cliente con esa identificacion");
        }
        clientes.add(cliente);
        return cliente;
    }

    public Optional<Cliente> buscarPorIdentificacion(String identificacion) {
        return clientes.stream()
            .filter(c -> c.getIdentificacion().equals(identificacion))
            .findFirst();
    }
}
```

```java
package service;

import model.domain.Cliente;
import model.domain.Cuenta;

public class CuentaService {
    public void abrirCuenta(Cliente cliente, Cuenta cuenta) {
        // El Service valida la regla de negocio ("una cuenta se abre a
        // nombre de un cliente ya registrado") y delega la mutacion al
        // Model. El Controller nunca llama a Cliente.agregarCuenta directo.
        cliente.agregarCuenta(cuenta);
    }

    public void retirar(Cuenta cuenta, double monto) {
        // Polimorfismo otra vez: el Service no pregunta que tipo de
        // Cuenta recibio. Cada subtipo resuelve su propia regla.
        cuenta.retirar(monto);
    }
}
```

## Paso 8 — Capa `controller`: traduce input en llamadas al `service`

```java
package controller;

import model.domain.Cliente;
import model.domain.Cuenta;
import model.domain.CuentaAhorros;
import model.domain.CuentaCorriente;
import service.ClienteService;
import service.CuentaService;

import java.util.Optional;

public class BancoController {
    private final ClienteService clienteService;
    private final CuentaService cuentaService;

    public BancoController(ClienteService clienteService, CuentaService cuentaService) {
        this.clienteService = clienteService;
        this.cuentaService = cuentaService;
    }

    public Cliente registrarCliente(String identificacion, String nombre, String telefono, String direccion) {
        return clienteService.registrar(new Cliente(identificacion, nombre, telefono, direccion));
    }

    public Cuenta abrirCuentaAhorros(String identificacion, String numeroCuenta, double saldoInicial, double tasaInteres) {
        Cliente cliente = buscarClienteOFallar(identificacion);
        CuentaAhorros cuenta = new CuentaAhorros(numeroCuenta, saldoInicial, tasaInteres);
        cuentaService.abrirCuenta(cliente, cuenta);
        return cuenta;
    }

    private Cliente buscarClienteOFallar(String identificacion) {
        Optional<Cliente> cliente = clienteService.buscarPorIdentificacion(identificacion);
        return cliente.orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado: " + identificacion));
    }
}
```

Punto a resaltar: `BancoController` conoce `CuentaAhorros` y
`CuentaCorriente` (tiene que decidir cuál construir según la opción de
menú), pero `CuentaService` no — ahí es donde vive el polimorfismo real.

## Paso 9 — Capa `view`: el menú de consola

```java
package view;

import controller.BancoController;
import model.domain.Cliente;

import java.util.Scanner;

public class MenuPrincipal {
    private final BancoController controller;
    private final Scanner entrada;

    public MenuPrincipal(BancoController controller) {
        this.controller = controller;
        this.entrada = new Scanner(System.in);
    }

    public void iniciar() {
        int opcion;
        do {
            mostrarOpciones();
            opcion = Integer.parseInt(entrada.nextLine());
            switch (opcion) {
                case 1 -> registrarCliente();
                case 2 -> abrirCuentaAhorros();
                case 0 -> System.out.println("Cerrando el sistema...");
                default -> System.out.println("Opcion invalida");
            }
        } while (opcion != 0);
    }

    private void mostrarOpciones() {
        System.out.println("1. Registrar cliente");
        System.out.println("2. Abrir cuenta de ahorros");
        System.out.println("0. Salir");
        System.out.print("Elija una opcion: ");
    }

    private void registrarCliente() {
        // La View solo recolecta datos y se los entrega al Controller;
        // nunca instancia Cliente ni Cuenta directamente.
        System.out.print("Identificacion: ");
        String identificacion = entrada.nextLine();
        System.out.print("Nombre: ");
        String nombre = entrada.nextLine();
        System.out.print("Telefono: ");
        String telefono = entrada.nextLine();
        System.out.print("Direccion: ");
        String direccion = entrada.nextLine();
        Cliente cliente = controller.registrarCliente(identificacion, nombre, telefono, direccion);
        System.out.println("Cliente registrado: " + cliente.getNombre());
    }

    private void abrirCuentaAhorros() {
        System.out.print("Identificacion del cliente: ");
        String identificacion = entrada.nextLine();
        System.out.print("Numero de cuenta: ");
        String numeroCuenta = entrada.nextLine();
        System.out.print("Saldo inicial: ");
        double saldoInicial = Double.parseDouble(entrada.nextLine());
        System.out.print("Tasa de interes: ");
        double tasaInteres = Double.parseDouble(entrada.nextLine());
        controller.abrirCuentaAhorros(identificacion, numeroCuenta, saldoInicial, tasaInteres);
        System.out.println("Cuenta de ahorros abierta");
    }
}
```

## Paso 10 — `Main.java`: se ensamblan las cuatro capas

```java
import controller.BancoController;
import service.ClienteService;
import service.CuentaService;
import view.MenuPrincipal;

public class Main {
    public static void main(String[] args) {
        // El unico lugar del proyecto donde las cuatro capas se conocen
        // todas a la vez: aqui se cablean, en ningun otro sitio.
        ClienteService clienteService = new ClienteService();
        CuentaService cuentaService = new CuentaService();
        BancoController controller = new BancoController(clienteService, cuentaService);
        MenuPrincipal menu = new MenuPrincipal(controller);
        menu.iniciar();
    }
}
```

## Paso 11 — Revisión entre pares

Con el diseño y el código completos, cada equipo intercambia su diagrama y
su repositorio con otro equipo (dominios distintos, así que la revisión se
hace sobre la fidelidad de la estructura, no sobre el contenido del
dominio). La pregunta que guía la revisión es una sola: **¿el código que
estoy viendo es exactamente lo que el diagrama promete, ni más ni menos?**
En el Sistema Bancario, eso significa comprobar que `Cuenta` en el código
es abstracta como en el diagrama, que `retirar()` no aparece implementado
en `Cuenta` sino en cada subtipo, y que ninguna clase de `view` o
`controller` construye un objeto `Cuenta` directamente sin pasar por el
`service`.

## Preguntas socráticas

- *"¿Por qué `OperacionesCuenta` es una interfaz y no simplemente tres
  métodos abstractos declarados en `Cuenta`?"* — Respuesta esperada: porque
  el contrato debería poder aplicarse a cualquier tipo de cuenta futura sin
  obligarla a heredar de `Cuenta` — la interfaz separa "qué hace una cuenta"
  de "cómo está construida esta familia de cuentas en particular", que es
  exactamente la idea de TAD vista en la T2.
- *"Si `CuentaCorriente` no sobreescribiera `retirar()`, ¿compilaría el
  proyecto?"* — Respuesta esperada: no, porque `Cuenta` es abstracta y deja
  `retirar()` sin implementar; cualquier subclase concreta está obligada a
  proveerlo o el compilador la obliga a declararse también abstracta.
- *"¿Por qué la relación entre `Cliente` y `Cuenta` es composición y no
  agregación?"* — Respuesta esperada: porque una `Cuenta` no tiene sentido
  ni se conserva fuera de su `Cliente` — si el cliente se elimina del
  sistema, sus cuentas se eliminan con él. Una agregación, en cambio,
  permitiría que la parte sobreviva al todo.
- *"¿Por qué `CuentaService.retirar()` no pregunta con `instanceof` si la
  cuenta es de ahorros o corriente?"* — Respuesta esperada: porque
  preguntar el tipo concreto y ramificar manualmente sería reimplementar a
  mano lo que el polimorfismo ya resuelve automáticamente al invocar
  `cuenta.retirar(monto)` — cada subtipo ejecuta su propia versión sin que
  el `Service` necesite saberlo.
- *"¿Qué pasaría si `BancoController` llamara `cliente.getCuentas().add(cuenta)`
  directamente en vez de pasar por `CuentaService.abrirCuenta()`?"* —
  Respuesta esperada: seguiría funcionando hoy, pero rompería la
  separación de capas: cualquier regla de negocio futura sobre abrir
  cuentas (por ejemplo, un tope de cuentas por cliente) tendría que
  agregarse en `Controller` en vez de en `Service`, contaminando una capa
  que solo debería traducir input.
