import { FormEvent, useEffect, useState } from 'react';
import { recordsApi, type RecordRow } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR' });
}

export function RecordsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<RecordRow | null>(null);

  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  async function load() {
    try {
      const res = await recordsApi.list({
        page,
        limit: 15,
        type: type || undefined,
        category: category || undefined,
        search: search || undefined,
        sort: 'date',
        order: 'desc',
      });
      setRows(res.data);
      setPages(res.pagination.pages);
      setTotal(res.pagination.total);
      setErr('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load records');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    await load();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await recordsApi.create({
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      notes: form.notes,
    });
    setModal(null);
    setForm({
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    await load();
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await recordsApi.update(editing.id, {
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      notes: form.notes,
    });
    setModal(null);
    setEditing(null);
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm('Soft-delete this record?')) return;
    await recordsApi.remove(id);
    await load();
  }

  function openEdit(r: RecordRow) {
    setEditing(r);
    setForm({
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: new Date(r.date).toISOString().slice(0, 10),
      notes: r.notes || '',
    });
    setModal('edit');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Financial records</h1>
        {isAdmin && (
          <button type="button" className="btn" onClick={() => setModal('create')}>
            New record
          </button>
        )}
      </div>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        {isAdmin ? 'Full CRUD (soft delete).' : 'Read-only: analysts can view and filter records.'} Total:{' '}
        {total}
      </p>
      {err && <p className="error">{err}</p>}

      <form className="toolbar" onSubmit={onSearch}>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Rent"
          />
        </label>
        <label>
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Notes / category"
          />
        </label>
        <button type="submit" className="btn secondary">
          Apply
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Created by</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.category}</td>
                <td>
                  <span className={`tag ${r.type}`}>{r.type}</span>
                </td>
                <td>{formatMoney(r.amount)}</td>
                <td>{r.createdBy?.name ?? '—'}</td>
                {isAdmin && (
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn secondary" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button type="button" className="btn danger" onClick={() => onDelete(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="muted">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          className="btn secondary"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {modal === 'create' && (
        <div className="page-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }}>
          <div className="card" style={{ width: 'min(440px, 95vw)' }}>
            <h2 style={{ marginTop: 0 }}>New record</h2>
            <form className="form" onSubmit={onCreate}>
              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </label>
              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
              <label>
                Category
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>
              <label>
                Notes
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </label>
              <div className="row-actions">
                <button type="submit" className="btn">
                  Save
                </button>
                <button type="button" className="btn secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && editing && (
        <div className="page-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }}>
          <div className="card" style={{ width: 'min(440px, 95vw)' }}>
            <h2 style={{ marginTop: 0 }}>Edit record</h2>
            <form className="form" onSubmit={onUpdate}>
              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </label>
              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
              <label>
                Category
                <input
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>
              <label>
                Notes
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </label>
              <div className="row-actions">
                <button type="submit" className="btn">
                  Update
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setModal(null);
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
