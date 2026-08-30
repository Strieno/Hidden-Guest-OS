import * as React from 'react';
import { Sparkles, ShieldAlert, ChevronLeft, RotateCcw } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n, type TKey } from '../../lib/i18n';
import { SCENARIOS, type ScenarioDef, type ScenarioOption, type OptionEffects } from '../../data/scenarios';
import { sfx } from '../../lib/sound';

type State =
  | { phase: 'pick' }
  | { phase: 'run'; scenario: ScenarioDef; stageIdx: number; chosen: ScenarioOption | null; totals: OptionEffects; critical: number }
  | { phase: 'done'; scenario: ScenarioDef; totals: OptionEffects; critical: number; satisfaction: number; score: number; passed: boolean; xp: number };

const AXES = ['service', 'communication', 'accuracy', 'satisfaction', 'compliance'] as const;

export function Simulator() {
  const { t, lang } = useI18n();
  const { recordSimSession, pendingDaily, completeDaily, clearPendingDaily, toast, t: tr } = useStore();
  const [state, setState] = React.useState<State>({ phase: 'pick' });
  const [pickedId, setPickedId] = React.useState<string>('random');
  const lastDaily = React.useRef<string | null>(null);

  const start = (id: string) => {
    const scenario = id === 'random' ? SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)] : SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
    sfx.click();
    setState({ phase: 'run', scenario, stageIdx: 0, chosen: null, totals: ZERO, critical: 0 });
  };

  React.useEffect(() => {
    if (state.phase === 'run') lastDaily.current = pendingDaily;
  }, [state, pendingDaily]);

  const choose = (opt: ScenarioOption) => {
    if (state.phase !== 'run' || state.chosen) return;
    if (opt.critical) sfx.critical(); else sfx.click();
    setState({
      ...state,
      chosen: opt,
      totals: addEff(state.totals, opt.effects),
      critical: state.critical + (opt.critical ? 1 : 0),
    });
  };

  const advance = () => {
    if (state.phase !== 'run' || !state.chosen) return;
    const nextIdx = state.stageIdx + 1;
    if (nextIdx < state.scenario.stages.length) {
      const nextStageId = state.chosen.next;
      const target = nextStageId ? state.scenario.stages.findIndex((s) => s.id === nextStageId) : -1;
      setState({
        phase: 'run',
        scenario: state.scenario,
        stageIdx: target >= 0 ? target : nextIdx,
        chosen: null,
        totals: state.totals,
        critical: state.critical,
      });
    } else {
      finish(state.scenario, state.totals, state.critical);
    }
  };

  const finish = (scenario: ScenarioDef, totals: OptionEffects, critical: number) => {
    const satisfaction = clamp(50 + totals.satisfaction + Math.round((totals.service + totals.communication) / 2));
    const accuracy = clamp(50 + totals.accuracy + totals.compliance / 2);
    const communication = clamp(50 + totals.communication);
    const compliance = clamp(50 + totals.compliance);
    const score = clamp(50 + Math.round((totals.service + totals.communication + totals.accuracy + totals.satisfaction + totals.compliance) / 2));
    const passed = !(critical > 0 || satisfaction < 30);
    const res = recordSimSession({
      scenarioId: scenario.id,
      score,
      satisfaction,
      accuracy,
      communication,
      compliance,
      criticalMistakes: critical,
      passed,
    });
    if (lastDaily.current) {
      completeDaily(lastDaily.current);
      clearPendingDaily();
      lastDaily.current = null;
      toast(`${tr('challenge.done')} · +25 XP`);
    }
    if (passed) sfx.complete(); else sfx.incorrect();
    setState({ phase: 'done', scenario, totals, critical, satisfaction, score, passed, xp: res.xp });
  };

  if (state.phase === 'pick') {
    return (
      <div className="page">
        <PageTitle over="SCENARIO SIMULATOR" title={t('sim.title')} text={t('sim.desc')} />
        <div className="card sim-pick">
          <p className="muted">{t('sim.personality')}</p>
          <div className="persona-grid">
            {SCENARIOS.map((s) => (
              <button key={s.id} className="persona" onClick={() => start(s.id)}>
                <b>{s.icon}</b>
                <span>{lang === 'ar' ? s.personalityAr : s.personalityEn}</span>
                <small>{lang === 'ar' ? s.titleAr : s.titleEn}</small>
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={() => start('random')}><Sparkles size={16} /> {t('quick.sim')}</button>
        </div>
      </div>
    );
  }

  if (state.phase === 'done') {
    const { scenario, satisfaction, score, critical, passed, xp } = state;
    return (
      <div className="page">
        <PageTitle over="RESULT" title={t('sim.result')} text={lang === 'ar' ? scenario.titleAr : scenario.titleEn} />
        <section className={`card sim-result ${passed ? '' : 'fail'}`}>
          <strong>{score}%</strong>
          <h2>{passed ? (lang === 'ar' ? 'ممتاز — خدمة احترافية' : 'Excellent — professional service') : (lang === 'ar' ? 'يحتاج مراجعة' : 'Needs review')}</h2>
          <div className="axis-grid">
            <Axis label={t('sim.service')} v={clamp(50 + state.totals.service)} />
            <Axis label={t('sim.communication')} v={clamp(50 + state.totals.communication)} />
            <Axis label={t('sim.accuracy')} v={clamp(50 + state.totals.accuracy)} />
            <Axis label={t('sim.satisfaction')} v={satisfaction} />
            <Axis label={t('sim.compliance')} v={clamp(50 + state.totals.compliance)} />
          </div>
          {critical > 0 && <p className="sim-critical">⚠ {t('sim.critical')} × {critical}</p>}
          <p className="xp-gain">+{xp} XP</p>
          <nav>
            <button className="btn primary" onClick={() => start(pickedId === 'random' ? 'random' : scenario.id)}><RotateCcw size={15} /> {t('btn.retry')}</button>
            <button className="btn" onClick={() => setState({ phase: 'pick' })}>{t('sim.start')}</button>
          </nav>
        </section>
      </div>
    );
  }

  const stage = state.scenario.stages[state.stageIdx];
  const guestLine = lang === 'ar' ? stage.guestAr : stage.guestEn;

  return (
    <div className="page">
      <PageTitle
        over={`${t('sim.personality')}: ${lang === 'ar' ? state.scenario.personalityAr : state.scenario.personalityEn}`}
        title={lang === 'ar' ? state.scenario.titleAr : state.scenario.titleEn}
        text={`${t('sim.stage')} ${state.stageIdx + 1} ${t('assess.of')} ${state.scenario.stages.length}`}
      />
      <div className="sim-chat card">
        <div className="msg msg-guest">
          <span className="msg-avatar">{state.scenario.icon}</span>
          <div><small>{t('common.guest')}</small><p>{guestLine}</p></div>
        </div>
        {state.chosen ? (
          <>
            <div className={`feedback ${state.chosen.critical ? 'critical' : ''}`}>
              <b>{state.chosen.critical ? `${t('sim.critical')} ` : ''}{effSummary(state.chosen.effects, t)}</b>
              <p>{lang === 'ar' ? state.chosen.feedbackAr : state.chosen.feedbackEn}</p>
              {state.chosen.critical && (
                <div className="critical-note"><ShieldAlert size={16} /> {t('sim.criticalNote')}</div>
              )}
            </div>
            <button className="btn primary" onClick={advance}>
              {state.stageIdx < state.scenario.stages.length - 1 ? t('sim.next') : t('sim.finish')} <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <div className="msg-options">
            <small>{t('sim.choose')}</small>
            {stage.options.map((o) => (
              <button key={o.id} className="choice" onClick={() => choose(o)}>
                {lang === 'ar' ? o.labelAr : o.labelEn}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="sim-live">
        <span>{t('sim.service')} <b>{state.totals.service}</b></span>
        <span>{t('sim.satisfaction')} <b>{state.totals.satisfaction}</b></span>
        <span>{t('criticalFailures')} <b className={state.critical ? 'red' : ''}>{state.critical}</b></span>
      </div>
    </div>
  );
}

const ZERO: OptionEffects = { service: 0, communication: 0, accuracy: 0, satisfaction: 0, compliance: 0 };

function addEff(a: OptionEffects, b: OptionEffects): OptionEffects {
  return { service: a.service + b.service, communication: a.communication + b.communication, accuracy: a.accuracy + b.accuracy, satisfaction: a.satisfaction + b.satisfaction, compliance: a.compliance + b.compliance };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function effSummary(eff: OptionEffects, t: (k: TKey) => string): string {
  const parts: string[] = [];
  AXES.forEach((ax) => {
    const v = eff[ax];
    if (v !== 0) parts.push(`${v > 0 ? '+' : ''}${v} ${t(`sim.${ax}` as TKey)}`);
  });
  return parts.join(' · ') || '±0';
}

function Axis({ label, v }: { label: string; v: number }) {
  return (
    <div className="axis">
      <span>{label}</span>
      <b>{v}%</b>
      <div className="axis-track"><div className="axis-fill" style={{ width: `${v}%`, background: v >= 70 ? '#2f9e63' : v >= 45 ? '#c8a45d' : '#c0564a' }} /></div>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
