# Diccionario de datos — Resultados tipo Saber 11 en Antioquia (2025)

**Archivo:** `educacion_saber11_antioquia_2025.csv` · **3.250 filas × 23 columnas** · datos sintéticos

## Contexto

La prueba Saber 11 evalúa a los estudiantes que terminan el bachillerato en cinco
áreas, cada una con puntaje de 0 a 100. El **puntaje global** (0 a 500) es un
promedio ponderado: matemáticas, lectura crítica, ciencias naturales y sociales
pesan 3 cada una, e inglés pesa 1. Cada fila es **un estudiante** que presentó la
prueba en 2025 en un municipio de Antioquia, con información de su colegio, su
hogar y sus hábitos de estudio.

**Decisión que apoya:** la secretaría de educación debe decidir a qué colegios,
jornadas o poblaciones dirigir programas de apoyo (conectividad, preicfes
gratuito, tutorías) para cerrar brechas de desempeño.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_estudiante` | texto | Identificador anónimo. |
| `municipio` | categórica | Municipio del colegio. |
| `zona` | categórica | `Urbana` o `Rural`. |
| `estrato` | entero (1-6) | Estrato socioeconómico de la vivienda. |
| `tipo_colegio` | categórica | `Oficial` o `Privado`. |
| `jornada` | categórica | `Mañana`, `Tarde`, `Única`, `Completa`, `Nocturna`, `Sabatina`. |
| `sexo` | categórica | `F` o `M`. |
| `edad` | entero (años) | Edad al presentar la prueba. |
| `educacion_madre` | categórica ordinal | Máximo nivel educativo de la madre. |
| `ingreso_familiar_smmlv` | numérica | Ingreso del hogar en salarios mínimos. |
| `acceso_internet` | categórica | `Sí` si tiene internet en casa. |
| `computador_hogar` | categórica | `Sí` si tiene computador en casa. |
| `trabaja` | categórica | `Sí` si trabaja además de estudiar. |
| `horas_trabajo_semana` | numérica (horas) | Horas de trabajo por semana. **Vacío si no trabaja.** |
| `horas_estudio_semana` | numérica (horas) | Horas de estudio por fuera de clase a la semana. |
| `inasistencias_anio` | numérica (días) | Días que faltó al colegio en el año. |
| `preparacion_preicfes` | categórica | `Sí` si tomó curso preicfes. |
| `puntaje_matematicas` | numérica (0-100) | Puntaje en matemáticas. |
| `puntaje_lectura_critica` | numérica (0-100) | Puntaje en lectura crítica. |
| `puntaje_ciencias_naturales` | numérica (0-100) | Puntaje en ciencias naturales. |
| `puntaje_sociales_ciudadanas` | numérica (0-100) | Puntaje en sociales y ciudadanas. |
| `puntaje_ingles` | numérica (0-100) | Puntaje en inglés. |
| `puntaje_global` | entero (0-500) | Puntaje global ponderado. |

## Preguntas guía

1. ¿Cómo cambia el puntaje global según el estrato, la zona y el tipo de colegio?
2. ¿Tener internet o computador en casa se asocia con mejores resultados?
3. ¿Los estudiantes que trabajan obtienen puntajes más bajos? ¿Depende de cuántas horas trabajan?
4. ¿Qué tan relacionados están los puntajes de las distintas áreas entre sí?
5. ¿Qué jornadas necesitan más apoyo? ¿Quiénes estudian en ellas?

## Ideas de visualización

- **Univariadas:** histograma de `puntaje_global`; barras de estudiantes por `estrato` o `jornada`.
- **Multivariadas:** cajas de `puntaje_global` por `estrato`, `tipo_colegio` o `jornada`; dispersión `horas_estudio_semana` vs `puntaje_global`; mapa de calor de correlaciones entre los cinco puntajes; barras agrupadas por `zona` y `acceso_internet`.
