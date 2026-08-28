import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Property, type Tenant } from '../api';

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([api<{ tenants: Tenant[] }>('/tenants'), api<{ properties: Property[] }>('/properties')])
      .then(([t, p]) => {
        setTenants(t.tenants);
        setProperties(p.properties);
      })
      .catch((e) => setError(e.message));
  }, []);

  const nameOf = (id: string) => properties.find((p) => p.id === id)?.name ?? '—';

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">People</p>
          <h1>Tenants</h1>
        </div>
        <Link className="btn" to="/app/tenants/new">
          Add tenant
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Property</th>
              <th>Email</th>
              <th>Move-in</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/app/tenants/${t.id}`}>
                    {t.firstName} {t.lastName}
                  </Link>
                </td>
                <td>{nameOf(t.propertyId)}</td>
                <td>{t.email ?? '—'}</td>
                <td>{t.moveInDate.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
