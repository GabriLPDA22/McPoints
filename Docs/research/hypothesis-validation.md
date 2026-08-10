# Protocolo de validación de la hipótesis `[TERMINAL][SECUENCIA]`

Este documento define, **por adelantado**, qué evidencia haría falta para activar la
normalización de números en McPoints. Se escribe antes de recoger los datos a propósito:
fijar el criterio después de mirar los resultados es la forma más fácil de confirmar una
hipótesis falsa.

## 1. La hipótesis

```
valorMostrado = terminal * 100 + secuencia,   con secuencia en 00..99
```

Estado actual: `MEDIUM_CONFIDENCE`, sin ninguna fuente española.
Ver `Docs/research/domain-findings.md` §1.5.

## 2. Qué se necesita medir

El problema es que la hipótesis no es falsable con un solo ticket. Cualquier número se puede
partir en `n / 100` y `n % 100`. Lo que la hace falsable es el comportamiento **entre**
tickets del mismo restaurante.

### Predicción P1 — Monotonía de la secuencia

Dentro de un mismo restaurante y una misma franja horaria, si se ordenan los avistamientos
por hora, `n % 100` debe crecer de forma monótona, admitiendo saltos (pedidos de otros
clientes) y un único envolvimiento por cada 100 pedidos.

Si dos tickets consecutivos separados por minutos dan secuencias que se mueven hacia atrás
sin haber pasado por 99, la hipótesis falla.

### Predicción P2 — Estabilidad del prefijo

Dos pedidos hechos en el **mismo kiosco físico** deben compartir `floor(n / 100)`. Dos
pedidos hechos en kioscos distintos del mismo restaurante deben tener prefijos distintos.

Esta es la predicción más fuerte y la más fácil de comprobar deliberadamente: basta con
hacer dos pedidos en la misma máquina y dos en máquinas diferentes.

### Predicción P3 — Correlación prefijo/canal

Si la fuente de Zhihu es correcta, los pedidos de caja deberían producir prefijos de un
dígito y los de kiosco prefijos de dos. Si aparecen kioscos con prefijo de un dígito, la
regla no es "kiosco = 4 dígitos", sino simplemente "prefijo = identificador de terminal",
que sigue siendo compatible con la hipótesis pero invalida la clasificación por longitud.

**Importante:** aunque P3 se confirme, el número **nunca** se usará para inferir el origen.
Esa regla está prohibida por diseño. P3 solo sirve para entender el sistema.

### Prueba de refutación R1 — La anomalía del cero

Resolver por qué `066` lleva cero a la izquierda y `48` no. Ver `domain-findings.md` §1.8.
Hace falta al menos un ticket real de cada formato, con foto de la zona del número, para
determinar si el relleno depende del dispositivo o si son sistemas de numeración distintos.

## 3. Volumen y variedad mínimos

| Requisito | Mínimo |
|-----------|--------|
| Tickets españoles totales | 40 |
| Restaurantes distintos | 3 |
| Tickets del mismo restaurante en la misma sesión | 6 (para P1) |
| Pedidos en el mismo kiosco identificado | 3 (para P2) |
| Kioscos distintos del mismo restaurante | 2 (para P2) |
| Tickets de caja | 5 (para P3) |
| Tickets con formato de 2 dígitos y de 3 con cero | 1 de cada (para R1) |

Son cifras alcanzables por una sola persona en unas semanas. Están calibradas para ser
suficientes para P2, que es la predicción decisiva, no para tener significancia estadística
sobre P1.

## 4. Criterio de decisión

Se sube `rulesVersion` y se activa `interpretation` **solo si**:

1. P2 se cumple sin excepciones en la muestra. Una sola violación la bloquea.
2. P1 se cumple en al menos el 90 % de los pares consecutivos del mismo restaurante.
3. R1 queda explicado, sea cual sea la explicación.

Si se cumple todo, la hipótesis pasa a `HIGH_CONFIDENCE` y el motor empieza a **calcular**
`interpretation`. Cambiar además `collectionKeyStrategy` a `SEQUENCE` es una decisión de
producto **separada**: partir el número y coleccionar solo la secuencia reduciría el
universo coleccionable a 100 valores, y eso hay que decidirlo mirando el producto, no la
investigación.

Si algo falla, la hipótesis baja a `LOW_CONFIDENCE` y se documenta qué la refutó.

## 5. Cómo se recogen los datos

Dos vías, ambas ya soportadas:

1. **Exportación desde la app.** Ajustes → Contribuir al dataset. Genera un JSON con el
   texto OCR, los números detectados, las clasificaciones confirmadas y las marcas de
   tiempo. Sin fotos ni importes.
2. **Fixtures manuales.** Entradas en `fixtures/tickets/catalog.json` con el etiquetado
   completo, incluidos `observedTerminal` y `observedSequence` cuando el usuario los conozca
   por observación directa (por ejemplo, apuntando qué kiosco físico usó).

El campo `verifiedByUser` distingue lo observado de lo inferido. Solo lo verificado cuenta
para P2.

## 6. Cómo se comprueba

El criterio no es solo prosa: está implementado en `src/core/dataset/hypothesis.js` y se
ejecuta sobre un dataset exportado.

```bash
npm run analyze:hypothesis -- mcpoints_dataset_2026-08-10.json
```

Imprime el estado de cobertura, P1, P2 y R1, y un veredicto:

| Veredicto | Significado |
|-----------|-------------|
| `INSUFFICIENT_DATA` | Faltan tickets. La app sigue sin interpretar. |
| `REFUTED` | Hay conflictos de prefijo comprobables. Documentarlo en `domain-findings.md`. |
| `SUPPORTED` | Se cumple todo. Se puede subir `RULES_VERSION` y activar la interpretación. |

El análisis ignora los registros sin `observedTerminal` en P2. Deducir el terminal del
número y luego comprobar que coincide con lo deducido sería razonar en círculo, y es la
forma más habitual de "confirmar" una hipótesis falsa.

## 7. Qué NO valida la hipótesis

- Que la fórmula encaje con los números que ya tenemos. Encaja con cualquier número; es una
  tautología aritmética, no evidencia.
- Que un empleado lo diga. Es un indicio, súmalo a `domain-findings.md`, pero no sustituye a
  P2.
- Que se cumpla en otro país. La app es para España y el POS puede estar configurado por
  mercado.
