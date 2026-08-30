import * as React from 'react';
import { Target, TrendingUp, ShieldAlert, Play } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { analyzeWeak } from '../../lib/engine';
import { PriorityTag, Progress } from '../../components/ui';
import { useI18n as _ui } from '../../lib/i18n';
void _ui;

export function WeakPoints() {
  const { t, lang } = useI18n();
  const { data, currentEmployee, setView, toast, t: tr } = useStore();

  if (!currentEmployee) return <div className="empty"><p>{t('emp.select')}</p></div>;

  const items = analyzeWeak(data.assessments, data.questions, currentEmployee.id);

  // summary
  const totalAttempts = items.reduce((s, it) => s + it.attempts, 0);
  const totalFailures = items.reduce((s, it) => s + it.failures, 0);
  const criticalWeak = items.filter((it) => it.question.critical).length;
  const improved = items.filter((it) => it.improved).length;

  return (
    <div className="page">
      <PageTitle over="MY WEAK POINTS" title={t('weak.title')} text={t('weak.desc')} />
      <div className="weak-summary stats-grid">
        <article className="stat"><b>{totalFailures}</b><h3>{t('weak.failed')}</h3></article>
        <article className="stat"><b>{totalAttempts ? Math.round(((totalAttempts - totalFailures) / totalAttempts) * 100) : 0}%</b><h3>{t('weak.accuracy')}</h3></article>
        <article className="stat red"><b>{criticalWeak}</b><h3>{t('critical')}</h3></article>
        <article className="stat green"><b>{improved}</b><h3>{t('report.recommended')} ↑</h3></article>
      </div>

      {!items.length ? (
        <div className="card empty">
          <Target size={34} />
          <p>{t('weak.none')}</p>
          <button className="btn primary" onClick={() => setView('assessment')}>{t('assess.start')}</button>
        </div>
      ) : (
        <div className="card weak-list">
          {items.map((it) => (
            <article className="weak-item" key={it.question.id}>
              <div className="weak-head">
                <em>{it.question.id}</em>
                <PriorityTag p={it.priority} />
                {it.improved && <span className="improved-badge"><TrendingUp size={12} /> {t('report.recommended')}</span>}
              </div>
              <p className="weak-q">{lang === 'ar' ? it.question.ar : it.question.en}</p>
              <div className="weak-meta">
                <span>{t('weak.accuracy')} <b>{it.accuracy}%</b></span>
                <span>{t('weak.failed')} <b>{it.failures}</b></span>
                <span>{t('weak.practice')} <b>{it.recommendedMinutes} {t('minutes')}</b></span>
              </div>
              <Progress value={it.accuracy} tone={it.accuracy >= 80 ? 'green' : it.accuracy >= 60 ? 'gold' : 'red'} />
              <div className="weak-foot">
                <span className="muted small">{it.category}</span>
                <button className="btn small" onClick={() => { toast(`${tr('train.queue')}`); setView('training'); }}><Play size={13} /> {t('weak.start')}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {items.length > 0 && criticalWeak > 0 && (
        <div className="alert critical"><ShieldAlert size={18} /><span><b>{t('critical')}</b><p>{t('weak.desc')}</p></span></div>
      )}
      <p className="muted">{t('footer.local')}</p>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
