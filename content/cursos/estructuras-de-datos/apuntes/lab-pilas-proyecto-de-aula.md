> Solución de referencia del laboratorio "Pilas en el proyecto de aula" sobre
> el **Sistema Bancario** (proyecto del docente, no elegible por ningún equipo).
> Sigue el mismo orden que la guía del estudiante: `Pila<T>` → atributo en
> `Cuenta` → métodos del `Service` → menú en `view/` → `Main` → listado con
> pila auxiliar (Parte 7, obligatoria). Se proyecta para
> comparar contra las entregas y para destrabar a un equipo que se quede en una
> parte.
>
> **Supuestos sobre el estado del proyecto** (verifíquelos contra su
> repositorio antes de proyectar; ajuste nombres si difieren): `Cuenta` es
> abstracta con atributo `saldo` y los métodos `depositar(double)` y
> `retirar(double)`; `Transaccion` tiene `tipo` (`"Deposito"` o `"Retiro"`) y
> `monto`, como quedó en la lección "Operaciones sobre la lista simple";
> `Nodo<T>` tiene `getDato()`, `getSiguiente()` y `setSiguiente()`;
> `CuentaService` ya tiene un buscador de cuentas por número, aquí llamado
> `buscarCuentaOFallar`.

## Paso 1 — `Pila<T>` en `model/structures/`

```java
package model.structures;

public class Pila<T> {
    private Nodo<T> tope;   // nodo de arriba; null cuando la pila está vacía
    private int tamano;     // llevado al día en push y pop, así size() no recorre nada

    public Pila() {
        this.tope = null;
        this.tamano = 0;
    }

    public void push(T valor) {
        if (valor == null) {
            // una pila con null haría ambiguo el resultado de peek/pop
            throw new IllegalArgumentException("valor no puede ser null");
        }
        Nodo<T> nuevo = new Nodo<>(valor);
        nuevo.setSiguiente(tope); // 1. el nodo nuevo se apoya en el tope actual
        tope = nuevo;             // 2. recién ahora pasa a ser el tope
        tamano++;
    }

    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("La pila está vacía");
        }
        T valor = tope.getDato();     // se guarda antes de perder el nodo
        tope = tope.getSiguiente();   // el tope baja un lugar
        tamano--;
        return valor;                 // el nodo retirado queda sin referencias: Java lo libera
    }

    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("La pila está vacía");
        }
        return tope.getDato();        // es la primera mitad de pop, sin mover el tope
    }

    public boolean isEmpty() {
        return tope == null;
    }

    public int size() {
        return tamano;
    }
}
```

Punto a resaltar: `push` y `pop` son simétricos. En `push` primero se conecta
hacia abajo y luego se mueve el tope; en `pop` primero se guarda el dato y luego
el tope baja. Cuando un equipo reporta que "solo sale el último", casi siempre
tiene invertidas las dos líneas de `push`. Y `peek` es literalmente `pop` sin
la línea que mueve el tope.

## Paso 2 — El atributo en `Cuenta`

```java
package model.domain;

import model.structures.Pila;

public abstract class Cuenta {
    private String numeroCuenta;
    private double saldo;
    // ... demás atributos del Sprint 1 y 2 (fecha de apertura, historial, etc.)

    // Pila de las operaciones que todavía se pueden deshacer. Es distinta del
    // historial (ListaSimple): el historial conserva todo; la pila solo ofrece
    // lo más reciente, y se achica al deshacer.
    private Pila<Transaccion> operacionesRecientes;

    public Cuenta(String numeroCuenta, double saldoInicial) {
        this.numeroCuenta = numeroCuenta;
        this.saldo = saldoInicial;
        // sin esta línea, el primer push lanza NullPointerException
        this.operacionesRecientes = new Pila<>();
    }

    public Pila<Transaccion> getOperacionesRecientes() {
        return operacionesRecientes;
    }

    // ... depositar, retirar y demás métodos que ya existen
}
```

Punto a resaltar: este es el mismo patrón de `Proveedor.getPedidos()` del
laboratorio de lista simple. La diferencia es el contrato: aquí el `Service`
solo usa las cinco operaciones del TAD, no recorre nada. Conviene contrastar
con el historial: ¿por qué el historial es una lista y las operaciones
recientes son una pila? Porque el historial se consulta completo y en
cualquier orden; las operaciones recientes solo importan en orden inverso al
de llegada.

## Paso 3 — Los cinco métodos en `CuentaService`

```java
package service;

import model.domain.Cuenta;
import model.domain.Transaccion;

public class CuentaService {
    // ... atributos, constructor y métodos del Sprint 1 y 2

    // push: aplica el efecto sobre la cuenta y, solo si funcionó, apila el registro
    public void registrarOperacion(String numeroCuenta, String tipo, double monto) {
        Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
        switch (tipo) {
            case "Deposito" -> cuenta.depositar(monto);
            case "Retiro" -> cuenta.retirar(monto);
            default -> throw new IllegalArgumentException("Tipo no soportado: " + tipo);
        }
        // llega aquí únicamente si depositar/retirar no lanzaron excepción: no se
        // apila una operación que nunca ocurrió
        cuenta.getOperacionesRecientes().push(new Transaccion(tipo, monto));
    }

    // pop: retira la última transacción y revierte su efecto en el saldo
    public Transaccion deshacerUltimaOperacion(String numeroCuenta) {
        Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
        // si la pila está vacía, pop lanza IllegalStateException y se propaga a la View
        Transaccion ultima = cuenta.getOperacionesRecientes().pop();
        if (ultima.getTipo().equals("Deposito")) {
            cuenta.retirar(ultima.getMonto());   // lo contrario de depositar
        } else {
            cuenta.depositar(ultima.getMonto()); // lo contrario de retirar
        }
        // se llama a depositar/retirar de Cuenta, NO a registrarOperacion: deshacer
        // no se apila, o la pila nunca se vaciaría
        return ultima;
    }

    // peek: la última transacción sin deshacerla
    public Transaccion consultarUltimaOperacion(String numeroCuenta) {
        return buscarCuentaOFallar(numeroCuenta).getOperacionesRecientes().peek();
    }

    // isEmpty
    public boolean sinOperacionesPorDeshacer(String numeroCuenta) {
        return buscarCuentaOFallar(numeroCuenta).getOperacionesRecientes().isEmpty();
    }

    // size
    public int contarOperaciones(String numeroCuenta) {
        return buscarCuentaOFallar(numeroCuenta).getOperacionesRecientes().size();
    }
}
```

Punto a resaltar: la `Pila<Transaccion>` nunca sale del `Service`. La `View`
recibe una `Transaccion`, un `boolean` o un `int`; no sabe que detrás hay nodos.
Esa es la condición de la rúbrica ("ninguna firma pública devuelve `Pila<T>`").

Punto a resaltar: el orden dentro de `registrarOperacion` importa. Si el
`push` fuera antes de `depositar`/`retirar` y el retiro fallara por saldo
insuficiente, la pila guardaría una operación que nunca ocurrió y un
`deshacer` posterior corrompería el saldo.

Limitación a declarar en clase: las transferencias quedan fuera del lab. Una
transferencia toca dos cuentas, y deshacerla exigiría apilar en ambas y
revertir las dos a la vez; es un buen tema para discutir, no para implementar
hoy.

## Paso 4 — `MenuPilaView` en `view/`

```java
package view;

import model.domain.Transaccion;
import service.CuentaService;

import java.util.Scanner;

public class MenuPilaView {
    private final CuentaService cuentaService;
    private final Scanner entrada;

    public MenuPilaView(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
        this.entrada = new Scanner(System.in);
    }

    public void iniciar() {
        int opcion;
        do {
            mostrarOpciones();
            opcion = Integer.parseInt(entrada.nextLine());
            try {
                switch (opcion) {
                    case 1 -> registrar();
                    case 2 -> deshacer();
                    case 3 -> consultarUltima();
                    case 4 -> verSiHayOperaciones();
                    case 5 -> contar();
                    case 6 -> listar();
                    case 0 -> System.out.println("Saliendo del menú de pilas...");
                    default -> System.out.println("Opción inválida");
                }
            } catch (IllegalStateException | IllegalArgumentException e) {
                // pila vacía, cuenta inexistente o tipo inválido: se informa y el
                // menú sigue en pie. La View no decide nada; solo muestra el mensaje
                System.out.println("No se pudo completar: " + e.getMessage());
            }
        } while (opcion != 0);
    }

    private void mostrarOpciones() {
        System.out.println("1. Registrar operación (push)");
        System.out.println("2. Deshacer última operación (pop)");
        System.out.println("3. Ver última operación (peek)");
        System.out.println("4. ¿Hay operaciones por deshacer? (isEmpty)");
        System.out.println("5. Cantidad de operaciones (size)");
        System.out.println("6. Listar operaciones");
        System.out.println("0. Salir");
        System.out.print("Elija una opción: ");
    }

    private String pedirCuenta() {
        System.out.print("Número de cuenta: ");
        return entrada.nextLine();
    }

    private void registrar() {
        String numeroCuenta = pedirCuenta();
        System.out.print("Tipo (Deposito / Retiro): ");
        String tipo = entrada.nextLine();
        System.out.print("Monto: ");
        double monto = Double.parseDouble(entrada.nextLine());
        cuentaService.registrarOperacion(numeroCuenta, tipo, monto);
        System.out.println("Operación registrada: " + tipo + " " + monto);
    }

    private void deshacer() {
        Transaccion deshecha = cuentaService.deshacerUltimaOperacion(pedirCuenta());
        System.out.println("Operación deshecha: " + deshecha);
    }

    private void consultarUltima() {
        Transaccion ultima = cuentaService.consultarUltimaOperacion(pedirCuenta());
        System.out.println("Última operación: " + ultima);
    }

    private void verSiHayOperaciones() {
        boolean vacia = cuentaService.sinOperacionesPorDeshacer(pedirCuenta());
        System.out.println(vacia ? "No hay operaciones por deshacer" : "Hay operaciones por deshacer");
    }

    private void contar() {
        System.out.println("Operaciones: " + cuentaService.contarOperaciones(pedirCuenta()));
    }

    private void listar() {
        // la View solo imprime: el Service ya armó el texto ordenado del tope a la base
        System.out.println(cuentaService.listarOperaciones(pedirCuenta()));
    }
}
```

Punto a resaltar: ninguna importación de `model.structures`. El único tipo de
dominio que la `View` conoce es `Transaccion`, y solo para imprimirlo; `toString()`
de `Transaccion` ya fue definido en la lección de operaciones sobre la lista.

## Paso 5 — `Main`

```java
import service.CuentaService;
import view.MenuPilaView;

public class Main {
    public static void main(String[] args) {
        // ... construcción de ClienteService, CuentaService y MenuPrincipal como antes
        // el mismo CuentaService se comparte con el menú nuevo: una instancia distinta
        // tendría otras cuentas y, por tanto, otras pilas
        MenuPilaView menuPila = new MenuPilaView(cuentaService);
        menuPila.iniciar();
    }
}
```

## Paso 6 — Parte 7: listar sin destruir la pila

Se proyecta primero el **código base** que recibe el estudiante y después la
solución. La idea para explicar en voz alta: una pila solo se puede ver por el
tope, así que para ver todo hay que desarmarla; la pila auxiliar es el lugar
donde se guarda lo desarmado hasta poder rearmarla.

Código base (lo que recibe el estudiante en `CuentaService`):

```java
public String listarOperaciones(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    Pila<Transaccion> original = cuenta.getOperacionesRecientes();

    // TODO 1: si la original está vacía, devolver "No hay operaciones por deshacer"
    // TODO 2: crear la pila auxiliar vacía y un StringBuilder
    // TODO 3: mientras la original no esté vacía: pop, agregar una línea numerada
    //         al StringBuilder y push en la auxiliar
    // TODO 4: mientras la auxiliar no esté vacía: pop y push de vuelta en la original
    // TODO 5: devolver el texto armado
    return null;
}
```

Solución documentada (requiere `import model.structures.Pila;` en `CuentaService`;
`StringBuilder` es de `java.lang`, no necesita import):

```java
public String listarOperaciones(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    Pila<Transaccion> original = cuenta.getOperacionesRecientes();

    // caso límite primero: con la pila vacía ningún ciclo haría nada útil
    if (original.isEmpty()) {
        return "No hay operaciones por deshacer";
    }

    Pila<Transaccion> auxiliar = new Pila<>();
    StringBuilder texto = new StringBuilder();
    int numero = 1;

    // Ciclo 1: se desarma la original. Cada pop entrega el tope actual, así que
    // el texto sale ordenado del tope a la base, que es lo que se muestra.
    // La auxiliar recibe los elementos en ese mismo orden, por lo que su tope
    // termina siendo el que estaba en la BASE de la original (orden invertido).
    while (!original.isEmpty()) {
        Transaccion t = original.pop();
        texto.append(numero++).append(". ").append(t).append("\n");
        auxiliar.push(t);
    }

    // Ciclo 2: se rearma la original. Pasar de una pila a otra invierte el orden,
    // y dos inversiones dejan todo como estaba: el primero en volver es el que
    // estaba en la base, y el último en volver es el que era el tope.
    while (!auxiliar.isEmpty()) {
        original.push(auxiliar.pop());
    }

    return texto.toString().trim(); // trim quita el último salto de línea
}
```

Punto a resaltar: el `Service` devuelve texto, no la pila ni una estructura
derivada de ella; la `View` solo lo imprime y no vuelve a ordenar nada.

Punto a resaltar: dibujar en el tablero las tres pilas con A, B, C (tope = C).
Tras el ciclo 1, la original está vacía y la auxiliar tiene A arriba y C
abajo; tras el ciclo 2, la original vuelve a tener C arriba. Preguntar qué
pasaría si se omitiera el ciclo 2: listar destruiría el historial, y el
siguiente `deshacer` fallaría con "pila vacía".

Punto a resaltar: `Pila<T>` no cambió. No se le agregó ningún método de
recorrido; el listado se resuelve con las cinco operaciones del TAD. Eso es
lo que distingue una pila de una lista, donde recorrer sí es una operación
propia. Y aunque `listarOperaciones` cuesta O(n) (cada elemento sale y entra
dos veces), cada operación individual sigue siendo O(1).

## Paso 7 — Secuencia de verificación

Sobre una cuenta con saldo inicial 1000 y número `"001"`:

```text
1  → 001, Deposito, 200    (saldo 1200)
1  → 001, Retiro, 50       (saldo 1150)
1  → 001, Deposito, 100    (saldo 1250)
3  → Última operación: Deposito 100.0
5  → Operaciones: 3
6  → 1. Deposito 100.0 / 2. Retiro 50.0 / 3. Deposito 200.0   (la pila no cambia)
5  → Operaciones: 3
2  → Operación deshecha: Deposito 100.0   (saldo 1150)
5  → Operaciones: 2
2  → Operación deshecha: Retiro 50.0      (saldo 1200)
2  → Operación deshecha: Deposito 200.0   (saldo 1000)
4  → No hay operaciones por deshacer
2  → No se pudo completar: La pila está vacía   (el menú sigue)
```

Si el equipo falla este bloque, la causa casi siempre es una de tres: `push`
con las líneas invertidas (Paso 1), pila no inicializada en el constructor
(Paso 2) o `deshacerUltimaOperacion` que llama a `registrarOperacion` y apila
su propia reversa (Paso 3).

## Preguntas socráticas

- *"¿Por qué `pop` lanza una excepción en vez de devolver `null` cuando la pila
  está vacía?"* — Respuesta esperada: un `null` viajaría por el programa y
  fallaría lejos de donde nació, con un `NullPointerException` difícil de
  rastrear; la excepción hace visible el error en el punto exacto. Además,
  `push` prohíbe `null`, así que `null` nunca podría significar "dato" y
  "pila vacía" a la vez.
- *"La cuenta ya tiene un historial en `ListaSimple`. ¿Por qué no deshacer
  recorriendo el historial hasta el último nodo?"* — Respuesta esperada:
  porque eso cuesta O(n) y exige recorrer la cadena; la pila llega a la última
  transacción en O(1) porque solo trabaja sobre `tope`. Además, el historial
  conserva todo y la pila representa lo que todavía se puede deshacer.
- *"¿Qué pasa si la `View` llama a `cuenta.getOperacionesRecientes().pop()`
  directamente?"* — Respuesta esperada: funcionaría, pero retiraría la
  transacción sin revertir el saldo; la regla "deshacer también revierte el
  efecto" viviría en el menú y habría que repetirla en cada pantalla que
  deshaga algo. Por eso la pila solo se toca desde el `Service`.
- *"¿Por qué `listarOperaciones` necesita una segunda pila y no puede
  simplemente recorrer la original?"* — Respuesta esperada: porque `Pila<T>`
  no expone sus nodos; el único acceso es el tope, y llegar al siguiente
  elemento exige retirar el que está encima. La auxiliar guarda lo retirado
  para poder devolverlo.
- *"¿Qué pasa con el orden si se omite el segundo ciclo, o si se vuelve a
  apilar en la original dentro del primer ciclo?"* — Respuesta esperada: sin
  el segundo ciclo la pila queda vacía. Si se reapilara dentro del primero,
  el `while (!original.isEmpty())` nunca terminaría, porque cada `pop` sería
  seguido de un `push` que la vuelve a llenar.
- *"¿Por qué `registrarOperacion` aplica el efecto antes de apilar?"* —
  Respuesta esperada: para no apilar operaciones que fallaron. Si el retiro
  lanza por saldo insuficiente, la excepción interrumpe el método antes de
  llegar al `push`.
