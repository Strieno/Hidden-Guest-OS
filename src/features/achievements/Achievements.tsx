import * as React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { ACHIEVEMENTS } from '../../data/achievements';
import { LEVELS, levelFromXp } from '../../lib/engine';
import { Progress } from '../../components/ui';

export function Achievements() {
  const { t, lang } = useI18n();
  const { data, currentEmployee } = useStore();

  if (!currentEmployee) return <div className="empty"><p>{t('emp.select')}</p></div>;

  const unlocked = new Set((data.achievements[currentEmployee.id] ?? []).map((u) => u.id));
  const level = levelFromXp(currentEmployee.xp, lang);
  const nextLevel = LEVELS.find((l) => l.xp > currentEmployee.xp);

  return (
    <div className="page">
      <PageTitle over="GAMIFICATION" title={t('ach.title')} text={t('ach.desc')} />
      <section className="card lv-hero">
        <div className="lv-ring">
          <b>Lv {level.level}</b>
          <span>{lang === 'ar' ? level.titleAr : level.titleEn}</span>
        </div>
        <div className="lv-info">
          <h3>{lang === 'ar' ? level.titleAr : level.titleEn}</h3>
          <Progress value={level.progress} tone="gold" />
          <small>{level.nextXp ? `${currentEmployee.xp} / ${level.nextXp} XP · ${nextLevel ? `Next: Lv ${nextLevel.level}` : 'MAX'}` : 'MAX'}</small>
          <div className="lv-steps">
            {LEVELS.map((l) => (
              <span key={l.level} className={currentEmployee.xp >= l.xp ? 'reached' : ''}>
                <b>Lv {l.level}</b>
                <i>{lang === 'ar' ? l.titleAr : l.titleEn}</i>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <article key={a.id} className={`card ach ${isUnlocked ? 'unlocked' : ''}`}>
              <span className="ach-icon">{isUnlocked ? a.icon : <Lock size={20} />}</span>
              <div>
                <h3>{lang === 'ar' ? a.ar : a.en}</h3>
                <p>{lang === 'ar' ? a.descAr : a.descEn}</p>
                <small>{isUnlocked ? `${t('ach.unlocked')} · +${a.xp} XP` : `+${a.xp} XP`}</small>
              </div>
              {isUnlocked && <b className="ach-check"><Trophy size={16} /></b>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
