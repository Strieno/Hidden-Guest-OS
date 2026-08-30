import * as React from 'react';
import { Plus, Trash2, Users, Pencil } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import { computeReadiness, levelFromXp } from '../../lib/engine';
import { Modal, Confirm, EmptyState, Progress } from '../../components/ui';

export function Employees() {
  const { t, lang } = useI18n();
  const { data, currentEmployee, addEmployee, updateEmployee, deleteEmployee, selectEmployee, toast, t: tr } = useStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('موظف استقبال');
  const [roleEn, setRoleEn] = React.useState('Front Desk Agent');
  const [notes, setNotes] = React.useState('');
  const [editing, setEditing] = React.useState<string | null>(null);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const didAutoOpen = React.useRef(false);

  // First-run helper: when there are no employees yet, open the creation form automatically
  React.useEffect(() => {
    if (!data.employees.length && !open && !didAutoOpen.current) {
      didAutoOpen.current = true;
      openAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.employees.length]);

  const submit = () => {
    if (editing) {
      updateEmployee(editing, { name, role, roleEn, notes });
      toast(tr('toast.saved'));
    } else {
      addEmployee(name, role, roleEn, notes);
      toast(`${tr('emp.created')} ✓`);
    }
    setOpen(false);
    setName(''); setRole('موظف استقبال'); setRoleEn('Front Desk Agent'); setNotes(''); setEditing(null);
  };

  const openEdit = (id: string) => {
    const e = data.employees.find((x) => x.id === id);
    if (!e) return;
    setEditing(id);
    setName(e.name);
    setRole(e.role);
    setRoleEn(e.roleEn);
    setNotes(e.notes);
    setOpen(true);
  };

  const openAdd = () => { setEditing(null); setName(''); setRole('موظف استقبال'); setRoleEn('Front Desk Agent'); setNotes(''); setOpen(true); };

  return (
    <div className="page">
      <PageTitle over="EMPLOYEES" title={t('emp.title')} text={t('emp.desc')} />

      {!data.employees.length ? (
        <EmptyState
          icon={<Users size={36} />}
          title={t('emp.title')}
          text={t('emp.desc')}
          action={<button className="btn primary" onClick={openAdd}><Plus size={16} /> {t('emp.add')}</button>}
        />
      ) : (
        <>
          <button className="btn primary add-top" onClick={openAdd}><Plus size={16} /> {t('emp.add')}</button>
          <div className="emp-grid">
            {data.employees.map((e) => {
              const stats = computeReadiness(data.assessments, data.questions, e.id);
              const lv = levelFromXp(e.xp, lang);
              const active = currentEmployee?.id === e.id;
              return (
                <article key={e.id} className={`card emp-card ${active ? 'active' : ''}`}>
                  <span className="avatar" style={{ background: e.color }}>{e.name.charAt(0)}</span>
                  <h3>{e.name}</h3>
                  <small>{lang === 'ar' ? e.role : e.roleEn}</small>
                  <div className="emp-meta">
                    <span>{t('readiness')} <b>{stats.overall}%</b></span>
                    <span>Lv {lv.level} · {e.xp} XP</span>
                    <span>{t('streak')} {e.streak} {t('days')}</span>
                  </div>
                  <Progress value={stats.overall} tone={stats.overall >= 80 ? 'green' : 'gold'} />
                  <div className="emp-actions">
                    {active ? (
                      <span className="badge badge-gold">{t('emp.select')} ✓</span>
                    ) : (
                      <button className="btn small" onClick={() => selectEmployee(e.id)}>{t('emp.switch')}</button>
                    )}
                    <button className="icon-btn" onClick={() => openEdit(e.id)} aria-label="edit"><Pencil size={15} /></button>
                    <button className="icon-btn danger" onClick={() => setConfirmDel(e.id)} aria-label="delete"><Trash2 size={15} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('emp.name') : t('emp.add')}>
        <div className="form">
          <label>{t('emp.name')}<input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
          <label>{t('emp.role')}<input value={role} onChange={(e) => setRole(e.target.value)} /></label>
          <label>Role (EN)<input value={roleEn} onChange={(e) => setRoleEn(e.target.value)} /></label>
          <label>{t('emp.notes')}<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></label>
          <div className="modal-actions">
            <button className="btn primary" disabled={!name.trim()} onClick={submit}>{t('btn.save')}</button>
            <button className="btn" onClick={() => setOpen(false)}>{t('btn.cancel')}</button>
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!confirmDel}
        title={t('emp.delete')}
        text={t('settings.resetConfirm')}
        onCancel={() => setConfirmDel(null)}
        onConfirm={() => { if (confirmDel) deleteEmployee(confirmDel); setConfirmDel(null); }}
      />
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}
