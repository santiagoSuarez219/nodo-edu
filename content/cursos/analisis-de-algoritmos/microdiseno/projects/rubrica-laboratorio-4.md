# Rúbrica — Laboratorio 4 (Programación dinámica y algoritmos voraces) — 2026-2

> **Estado: APROBADA** (2026-11-02). **Ajuste del 2026-11-02:** el laboratorio
> se entrega dentro del repositorio y del informe del proyecto, no en una carpeta
> aparte, para que todo su trabajo sea avance del proyecto; cambian solo las
> descripciones de "Documentación" (ubicación y estructura) y "Análisis de las
> gráficas" (proyección anual de la energía). Los puntos no cambian. Se socializa con los equipos antes de la
> entrega del **miércoles 18 de noviembre**. Está transcrita tal cual en la
> sección "Criterios de Evaluación" de la guía del estudiante
> (`guias/lab-evaluativo-04-programacion-dinamica-y-voraces.md`).
>
> Es la rúbrica propia del laboratorio, de 5 criterios y 100 puntos, la misma
> estructura de los laboratorios 2 y 3. **No** es la rúbrica institucional del
> proyecto (RADE1-1, RADE1-2, RADT1, RAG2, RAG4), que solo se aplica a la
> entrega del 23 de noviembre.

## Qué se califica

Cada equipo entrega, **dentro del repositorio y del informe del proyecto final**
(código en `src/<operacion>/`, gráficas en `graficas/<operacion>/` y texto en
los apartados del `README.md` del proyecto), la **operación de su caso que admite programación dinámica o voraz**
(la 4 en el Caso 1 y la 3 en los Casos 2 y 3), resuelta con programación dinámica o
estrategia voraz, contrastada con lo que hace hoy la organización:

| Caso | Operación | Estrategia |
|---|---|---|
| 1 — Recaudo del transporte | 4. Liquidación del tope tarifario | Programación dinámica sobre los días del mes |
| 2 — Plataforma Pulso | 3. Programación de las jornadas de las unidades móviles | Selección de actividades voraz |
| 3 — Banco de alimentos | 3. Cargue de los vehículos | Mochila 0/1 por programación dinámica |

La calificación es **por equipo**: todos los integrantes reciben la misma nota.

## Criterios de Evaluación

| Criterio | Puntos | Descripción |
|---|---|---|
| **Corrección conceptual** | 20 | El informe explica por qué el problema admite la estrategia elegida: identifica la subestructura óptima y los subproblemas traslapados (programación dinámica) o la propiedad de elección voraz (voraz) y los ilustra con un ejemplo pequeño resuelto a mano. Muestra con un **contraejemplo calculado** por qué falla la regla que usa hoy la organización (Caso 1: la regla simplificada de pasaje diario y pases; Caso 2: la asignación por orden de llegada; Caso 3: cargar por orden de vencimiento o por densidad de valor) y dice qué condición del problema haría adecuada a la otra familia de estrategias. |
| **Calidad de la explicación teórica** | 20 | Plantea la recurrencia de la programación dinámica y explica cada término, o el criterio de elección voraz con su justificación de por qué no necesita reconsiderar. Calcula la complejidad temporal y espacial de la estrategia y del enfoque ingenuo o exhaustivo, y las contrasta (Caso 1: Θ(d) frente a exponencial en los días con viaje; Caso 2: Θ(n log n) frente a Θ(2ⁿ); Caso 3: Θ(n·W) frente a Θ(2ⁿ), explicando que el costo depende de la capacidad W y no solo de n). |
| **Corrección de la implementación** | 25 | El código cumple el estándar del curso (PEP 8, *type hints* y *docstrings* en cada función). Devuelve el resultado correcto en casos pequeños resueltos a mano, en los casos límite del problema y en al menos veinte instancias aleatorias pequeñas donde coincide con la solución exhaustiva. Cumple las restricciones del negocio del caso (Caso 1: devuelve exactamente la diferencia frente a la combinación más barata; Caso 2: ninguna unidad móvil tiene dos jornadas que se crucen; Caso 3: ningún vehículo supera su capacidad, el valor es el máximo y ningún lote se fracciona). Implementa también la regla actual y muestra una instancia donde da un resultado peor. |
| **Calidad del análisis de las gráficas** | 25 | Existen las gráficas con título, ejes rotulados con unidades y leyenda, y la estrategia y el enfoque con el que se contrasta van en los mismos ejes. Cubren al menos seis tamaños de entrada, dentro de lo que el enfoque exhaustivo alcanza a ejecutar. El análisis calcula el factor de crecimiento al duplicar el tamaño y lo compara con el esperado por la complejidad. Extrapola el tiempo al volumen real del caso, lo compara con la ventana operativa del cliente, estima el consumo de energía con la potencia que informa el caso y proyecta a un año la diferencia entre la regla actual y la estrategia. |
| **Documentación y organización del informe** | 10 | El repositorio del proyecto tiene el `README.md` con los apartados del informe técnico del proyecto, en su orden, con esta operación completa en ellos y lo pendiente marcado; el código en `src/<operacion>/` y las gráficas en `graficas/<operacion>/`. El informe muestra las gráficas visibles en GitHub, enlaza el código y trae la sección final para reproducir los datos sintéticos y las mediciones. El historial tiene al menos tres commits y **cada integrante aparece** en él. Se entrega a más tardar el 18 de noviembre. |
| **TOTAL** | **100** | |

La nota del laboratorio se convierte a la escala del curso así:
`nota_curso = (puntos / 100) x 15 %`. Por ejemplo, 80 puntos equivalen a
`0,80 x 15 % = 12 %` de la nota del curso.

## Notas para el docente

- **Criterios idénticos a los laboratorios 2 y 3** (20 / 20 / 25 / 25 / 10), tal
  como pide la rúbrica común del curso, con descriptores propios de la
  operación del laboratorio. La diferencia es que el contraste es contra la regla que usa hoy
  la organización y no solo contra fuerza bruta.
- **Caso 2 y el criterio a optimizar.** El equipo elige qué criterio
  implementa: el número de jornadas (selección de actividades voraz) o los
  pacientes de alto riesgo atendidos (programación dinámica de intervalos
  ponderados, que es autoestudio). Esta rúbrica acepta cualquiera de los dos si
  el equipo justifica su elección y su estrategia es correcta para el criterio
  que declaró. Quién debe decidir el criterio en la organización es una
  pregunta de impacto del proyecto y se califica en la entrega del 23 nov
  (RAG2), no aquí.
- **Sin componente individual** (decisión del 2026-11-02). A diferencia de los
  laboratorios 2 y 3, no hay preguntas conceptuales individuales: todos los
  integrantes reciben la nota del equipo, como en el proyecto. El aporte de
  cada uno se evidencia con el historial de commits, que también se valora en
  Seguimiento.
