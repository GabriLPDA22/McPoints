/**
 * Taxonomía del dominio. Origen del pedido y forma de entrega son dimensiones
 * INDEPENDIENTES: nunca se deduce una a partir de la otra ni se colapsan en una
 * sola categoría. Ver Docs/design/taxonomy.md.
 */

export const ORDER_SOURCE = {
  KIOSK: 'KIOSK',
  COUNTER: 'COUNTER',
  MOBILE_APP: 'MOBILE_APP',
  DRIVE_THRU: 'DRIVE_THRU',
  DELIVERY: 'DELIVERY',
  OTHER: 'OTHER',
  UNKNOWN: 'UNKNOWN',
};

export const ORDER_SOURCES = Object.values(ORDER_SOURCE);

/**
 * Orígenes que cuentan para la mecánica de variantes ("consigue el mismo número
 * por vías distintas"). OTHER y UNKNOWN quedan fuera: no son un canal concreto,
 * así que no pueden marcarse como conseguidos.
 */
export const COLLECTIBLE_SOURCES = [
  ORDER_SOURCE.KIOSK,
  ORDER_SOURCE.COUNTER,
  ORDER_SOURCE.MOBILE_APP,
  ORDER_SOURCE.DRIVE_THRU,
  ORDER_SOURCE.DELIVERY,
];

export const FULFILLMENT_TYPE = {
  EAT_IN: 'EAT_IN',
  TAKE_AWAY: 'TAKE_AWAY',
  TABLE_SERVICE: 'TABLE_SERVICE',
  COUNTER_PICKUP: 'COUNTER_PICKUP',
  DRIVE_THRU_PICKUP: 'DRIVE_THRU_PICKUP',
  PARKING_PICKUP: 'PARKING_PICKUP',
  DELIVERY: 'DELIVERY',
  UNKNOWN: 'UNKNOWN',
};

export const FULFILLMENT_TYPES = Object.values(FULFILLMENT_TYPE);

export const PAYMENT_METHOD = {
  CARD: 'CARD',
  CASH: 'CASH',
  MOBILE_PAY: 'MOBILE_PAY',
  UNKNOWN: 'UNKNOWN',
};

export const PAYMENT_METHODS = Object.values(PAYMENT_METHOD);

/**
 * Quién decidió el valor de un atributo. Es obligatorio distinguirlo para poder
 * medir la precisión del clasificador sin contar como acierto una etiqueta que
 * puso el propio usuario.
 */
export const CLASSIFICATION_ORIGIN = {
  AUTO_DETECTED: 'AUTO_DETECTED',
  USER_CONFIRMED: 'USER_CONFIRMED',
  USER_SELECTED: 'USER_SELECTED',
  UNKNOWN: 'UNKNOWN',
};

/** Orígenes de clasificación que sí evalúan al motor OCR. */
export const MACHINE_ORIGINS = [
  CLASSIFICATION_ORIGIN.AUTO_DETECTED,
  CLASSIFICATION_ORIGIN.USER_CONFIRMED,
];

export const DETECTION_METHOD = {
  OCR: 'OCR',
  MANUAL: 'MANUAL',
  MIGRATED: 'MIGRATED',
  IMPORTED: 'IMPORTED',
};

/** Resultado de contrastar un avistamiento nuevo con la colección existente. */
export const DISCOVERY_OUTCOME = {
  NEW_NUMBER: 'NEW_NUMBER',
  NEW_SOURCE: 'NEW_SOURCE',
  DUPLICATE: 'DUPLICATE',
};

/**
 * Cómo se calcula la clave de colección a partir del avistamiento.
 * RAW      — la clave es el número tal cual se leyó (v1).
 * SEQUENCE — la clave es la secuencia interpretada. Requiere que la hipótesis
 *            terminal|secuencia esté validada. Ver Docs/research/hypothesis-validation.md.
 */
export const COLLECTION_KEY_STRATEGY = {
  RAW: 'RAW',
  SEQUENCE: 'SEQUENCE',
};

export function isKnownSource(value) {
  return COLLECTIBLE_SOURCES.includes(value);
}

export function isKnownFulfillment(value) {
  return !!value && value !== FULFILLMENT_TYPE.UNKNOWN;
}
