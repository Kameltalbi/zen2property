import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

type Dashboard = {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  collectedThisMonth: number;
  expectedThisMonth: number;
  lateCount: number;
  pendingCount: number;
  alerts: Array<{ id: string; kind: string; title: string; due_date: string }>;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void api<Dashboard>('/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading overview…</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Overview</p>
          <h1>Hello, {user?.fullName.split(' ')[0]}</h1>
        </div>
        <Link className="btn" to="/app/rent">
          Record a payment
        </Link>
      </div>
      <div className="grid-3">
        <div className="stat">
          <span className="muted">Collected this month</span>
          <b>{data.collectedThisMonth.toFixed(2)}</b>
        </div>
        <div className="stat">
          <span className="muted">Occupied / vacant</span>
          <b>
            {data.occupiedUnits} / {data.vacantUnits}
          </b>
        </div>
        <div className="stat">
          <span className="muted">Pending alerts</span>
          <b>{data.lateCount + data.pendingCount}</b>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Alerts</h3>
        {data.alerts.length === 0 ? (
          <p className="muted">No late or soon-due payments.</p>
        ) : (
          <ul>
            {data.alerts.map((a) => (
              <li key={a.id}>
                <Link to="/app/rent">{a.title}</Link>
                <span className="muted"> · due {a.due_date.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
