import { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Info,
  Palette,
  Languages,
  FlaskConical,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/core/store/useAppStore.js';
import { useTheme } from '@/core/hooks/useTheme.js';
import { Button, BottomSheet, Toast, Flag, Masthead, Paper, PaperHeader, Rule, Barcode } from '@/core/design-system';
import { saveJsonFile } from '@/core/platform/saveJsonFile.js';
import { buildDatasetExport } from '@/core/dataset/export.js';
import { useTranslation } from '@/core/i18n/useTranslation.js';
import { localDayKey } from '@/core/storage/insights.js';

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
      className={`flex min-h-[48px] w-full cursor-pointer items-center gap-3 text-left text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
        disabled ? 'pointer-events-none opacity-40' : ''
      }`}
    >
      <Icon className="h-[19px] w-[19px] flex-shrink-0" strokeWidth={1.9} aria-hidden />
      <span className="text-[15px] font-medium">{label}</span>
      <span className="leader" aria-hidden />
      {valueFlag && <Flag code={valueFlag} className="h-[13.3px] w-5" />}
      <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em]">{value ?? '→'}</span>
      {children}
    </Tag>
  );
}

function SettingsGroup({ title, first = false, children }) {
  return (
    <div className={first ? '' : 'mt-5'}>
      <PaperHeader title={title} />
      <Rule className="mb-1 mt-3" />
      {children}
    </div>
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

  const today = localDayKey(new Date());

  const exportFile = async (data, filename, successMessage) => {
    try {
      const result = await saveJsonFile(data, filename, { dialogTitle: t('settings.exportDialogTitle') });
      if (result !== 'cancelled') showToast(successMessage, 'success');
    } catch (e) {
      console.error('Export failed', e);
      showToast(t('settings.toastExportFailed'), 'error');
    }
  };

  const handleExport = () =>
    exportFile(exportCollection(), `mcpoints_backup_${today}.json`, t('settings.toastExported'));

  const handleDatasetExport = () =>
    exportFile(buildDatasetExport(sightings), `mcpoints_dataset_${today}.json`, t('settings.toastDatasetExported'));

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
    <div className="screen-padding pb-6">
      <Masthead title={t('settings.title')} />

      <Paper torn className="px-5 pb-5 pt-5">
        <SettingsGroup title={t('settings.appearance')} first>
          <SettingsRow
            icon={Palette}
            label={t('settings.theme')}
            value={currentThemeLabel}
            onClick={() => setThemeSheetOpen(true)}
          />
          <SettingsRow
            icon={Languages}
            label={t('settings.language')}
            value={currentLanguage.value}
            valueFlag={currentLanguage.flag}
            onClick={() => setLanguageSheetOpen(true)}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.data')}>
          <SettingsRow icon={Download} label={t('settings.exportCollection')} onClick={handleExport} />
          <SettingsRow as="label" htmlFor="import-input" icon={Upload} label={t('settings.importCollection')}>
            <input id="import-input" type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          </SettingsRow>
          <SettingsRow
            icon={FlaskConical}
            label={t('settings.exportDataset')}
            disabled={sightings.length === 0}
            onClick={handleDatasetExport}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.about')}>
          <SettingsRow icon={Info} label="McPoints" value={`v${__APP_VERSION__}`} onClick={() => setAboutSheetOpen(true)} />
        </SettingsGroup>

        <Rule className="my-4" />
        <Barcode value={__APP_VERSION__} height={26} caption={t('settings.thanks')} />
      </Paper>

      <div className="mt-6">
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-danger text-[15px] font-semibold text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            {t('settings.resetCollection')}
          </button>
        ) : (
          <div className="space-y-3 rounded-[12px] border-2 border-danger p-4">
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
      </div>

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
