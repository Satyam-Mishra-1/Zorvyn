import { FormEvent, useEffect, useState } from 'react';
import { usersApi, type AdminUser, type Role } from '@/api/client';

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as Role,
    status: 'active',
  });

  async function load() {
    try {
      const res = await usersApi.list(page, search);
      setUsers(res.data);
      setPages(res.pagination.pages);
      setErr('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load users');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    await load();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await usersApi.create({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      status: form.status,
    });
    setShowCreate(false);
    setForm({ name: '', email: '', password: '', role: 'viewer', status: 'active' });
    await load();
  }

  async function toggleStatus(u: AdminUser) {
    const next = u.status === 'active' ? 'inactive' : 'active';
    await usersApi.update(u.id, { status: next });
    await load();
  }

  async function changeRole(u: AdminUser, role: Role) {
    await usersApi.update(u.id, { role });
    await load();
  }

  async function removeUser(u: AdminUser) {
    if (!confirm(`Soft-delete user ${u.email}?`)) return;
    await usersApi.remove(u.id);
    await load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Users</h1>
        <button type="button" className="btn" onClick={() => setShowCreate(true)}>
          Add user
        </button>
      </div>
      <p className="muted">Admin-only user management with soft delete and role assignment.</p>
      {err && <p className="error">{err}</p>}

      <form className="toolbar" onSubmit={onSearch}>
        <label style={{ flex: 1 }}>
          Search name or email
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button type="submit" className="btn secondary">
          Search
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value as Role)}
                    className="role-select"
                  >
                    <option value="viewer">viewer</option>
                    <option value="analyst">analyst</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{u.status}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="btn secondary" onClick={() => toggleStatus(u)}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="btn danger" onClick={() => removeUser(u)}>
                      Remove
                    </button>
                  </div>
                </td>
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
        <span className="muted">Page {page} of {pages}</span>
        <button
          type="button"
          className="btn secondary"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {showCreate && (
        <div className="page-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }}>
          <div className="card" style={{ width: 'min(440px, 95vw)' }}>
            <h2 style={{ marginTop: 0 }}>New user</h2>
            <form className="form" onSubmit={onCreate}>
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </label>
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                >
                  <option value="viewer">viewer</option>
                  <option value="analyst">analyst</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>
              <div className="row-actions">
                <button type="submit" className="btn">
                  Create
                </button>
                <button type="button" className="btn secondary" onClick={() => setShowCreate(false)}>
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
