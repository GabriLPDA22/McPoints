import { ORDER_SOURCE, FULFILLMENT_TYPE, PAYMENT_METHOD } from '../taxonomy/constants.js';

/**
 * Versión de las reglas de detección. Se guarda en cada avistamiento para poder
 * saber después con qué lógica se clasificó y reproyectar cuando cambie.
 * Súbela cada vez que cambie el comportamiento del motor.
 */
export const RULES_VERSION = 1;

/**
 * Dominio del número coleccionable.
 *
 * Se guarda el número tal y como aparece impreso, de 1 a 4 dígitos, sin rellenar
 * ni recortar. Nada de padLength: rellenar a 3 convertiría `48` en `048` y
 * perdería justamente el dato que la investigación necesita observar (ver la
 * anomalía del cero a la izquierda, Docs/research/domain-findings.md §1.8).
 */
export const DEFAULT_DOMAIN = {
  minDigits: 1,
  maxDigits: 4,
};

/** Etiquetas que suelen preceder o acompañar al número de pedido. */
export const ORDER_LABELS = [
  'PEDIDO',
  'N PEDIDO',
  'NUM PEDIDO',
  'NUMERO DE PEDIDO',
  'ORDEN',
  'ORDER',
  'ORDER NO',
  'ORDER NUMBER',
  'COMANDA',
];

/**
 * Textos que descalifican por completo un bloque como número de pedido.
 * El código de 4 dígitos de la app y el número de ticket fiscal son los dos
 * falsos positivos confirmados. Ver Docs/design/taxonomy.md §6.
 */
export const DISQUALIFYING_LABELS = [
  'CODIGO',
  'CHECK-IN',
  'CHECK IN',
  'ONE-TIME',
  'ONE TIME',
  'RECOMPENSA',
  'REWARDS',
  'MYMCDONALD',
  'TICKET',
  'FACTURA',
  'N TICKET',
  'NUM TICKET',
  'ENCUESTA',
  'SURVEY',
  'CIF',
  'NIF',
  'TEL',
  'IVA',
  'TOTAL',
  'EFECTIVO',
  'CAMBIO',
];

export const SOURCE_KEYWORDS = {
  [ORDER_SOURCE.KIOSK]: [
    'KIOSCO',
    'KIOSK',
    'QUIOSCO',
    'AUTOSERVICIO',
    'AUTOPEDIDO',
    'SELF ORDER',
    'SELF-ORDER',
    'TERMINAL',
  ],
  [ORDER_SOURCE.COUNTER]: ['CAJA', 'MOSTRADOR', 'TPV', 'COUNTER', 'CAJERO'],
  // 'MYMCDONALDS' queda fuera a propósito: es la marca del programa de
  // fidelización y aparece impresa en tickets de kiosco y de caja, así que no
  // es evidencia de que el pedido se hiciera desde la app.
  [ORDER_SOURCE.MOBILE_APP]: ['PEDIDO MOVIL', 'MOBILE ORDER', 'PEDIDO APP', 'MCDONALDS APP'],
  [ORDER_SOURCE.DRIVE_THRU]: ['MCAUTO', 'AUTOMAC', 'DRIVE THRU', 'DRIVE-THRU', 'DRIVETHRU'],
  [ORDER_SOURCE.DELIVERY]: [
    'MCDELIVERY',
    'DELIVERY',
    'GLOVO',
    'UBER EATS',
    'JUST EAT',
    'REPARTO',
  ],
};

export const FULFILLMENT_KEYWORDS = {
  [FULFILLMENT_TYPE.EAT_IN]: ['COMER AQUI', 'EAT IN', 'PARA TOMAR AQUI', 'TOMAR AQUI', 'SALA'],
  [FULFILLMENT_TYPE.TAKE_AWAY]: ['PARA LLEVAR', 'TAKE AWAY', 'TAKEAWAY', 'LLEVAR'],
  [FULFILLMENT_TYPE.TABLE_SERVICE]: ['SERVICIO A MESA', 'TABLE SERVICE', 'LOCALIZADOR', 'MESA'],
  [FULFILLMENT_TYPE.COUNTER_PICKUP]: [
    'RECOGER EN MOSTRADOR',
    'RECOGIDA MOSTRADOR',
    'FRONT COUNTER',
  ],
  [FULFILLMENT_TYPE.DRIVE_THRU_PICKUP]: ['MCAUTO', 'AUTOMAC', 'VENTANILLA'],
  [FULFILLMENT_TYPE.PARKING_PICKUP]: ['PARKING', 'APARCAMIENTO', 'CURBSIDE', 'PLAZA'],
  [FULFILLMENT_TYPE.DELIVERY]: ['DOMICILIO', 'MCDELIVERY', 'REPARTO'],
};

export const PAYMENT_KEYWORDS = {
  [PAYMENT_METHOD.CARD]: ['TARJETA', 'VISA', 'MASTERCARD', 'CONTACTLESS', 'CARD'],
  [PAYMENT_METHOD.CASH]: ['EFECTIVO', 'CASH', 'METALICO'],
  [PAYMENT_METHOD.MOBILE_PAY]: ['APPLE PAY', 'GOOGLE PAY', 'BIZUM', 'PAGO MOVIL'],
};

/**
 * Términos que aparecen en más de una dimensión. Cada dimensión los evalúa por
 * su cuenta: detectar MCAUTO da evidencia de DRIVE_THRU y de DRIVE_THRU_PICKUP
 * de forma independiente, nunca deduce una dimensión de la otra.
 */
export const AMBIGUOUS_KEYWORDS = ['MCAUTO', 'AUTOMAC', 'MESA', 'DELIVERY', 'REPARTO'];

export const DEFAULT_RULES = {
  version: RULES_VERSION,

  /**
   * Pesos de las señales para rankear candidatos a número de pedido.
   * No hay señal de confianza del OCR: el plugin ML Kit no la expone, así que
   * fabricarla sería inventar información. En su lugar pesan más las señales
   * geométricas, que ahora sí son reales.
   */
  signalWeights: {
    proximityLabel: 0.4,
    fontSize: 0.25,
    isolation: 0.15,
    position: 0.1,
    format: 0.1,
  },

  confidenceTiers: { high: 0.8, medium: 0.55, low: 0.3 },

  /**
   * Por debajo de este umbral, una clasificación de origen o entrega se degrada
   * a UNKNOWN. Preferimos "no lo sé" a una etiqueta incorrecta.
   */
  classificationThreshold: 0.45,

  /** Distancia vertical normalizada dentro de la cual una etiqueta cuenta como cercana. */
  labelProximityRadius: 0.18,
};
