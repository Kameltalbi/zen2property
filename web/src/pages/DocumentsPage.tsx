import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { documents, properties } from '../workspace/demo';
import { ConfirmDialog, PageHeader } from '../workspace/ui';

const CATS = ['propriété', 'acquisition', 'assurance', 'fiscalité', 'crédit', 'contrat', 'diagnostic', 'travaux', 'facture', 'garantie', 'autre'];

export function DocumentsPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [q, setQ] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [rows, setRows] = useState(documents);

  const list = useMemo(
    () =>
      rows.filter((d) => {
        if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
        if (propertyId && d.propertyId !== propertyId) return false;
        if (cat && d.category !== cat) return false;
        if (status && d.status !== status) return false;
        return true;
      }),
    [rows, q, propertyId, cat, status],
  );

  return (
    <>
      <PageHeader kicker="Documents" title={fr ? 'Bibliothèque' : 'Library'} />
      <div className="ws-toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Rechercher' : 'Search'} />
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">{fr ? 'Tous les biens' : 'All properties'}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">{fr ? 'Catégorie' : 'Category'}</option>
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{fr ? 'Statut' : 'Status'}</option>
          <option value="valid">{fr ? 'Valide' : 'Valid'}</option>
          <option value="expiring">{fr ? 'Expire bientôt' : 'Expiring'}</option>
          <option value="expired">{fr ? 'Expiré' : 'Expired'}</option>
        </select>
      </div>
      <div className="grid-2">
        {list.map((d) => (
          <article className="ws-card" key={d.id}>
            <span className={`ws-pill ${d.status}`}>{d.status}</span>
            <h3>{d.title}</h3>
            <p className="muted">
              {properties.find((p) => p.id === d.propertyId)?.name} · {d.category}
            </p>
            <p className="muted">
              {fr ? 'Ajouté' : 'Added'} {d.addedAt}
              {d.expiresAt ? ` · ${fr ? 'expire' : 'expires'} ${d.expiresAt}` : ''}
            </p>
            <div className="ws-actions">
              <button className="btn secondary" type="button">
                {fr ? 'Aperçu' : 'Preview'}
              </button>
              <button className="btn ghost" type="button">
                {fr ? 'Télécharger' : 'Download'}
              </button>
              <button className="btn ghost" type="button" onClick={() => setPending(d.id)}>
                {fr ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title={fr ? 'Supprimer ce document ?' : 'Delete this document?'}
        body=""
        confirmLabel={fr ? 'Supprimer' : 'Delete'}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          setRows((list) => list.filter((d) => d.id !== pending));
          setPending(null);
        }}
      />
    </>
  );
}
