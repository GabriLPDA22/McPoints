# Modelo de datos: del número suelto al descubrimiento con contexto

## 1. El problema que resuelve

La v1 de McPoints guardaba `number = "2323"` y nada más. Eso mezcla en un solo campo seis
conceptos que son distintos:

```
NÚMERO CRUDO   ≠   NÚMERO DE COLECCIÓN   ≠   ORIGEN DEL PEDIDO
      ≠   FORMA DE ENTREGA   ≠   TERMINAL   ≠   SECUENCIA
```

Además, la migración legacy aplicaba `allowLegacyTruncation` y convertía `0090` en `090`:
destruía el número original de forma irreversible en la propia base de datos.

## 2. La idea central: la colección se deriva, no se guarda

Persistimos **hechos inmutables** (avistamientos) y **calculamos** la colección aplicando una
versión de reglas. Ese es el mecanismo que permite mejorar el parser en el futuro sin
migraciones destructivas.

```
Cámara → OCR → Engine vN → Sighting (inmutable, persistido)
                                 │
                                 ▼
                  Proyector (collectionKeyStrategy + rulesVersion)
                                 │
                                 ▼
                  CollectionEntry (derivada, recalculable)
```

Si mañana se confirma que `2323` es terminal 23 + secuencia 23, no se migra nada: se sube
`rulesVersion`, se cambia `collectionKeyStrategy` de `RAW` a `SEQUENCE` y se reproyecta.
Los avistamientos no se tocan. Si la interpretación resulta ser errónea, se vuelve atrás.

## 3. Sighting (avistamiento)

Un hecho observado. **Nunca se modifica después de crearse**, salvo por clasificación manual
explícita del usuario, que queda marcada como tal.

```js
{
  id: 'uuid',
  rawNumber: '2323',          // exactamente como se leyó. Nunca se recorta ni se rellena.
  digits: 4,                  // derivado, para consultas rápidas
  capturedAt: '2026-08-10T12:00:00.000Z',
  detectionMethod: 'OCR',     // OCR | MANUAL | MIGRATED | IMPORTED

  source:      { value: 'KIOSK',   origin: 'AUTO_DETECTED', confidence: 0.82 },
  fulfillment: { value: 'EAT_IN',  origin: 'AUTO_DETECTED', confidence: 0.64 },
  payment:     { value: 'CARD',    origin: 'AUTO_DETECTED', confidence: 0.71 },

  orderNumberConfidence: 0.91,

  interpretation: null,       // en v1 SIEMPRE null. Ver sección 6.

  evidence: {
    keywords: ['KIOSCO', 'COMER AQUI', 'TARJETA'],
    rulesVersion: 1,
    ocrTextHash: 'a1b2c3',    // para deduplicar y enlazar con el dataset
    restaurantHint: null
  }
}
```

### 3.1 Por qué cada atributo lleva su propia confianza

Un ticket puede leerse con total claridad en el número y ser ambiguo en el origen. Un único
`confidence` global obligaría a elegir entre descartar información buena o aceptar
información mala. Con confianza por atributo:

- `orderNumberConfidence: 0.91` → el número es fiable, se acepta.
- `source.confidence: 0.82` → el origen es fiable, se muestra.
- `fulfillment.confidence: 0.30` → por debajo del umbral, se degrada a `UNKNOWN`.

### 3.2 `origin`: quién decidió el valor

Distinguir la procedencia de cada clasificación es obligatorio para poder evaluar el OCR
más adelante sin contaminar las métricas con decisiones humanas.

| `origin` | Significado |
|----------|-------------|
| `AUTO_DETECTED` | Lo dedujo el motor a partir de evidencia del ticket. |
| `USER_CONFIRMED` | El motor lo propuso y el usuario lo aceptó. |
| `USER_SELECTED` | El motor no lo supo y lo eligió el usuario. **No es evidencia del OCR.** |
| `UNKNOWN` | Nadie lo determinó. |

Al medir la precisión del clasificador solo cuentan `AUTO_DETECTED` y `USER_CONFIRMED`.
Un `USER_SELECTED` no valida ni invalida el algoritmo: es una etiqueta, no una predicción.

## 4. CollectionEntry (entrada de colección)

Derivada. Se puede borrar y reconstruir entera desde los sightings.

```js
{
  key: '2323',                // clave de colección, según keyStrategy
  keyStrategy: 'RAW',         // RAW | SEQUENCE (v1 siempre RAW)
  rulesVersion: 1,
  firstSeenAt: '...',
  lastSeenAt: '...',
  sightingCount: 4,
  sightingIds: ['uuid', ...],

  sourcesSeen: {              // la mecánica de colección por origen
    KIOSK:   { count: 3, firstAt: '...', lastAt: '...' },
    DRIVE_THRU: { count: 1, firstAt: '...', lastAt: '...' }
  },
  fulfillmentsSeen: { EAT_IN: { count: 2, ... } },
  rawNumbersSeen: ['2323']    // todos los raw que colapsan en esta clave
}
```

`rawNumbersSeen` solo tendrá más de un elemento cuando `keyStrategy` sea `SEQUENCE`: en ese
escenario `2323` y `1323` colapsarían en la clave `23`. En v1, con `RAW`, siempre es uno.

## 5. Raw number frente a collection number

| | v1 (actual) | v2 (si se valida la hipótesis) |
|-|-------------|-------------------------------|
| `rawNumber` | `2323` | `2323` |
| `key` | `2323` | `23` |
| `keyStrategy` | `RAW` | `SEQUENCE` |
| UI principal | `2323` | `23`, con "Original: 2323" |

El `rawNumber` es idéntico en ambas columnas. Eso es lo que hace la transición segura.

## 6. Por qué `interpretation` es `null` en v1

La hipótesis `terminal * 100 + secuencia` está en `MEDIUM_CONFIDENCE` y no existe ninguna
fuente española. Aplicarla significaría mostrar `#23` para un ticket que dice `2323`, es
decir, presentar una hipótesis como si fuera un hecho.

La política, en orden:

1. **v1** — `interpretation: null`. Se recoge dataset.
2. **Validación** — cuando el dataset cumpla los criterios de
   `Docs/research/hypothesis-validation.md`, se sube `rulesVersion`.
3. **v2** — el proyector empieza a calcular `interpretation` y, si se decide, cambia
   `collectionKeyStrategy`. Los sightings no se tocan.

El campo existe desde el principio precisamente para que activarlo no requiera cambiar el
esquema.

## 7. Resultados de un escaneo

El resultado se calcula comparando el sighting nuevo contra la `CollectionEntry` existente.

| Resultado | Condición |
|-----------|-----------|
| `NEW_NUMBER` | No existe `CollectionEntry` para esa clave. |
| `NEW_SOURCE` | La clave existe, pero el origen no estaba en `sourcesSeen`. |
| `DUPLICATE` | La clave existe y el origen ya estaba registrado. |
| `NEW_NUMBER_UNKNOWN_SOURCE` | Número nuevo pero sin origen determinado. |

`NEW_SOURCE` es la mecánica de juego: el mismo `23` conseguido por kiosco y luego por McAuto
no son dos números, es un número con dos orígenes.

## 8. Migración desde v3

La migración a v4 es aditiva y recupera datos que la v1 había destruido.

1. Cada `CollectedNumber` v3 genera un `Sighting` con `detectionMethod: 'MIGRATED'`,
   `source`/`fulfillment` en `UNKNOWN` y `interpretation: null`.
2. Cada `ScanEvent` v3 genera un `Sighting` conservando su `rawNumber`, `source`,
   `fulfillment` y confianza por atributo si los tenía.
3. **Recuperación de la truncación lossy:** se relee la clave de respaldo
   `collectedNumbers_backup_v1`. Si contenía `0090` y la v1 lo guardó como `090`, se
   restaura `rawNumber: '0090'`. Este paso deshace la única pérdida de datos conocida.
4. La colección se reconstruye por proyección, no se copia.

No se reinterpreta nada del historial antiguo con reglas no verificadas. Un número migrado
es un número de origen desconocido, y así se muestra.
