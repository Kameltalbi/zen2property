import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Lease, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

export function LeasesPage() {
  const { t } = useI18n();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      api<{ leases: Lease[] }>('/leases'),
      api<{ properties: Property[] }>('/properties'),
      api<{ tenants: Tenant[] }>('/tenants'),
    ])
      .then(([l, p, ten]) => {
        setLeases(l.leases);
        setProperties(p.properties);
        setTenants(ten.tenants);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const propertyName = (id: string) => properties.find((p) => p.id === id)?.name ?? '—';
  const tenantName = (id: string) => {
    const tenant = tenants.find((x) => x.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : '—';
  };

  const increaseLabel = (lease: Lease) => {
    if (lease.rentIncreaseFrequency === 'none') return t.leases.increaseNone;
    if (lease.rentIncreaseFrequency === 'yearly') return t.leases.increaseYearly;
    if (lease.rentIncreaseFrequency === 'every_2_years') return t.leases.increase2y;
    if (lease.rentIncreaseFrequency === 'every_3_years') return t.leases.increase3y;
    return `${t.leases.increaseOther} (${lease.rentIncreaseOtherMonths ?? '—'} ${t.leases.months})`;
  };

  const canCreate = properties.length > 0 && tenants.length > 0;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{t.leases.kicker}</p>
          <h1>{t.leases.title}</h1>
        </div>
        <Link
          className="btn"
          to={canCreate ? '/app/leases/new' : tenants.length === 0 ? '/app/tenants/new' : '/app/properties/new'}
        >
          {canCreate ? t.leases.add : tenants.length === 0 ? t.app.addTenant : t.app.addProperty}
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      {!loading && !canCreate && <p className="muted">{t.leases.needBoth}</p>}
      {!loading && canCreate && leases.length === 0 && <p className="muted">{t.leases.empty}</p>}
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>{t.leases.property}</th>
              <th>{t.leases.tenant}</th>
              <th>{t.leases.status}</th>
              <th>{t.leases.rent}</th>
              <th>{t.leases.increase}</th>
              <th>{t.leases.start}</th>
            </tr>
          </thead>
          <tbody>
            {leases.map((lease) => (
              <tr key={lease.id}>
                <td>
                  <Link to={`/app/leases/${lease.id}`}>{propertyName(lease.propertyId)}</Link>
                </td>
                <td>{tenantName(lease.tenantId)}</td>
                <td>
                  <span className="pill">{t.leases.statusLabels[lease.status]}</span>
                </td>
                <td>
                  {lease.monthlyRent} {lease.currency}
                </td>
                <td>{increaseLabel(lease)}</td>
                <td>{lease.startDate.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
