import * as React from 'react';
import { Trophy, Download, Printer, ChevronLeft, Clock, ShieldAlert, Check, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n, type TKey } from '../../lib/i18n';
import { fmtDate, fmtDuration, categoryEn } from '../../lib/engine';
import type { AssessmentResult, Question } from '../../lib/types';
import { CategoryBars } from '../../components/Charts';
import { EmptyState } from '../../components/ui';

export function Reports() {
  const { t, lang } = useI18n();
  const { data, currentEmployee } = useStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  if (!currentEmployee) return <div className="empty"><p>{t('emp.select')}</p></div>;

  const mine = data.assessments
    .filter((a) => a.employeeId === currentEmployee.id)
    .sort((a, b) => b.date - a.date);

  if (!mine.length) {
    return (
      <EmptyState
        icon={<Trophy size={36} />}
        title={t('report.title')}
        text={t('empty.cards')}
      />
    );
  }

  const selected = mine.find((a) => a.id === selectedId) ?? mine[0];
  const idx = mine.findIndex((a) => a.id === selected.id);
  const prev = idx < mine.length - 1 ? mine[idx + 1] : null;

  const csv = () => {
    const rows = ['date,score,criticalFailures,timeSeconds,mode,answers'];
    for (const a of mine) {
      const ans = Object.entries(a.answers).map(([k, v]) => `${k}:${v}`).join('|');
      rows.push(`${new Date(a.date).toISOString()},${a.score},${a.criticalFailures},${a.timeSpent},${a.mode},"${ans}"`);
    }
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(rows.join('\n'))}`;
    a.download = 'gate-readiness-report.csv';
    a.click();
  };

  return (
    <div className="page">
      <PageTitle over="REPORTS" title={t('report.title')} text={t('report.desc')} />
      <div className="report-cols">
        <section className="card report-list">
          <h3>{t('report.history')}</h3>
          {mine.map((a) => (
            <button key={a.id} className={selected.id === a.id ? 'report-row active' : 'report-row'} onClick={() => setSelectedId(a.id)}>
              <b>{a.score}%</b>
              <span>
                <small>{fmtDate(a.date, lang)}</small>
                <em>{a.mode} · {a.criticalFailures} {t('criticalFailures')}</em>
              </span>
              <ChevronLeft size={15} />
            </button>
          ))}
          <nav className="report-tools">
            <button className="btn" onClick={csv}><Download size={15} /> {t('btn.export')}</button>
            <button className="btn" onClick={() => window.print()}><Printer size={15} /> {t('btn.print')}</button>
          </nav>
        </section>

        <section className="card report-detail">
          <ReportDetail assessment={selected} prev={prev} questions={data.questions} lang={lang} t={t} />
        </section>
      </div>
    </div>
  );
}

function ReportDetail({ assessment, prev, questions, lang, t }: { assessment: AssessmentResult; prev: AssessmentResult | null; questions: Question[]; lang: 'ar' | 'en'; t: (k: TKey) => string }) {
  const wrong = questions.filter((q) => assessment.answers[q.id] === 'no');
  const correct = questions.filter((q) => assessment.answers[q.id] === 'yes');
  const catData = Object.entries(assessment.categoryScores).map(([cat, score]) => ({ cat: lang === 'ar' ? cat : categoryEn(cat), score })).sort((a, b) => a.score - b.score);
  const diff = prev ? assessment.score - prev.score : 0;

  return (
    <div className="report-detail-inner">
      <div className="rd-head">
        <Trophy />
        <strong>{assessment.score}%</strong>
        <span className={diff >= 0 ? 'diff up' : 'diff down'}>{prev ? `${diff >= 0 ? '+' : ''}${diff} ${t('report.compare')}` : '—'}</span>
      </div>
      <div className="rd-meta">
        <span><Clock size={13} /> {t('report.timeSpent')}: {fmtDuration(assessment.timeSpent)}</span>
        <span>{t('report.mode')}: {assessment.mode}</span>
        <span>{t('report.answers')}: {Object.keys(assessment.answers).length}</span>
      </div>
      {catData.length > 0 && (
        <div className="rd-cats">
          <h4>{t('category')}</h4>
          <CategoryBars data={catData} />
        </div>
      )}
      <div className="rd-stats">
        <span className="ok">{t('report.correct')}<b>{correct.length}</b></span>
        <span className="bad">{t('report.wrong')}<b>{wrong.length}</b></span>
        <span className="crit">{t('criticalFailures')}<b>{assessment.criticalFailures}</b></span>
      </div>
      {assessment.notes && <p className="rd-notes"><b>{t('report.notes')}:</b> {assessment.notes}</p>}
      {wrong.length > 0 && (
        <div className="rd-wrong">
          <h4><X size={14} /> {t('report.wrong')}</h4>
          {wrong.map((q) => (
            <article key={q.id}>
              <em>{q.id}</em>
              <div>
                <b>{lang === 'ar' ? q.ar : q.en}</b>
                <small>{t('assess.standard')}: {lang === 'ar' ? q.standard : q.standardEn}</small>
                <span className="best">{t('assess.best')}: {lang === 'ar' ? q.best : q.bestEn}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {correct.length > 0 && (
        <div className="rd-correct">
          <h4><Check size={14} /> {t('report.correct')}</h4>
          <div className="chip-list">
            {correct.map((q) => <span key={q.id}>{q.id}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}

void ShieldAlert;
