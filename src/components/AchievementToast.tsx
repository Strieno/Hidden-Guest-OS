import * as React from 'react';
import { Trophy } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useI18n } from '../lib/i18n';

export function AchievementToast() {
  const { unlocks, dismissUnlock, lang } = useStore();
  const { t } = useI18n();
  const [leaving, setLeaving] = React.useState(false);

  const current = unlocks[0];

  React.useEffect(() => {
    if (!current) { setLeaving(false); return; }
    const timer = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => { dismissUnlock(); setLeaving(false); }, 450);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [current, dismissUnlock]);

  if (!current) return null;

  return (
    <div className={`ach-toast ${leaving ? 'ach-leave' : ''}`} role="status" aria-live="polite">
      <span className="ach-ic"><Trophy size={22} /></span>
      <div>
        <small>{t('ach.unlocked')} · +{current.xp} XP</small>
        <b>{current.icon} {lang === 'ar' ? current.ar : current.en}</b>
        <p>{lang === 'ar' ? current.descAr : current.descEn}</p>
      </div>
    </div>
  );
}
