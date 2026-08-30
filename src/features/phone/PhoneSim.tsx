import * as React from 'react';
import { Phone, ShieldAlert, ChevronLeft, RotateCcw, Volume2 } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n, type TKey } from '../../lib/i18n';
import { PHONE_SCENARIOS, type PhoneScenario, type PhoneOption, type PhoneEffects } from '../../data/phoneScenarios';
import { DAILY_CHALLENGES } from '../../data/daily';
import { scenarioScore } from '../../lib/engine';
import { sfx } from '../../lib/sound';

const AXES = ['greeting', 'hotel', 'employee', 'listening', 'accuracy', 'language', 'closing'] as const;

type State =
  | { phase: 'pick' }
  | { phase: 'ring' }
  | { phase: 'run'; scenario: PhoneScenario; stageIdx: number; chosen: PhoneOption | null; totals: PhoneEffects; critical: number }
  | { phase: 'done'; scenario: PhoneScenario; totals: PhoneEffects; critical: number; axes: Record<string, number | null>; score: number; passed: boolean; xp: number };

const ZERO: PhoneEffects = { greeting: 0, hotel: 0, employee: 0, listening: 0, accuracy: 0, language: 0, closing: 0 };

export function PhoneSim() {
  const { t, lang } = useI18n();
  const { recordPhoneSession, pendingDaily, completeDaily, clearPendingDaily, toast, t: tr } = useStore();
  const [state, setState] = React.useState<State>({ phase: 'pick' });
  const [scenarioId, setScenarioId] = React.useState<string>('random');
  const lastDaily = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (state.phase !== 'pick') lastDaily.current = pendingDaily;
  }, [state, pendingDaily]);

  // Auto-launch the daily challenge call when the simulator opens for a challenge
  React.useEffect(() => {
    if (state.phase !== 'pick' || !pendingDaily) return;
    const ch = DAILY_CHALLENGES.find((c) => c.id === pendingDaily);
    if (ch && ch.target === 'phone') {
      setScenarioId(ch.scenarioId);
      setState({ phase: 'ring' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDaily, state.phase]);

  React.useEffect(() => {
    // when entering ring phase, play ring sound
    if (state.phase === 'ring') {
      sfx.ring();
      const iv = window.setInterval(() => sfx.ring(), 2200);
      return () => window.clearInterval(iv);
    }
  }, [state.phase]);

  const pickScenario = (id: string) => {
    setState({ phase: 'run', scenario: PHONE_SCENARIOS.find((s) => s.id === id) ?? PHONE_SCENARIOS[0], stageIdx: 0, chosen: null, totals: ZERO, critical: 0 });
  };

  const choose = (opt: PhoneOption) => {
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
      const nextId = state.chosen.next;
      const target = nextId ? state.scenario.stages.findIndex((s) => s.id === nextId) : -1;
      setState({ phase: 'run', scenario: state.scenario, stageIdx: target >= 0 ? target : nextIdx, chosen: null, totals: state.totals, critical: state.critical });
    } else {
      finish(state.scenario, state.totals, state.critical);
    }
  };

  const finish = (scenario: PhoneScenario, totals: PhoneEffects, critical: number) => {
    // Precise scoring: per-axis 0-100 (perfect call = 100%, all-worst = 0%), final = mean of scored axes
    const stages = scenario.stages as unknown as Array<{ options: Array<{ effects: Record<string, number> }> }>;
    const { axes, score } = scenarioScore(totals as unknown as Record<string, number>, stages, AXES);
    const categories: Record<string, number> = {};
    for (const [k, v] of Object.entries(axes)) if (v !== null) categories[k] = v;
    const passed = !(critical > 0 || score < 60);
    const res = recordPhoneSession({
      scenarioId: scenario.id,
      score,
      categories,
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
    setState({ phase: 'done', scenario, totals, critical, axes, score, passed, xp: res.xp });
  };

  if (state.phase === 'pick') {
    return (
      <div className="page">
        <PageTitle over="PHONE SIMULATOR" title={t('phone.title')} text={t('phone.desc')} />
        <div className="card sim-pick">
          <p className="muted">{t('phone.scenario')}</p>
          <div className="persona-grid">
            {PHONE_SCENARIOS.map((s) => (
              <button key={s.id} className="persona" onClick={() => { setScenarioId(s.id); setState({ phase: 'ring' }); }}>
                <b>{s.icon}</b>
                <span>{lang === 'ar' ? s.titleAr : s.titleEn}</span>
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={() => { setScenarioId('random'); setState({ phase: 'ring' }); }}><Phone size={16} /> {t('phone.answer')}</button>
        </div>
      </div>
    );
  }

  if (state.phase === 'ring') {
    return (
      <div className="page">
        <PageTitle over="INCOMING CALL" title={t('phone.title')} text={t('phone.desc')} />
        <section className="card phone-ring">
          <span className="ringing"><Phone size={42} /></span>
          <h2>{t('phone.ring')}</h2>
          <p className="muted"><Volume2 size={13} /> {t('phone.scenario')}: {scenarioId}</p>
          <button className="btn primary" onClick={() => pickScenario(scenarioId)}>{t('phone.answer')}</button>
          <button className="btn link" onClick={() => setState({ phase: 'pick' })}>{t('btn.cancel')}</button>
        </section>
      </div>
    );
  }

  if (state.phase === 'done') {
    const { scenario, axes, score, critical, passed, xp } = state;
    return (
      <div className="page">
        <PageTitle over="CALL RESULT" title={t('sim.result')} text={lang === 'ar' ? scenario.titleAr : scenario.titleEn} />
        <section className={`card sim-result ${passed ? '' : 'fail'}`}>
          <strong>{score}%</strong>
          <h2>{passed ? (lang === 'ar' ? 'ممتاز — مكالمة احترافية' : 'Excellent — professional call') : (lang === 'ar' ? 'يحتاج تحسيناً' : 'Needs improvement')}</h2>
          <div className="axis-grid">
            <Axis label={t('phone.axis.greeting')} v={axes.greeting} />
            <Axis label={t('phone.axis.hotel')} v={axes.hotel} />
            <Axis label={t('phone.axis.employee')} v={axes.employee} />
            <Axis label={t('phone.axis.listening')} v={axes.listening} />
            <Axis label={t('phone.axis.accuracy')} v={axes.accuracy} />
            <Axis label={t('phone.axis.language')} v={axes.language} />
            <Axis label={t('phone.axis.closing')} v={axes.closing} />
          </div>
          {critical > 0 && <p className="sim-critical">⚠ {t('sim.critical')} × {critical}</p>}
          <p className="xp-gain">+{xp} XP</p>
          <nav>
            <button className="btn primary" onClick={() => { setState({ phase: 'ring' }); }}><RotateCcw size={15} /> {t('btn.retry')}</button>
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
      <PageTitle over={`${state.scenario.icon} ${lang === 'ar' ? state.scenario.titleAr : state.scenario.titleEn}`} title={t('phone.title')} text={`${t('sim.stage')} ${state.stageIdx + 1} ${t('assess.of')} ${state.scenario.stages.length}`} />
      <div className="sim-chat card">
        <div className="msg msg-guest">
          <span className="msg-avatar">📞</span>
          <div><small>{t('common.guest')}</small><p>{guestLine}</p></div>
        </div>
        {state.chosen ? (
          <>
            <div className={`feedback ${state.chosen.critical ? 'critical' : ''}`}>
              <b>{state.chosen.critical ? `${t('sim.critical')} ` : ''}{phoneEffSummary(state.chosen.effects, t)}</b>
              <p>{lang === 'ar' ? state.chosen.feedbackAr : state.chosen.feedbackEn}</p>
              {state.chosen.critical && <div className="critical-note"><ShieldAlert size={16} /> {t('phone.title')}</div>}
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
        <span>{t('phone.axis.greeting')} <b>{state.totals.greeting}</b></span>
        <span>{t('criticalFailures')} <b className={state.critical ? 'red' : ''}>{state.critical}</b></span>
      </div>
    </div>
  );
}

function addEff(a: PhoneEffects, b: PhoneEffects): PhoneEffects {
  const out: PhoneEffects = { greeting: 0, hotel: 0, employee: 0, listening: 0, accuracy: 0, language: 0, closing: 0 };
  (Object.keys(out) as Array<keyof PhoneEffects>).forEach((k) => { out[k] = a[k] + b[k]; });
  return out;
}

function phoneEffSummary(eff: PhoneEffects, t: (k: TKey) => string): string {
  const parts: string[] = [];
  AXES.forEach((ax) => {
    const v = eff[ax];
    if (v !== 0) parts.push(`${v > 0 ? '+' : ''}${v} ${t(`phone.axis.${ax}` as TKey)}`);
  });
  return parts.join(' · ') || '±0';
}

function Axis({ label, v }: { label: string; v: number | null }) {
  const val = v ?? 0;
  return (
    <div className="axis">
      <span>{label}</span>
      <b>{v === null ? '—' : `${v}%`}</b>
      <div className="axis-track">{v === null ? <div className="axis-na" /> : <div className="axis-fill" style={{ width: `${val}%`, background: val >= 70 ? '#2f9e63' : val >= 45 ? '#c8a45d' : '#c0564a' }} />}</div>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
