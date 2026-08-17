> Sesión T2, teórica pero con código en vivo. Continúa directamente la
> jerarquía `Tarjeta`/`TarjetaDebito`/`TarjetaCredito` de Herencia (T1) —
> proyectar primero el código de esa clase si el grupo lo necesita de
> repaso.

## Paso 1 — Del `if instanceof` al polimorfismo

Mostrar primero el problema: recorrer un `Tarjeta[]` preguntando el tipo de
cada una.

```java
Tarjeta[] tarjetas = new Tarjeta[2];
tarjetas[0] = new TarjetaDebito();
tarjetas[1] = new TarjetaCredito();

for (Tarjeta tarjeta : tarjetas) {
    if (tarjeta instanceof TarjetaDebito) {
        TarjetaDebito td = (TarjetaDebito) tarjeta;
        td.setSaldo(td.getSaldo() + td.getSaldo() * 0.02);   // cashback
    } else if (tarjeta instanceof TarjetaCredito) {
        TarjetaCredito tc = (TarjetaCredito) tarjeta;
        tc.setSaldo(tc.getSaldo() - 5000); // cuota de manejo
    }
}
```

Preguntar en voz alta: "¿qué hay que tocar si mañana aparece
`TarjetaPrepago`?" antes de mostrar la solución polimórfica:

```java
for (Tarjeta tarjeta : tarjetas) {
    tarjeta.liquidarMes();   // sin instanceof, sin cast
}
```

Punto a resaltar: proyectar los dos bloques uno al lado del otro. El
segundo `for` es idéntico sin importar cuántos tipos de tarjeta existan —
eso es lo que hay que dejar viendo, no solo explicando.

## Paso 2 — `Tarjeta` como clase abstracta

```java
public abstract class Tarjeta {
    protected double saldo;

    public abstract void liquidarMes();   // sin cuerpo: cada subclase decide

    public double consultarSaldo() {        // con cuerpo: compartido tal cual
        return saldo;
    }
}

public class TarjetaDebito extends Tarjeta {
    @Override
    public void liquidarMes() {
        saldo += saldo * 0.02;   // cashback del 2%
    }
}

public class TarjetaCredito extends Tarjeta {
    @Override
    public void liquidarMes() {
        saldo -= 5000;   // cuota de manejo
    }
}
```

Demostración deliberada: comentar `liquidarMes()` en `TarjetaCredito` y
mostrar el error de compilación (`TarjetaCredito is not abstract and does
not override abstract method`). Después intentar `new Tarjeta()` a secas y
mostrar el segundo error (`Tarjeta is abstract; cannot be instantiated`) —
dos demostraciones cortas, no una explicación larga.

## Paso 3 — La interfaz `Auditable`

```java
public interface Auditable {
    String generarRegistroAuditoria();
}

public abstract class Tarjeta implements Auditable {
    protected double saldo;

    public abstract void liquidarMes();

    @Override
    public String generarRegistroAuditoria() {
        return "Tarjeta con saldo: " + saldo;
    }
}

public class Cliente implements Auditable {
    private String nombre;

    @Override
    public String generarRegistroAuditoria() {
        return "Cliente: " + nombre;
    }
}
```

```java
List<Auditable> registrosDelDia = List.of(tarjetaDebito, cliente);
for (Auditable a : registrosDelDia) {
    System.out.println(a.generarRegistroAuditoria());
}
```

Punto a resaltar: `Tarjeta` y `Cliente` no tienen ninguna relación de
herencia entre sí, y aun así el mismo `for` las recorre juntas a través de
`Auditable` — es la prueba de que el polimorfismo no depende de `extends`,
depende del tipo de la referencia declarada, sea clase o interfaz.

## Preguntas socráticas

- *"En el `for` con `Auditable`, ¿por qué compila sin problema tener
  `Tarjeta` y `Cliente` en la misma lista si no comparten superclase?"* —
  Respuesta esperada: porque ambas implementan `Auditable`, y el tipo
  declarado de la lista es `Auditable`, no `Tarjeta` ni `Cliente` — el
  polimorfismo depende del contrato común, no de una jerarquía de herencia.
- *"Si agregan `TarjetaPrepago extends Tarjeta` sin sobreescribir
  `liquidarMes()`, ¿qué pasa?"* — Respuesta esperada: no compila —
  `Tarjeta` lo declaró `abstract`, así que toda subclase concreta está
  obligada a implementarlo; el compilador no deja crear el `.class` hasta
  que exista esa implementación.
