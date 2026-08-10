import { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Info,
  Palette,
  Languages,
  ChevronRight,
  FlaskConical,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { useTheme } from '@/core/hooks/useTheme.js';
import { Button, BottomSheet, Toast, TicketMark, Flag } from '@/core/design-system';
import { buildDatasetExport } from '@/core/dataset/export.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Los nombres de idioma se muestran siempre en el propio idioma (no se
// traducen): así se reconocen aunque la app esté en un idioma que no
// entiendas. La bandera acompaña siempre al nombre.
const LANGUAGE_OPTIONS = [
  { value: 'es', flag: 'es', name: 'Español' },
  { value: 'en', flag: 'en', name: 'English' },
  { value: 'pt', flag: 'pt', name: 'Português (Portugal)' },
];

function SettingsRow({
  icon: Icon,
  label,
  value,
  valueFlag,
  danger = false,
  disabled = false,
  onClick,
  as = 'button',
  htmlFor,
  children,
}) {
  const Tag = as;
  return (
    <Tag
      {...(as === 'label' ? { htmlFor } : { type: 'button', disabled })}
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
        danger ? 'text-danger' : 'text-ink'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {valueFlag && <Flag code={valueFlag} className="w-5 h-[13.3px]" />}
      {value && <span className="text-sm text-muted">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted/60 flex-shrink-0" aria-hidden />
      {children}
    </Tag>
  );
}

function SettingsSection({ title, children }) {
  return (
    <section>
      <h2 className="text-label text-muted mb-1 px-1">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

export function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const exportCollection = useAppStore((s) => s.exportCollection);
  const importCollection = useAppStore((s) => s.importCollection);
  const resetCollection = useAppStore((s) => s.resetCollection);
  const sightings = useAppStore((s) => s.sightings);
  const { theme, setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [aboutSheetOpen, setAboutSheetOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const THEME_OPTIONS = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'system', label: t('settings.themeSystem') },
  ];
  const currentThemeLabel = THEME_OPTIONS.find((o) => o.value === theme)?.label;
  const currentLanguage = LANGUAGE_OPTIONS.find((o) => o.value === language) ?? LANGUAGE_OPTIONS[0];

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2600);
  };

  const today = new Date().toISOString().slice(0, 10);

  const handleExport = () => {
    downloadJson(exportCollection(), `mcpoints_backup_${today}.json`);
    showToast(t('settings.toastExported'), 'success');
  };

  const handleDatasetExport = () => {
    downloadJson(buildDatasetExport(sightings), `mcpoints_dataset_${today}.json`);
    showToast(t('settings.toastDatasetExported'), 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        await importCollection(parsed);
        showToast(t('settings.toastImported'), 'success');
      } catch {
        showToast(t('settings.toastInvalidFile'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="screen-padding pb-8 screen-fill flex flex-col">
      <header className="flex items-center gap-2 pt-1 flex-shrink-0">
        <TicketMark className="w-6 h-6 text-accent" strokeWidth={7} />
        <h1 className="text-heading-lg text-ink">{t('settings.title')}</h1>
      </header>

      <div className="space-y-7 mt-7">
        <SettingsSection title={t('settings.appearance')}>
          <SettingsRow
            icon={Palette}
            label={t('settings.theme')}
            value={currentThemeLabel}
            onClick={() => setThemeSheetOpen(true)}
          />
          <SettingsRow
            icon={Languages}
            label={t('settings.language')}
            value={currentLanguage.name}
            valueFlag={currentLanguage.flag}
            onClick={() => setLanguageSheetOpen(true)}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.data')}>
          <SettingsRow icon={Download} label={t('settings.exportCollection')} onClick={handleExport} />
          <SettingsRow as="label" htmlFor="import-input" icon={Upload} label={t('settings.importCollection')}>
            <input
              id="import-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </SettingsRow>
          <SettingsRow
            icon={FlaskConical}
            label={t('settings.exportDataset')}
            disabled={sightings.length === 0}
            onClick={handleDatasetExport}
          />
        </SettingsSection>

        <section>
          <h2 className="text-label text-muted mb-1 px-1">{t('settings.dangerZone')}</h2>
          {!confirmReset ? (
            <div className="divide-y divide-border">
              <SettingsRow
                icon={Trash2}
                label={t('settings.resetCollection')}
                danger
                onClick={() => setConfirmReset(true)}
              />
            </div>
          ) : (
            <div className="space-y-3 py-3">
              <p className="text-sm text-ink">{t('settings.resetConfirm')}</p>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={async () => {
                    await resetCollection();
                    setConfirmReset(false);
                    showToast(t('settings.toastReset'), 'info');
                  }}
                >
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          )}
        </section>

        <SettingsSection title={t('settings.about')}>
          <SettingsRow icon={Info} label={t('settings.aboutMcPoints')} onClick={() => setAboutSheetOpen(true)} />
        </SettingsSection>
      </div>

      <p className="text-center text-xs text-muted mt-auto pt-8 flex-shrink-0">
        McPoints v{__APP_VERSION__}
      </p>

      <BottomSheet
        open={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
        title={t('settings.theme')}
        showCancel={false}
      >
        <div className="divide-y divide-border">
          {THEME_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setThemeSheetOpen(false);
              }}
              className="w-full flex items-center justify-between py-3.5 text-left text-ink"
            >
              <span className="text-sm font-medium">{label}</span>
              {theme === value && <Check className="w-4 h-4 text-accent" aria-hidden />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={languageSheetOpen}
        onClose={() => setLanguageSheetOpen(false)}
        title={t('languagePicker.title')}
        showCancel={false}
      >
        <div className="divide-y divide-border">
          {LANGUAGE_OPTIONS.map(({ value, flag, name }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setLanguage(value);
                setLanguageSheetOpen(false);
              }}
              className="w-full flex items-center gap-3 py-3.5 text-left text-ink"
            >
              <Flag code={flag} className="w-6 h-4" />
              <span className="flex-1 text-sm font-medium">{name}</span>
              {language === value && <Check className="w-4 h-4 text-accent" aria-hidden />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        open={aboutSheetOpen}
        onClose={() => setAboutSheetOpen(false)}
        title={t('settings.aboutMcPoints')}
      >
        <div className="space-y-3 text-sm text-muted">
          <p>{t('settings.aboutText1')}</p>
          <p>{t('settings.aboutText2')}</p>
          <p>{t('settings.aboutText3')}</p>
          <p className="text-xs text-muted/80 pt-1">
            McPoints v{__APP_VERSION__} · React + Capacitor
          </p>
        </div>
      </BottomSheet>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}
