import * as React from 'react';
import { Search, ChevronLeft, BookOpenCheck } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { ACADEMY } from '../../data/academy';

export function Academy() {
  const { t, lang } = useI18n();
  const { data } = useStore();
  const [q, setQ] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const filtered = ACADEMY.filter((a) => {
    const hay = lang === 'ar' ? `${a.titleAr} ${a.sectionAr} ${a.bodyAr.join(' ')}` : `${a.titleEn} ${a.sectionEn} ${a.bodyEn.join(' ')}`;
    return hay.toLowerCase().includes(q.toLowerCase());
  });

  const article = ACADEMY.find((a) => a.id === openId) ?? null;

  if (article) {
    const related = data.questions.filter((qq) => article.related.includes(qq.id));
    return (
      <div className="page">
        <button className="btn link back" onClick={() => setOpenId(null)}>← {t('academy.back')}</button>
        <PageTitle over={`${article.icon} ${lang === 'ar' ? article.sectionAr : article.sectionEn}`} title={lang === 'ar' ? article.titleAr : article.titleEn} text="" />
        <article className="card article">
          {(lang === 'ar' ? article.bodyAr : article.bodyEn).map((p, i) => <p key={i}>{p}</p>)}
          {related.length > 0 && (
            <div className="related">
              <h4>{t('academy.related')}</h4>
              {related.map((r) => (
                <span key={r.id} className="related-chip"><em>{r.id}</em>{lang === 'ar' ? r.ar : r.en}</span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="page">
      <PageTitle over="FRONT OFFICE ACADEMY" title={t('academy.title')} text={t('academy.desc')} />
      <div className="searchbar">
        <Search size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} autoFocus />
      </div>
      <div className="academy-grid">
        {filtered.map((a) => (
          <button key={a.id} className="card acad" onClick={() => setOpenId(a.id)}>
            <b className="acad-icon">{a.icon}</b>
            <span><small>{lang === 'ar' ? a.sectionAr : a.sectionEn}</small><h3>{lang === 'ar' ? a.titleAr : a.titleEn}</h3></span>
            <ChevronLeft size={15} />
          </button>
        ))}
        {!filtered.length && <div className="card empty"><BookOpenCheck size={30} /><p>{t('search')}…</p></div>}
      </div>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
