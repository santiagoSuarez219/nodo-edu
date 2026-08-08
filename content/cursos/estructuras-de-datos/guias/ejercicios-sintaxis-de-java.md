---
title: "Ejercicios propuestos — Sintaxis de Java"
updatedAt: "2026-08-08"
---

# Ejercicios propuestos — Sintaxis de Java

## Cómo usar esta página

Estos ejercicios son **opcionales y no tienen nota**. No hay que entregarlos ni
hay fecha límite: existen para que practique por su cuenta lo visto en
**Sintaxis de Java** antes de avanzar al siguiente tema.

Resuélvalos en su propio entorno (VS Code + JDK 21), un archivo `.java` por
ejercicio. Están ordenados de menor a mayor dificultad, y cada uno indica qué
concepto de la lección está ejercitando. Si uno se le atasca, esa es
exactamente la señal de qué parte conviene repasar.

Todo lo que necesita para resolverlos está en la lección: tipos primitivos,
operadores, `if`/`else`, `switch` y los tres bucles.

## Condicionales

### 1. Índice de masa corporal

Se desea desarrollar un programa que calcule el índice de masa corporal de una
persona. Para ello se requiere definir el peso (en kilogramos) y la estatura
(en metros). El IMC se calcula así:

```
IMC = peso / estatura²
```

A partir del IMC obtenido se debe determinar la clasificación según estos
rangos:

| IMC | Resultado | IMC | Resultado |
|---|---|---|---|
| < 16 | Delgadez severa | [25-30) | Sobrepeso |
| [16-17) | Delgadez moderada | [30-35) | Obesidad leve |
| [17-18.5) | Delgadez leve | [35-40) | Obesidad moderada |
| [18.5-25) | Peso normal | >=40 | Obesidad mórbida |

Escriba un programa en Java que, dados el peso y la estatura, calcule el IMC e
imprima el mensaje correspondiente al rango en el que se ubique.

**Qué ejercita:** flujo de control condicional, condicionales anidadas.

## Variables y constantes

### 2. Conversor de metros

Realice un programa en Java que convierta una medida en metros a: centímetros,
milímetros, pulgadas, pies y yardas.

Cada conversión debe implementarse como un método público que reciba la medida
en metros y devuelva el valor convertido, usando variables locales y
constantes para los factores de conversión.

**Qué ejercita:** variables locales dentro de un método, constantes de clase.

**Extensión opcional:** escriba clases similares para convertir unidades de
área (hectáreas, kilómetros cuadrados, fanegas, acres) y de volumen (litros a
galones, pintas, barriles, metros cúbicos, hectolitros).

## Bucles

### 3. Número de Amstrong

Un número de Amstrong es aquel que es igual a la suma de sus dígitos elevados
a la potencia de su número de cifras. Por ejemplo, 371 tiene tres cifras y:

```
371 = 3³ + 7³ + 1³ = 27 + 343 + 1 = 371
```

Escriba un programa que, dado un número entero, determine e imprima si es o no
un número de Amstrong. **Utilice un `while`** para recorrer los dígitos.

**Qué ejercita:** la sentencia `while` y su condición de parada.

### 4. Número perfecto

Un número perfecto es aquel que es igual a la suma de sus divisores positivos,
sin contar el propio número. Por ejemplo, 28 es perfecto: sus divisores son 1,
2, 4, 7 y 14, que suman 28.

Escriba un programa que, dado un número entero, determine e imprima si es o no
perfecto. **Utilice un `do-while`** para recorrer los posibles divisores.

**Qué ejercita:** la sentencia `do-while` y en qué se diferencia de `while`.

### 5. Números amigos

Dos números enteros positivos son amigos si la suma de los divisores propios
de uno es igual al otro, y viceversa. Por ejemplo, 220 y 284: los divisores de
220 (1, 2, 4, 5, 10, 11, 20, 22, 44, 55, 110) suman 284; los de 284 (1, 2, 4,
71, 142) suman 220.

Escriba un programa que, dados dos enteros positivos, determine e imprima si
son o no números amigos. **Utilice un `for`** para recorrer los divisores.

**Qué ejercita:** la sentencia `for` y la reutilización de una misma lógica
sobre dos entradas distintas.

### 6. Elementos duplicados en un array

Dado un `array` de números enteros, determine cuáles de sus elementos están
duplicados.

Escriba un programa que imprima primero todos los elementos del `array` con su
índice, y luego imprima cada valor que aparece más de una vez, señalado como
"Elemento duplicado".

**Qué ejercita:** recorrido de un `array` con bucles anidados.

## Si quiere ir más allá

Ninguno de estos ejercicios pide clases ni objetos todavía — se resuelven con
lo que ya sabe. Cuando avance a **Repaso de clases y objetos**, encontrará la
siguiente tanda de ejercicios, esta vez modelando entidades completas.
