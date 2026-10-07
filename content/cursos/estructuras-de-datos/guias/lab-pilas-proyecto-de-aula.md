---
title: "Laboratorio — Pilas en el proyecto de aula"
updatedAt: "2026-10-07"
---

# Laboratorio — Pilas en el proyecto de aula

Repositorio de referencia del proyecto (Sistema Bancario), donde este laboratorio ya está resuelto: [github.com/santiagoSuarez219/estructura-de-datos-sistema-bancario](https://github.com/santiagoSuarez219/estructura-de-datos-sistema-bancario). Úsalo como referencia para ver cómo encaja cada pieza; la implementación en tu proyecto debe ser tuya y adaptada a tu dominio.

## Objetivo

Construir la estructura `Pila<T>` desde cero con nodos enlazados e integrarla
a su proyecto de aula respetando las tres capas: la pila vive en
`model/structures/`, la entidad que la necesita la guarda como atributo, el
`Service` expone las cinco operaciones del TAD y la `View` ofrece un menú de
consola que solo llama al `Service`.

**Competencias esperadas:**
- Implementar `push`, `pop`, `peek`, `isEmpty` y `size` reasignando referencias
  sobre `Nodo<T>`, sin usar `java.util.Stack` ni ninguna otra clase de
  `java.util`.
- Decidir en qué entidad del dominio vive una pila y justificar por qué una
  disciplina LIFO resuelve ese problema.
- Proteger `pop` y `peek` ante una pila vacía lanzando una excepción en el
  punto exacto del error.
- Integrar una estructura genérica a una arquitectura de tres capas sin que la
  `View` conozca la estructura.

---

## Requisitos Previos

- Lección "Implementación de pilas en Java": TAD Pila, regla LIFO y la
  implementación con `tope` y `tamano`.
- Lección "Nodos y memoria dinámica en Java": la clase `Nodo<T>` ya existe en
  `model/structures/` de su proyecto, junto con `ListaSimple<T>`.
- Laboratorio "Lista Simple (Momento 2)": su proyecto ya tiene entidades con
  colecciones, un `Service` por entidad y un menú en `view/`.
- Lección "Diseño con TAD y orientación a objetos": la `View` pide datos y
  muestra resultados; las reglas viven en el `Service`.

---

## Cómo leer esta guía

Los fragmentos de código usan el **Sistema Bancario** como ejemplo (la pila
guarda las transacciones de una cuenta para poder deshacerlas). Cada fragmento
es una **base**: marca con `TODO` las líneas que usted debe escribir y deja
visible en qué archivo y en qué lugar de la clase va cada una. No copie los
nombres a ciegas: la tabla de la Parte 1 le dice qué nombres corresponden a su
proyecto.

Trabaje en una rama `feature/pila-en-el-proyecto` creada desde `main` y haga un
commit al terminar cada Parte.

---

## Desarrollo del Laboratorio

### Parte 1 — Entidad que aloja la pila

Una pila se justifica cuando el problema pide **deshacer o consultar lo más
reciente**. Cada grupo debe implementar la pila descrita en la tabla de su
proyecto: qué elemento se apila, en qué clase vive y qué efecto se revierte
cuando se hace `pop`. Cuando la pila vive en una entidad, es la entidad "dueña"
del historial, la misma que en el laboratorio de lista simple guardaba su
colección uno-a-muchos.

| Proyecto | Pila | Dónde vive | Al hacer `pop` |
|---|---|---|---|
| Sistema Bancario | `Pila<Transaccion>` | `Cuenta` | Se revierte el efecto de la última transacción sobre el saldo |
| Papelería | `Pila<Venta>` | `Service` de ventas (no hay entidad contenedora) | Se anula la última venta y se restaura el stock |
| Consultorio Médico | `Pila<Consulta>` | `Paciente` | Se retira la última consulta registrada; `peek` entrega la más reciente |
| Clínica Veterinaria | `Pila<Consulta>` | `Animal` | Se retira la última consulta de la mascota; `peek` entrega la más reciente |
| Sistema Académico | `Pila<Calificacion>` | La entidad que representa la materia | Se revierte la nota a la versión anterior |
| Liga de Fútbol | `Pila<Gol>` | `Partido` | Se anula el último gol registrado (error de digitación) |

---

### Parte 2 — Construya la clase `Pila<T>`

**Archivo nuevo:** `src/model/structures/Pila.java`, en el mismo paquete que
`Nodo<T>` y `ListaSimple<T>`. Reutilice su `Nodo<T>` (con `getDato()`,
`getSiguiente()` y `setSiguiente()`); no cree otra clase de nodo.

Recuerde la lección: la pila entera es una sola referencia, `tope`, al nodo de
arriba. Ninguna operación recorre la cadena.

```java
package model.structures;

public class Pila<T> {
    private Nodo<T> tope;   // nodo de arriba; null cuando la pila está vacía
    private int tamano;     // cuántos nodos hay, llevado al día en push y pop

    public Pila() {
        this.tope = null;
        this.tamano = 0;
    }

    public void push(T valor) {
        // TODO 1: si valor es null, lanzar IllegalArgumentException
        // TODO 2: crear el nodo nuevo con el valor
        // TODO 3: enlazar el nodo nuevo al tope actual (setSiguiente)
        //         -- ANTES de mover el tope; si invierte 3 y 4, pierde el resto de la pila
        // TODO 4: mover tope al nodo nuevo
        // TODO 5: incrementar tamano
    }

    public T pop() {
        // TODO 1: si la pila está vacía, lanzar IllegalStateException("La pila está vacía")
        // TODO 2: guardar el dato del tope en una variable local ANTES de mover el tope
        // TODO 3: bajar el tope un lugar (tope pasa a ser su siguiente)
        // TODO 4: decrementar tamano
        // TODO 5: devolver el dato guardado en el paso 2
        return null; // reemplazar por el retorno del TODO 5
    }

    public T peek() {
        // TODO 1: si la pila está vacía, lanzar IllegalStateException("La pila está vacía")
        // TODO 2: devolver el dato del tope SIN modificar tope ni tamano
        return null; // reemplazar por el retorno del TODO 2
    }

    public boolean isEmpty() {
        // TODO: una sola línea; la pila está vacía cuando tope no apunta a ningún nodo
        return false; // reemplazar
    }

    public int size() {
        // TODO: una sola línea; no recorra la cadena, el tamaño ya está contado
        return 0; // reemplazar
    }
}
```

**Requisitos:**
- Las cinco operaciones cuestan **O(1)**: ningún `while` ni `for`.
- `pop` y `peek` sobre una pila vacía lanzan `IllegalStateException`; nunca
  devuelven `null`.
- `push(null)` lanza `IllegalArgumentException` y deja la pila intacta.
- `Pila<T>` no importa nada de `java.util`.

**Punto de control (compruébelo con un `Main` temporal):** apile `"A"`, `"B"` y
`"C"`; `peek()` devuelve `"C"`; tres `pop()` seguidos devuelven `"C"`, `"B"`,
`"A"`; después `isEmpty()` es `true` y un cuarto `pop()` lanza la excepción.

---

### Parte 3 — Agregue la pila a la entidad

**Archivo existente:** la entidad que indica la tabla de la Parte 1 (en el Sistema
Bancario, `src/model/domain/Cuenta.java`). Agregue el atributo, inicialícelo en
el constructor y exponga un getter. No cambie nada más de la clase.

```java
public abstract class Cuenta {
    // ... atributos que ya tiene (numeroCuenta, saldo, historial, etc.)

    // TODO 1: declarar el atributo privado
    //         private Pila<Transaccion> operacionesRecientes;

    public Cuenta(/* parámetros que ya tiene */) {
        // ... asignaciones que ya tiene

        // TODO 2: crear la pila vacía; sin esta línea, la primera llamada a push
        //         lanza NullPointerException
    }

    // TODO 3: getter público getOperacionesRecientes() que devuelva la pila
}
```

Si la entidad de su proyecto no es abstracta, o se llama distinto, aplique los
mismos tres cambios en su clase. Recuerde importar `model.structures.Pila`.

**Requisito:** el atributo es `private`; solo el `Service` usa el getter.

---

### Parte 4 — Implemente los métodos en el `Service`

**Archivo existente:** el `Service` que ya gestiona la entidad (en el Sistema
Bancario, `src/service/CuentaService.java`). Agregue **cinco métodos**, uno por
operación del TAD. El `Service` es el único que toca la pila: recibe datos
simples de la `View` y devuelve datos simples (nunca devuelve ni recibe la
`Pila<T>`).

| Operación del TAD | Método del `Service` | Qué devuelve |
|---|---|---|
| `push` | `registrarOperacion` | nada |
| `pop` | `deshacerUltimaOperacion` | la transacción deshecha |
| `peek` | `consultarUltimaOperacion` | la última transacción, sin deshacerla |
| `isEmpty` | `sinOperacionesPorDeshacer` | `boolean` |
| `size` | `contarOperaciones` | `int` |

```java
// Dentro de CuentaService (ajuste los nombres a su entidad)

public void registrarOperacion(String numeroCuenta, String tipo, double monto) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta); // el buscador que ya tiene
    // TODO 1: aplicar el efecto de la operación sobre la cuenta, reutilizando los
    //         métodos que ya construyó (depositar / retirar). El tipo es
    //         "Deposito" o "Retiro"; cualquier otro tipo lanza IllegalArgumentException.
    // TODO 2: crear la Transaccion con el tipo y el monto
    // TODO 3: apilarla en la pila de la cuenta (push)
    //         -- debe ejecutarse SOLO si el paso 1 no lanzó excepción
}

public Transaccion deshacerUltimaOperacion(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    // TODO 1: retirar la transacción del tope (pop); si la pila está vacía la
    //         excepción de Pila se propaga: no la atrape aquí
    // TODO 2: revertir el efecto sobre la cuenta: un "Deposito" se revierte con un
    //         retiro del mismo monto; un "Retiro", con un depósito del mismo monto
    //         -- NO vuelva a llamar a registrarOperacion: deshacer no se apila
    // TODO 3: devolver la transacción que se deshizo
    return null; // reemplazar por el retorno del TODO 3
}

public Transaccion consultarUltimaOperacion(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    // TODO: devolver la transacción del tope SIN retirarla (peek)
    return null; // reemplazar
}

public boolean sinOperacionesPorDeshacer(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    // TODO: devolver isEmpty de la pila de la cuenta
    return false; // reemplazar
}

public int contarOperaciones(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    // TODO: devolver size de la pila de la cuenta
    return 0; // reemplazar
}
```

**Requisitos:**
- Los cinco métodos obtienen la cuenta con el buscador que su `Service` ya
  tenía; no duplique la búsqueda.
- Si la cuenta no existe, el método falla con la misma excepción que ya usa su
  `Service` para ese caso.
- `Pila<T>` no aparece en ninguna firma pública del `Service`.
- En proyectos distintos al Sistema Bancario, `registrarOperacion` es el
  método donde su aplicación ya registra el elemento (la venta, la consulta,
  el gol); en lugar de duplicar esa lógica, agregue la línea del `push` al
  método que ya existe y mantenga los otros cuatro con la tabla de arriba,
  renombrados a su dominio (por ejemplo `deshacerUltimaVenta`).

**Punto de control:** el proyecto compila y `Main` temporal puede registrar dos
operaciones, consultar la última, deshacerla y contar las que quedan.

---

### Parte 5 — Construya el menú en `view/`

**Archivo nuevo:** `src/view/MenuPilaView.java`. Sigue el mismo patrón de
`MenuPrincipal`: recibe el `Service` por constructor, lee con `Scanner`, llama
**un** método del `Service` por opción y muestra el resultado. La `View` no
importa `Pila`, `Nodo` ni ningún paquete de `model.structures`.

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
            // TODO 1: envolver el switch en try / catch de IllegalStateException y
            //         IllegalArgumentException; el catch imprime e.getMessage() y el
            //         menú sigue en pie (una pila vacía NO debe cerrar el programa)
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
        } while (opcion != 0);
    }

    private void mostrarOpciones() {
        System.out.println("1. Registrar operación (push)");
        System.out.println("2. Deshacer última operación (pop)");
        System.out.println("3. Ver última operación (peek)");
        System.out.println("4. ¿Hay operaciones por deshacer? (isEmpty)");
        System.out.println("5. Cantidad de operaciones (size)");
        System.out.println("6. Listar operaciones (Parte 7)");
        System.out.println("0. Salir");
        System.out.print("Elija una opción: ");
    }

    private void registrar() {
        System.out.print("Número de cuenta: ");
        String numeroCuenta = entrada.nextLine();
        System.out.print("Tipo (Deposito / Retiro): ");
        String tipo = entrada.nextLine();
        System.out.print("Monto: ");
        double monto = Double.parseDouble(entrada.nextLine());
        // TODO 2: llamar a cuentaService.registrarOperacion y confirmar por consola
    }

    private void deshacer() {
        System.out.print("Número de cuenta: ");
        String numeroCuenta = entrada.nextLine();
        // TODO 3: llamar a deshacerUltimaOperacion y mostrar la transacción deshecha
    }

    private void consultarUltima() {
        // TODO 4: pedir la cuenta, llamar a consultarUltimaOperacion y mostrarla
    }

    private void verSiHayOperaciones() {
        // TODO 5: pedir la cuenta, llamar a sinOperacionesPorDeshacer y mostrar un
        //         mensaje legible ("No hay operaciones por deshacer" / "Hay operaciones")
    }

    private void contar() {
        // TODO 6: pedir la cuenta, llamar a contarOperaciones y mostrar el número
    }

    private void listar() {
        // TODO 7: se completa en la Parte 7, cuando exista listarOperaciones en el Service
    }
}
```

**Requisitos:**
- Cada opción 1 a 5 ejecuta exactamente una de las cinco operaciones del TAD;
  la opción 6 usa `listarOperaciones` de la Parte 7.
- La `View` no contiene reglas de negocio: ningún `if` que decida si se puede
  deshacer; esa decisión es de la pila y del `Service`.
- Una operación inválida (pila vacía, cuenta inexistente, tipo desconocido)
  imprime el mensaje de la excepción y regresa al menú.

---

### Parte 6 — Conecte el menú en `Main`

**Archivo existente:** `src/Main.java`. El `Service` que ya se construye ahí se
comparte con el menú nuevo; no cree un segundo `Service`, porque tendría otras
cuentas y otras pilas.

```java
// Dentro de main, junto a lo que ya se construye
// TODO 1: crear MenuPilaView pasándole el mismo cuentaService
// TODO 2: ofrecer una opción en MenuPrincipal (o llamar a menuPila.iniciar()) para
//         entrar al menú de pilas
```

---

### Parte 7 — Liste el contenido sin destruirlo

El menú necesita mostrar **todas** las operaciones que se pueden deshacer, del
tope hacia abajo, sin perderlas. Pero el TAD no permite recorrer: una pila no
expone sus nodos, y un `pop` tras otro la dejaría vacía. El truco es una
segunda `Pila<Transaccion>` **auxiliar**: sacar todo de la original mientras
se va armando el texto del listado, y luego devolver cada elemento a la
original en el orden correcto.

**Archivo existente:** el mismo `Service` de la Parte 4. Agregue un sexto
método, `listarOperaciones`, que devuelve un `String` con una operación por
línea, numeradas desde el tope. La `Pila<T>` sigue sin salir del `Service`: la
`View` solo recibe texto.

```java
// Dentro de CuentaService (agregue: import model.structures.Pila;)

public String listarOperaciones(String numeroCuenta) {
    Cuenta cuenta = buscarCuentaOFallar(numeroCuenta);
    Pila<Transaccion> original = cuenta.getOperacionesRecientes();

    // TODO 1: si la original está vacía, devolver "No hay operaciones por deshacer"
    // TODO 2: crear la pila auxiliar vacía y un StringBuilder para armar el texto

    // TODO 3: mientras la original no esté vacía, retirar el tope (pop), agregar al
    //         StringBuilder una línea numerada con esa transacción (1., 2., 3.... con
    //         un contador que usted lleva) y apilarla en la auxiliar
    //         -- tras este ciclo la original queda vacía y la auxiliar tiene todo,
    //            pero en orden INVERSO al original

    // TODO 4: mientras la auxiliar no esté vacía, retirar su tope (pop) y apilarlo
    //         de vuelta en la original
    //         -- invertir dos veces devuelve el orden original; si omite este
    //            ciclo, listar destruye la pila

    // TODO 5: devolver el texto armado (toString del StringBuilder)
    return null; // reemplazar por el retorno del TODO 5
}
```

Luego agregue la **opción 6** al menú de la Parte 5 (`6. Listar operaciones`):
complete `listar()` en `MenuPilaView` para que pida la cuenta, llame a
`listarOperaciones` e imprima el texto que recibe. La `View` no arma ni
ordena nada.

**Requisitos:**
- Tras listar, la pila queda **idéntica**: mismo `size()` y mismo `peek()` que
  antes. Un `deshacer` inmediato devuelve la misma transacción que habría
  devuelto sin listar.
- Con la pila vacía no lanza excepción: devuelve el mensaje "No hay
  operaciones por deshacer".
- No agrega ningún método a `Pila<T>`; el recorrido usa solo las cinco
  operaciones del TAD.

**Punto de control:** registre tres operaciones, liste (aparecen de la tercera
a la primera), liste otra vez (el resultado es el mismo) y compruebe con
`contarOperaciones` que siguen siendo 3.

---

## Entregable

Repositorio de su proyecto de aula en GitHub, con la rama
`feature/pila-en-el-proyecto` fusionada a `main`. El entregable es el estado del
repositorio al vencer el plazo; no se entrega `.zip`.

```
proyecto-aula/
  README.md                     # secuencia de verificación
  src/
    Main.java                   # cablea el menú de pilas
    view/
      MenuPilaView.java         # nuevo: menú de las cinco operaciones y el listado
    service/
      <Service de la entidad>.java   # seis métodos nuevos (cinco del TAD + listarOperaciones)
    model/
      domain/
        <Entidad que aloja la pila>.java   # atributo y getter nuevos
      structures/
        Nodo.java               # ya existe
        ListaSimple.java        # ya existe
        Pila.java               # nuevo
```

El `README.md` incluye el resultado de ejecutar esta **secuencia de verificación** desde el menú (texto pegado de la
consola o capturas):

1. Registrar tres operaciones sobre la misma cuenta.
2. Consultar la última operación y comprobar que es la tercera.
3. Contar: debe decir 3. Listar: aparecen la tercera, la segunda y la primera,
   en ese orden; listar otra vez da lo mismo y contar sigue diciendo 3.
4. Deshacer una operación: debe devolver la tercera y dejar el saldo como
   estaba antes de ella.
5. Contar: debe decir 2.
6. Deshacer las dos restantes. Preguntar si hay operaciones: debe decir que no.
7. Intentar deshacer otra vez: el menú muestra el mensaje de pila vacía y sigue
   funcionando.

**Plazo de entrega:** por definir. Se anunciará junto con el laboratorio de
Colas, que continúa sobre este mismo proyecto.

---

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **`Pila<T>` correcta** | 25 | `push`, `pop`, `peek`, `isEmpty` y `size` funcionan con `Nodo<T>`, cuestan O(1) sin ningún ciclo, mantienen `tamano` al día y no importan nada de `java.util`; `push` enlaza el nodo nuevo al tope **antes** de mover el tope. |
| **Casos límite** | 10 | `pop` y `peek` sobre pila vacía lanzan `IllegalStateException` con mensaje; `push(null)` lanza `IllegalArgumentException` sin alterar la pila; ninguna operación devuelve `null` para señalar un error. |
| **Integración en entidad y `Service`** | 25 | La pila es un atributo `private` de la entidad indicada en la Parte 1 e inicializado en el constructor; el `Service` expone los cinco métodos más `listarOperaciones`, ninguno devuelve ni recibe `Pila<T>`, deshacer revierte el efecto en el dominio sin volver a apilar, y listar deja la pila intacta (mismo tamaño y mismo orden). |
| **Menú en `view/`** | 15 | `MenuPilaView` ofrece las cinco operaciones y el listado, cada opción llama a un solo método del `Service`, no importa nada de `model.structures`, y una pila vacía no cierra el programa. |
| **Pruebas y documentación** | 10 | El `README.md` contiene la secuencia de verificación completa con los resultados esperados. |
| **Buenas prácticas** | 15 | Commits descriptivos y frecuentes sobre la rama `feature/`, fusionada a `main`; nombres de clases, métodos y variables siguiendo las convenciones de Java. |
| **TOTAL** | **100** | |

---

## Dificultades Comunes

### "Hice push y después size() dice 3 pero al deshacer solo sale el último"
- Casi siempre es el orden de las dos líneas de `push`. Si primero mueve el
  `tope` al nodo nuevo y después enlaza `nuevo.setSiguiente(tope)`, el nodo
  nuevo se apunta a sí mismo y los anteriores quedan inalcanzables. Primero se
  enlaza hacia abajo, después se mueve el tope.

### "`pop` me lanza NullPointerException en vez de mi mensaje"
- Falta la validación de pila vacía al inicio de `pop`. Sin ella, `tope.getDato()`
  se ejecuta con `tope == null`. Valide primero, antes de tocar el tope.

### "Al deshacer, el saldo queda mal"
- Revise que está revirtiendo el efecto contrario al de la transacción: un
  depósito se deshace retirando, un retiro se deshace depositando. Y verifique
  que `deshacerUltimaOperacion` no llama a `registrarOperacion`: si lo hace,
  deshacer se apila a sí mismo y la pila nunca se vacía.

### "La primera vez que registro algo sale NullPointerException"
- Declaró el atributo de la pila en la entidad pero no lo creó en el
  constructor. Falta `this.operacionesRecientes = new Pila<>();`.

### "¿Puedo agregarle a Pila un método para ver el elemento del medio?"
- No. Una pila solo da acceso al tope: esa restricción es lo que garantiza LIFO.
  Si necesita ver todo el contenido, use la pila auxiliar de la Parte 7, que lo lista sin destruirlo.

### "Mi proyecto no tiene una entidad dueña natural para la pila"
- Es el caso de la Papelería: no existe una entidad que contenga todas las
  ventas. Deje la pila en el `Service` de ventas, mantenga la regla de que la `View` no la conoce.

---

## Extensiones Sugeridas (Bonus)

- Limite la pila a las últimas 10 operaciones por cuenta y explique qué
  estructura de las vistas usaría para descartar la más antigua.
- Implemente `rehacer` con una segunda pila: lo que se deshace se apila allí, y
  `rehacer` lo devuelve a la primera.
- Resuelva, usando solo `Pila<Character>`, el balanceo de paréntesis de una
  expresión y exponga la verificación como una opción más del menú.

---

## Recursos

- **Lección:** "Implementación de pilas en Java" — el código de `push`, `pop` y
  `peek` que se adapta en la Parte 2.
- **Lección:** "Nodos y memoria dinámica en Java" — `Nodo<T>` y sus métodos de
  acceso.
- **Documentación de Java:** `IllegalStateException` e `IllegalArgumentException`
  en la API de `java.lang`.
- **Proyecto de aula:** la sección "Sprint 3 — Pilas y Colas" de la descripción
  de su caso de estudio.
