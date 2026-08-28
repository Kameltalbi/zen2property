import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Property, type Tenant } from '../api';

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([api<{ properties: Property[] }>('/properties'), api<{ tenants: Tenant[] }>('/tenants')])
      .then(([p, t]) => {
        setProperties(p.properties);
        setTenants(t.tenants);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">Portfolio</p>
          <h1>Properties</h1>
        </div>
        <Link className="btn" to="/app/properties/new">
          Add property
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card table-scroll" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Country</th>
              <th>Rent</th>
              <th>Tenant</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => {
              const tenant = tenants.find((t) => t.propertyId === p.id && !t.moveOutDate);
              return (
                <tr key={p.id}>
                  <td>
                    <Link to={`/app/properties/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.address}</td>
                  <td>{p.countryCode}</td>
                  <td>
                    {p.monthlyRent ?? '—'} {p.currency}
                  </td>
                  <td>{tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Vacant'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
