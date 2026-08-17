> Sesión T4, teórica pero con código en vivo sobre `Cuenta` del Sistema
> Bancario — el mismo caso de referencia de Encapsulamiento. Cubre
> sobrecarga y `static`.

## Paso 1 — De dos métodos a uno sobrecargado

Partir del problema: `depositarConMonto(double)` y
`depositarConMontoYConcepto(double, String)` hacen lo mismo con distinta
cantidad de datos. Mostrar en vivo que Java permite un solo nombre,
`depositar`, con dos listas de parámetros distintas.

```java
public class Cuenta {
    private double saldo;

    public void depositar(double monto) {
        setSaldo(getSaldo() + monto);
    }

    public void depositar(double monto, String concepto) {
        setSaldo(getSaldo() + monto);
        registrarMovimiento(concepto);
    }
}
```

```java
Cuenta cuenta = new Cuenta();
cuenta.depositar(50000);                       // llama a la primera version
cuenta.depositar(200000, "Pago de nomina");    // llama a la segunda
```

Punto a resaltar: el compilador elige la versión **en tiempo de
compilación**, mirando cuántos argumentos hay y de qué tipo son — no hay
nada que decidir en tiempo de ejecución. Preguntar en voz alta, antes de
mostrar el código: "¿por qué Java no se confunde entre las dos?" y dejar
que el grupo llegue a "por la cantidad de argumentos" antes de confirmar.

## Paso 2 — Un dato que pertenece al banco, no a la cuenta

Plantear la pregunta: ¿cuántas cuentas ha creado el banco en total? Ese
dato no es de ninguna cuenta en particular. Mostrar en vivo por qué un
atributo normal no sirve (cada objeto tendría su propia copia, ninguna con
el total real) y resolver con `static`.

```java
public class Cuenta {
    private static int totalCuentasCreadas = 0;   // pertenece a la clase, no al objeto
    private String numeroCuenta;
    private double saldo;

    public Cuenta(String titular) {
        totalCuentasCreadas++;                      // se actualiza una sola vez, compartido
        this.numeroCuenta = generarNumeroDeCuenta(); // metodo estatico auxiliar
        this.saldo = 0;
    }

    private static String generarNumeroDeCuenta() {
        return "CTA-" + (1000 + totalCuentasCreadas);
    }

    public static int getTotalCuentasCreadas() {
        return totalCuentasCreadas;
    }
}
```

```java
Cuenta c1 = new Cuenta("Maria");
Cuenta c2 = new Cuenta("Andres");
System.out.println(Cuenta.getTotalCuentasCreadas());   // 2 — se llama sobre la clase, no sobre un objeto
```

Punto a resaltar: `generarNumeroDeCuenta()` es `static` y **no puede** leer
`saldo` ni `numeroCuenta` de ninguna cuenta en particular — no tiene `this`.
Proyectar el intento de acceder a `saldo` desde ahí para que el error de
compilación quede visible en pantalla, no solo descrito.

## Paso 3 — El contraejemplo: cuándo NO usar static

Cerrar con el error opuesto, deliberado, para fijar el criterio de
decisión:

```java
private static double saldo;   // INCORRECTO: cada cuenta necesita su propio saldo
```

Preguntar al grupo qué pasaría si esto compilara tal cual (todas las
cuentas compartirían el mismo saldo; depositar en una afectaría a todas) y
cerrar con la regla: **¿el dato describe a un objeto particular, o a la
clase como concepto?**

## Preguntas socráticas

- *"¿Por qué `depositar(50000)` y `depositar(200000, "Pago de nomina")`
  no generan ambigüedad para el compilador?"* — Respuesta esperada: porque
  Java decide por la cantidad y el tipo de los argumentos de cada llamada,
  no por el nombre del método, que es el mismo en ambas.
- *"Si `totalCuentasCreadas` fuera un atributo normal (sin `static`) de
  `Cuenta`, ¿qué valor tendría `c2.totalCuentasCreadas` después de crear
  `c1` y `c2`?"* — Respuesta esperada: 1, no 2 — cada objeto tendría su
  propia copia arrancando en 0, y `c2` solo se habría incrementado una vez,
  la suya propia.
- *"¿Por qué `generarNumeroDeCuenta()` puede ser `static` pero un método
  que calculara un descuento sobre `saldo` no podría serlo?"* — Respuesta
  esperada: porque `generarNumeroDeCuenta()` solo usa datos de la clase
  (`totalCuentasCreadas`), mientras que un descuento sobre `saldo` necesita
  el dato de una cuenta particular, y un método `static` no tiene acceso a
  ningún objeto concreto.
