// Español — idioma por defecto de McPoints.
export const es = {
  locale: 'es-ES',

  time: {
    justNow: 'ahora mismo',
    minutesAgo: (n) => `hace ${n} min`,
    today: 'Hoy',
    yesterday: 'Ayer',
    daysAgo: (n) => `hace ${n} días`,
  },

  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    back: 'Volver',
  },

  nav: {
    home: 'Inicio',
    collection: 'Colección',
    scanAria: 'Escanear ticket',
    history: 'Historial',
    settings: 'Ajustes',
    mainNavAria: 'Navegación principal',
  },

  home: {
    emptyTitle: 'Tu colección empieza con un ticket',
    scanCta: 'Escanear ticket',
    manualEntry: 'Introducir manualmente',
    scanButton: 'Escanear',
    uniqueSingular: 'número único',
    uniquePlural: 'números únicos',
    newThisMonth: (n) => `+${n} este mes`,
    lastDiscovery: 'Último descubrimiento',
    byOrigin: 'Por origen',
    noOrigin: 'Sin origen',
  },

  collection: {
    title: 'Colección',
    emptyTitle: 'Tu colección empieza con un ticket',
    emptyDescription: 'Escanea el ticket de tu próximo pedido para empezar',
    scanCta: 'Escanear ticket',
    searchPlaceholder: 'Buscar número...',
    filterSort: 'Filtrar y ordenar',
    noResultsTitle: 'Sin resultados',
    noResultsDescription: 'Prueba otro filtro o término de búsqueda',
  },

  filters: {
    title: 'Filtrar y ordenar',
    origin: 'Origen',
    all: 'Todos',
    unknown: 'Desconocido',
    digits: 'Dígitos',
    order: 'Orden',
    sortRecent: 'Más recientes',
    sortOldest: 'Más antiguos',
    sortAsc: 'Ascendente',
    sortMostFound: 'Más encontrados',
    clear: 'Limpiar',
    apply: 'Aplicar',
  },

  detail: {
    notFoundTitle: 'Número no encontrado',
    notFoundDescription: 'Puede que lo hayas eliminado de tu colección',
    backToCollection: 'Volver a la colección',
    backAria: 'Volver',
    discoveredOnce: 'Descubierto 1 vez',
    discoveredTimes: (n) => `Descubierto ${n} veces`,
    firstTimeOn: (date) => `Primera vez el ${date}`,
    origins: 'Orígenes',
    missingOne: 'Te falta 1 origen',
    missingMany: (n) => `Te faltan ${n} orígenes`,
    history: 'Historial',
    classifySightingAria: (n) => `Clasificar el avistamiento de ${n}`,
    deleteConfirmOne: 'Se eliminará el avistamiento de este número.',
    deleteConfirmMany: (n) => `Se eliminarán los ${n} avistamientos de este número.`,
    delete: 'Eliminar',
    deleteFromCollection: 'Eliminar de la colección',
  },

  history: {
    title: 'Historial',
    emptyTitle: 'Sin historial',
    emptyDescription: 'Tus escaneos y entradas manuales aparecerán aquí',
    filterAll: 'Todos',
    filterClassified: 'Con origen',
    filterUnclassified: 'Sin origen',
    today: 'Hoy',
    yesterday: 'Ayer',
    newBadge: 'Nuevo',
  },

  settings: {
    title: 'Ajustes',
    appearance: 'Apariencia',
    theme: 'Tema',
    language: 'Idioma',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Sistema',
    data: 'Datos',
    exportCollection: 'Exportar colección',
    importCollection: 'Importar colección',
    exportDataset: 'Exportar dataset de investigación',
    dangerZone: 'Zona de riesgo',
    resetCollection: 'Reiniciar colección',
    resetConfirm: '¿Eliminar todos los números? No se puede deshacer.',
    about: 'Acerca de',
    aboutMcPoints: 'Acerca de McPoints',
    aboutText1:
      "McPoints no está afiliada a McDonald's Corporation. Es un proyecto independiente para uso personal.",
    aboutText2: 'El OCR se procesa en el dispositivo: ninguna foto de ticket sale de tu teléfono.',
    aboutText3:
      "Aún no sabemos con certeza cómo genera McDonald's los números de pedido, así que McPoints guarda el número tal y como aparece en el ticket y no lo interpreta.",
    toastExported: 'Colección exportada',
    toastDatasetExported: 'Dataset exportado',
    toastImported: 'Colección importada correctamente',
    toastInvalidFile: 'Archivo no válido',
    toastReset: 'Colección reiniciada',
  },

  scanner: {
    frameTicket: 'Encuadra el ticket',
    closeAria: 'Cerrar',
    readingHint: 'Leemos el número y de dónde salió el pedido',
    processing: 'Procesando...',
    captureAria: 'Capturar',
    manualEntryAria: 'Entrada manual',
    whichNumber: '¿Cuál es el número de pedido?',
    manualNumberTitle: 'Número manual',
    manualHint:
      'Escribe el número tal y como aparece en el ticket, incluidos los ceros a la izquierda.',
    confirm: 'Confirmar',
    errorInvalidNumber: 'Ese número no es válido.',
    errorNoDetection: 'No detectamos un número. Prueba de nuevo o introdúcelo manualmente.',
    errorPermission: 'Permiso de cámara denegado. Actívalo en ajustes o usa entrada manual.',
    errorGeneric: 'Error al escanear. Introduce el número manualmente.',
    errorManualRange: (min, max) => `Introduce un número de ${min} a ${max} dígitos`,
  },

  scanResult: {
    newDiscovery: 'Nuevo descubrimiento',
    newVariant: 'Nueva variante',
    alreadyHad: 'Ya lo tenías',
    newSourceHint: 'Ya tenías este número: es la primera vez que lo consigues por este canal.',
    gotOnce: 'Conseguido 1 vez.',
    gotTimes: (n) => `Conseguido ${n} veces.`,
    unknownSourceHint: 'No hemos podido identificar cómo se realizó este pedido.',
    classify: 'Clasificar',
    ticketLabel: (n) => `Ticket: ${n}`,
    viewNumber: 'Ver número',
    scanAnother: 'Escanear otro',
  },

  sourcePicker: {
    title: '¿Cómo hiciste este pedido?',
    dontKnow: 'No lo sé',
  },

  sourceChecklist: {
    gotTimesAria: (label, count) =>
      `${label}: conseguido ${count} ${count === 1 ? 'vez' : 'veces'}`,
    pendingAria: 'pendiente',
  },

  discoveryCell: {
    ariaSingle: (num, label) => `Número ${num}, origen ${label}`,
    ariaMulti: (num, label, count) => `Número ${num}, origen ${label}, ${count} orígenes distintos`,
  },

  languagePicker: {
    title: 'Idioma',
  },

  taxonomy: {
    source: {
      kiosk: { label: 'Kiosco', shortLabel: 'Kiosco' },
      counter: { label: 'Caja', shortLabel: 'Caja' },
      mobileApp: { label: 'App', shortLabel: 'App' },
      driveThru: { label: 'McAuto', shortLabel: 'McAuto' },
      delivery: { label: 'Delivery', shortLabel: 'Delivery' },
      other: { label: 'Otro canal', shortLabel: 'Otro' },
      unknown: { label: 'Origen desconocido', shortLabel: 'Sin origen' },
    },
    fulfillment: {
      eatIn: { label: 'Comer aquí', shortLabel: 'Aquí' },
      takeAway: { label: 'Para llevar', shortLabel: 'Llevar' },
      tableService: { label: 'Servicio a mesa', shortLabel: 'Mesa' },
      counterPickup: { label: 'Recoger en mostrador', shortLabel: 'Mostrador' },
      driveThruPickup: { label: 'Recoger en McAuto', shortLabel: 'McAuto' },
      parkingPickup: { label: 'Recoger en parking', shortLabel: 'Parking' },
      delivery: { label: 'Reparto a domicilio', shortLabel: 'Reparto' },
      unknown: { label: 'Entrega desconocida', shortLabel: 'Sin datos' },
    },
    payment: {
      card: { label: 'Tarjeta', shortLabel: 'Tarjeta' },
      cash: { label: 'Efectivo', shortLabel: 'Efectivo' },
      mobilePay: { label: 'Pago móvil', shortLabel: 'Móvil' },
    },
    method: {
      ocr: 'Escaneado',
      manual: 'Manual',
      migrated: 'Importado de la versión anterior',
      imported: 'Importado',
    },
    dontKnow: 'No lo sé',
  },
};
