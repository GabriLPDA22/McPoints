const SIZES = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', gap: 'gap-1' },
  md: { icon: 'w-3.5 h-3.5', text: 'text-sm', gap: 'gap-1.5' },
  lg: { icon: 'w-4 h-4', text: 'text-base', gap: 'gap-2' },
};

/**
 * Icono + etiqueta de una categoría (origen, entrega o pago).
 *
 * Siempre lleva texto visible: el origen nunca se comunica solo con color ni
 * solo con forma. Por eso tampoco tiene variantes de color por categoría — el
 * color se reserva para el estado. Ver Docs/design/iconography.md.
 */
export function TaxonomyBadge({ meta, size = 'md', short = false, className = '' }) {
  if (!meta) return null;

  const Icon = meta.icon;
  const { icon, text, gap } = SIZES[size] ?? SIZES.md;
  const label = short ? meta.shortLabel : meta.label;

  return (
    <span className={`inline-flex items-center ${gap} ${text} text-muted ${className}`}>
      <Icon className={`${icon} flex-shrink-0`} aria-hidden />
      {label}
    </span>
  );
}
