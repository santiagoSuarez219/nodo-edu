# Diccionario de datos — Casos de dengue en Antioquia (2025)

**Archivo:** `salud_dengue_antioquia_2025.csv` · **2.859 filas × 18 columnas** · datos sintéticos

## Contexto

El dengue es una enfermedad transmitida por el mosquito *Aedes aegypti*, que se
reproduce en agua estancada. Por eso los casos suelen subir algunas semanas
después de las temporadas de lluvia y son más frecuentes en municipios cálidos.
Cada fila es **un caso notificado** al sistema de vigilancia en salud pública
durante 2025, en diez municipios de Antioquia de distintas subregiones y climas.

**Decisión que apoya:** una secretaría de salud debe decidir en qué municipios y
en qué meses intensificar fumigación y campañas, y qué pacientes priorizar en la
atención para evitar casos graves y muertes.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_caso` | texto | Identificador único del caso. |
| `fecha_notificacion` | fecha (AAAA-MM-DD) | Día en que se notificó el caso. |
| `semana_epidemiologica` | entero (1-52) | Semana del año en que se notificó. |
| `municipio` | categórica | Municipio de residencia del paciente. |
| `subregion` | categórica | Subregión de Antioquia del municipio. |
| `zona` | categórica | `Urbana` o `Rural`. |
| `sexo` | categórica | `F` o `M`. |
| `edad` | numérica (años) | Edad del paciente. |
| `regimen_salud` | categórica | Afiliación: `Contributivo`, `Subsidiado`, `Especial`, `No asegurado`. |
| `ocupacion` | categórica | Ocupación reportada del paciente. |
| `dias_sintomas_a_consulta` | numérica (días) | Días entre el inicio de síntomas y la consulta. |
| `clasificacion` | categórica | `Dengue sin signos de alarma`, `Dengue con signos de alarma`, `Dengue grave`. |
| `plaquetas_miles` | numérica (miles/µL) | Recuento de plaquetas. Valor normal: 150-450. |
| `hospitalizado` | categórica | `Sí` / `No`. |
| `dias_hospitalizacion` | numérica (días) | Días hospitalizado. **Vacío si el paciente no fue hospitalizado.** |
| `condicion_final` | categórica | `Vivo` o `Fallecido`. |
| `temperatura_media_semana` | numérica (°C) | Temperatura media del municipio en esa semana. |
| `precipitacion_semana_mm` | numérica (mm) | Lluvia acumulada en el municipio en esa semana. |

## Preguntas guía

1. ¿Cómo evolucionan los casos semana a semana? ¿Hay picos? ¿Coinciden con la lluvia de semanas anteriores?
2. ¿Qué municipios y subregiones concentran más casos? ¿Influye la temperatura?
3. ¿Cómo cambian las plaquetas según la clasificación del caso?
4. ¿Los pacientes que tardan más en consultar terminan con casos más graves? ¿Quiénes tardan más (zona, régimen)?
5. ¿Qué grupos de edad tienen mayor proporción de casos graves y hospitalizaciones?

## Ideas de visualización

- **Univariadas:** histograma de `edad` y de `plaquetas_miles`; barras de casos por `municipio` o `clasificacion`.
- **Multivariadas:** línea de casos por semana junto a la lluvia; cajas de `plaquetas_miles` por `clasificacion`; cajas de `dias_sintomas_a_consulta` por `zona` o `regimen_salud`; mapa de calor de casos por municipio y mes.
