import * as React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { SHIFT_CATEGORIES } from '../../data/shift';
import { Progress } from '../../components/ui';

export function Shift() {
  const { t, lang } = useI18n();
  const { shiftDoneToday, toggleShiftItem, currentEmployee, toast, t: tr } = useStore();

  const all = SHIFT_CATEGORIES.flatMap((c) => c.items);
  const pct = Math.round((shiftDoneToday.length / all.length) * 100);
  const complete = shiftDoneToday.length === all.length && all.length > 0;

  if (!currentEmployee) return <div className="empty"><p>{t('emp.select')}</p></div>;

  const toggle = (id: string) => {
    toggleShiftItem(id);
    if (!shiftDoneToday.includes(id) && shiftDoneToday.length + 1 === all.length) {
      toast(`✓ ${tr('shift.complete')}`);
    }
  };

  return (
    <div className="page">
      <PageTitle over="BEFORE MY SHIFT" title={t('shift.title')} text={t('shift.desc')} />
      <div className="shift-head">
        <div className="shift-pct">
          <strong>{pct}%</strong>
          <Progress value={pct} tone={pct >= 100 ? 'green' : 'gold'} />
          <small>{shiftDoneToday.length} / {all.length} · {t('shift.saved')}</small>
        </div>
      </div>
      {complete && (
        <div className="shift-ready"><Sparkles size={18} /> {t('shift.complete')}</div>
      )}
      <div className="shift-grid">
        {SHIFT_CATEGORIES.map((cat) => {
          const doneInCat = cat.items.filter((it) => shiftDoneToday.includes(it.id)).length;
          return (
            <section className="card shift-cat" key={cat.cat}>
              <h3>{cat.icon} {lang === 'ar' ? cat.cat : cat.catEn} <small>{doneInCat}/{cat.items.length}</small></h3>
              {cat.items.map((it) => {
                const checked = shiftDoneToday.includes(it.id);
                return (
                  <label key={it.id} className={checked ? 'chk done' : 'chk'}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(it.id)} />
                    <i><Check size={14} /></i>
                    {lang === 'ar' ? it.ar : it.en}
                  </label>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
