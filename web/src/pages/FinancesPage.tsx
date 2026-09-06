import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type Expense, type Property } from '../api';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';
import { money } from '../workspace/format';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from '../workspace/ui';

const CATEGORIES: Expense['category'][] = [
  'MAINTENANCE',
  'REPAIR',
  'INSURANCE',
  'TAXES',
  'CONDO',
  'SERVICES',
  'MANAGEMENT',
  'WORKS',
  'BANK_FEES',
  'OTHER',
];

const emptyForm = {
  propertyId: '',
  category: 'OTHER' as Expense['category'],
  label: '',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  vendor: '',
  paymentMethod: '',
  recurring: false,
  notes: '',
};

export function FinancesPage() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const fr = locale === 'fr';
  const [properties, setProperties] = useState<Property[]>([]);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState<Expense | null>(null);
  const [q, setQ] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState(emptyForm);

  async function reload() {
    const [p, e] = await Promise.all([
      api<{ properties: Property[] }>('/properties'),
      api<{ expenses: Expense[] }>('/operations/expenses'),
    ]);
    setProperties(p.properties);
    setExpenses(e.expenses);
    setForm((f) => ({ ...f, propertyId: f.propertyId || p.properties[0]?.id || '' }));
  }

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load expenses'));
  }, []);

  const filtered = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((row) => {
      if (filterProperty && row.propertyId !== filterProperty) return false;
      if (filterCategory && row.category !== filterCategory) return false;
      if (q && !`${row.label} ${row.vendor ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [expenses, filterProperty, filterCategory, q]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthRows = (expenses ?? []).filter((row) => String(row.expenseDate).slice(0, 7) === thisMonth);
  const monthTotal = monthRows.reduce((sum, row) => sum + row.amount, 0);
  const listTotal = filtered.reduce((sum, row) => sum + row.amount, 0);

  function fill(row: Expense) {
    setEditingId(row.id);
    setNotice('');
    setForm({
      propertyId: row.propertyId,
      category: row.category,
      label: row.label,
      amount: String(row.amount),
      expenseDate: String(row.expenseDate).slice(0, 10),
      vendor: row.vendor ?? '',
      paymentMethod: row.paymentMethod ?? '',
      recurring: Boolean(row.recurring),
      notes: row.notes ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      propertyId: filterProperty || properties[0]?.id || '',
      expenseDate: new Date().toISOString().slice(0, 10),
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice('');
    const property = properties.find((p) => p.id === form.propertyId);
    const body = {
      propertyId: form.propertyId,
      category: form.category,
      label: form.label,
      amount: Number(form.amount),
      currency: property?.currency || user?.defaultCurrency || 'EUR',
      expenseDate: form.expenseDate,
      vendor: form.vendor || undefined,
      paymentMethod: form.paymentMethod || undefined,
      recurring: form.recurring,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await api(`/operations/expenses/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
        setNotice(fr ? 'Dépense mise à jour.' : 'Expense updated.');
      } else {
        await api('/operations/expenses', { method: 'POST', body: JSON.stringify(body) });
        setNotice(fr ? 'Dépense enregistrée.' : 'Expense saved.');
      }
      resetForm();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Enregistrement impossible' : 'Save failed');
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    try {
      await api(`/operations/expenses/${pending.id}`, { method: 'DELETE' });
      if (editingId === pending.id) resetForm();
      setPending(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Suppression impossible' : 'Could not delete expense');
    }
  }

  if (error && expenses === null) return <ErrorState message={error} onRetry={() => void reload()} />;
  if (!expenses) return <LoadingState />;
  if (!properties.length) {
    return (
      <EmptyState
        title={fr ? 'Ajoutez un bien d’abord' : 'Add a property first'}
        body={fr ? 'Les dépenses sont liées à un bien.' : 'Expenses are linked to a property.'}
        action={{ to: '/app/properties/new', label: fr ? 'Ajouter un bien' : 'Add property' }}
      />
    );
  }

  return (
    <>
      <PageHeader
        kicker={fr ? 'Finances' : 'Finances'}
        title={fr ? 'Dépenses' : 'Expenses'}
        actions={
          <Link className="btn secondary" to="/app/reports">
            {fr ? 'Exporter' : 'Export'}
          </Link>
        }
      />
      <div className="ws-grid kpi">
        <StatCard label={fr ? 'Dépenses ce mois' : 'Expenses this month'} value={money(monthTotal, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'Total filtré' : 'Filtered total'} value={money(listTotal, user?.defaultCurrency, locale)} />
        <StatCard label={fr ? 'Nombre' : 'Count'} value={String(filtered.length)} />
      </div>
      {notice && <p className="muted">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form card" onSubmit={(e) => void onSubmit(e)} style={{ marginTop: 16 }}>
        <h3>{editingId ? (fr ? 'Modifier la dépense' : 'Edit expense') : (fr ? 'Nouvelle dépense' : 'New expense')}</h3>
        <div className="grid-2">
          <label>
            {fr ? 'Bien' : 'Property'}
            <select value={form.propertyId} onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))} required>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Catégorie' : 'Category'}
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Expense['category'] }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Libellé' : 'Label'}
            <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required />
          </label>
          <label>
            {fr ? 'Montant' : 'Amount'}
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          </label>
          <label>
            {fr ? 'Date' : 'Date'}
            <input type="date" value={form.expenseDate} onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))} required />
          </label>
          <label>
            {fr ? 'Fournisseur' : 'Vendor'}
            <input value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
          </label>
          <label>
            {fr ? 'Moyen de paiement' : 'Payment method'}
            <input value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))} />
            {fr ? 'Récurrente (indicateur seulement)' : 'Recurring (flag only)'}
          </label>
        </div>
        <label>
          {fr ? 'Notes' : 'Notes'}
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </label>
        <p className="muted">
          {fr
            ? 'Les dépenses marquées récurrentes ne sont pas générées automatiquement.'
            : 'Recurring expenses are not generated automatically.'}
        </p>
        <div className="ws-actions">
          <button className="btn" type="submit">{editingId ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Ajouter' : 'Add')}</button>
          {editingId && (
            <button className="btn ghost" type="button" onClick={resetForm}>{fr ? 'Annuler' : 'Cancel'}</button>
          )}
        </div>
      </form>

      <div className="ws-toolbar" style={{ marginTop: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Rechercher' : 'Search'} />
        <select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
          <option value="">{fr ? 'Tous les biens' : 'All properties'}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">{fr ? 'Toutes catégories' : 'All categories'}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>{fr ? 'Bien' : 'Property'}</th>
              <th>{fr ? 'Libellé' : 'Label'}</th>
              <th>{fr ? 'Catégorie' : 'Category'}</th>
              <th>{fr ? 'Montant' : 'Amount'}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{String(row.expenseDate).slice(0, 10)}</td>
                <td>{properties.find((p) => p.id === row.propertyId)?.name ?? '—'}</td>
                <td>
                  {row.label}
                  {row.recurring ? ` · ${fr ? 'récurrente' : 'recurring'}` : ''}
                </td>
                <td>{row.category}</td>
                <td>{money(row.amount, row.currency, locale)}</td>
                <td>
                  <button className="btn ghost" type="button" onClick={() => fill(row)}>{fr ? 'Modifier' : 'Edit'}</button>
                  <button className="btn ghost" type="button" onClick={() => setPending(row)}>{fr ? 'Supprimer' : 'Delete'}</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="muted">{fr ? 'Aucune dépense.' : 'No expenses yet.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title={fr ? 'Supprimer cette dépense ?' : 'Delete this expense?'}
        body={pending?.label ?? ''}
        confirmLabel={fr ? 'Supprimer' : 'Delete'}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
