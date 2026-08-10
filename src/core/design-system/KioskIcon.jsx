// Icono de kiosco — SVG aportado por el usuario, escalado a viewBox 24
// para que `strokeWidth` se comporte como en lucide-react.
//
// `absoluteStrokeWidth` y `size` se aceptan (y se descartan) para que este
// componente sea intercambiable con un icono de lucide-react sin que React
// se queje de atributos desconocidos en el <svg>.
export function KioskIcon({
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
      <path
        d="M8.25 3.75H15.75L18 6.75V17.25H6V6.75L8.25 3.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <rect
        x="8.25"
        y="6.75"
        width="7.5"
        height="5.25"
        rx="0.55"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path d="M9 14.25H10.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M13.5 14.25H15" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10.5 17.25V20.25" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M13.5 17.25V20.25" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
