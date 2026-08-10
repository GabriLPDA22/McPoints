// Icono de caja/mostrador — SVG aportado por el usuario, escalado a viewBox 24
// para que `strokeWidth` se comporte como en lucide-react.
//
// `absoluteStrokeWidth` y `size` se aceptan (y se descartan) para que este
// componente sea intercambiable con un icono de lucide-react sin que React
// se queje de atributos desconocidos en el <svg>.
export function CounterIcon({
  className = 'w-6 h-6',
  strokeWidth = 2,
  absoluteStrokeWidth,
  size,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect
        x="6"
        y="7"
        width="12"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path d="M7.5 7V4H16.5V7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8.25 17V20H15.75V17" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M7.5 20H16.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
