# Evaluación Resultados de Aprendizaje 2026-2 — Análisis de Algoritmos

> **Estado: APROBADO POR LA FACULTAD** (propuesta enviada a Gustavo Macías el
> 2026-10-24; la versión aprobada es `casos-analisis-de-algoritmos-aprobado.pdf`, en esta
> misma carpeta). Tres casos de estudio redactados por el docente, que
> reemplazan los dos casos de ejemplo remitidos por la Facultad. Este documento
> conserva la actividad "Implementar las estrategias diseñadas en Python" (4),
> que el PDF aprobado no numera aparte; el resto del texto es el aprobado. El instrumento
> vale el 20 % de la nota y se entrega en la semana de finales (23–29 nov).
> Cada equipo trabaja **un** caso, asignado por el docente. La rúbrica es la de
> la plantilla institucional `Rubrica RA Análisis de Algoritmos.xlsx`. No se ha
> socializado con los estudiantes ni se ha publicado en la plataforma.

---

## Objetivo

Como equipo de ingenieros de sistemas, deberán analizar un problema
computacional planteado por una organización, diseñar y comparar diferentes
estrategias algorítmicas para resolverlo, evaluar su eficiencia mediante el
análisis de complejidad y pruebas experimentales, y justificar la solución
seleccionada considerando criterios técnicos y el impacto de su implementación
en el contexto organizacional.

## Cómo está organizado este instrumento

- **Tres casos de estudio** con la misma estructura: un contexto
  organizacional, un proceso con **cuatro operaciones críticas**, la
  información que entrega el cliente y sus restricciones. Cada equipo recibe
  uno, asignado por el docente.
- **Actividades, supuestos, entregable y rúbrica comunes** a los tres casos,
  al final del documento.

---

## CASO DE ESTUDIO 1

## CONCILIACIÓN NOCTURNA DEL RECAUDO DEL SISTEMA INTEGRADO DE TRANSPORTE

### Contexto organizacional

El Sistema Integrado de Transporte del Valle Metropolitano (SITVM) opera el
metro, dos líneas de cable y las rutas de buses alimentadores de un área
metropolitana de cerca de 4.000.000 de habitantes. El pasaje se paga con una
tarjeta sin contacto que el usuario valida al entrar a una estación o al subir
a un bus.

Cada noche, mientras el sistema está cerrado, un proceso por lotes concilia
todas las validaciones del día: las depura, liquida lo que se le cobró a cada
tarjeta y entrega la información a tres áreas internas: Recaudo (liquidación a
los operadores y devoluciones a los usuarios), Atención al Usuario y
Planeación de la Operación.

La Gerencia de Tecnología necesita rediseñar ese proceso, que dejó de caber en
la ventana nocturna desde que entraron en operación las rutas alimentadoras y
la segunda línea de cable.

### Situación actual

El proceso nocturno ejecuta las siguientes operaciones:

1. **Deduplicación de validaciones.** Los validadores de los buses trabajan
   sin conexión y descargan sus registros al llegar al patio. Si la descarga se
   interrumpe, el validador reenvía el lote completo, y los registros ya
   recibidos llegan otra vez. El proceso actual compara cada validación con
   todas las validaciones ya aceptadas para decidir si es repetida.
2. **Ordenamiento por tarjeta y hora.** Para liquidar transbordos y aplicar el
   tope tarifario, las validaciones deben quedar ordenadas por número de
   tarjeta y, dentro de cada tarjeta, por fecha y hora. El proceso actual usa un
   ordenamiento por inserción implementado hace varios años.
3. **Detección de las franjas de congestión.** Planeación quiere saber, para
   cada estación, cuál es el **tramo de intervalos consecutivos** en que más
   pasajeros se acumularon en la plataforma, para decidir dónde y cuándo
   reforzar la frecuencia de trenes. Para cada intervalo de 5 minutos se conoce
   el saldo neto de la plataforma: pasajeros que entraron por los torniquetes
   menos pasajeros que los trenes alcanzaron a evacuar (puede ser negativo). El
   programa actual evalúa todos los tramos posibles de la serie. Sobre un mes de
   datos tarda varios minutos por estación; sobre el histórico de dos años
   (≈ 166.000 intervalos por estación), que es lo que Planeación necesita, no
   termina en un tiempo útil.
4. **Liquidación del tope tarifario.** Desde este año rige una política de
   **tope tarifario**: al cierre de cada mes, a ningún usuario con tarjeta
   personalizada se le puede haber cobrado más que la combinación más barata de
   pasajes y pases que cubra todos sus viajes del mes. La diferencia se le
   devuelve como saldo en la tarjeta. El programa actual explora todas las
   combinaciones posibles de pases. Como no termina para las tarjetas que
   viajan muchos días, a esas se les aplica una regla simplificada: cada día se
   cobra lo más barato entre los pasajes sencillos y el pase diario, y se aplica
   el pase semanal o mensual si la suma ya lo supera. Atención al Usuario
   recibe quejas porque esa regla, en algunos meses, cobra más que el mínimo.

La ventana operativa es de **4 horas** (00:00 – 04:00) para las operaciones 1
y 2 todas las noches, y también para la operación 4 la noche del cierre de mes;
a las 04:30 abren las estaciones y los validadores deben
tener cargada la lista actualizada de tarjetas bloqueadas por robo o pérdida.
Actualmente el proceso tarda **más de 8 horas**, por lo que:

- los validadores abren con la lista de bloqueos del día anterior, y una
  tarjeta reportada como robada sigue funcionando un día más;
- las devoluciones del tope tarifario se acreditan con semanas de retraso;
- Planeación toma las decisiones de frecuencia con datos de una muestra de
  estaciones, no de toda la red.

### Problema identificado

La Gerencia de Tecnología considera que el problema no está en la
infraestructura de cómputo, sino en las **estrategias algorítmicas** usadas en
las cuatro operaciones. Requiere que un equipo de consultores analice
alternativas y recomiende las estrategias más adecuadas para la nueva versión
del proceso.

### Información suministrada por el cliente

**Operación**

- 1.400.000 validaciones en un día hábil típico.
- 2.100 validadores entre estaciones y buses.
- Entre el 4 % y el 9 % de las validaciones de un día llegan repetidas por
  reenvío de lotes.
- 3.200.000 tarjetas emitidas; cerca de 950.000 se usan al menos una vez al mes.
- 80 estaciones de metro y cable; operación de 04:30 a 23:30 (228 intervalos
  de 5 minutos por día).

**Estructura de una validación**

| Campo | Descripción |
|---|---|
| `id_validador` | Identificador del validador |
| `id_tarjeta` | Número de la tarjeta |
| `id_estacion` | Estación o ruta donde se validó |
| `marca_tiempo` | Fecha y hora de la validación |
| `valor_cobrado` | Valor descontado, en pesos |
| `perfil` | General, estudiante, adulto mayor o persona con discapacidad |

**Tarifas vigentes para el perfil general** (los perfiles con tarifa
diferencial tienen valores menores con la misma estructura)

| Producto | Valor | Cobertura |
|---|---|---|
| Pasaje sencillo | $3.900 | Un viaje |
| Pase diario | $9.500 | Viajes ilimitados durante un día calendario |
| Pase semanal | $36.000 | Viajes ilimitados durante 7 días consecutivos |
| Pase mensual | $135.000 | Viajes ilimitados durante 30 días consecutivos |

**Infraestructura**

- El proceso corre sobre un único servidor dedicado, que consume
  aproximadamente 500 W bajo carga sostenida.
- No existe procesamiento distribuido ni en paralelo.

### Restricciones del negocio

La solución deberá garantizar como mínimo que:

- Las operaciones 1 y 2, y la operación 4 en el cierre de mes, terminen dentro
  de la ventana de 4 horas.
- Ninguna validación válida se pierda durante la depuración.
- Una validación repetida nunca se cobre dos veces. Dos registros del mismo
  validador, la misma tarjeta y la misma marca de tiempo son la misma
  validación; si cambia cualquiera de los tres, son validaciones distintas.
- El tope tarifario devuelva exactamente la diferencia frente a la combinación
  **más barata**: ni un peso de menos para el usuario, ni un peso de más para el
  sistema.
- El tramo de congestión reportado sea el de **mayor** acumulación de la serie,
  no una aproximación.
- El archivo original de validaciones no se modifique, para conservar la
  trazabilidad ante reclamaciones.

### Preguntas de impacto propias de este caso

Para el apartado "Implicaciones éticas, sociales y ambientales" del informe:

- **Personas:** ¿quién asume el costo cuando una validación se cobra dos veces
  o cuando el tope se liquida mal? Tenga en cuenta que los usuarios que más
  viajan y los de tarifa diferencial suelen ser los de menores ingresos.
- **Normativa:** identifique qué normas o buenas prácticas condicionan la
  solución y cómo las respeta su diseño. Tenga en cuenta que los viajes de una
  tarjeta personalizada revelan la ubicación y los hábitos de una persona, y que
  el cobro de un servicio público de transporte está regulado.
- **Crecimiento:** ¿cómo se comportan las estrategias recomendadas si entra
  una tercera línea de cable y las validaciones diarias crecen un 30 %?

---

## CASO DE ESTUDIO 2

## PLATAFORMA PULSO: CONSOLIDACIÓN, PRIORIZACIÓN Y AGENDAMIENTO DEL TAMIZAJE DE DIABETES

### Contexto organizacional

La Secretaría de Salud departamental opera el programa de **tamizaje de
diabetes** a través de la plataforma Pulso. 290 laboratorios e IPS del
departamento envían a diario los resultados de las pruebas que procesan. Cada
resultado trae un **índice de riesgo** entre 0 y 100, calculado a partir de
los valores de laboratorio (glucosa en ayunas y hemoglobina glicosilada) y de
la historia clínica.

Con esos resultados, la Secretaría hace tres cosas: genera cada madrugada la
lista de pacientes que el centro de contacto debe llamar, programa las
jornadas de valoración de las unidades móviles en los municipios y vigila la
calidad de los laboratorios que reportan.

La plataforma se escribió cuando el programa cubría 7 municipios y unos
35.000 registros. Tras la ampliación a los 125 municipios del departamento, el
proceso nocturno desbordó su ventana, y las otras dos tareas se siguen haciendo
con hojas de cálculo.

### Situación actual

1. **Consolidación de pacientes repetidos.** Un mismo paciente puede aparecer
   varias veces: se repitió la prueba, o la tomó en dos IPS distintas. Para
   cada paciente solo debe quedar su resultado **más reciente**. El proceso
   actual toma cada resultado nuevo y busca al paciente recorriendo la lista ya
   consolidada.
2. **Lista diaria de llamadas.** El centro de contacto solo alcanza a llamar a
   **9.000 pacientes por día**, en orden de mayor a menor riesgo. El proceso
   actual ordena los 1.450.000 registros pendientes por índice de riesgo con un
   ordenamiento por inserción implementado hace once años, y solo usa los
   primeros 9.000.
3. **Programación de las jornadas de las unidades móviles.** Cada una de las 9
   subregiones del departamento tiene **una** unidad móvil de valoración. Cada
   mes, los municipios de la subregión solicitan jornadas: cada solicitud trae
   una hora de inicio, una hora de fin (incluido el desplazamiento) y el número
   de pacientes de alto riesgo pendientes en ese municipio. La unidad no puede
   estar en dos jornadas a la vez. Hoy el coordinador asigna por orden de
   llegada de las solicitudes y rechaza las que se cruzan con una ya aceptada;
   cada mes quedan sin atender municipios con muchos pacientes de alto riesgo.
4. **Vigilancia de la calidad de los laboratorios.** Para cada lote de
   pruebas que procesa un laboratorio se calcula la diferencia entre su tasa de
   resultados positivos (índice de riesgo igual o superior a 70) y la tasa
   esperada para la población que atiende
   (puede ser negativa). La Secretaría quiere encontrar, para cada laboratorio,
   el **tramo de lotes consecutivos** con mayor exceso acumulado de positivos:
   suele indicar un equipo descalibrado que está enviando a valoración a
   personas sanas. El programa actual evalúa todos los tramos posibles; con el
   histórico de tres años tarda varios días para los 290 laboratorios.

La ventana del proceso nocturno (operaciones 1 y 2) es de **4 horas**
(01:00 – 05:00); a las 06:00 abre el centro de contacto. Actualmente el
proceso tarda **cerca de 7 horas**, y el centro de contacto vuelve a trabajar
algunos días con la lista del día anterior.

### Problema identificado

La Secretaría considera que el problema no está en la infraestructura, sino en
las **estrategias algorítmicas** de las cuatro operaciones. Requiere que un
equipo de consultores analice alternativas y recomiende las estrategias más
adecuadas.

### Información suministrada por el cliente

**Volumen**

- 1.450.000 resultados pendientes de gestión en un día típico.
- Entre el 8 % y el 15 % de los resultados corresponden a un paciente que ya
  tiene otro resultado en la plataforma.
- Capacidad del centro de contacto: 9.000 llamadas por día.
- 9 unidades móviles (una por subregión); cada subregión recibe entre 40 y 120
  solicitudes de jornada por mes.
- Cada laboratorio procesa en promedio 30 lotes por día; el histórico
  disponible es de tres años (≈ 33.000 lotes por laboratorio).

**Estructura de un resultado**

| Campo | Descripción |
|---|---|
| `tipo_documento`, `numero_documento` | Identificación del paciente |
| `id_laboratorio` | Laboratorio o IPS que reporta |
| `id_lote` | Lote de procesamiento |
| `fecha_resultado` | Fecha y hora del resultado |
| `indice_riesgo` | Entero entre 0 y 100 |
| `municipio` | Municipio de residencia |

**Infraestructura**

- Servidor dedicado único, de aproximadamente 380 W bajo carga sostenida.
- No existe procesamiento distribuido ni en paralelo.

### Restricciones del negocio

La solución deberá garantizar como mínimo que:

- Las operaciones 1 y 2 terminen dentro de la ventana de 4 horas.
- De cada paciente quede exactamente un resultado, el más reciente; ningún
  paciente desaparece de la plataforma por la consolidación.
- La lista de llamadas contenga **exactamente** los 9.000 pacientes de mayor
  riesgo: ningún paciente de menor riesgo puede quedar por encima de uno de
  mayor riesgo que quedó fuera. A igual índice de riesgo, va primero el
  resultado más antiguo.
- La programación de una unidad móvil nunca tenga dos jornadas que se crucen.
- El tramo reportado para un laboratorio sea el de **mayor** exceso acumulado.
- Los registros originales enviados por los laboratorios no se modifiquen.

### Preguntas de impacto propias de este caso

- **Personas:** maximizar el **número** de jornadas de la unidad móvil no es lo
  mismo que maximizar el número de **pacientes de alto riesgo** atendidos.
  ¿Cuál de los dos criterios debe optimizar el algoritmo y quién debe decidirlo?
  ¿Qué le pasa a un paciente que la consolidación borra por error, o a uno sano
  que un laboratorio descalibrado envía a valoración?
- **Normativa:** identifique qué normas o buenas prácticas condicionan la
  solución y cómo las respeta su diseño. Tenga en cuenta que la plataforma
  maneja datos de salud de personas identificadas y que de ella depende la
  oportunidad con que se atiende a un paciente.
- **Crecimiento:** ¿cómo se comportan las estrategias recomendadas si el
  programa incorpora el tamizaje de hipertensión arterial y los resultados diarios se
  duplican?

---

## CASO DE ESTUDIO 3

## PLANEACIÓN DIARIA DE DESPACHOS DE UN BANCO DE ALIMENTOS

### Contexto organizacional

El Banco Regional de Alimentos es una fundación sin ánimo de lucro que recibe
alimentos donados por supermercados, la industria y productores del campo
(muchos de ellos próximos a vencer o con defectos de empaque que les impiden
venderse) y los distribuye a **420 organizaciones beneficiarias**: comedores
comunitarios, hogares de adultos mayores, jardines infantiles y fundaciones
que atienden a población vulnerable.

Cada madrugada, un proceso planea los despachos del día: decide qué lotes
salen de la bodega, en qué orden y en qué vehículo. La operación creció más
del doble en tres años y la planeación ya no alcanza a terminar antes de que
salgan los vehículos. La Dirección de Operaciones quiere rediseñarla, porque
cada lote que se vence en la bodega es comida que no llegó a nadie.

### Situación actual

1. **Consulta de inventario.** Durante el alistamiento, los operarios
   consultan un lote por su código (cerca de 30.000 consultas por día), y el
   proceso de planeación pide todos los lotes que vencen en un rango de fechas
   ("¿qué vence en las próximas 72 horas?"). El inventario está guardado en una
   lista y ambas consultas la recorren completa.
2. **Ordenamiento FEFO.** La política sanitaria de la bodega es despachar
   primero lo que vence primero (*first expired, first out*). El proceso
   ordena los lotes por fecha de vencimiento y, a igual fecha, por categoría,
   con un ordenamiento por inserción. Los lotes nuevos del día se anexan al
   final de la lista del día anterior, que ya estaba ordenada.
3. **Cargue de los vehículos.** Cada vehículo tiene una capacidad máxima en
   kilogramos. Para cada ruta hay un conjunto de lotes candidatos, cada uno con
   su peso y su **valor nutricional** (raciones que aporta, ponderadas por la
   prioridad de la categoría: proteína, frutas y verduras, otros). Hay que
   escoger qué lotes suben para que el valor nutricional transportado sea el
   máximo sin superar la capacidad. Un lote no se fracciona: sube completo o no
   sube. Hoy el coordinador carga por orden de vencimiento hasta que ya no cabe
   el siguiente lote; los vehículos salen, en promedio, al 78 % de su
   capacidad.
4. **Análisis de saturación de la bodega.** Para cada categoría de producto se
   registra, por cada hora de operación, el cambio neto del inventario en
   kilogramos: lo que entró menos lo que salió o se descartó (puede ser
   negativo). La Dirección quiere encontrar, para cada categoría, el **tramo de
   horas consecutivas** en que más creció el inventario, para dimensionar el
   cuarto frío que piensa alquilar en temporada. El programa actual evalúa todos
   los tramos posibles; con el histórico de diez años tarda más de un día para
   las 40 categorías.

La ventana de planeación (operaciones 1 a 3) es de **2 horas**
(03:00 – 05:00); a las 05:30 empieza el alistamiento y a las 06:30 salen los
vehículos. Actualmente la planeación tarda **cerca de 4 horas y media**, así que
los vehículos salen tarde, las organizaciones reciben después de la hora de
preparación de sus comidas y parte de los perecederos se vence en la bodega.

### Problema identificado

La Dirección de Operaciones considera que el problema no está en el equipo de
cómputo, sino en las **estrategias algorítmicas** de las cuatro operaciones, y
pide a un equipo de consultores que analice alternativas y recomiende las más
adecuadas.

### Información suministrada por el cliente

**Operación**

- Cerca de 220.000 lotes activos en inventario y entre 6.000 y 9.000 lotes
  nuevos por día.
- 40 categorías de producto; operación de 12 horas diarias, 300 días al año,
  con diez años de histórico (≈ 36.000 registros horarios por categoría).
- 14 vehículos, con capacidades entre 2.500 y 4.000 kg; cada ruta tiene entre
  300 y 600 lotes candidatos.
- El banco estima que cada kilogramo de alimento desechado equivale a 2,5 kg
  de CO₂ equivalente (dato del informe de sostenibilidad de la fundación).

**Estructura de un lote**

| Campo | Descripción |
|---|---|
| `codigo_lote` | Identificador único del lote |
| `categoria` | Una de las 40 categorías de producto |
| `fecha_vencimiento` | Fecha de vencimiento |
| `peso_kg` | Peso del lote en kilogramos (entero) |
| `raciones` | Raciones que aporta |
| `donante` | Donante que lo entregó |

**Infraestructura**

- La planeación corre en un único computador de escritorio de la fundación,
  que consume aproximadamente 150 W bajo carga sostenida.
- No existe procesamiento distribuido ni en paralelo.

### Restricciones del negocio

La solución deberá garantizar como mínimo que:

- La consulta de lotes por rango de vencimiento y las operaciones 2 y 3
  terminen dentro de la ventana de 2 horas.
- Una consulta de lote durante el alistamiento responda en menos de 1 segundo.
- Ningún lote vencido se despache, y dentro de una categoría siempre salga
  primero el lote que vence primero.
- Ningún vehículo supere su capacidad, y el valor nutricional cargado sea el
  **máximo** posible para esa capacidad, no una aproximación.
- El tramo de saturación reportado sea el de **mayor** crecimiento acumulado.
- El registro original de cada lote no se modifique, para conservar la
  trazabilidad sanitaria ante un eventual retiro de producto.

### Preguntas de impacto propias de este caso

- **Personas:** maximizar el valor nutricional transportado puede favorecer a
  las organizaciones de las rutas con más lotes candidatos. ¿Qué pasa con un
  jardín infantil que nunca queda en el cargue óptimo? ¿Y si un error en el
  ordenamiento FEFO despacha un lote vencido?
- **Normativa:** identifique qué normas o buenas prácticas condicionan la
  solución y cómo las respeta su diseño. Tenga en cuenta que se almacenan y
  distribuyen alimentos para consumo humano, que existe una política pública
  contra el desperdicio de alimentos y que los listados de población
  beneficiaria incluyen datos de menores de edad.
- **Crecimiento:** ¿cómo se comportan las estrategias recomendadas si el banco
  abre una segunda bodega y duplica el número de lotes y de vehículos?

---
## ACTIVIDADES A DESARROLLAR (comunes a los tres casos)

El equipo deberá, sobre el caso que le fue asignado:

1. Analizar el problema computacional y caracterizar sus elementos principales
   (entradas, salidas y restricciones).
2. Identificar las operaciones que representan el mayor costo computacional
   dentro del proceso actual y estimar su costo energético a partir del tiempo
   de ejecución y la potencia del equipo informada por el cliente.
3. Seleccionar **al menos dos** de las cuatro operaciones críticas del caso y
   diseñar, para cada una, **al menos dos estrategias algorítmicas distintas**
   que la resuelvan. Entre las estrategias diseñadas debe haber **al menos una
   de dividir y vencer, voraz o programación dinámica aplicada a una operación
   distinta del ordenamiento**, y el equipo debe justificar por qué el problema
   admite esa estrategia.
4. Implementar las estrategias diseñadas en Python.
5. Analizar la complejidad temporal y espacial de cada solución y estimar su
   consumo energético.
6. Diseñar pruebas experimentales utilizando diferentes tamaños de entrada.
7. Comparar el comportamiento de las soluciones mediante métricas objetivas y
   contrastar los resultados empíricos con la complejidad teórica esperada.
8. Justificar técnicamente las estrategias recomendadas para ser implementadas
   por la organización, incluyendo el marco normativo aplicable y las
   implicaciones éticas, sociales y ambientales de la decisión.

### Supuestos permitidos

Con el fin de concentrar el proyecto en el análisis de algoritmos, el equipo
podrá asumir que:

- Todos los datos suministrados por el cliente son válidos y consistentes en
  su formato.
- No existen cambios en los datos durante la ejecución del algoritmo.
- No es necesario desarrollar una interfaz gráfica.
- No se requiere persistencia en bases de datos.
- Los datos pueden cargarse completamente en memoria.
- **No se exige procesar el volumen real.** El equipo generará conjuntos de
  datos sintéticos de tamaño creciente, representativos de la estructura
  descrita, y extrapolará al volumen real a partir de sus mediciones y de la
  complejidad calculada.
- No se requiere procesamiento distribuido ni paralelo: el análisis se realiza
  sobre un único hilo de ejecución.

---

## ENTREGABLE

El proyecto deberá desarrollarse en equipos de máximo cuatro (4) estudiantes y
entregará dos productos:

1. **Repositorio en GitHub** con el código, las gráficas, los datos de prueba
   y un `README.md` que contiene el informe técnico completo.
2. **Informe técnico en PDF**, con el mismo contenido del `README.md`.

### Contenido del informe técnico

El informe, tanto en el `README.md` como en el PDF, debe tener una extensión
sugerida entre 10 y 15 páginas (sin incluir anexos) y contener como mínimo los
siguientes apartados:

**Análisis del problema**

- Descripción del problema computacional.
- Identificación de entradas, salidas y restricciones.
- Identificación de las operaciones críticas del proceso.
- Costo energético del proceso actual (tiempo de ejecución × potencia del
  equipo), como línea base para la propuesta.
- Supuestos realizados por el equipo.

**Diseño de la solución**

- Descripción de las estructuras de datos seleccionadas.
- Diseño de al menos dos estrategias algorítmicas por cada operación abordada.
- Estrategia de diseño en que se apoya cada propuesta (dividir y vencer, voraz,
  programación dinámica u otra), por qué el problema la admite y cómo reduce el
  consumo energético frente al proceso actual.
- Diagramas, pseudocódigo o representaciones equivalentes que permitan
  comprender el funcionamiento de cada propuesta.

**Implementación**

- Descripción de la solución desarrollada.
- Tecnologías y herramientas utilizadas.
- Decisiones de implementación relevantes.

**Evaluación del desempeño**

- Análisis de complejidad temporal y espacial de cada estrategia.
- Diseño y ejecución de pruebas experimentales.
- Presentación e interpretación de los resultados obtenidos mediante tablas o
  gráficas.
- Contraste explícito entre el comportamiento empírico observado y la
  complejidad teórica esperada.
- Verificación de que cada estrategia cumple las restricciones del negocio
  (por ejemplo, que la estrategia rápida da el mismo resultado que la exacta).

**Análisis comparativo**

- Comparación de las estrategias implementadas.
- Ventajas y limitaciones de cada una.
- Justificación técnica de la solución seleccionada para el contexto planteado.

**Implicaciones éticas, sociales y ambientales**

Responder las "Preguntas de impacto propias de este caso" y, además:

- **Consumo energético:** consumo eléctrico del proceso actual frente al de la
  solución propuesta, y proyección de esa diferencia a un año de operación.
- **Consecuencias sobre las personas:** qué ocurre cuando el algoritmo se
  equivoca o llega tarde, quién asume el costo de ese error y cómo puede
  mitigarse desde el diseño del algoritmo.
- **Marco normativo y buenas prácticas:** qué normas y buenas prácticas
  condicionan la solución, identificadas e investigadas por el equipo con su
  fuente, y cómo las respeta el diseño propuesto, en particular la trazabilidad
  de los datos originales.
- **Sostenibilidad de la decisión:** cómo se comportarían las estrategias
  recomendadas en el escenario de crecimiento planteado en el caso.

**Conclusiones**

- Principales hallazgos.
- Lecciones aprendidas.
- Recomendaciones para futuras mejoras.

### 1. Repositorio en GitHub

El repositorio del equipo sigue la organización de trabajo ya establecida en el
curso:

- `README.md` con **todos los apartados del informe técnico** descritos arriba,
  con sus tablas y gráficas, y una sección final que documente cómo generar los
  datos sintéticos y ejecutar los experimentos.
- Código Python estructurado: funciones con responsabilidad única, *type
  hints* y *docstrings*.
- Gráficas reproducibles y los datos de prueba (o el script que los genera).

Deberá evidenciarse el aporte de cada integrante mediante el historial de
commits.

### 2. Informe técnico en PDF

Documento PDF con el mismo contenido del `README.md`, para su archivo como
evidencia de acreditación. Debe coincidir con la versión del `README.md` en la
fecha de entrega.

---

## Rúbrica de evaluación

> Rúbrica institucional transcrita de la plantilla
> `Rubrica RA Análisis de Algoritmos.xlsx` remitida por la Facultad (Medición 1,
> Taxonomía Socioformativa, Tobón 2025). Es fija: criterios, códigos, pesos y
> descriptores no admiten ajuste por asignatura (reunión del 19 de agosto de
> 2026). En la transcripción solo se corrigieron erratas tipográficas.

### Criterios y pesos

| RA | Desempeño esperado | % |
|---|---|---|
| RADE1-1 | Análisis de un algoritmo empleando estrategias como dividir y vencer, algoritmos voraces o programación dinámica, de tal manera que reduzcan el consumo de energía para que sean más amigables con el medio ambiente. | 25 |
| RADE1-2 | Diseño de un algoritmo empleando estrategias como dividir y vencer, algoritmos voraces o programación dinámica, de tal manera que reduzcan el consumo de energía para que sean más amigables con el medio ambiente. | 25 |
| RADT1 | Analiza diferentes complejidades y escoge la opción que mejor se adapte al caso de uso. | 30 |
| RAG2 | Aplica de manera efectiva principios éticos establecidos para la práctica de la ingeniería en los que se evidencia la toma de decisiones responsables de acuerdo con aspectos regulatorios, normativos y de buenas prácticas. | 10 |
| RAG4 | Argumenta cómo sus acciones y decisiones planteadas impactan al medio ambiente, a la sociedad actual y a la del futuro. | 10 |
| | **Total** | **100** |

### Niveles de desempeño

| Nivel | Rango |
|---|---|
| Emergente | 0.0–0.9 |
| En desarrollo | 1.0–1.9 |
| Receptivo | 2.0–2.9 |
| Resolutivo | 3.0–3.9 |
| Crítico | 4.0–4.5 |
| Reflexivo | 4.6–5.0 |

### Cómo se calcula la nota

La rúbrica se aplica por equipo. Cada criterio recibe una nota entre 0.0 y 5.0
dentro del rango del nivel de desempeño alcanzado, y la nota del proyecto es la
suma ponderada de los cinco criterios, también en escala de 0.0 a 5.0:

```
Nota = 0.25·RADE1-1 + 0.25·RADE1-2 + 0.30·RADT1 + 0.10·RAG2 + 0.10·RAG4
```

### Descriptores por criterio

#### RADE1-1 — Análisis del problema (25 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra diseñar algoritmos coherentes ni aplica estrategias. |
| En desarrollo (1.0–1.9) | Analiza algoritmos básicos con errores en la aplicación de estrategias y sin considerar impacto ambiental. |
| Receptivo (2.0–2.9) | Aplica parcialmente análisis de algoritmos en las estrategias, con poca claridad en la reducción de consumo energético. |
| Resolutivo (3.0–3.9) | Analiza algoritmos coherentes aplicando estrategias adecuadas y considerando impacto ambiental. |
| Crítico (4.0–4.5) | Analiza algoritmos fundamentados, optimizando consumo energético y orientados a sostenibilidad. |
| Reflexivo (4.6–5.0) | Propone el análisis de algoritmos sólidos, anticipando necesidades futuras, aplicando estrategias avanzadas y maximizando eficiencia energética con visión ambiental. |

#### RADE1-2 — Diseño de estrategias (25 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra diseñar algoritmos coherentes ni aplica estrategias. |
| En desarrollo (1.0–1.9) | Diseña algoritmos básicos con errores en la aplicación de estrategias y sin considerar impacto ambiental. |
| Receptivo (2.0–2.9) | Aplica parcialmente el diseño de algoritmos según estrategias, con poca claridad en la reducción de consumo energético. |
| Resolutivo (3.0–3.9) | Diseña algoritmos coherentes aplicando estrategias adecuadas y considerando impacto ambiental. |
| Crítico (4.0–4.5) | Diseña algoritmos fundamentados, optimizando consumo energético y orientados a sostenibilidad. |
| Reflexivo (4.6–5.0) | Propone el diseño de algoritmos sólidos, anticipando necesidades futuras, aplicando estrategias avanzadas y maximizando eficiencia energética con visión ambiental. |

#### RADT1 — Evaluación del desempeño (30 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra analizar complejidades ni seleccionar opciones adecuadas. |
| En desarrollo (1.0–1.9) | Analiza complejidades básicas con errores en la selección de la opción. |
| Receptivo (2.0–2.9) | Analiza parcialmente, seleccionando opciones con poca claridad en la justificación. |
| Resolutivo (3.0–3.9) | Analiza complejidades de forma coherente, seleccionando opciones adecuadas al caso de uso. |
| Crítico (4.0–4.5) | Analiza y selecciona opciones fundamentadas, optimizando rendimiento y escalabilidad. |
| Reflexivo (4.6–5.0) | Realiza análisis integral de complejidades, seleccionando opciones estratégicas y anticipando impactos futuros en el rendimiento. |

#### RAG2 — Principios éticos (10 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No aplica principios éticos ni considera aspectos regulatorios. |
| En desarrollo (1.0–1.9) | Aplica principios básicos con errores en la toma de decisiones responsables. |
| Receptivo (2.0–2.9) | Aplica principios éticos parcialmente, con poca claridad en la responsabilidad y normatividad. |
| Resolutivo (3.0–3.9) | Aplica principios éticos de manera coherente, tomando decisiones responsables y considerando normativas. |
| Crítico (4.0–4.5) | Aplica principios éticos fundamentados, evidenciando responsabilidad y compromiso con buenas prácticas. |
| Reflexivo (4.6–5.0) | Integra principios éticos de manera ejemplar, anticipando riesgos, garantizando cumplimiento normativo y promoviendo sostenibilidad social. |

#### RAG4 — Impacto ambiental, social y futuro (10 %)

| Nivel | Descriptor |
|---|---|
| Emergente (0.0–0.9) | No logra argumentar impactos de sus acciones ni decisiones. |
| En desarrollo (1.0–1.9) | Argumenta de forma básica con errores en la identificación de impactos. |
| Receptivo (2.0–2.9) | Argumenta parcialmente, con poca claridad en los impactos ambientales y sociales. |
| Resolutivo (3.0–3.9) | Argumenta de manera coherente, identificando impactos ambientales y sociales actuales. |
| Crítico (4.0–4.5) | Argumenta con fundamentos sólidos, evidenciando impactos ambientales y sociales y proponiendo mejoras. |
| Reflexivo (4.6–5.0) | Argumenta de forma integral, anticipando impactos futuros, proponiendo soluciones sostenibles y con visión estratégica para sociedad y medio ambiente. |

---

---

# Anexo — Justificación docente

> Esta sección acompaña la propuesta enviada a la Facultad. **No se entrega a
> los estudiantes.**

## Por qué casos propios y no los del ejemplo

El instrumento de ejemplo remitido por la Facultad contiene dos casos
(programación académica universitaria y rutas de atención de emergencias). Ambos
se apoyan principalmente en contenidos que este curso **no dicta**:

| Caso del ejemplo | Contenido que exige | Estado en el microdiseño |
|---|---|---|
| Programación académica | Satisfacción de restricciones, *backtracking* con poda, coloreado de grafos | *Backtracking* y coloreado: no se dictan |
| Rutas de emergencia | Grafo dirigido y ponderado, Dijkstra / Bellman-Ford / BFS | Grafos figuran solo en "Temas opcionales", sin sesión |

El correo de convocatoria establece que "cada asignatura contará con su
correspondiente caso de estudio y rúbrica de evaluación, los cuales deberán
guardar coherencia con sus contenidos, competencias y resultados de
aprendizaje", y en la reunión del 19 de agosto se confirmó que el caso lo
redacta cada docente y lo aprueba la Facultad.

## Por qué tres casos y por qué el docente los asigna

- **Tres casos, una sola estructura.** Los tres casos tienen la misma forma:
  cuatro operaciones críticas que se resuelven con los mismos bloques de
  contenido (estructuras de datos, ordenamiento, dividir y vencer, y
  programación dinámica o voraz). Así son equivalentes en dificultad y se
  califican con la misma rúbrica sin ajustes.
- **Asignación por el docente.** Repartir los casos entre los equipos reduce la
  copia entre equipos y permite equilibrar cuántos equipos trabajan cada caso.
- **Problemas reales, no ejercicios.** Cada caso reproduce un proceso que
  existe en organizaciones reales de la región (conciliación del recaudo de un
  sistema de transporte con tarjeta sin contacto, tamizaje poblacional en salud
  pública, planeación de despachos de un banco de alimentos), con volúmenes del
  orden real y restricciones de negocio verificables.
- **Por qué no el caso de telemedición.** Las lecciones del curso usan la
  consolidación de lecturas de telemedición como contexto narrativo y
  adelantan parte de su solución (tabla hash por cuenta, costo de ordenar). El
  Caso 1 conserva la estructura de ese problema (proceso nocturno por lotes,
  duplicados por reenvío, ventana operativa), pero en otro sector y con
  operaciones distintas, para que el estudiante transfiera lo aprendido en
  lugar de repetirlo.
- **Relación con el Laboratorio 1.** El Laboratorio 1 trabajó un tamizaje
  cardiovascular en una plataforma llamada Tamiza. El Caso 2 comparte el
  sector salud, pero es independiente: otro programa (tamizaje de diabetes),
  otra plataforma (Pulso), otras cifras y otras operaciones. Para no repetir la comparación entre insertion sort y merge sort
  que ya se calificó allí, la operación 2 no pide ordenar la lista completa
  sino **seleccionar** los 9.000 pacientes de mayor riesgo.

## Cobertura de cada caso frente al microdiseño

Cada operación tiene al menos una ruta de solución construida con contenido
dictado. Las alternativas marcadas como autoestudio son opcionales: el
instrumento las admite (reunión del 19 de agosto), pero ninguna es
indispensable para cumplir las actividades.

### Caso 1 — Recaudo del sistema de transporte

| Operación | Estrategias con contenido dictado | Alternativas por autoestudio | Semana |
|---|---|---|---|
| Deduplicación | Comparación exhaustiva Θ(n²) → tabla hash por (validador, tarjeta, marca de tiempo); árbol de búsqueda binario; ordenar y comparar vecinos | — | 4 y 13 (Lab 3) |
| Ordenamiento | Insertion sort Θ(n²) → merge sort Θ(n log n) | Heapsort, quicksort, radix sort | 3 y 4 (Lab 1) |
| Franjas de congestión | Fuerza bruta Θ(n²) → subarreglo máximo por dividir y vencer Θ(n log n) | Algoritmo de Kadane Θ(n) | 7 y 10 (Lab 2) |
| Tope tarifario | Exploración exhaustiva (exponencial en los días con viaje) → programación dinámica sobre los días del mes Θ(d); la regla voraz actual como contraste que falla | — | 15 (Lab 4) |

### Caso 2 — Plataforma Pulso

| Operación | Estrategias con contenido dictado | Alternativas por autoestudio | Semana |
|---|---|---|---|
| Consolidación de pacientes | Búsqueda lineal Θ(n²) → tabla hash por documento; árbol de búsqueda binario | — | 13 (Lab 3) |
| Lista de llamadas (top-k) | Insertion sort completo Θ(n²) (actual) → merge sort completo Θ(n log n) frente a mantener los k mayores en una lista ordenada Θ(n·k) (con k = 9.000 la segunda **pierde**: es un hallazgo esperado) | Montículo de tamaño k Θ(n log k); merge sort truncado a k por dividir y vencer Θ(n log k) | 3 y 4 |
| Jornadas de las unidades móviles | Orden de llegada (actual) y exploración exhaustiva Θ(2ⁿ) → selección de actividades voraz Θ(n log n), que maximiza el **número** de jornadas | Programación de intervalos ponderados por programación dinámica, que maximiza los **pacientes** atendidos (Kleinberg y Tardos, 6.1) | 15 (Lab 4) |
| Calidad de los laboratorios | Fuerza bruta Θ(n²) → subarreglo máximo por dividir y vencer Θ(n log n) | Kadane Θ(n) | 7 y 10 (Lab 2) |

### Caso 3 — Banco de alimentos

| Operación | Estrategias con contenido dictado | Alternativas por autoestudio | Semana |
|---|---|---|---|
| Consulta de inventario | Recorrido de lista Θ(n) → tabla hash por código (consulta puntual); árbol de búsqueda binario por fecha (consulta por rango) | Arreglo ordenado con búsqueda binaria | 13 (Lab 3) |
| Ordenamiento FEFO | Insertion sort sobre la lista casi ordenada Θ(n·m) (m lotes nuevos, cada uno se desplaza en promedio la mitad de la lista) → merge sort completo Θ(n log n) → ordenar solo los m nuevos con merge sort y mezclarlos con la lista ya ordenada usando el paso de combinación de merge sort Θ(n + m log m) | — | 3 y 4 (Lab 1, escenario B) |
| Cargue de vehículos | Orden de vencimiento (actual) y exploración exhaustiva Θ(2ⁿ) → mochila 0/1 por programación dinámica Θ(n·W); voraz por densidad (valor/kg) como contraste que no garantiza el óptimo | — | 15 (Lab 4) |
| Saturación de la bodega | Fuerza bruta Θ(n²) → subarreglo máximo por dividir y vencer Θ(n log n) | Kadane Θ(n) | 7 y 10 (Lab 2) |

Los tres casos **no exigen** grafos, *backtracking*, NP-completitud ni
programación paralela.

**Estrategias de diseño (RADE1-1 y RADE1-2).** El desempeño esperado de la
rúbrica nombra dividir y vencer, voraces y programación dinámica. Por eso la
actividad 3 exige al menos una estrategia de esa familia **en una operación
distinta del ordenamiento**: si no, bastaría con merge sort. Cada caso ofrece
dos rutas para cumplirla: el subarreglo máximo por dividir y vencer, que el
curso consolidó en el Laboratorio 2, y una operación de programación dinámica o
voraz. Como la programación dinámica y la estrategia voraz se dictan en una
sola sesión (9 nov), la ruta de dividir y vencer garantiza que ningún equipo
dependa solo de ese contenido.

## Mapeo de los casos a los criterios de la rúbrica

| Criterio | % | Cómo lo provocan los casos | Estado en el curso |
|---|---|---|---|
| RADE1-1 — Analiza el problema | 25 | Cada caso se entrega como contexto organizacional, no como problema formalizado: el equipo debe extraer entradas, salidas, restricciones y operaciones críticas. El costo energético del proceso actual es la línea base del análisis | ⚠️ Vacío parcial: los laboratorios entregan problemas ya definidos. Requiere al menos una sesión de modelado |
| RADE1-2 — Diseña y compara estrategias | 25 | Dos operaciones × dos estrategias cada una, con al menos una de dividir y vencer, voraz o programación dinámica fuera del ordenamiento, y la estrategia de diseño y su efecto energético declarados | ✅ Cubierto (Labs 2, 3 y 4 ya comparan enfoques) |
| RADT1 — Evalúa el desempeño | 30 | Pruebas con tamaños crecientes, métricas objetivas, contraste con la complejidad teórica y extrapolación al volumen real; el escenario de crecimiento evidencia escalabilidad (nivel Crítico en adelante) | ✅ Cubierto: es la marca declarada del curso |
| RAG2 — Principios éticos | 10 | Cada caso define fallas concretas del algoritmo que afectan a personas identificables (cobro doble, paciente borrado, lote vencido despachado) y piden al equipo identificar, con su fuente, el marco normativo y las buenas prácticas del sector | Solo se evalúa (no se dicta, reunión del 19 de agosto) |
| RAG4 — Impacto ambiental, social y futuro | 10 | El consumo eléctrico es **calculable** con la potencia del equipo que da cada caso; el Caso 3 suma el CO₂ del alimento desechado; cada caso plantea un escenario de crecimiento | Solo se evalúa (no se dicta, reunión del 19 de agosto) |

## Decisión de diseño sobre RAG2 y RAG4

Para que estos dos resultados sean evaluables con evidencia y no con opinión,
los casos los anclan en datos que el propio estudiante produce:

- Cada caso da la potencia del equipo de cómputo y la ventana operativa
  precisamente para que el consumo energético se **calcule**, no se declare. La
  diferencia entre Θ(n²) y Θ(n log n) sobre más de un millón de registros es de
  varios órdenes de magnitud, y por lo tanto de kWh.
- Las consecuencias sobre las personas se anclan en fallas concretas y
  verificables del algoritmo de cada caso, no en una reflexión genérica sobre
  ética profesional. Los Casos 2 y 3 añaden una tensión explícita entre lo que
  el algoritmo optimiza y a quién deja por fuera.
- La plantilla diferencia los dos criterios: RAG2 evalúa decisiones
  responsables frente a aspectos regulatorios, normativos y de buenas
  prácticas, y RAG4 la argumentación de impactos ambientales y sociales,
  actuales y futuros. El informe pide evidencia distinta para cada uno:
  consecuencias sobre las personas y marco normativo para RAG2; consumo
  energético y escenario de crecimiento para RAG4.

El consumo energético no se califica solo en RAG4: los descriptores de RADE1-1
y RADE1-2 piden reducción del consumo energético en el análisis y en el diseño.
Por eso la línea base energética va en "Análisis del problema" y el efecto
energético de cada estrategia en "Diseño de la solución".

## Observaciones sobre la plantilla institucional

Detectadas al transcribir la rúbrica (2026-10-24); conviene reportarlas a
Gustavo Macías antes de consolidar resultados:

- **Error de fórmula:** en la hoja `Consolidado`, la celda F19 (RAG4 del
  Grupo 1) apunta a `'Eq 2'!B22` en lugar de `'Eq 1'!B22`: el Grupo 1 recibiría
  el RAG4 del Grupo 2.
- **Fórmula faltante:** la fila "Promedio RA" de `Consolidado` no tiene el
  promedio de RADE1-2 (celda C33 vacía).
- **Códigos que no coinciden con su descripción:** el criterio RAG2 evalúa
  principios éticos, pero el RA asociado en la hoja (RAG2, competencia C4) es
  "participa activamente en equipos de trabajo… comunicación efectiva"; el
  criterio RAG4 evalúa impacto ambiental y social, pero el RA asociado (C7) es
  "identifica, selecciona y aplica nuevos conocimientos". Los códigos también
  varían: "RAD1" y "RAT1" en las hojas por equipo, "RADE1" y "RADT1" en el
  resto.
- **Rangos de nivel:** los rangos de la plantilla (Emergente 0.0–0.9 … Resolutivo
  3.0–3.9) difieren de los que se habían tomado del instrumento de ejemplo
  (Emergente 0.0–1.9 … Resolutivo 3.5–3.9). Este documento usa los de la
  plantilla.

## Condiciones de aplicación

Condiciones ya definidas (reunión del 19 de agosto y reajuste del 2026-10-03):

1. **Ubicación en la evaluación:** proyecto final, **20 %** de la nota, en la
   casilla abierta por el reajuste del 2026-10-03 (4 laboratorios de 15 % +
   proyecto 20 % + Seguimiento 20 %).
2. **Fecha:** semana de finales (23–29 nov). No se exigen hitos intermedios:
   solo hay entrega final. Esa misma semana es la ventana de registro del 100 %
   en el SIA, así que la fecha exacta debe dejar tiempo para calificar.
3. **Trabajo en equipo:** equipos de máximo 4 integrantes, obligatorios (ajustado de 3 a 4 por el docente el 2026-10-24). La
   evidencia individual es el historial de commits, que ya se valora en
   Seguimiento.
4. **Ética e impacto:** solo se evalúan; no se abre espacio curricular.
5. **Casos:** tres casos equivalentes; cada equipo trabaja uno, asignado por el
   docente.
6. **Reporte:** por estudiante, en la plantilla de Gustavo Macías
   (`Rubrica RA Análisis de Algoritmos.xlsx`), aparte del SIA. La plantilla
   tiene una hoja por equipo (hasta 12) con docente, título del proyecto,
   estudiantes y un campo de **valoración individual**, y una hoja
   `Consolidado` que también pide momento, fecha, número de estudiantes y de
   equipos, aula y horario. La no entrega se reporta como 0.0. Los informes se
   conservan como evidencia de acreditación.

Decisiones del docente (2026-11-02):

7. **Fecha de entrega:** lunes **23 de noviembre**, primer día de la semana de
   finales; deja el resto de la ventana del SIA para calificar y registrar.
8. **Valoración individual:** todos los integrantes reciben la nota del equipo.
   El aporte individual ya se valora en Seguimiento con el historial de commits.
9. **Asignación de los casos:** reparto equilibrado hecho por el docente.
10. **Sustentación oral:** no hay. Solo entrega final.
11. **Repositorio del equipo:** un repositorio nuevo por equipo, con todos los
    integrantes como colaboradores.
12. **Sesión de modelado** (RADE1-1): no se dedica una sesión de clase. Se
    publica una guía breve con un ejemplo resuelto junto al enunciado del
    proyecto.

Pendiente: reportar a Gustavo Macías los errores de la plantilla institucional
(sección "Observaciones sobre la plantilla institucional").
