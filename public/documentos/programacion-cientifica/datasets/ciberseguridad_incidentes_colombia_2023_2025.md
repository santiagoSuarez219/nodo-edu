# Diccionario de datos — Incidentes de ciberseguridad en organizaciones colombianas (2023-2025)

**Archivo:** `ciberseguridad_incidentes_colombia_2023_2025.csv` · **1.850 filas × 21 columnas** · datos sintéticos

## Contexto

Cada fila es **un incidente de ciberseguridad** reportado por una organización
colombiana entre 2023 y 2025: phishing, ransomware, malware, accesos no
autorizados, fugas de datos o ataques de denegación de servicio (DDoS). Además del
ataque, registra el tamaño y sector de la empresa, los controles de seguridad que
tenía (autenticación multifactor, capacitación, centro de operaciones de
seguridad) y el impacto: cuánto tardó en detectarse, cuántos equipos y registros
se afectaron y cuánto dinero se perdió.

**Decisión que apoya:** un gremio empresarial debe recomendar a sus afiliados en
qué controles invertir primero con un presupuesto limitado, y qué sectores y
tamaños de empresa están más expuestos.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_incidente` | texto | Identificador del incidente. |
| `fecha_deteccion` | fecha (AAAA-MM-DD) | Día en que se detectó. |
| `anio` | entero | Año de detección. |
| `departamento` | categórica | Departamento de la sede afectada. |
| `sector` | categórica | `Financiero`, `Salud`, `Educación`, `Gobierno`, `Comercio`, `Manufactura`. |
| `tamano_empresa` | categórica | `Micro`, `Pequeña`, `Mediana`, `Grande`. |
| `num_empleados` | entero | Número de empleados. |
| `presupuesto_ti_pct` | numérica (%) | Porcentaje del presupuesto destinado a tecnología. |
| `tiene_mfa` | categórica | `Sí` si usaba autenticación multifactor. |
| `capacitacion_ultimo_anio` | categórica | `Sí` si el personal recibió capacitación en seguridad el último año. |
| `tiene_soc` | categórica | `Sí` si tenía un centro de operaciones de seguridad (SOC) propio o contratado. |
| `tipo_ataque` | categórica | Tipo de ataque. |
| `vector_entrada` | categórica | Por dónde entró el atacante (correo, credenciales robadas, vulnerabilidad sin parche…). |
| `severidad` | categórica ordinal | `Baja` < `Media` < `Alta` < `Crítica`. |
| `horas_deteccion` | numérica (horas) | Horas entre el inicio del ataque y su detección. |
| `horas_contencion` | numérica (horas) | Horas entre la detección y la contención. |
| `equipos_afectados` | entero | Computadores o servidores comprometidos. |
| `registros_expuestos` | numérica | Registros de datos expuestos (0 si no hubo exposición de datos). |
| `perdida_estimada_millones_cop` | numérica (millones de pesos) | Pérdida económica estimada por la empresa. |
| `pago_rescate_millones_cop` | numérica (millones de pesos) | Rescate pagado. **Vacío si no se pagó rescate.** |
| `notificado_a_autoridad` | categórica | `Sí` si se reportó a las autoridades. |

## Preguntas guía

1. ¿Qué tipos de ataque crecen de un año a otro?
2. ¿Las empresas con MFA sufren menos ataques por credenciales robadas y de menor severidad?
3. ¿Tener un SOC reduce el tiempo de detección? ¿Cuánto?
4. ¿Qué tipo de ataque causa mayores pérdidas? ¿Cómo cambian las pérdidas con el tamaño de la empresa?
5. ¿La capacitación se asocia con menos incidentes de phishing?

## Ideas de visualización

- **Univariadas:** barras de `tipo_ataque`; histograma de `horas_deteccion` y de `perdida_estimada_millones_cop` (prueba la escala logarítmica).
- **Multivariadas:** barras apiladas de `tipo_ataque` por `anio`; cajas de `horas_deteccion` por `tiene_soc`; barras de `severidad` por `tiene_mfa`; mapa de calor de pérdida mediana por `sector` y `tamano_empresa`.
