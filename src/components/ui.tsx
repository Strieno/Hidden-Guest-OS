import * as React from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../lib/i18n';

export function Badge({ tone = 'default', children }: { tone?: 'default' | 'gold' | 'green' | 'red' | 'blue' | 'dark'; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Ring({ value, size = 150, label }: { value: number; size?: number; label?: string }) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8e4da" strokeWidth="11" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={value >= 90 ? '#2f9e63' : value >= 70 ? '#c8a45d' : '#c0564a'}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label"><b>{value}%</b>{label && <span>{label}</span>}</div>
    </div>
  );
}

export function Progress({ value, tone = 'gold' }: { value: number; tone?: 'gold' | 'green' | 'red' | 'blue' }) {
  return (
    <div className="progress">
      <div className={`progress-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ icon, value, label, sub, tone }: { icon: React.ReactNode; value: React.ReactNode; label: string; sub?: string; tone?: string }) {
  return (
    <article className={`stat ${tone ?? ''}`}>
      <span className="stat-ic">{icon}</span>
      <b>{value}</b>
      <h3>{label}</h3>
      {sub && <small>{sub}</small>}
    </article>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ic">{icon}</span>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label={t('close')}><X size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ open, title, text, onConfirm, onCancel }: { open: boolean; title: string; text: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onCancel}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="muted">{text}</p>
        <div className="modal-actions">
          <button className="btn danger" onClick={onConfirm}>{t('btn.confirm')}</button>
          <button className="btn" onClick={onCancel}>{t('btn.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

export function PriorityTag({ p }: { p: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  return <span className={`priority priority-${p.toLowerCase()}`}>{p}</span>;
}
