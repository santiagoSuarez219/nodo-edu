> **Continuación de la lección publicada.** Los pasos 1 a 7 —diagrama de
> paquetes, diagrama UML de partida, el TAD `OperacionesCuenta`, `Cuenta`
> abstracta, los dos subtipos concretos, la composición con `Cliente` y
> `PruebaCreacionObjetos`— se desarrollan en clase sobre la lección
> publicada *"Diseño con TAD y orientación a objetos — laboratorio guiado"*
> (sesión T2, jueves 27), que el estudiante también puede consultar. Este
> apunte recoge lo que **no** entra ahí: las capas `service` y `view`
> completas, la dinámica de revisión entre pares y las preguntas socráticas
> con sus respuestas esperadas. La numeración de los pasos continúa la de la
> lección.
>
> Sesión evaluativa (Momento 1, 5 % — el 10 % restante del tema se evalúa
> la semana siguiente con un quiz de opción múltiple). En la guía publicada,
> cada uno de los cinco proyectos de equipo parte explícitamente de las
> cinco clases que ya construyeron en la práctica de Semana 2 ("Modela una
> clase de tu proyecto de aula"), no de cero — el laboratorio las evoluciona
> con encapsulamiento, herencia e interfaces en vez de introducir un diseño
> desconectado.
>
> El Sistema Bancario es el proyecto de referencia del docente, no uno de
> los cinco casos de estudio de equipo.

## Paso 8 — Capa `service`: coordina, no decide sola

```java
package service;

import model.domain.Cliente;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ClienteService {
    private final List<Cliente> clientes = new ArrayList<>();

    public Cliente registrar(String identificacion, String nombre, String telefono, String direccion) {
        // El Service es el unico que construye entidades del dominio: la
        // View le pasa datos crudos, nunca objetos Cliente ya armados.
        boolean existe = clientes.stream()
            .anyMatch(c -> c.getIdentificacion().equals(identificacion));
        if (existe) {
            throw new IllegalStateException("Ya existe un cliente con esa identificacion");
        }
        Cliente cliente = new Cliente(identificacion, nombre, telefono, direccion);
        clientes.add(cliente);
        return cliente;
    }

    public Optional<Cliente> buscarPorIdentificacion(String identificacion) {
        return clientes.stream()
            .filter(c -> c.getIdentificacion().equals(identificacion))
            .findFirst();
    }

    public Cliente buscarPorIdentificacionOFallar(String identificacion) {
        return buscarPorIdentificacion(identificacion)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado: " + identificacion));
    }
}
```

```java
package service;

import model.domain.Cliente;
import model.domain.Cuenta;
import model.domain.CuentaAhorros;
import model.domain.CuentaCorriente;

public class CuentaService {
    private final ClienteService clienteService;

    public CuentaService(ClienteService clienteService) {
        // Un Service puede apoyarse en otro Service de la misma capa;
        // lo que no puede es conocer la View que esta por encima.
        this.clienteService = clienteService;
    }

    public CuentaAhorros abrirCuentaAhorros(String identificacion, String numeroCuenta,
                                            double saldoInicial, double tasaInteres) {
        // El Service valida la regla de negocio ("una cuenta se abre a
        // nombre de un cliente ya registrado"), construye el subtipo
        // concreto y delega la mutacion al Model. La View nunca llama a
        // Cliente.agregarCuenta directo.
        Cliente cliente = clienteService.buscarPorIdentificacionOFallar(identificacion);
        CuentaAhorros cuenta = new CuentaAhorros(numeroCuenta, saldoInicial, tasaInteres);
        cliente.agregarCuenta(cuenta);
        return cuenta;
    }

    public CuentaCorriente abrirCuentaCorriente(String identificacion, String numeroCuenta,
                                                double saldoInicial, double cupoSobregiro) {
        Cliente cliente = clienteService.buscarPorIdentificacionOFallar(identificacion);
        CuentaCorriente cuenta = new CuentaCorriente(numeroCuenta, saldoInicial, cupoSobregiro);
        cliente.agregarCuenta(cuenta);
        return cuenta;
    }

    public void retirar(Cuenta cuenta, double monto) {
        // Polimorfismo otra vez: el Service no pregunta que tipo de
        // Cuenta recibio. Cada subtipo resuelve su propia regla.
        cuenta.retirar(monto);
    }
}
```

Punto a resaltar: los métodos de apertura son el **único** lugar donde se
nombra un subtipo concreto (`CuentaAhorros`, `CuentaCorriente`), porque
alguien tiene que decidir cuál construir según lo que pidió el usuario. De
ahí en adelante todo se maneja como `Cuenta` — `retirar()` no vuelve a
preguntar de qué tipo es. Esa decisión vive en el `Service`, junto a la
regla de negocio que la acompaña.

## Paso 9 — Capa `view`: el menú de consola

```java
package view;

import model.domain.Cliente;
import service.ClienteService;
import service.CuentaService;

import java.util.Scanner;

public class MenuPrincipal {
    private final ClienteService clienteService;
    private final CuentaService cuentaService;
    private final Scanner entrada;

    public MenuPrincipal(ClienteService clienteService, CuentaService cuentaService) {
        // La View recibe los services que necesita y los invoca directo.
        this.clienteService = clienteService;
        this.cuentaService = cuentaService;
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
        // La View solo recolecta datos y se los entrega al Service;
        // nunca instancia Cliente ni Cuenta directamente.
        System.out.print("Identificacion: ");
        String identificacion = entrada.nextLine();
        System.out.print("Nombre: ");
        String nombre = entrada.nextLine();
        System.out.print("Telefono: ");
        String telefono = entrada.nextLine();
        System.out.print("Direccion: ");
        String direccion = entrada.nextLine();
        Cliente cliente = clienteService.registrar(identificacion, nombre, telefono, direccion);
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
        cuentaService.abrirCuentaAhorros(identificacion, numeroCuenta, saldoInicial, tasaInteres);
        System.out.println("Cuenta de ahorros abierta");
    }
}
```

Punto a resaltar: los dos métodos privados terminan igual — leen del
`Scanner`, llaman **un** método del `Service` y muestran el resultado. Si
alguna vez aparece un `if` con una regla de negocio dentro de esta clase,
está en la capa equivocada.

## Paso 10 — `Main.java`: se ensamblan las tres capas

```java
import service.ClienteService;
import service.CuentaService;
import view.MenuPrincipal;

public class Main {
    public static void main(String[] args) {
        // El unico lugar del proyecto donde las tres capas se conocen
        // todas a la vez: aqui se cablean, en ningun otro sitio.
        ClienteService clienteService = new ClienteService();
        CuentaService cuentaService = new CuentaService(clienteService);
        MenuPrincipal menu = new MenuPrincipal(clienteService, cuentaService);
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
en `Cuenta` sino en cada subtipo, y que ninguna clase de `view` construye
un objeto `Cuenta` directamente sin pasar por el `service`.

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
- *"¿Qué pasaría si `MenuPrincipal` construyera la cuenta y llamara
  `cliente.getCuentas().add(cuenta)` directamente, en vez de pasar por
  `CuentaService.abrirCuentaAhorros()`?"* — Respuesta esperada: seguiría
  funcionando hoy, pero rompería la separación de responsabilidades:
  cualquier regla de negocio futura sobre abrir cuentas (por ejemplo, un
  tope de cuentas por cliente) tendría que escribirse dentro del menú, y
  habría que repetirla en cada opción que abra cuentas. La `View` solo debe
  pedir datos y mostrar resultados; en el momento en que decide algo del
  negocio, el `Service` deja de ser la única fuente de esas reglas.
