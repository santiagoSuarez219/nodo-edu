> Sesión teórica con demo en vivo — no hay guía de laboratorio para esta
> sesión. La lección `Lectura, escritura y modificación` es lectura previa: el
> grupo ya copió la agenda de la pizarra al cuaderno **por renglones** y
> respondió el cuestionario de cierre. Ese cuaderno sigue siendo el hilo:
> hoy se copia por páginas (`BufferedWriter` / `BufferedReader`), se cierra
> siempre aunque algo falle (try-with-resources), se decide cómo se separa un
> campo de otro (formato de una línea por registro, delimitador `;`) y, al
> final, la lista enlazada del proyecto viaja al archivo y vuelve. Esta
> sesión es también la práctica incorporada del Sprint 4: el Paso 7 deja el
> proyecto de aula funcionando de punta a punta. Alcance: **no** se
> modifican ni eliminan registros sueltos (archivo temporal: es la sesión del
> 16 de octubre) y **no** se tocan archivos binarios (`Data*Stream`,
> `Object*Stream`: Semana 11). Antes de empezar, abrir VS Code en la
> **carpeta raíz del proyecto** y ejecutar siempre desde ahí: `data/` es una
> ruta relativa. Los Pasos 1 a 3 son clases sueltas de demo (sin paquete); los
> Pasos 4 a 7 trabajan sobre el proyecto de aula con la arquitectura
> `View → Service → Model`, partiendo del código de ayer: `Cliente`
> (`model.domain`), `ClienteService` (`service`), `ClienteView` y `Main`, con
> `ConsoleUtils` en `utils`. El ejemplo usa `Cliente` del Sistema Bancario;
> cada equipo lo hace con **la entidad principal de su caso de estudio**,
> ajustando el número de campos.

## Paso 1 — `BufferedWriter` y `BufferedReader`: por páginas, no por letras

Recordar la analogía: ayer se copiaba la agenda letra a letra; hoy se copia
renglón por renglón. Los `Buffered*` no reemplazan a `FileWriter` y
`FileReader`: los **envuelven** y les añaden el buffer. Primero la copia:

```java
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class DemoBuffered {

    // Copia cada contacto en su propio renglón del archivo (sobrescribe lo anterior)
    public static void copiar(File archivo, String[] contactos) throws IOException {
        File carpeta = archivo.getParentFile();
        if (carpeta != null) {
            carpeta.mkdirs();                          // data/ puede no existir (el error del Paso 2 de ayer)
        }
        BufferedWriter escritor = new BufferedWriter(new FileWriter(archivo));   // envuelve al FileWriter de ayer
        for (String contacto : contactos) {
            escritor.write(contacto);                  // escribe el renglón...
            escritor.newLine();                        // ...y el salto de línea del sistema operativo
        }
        escritor.close();                              // cierra el Buffered y, con él, el FileWriter de adentro
    }

    public static void main(String[] args) throws IOException {
        File archivo = new File("data/agenda.txt");
        copiar(archivo, new String[] {"Ana;300123", "Bruno;300456", "Carla;300789", "Diego;300321"});
        // el Paso 1 sigue abajo: mostrar(archivo)
    }
}
```

Ejecutar y abrir `data/agenda.txt` en VS Code: cuatro renglones, uno por
contacto. Contrastar con ayer: `newLine()` reemplaza a
`System.lineSeparator()`, y cada `write` ya recibe un renglón completo, no
un carácter.

Ahora la lectura. Escribir `mostrar` en vivo, como la escribiría un
estudiante que acaba de leer la lección y recuerda que `readLine()` devuelve
`null` al final.

**🐞 Error planeado:** escribir el ciclo preguntando por la línea en la
condición y leyéndola otra vez dentro:

```java
// En DemoBuffered (agregar también: import java.io.BufferedReader y import java.io.FileReader)
public static void mostrar(File archivo) throws IOException {
    BufferedReader lector = new BufferedReader(new FileReader(archivo));
    while (lector.readLine() != null) {            // esta llamada ya consumió un renglón...
        System.out.println(lector.readLine());     // ...y esta lee (e imprime) el siguiente
    }
    lector.close();
}
```

**Síntoma:** con los cuatro contactos, el programa termina sin errores y
muestra solo `Bruno;300456` y `Diego;300321`: faltan Ana y Carla. Con un
archivo de cinco renglones, además, la última línea impresa es literalmente
`null`.

**Pregunta al grupo:** "El archivo tiene cuatro renglones y salieron dos.
¿Adónde fueron Ana y Carla? ¿Quién se las comió?"

**Corrección:** cada llamada a `readLine()` **avanza** el cursor, así que
llamarla dos veces por vuelta consume dos renglones. Una sola lectura antes
del ciclo y una sola al final del cuerpo, igual que el ritmo de `read()` de
ayer:

```java
// En DemoBuffered
public static void mostrar(File archivo) throws IOException {
    BufferedReader lector = new BufferedReader(new FileReader(archivo));
    String linea = lector.readLine();              // un renglón completo, o null si no hay más
    while (linea != null) {
        System.out.println(linea);
        linea = lector.readLine();                 // UNA sola lectura por vuelta, al final del cuerpo
    }
    lector.close();
}
```

Añadir `mostrar(archivo);` al final del `main` y ejecutar: los cuatro
renglones completos.

Punto a resaltar: es un error silencioso, igual que el `close()` olvidado de
ayer: nada falla, solo faltan datos. La regla que lo evita es guardar el
resultado en una variable y consultar **la variable**, nunca volver a llamar
al método.

## Paso 2 — Que siempre se cierre: `IOException` y try-with-resources

Plantear el problema con el código del paso anterior: si algo falla **entre**
abrir el lector y llegar a `lector.close()`, esa línea nunca corre y el
cuaderno queda abierto. Ayer se anticipó; hoy se resuelve. Además, `mostrar`
declara `throws IOException` y deja el problema a quien la llame: aquí se
decide qué hacer.

```java
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class DemoExcepciones {

    // Cuenta los renglones de un archivo; devuelve -1 si no existe o no se pudo leer
    public static int contarRenglones(File archivo) {
        int renglones = 0;
        try (BufferedReader lector = new BufferedReader(new FileReader(archivo))) {   // el recurso va entre paréntesis
            String linea = lector.readLine();
            while (linea != null) {
                renglones++;
                linea = lector.readLine();
            }
            return renglones;
        } catch (FileNotFoundException e) {            // el más específico va primero
            System.out.println("Aún no hay datos: " + archivo.getName());
            return -1;
        } catch (IOException e) {                      // cualquier otro fallo de lectura
            System.out.println("Error leyendo el archivo: " + e.getMessage());
            return -1;
        }
        // no hay close(): try-with-resources ya lo llamó
    }

    public static void main(String[] args) {
        System.out.println(contarRenglones(new File("data/agenda.txt")));      // 4
        System.out.println(contarRenglones(new File("data/no-existe.txt")));   // aviso y luego -1
    }
}
```

Salida: `4`, luego `Aún no hay datos: no-existe.txt` y `-1`. Observar que
`main` ya no declara `throws`: el método capturó la excepción en vez de
propagarla.

Punto a resaltar: dos cosas. Primera, no hay `close()` por ningún lado y
aun así el archivo se cierra: el recurso declarado entre los paréntesis del
`try` se cierra al salir del bloque, con o sin excepción. Segunda, el orden
de los `catch`. Si el grupo no lo pregunta, provocarlo: intercambiar los dos
`catch` y compilar. `javac` rechaza el código con `error: exception
FileNotFoundException has already been caught`, porque una `IOException` ya
atraparía a cualquier `FileNotFoundException`: el segundo `catch` sería
inalcanzable. Volver a dejarlos en el orden correcto.

## 🗳️ Votación — cuándo se cierra cada recurso

Cuándo: tras el Paso 2, antes de pasar al formato de los registros. Proyectar
el código sin ejecutarlo. `Recurso` es una clase mínima que imprime al
cerrarse; implementa `AutoCloseable`, la interfaz que cumple también
`BufferedReader`, y por eso puede ir entre los paréntesis del `try`:

Para ejecutarlo, el `try` de abajo va dentro de un `main` (con
`import java.io.IOException;`), en el mismo archivo que `Recurso`:

```java
class Recurso implements AutoCloseable {
    private final String nombre;

    Recurso(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void close() {
        System.out.println("cierra " + nombre);
    }
}

try (Recurso a = new Recurso("A"); Recurso b = new Recurso("B")) {
    System.out.println("dentro");
    throw new IOException("falla");
} catch (IOException e) {
    System.out.println("catch: " + e.getMessage());
}
```

¿Qué imprime, línea por línea?

- (a) `dentro`, `cierra A`, `cierra B`, `catch: falla`
- (b) `dentro`, `catch: falla`, `cierra B`, `cierra A`
- (c) `dentro`, `cierra B`, `cierra A`, `catch: falla`
- (d) `dentro`, `catch: falla`

Correcta: (c). Al salir del bloque —aquí por la excepción— Java cierra los
recursos **en orden inverso** al que se declararon, y lo hace **antes** de
ejecutar el `catch`. Es como una pila de platos: el último que se abrió es
el primero que se cierra.

Qué revela cada distractor:

- (a) → sabe que los recursos se cierran antes del `catch`, pero asume que se
  cierran en el orden en que se declararon, como una fila; olvida el orden
  inverso.
- (b) → trata el try-with-resources como un `finally` que corre al final:
  cree que el `catch` va primero y el cierre después. En realidad, cuando
  el `catch` se ejecuta, los recursos ya están cerrados.
- (d) → cree que al lanzarse la excepción el programa salta directo al
  `catch` y los recursos quedan sin cerrar; justo el problema que
  try-with-resources existe para evitar.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (ejecuta el
código; ver las líneas en la consola sirve más que cualquier explicación).

## Paso 3 — Una línea, un registro: unir y separar campos

Hasta aquí el archivo guarda una línea suelta. Un registro con varios campos
(identificación, nombre, teléfono) necesita **un delimitador** que diga dónde
termina uno y empieza el otro. Es la raya que separa nombre de teléfono en
el cuaderno.

```java
public class DemoCsv {
    public static void main(String[] args) {
        // Escribir: unir los campos con el delimitador
        String linea = String.join(";", "1001", "Ana", "300123");
        System.out.println(linea);                                   // 1001;Ana;300123

        // Leer: separar por el delimitador
        String[] campos = linea.split(";", -1);
        System.out.println(campos.length + " campos: " + campos[1]);   // 3 campos: Ana

        // Un registro cuyo último campo (teléfono) quedó vacío
        String sinTelefono = "1002;Bruno;";
        System.out.println(sinTelefono.split(";").length);           // 2: el campo vacío del final desaparece
        System.out.println(sinTelefono.split(";", -1).length);       // 3: el -1 lo conserva
    }
}
```

Punto a resaltar: pedir al grupo que prediga las dos últimas líneas antes de
ejecutar. El `-1` no es un detalle: sin él, `split` descarta los vacíos del
final y el conteo de campos miente, y el conteo es lo que usaremos para
detectar un renglón dañado. Cerrar con la grieta de la analogía: **una
persona** que lee un renglón con un campo de menos intuye qué quiso decir;
el programa solo cuenta pedazos, así que validar es trabajo nuestro (se hace
en el Paso 6).

## Paso 4 — Preparar la lista: `getHead()`

Para guardar la lista hay que recorrerla desde fuera de `ListaSimple`, y la
clase todavía no deja ver su primer nodo: solo expone `estaVacia()` y
`getTamano()`. Es un cambio de una línea, que **cada estudiante necesita
hacer en su propia `ListaSimple`** antes de seguir (sin él, el `Service` del
Paso 5 no compila). Se agrega en la clase `ListaSimple<T>` de
`model.structures`, junto a los demás métodos; no se toca nada de lo
existente.

```java
// En ListaSimple<T>, junto a estaVacia() y getTamano()
public Nodo<T> getHead() {
    return head;    // devuelve el primer nodo: desde ahí se recorre con getSiguiente()
}
```

Punto a resaltar: con `getHead()` más `getDato()` y `getSiguiente()` de
`Nodo<T>` (que ya existen) alcanza para recorrer la lista nodo a nodo, igual
que el `recorrer` de las sesiones de listas. Una observación de diseño para
quien la pida: `getHead()` entrega un nodo interno y, en principio, quien lo
recibe podría reenlazarlo. Hoy se acepta por simplicidad; si el grupo
pregunta, dejar planteada la alternativa de que la propia lista ofrezca un
método de recorrido, sin resolverla.

## Paso 5 — Al proyecto: `guardar(ListaSimple)` en el `Service`

La regla de siempre: **solo el `Service` toca archivos**. Dos cambios sobre
el `ClienteService` de ayer. El primero, cosmético: `guardar(Cliente)`, que
agregaba un cliente al final, pasa a llamarse `agregar(Cliente)` (el cuerpo
no cambia) para dejar libre el nombre `guardar`. **Y la `ClienteView` de
ayer llamaba a `servicio.guardar(new Cliente(...))` en `registrar()`:** esa
llamada deja de compilar contra la firma nueva. Cámbiala ahora por
`servicio.agregar(new Cliente(...))`; si no, el proyecto no compila hasta el
Paso 7, donde la `View` se reemplaza entera. El segundo cambio es el método
nuevo, que no agrega: **reescribe todo el archivo** con lo que hay hoy en la
lista en memoria. Imports del `Service` tras los cambios de hoy:

```java
package service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import model.domain.Cliente;
import model.structures.ListaSimple;
import model.structures.Nodo;
```

**🐞 Error planeado:** escribir `guardar(ListaSimple<Cliente>)` copiando el
cuerpo de `agregar`, que es lo más natural: ya estaba hecho y funciona.

```java
// En ClienteService
public void guardar(ListaSimple<Cliente> clientes) throws IOException {
    ARCHIVO.getParentFile().mkdirs();
    try (BufferedWriter escritor = new BufferedWriter(new FileWriter(ARCHIVO, true))) {   // el true de agregar
        Nodo<Cliente> actual = clientes.getHead();
        while (actual != null) {
            escritor.write(aLinea(actual.getDato()));
            escritor.newLine();
            actual = actual.getSiguiente();
        }
    }
}
```

Antes de correr la prueba, **borra `data/clientes.txt`**: la demo de ayer lo
dejó con clientes, y esos renglones extra tapan el síntoma.

```java
// Prueba rápida, en un main aparte, sin pasar por la View
ClienteService servicio = new ClienteService();
ListaSimple<Cliente> lista = new ListaSimple<>();
lista.insertarFinal(new Cliente("1001", "Ana", "300123"));
lista.insertarFinal(new Cliente("1002", "Bruno", "300456"));
servicio.guardar(lista);
servicio.guardar(lista);                 // guardar la misma lista dos veces
System.out.print(servicio.leerTodo());
```

**Síntoma:** la lista tiene dos clientes, pero `leerTodo()` imprime **cuatro**
renglones: Ana y Bruno repetidos. Con la `View` del Paso 7 pasa igual: elegir
"Guardar" dos veces duplica el archivo, y como `cargar()` lo reconstruye
tal cual, cada ciclo de guardar y reabrir suma otra copia de todos.

**Pregunta al grupo:** "Guardé la misma lista dos veces y el archivo tiene
el doble. ¿Qué parte del método está pensando en 'agregar' cuando yo quería
'reescribir lo que hay en memoria'?"

**Corrección:** quitar el `true`. El modo agregar tiene sentido cuando se
suma un cliente al final; guardar **el estado completo** de la lista exige
sobrescribir, o cada guardado suma una copia más. Versión correcta:

```java
// En ClienteService
// Reescribe el archivo completo con lo que hay hoy en la lista
public void guardar(ListaSimple<Cliente> clientes) throws IOException {
    ARCHIVO.getParentFile().mkdirs();                 // si data/ ya existe, mkdirs() solo devuelve false
    try (BufferedWriter escritor = new BufferedWriter(new FileWriter(ARCHIVO))) {   // sin true: sobrescribe
        Nodo<Cliente> actual = clientes.getHead();    // por eso hizo falta getHead()
        while (actual != null) {                      // recorre la lista nodo a nodo
            escritor.write(aLinea(actual.getDato())); // un registro por renglón
            escritor.newLine();
            actual = actual.getSiguiente();
        }
    }                                                 // aquí se cierra el escritor, pase lo que pase
}

// Formato de una línea: identificacion;nombre;telefono (ahora con String.join, como en el Paso 3)
private String aLinea(Cliente cliente) {
    return String.join(";", cliente.getIdentificacion(), cliente.getNombre(), cliente.getTelefono());
}
```

Punto a resaltar: el mismo `true`/`false` de ayer, ahora con una decisión de
diseño detrás: **agregar** cuando se suma un registro, **reescribir** cuando
el archivo debe reflejar fielmente la memoria. Señalar también que el
`mkdirs()` del error de ayer sigue ahí: la primera vez que se guarda, `data/`
no existe.

## Paso 6 — `cargar()`: del cuaderno a la pizarra

Es el camino inverso y la pieza que pide el ejercicio de la sesión:
reconstruir la lista enlazada **desde el archivo**, y sin romperse si el
archivo todavía no existe. Dos decisiones que se dicen en voz alta: archivo
inexistente **no** es un error (es la primera ejecución: devuelve lista
vacía) y un renglón con un número de campos distinto de tres **sí** lo es
(se lanza una `IOException` que dice en qué renglón está el problema).

```java
// En ClienteService
// Reconstruye la lista desde el archivo; si el archivo no existe, devuelve una lista vacía
public ListaSimple<Cliente> cargar() throws IOException {
    ListaSimple<Cliente> clientes = new ListaSimple<>();
    if (!ARCHIVO.exists()) {
        return clientes;                              // primera ejecución: no hay datos, y eso no es un error
    }
    try (BufferedReader lector = new BufferedReader(new FileReader(ARCHIVO))) {
        int numero = 0;                               // para decir en qué renglón está el problema
        String linea = lector.readLine();
        while (linea != null) {
            numero++;
            if (!linea.isBlank()) {                   // tolera renglones en blanco
                clientes.insertarFinal(deLinea(linea, numero));
            }
            linea = lector.readLine();
        }
    }
    return clientes;
}

// Camino inverso de aLinea: valida que lleguen exactamente 3 campos y arma el objeto
private Cliente deLinea(String linea, int numero) throws IOException {
    String[] campos = linea.split(";", -1);           // -1: conserva el teléfono vacío del final
    if (campos.length != 3) {
        throw new IOException("Línea " + numero + " inválida: " + linea);
    }
    return new Cliente(campos[0], campos[1], campos[2]);
}
```

Punto a resaltar: tres detalles. Primero, el orden se conserva: como se
inserta al final, el primer renglón del archivo es el primer nodo de la
lista. Segundo, `cargar()` **no captura** la excepción: la declara con
`throws` y decide la `View`, que es quien puede hablarle al usuario. Tercero,
un gancho para el grupo: `insertarFinal` recorre la lista completa en cada
llamada para llegar al último nodo. ¿Cuánto cuesta cargar muchos clientes
así? Dejar la pregunta planteada y retomarla en las preguntas socráticas, sin
resolverla ahora.

## 🗳️ Votación — qué recibe quien llama a `cargar()`

Cuándo: tras el Paso 6, antes de armar la `View`. Suponer que
`data/clientes.txt` contiene exactamente estos tres renglones (al segundo le
falta el teléfono y su separador):

```text
1;Ana;300
2;Bruno
3;Carla;302
```

Proyectar el código sin ejecutarlo, con `servicio` un `ClienteService` y
`ListaSimple` ya importada:

```java
try {
    ListaSimple<Cliente> lista = servicio.cargar();
    System.out.println("Cargados: " + lista.getTamano());
} catch (IOException e) {
    System.out.println(e.getMessage());
}
```

¿Qué imprime?

- (a) `Línea 2 inválida: 2;Bruno`
- (b) `Cargados: 3`
- (c) `Cargados: 2`
- (d) `Cargados: 1`

Correcta: (a). `cargar()` lee `1;Ana;300` y la inserta, pero al llegar al
segundo renglón `split(";", -1)` entrega dos campos, `deLinea` lanza la
`IOException` y el método termina ahí: la lista a medias **no se devuelve**.
La `View` solo recibe la excepción, con el número del renglón y su texto.

Qué revela cada distractor:

- (b) → cree que el renglón incompleto se carga con el teléfono vacío; el
  `-1` le hace pensar que el campo faltante "se rellena" solo, cuando solo
  evita perder un campo que **sí** está vacío pero escrito.
- (c) → cree que `cargar()` salta el renglón dañado y sigue con el tercero;
  el código no tiene ningún `continue`, y la excepción interrumpe el método.
- (d) → imagina un resultado parcial: lo cargado hasta el error. Pero un
  método que lanza una excepción no devuelve nada; lo que armó queda
  descartado.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (ejecuta el
código con ese archivo en pantalla, y luego corrige el archivo para que
cargue los tres).

## Paso 7 — La `View`: cargar al arrancar, guardar a pedido

Se cierra el círculo del Sprint 4: el programa arranca, **trae del cuaderno
a la pizarra** lo que hubiera, el usuario trabaja en memoria con la lista
enlazada y, cuando lo pide, **guarda** el estado completo. La `View` es la
que atrapa la `IOException` y le habla al usuario; `Main` ya no necesita
`throws`.

```java
package view;

import java.io.IOException;

import model.domain.Cliente;
import model.structures.ListaSimple;
import model.structures.Nodo;
import service.ClienteService;
import utils.ConsoleUtils;

public class ClienteView {
    private final ClienteService servicio = new ClienteService();
    private ListaSimple<Cliente> clientes = new ListaSimple<>();   // la pizarra: lo que vive en memoria

    public void menu() {
        cargarAlIniciar();                                // del cuaderno a la pizarra, una vez, al arrancar
        int opcion;
        do {
            System.out.println("\n1. Registrar cliente");
            System.out.println("2. Listar clientes en memoria");
            System.out.println("3. Guardar en archivo");
            System.out.println("0. Salir");
            opcion = ConsoleUtils.leerEntero("Elija una opción: ");

            if (opcion == 1) {
                registrar();
            } else if (opcion == 2) {
                listar();
            } else if (opcion == 3) {
                guardar();
            }
        } while (opcion != 0);
    }

    private void cargarAlIniciar() {
        try {
            clientes = servicio.cargar();
            System.out.println(clientes.getTamano() + " cliente(s) cargado(s).");
        } catch (IOException e) {
            // La View es quien atrapa la excepción y le habla al usuario
            System.out.println("No se pudo cargar el archivo: " + e.getMessage());
            System.out.println("Se inicia con la lista vacía.");
        }
    }

    private void registrar() {
        String identificacion = ConsoleUtils.leerTexto("Identificación: ");
        String nombre = ConsoleUtils.leerTexto("Nombre: ");
        String telefono = ConsoleUtils.leerTexto("Teléfono: ");
        clientes.insertarFinal(new Cliente(identificacion, nombre, telefono));   // solo en memoria
        System.out.println("Cliente registrado (aún no está en el archivo).");
    }

    private void listar() {
        if (clientes.estaVacia()) {
            System.out.println("No hay clientes en memoria.");
            return;
        }
        Nodo<Cliente> actual = clientes.getHead();
        while (actual != null) {
            Cliente c = actual.getDato();
            System.out.println(c.getIdentificacion() + " | " + c.getNombre() + " | " + c.getTelefono());
            actual = actual.getSiguiente();
        }
    }

    private void guardar() {
        try {
            servicio.guardar(clientes);
            System.out.println(clientes.getTamano() + " cliente(s) guardado(s).");
        } catch (IOException e) {
            System.out.println("No se pudo guardar: " + e.getMessage());
        }
    }
}
```

```java
import view.ClienteView;

public class Main {
    public static void main(String[] args) {
        new ClienteView().menu();           // ya no declara throws: la View atrapa las IOException
    }
}
```

Demo, en este orden, con el grupo prediciendo cada resultado:

1. **Primera ejecución, sin `data/`** (borra la carpeta `data/` entera antes;
   la prueba del Paso 5 y `agenda.txt` ya la habían creado): imprime `0 cliente(s) cargado(s).` y el
   menú. Es la prueba de "archivo inexistente": el programa no se cae.
2. Registrar Ana y Bruno (dejar el teléfono de Bruno vacío), opción 2 para
   verlos en memoria, opción 3 para guardar, salir. Abrir `data/clientes.txt`:
   dos renglones, el segundo termina en `;`.
3. **Segunda ejecución:** `2 cliente(s) cargado(s).` y la opción 2 los lista,
   incluido Bruno con su teléfono vacío (gracias al `-1`). La lista enlazada
   viajó al archivo y volvió.
4. **Archivo dañado:** editar a mano `data/clientes.txt`, quitar un `;` del
   **primer renglón** (el de Ana) y ejecutar de nuevo: el programa no se cae, avisa
   `No se pudo cargar el archivo: Línea 1 inválida: ...` y arranca con la
   lista vacía.

Punto a resaltar: dos cosas. El `Service` no imprime ni pregunta nada; la
`View` no importa `File`, `BufferedReader` ni nada de `java.io` salvo
`IOException`. Y la grieta de la analogía de la lección: aquí **la pizarra
y el cuaderno pueden diferir**. Registrar un cliente solo cambia la memoria;
si el programa se cierra sin elegir "Guardar", ese cliente se pierde.
Preguntar al grupo cómo se cambiaría el diseño para evitarlo (guardar al
salir, guardar tras cada registro, o llamar a `agregar`) y qué cuesta cada
opción; no hace falta implementarlo hoy.

## 👥 Reto en parejas — respaldar el archivo de clientes

Tiempo sugerido: 15 min.

Roles: *driver* escribe el código, *navigator* dicta la idea y revisa; cambian
de rol a mitad del tiempo.

Enunciado: agreguen al `ClienteService` un método `respaldar()` que copie
`data/clientes.txt` a `data/clientes-respaldo.txt`, renglón por renglón, y
devuelva cuántos renglones copió. Condiciones: usar `BufferedReader` y
`BufferedWriter` declarados **juntos** en un único try-with-resources (dos
recursos separados por `;` dentro de los paréntesis), sin `catch` (el método
declara `throws IOException`), y devolver `0` sin crear el respaldo si el
archivo de clientes todavía no existe. Pista: es el ciclo de `cargar()` con
el cuerpo del ciclo de `guardar()`.

Solución de referencia:

```java
// En ClienteService
public int respaldar() throws IOException {
    if (!ARCHIVO.exists()) {
        return 0;                                   // sin archivo no hay nada que respaldar
    }
    File respaldo = new File(ARCHIVO.getParentFile(), "clientes-respaldo.txt");   // misma carpeta data/
    int copiadas = 0;
    try (BufferedReader lector = new BufferedReader(new FileReader(ARCHIVO));
         BufferedWriter escritor = new BufferedWriter(new FileWriter(respaldo))) {   // dos recursos, uno solo try
        String linea = lector.readLine();
        while (linea != null) {
            escritor.write(linea);                  // copia el renglón tal cual, sin interpretar los campos
            escritor.newLine();
            copiadas++;
            linea = lector.readLine();              // una sola lectura por vuelta
        }
    }                                               // cierra el escritor y luego el lector (orden inverso)
    return copiadas;
}
```

Para probarlo, agregar al `Main` (o a un `main` de prueba) un par de
llamadas:

```java
ClienteService servicio = new ClienteService();
System.out.println(servicio.respaldar());    // 0 si data/clientes.txt no existe; si existe, cuántos renglones tiene
```

Punto a resaltar: el método no usa `Cliente` ni `ListaSimple`: copia
**texto**, y por eso funciona aunque el archivo tenga un renglón dañado que
`cargar()` rechazaría. Conectar con la votación: este es el caso real de los
dos recursos y el orden inverso. Y adelantar sin resolver: un respaldo antes
de reescribir el archivo es la idea que reaparece el 16 de octubre, cuando se
hable de no perder datos si algo falla a mitad de escritura.

## Preguntas socráticas

- *"`cargar()` llama a `insertarFinal` una vez por cliente, y `insertarFinal`
  recorre la lista entera para llegar al último nodo. Si el archivo tiene
  100.000 clientes, ¿cuántas veces se avanza de nodo en total y cómo crece
  eso al doblar el archivo?"* — Respuesta esperada: la inserción número `k`
  recorre `k` nodos, así que el total es 0 + 1 + 2 + ... + (n − 1), alrededor
  de n²/2: crece **al cuadrado**, O(n²), no lineal. Doblar el archivo
  cuadruplica el tiempo (en una prueba previa con esta misma `ListaSimple`: 10.000 inserciones
  tardaron unos 70 ms, 40.000 unos 1,1 s y 80.000 unos 4,5 s; el número exacto depende de
  la máquina, la proporción no). Con unas decenas de clientes no se nota; la
  forma de evitarlo es que la lista guarde una referencia al último nodo
  (cola) y así insertar al final cueste O(1), o construirla de otra forma.
- *"Si `cargar()` falla por un renglón dañado, la `View` arranca con la lista
  vacía. Si el usuario registra un cliente y elige 'Guardar', ¿qué queda en
  el archivo?"* — Respuesta esperada: solo ese cliente. `guardar` sobrescribe
  con el estado de la memoria, y la memoria nunca recibió los demás: **se
  pierden** todos los clientes anteriores aunque el archivo estuviera casi
  bien. Se discute: no permitir guardar tras una carga fallida, avisar y
  pedir confirmación, o respaldar antes de sobrescribir (el reto).
- *"¿Qué pasa si el nombre de un cliente es `Ana;Paz`?"* — Respuesta
  esperada: `aLinea` escribe `1;Ana;Paz;300`, cuatro campos, y en la próxima
  ejecución `cargar()` lanza `IOException` en ese renglón. El delimitador no
  puede aparecer dentro de un campo; opciones: rechazar el carácter al
  registrar, escaparlo, o usar otro delimitador.
- *"¿Por qué `guardar(ListaSimple)` reescribe todo el archivo en vez de
  agregar solo lo nuevo? ¿Cuándo conviene cada uno?"* — Respuesta esperada:
  reescribir deja el archivo como espejo exacto de la memoria (útil cuando
  la lista cambia en cualquier posición); agregar es más barato cuando solo
  se suma un registro al final. El costo de reescribir crece con el tamaño
  del archivo.
- *"Si el programa se corta justo mientras `guardar` está sobrescribiendo,
  ¿en qué estado queda `data/clientes.txt`?"* — Respuesta esperada:
  `FileWriter` sin `true` **vacía el archivo al abrirlo**, así que un corte a
  la mitad deja el archivo vacío o con solo una parte de los clientes. Es la
  pregunta que abre la sesión del 16 de octubre (archivo temporal,
  integridad ante errores).

## Práctica externa

Problemas para practicar después de la sesión. Son opcionales y se resuelven
en la plataforma externa; no valen nota en el curso. Ninguna de las dos
plataformas tiene problemas que lean archivos del disco; estos eligen la
misma destreza de hoy: partir una línea de texto en campos y recorrer una
lista enlazada nodo a nodo.

- **HackerRank — Java String Tokens**:
  [hackerrank.com/challenges/java-string-tokens](https://www.hackerrank.com/challenges/java-string-tokens/problem).
  Partir una línea en palabras ignorando los separadores: el `split` de esta
  sesión, con delimitadores más variados.
- **LeetCode 468 — Validate IP Address** (Medio):
  [leetcode.com/problems/validate-ip-address](https://leetcode.com/problems/validate-ip-address/).
  Partir una cadena por un delimitador y validar **cuántos campos** llegan y
  qué tiene cada uno, como la validación de `deLinea`. Cuidado con los
  campos vacíos al final: en Java, `split` los descarta salvo que se pase
  `-1` como segundo argumento (y el punto, en una expresión regular, hay que
  escribirlo `"\\."`).
- **LeetCode 206 — Reverse Linked List** (Fácil):
  [leetcode.com/problems/reverse-linked-list](https://leetcode.com/problems/reverse-linked-list/).
  Recorrer una lista simple nodo a nodo con `getSiguiente()`, la misma
  mecánica que `guardar()` y el `listar()` de la `View`.

> Comprobado el 2026-10-14: los dos de LeetCode existen con el número, el
> nombre y la dificultad indicados (consulta a la API pública de LeetCode);
> el de HackerRank existe con ese nombre (la página responde con ese título;
> su dificultad no se confirmó). Lo que no se probó es resolverlos.
