// Português europeu (Portugal) — deliberadamente NÃO é português do Brasil.
// Vocabulário: "talão" em vez de "recibo/senha", "definições" em vez de
// "configurações", "recolha" em vez de "retirada/coleta", "ficheiro" em vez
// de "arquivo", "digitalizar" em vez de "escanear".
export const pt = {
  locale: 'pt-PT',

  time: {
    justNow: 'agora mesmo',
    minutesAgo: (n) => `há ${n} min`,
    today: 'Hoje',
    yesterday: 'Ontem',
    daysAgo: (n) => `há ${n} dias`,
  },

  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Fechar',
    back: 'Voltar',
  },

  nav: {
    home: 'Início',
    collection: 'Coleção',
    scanAria: 'Digitalizar talão',
    history: 'Histórico',
    settings: 'Definições',
    mainNavAria: 'Navegação principal',
  },

  home: {
    emptyTitle: 'A tua coleção começa com um talão',
    scanCta: 'Digitalizar talão',
    manualEntry: 'Introduzir manualmente',
    scanButton: 'Digitalizar',
    uniqueSingular: 'número único',
    uniquePlural: 'números únicos',
    newThisMonth: (n) => `+${n} este mês`,
    lastDiscovery: 'Última descoberta',
    byOrigin: 'Por origem',
    noOrigin: 'Sem origem',
  },

  collection: {
    title: 'Coleção',
    emptyTitle: 'A tua coleção começa com um talão',
    emptyDescription: 'Digitaliza o talão do teu próximo pedido para comecar',
    scanCta: 'Digitalizar talão',
    searchPlaceholder: 'Procurar número...',
    filterSort: 'Filtrar e ordenar',
    noResultsTitle: 'Sem resultados',
    noResultsDescription: 'Tenta outro filtro ou termo de pesquisa',
  },

  filters: {
    title: 'Filtrar e ordenar',
    origin: 'Origem',
    all: 'Todos',
    unknown: 'Desconhecido',
    digits: 'Dígitos',
    order: 'Ordenar',
    sortRecent: 'Mais recentes',
    sortOldest: 'Mais antigos',
    sortAsc: 'Ascendente',
    sortMostFound: 'Mais encontrados',
    clear: 'Limpar',
    apply: 'Aplicar',
  },

  detail: {
    notFoundTitle: 'Número não encontrado',
    notFoundDescription: 'Pode tê-lo removido da tua coleção',
    backToCollection: 'Voltar à coleção',
    backAria: 'Voltar',
    discoveredOnce: 'Descoberto 1 vez',
    discoveredTimes: (n) => `Descoberto ${n} vezes`,
    firstTimeOn: (date) => `Primeira vez em ${date}`,
    origins: 'Origens',
    missingOne: 'Falta-te 1 origem',
    missingMany: (n) => `Faltam-te ${n} origens`,
    history: 'Histórico',
    classifySightingAria: (n) => `Classificar o avistamento de ${n}`,
    deleteConfirmOne: 'O avistamento deste número será eliminado.',
    deleteConfirmMany: (n) => `Serão eliminados os ${n} avistamentos deste número.`,
    delete: 'Eliminar',
    deleteFromCollection: 'Eliminar da coleção',
  },

  history: {
    title: 'Histórico',
    emptyTitle: 'Sem histórico',
    emptyDescription: 'As tuas digitalizações e entradas manuais vão aparecer aqui',
    filterAll: 'Todos',
    filterClassified: 'Com origem',
    filterUnclassified: 'Sem origem',
    today: 'Hoje',
    yesterday: 'Ontem',
    newBadge: 'Novo',
  },

  settings: {
    title: 'Definições',
    appearance: 'Aparência',
    theme: 'Tema',
    language: 'Língua',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    themeSystem: 'Sistema',
    data: 'Dados',
    exportCollection: 'Exportar coleção',
    importCollection: 'Importar coleção',
    exportDataset: 'Exportar dataset de investigação',
    dangerZone: 'Zona de risco',
    resetCollection: 'Reiniciar coleção',
    resetConfirm: 'Eliminar todos os números? Não é possível desfazer.',
    about: 'Acerca de',
    aboutMcPoints: 'Acerca do McPoints',
    aboutText1:
      "O McPoints não está afiliado à McDonald's Corporation. É um projeto independente para uso pessoal.",
    aboutText2: 'O OCR é processado no dispositivo: nenhuma foto do talão sai do teu telemóvel.',
    aboutText3:
      "Ainda não sabemos com certeza como a McDonald's gera os números de pedido, por isso o McPoints guarda o número exatamente como aparece no talão e não o interpreta.",
    toastExported: 'Coleção exportada',
    toastDatasetExported: 'Dataset exportado',
    toastImported: 'Coleção importada com sucesso',
    toastInvalidFile: 'Ficheiro inválido',
    toastReset: 'Coleção reiniciada',
  },

  scanner: {
    frameTicket: 'Enquadra o talão',
    closeAria: 'Fechar',
    readingHint: 'Lemos o número e de onde veio o pedido',
    processing: 'A processar...',
    captureAria: 'Capturar',
    manualEntryAria: 'Entrada manual',
    whichNumber: 'Qual é o número do pedido?',
    manualNumberTitle: 'Número manual',
    manualHint: 'Escreve o número exatamente como aparece no talão, incluindo os zeros à esquerda.',
    confirm: 'Confirmar',
    errorInvalidNumber: 'Esse número não é válido.',
    errorNoDetection: 'Não detetámos nenhum número. Tenta novamente ou introduz-o manualmente.',
    errorPermission: 'Permissão da câmara negada. Ativa-a nas definições ou usa a entrada manual.',
    errorCapture: 'A câmara não respondeu. Reiniciámo-la: tenta outra vez.',
    errorOcr: 'Não foi possível ler o talão. Se for a primeira vez, espera uns segundos até o leitor estar pronto e tenta de novo.',
    errorGeneric: 'Erro ao digitalizar. Introduz o número manualmente.',
    errorManualRange: (min, max) => `Introduz um número de ${min} a ${max} dígitos`,
  },

  scanResult: {
    newDiscovery: 'Nova descoberta',
    newVariant: 'Nova variante',
    alreadyHad: 'Já o tinhas',
    newSourceHint: 'Já tinhas este número: é a primeira vez que o consegues por este canal.',
    gotOnce: 'Conseguido 1 vez.',
    gotTimes: (n) => `Conseguido ${n} vezes.`,
    unknownSourceHint: 'Não conseguimos identificar como este pedido foi feito.',
    classify: 'Classificar',
    ticketLabel: (n) => `Talão: ${n}`,
    viewNumber: 'Ver número',
    scanAnother: 'Digitalizar outro',
  },

  sourcePicker: {
    title: 'Como fizeste este pedido?',
    dontKnow: 'Não sei',
  },

  sourceChecklist: {
    gotTimesAria: (label, count) =>
      `${label}: conseguido ${count} ${count === 1 ? 'vez' : 'vezes'}`,
    pendingAria: 'pendente',
  },

  discoveryCell: {
    ariaSingle: (num, label) => `Número ${num}, origem ${label}`,
    ariaMulti: (num, label, count) => `Número ${num}, origem ${label}, ${count} origens diferentes`,
  },

  languagePicker: {
    title: 'Língua',
  },

  taxonomy: {
    source: {
      kiosk: { label: 'Quiosque', shortLabel: 'Quiosque' },
      counter: { label: 'Balcão', shortLabel: 'Balcão' },
      mobileApp: { label: 'App', shortLabel: 'App' },
      driveThru: { label: 'McDrive', shortLabel: 'McDrive' },
      delivery: { label: 'Entrega', shortLabel: 'Entrega' },
      other: { label: 'Outro canal', shortLabel: 'Outro' },
      unknown: { label: 'Origem desconhecida', shortLabel: 'Sem origem' },
    },
    fulfillment: {
      eatIn: { label: 'Comer aqui', shortLabel: 'Aqui' },
      takeAway: { label: 'Para levar', shortLabel: 'Levar' },
      tableService: { label: 'Serviço de mesa', shortLabel: 'Mesa' },
      counterPickup: { label: 'Recolha no balcão', shortLabel: 'Balcão' },
      driveThruPickup: { label: 'Recolha no McDrive', shortLabel: 'McDrive' },
      parkingPickup: { label: 'Recolha no parque', shortLabel: 'Parque' },
      delivery: { label: 'Entrega ao domicílio', shortLabel: 'Entrega' },
      unknown: { label: 'Entrega desconhecida', shortLabel: 'Sem dados' },
    },
    payment: {
      card: { label: 'Cartão', shortLabel: 'Cartão' },
      cash: { label: 'Dinheiro', shortLabel: 'Dinheiro' },
      mobilePay: { label: 'Pagamento móvel', shortLabel: 'Móvel' },
    },
    method: {
      ocr: 'Digitalizado',
      manual: 'Manual',
      migrated: 'Importado da versão anterior',
      imported: 'Importado',
    },
    dontKnow: 'Não sei',
  },
};
