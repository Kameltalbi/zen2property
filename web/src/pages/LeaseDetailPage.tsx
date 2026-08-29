import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Lease, type Property, type Tenant } from '../api';
import { useI18n } from '../i18n';

export function LeaseDetailPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [lease, setLease] = useState<Lease | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const { lease: next } = await api<{ lease: Lease }>(`/leases/${id}`);
        const [{ property: prop }, { tenant: ten }] = await Promise.all([
          api<{ property: Property }>(`/properties/${next.propertyId}`),
          api<{ tenant: Tenant }>(`/tenants/${next.tenantId}`),
        ]);
        setLease(next);
        setProperty(prop);
        setTenant(ten);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Load failed');
      }
    })();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!lease) return <p className="muted">{locale === 'fr' ? 'Chargement…' : 'Loading…'}</p>;

  const increase =
    lease.rentIncreaseFrequency === 'none'
      ? t.leases.increaseNone
      : lease.rentIncreaseFrequency === 'yearly'
        ? t.leases.increaseYearly
        : lease.rentIncreaseFrequency === 'every_2_years'
          ? t.leases.increase2y
          : lease.rentIncreaseFrequency === 'every_3_years'
            ? t.leases.increase3y
            : `${t.leases.increaseOther} — ${lease.rentIncreaseOtherMonths ?? '—'} ${t.leases.months}`;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="kicker">{t.leases.kicker}</p>
          <h1>{lease.label || property?.name || t.leases.title}</h1>
          <p className="muted">
            {property?.name} · {tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'} ·{' '}
            {t.leases.statusLabels[lease.status]}
          </p>
        </div>
        <Link className="btn secondary" to={`/app/leases/${lease.id}/edit`}>
          {t.leases.editLink}
        </Link>
      </div>

      <div className="ws-grid two">
        <div className="ws-card">
          <h3>{t.leases.sectionDates}</h3>
          <ul className="ws-list">
            <li>
              <strong>{t.leases.start}</strong> · {lease.startDate.slice(0, 10)}
            </li>
            <li>
              <strong>{t.leases.end}</strong> · {lease.endDate?.slice(0, 10) ?? '—'}
            </li>
            <li>
              <strong>{t.leases.durationMonths}</strong> · {lease.durationMonths ?? '—'}
            </li>
            <li>
              <strong>{t.leases.noticeDays}</strong> · {lease.noticePeriodDays}
            </li>
            <li>
              <strong>{t.leases.leaseType}</strong> · {t.leases.typeLabels[lease.leaseType]}
            </li>
          </ul>
        </div>
        <div className="ws-card">
          <h3>{t.leases.sectionMoney}</h3>
          <ul className="ws-list">
            <li>
              <strong>{t.leases.monthlyRent}</strong> · {lease.monthlyRent} {lease.currency}
            </li>
            <li>
              <strong>{t.leases.monthlyCharges}</strong> · {lease.monthlyCharges} {lease.currency}
            </li>
            <li>
              <strong>{t.leases.deposit}</strong> · {lease.deposit} {lease.currency}
            </li>
            <li>
              <strong>{t.leases.paymentDay}</strong> · {lease.paymentDay}
            </li>
            <li>
              <strong>{t.leases.paymentFrequency}</strong> ·{' '}
              {lease.paymentFrequency === 'monthly' ? t.leases.freqMonthly : t.leases.freqQuarterly}
            </li>
          </ul>
        </div>
        <div className="ws-card">
          <h3>{t.leases.sectionIncrease}</h3>
          <ul className="ws-list">
            <li>
              <strong>{t.leases.increaseFrequency}</strong> · {increase}
            </li>
            {lease.rentIncreaseFrequency !== 'none' && (
              <>
                <li>
                  <strong>{t.leases.increaseType}</strong> · {t.leases.increaseTypeLabels[lease.rentIncreaseType]}
                </li>
                <li>
                  <strong>{t.leases.increaseValue}</strong> · {lease.rentIncreaseValue}
                </li>
                {lease.rentIncreaseIndex && (
                  <li>
                    <strong>{t.leases.indexName}</strong> · {lease.rentIncreaseIndex}
                  </li>
                )}
                <li>
                  <strong>{t.leases.nextIncrease}</strong> · {lease.nextIncreaseDate?.slice(0, 10) ?? '—'}
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="ws-card">
          <h3>{t.leases.sectionExtras}</h3>
          <ul className="ws-list">
            <li>
              {t.leases.includesUtilities}: {lease.includesUtilities ? t.legalReview.yes : t.legalReview.no}
            </li>
            <li>
              {t.leases.petsAllowed}: {lease.petsAllowed ? t.legalReview.yes : t.legalReview.no}
            </li>
            {lease.notes && (
              <li>
                <strong>{t.leases.notes}</strong>
                <p className="muted">{lease.notes}</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
