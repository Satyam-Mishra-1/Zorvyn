import { useEffect, useState } from 'react';
import { dashboardApi, type Summary, type Trends } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'INR' });
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, t] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.trends(period),
        ]);
        if (!cancelled) {
          setSummary(s);
          setTrends(t);
          setErr('');
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load dashboard');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxBar =
    trends?.points.reduce(
      (m, p) => Math.max(m, p.income, p.expense, 1),
      1
    ) ?? 1;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted" style={{ marginBottom: '1.25rem' }}>
        Signed in as <strong>{user?.name}</strong> ({user?.role}).{' '}
        {user?.role === 'viewer' && 'You can view summaries and trends; records and user management are hidden.'}
      </p>
      {err && <p className="error">{err}</p>}

      {summary && (
        <div className="grid cols-3" style={{ marginBottom: '1.25rem' }}>
          <div className="card">
            <h2>Total income</h2>
            <div className="stat-value income">{formatMoney(summary.totalIncome)}</div>
          </div>
          <div className="card">
            <h2>Total expenses</h2>
            <div className="stat-value expense">{formatMoney(summary.totalExpenses)}</div>
          </div>
          <div className="card">
            <h2>Net balance</h2>
            <div className="stat-value">{formatMoney(summary.netBalance)}</div>
            <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {summary.recordCount} records
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-two-col">
        {summary && (
          <div className="card">
            <h2>Category breakdown</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.categoryBreakdown.slice(0, 12).map((c, i) => (
                    <tr key={`${c.category}-${c.type}-${i}`}>
                      <td>{c.category}</td>
                      <td>
                        <span className={`tag ${c.type}`}>{c.type}</span>
                      </td>
                      <td>{formatMoney(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summary && (
          <div className="card">
            <h2>Recent activity</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentActivity.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        {r.category}{' '}
                        <span className={`tag ${r.type}`}>{r.type}</span>
                      </td>
                      <td>{formatMoney(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {trends && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Trends</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={period === 'monthly' ? 'btn' : 'btn secondary'}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={period === 'weekly' ? 'btn' : 'btn secondary'}
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Green bars: income · Red bars: expenses
          </p>
          <div className="bar-chart">
            {trends.points.slice(-14).map((p) => (
              <div key={p.label} className="bar-group">
                <div className="bar-pair">
                  <div
                    className="bar inc"
                    style={{ height: `${(p.income / maxBar) * 100}%` }}
                    title={`Income ${formatMoney(p.income)}`}
                  />
                  <div
                    className="bar exp"
                    style={{ height: `${(p.expense / maxBar) * 100}%` }}
                    title={`Expense ${formatMoney(p.expense)}`}
                  />
                </div>
                <span className="bar-label" title={p.label}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
