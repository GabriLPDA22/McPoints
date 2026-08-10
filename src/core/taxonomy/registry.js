import {
  Smartphone,
  Car,
  Bike,
  Ticket,
  CircleHelp,
  Utensils,
  ShoppingBag,
  Armchair,
  ConciergeBell,
  CircleParking,
  CreditCard,
  Banknote,
} from 'lucide-react';
import {
  ORDER_SOURCE,
  FULFILLMENT_TYPE,
  PAYMENT_METHOD,
  COLLECTIBLE_SOURCES,
} from './constants.js';
import { KioskIcon } from '../design-system/KioskIcon.jsx';
import { CounterIcon } from '../design-system/CounterIcon.jsx';

/**
 * Registro único de iconografía y etiquetas. Ver Docs/design/iconography.md.
 *
 * Deliberadamente no hay un color por categoría: con seis orígenes y ocho formas
 * de entrega harían falta catorce colores accesibles en claro y oscuro, y el
 * color pasaría a ser el canal principal de información. El origen se comunica
 * siempre con icono + texto, en `text-muted`; el color se reserva para el estado
 * (el número en `accent`, los descubrimientos en `success`).
 *
 * `labelKey`/`shortLabelKey` son claves de `src/core/i18n`, no texto: los
 * `get*Meta` de abajo reciben la función `t()` del idioma activo y devuelven
 * `label`/`shortLabel` ya traducidos.
 *
 * `illustration` es opcional y solo existe para orígenes con una ilustración
 * grande propia (p. ej. la card de "Último descubrimiento" en Home). Si no hay,
 * Home usa `icon` a tamaño grande. No sustituye a `icon` en badges/listas.
 */

const SOURCE_REGISTRY = {
  [ORDER_SOURCE.KIOSK]: {
    icon: KioskIcon,
    labelKey: 'taxonomy.source.kiosk.label',
    shortLabelKey: 'taxonomy.source.kiosk.shortLabel',
  },
  [ORDER_SOURCE.COUNTER]: {
    icon: CounterIcon,
    labelKey: 'taxonomy.source.counter.label',
    shortLabelKey: 'taxonomy.source.counter.shortLabel',
  },
  [ORDER_SOURCE.MOBILE_APP]: {
    icon: Smartphone,
    labelKey: 'taxonomy.source.mobileApp.label',
    shortLabelKey: 'taxonomy.source.mobileApp.shortLabel',
  },
  [ORDER_SOURCE.DRIVE_THRU]: {
    icon: Car,
    labelKey: 'taxonomy.source.driveThru.label',
    shortLabelKey: 'taxonomy.source.driveThru.shortLabel',
  },
  [ORDER_SOURCE.DELIVERY]: {
    icon: Bike,
    labelKey: 'taxonomy.source.delivery.label',
    shortLabelKey: 'taxonomy.source.delivery.shortLabel',
  },
  [ORDER_SOURCE.OTHER]: {
    icon: Ticket,
    labelKey: 'taxonomy.source.other.label',
    shortLabelKey: 'taxonomy.source.other.shortLabel',
  },
  [ORDER_SOURCE.UNKNOWN]: {
    icon: CircleHelp,
    labelKey: 'taxonomy.source.unknown.label',
    shortLabelKey: 'taxonomy.source.unknown.shortLabel',
  },
};

const FULFILLMENT_REGISTRY = {
  [FULFILLMENT_TYPE.EAT_IN]: {
    icon: Utensils,
    labelKey: 'taxonomy.fulfillment.eatIn.label',
    shortLabelKey: 'taxonomy.fulfillment.eatIn.shortLabel',
  },
  [FULFILLMENT_TYPE.TAKE_AWAY]: {
    icon: ShoppingBag,
    labelKey: 'taxonomy.fulfillment.takeAway.label',
    shortLabelKey: 'taxonomy.fulfillment.takeAway.shortLabel',
  },
  [FULFILLMENT_TYPE.TABLE_SERVICE]: {
    icon: Armchair,
    labelKey: 'taxonomy.fulfillment.tableService.label',
    shortLabelKey: 'taxonomy.fulfillment.tableService.shortLabel',
  },
  [FULFILLMENT_TYPE.COUNTER_PICKUP]: {
    icon: ConciergeBell,
    labelKey: 'taxonomy.fulfillment.counterPickup.label',
    shortLabelKey: 'taxonomy.fulfillment.counterPickup.shortLabel',
  },
  [FULFILLMENT_TYPE.DRIVE_THRU_PICKUP]: {
    icon: Car,
    labelKey: 'taxonomy.fulfillment.driveThruPickup.label',
    shortLabelKey: 'taxonomy.fulfillment.driveThruPickup.shortLabel',
  },
  [FULFILLMENT_TYPE.PARKING_PICKUP]: {
    icon: CircleParking,
    labelKey: 'taxonomy.fulfillment.parkingPickup.label',
    shortLabelKey: 'taxonomy.fulfillment.parkingPickup.shortLabel',
  },
  [FULFILLMENT_TYPE.DELIVERY]: {
    icon: Bike,
    labelKey: 'taxonomy.fulfillment.delivery.label',
    shortLabelKey: 'taxonomy.fulfillment.delivery.shortLabel',
  },
  [FULFILLMENT_TYPE.UNKNOWN]: {
    icon: CircleHelp,
    labelKey: 'taxonomy.fulfillment.unknown.label',
    shortLabelKey: 'taxonomy.fulfillment.unknown.shortLabel',
  },
};

const PAYMENT_REGISTRY = {
  [PAYMENT_METHOD.CARD]: {
    icon: CreditCard,
    labelKey: 'taxonomy.payment.card.label',
    shortLabelKey: 'taxonomy.payment.card.shortLabel',
  },
  [PAYMENT_METHOD.CASH]: {
    icon: Banknote,
    labelKey: 'taxonomy.payment.cash.label',
    shortLabelKey: 'taxonomy.payment.cash.shortLabel',
  },
  [PAYMENT_METHOD.MOBILE_PAY]: {
    icon: Smartphone,
    labelKey: 'taxonomy.payment.mobilePay.label',
    shortLabelKey: 'taxonomy.payment.mobilePay.shortLabel',
  },
};

function resolveMeta(entry, t) {
  if (!entry) return entry;
  return { ...entry, label: t(entry.labelKey), shortLabel: t(entry.shortLabelKey) };
}

export function getSourceMeta(value, t) {
  return resolveMeta(SOURCE_REGISTRY[value] ?? SOURCE_REGISTRY[ORDER_SOURCE.UNKNOWN], t);
}

export function getFulfillmentMeta(value, t) {
  return resolveMeta(
    FULFILLMENT_REGISTRY[value] ?? FULFILLMENT_REGISTRY[FULFILLMENT_TYPE.UNKNOWN],
    t
  );
}

/** Devuelve null para pagos desconocidos: se omiten en la UI en vez de ocupar espacio. */
export function getPaymentMeta(value, t) {
  const entry = PAYMENT_REGISTRY[value];
  return entry ? resolveMeta(entry, t) : null;
}

/** Orígenes coleccionables con sus metadatos, en el orden de presentación de la UI. */
export function listCollectibleSources(t) {
  return COLLECTIBLE_SOURCES.map((value) => ({ value, ...getSourceMeta(value, t) }));
}

export { SOURCE_REGISTRY, FULFILLMENT_REGISTRY, PAYMENT_REGISTRY };
