import * as React from 'react';
import { ClipboardCheck, Check, X, ShieldAlert, ChevronLeft, ChevronRight, Clock, Trophy, RotateCcw } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import type { Answer, Question } from '../../lib/types';
import { categoryEn } from '../../lib/engine';
import { Progress } from '../../components/ui';

type Stage = 'setup' | 'run' | 'done';

export function Assessment() {
  const { t, lang } = useI18n();
  const { data, assessmentConfig, clearAssessment, submitAssessment, setView } = useStore();

  const [stage, setStage] = React.useState<Stage>(assessmentConfig ? 'run' : 'setup');
  const [catFilter, setCatFilter] = React.useState<string>('all');
  const [qs, setQs] = React.useState<Question[]>([]);
  const [i, setI] = React.useState(0);
  const [ans, setAns] = React.useState<Record<string, Answer>>({});
  const [notes, setNotes] = React.useState('');
  const [startTs, setStartTs] = React.useState(Date.now());
  const [seconds, setSeconds] = React.useState(0);
  const [result, setResult] = React.useState<{ score: number; critical: number; xp: number; unlocks: string[] } | null>(null);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    data.questions.forEach((q) => set.add(q.category));
    return ['all', ...Array.from(set)];
  }, [data.questions]);

  const begin = React.useCallback((mode: 'full' | 'random' | 'category') => {
    let list = [...data.questions];
    if (mode === 'random') list = list.sort(() => Math.random() - 0.5).slice(0, Math.min(15, list.length));
    if (mode === 'category' && catFilter !== 'all') list = list.filter((q) => q.category === catFilter);
    setQs(list);
    setAns({});
    setNotes('');
    setI(0);
    setStartTs(Date.now());
    setSeconds(0);
    setResult(null);
    setStage('run');
  }, [data.questions, catFilter]);

  React.useEffect(() => {
    if (stage === 'run') {
      const iv = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => window.clearInterval(iv);
    }
  }, [stage]);

  React.useEffect(() => {
    if (assessmentConfig) {
      begin(assessmentConfig.mode);
      clearAssessment();
    }
  }, [assessmentConfig, begin, clearAssessment]);

  const pick = (qid: string, v: Answer) => setAns((prev) => ({ ...prev, [qid]: v }));

  const finish = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - startTs) / 1000));
    const res = submitAssessment({ answers: ans, questionIds: qs.map((q) => q.id), notes: notes || undefined, timeSpent, mode: assessmentConfig?.mode ?? 'full' });
    setResult({ score: res.score, critical: qs.filter((q) => q.critical && ans[q.id] === 'no').length, xp: res.xp, unlocks: res.unlocked.map((u) => u.id) });
    setStage('done');
  };

  if (stage === 'setup') {
    return (
      <div className="page">
        <PageTitle over={t('nav.assessment')} title={t('assess.title')} text={t('assess.desc')} />
        <div className="card setup">
          <div className="field">
            <label>{t('category')}</label>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="all">{t('all')}</option>
              {categories.filter((c) => c !== 'all').map((c) => <option key={c} value={c}>{lang === 'ar' ? c : categoryEn(c)}</option>)}
            </select>
          </div>
          <div className="setup-actions">
            <button className="btn primary" onClick={() => begin('full')}>{t('assess.mode.full')} · {data.questions.length}</button>
            <button className="btn" onClick={() => begin('random')}>{t('assess.mode.random')}</button>
            <button className="btn" onClick={() => begin('category')}>{t('assess.mode.category')}</button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'done' && result) {
    const wrong = qs.filter((q) => ans[q.id] === 'no');
    return (
      <div className="page">
        <PageTitle over="RESULT" title={t('report.title')} text={new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB')} />
        <section className="card report">
          <Trophy />
          <strong>{result.score}%</strong>
          <h2>{result.score >= 95 ? 'Mystery Guest Ready' : result.score >= 80 ? 'Good' : 'Training Required'}</h2>
          <div>
            <span>{t('report.answers')}<b>{Object.keys(ans).length}/{qs.length}</b></span>
            <span>{t('report.wrong')}<b>{wrong.length}</b></span>
            <span>{t('criticalFailures')}<b>{result.critical}</b></span>
          </div>
          <p className="xp-gain">+{result.xp} XP{result.unlocks.length ? ` · ${result.unlocks.length} ${t('ach.unlocked')}` : ''}</p>
          <nav>
            <button className="btn primary" onClick={() => setView('reports')}>{t('report.title')} →</button>
            <button className="btn" onClick={() => begin(assessmentConfig?.mode ?? 'full')}><RotateCcw size={15} /> {t('btn.retry')}</button>
          </nav>
        </section>
        {wrong.length > 0 && (
          <section className="card wrong-list">
            <h3>{t('report.recommended')}</h3>
            {wrong.map((q) => (
              <article key={q.id}>
                <em>{q.id}</em>
                <div><b>{q.ar}</b><small>{q.standard}</small><span className="best">{q.best}</span></div>
              </article>
            ))}
          </section>
        )}
      </div>
    );
  }

  const q = qs[i];
  if (!q) return null;
  const a = ans[q.id];

  return (
    <div className="exam">
      <div className="step">
        <span>{t('assess.question')} {i + 1} {t('assess.of')} {qs.length}</span>
        <span className="timer"><Clock size={14} /> {fmt(seconds)}</span>
        <b>{Math.round(((i + 1) / qs.length) * 100)}%</b>
      </div>
      <Progress value={((i + 1) / qs.length) * 100} tone="gold" />
      <section className="question">
        <div className="q-tags">
          <em>{q.id}</em>
          <em>{t('weight')} {q.weight}</em>
          {q.critical && <em className="danger">{t('critical')}</em>}
        </div>
        <small>{lang === 'ar' ? q.category : q.categoryEn}</small>
        <h1>{lang === 'ar' ? q.ar : q.en}</h1>
        <p>{lang === 'ar' ? q.standard : q.standardEn}</p>
        <nav className="q-options">
          <button className={a === 'yes' ? 'yes' : ''} onClick={() => pick(q.id, 'yes')}><Check size={18} /> {t('yes')}</button>
          <button className={a === 'no' ? 'no' : ''} onClick={() => pick(q.id, 'no')}><X size={18} /> {t('no')}</button>
          <button className={a === 'na' ? 'na' : ''} onClick={() => pick(q.id, 'na')}><ClipboardCheck size={18} /> {t('na')}</button>
        </nav>
        {a === 'no' && (
          <div className={`alert ${q.critical ? 'critical' : ''}`}>
            <ShieldAlert size={20} />
            <span>
              <b>{q.critical ? 'CRITICAL SERVICE FAILURE' : t('assess.review')}</b>
              <p>{lang === 'ar' ? q.standard : q.standardEn}</p>
              <small>{t('assess.best')}: {lang === 'ar' ? q.best : q.bestEn}</small>
            </span>
          </div>
        )}
        {i === qs.length - 1 && (
          <textarea className="q-note" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('assess.note')} rows={2} />
        )}
      </section>
      <footer className="exam-foot">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronRight size={16} /> {t('btn.prev')}</button>
        {i < qs.length - 1 ? (
          <button className="btn primary" disabled={!a} onClick={() => setI(i + 1)}>{t('btn.next')} <ChevronLeft size={16} /></button>
        ) : (
          <button className="btn primary" disabled={!a} onClick={finish}>{t('btn.finish')}</button>
        )}
      </footer>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
