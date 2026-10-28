# Notas del docente — Datasets del proyecto integrador

> **Privado.** No se publica ni se comparte con estudiantes: describe los
> patrones y los problemas de calidad que se plantaron a propósito.

- **Archivos publicados:** `public/documentos/programacion-cientifica/datasets/`
  (6 CSV + un diccionario `.md` por dataset + `README.md`).
- **Generador:** `generar_datasets.py` (esta carpeta). Determinista (semilla
  `2026`): volver a correrlo produce los mismos archivos byte a byte.
  ```bash
  python3 content/cursos/programacion-cientifica/microdiseno/datasets/generar_datasets.py \
    public/documentos/programacion-cientifica/datasets
  ```
- **Todos son sintéticos.** Lugares reales, cifras inventadas. Los diccionarios
  lo advierten.
- **Acceso desde Colab:** el middleware de nod0 exige sesión en toda ruta, así
  que `pd.read_csv("https://www.nod0.dev/documentos/...")` desde Colab recibe la
  página de login, no el CSV. El estudiante debe descargarlo con sesión iniciada
  (o desde Drive) y subirlo a `proyecto/data/`.

## Problemas de calidad comunes a los seis

Cada dataset trae, por diseño, los cuatro tipos de decisión que se trabajan en
la semana 13:

| Tipo | Decisión esperada |
|------|-------------------|
| Columna con pocos faltantes (3-15 %) | Imputar (mediana / moda / mediana por grupo) o `dropna(subset=...)`, midiendo el costo |
| Columna con muchos faltantes (55-92 %) | Eliminar la columna, o justificar por qué se conserva |
| Faltante estructural ("no aplica") | **No imputar**: se deja vacío, se rellena con 0 o se filtra según la pregunta |
| Atípicos imposibles / centinelas | Detectar con `describe`/cajas, señalar y decidir (convertir a `NaN`, excluir) |

## 1. Salud — `salud_dengue_antioquia_2025.csv` (2.859 × 18)

**Patrones plantados**
- Los casos siguen a la lluvia con ~4 semanas de rezago: picos en may-jun
  (sem. 19-24) y oct-nov. Mayo es el mes con más casos (429).
- Municipios cálidos (Apartadó, Turbo, Caucasia, Puerto Berrío) concentran casos;
  Rionegro (18 °C) casi no tiene (3). Medellín tiene muchos por población.
- Mayor demora en consultar → más casos con signos de alarma/graves. La demora
  es mayor en zona rural y en `No asegurado`.
- Edades extremas (<5 y >65) → más gravedad. Letalidad: ~8 % en dengue grave,
  ~0 en el resto.
- Plaquetas por clasificación: mediana 144 (sin signos), 80 (con signos), 33 (grave).

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `ocupacion` | 68 % | Candidata a eliminar |
| `dias_hospitalizacion` | 79 % | **Estructural**: vacío = no hospitalizado |
| `plaquetas_miles` | 15 % | **No aleatorio**: 28 % en rural vs 10 % urbano. La mejor imputación es la mediana **por clasificación** (la mediana global le asigna ~130 a un dengue grave) |
| `regimen_salud` | 6 % | Moda o categoría "No reporta" |
| `dias_sintomas_a_consulta` | 5 % | Mediana |
| `precipitacion_semana_mm` | 4 % | Mediana por municipio |
| `edad` | 3 % | Mediana |

Atípicos: 3 edades imposibles (120, 135, 150) y 4 demoras de 30-60 días.

## 2. Seguridad — `seguridad_incidentes_medellin_2025.csv` (4.505 × 19)

**Patrones plantados**
- La Candelaria concentra incidentes; El Poblado y Laureles, hurto de celular con
  mayor valor perdido.
- Hurtos: pico 18-20 h. Riñas, VIF y lesiones: ~65 % de noche (19-4 h) y más
  en fin de semana (sábado y domingo son los días con más incidentes).
- Diciembre es el mes con más incidentes (509).
- Iluminación deficiente → más arma de fuego (14 % vs 8 % con buena).
- Tiempo de respuesta: comunas periféricas (Popular, Santa Cruz, Manrique,
  Villa Hermosa, San Javier, Doce de Octubre) ~30-35 min de mediana vs ~18 en el
  resto; más largo de noche.
- Más cámaras y mayor valor perdido → más denuncia.

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `testigos` | 72 % | Candidata a eliminar |
| `bien_hurtado`, `valor_perdido_cop` | 33 % | **Estructural**: vacío = no es hurto |
| `tiempo_respuesta_min` | 12 % | **No aleatorio**: falta más de noche. Mediana por comuna |
| `edad_victima` | 9 % | Mediana |
| `iluminacion_zona` | 5 % | Moda o "No reporta" |
| `arma` | 314 filas `"Sin dato"` | **Centinela textual**: debe convertirse a `NaN`; no es una categoría |

Además: **25 filas duplicadas exactas** (mismo `id_incidente`) e
**inconsistencias de texto en `comuna`** (~2 %: minúsculas, mayúsculas, espacios,
sin tilde) → `value_counts` muestra 52 comunas en vez de 16. Ninguna de las dos
se vio en la semana 13 (`duplicated`, `str.strip().str.title()`): es el reto del
dataset; conviene darles la pista en asesoría. 4 valores perdidos imposibles
(85-150 millones).

## 3. Logística — `logistica_entregas_valle_aburra_2025.csv` (4.100 × 21)

**Patrones plantados**
- Lluvia: +30 min de retraso medio aprox.; afecta más a moto y bicicleta.
- Operador D: el peor (retraso medio 34 vs ~20, calificación 2,8 vs ~3,5, más fallos).
- Volumen: sep 814 → dic 1.315 pedidos; la semana de Black Friday (24-30 nov)
  y la segunda quincena de diciembre tienen más retraso.
- Vehículo según carga: >20 kg camión, >8 kg van, distancias cortas bicicleta.
- `costo_envio_cop` ~ distancia + peso (r ≈ 0,6 con distancia).
- Retraso → menor calificación (r ≈ −0,6 con el tiempo real).

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `motivo_no_entrega` | 92 % | **Estructural**: solo aplica a Fallido/Devuelto |
| `propina_cop` | 77 % | Candidata a eliminar (y ojo: 0 ≠ vacío) |
| `calificacion_cliente` | 27 % | **No aleatorio**: quien recibe a tiempo califica menos (39 % faltante vs 18 % con retraso). Imputar sesga el promedio hacia abajo: mejor analizarla sin imputar y decirlo |
| `tiempo_real_min`, `retraso_min` | 5 % | **Estructural**: entregas fallidas |
| `peso_kg` | 6 % | Mediana por `categoria_producto` |
| `canal_compra` | 5 % | Moda |
| `distancia_km` | 3 % | Mediana por municipio |

Atípicos: 3 distancias imposibles (0, 250, 480 km) y 3 pesos (350, 999 kg).

## 4. Ciberseguridad — `ciberseguridad_incidentes_colombia_2023_2025.csv` (1.850 × 21)

**Patrones plantados**
- Ransomware crece cada año (17 % → 22 % → 27 % de los incidentes).
- MFA: credenciales robadas 5 % vs 14 % sin MFA; severidad crítica 9 % vs 26 %.
- Capacitación: phishing 20 % vs 29 %.
- SOC: mediana de detección 11 h vs 70 h.
- Pérdidas: muy asimétricas (lognormal) → ideal para enseñar escala logarítmica
  y mediana vs media. Ransomware tiene la mayor pérdida mediana; crece con el
  tamaño de la empresa.
- Financiero y Gobierno: más DDoS; Salud: más ransomware.

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `pago_rescate_millones_cop` | 92 % | **Estructural** (solo ransomware pagado, 35 % de los ransomware). Eliminar o analizar solo ese subconjunto |
| `registros_expuestos` | 34 % | Mezcla de faltante real y ceros: no imputar con la mediana global |
| `perdida_estimada_millones_cop` | 16 % | **No aleatorio**: 30 % en micro y 25 % en pequeñas vs 5-7 % en medianas/grandes. Mediana **por tamaño** (la global sobreestima la pérdida de las micro) |
| `presupuesto_ti_pct` | 15 % | Mediana por tamaño |
| `horas_contencion` | 9 % | Mediana |
| `capacitacion_ultimo_anio` | 5 % | Moda o "No reporta" |

Atípicos: 3 tiempos de detección de 1 año o más (8.760 y 12.000 h).

## 5. Ambiental — `ambiental_calidad_aire_valle_aburra_2025.csv` (2.920 × 15)

**Patrones plantados**
- Temporadas de contingencia: pico en marzo (PM2.5 medio 24,7) y segundo pico
  oct-nov (~20); mínimos en may-sep (~15).
- Fin de semana más limpio (domingo ~25 % menos) → la fuente es el tráfico.
- Tipo de estación: Tráfico e Industrial ~22, Residencial ~17, Fondo ~10.
- Lluvia y viento bajan el PM2.5 (correlación negativa moderada).
- `pm10` ≈ 1,75 × `pm25` (r = 0,98 sin atípicos; ~0,4 con ellos → buen ejemplo
  de cómo un atípico arruina una correlación).

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `no2` | 62,5 % | **Estructural**: solo 3 estaciones (MED-CENTRO, BEL-NORTE, ITA-INDUSTRIAL) tienen sensor. Eliminar o analizar solo esas |
| `o3` | 37,5 % | **Estructural**: 5 estaciones con sensor |
| `pm25`, `categoria_ica_pm25` | 7 % | **Bloques consecutivos** de 3-13 días por falla de sensor → mejor `interpolate()`/`ffill` por estación que la mediana global (no visto en clase: reto) |
| `pm10` | 9,5 % | Bloques + 3 % aleatorio |
| `humedad_relativa` | 7 % | |
| `temperatura_c` | 3 % | |
| `precipitacion_mm` | 3 % | |

Centinelas y atípicos: **18 `pm25 = -999`** y **10 `temperatura_c = -999`**
(código de falla del equipo → `NaN`), y 3 `pm25` imposibles (480, 612). En
esas 21 filas de `pm25` la `categoria_ica_pm25` **sí** tiene el valor real: el
estudiante atento lo nota como inconsistencia.

## 6. Educación — `educacion_saber11_antioquia_2025.csv` (3.250 × 23)

**Patrones plantados**
- Gradiente fuerte por estrato: global medio 232 (E1) → 393 (E6). Pocos
  estudiantes en E5-E6 (57 y 39): buena discusión sobre grupos pequeños.
- Privado 306 vs oficial 252; urbana 269 vs rural 228; internet 281 vs 245.
- Trabajar: 232 vs 272. Jornadas Nocturna/Sabatina: las más bajas, estudiantes
  adultos (18-45 años) — la edad alta ahí **no** es error.
- Educación de la madre: 223 (primaria incompleta) → 344 (posgrado).
- Puntajes entre áreas muy correlacionados (r ≈ 0,7): mapa de calor claro.
- Diferencias leves por sexo (M +1 en matemáticas, F +0,6 en lectura): útil para
  discutir diferencias pequeñas vs relevantes.
- `puntaje_global` usa la fórmula real del ICFES: `5 × (3·(mat+lec+cie+soc) + ing) / 13`.

**Calidad**
| Columna | Faltantes | Nota |
|---------|-----------|------|
| `horas_trabajo_semana` | 77 % | **Estructural**: vacío = no trabaja (rellenar con 0 es legítimo) |
| `ingreso_familiar_smmlv` | 57 % | Candidata a eliminar (el estrato ya captura lo socioeconómico) |
| `educacion_madre` | 11 % | **No aleatorio**: 18 % rural vs 9 % urbano. Moda o "No reporta" |
| `horas_estudio_semana` | 8 % | Mediana |
| `inasistencias_anio` | 7 % | Mediana |
| `puntaje_ingles` | 4 % | El global se calculó con el valor real: se puede reconstruir aproximadamente despejando de la fórmula (±2 puntos por el redondeo; reto) |
| `acceso_internet` | 3 % | Moda |

Atípicos: 4 valores imposibles de `horas_estudio_semana` (90, 120, 168).
