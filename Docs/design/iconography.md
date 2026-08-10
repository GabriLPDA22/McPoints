# Sistema de iconografía

## 1. Decisión sobre el icon set

El brief proponía Material Symbols. **No se usa.** El proyecto tiene instalado
`lucide-react@0.468` y es el set con el que están construidas todas las pantallas y el
propio design system. Añadir Material Symbols implicaría cargar una fuente de iconos
completa o una segunda librería para tener dos estilos de trazo conviviendo en la misma
pantalla. Toda la propuesta se hace sobre lucide, que cubre cada concepto necesario.

Equivalencias respecto a lo que pedía el brief:

| Concepto | Material Symbols propuesto | Lucide elegido |
|----------|---------------------------|----------------|
| Kiosco | `touch_app` / `point_of_sale` | `SquareMousePointer` |
| Caja | `storefront` | `Store` |
| App | `smartphone` | `Smartphone` |
| McAuto | `directions_car` | `Car` |
| Delivery | `delivery_dining` | `Bike` |
| Servicio a mesa | `table_restaurant` | `Armchair` |
| Comer aquí | `restaurant` | `Utensils` |
| Para llevar | `shopping_bag` | `ShoppingBag` |
| Desconocido | `help_outline` | `CircleHelp` |

## 2. Decisión sobre el color: no hay color por categoría

El brief preguntaba si hace falta un token de color por origen (`source.kiosk`,
`source.counter`, …). **La respuesta es no**, y es una decisión deliberada.

Razones:

1. Con seis orígenes y ocho entregas harían falta catorce colores distinguibles entre sí,
   en modo claro y oscuro, y accesibles. No existen catorce colores que cumplan eso sin
   convertir la pantalla en un arcoíris.
2. La paleta actual es de identidad dorada sobre fondo oscuro. Meter azules, verdes y rojos
   por categoría destruiría esa identidad.
3. El color pasaría a ser el canal principal de información, que es exactamente lo que la
   sección de accesibilidad del brief prohíbe.

En su lugar, el color se reserva para el **estado**, que es lo que sí necesita jerarquía:

| Rol | Token existente | Uso |
|-----|-----------------|-----|
| `accent` | `--primary` | El número. Es el protagonista de la pantalla. |
| `success` | `--success` | Descubrimiento nuevo, origen nuevo conseguido. |
| `muted` | `--text-muted` | **Todos** los iconos y etiquetas de origen y entrega. |
| `danger` | `--danger` | Solo errores reales. Nunca para `UNKNOWN`. |

Los iconos de categoría son siempre `text-muted` y van siempre acompañados de texto. Esto
funciona por construcción en claro, oscuro, escala de grises y alto contraste, porque la
información no está codificada en el color en ningún momento.

`UNKNOWN` usa exactamente el mismo tratamiento visual que el resto. No es un error, es un
estado legítimo, y pintarlo de rojo o amarillo comunicaría lo contrario.

## 3. Registro de orígenes

Implementado en `src/core/taxonomy/registry.js`.

- **`KIOSK`** — icono `SquareMousePointer` · etiqueta "Kiosco" · corta "Kiosco" ·
  significado: pedido hecho en máquina de autoservicio · rol de color `muted` ·
  aparece cuando `source.value === 'KIOSK'`.
- **`COUNTER`** — icono `Store` · etiqueta "Caja" · corta "Caja" ·
  significado: pedido hecho a un empleado en mostrador · rol `muted` ·
  aparece cuando `source.value === 'COUNTER'`.
- **`MOBILE_APP`** — icono `Smartphone` · etiqueta "App" · corta "App" ·
  significado: pedido iniciado desde el móvil · rol `muted` ·
  aparece cuando `source.value === 'MOBILE_APP'`.
- **`DRIVE_THRU`** — icono `Car` · etiqueta "McAuto" · corta "McAuto" ·
  significado: pedido realizado desde el coche · rol `muted` ·
  aparece cuando `source.value === 'DRIVE_THRU'`.
- **`DELIVERY`** — icono `Bike` · etiqueta "Delivery" · corta "Delivery" ·
  significado: pedido de plataforma de reparto · rol `muted` ·
  aparece cuando `source.value === 'DELIVERY'`.
- **`OTHER`** — icono `Ticket` · etiqueta "Otro" · corta "Otro" ·
  significado: canal identificado fuera de los anteriores · rol `muted` ·
  aparece cuando `source.value === 'OTHER'`.
- **`UNKNOWN`** — icono `CircleHelp` · etiqueta "Origen desconocido" · corta "Sin origen" ·
  significado: no se pudo determinar el canal · rol `muted` ·
  aparece cuando `source.value === 'UNKNOWN'` o falta el dato.

## 4. Registro de entregas

- **`EAT_IN`** — `Utensils` · "Comer aquí" · "Aquí" · consumo en el restaurante · `muted`.
- **`TAKE_AWAY`** — `ShoppingBag` · "Para llevar" · "Llevar" · empaquetado para salir · `muted`.
- **`TABLE_SERVICE`** — `Armchair` · "Servicio a mesa" · "Mesa" · lo llevan a la mesa · `muted`.
- **`COUNTER_PICKUP`** — `ConciergeBell` · "Recoger en mostrador" · "Mostrador" · recogida en el punto de entrega · `muted`.
- **`DRIVE_THRU_PICKUP`** — `Car` · "Recoger en McAuto" · "McAuto" · entrega por ventanilla · `muted`.
- **`PARKING_PICKUP`** — `CircleParking` · "Recoger en parking" · "Parking" · entrega en plaza · `muted`.
- **`DELIVERY`** — `Bike` · "Reparto" · "Reparto" · entrega a domicilio · `muted`.
- **`UNKNOWN`** — `CircleHelp` · "Entrega desconocida" · "Sin datos" · no determinado · `muted`.

`DRIVE_THRU_PICKUP` y `DELIVERY` comparten icono con su origen homónimo. Es intencionado:
son el mismo concepto físico visto desde dimensiones distintas, y el contexto de la UI
(sección "Origen" frente a "Entrega") desambigua sin necesidad de dos iconos.

## 5. Método de pago

- **`CARD`** — `CreditCard` · "Tarjeta".
- **`CASH`** — `Banknote` · "Efectivo".
- **`MOBILE_PAY`** — `Smartphone` · "Pago móvil".
- **`UNKNOWN`** — no se muestra. Un pago desconocido simplemente se omite de la UI en lugar
  de ocupar espacio con "desconocido".

## 6. Reglas de uso

1. **Icono + texto siempre.** Un icono suelto solo se permite en la celda compacta de la
   galería, y allí lleva `aria-label` con la etiqueta completa.
2. Cuando el icono va acompañado de su texto visible, se marca `aria-hidden` para que el
   lector de pantalla no lo lea dos veces.
3. Tamaños: `12px` en celda de galería, `14px` en chip, `16px` en pantalla de detalle.
4. Grosor de trazo uniforme al de lucide por defecto. No se mezclan estilos.
5. Nada de emojis en producción.
