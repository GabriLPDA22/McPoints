export function EmptyState({ icon: Icon, iconClassName, iconStrokeWidth, iconProps, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6">
      {Icon && (
        <div className="relative mb-6 w-44 h-44 flex items-center justify-center">
          <span className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-accent rounded-tl-sm" />
          <span className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-accent rounded-tr-sm" />
          <span className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-accent rounded-bl-sm" />
          <span className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-accent rounded-br-sm" />
          <Icon
            className={iconClassName ?? 'w-28 h-28 text-ink/70'}
            strokeWidth={iconStrokeWidth ?? 2.5}
            {...iconProps}
          />
        </div>
      )}
      <h3 className="text-heading-lg text-ink mb-2">{title}</h3>
      {description && <p className="text-muted text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}
