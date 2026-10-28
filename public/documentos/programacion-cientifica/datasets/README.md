# Datasets del proyecto integrador — Programación Científica

Seis conjuntos de datos para el proyecto integrador (semanas 12-16). Elige **uno**
y construye sobre él todo el proyecto: carga e inspección, limpieza, filtrado y
agregación con pandas, y el portafolio de visualizaciones con Matplotlib y Seaborn.

> ⚠️ **Son datos sintéticos.** Se generaron por computador para este curso,
> inspirados en fenómenos reales de Colombia y del Valle de Aburrá. Los nombres
> de municipios y comunas son reales, pero las cifras **no** lo son: sirven para
> practicar análisis, no para sacar conclusiones sobre la realidad.

| Campo | Archivo | Filas × columnas | Pregunta de decisión |
|-------|---------|------------------|----------------------|
| Salud pública | `salud_dengue_antioquia_2025.csv` | 2.859 × 18 | ¿Dónde y cuándo reforzar la prevención del dengue, y qué pacientes necesitan atención prioritaria? |
| Seguridad | `seguridad_incidentes_medellin_2025.csv` | 4.505 × 19 | ¿En qué comunas, horarios y condiciones concentrar patrullaje, iluminación y cámaras? |
| Logística | `logistica_entregas_valle_aburra_2025.csv` | 4.100 × 21 | ¿Qué causa los retrasos en las entregas y qué operador, vehículo o franja conviene? |
| Ciberseguridad | `ciberseguridad_incidentes_colombia_2023_2025.csv` | 1.850 × 21 | ¿Qué controles (MFA, capacitación, SOC) reducen más el impacto de los ciberataques? |
| Ambiental | `ambiental_calidad_aire_valle_aburra_2025.csv` | 2.920 × 15 | ¿Cuándo y dónde declarar alertas por calidad del aire y qué condiciones las anticipan? |
| Educación | `educacion_saber11_antioquia_2025.csv` | 3.250 × 23 | ¿Qué factores se asocian al desempeño en las pruebas y dónde enfocar apoyos? |

Cada dataset tiene su **diccionario de datos** (`<nombre>.md`) con el contexto, la
descripción de cada columna y preguntas guía.

## Cómo cargarlo en Colab

Los archivos están en el Google Drive del curso y en nod0 (con sesión iniciada).
Descárgalo, súbelo a la carpeta `proyecto/data/` de tu repositorio y léelo así:

```python
import pandas as pd

df = pd.read_csv("data/salud_dengue_antioquia_2025.csv")
```

Todos los archivos son CSV separados por comas y codificados en UTF-8: no
necesitas `sep` ni `encoding`.

## Lo que encontrarás (y tendrás que resolver)

Ningún dataset viene limpio, como pasa con los datos reales. En todos vas a
encontrar:

- **Datos faltantes** en varias columnas, con cantidades muy distintas: algunas
  columnas tienen pocos huecos (¿imputar con la mediana, con la moda, por grupo?)
  y otras tienen tantos que conviene pensar si vale la pena conservarlas.
- **Faltantes que significan "no aplica"**: una celda vacía no siempre es un dato
  perdido. Lee el diccionario antes de imputar.
- **Valores sospechosos**: atípicos, códigos raros o errores de digitación que
  debes detectar, señalar y decidir qué hacer con ellos.
- **Columnas categóricas y numéricas** suficientes para gráficas univariadas
  (histogramas, barras, cajas) y multivariadas (dispersión, cajas por grupo,
  líneas en el tiempo, mapas de calor).

Anota cada decisión de limpieza en `docs/bitacora.md`: qué columna, cuántas filas
afectó y por qué.
