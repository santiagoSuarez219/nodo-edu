---
title: "Ejercicios propuestos — Encapsulamiento"
updatedAt: "2026-08-08"
---

# Ejercicios propuestos — Encapsulamiento

## Cómo usar esta página

Estos ejercicios son **opcionales y no tienen nota**. No hay que entregarlos ni
hay fecha límite: existen para que practique por su cuenta lo visto en
**Encapsulamiento**.

Son los más exigentes del bloque de POO, y por una razón: ya no basta con que
el programa funcione. Aquí lo que se evalúa a sí mismo es si la clase **protege
sus propios datos** — si es imposible, desde fuera, dejar el objeto en un
estado inválido.

Una pregunta útil para revisarse: después de escribir cada clase, intente
romperla desde el `main` asignando un valor absurdo. Si lo consigue, al
encapsulamiento le falta algo.

## Estado y métodos de acceso

### 1. Estado de un objeto: Automóvil

Modele un automóvil con estos atributos: marca, modelo (año de fabricación),
motor (volumen en litros del cilindraje), tipo de combustible (enumerado:
gasolina, bioetanol, diésel, biodiésel, gas natural), tipo de automóvil
(enumerado: carro de ciudad, subcompacto, compacto, familiar, ejecutivo, SUV),
número de puertas, cantidad de asientos, velocidad máxima en km/h, color
(enumerado: blanco, negro, rojo, naranja, amarillo, verde, azul, violeta) y
velocidad actual.

La clase debe incluir:

- Un constructor que reciba los valores de sus atributos.
- Métodos `get` y `set` para cada atributo.
- Métodos para **acelerar** una cierta velocidad, **desacelerar** y **frenar**
  (poner la velocidad actual en cero). No se debe poder acelerar más allá de
  la velocidad máxima ni desacelerar a una velocidad negativa; si se intenta,
  muestre un mensaje.
- Un método que calcule el tiempo estimado de llegada dada una distancia en
  kilómetros (tiempo = distancia / velocidad actual).
- Un método que muestre los valores de los atributos.

En un `main`, cree un automóvil, ponga su velocidad en 100 km/h, auméntela en
20, luego decreméntela en 50 y finalmente frene, mostrando la velocidad actual
con cada cambio.

**Qué ejercita:** el concepto de estado de un objeto y los métodos `get`/`set`
como único punto de cambio.

**Extensión opcional:** agregue un booleano que indique si el vehículo es
automático; haga que acelerar por encima de la velocidad máxima genere una
multa acumulable, y agregue métodos para saber si tiene multas y su valor
total.

### 2. Métodos de acceso: Película

Defina una clase `Película` con estos atributos **privados**: nombre,
director, género (enumerado: ACCIÓN, COMEDIA, DRAMA, SUSPENSO), duración en
minutos (`int`), año de realización y calificación (`double`).

Defina un constructor público que reciba todos los atributos, y estos métodos:

- Métodos `get` y `set` para cada atributo, con **acceso privado para los
  `set`** y público para los `get`.
- Un método público `imprimir` que muestre los atributos.
- Un método privado `boolean esPeliculaEpica()`, que devuelve `true` si la
  duración es mayor o igual a tres horas.
- Un método privado `String calcularValoración()`, según esta tabla: [0, 2] →
  Muy mala; (2, 5] → Mala; (5, 7] → Regular; (7, 8] → Buena; (8, 10] →
  Excelente.
- Un método privado `boolean esSimilar(Película otra)`, que devuelve `true` si
  ambas películas son del mismo género y tienen la misma valoración.

En un `main`, construya dos películas — *Gandhi*, Richard Attenborough, DRAMA,
191 min, 1982, calificación 8.1; y *Thor*, Kenneth Branagh, ACCIÓN, 115 min,
2011, calificación 7.0 — determine si son épicas, calcule su valoración,
determine si son similares y muestre los resultados.

**Qué ejercita:** decidir el nivel de acceso de cada clase, atributo,
constructor y método. Fíjese en la consecuencia de que los `set` sean
privados: ¿quién puede modificar entonces una película?

## Constructores

### 3. Sobrecarga de constructores: artículo científico

Modele un artículo científico con estos metadatos: nombre del artículo, autor,
palabras clave, nombre de la publicación, año y resumen.

Defina **tres constructores sobrecargados**:

- El primero inicializa el artículo con solo su título y autor.
- El segundo lo inicializa con nombre, autor, palabras clave, publicación y
  año. Debe invocar al primero mediante `this(...)`.
- El tercero lo inicializa con todo lo anterior más el resumen. Debe invocar
  al segundo.

Agregue un método que imprima los atributos, y un `main` que use el tercer
constructor para instanciar un artículo y mostrar sus valores.

**Qué ejercita:** constructores sobrecargados y encadenados con `this(...)`,
sin duplicar la lógica de inicialización.

**Extensión opcional:**

- Defina una clase `Empleado` con identificador, nombre, apellidos y edad, con
  dos constructores: uno sin parámetros que inicializa valores por defecto
  (identificador 100, nombre y apellidos "Nuevo empleado", edad 18), y otro
  que asigna los valores recibidos.
- Defina una clase `Caja` con longitud de la base, anchura y altura, con tres
  constructores: uno que recibe los tres valores, uno sin parámetros que
  inicializa todo en cero, y uno que recibe una única longitud y la asigna a
  los tres atributos. Agregue un atributo de tipo de caja y un cuarto
  constructor que reciba los cuatro valores e invoque al primero.
