> Sesión teórica con demo en vivo — no hay guía de laboratorio para esta
> sesión. La lección `Fundamentos de archivos` es lectura previa: el grupo ya
> conoce la pizarra (la memoria que se borra) y el cuaderno (el archivo que se
> conserva), y respondió el cuestionario de cierre. Ese cuaderno es el hilo de
> toda la sesión: abrir, escribir al final o desde cero, leer de principio a
> fin, cerrar, y qué pasa si no está en el estante. Hoy solo se usan `File`,
> `FileWriter` y `FileReader`; **no** se adelanta `BufferedReader` /
> `BufferedWriter`, `try-with-resources` ni el manejo de excepciones (son de la
> sesión siguiente): los métodos declaran `throws IOException` y el `main`
> también. Tampoco se tocan archivos binarios (Semana 11). Antes de empezar,
> abrir VS Code en la **carpeta raíz del proyecto** y ejecutar siempre desde
> ahí: las rutas relativas como `data/clientes.txt` se resuelven contra la
> carpeta desde la que corre el programa, y es la fuente número uno de
> "no me aparece el archivo". Los Pasos 1 a 4 son clases sueltas de demo; el
> Paso 5 las lleva al proyecto de aula, con la arquitectura
> `View → Service → Model` y `ConsoleUtils` (la clase de utilidad del
> laboratorio de pilas, en `utils`).

## Paso 1 — `File`: la portada del cuaderno

Recordar en voz alta la analogía: la portada dice cómo se llama el cuaderno y
en qué estante está; mirar la portada no lo abre. `File` es la portada: guarda
una **ruta** y deja preguntar por ella. Crear un `File` no crea nada en el
disco. Pedir al grupo que prediga cada línea antes de ejecutar.

```java
import java.io.File;

public class DemoFile {
    public static void main(String[] args) {
        // Solo guarda la ruta. No abre, no lee y no crea nada en el disco.
        File archivo = new File("data/clientes.txt");

        System.out.println("Nombre:   " + archivo.getName());            // clientes.txt
        System.out.println("Ruta:     " + archivo.getPath());            // data/clientes.txt (o data\clientes.txt en Windows)
        System.out.println("Absoluta: " + archivo.getAbsolutePath());    // dónde buscará Java de verdad
        System.out.println("¿Existe?  " + archivo.exists());             // false: nadie lo ha creado
        System.out.println("¿Archivo? " + archivo.isFile());             // false: isFile exige que exista
        System.out.println("Tamaño:   " + archivo.length());             // 0: un archivo inexistente mide 0

        // getParentFile() devuelve otro File: la carpeta que contiene al archivo
        File carpeta = archivo.getParentFile();
        System.out.println("¿Existe data/? " + carpeta.exists());        // false la primera vez
    }
}
```

Punto a resaltar: dos cosas. Primera, abrir el explorador de VS Code mientras
corre: **no apareció ninguna carpeta `data/` ni ningún archivo**; tener un
`File` no garantiza que el archivo exista. Segunda, `getAbsolutePath()`: es la
ruta real donde Java va a buscar y a escribir; si no coincide con la carpeta
que el grupo cree, el problema es desde dónde se ejecuta, no el código.

## Paso 2 — `FileWriter`: escribir en el cuaderno

Ahora sí se abre el cuaderno. Escribir primero la versión directa, como la
escribiría un estudiante que acaba de leer la lección.

**🐞 Error planeado:** crear la clase `DemoWriter` y escribir, sin crear la
carpeta antes:

```java
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class DemoWriter {
    public static void main(String[] args) throws IOException {
        File archivo = new File("data/clientes.txt");
        FileWriter escritor = new FileWriter(archivo);   // aquí revienta si data/ no existe
        escritor.write("Ana");
        escritor.close();
    }
}
```

**Síntoma:** con la carpeta `data/` sin crear, la ejecución termina en una
`FileNotFoundException` con un mensaje del estilo
`data/clientes.txt (No such file or directory)` (en Windows, "El sistema no
puede encontrar la ruta especificada"). Llama la atención porque el archivo
**no** tenía por qué existir: `FileWriter` crea el archivo, pero no crea
carpetas.

**Pregunta al grupo:** "La lección dijo que `FileWriter` crea el archivo si no
existe. ¿Entonces qué es lo que no existe? ¿Qué le falta al cuaderno para
poder dejarlo en el estante?"

**Corrección:** antes de abrir el flujo, asegurar que la carpeta exista con
`mkdirs()`. Aprovechar para mostrar las dos formas de abrir: sobrescribir y
agregar.

```java
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class DemoWriter {

    // Escribe texto en el archivo. agregar = true: al final; false: desde cero.
    public static void guardar(File archivo, String texto, boolean agregar) throws IOException {
        File carpeta = archivo.getParentFile();
        if (carpeta != null && !carpeta.exists()) {
            carpeta.mkdirs();                    // crea data/ (y las carpetas intermedias que falten)
        }
        FileWriter escritor = new FileWriter(archivo, agregar);   // true agrega; false sobrescribe
        escritor.write(texto);                   // escribe los caracteres en secuencia
        escritor.close();                        // cierra el cuaderno: aquí queda realmente en disco
    }

    public static void main(String[] args) throws IOException {
        File archivo = new File("data/clientes.txt");

        guardar(archivo, "Ana" + System.lineSeparator(), false);     // desde cero: el archivo queda solo con Ana
        guardar(archivo, "Bruno" + System.lineSeparator(), true);    // al final: Ana y Bruno
        guardar(archivo, "Carla" + System.lineSeparator(), true);    // Ana, Bruno y Carla

        System.out.println("Tamaño: " + archivo.length() + " bytes");
    }
}
```

Abrir `data/clientes.txt` en VS Code: tres líneas, una por nombre.
`System.lineSeparator()` es el salto de línea del sistema operativo; sin él
los tres nombres quedarían pegados en una sola línea (`AnaBrunoCarla`). Para
ver por qué el `true` importa, cambiar el segundo y tercer `guardar` a `false`
y volver a correr: el archivo queda solo con `Carla`.

**🐞 Error planeado:** ahora olvidar el cierre. Comentar la línea
`escritor.close();`, borrar `data/clientes.txt` y correr de nuevo con un solo
`guardar(archivo, "Ana" + System.lineSeparator(), false);`.

**Síntoma:** el programa termina sin errores, el archivo `data/clientes.txt`
**existe**, pero el tamaño impreso es `0 bytes` y al abrirlo en el editor está
vacío. La escritura "se hizo" y sin embargo no hay nada.

**Pregunta al grupo:** "El cuaderno está en el estante pero sin una sola
palabra. ¿Qué paso del ritual nos saltamos?"

**Corrección:** restaurar `escritor.close();`. Los datos se acumulan primero en
un área intermedia de memoria y es el cierre el que los vuelca al archivo. Es
la fila `FileWriter` del resumen de la lección: "si olvidas `close()`, lo
escrito puede perderse". Y es un error silencioso: nada falla, solo falta el
contenido.

Punto a resaltar: el archivo se **creó** pero quedó vacío, así que "el
archivo existe" no demuestra que lo escrito llegó. Anticipar sin resolverlo:
`close()` se nos puede olvidar o puede no ejecutarse si algo falla antes; la
forma segura de garantizarlo se ve en la próxima sesión.

## Paso 3 — Texto o binario: qué hay realmente dentro del archivo

Con el archivo ya escrito se puede mirar su contenido con evidencia. Todo
archivo son bytes; en uno de texto, esos bytes son caracteres. Medir cuántos
bytes ocupa lo que se escribió:

```java
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class DemoBytes {
    public static void main(String[] args) throws IOException {
        File archivo = new File("data/bytes.txt");
        archivo.getParentFile().mkdirs();            // si data/ ya existe, mkdirs() simplemente devuelve false

        String texto = "José";
        FileWriter escritor = new FileWriter(archivo);
        escritor.write(texto);
        escritor.close();

        System.out.println("Caracteres: " + texto.length());                  // 4
        System.out.println("Bytes:      " + archivo.length());                // 5: la é ocupa 2 bytes en UTF-8

        // Un número escrito como texto ocupa un byte por dígito
        File numero = new File("data/numero.txt");
        FileWriter escritorNumero = new FileWriter(numero);
        escritorNumero.write("1000000");              // siete caracteres
        escritorNumero.close();

        System.out.println("Bytes del número como texto: " + numero.length());   // 7
        // Guardado en binario, un int de Java ocupa siempre 4 bytes (se verá en la Semana 11)
    }
}
```

Punto a resaltar: tres ideas.

- **Caracteres no es lo mismo que bytes.** `"José"` tiene 4 caracteres y 5
  bytes. Java 21 usa **UTF-8** por defecto, y por eso las tildes y la ñ ocupan
  más de un byte. Un archivo escrito con otro juego de caracteres y leído como
  UTF-8 muestra símbolos extraños (es la segunda grieta de la analogía de la
  lección).
- **El texto es legible pero más grande.** El número `1000000` ocupa 7 bytes
  como texto; el mismo número, en binario, ocuparía 4. A cambio, el de texto
  se abre con cualquier editor.
- **Mostrar un binario.** Abrir en VS Code un archivo `.class` compilado o una
  imagen `.png`: el editor no puede mostrarlo como texto. Esa es la diferencia
  que define la lección: texto lo lee cualquiera; binario solo el programa que
  lo escribió.

Cerrar con la decisión según el contexto, que es la pregunta de diseño que
conviene dejar clara antes de Sprint 4:

| Contexto | Conviene | Por qué |
|---|---|---|
| Lista de clientes que el docente o el equipo quiere revisar a ojo | Texto | Se abre con cualquier editor y se depura leyéndolo |
| Archivo que se versiona en Git y se compara entre commits | Texto | Git muestra las diferencias línea a línea |
| Datos que solo el programa lee y que deben ocupar poco espacio | Binario | Más compacto y más rápido, pero ilegible |
| Intercambio con otros programas o sistemas | Texto | Cualquier lenguaje puede leerlo sin conocer un formato propio |

## 🗳️ Votación — qué queda en el archivo

Cuándo: tras el Paso 3, antes de pasar a la lectura. Proyectar el código sin
ejecutarlo (cada línea de abajo es `guardar(...)`, el método del Paso 2, con
el texto y el modo indicados):

```java
File f = new File("data/demo.txt");
guardar(f, "A", false);
guardar(f, "B", true);
guardar(f, "C", false);
guardar(f, "D", true);
```

¿Qué contiene `data/demo.txt` al terminar? (Se asume que `data/` ya existe.)

- (a) `ABCD`
- (b) `CD`
- (c) `D`
- (d) `AB`

Correcta: (b). Primera llamada: modo `false`, el archivo queda con `A`.
Segunda: `true`, agrega y queda `AB`. Tercera: `false`, **sobrescribe**: se
descarta todo y queda `C`. Cuarta: `true`, agrega y queda `CD`.

Qué revela cada distractor:

- (a) → cree que `FileWriter` siempre agrega (ignora que el modo sin `true`
  reemplaza el contenido); suma las cuatro escrituras sin darse cuenta de
  que la tercera borra lo anterior.
- (c) → cree que el modo `true` también sobrescribe, o que cada llamada
  reemplaza a la anterior; confunde el significado del segundo argumento.
- (d) → cree que si el archivo ya existe, el modo sin `true` "no hace nada" y
  deja el contenido anterior; o razona que la tercera llamada falla y la
  cuarta no llega a agregarse.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (ejecuta el código
y abre el archivo después de cada llamada).

## Paso 4 — `FileReader`: leer el cuaderno de principio a fin

Leer es recorrer el cuaderno letra a letra hasta que no quede nada.
`read()` devuelve un `int`: el código del siguiente carácter, o `-1` cuando se
acabó el archivo. Se guarda en `int` y se compara con `-1` **antes** de
convertir a `char`.

```java
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class DemoReader {

    // Muestra el archivo carácter a carácter, con su código numérico.
    public static void mostrar(File archivo) throws IOException {
        FileReader lector = new FileReader(archivo);   // abre el cuaderno; lanza FileNotFoundException si no existe
        int c = lector.read();                         // primer carácter como int, o -1 si el archivo está vacío
        while (c != -1) {                              // -1 es el "no hay más hojas"
            System.out.println(c + " -> " + (char) c); // ahora sí se convierte a char para mostrarlo
            c = lector.read();                         // avanza: si olvidas esta línea, el ciclo nunca termina
        }
        lector.close();                                // se cierra también el cuaderno que se leyó
    }

    public static void main(String[] args) throws IOException {
        mostrar(new File("data/bytes.txt"));           // el archivo con "José" del Paso 3
    }
}
```

Salida esperada: `74 -> J`, `111 -> o`, `115 -> s`, `233 -> é`.

Punto a resaltar: cuatro lecturas, no cinco. El archivo mide 5 bytes, pero
el `FileReader` entrega **caracteres**: decodifica el UTF-8 y la `é` llega
como un solo `233`. Esa es la diferencia entre los flujos de caracteres
(`Reader`/`Writer`) y los de bytes que vienen después. Ahora mostrar lo que
pasa cuando el cuaderno no está en el estante, para que el grupo vea el mismo
error de la tabla de la lección:

```java
File faltante = new File("data/no-existe.txt");

System.out.println(faltante.exists());   // false: la portada ya avisa
mostrar(faltante);                       // FileNotFoundException: data/no-existe.txt (No such file or directory)
```

Con la excepción visible, preguntar qué hubiera permitido evitarla:
consultar `exists()` antes de abrir. Dejar la idea planteada (en la próxima
sesión se trata el manejo de fallos de forma completa).

## 🗳️ Votación — qué devuelve `read()`

Cuándo: tras el Paso 4, antes de llevar todo al proyecto. Suponer que
`data/hi.txt` contiene exactamente los dos caracteres `Hi` (sin salto de
línea). Proyectar el código sin ejecutarlo:

```java
FileReader r = new FileReader(new File("data/hi.txt"));
System.out.println(r.read());
System.out.println((char) r.read());
System.out.println(r.read());
r.close();
```

¿Qué imprime, línea por línea?

- (a) `72`, `i`, `0`
- (b) `72`, `i`, `-1`
- (c) `H`, `i`, `-1`
- (d) `72`, `105`, `-1`

Correcta: (b). La primera lectura devuelve el código de `H`, que es `72` (se
imprime como `int`). La segunda lectura devuelve el código de `i`; el cast a
`char` lo muestra como `i`. La tercera no encuentra más caracteres y
devuelve `-1`.

Qué revela cada distractor:

- (a) → entiende la secuencia, pero cree que el fin de archivo se señala con
  `0`; olvida que `0` es un carácter válido y que por eso el fin es `-1`.
- (c) → cree que `read()` devuelve un `char`: no se da cuenta de que la
  primera línea imprime el número, porque no hay conversión.
- (d) → cree que `println` muestra el código siempre, sin ver que el cast
  `(char)` cambia lo que se imprime en la segunda línea.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir (ejecuta el código
quitando el cast para que vean la diferencia).

## Paso 5 — Al proyecto de aula: guardar y mostrar clientes desde el `Service`

Es el primer paso de la persistencia del Sprint 4: sacar datos de la pizarra
al cuaderno. La regla de la lección: **solo el `Service` toca el sistema de
archivos**; ni la `View` ni el `Model` leen o escriben. El ejemplo usa
`Cliente` del Sistema Bancario, pero cada equipo lo hace con **la entidad
principal de su caso de estudio** (en la lección está la tabla de qué archivo
corresponde a cada proyecto: `inventario.txt`, `pacientes.txt`, `mascotas.txt`,
`estudiantes.txt`, `partidos.txt`, y así).

El `Model` sigue siendo un objeto de dominio, sin una sola línea de archivos:

```java
package model.domain;

public class Cliente {
    private final String identificacion;
    private final String nombre;
    private final String telefono;

    public Cliente(String identificacion, String nombre, String telefono) {
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.telefono = telefono;
    }

    public String getIdentificacion() { return identificacion; }
    public String getNombre() { return nombre; }
    public String getTelefono() { return telefono; }
}
```

El `Service` es el único que sabe que existe un archivo. Por ahora cada
cliente es **una línea** con sus datos separados por `;`. Esa línea se arma
con una concatenación sencilla; leerla de vuelta para reconstruir el objeto
es el trabajo de la próxima sesión, hoy solo se guarda y se muestra.

```java
package service;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

import model.domain.Cliente;

public class ClienteService {
    // La ruta se define una sola vez: la View no sabe ni le importa dónde se guarda
    private static final File ARCHIVO = new File("data/clientes.txt");

    // Agrega un cliente al final del archivo (una línea por cliente)
    public void guardar(Cliente cliente) throws IOException {
        File carpeta = ARCHIVO.getParentFile();
        if (!carpeta.exists()) {
            carpeta.mkdirs();                              // el error planeado del Paso 2, ya resuelto
        }
        FileWriter escritor = new FileWriter(ARCHIVO, true);   // true: no borra los clientes anteriores
        escritor.write(aLinea(cliente) + System.lineSeparator());
        escritor.close();                                  // sin esto la línea no llega al disco
    }

    // Devuelve todo el contenido del archivo como texto; "" si aún no existe
    public String leerTodo() throws IOException {
        if (!ARCHIVO.exists()) {
            return "";                                     // primera ejecución: el cuaderno aún no existe
        }
        FileReader lector = new FileReader(ARCHIVO);
        StringBuilder contenido = new StringBuilder();     // acumula los caracteres sin crear un String por letra
        int c = lector.read();
        while (c != -1) {
            contenido.append((char) c);
            c = lector.read();
        }
        lector.close();
        return contenido.toString();
    }

    // Formato de una línea: identificacion;nombre;telefono
    private String aLinea(Cliente cliente) {
        return cliente.getIdentificacion() + ";" + cliente.getNombre() + ";" + cliente.getTelefono();
    }
}
```

La `View` solo pide datos con `ConsoleUtils` y llama al `Service`. No importa
`File`, `FileWriter` ni `FileReader`:

```java
package view;

import java.io.IOException;

import model.domain.Cliente;
import service.ClienteService;
import utils.ConsoleUtils;

public class ClienteView {
    private final ClienteService servicio = new ClienteService();

    public void menu() throws IOException {
        int opcion;
        do {
            System.out.println("\n1. Registrar cliente");
            System.out.println("2. Ver archivo de clientes");
            System.out.println("0. Salir");
            opcion = ConsoleUtils.leerEntero("Elija una opción: ");

            if (opcion == 1) {
                registrar();
            } else if (opcion == 2) {
                mostrar();
            }
        } while (opcion != 0);
    }

    private void registrar() throws IOException {
        String identificacion = ConsoleUtils.leerTexto("Identificación: ");
        String nombre = ConsoleUtils.leerTexto("Nombre: ");
        String telefono = ConsoleUtils.leerTexto("Teléfono: ");
        servicio.guardar(new Cliente(identificacion, nombre, telefono));
        System.out.println("Cliente guardado.");
    }

    private void mostrar() throws IOException {
        String contenido = servicio.leerTodo();
        if (contenido.isEmpty()) {
            System.out.println("Todavía no hay clientes guardados.");   // cuaderno vacío o inexistente
        } else {
            System.out.print(contenido);                                // ya trae sus propios saltos de línea
        }
    }
}
```

```java
import java.io.IOException;

import view.ClienteView;

public class Main {
    public static void main(String[] args) throws IOException {
        new ClienteView().menu();
    }
}
```

Hoy cada capa solo propaga `throws IOException` hasta el `main`; quién la
atrapa y qué se hace con ella es tema de la próxima sesión.

Demo: registrar dos clientes, opción 2, cerrar el programa **completamente**,
volver a ejecutarlo y pedir la opción 2: los clientes siguen ahí. Eso es
persistencia: el cuaderno sobrevivió a que se borrara la pizarra. Abrir
`data/clientes.txt` en VS Code para verlo con los propios ojos.

Punto a resaltar: tres decisiones de diseño. Primera, `leerTodo()` devuelve
un `String`: la `View` no sabe que hay un archivo detrás. Segunda,
`guardar()` abre en modo agregar: registrar un cliente nuevo no destruye a los
anteriores. Tercera, lo que falta y que la lección ya anunció: hoy el archivo
es solo **texto suelto**. No hay forma de volver a tener objetos `Cliente` ni
una lista enlazada con ellos; leer línea por línea, manejar los fallos y
reconstruir la lista en memoria es el trabajo de la sesión siguiente.

## 👥 Reto en parejas — contar cuántos clientes hay guardados

Tiempo sugerido: 15 min.

Roles: *driver* escribe el código, *navigator* dicta la idea y revisa; cambian
de rol a mitad del tiempo.

Enunciado: agreguen al `ClienteService` un método `contarRegistros()` que
devuelva cuántos clientes hay guardados en `data/clientes.txt`, sin imprimir
nada. Cada cliente es una línea y toda línea termina con un salto de línea.
Condiciones: usar solo `File`, `FileReader` y un ciclo con `read()` (nada de
`java.util`, ni leer el archivo completo a un `String` primero), y devolver
`0` si el archivo todavía no existe en lugar de lanzar una excepción. Pista:
cada registro termina con el carácter `'\n'`.

Solución de referencia:

```java
// En ClienteService
public int contarRegistros() throws IOException {
    if (!ARCHIVO.exists()) {
        return 0;                       // sin archivo no hay clientes: evita la FileNotFoundException
    }
    FileReader lector = new FileReader(ARCHIVO);
    int registros = 0;
    int c = lector.read();
    while (c != -1) {
        if (c == '\n') {                // cada salto de línea cierra un registro
            registros++;                // '\n' es un char: se compara con el int sin necesidad de cast
        }
        c = lector.read();
    }
    lector.close();
    return registros;
}
```

Para probarlo, agregar al `Main` (o a un `main` de prueba) tres llamadas a
`guardar` y comprobar:

```java
ClienteService servicio = new ClienteService();
System.out.println(servicio.contarRegistros());   // antes de guardar: 0 si el archivo no existe
servicio.guardar(new Cliente("1", "Ana", "300"));
servicio.guardar(new Cliente("2", "Bruno", "301"));
System.out.println(servicio.contarRegistros());   // 2 si el archivo estaba vacío al empezar
```

Punto a resaltar: el método funciona porque `guardar()` siempre escribe el
separador de línea al final de cada registro; si alguien editara el archivo
a mano y dejara una última línea sin salto, esa línea no se contaría. Preguntar
por el archivo vacío (da `0`) y por qué en Windows también funciona aunque el
salto sea `\r\n` (el ciclo cuenta cada `\n`, y esa secuencia solo tiene uno).
Es la base del problema de la próxima sesión: leer línea por línea sin
recorrer letra por letra.

## Preguntas socráticas

- *"¿Qué diferencia hay entre `new File("data/clientes.txt")` y
  `new FileWriter(new File("data/clientes.txt"))` en lo que pasa en el
  disco?"* — Respuesta esperada: `File` solo guarda la ruta, no toca el disco;
  `FileWriter` abre el flujo y, si el archivo no existe, lo crea (siempre que
  la carpeta exista).
- *"En el Paso 4, ¿qué pasa si convertimos con `(char) lector.read()` antes de
  comparar con `-1`?"* — Respuesta esperada: el `-1` convertido a `char`
  deja de ser `-1` (se vuelve el carácter de código 65535) y la condición
  `c != -1` es siempre verdadera: el ciclo no termina. Por eso se guarda en `int`
  y solo después se convierte.
- *"¿Por qué `guardar()` del Service usa `true` y no `false`? ¿Cuándo
  usaríamos `false`?"* — Respuesta esperada: `true` conserva los clientes
  anteriores; `false` conviene cuando se quiere reescribir el archivo entero
  con el estado actual de la memoria (por ejemplo, tras eliminar un cliente).
- *"¿Por qué el `Model` no debería tener un método `guardar()` que escriba el
  archivo?"* — Respuesta esperada: porque `Cliente` representa un cliente, no
  sabe cómo ni dónde se persiste; si mañana se cambia de `.txt` a binario,
  solo debe cambiar el `Service`.
- *"`close()` no dio error al olvidarlo. ¿Qué otro método de `FileWriter`
  evita perder datos sin cerrar, y por qué igual conviene cerrar?"* —
  Respuesta esperada: `flush()` vuelca lo pendiente al archivo, pero no
  libera el recurso; `close()` hace ambas cosas. Cerrar sigue siendo
  obligatorio.

## Práctica externa

Problemas para practicar después de la sesión. Son opcionales y se resuelven
en la plataforma externa; no valen nota en el curso. Ninguna de las dos
plataformas tiene problemas que lean o escriban archivos del disco: trabajan
con entrada y salida estándar, que son flujos igual que `FileReader`. Por eso
se eligen problemas que ejercitan la misma destreza de esta sesión: recorrer
una secuencia de caracteres de principio a fin y decidir qué hacer con cada
uno.

- **HackerRank — Java Stdin and Stdout II**:
  [hackerrank.com/challenges/java-stdin-stdout](https://www.hackerrank.com/challenges/java-stdin-stdout/problem).
  Leer datos de la entrada estándar (el flujo de entrada de la consola) e
  imprimirlos.
- **LeetCode 434 — Number of Segments in a String** (Fácil):
  [leetcode.com/problems/number-of-segments-in-a-string](https://leetcode.com/problems/number-of-segments-in-a-string/).
  Recorrer un `String` carácter a carácter y contar segmentos: el mismo ciclo
  de `read()` de esta sesión con otro criterio de conteo (como el reto en
  parejas).
- **LeetCode 58 — Length of Last Word** (Fácil):
  [leetcode.com/problems/length-of-last-word](https://leetcode.com/problems/length-of-last-word/).
  Recorrer una cadena y medir el último tramo, atendiendo a los espacios al
  final: practica el cuidado con el último "registro" sin salto.

> Comprobado el 2026-10-13: los dos de LeetCode existen con el número, el nombre y
> la dificultad indicados; el de HackerRank existe con ese nombre (su dificultad
> no se confirmó). Lo que no se probó es resolverlos.
