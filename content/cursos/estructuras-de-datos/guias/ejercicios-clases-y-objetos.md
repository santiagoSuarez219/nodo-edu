---
title: "Ejercicios propuestos — Clases y objetos"
updatedAt: "2026-08-08"
---

# Ejercicios propuestos — Clases y objetos

## Cómo usar esta página

Estos ejercicios son **opcionales y no tienen nota**. No hay que entregarlos ni
hay fecha límite: existen para que practique por su cuenta lo visto en
**Repaso de clases y objetos**.

Cada ejercicio le pide modelar una entidad completa: definir la clase, sus
atributos, su constructor y sus métodos, y luego probarla desde un `main`. Ese
es exactamente el ciclo que va a repetir cada vez que modele algo en este
curso.

Están ordenados de menor a mayor dificultad. Los dos últimos tienen una
dependencia explícita con ejercicios anteriores de esta misma página, así que
conviene resolverlos en orden.

## Modelar una entidad

### 1. Definición de clases: Persona

Modele el concepto de una persona. Una persona posee nombre, apellido, número
de documento de identidad y año de nacimiento.

La clase debe tener un constructor que inicialice sus atributos, y un método
que imprima en pantalla los valores del objeto. En un método `main`, cree dos
personas y muestre sus atributos.

**Qué ejercita:** clase, objeto, constructor, la referencia `this` e
instanciación.

**Extensión opcional:** agregue el país de nacimiento (`String`) y el género
(`char`, con valores `'H'` o `'M'`); modifique el constructor y el método de
impresión para incluirlos.

### 2. Atributos con tipos primitivos: Planeta

Modele un planeta del sistema solar con estos atributos:

- Nombre (`String`, inicial `null`).
- Cantidad de satélites (`int`, inicial 0).
- Masa en kilogramos (`double`, inicial 0).
- Volumen en kilómetros cúbicos (`double`, inicial 0).
- Diámetro en kilómetros (`int`, inicial 0).
- Distancia media al Sol en millones de kilómetros (`int`, inicial 0).
- Tipo de planeta según su tamaño: enumerado con valores GASEOSO, TERRESTRE y
  ENANO.
- Observable a simple vista (`boolean`, inicial `false`).

Además del constructor, defina un método que imprima los atributos, uno que
calcule la densidad (masa dividida entre volumen) y uno que determine si el
planeta es exterior — un planeta exterior está más allá del cinturón de
asteroides, que se encuentra entre 2.1 y 3.4 UA (1 UA = 149 597 870 km).

En un `main`, cree dos planetas y muestre sus atributos, su densidad y si son
exteriores.

**Qué ejercita:** atributos con tipo primitivo, valores iniciales, atributos
de tipo enumerado.

**Extensión opcional:** agregue el periodo orbital (en años) y el periodo de
rotación (en días).

## Métodos

### 3. Métodos con y sin valor de retorno: figuras geométricas

Modele cuatro figuras: círculo (atributo radio), rectángulo (base y altura),
cuadrado (longitud del lado) y triángulo rectángulo (base y altura), todas en
centímetros.

Defina métodos para calcular el área y el perímetro de cada figura. Para el
triángulo rectángulo, agregue además un método que calcule la hipotenusa y
otro que determine su tipo: equilátero (todos sus lados iguales), isósceles
(dos iguales) o escaleno (todos diferentes).

Desarrolle una clase de prueba con un `main` que cree las cuatro figuras y
pruebe sus métodos.

**Qué ejercita:** métodos con y sin valor de retorno; un programa repartido en
varias clases más una clase de prueba.

### 4. Métodos con parámetros: CuentaBancaria

Modele una cuenta bancaria con: nombres del titular, apellidos, número de
cuenta, tipo de cuenta (ahorros o corriente) y saldo.

Defina un constructor que inicialice los atributos; al crear una cuenta, el
saldo inicial es cero. Sobre una cuenta se debe poder:

- Imprimir los valores de sus atributos.
- Consultar el saldo.
- Consignar un valor, actualizando el saldo.
- Retirar un valor, actualizando el saldo. **No** se puede retirar si el valor
  solicitado supera el saldo actual.

**Qué ejercita:** métodos con parámetros de entrada.

**Extensión opcional:** agregue un porcentaje de interés mensual y un método
que calcule el nuevo saldo aplicando esa tasa.

### 5. Sobrecarga de métodos: pedido de restaurante

Un pedido de restaurante está conformado por un primer plato, un segundo
plato, una bebida y un postre. Cada parte tiene un nombre y un valor.

Defina métodos **sobrecargados** para calcular el valor del pedido según lo
que solicite el cliente:

- Un primer plato y una bebida.
- Un primer plato, un segundo plato y una bebida.
- Un primer plato, un segundo plato, una bebida y un postre.

Implemente un `main` que use los tres métodos en tres pedidos diferentes.

**Qué ejercita:** métodos sobrecargados dentro de una misma clase.

**Extensión opcional:** defina una clase `Suma` con varios métodos `sumar`
sobrecargados: dos enteros, tres enteros, dos `double` y tres `double`.

## Objetos y referencias

### 6. Objetos como parámetros: transferencia entre cuentas

> Este ejercicio parte del programa del ejercicio 4 (CuentaBancaria).

Amplíe la cuenta bancaria para que permita:

- **Comparar saldos entre cuentas.** La cuenta con la que se compara llega
  como parámetro del método. Devuelve `true` si la cuenta actual tiene un
  saldo mayor o igual al de la cuenta recibida.
- **Transferir dinero de una cuenta a otra.** El método recibe la cuenta de
  destino y el valor a transferir. El saldo de la cuenta actual disminuye ese
  valor y el de la cuenta destino aumenta en la misma cantidad. El método debe
  reutilizar el método `retirar` ya definido para evaluar si la cantidad está
  disponible en la cuenta de origen.

**Qué ejercita:** métodos que reciben objetos como parámetro y métodos que
invocan a otros métodos ya definidos.

**Extensión opcional:** agregue un atributo booleano que indique si la cuenta
está activa (lo está si tiene saldo positivo). No se pueden hacer
consignaciones a una cuenta inactiva, y si al retirar el saldo queda en cero,
la cuenta pasa a inactiva.

### 7. Asignación de objetos: Avión

Se tiene una clase `Avión` con dos atributos: nombre del fabricante (`String`)
y número de motores (`int`). Tiene constructor, métodos `get` y `set` para
cada atributo, y además:

- `imprimirFabricante()`, que muestra el nombre del fabricante.
- `cambiarFabricante(Avión a)`, que recibe un objeto `Avión` y le cambia su
  atributo fabricante al valor `"Loockhead"`.

En el `main` se crean dos aviones: `a1` (fabricante "Airbus", cuatro motores)
y `a2` (fabricante "Lookheed", cuatro motores), y se imprimen sus datos.
Después se hacen llamadas a `setFabricante` y a `cambiarFabricante`.

Determine y **explique** cuál es el resultado final de la ejecución: ¿qué se
imprime en pantalla después de esas llamadas, teniendo en cuenta cómo Java
maneja las referencias a objetos pasadas como parámetro?

**Qué ejercita:** el contenido de un objeto tras varias asignaciones, y el
cambio de estado mediante métodos `set`.

**Extensión opcional:** cree dos objetos `Avión` y asigne el primero al
segundo (`a2 = a1`). Muestre los atributos de ambos. Luego asigne `"Stealth"`
al fabricante del segundo objeto e imprima el fabricante del primero. ¿Qué se
muestra, y por qué?

## Si quiere ir más allá

En estos ejercicios los atributos siguen siendo accesibles desde fuera de la
clase. En **Encapsulamiento** verá cómo cerrar ese acceso y hacer que cada
objeto proteja sus propios datos — y ahí encontrará la última tanda de
ejercicios de este bloque.
