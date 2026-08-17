> Sesión T1, teórica pero con código en vivo sobre `Tarjeta`/`TarjetaDebito`/
> `TarjetaCredito` del Sistema Bancario. El hilo: partir del código duplicado,
> extraerlo a una superclase, y luego construir/sobreescribir/reutilizar sobre
> esa jerarquía.

## Paso 1 — Del código duplicado a la superclase

Mostrar primero el problema, proyectando las dos clases con `abonar()`/
`pagar()` copiados:

```java
public class TarjetaDebito {
    private String numeroTarjeta;
    private double saldo;
    private double porcentajeCashback;

    public void abonar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto invalido");
        saldo += monto;
    }

    public void pagar(double monto) {
        if (monto > saldo) throw new IllegalArgumentException("Saldo insuficiente");
        saldo -= monto;
    }
}

public class TarjetaCredito {
    private String numeroTarjeta;
    private double saldo;
    private double cupoCredito;

    public void abonar(double monto) {          // <- identico al de arriba
        if (monto <= 0) throw new IllegalArgumentException("Monto invalido");
        saldo += monto;
    }

    public void pagar(double monto) {             // <- casi identico
        if (monto > saldo + cupoCredito) throw new IllegalArgumentException("Cupo insuficiente");
        saldo -= monto;
    }
}
```

Y resolver en vivo, extrayendo `numeroTarjeta`, `saldo` y `abonar()` a una
superclase `Tarjeta`:

```java
public class Tarjeta {
    protected String numeroTarjeta;
    protected double saldo;

    public void abonar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto invalido");
        saldo += monto;
    }

    public void pagar(double monto) {
        if (monto > saldo) throw new IllegalArgumentException("Saldo insuficiente");
        saldo -= monto;
    }
}

public class TarjetaDebito extends Tarjeta {
    private double porcentajeCashback;
}

public class TarjetaCredito extends Tarjeta {
    private double cupoCredito;
}
```

Punto a resaltar: `TarjetaDebito` y `TarjetaCredito` ya tienen
`numeroTarjeta`, `saldo`, `abonar()` y `pagar()` sin haberlos escrito —
proyectar `TarjetaDebito.class` vacía (solo el atributo propio) y hacer
notar que igual compila y funciona.

## Paso 2 — Por qué `protected` y no `private`

Sin código nuevo: proyectar la tabla de visibilidad y demostrar en vivo el
error de compilación cambiando momentáneamente `protected` por `private` en
`Tarjeta` y tratando de acceder a `saldo` desde `TarjetaDebito`.

```java
public class Tarjeta {
    private String numeroTarjeta;   // cambio deliberado, solo para la demo
    private double saldo;
    // ...
}
```

Punto a resaltar: el error de compilación (`saldo has private access in
Tarjeta`) es la evidencia — no basta con decir que `private` no se hereda,
hay que verlo fallar. Revertir a `protected` antes de seguir.

## Paso 3 — Constructor de la subclase y `super()`

```java
public class Tarjeta {
    protected String numeroTarjeta;
    protected double saldo;

    public Tarjeta(String numeroTarjeta, double saldo) {
        this.numeroTarjeta = numeroTarjeta;
        this.saldo = saldo;
    }
}

public class TarjetaDebito extends Tarjeta {
    private double porcentajeCashback;

    public TarjetaDebito(String numeroTarjeta, double saldo, double porcentajeCashback) {
        super(numeroTarjeta, saldo);   // 1. construye la parte de Tarjeta
        this.porcentajeCashback = porcentajeCashback;   // 2. construye lo propio
    }
}
```

```java
TarjetaDebito td = new TarjetaDebito("TD-1001", 500000, 0.02);
```

Punto a resaltar: comentar (con `//`) la primera línea de `super(...)` y
mostrar el error de compilación. Después, mover `super(...)` a una línea
distinta de la primera y mostrar el otro error (`super` solo puede ser la
primera sentencia) — dos demostraciones cortas, no una explicación larga.

## Paso 4 — `@Override` en `TarjetaCredito.pagar()`

```java
public class TarjetaCredito extends Tarjeta {
    private double cupoCredito;

    @Override
    public void pagar(double monto) {
        if (monto > saldo + cupoCredito) {
            throw new IllegalArgumentException("Cupo insuficiente");
        }
        saldo -= monto;
    }
}
```

Punto a resaltar: quitar `@Override` y cambiar deliberadamente la firma
(`pagar(float monto)` en vez de `double`) para mostrar que sin la anotación
el compilador no avisa — el método nuevo simplemente no sobreescribe nada y
queda ahí, muerto. Con `@Override` puesto, el mismo error de firma sí lo
marca el compilador.

## Paso 5 — `super.metodo()`: reutilizar en vez de duplicar

```java
public class TarjetaDebito extends Tarjeta {
    private double porcentajeCashback;

    @Override
    public void abonar(double monto) {
        super.abonar(monto);                  // reutiliza la validacion de Tarjeta
        System.out.println("Abono a tarjeta de debito registrado");
    }

    public void aplicarCashbackMensual() {
        double cashback = saldo * porcentajeCashback;
        super.abonar(cashback);               // el cashback entra como un abono valido
    }
}
```

```java
TarjetaDebito td = new TarjetaDebito("TD-1001", 500000, 0.02);
td.aplicarCashbackMensual();
System.out.println(td.consultarSaldo());   // 510000 — el cashback ya paso por la validacion de Tarjeta
```

Punto a resaltar: preguntar qué pasaría si `aplicarCashbackMensual()`
hiciera `saldo += cashback` directamente en vez de `super.abonar(cashback)`
— la respuesta es que funcionaría igual hoy, pero se saltaría la validación
de `Tarjeta` si algún día `abonar()` gana una regla nueva (por ejemplo, un
tope máximo por transacción).

## Preguntas socráticas

- *"Si `TarjetaCredito` no sobreescribiera `pagar()`, ¿qué pasaría si un
  cliente intenta gastar más de su saldo, aunque tenga cupo disponible?"* —
  Respuesta esperada: se ejecutaría el `pagar()` heredado de `Tarjeta`, que
  no sabe nada de `cupoCredito`, y lanzaría `IllegalArgumentException`
  aunque el cliente sí tuviera cupo — por eso la sobreescritura es
  necesaria, no opcional.
- *"¿Por qué `aplicarCashbackMensual()` no existe en `Tarjeta`, solo en
  `TarjetaDebito`?"* — Respuesta esperada: porque el cashback es un
  concepto que solo aplica a tarjetas de débito; ponerlo en `Tarjeta`
  obligaría a que `TarjetaCredito` también lo tuviera, sin sentido para su
  dominio.
