"""Generate the six synthetic datasets for the programacion-cientifica final project.

Every dataset is synthetic: the patterns are planted on purpose (see
notas-docente.md) and the data must not be used to draw real conclusions.

Usage:
    python3 generar_datasets.py <output_dir>
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd

SEED = 2026


def add_nan(df, col, p, rng, weight=None):
    """Blank out `col` with probability p (optionally scaled per row by `weight`)."""
    prob = np.full(len(df), p) if weight is None else np.clip(p * np.asarray(weight, dtype=float), 0, 1)
    mask = rng.random(len(df)) < prob
    df.loc[mask, col] = np.nan
    return df


def plant(df, col, n, values, rng):
    """Overwrite n random rows of `col` with values drawn from `values` (outliers, typos, sentinels)."""
    idx = rng.choice(df.index[df[col].notna()], size=n, replace=False)
    df.loc[idx, col] = rng.choice(values, size=n)
    return df


def pick(rng, options, probs, size):
    probs = np.asarray(probs, dtype=float)
    return rng.choice(options, size=size, p=probs / probs.sum())


DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]


# --------------------------------------------------------------------------
# 1. Salud pública — casos de dengue notificados en Antioquia (2025)
# --------------------------------------------------------------------------
def dengue(rng):
    # municipio: (subregión, peso poblacional, temp media °C, % rural)
    municipios = {
        "Medellín": ("Valle de Aburrá", 6.0, 23.5, 0.05),
        "Bello": ("Valle de Aburrá", 1.6, 23.0, 0.07),
        "Itagüí": ("Valle de Aburrá", 1.0, 23.0, 0.04),
        "Envigado": ("Valle de Aburrá", 0.8, 22.0, 0.08),
        "Apartadó": ("Urabá", 2.2, 28.0, 0.30),
        "Turbo": ("Urabá", 1.8, 28.0, 0.55),
        "Caucasia": ("Bajo Cauca", 1.6, 28.5, 0.35),
        "Puerto Berrío": ("Magdalena Medio", 1.0, 28.5, 0.30),
        "Rionegro": ("Oriente", 0.4, 18.0, 0.35),
        "Santa Fe de Antioquia": ("Occidente", 0.7, 27.0, 0.40),
    }
    weeks = np.arange(1, 53)
    # régimen bimodal de lluvias: abril-mayo y octubre-noviembre
    rain_season = 40 + 45 * np.exp(-((weeks - 17) ** 2) / 30) + 55 * np.exp(-((weeks - 43) ** 2) / 30)

    rows = []
    weekly = []
    for mun, (sub, pop, temp, rural) in municipios.items():
        rain = np.clip(rain_season * rng.normal(1, 0.25, 52) + rng.normal(0, 8, 52), 0, None)
        temps = temp + 0.8 * np.sin((weeks - 10) / 52 * 2 * np.pi) + rng.normal(0, 0.6, 52)
        lagged = np.concatenate([np.full(4, rain[:4].mean()), rain[:-4]])  # transmisión ~4 semanas después de la lluvia
        temp_factor = np.clip((temps - 17) / 10, 0.05, None) ** 2
        lam = pop * temp_factor * (lagged / 60) * 4.6
        counts = rng.poisson(lam)
        for w in range(52):
            weekly.append((mun, w + 1, round(temps[w], 1), round(rain[w], 1)))
            rows += [(mun, sub, rural, w + 1)] * counts[w]

    clima = pd.DataFrame(weekly, columns=["municipio", "semana_epidemiologica", "temperatura_media_semana", "precipitacion_semana_mm"])
    df = pd.DataFrame(rows, columns=["municipio", "subregion", "p_rural", "semana_epidemiologica"])
    n = len(df)

    start = pd.Timestamp("2024-12-29")  # semana epidemiológica 1 de 2025
    df["fecha_notificacion"] = start + pd.to_timedelta((df["semana_epidemiologica"] - 1) * 7 + rng.integers(0, 7, n), unit="D")
    df["zona"] = np.where(rng.random(n) < df["p_rural"], "Rural", "Urbana")
    df["sexo"] = pick(rng, ["F", "M"], [0.51, 0.49], n)
    edad = np.where(rng.random(n) < 0.3, rng.integers(0, 15, n), rng.gamma(4, 9, n) + 10)
    df["edad"] = np.clip(edad, 0, 92).round().astype(int)

    rural = df["zona"] == "Rural"
    reg = np.where(rural, "r", "u")
    df["regimen_salud"] = [
        pick(rng, ["Subsidiado", "Contributivo", "Especial", "No asegurado"],
             [0.70, 0.18, 0.02, 0.10] if r == "r" else [0.42, 0.50, 0.04, 0.04], 1)[0]
        for r in reg
    ]
    ocupaciones = ["Estudiante", "Hogar", "Agricultor", "Comerciante", "Empleado", "Independiente", "Desempleado", "Menor de edad"]
    df["ocupacion"] = pick(rng, ocupaciones, [18, 15, 10, 12, 20, 12, 5, 8], n)

    delay = rng.poisson(2.2 + 1.6 * rural + 1.5 * (df["regimen_salud"] == "No asegurado"), n) + 1
    df["dias_sintomas_a_consulta"] = delay

    risk = -2.3 + 0.35 * (delay - 3) + 0.9 * ((df["edad"] < 5) | (df["edad"] > 65)) + 0.4 * rural
    p_alarma = 1 / (1 + np.exp(-risk))
    p_grave = p_alarma * 0.18
    u = rng.random(n)
    df["clasificacion"] = np.select(
        [u < p_grave, u < p_alarma],
        ["Dengue grave", "Dengue con signos de alarma"],
        "Dengue sin signos de alarma",
    )
    mu = df["clasificacion"].map({"Dengue sin signos de alarma": 145, "Dengue con signos de alarma": 82, "Dengue grave": 34})
    sd = df["clasificacion"].map({"Dengue sin signos de alarma": 38, "Dengue con signos de alarma": 24, "Dengue grave": 14})
    df["plaquetas_miles"] = np.clip(rng.normal(mu, sd), 4, 420).round()

    p_hosp = df["clasificacion"].map({"Dengue sin signos de alarma": 0.08, "Dengue con signos de alarma": 0.72, "Dengue grave": 1.0})
    hosp = rng.random(n) < p_hosp
    df["hospitalizado"] = np.where(hosp, "Sí", "No")
    stay_mu = df["clasificacion"].map({"Dengue sin signos de alarma": 2, "Dengue con signos de alarma": 3.5, "Dengue grave": 7})
    df["dias_hospitalizacion"] = np.where(hosp, np.clip(rng.poisson(stay_mu), 1, None), np.nan)

    p_muerte = np.where(df["clasificacion"] == "Dengue grave", 0.05 + 0.10 * (df["edad"] > 65) + 0.04 * rural, 0.0003)
    df["condicion_final"] = np.where(rng.random(n) < p_muerte, "Fallecido", "Vivo")

    df = df.merge(clima, on=["municipio", "semana_epidemiologica"], how="left")
    df = df.sort_values("fecha_notificacion").reset_index(drop=True)
    df.insert(0, "id_caso", [f"DEN-{i:05d}" for i in range(1, len(df) + 1)])
    df["fecha_notificacion"] = df["fecha_notificacion"].dt.strftime("%Y-%m-%d")

    add_nan(df, "edad", 0.03, rng)
    add_nan(df, "plaquetas_miles", 0.10, rng, weight=np.where(df["zona"] == "Rural", 2.6, 1.0))
    add_nan(df, "regimen_salud", 0.06, rng)
    add_nan(df, "dias_sintomas_a_consulta", 0.05, rng)
    add_nan(df, "ocupacion", 0.68, rng)
    add_nan(df, "precipitacion_semana_mm", 0.04, rng)
    plant(df, "edad", 3, [120, 135, 150], rng)
    plant(df, "dias_sintomas_a_consulta", 4, [30, 45, 60], rng)

    cols = ["id_caso", "fecha_notificacion", "semana_epidemiologica", "municipio", "subregion", "zona", "sexo", "edad",
            "regimen_salud", "ocupacion", "dias_sintomas_a_consulta", "clasificacion", "plaquetas_miles", "hospitalizado",
            "dias_hospitalizacion", "condicion_final", "temperatura_media_semana", "precipitacion_semana_mm"]
    return df[cols]


# --------------------------------------------------------------------------
# 2. Seguridad — incidentes reportados en las comunas de Medellín (2025)
# --------------------------------------------------------------------------
def seguridad(rng):
    # comuna: (peso, periférica, % zonas con iluminación deficiente)
    comunas = {
        "Popular": (5, True, 0.40), "Santa Cruz": (4, True, 0.35), "Manrique": (6, True, 0.35),
        "Aranjuez": (6, False, 0.25), "Castilla": (6, False, 0.20), "Doce de Octubre": (5, True, 0.30),
        "Robledo": (7, False, 0.25), "Villa Hermosa": (5, True, 0.35), "Buenos Aires": (6, False, 0.25),
        "La Candelaria": (18, False, 0.15), "Laureles Estadio": (9, False, 0.08), "La América": (6, False, 0.10),
        "San Javier": (6, True, 0.35), "El Poblado": (11, False, 0.06), "Guayabal": (5, False, 0.15),
        "Belén": (8, False, 0.12),
    }
    n = 4480
    names = list(comunas)
    df = pd.DataFrame({"comuna": pick(rng, names, [comunas[c][0] for c in names], n)})
    periferica = df["comuna"].map(lambda c: comunas[c][1])
    central = df["comuna"].isin(["La Candelaria", "El Poblado", "Laureles Estadio"])

    tipos = ["Hurto a persona", "Hurto de celular", "Hurto de moto", "Riña", "Violencia intrafamiliar", "Lesiones personales"]
    base = np.array([30, 26, 10, 14, 12, 8], dtype=float)
    tipo = []
    for c, per in zip(central, periferica):
        w = base.copy()
        if c:
            w *= [1.6, 1.9, 0.7, 0.8, 0.4, 0.7]
        if per:
            w *= [0.7, 0.6, 1.1, 1.3, 1.9, 1.4]
        tipo.append(pick(rng, tipos, w, 1)[0])
    df["tipo_incidente"] = tipo

    days = pd.date_range("2025-01-01", "2025-12-31", freq="D")
    day_w = np.ones(len(days))
    day_w[days.month == 12] *= 1.35
    day_w[days.dayofweek >= 5] *= 1.15
    df["fecha"] = rng.choice(days, size=n, p=day_w / day_w.sum())
    weekend = df["fecha"].dt.dayofweek >= 4
    vif_or_rina = df["tipo_incidente"].isin(["Riña", "Violencia intrafamiliar"])
    df.loc[vif_or_rina & ~weekend & (rng.random(n) < 0.35), "fecha"] += pd.to_timedelta(
        (5 - df.loc[vif_or_rina & ~weekend, "fecha"].dt.dayofweek).clip(lower=0), unit="D")
    df.loc[df["fecha"] > "2025-12-31", "fecha"] -= pd.Timedelta(days=7)

    hour_hurto = np.array([2, 1, 1, 1, 1, 2, 4, 6, 6, 5, 5, 6, 7, 6, 6, 7, 8, 9, 11, 11, 9, 6, 4, 3], float)
    hour_noche = np.array([8, 7, 6, 4, 2, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 5, 6, 8, 9, 10, 10, 9], float)
    df["hora"] = [
        rng.choice(24, p=(hour_noche if t in ("Riña", "Violencia intrafamiliar", "Lesiones personales") else hour_hurto)
                   / (hour_noche if t in ("Riña", "Violencia intrafamiliar", "Lesiones personales") else hour_hurto).sum())
        for t in df["tipo_incidente"]
    ]
    df["dia_semana"] = df["fecha"].dt.dayofweek.map(dict(enumerate(DIAS)))
    df["mes"] = df["fecha"].dt.month

    noche = (df["hora"] >= 19) | (df["hora"] <= 4)
    p_def = df["comuna"].map(lambda c: comunas[c][2])
    df["iluminacion_zona"] = np.select(
        [rng.random(n) < p_def * np.where(noche, 1.5, 0.8), rng.random(n) < 0.35], ["Deficiente", "Regular"], "Buena")

    modalidades = {
        "Hurto a persona": (["Atraco", "Raponazo", "Cosquilleo", "Engaño"], [45, 25, 20, 10]),
        "Hurto de celular": (["Atraco", "Raponazo", "Cosquilleo"], [40, 35, 25]),
        "Hurto de moto": (["Atraco", "Halado", "Llave maestra"], [35, 45, 20]),
        "Riña": (["Agresión física"], [1]),
        "Violencia intrafamiliar": (["Agresión física", "Agresión verbal", "Amenaza"], [55, 25, 20]),
        "Lesiones personales": (["Agresión física", "Accidente provocado"], [85, 15]),
    }
    df["modalidad"] = [pick(rng, *modalidades[t], 1)[0] for t in df["tipo_incidente"]]

    p_fuego = 0.06 + 0.10 * (df["iluminacion_zona"] == "Deficiente") + 0.06 * noche + 0.10 * (df["tipo_incidente"] == "Hurto de moto")
    p_blanca = 0.18 + 0.12 * (df["tipo_incidente"].isin(["Riña", "Lesiones personales"]))
    p_cont = 0.08
    u = rng.random(n)
    df["arma"] = np.select([u < p_fuego, u < p_fuego + p_blanca, u < p_fuego + p_blanca + p_cont],
                           ["Arma de fuego", "Arma blanca", "Contundente"], "Sin arma")
    df.loc[df["modalidad"].isin(["Cosquilleo", "Engaño", "Llave maestra", "Agresión verbal"]), "arma"] = "Sin arma"

    lugares = {
        "Hurto a persona": (["Vía pública", "Transporte público", "Establecimiento comercial"], [65, 20, 15]),
        "Hurto de celular": (["Vía pública", "Transporte público", "Establecimiento comercial"], [55, 30, 15]),
        "Hurto de moto": (["Vía pública", "Parqueadero"], [75, 25]),
        "Riña": (["Vía pública", "Establecimiento comercial"], [60, 40]),
        "Violencia intrafamiliar": (["Vivienda"], [1]),
        "Lesiones personales": (["Vía pública", "Vivienda", "Establecimiento comercial"], [55, 25, 20]),
    }
    df["lugar"] = [pick(rng, *lugares[t], 1)[0] for t in df["tipo_incidente"]]

    vif = df["tipo_incidente"] == "Violencia intrafamiliar"
    df["sexo_victima"] = np.where(vif, pick(rng, ["F", "M"], [0.78, 0.22], n), pick(rng, ["F", "M"], [0.44, 0.56], n))
    df["edad_victima"] = np.clip(rng.normal(np.where(vif, 34, 31), 11, n), 12, 85).round()

    hurto = df["tipo_incidente"].str.startswith("Hurto")
    bien = np.where(df["tipo_incidente"] == "Hurto de celular", "Celular",
                    np.where(df["tipo_incidente"] == "Hurto de moto", "Motocicleta",
                             pick(rng, ["Dinero", "Bolso o maletín", "Joyas", "Bicicleta", "Computador"], [35, 25, 15, 15, 10], n)))
    df["bien_hurtado"] = pd.Series(bien).where(hurto)
    valor_mu = pd.Series(bien).map({"Celular": 1.4e6, "Motocicleta": 7.5e6, "Dinero": 2.5e5, "Bolso o maletín": 6e5,
                                    "Joyas": 1.2e6, "Bicicleta": 1.8e6, "Computador": 3.2e6}).to_numpy()
    valor = (valor_mu * rng.lognormal(0, 0.55, n) * np.where(central, 1.35, 1.0)).round(-3)
    df["valor_perdido_cop"] = np.where(hurto, valor, np.nan)

    df["camaras_cercanas"] = rng.poisson(np.where(central, 4.5, np.where(periferica, 0.8, 2.0)))
    resp = rng.gamma(4, np.where(periferica, 7.5, 4.5)) * np.where(noche, 1.35, 1.0)
    df["tiempo_respuesta_min"] = np.clip(resp, 3, None).round()
    p_den = 0.30 + 0.25 * hurto * (df["valor_perdido_cop"].fillna(0) > 2e6) + 0.04 * df["camaras_cercanas"] + 0.15 * vif
    df["denunciado"] = np.where(rng.random(n) < np.clip(p_den, 0, 0.95), "Sí", "No")
    df["testigos"] = rng.poisson(1.2, n).astype(float)

    df = df.sort_values(["fecha", "hora"]).reset_index(drop=True)
    df.insert(0, "id_incidente", [f"INC-{i:05d}" for i in range(1, n + 1)])
    df["fecha"] = df["fecha"].dt.strftime("%Y-%m-%d")

    add_nan(df, "edad_victima", 0.09, rng)
    add_nan(df, "tiempo_respuesta_min", 0.08, rng, weight=np.where(noche, 2.2, 1.0))
    add_nan(df, "testigos", 0.72, rng)
    add_nan(df, "iluminacion_zona", 0.05, rng)
    df.loc[rng.random(n) < 0.07, "arma"] = "Sin dato"  # centinela textual: debe convertirse a nulo
    plant(df, "valor_perdido_cop", 4, [85_000_000, 120_000_000, 150_000_000], rng)
    # inconsistencias de escritura en ~2 % de las comunas
    messy = rng.random(n) < 0.02
    df.loc[messy, "comuna"] = df.loc[messy, "comuna"].map(
        lambda c: rng.choice([c.lower(), c.upper(), f" {c} ", c.replace("é", "e").replace("ó", "o")]))
    dups = df.sample(25, random_state=SEED)
    df = pd.concat([df, dups]).sort_values("id_incidente").reset_index(drop=True)

    cols = ["id_incidente", "fecha", "hora", "dia_semana", "mes", "comuna", "tipo_incidente", "modalidad", "arma", "lugar",
            "iluminacion_zona", "camaras_cercanas", "sexo_victima", "edad_victima", "bien_hurtado", "valor_perdido_cop",
            "tiempo_respuesta_min", "denunciado", "testigos"]
    return df[cols]


# --------------------------------------------------------------------------
# 3. Logística — entregas de última milla en el Valle de Aburrá (sep-dic 2025)
# --------------------------------------------------------------------------
def logistica(rng):
    municipios = {"Medellín": (40, 6), "Envigado": (9, 9), "Itagüí": (9, 10), "Sabaneta": (6, 13), "Bello": (12, 11),
                  "La Estrella": (4, 15), "Caldas": (3, 22), "Copacabana": (4, 17), "Girardota": (3, 24), "Barbosa": (2, 38)}
    days = pd.date_range("2025-09-01", "2025-12-31", freq="D")
    w = np.ones(len(days))
    w[(days >= "2025-11-24") & (days <= "2025-11-30")] *= 2.6  # semana de Black Friday
    w[days.month == 12] *= 1.6
    w[days.dayofweek == 6] *= 0.4
    n = 4100
    df = pd.DataFrame({"fecha": rng.choice(days, size=n, p=w / w.sum())})
    df["dia_semana"] = df["fecha"].dt.dayofweek.map(dict(enumerate(DIAS)))
    names = list(municipios)
    df["municipio_destino"] = pick(rng, names, [municipios[m][0] for m in names], n)
    df["franja_horaria"] = pick(rng, ["Mañana", "Tarde", "Noche"], [40, 42, 18], n)
    df["canal_compra"] = pick(rng, ["App", "Web", "WhatsApp", "Teléfono"], [45, 30, 18, 7], n)
    df["categoria_producto"] = pick(rng, ["Alimentos", "Farmacia", "Ropa", "Electrónica", "Hogar"], [30, 15, 22, 15, 18], n)

    peso_mu = df["categoria_producto"].map({"Alimentos": 4.5, "Farmacia": 0.8, "Ropa": 1.5, "Electrónica": 3.5, "Hogar": 9})
    df["peso_kg"] = np.clip(peso_mu * rng.lognormal(0, 0.5, n), 0.1, 80).round(2)
    dist_mu = df["municipio_destino"].map(lambda m: municipios[m][1])
    df["distancia_km"] = np.clip(dist_mu * rng.lognormal(0, 0.35, n), 0.5, 70).round(1)

    vehiculo = np.select([df["peso_kg"] > 20, df["peso_kg"] > 8, (df["distancia_km"] < 5) & (rng.random(n) < 0.6)],
                         ["Camión pequeño", "Van", "Bicicleta eléctrica"], "Moto")
    df["tipo_vehiculo"] = vehiculo
    df["operador"] = pick(rng, ["Operador A", "Operador B", "Operador C", "Operador D"], [32, 28, 24, 16], n)
    df["paradas_en_ruta"] = rng.integers(3, 25, n)

    month_rain = df["fecha"].dt.month.map({9: 0.30, 10: 0.48, 11: 0.50, 12: 0.28})
    df["lluvia"] = np.where(rng.random(n) < month_rain * np.where(df["franja_horaria"] == "Tarde", 1.4, 0.8), "Sí", "No")

    speed = df["tipo_vehiculo"].map({"Moto": 24, "Bicicleta eléctrica": 15, "Van": 17, "Camión pequeño": 14})
    estimado = (df["distancia_km"] / speed * 60 + df["paradas_en_ruta"] * 2.5 + 10).round()
    df["tiempo_estimado_min"] = estimado
    rain = df["lluvia"] == "Sí"
    peak = (df["fecha"] >= "2025-11-24") & (df["fecha"] <= "2025-11-30") | (df["fecha"].dt.day >= 15) & (df["fecha"].dt.month == 12)
    factor = (1 + 0.28 * rain * np.where(df["tipo_vehiculo"].isin(["Moto", "Bicicleta eléctrica"]), 1.4, 1.0)
              + 0.22 * peak + 0.15 * (df["franja_horaria"] == "Tarde") * df["tipo_vehiculo"].isin(["Van", "Camión pequeño"])
              + df["operador"].map({"Operador A": 0.0, "Operador B": 0.05, "Operador C": 0.02, "Operador D": 0.22}))
    real = estimado * factor * rng.lognormal(0, 0.18, n)
    df["tiempo_real_min"] = real.round()
    retraso = df["tiempo_real_min"] - df["tiempo_estimado_min"]

    p_fallo = 0.03 + 0.04 * (df["franja_horaria"] == "Noche") + 0.03 * (df["operador"] == "Operador D") + 0.02 * rain
    u = rng.random(n)
    fallido = u < p_fallo
    devuelto = (~fallido) & (u < p_fallo + 0.025)
    df["estado_entrega"] = np.select([fallido, devuelto, retraso > 15], ["Fallido", "Devuelto", "Con retraso"], "A tiempo")
    motivo = np.where(
        fallido, pick(rng, ["Cliente ausente", "Dirección incorrecta", "Zona de difícil acceso", "Vehículo averiado"], [45, 25, 20, 10], n),
        pick(rng, ["Producto dañado", "Pedido equivocado", "Cliente rechazó"], [35, 35, 30], n))
    df["motivo_no_entrega"] = pd.Series(motivo).where(fallido | devuelto)
    df.loc[fallido, "tiempo_real_min"] = np.nan
    df["retraso_min"] = df["tiempo_real_min"] - df["tiempo_estimado_min"]

    df["costo_envio_cop"] = (4500 + 650 * df["distancia_km"] + 300 * df["peso_kg"]
                             + np.where(df["tipo_vehiculo"].isin(["Van", "Camión pequeño"]), 6000, 0)
                             + rng.normal(0, 900, n)).round(-2)
    score = 4.5 - 0.035 * df["retraso_min"].fillna(60).clip(lower=0) - 1.8 * (df["estado_entrega"] != "A tiempo") * (df["estado_entrega"] != "Con retraso") \
        - 0.3 * (df["operador"] == "Operador D") + rng.normal(0, 0.6, n)
    df["calificacion_cliente"] = np.clip(score.round(), 1, 5)
    df["propina_cop"] = np.where(rng.random(n) < 0.5, rng.choice([1000, 2000, 3000, 5000], n), 0).astype(float)

    df = df.sort_values("fecha").reset_index(drop=True)
    df.insert(0, "id_pedido", [f"PED-{i:05d}" for i in range(1, n + 1)])
    df["fecha"] = df["fecha"].dt.strftime("%Y-%m-%d")

    # quien recibe a tiempo califica menos: faltante no aleatorio
    add_nan(df, "calificacion_cliente", 0.25, rng, weight=np.where(df["estado_entrega"] == "A tiempo", 1.6, 0.7))
    add_nan(df, "peso_kg", 0.06, rng)
    add_nan(df, "distancia_km", 0.03, rng)
    add_nan(df, "canal_compra", 0.05, rng)
    add_nan(df, "propina_cop", 0.78, rng)
    plant(df, "distancia_km", 3, [0.0, 250.0, 480.0], rng)
    plant(df, "peso_kg", 3, [350.0, 999.0], rng)

    cols = ["id_pedido", "fecha", "dia_semana", "franja_horaria", "municipio_destino", "canal_compra", "categoria_producto",
            "peso_kg", "distancia_km", "tipo_vehiculo", "operador", "paradas_en_ruta", "lluvia", "tiempo_estimado_min",
            "tiempo_real_min", "retraso_min", "estado_entrega", "motivo_no_entrega", "costo_envio_cop",
            "calificacion_cliente", "propina_cop"]
    return df[cols]


# --------------------------------------------------------------------------
# 4. Ciberseguridad — incidentes reportados por organizaciones colombianas (2023-2025)
# --------------------------------------------------------------------------
def ciberseguridad(rng):
    n = 1850
    df = pd.DataFrame()
    days = pd.date_range("2023-01-01", "2025-12-31", freq="D")
    df["fecha_deteccion"] = rng.choice(days, size=n, p=np.linspace(0.7, 1.3, len(days)) / np.linspace(0.7, 1.3, len(days)).sum())
    df["anio"] = df["fecha_deteccion"].dt.year
    df["departamento"] = pick(rng, ["Bogotá D.C.", "Antioquia", "Valle del Cauca", "Atlántico", "Santander", "Risaralda"],
                              [34, 24, 14, 10, 10, 8], n)
    df["sector"] = pick(rng, ["Financiero", "Salud", "Educación", "Gobierno", "Comercio", "Manufactura"], [18, 16, 14, 16, 22, 14], n)
    size = pick(rng, ["Micro", "Pequeña", "Mediana", "Grande"], [18, 30, 30, 22], n)
    df["tamano_empresa"] = size
    emp_range = {"Micro": (2, 10), "Pequeña": (11, 50), "Mediana": (51, 200), "Grande": (201, 5000)}
    df["num_empleados"] = [int(np.exp(rng.uniform(np.log(emp_range[s][0]), np.log(emp_range[s][1])))) for s in size]

    big = pd.Series(size).map({"Micro": 0, "Pequeña": 1, "Mediana": 2, "Grande": 3}).to_numpy()
    fin = (df["sector"] == "Financiero").to_numpy()
    df["tiene_mfa"] = np.where(rng.random(n) < 0.12 + 0.2 * big + 0.25 * fin + 0.05 * (df["anio"] - 2023), "Sí", "No")
    df["capacitacion_ultimo_anio"] = np.where(rng.random(n) < 0.15 + 0.17 * big + 0.15 * fin, "Sí", "No")
    df["tiene_soc"] = np.where(rng.random(n) < np.array([0.02, 0.08, 0.30, 0.70])[big], "Sí", "No")
    df["presupuesto_ti_pct"] = np.clip(rng.normal(3 + 1.2 * big + 3 * fin, 1.5), 0.3, 20).round(1)

    mfa = df["tiene_mfa"] == "Sí"
    cap = df["capacitacion_ultimo_anio"] == "Sí"
    ataques = ["Phishing", "Ransomware", "Malware", "Acceso no autorizado", "Fuga de datos", "DDoS"]
    tipo = []
    for i in range(n):
        w = np.array([30, 12 + 6 * (df["anio"].iat[i] - 2023), 18, 16, 12, 6], dtype=float)
        if cap.iat[i]:
            w[0] *= 0.55
        if mfa.iat[i]:
            w[3] *= 0.45
        if df["sector"].iat[i] in ("Financiero", "Gobierno"):
            w[5] *= 2.5
        if df["sector"].iat[i] == "Salud":
            w[1] *= 1.6
        tipo.append(pick(rng, ataques, w, 1)[0])
    df["tipo_ataque"] = tipo

    vectores = {
        "Phishing": (["Correo electrónico", "Mensajería"], [80, 20]),
        "Ransomware": (["Correo electrónico", "Vulnerabilidad sin parche", "Credenciales robadas", "Dispositivo USB"], [40, 30, 20, 10]),
        "Malware": (["Correo electrónico", "Descarga web", "Dispositivo USB"], [45, 40, 15]),
        "Acceso no autorizado": (["Credenciales robadas", "Vulnerabilidad sin parche", "Proveedor tercero"], [55, 30, 15]),
        "Fuga de datos": (["Empleado interno", "Proveedor tercero", "Credenciales robadas", "Configuración en la nube"], [30, 25, 20, 25]),
        "DDoS": (["Red de bots"], [1]),
    }
    df["vector_entrada"] = [pick(rng, *vectores[t], 1)[0] for t in tipo]
    cred = df["vector_entrada"] == "Credenciales robadas"
    df.loc[cred & mfa & (rng.random(n) < 0.6), "vector_entrada"] = "Vulnerabilidad sin parche"

    soc = df["tiene_soc"] == "Sí"
    det = rng.lognormal(np.log(np.array([140, 90, 48, 20])[big]) - 0.8 * soc - 0.3 * cap, 0.9)
    df["horas_deteccion"] = np.clip(det, 0.2, 2500).round(1)
    df["horas_contencion"] = np.clip(rng.lognormal(np.log(6 + 0.08 * det), 0.7), 0.5, 1500).round(1)

    sev_score = (pd.Series(tipo).map({"Phishing": 0, "Ransomware": 2.2, "Malware": 0.8, "Acceso no autorizado": 1.2,
                                      "Fuga de datos": 1.6, "DDoS": 0.6}).to_numpy()
                 + 0.006 * df["horas_deteccion"] - 0.7 * mfa + rng.normal(0, 0.9, n))
    df["severidad"] = pd.cut(sev_score, [-np.inf, 0.5, 1.5, 2.6, np.inf], labels=["Baja", "Media", "Alta", "Crítica"]).astype(str)
    sev_num = df["severidad"].map({"Baja": 0, "Media": 1, "Alta": 2, "Crítica": 3})

    df["equipos_afectados"] = np.clip(rng.poisson(1 + (sev_num + 1) * np.array([1, 3, 8, 25])[big] * 0.5), 1, None)
    datos = df["tipo_ataque"].isin(["Fuga de datos", "Acceso no autorizado", "Ransomware"])
    regs = (rng.lognormal(np.log(np.array([300, 2000, 15000, 120000])[big]), 1.2)).round()
    df["registros_expuestos"] = np.where(datos, regs, 0)
    loss = rng.lognormal(np.log(np.array([4, 18, 70, 380])[big]) + 0.45 * sev_num + 0.9 * (df["tipo_ataque"] == "Ransomware"), 0.8)
    df["perdida_estimada_millones_cop"] = loss.round(1)
    ransom = df["tipo_ataque"] == "Ransomware"
    pago = ransom & (rng.random(n) < 0.32)
    df["pago_rescate_millones_cop"] = np.where(pago, (loss * rng.uniform(0.2, 0.6, n)).round(1), np.nan)
    df["notificado_a_autoridad"] = np.where(rng.random(n) < 0.25 + 0.15 * sev_num + 0.2 * datos, "Sí", "No")

    df = df.sort_values("fecha_deteccion").reset_index(drop=True)
    df.insert(0, "id_incidente", [f"CIB-{i:04d}" for i in range(1, n + 1)])
    df["fecha_deteccion"] = df["fecha_deteccion"].dt.strftime("%Y-%m-%d")

    small = df["tamano_empresa"].isin(["Micro", "Pequeña"])
    add_nan(df, "perdida_estimada_millones_cop", 0.12, rng, weight=np.where(small, 2.6, 0.5))
    add_nan(df, "horas_contencion", 0.09, rng)
    add_nan(df, "presupuesto_ti_pct", 0.12, rng, weight=np.where(small, 1.7, 0.6))
    add_nan(df, "registros_expuestos", 0.30, rng, weight=np.where(df["registros_expuestos"] > 0, 1.0, 1.3))
    add_nan(df, "capacitacion_ultimo_anio", 0.05, rng)
    plant(df, "horas_deteccion", 3, [8760.0, 12000.0], rng)

    cols = ["id_incidente", "fecha_deteccion", "anio", "departamento", "sector", "tamano_empresa", "num_empleados",
            "presupuesto_ti_pct", "tiene_mfa", "capacitacion_ultimo_anio", "tiene_soc", "tipo_ataque", "vector_entrada",
            "severidad", "horas_deteccion", "horas_contencion", "equipos_afectados", "registros_expuestos",
            "perdida_estimada_millones_cop", "pago_rescate_millones_cop", "notificado_a_autoridad"]
    return df[cols]


# --------------------------------------------------------------------------
# 5. Ambiental — calidad del aire diaria en el Valle de Aburrá (2025)
# --------------------------------------------------------------------------
def calidad_aire(rng):
    # estación: (municipio, tipo, factor de contaminación, mide O3, mide NO2)
    estaciones = {
        "MED-CENTRO": ("Medellín", "Tráfico", 1.45, True, True),
        "MED-POBLADO": ("Medellín", "Residencial", 1.05, True, False),
        "MED-ROBLEDO": ("Medellín", "Residencial", 1.10, False, False),
        "BEL-NORTE": ("Bello", "Tráfico", 1.25, True, True),
        "ITA-INDUSTRIAL": ("Itagüí", "Industrial", 1.40, False, True),
        "ENV-SUR": ("Envigado", "Residencial", 0.95, True, False),
        "CAL-SUR": ("Caldas", "Fondo", 0.70, False, False),
        "GIR-RURAL": ("Girardota", "Fondo", 0.60, True, False),
    }
    days = pd.date_range("2025-01-01", "2025-12-31", freq="D")
    doy = days.dayofyear.to_numpy()
    # temporadas de contingencia: transición feb-abr y oct-nov (capa de mezcla baja)
    season = 1 + 0.65 * np.exp(-((doy - 75) ** 2) / 1400) + 0.45 * np.exp(-((doy - 305) ** 2) / 1000)
    rain_season = 4 + 6 * np.exp(-((doy - 120) ** 2) / 600) + 7 * np.exp(-((doy - 290) ** 2) / 600)
    weekday = np.where(days.dayofweek >= 5, 0.78, 1.0)
    weekday[days.dayofweek == 6] = 0.68
    common_rain = rng.gamma(0.9, rain_season / 0.9)
    common_wind = np.clip(rng.normal(1.6, 0.4, len(days)), 0.3, None)

    frames = []
    for est, (mun, tipo, fac, o3, no2) in estaciones.items():
        rain = np.clip(common_rain * rng.lognormal(0, 0.4, len(days)), 0, None)
        wind = np.clip(common_wind + rng.normal(0, 0.3, len(days)), 0.2, None)
        temp = 22 - 2.5 * (tipo == "Fondo") + 1.2 * np.sin((doy - 40) / 365 * 2 * np.pi) - 0.08 * rain + rng.normal(0, 0.9, len(days))
        hum = np.clip(68 + 1.2 * rain - 1.5 * (temp - 22) + rng.normal(0, 5, len(days)), 35, 99)
        pm25 = 22 * fac * season * weekday * np.exp(-0.035 * rain) / (0.6 + 0.4 * wind) * rng.lognormal(0, 0.22, len(days))
        pm10 = pm25 * rng.normal(1.75, 0.15, len(days)) + 4
        frames.append(pd.DataFrame({
            "fecha": days, "estacion": est, "municipio": mun, "tipo_estacion": tipo,
            "pm25": pm25.round(1), "pm10": pm10.round(1),
            "o3": (np.clip(18 + 2.2 * (temp - 20) + rng.normal(0, 5, len(days)), 2, None) if o3 else np.full(len(days), np.nan)).round(1),
            "no2": (np.clip(32 * fac * weekday + rng.normal(0, 6, len(days)), 3, None) if no2 else np.full(len(days), np.nan)).round(1),
            "temperatura_c": temp.round(1), "humedad_relativa": hum.round(0),
            "precipitacion_mm": rain.round(1), "velocidad_viento_ms": wind.round(2),
        }))
    df = pd.concat(frames, ignore_index=True)
    df["dia_semana"] = df["fecha"].dt.dayofweek.map(dict(enumerate(DIAS)))
    df["mes"] = df["fecha"].dt.month
    df["categoria_ica_pm25"] = pd.cut(df["pm25"], [-0.1, 12, 37, 55, 150, 250, np.inf],
                                      labels=["Buena", "Aceptable", "Dañina para grupos sensibles", "Dañina",
                                              "Muy dañina", "Peligrosa"]).astype(str)

    # fallas de sensor: bloques de días consecutivos sin PM (y a veces sin meteorología)
    for est in estaciones:
        idx = df.index[df["estacion"] == est]
        for _ in range(rng.integers(2, 5)):
            start = rng.integers(0, len(idx) - 15)
            block = idx[start:start + rng.integers(3, 14)]
            df.loc[block, ["pm25", "pm10", "categoria_ica_pm25"]] = np.nan
            if rng.random() < 0.4:
                df.loc[block, ["temperatura_c", "humedad_relativa"]] = np.nan
    add_nan(df, "pm10", 0.03, rng)
    add_nan(df, "humedad_relativa", 0.04, rng)
    add_nan(df, "precipitacion_mm", 0.03, rng)
    plant(df, "pm25", 18, [-999.0], rng)  # centinela del equipo de medición
    plant(df, "temperatura_c", 10, [-999.0], rng)
    plant(df, "pm25", 3, [480.0, 612.0], rng)  # picos imposibles para el valle: error del sensor

    df["fecha"] = df["fecha"].dt.strftime("%Y-%m-%d")
    cols = ["fecha", "dia_semana", "mes", "estacion", "municipio", "tipo_estacion", "pm25", "pm10", "o3", "no2",
            "categoria_ica_pm25", "temperatura_c", "humedad_relativa", "precipitacion_mm", "velocidad_viento_ms"]
    return df[cols]


# --------------------------------------------------------------------------
# 6. Educación — resultados tipo Saber 11 de estudiantes de Antioquia (2025)
# --------------------------------------------------------------------------
def educacion(rng):
    n = 3250
    municipios = {"Medellín": (45, 0.04), "Bello": (10, 0.06), "Itagüí": (7, 0.05), "Envigado": (6, 0.08),
                  "Rionegro": (6, 0.30), "Apartadó": (6, 0.30), "Turbo": (5, 0.50), "Caucasia": (5, 0.35),
                  "Yarumal": (4, 0.45), "Andes": (6, 0.50)}
    names = list(municipios)
    df = pd.DataFrame({"municipio": pick(rng, names, [municipios[m][0] for m in names], n)})
    rural = rng.random(n) < df["municipio"].map(lambda m: municipios[m][1])
    df["zona"] = np.where(rural, "Rural", "Urbana")
    metro = df["municipio"].isin(["Medellín", "Envigado", "Itagüí", "Bello"])

    estrato = np.array([pick(rng, [1, 2, 3, 4, 5, 6], [30, 38, 22, 6, 2.5, 1.5] if (m and not r) else [55, 35, 9, 1, 0.01, 0.01], 1)[0]
                        for m, r in zip(metro, rural)])
    df["estrato"] = estrato
    df["tipo_colegio"] = np.where(rng.random(n) < 0.08 + 0.13 * (estrato - 1), "Privado", "Oficial")
    privado = df["tipo_colegio"] == "Privado"
    df["jornada"] = np.where(privado, pick(rng, ["Completa", "Mañana"], [75, 25], n),
                             pick(rng, ["Mañana", "Tarde", "Única", "Nocturna", "Sabatina"], [36, 28, 24, 8, 4], n))
    adulto = df["jornada"].isin(["Nocturna", "Sabatina"])
    df["sexo"] = pick(rng, ["F", "M"], [0.53, 0.47], n)
    df["edad"] = np.where(adulto, rng.integers(18, 45, n), np.clip(rng.normal(16.8, 0.9, n), 15, 21)).round().astype(int)

    edu_levels = ["Primaria incompleta", "Primaria completa", "Bachillerato", "Técnica o tecnológica", "Profesional", "Posgrado"]
    df["educacion_madre"] = [edu_levels[int(np.clip(rng.normal(1.2 + 0.6 * e - 0.4 * r, 1.0), 0, 5).round())]
                             for e, r in zip(estrato, rural)]
    edu_num = df["educacion_madre"].map({k: i for i, k in enumerate(edu_levels)})
    df["ingreso_familiar_smmlv"] = np.clip(rng.lognormal(np.log(0.7 + 0.55 * estrato), 0.35), 0.3, 25).round(1)
    df["acceso_internet"] = np.where(rng.random(n) < 0.35 + 0.1 * estrato - 0.25 * rural, "Sí", "No")
    df["computador_hogar"] = np.where(rng.random(n) < 0.15 + 0.12 * estrato - 0.1 * rural, "Sí", "No")
    trabaja = rng.random(n) < 0.10 + 0.08 * (estrato <= 2) + 0.08 * rural + 0.55 * adulto
    df["trabaja"] = np.where(trabaja, "Sí", "No")
    df["horas_trabajo_semana"] = np.where(trabaja, np.clip(rng.normal(np.where(adulto, 38, 16), 7), 4, 60).round(), np.nan)
    df["horas_estudio_semana"] = np.clip(rng.gamma(3, 2.4 + 0.3 * privado, n) - 2 * trabaja, 0, 40).round()
    df["inasistencias_anio"] = rng.poisson(5 + 4 * trabaja + 3 * rural, n)
    df["preparacion_preicfes"] = np.where(rng.random(n) < 0.08 + 0.12 * estrato + 0.15 * privado, "Sí", "No")

    internet = df["acceso_internet"] == "Sí"
    latent = (0.28 * (estrato - 2.2) + 0.25 * (edu_num - 2) + 0.35 * internet + 0.25 * (df["computador_hogar"] == "Sí")
              + 0.45 * privado - 0.30 * rural - 0.35 * trabaja - 0.30 * adulto + 0.05 * (df["horas_estudio_semana"] - 7)
              - 0.04 * (df["inasistencias_anio"] - 6) + 0.30 * (df["preparacion_preicfes"] == "Sí")
              + rng.normal(0, 0.7, n))

    def materia(base, slope, extra=0.0, sd=7):
        return np.clip(base + slope * latent + extra + rng.normal(0, sd, n), 0, 100).round()

    male = df["sexo"] == "M"
    df["puntaje_matematicas"] = materia(50, 9.5, 1.8 * male)
    df["puntaje_lectura_critica"] = materia(53, 8.5, -0.8 * male)
    df["puntaje_ciencias_naturales"] = materia(49, 8.5, 0.8 * male)
    df["puntaje_sociales_ciudadanas"] = materia(47, 9.0)
    df["puntaje_ingles"] = materia(49, 11.0, 6 * df["jornada"].eq("Completa") * privado, sd=9)
    df["puntaje_global"] = (5 * (3 * (df["puntaje_matematicas"] + df["puntaje_lectura_critica"]
                                      + df["puntaje_ciencias_naturales"] + df["puntaje_sociales_ciudadanas"])
                                 + df["puntaje_ingles"]) / 13).round().astype(int)

    df = df.sample(frac=1, random_state=SEED).reset_index(drop=True)
    df.insert(0, "id_estudiante", [f"EST-{i:05d}" for i in range(1, n + 1)])

    add_nan(df, "educacion_madre", 0.11, rng, weight=np.where(df["zona"] == "Rural", 1.6, 0.85))
    add_nan(df, "ingreso_familiar_smmlv", 0.58, rng)
    add_nan(df, "horas_estudio_semana", 0.09, rng)
    add_nan(df, "puntaje_ingles", 0.04, rng)
    add_nan(df, "inasistencias_anio", 0.07, rng)
    add_nan(df, "acceso_internet", 0.03, rng)
    plant(df, "horas_estudio_semana", 4, [90.0, 120.0, 168.0], rng)

    cols = ["id_estudiante", "municipio", "zona", "estrato", "tipo_colegio", "jornada", "sexo", "edad", "educacion_madre",
            "ingreso_familiar_smmlv", "acceso_internet", "computador_hogar", "trabaja", "horas_trabajo_semana",
            "horas_estudio_semana", "inasistencias_anio", "preparacion_preicfes", "puntaje_matematicas",
            "puntaje_lectura_critica", "puntaje_ciencias_naturales", "puntaje_sociales_ciudadanas", "puntaje_ingles",
            "puntaje_global"]
    return df[cols]


DATASETS = {
    "salud_dengue_antioquia_2025.csv": dengue,
    "seguridad_incidentes_medellin_2025.csv": seguridad,
    "logistica_entregas_valle_aburra_2025.csv": logistica,
    "ciberseguridad_incidentes_colombia_2023_2025.csv": ciberseguridad,
    "ambiental_calidad_aire_valle_aburra_2025.csv": calidad_aire,
    "educacion_saber11_antioquia_2025.csv": educacion,
}


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    out.mkdir(parents=True, exist_ok=True)
    for i, (name, fn) in enumerate(DATASETS.items()):
        df = fn(np.random.default_rng(SEED + i))
        df.to_csv(out / name, index=False, encoding="utf-8")
        print(f"{name}: {df.shape[0]} filas x {df.shape[1]} columnas")


if __name__ == "__main__":
    main()
