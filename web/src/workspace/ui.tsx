import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PeriodKey } from './types';

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="ws-state" role="status">
      <span className="ws-skeleton" />
      <p className="muted">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="ws-state">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
      {action && (
        <Link className="btn" to={action.to}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="ws-state">
      <p className="error">{message}</p>
      {onRetry && (
        <button className="btn secondary" type="button" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  actions,
}: {
  kicker?: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h1>{title}</h1>
      </div>
      {actions ? <div className="ws-actions">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="ws-stat">
      <span className="muted">{label}</span>
      <b>{value}</b>
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
}

export function PeriodSelect({
  value,
  onChange,
  labels,
}: {
  value: PeriodKey;
  onChange: (v: PeriodKey) => void;
  labels: Record<PeriodKey, string>;
}) {
  const keys: PeriodKey[] = ['month', '3m', '6m', 'year'];
  return (
    <div className="ws-segment" role="group" aria-label="Période">
      {keys.map((key) => (
        <button key={key} type="button" className={value === key ? 'on' : ''} onClick={() => onChange(key)}>
          {labels[key]}
        </button>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-dialog-title">
      <div className="ws-modal-card">
        <h2 id="ws-dialog-title">{title}</h2>
        <p className="muted">{body}</p>
        <div className="ws-actions">
          <button className="btn secondary" type="button" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ws-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={value === tab.id ? 'on' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
