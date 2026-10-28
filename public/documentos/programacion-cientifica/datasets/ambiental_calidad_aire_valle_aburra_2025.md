# Diccionario de datos — Calidad del aire en el Valle de Aburrá (2025)

**Archivo:** `ambiental_calidad_aire_valle_aburra_2025.csv` · **2.920 filas × 15 columnas** · datos sintéticos

## Contexto

El Valle de Aburrá es un valle estrecho rodeado de montañas: en ciertas épocas
del año el aire se estanca y los contaminantes se acumulan, lo que lleva a
declarar alertas y medidas como la restricción vehicular. El contaminante más
vigilado es el **material particulado fino (PM2.5)**, partículas tan pequeñas que
llegan a los pulmones. Cada fila es **el promedio diario de una estación de
monitoreo**: 8 estaciones × 365 días de 2025.

**Decisión que apoya:** la autoridad ambiental debe decidir en qué meses activar
el plan de contingencia, en qué zonas concentrar las medidas y qué condiciones
del clima sirven como señal temprana de un episodio de contaminación.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `fecha` | fecha (AAAA-MM-DD) | Día de la medición. |
| `dia_semana` | categórica | Día de la semana. |
| `mes` | entero (1-12) | Mes. |
| `estacion` | categórica | Código de la estación de monitoreo. |
| `municipio` | categórica | Municipio de la estación. |
| `tipo_estacion` | categórica | Entorno: `Tráfico`, `Industrial`, `Residencial`, `Fondo` (zona alejada de fuentes). |
| `pm25` | numérica (µg/m³) | Material particulado fino, promedio de 24 h. |
| `pm10` | numérica (µg/m³) | Material particulado grueso, promedio de 24 h. |
| `o3` | numérica (µg/m³) | Ozono. **Solo algunas estaciones tienen este sensor.** |
| `no2` | numérica (µg/m³) | Dióxido de nitrógeno. **Solo algunas estaciones tienen este sensor.** |
| `categoria_ica_pm25` | categórica ordinal | Índice de calidad del aire según PM2.5: `Buena` (0-12), `Aceptable` (12,1-37), `Dañina para grupos sensibles` (37,1-55), `Dañina` (55,1-150). |
| `temperatura_c` | numérica (°C) | Temperatura media del día. |
| `humedad_relativa` | numérica (%) | Humedad relativa media. |
| `precipitacion_mm` | numérica (mm) | Lluvia acumulada en el día. |
| `velocidad_viento_ms` | numérica (m/s) | Velocidad media del viento. |

> Los equipos de medición fallan: hay días seguidos sin datos en algunas
> estaciones. Piensa si en una serie de tiempo conviene más imputar con la
> mediana general o con los días vecinos.

## Preguntas guía

1. ¿En qué meses sube el PM2.5? ¿Coincide con lo que conoces de las alertas en el valle?
2. ¿Qué tipo de estación registra más contaminación? ¿Cuál menos?
3. ¿Es menor la contaminación los fines de semana? ¿Qué dice eso de la fuente principal?
4. ¿Cómo se relacionan la lluvia y el viento con el PM2.5?
5. ¿Cuántos días al año cada estación superó la categoría `Aceptable`?

## Ideas de visualización

- **Univariadas:** histograma de `pm25`; barras de `categoria_ica_pm25`.
- **Multivariadas:** línea de `pm25` diario por estación o promedio mensual; cajas de `pm25` por `tipo_estacion` o `dia_semana`; dispersión `pm25` vs `pm10` y vs `precipitacion_mm`; mapa de calor de correlaciones entre variables numéricas; mapa de calor de `pm25` por estación y mes.
