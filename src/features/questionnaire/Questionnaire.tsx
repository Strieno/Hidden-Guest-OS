import * as React from 'react';
import { Printer, Eye, Trophy, FileText } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import questionnaire from '../../../lib/questionnaire.json';

export function Questionnaire() {
  const { t, lang } = useI18n();
  const { toast, t: tr } = useStore();
  const m = questionnaire.meta as typeof questionnaire.meta;
  const [client, setClient] = React.useState('');
  const [date, setDate] = React.useState('');
  const [ans, setAns] = React.useState<Record<string, string>>({});
  const [hint, setHint] = React.useState<Record<string, boolean>>({});

  const flat: Array<{ key: string; weight: number }> = [];
  questionnaire.sections.forEach((s) => s.items.forEach((it) => flat.push({ key: `${s.num}.${it.num}`, weight: it.weight })));
  const wm: Record<string, number> = {};
  flat.forEach((f) => { wm[f.key] = f.weight; });
  const total = flat.length;
  const totalW = flat.reduce((a, f) => a + f.weight, 0);
  const got = Object.entries(ans).reduce((a, [k, v]) => a + (v === 'yes' ? wm[k] || 0 : 0), 0);
  const score = totalW ? Math.round((got / totalW) * 100) : 0;

  const pick = (k: string, v: string) => {
    setAns((prev) => {
      const n = { ...prev };
      if (n[k] === v) delete n[k];
      else n[k] = v;
      return n;
    });
  };

  return (
    <div className="page">
      <div className="page-title">
        <small>MYSTERY GUEST QUESTIONNAIRE</small>
        <h1>{lang === 'ar' ? 'استبيان الضيف الخفي' : 'Mystery Guest Questionnaire'}</h1>
        <p>{lang === 'ar' ? m.hotelFull : m.hotelEn} — {lang === 'ar' ? m.stayType : 'Overnight Stay'}</p>
      </div>
      <div className="formtop">
        <span>{t('q.answered')} <b>{Object.keys(ans).length}</b> {t('assess.of')} {total} · {t('q.currentScore')} <b>{score}%</b></span>
        <button className="btn primary" onClick={() => window.print()}><Printer size={15} /> {t('btn.print')}</button>
      </div>
      <section className="qsheet card">
        <div className="qhead">
          <b className="qbrand">{m.hotelEn}</b>
          <h2>{lang === 'ar' ? m.hotelAr : m.hotelEn}</h2>
          <p>{m.hotelFull}</p>
          <em>{lang === 'ar' ? m.overallReview : 'Overall Review'}</em>
          <strong className="qscore"><Trophy /> {score}%</strong>
        </div>
        <div className="qfields">
          <label>{lang === 'ar' ? m.fields[0] : 'Guest'}<input value={client} onChange={(e) => setClient(e.target.value)} placeholder={t('q.guestName')} /></label>
          <label>{lang === 'ar' ? m.fields[1] : 'Date'}<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        <div className="qcols">
          <span>{lang === 'ar' ? m.columnGuide : 'Question & Guidance'}</span>
          <i>{m.options.map((o) => `${o.mark} ${lang === 'ar' ? o.label : o.label === 'نعم' ? 'Yes' : o.label === 'لا' ? 'No' : 'N/A'}`).join(' · ')}</i>
          <b>{t('weight')}</b>
        </div>
        <p className="qnote">{lang === 'ar' ? m.note : 'This is placeholder text that can be replaced in the same space. It was used in designing ads and print. The goal was to simulate realistic text.'}</p>
        {questionnaire.sections.map((s) => (
          <div className="qsection" key={s.num}>
            <h3><em>{s.num}</em><span>{lang === 'ar' ? s.ar : s.en}</span></h3>
            {s.items.map((it) => {
              const k = `${s.num}.${it.num}`;
              return (
                <div className={`qitem ${ans[k] ? ans[k] : ''}`} key={k}>
                  <div className="qrow">
                    <b className="qnum">{it.num}</b>
                    <p>{it.q}</p>
                    <span className="qweight">{it.weight}</span>
                  </div>
                  <nav>
                    {m.options.map((o) => (
                      <button key={o.id} className={ans[k] === o.id ? o.id : ''} onClick={() => pick(k, o.id)}>
                        {o.mark} {lang === 'ar' ? o.label : o.label === 'نعم' ? 'Yes' : o.label === 'لا' ? 'No' : 'N/A'}
                      </button>
                    ))}
                  </nav>
                  <button className="qhint" onClick={() => setHint({ ...hint, [k]: !hint[k] })}>
                    <Eye /> {hint[k] ? t('q.hideHint') : t('q.hint')}
                  </button>
                  {hint[k] && <div className="qtip">{it.standard}{it.hidden && <b>{it.hidden}</b>}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </section>
      <button className="btn link" onClick={() => toast(tr('footer.local'))}><FileText size={14} /> {t('footer.local')}</button>
    </div>
  );
}
