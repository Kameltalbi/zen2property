import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, apiUpload, downloadBlob, type Lease, type Property, type StoredDocument, type Tenant } from '../api';
import { useI18n } from '../i18n';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader } from '../workspace/ui';

const CATEGORIES: StoredDocument['category'][] = [
  'CONTRACT',
  'ID',
  'INVENTORY',
  'INVOICE',
  'QUOTE',
  'INSURANCE',
  'GUARANTEE',
  'LETTER',
  'PHOTO',
  'PROOF',
  'OTHER',
];

export function DocumentsPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [rows, setRows] = useState<StoredDocument[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<StoredDocument | null>(null);
  const [q, setQ] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({
    title: '',
    category: 'OTHER' as StoredDocument['category'],
    propertyId: '',
    tenantId: '',
    leaseId: '',
    expiresAt: '',
    notes: '',
    file: null as File | null,
  });

  async function reload() {
    const [p, t, l, d] = await Promise.all([
      api<{ properties: Property[] }>('/properties'),
      api<{ tenants: Tenant[] }>('/tenants'),
      api<{ leases: Lease[] }>('/leases'),
      api<{ documents: StoredDocument[] }>('/documents'),
    ]);
    setProperties(p.properties);
    setTenants(t.tenants);
    setLeases(l.leases);
    setRows(d.documents);
    setForm((f) => ({ ...f, propertyId: f.propertyId || p.properties[0]?.id || '' }));
  }

  useEffect(() => {
    void reload().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load documents'));
  }, []);

  const list = useMemo(() => {
    if (!rows) return [];
    return rows.filter((doc) => {
      if (filterProperty && doc.propertyId !== filterProperty) return false;
      if (filterCategory && doc.category !== filterCategory) return false;
      if (q && !`${doc.title} ${doc.fileName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, filterProperty, filterCategory, q]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.file) {
      setError(fr ? 'Choisissez un fichier.' : 'Choose a file.');
      return;
    }
    setError(null);
    setNotice('');
    const data = new FormData();
    data.append('file', form.file);
    data.append('title', form.title);
    data.append('category', form.category);
    if (form.propertyId) data.append('propertyId', form.propertyId);
    if (form.tenantId) data.append('tenantId', form.tenantId);
    if (form.leaseId) data.append('leaseId', form.leaseId);
    if (form.expiresAt) data.append('expiresAt', form.expiresAt);
    if (form.notes) data.append('notes', form.notes);
    try {
      await apiUpload('/documents', data);
      setNotice(fr ? 'Document enregistré.' : 'Document saved.');
      setForm((f) => ({ ...f, title: '', notes: '', expiresAt: '', file: null }));
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Envoi impossible' : 'Upload failed');
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    try {
      await api(`/documents/${pending.id}`, { method: 'DELETE' });
      setPending(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr ? 'Suppression impossible' : 'Could not delete document');
    }
  }

  const tenantsForProperty = tenants.filter((t) => !form.propertyId || t.propertyId === form.propertyId);
  const leasesForProperty = leases.filter((l) => !form.propertyId || l.propertyId === form.propertyId);

  if (error && rows === null) return <ErrorState message={error} onRetry={() => void reload()} />;
  if (!rows) return <LoadingState />;
  if (!properties.length) {
    return (
      <EmptyState
        title={fr ? 'Ajoutez un bien d’abord' : 'Add a property first'}
        body={fr ? 'Les documents sont associés à vos biens.' : 'Documents are linked to your properties.'}
        action={{ to: '/app/properties/new', label: fr ? 'Ajouter un bien' : 'Add property' }}
      />
    );
  }

  return (
    <>
      <PageHeader kicker={fr ? 'Documents' : 'Documents'} title={fr ? 'Bibliothèque' : 'Library'} />
      {notice && <p className="muted">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form card" onSubmit={(e) => void onSubmit(e)}>
        <h3>{fr ? 'Ajouter un document' : 'Upload a document'}</h3>
        <div className="grid-2">
          <label>
            {fr ? 'Titre' : 'Title'}
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </label>
          <label>
            {fr ? 'Catégorie' : 'Category'}
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as StoredDocument['category'] }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Bien' : 'Property'}
            <select value={form.propertyId} onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value, tenantId: '', leaseId: '' }))}>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Locataire (optionnel)' : 'Tenant (optional)'}
            <select value={form.tenantId} onChange={(e) => setForm((f) => ({ ...f, tenantId: e.target.value }))}>
              <option value="">{fr ? 'Aucun' : 'None'}</option>
              {tenantsForProperty.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Bail (optionnel)' : 'Lease (optional)'}
            <select value={form.leaseId} onChange={(e) => setForm((f) => ({ ...f, leaseId: e.target.value }))}>
              <option value="">{fr ? 'Aucun' : 'None'}</option>
              {leasesForProperty.map((l) => (
                <option key={l.id} value={l.id}>{l.label || l.id.slice(0, 8)}</option>
              ))}
            </select>
          </label>
          <label>
            {fr ? 'Expiration (optionnel)' : 'Expiry (optional)'}
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </label>
          <label>
            {fr ? 'Fichier' : 'File'}
            <input type="file" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} required />
          </label>
        </div>
        <label>
          {fr ? 'Notes' : 'Notes'}
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </label>
        <button className="btn" type="submit">{fr ? 'Téléverser' : 'Upload'}</button>
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
          <option value="">{fr ? 'Catégorie' : 'Category'}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid-2">
        {list.map((doc) => (
          <article className="ws-card" key={doc.id}>
            <span className="ws-pill">{doc.category}</span>
            <h3>{doc.title}</h3>
            <p className="muted">
              {properties.find((p) => p.id === doc.propertyId)?.name ?? '—'} · {doc.fileName}
            </p>
            <p className="muted">
              {fr ? 'Ajouté' : 'Added'} {String(doc.createdAt).slice(0, 10)}
              {doc.expiresAt ? ` · ${fr ? 'expire' : 'expires'} ${String(doc.expiresAt).slice(0, 10)}` : ''}
            </p>
            <div className="ws-actions">
              <button className="btn ghost" type="button" onClick={() => void downloadBlob(`/documents/${doc.id}/file`, doc.fileName)}>
                {fr ? 'Télécharger' : 'Download'}
              </button>
              <button className="btn ghost" type="button" onClick={() => setPending(doc)}>
                {fr ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!list.length && <p className="muted">{fr ? 'Aucun document.' : 'No documents yet.'}</p>}
      <ConfirmDialog
        open={Boolean(pending)}
        title={fr ? 'Supprimer ce document ?' : 'Delete this document?'}
        body={pending?.title ?? ''}
        confirmLabel={fr ? 'Supprimer' : 'Delete'}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
