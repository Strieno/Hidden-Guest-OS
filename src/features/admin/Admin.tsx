import * as React from 'react';
import { Plus, Trash2, Copy, Download, Upload, RotateCcw, Search, Save } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { useI18n } from '../../lib/i18n';
import type { Question } from '../../lib/types';
import { normalizeQuestions, uid_ } from '../../lib/storage';
import { Modal, Confirm } from '../../components/ui';

export function Admin() {
  const { t, lang } = useI18n();
  const { data, updateQuestions, resetQuestions, toast, t: tr } = useStore();
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [editId, setEditId] = React.useState<string | null>(null);
  const [delId, setDelId] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');

  const categories = React.useMemo(() => Array.from(new Set(data.questions.map((x) => x.category))), [data.questions]);

  const filtered = data.questions.filter((x) => {
    const matchQ = (lang === 'ar' ? x.ar : x.en).toLowerCase().includes(q.toLowerCase()) || x.id.toLowerCase().includes(q.toLowerCase());
    const matchCat = cat === 'all' || x.category === cat;
    return matchQ && matchCat;
  });

  const editing = data.questions.find((x) => x.id === editId) ?? null;

  const save = (patch: Partial<Question>) => {
    if (!editing) return;
    updateQuestions(data.questions.map((x) => (x.id === editing.id ? { ...x, ...patch } : x)));
    toast(tr('toast.saved'));
  };

  const add = () => {
    const n = data.questions.length + 1;
    const qnew: Question = {
      id: `NEW-${String(n).padStart(3, '0')}`,
      category: cat === 'all' ? 'عام' : cat,
      categoryEn: 'General',
      ar: t('admin.ar'),
      en: t('admin.ar'),
      weight: 5,
      critical: false,
      standard: '',
      standardEn: '',
      best: '',
      bestEn: '',
      explanation: '',
      explanationEn: '',
    };
    updateQuestions([...data.questions, qnew]);
    setEditId(qnew.id);
    toast(tr('toast.saved'));
  };

  const duplicate = (id: string) => {
    const src = data.questions.find((x) => x.id === id);
    if (!src) return;
    const copy: Question = { ...src, id: `${src.id}-C${Math.floor(Math.random() * 90 + 10)}` };
    updateQuestions([...data.questions, copy]);
    toast(tr('duplicate'));
  };

  const remove = (id: string) => {
    updateQuestions(data.questions.filter((x) => x.id !== id));
    setDelId(null);
    toast(tr('toast.saved'));
  };

  const exportQs = () => {
    const a = document.createElement('a');
    a.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.questions, null, 2))}`;
    a.download = 'gate-questions.json';
    a.click();
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const qs = normalizeQuestions(parsed);
      if (!qs.length) throw new Error('empty');
      const ids = qs.map((x) => x.id);
      if (new Set(ids).size !== ids.length) throw new Error('dup');
      updateQuestions(qs);
      toast(`${tr('admin.import')} ✓`);
      setImportOpen(false);
      setImportText('');
    } catch {
      toast(tr('admin.invalid'));
    }
  };

  return (
    <div className="page">
      <PageTitle over="QUESTION BUILDER" title={t('admin.title')} text={t('admin.desc')} />
      <div className="admin-tools">
        <div className="searchbar">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{t('all')}</option>
          {categories.map((c) => <option key={c} value={c}>{lang === 'ar' ? c : c}</option>)}
        </select>
        <button className="btn primary" onClick={add}><Plus size={15} /> {t('btn.add')}</button>
        <button className="btn" onClick={exportQs}><Download size={15} /> {t('admin.export')}</button>
        <button className="btn" onClick={() => setImportOpen(true)}><Upload size={15} /> {t('admin.import')}</button>
        <button className="btn danger-soft" onClick={resetQuestions}><RotateCcw size={15} /> {t('admin.reset')}</button>
      </div>

      <div className="card admin-list">
        {filtered.map((x) => (
          <article key={x.id} className="admin-row">
            <button className="admin-id" onClick={() => setEditId(x.id)}>{x.id}</button>
            <span className="admin-q" onClick={() => setEditId(x.id)}>
              {lang === 'ar' ? x.ar : x.en}
              <small>{lang === 'ar' ? x.category : x.categoryEn} · {t('weight')} {x.weight}{x.critical ? ` · ${t('critical')}` : ''}</small>
            </span>
            <div className="admin-row-actions">
              <button className="icon-btn" onClick={() => duplicate(x.id)} aria-label={t('duplicate')}><Copy size={14} /></button>
              <button className="icon-btn danger" onClick={() => setDelId(x.id)} aria-label={t('delete')}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
        {!filtered.length && <p className="muted">{t('search')}…</p>}
      </div>

      <Modal open={!!editing} onClose={() => setEditId(null)} title={t('admin.title')}>
        {editing && (
          <div className="form qform">
            <div className="form-row">
              <label>{t('admin.id')}<input value={editing.id} onChange={(e) => save({ id: e.target.value })} /></label>
              <label>{t('category')}
                <select value={editing.category} onChange={(e) => save({ category: e.target.value })}>
                  {categories.concat(editing.category).filter((v, i, a) => a.indexOf(v) === i).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>{t('weight')}<input type="number" min={1} max={100} value={editing.weight} onChange={(e) => save({ weight: Number(e.target.value) || 5 })} /></label>
              <label className="chk-row"><input type="checkbox" checked={editing.critical} onChange={(e) => save({ critical: e.target.checked })} /> {t('critical')}</label>
            </div>
            <label>{t('admin.ar')}<textarea value={editing.ar} onChange={(e) => save({ ar: e.target.value })} rows={2} /></label>
            <label>{t('admin.en')}<textarea value={editing.en} onChange={(e) => save({ en: e.target.value })} rows={2} /></label>
            <label>{t('admin.standard')}
              <div className="form-row">
                <input value={editing.standard} onChange={(e) => save({ standard: e.target.value })} placeholder="AR" />
                <input value={editing.standardEn} onChange={(e) => save({ standardEn: e.target.value })} placeholder="EN" />
              </div>
            </label>
            <label>{t('admin.best')}
              <div className="form-row">
                <input value={editing.best} onChange={(e) => save({ best: e.target.value })} placeholder="AR" />
                <input value={editing.bestEn} onChange={(e) => save({ bestEn: e.target.value })} placeholder="EN" />
              </div>
            </label>
            <label>{t('admin.explanation')}
              <div className="form-row">
                <input value={editing.explanation} onChange={(e) => save({ explanation: e.target.value })} placeholder="AR" />
                <input value={editing.explanationEn} onChange={(e) => save({ explanationEn: e.target.value })} placeholder="EN" />
              </div>
            </label>
            <div className="modal-actions">
              <button className="btn" onClick={() => setEditId(null)}><Save size={14} /> {t('btn.save')}</button>
              <button className="btn" onClick={() => setEditId(null)}>{t('btn.cancel')}</button>
            </div>
          </div>
        )}
      </Modal>

      <Confirm open={!!delId} title={t('delete')} text={t('settings.resetConfirm')} onCancel={() => setDelId(null)} onConfirm={() => delId && remove(delId)} />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={t('admin.import')}>
        <div className="form">
          <label>{t('admin.importMsg')}<textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={8} placeholder='[{"id":"TEL-001", ...}]' /></label>
          <div className="modal-actions">
            <button className="btn primary" onClick={doImport}>{t('btn.confirm')}</button>
            <button className="btn" onClick={() => setImportOpen(false)}>{t('btn.cancel')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PageTitle({ over, title, text }: { over: string; title: string; text: string }) {
  return <div className="page-title"><small>{over}</small><h1>{title}</h1><p>{text}</p></div>;
}

void uid_;
