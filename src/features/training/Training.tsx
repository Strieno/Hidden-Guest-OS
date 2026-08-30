import * as React from 'react';
import { Check, X, ChevronLeft, BookOpen } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { analyzeWeak, trainingQueue } from '../../lib/engine';
import type { Question } from '../../lib/types';
import { Progress } from '../../components/ui';

export function Training() {
  const { t, lang } = useI18n();
  const { data, recordTraining, currentEmployee } = useStore();
  const [i, setI] = React.useState(0);

  const queue = React.useMemo<Question[]>(() => {
    if (!currentEmployee) return data.questions;
    const weak = analyzeWeak(data.assessments, data.questions, currentEmployee.id);
    return trainingQueue(weak, data.questions);
  }, [data, currentEmployee]);

  if (!currentEmployee) return <div className="empty"><p>{t('emp.select')}</p></div>;
  if (!queue.length) return <div className="empty"><p>{t('empty.cards')}</p></div>;

  const q = queue[i % queue.length];

  const mark = (correct: boolean) => {
    recordTraining(q.id, correct);
    setI((v) => v + 1);
  };

  return (
    <div className="page">
      <PageTitle over="TRAINING MODE" title={t('train.title')} text={t('train.desc')} />
      <div className="train-top">
        <span>{i + 1} {t('assess.of')} {queue.length}</span>
        <Progress value={((i + 1) / queue.length) * 100} tone="gold" />
      </div>
      <section className="card training-card" key={q.id + i}>
        <div className="q-tags">
          <em>{q.id}</em>
          <em>{lang === 'ar' ? q.category : q.categoryEn}</em>
          {q.critical && <em className="danger">{t('critical')}</em>}
        </div>
        <h2>{lang === 'ar' ? q.ar : q.en}</h2>
        <div className="info-grid">
          <Info l="STANDARD" v={lang === 'ar' ? q.standard : q.standardEn} />
          <Info l="WHY IT MATTERS" v={lang === 'ar' ? q.explanation : q.explanationEn} />
          <Info l="BEST RESPONSE" v={lang === 'ar' ? q.best : q.bestEn} />
          <Info l="COMMON MISTAKE" v={t('train.mistake')} />
        </div>
        <div className="train-actions">
          <button className="btn green" onClick={() => mark(true)}><Check size={16} /> {t('train.mastered')}</button>
          <button className="btn red" onClick={() => mark(false)}><X size={16} /> {t('train.stillWeak')}</button>
        </div>
      </section>
      <p className="muted center">{t('train.queue')} — {queue.length} {t('assess.question')}</p>
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return <article className="info"><small>{l}</small><p>{v}</p></article>;
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}

void BookOpen; void ChevronLeft;
