# Taxonomía: origen del pedido y forma de entrega

Dos dimensiones **independientes**. No se colapsan nunca en una sola categoría.

## 1. Order source — dónde se hizo el pedido

| Valor | Etiqueta | Definición |
|-------|----------|------------|
| `KIOSK` | Kiosco | Máquina de autoservicio dentro del restaurante. |
| `COUNTER` | Caja | Pedido hecho a un empleado en el mostrador. |
| `MOBILE_APP` | App | Pedido iniciado desde la aplicación móvil. |
| `DRIVE_THRU` | McAuto | Pedido realizado desde el coche en el carril. |
| `DELIVERY` | Delivery | Pedido procedente de una plataforma de reparto. |
| `OTHER` | Otro | Canal identificado pero fuera de los anteriores. |
| `UNKNOWN` | Desconocido | No se pudo determinar. **Estado válido, no es un error.** |

## 2. Fulfillment type — cómo se entrega

| Valor | Etiqueta | Definición |
|-------|----------|------------|
| `EAT_IN` | Comer aquí | Consumo en el restaurante, recogida en mostrador. |
| `TAKE_AWAY` | Para llevar | Se empaqueta para salir. |
| `TABLE_SERVICE` | Servicio a mesa | Un empleado lo lleva a la mesa con localizador. |
| `COUNTER_PICKUP` | Recoger en mostrador | Recogida en el punto de entrega. |
| `DRIVE_THRU_PICKUP` | Recoger en McAuto | Entrega por la ventanilla. |
| `PARKING_PICKUP` | Recoger en parking | Entrega en plaza de aparcamiento. |
| `DELIVERY` | Reparto | Lo lleva un repartidor a domicilio. |
| `UNKNOWN` | Desconocido | No se pudo determinar. |

## 3. Método de pago (dimensión secundaria)

Se registra solo cuando aparece de forma explícita en el ticket. No participa en la
clasificación de origen ni en la mecánica de colección; es contexto para el dataset.

| Valor | Etiqueta |
|-------|----------|
| `CARD` | Tarjeta |
| `CASH` | Efectivo |
| `MOBILE_PAY` | Pago móvil |
| `UNKNOWN` | Desconocido |

## 4. Combinaciones

Las dos dimensiones se combinan casi libremente, y esa es exactamente la razón por la que
deben modelarse por separado. Combinaciones habituales:

| Origen | Entregas posibles |
|--------|-------------------|
| `KIOSK` | `EAT_IN`, `TAKE_AWAY`, `TABLE_SERVICE`, `COUNTER_PICKUP` |
| `COUNTER` | `EAT_IN`, `TAKE_AWAY`, `TABLE_SERVICE` |
| `MOBILE_APP` | `COUNTER_PICKUP`, `TABLE_SERVICE`, `PARKING_PICKUP`, `DRIVE_THRU_PICKUP`, `DELIVERY` |
| `DRIVE_THRU` | `DRIVE_THRU_PICKUP`, `TAKE_AWAY` |
| `DELIVERY` | `DELIVERY` |

**Nota importante:** esta matriz es orientativa y **no se usa para inferir**. Que `DELIVERY`
solo aparezca con `DELIVERY` no autoriza al motor a deducir el origen a partir de la entrega.
Deducir una dimensión de la otra sería reintroducir por la puerta de atrás la mezcla de
conceptos que este rediseño elimina. La matriz sirve para validar coherencia y para ordenar
las opciones en la UI de clasificación manual, nada más.

## 5. Pistas textuales por dimensión

Palabras que el motor busca en el ticket. La lista vive en el código en
`src/core/detection/rules.js` y esta tabla es su documentación.

### Origen

| Valor | Pistas |
|-------|--------|
| `KIOSK` | `KIOSCO`, `KIOSK`, `QUIOSCO`, `AUTOSERVICIO`, `AUTOPEDIDO`, `SELF ORDER`, `TERMINAL` |
| `COUNTER` | `CAJA`, `MOSTRADOR`, `TPV`, `COUNTER`, `CAJERO` |
| `MOBILE_APP` | `APP`, `PEDIDO MOVIL`, `MOBILE ORDER`, `MYMCDONALD`, `PEDIDO APP` |
| `DRIVE_THRU` | `MCAUTO`, `AUTOMAC`, `DRIVE`, `DRIVE-THRU`, `DRIVE THRU` |
| `DELIVERY` | `MCDELIVERY`, `DELIVERY`, `GLOVO`, `UBER EATS`, `JUST EAT`, `REPARTO` |

### Entrega

| Valor | Pistas |
|-------|--------|
| `EAT_IN` | `COMER AQUI`, `EAT IN`, `PARA TOMAR AQUI`, `SALA` |
| `TAKE_AWAY` | `PARA LLEVAR`, `TAKE AWAY`, `TAKEAWAY`, `LLEVAR` |
| `TABLE_SERVICE` | `SERVICIO A MESA`, `MESA`, `TABLE SERVICE`, `LOCALIZADOR` |
| `COUNTER_PICKUP` | `RECOGER EN MOSTRADOR`, `RECOGIDA MOSTRADOR`, `FRONT COUNTER` |
| `DRIVE_THRU_PICKUP` | `MCAUTO`, `AUTOMAC`, `VENTANILLA` |
| `PARKING_PICKUP` | `PARKING`, `APARCAMIENTO`, `CURBSIDE`, `PLAZA` |
| `DELIVERY` | `DOMICILIO`, `DELIVERY`, `REPARTO` |

### Términos ambiguos

`MCAUTO` y `MESA` aparecen en dos dimensiones a la vez. El motor puede usar la misma pista
para ambas, pero calcula la confianza de cada dimensión por separado. No hay propagación:
detectar `MCAUTO` da evidencia de `DRIVE_THRU` **y** de `DRIVE_THRU_PICKUP` de forma
independiente, no deduce una de la otra.

## 6. Exclusiones obligatorias

Nunca deben tomarse como número de pedido:

- **Código de 4 dígitos de la app** (`CODIGO`, `CHECK-IN`, `ONE-TIME`, `CODIGO APP`).
  Es un código de identificación o de recompensas, no un número de pedido. Ver
  `Docs/research/domain-findings.md` §1.2.
- **Número de ticket fiscal** (`TICKET`, `FACTURA`, `N. TICKET`), habitualmente de 6+ dígitos.
- Importes, fechas, horas, NIF/CIF, teléfonos y códigos de encuesta.
