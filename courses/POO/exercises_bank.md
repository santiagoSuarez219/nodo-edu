# Banco de Ejercicios — Programación Orientada a Objetos (POO)

> **Fuente:** Misión TIC 2022 — Ciclo Programación Básica (UNAB) — `Semana_2_ProgBas.pdf` y `Semana_3_ProgBas.pdf`.
> **Lenguaje:** Java.
> **Temas cubiertos:** Clases y objetos, constructores, encapsulamiento, métodos get/set, ArrayList de objetos, herencia, polimorfismo, interfaces, clases abstractas.

---

## Ejercicio # 01

**Tema:** Clases y objetos — Constructor básico — Métodos

**Enunciado:**

Dada la siguiente información sobre un vendedor de una empresa, del cual se conoce:

- Documento de identidad
- Tipo Vendedor (1 = Puerta a Puerta, 2 = Telemercadeo)
- Valor ventas del mes

Se pide calcular el valor a pagar por concepto de comisión al vendedor, de acuerdo con la siguiente indicación:

Para el vendedor de tipo 1 (Puerta a Puerta) se le paga por concepto de comisión el **25%** del valor de las ventas del mes. Cuando el vendedor es tipo 2 (Telemercadeo) se le paga por concepto de comisión el **20%** del valor de las ventas del mes.

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO).

**Solución:**

**Clase — `Vendedor`**

```java
public class Vendedor {
    int documento;
    int tipoVendedor;
    double valorVentas;

    public Vendedor() {
    }

    public Vendedor(int documento, int tipoVendedor, double valorVentas) {
        this.documento = documento;
        this.tipoVendedor = tipoVendedor;
        this.valorVentas = valorVentas;
    }

    public double calcularComision() {
        double comision;
        if (this.tipoVendedor == 1) {
            comision = this.valorVentas * 0.25;
        } else {
            comision = this.valorVentas * 0.20;
        }
        return comision;
    }
}
```

**Clase Principal — `Main`**

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner consola = new Scanner(System.in);

        System.out.println("Documento: ");
        int documento = consola.nextInt();
        System.out.println("Tipo Vendedor (1=Puerta a Puerta, 2=Telemercadeo): ");
        int tipoVendedor = consola.nextInt();
        System.out.println("Valor ventas del mes: ");
        double valorVentas = consola.nextDouble();

        Vendedor vendedor = new Vendedor(documento, tipoVendedor, valorVentas);
        double comision = vendedor.calcularComision();

        System.out.println("Documento: " + vendedor.documento);
        System.out.println("Valor comisión: " + comision);
    }
}
```

---

## Ejercicio # 02

**Tema:** Clases y objetos — Múltiples métodos — Condicionales y ciclos

**Enunciado:**

Dado un número entero, se pide:

- Conocer si es par o impar
- Conocer si es positivo, negativo o cero
- Conocer si es primo

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO).

**Solución:**

**Clase — `NumeroEntero`**

```java
public class NumeroEntero {
    int valor;

    public NumeroEntero() {
    }

    public NumeroEntero(int valor) {
        this.valor = valor;
    }

    public String esParOImpar() {
        if (this.valor % 2 == 0) {
            return "PAR";
        } else {
            return "IMPAR";
        }
    }

    public String esPositivoNegativoOCero() {
        if (this.valor > 0) {
            return "POSITIVO";
        } else if (this.valor < 0) {
            return "NEGATIVO";
        } else {
            return "CERO";
        }
    }

    public boolean esPrimo() {
        if (this.valor < 2) {
            return false;
        }
        for (int i = 2; i <= Math.sqrt(this.valor); i++) {
            if (this.valor % i == 0) {
                return false;
            }
        }
        return true;
    }
}
```

**Clase Principal — `Main`**

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner consola = new Scanner(System.in);

        System.out.println("Número entero: ");
        int valor = consola.nextInt();

        NumeroEntero numero = new NumeroEntero(valor);

        System.out.println("El número es: " + numero.esParOImpar());
        System.out.println("El número es: " + numero.esPositivoNegativoOCero());
        System.out.println("¿Es primo?: " + (numero.esPrimo() ? "SI" : "NO"));
    }
}
```

---

## Ejercicio # 03

**Tema:** Encapsulamiento — Modificadores de acceso — Métodos get y set

**Enunciado:**

Utilizando el ejercicio de la liquidación de comisiones a un vendedor (Ejercicio # 01), y aplicando el principio de **encapsulamiento**:

Dada la siguiente información sobre un vendedor de una empresa, del cual se conoce:

- Documento de identidad
- Tipo Vendedor (1 = Puerta a Puerta, 2 = Telemercadeo)
- Valor ventas del mes

Se pide calcular el valor a pagar por concepto de comisión al vendedor, de acuerdo con la siguiente indicación:

Para el vendedor de tipo 1 (Puerta a Puerta) se le paga por concepto de comisión el **25%** del valor de las ventas del mes. Cuando el vendedor es tipo 2 (Telemercadeo) se le paga por concepto de comisión el **20%** del valor de las ventas del mes.

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO), definiendo los atributos como **privados** y creando los métodos **get** y **set** correspondientes para cada atributo.

**Solución:**

**Clase — `Vendedor`**

```java
public class Vendedor {
    private int documento;
    private int tipoVendedor;
    private double valorVentas;

    public Vendedor() {
    }

    public Vendedor(int documento, int tipoVendedor, double valorVentas) {
        this.documento = documento;
        this.tipoVendedor = tipoVendedor;
        this.valorVentas = valorVentas;
    }

    public int getDocumento() {
        return documento;
    }

    public void setDocumento(int documento) {
        this.documento = documento;
    }

    public int getTipoVendedor() {
        return tipoVendedor;
    }

    public void setTipoVendedor(int tipoVendedor) {
        this.tipoVendedor = tipoVendedor;
    }

    public double getValorVentas() {
        return valorVentas;
    }

    public void setValorVentas(double valorVentas) {
        this.valorVentas = valorVentas;
    }

    public double calcularComision() {
        double comision;
        if (this.getTipoVendedor() == 1) {
            comision = this.getValorVentas() * 0.25;
        } else {
            comision = this.getValorVentas() * 0.20;
        }
        return comision;
    }
}
```

**Clase Principal — `Main`**

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner consola = new Scanner(System.in);

        Vendedor vendedor = new Vendedor();

        System.out.println("Documento: ");
        vendedor.setDocumento(consola.nextInt());
        System.out.println("Tipo Vendedor (1=Puerta a Puerta, 2=Telemercadeo): ");
        vendedor.setTipoVendedor(consola.nextInt());
        System.out.println("Valor ventas del mes: ");
        vendedor.setValorVentas(consola.nextDouble());

        double comision = vendedor.calcularComision();

        System.out.println("Documento: " + vendedor.getDocumento());
        System.out.println("Valor comisión: " + comision);
    }
}
```

---

## Ejercicio # 04

**Tema:** ArrayList de objetos — Encapsulamiento — Selección múltiple (switch)

**Enunciado:**

Dada la siguiente información sobre los N suscriptores del servicio de agua, de los cuales se conoce:

- Código
- Nombre
- Estrato (1, 2, 3, 4, 5)
- Consumo

Se pide calcular el valor a pagar por concepto de servicio de agua de cada suscriptor y el TOTAL (todos), de acuerdo con la siguiente indicación:

El valor del servicio de agua es la suma del valor de la **tarifa básica** y el **valor del consumo**. La tarifa básica depende del estrato, así:

| Estrato | Tarifa Básica |
|---------|--------------|
| 1       | $10.000      |
| 2       | $15.000      |
| 3       | $20.000      |
| 4       | $25.000      |
| 5       | $30.000      |

El valor del consumo es igual al consumo por $100.

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO) y **ArrayList**.

**Solución:**

**Clase — `Suscriptor`**

```java
public class Suscriptor {
    private int codigo;
    private String nombre;
    private int estrato;
    private double consumo;

    public Suscriptor() {
    }

    public Suscriptor(int codigo, String nombre, int estrato, double consumo) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.estrato = estrato;
        this.consumo = consumo;
    }

    public int getCodigo() {
        return codigo;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getEstrato() {
        return estrato;
    }

    public void setEstrato(int estrato) {
        this.estrato = estrato;
    }

    public double getConsumo() {
        return consumo;
    }

    public void setConsumo(double consumo) {
        this.consumo = consumo;
    }

    public double calcularValorPagar() {
        double tarifaBasica = 0;
        switch (this.getEstrato()) {
            case 1: tarifaBasica = 10000; break;
            case 2: tarifaBasica = 15000; break;
            case 3: tarifaBasica = 20000; break;
            case 4: tarifaBasica = 25000; break;
            case 5: tarifaBasica = 30000; break;
        }
        double valorConsumo = this.getConsumo() * 100;
        return tarifaBasica + valorConsumo;
    }
}
```

**Clase Principal — `Main`**

```java
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner consola = new Scanner(System.in);
        ArrayList<Suscriptor> suscriptores = new ArrayList<>();

        System.out.println("Cantidad de suscriptores: ");
        int n = consola.nextInt();

        for (int i = 1; i <= n; i++) {
            System.out.println("Código: ");
            int codigo = consola.nextInt();
            System.out.println("Nombre: ");
            String nombre = consola.next();
            System.out.println("Estrato (1,2,3,4,5): ");
            int estrato = consola.nextInt();
            System.out.println("Consumo: ");
            double consumo = consola.nextDouble();

            suscriptores.add(new Suscriptor(codigo, nombre, estrato, consumo));
        }

        double total = 0;
        for (Suscriptor suscriptor : suscriptores) {
            double valorPagar = suscriptor.calcularValorPagar();
            total += valorPagar;
            System.out.println("Nombre: " + suscriptor.getNombre() + " - Valor a pagar: " + valorPagar);
        }
        System.out.println("Valor TOTAL: " + total);
    }
}
```

---

## Ejercicio # 05

**Tema:** Polimorfismo — Figuras Geométricas

**Enunciado:**

Dada las figuras geométricas cuadrado, rectángulo y círculo, de las cuales se conoce:

**Cuadrado:**
- Lado

**Rectángulo:**
- Base
- Altura

**Círculo:**
- Radio

Se pide calcular para cada una de las figuras, el área y el perímetro.

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO) y aplicar el concepto de Polimorfismo.

> **Referencia de diseño (StarUML):**
>
> | Clase        | Atributos        | Métodos                                              |
> |--------------|------------------|------------------------------------------------------|
> | `Cuadrado`   | `+lado`          | `+setLado(lado)`, `+getLado()`, `+area()`, `+perimetro()` |
> | `Rectangulo` | `+base`, `+altura` | `+setBase(base)`, `+getBase()`, `+setAltura(altura)`, `+getAltura()`, `+area()`, `+perimetro()` |
> | `Circulo`    | `+radio`         | `+setRadio(radio)`, `+getRadio()`, `+area()`, `+perimetro()` |
>
> **Fórmulas:**
> - `area()`: Cuadrado → `lado²` | Rectángulo → `base * altura` | Círculo → `π * radio²`
> - `perimetro()`: Cuadrado → `4 * lado` | Rectángulo → `2*base + 2*altura` | Círculo → `2 * π * radio`

**Solución:**

**Clase 1 — `Cuadrado`**

```java
public class Cuadrado {
    private double lado;

    public Cuadrado() {
    }

    public Cuadrado(double lado) {
        this.lado = lado;
    }

    public void setLado(double lado) {
        this.lado = lado;
    }

    public double getLado() {
        return lado;
    }

    public double area() {
        double a;
        a = Math.pow(this.lado, 2);
        return a;
    }

    public double perimetro() {
        double p;
        p = 4 * this.lado;
        return p;
    }
}
```

**Clase 2 — `Rectangulo`**

```java
public class Rectangulo {
    private double base;
    private double altura;

    public Rectangulo() {
    }

    public Rectangulo(double base, double altura) {
        this.base = base;
        this.altura = altura;
    }

    public void setBase(double base) {
        this.base = base;
    }

    public void setAltura(double altura) {
        this.altura = altura;
    }

    public double getBase() {
        return base;
    }

    public double getAltura() {
        return altura;
    }

    public double area() {
        double a;
        a = this.base * this.altura;
        return a;
    }

    public double perimetro() {
        double p;
        p = 2 * this.base + 2 * this.altura;
        return p;
    }
}
```

**Clase 3 — `Circulo`**

```java
public class Circulo {
    private double radio;

    public Circulo() {
    }

    public Circulo(double radio) {
        this.radio = radio;
    }

    public double getRadio() {
        return radio;
    }

    public void setRadio(double radio) {
        this.radio = radio;
    }

    public double area() {
        double a;
        a = Math.PI * Math.pow(this.radio, 2);
        return a;
    }

    public double perimetro() {
        double p;
        p = 2 * Math.PI * this.radio;
        return p;
    }
}
```

**Clase Principal — `Main`**

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Definir consola
        Scanner consola = new Scanner(System.in);
        double lado, base, altura, radio, area, perimetro;
        int opcion = 0;

        // Definición de variables objeto
        Cuadrado obj_cuad;
        Rectangulo obj_rect;
        Circulo obj_circ;

        do {
            System.out.println("     MENU DE OPCIONES");
            System.out.println("1. Figura Cuadrado");
            System.out.println("2. Figura Rectángulo");
            System.out.println("3. Figura Círculo");
            System.out.println("4. Salir");
            System.out.println("Ingrese Opción");
            opcion = consola.nextInt();

            switch (opcion) {
                case 1: {
                    System.out.println("Lado: ");
                    lado = consola.nextDouble();
                    obj_cuad = new Cuadrado(lado);
                    area = obj_cuad.area();
                    perimetro = obj_cuad.perimetro();
                    System.out.println("Area Cuadrado: " + area);
                    System.out.println("Perimetro Cuadrado: " + perimetro);
                    break;
                }
                case 2: {
                    System.out.println("Base: ");
                    base = consola.nextDouble();
                    System.out.println("Altura: ");
                    altura = consola.nextDouble();
                    obj_rect = new Rectangulo(base, altura);
                    area = obj_rect.area();
                    perimetro = obj_rect.perimetro();
                    System.out.println("Area Rectángulo: " + area);
                    System.out.println("Perimetro Rectángulo: " + perimetro);
                    break;
                }
                case 3: {
                    System.out.println("Radio: ");
                    radio = consola.nextDouble();
                    obj_circ = new Circulo(radio);
                    area = obj_circ.area();
                    perimetro = obj_circ.perimetro();
                    System.out.println("Area Círculo: " + area);
                    System.out.println("Perimetro Círculo: " + perimetro);
                    break;
                }
                case 4:
                    break;
            }
        } while (opcion != 4);
    }
}
```

---

## Ejercicio # 06

**Tema:** Herencia y Polimorfismo — Sistema Bancario de Créditos

**Enunciado:**

En un sistema bancario, los créditos manejan tres características básicas que son, el monto del crédito, porcentaje de interés y plazo. Sin embargo, se generan varias modalidades de crédito como son:

- **Crédito Personal**, en el cual el valor a pagar en cada cuota se genera como el monto del crédito + valor interés (porcentaje interés aplicado al monto) dividido sobre el plazo.
- **Crédito Empresarial**, en el cual se negocia un valor de interés total y la cuota es el monto del crédito + valor del interés negociado, dividido entre el plazo.
- **Crédito Especial**, en el cual el valor de la cuota es el monto del crédito dividido entre el plazo. (No se aplica interés)

Realizar el programa en Java que resuelva la situación problema presentada, utilizando el concepto de Clases y Objetos (POO) y aplicar el concepto de Herencia y Polimorfismo.

> **Referencia de diseño (StarUML) — versión con Clase Abstracta:**
>
> | Clase / Elemento         | Descripción                                                                |
> |--------------------------|---------------------------------------------------------------------------|
> | `abstract Credito`       | Superclase abstracta con atributos `monto`, `interes`, `plazo` y método abstracto `calcular_cuota()` |
> | `CreditoPersonal`        | Subclase. Cuota = `(monto + monto*(interés/100)) / plazo`                 |
> | `CreditoEmpresarial`     | Subclase. Atributo extra `valor_interes_total`. Cuota = `(monto + valor_interes_total) / plazo` |
> | `CreditoEspecial`        | Subclase. Cuota = `monto / plazo`                                         |

**Solución:**

> El documento fuente presenta dos implementaciones: una con **superclase concreta** y otra con **clase abstracta**. Se transcribe la versión con clase abstracta por ser la más completa pedagógicamente.

**Superclase Abstracta — `Credito`**

```java
public abstract class Credito {
    private double monto;
    private double interes;
    private int plazo;

    public Credito() {
    }

    public Credito(double monto, double interes, int plazo) {
        this.monto = monto;
        this.interes = interes;
        this.plazo = plazo;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public double getInteres() {
        return interes;
    }

    public void setInteres(double interes) {
        this.interes = interes;
    }

    public int getPlazo() {
        return plazo;
    }

    public void setPlazo(int plazo) {
        this.plazo = plazo;
    }

    // Declaración del método abstracto
    public abstract double calcular_cuota();
}
```

**Subclase — `CreditoPersonal`**

```java
public class CreditoPersonal extends Credito {

    public CreditoPersonal() {
    }

    public CreditoPersonal(double monto, double interes, int plazo) {
        super(monto, interes, plazo);
    }

    @Override
    public double calcular_cuota() {
        double cuota;
        cuota = (this.getMonto() + (this.getMonto() * (this.getInteres() / 100))) / this.getPlazo();
        return cuota;
    }
}
```

**Subclase — `CreditoEmpresarial`**

```java
public class CreditoEmpresarial extends Credito {
    private double valor_interes_total;

    public CreditoEmpresarial() {
    }

    public CreditoEmpresarial(double valor_interes_total, double monto, double interes, int plazo) {
        super(monto, interes, plazo);
        this.valor_interes_total = valor_interes_total;
    }

    public double getValor_interes_total() {
        return valor_interes_total;
    }

    public void setValor_interes_total(double valor_interes_total) {
        this.valor_interes_total = valor_interes_total;
    }

    @Override
    public double calcular_cuota() {
        double cuota;
        cuota = (this.getMonto() + this.valor_interes_total) / this.getPlazo();
        return cuota;
    }
}
```

**Subclase — `CreditoEspecial`**

```java
public class CreditoEspecial extends Credito {

    public CreditoEspecial() {
    }

    public CreditoEspecial(double monto, double interes, int plazo) {
        super(monto, interes, plazo);
    }

    @Override
    public double calcular_cuota() {
        double cuota;
        cuota = this.getMonto() / this.getPlazo();
        return cuota;
    }
}
```

**Clase Principal — `Herencia_creditos_G21`**

```java
import java.util.Scanner;

public class Herencia_creditos_G21 {

    /**
     * @author SERGIO
     */
    public static void main(String[] args) {
        // Definición de la consola
        Scanner consola = new Scanner(System.in);
        // Definición de variables
        double monto, interes, valor_interes, cuota;
        int plazo, opcion = 0;
        // Definición de las variables objeto
        CreditoPersonal obj_credper;
        CreditoEmpresarial obj_credemp;
        CreditoEspecial obj_credesp;

        do {
            System.out.println("     MENU CREDITOS");
            System.out.println("1. Crédito Personal");
            System.out.println("2. Crédito Empresarial");
            System.out.println("3. Crédito Especial");
            System.out.println("4. Salir");
            System.out.println("Ingrese Opción: ");
            opcion = consola.nextInt();

            switch (opcion) {
                case 1: {
                    System.out.println("Monto: ");
                    monto = consola.nextDouble();
                    System.out.println("(%) Interés: ");
                    interes = consola.nextDouble();
                    System.out.println("Plazo: ");
                    plazo = consola.nextInt();
                    // Creación del objeto Crédito Personal
                    obj_credper = new CreditoPersonal();
                    obj_credper.setMonto(monto);
                    obj_credper.setInteres(interes);
                    obj_credper.setPlazo(plazo);
                    cuota = obj_credper.calcular_cuota();
                    System.out.println("Valor Cuota Crédito Personal: " + cuota);
                    break;
                }
                case 2: {
                    System.out.println("Monto: ");
                    monto = consola.nextDouble();
                    System.out.println("Valor interés: ");
                    valor_interes = consola.nextDouble();
                    System.out.println("Plazo: ");
                    plazo = consola.nextInt();
                    // Creación del objeto Crédito Empresarial
                    obj_credemp = new CreditoEmpresarial();
                    obj_credemp.setMonto(monto);
                    obj_credemp.setValor_interes_total(valor_interes);
                    obj_credemp.setPlazo(plazo);
                    cuota = obj_credemp.calcular_cuota();
                    System.out.println("Valor Cuota Crédito Empresarial: " + cuota);
                    break;
                }
                case 3: {
                    System.out.println("Monto: ");
                    monto = consola.nextDouble();
                    System.out.println("Plazo: ");
                    plazo = consola.nextInt();
                    // Creación del objeto Crédito especial
                    obj_credesp = new CreditoEspecial();
                    obj_credesp.setMonto(monto);
                    obj_credesp.setPlazo(plazo);
                    cuota = obj_credesp.calcular_cuota();
                    System.out.println("Valor Cuota Crédito Especial: " + cuota);
                    break;
                }
                case 4:
                    break;
            }
        } while (opcion != 4);
    }
}
```

---
