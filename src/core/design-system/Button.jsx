const variants = {
  primary: 'bg-accent text-on-accent font-semibold hover:bg-accent-strong active:scale-[0.98]',
  secondary: 'bg-raised text-ink hover:bg-border/60 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 active:scale-[0.98]',
  destructive: 'bg-danger text-white hover:brightness-95 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-sm min-h-[40px]',
  md: 'px-5 py-3 text-base rounded-md min-h-[48px]',
  lg: 'px-6 py-4 text-base font-semibold rounded-lg min-h-[56px]',
  // Circular: reservado a controles realmente circulares (FAB de escanear,
  // obturador). No usar rounded-full en botones de texto ancho.
  icon: 'p-3 rounded-full min-h-[48px] min-w-[48px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
