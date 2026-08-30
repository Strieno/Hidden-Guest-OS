import * as React from 'react';
import { Download, Upload, RotateCcw, Volume2, VolumeX, Languages, Info } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { Confirm } from '../../components/ui';

export function Settings() {
  const { t, lang } = useI18n();
  const { data, updateSettings, exportJson, importJson, resetAll, toast, t: tr } = useStore();
  const [confirmReset, setConfirmReset] = React.useState(false);

  const doExport = () => {
    const a = document.createElement('a');
    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(exportJson())}`;
    a.download = `gate-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast(tr('settings.exported'));
  };

  const doImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const ok = importJson(String(reader.result ?? ''));
        toast(ok ? tr('settings.imported') : tr('admin.invalid'));
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="page">
      <PageTitle over="SETTINGS" title={t('settings.title')} text={t('settings.desc')} />
      <div className="settings-grid">
        <section className="card setting">
          <span className="setting-ic"><Languages size={20} /></span>
          <div>
            <h3>{t('settings.lang')}</h3>
            <p>{lang === 'ar' ? 'العربية · English' : 'English · العربية'}</p>
            <div className="seg">
              <button className={lang === 'ar' ? 'on' : ''} onClick={() => updateSettings({ lang: 'ar' })}>العربية</button>
              <button className={lang === 'en' ? 'on' : ''} onClick={() => updateSettings({ lang: 'en' })}>English</button>
            </div>
          </div>
        </section>

        <section className="card setting">
          <span className="setting-ic">{data.settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</span>
          <div>
            <h3>{t('settings.sound')}</h3>
            <p>{t('settings.soundDesc')}</p>
            <div className="seg">
              <button className={data.settings.sound ? 'on' : ''} onClick={() => updateSettings({ sound: true })}>{t('sound.on')}</button>
              <button className={!data.settings.sound ? 'on' : ''} onClick={() => updateSettings({ sound: false })}>{t('sound.off')}</button>
            </div>
          </div>
        </section>

        <section className="card setting">
          <span className="setting-ic"><Download size={20} /></span>
          <div>
            <h3>{t('settings.export')}</h3>
            <p>{t('settings.desc')}</p>
            <button className="btn" onClick={doExport}>{t('settings.export')}</button>
          </div>
        </section>

        <section className="card setting">
          <span className="setting-ic"><Upload size={20} /></span>
          <div>
            <h3>{t('settings.import')}</h3>
            <p>{t('settings.desc')}</p>
            <button className="btn" onClick={doImport}>{t('settings.import')}</button>
          </div>
        </section>

        <section className="card setting danger-setting">
          <span className="setting-ic"><RotateCcw size={20} /></span>
          <div>
            <h3>{t('settings.reset')}</h3>
            <p>{t('settings.resetConfirm')}</p>
            <button className="btn danger" onClick={() => setConfirmReset(true)}>{t('settings.reset')}</button>
          </div>
        </section>
      </div>

      <div className="card local-note">
        <Info size={18} />
        <p>{t('settings.local')}</p>
      </div>

      <Confirm
        open={confirmReset}
        title={t('settings.reset')}
        text={t('settings.resetConfirm')}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => { resetAll(); setConfirmReset(false); toast(tr('settings.resetDone')); }}
      />
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
