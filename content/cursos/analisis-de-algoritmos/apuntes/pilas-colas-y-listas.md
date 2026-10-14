> Sesión T (Semana 12, lunes 19 de octubre de 2026) — clase dictada en vivo
> por el docente; ese lunes no hay sesión P, así que aquí se reúne toda la
> práctica. Es la continuación práctica de la lección «Pilas, colas y listas
> enlazadas»: el estudiante ya la leyó y respondió el cuestionario de cierre,
> así que aquí no se re-explica; se construye. Hilo conductor: el escritorio
> del profesor el día del parcial (la bandeja de revisión, la fila de entrega,
> los post-its entre exámenes). Se escriben las tres estructuras con manos en
> el teclado —pila, cola circular y lista enlazada, simple y doble—, se
> mide qué cuesta insertar al inicio en un arreglo frente a una lista, y se
> cierra con el caso de telemedición de la lección (500 lecturas por segundo
> entrando, 400 saliendo; contexto de trabajo, no una entrega calificable).
> Todo el código sigue PEP 8 + *type hints* + docstring Google-style y los
> bloques están pensados para pegarse en un único archivo, en orden.

## Paso 1 — La bandeja de revisión: pila con arreglo

Enunciado breve: la pila de la lección, ahora completa y con `esta_vacia`.
Se escribe en vivo; la regla es que `pop` nunca opera sobre una pila vacía.

```python
class Pila:
    """Pila de enteros sobre un arreglo de capacidad fija."""

    def __init__(self, capacidad: int) -> None:
        """Crea una pila vacía.

        Args:
            capacidad: Número máximo de elementos.
        """
        self.datos: list[int] = [0] * capacidad
        self.tope: int = 0  # cantidad de elementos; también la próxima casilla

    def esta_vacia(self) -> bool:
        """Indica si no hay elementos.

        Returns:
            True si la pila está vacía.
        """
        return self.tope == 0

    def push(self, valor: int) -> None:
        """Apila un valor; falla si la pila está llena.

        Args:
            valor: Valor a apilar.

        Raises:
            OverflowError: Si la pila ya está en su capacidad máxima.
        """
        if self.tope == len(self.datos):
            raise OverflowError("pila llena")
        self.datos[self.tope] = valor
        self.tope += 1

    def pop(self) -> int:
        """Desapila el valor de arriba; falla si la pila está vacía.

        Returns:
            El último valor apilado.

        Raises:
            IndexError: Si la pila está vacía.
        """
        if self.esta_vacia():
            raise IndexError("pila vacía")
        self.tope -= 1
        return self.datos[self.tope]


def probar_pila() -> None:
    """Ejercita la pila: orden LIFO y error en pila vacía."""
    pila = Pila(3)
    for valor in (10, 20, 30):
        pila.push(valor)
    assert pila.pop() == 30 and pila.pop() == 20  # LIFO: sale el último
    try:
        Pila(1).pop()
    except IndexError:
        print("pop en pila vacía: IndexError, como se esperaba")
    try:
        pila.push(1)
        pila.push(2)
        pila.push(3)  # la pila ya tiene 10, 1, 2: con tres no cabe otro
    except OverflowError:
        print("push en pila llena: OverflowError, como se esperaba")


probar_pila()
```

**🐞 Error planeado:** al escribir `pop`, el docente omite la guarda y deja
solo `self.tope -= 1` y `return self.datos[self.tope]`.
**Síntoma:** `Pila(3).pop()` no falla: devuelve `0` y deja `tope = -1`. Un
`push(7)` posterior escribe en `datos[-1]`, la última casilla, y el arreglo
queda `[0, 0, 7]` con `tope = 0`: la pila parece vacía y el valor quedó
enterrado.
**Pregunta al grupo:** «¿Por qué Python no se quejó? ¿Dónde fue a parar el
7?».
**Corrección:** restaurar `if self.esta_vacia(): raise IndexError(...)`. El
índice negativo es válido en Python (cuenta desde el final), así que el
arreglo no avisa solo: la guarda es la única defensa.

Punto a resaltar: proyectar el arreglo `datos` junto al `tope` y repetir las
tres operaciones; `pop` no borra la casilla, solo baja `tope`. Todas las
operaciones de la pila cuestan Θ(1). El precio: la capacidad es fija y, cuando
se agota, `push` falla en lugar de crecer.

## 🗳️ Votación 1 — Qué devuelve cada pop

**Cuándo:** al terminar el paso 1.

Una `Pila(5)` empieza vacía. Se ejecuta: `push(1)`, `push(2)`, `pop()`,
`push(3)`, `pop()`, `pop()`. ¿Qué devuelven los tres `pop()`, en ese orden, y
cuánto vale `tope` al final?

- (a) `2`, `3`, `1` y `tope = 0`.
- (b) `1`, `2`, `3` y `tope = 0`.
- (c) `2`, `1`, `3` y `tope = 0`.
- (d) `2`, `3`, `1` y `tope = 1`, porque `1` sigue en el arreglo.

**Correcta:** (a). El primer `pop` saca el 2 (el último apilado); `push(3)`
reutiliza esa casilla; el segundo `pop` saca el 3; el tercero saca el 1. El
arreglo termina en `[1, 3, 0, 0, 0]`, pero `tope = 0` dice que no hay
elementos.

**Qué revela cada distractor:** (b) → razona como cola (FIFO): cree que sale
el primero que entró; (c) → cree que el 3 entra «debajo» del 1 y por eso el 1
sale antes que él; (d) → confunde lo que hay físicamente en el arreglo con lo
que la pila considera sus elementos: solo cuentan las casillas bajo `tope`.

**Dinámica:** votan solos; entre 30 % y 70 % de aciertos, 2 minutos en
parejas y se vota de nuevo; más de 70 %, explicas rápido y sigues; menos de
30 %, vuelves a trazar `tope` y `datos` paso a paso.

## Paso 2 — Una pila que trabaja: paréntesis balanceados

Enunciado breve: decidir si los paréntesis, corchetes y llaves de un texto
están bien cerrados, usando la `Pila` del paso 1. La pila guarda la
**posición** de cada símbolo que abre, no el símbolo: así la `Pila` de enteros
sirve tal cual.

```python
def esta_balanceado(texto: str) -> bool:
    """Indica si los símbolos de agrupación del texto están bien cerrados.

    Args:
        texto: Cadena a revisar; los demás caracteres se ignoran.

    Returns:
        True si cada símbolo que abre se cierra con su par y en orden.
    """
    pares = {")": "(", "]": "[", "}": "{"}
    pila = Pila(len(texto))  # nunca habrá más aperturas que caracteres
    for posicion, caracter in enumerate(texto):
        if caracter in "([{":
            pila.push(posicion)  # recuerda dónde abrió
        elif caracter in pares:
            # Cierra sin nada abierto, o cierra con el símbolo equivocado.
            if pila.esta_vacia() or texto[pila.pop()] != pares[caracter]:
                return False
    return pila.esta_vacia()  # si sobra algo abierto, no está balanceado


for ejemplo in ("{[()]}", "([)]", "((", ")(", "a(b)c"):
    print(ejemplo, esta_balanceado(ejemplo))
# {[()]} True
# ([)] False
# (( False
# )( False
# a(b)c True
```

Punto a resaltar: `([)]` tiene la misma cantidad de aperturas y cierres de
cada tipo y aun así falla: lo que importa es el **orden**, y el orden de
cierre es el inverso al de apertura, que es exactamente LIFO. Cada carácter
entra y sale de la pila a lo sumo una vez: el costo total es Θ(n).

## Paso 3 — La fila de entrega: cola circular

Enunciado breve: la cola circular, que la lección dejó en prosa, se escribe
completa hoy. `inicio` marca el próximo en salir y `tamano` cuántos hay; el
módulo convierte el arreglo en un anillo.

```python
class Cola:
    """Cola circular de enteros sobre un arreglo de capacidad fija."""

    def __init__(self, capacidad: int) -> None:
        """Crea una cola vacía.

        Args:
            capacidad: Número máximo de elementos.
        """
        self.datos: list[int] = [0] * capacidad
        self.inicio: int = 0  # casilla del próximo elemento en salir
        self.tamano: int = 0  # cuántos elementos hay ahora

    def enqueue(self, valor: int) -> None:
        """Encola un valor al final; falla si la cola está llena.

        Args:
            valor: Valor a encolar.

        Raises:
            OverflowError: Si la cola ya está en su capacidad máxima.
        """
        if self.tamano == len(self.datos):
            raise OverflowError("cola llena")
        # El módulo hace que la casilla liberada al frente se reutilice.
        posicion = (self.inicio + self.tamano) % len(self.datos)
        self.datos[posicion] = valor
        self.tamano += 1

    def dequeue(self) -> int:
        """Desencola el valor del frente; falla si la cola está vacía.

        Returns:
            El valor que llevaba más tiempo en la cola.

        Raises:
            IndexError: Si la cola está vacía.
        """
        if self.tamano == 0:
            raise IndexError("cola vacía")
        valor = self.datos[self.inicio]
        self.inicio = (self.inicio + 1) % len(self.datos)  # avanza y da vuelta
        self.tamano -= 1
        return valor


def probar_cola() -> None:
    """Ejercita la cola, incluida la vuelta de la cola circular."""
    cola = Cola(4)
    for valor in (10, 20, 30, 40):
        cola.enqueue(valor)
    assert cola.dequeue() == 10 and cola.dequeue() == 20  # FIFO
    cola.enqueue(50)  # se escribe en la casilla 0, que quedó libre
    cola.enqueue(60)  # se escribe en la casilla 1
    print(cola.datos, cola.inicio, cola.tamano)  # [50, 60, 30, 40] 2 4
    try:
        cola.enqueue(70)
    except OverflowError:
        print("enqueue en cola llena: OverflowError, como se esperaba")
    assert [cola.dequeue() for _ in range(4)] == [30, 40, 50, 60]


probar_cola()
```

Punto a resaltar: proyectar `[50, 60, 30, 40]` con `inicio = 2` y recorrer
con el dedo en el orden de salida: 30, 40, y luego **vuelve** a la casilla
0: 50, 60. Es la idea de la cola circular: el arreglo tiene un solo borde
físico, pero el módulo lo convierte en un anillo. `enqueue` y `dequeue`
cuestan Θ(1). El precio, igual que en la pila: la capacidad es fija.

## 🗳️ Votación 2 — El estado de una cola circular

**Cuándo:** al terminar el paso 3 (cola circular), antes de pasar a la lista
enlazada.

Una cola circular de capacidad 3 empieza vacía (`inicio = 0`, `tamano = 0`).
Se ejecuta: `enqueue(1)`, `enqueue(2)`, `enqueue(3)`, `dequeue()`,
`enqueue(4)`, `dequeue()`. ¿Qué devuelve el **último** `dequeue()` y cómo
queda el arreglo `datos`?

- (a) Devuelve `2` y `datos` es `[4, 2, 3]`.
- (b) Devuelve `4` y `datos` es `[4, 2, 3]`.
- (c) Devuelve `3` y `datos` es `[1, 2, 3]`.
- (d) Lanza `OverflowError` porque la cola «se llenó al dar la vuelta».

**Correcta:** (a). El primer `dequeue` saca 1 y deja `inicio = 1`,
`tamano = 2`; el `enqueue(4)` escribe en `(1 + 2) % 3 = 0`, que es la casilla
que quedó libre; el segundo `dequeue` lee en `inicio = 1`, devuelve 2 y deja
`inicio = 2`.

**Qué revela cada distractor:** (b) → cree que, al dar la vuelta, el
siguiente en salir es el recién llegado (mezcla la cola con una pila);
(c) → cree que `dequeue` borra el arreglo o que `datos` no cambia con
`enqueue(4)`, y que el valor leído es el último del arreglo; (d) → confunde
«el índice dio la vuelta» con «no queda espacio»: la cola solo está llena
cuando `tamano == capacidad`, y aquí `tamano` valía 2 antes del `enqueue(4)`.

**Dinámica:** votan solos; entre 30 % y 70 % de aciertos, 2 minutos en
parejas y se vota de nuevo; más de 70 %, explicas rápido y sigues; menos de
30 %, vuelves a trazar `inicio` y `tamano` sobre el arreglo antes de
discutir.

## Paso 4 — Los post-its: lista simplemente enlazada

Enunciado breve: los exámenes con post-its. La clase `Nodo` es la de la
lección; `ListaEnlazada` agrega la cabeza, una referencia a la cola (último
nodo) y las operaciones básicas. La referencia a la cola es una decisión de
diseño: sin ella `insertar_al_final` costaría Θ(n).

```python
class Nodo:
    """Nodo de una lista enlazada simple."""

    def __init__(self, valor: int, siguiente: "Nodo | None" = None) -> None:
        """Crea un nodo.

        Args:
            valor: Dato que guarda el nodo.
            siguiente: Nodo al que apunta, o None si es el último.
        """
        self.valor = valor
        self.siguiente = siguiente


class ListaEnlazada:
    """Lista simplemente enlazada de enteros con cabeza y cola."""

    def __init__(self) -> None:
        """Crea una lista vacía."""
        self.cabeza: Nodo | None = None
        self.cola: Nodo | None = None
        self.tamano: int = 0

    def insertar_al_inicio(self, valor: int) -> None:
        """Inserta un valor antes de la cabeza en Θ(1).

        Args:
            valor: Valor a insertar.
        """
        self.cabeza = Nodo(valor, self.cabeza)  # el nuevo apunta a la vieja cabeza
        if self.cola is None:
            self.cola = self.cabeza  # lista que estaba vacía: un solo nodo
        self.tamano += 1

    def insertar_al_final(self, valor: int) -> None:
        """Inserta un valor después de la cola en Θ(1).

        Args:
            valor: Valor a insertar.
        """
        nuevo = Nodo(valor)
        if self.cola is None:
            self.cabeza = self.cola = nuevo
        else:
            self.cola.siguiente = nuevo  # el último apunta al nuevo
            self.cola = nuevo
        self.tamano += 1

    def buscar(self, valor: int) -> Nodo | None:
        """Busca un valor siguiendo los punteros desde la cabeza, Θ(n).

        Args:
            valor: Valor buscado.

        Returns:
            El primer nodo con ese valor, o None si no está.
        """
        actual = self.cabeza
        while actual is not None and actual.valor != valor:
            actual = actual.siguiente
        return actual

    def eliminar(self, valor: int) -> bool:
        """Elimina la primera aparición de un valor, Θ(n).

        Args:
            valor: Valor a eliminar.

        Returns:
            True si se eliminó un nodo; False si el valor no estaba.
        """
        anterior: Nodo | None = None
        actual = self.cabeza
        while actual is not None and actual.valor != valor:
            anterior = actual  # hay que recordar al antecesor: no hay marcha atrás
            actual = actual.siguiente
        if actual is None:
            return False
        if anterior is None:
            self.cabeza = actual.siguiente  # se borra la cabeza
        else:
            anterior.siguiente = actual.siguiente  # el antecesor salta al nodo
        if actual is self.cola:
            self.cola = anterior  # se borró el último: la cola retrocede
        self.tamano -= 1
        return True

    def a_lista(self) -> list[int]:
        """Recorre la lista de la cabeza a la cola.

        Returns:
            Los valores en el orden de la lista.
        """
        valores: list[int] = []
        actual = self.cabeza
        while actual is not None:
            valores.append(actual.valor)
            actual = actual.siguiente
        return valores


lista = ListaEnlazada()
for valor in (30, 20, 10):
    lista.insertar_al_inicio(valor)  # queda 10 -> 20 -> 30
lista.insertar_al_final(40)  # 10 -> 20 -> 30 -> 40
print(lista.a_lista(), lista.tamano)  # [10, 20, 30, 40] 4
assert lista.buscar(30) is not None and lista.buscar(99) is None
assert lista.eliminar(10) and lista.eliminar(40) and not lista.eliminar(99)
print(lista.a_lista(), lista.tamano)  # [20, 30] 2
lista.insertar_al_final(50)  # prueba de que la cola se actualizó
print(lista.a_lista())  # [20, 30, 50]
```

**🐞 Error planeado:** al escribir `eliminar`, el docente omite las dos
líneas finales de la rama del último nodo (`if actual is self.cola: ...`).
**Síntoma:** tras `eliminar(40)`, `a_lista()` se ve bien, pero el
`insertar_al_final(50)` siguiente no aparece: la lista imprime `[20, 30]` en
vez de `[20, 30, 50]`, porque `self.cola` seguía apuntando al nodo 40, que ya
no está en la cadena.
**Pregunta al grupo:** «¿A qué nodo se enganchó el 50?».
**Corrección:** restaurar `if actual is self.cola: self.cola = anterior`. La
lista guarda **dos** referencias de entrada (`cabeza` y `cola`); cada
operación que quita el primero o el último tiene que mantener ambas.

Punto a resaltar: dibujar en la pizarra los post-its y seguir `eliminar(40)`.
Conectar con la tabla de la lección: acceso por posición Θ(n), insertar al
inicio Θ(1), buscar Θ(n). Hoy `eliminar` recorre la lista buscando al
antecesor: Θ(n). El siguiente paso muestra cómo evitarlo cuando el nodo ya
está en la mano.

## Paso 5 — Dos post-its por examen: lista doblemente enlazada

Enunciado breve: cada nodo guarda también a su antecesor. Con eso, borrar un
nodo que ya se tiene en la mano no necesita recorrer nada: Θ(1).
`insertar_al_final` devuelve el nodo creado para poder borrarlo después.

```python
class NodoDoble:
    """Nodo de una lista doblemente enlazada."""

    def __init__(self, valor: int) -> None:
        """Crea un nodo sin vecinos.

        Args:
            valor: Dato que guarda el nodo.
        """
        self.valor = valor
        self.anterior: "NodoDoble | None" = None
        self.siguiente: "NodoDoble | None" = None


class ListaDoble:
    """Lista doblemente enlazada de enteros con cabeza y cola."""

    def __init__(self) -> None:
        """Crea una lista vacía."""
        self.cabeza: NodoDoble | None = None
        self.cola: NodoDoble | None = None
        self.tamano: int = 0

    def insertar_al_final(self, valor: int) -> NodoDoble:
        """Inserta un valor después de la cola en Θ(1).

        Args:
            valor: Valor a insertar.

        Returns:
            El nodo creado, para poder borrarlo después en Θ(1).
        """
        nuevo = NodoDoble(valor)
        if self.cola is None:
            self.cabeza = self.cola = nuevo
        else:
            nuevo.anterior = self.cola  # el nuevo mira hacia atrás
            self.cola.siguiente = nuevo  # el último mira hacia el nuevo
            self.cola = nuevo
        self.tamano += 1
        return nuevo

    def eliminar_nodo(self, nodo: NodoDoble) -> None:
        """Elimina un nodo ya localizado en Θ(1), sin buscar a su antecesor.

        Args:
            nodo: Nodo que pertenece a esta lista.
        """
        if nodo.anterior is None:
            self.cabeza = nodo.siguiente  # se borra la cabeza
        else:
            nodo.anterior.siguiente = nodo.siguiente  # el antecesor salta al nodo
        if nodo.siguiente is None:
            self.cola = nodo.anterior  # se borra la cola
        else:
            nodo.siguiente.anterior = nodo.anterior  # el sucesor mira al antecesor
        self.tamano -= 1

    def a_lista(self) -> list[int]:
        """Recorre la lista de la cabeza a la cola.

        Returns:
            Los valores en el orden de la lista.
        """
        valores: list[int] = []
        actual = self.cabeza
        while actual is not None:
            valores.append(actual.valor)
            actual = actual.siguiente
        return valores

    def a_lista_inversa(self) -> list[int]:
        """Recorre la lista de la cola a la cabeza.

        Returns:
            Los valores en orden inverso.
        """
        valores: list[int] = []
        actual = self.cola
        while actual is not None:
            valores.append(actual.valor)
            actual = actual.anterior
        return valores


doble = ListaDoble()
nodos = [doble.insertar_al_final(valor) for valor in (10, 20, 30, 40)]
doble.eliminar_nodo(nodos[1])  # borra 20, en medio
doble.eliminar_nodo(nodos[3])  # borra 40, la cola
doble.eliminar_nodo(nodos[0])  # borra 10, la cabeza
print(doble.a_lista(), doble.a_lista_inversa(), doble.tamano)  # [30] [30] 1
doble.eliminar_nodo(nodos[2])  # borra el único nodo que queda
print(doble.a_lista(), doble.cabeza, doble.cola, doble.tamano)  # [] None None 0
```

Punto a resaltar: señalar las **cuatro** casillas de `eliminar_nodo` (cabeza,
cola, antecesor, sucesor) y preguntar qué pasaría con un nodo en medio frente
a uno en el borde. Recorrer la lista hacia atrás con `a_lista_inversa` es lo
que la lista simple no puede hacer. El precio de la lista doble es un
puntero extra por nodo y un código más largo.

## Paso 6 — Experimento: insertar al inicio en un arreglo contra una lista

Enunciado breve: se cuenta cuántos elementos se mueven al insertar `n` valores
uno tras otro **al inicio**, primero en un arreglo (hay que correr todos los
elementos una casilla) y luego en la `ListaEnlazada` del paso 4. Contar
movimientos, y no segundos, da cifras exactas en cualquier equipo.

```python
def insertar_al_inicio_arreglo(datos: list[int], tamano: int, valor: int) -> int:
    """Inserta al inicio de un arreglo corriendo los elementos una casilla.

    Args:
        datos: Arreglo con espacio libre al final.
        tamano: Cantidad de casillas ocupadas.
        valor: Valor a insertar.

    Returns:
        Cuántos elementos hubo que mover.
    """
    movimientos = 0
    for i in range(tamano, 0, -1):  # de atrás hacia adelante, para no pisar datos
        datos[i] = datos[i - 1]
        movimientos += 1
    datos[0] = valor
    return movimientos


print("n      arreglo    lista")
for n in (1000, 2000, 4000):
    datos = [0] * n
    movidos = sum(insertar_al_inicio_arreglo(datos, k, k) for k in range(n))
    lista = ListaEnlazada()
    for k in range(n):
        lista.insertar_al_inicio(k)  # un nodo nuevo por inserción
    assert lista.tamano == n
    print(f"{n:<6} {movidos:<10} {n}")
# n      arreglo    lista
# 1000   499500     1000
# 2000   1999000    2000
# 4000   7998000    4000
```

Punto a resaltar: al duplicar `n`, los movimientos del arreglo se **cuadruplican**
(499.500 → 1.999.000 → 7.998.000): sumar `0 + 1 + … + (n − 1)` da `n(n − 1)/2`,
es decir Θ(n²) en total, Θ(n) por inserción. La lista paga una operación por
inserción: Θ(1). Volver al caso de la lección: con 1.850.000 lecturas, cada
inserción al inicio de un arreglo movería hasta 1.850.000 elementos. Y
recordar el otro lado de la tabla: leer la posición `k` es Θ(1) en el
arreglo y Θ(k) en la lista. Ninguna gana en todo.

## 👥 Reto en parejas — ¿En qué segundo se llena el buffer?

**Tiempo sugerido:** 15 min. En virtual: salas de dos; cada pareja comparte
pantalla y trabaja en un solo archivo. **Roles:** *driver* escribe;
*navigator* dirige y revisa; cambian de rol a la mitad.

**Enunciado:** el sistema de telemedición de la lección recibe 500 lecturas por
segundo y procesa 400 por segundo, con una cola circular de capacidad 10.000.
Usen la `Cola` del paso 3 para simular segundo a segundo —cada segundo
primero llegan las 500 lecturas y luego se procesan hasta 400— y devuelvan el
segundo en el que el primer `enqueue` falla y cuántas lecturas había en la cola
en ese momento. Antes de correr la simulación, calculen a mano la respuesta
esperada con la cuenta de la lección (`10.000 / 100`) y comparen.

**Solución completa:**

```python
def segundo_de_desborde(capacidad: int, llegan: int, procesa: int) -> tuple[int, int]:
    """Simula el buffer hasta que una lectura no cabe.

    Args:
        capacidad: Tamaño de la cola circular.
        llegan: Lecturas que llegan por segundo.
        procesa: Lecturas que se procesan por segundo.

    Returns:
        Una tupla (segundo, lecturas en la cola) del primer desborde.
    """
    cola = Cola(capacidad)
    segundo = 0
    while True:
        segundo += 1
        for _ in range(llegan):  # primero llega todo el lote del segundo
            try:
                cola.enqueue(segundo)
            except OverflowError:
                return segundo, cola.tamano
        for _ in range(min(procesa, cola.tamano)):  # luego se procesa
            cola.dequeue()


print(segundo_de_desborde(10_000, 500, 400))  # (97, 10000)
```

Punto a resaltar: la cuenta neta de la lección dice 100 segundos y la
simulación dice **97**. La cuenta neta mira la diferencia por segundo (+100),
pero la cola recibe el lote de 500 *antes* de procesar; el pico dentro del
segundo es `tamaño + 500`, no `tamaño + 100`. Con 96 segundos completos hay
9.600 lecturas, la cola recibe 400 más hasta llenarse y la 401.ª ya no cabe.
Debrief: la estimación da el orden de magnitud; la simulación fija el detalle
que decide si el sistema pierde datos. Cada `enqueue` y `dequeue` sigue
costando Θ(1): lo que se agota es la capacidad, no el tiempo por operación.

## Preguntas socráticas

Para lanzar al grupo si se estanca:

1. **¿Por qué `pop` sin guarda no falló en Python?** Porque `datos[-1]` es una
   posición válida: Python cuenta los índices negativos desde el final. El
   error real aparece mucho después y lejos del origen, que es lo que lo
   vuelve caro de depurar.
2. **En la cola circular, ¿cómo se distingue «llena» de «vacía» si `inicio`
   puede coincidir con la posición de escritura en ambos casos?** Con el
   contador `tamano`: vacía es `tamano == 0`, llena es
   `tamano == capacidad`. Sin él habría que sacrificar una casilla.
3. **¿Por qué `eliminar` en una lista simple recorre dos referencias
   (`anterior` y `actual`)?** Porque desde un nodo solo se puede avanzar; para
   saltarse al que se borra hay que haber guardado a su antecesor.
4. **Si la lista doble borra en Θ(1), ¿por qué `eliminar(valor)` sobre ella
   sigue siendo Θ(n)?** Porque primero hay que *encontrar* el nodo con ese
   valor, y buscar es Θ(n); el Θ(1) vale solo cuando el nodo ya está en la
   mano, como cuando `insertar_al_final` lo devolvió.

## Práctica externa

Tres problemas reales para practicar en casa, uno por tema de la sesión:

- **LeetCode 20 — Valid Parentheses** (Easy):
  https://leetcode.com/problems/valid-parentheses/ . Es el paso 2 con su
  enunciado original; intentar primero con la pila de posiciones y luego
  guardando directamente el símbolo.
- **LeetCode 622 — Design Circular Queue** (Medium):
  https://leetcode.com/problems/design-circular-queue/ . La cola circular
  del paso 3 con una interfaz de clase y sus casos de «llena» y «vacía».
- **LeetCode 206 — Reverse Linked List** (Easy):
  https://leetcode.com/problems/reverse-linked-list/ . Manipulación de
  punteros sobre la lista del paso 4.
