# Lab 02 — Configuración del entorno de trabajo · Guía del docente

## Ficha de la sesión

- **Curso:** Análisis de Algoritmos (virtual, Ingeniería de Sistemas, sin prerrequisitos)
- **Semana / sesión:** Semana 2 (10–16 de agosto de 2026), Sesión 2 (P) — laboratorio práctico
- **Duración:** 2 horas
- **Momento evaluativo:** Ninguno. No hay ★ esta semana; el primer laboratorio evaluativo (★ Laboratorio 1) es en la Semana 6. Esta sesión alimenta únicamente la nota de **Seguimiento** (ejercicios de clase, consistencia de commits).
- **Lección teórica de la que depende:** "Sintaxis básica de Python" (Sesión 1 T, misma semana) — tipos de datos básicos, estructuras de control (`if`/`elif`/`else`, `for`, `while`), funciones (definición, parámetros, retorno, *docstrings*), estructuras nativas (listas, tuplas, diccionarios, conjuntos), comprensión de listas y manejo básico de excepciones (`try`/`except`) e `import`. También depende de "Buenas prácticas y entornos de trabajo en Python" (misma sesión T, segunda mitad) — PEP 8, `pip`, entornos virtuales y `requirements.txt`, que es lo que esta sesión práctica ejecuta directamente.
- **Sprint del proyecto:** No aplica — este curso no tiene proyecto de aula (ver `info.md`). Esta sesión monta el **entorno técnico** (`venv`, `requirements.txt`, convenciones PEP 8) que el estudiante reutilizará sin volver a crearlo en cada una de las 14 sesiones prácticas restantes, incluidos los 5 informes evaluativos.

## Objetivo de la sesión

Al salir del aula, el estudiante debe poder:

- Explicar por qué un proyecto de Python necesita un entorno virtual propio, y crear/activar/desactivar uno con `venv`.
- Instalar dependencias dentro de ese entorno y generar un `requirements.txt` reproducible con `pip freeze`.
- Aplicar las convenciones básicas de PEP 8 (nombres, espaciado, estructura con `if __name__ == "__main__":`) y *type hints* simples a un script ya escrito.
- Escribir un script pequeño, con al menos una función documentada con *docstring*, nombres claros y punto de entrada `main`, que aplique al menos tres de los conceptos de sintaxis vistos en la sesión teórica de hoy.

## Conexión con la teoría

La sesión T de hoy instaló tipos de datos, control de flujo, funciones, estructuras nativas, comprensión de listas y excepciones/`import` — todo en abstracto, ejecutado como mucho en un intérprete interactivo o un script suelto sin ningún cuidado de organización. Este laboratorio no agrega sintaxis nueva: le da a esa sintaxis un **hogar técnico** — un entorno aislado y reproducible, y las convenciones con las que se va a escribir código el resto del semestre, incluyendo los cinco informes evaluados.

Pregunta de apertura para el grupo: *"¿Qué pasaría si instalan una versión de `matplotlib` en su computador para este curso, y el próximo semestre otro curso o proyecto necesita una versión distinta e incompatible? ¿Por qué no basta con tener Python instalado una sola vez en la máquina?"* (Respuesta esperada: cada proyecto puede necesitar versiones distintas de las mismas librerías; instalarlo todo de forma global genera conflictos silenciosos y hace que el proyecto de otra persona —o del propio estudiante en el futuro— no sea reproducible.)

## Minutado

| Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
|---|---|---|---|
| 0:00 – 0:15 | Bloque 1 — Apertura: por qué aislar dependencias | Plantea la pregunta de conexión con la teoría. Dibuja en el tablero el problema de dos proyectos con versiones distintas de una misma librería instaladas globalmente. Anuncia que hoy se monta el entorno que usarán toda la carrera del curso. | Responde la pregunta de apertura. Verifica que tiene Python 3.x instalado (`python3 --version`) y abre su repositorio de la Semana 1. |
| 0:15 – 0:40 | Bloque 2 — Crear y activar `venv` | Demuestra en su propia pantalla `python3 -m venv venv`, la activación (y la diferencia de comando entre Windows/macOS/Linux) y cómo verificar que el entorno está activo (`(venv)` en el prompt, `which python` / `where python`). Circula verificando que cada estudiante ve el prefijo `(venv)`. | Crea el entorno virtual dentro de `ejercicios-clase/semana-02/`, lo activa, verifica el prompt y ejecuta `pip list` para confirmar que el entorno está casi vacío. |
| 0:40 – 1:05 | Bloque 3 — `requirements.txt` y `matplotlib` | Guía `pip install matplotlib` dentro del entorno activado, luego `pip freeze > requirements.txt`. Simula la reproducibilidad: pide desactivar, borrar `venv/`, recrearlo y correr `pip install -r requirements.txt`. | Instala `matplotlib`, genera `requirements.txt`, revisa su contenido, y reproduce el entorno desde cero siguiendo al docente. |
| 1:05 – 1:30 | Bloque 4 — PEP 8 y *type hints* | Proyecta un script mal escrito (nombres en `CamelCase`, espaciado inconsistente, sin `docstring`, sin `main`) y lo refactora en vivo junto al grupo, explicando cada regla de PEP 8 que aplica y agregando *type hints* básicos. | Refactora el mismo script mal escrito en su propia máquina, aplicando las mismas reglas. |
| 1:30 – 1:55 | Bloque 5 — Ejercicio integrador guiado | Presenta el enunciado del clasificador de años bisiestos. Aclara los requisitos mínimos (función con *docstring*, `main`, ≥3 conceptos de sintaxis). Circula resolviendo dudas puntuales sin dar la solución completa. | Implementa el ejercicio integrador siguiendo el esqueleto de funciones planteado. Prueba su script con al menos un año bisiesto y uno no bisiesto. |
| 1:55 – 2:00 | Cierre | Resume el flujo completo (`venv` → `requirements.txt` → PEP 8 → ejercicio) y anuncia que la Semana 3 empieza a usar este mismo entorno para insertion sort. | Hace `commit` y `push` de lo avanzado; anota lo pendiente si no terminó el ejercicio integrador. |

Suma: 2 h 00 min.

## Desarrollo paso a paso

### Paso 1 — Crear y activar el entorno virtual (0:15–0:40)

Enunciado para el grupo: "Dentro de su repositorio del curso, en `ejercicios-clase/semana-02/`, van a crear un entorno de Python que va a vivir aislado de todo lo demás que tengan instalado."

Solución de referencia:

```bash
cd curso-analisis-algoritmos/ejercicios-clase
mkdir semana-02
cd semana-02

python3 -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

Verificación de que el entorno quedó activo:

```bash
# El prompt debe mostrar el prefijo (venv)
which python      # macOS/Linux — debe apuntar dentro de la carpeta venv/
where python       # Windows — debe apuntar dentro de la carpeta venv/
pip list           # Debe mostrar solo pip y setuptools, prácticamente vacío
```

Punto de control: cada estudiante debe mostrar el prefijo `(venv)` en su terminal y que `which python`/`where python` apunta dentro de `semana-02/venv/`, no a la instalación global del sistema.

Antes de seguir, recordar que `venv/` **no se versiona** — agregar la entrada al `.gitignore` del repositorio (creado en el Laboratorio 01):

```bash
echo "venv/" >> ../../.gitignore
```

### Paso 2 — `requirements.txt` reproducible (0:40–1:05)

Enunciado: "Instalen dentro del entorno la librería que van a usar todo el semestre para graficar, y dejen un registro exacto de qué instalaron, para que cualquiera pueda reproducir este mismo entorno con un solo comando."

Solución de referencia:

```bash
pip install matplotlib
pip freeze > requirements.txt
cat requirements.txt
```

Salida esperada (versiones exactas variarán):

```text
contourpy==1.3.0
cycler==0.12.1
fonttools==4.53.1
kiwisolver==1.4.5
matplotlib==3.9.2
numpy==2.1.0
packaging==24.1
pillow==10.4.0
pyparsing==3.1.2
python-dateutil==2.9.0.post0
six==1.16.0
```

Prueba de reproducibilidad — simular que otra persona (o el propio estudiante en otra máquina) clona el repositorio sin `venv/`:

```bash
deactivate
rm -rf venv          # Windows: rmdir /s /q venv
python3 -m venv venv
source venv/bin/activate   # o el equivalente de Windows
pip install -r requirements.txt
pip list
```

Punto de control (minuto ~1:00): `pip list` tras la reinstalación debe mostrar exactamente las mismas librerías (y versiones) que antes de borrar `venv/`. Esto es lo que demuestra que `requirements.txt` — y no `venv/` — es lo que hace reproducible el proyecto.

### Paso 3 — PEP 8 y *type hints* básicos (1:05–1:30)

Enunciado: "Este script funciona, pero no sigue las convenciones de estilo que va a usar el resto del curso. Refactorícenlo aplicando PEP 8 y agregando *type hints*."

Script de partida (proyectar tal cual, con las violaciones deliberadas):

```python
def CalcularPromedio(Lista):
    s=0
    for x in Lista:
     s=s+x
    return s/len(Lista)

l=[1,2,3,4,5]
print(CalcularPromedio(l))
```

Solución de referencia:

```python
"""Calcula el promedio de una lista de números."""


def calcular_promedio(numeros: list[float]) -> float:
    """Calcula el promedio aritmético de una lista de números.

    Args:
        numeros: lista de valores numéricos, no vacía.

    Returns:
        El promedio aritmético de los valores.
    """
    return sum(numeros) / len(numeros)


def main() -> None:
    valores = [1, 2, 3, 4, 5]
    print(f"Promedio: {calcular_promedio(valores):.2f}")


if __name__ == "__main__":
    main()
```

Reglas de PEP 8 a señalar explícitamente mientras se refactoriza:
- Funciones y variables en `snake_case`, no `CamelCase` (`CamelCase` se reserva para nombres de clases).
- Espacios alrededor de operadores (`s = s + x`, no `s=s+x`) y después de comas.
- Indentación de **4 espacios**, nunca 1 espacio ni tabulaciones mezcladas con espacios.
- Nombres descriptivos (`numeros`, `calcular_promedio`) en vez de abreviaturas de una letra (`l`, `s`, `x`) salvo en contadores triviales de bucles muy cortos.
- Todo script ejecutable debe envolver su lógica principal en `def main() -> None:` y protegerla con `if __name__ == "__main__":`, para que el archivo se pueda importar sin ejecutar nada por accidente.

Punto de control (minuto ~1:28): revisar en pantalla de cada estudiante que el script refactorizado tiene `snake_case`, *type hints* en la firma de la función, *docstring* y el bloque `if __name__ == "__main__":`.

### Paso 4 — Ejercicio integrador: clasificador de años bisiestos (1:30–1:55)

Enunciado para el grupo: "Escriban un script que le pida al usuario una lista de años separados por comas, determine cuáles son bisiestos, y muestre un resumen. El script debe tener al menos una función documentada con *docstring*, nombres claros, un punto de entrada `main`, y debe aplicar al menos tres de los conceptos de la sesión teórica de hoy (tipos de datos, control de flujo, funciones, estructuras nativas, comprensión de listas, excepciones o `import`)."

Reglas del año bisiesto (recordarlas en el tablero, ya que es la primera vez que el grupo las codifica): un año es bisiesto si es divisible por 4, excepto los años divisibles por 100 que no lo sean también por 400. Ejemplos: 2024 es bisiesto; 1900 no lo es (divisible por 100, no por 400); 2000 sí lo es (divisible por 400).

Solución de referencia completa:

```python
"""Clasificador de años bisiestos.

Uso:
    python clasificador_anios.py
"""

import statistics


def es_bisiesto(anio: int) -> bool:
    """Determina si un año es bisiesto.

    Un año es bisiesto si es divisible por 4, excepto los años
    divisibles por 100 que no lo sean también por 400.

    Args:
        anio: año a evaluar (número entero).

    Returns:
        True si el año es bisiesto, False en caso contrario.
    """
    if anio % 4 != 0:
        return False
    elif anio % 100 == 0 and anio % 400 != 0:
        return False
    else:
        return True


def leer_anios() -> list[int]:
    """Solicita al usuario una lista de años separados por comas.

    Reintenta mientras la entrada no se pueda convertir a enteros.

    Returns:
        Lista de años como enteros.
    """
    while True:
        entrada = input("Ingrese años separados por comas (ej. 2000,2023,2024): ")
        try:
            anios = [int(valor.strip()) for valor in entrada.split(",")]
            return anios
        except ValueError:
            print("Entrada inválida: use solo números separados por comas. Intente de nuevo.")


def main() -> None:
    """Punto de entrada del script."""
    anios = leer_anios()
    bisiestos = [anio for anio in anios if es_bisiesto(anio)]

    print(f"\nAños ingresados: {anios}")
    print(f"Años bisiestos: {bisiestos}")
    print(f"Cantidad de años bisiestos: {len(bisiestos)} de {len(anios)}")

    if bisiestos:
        promedio = statistics.mean(bisiestos)
        print(f"Promedio de los años bisiestos: {promedio:.2f}")
    else:
        print("Ninguno de los años ingresados es bisiesto.")


if __name__ == "__main__":
    main()
```

Conceptos de sintaxis aplicados (para que el docente verifique el mínimo de tres exigido): tipos de datos (`int`, `bool`, `list`), control de flujo (`if`/`elif`/`else`, `while`), funciones con *docstring* y *type hints*, estructuras nativas (`list`), comprensión de listas, manejo de excepciones (`try`/`except`) e `import` (`statistics`) — el script cubre los seis, muy por encima del mínimo, así que sirve también como techo para quien va sobrado de tiempo.

Punto de control (minuto ~1:53): pedir que cada estudiante pruebe su script con al menos una entrada que incluya un año bisiesto (`2024`) y uno no bisiesto (`1900`), y que verbalice en voz alta qué línea de su código corresponde a cada uno de los tres conceptos mínimos que está reclamando haber usado.

## Puntos de control

| Minuto | Qué revisar en pantalla | Señal de que va bien |
|---|---|---|
| ~0:38 | Prompt de la terminal y `which python` / `where python` | Prefijo `(venv)` visible; el intérprete apunta dentro de `semana-02/venv/` |
| ~1:00 | `pip list` tras borrar y recrear `venv/` desde `requirements.txt` | Mismas librerías y versiones que antes de borrar |
| ~1:28 | Script refactorizado del Paso 3 | `snake_case`, *type hints*, *docstring*, bloque `if __name__ == "__main__":` |
| ~1:53 | Ejecución del ejercicio integrador con `2024` y `1900` | Reporta correctamente cuál es bisiesto y cuál no; el estudiante identifica en su código al menos tres conceptos de sintaxis distintos |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| `pip install matplotlib` corre sin error, pero al ejecutar el script aparece `ModuleNotFoundError: No module named 'matplotlib'` | El entorno virtual no estaba activado cuando se instaló, o se instaló en una terminal y se ejecuta el script en otra sin activar el `venv` ahí | Pedir que verifique el prefijo `(venv)` en la terminal actual antes de instalar o ejecutar cualquier cosa; reactivar y reinstalar si es necesario |
| El prompt nunca muestra `(venv)` después de correr el comando de activación | Ejecutó el script de activación equivocado para su sistema operativo, o está en la carpeta equivocada | Confirmar el sistema operativo y usar el comando exacto (`source venv/bin/activate` en macOS/Linux, `venv\Scripts\Activate.ps1` en PowerShell); verificar que está parado en `semana-02/`, no en una carpeta padre |
| `requirements.txt` tiene decenas de paquetes que el estudiante no reconoce haber instalado | `pip freeze` se ejecutó fuera del `venv` (contra el Python global, que ya tenía librerías de otros proyectos) | Desactivar todo, reactivar el `venv` correcto, verificar con `pip list` que está casi vacío, y recién ahí instalar `matplotlib` y correr `pip freeze` de nuevo |
| El linter o el docente marcan error en nombres como `CalcularPromedio` | Usó `CamelCase` para una función en vez de `snake_case` | Recordar la convención: `CamelCase` es para clases, `snake_case` para funciones y variables |
| El ejercicio integrador falla con `TypeError` al intentar comparar o sumar el año | Olvidó convertir la entrada de `input()` con `int()` — `input()` siempre retorna `str` | Pedir que imprima `type(anio)` justo después de leerlo, para que vea que es `str` antes de la conversión |
| `leer_anios()` entra en un bucle infinito imprimiendo el mensaje de error sin detenerse nunca aunque la entrada parezca correcta | Dejó espacios o un separador distinto a la coma, o hay una coma final sin número después (`"2020,2024,"`) | Pedir que imprima la lista de fragmentos (`entrada.split(",")`) antes de convertirla, para ver exactamente qué está intentando convertir a `int` |

## Preguntas socráticas

- *"¿Qué diferencia hay entre instalar una librería con `pip` dentro del `venv` activado y fuera de él?"* — Respuesta esperada: dentro del `venv`, la librería queda aislada a este proyecto; fuera, queda instalada globalmente y puede chocar con las versiones que necesitan otros proyectos, además de requerir permisos de administrador en algunos sistemas.
- *"Si borran la carpeta `venv/`, ¿pierden su código?"* — Respuesta esperada: no, solo pierden el entorno instalado. El código y el `requirements.txt` siguen intactos, y el entorno se puede recrear exactamente con `pip install -r requirements.txt`.
- *"¿Por qué `requirements.txt` se versiona en Git pero `venv/` no?"* — Respuesta esperada: `requirements.txt` es un archivo de texto pequeño y reproducible en cualquier máquina; `venv/` es una carpeta pesada, específica del sistema operativo y de la ruta local de cada quien, y no tiene sentido compartirla.
- *"¿Qué gana su código al agregarle *type hints*, si Python no los verifica al ejecutar el programa?"* — Respuesta esperada: documentan la intención del programador, ayudan al editor a detectar errores antes de ejecutar el código, y facilitan que otra persona —o el docente al revisar un informe— entienda qué recibe y qué devuelve una función sin leer todo su cuerpo.

## Diferenciación

- **Quien termina antes de tiempo (por ejemplo, termina el Paso 4 en 15 minutos):** pedirle que extienda el clasificador para que, además de identificar años bisiestos, agrupe los años ingresados por década usando un diccionario (`{década: [años]}`) construido con comprensión, y que valide con `try`/`except` que ningún año ingresado sea negativo, lanzando un mensaje de error propio en ese caso.
- **Quien no logra avanzar (por ejemplo, se traba en la activación del `venv` o en la instalación de `matplotlib`):** andamiaje mínimo aceptable para cerrar la sesión con un entorno funcional: dictarle los comandos exactos del Paso 1 y el Paso 2 uno por uno, y aceptar que el ejercicio integrador del Paso 4 quede reducido a la función `es_bisiesto` con `if`/`elif`/`else` y un `main` que pruebe un solo año fijo (sin `leer_anios()` ni manejo de excepciones). Como tarea antes de la Semana 3: completar `leer_anios()` con `try`/`except` y la comprensión de listas por su cuenta.

## Cierre de la sesión

Se conecta directamente con la Semana 3 (insertion sort): el mismo `venv` y el mismo `requirements.txt` de hoy son los que el estudiante reutilizará para implementar y medir sus primeros algoritmos — no se vuelve a crear un entorno desde cero cada semana. Recordar al grupo que todo lo de hoy debe quedar dentro de `ejercicios-clase/semana-02/` de su repositorio, con `venv/` en el `.gitignore`. Como trabajo independiente: quien no haya terminado el ejercicio integrador del Paso 4 debe completarlo y hacer `push` antes del inicio de la Semana 3.

## Materiales y preparación previa

- Verificar que Python 3.x está instalado y accesible desde la terminal en el entorno de cada estudiante (`python3 --version`) antes de iniciar la sesión; si el curso es virtual, enviar instrucciones de instalación con antelación.
- Tener preparado, en la propia máquina del docente, un `venv` ya creado y un `requirements.txt` ya generado para proyectar el flujo completo antes de que el grupo lo replique.
- Verificar que el repositorio de cada estudiante (Laboratorio 01, Semana 1) sigue accesible y que la carpeta `ejercicios-clase/` existe.
- Tener listo el script mal escrito del Paso 3 (PEP 8) para proyectarlo tal cual, sin refactorizar de antemano frente al grupo.
- Tener a la mano el enunciado exacto del ejercicio integrador (Paso 4) para proyectarlo o compartirlo por escrito.
- Confirmar que la sesión T de la misma semana ("Sintaxis básica de Python" y "Buenas prácticas y entornos de trabajo en Python") ya cubrió control de flujo, funciones, estructuras nativas, comprensión de listas, excepciones/`import`, PEP 8 y entornos virtuales antes de esta sesión práctica; si quedó incompleta, reforzar brevemente esos conceptos al inicio del Bloque 4 o el Bloque 5.
