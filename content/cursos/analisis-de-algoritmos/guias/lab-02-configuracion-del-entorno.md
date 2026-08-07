---
title: "Laboratorio 02 — Configuración del entorno de trabajo"
updatedAt: "2026-08-07"
---

# Laboratorio 02 — Configuración del entorno de trabajo

## Objetivo

Configure el entorno de trabajo en Python que usará durante **todo el semestre**: un entorno virtual aislado, un archivo de dependencias reproducible, y las convenciones de estilo (PEP 8) que se esperan en cada uno de sus cinco informes de laboratorio evaluativos. Cierre la sesión con un script pequeño que aplique la sintaxis vista en la lección teórica de esta semana.

Competencias esperadas:
- Crear, activar y desactivar un entorno virtual con `venv`, y explicar por qué aislar las dependencias de un proyecto.
- Generar un `requirements.txt` reproducible con `pip freeze` e instalar dependencias con `pip install -r`.
- Aplicar las convenciones básicas de PEP 8 (nombres, espaciado, estructura con `if __name__ == "__main__":`) y *type hints* simples.
- Escribir un script con al menos una función documentada con *docstring*, nombres claros y un punto de entrada `main`, aplicando al menos tres conceptos de sintaxis de Python.

## Requisitos Previos

Antes de comenzar, debe dominar los conceptos de la lección "Introducción a Python" (Sesión 1, Semana 2):
- Tipos de datos básicos: `int`, `float`, `str`, `bool`, `None`.
- Estructuras de control: `if` / `elif` / `else`, `for`, `while`.
- Funciones: definición, parámetros, valores de retorno, *docstrings*.
- Estructuras de datos nativas: listas, tuplas, diccionarios, conjuntos.
- Comprensión de listas.
- Manejo básico de excepciones (`try` / `except`) y de módulos (`import`).

También necesita, de la lección "Fundamentos de control de versiones y flujo de trabajo" (Semana 1) y del "Laboratorio 01 — Repositorio del curso":
- Su repositorio del curso ya creado, vinculado a GitHub, con la carpeta `ejercicios-clase/` en su raíz.
- El hábito de hacer commits descriptivos y frecuentes.

También necesita tener Python 3.x instalado en su equipo (`python3 --version` debe responder sin error).

## Desarrollo del Laboratorio

### Parte 1 — Entorno virtual con `venv`

Dentro de su repositorio del curso, cree la carpeta de esta sesión y un entorno virtual dentro de ella.

**Requisitos:**
- Cree la carpeta `ejercicios-clase/semana-02/` dentro de su repositorio.
- Dentro de esa carpeta, cree un entorno virtual con `python3 -m venv venv`.
- Actívelo y verifique que su terminal muestra el prefijo `(venv)`.
- Agregue `venv/` al `.gitignore` de su repositorio (esta carpeta **no** se versiona).
- Verifique con `pip list` que el entorno recién creado está prácticamente vacío antes de instalar nada.

**Restricciones:**
- No instale ninguna librería antes de confirmar que el entorno está activado.
- No suba la carpeta `venv/` a GitHub bajo ninguna circunstancia.

### Parte 2 — `requirements.txt` reproducible

Con el entorno activado, instale la librería que usará para graficar durante el resto del curso y deje un registro exacto de las dependencias instaladas.

**Requisitos:**
- Instale `matplotlib` dentro del entorno virtual activado.
- Genere el archivo `requirements.txt` con `pip freeze > requirements.txt`.
- Verifique la reproducibilidad de su entorno: desactive, borre la carpeta `venv/`, créela de nuevo y reinstale todo con `pip install -r requirements.txt`. Confirme con `pip list` que obtiene exactamente las mismas librerías que antes de borrar la carpeta.

**Restricciones:**
- No edite `requirements.txt` a mano; debe ser el resultado directo de `pip freeze`.
- No incluya librerías que no haya instalado usted mismo dentro de este entorno (si `requirements.txt` le queda con paquetes que no reconoce, probablemente instaló algo fuera del `venv` — revise el prefijo `(venv)` antes de reintentar).

### Parte 3 — PEP 8 y *type hints*

El siguiente script funciona, pero no sigue las convenciones de estilo que se esperan en este curso. Refactorícelo aplicando PEP 8 y agregando *type hints*.

Script de partida (guárdelo tal cual antes de modificarlo, para tener el "antes"):

```python
def CalcularPromedio(Lista):
    s=0
    for x in Lista:
     s=s+x
    return s/len(Lista)

l=[1,2,3,4,5]
print(CalcularPromedio(l))
```

**Requisitos del script refactorizado:**
- Nombres de funciones y variables en `snake_case`, con significado claro (nada de nombres de una sola letra salvo contadores triviales).
- Espaciado consistente alrededor de operadores y después de comas.
- Indentación uniforme de 4 espacios.
- La función debe tener *type hints* en sus parámetros y su valor de retorno.
- La función debe tener un *docstring* que describa qué hace, qué recibe y qué retorna.
- La lógica principal debe quedar dentro de una función `main() -> None:`, protegida con `if __name__ == "__main__":`.

**Restricciones:**
- No cambie el comportamiento del script: debe seguir calculando el promedio de la misma lista de ejemplo.

### Parte 4 — Ejercicio integrador: clasificador de años bisiestos

Escriba un script que le pida al usuario una lista de años separados por comas, determine cuáles son bisiestos y muestre un resumen. Un año es bisiesto si es divisible por 4, excepto los años divisibles por 100 que no lo sean también por 400 (ejemplos: 2024 es bisiesto; 1900 no lo es; 2000 sí lo es).

Complete el siguiente esqueleto, respetando las firmas y los *docstrings* ya escritos:

```python
"""Clasificador de años bisiestos.

Complete las funciones siguiendo la especificación de cada docstring.
"""


def es_bisiesto(anio: int) -> bool:
    """Determina si un año es bisiesto.

    Un año es bisiesto si es divisible por 4, excepto los años
    divisibles por 100 que no lo sean también por 400.

    Args:
        anio: año a evaluar (número entero).

    Returns:
        True si el año es bisiesto, False en caso contrario.
    """
    # TODO: implemente la lógica usando if / elif / else.


def leer_anios() -> list[int]:
    """Solicita al usuario una lista de años separados por comas.

    Debe reintentar mientras la entrada no se pueda convertir a enteros
    (use try / except para capturar entradas inválidas).

    Returns:
        Lista de años como enteros.
    """
    # TODO: implemente la lectura y validación.


def main() -> None:
    """Punto de entrada del script."""
    # TODO: use leer_anios(), filtre los años bisiestos con una
    # comprensión de listas, e imprima un resumen que incluya al menos
    # la lista de años bisiestos y cuántos hay.


if __name__ == "__main__":
    main()
```

**Requisitos:**
- El script debe aplicar **al menos tres** de los siguientes conceptos de la sesión teórica de esta semana: tipos de datos básicos, control de flujo, funciones con *docstring*, estructuras de datos nativas, comprensión de listas, manejo de excepciones o `import`.
- Toda función debe tener *type hints* en sus parámetros y su valor de retorno.
- El script debe funcionar correctamente al menos con las entradas `2024` (bisiesto) y `1900` (no bisiesto).

**Restricciones:**
- No modifique las firmas de las funciones del esqueleto ni sus *docstrings*.
- No use variables globales para pasar datos entre funciones: use parámetros y valores de retorno.

## Entregable

Cree la carpeta `ejercicios-clase/semana-02/` en su repositorio del curso (el mismo del Laboratorio 01) con la siguiente estructura:

```
curso-analisis-algoritmos/
└── ejercicios-clase/
    └── semana-02/
        ├── requirements.txt
        ├── refactor_pep8.py
        ├── clasificador_anios.py
        └── README.md
```

- `requirements.txt`: generado con `pip freeze`, según la Parte 2.
- `refactor_pep8.py`: el script refactorizado de la Parte 3.
- `clasificador_anios.py`: el ejercicio integrador de la Parte 4.
- `README.md`: breve documento (5-10 líneas) que explique los comandos que usó para crear y activar el entorno virtual, y cómo otra persona reproduciría su entorno con `requirements.txt`.

Realice **al menos tres commits** descriptivos documentando el proceso (por ejemplo: entorno virtual y `requirements.txt`; refactor PEP 8; ejercicio integrador) y haga `push` a su repositorio antes del plazo indicado.

### Ejemplo de verificación

Al ejecutar su script desde la carpeta `semana-02/` con el entorno virtual activado:

```bash
python clasificador_anios.py
```

Entrada de prueba y salida esperada (el formato exacto de impresión puede variar, pero el contenido debe coincidir):

```text
Ingrese años separados por comas (ej. 2000,2023,2024): 2024,1900,2000,2023

Años ingresados: [2024, 1900, 2000, 2023]
Años bisiestos: [2024, 2000]
Cantidad de años bisiestos: 2 de 4
```

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 3 (17 de agosto de 2026).

## Criterios de Evaluación

Esta sesión **no es evaluativa** (no corresponde a ninguno de los cinco laboratorios de la evaluación del curso), pero se retroalimenta con los siguientes ejes y alimenta la nota de **Seguimiento**:

| Criterio | Puntos | Descripción |
|---|---|---|
| **Entorno virtual creado y documentado** | 15 | El `README.md` describe los comandos usados para crear y activar el entorno; queda evidencia de que se verificó el prefijo `(venv)` antes de instalar dependencias. |
| **`requirements.txt` correcto y reproducible** | 20 | El archivo existe, contiene `matplotlib` con versión fijada (formato `paquete==versión`), y al reinstalar con `pip install -r requirements.txt` en un entorno limpio se obtienen las mismas librerías. |
| **Script cumple PEP 8 y usa ≥3 conceptos de sintaxis** | 30 | Nombres en `snake_case`, espaciado consistente, indentación de 4 espacios; el script del ejercicio integrador aplica correctamente al menos tres de los conceptos de la sesión teórica. |
| **Documentación (*docstrings*, nombres claros)** | 20 | Toda función tiene *docstring* con descripción, parámetros y retorno; todas las funciones usan *type hints* en parámetros y valor de retorno. |
| **Commit y organización del repositorio** | 15 | El código vive en `ejercicios-clase/semana-02/` con la estructura pedida; existen al menos tres commits descriptivos que documentan el proceso, no concentrados en uno solo. |
| **TOTAL** | **100** | |

## Dificultades Comunes

### "`pip install matplotlib` funciona pero mi script da `ModuleNotFoundError`"
- Verifique el prefijo `(venv)` en la terminal desde la que ejecuta el script. Si no aparece, active el entorno de nuevo antes de correr el script.

### "Mi `requirements.txt` tiene decenas de paquetes que no reconozco"
- Es probable que haya ejecutado `pip freeze` fuera del entorno virtual, contra su instalación global de Python. Active el `venv` correcto, verifique con `pip list` que está casi vacío, y repita la instalación y el `freeze`.

### "Mi ejercicio integrador falla con `TypeError` al comparar el año"
- Recuerde que `input()` siempre retorna texto (`str`), incluso si el usuario escribió números. Debe convertir explícitamente cada valor con `int()` antes de operar con él.

### "`leer_anios()` entra en un bucle que no se detiene, aunque la entrada parezca válida"
- Revise que está separando la entrada exactamente por comas y que no queda una coma final sin número después (por ejemplo `"2020,2024,"`). Imprima el resultado de `entrada.split(",")` antes de convertirlo para ver qué está intentando procesar.

**Plazo de entrega:** antes del inicio de la sesión práctica de la Semana 3 (17 de agosto de 2026).

## Extensiones Sugeridas (Bonus)

- Agrupe los años ingresados por década usando un diccionario construido con comprensión (por ejemplo `{2020: [2024], 1900: [1900]}`).
- Valide con `try`/`except` que ningún año ingresado sea negativo, mostrando un mensaje de error propio en ese caso.
- Calcule y muestre el promedio de los años bisiestos usando el módulo `statistics`.

## Recursos

- **Apuntes del curso:** lección "Introducción a Python" (Semana 2, Sesión 1).
- **Guía de estilo oficial:** PEP 8 — Style Guide for Python Code (`https://peps.python.org/pep-0008/`).
- **Documentación oficial:** módulo `venv` de la biblioteca estándar de Python.
- **Editor de código recomendado:** Visual Studio Code, con la extensión oficial de Python.
