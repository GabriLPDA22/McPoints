# McPoints — Hallazgos de dominio numérico

> Investigación sobre cómo McDonald's genera los números de pedido. Prioridad: España.
> Actualizar cuando se añadan tickets reales al catálogo de `fixtures/tickets/`.

## Escala de confianza

| Nivel | Significado |
|-------|-------------|
| `CONFIRMED` | Documentación oficial o comportamiento observable de forma directa y repetible. |
| `HIGH_CONFIDENCE` | Varias evidencias independientes y consistentes. |
| `MEDIUM_CONFIDENCE` | Varios indicios que apuntan al mismo sitio, sin confirmación. |
| `LOW_CONFIDENCE` | Hipótesis razonable, apoyo débil. |
| `UNKNOWN` | No hay evidencia suficiente. |

**Regla del proyecto:** ninguna conclusión por debajo de `HIGH_CONFIDENCE` puede transformar
un dato del usuario. Se puede diseñar alrededor de una hipótesis; no se puede aplicar.

---

## 1. Conclusiones

### 1.1 `CONFIRMED` — El número de pedido es distinto del número de ticket fiscal

Los T&C de la app de McDonald's España exigen que el usuario "indique su número de pedido"
en el momento de la recogida, mientras que la facturación en `pidetufactura.mcdonalds.es`
se hace con el número de ticket. Son dos campos diferentes del mismo recibo.

**Implicación para McPoints:** el OCR debe distinguirlos. El número de ticket suele ser
largo (6+ dígitos) y va acompañado de datos fiscales.

### 1.2 `CONFIRMED` — El código de 4 dígitos de la app NO es un número de pedido

Existen al menos dos códigos de 4 dígitos distintos en el ecosistema McDonald's que no
tienen nada que ver con el número de pedido:

- **Código de check-in** de Mobile Order & Pay, que se da al personal al llegar.
- **One-time code** de MyMcDonald's Rewards, que se introduce en el kiosco *antes* de pagar
  para acumular puntos.

**Implicación para McPoints:** riesgo alto de falso positivo. Un ticket puede contener un
código de 4 dígitos que no es coleccionable. Hay que excluirlo por contexto textual.

### 1.3 `CONFIRMED` — Origen del pedido y forma de entrega son dimensiones ortogonales

El propio producto lo demuestra: un pedido iniciado en la app puede recogerse en Mostrador,
Servicio a la Mesa, Parking/Curbside o Drive-Thru. El canal por el que se pide no determina
la forma en la que se entrega.

**Implicación para McPoints:** modelar `orderSource` y `fulfillmentType` por separado, nunca
como una única categoría.

### 1.4 `CONFIRMED` — El POS es propietario y no está documentado públicamente

McDonald's usa **NewPOS / NP6**, originalmente de MediaWorks (1998), cuyo código fuente
adquirió McDonald's en 2007 para desarrollarlo internamente. No es un producto comercial,
no se licencia y no hay documentación pública de su algoritmo de numeración.

**Implicación para McPoints:** *no existirá nunca una fuente oficial* que confirme la
estructura del número. La única vía de validación es empírica, con dataset propio. Esto
convierte la sección 3 (dataset) en un requisito, no en un extra.

### 1.5 `MEDIUM_CONFIDENCE` — Hipótesis `[TERMINAL][SECUENCIA]`

**Enunciado:** los dos últimos dígitos son un contador de cola del restaurante y los dígitos
anteriores identifican el terminal donde se hizo el pedido.

Forma matemática comprobable:

```
valorMostrado = terminal * 100 + secuencia      (secuencia en 00..99)
```

**Evidencia a favor (dos observaciones independientes, mercados distintos):**

1. Respuesta en Zhihu (mercado chino, 2017): describe que los pedidos en caja producen
   3 dígitos donde el primero es el número de caja, los pedidos en kiosco producen 4 dígitos
   donde los dos primeros son el número de la máquina, y que **los dos últimos dígitos son
   la posición en una cola compartida por todo el restaurante**.
2. Blog `mba4rent` (Vancouver, Canadá, 2016) con fotografías: un recibo de kiosco marcaba
   `773` mientras la pantalla de recogida servía `567`. Es decir, pedido 73 frente a 67
   servido. El autor concluye por observación directa que el primer dígito identifica el
   kiosco y es irrelevante para la cola.

**Consistencia con los formatos observados:** todos los ejemplos recogidos encajan.

| Valor | terminal | secuencia |
|-------|----------|-----------|
| `48`   | 0  | 48 |
| `62`   | 0  | 62 |
| `253`  | 2  | 53 |
| `352`  | 3  | 52 |
| `634`  | 6  | 34 |
| `1309` | 13 | 09 |
| `1342` | 13 | 42 |
| `2323` | 23 | 23 |
| `2523` | 25 | 23 |

**Por qué no es suficiente:** dos fuentes informales, ninguna oficial, ninguna española y
ninguna verificable de forma independiente por nosotros. Que una fórmula encaje con los
datos no prueba que sea la fórmula correcta: cualquier número de 3-4 dígitos se puede partir
en `n/100` y `n%100`. La consistencia de la tabla anterior es una **tautología**, no una
evidencia. La evidencia real son las dos observaciones, y son débiles.

### 1.6 `LOW_CONFIDENCE` — El contador vuelve a 00 tras 99 y es compartido

Se deriva únicamente de la fuente de Zhihu, que afirma que "toda la tienda comparte una única
secuencia de cola". No hay observación propia. Un contador de dos dígitos implica
necesariamente reinicio en algún punto, pero ni el momento ni el alcance están verificados.

### 1.7 `UNKNOWN` — Todo lo anterior, aplicado a España

No se ha encontrado ninguna fuente española que confirme o refute la estructura. Siguen sin
respuesta:

- ¿El reinicio del contador es diario, por turno, o solo al desbordar 99?
- ¿Puede repetirse el mismo número en un mismo día y restaurante?
- ¿La pantalla de recogida muestra el número completo o recorta el prefijo?
- ¿La longitud depende del restaurante, del canal o de la versión de POS instalada?
- ¿Existen secuencias de tres dígitos en algún mercado?
- ¿Los pedidos de delivery entran en la misma cola?

### 1.8 `UNKNOWN` — La anomalía del cero a la izquierda

Es la contradicción más útil que tenemos, porque es la que puede **refutar** la hipótesis.

Bajo `valor = terminal * 100 + secuencia`, el número `48` sería terminal 0 y secuencia 48,
impreso sin relleno. Pero entonces `066` debería imprimirse como `66`, y no lo hace.

Solo hay tres explicaciones posibles y son mutuamente excluyentes:

1. El relleno a 3 dígitos depende del dispositivo que imprime, no del número. Entonces `48`
   y `066` vienen de tipos de terminal distintos.
2. `066` es terminal 0 con relleno, y `48` es un formato completamente distinto (por ejemplo,
   secuencia sin terminal). Entonces la fórmula no es universal.
3. Uno de los dos valores fue transcrito mal al recopilar los ejemplos.

**Resolver esto es la prioridad número uno del dataset.** Ver `Docs/research/hypothesis-validation.md`.

---

## 2. Tabla de formatos conocidos

Estado de cada formato observado. "Interpretación" es siempre hipótesis no aplicada.

| Formato | Ejemplos | Canal observado | Interpretación hipotética | Confianza |
|---------|----------|-----------------|---------------------------|-----------|
| 2 dígitos | `48`, `62` | Sin confirmar | terminal 0 + secuencia, o secuencia sola | `LOW` |
| 3 dígitos con cero | `066` | Sin confirmar | terminal 0 + secuencia con relleno | `UNKNOWN` |
| 3 dígitos | `253`, `352`, `634` | Caja (según Zhihu) | 1 dígito terminal + 2 secuencia | `MEDIUM` |
| 4 dígitos | `1309`, `1342`, `2323`, `2523` | Kiosco (`2323` observado por el usuario) | 2 dígitos terminal + 2 secuencia | `MEDIUM` |
| 6+ dígitos | — | — | Número de ticket fiscal, **no coleccionable** | `CONFIRMED` |

`2323` es el único ejemplo del que conocemos el contexto de primera mano: kiosco, pago con
tarjeta. Todos los demás son formatos plausibles sin contexto registrado.

---

## 3. Qué significa esto para el producto

La decisión tomada a partir de esta investigación:

1. **No se normaliza nada en v1.** `2323` se guarda y se muestra como `2323`. `terminal` y
   `sequence` quedan a `null`. La UI no enseña `#23` en ningún sitio.
2. **El número original nunca se pierde**, ni siquiera cuando en el futuro se active la
   interpretación. Ver `Docs/design/number-model.md`.
3. **La app se construye para recoger la evidencia que falta.** Cada escaneo puede aportar al
   dataset que valide o refute 1.5 y 1.8.
4. La riqueza del producto en v1 no viene de partir el número, sino del **contexto**: de dónde
   salió el pedido y cómo se entregó.

---

## 4. Fuentes

**Oficiales**

- [T&C MyMcDonald's ES](https://mcdonalds.es/documentos/legal-app) — número de pedido para recogida; ticket emitido por el restaurante.
- [pidetufactura.mcdonalds.es](https://pidetufactura.mcdonalds.es) — número de ticket ≠ número de pedido.
- [McDonald's US — Mobile Order & Pay](https://www.mcdonalds.com/us/en-us/mobile-order-and-pay.html) — puntos de recogida Curbside / Front Counter / Table Service / Drive Thru.
- [McDonald's UK — App FAQ](https://www.mcdonalds.com/gb/en-gb/good-to-know/in-our-restaurants/app-faq.html) — código de 4 dígitos de check-in y one-time code de Rewards.

**Sobre el POS**

- [Esper — What POS System Does McDonald's Use?](https://www.esper.io/blog/what-is-the-mcdonalds-pos-system-in-2023) — historia de NewPOS/NP6, MediaWorks, adquisición en 2007.

**Sobre la numeración (informales, base de la hipótesis 1.5)**

- [Zhihu — patrón de los números de cola de McDonald's](https://www.zhihu.com/en/answer/124251707) — mercado chino, 2017.
- [mba4rent — A great big game of confusion](http://mba4rent.blogspot.com/2016/02/a-great-big-game-of-confusion.html) — Vancouver, 2016, con fotografías.

**Descartado como fuente**

- [sapphire-bt/mcdonalds-uk-survey-codes](https://github.com/sapphire-bt/mcdonalds-uk-survey-codes) — el código de encuesta codifica restaurante y fecha, pero **no** el número de pedido. No sirve para esta investigación.
