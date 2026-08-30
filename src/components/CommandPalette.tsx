import * as React from 'react';
import { Command } from 'cmdk';
import { ClipboardCheck, Sparkles, Phone, Target, Check, BookOpen, FileText, Users, Trophy, Settings as SettingsIcon, LayoutDashboard, Search } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useStore } from '../hooks/useStore';
import type { View } from '../lib/types';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { setView, startRandomAssessment } = useStore();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const run = (v: View | 'random') => {
    if (v === 'random') startRandomAssessment();
    else setView(v);
    onClose();
  };

  const items: Array<{ label: string; icon: React.ReactNode; key: View | 'random'; group: string }> = [
    { label: t('cmd.assessment'), icon: <ClipboardCheck size={16} />, key: 'assessment', group: 'training' },
    { label: t('cmd.sim'), icon: <Sparkles size={16} />, key: 'random', group: 'training' },
    { label: t('cmd.phone'), icon: <Phone size={16} />, key: 'phone', group: 'training' },
    { label: t('cmd.weak'), icon: <Target size={16} />, key: 'weak', group: 'training' },
    { label: t('cmd.shift'), icon: <Check size={16} />, key: 'shift', group: 'training' },
    { label: t('cmd.academy'), icon: <BookOpen size={16} />, key: 'academy', group: 'reference' },
    { label: t('cmd.qr'), icon: <FileText size={16} />, key: 'questionnaire', group: 'reference' },
    { label: t('cmd.report'), icon: <LayoutDashboard size={16} />, key: 'reports', group: 'manage' },
    { label: t('cmd.supervisor'), icon: <Users size={16} />, key: 'supervisor', group: 'manage' },
    { label: t('cmd.achievements'), icon: <Trophy size={16} />, key: 'achievements', group: 'manage' },
    { label: t('cmd.employees'), icon: <Users size={16} />, key: 'employees', group: 'manage' },
    { label: t('cmd.settings'), icon: <SettingsIcon size={16} />, key: 'settings', group: 'manage' },
  ];

  return (
    <div className="cmd-back" onClick={onClose}>
      <div className="cmd" role="dialog" aria-modal="true" aria-label={t('cmd.title')} onClick={(e) => e.stopPropagation()}>
        <Command label={t('cmd.title')}>
          <div className="cmd-input-wrap">
            <Search size={16} />
            <Command.Input placeholder={t('cmd.desc')} autoFocus />
          </div>
          <Command.List className="cmd-list">
            <Command.Empty className="cmd-empty">{t('search')}…</Command.Empty>
            {['training', 'reference', 'manage'].map((g) => (
              <Command.Group key={g} heading={g}>
                {items.filter((i) => i.group === g).map((i) => (
                  <Command.Item key={i.key} onSelect={() => run(i.key)} className="cmd-item">
                    {i.icon}
                    <span>{i.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}


