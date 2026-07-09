# Banco de Ejercicios — Lógica de Programación (LP)

> **Fuente:** Presentación *Ciclo: Programación Básica — Introducción a JAVA*, Misión TIC 2022, UNAB / MinTIC (`Semana_1_ProgBas.pdf`).
> ⚠️ **Solucionario — NO DISTRIBUIR A ESTUDIANTES:** las soluciones se transcribieron del código visible en capturas de NetBeans IDE 8.2 incluidas en la presentación fuente. Los posibles errores del original se señalan con notas `⚠️`.

---

## Ejercicio # 01

**Tema:** Estructuras de control — Condicional (`if`) y Selección múltiple (`switch`)

**Enunciado:**

Dada la siguiente información de un usuario del servicio de agua:

- Documento de identidad
- Estado (`A` = Activo, `S` = Suspendido)
- Estrato (1, 2, 3, 4, 5)

Se pide calcular el valor a pagar por tarifa básica, de acuerdo con las siguientes observaciones:

- Si el usuario está suspendido, el valor de tarifa básica es 0.
- Si el usuario está activo, el valor de la tarifa básica depende del estrato:

| Estrato | Tarifa Básica |
|:-------:|:-------------:|
| 1       | $10.000       |
| 2       | $15.000       |
| 3       | $30.000       |
| 4       | $50.000       |
| 5       | $65.000       |

**Solución:**

*Análisis (Entrada → Proceso → Salida):*

- **Entrada (LEER):** `documento` (`long`), `estado` (`char`), `estrato` (`int`)
- **Proceso:** Condicional → activo o suspendido; Selección múltiple → tarifa básica según estrato
- **Salida (IMPRIMIR):** `tb` (`float`)

```java
import java.util.Scanner;

public class Calcula_Tarifa_basica {

    public static void main(String[] args) {
        /* Instancia de Scanner para entrada por consola */
        Scanner entrada = new Scanner(System.in);

        /* Definición de variables */
        long documento;
        char estado;
        int estrato;
        float tb = 0;

        /* Entrada de Datos */
        System.err.println("Documento de identidad: ");
        documento = entrada.nextLong();
        System.err.println("Estado(A=Activo, S=Suspendido): ");
        estado = entrada.next().charAt(0);
        System.err.println("Estrato(1,2,3,4,5): ");
        estrato = entrada.nextInt();

        /* Calcular tarifa básica */
        if (estado == 'S')
            tb = 0;
        else
            switch (estrato) {
                case 1: tb = 10000; break;
                case 2: tb = 15000; break;
                case 3: tb = 30000; break;
                case 4: tb = 50000; break;
                case 5: tb = 65000; break;
            }
        System.out.println("Tarifa Básica: " + tb);
    }
}
```

*Ejemplo de ejecución (consola):*

```text
Documento de identidad:
91254478
Estado(A=Activo, S=Suspendido):
A
Estrato(1,2,3,4,5):
3
Tarifa Básica: 30000.0
BUILD SUCCESSFUL (total time: 8 seconds)
```

---

## Ejercicio # 02

**Tema:** Estructuras de control — Ciclo PARA (`for`) con condicional anidado

**Enunciado:**

Dada la información sobre los **N vendedores**:

- Cédula
- Tipo Vendedor (1: Puerta a Puerta, 2 = Ejecutivo de ventas)
- Valor ventas del mes

Se pide calcular el valor de comisiones de cada vendedor, de acuerdo con las siguientes observaciones:

Información para liquidar comisiones: Si el vendedor es puerta a puerta (1) gana por comisiones el 20% del valor de sus ventas y si es ejecutivo de ventas (2) gana por comisiones el 30% del valor de sus ventas del mes.

**Solución:**

*Análisis (Entrada → Proceso → Salida):*

- **Entrada (LEER):** `N` (`int`), `cedula` (`long`), `tipo` (`int`), `ventas` (`double`)
- **Proceso:** Ciclo FOR de 1 a N → Condicional: calcular comisión según tipo de vendedor
- **Salida (IMPRIMIR):** `comision` (`double`)

```java
import java.util.Scanner;

public class Calculo_comisiones {

    public static void main(String[] args) {
        /* Instancia Scanner para lectura por consola */
        Scanner entrada = new Scanner(System.in);

        /* Definición de variables */
        long cedula;
        int N, tipo;
        double comision, ventas;

        /* Entrada de datos */
        System.err.println("Cantidad de vendedores: ");
        N = entrada.nextInt();

        /* Ciclo para calcular comisiones */
        for (int i = 1; i <= N; i++) {
            System.err.println("Cédula: ");
            cedula = entrada.nextLong();
            System.err.println("Tipo(1=Puerta a Puerta, 2=Ejecutivo): ");
            tipo = entrada.nextInt();
            System.err.println("Valor ventas: ");
            ventas = entrada.nextDouble();
            if (tipo == 1)
                comision = ventas * 0.20;
            else
                comision = ventas * 0.30;
            System.out.println("Comisión: " + comision);
        }
    }
}
```

*Ejemplo de ejecución (consola):*

```text
Cantidad de vebdedores:
1
Cédula:
2
Tipo(1=Puerta a Puerta, 2=Ejecutivo):
2
Valor ventas:
3000000
Comisión: 900000.0
BUILD SUCCESSFUL (total time: 19 seconds)
```

---

## Ejercicio # 03

**Tema:** Estructuras de control — Ciclo MIENTRAS (`while`) con condicional anidado

**Enunciado:**

Dada la información sobre **una lista de vendedores**:

- Cédula
- Tipo Vendedor (1: Puerta a Puerta, 2 = Ejecutivo de ventas)
- Valor ventas del mes

La lista termina cuando la cédula ingresada sea 999.

Se pide calcular el valor de comisiones de cada vendedor, de acuerdo con las siguientes observaciones:

Información para liquidar comisiones: Si el vendedor es puerta a puerta (1) gana por comisiones el 20% del valor de sus ventas y si es ejecutivo de ventas (2) gana por comisiones el 30% del valor de sus ventas del mes.

**Solución:**

*Análisis (Entrada → Proceso → Salida):*

- **Entrada (LEER):** `cedula` (`long`), `tipo` (`int`), `ventas` (`double`)
- **Proceso:** Ciclo WHILE (mientras `cedula != 999`) → Condicional: calcular comisión según tipo de vendedor
- **Salida (IMPRIMIR):** `comision` (`double`)

```java
import java.util.Scanner;

public class Calculo_comisiones {

    public static void main(String[] args) {
        /* Instancia Scanner para lectura por consola */
        Scanner entrada = new Scanner(System.in);

        /* Definición de variables */
        long cedula;
        int tipo;
        double comision, ventas;

        /* Leer primer vendedor para entrar al while */
        System.err.println("Cédula Vendedor: ");
        cedula = entrada.nextInt(); // ⚠️ Ver nota al pie

        /* Ciclo para calcular comisiones */
        while (cedula != 999) {
            System.err.println("Tipo(1=Puerta a Puerta, 2=Ejecutivo): ");
            tipo = entrada.nextInt();
            System.err.println("Valor ventas: ");
            ventas = entrada.nextDouble();
            if (tipo == 1)
                comision = ventas * 0.20;
            else
                comision = ventas * 0.30;
            System.out.println("Comisión: " + comision);

            /* Leer siguiente vendedor */
            System.err.println("Cédula: ");
            cedula = entrada.nextLong();
        }
    }
}
```

<!-- ⚠️ Posible error en el original: en la lectura inicial (antes del while) el código fuente usa `entrada.nextInt()` para asignar a la variable `cedula`, declarada como `long`. Dentro del ciclo se usa correctamente `entrada.nextLong()`. Se recomienda usar `nextLong()` también en la lectura inicial para consistencia de tipos. -->

*Ejemplo de ejecución (consola):*

```text
Cédula Vendedor:
2
Tipo(1=Puerta a Puerta, 2=Ejecutivo):
1
Valor ventas:
200
Comisión: 60.0
Cédula Vendedor:
3
Tipo(1=Puerta a Puerta, 2=Ejecutivo):
2
Valor ventas:
400
Comisión: 120.0
BUILD SUCCESSFUL (total time: 15 seconds)
```

---

## Ejercicio # 04

**Tema:** Estructura de Datos — Vectores (arreglos unidimensionales) y Acumuladores (Contador–Sumador)

**Enunciado:**

Dados 6 números enteros que se almacenan en un vector, calcular:

- Cuáles y cuántos son pares
- Cuáles y cuántos son impares
- La suma de los números pares
- La suma de los números impares

**Solución:**

*Análisis (Entrada → Proceso → Salida):*

- **Entrada (LEER):** vector `numeros[]` (`long`)
- **Proceso:**
  1. Ciclo FOR para llenar el vector (6 posiciones)
  2. Ciclo FOR para procesar cada número
  3. Condicional: si `numero % 2 == 0` → es par; SINO → es impar
  4. Acumuladores: contar (`cp`, `ci`) y sumar (`sp`, `si`)
- **Salida (IMPRIMIR):** `cp`, `ci`, `sp`, `si` (`long`)

```java
import java.util.Scanner;

public class Vectores_java {

    public static void main(String[] args) {
        /* Instancia Scanner para entrada de datos por consola */
        Scanner entrada = new Scanner(System.in);

        /* Definición de variables */
        long cp, ci, sp, si;
        long numeros[];
        numeros = new long[10];

        /* Llenar el vector */
        for (int i = 1; i <= 6; i++) {
            System.out.println("Ingrese número: ");
            numeros[i] = entrada.nextLong();
        }

        /* Procesar: contar y sumar pares e impares */
        cp = 0; ci = 0; sp = 0; si = 0;
        for (int i = 1; i <= 6; i++) {
            if (numeros[i] % 2 == 0) {
                System.out.println("El número es PAR : " + numeros[i]);
                cp = cp + 1;
                sp = sp + numeros[i];
            } else {
                System.out.println("El número es IMPAR : " + numeros[i]);
                ci = ci + 1;
                si = si + numeros[i];
            }
        }
        System.out.println("Cantidad de pares : " + cp);
        System.out.println("Cantidad de impares : " + ci);
        System.out.println("Suma de pares : " + sp);
        System.out.println("Suma de pares : " + si); // ⚠️ Ver nota al pie
    }
}
```

<!-- ⚠️ Posible error en el original: la última instrucción imprime el mensaje "Suma de pares" pero usa la variable `si`, que contiene la suma de los números impares. El mensaje correcto debería ser "Suma de impares : ". El error es evidente al comparar con la salida del programa (valor 9 = 3+5+1). -->

*Ejemplo de ejecución (consola):*

```text
El número es IMPAR : 3
El número es PAR : 4
El número es IMPAR : 5
El número es PAR : 6
Cantidad de pares : 3
Cantidad de impares : 3
Suma de pares : 12
Suma de pares : 9
BUILD SUCCESSFUL (total time: 8 seconds)
```

---

## Ejercicio # 05

**Tema:** Funciones — Modularidad (Cohesión y Acoplamiento de módulos)

**Enunciado:**

La empresa de teléfonos de la ciudad necesita realizar su proceso de facturación en forma automática, contando con los N abonados, de los cuales conoce el código, estrato, que puede ser (1, 2, 3, 4, 5), cantidad de impulsos del mes. Además la empresa nos informa que para la liquidación de la factura se debe tener en cuenta el valor de la tarifa básica, de acuerdo al estrato, que depende de la siguiente tabla:

| Estrato | Tarifa Básica |
|:-------:|:-------------:|
| 1       | $10.000       |
| 2       | $15.000       |
| 3       | $20.000       |
| 4       | $25.000       |
| 5       | $30.000       |

Además se debe calcular el valor de los impulsos, con base en la cantidad de impulsos del mes, conociendo que cada impulso tiene un valor de $100. Con esta información, se desea:

- Valor a pagar de cada abonado.
- Valor total a pagar (todos los abonados).

**Solución:**

*Análisis (Entrada → Proceso → Salida):*

- **Entrada (LEER):** `N` (`int`), `ced` (`long`), `est` (`int`), `imp` (`long`)
- **Proceso:**
  1. Ciclo FOR (N abonados conocidos)
  2. Llamada a función `factura_abonado(est, imp)` que encapsula:
     - Selección múltiple → tarifa básica según estrato
     - `vimp = imp * 100`
     - `va = tarifa_básica + vimp`
  3. Acumulador total: `vta = vta + va`
- **Salida (IMPRIMIR):** `va` (valor por abonado), `vta` (total acumulado) — ambos `double`

*Diseño del módulo (función):*

| Parámetros de entrada | Proceso interno | Parámetro de salida |
|-----------------------|-----------------|---------------------|
| `est` (`int`), `imp` (`long`) | Cálculo tarifa básica + valor impulsos | `va` (`double`) — retorna un solo valor |

```java
import java.util.Scanner;

public class Facturacion_telefono_funciones {

    /**
     * Calcula el valor a pagar por un abonado.
     * @param estrato  Estrato del abonado (1 a 5)
     * @param impulsos Cantidad de impulsos consumidos en el mes
     * @return         Valor total a pagar (tarifa básica + valor impulsos)
     */
    static double factura_abonado(int estrato, long impulsos) {
        double tb = 0, va;
        switch (estrato) {
            case 1: tb = 10000; break;
            case 2: tb = 15000; break;
            case 3: tb = 20000; break;
            case 4: tb = 25000; break;
            case 5: tb = 30000; break;
        }
        va = tb + impulsos * 100;
        return va;
    }

    public static void main(String[] args) {
        // Instancia Scanner
        Scanner entrada = new Scanner(System.in);

        // Definición de variables
        int est, N;
        long imp, ced;
        double va = 0, vta = 0;

        System.out.println("Cantidad de Abonados: ");
        N = entrada.nextInt();

        for (int i = 1; i <= N; i++) {
            System.out.println("Cedula: ");
            ced = entrada.nextLong();
            System.out.println("Estrato(1,2,3,4,5): ");
            est = entrada.nextInt();
            System.out.println("Impulsos mes: ");
            imp = entrada.nextLong();

            // Llamada a la función
            va = factura_abonado(est, imp);
            System.out.println("Valor factura: " + va);
            vta += va;
        }
        System.out.println("Valor total facturación: " + vta);
    }
}
```

*Ejemplo de ejecución (consola):*

```text
Cantidad de Abonados:
2
Cedula:
1
Estrato(1,2,3,4,5):
2
Impulsos mes:
100
Valor factura: 20000.0
Cedula:
2
Estrato(1,2,3,4,5):
4
Impulsos mes:
200
Valor factura: 45000.0
Valor total facturación: 65000.0
BUILD SUCCESSFUL (total time: 15 seconds)
```

---
