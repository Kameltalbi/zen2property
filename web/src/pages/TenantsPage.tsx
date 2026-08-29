import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

export function TenantsPage() {
  const { t } = useI18n();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([api<{ tenants: Tenant[] }>('/tenants'), api<{ properties: Property[] }>('/properties')])
      .then(([ten, props]) => {
        setTenants(ten.tenants);
        setProperties(props.properties);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const nameOf = (id: string) => properties.find((p) => p.id === id)?.name ?? '—';

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{t.tenants.kicker}</p>
          <h1>{t.tenants.title}</h1>
        </div>
        <Link className="btn" to={properties.length ? '/app/tenants/new' : '/app/properties/new'}>
          {properties.length ? t.tenants.add : t.app.addProperty}
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      {!loading && properties.length === 0 && <p className="muted">{t.tenants.needProperty}</p>}
      {!loading && properties.length > 0 && tenants.length === 0 && <p className="muted">{t.tenants.empty}</p>}
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>{t.tenants.name}</th>
              <th>{t.tenants.property}</th>
              <th>{t.tenants.email}</th>
              <th>{t.tenants.moveIn}</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <Link to={`/app/tenants/${tenant.id}`}>
                    {tenant.firstName} {tenant.lastName}
                  </Link>
                </td>
                <td>{nameOf(tenant.propertyId)}</td>
                <td>{tenant.email ?? '—'}</td>
                <td>{tenant.moveInDate.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
