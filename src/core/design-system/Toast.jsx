import { CheckCircle2, XCircle, Info } from 'lucide-react';

const config = {
  success: { icon: CheckCircle2, tone: 'text-success' },
  error: { icon: XCircle, tone: 'text-danger' },
  info: { icon: Info, tone: 'text-accent' },
};

export function Toast({ message, type = 'success', visible }) {
  if (!visible || !message) return null;

  const { icon: Icon, tone } = config[type] || config.info;

  return (
    <div
      role="status"
      style={{ bottom: 'calc(var(--dock-space) + 8px)' }}
      className="fixed left-1/2 -translate-x-1/2 z-[60] max-w-[92%] animate-slide-up"
    >
      <div className="flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-full bg-ink shadow-soft">
        <Icon className={`w-4 h-4 flex-shrink-0 ${tone}`} />
        <span className="text-sm font-medium text-bg">{message}</span>
      </div>
    </div>
  );
}
