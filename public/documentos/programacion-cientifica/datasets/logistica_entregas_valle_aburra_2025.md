# Diccionario de datos — Entregas de última milla en el Valle de Aburrá (sep-dic 2025)

**Archivo:** `logistica_entregas_valle_aburra_2025.csv` · **4.100 filas × 21 columnas** · datos sintéticos

## Contexto

La "última milla" es el último tramo de una entrega: de la bodega a la puerta del
cliente. Es el tramo más caro y el que más se retrasa. Cada fila es **un pedido**
de una tienda en línea entregado por uno de cuatro operadores logísticos en los
municipios del Valle de Aburrá, entre septiembre y diciembre de 2025 (incluye la
temporada de Black Friday y Navidad).

**Decisión que apoya:** la tienda debe decidir con qué operador renovar el
contrato, qué vehículo asignar según el pedido y en qué franjas o temporadas
reforzar la operación para reducir retrasos y mejorar la calificación del cliente.

## Columnas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_pedido` | texto | Identificador del pedido. |
| `fecha` | fecha (AAAA-MM-DD) | Día de la entrega. |
| `dia_semana` | categórica | Día de la semana. |
| `franja_horaria` | categórica | `Mañana`, `Tarde` o `Noche`. |
| `municipio_destino` | categórica | Municipio del cliente. |
| `canal_compra` | categórica | `App`, `Web`, `WhatsApp`, `Teléfono`. |
| `categoria_producto` | categórica | `Alimentos`, `Farmacia`, `Ropa`, `Electrónica`, `Hogar`. |
| `peso_kg` | numérica (kg) | Peso del paquete. |
| `distancia_km` | numérica (km) | Distancia de la bodega al cliente. |
| `tipo_vehiculo` | categórica | `Moto`, `Bicicleta eléctrica`, `Van`, `Camión pequeño`. |
| `operador` | categórica | Operador logístico (A, B, C, D). |
| `paradas_en_ruta` | entero | Entregas que hizo el vehículo en esa ruta. |
| `lluvia` | categórica | `Sí` si llovió durante la entrega. |
| `tiempo_estimado_min` | numérica (min) | Tiempo prometido al cliente. |
| `tiempo_real_min` | numérica (min) | Tiempo que tardó realmente. **Vacío si la entrega falló.** |
| `retraso_min` | numérica (min) | `tiempo_real_min − tiempo_estimado_min` (negativo = llegó antes). **Vacío si la entrega falló.** |
| `estado_entrega` | categórica | `A tiempo`, `Con retraso` (más de 15 min), `Fallido`, `Devuelto`. |
| `motivo_no_entrega` | categórica | Motivo del fallo o la devolución. **Vacío si el pedido se entregó.** |
| `costo_envio_cop` | numérica (pesos) | Costo del envío. |
| `calificacion_cliente` | numérica (1-5) | Calificación que dejó el cliente (no todos califican). |
| `propina_cop` | numérica (pesos) | Propina dejada al repartidor. |

## Preguntas guía

1. ¿Qué operador tiene más retrasos y fallos? ¿Y peor calificación?
2. ¿Cuánto aumenta el retraso cuando llueve? ¿Afecta igual a todos los vehículos?
3. ¿Cómo cambia el volumen de pedidos y el retraso en Black Friday y diciembre?
4. ¿Qué relación hay entre la distancia, el peso y el costo del envío?
5. ¿El retraso explica la calificación del cliente?

## Ideas de visualización

- **Univariadas:** histograma de `retraso_min`; barras de `estado_entrega`; barras de pedidos por `municipio_destino`.
- **Multivariadas:** cajas de `retraso_min` por `operador` o por `tipo_vehiculo` y `lluvia`; dispersión `distancia_km` vs `costo_envio_cop`; línea de pedidos por día; barras de calificación promedio por operador.
