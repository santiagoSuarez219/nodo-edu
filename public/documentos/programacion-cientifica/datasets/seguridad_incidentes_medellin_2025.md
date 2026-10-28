# Diccionario de datos — Incidentes de seguridad en Medellín (2025)

**Archivo:** `seguridad_incidentes_medellin_2025.csv` · **4.505 filas × 19 columnas** · datos sintéticos

## Contexto

Cada fila es **un incidente** (hurto, riña, violencia intrafamiliar o lesiones
personales) reportado a las autoridades en alguna de las 16 comunas de Medellín
durante 2025. Incluye cuándo y dónde ocurrió, cómo ocurrió, datos de la víctima,
lo que se perdió, las condiciones del lugar y el tiempo que tardó la policía en
llegar.

**Decisión que apoya:** la alcaldía debe decidir dónde y en qué horarios reforzar
el patrullaje, dónde mejorar el alumbrado o instalar cámaras, y en qué comunas
reducir el tiempo de respuesta.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_incidente` | texto | Identificador del incidente. |
| `fecha` | fecha (AAAA-MM-DD) | Día del incidente. |
| `hora` | entero (0-23) | Hora del día en que ocurrió. |
| `dia_semana` | categórica | Día de la semana. |
| `mes` | entero (1-12) | Mes del incidente. |
| `comuna` | categórica | Comuna de Medellín donde ocurrió. |
| `tipo_incidente` | categórica | `Hurto a persona`, `Hurto de celular`, `Hurto de moto`, `Riña`, `Violencia intrafamiliar`, `Lesiones personales`. |
| `modalidad` | categórica | Cómo ocurrió (atraco, raponazo, cosquilleo, halado, agresión física…). |
| `arma` | categórica | Arma empleada. |
| `lugar` | categórica | Tipo de lugar: vía pública, transporte público, vivienda, establecimiento comercial, parqueadero. |
| `iluminacion_zona` | categórica | Estado del alumbrado: `Buena`, `Regular`, `Deficiente`. |
| `camaras_cercanas` | entero | Cámaras de vigilancia a menos de 200 m. |
| `sexo_victima` | categórica | `F` o `M`. |
| `edad_victima` | numérica (años) | Edad de la víctima. |
| `bien_hurtado` | categórica | Qué se hurtó. **Vacío si el incidente no es un hurto.** |
| `valor_perdido_cop` | numérica (pesos) | Valor estimado de lo hurtado. **Vacío si el incidente no es un hurto.** |
| `tiempo_respuesta_min` | numérica (minutos) | Minutos hasta que llegó la policía. |
| `denunciado` | categórica | `Sí` si la víctima puso denuncia formal. |
| `testigos` | numérica | Número de testigos presentes. |

## Preguntas guía

1. ¿En qué horas y días se concentra cada tipo de incidente?
2. ¿Qué comunas tienen más incidentes y cuáles tienen peores tiempos de respuesta?
3. ¿Se usan más armas de fuego donde la iluminación es deficiente?
4. ¿Qué bienes se hurtan más y cuáles tienen mayor valor? ¿Cambia en las comunas centrales?
5. ¿Las cámaras cercanas o el valor de lo perdido se relacionan con que la víctima denuncie?

## Ideas de visualización

- **Univariadas:** barras de incidentes por `tipo_incidente` o `comuna`; histograma de `hora` y de `tiempo_respuesta_min`.
- **Multivariadas:** mapa de calor de incidentes por `dia_semana` y `hora`; cajas de `tiempo_respuesta_min` por `comuna`; barras apiladas de `arma` por `iluminacion_zona`; línea de incidentes por mes.
