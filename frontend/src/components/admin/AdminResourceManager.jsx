import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import api, { apiError } from '../../lib/api';
import { Modal, ConfirmDialog, Badge, Pagination } from '../ui/Atoms';
import { TableRowSkeleton } from '../ui/Skeletons';
import { EmptyState, ErrorState } from '../ui/States';

/**
 * field: { key, label, type: 'text'|'textarea'|'number'|'checkbox'|'select'|'date'|'images',
 *          options?: [{value,label}], required?, step? }
 */
export default function AdminResourceManager({ resource, endpoint, columns, fields, extraFieldsBuilder }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(`${endpoint}?page=${page}&limit=10`, { deps: [page] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const resolvedFields = extraFieldsBuilder ? extraFieldsBuilder(fields) : fields;

  const openCreate = () => {
    const initial = {};
    resolvedFields.forEach((f) => { initial[f.key] = f.type === 'checkbox' ? true : ''; });
    setForm(initial);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    const initial = {};
    resolvedFields.forEach((f) => {
      let v = item[f.key];
      if (f.type === 'images') v = (v || []).join('\n');
      if (f.type === 'select' && v && typeof v === 'object') v = v._id;
      if (f.type === 'date' && v) v = new Date(v).toISOString().slice(0, 10);
      initial[f.key] = v ?? (f.type === 'checkbox' ? true : '');
    });
    setForm(initial);
    setEditing(item);
    setModalOpen(true);
  };

  const buildPayload = () => {
    const payload = {};
    resolvedFields.forEach((f) => {
      let v = form[f.key];
      if (v === '' || v === undefined) return;
      if (f.type === 'number') v = Number(v);
      if (f.type === 'images') v = v.split('\n').map((s) => s.trim()).filter(Boolean);
      payload[f.key] = v;
    });
    return payload;
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) await api.patch(`${endpoint}/${editing._id}`, payload);
      else await api.post(endpoint, payload);
      toast.success(t('common.success'));
      setModalOpen(false);
      refetch();
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${deleteTarget._id}`);
      toast.success(t('common.success'));
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{resource}</h1>
        <button onClick={openCreate} className="btn-accent gap-2 py-2.5 text-sm">
          <Plus size={16} /> {t('common.create')}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
              {columns.map((c) => <th key={c.key} className="px-4 py-3 text-start font-medium">{c.label}</th>)}
              <th className="px-4 py-3 text-end font-medium">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={columns.length + 1} />)
            ) : data?.docs?.length ? (
              data.docs.map((item) => (
                <tr key={item._id} className="border-b border-zinc-50 last:border-0 dark:border-zinc-900">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render ? c.render(item) : String(item[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(item)} className="text-zinc-400 hover:text-accent-600"><Pencil size={15} /></button>
                      <button onClick={() => setDeleteTarget(item)} className="text-zinc-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
        {!loading && error && <div className="p-6"><ErrorState onRetry={refetch} /></div>}
        {!loading && !error && !data?.docs?.length && <div className="p-6"><EmptyState title={t('shop.noResults')} /></div>}
      </div>
      <Pagination page={data?.currentPage || page} pages={data?.pages} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('common.create')}>
        <form onSubmit={save} className="space-y-4">
          {resolvedFields.map((f) => (
            <div key={f.key}>
              {f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))} className="h-4 w-4 rounded accent-accent-600" />
                  {f.label}
                </label>
              ) : (
                <>
                  <label className="label">{f.label}</label>
                  {f.type === 'textarea' || f.type === 'images' ? (
                    <textarea
                      required={f.required}
                      rows={f.type === 'images' ? 3 : 4}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      className="input"
                    />
                  ) : f.type === 'select' ? (
                    <select required={f.required} value={form[f.key] ?? ''} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} className="input">
                      <option value="">—</option>
                      {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type || 'text'}
                      step={f.step}
                      required={f.required}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      className="input"
                    />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">{t('common.cancel')}</button>
            <button disabled={saving} className="btn-primary px-6 py-2.5 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} loading={deleting} />
    </div>
  );
}
