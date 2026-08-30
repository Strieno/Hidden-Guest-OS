import * as React from 'react';
import { Users, TrendingUp, ShieldAlert, Eye } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { computeReadiness, analyzeWeak, categoryEn, fmtDate } from '../../lib/engine';
import { Modal, EmptyState, Badge } from '../../components/ui';

export function Supervisor() {
  const { t, lang } = useI18n();
  const { data } = useStore();
  const [inspectId, setInspectId] = React.useState<string | null>(null);

  if (!data.employees.length) {
    return <EmptyState icon={<Users size={36} />} title={t('sup.title')} text={t('sup.noEmp')} />;
  }

  const rows = data.employees.map((e) => {
    const stats = computeReadiness(data.assessments, data.questions, e.id);
    const weak = analyzeWeak(data.assessments, data.questions, e.id);
    const weakest = weak[0] ? (lang === 'ar' ? weak[0].category : categoryEn(weak[0].category)) : '—';
    return { emp: e, stats, weak, weakest };
  }).sort((a, b) => b.stats.overall - a.stats.overall);

  const teamAvg = Math.round(rows.reduce((s, r) => s + r.stats.overall, 0) / rows.length);
  const totalCritical = rows.reduce((s, r) => s + r.stats.criticalFailures, 0);
  const weakestGlobal = Object.entries(aggregateCategories(data)).sort((a, b) => a[1] - b[1])[0];

  const inspected = data.employees.find((e) => e.id === inspectId);

  return (
    <div className="page">
      <PageTitle over="SUPERVISOR MODE" title={t('sup.title')} text={t('sup.desc')} />
      <div className="stats-grid">
        <article className="stat"><b>{teamAvg}%</b><h3>{t('sup.team')}</h3></article>
        <article className="stat"><b>{rows.length}</b><h3>{t('nav.employees')}</h3></article>
        <article className="stat red"><b>{totalCritical}</b><h3>{t('criticalFailures')}</h3></article>
        <article className="stat gold"><b>{weakestGlobal ? (lang === 'ar' ? weakestGlobal[0] : categoryEn(weakestGlobal[0])) : '—'}</b><h3>{t('sup.weakest')}</h3></article>
      </div>

      <div className="card sup-table">
        <table>
          <thead>
            <tr>
              <th>{t('sup.employee')}</th>
              <th>{t('readiness')}</th>
              <th>{t('sup.trend')}</th>
              <th>{t('criticalFailures')}</th>
              <th>{t('sup.weakest')}</th>
              <th>{t('sup.last')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const trend = r.stats.avg30 > 0 ? (r.stats.avg7 - r.stats.avg30) : 0;
              return (
                <tr key={r.emp.id}>
                  <td><span className="avatar sm" style={{ background: r.emp.color }}>{r.emp.name.charAt(0)}</span> {r.emp.name}</td>
                  <td><b className={r.stats.overall >= 80 ? 'ok' : r.stats.overall >= 60 ? 'warn' : 'bad'}>{r.stats.overall}%</b></td>
                  <td className={trend >= 0 ? 'ok' : 'bad'}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}</td>
                  <td>{r.stats.criticalFailures}</td>
                  <td>{r.weakest}</td>
                  <td>{r.stats.lastDate ? fmtDate(r.stats.lastDate, lang) : '—'}</td>
                  <td><button className="icon-btn" onClick={() => setInspectId(r.emp.id)} aria-label={t('sup.inspect')}><Eye size={15} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted small">{t('footer.local')}</p>
      </div>

      <Modal open={!!inspected} onClose={() => setInspectId(null)} title={inspected?.name ?? ''}>
        {inspected && <InspectView employeeId={inspected.id} />}
      </Modal>
    </div>
  );
}

function InspectView({ employeeId }: { employeeId: string }) {
  const { t, lang } = useI18n();
  const { data } = useStore();
  const stats = computeReadiness(data.assessments, data.questions, employeeId);
  const weak = analyzeWeak(data.assessments, data.questions, employeeId).slice(0, 5);
  const recent = data.assessments.filter((a) => a.employeeId === employeeId).sort((a, b) => b.date - a.date).slice(0, 6);
  const phones = data.phoneSessions.filter((a) => a.employeeId === employeeId).length;
  const sims = data.simSessions.filter((a) => a.employeeId === employeeId).length;

  return (
    <div className="inspect">
      <div className="stats-grid mini">
        <article className="stat"><b>{stats.overall}%</b><h3>{t('readiness')}</h3></article>
        <article className="stat"><b>{stats.best}%</b><h3>{t('best')}</h3></article>
        <article className="stat red"><b>{stats.criticalFailures}</b><h3>{t('criticalFailures')}</h3></article>
        <article className="stat"><b>{phones} · {sims}</b><h3>{t('nav.phone')} / {t('nav.simulator')}</h3></article>
      </div>
      <h4>{t('weak.title')}</h4>
      {weak.length ? weak.map((w) => (
        <div className="inspect-weak" key={w.question.id}>
          <span>{w.question.id}</span>
          <Badge tone={w.priority === 'CRITICAL' ? 'red' : w.priority === 'HIGH' ? 'gold' : 'blue'}>{w.priority}</Badge>
          <i>{w.accuracy}%</i>
        </div>
      )) : <p className="muted">{t('weak.none')}</p>}
      <h4>{t('report.history')}</h4>
      <div className="inspect-history">
        {recent.map((a) => (
          <span key={a.id} className={a.score >= 80 ? 'ok' : 'bad'}>{a.score}%<small>{fmtDate(a.date, lang)}</small></span>
        ))}
      </div>
      {stats.trend.some((x) => x > 0) && (
        <div className="trend-inline"><TrendingUp size={14} /> {t('avg7')}: {stats.avg7}% · {t('avg30')}: {stats.avg30}%</div>
      )}
    </div>
  );
}

function aggregateCategories(data: { assessments: Array<{ employeeId: string; categoryScores: Record<string, number> }> }): Record<string, number> {
  const agg: Record<string, { sum: number; n: number }> = {};
  for (const a of data.assessments) {
    for (const [cat, score] of Object.entries(a.categoryScores)) {
      if (!agg[cat]) agg[cat] = { sum: 0, n: 0 };
      agg[cat].sum += score;
      agg[cat].n += 1;
    }
  }
  const out: Record<string, number> = {};
  for (const [cat, v] of Object.entries(agg)) out[cat] = Math.round(v.sum / v.n);
  return out;
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}

void ShieldAlert;
