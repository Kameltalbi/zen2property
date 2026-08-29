import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { contacts, properties } from '../workspace/demo';
import { PageHeader } from '../workspace/ui';

export function ContactsPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const roles = [...new Set(contacts.map((c) => c.role))];
  const list = useMemo(
    () =>
      contacts.filter((c) => {
        if (role && c.role !== role) return false;
        return `${c.name} ${c.email} ${c.role}`.toLowerCase().includes(q.toLowerCase());
      }),
    [q, role],
  );

  return (
    <>
      <PageHeader kicker={fr ? 'Contacts' : 'Contacts'} title={fr ? 'Répertoire' : 'Directory'} />
      <div className="ws-toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Rechercher' : 'Search'} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{fr ? 'Tous les rôles' : 'All roles'}</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="grid-2">
        {list.map((c) => (
          <article className="ws-card" key={c.id}>
            <h3>{c.name}</h3>
            <p>
              <span className="ws-pill">{c.role}</span>
            </p>
            <p className="muted">
              {c.email} · {c.phone}
            </p>
            <p className="muted">
              {c.propertyIds.map((id) => properties.find((p) => p.id === id)?.name).join(' · ')}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
