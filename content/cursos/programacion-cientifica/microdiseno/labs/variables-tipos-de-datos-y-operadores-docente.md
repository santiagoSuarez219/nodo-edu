# Sesión 02 — Variables, tipos de datos y operadores · Guía del docente

## Ficha de la sesión

| Campo | Valor |
|---|---|
| Curso | Programación Científica |
| Semana | 2 — Jueves 13 de agosto de 2026 |
| Modalidad | Presencial, 100% en Google Colab (nada se instala) |
| Duración | 2 h (sesión única semanal) |
| Momento evaluativo | Seguimiento continuo (◇, no es un momento evaluativo ★) |
| Lección teórica de la que depende | `variables-tipos-de-datos-y-operadores.mdx` |
| Sprint del proyecto | Ninguno todavía. El proyecto integrador arranca en la Semana 12; hoy se trabaja sobre datasets de juguete provistos por el docente (lista de precios, lista de temperaturas) |
| Revisión en clase | Repaso rápido (5 min) del Flujo A visto en la Semana 1 — no se reenseña, solo se confirma que todos lo recuerdan antes de pedirles que lo repitan al cierre |

## Objetivo de la sesión

Al terminar la clase, el estudiante debe poder:

- Declarar variables en Python con nombres significativos y asignarles valores de los cuatro tipos básicos (`int`, `float`, `str`, `bool`).
- Explicar con sus palabras qué es el tipado dinámico en Python (la variable no se declara con un tipo fijo; el tipo lo determina el valor asignado).
- Usar `type()` para verificar el tipo de una variable o de un resultado.
- Aplicar operadores aritméticos (`+`, `-`, `*`, `/`, `//`, `%`, `**`), de comparación (`==`, `!=`, `<`, `>`, `<=`, `>=`) y lógicos (`and`, `or`, `not`) sobre datos de un dataset de juguete.
- Subir su notebook a `ejercicios/` con el **Flujo A** (`Archivo → Guardar una copia en GitHub`), sin ayuda.

> Esta sesión **no** introduce `if`/`elif`/`else` ni ningún condicional. Los
> ejercicios de comparación y lógicos piden evaluar y mostrar un resultado
> booleano (`print(precio > 10000)`), no decidir una acción según ese
> resultado. Los condicionales son el tema exclusivo de la Semana 3
> ("Condicionales y bucles") — si el grupo pregunta "¿y cómo hago que solo
> imprima si es caro?", la respuesta es "eso lo vemos la próxima semana",
> no una improvisación con `if`.

## Conexión con la teoría

La lección teórica (`variables-tipos-de-datos-y-operadores.mdx`) cubre, en
orden: repaso de Colab, variables y tipado dinámico, los cuatro tipos
básicos, y los tres grupos de operadores. Esta sesión combina la
presentación de esas secciones con la práctica —no hay bloque de "solo
teoría" seguido de "solo práctica": cada concepto se demuestra en vivo sobre
el dataset de precios y luego el grupo lo repite de inmediato.

Pregunta de apertura recomendada, apenas empieza la sesión: *"La semana
pasada guardaron su primer notebook en GitHub. ¿Alguien recuerda, sin mirar
sus notas, cuál era el botón exacto que usaron?"* — sirve como diagnóstico
rápido de quién retuvo el Flujo A y quién necesita que se lo recuerden antes
de pedírselo de nuevo al cierre.

## Minutado

| Tiempo | Bloque | Qué hace el docente | Qué hace el estudiante |
|---|---|---|---|
| 0–10 min | Apertura y repaso de la Semana 1 | Lanza la pregunta de apertura sobre el Flujo A; resuelve dudas puntuales que hayan quedado de la sesión anterior (repositorio, PAT, Colab Secret) | Responde la pregunta de apertura; plantea dudas pendientes de la Semana 1 |
| 10–35 min | Demo guiada: variables y tipos sobre el dataset de precios | Proyecta Colab y resuelve en vivo el Paso 1 (asignación de variables sobre la lista de precios de la tienda), usando `type()` en cada una | Replica cada celda en su propio notebook, línea por línea, sin adelantarse |
| 35–40 min | Punto de control 1 | Recorre el salón revisando pantallas | Debe tener 4-5 variables asignadas con los tipos correctos y al menos dos `type()` ejecutados |
| 40–70 min | Ejercicios del estudiante — dataset de precios | Presenta el enunciado de la Parte 1 de la guía del estudiante; circula resolviendo dudas | Resuelve individualmente o en pareja los ejercicios de operadores aritméticos, de comparación y lógicos sobre precios |
| 70–75 min | Punto de control 2 | Revisa avances; identifica quién ya terminó y quién sigue trabado | Reporta su avance si el docente pregunta |
| 75–100 min | Ejercicios del estudiante — dataset de temperaturas | Presenta el enunciado de la Parte 2; aplica diferenciación (ver más abajo) según el punto de control anterior | Resuelve los ejercicios sobre temperaturas; quien termina antes pasa al reto de extensión |
| 100–110 min | Reto de extensión opcional | Ofrece el reto de extensión a quien ya terminó ambas partes | Estudiantes avanzados combinan ambos datasets, usan `round()` y exploran `type()` sobre resultados mixtos `int`/`float` |
| 110–120 min | Cierre y subida con Flujo A | Recuerda el nombre exacto del archivo y la carpeta destino (`ejercicios/`); resuelve dudas de último minuto sobre el botón de GitHub | Sube su notebook a `ejercicios/` con `Archivo → Guardar una copia en GitHub` y confirma en GitHub que quedó visible |

Suma: 120 minutos.

## Desarrollo paso a paso

### Paso 1 — Demo guiada: variables sobre el dataset de precios (proyectada)

Dataset de partida (proyectarlo como celda de texto antes de la de código):

```text
## Dataset: precios de una tienda pequeña
Productos y sus precios en pesos colombianos:
- Cuaderno: 3500
- Lápiz: 800
- Café: 6200.50
```

Celda de código, resuelta en vivo, comentando cada línea:

```python
# Asignación de variables con nombres significativos
nombre_producto = "Cuaderno"      # str
precio_cuaderno = 3500            # int
precio_cafe = 6200.50             # float
hay_descuento = False             # bool

# Tipado dinámico: el tipo lo define el valor, no una declaración previa
print(type(nombre_producto))   # <class 'str'>
print(type(precio_cuaderno))   # <class 'int'>
print(type(precio_cafe))       # <class 'float'>
print(type(hay_descuento))     # <class 'bool'>
```

Punto a resaltar en voz alta: en Python no se escribe `int precio = 3500`
como en otros lenguajes — la misma variable podría reasignarse luego a un
`str` sin error. Demostrarlo:

```python
precio_cuaderno = "tres mil quinientos"
print(type(precio_cuaderno))   # <class 'str'> — cambió de tipo sin previo aviso
precio_cuaderno = 3500          # se vuelve a dejar como número para seguir el ejemplo
```

### Paso 2 — Ejercicios del estudiante: dataset de precios (solución de referencia)

Enunciado que reciben (ver guía del estudiante, Parte 1): dado el dataset de
precios de la tienda (cuaderno, lápiz, café), calcular el total de una
compra, comparar precios entre productos y evaluar condiciones lógicas sobre
el conjunto.

```python
# --- Datos de partida ---
precio_cuaderno = 3500
precio_lapiz = 800
precio_cafe = 6200.50
cantidad_cuadernos = 3
cantidad_lapices = 5

# --- Operadores aritméticos ---
total_cuadernos = precio_cuaderno * cantidad_cuadernos
total_lapices = precio_lapiz * cantidad_lapices
total_compra = total_cuadernos + total_lapices + precio_cafe
print("Total de la compra:", total_compra)

descuento = total_compra * 0.10        # 10% de descuento
total_con_descuento = total_compra - descuento
print("Total con descuento:", total_con_descuento)

# División entera y módulo: repartir cuadernos en paquetes de 4
paquetes_completos = cantidad_cuadernos // 4
cuadernos_sueltos = cantidad_cuadernos % 4
print("Paquetes completos:", paquetes_completos, "- Sueltos:", cuadernos_sueltos)

# Potencia: precio elevado al cuadrado (ejercicio artificial, solo para practicar **)
print("Precio del café al cuadrado:", precio_cafe ** 2)

# --- Operadores de comparación ---
print("¿El café es más caro que el cuaderno?", precio_cafe > precio_cuaderno)
print("¿El cuaderno cuesta lo mismo que el lápiz?", precio_cuaderno == precio_lapiz)
print("¿La compra total es mayor o igual a 20000?", total_compra >= 20000)

# --- Operadores lógicos ---
hay_presupuesto = total_compra <= 50000
hay_stock = True
print("¿Se puede completar la compra?", hay_presupuesto and hay_stock)
print("¿Aplica alguna promoción?", (precio_cafe > 5000) or (cantidad_cuadernos >= 3))
print("¿NO hay descuento aplicado todavía?", not (descuento > 0))
```

Resultados esperados clave (para verificar de un vistazo en pantalla): total
de compra sin descuento = `21200.5`; con descuento = `19080.45`; paquetes
completos = `0`, sueltos = `3` (porque `3 // 4 == 0` y `3 % 4 == 3`).

### Paso 3 — Ejercicios del estudiante: dataset de temperaturas (solución de referencia)

Enunciado (ver guía del estudiante, Parte 2): dado un pequeño registro de
temperaturas diarias, calcular estadísticas simples con operadores
aritméticos y evaluar comparaciones y condiciones lógicas.

```python
# --- Datos de partida ---
temp_lunes = 18.5
temp_martes = 21.0
temp_miercoles = 19.8
temp_promedio_semana = 20.0     # dato de referencia provisto por el docente

# --- Operadores aritméticos ---
suma_tres_dias = temp_lunes + temp_martes + temp_miercoles
promedio_tres_dias = suma_tres_dias / 3
print("Promedio de los tres días:", promedio_tres_dias)

diferencia_martes_lunes = temp_martes - temp_lunes
print("Diferencia entre martes y lunes:", diferencia_martes_lunes)

# --- Operadores de comparación ---
print("¿El martes fue más caluroso que el promedio de la semana?", temp_martes > temp_promedio_semana)
print("¿El miércoles fue igual al promedio de la semana?", temp_miercoles == temp_promedio_semana)
print("¿El lunes fue el día más frío de los tres?", temp_lunes < temp_martes and temp_lunes < temp_miercoles)

# --- Operadores lógicos ---
dia_templado = (temp_lunes >= 15) and (temp_lunes <= 25)
print("¿El lunes tuvo una temperatura templada (entre 15 y 25)?", dia_templado)
print("¿Al menos un día superó los 20 grados?", (temp_lunes > 20) or (temp_martes > 20) or (temp_miercoles > 20))
```

### Paso 4 — Reto de extensión (solución de referencia, solo para quien termina antes)

```python
# Combinar ambos datasets: costo estimado de "premiar" cada grado sobre el promedio
grados_sobre_promedio = temp_martes - temp_promedio_semana   # float
costo_por_grado = precio_lapiz                                 # int, reutilizado del otro dataset
premio_estimado = grados_sobre_promedio * costo_por_grado       # mezcla float * int -> float
print("Premio estimado:", round(premio_estimado, 2))
print(type(grados_sobre_promedio), type(costo_por_grado), type(premio_estimado))

# Precedencia de operadores: ¿qué imprime esto antes de ejecutarlo?
resultado = 2 + 3 * 4 ** 2 - 1
print(resultado)   # 49 -> potencia primero (16), luego *, luego +/- de izquierda a derecha
```

Punto a resaltar: `round(premio_estimado, 2)` redondea a 2 decimales; sin
`round()`, el resultado de mezclar `float` y `int` puede mostrar más
decimales de los esperados. `type()` sobre `grados_sobre_promedio` confirma
que restar dos `float` sigue dando `float`, y sobre `premio_estimado`
confirma que `float * int` da `float` — la aritmética mixta "sube" siempre
al tipo más amplio.

### Paso 5 — Cierre: subir con Flujo A

Recordatorio proyectado (no se hace en vivo, solo se enuncia — cada
estudiante lo hace en su propio notebook):

1. `Archivo → Guardar una copia en GitHub`.
2. Repositorio: `curso-programacion-cientifica`.
3. Ruta: `ejercicios/sesion-02-variables-tipos-operadores.ipynb`.
4. Mensaje: `Ejercicios de variables, tipos y operadores`.
5. Confirmar y verificar en GitHub que el archivo aparece listado.

## Puntos de control

| Cuándo | Qué revisar en pantalla del estudiante | Señal de que va bien |
|---|---|---|
| Minuto ~35 | Notebook tras la demo guiada | Tiene las 4-5 variables del Paso 1 asignadas y al menos dos `type()` ejecutados con salida visible |
| Minuto ~70 | Avance en ejercicios de precios | Al menos las operaciones aritméticas del total de la compra están resueltas; comparaciones y lógicos en curso |
| Minuto ~100 | Avance en ejercicios de temperaturas | Las tres categorías de operadores (aritméticos, comparación, lógicos) tienen al menos un ejemplo resuelto y ejecutado sin error |
| Minuto ~115 | Notebook completo, antes de subir | Todas las celdas ejecutadas de arriba a abajo sin error (`Entorno de ejecución → Ejecutar todas`); hay celdas de texto explicando cada bloque |
| Minuto ~120 | Repositorio en GitHub tras el push | `ejercicios/sesion-02-variables-tipos-operadores.ipynb` (o el nombre que se haya acordado) aparece listado |

## Errores frecuentes y cómo intervenir

| Síntoma observable | Causa probable | Intervención sugerida |
|---|---|---|
| `print(precio_cuaderno + precio_lapiz)` imprime `3500800` en vez de `4300` | Los valores se asignaron como texto (`"3500"` en vez de `3500`), y `+` concatena strings en vez de sumar | Pedir que ejecuten `type(precio_cuaderno)`; si dice `<class 'str'>`, corregir la asignación quitando las comillas |
| `TypeError: can only concatenate str (not "int") to str` al construir un mensaje con `print` | Intentó unir un `str` y un `int` con `+` directamente, ej. `"Total: " + total_compra` | Mostrar `print("Total:", total_compra)` (con coma) o convertir con `str(total_compra)` |
| `precio_cuaderno // 4` da un resultado con decimales inesperados | Usó `/` en vez de `//` pensando que ambas son "división" | Contrastar `7 / 2` (`3.5`) contra `7 // 2` (`3`) en una celda aparte, en vivo |
| El resultado de una comparación no se ve (la celda no imprime nada) | Escribió la expresión (`precio_cafe > precio_cuaderno`) sin `print()` alrededor, o la dejó en una línea que no es la última de la celda | Recordar que solo la última línea de una celda se muestra sola; todo lo demás necesita `print()` explícito |
| `and`/`or` producen `True`/`False` que no coinciden con lo esperado | Confundió `and` con `or` (ej. esperaba que bastara con una condición pero usó `and`) | Pedir que evalúen cada condición por separado con `print()` antes de combinarlas |
| El notebook tiene celdas de código sin ninguna celda de texto | Se saltó el requisito de documentar cada bloque, por apuro | Señalar el criterio de la rúbrica correspondiente antes de que seleccione entregar |
| Al subir con Flujo A, Colab no muestra `curso-programacion-cientifica` en la lista de repositorios | No completó la autorización de GitHub en la Semana 1, o la sesión de Colab expiró | Repetir `Archivo → Guardar una copia en GitHub` y aceptar la autorización de nuevo; si persiste, verificar que el repositorio sigue existiendo en su cuenta |
| Al ejecutar `Ejecutar todas`, alguna celda de en medio falla | Ejecutó las celdas fuera de orden mientras experimentaba, dejando variables reasignadas de forma inconsistente | Reiniciar el entorno de ejecución (`Entorno de ejecución → Reiniciar entorno de ejecución`) y ejecutar todo de nuevo, de arriba a abajo |

## Preguntas socráticas

- *"Si le asigno primero un número a una variable y después un texto, ¿Python
  se queja?"* — Respuesta esperada: no, porque el tipado es dinámico; la
  variable simplemente pasa a apuntar al nuevo valor y su tipo cambia con él.
- *"¿Por qué `7 / 2` y `7 // 2` no dan el mismo resultado?"* — Respuesta
  esperada: `/` siempre da un `float` con la división exacta (`3.5`); `//`
  descarta la parte decimal y da la división entera (`3`).
- *"¿Qué diferencia hay entre `precio == 3500` y `precio = 3500`?"* —
  Respuesta esperada: `=` asigna un valor a la variable; `==` compara dos
  valores y devuelve `True` o `False`, sin modificar nada.
- *"Si tengo `hay_stock and hay_presupuesto`, ¿en qué caso da `True`?"* —
  Respuesta esperada: solo cuando ambas condiciones son `True` a la vez; si
  cualquiera es `False`, el resultado combinado es `False`.
- *"¿Por qué en el reto de extensión `2 + 3 * 4 ** 2 - 1` no da `39`?"* —
  Respuesta esperada: la potencia se evalúa antes que la multiplicación, y
  esta antes que la suma/resta, igual que en las reglas de precedencia de la
  aritmética normal.

## Diferenciación

**Estudiantes de primer semestre que no arrancan (andamiaje mínimo aceptable):**
- Entregarles una plantilla con las variables del dataset de precios **ya
  nombradas y parcialmente asignadas** (ej. `precio_cuaderno = ___`), para
  que completen valores en vez de partir de una celda en blanco.
- Aceptar como avance mínimo válido: las cuatro variables del dataset
  asignadas con el tipo correcto y un solo operador de cada categoría
  (aritmético, comparación, lógico) ejecutado con éxito — no exigir el
  ejercicio completo de temperaturas si el tiempo no alcanza.
- Emparejarlos con un estudiante avanzado desde el bloque de ejercicios de
  precios (minuto ~40), no esperar al bloque de temperaturas.
- Si el bloqueo es conceptual sobre tipado dinámico, usar la analogía de una
  caja con etiqueta: la caja (la variable) es la misma, pero lo que hay
  adentro (el valor y su tipo) puede cambiar.

**Estudiantes de semestres avanzados que terminan antes:**
- Ofrecerles el reto de extensión del Paso 4 (mezclar datasets, `round()`,
  `type()` sobre resultados mixtos, precedencia de operadores) apenas
  terminen la Parte 2, sin esperar al bloque 100–110 min si van más rápido.
- Pedirles que, en una celda de texto, expliquen con sus palabras por qué
  `float * int` da `float` — sirve como verificación de comprensión, no solo
  de ejecución correcta.
- Sugerirles investigar (sin explicarlo formalmente en clase) qué hace el
  operador `%` con números negativos, como curiosidad opcional.

## Cierre de la sesión

- Confirmar que cada estudiante subió su notebook a `ejercicios/` con Flujo
  A — es la evidencia de seguimiento de hoy.
- Recordar que la Semana 3 introduce condicionales (`if`/`elif`/`else`) y
  bucles (`for`/`while`), que se apoyan directamente en los operadores de
  comparación y lógicos practicados hoy.
- Anunciar que el Momento evaluativo 1 (Semana 4) combina variables,
  condicionales y bucles sobre un dataset nuevo — lo visto hoy es parte de
  esa base, sin ser en sí mismo evaluado con nota.

## Ejercicios de práctica (sección añadida a la guía del estudiante)

La guía del estudiante ahora cierra con una sección "Ejercicios de práctica"
de diez ejercicios cortos y escalonados, en un notebook **separado** del de
las Partes 1 y 2 (`sesion-02-ejercicios-practica.ipynb`, mismo Flujo A,
misma carpeta `ejercicios/`). Ninguno usa `if`, bucles ni `input()` — mismo
alcance que el resto de la sesión.

**Cuándo se resuelve:** es refuerzo, no parte del cuerpo principal del
minutado de 120 minutos. Ofrézcala como contenido del bloque de "Reto de
extensión opcional" (100–110 min, ver Minutado) a quien ya terminó las
Partes 1 y 2: puede empezarla en clase si le sobra tiempo, en vez de (o
además de) el reto de extensión de la guía del estudiante. El grueso del
grupo la termina de forma **independiente, antes de la sesión de la Semana
3** — mismo plazo que el resto del laboratorio. No dedique tiempo de aula
a explicarla en el minutado: el enunciado de cada ejercicio se basta solo.

**Cómo pondera dentro del Seguimiento (◇):** el Seguimiento de esta semana
es acumulado (no tiene corte de nota único aquí, según el microdiseño).
Al revisar los notebooks entregados, mire:
- ¿Resolvió al menos 8 de los 10 ejercicios? Menos de eso es señal de que
  necesita revisar operadores antes de la Semana 3 (condicionales y bucles
  se apoyan directamente en comparación y lógicos).
- ¿El notebook ejecuta de principio a fin sin error?
- ¿Cada resultado se muestra con `print()`?
- ¿Subió el archivo con el nombre sugerido, en `ejercicios/`?

No hace falta ponderar ejercicio por ejercicio ni asignar una nota numérica
distinta a esta sección — regístrela como un ítem más de cumplimiento del
Seguimiento semanal, igual que la subida del notebook de las Partes 1 y 2.

### Soluciones de referencia — Ejercicios 1 a 10

```python
# --- Ejercicio 1 — Receta de cocina ---
gramos_por_porcion = 25.5
numero_de_porciones = 8
total_gramos_harina = gramos_por_porcion * numero_de_porciones
print("Total de harina necesaria (g):", total_gramos_harina)   # 204.0
```

```python
# --- Ejercicio 2 — Factura de servicios ---
consumo_kwh = 142
tarifa_kwh = 623.5
total_a_pagar = consumo_kwh * tarifa_kwh
print("Total a pagar:", total_a_pagar)   # 88537.0
```

```python
# --- Ejercicio 3 — Tiempo de un viaje ---
distancia_km = 350.0
velocidad_promedio = 80
tiempo_horas = distancia_km / velocidad_promedio
print("Tiempo estimado (horas):", tiempo_horas)   # 4.375
print(type(tiempo_horas))   # <class 'float'>
```

```python
# --- Ejercicio 4 — Comparar precios de café ---
precio_marca_a = 15900
precio_marca_b = 14500
print("¿La marca A es más barata que la B?", precio_marca_a < precio_marca_b)   # False
print("¿Cuestan lo mismo?", precio_marca_a == precio_marca_b)   # False
```

```python
# --- Ejercicio 5 — Promedio de calificaciones ---
nota_1 = 4.2
nota_2 = 3.5
nota_3 = 4.8
promedio = (nota_1 + nota_2 + nota_3) / 3
print("Promedio:", promedio)   # 4.166666666666667
print("¿Aprobó (promedio >= 3.0)?", promedio >= 3.0)   # True
```

```python
# --- Ejercicio 6 — Consumo dentro del rango normal ---
# Reutiliza consumo_kwh = 142 del Ejercicio 2
consumo_minimo_normal = consumo_kwh >= 100
consumo_maximo_normal = consumo_kwh <= 200
print("¿Consumo dentro del rango normal (100-200 kWh)?", consumo_minimo_normal and consumo_maximo_normal)   # True
```

```python
# --- Ejercicio 7 — Tramos de un viaje ---
tramo_1 = 120.0
tramo_2 = 180.0
tramo_3 = 95.0
print("¿Algún tramo superó los 150 km?", (tramo_1 > 150) or (tramo_2 > 150) or (tramo_3 > 150))   # True
```

```python
# --- Ejercicio 8 — Aprobación y asistencia ---
# Reutiliza promedio del Ejercicio 5
asistencia_porcentaje = 85
reprobo = promedio < 3.0
print("¿NO reprobó?", not reprobo)   # True
```

```python
# --- Ejercicio 9 — Descuento y promoción en la factura ---
# Reutiliza consumo_kwh = 142 y tarifa_kwh = 623.5 del Ejercicio 2
pago_anticipado = True
total_factura = consumo_kwh * tarifa_kwh
total_con_descuento = total_factura - (total_factura * 0.05)
print("Total con descuento:", total_con_descuento)   # 84110.15
print("¿Aplica promoción?", (consumo_kwh < 100) or pago_anticipado)   # True
```

```python
# --- Ejercicio 10 — Intercambiar dos precios (inspirado en la idea de intercambio de variables) ---
precio_tornillo = 250
precio_tuerca = 180
print("Antes: tornillo =", precio_tornillo, "- tuerca =", precio_tuerca)

temporal = precio_tornillo
precio_tornillo = precio_tuerca
precio_tuerca = temporal

print("Después: tornillo =", precio_tornillo, "- tuerca =", precio_tuerca)
# tornillo = 180, tuerca = 250
```

Resultados clave para verificar de un vistazo: Ejercicio 1 → `204.0`;
Ejercicio 2 → `88537.0`; Ejercicio 3 → `4.375` (`float`); Ejercicio 5 →
promedio `≈ 4.1667`; Ejercicio 9 → total con descuento `84110.15`;
Ejercicio 10 → los valores quedan invertidos (`180` / `250`).

## Materiales y preparación previa

Antes del jueves 13 de agosto, el docente debe tener listo:

- El dataset de precios de la tienda (cuaderno, lápiz, café) y el de
  temperaturas diarias, redactados exactamente como aparecen en esta guía y
  en la guía del estudiante, para que los valores y resultados esperados
  coincidan entre docente y estudiantes.
- Un notebook propio ya preparado con el Paso 1 (demo guiada), para
  proyectar sin tener que improvisar nombres de variables en vivo.
- Verificar que el repositorio `curso-programacion-cientifica` de al menos
  un estudiante de prueba sigue accesible desde Colab (confirma que la
  autorización de la Semana 1 no expiró en el entorno de pruebas).
- Tener a mano la lista de quién quedó con el flujo de GitHub pendiente al
  cierre de la Semana 1, para priorizarlos en el repaso de apertura.
