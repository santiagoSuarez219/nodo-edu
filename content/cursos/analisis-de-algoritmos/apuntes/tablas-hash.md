> Sesión T (Semana 13, lunes) — primer bloque, dictado en vivo por el docente
> (~1 h 15 min de las 2 h; el resto lo ocupa el apunte de árboles de búsqueda).
> Se encadena con la lectura previa «Tablas hash»: mismo archivador de la
> secretaría, mismos `Nodo` y `TablaHash` con encadenamiento, misma función
> `h(k) = k mod m`. Aquí **medimos** lo que la lectura afirmó: contamos
> comparaciones y vemos al factor de carga gobernar el costo. Convención de
> todo el apunte: una *comparación* es mirar una clave almacenada y compararla
> con la buscada. Todo el código sigue PEP 8 + type hints + docstring
> Google-style (regla vigente desde la Semana 3).
>
> **Nota al docente — qué NO se resuelve aquí.** El Laboratorio 3 (la P ★ de
> hoy) es evaluativo. Estos apuntes enseñan las **piezas** —función hash,
> `insertar`, `buscar`, `eliminar`, factor de carga, redimensionar, contador de
> comparaciones— con un contexto distinto (códigos de estudiantes de una
> secretaría). Lo que el estudiante ensambla **solo** en el laboratorio, y que
> aquí deliberadamente no aparece: (1) elegir el caso de consulta y sus datos
> de prueba, (2) partir de la solución lenta con listas y rediseñarla con su
> propia tabla, (3) repetir la medición variando `n` y producir la gráfica
> antes/después, (4) justificar su `m` y su α, (5) contrastar lo medido con la
> predicción teórica y extrapolar al caso real. Por eso en este apunte no hay
> gráfica ni barrido lista-vs-tabla sobre un escenario de consulta; la única
> comparación lista-vs-tabla es el reto en parejas (deduplicar inscripciones),
> con cifras impresas y sin gráfica. Si alguien pregunta «¿así es el
> laboratorio?», la respuesta es: las piezas sí, el ensamblaje no.

## Paso 1 — Medir antes de mejorar: la línea base con lista

Enunciado breve: la secretaría guarda los códigos de estudiante en una lista y
busca recorriéndola. Antes de proponer el mueble de cajones hay que **medir**
cuánto cuesta el método actual, con un contador de comparaciones. Sin ese
número, «mejorar» no significa nada.

```python
import random


def generar_codigos(n: int, semilla: int = 26) -> list[int]:
    """Genera n códigos de estudiante distintos de 7 dígitos.

    Args:
        n: Cantidad de códigos a generar.
        semilla: Semilla del generador, para que la corrida sea reproducible.

    Returns:
        Lista de n códigos distintos entre 2.000.000 y 2.999.999.
    """
    azar = random.Random(semilla)  # generador propio: no altera el global
    return azar.sample(range(2_000_000, 3_000_000), n)  # sin repetidos


def buscar_en_lista(codigos: list[int], objetivo: int) -> tuple[bool, int]:
    """Busca un código recorriendo la lista y cuenta las comparaciones.

    Args:
        codigos: Lista donde se busca.
        objetivo: Código buscado.

    Returns:
        Tupla (encontrado, comparaciones).
    """
    comparaciones = 0
    for codigo in codigos:
        comparaciones += 1  # cada código visitado es una comparación
        if codigo == objetivo:
            return True, comparaciones
    return False, comparaciones  # recorrió todo y no estaba


if __name__ == "__main__":
    for n in (500, 1000, 2000):
        codigos = generar_codigos(n)
        total = sum(buscar_en_lista(codigos, c)[1] for c in codigos)
        ausente = buscar_en_lista(codigos, 1)[1]  # 1 no es un código válido
        print(f"n={n}: promedio presente={total / n}, ausente={ausente}")
```

Salida esperada (verificada):

```text
n=500: promedio presente=250.5, ausente=500
n=1000: promedio presente=500.5, ausente=1000
n=2000: promedio presente=1000.5, ausente=2000
```

Punto a resaltar: el promedio para un código presente es exactamente
`(n + 1) / 2` y para uno ausente es `n`: al duplicar `n`, se duplican las
comparaciones. Es el Θ(n) de la pila de exámenes. Esta es la **línea base**:
cualquier estructura que proponga el resto de la sesión se juzga contra esos
números.

## Paso 2 — La función hash por división y por qué importa `m`

Enunciado breve: se implementa `h(k) = k mod m` y una función que cuenta
cuántas claves caen en cada cajón. Se prueba con dos conjuntos: códigos al
azar y los códigos de la sede nocturna, que la secretaría emite siempre
terminados en `00` (2.000.000, 2.000.100, 2.000.200…).

```python
from collections import Counter


def hash_division(clave: int, m: int) -> int:
    """Calcula el cajón de una clave por el método de la división.

    Args:
        clave: Código entero de estudiante.
        m: Número de cajones de la tabla.

    Returns:
        Posición entre 0 y m - 1.
    """
    return clave % m


def distribucion(claves: list[int], m: int) -> Counter[int]:
    """Cuenta cuántas claves envía la función hash a cada cajón.

    Args:
        claves: Claves a repartir.
        m: Número de cajones.

    Returns:
        Contador que asocia cada cajón usado con su cantidad de claves.
    """
    return Counter(hash_division(c, m) for c in claves)


def resumir(nombre: str, claves: list[int], m: int) -> None:
    """Imprime cuántos cajones se usan y qué tan cargado queda el peor.

    Args:
        nombre: Etiqueta del conjunto de claves.
        claves: Claves a repartir.
        m: Número de cajones.
    """
    d = distribucion(claves, m)
    print(f"{nombre}, m={m}: cajones usados={len(d)}, "
          f"mínimo={min(d.values())}, máximo={max(d.values())}")


if __name__ == "__main__":
    al_azar = generar_codigos(500)
    nocturna = list(range(2_000_000, 2_050_000, 100))  # 500 códigos en 00
    for m in (64, 61):
        resumir("al azar", al_azar, m)
        resumir("nocturna", nocturna, m)
```

**🐞 Error planeado:** escribe primero `m = 64` «porque 64 es un tamaño
redondo y cómodo» y deja que el grupo lo apruebe sin objetar.
**Síntoma:** con códigos al azar todo parece bien, pero con la sede nocturna
la salida dice que solo se usan 16 de los 64 cajones y que cada uno guarda
31 o 32 claves:

```text
al azar, m=64: cajones usados=64, mínimo=1, máximo=14
nocturna, m=64: cajones usados=16, mínimo=31, máximo=32
al azar, m=61: cajones usados=61, mínimo=3, máximo=16
nocturna, m=61: cajones usados=61, mínimo=8, máximo=9
```

**Pregunta al grupo:** «Hay 64 cajones y 500 claves: debería haber unas 8 por
cajón. ¿Por qué hay 31 en cada uno de solo 16 cajones?»
**Corrección:** cambiar a `m = 61` (primo, lejos de una potencia de 2). La
razón: las claves son `100 j`, y `100 mod 64 = 36`, así que `h = 36 j mod 64`,
que es siempre múltiplo de 4 (4 · (9 j mod 16)): solo 16 valores posibles
(0, 4, 8, …, 60). `64` y `100` comparten el factor 4, y la regularidad de las
claves se traduce en cajones desocupados. Con `m = 61` la tabla usa los 61
cajones y la peor carga baja de 32 a 9.

Punto a resaltar: la mala `m` **no se nota con claves al azar** (fila 1: 64
cajones usados), solo con claves con estructura; por eso se escoge `m` pensando
en los datos reales y no en lo cómodo. 500 claves en 16 cajones son cadenas de
~31: la tabla degeneró hacia el Θ(n) que se quería evitar.

## Paso 3 — Encadenamiento completo con contador

Enunciado breve: se construye `TablaHash` con encadenamiento (la misma de la
lectura previa) y se le añade un atributo `comparaciones` que cada operación
incrementa. Es la herramienta de medición del resto de la sesión.

```python
class Nodo:
    """Nodo de una cadena: guarda una pareja clave-valor."""

    def __init__(self, clave: int, valor: str) -> None:
        """Crea un nodo sin siguiente.

        Args:
            clave: Código que identifica al elemento.
            valor: Dato asociado a la clave.
        """
        self.clave = clave
        self.valor = valor
        self.siguiente: "Nodo | None" = None


class TablaHash:
    """Tabla hash con encadenamiento y h(k) = k mod m."""

    def __init__(self, m: int) -> None:
        """Crea una tabla con m cajones vacíos.

        Args:
            m: Número de cajones.
        """
        self.m = m
        self.n = 0  # claves almacenadas: lo necesita el factor de carga
        self.cajones: list["Nodo | None"] = [None] * m
        self.comparaciones = 0  # contador que usan las tres operaciones

    def insertar(self, clave: int, valor: str) -> None:
        """Inserta la pareja o actualiza el valor si la clave ya existe.

        Args:
            clave: Código del elemento.
            valor: Dato asociado.
        """
        i = hash_division(clave, self.m)
        actual = self.cajones[i]
        while actual is not None:  # primero revisa si la clave ya está
            self.comparaciones += 1
            if actual.clave == clave:
                actual.valor = valor  # existía: solo se actualiza
                return
            actual = actual.siguiente
        nuevo = Nodo(clave, valor)
        nuevo.siguiente = self.cajones[i]  # se enlaza al INICIO de la cadena
        self.cajones[i] = nuevo
        self.n += 1

    def buscar(self, clave: int) -> str | None:
        """Busca el valor asociado a una clave.

        Args:
            clave: Código a buscar.

        Returns:
            El valor asociado, o None si la clave no está.
        """
        actual = self.cajones[hash_division(clave, self.m)]
        while actual is not None:
            self.comparaciones += 1
            if actual.clave == clave:
                return actual.valor
            actual = actual.siguiente
        return None  # cadena agotada: no estaba

    def eliminar(self, clave: int) -> bool:
        """Elimina una clave de su cadena.

        Args:
            clave: Código a eliminar.

        Returns:
            True si se eliminó, False si no estaba.
        """
        i = hash_division(clave, self.m)
        anterior: "Nodo | None" = None
        actual = self.cajones[i]
        while actual is not None:
            self.comparaciones += 1
            if actual.clave == clave:
                if anterior is None:  # era la cabeza de la cadena
                    self.cajones[i] = actual.siguiente
                else:  # era un nodo intermedio o la cola
                    anterior.siguiente = actual.siguiente
                self.n -= 1
                return True
            anterior, actual = actual, actual.siguiente
        return False


if __name__ == "__main__":
    tabla = TablaHash(7)
    inscritos = [(2_418_307, "Sistemas"), (2_418_342, "Electrónica"),
                 (2_418_368, "Datos")]
    for codigo, programa in inscritos:
        tabla.insertar(codigo, programa)
    print("cajones:", [hash_division(c, 7) for c, _ in inscritos])
    print("comparaciones al insertar:", tabla.comparaciones)

    tabla.comparaciones = 0  # se reinicia antes de cada medición
    print(tabla.buscar(2_418_307), "con", tabla.comparaciones, "comparaciones")
    tabla.comparaciones = 0
    print(tabla.buscar(2_418_314), "con", tabla.comparaciones, "comparaciones")
    tabla.comparaciones = 0
    print(tabla.eliminar(2_418_342), "con", tabla.comparaciones, "comparaciones")
    tabla.comparaciones = 0
    print(tabla.buscar(2_418_307), "con", tabla.comparaciones, "comparaciones")
```

Salida esperada (verificada):

```text
cajones: [3, 3, 1]
comparaciones al insertar: 1
Sistemas con 2 comparaciones
None con 2 comparaciones
True con 1 comparaciones
Sistemas con 1 comparaciones
```

Punto a resaltar: seguir el rastro en pantalla. 2.418.307 y 2.418.342 caen
ambos en el cajón 3 (colisión). Como `insertar` enlaza al inicio, la cadena
queda `2.418.342 → 2.418.307`: por eso buscar el primero cuesta 2 comparaciones.
La búsqueda del ausente 2.418.314 (también cajón 3) cuesta 2 y devuelve
`None`: **una búsqueda fallida recorre toda la cadena**. Tras eliminar la
cabeza, el otro código queda en 1 comparación. Y el contador no cambia el
algoritmo: solo observa.

## 🗳️ Votación — buscar algo que no está

Cuándo: al terminar el Paso 3, antes de pasar al factor de carga. Se lanza por
encuesta o chat; votan solos y sin consultar.

Una tabla con encadenamiento tiene `m = 100` cajones y `n = 1000` claves
repartidas de forma pareja, así que cada cadena mide unos 10. Se busca una
clave **que no está** en la tabla. ¿Cuántas comparaciones se esperan?

- (a) 1, porque la función hash lleva directo al cajón.
- (b) 6, la mitad de una cadena más la comparación del hallazgo.
- (c) 10.
- (d) 1000.

Correcta: (c).

Qué revela cada distractor:
- (a) → cree que la tabla da acceso directo e ignora que dentro del cajón hay
  que recorrer la cadena.
- (b) → aplica la fórmula de una búsqueda **exitosa** (1 + α/2 = 6) a una
  fallida; olvida que sin hallazgo no hay parada anticipada.
- (d) → piensa que sin la clave hay que revisar toda la tabla, como en la
  lista; no ve que la función hash descarta de entrada los otros 99 cajones.

Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir. Cierre de la
discusión: la búsqueda fallida visita toda la cadena (α comparaciones en
promedio); la exitosa, en promedio, 1 + α/2.

## Paso 4 — Factor de carga y redimensionar

Enunciado breve: se miden las comparaciones por búsqueda sobre **una misma
tabla de `m = 101` cajones** al ir aumentando `n` (es decir, α) y se contrasta
con la fórmula de la lectura previa. Luego se agrega `redimensionar` para que
α vuelva a ser pequeño. Aquí se mide la relación comparaciones-α de la
tabla; no se compara contra la lista.

Se añaden dos métodos a `TablaHash` y una función de medición:

```python
    # --- dentro de la clase TablaHash ---

    def factor_de_carga(self) -> float:
        """Calcula el factor de carga alfa = n / m.

        Returns:
            Promedio de claves por cajón.
        """
        return self.n / self.m

    def redimensionar(self, nuevo_m: int) -> None:
        """Crea una tabla de nuevo_m cajones y reinserta todas las claves.

        Cuesta Θ(n + m): hay que recorrer todos los cajones y volver a
        calcular el cajón de cada clave con el nuevo m.

        Args:
            nuevo_m: Nuevo número de cajones.
        """
        viejos = self.cajones
        self.cajones = [None] * nuevo_m
        self.m = nuevo_m
        self.n = 0  # insertar vuelve a contar cada clave
        for cabeza in viejos:
            actual = cabeza
            while actual is not None:
                self.insertar(actual.clave, actual.valor)  # usa el nuevo m
                actual = actual.siguiente


def promedio_busqueda(tabla: TablaHash, claves: list[int]) -> float:
    """Mide las comparaciones promedio por búsqueda de una lista de claves.

    Args:
        tabla: Tabla donde se busca.
        claves: Claves a buscar.

    Returns:
        Comparaciones totales dividido entre la cantidad de claves.
    """
    tabla.comparaciones = 0
    for clave in claves:
        tabla.buscar(clave)
    return tabla.comparaciones / len(claves)


def construir(codigos: list[int], m: int) -> TablaHash:
    """Crea una tabla de m cajones con todos los códigos dados.

    Args:
        codigos: Claves a insertar.
        m: Número de cajones.

    Returns:
        La tabla ya poblada.
    """
    tabla = TablaHash(m)
    for codigo in codigos:
        tabla.insertar(codigo, "inscrito")
    return tabla


if __name__ == "__main__":
    codigos = generar_codigos(1600)
    print("   n  alfa  presentes  1+alfa/2  ausentes")
    for n in (50, 100, 200, 400, 800, 1600):
        tabla = construir(codigos[:n], 101)
        presentes = promedio_busqueda(tabla, codigos[:n])
        ausentes = promedio_busqueda(
            tabla, [3_000_000 + j for j in range(n)]  # fuera del rango válido
        )
        alfa = tabla.factor_de_carga()
        print(f"{n:4d} {alfa:5.2f} {presentes:10.2f} "
              f"{1 + alfa / 2:9.2f} {ausentes:9.2f}")

    # Redimensionar la tabla de n = 800 (alfa ~ 7,9) a m = 1009
    tabla = construir(codigos[:800], 101)
    print("antes:", round(promedio_busqueda(tabla, codigos[:800]), 2))
    tabla.redimensionar(1009)
    print("después: alfa =", round(tabla.factor_de_carga(), 2), "->",
          round(promedio_busqueda(tabla, codigos[:800]), 2))
```

Salida esperada (verificada):

```text
   n  alfa  presentes  1+alfa/2  ausentes
  50  0.50       1.20      1.25      0.48
 100  0.99       1.52      1.50      0.97
 200  1.98       1.99      1.99      1.98
 400  3.96       3.00      2.98      3.94
 800  7.92       4.97      4.96      7.91
1600 15.84       8.96      8.92     15.83
antes: 4.97
después: alfa = 0.79 -> 1.4
```

Punto a resaltar: dos columnas que coinciden con la lectura previa. Las
búsquedas **exitosas** siguen a `1 + α/2` (la tercera y la segunda columna
casi idénticas) y las **fallidas** siguen a α (la última columna). Con
`n = 1600` y `m = 101` hay ~16 claves por cadena y cada búsqueda cuesta ~9
comparaciones; el costo crece con α, no con n por sí solo. Tras
`redimensionar(1009)` el mismo conjunto de 800 códigos baja de 4,97 a 1,4
comparaciones por búsqueda. Contrapunto honesto: redimensionar cuesta Θ(n + m)
de una vez; se acepta porque se hace pocas veces. La regla práctica es
redimensionar cuando α pasa de un umbral (p. ej. 1) y duplicar `m`.

**🐞 Error planeado:** escribe `redimensionar` «rápido», con la idea de que
basta con alargar el arreglo:

```python
    def redimensionar_mal(self, nuevo_m: int) -> None:
        """Versión incorrecta: alarga el arreglo pero no reinserta."""
        self.cajones = self.cajones + [None] * (nuevo_m - self.m)
        self.m = nuevo_m
```

**Síntoma:** al correr `tabla.redimensionar_mal(1009)` sobre la tabla de 800
códigos y buscar cada uno, solo 2 de los 800 aparecen; `buscar` devuelve
`None` para los otros 798. Nada falla ni lanza excepción, simplemente los
datos «desaparecen».

```python
tabla = construir(codigos[:800], 101)
tabla.redimensionar_mal(1009)
hallados = sum(tabla.buscar(c) is not None for c in codigos[:800])
print("hallados tras redimensionar_mal:", hallados, "de 800")
```

Salida verificada: `hallados tras redimensionar_mal: 2 de 800`.

**Pregunta al grupo:** «Los nodos siguen en el arreglo. ¿Por qué `buscar` no
los encuentra?»
**Corrección:** `h(k) = k mod m` cambió porque `m` cambió. Una clave que estaba
en el cajón `k mod 101` ahora se busca en `k mod 1009`, otro cajón. Cambiar
`m` obliga a **recalcular el cajón de cada clave**, es decir, reinsertarlas
una por una: eso es exactamente lo que hace el `redimensionar` correcto. (Las
2 que sí aparecen son coincidencias donde ambos módulos dan el mismo cajón.)

## 🗳️ Votación — seguir el rastro de una cadena

Cuándo: tras el error planeado de `redimensionar` o, si el tiempo aprieta, en
lugar de volver sobre el Paso 3. Encuesta o chat.

Se usa la `TablaHash` de hoy con `m = 5`, que enlaza al **inicio** de la
cadena. Se insertan, en este orden, las claves 12, 7, 22, 2 y 17. Después se
llama a `buscar(2)`. ¿Cuántas comparaciones hace?

- (a) 1.
- (b) 2.
- (c) 4.
- (d) 5.

Correcta: (b).

Qué revela cada distractor:
- (a) → supone que la función hash lleva directo al dato; no ve que las cinco
  claves colisionan en el cajón 2 (12, 7, 22, 2 y 17 dan todas 2 módulo 5).
- (c) → asume que se inserta al **final** (orden de llegada 12, 7, 22, 2),
  donde 2 quedaría en la cuarta posición.
- (d) → cree que se recorre siempre toda la cadena, sin parar al encontrar la
  clave.

Cadena resultante: `17 → 2 → 22 → 7 → 12`. `buscar(2)` compara con 17 y luego
con 2: 2 comparaciones (verificado ejecutando el código).
Dinámica: votan solos → si hay entre 30 % y 70 % de aciertos, discuten en
parejas 2 min y vuelven a votar; si hay más de 70 %, explicas rápido y sigues;
si hay menos de 30 %, vuelves a explicar antes de discutir.

## 👥 Reto en parejas — deduplicar inscripciones

Tiempo sugerido: 12 min. Roles: una persona es *driver* (escribe) y la otra
*navigator* (dirige y revisa); cambian a mitad. En salas.

Enunciado: la secretaría recibió 1500 inscripciones a un taller, pero muchos
estudiantes se inscribieron más de una vez. Escriba dos funciones que
devuelvan la lista de códigos **sin repetidos** (conservando el orden de
primera aparición) y el número de comparaciones que cada una necesitó:
`deduplicar_con_lista`, usando `buscar_en_lista`, y `deduplicar_con_tabla`,
usando la `TablaHash` de hoy con `m = 401`. Verifiquen que ambas devuelven la
misma lista y comparen los contadores.

Solución completa:

```python
def deduplicar_con_lista(codigos: list[int]) -> tuple[list[int], int]:
    """Elimina repetidos usando una lista de «ya vistos» con búsqueda lineal.

    Args:
        codigos: Inscripciones, con posibles repeticiones.

    Returns:
        Tupla (únicos en orden de primera aparición, comparaciones).
    """
    vistos: list[int] = []
    comparaciones = 0
    for codigo in codigos:
        encontrado, usadas = buscar_en_lista(vistos, codigo)
        comparaciones += usadas  # acumula lo que costó cada búsqueda
        if not encontrado:
            vistos.append(codigo)
    return vistos, comparaciones


def deduplicar_con_tabla(
    codigos: list[int], m: int
) -> tuple[list[int], int]:
    """Elimina repetidos usando una TablaHash de «ya vistos».

    Args:
        codigos: Inscripciones, con posibles repeticiones.
        m: Número de cajones de la tabla.

    Returns:
        Tupla (únicos en orden de primera aparición, comparaciones). El
        contador incluye buscar e insertar, que recorren la misma cadena.
    """
    tabla = TablaHash(m)
    unicos: list[int] = []
    for codigo in codigos:
        if tabla.buscar(codigo) is None:  # no estaba: es la primera vez
            tabla.insertar(codigo, "inscrito")
            unicos.append(codigo)
    return unicos, tabla.comparaciones


if __name__ == "__main__":
    base = generar_codigos(600, semilla=11)
    azar = random.Random(7)
    inscripciones = [azar.choice(base) for _ in range(1500)]
    con_lista, c_lista = deduplicar_con_lista(inscripciones)
    con_tabla, c_tabla = deduplicar_con_tabla(inscripciones, 401)
    print("mismos resultados:", con_lista == con_tabla)
    print("distintos:", len(con_tabla))
    print("comparaciones con lista:", c_lista)
    print("comparaciones con tabla:", c_tabla)
```

Salida esperada (verificada):

```text
mismos resultados: True
distintos: 542
comparaciones con lista: 360672
comparaciones con tabla: 2191
```

Punto a resaltar: ambas dan los mismos 542 códigos distintos, pero una necesita
~360.000 comparaciones y la otra ~2.200, cerca de 165 veces menos, con
α final = 542 / 401 ≈ 1,35. Pregunta de cierre del reto: «¿Qué parte del conteo
de la tabla vendría de `buscar` y cuál de `insertar`, y por qué `insertar`
nunca encuentra la clave?» (Porque ya se verificó con `buscar` que no estaba:
recorre la cadena completa sin éxito, otra vez.) Esto es una sola medición con
cifras impresas; no se grafica ni se varía `n`.

## Paso 5 (opcional, si sobra tiempo) — Traza de sondeo lineal

Enunciado breve: sin listas, todo dentro del arreglo. Se ejecuta la traza que
la lectura previa describe con `m = 7`, para verificar sus números. Si no hay
tiempo, se omite; no se necesita para el resto de la sesión.

```python
def insertar_sondeo_lineal(tabla: list[int | None], clave: int) -> int:
    """Inserta una clave en direccionamiento abierto con sondeo lineal.

    Args:
        tabla: Arreglo de m casillas; None indica casilla libre.
        clave: Clave a insertar.

    Returns:
        Número de casillas sondeadas hasta colocar la clave.

    Raises:
        ValueError: Si la tabla está llena.
    """
    m = len(tabla)
    i = clave % m  # cajón inicial: h(k)
    for sondas in range(1, m + 1):
        if tabla[i] is None:  # casilla libre: se coloca aquí
            tabla[i] = clave
            return sondas
        i = (i + 1) % m  # ocupada: se prueba la siguiente, circular
    raise ValueError("tabla llena")


if __name__ == "__main__":
    tabla: list[int | None] = [None] * 7
    for clave in (10, 24, 17, 5):
        sondas = insertar_sondeo_lineal(tabla, clave)
        print(f"clave {clave}: h={clave % 7}, sondas={sondas}")
    print(tabla)
```

Salida esperada (verificada):

```text
clave 10: h=3, sondas=1
clave 24: h=3, sondas=2
clave 17: h=3, sondas=3
clave 5: h=5, sondas=2
[None, None, None, 10, 24, 17, 5]
```

Punto a resaltar: la clave 5 tenía `h = 5`, un cajón que no era de nadie más,
pero cae en el 6 porque la racha de 10, 24 y 17 ya había ocupado el 5. Eso es
el agrupamiento primario: la racha crece y atrae claves de otros cajones.

## Preguntas socráticas

- «Si una tabla pasa de `m = 101` a `m = 1009`, ¿por qué no basta con copiar
  los nodos al arreglo grande?» → Porque `h(k)` depende de `m`: cada clave
  debe recalcular su cajón.
- «¿Qué dato podría tener la secretaría para que `m = 64` sea una trampa?» →
  Cualquier dato con estructura: códigos terminados en ceros, números
  consecutivos por sede, múltiplos de un mismo valor.
- «La tabla encuentra un código en ~1 comparación. ¿Qué pregunta de la
  secretaría sigue costando Θ(n)?» → «El menor código» o «todos los códigos
  entre dos valores»: la tabla no guarda orden. Esa es la entrada a la
  segunda parte de la clase.

## Práctica externa

Tres problemas de LeetCode, de dificultad fácil, todos resolubles con una tabla
hash (`dict` o `set` de Python). Su existencia (número, nombre y dificultad) se
verificó consultando la API pública GraphQL de LeetCode por *slug*; las páginas
de los problemas respondieron 403 a la consulta automatizada, así que **los
enlaces no se pudieron abrir** desde el entorno de redacción (el docente debe
abrirlos una vez antes de compartirlos).

- **LeetCode 1 — Two Sum** (fácil):
  [Enlace](https://leetcode.com/problems/two-sum/). Busca dos números que sumen un
  objetivo; con una tabla de «ya vistos» pasa de Θ(n²) a Θ(n) esperado. Es la
  misma idea de buscar por clave en lugar de recorrer.
- **LeetCode 217 — Contains Duplicate** (fácil):
  [Enlace](https://leetcode.com/problems/contains-duplicate/). Es el reto de hoy en su
  forma mínima: detectar repetidos con un conjunto.
- **LeetCode 706 — Design HashMap** (fácil):
  [Enlace](https://leetcode.com/problems/design-hashmap/). Pide implementar un mapa sin
  librerías: obliga a elegir `m`, resolver colisiones y escribir `insertar`,
  `buscar` y `eliminar`, o sea las piezas de hoy.
