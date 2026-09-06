import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type MaintenanceRequest, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';
import { money } from '../workspace/format';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader } from '../workspace/ui';

const COLS = [
  { id: 'todo', statuses: ['NEW', 'TO_PLAN'], fr: 'À traiter', en: 'To do' },
  { id: 'planned', statuses: ['PLANNED'], fr: 'Planifiées', en: 'Planned' },
  { id: 'progress', statuses: ['IN_PROGRESS'], fr: 'En cours', en: 'In progress' },
  { id: 'done', statuses: ['COMPLETED'], fr: 'Terminées', en: 'Done' },
  { id: 'cancelled', statuses: ['CANCELLED'], fr: 'Annulées', en: 'Cancelled' },
] as const;

const PRIORITIES: MaintenanceRequest['priority'][] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const STATUSES: MaintenanceRequest['status'][] = ['NEW', 'TO_PLAN', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const emptyForm = {
  propertyId: '',
  tenantId: '',
  title: '',
  description: '',
  category: 'OTHER',
  priority: 'NORMAL' as MaintenanceRequest['priority'],
  status: 'NEW' as MaintenanceRequest['status'],
  scheduledAt: '',
  provider: '',
  estimatedCost: '',
  actualCost: '',
  notes: '',
};

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso).slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pillClass(priority: string): string {
  if (priority === 'HIGH' || priority === 'URGENT') return 'high';
  return priority.toLowerCase();
}

export function MaintenancePage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [searchParams] = useSearchParams();
  const presetPropertyId = searchParams.get('propertyId') ?? '';
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [jobs, setJobs] = useState<MaintenanceRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState<MaintenanceRequest | null>(null);
  const [filterProperty, setFilterProperty] = useState(presetPropertyId);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [form, setForm] = useState(emptyForm);

  async function reload() {
    const [p, t, m] = await Promise.all([
      api<{ properties: Property[] }>('/properties'),
      api<{ tenants: Tenant[] }>('/tenants'),
      api<{ maintenance: MaintenanceRequest[] }>('/operations/maintenance'),
    ]);
    setProperties(p.properties);
    setTenants(t.tenants);
    setJobs(m.maintenance);
    setForm((f) => ({
      ...f,
      propertyId: f.propertyId || presetPropertyId || p.properties[0]?.id || '',
    }));
  }

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load maintenance'));
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function fill(job: MaintenanceRequest) {
    setEditingId(job.id);
    setNotice('');
    setError(null);
    setForm({
      propertyId: job.propertyId,
      tenantId: job.tenantId ?? '',
      title: job.title,
      description: job.description ?? '',
      category: job.category || 'OTHER',
      priority: job.priority,
      status: job.status,
      scheduledAt: toLocalInput(job.scheduledAt),
      provider: job.provider ?? '',
      estimatedCost: job.estimatedCost != null ? String(job.estimatedCost) : '',
      actualCost: job.actualCost != null ? String(job.actualCost) : '',
      notes: job.notes ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      propertyId: filterProperty || properties[0]?.id || '',
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice('');
    const body = {
      propertyId: form.propertyId,
      tenantId: form.tenantId || undefined,
      title: form.title,
      description: form.description || undefined,
      category: form.category || 'OTHER',
      priority: form.priority,
      status: form.status,
      scheduledAt: form.scheduledAt || undefined,
      provider: form.provider || undefined,
      estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      actualCost: form.actualCost ? Number(form.actualCost) : undefined,
      notes: form.notes || undefined,
    };
    try {
      if (editingId) {
        await api(`/operations/maintenance/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            tenantId: body.tenantId,
            title: body.title,
            description: body.description,
            category: body.category,
            priority: body.priority,
            status: body.status,
            scheduledAt: body.scheduledAt,
            provider: body.provider,
            estimatedCost: body.estimatedCost,
            actualCost: body.actualCost,
            notes: body.notes,
          }),
        });
        setNotice(fr ? 'Intervention mise à jour.' : 'Job updated.');
      } else {
        await api('/operations/maintenance', { method: 'POST', body: JSON.stringify(body) });
        setNotice(fr ? 'Intervention créée.' : 'Job created.');
      }
      resetForm();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Enregistrement impossible' : 'Save failed');
    }
  }

  async function convert(job: MaintenanceRequest) {
    setError(null);
    setNotice('');
    const property = properties.find((p) => p.id === job.propertyId);
    try {
      await api(`/operations/maintenance/${job.id}/expense`, {
        method: 'POST',
        body: JSON.stringify({ currency: property?.currency }),
      });
      setNotice(fr ? 'Dépense créée à partir de cette intervention.' : 'Expense created from this job.');
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Conversion impossible' : 'Could not convert to expense');
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    setError(null);
    try {
      await api(`/operations/maintenance/${pending.id}`, { method: 'DELETE' });
      if (editingId === pending.id) resetForm();
      setPending(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Suppression impossible' : 'Could not delete job');
    }
  }

  const tenantsForProperty = tenants.filter((t) => t.propertyId === form.propertyId);
  const filtered = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      if (filterProperty && job.propertyId !== filterProperty) return false;
      if (filterStatus && job.status !== filterStatus) return false;
      if (filterPriority && job.priority !== filterPriority) return false;
      return true;
    });
  }, [jobs, filterProperty, filterStatus, filterPriority]);

  if (error && jobs === null) return <ErrorState message={error} onRetry={() => void reload()} />;
  if (!jobs) return <LoadingState />;

  if (!properties.length) {
    return (
      <EmptyState
        title={fr ? 'Ajoutez un bien d’abord' : 'Add a property first'}
        body={fr ? 'Les interventions sont liées à un bien.' : 'Maintenance jobs are linked to a property.'}
        action={{ to: '/app/properties/new', label: fr ? 'Ajouter un bien' : 'Add property' }}
      />
    );
  }

  return (
    <>
      <PageHeader
        kicker="Maintenance"
        title={fr ? 'Interventions' : 'Jobs'}
        actions={
          <button className="btn clay" type="button" onClick={resetForm}>
            + {fr ? 'Nouvelle intervention' : 'New job'}
          </button>
        }
      />
      {notice && <p className="muted">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form card" onSubmit={(e) => void onSubmit(e)}>
        <h3>{editingId ? (fr ? 'Modifier l’intervention' : 'Edit job') : (fr ? 'Nouvelle intervention' : 'New job')}</h3>
        <div className="grid-2">
          <label>
            {fr ? 'Bien' : 'Property'}
            <select value={form.propertyId} onChange={(e) => set('propertyId', e.target.value)} disabled={Boolean(editingId)} required>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Locataire (optionnel)' : 'Tenant (optional)'}
            <select value={form.tenantId} onChange={(e) => set('tenantId', e.target.value)}>
              <option value="">{fr ? 'Aucun' : 'None'}</option>
              {tenantsForProperty.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {fr ? 'Titre' : 'Title'}
          <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </label>
        <label>
          {fr ? 'Description' : 'Description'}
          <input value={form.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="grid-2">
          <label>
            {fr ? 'Catégorie' : 'Category'}
            <input value={form.category} onChange={(e) => set('category', e.target.value)} />
          </label>
          <label>
            {fr ? 'Prestataire' : 'Vendor / provider'}
            <input value={form.provider} onChange={(e) => set('provider', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {fr ? 'Priorité' : 'Priority'}
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            {fr ? 'Statut' : 'Status'}
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="grid-2">
          <label>
            {fr ? 'Planifié le' : 'Scheduled'}
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} />
          </label>
          <label>
            {fr ? 'Notes' : 'Notes'}
            <input value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </label>
        </div>
        <div className="grid-2">
          <label>
            {fr ? 'Coût estimé' : 'Estimated cost'}
            <input type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(e) => set('estimatedCost', e.target.value)} />
          </label>
          <label>
            {fr ? 'Coût réel' : 'Actual cost'}
            <input type="number" min="0" step="0.01" value={form.actualCost} onChange={(e) => set('actualCost', e.target.value)} />
          </label>
        </div>
        <div className="ws-actions">
          <button className="btn" type="submit">{editingId ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Créer' : 'Create')}</button>
          {editingId && (
            <button className="btn secondary" type="button" onClick={resetForm}>{fr ? 'Annuler' : 'Cancel'}</button>
          )}
        </div>
      </form>

      <div className="ws-toolbar" style={{ marginTop: 16 }}>
        <select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
          <option value="">{fr ? 'Tous les biens' : 'All properties'}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">{fr ? 'Tous les statuts' : 'All statuses'}</option>
          {STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">{fr ? 'Toutes priorités' : 'All priorities'}</option>
          {PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      {!filtered.length ? (
        <p className="muted">{fr ? 'Aucune intervention.' : 'No jobs yet.'}</p>
      ) : (
        <div className="ws-kanban">
          {COLS.map((col) => (
            <section className="ws-kanban-col" key={col.id}>
              <h3>{fr ? col.fr : col.en}</h3>
              {filtered
                .filter((job) => (col.statuses as readonly string[]).includes(job.status))
                .map((job) => {
                  const property = properties.find((p) => p.id === job.propertyId);
                  const cost = job.actualCost ?? job.estimatedCost;
                  const canConvert = job.status === 'COMPLETED' && job.actualCost != null;
                  return (
                    <article className="ws-job" key={job.id}>
                      <span className={`ws-pill ${pillClass(job.priority)}`}>{job.priority}</span>
                      <p><strong>{job.title}</strong></p>
                      <p className="muted">{property?.name ?? job.propertyId}</p>
                      <p className="muted">
                        {job.provider || (fr ? 'Sans prestataire' : 'No vendor')}
                        {cost != null ? ` · ${money(cost, property?.currency, locale)}` : ''}
                      </p>
                      <div className="ws-actions">
                        <button className="btn ghost" type="button" onClick={() => fill(job)}>
                          {fr ? 'Modifier' : 'Edit'}
                        </button>
                        {canConvert && (
                          <button className="btn ghost" type="button" onClick={() => void convert(job)}>
                            {fr ? 'Créer une dépense' : 'Convert to expense'}
                          </button>
                        )}
                        <button className="btn ghost" type="button" onClick={() => setPending(job)}>
                          {fr ? 'Supprimer' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  );
                })}
            </section>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(pending)}
        title={fr ? 'Supprimer cette intervention ?' : 'Delete this job?'}
        body={pending ? pending.title : ''}
        confirmLabel={fr ? 'Supprimer' : 'Delete'}
        onCancel={() => setPending(null)}
        onConfirm={() => { void confirmDelete(); }}
      />
    </>
  );
}
