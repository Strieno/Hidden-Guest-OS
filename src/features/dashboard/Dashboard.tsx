import * as React from 'react';
import {
  ClipboardCheck, Sparkles, Phone, Target, Check, Trophy, Flame, TrendingUp, ShieldAlert, Award, ChevronLeft, Play, BookOpen,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { computeReadiness, levelFromXp, categoryEn } from '../../lib/engine';
import { todayChallenge } from '../../data/daily';
import { Ring, Stat, EmptyState, Progress } from '../../components/ui';
import { TrendChart, CategoryRadar, RecentBars, CategoryBars } from '../../components/Charts';
import { ACHIEVEMENTS } from '../../data/achievements';

export function Dashboard() {
  const { t, lang } = useI18n();
  const { data, currentEmployee, setView, startAssessment, startDailyChallenge, dailyDoneToday } = useStore();

  if (!currentEmployee) {
    return (
      <EmptyState
        icon={<ClipboardCheck size={40} />}
        title={t('emp.title')}
        text={t('emp.select')}
        action={<button className="btn primary" onClick={() => setView('employees')}>{t('emp.add')}</button>}
      />
    );
  }

  const stats = computeReadiness(data.assessments, data.questions, currentEmployee.id);
  const level = levelFromXp(currentEmployee.xp, lang);
  const challenge = todayChallenge();
  const unlockedIds = new Set((data.achievements[currentEmployee.id] ?? []).map((u) => u.id));
  const recentUnlocked = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).slice(0, 6);

  // trend chart data (last 30 days, non-zero points)
  const trendData = stats.trend
    .map((score, i) => ({ day: dayLabel(i, lang), score }))
    .filter((d, i) => stats.trend[i] > 0);
  const radarData = Object.entries(stats.categoryScores)
    .map(([cat, score]) => ({ cat: lang === 'ar' ? cat : categoryEn(cat), score }))
    .sort((a, b) => b.score - a.score);
  const recentData = data.assessments
    .filter((a) => a.employeeId === currentEmployee.id)
    .slice(-10)
    .map((a) => ({ label: new Date(a.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' }), score: a.score }));
  const weakData = Object.entries(stats.categoryScores)
    .map(([cat, score]) => ({ cat: lang === 'ar' ? cat : categoryEn(cat), score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = lang === 'ar' ? (hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير') : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dash">
      <section className="hero">
        <div>
          <small>{lang === 'ar' ? 'الجاهزية اليومية' : 'DAILY READINESS'} · {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB')}</small>
          <h1>{greeting}، {currentEmployee.name}</h1>
          <p>{lang === 'ar' ? 'هل أنت جاهز لتقديم تجربة استثنائية لكل ضيف؟' : 'Are you ready to deliver an exceptional experience to every guest?'}</p>
          <div className="hero-badges">
            <span className="lv-badge">Lv {level.level} · {lang === 'ar' ? level.titleAr : level.titleEn}</span>
            <span className="xp-badge">⚡ {currentEmployee.xp} XP</span>
            <span className="str-badge"><Flame size={13} /> {currentEmployee.streak} {t('days')}</span>
          </div>
          <nav className="hero-actions">
            <button className="btn primary" onClick={() => startAssessment({ mode: 'full' })}><Play size={16} /> {t('assess.start')}</button>
            <button className="btn" onClick={() => setView('simulator')}><Sparkles size={16} /> {t('nav.simulator')}</button>
          </nav>
        </div>
        <Ring value={stats.overall} size={160} label={t('readiness')} />
      </section>

      <section className="stats-grid">
        <Stat icon={<TrendingUp size={18} />} value={`${stats.avg7}%`} label={t('avg7')} tone="gold" />
        <Stat icon={<Award size={18} />} value={`${stats.best}%`} label={t('best')} tone="green" />
        <Stat icon={<Trophy size={18} />} value={`${stats.previous}%`} label={t('previous')} tone="blue" />
        <Stat icon={<TrendingUp size={18} />} value={stats.improvement >= 0 ? `+${stats.improvement}` : `${stats.improvement}`} label={t('improvement')} tone={stats.improvement >= 0 ? 'green' : 'red'} sub={stats.improvement >= 0 ? '↑' : '↓'} />
        <Stat icon={<ShieldAlert size={18} />} value={stats.criticalFailures} label={t('criticalFailures')} tone="red" />
        <Stat icon={<Flame size={18} />} value={`${currentEmployee.streak} ${t('days')}`} label={t('streak')} tone="gold" />
      </section>

      <section className="dash-cols">
        <div className="dash-col">
          <CardTitle over={t('trend30')} title={t('readiness')} />
          <div className="card">
            {trendData.length >= 2 ? <TrendChart data={trendData} /> : <ChartEmpty text={t('empty.cards')} />}
          </div>

          <CardTitle over="CATEGORIES" title={t('category')} />
          <div className="card">
            {radarData.length ? <CategoryRadar data={radarData} /> : <ChartEmpty text={t('empty.cards')} />}
          </div>
        </div>

        <div className="dash-col">
          <CardTitle over="DAILY" title={t('challenge.title')} />
          <div className={`card challenge ${dailyDoneToday ? 'done' : ''}`}>
            <span className="challenge-ic">{challenge.icon}</span>
            <p>{lang === 'ar' ? challenge.titleAr : challenge.titleEn}</p>
            <small>{t('challenge.desc')}</small>
            {dailyDoneToday ? (
              <b className="challenge-done">✓ {t('challenge.done')}</b>
            ) : (
              <button className="btn primary" onClick={() => startDailyChallenge(challenge.id, challenge.target)}>{t('challenge.do')} · +25 XP</button>
            )}
          </div>

          <CardTitle over="RECENT" title={t('report.history')} />
          <div className="card">
            {recentData.length ? <RecentBars data={recentData} /> : <ChartEmpty text={t('empty.cards')} />}
          </div>

          <CardTitle over="WEAKEST" title={t('weak.title')} />
          <div className="card">
            {weakData.length ? <CategoryBars data={weakData} /> : <ChartEmpty text={t('empty.cards')} />}
          </div>
        </div>
      </section>

      <section className="dash-cols bottom">
        <div className="dash-col">
          <CardTitle over="QUICK ACTIONS" title={t('quick.title')} />
          <div className="card actions">
            {[
              { icon: <Phone size={18} />, label: t('quick.phone'), view: 'phone' as const },
              { icon: <Sparkles size={18} />, label: t('quick.sim'), view: 'simulator' as const },
              { icon: <Target size={18} />, label: t('quick.weak'), view: 'weak' as const },
              { icon: <Check size={18} />, label: t('quick.shift'), view: 'shift' as const },
              { icon: <BookOpen size={18} />, label: t('nav.academy'), view: 'academy' as const },
              { icon: <ClipboardCheck size={18} />, label: t('nav.assessment'), view: 'assessment' as const },
            ].map((a) => (
              <button key={a.view} className="action" onClick={() => a.view === 'assessment' ? startAssessment({ mode: 'random' }) : setView(a.view)}>
                <span className="action-ic">{a.icon}</span>
                <b>{a.label}</b>
                <ChevronLeft size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="dash-col">
          <CardTitle over="ACHIEVEMENTS" title={t('ach.title')} />
          <div className="card badges">
            {recentUnlocked.length ? recentUnlocked.map((a) => (
              <span key={a.id} className="badge-chip"><b>{a.icon}</b>{lang === 'ar' ? a.ar : a.en}</span>
            )) : <ChartEmpty text={t('empty.cards')} />}
            <button className="btn link" onClick={() => setView('achievements')}>{t('ach.title')} →</button>
          </div>
          <CardTitle over="PROGRESS" title={t('levels')} />
          <div className="card lv-progress">
            <span>Lv {level.level} — {lang === 'ar' ? level.titleAr : level.titleEn}</span>
            <Progress value={level.progress} tone="gold" />
            <small>{level.nextXp ? `${currentEmployee.xp} / ${level.nextXp} XP` : `${t('ach.unlocked')} · MAX`}</small>
          </div>
        </div>
      </section>
    </div>
  );
}

function CardTitle({ over, title }: { over: string; title: string }) {
  return <div className="card-title"><small>{over}</small><h2>{title}</h2></div>;
}

function ChartEmpty({ text }: { text: string }) {
  return <div className="chart-empty">{text}</div>;
}

function dayLabel(offset: number, lang: 'ar' | 'en'): string {
  const d = new Date(Date.now() - (29 - offset) * 86400000);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' });
}


