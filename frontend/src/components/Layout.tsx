import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Finance</div>
        <nav className="nav">
          <NavLink end className="nav-link" to="/">
            Dashboard
          </NavLink>
          {(user?.role === 'analyst' || user?.role === 'admin') && (
            <NavLink className="nav-link" to="/records">
              Records
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink className="nav-link" to="/users">
              Users
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <span className="user-name">{user?.name}</span>
            <span className="badge role">{user?.role}</span>
          </div>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
