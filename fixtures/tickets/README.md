# Fixtures de tickets

Tickets anonimizados y salidas de OCR simuladas. Cumplen dos funciones:

1. **Tests de detección.** `catalog.json` es ejecutable: `src/core/detection/fixtures.test.js`
   corre el motor sobre cada entrada y comprueba lo declarado en `expected`.
2. **Dataset de investigación.** Los campos de etiquetado alimentan la validación de la
   hipótesis `terminal|secuencia`. Ver `Docs/research/hypothesis-validation.md`.

## Estructura

```
fixtures/tickets/
├── catalog.json          # Metadatos y expectativas de cada ticket
├── simulated/            # Salidas OCR simuladas (.ocr.json)
├── perfect/
├── dark/
├── blurry/
├── angled/
├── wrinkled/
├── partial/
├── multi-number/
├── kiosk/
└── counter/
```

## Anatomía de una entrada del catálogo

```json
{
  "id": "sim-kiosk-2323",
  "file": null,
  "ocrFixture": "simulated/kiosk-2323.ocr.json",
  "country": "ES",
  "city": null,
  "restaurant": null,
  "simulated": true,
  "groundTruth": { ... },
  "expected": { ... },
  "notes": "..."
}
```

### `groundTruth` — lo que realmente ocurrió

| Campo | Notas |
|-------|-------|
| `rawNumber` | El número tal y como está impreso, con ceros a la izquierda. |
| `orderSource` | Canal real del pedido, aunque no aparezca en el ticket. |
| `fulfillment` | Forma de entrega real. |
| `paymentMethod` | Método de pago real. |
| `observedTerminal` | **Solo por observación directa** (p. ej. anotando qué kiosco físico se usó). Nunca deducido del número. |
| `observedSequence` | Igual: solo si se observó, por ejemplo en la pantalla de recogida. |
| `verifiedByUser` | `true` si quien recogió el ticket confirmó estos datos. |

### `expected` — lo que el motor debe producir hoy

Cuando `groundTruth.orderSource` tiene un valor y `expected.source` es `UNKNOWN`, es un
**hueco conocido**: el ticket no imprime ninguna pista del canal, así que el motor no puede
saberlo y decir `UNKNOWN` es la respuesta correcta. El test los cuenta explícitamente para
que la lista de huecos no crezca sin que nadie se entere.

`expected.mustNotDetect` lista los números que el motor debe descartar: código de la app,
número de ticket fiscal, importes.

## Por qué `observedTerminal` casi siempre es `null`

Es la parte más importante del dataset y la más fácil de contaminar. Si se rellena partiendo
el número por la fórmula que queremos comprobar, el análisis se vuelve circular y siempre
"confirma" la hipótesis. Solo cuenta lo anotado a mano en el restaurante.

## Privacidad

- Recortar o difuminar datos personales, precios e identificadores fiscales.
- No commitear imágenes con datos identificables sin anonimizar.
- La exportación desde la app no incluye imágenes y sanea importes, NIF/CIF y números largos
  del texto OCR antes de escribirlo.

## OCR simulado

Los `.ocr.json` reproducen la forma que devuelve el plugin de ML Kit ya normalizada:
bloques con `text` y `boundingBox` en coordenadas 0-1. Sirven para probar el motor sin
imágenes reales.
