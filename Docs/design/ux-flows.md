# Flujos y wireframes

Wireframes textuales de todas las pantallas afectadas por el rediseño. Ancho de referencia:
móvil, contenedor `max-w-lg`.

## 1. Home

Cambia respecto a la v1: desaparece el porcentaje de completado, porque con una galería de
descubrimientos ya no hay un total finito contra el que medirse. Lo sustituye el recuento
absoluto y el desglose por origen.

```
┌────────────────────────────────────┐
│ TU COLECCIÓN                       │
│ McPoints                           │
│ App independiente · No afiliada    │
│                                    │
│ ┌────────────────────────────────┐ │
│ │            347                 │ │
│ │      números descubiertos      │ │
│ │                                │ │
│ │  412 avistamientos · 38 con    │ │
│ │  más de un origen              │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │  [scan]   ESCANEAR TICKET      │ │
│ └────────────────────────────────┘ │
│                                    │
│ ÚLTIMO                             │
│ ┌────────────────────────────────┐ │
│ │  2323                          │ │
│ │  [kiosk] Kiosco · [utensils]   │ │
│ │  Comer aquí                    │ │
│ │  hace 2 h                      │ │
│ └────────────────────────────────┘ │
│                                    │
│ POR ORIGEN                         │
│ ┌────────────────────────────────┐ │
│ │ [kiosk]  Kiosco          67    │ │
│ │ [store]  Caja            31    │ │
│ │ [phone]  App             42    │ │
│ │ [car]    McAuto          18    │ │
│ │ [?]      Sin origen     189    │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

El bloque "Por origen" solo aparece si hay al menos dos orígenes distintos con datos. Con
una colección recién migrada, donde todo es `UNKNOWN`, sería una lista de una sola fila y
no aporta nada, así que se oculta.

## 2. Galería de colección

Sustituye al tablero exhaustivo de 000–999. Solo se muestra lo descubierto.

```
┌────────────────────────────────────┐
│ Colección                          │
│ ┌────────────────────────────────┐ │
│ │ [search] Buscar número...      │ │
│ └────────────────────────────────┘ │
│ (Todos) (Kiosco) (Caja) (App)      │
│ (McAuto) (Delivery) (Sin origen)   │
│                                    │
│ 347 números                        │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │  23  ││ 2323 ││  48  ││ 156  │  │
│ │[kios]││[kios]││[car] ││ [?]  │  │
│ │  ·3  ││      ││      ││      │  │
│ └──────┘└──────┘└──────┘└──────┘  │
│ ┌──────┐┌──────┐┌──────┐┌──────┐  │
│ │ 066  ││ 1342 ││  62  ││ 352  │  │
│ │[phon]││[stor]││[kios]││[kios]│  │
│ └──────┘└──────┘└──────┘└──────┘  │
└────────────────────────────────────┘
```

Anatomía de la celda:

- El número en grande, tipografía display, cifras tabulares. Es lo único con color de acento.
- Debajo, el icono del origen **principal** (el primero conseguido) en `muted`.
- Un punto y un contador (`·3`) solo si hay más de un origen. Es la señal de que ahí hay una
  colección de variantes que merece un toque.

La celda deliberadamente **no** muestra el raw, el número de veces encontrado ni la fecha. La
cuadrícula tiene que seguir leyéndose de un vistazo; ese detalle vive en la pantalla de
detalle.

Estado vacío, cuando aún no hay nada:

```
┌────────────────────────────────────┐
│            [ticket]                │
│      Aún no tienes números         │
│  Escanea el ticket de tu próximo   │
│  pedido para empezar la colección  │
│         [ ESCANEAR ]               │
└────────────────────────────────────┘
```

## 3. Detalle de número

Se abre al pulsar una celda. Es la pantalla donde vive todo el contexto.

```
┌────────────────────────────────────┐
│ [<]                                │
│                                    │
│              23                    │
│        En tu colección             │
│                                    │
│ ORÍGENES                           │
│ ┌────────────────────────────────┐ │
│ │ [kiosk]  Kiosco          ✓  3  │ │
│ │ [phone]  App             ✓  1  │ │
│ │ [store]  Caja            ○     │ │
│ │ [car]    McAuto          ○     │ │
│ │ [bike]   Delivery        ○     │ │
│ └────────────────────────────────┘ │
│ Te faltan 3 orígenes               │
│                                    │
│ ┌──────────┬──────────┬──────────┐ │
│ │ Primera  │ Última   │ Veces    │ │
│ │ 08/08/26 │ 09/08/26 │    4     │ │
│ └──────────┴──────────┴──────────┘ │
│                                    │
│ HISTORIAL                          │
│ ┌────────────────────────────────┐ │
│ │ 23   [kiosk] Kiosco            │ │
│ │      09/08/2026 14:32 · OCR    │ │
│ ├────────────────────────────────┤ │
│ │ 23   [phone] App               │ │
│ │      03/08/2026 20:11 · manual │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

La lista de orígenes con marcas conseguido/pendiente es la mecánica de colección de la que
habla el brief. Con `keyStrategy: RAW` en v1 es plenamente funcional: el mismo `2323` se
puede conseguir por kiosco y por caja.

Cada fila del historial muestra su propio `rawNumber` a la izquierda. En v1 coincide siempre
con la clave; cuando se active la normalización, esa columna es la que dejará ver que `23`
vino de `2323` y de `1323`.

## 4. Scanner

```
┌────────────────────────────────────┐
│                                    │
│   ┌────────────────────────────┐   │
│   │ ┌                        ┐ │   │
│   │                            │   │
│   │      (vista de cámara)     │   │
│   │                            │   │
│   │ └                        ┘ │   │
│   └────────────────────────────┘   │
│                                    │
│  Encuadra el ticket completo.      │
│  Leemos el número y el contexto.   │
│                                    │
│  [X]    [ CAPTURAR ]    [teclado]  │
│     Introducir manualmente         │
└────────────────────────────────────┘
```

El texto de ayuda cambia respecto a la v1. Antes decía "encaja el número de pedido en el
recuadro", lo que empujaba al usuario a hacer un primer plano del número. Ahora necesitamos
el ticket entero, porque las palabras que rodean al número son las que permiten clasificar
el origen. Un primer plano del número es, con el nuevo modelo, una captura peor.

### Hoja de candidatos

Cuando la confianza no basta para autoconfirmar:

```
┌────────────────────────────────────┐
│ ¿Cuál es el número de pedido?      │
│ ┌────────────────────────────────┐ │
│ │ 2323                      91%  │ │
│ │ [kiosk] Kiosco                 │ │
│ ├────────────────────────────────┤ │
│ │ 156                       44%  │ │
│ ├────────────────────────────────┤ │
│ │ 12                        21%  │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## 5. Descubrimiento: número nuevo

```
┌────────────────────────────────────┐
│              ✦                     │
│         NUEVO NÚMERO               │
│                                    │
│            2323                    │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ [kiosk]  Kiosco                │ │
│ │ [utensils] Comer aquí          │ │
│ └────────────────────────────────┘ │
│                                    │
│  Añadido a tu colección            │
│                                    │
│      [ VER COLECCIÓN ]             │
│      [ ESCANEAR OTRO ]             │
└────────────────────────────────────┘
```

Se muestra `2323`, no `23`. Mientras la normalización no esté validada, la app enseña lo que
dice el ticket.

## 6. Descubrimiento: origen nuevo (nueva variante)

El estado más interesante del sistema.

```
┌────────────────────────────────────┐
│              ✦                     │
│        NUEVA VARIANTE              │
│                                    │
│            2323                    │
│                                    │
│  Ya tenías este número, pero es    │
│  la primera vez que lo consigues   │
│  mediante:                         │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ [car]  McAuto                  │ │
│ └────────────────────────────────┘ │
│                                    │
│  Orígenes conseguidos: 2 de 5      │
│  [kiosk]✓ [car]✓ [store]○          │
│  [phone]○ [bike]○                  │
│                                    │
│      [ VER NÚMERO ]                │
│      [ ESCANEAR OTRO ]             │
└────────────────────────────────────┘
```

## 7. Duplicado del mismo origen

Sin celebración, sin fricción. Se reconoce y se pasa.

```
┌────────────────────────────────────┐
│              ✓                     │
│         YA LO TENÍAS               │
│                                    │
│            2323                    │
│                                    │
│  Conseguido por kiosco 4 veces.    │
│  Primera vez el 08/08/2026.        │
│                                    │
│  Te faltan estos orígenes:         │
│  [store] Caja · [phone] App ·      │
│  [car] McAuto                      │
│                                    │
│      [ ESCANEAR OTRO ]             │
└────────────────────────────────────┘
```

Sugerir los orígenes que faltan convierte un duplicado, que en la v1 era un callejón sin
salida, en una pista de qué buscar.

## 8. Origen desconocido

```
┌────────────────────────────────────┐
│              ✦                     │
│         NUEVO NÚMERO               │
│                                    │
│            2323                    │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ [?]  Origen desconocido        │ │
│ │                                │ │
│ │ No hemos podido identificar    │ │
│ │ cómo se realizó este pedido.   │ │
│ │ Puedes clasificarlo ahora o    │ │
│ │ más tarde.                     │ │
│ │                                │ │
│ │      [ CLASIFICAR ]            │ │
│ └────────────────────────────────┘ │
│                                    │
│      [ VER COLECCIÓN ]             │
└────────────────────────────────────┘
```

El tono es neutro. No hay iconos de alerta, ni color de error, ni "no se pudo procesar". El
número se ha guardado correctamente; lo único que falta es una etiqueta opcional.

### Clasificación manual

```
┌────────────────────────────────────┐
│ ¿Cómo hiciste este pedido?         │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ [kiosk]   Kiosco               │ │
│ │ [store]   Caja                 │ │
│ │ [phone]   App                  │ │
│ │ [car]     McAuto               │ │
│ │ [bike]    Delivery             │ │
│ │ [?]       No lo sé             │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

Lo que elija aquí se guarda con `origin: 'USER_SELECTED'`, nunca como `AUTO_DETECTED`. La
distinción no es visible para el usuario, pero es la que permite medir después la precisión
real del clasificador sin contarse las propias etiquetas como aciertos.

## 9. Ajustes: dataset

```
┌────────────────────────────────────┐
│ INVESTIGACIÓN                      │
│ ┌────────────────────────────────┐ │
│ │ Contribuir al dataset          │ │
│ │                                │ │
│ │ Exporta el texto leído de tus  │ │
│ │ tickets y las clasificaciones  │ │
│ │ que has confirmado, para       │ │
│ │ validar cómo se generan los    │ │
│ │ números.                       │ │
│ │                                │ │
│ │ No incluye fotos ni importes.  │ │
│ │                                │ │
│ │   [ EXPORTAR DATASET ]         │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## 10. Accesibilidad

- Ninguna información depende solo del color. Origen y entrega son siempre icono + texto.
- La celda compacta de la galería lleva `aria-label` completo:
  `"Número 2323, origen Kiosco, 3 orígenes distintos"`.
- Las marcas de conseguido/pendiente del detalle usan `✓` y `○` como glifos reales, no
  como diferencia de color, y la fila lleva `aria-label` con "conseguido" o "pendiente".
- Los iconos acompañados de texto visible van con `aria-hidden`.
- Objetivos táctiles de 40px mínimo, ya garantizado por `Chip` y `Button`.
- Todas las animaciones de descubrimiento respetan `prefers-reduced-motion`, que ya está
  cubierto globalmente en `src/index.css`.
