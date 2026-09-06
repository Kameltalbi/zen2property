import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api, type Lease, type MaintenanceRequest, type Payment, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';
import { money, occupancyLabel, propertyTypeLabel } from '../workspace/format';
import { ErrorState, LoadingState, PageHeader } from '../workspace/ui';

export function PropertyDetailPage() {
  const { id } = useParams();
  const { locale, t } = useI18n();
  const fr = locale === 'fr';
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [jobs, setJobs] = useState<MaintenanceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  async function load() {
    if (!id) return;
    try {
      setError(null);
      const [prop, ten, lease, pay, maint] = await Promise.all([
        api<{ property: Property }>(`/properties/${id}`),
        api<{ tenants: Tenant[] }>(`/tenants?propertyId=${id}`),
        api<{ leases: Lease[] }>(`/leases?propertyId=${id}`),
        api<{ payments: Payment[] }>(`/payments?propertyId=${id}`),
        api<{ maintenance: MaintenanceRequest[] }>('/operations/maintenance'),
      ]);
      setProperty(prop.property);
      setTenants(ten.tenants);
      setLeases(lease.leases);
      setPayments(pay.payments);
      setJobs(maint.maintenance.filter((job) => job.propertyId === id));
    } catch (err) {
      const status = err && typeof err === 'object' && 'status' in err ? Number(err.status) : 0;
      if (status === 404) {
        setMissing(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Unable to load property');
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (missing) return <Navigate to="/app/properties" replace />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!property) return <LoadingState label={t.pages.loading} />;

  const occupied = tenants.some((tenant) => !tenant.moveOutDate);
  const location = [property.address, property.postalCode, property.city, property.countryCode]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <PageHeader
        kicker={fr ? 'Fiche bien' : 'Property'}
        title={property.name}
        actions={
          <>
            <Link className="btn secondary" to={`/app/properties/${property.id}/edit`}>
              {fr ? 'Modifier' : 'Edit'}
            </Link>
            <Link className="btn" to={`/app/tenants/new?propertyId=${property.id}`}>
              {t.app.addTenant}
            </Link>
          </>
        }
      />
      <div className="ws-card">
        <p className="muted">{location}</p>
        <p>
          <span className={`ws-pill ${occupied ? 'rented' : 'vacant'}`}>
            {occupancyLabel[occupied ? 'rented' : 'vacant'][locale]}
          </span>
        </p>
        <div className="ws-grid kpi" style={{ marginTop: 12 }}>
          <div>
            <span className="muted">{fr ? 'Type' : 'Type'}</span>
            <b>{propertyTypeLabel(property.type, locale)}</b>
          </div>
          <div>
            <span className="muted">m²</span>
            <b>{property.surface ?? '—'}</b>
          </div>
          <div>
            <span className="muted">{fr ? 'Loyer / mois' : 'Rent / mo'}</span>
            <b>
              {property.monthlyRent != null
                ? money(property.monthlyRent, property.currency, locale)
                : '—'}
            </b>
          </div>
          <div>
            <span className="muted">{fr ? 'Charges / mois' : 'Charges / mo'}</span>
            <b>{money(property.monthlyCharges, property.currency, locale)}</b>
          </div>
        </div>
      </div>

      <div className="ws-grid two" style={{ marginTop: 16 }}>
        <div className="ws-card">
          <h3>{t.app.tenants}</h3>
          {tenants.length === 0 ? (
            <p className="muted">{t.tenants.empty}</p>
          ) : (
            tenants.map((tenant) => (
              <p key={tenant.id}>
                <Link to={`/app/tenants/${tenant.id}`}>
                  {tenant.firstName} {tenant.lastName}
                </Link>
                {tenant.email ? ` · ${tenant.email}` : ''}
              </p>
            ))
          )}
          <Link className="btn secondary" to={`/app/tenants/new?propertyId=${property.id}`}>
            {t.app.addTenant}
          </Link>
        </div>
        <div className="ws-card">
          <h3>{t.app.leases}</h3>
          {leases.length === 0 ? (
            <p className="muted">{t.leases.empty}</p>
          ) : (
            leases.map((lease) => (
              <p key={lease.id}>
                <Link to={`/app/leases/${lease.id}`}>{lease.label || t.app.leases}</Link>
                {' · '}
                {t.leases.statusLabels[lease.status]}
              </p>
            ))
          )}
          <Link
            className="btn secondary"
            to={`/app/leases/new?propertyId=${property.id}${tenants[0] ? `&tenantId=${tenants[0].id}` : ''}`}
          >
            {t.leases.add}
          </Link>
        </div>
      </div>

      <div className="ws-card" style={{ marginTop: 16 }}>
        <h3>{t.leases.rent}</h3>
        {payments.length === 0 ? (
          <p className="muted">{fr ? 'Aucun loyer enregistré.' : 'No rent recorded yet.'}</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{fr ? 'Période' : 'Period'}</th>
                  <th>{fr ? 'Montant' : 'Amount'}</th>
                  <th>{fr ? 'Statut' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.periodStart.slice(0, 10)} → {payment.periodEnd.slice(0, 10)}
                    </td>
                    <td>{money(payment.amount, payment.currency, locale)}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link className="btn" to={`/app/rent?propertyId=${property.id}`}>
          {fr ? 'Enregistrer un loyer' : 'Record rent'}
        </Link>
      </div>

      <div className="ws-card" style={{ marginTop: 16 }}>
        <h3>{t.app.maintenance}</h3>
        {jobs.length === 0 ? (
          <p className="muted">{fr ? 'Aucune intervention.' : 'No jobs yet.'}</p>
        ) : (
          jobs.map((job) => (
            <p key={job.id}>
              {job.title} · {job.status} · {job.priority}
            </p>
          ))
        )}
        <Link className="btn secondary" to={`/app/maintenance?propertyId=${property.id}`}>
          {fr ? 'Nouvelle intervention' : 'New job'}
        </Link>
      </div>
    </>
  );
}
