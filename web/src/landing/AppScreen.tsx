import { useI18n } from '../i18n';

export type ScreenId = 'dashboard' | 'properties' | 'rent' | 'finances' | 'documents' | 'maintenance';

/** UI previews built from real Rentelyo workspace patterns (demo labels, same visual language). */
export function AppScreen({ screen }: { screen: ScreenId }) {
  const { locale } = useI18n();
  const fr = locale === 'fr';

  if (screen === 'dashboard') {
    return (
      <div className="lp-screen">
        <p className="lp-screen-kicker">{fr ? 'Tableau de bord' : 'Dashboard'}</p>
        <div className="lp-screen-kpis">
          <div>
            <small>{fr ? 'Revenus' : 'Income'}</small>
            <strong>4 280 €</strong>
          </div>
          <div>
            <small>{fr ? 'À recevoir' : 'Due'}</small>
            <strong>1 150 €</strong>
          </div>
          <div>
            <small>{fr ? 'Dépenses' : 'Expenses'}</small>
            <strong>920 €</strong>
          </div>
          <div>
            <small>{fr ? 'Occupation' : 'Occupancy'}</small>
            <strong>92 %</strong>
          </div>
        </div>
        <div className="lp-screen-panels">
          <div className="lp-screen-chart" aria-hidden>
            <i style={{ height: '42%' }} />
            <i style={{ height: '68%' }} />
            <i style={{ height: '55%' }} />
            <i style={{ height: '78%' }} />
            <i style={{ height: '62%' }} />
            <i style={{ height: '88%' }} />
          </div>
          <ul className="lp-screen-list">
            <li>{fr ? 'Loyer Dupont — échéance 5' : 'Dupont rent — due on 5th'}</li>
            <li>{fr ? 'Toiture — devis reçu' : 'Roof — quote received'}</li>
            <li>{fr ? 'DPE à renouveler' : 'EPC to renew'}</li>
          </ul>
        </div>
      </div>
    );
  }

  if (screen === 'properties') {
    return (
      <div className="lp-screen">
        <p className="lp-screen-kicker">{fr ? 'Mes biens' : 'My properties'}</p>
        <div className="lp-screen-rows">
          <article>
            <strong>Terreaux</strong>
            <span>{fr ? 'Loué · 1 150 €' : 'Rented · €1,150'}</span>
          </article>
          <article>
            <strong>Saint-Mitre</strong>
            <span>{fr ? 'Loué · 980 €' : 'Rented · €980'}</span>
          </article>
          <article>
            <strong>Part-Dieu</strong>
            <span>{fr ? 'Vacant · —' : 'Vacant · —'}</span>
          </article>
        </div>
      </div>
    );
  }

  if (screen === 'rent') {
    return (
      <div className="lp-screen">
        <p className="lp-screen-kicker">{fr ? 'Suivi des loyers' : 'Rent tracking'}</p>
        <table className="lp-screen-table">
          <thead>
            <tr>
              <th>{fr ? 'Locataire' : 'Tenant'}</th>
              <th>{fr ? 'Statut' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>C. Dupont</td>
              <td>
                <span className="lp-pill ok">{fr ? 'Payé' : 'Paid'}</span>
              </td>
            </tr>
            <tr>
              <td>J. Martin</td>
              <td>
                <span className="lp-pill warn">{fr ? 'Attendu' : 'Due'}</span>
              </td>
            </tr>
            <tr>
              <td>A. Benali</td>
              <td>
                <span className="lp-pill late">{fr ? 'Retard' : 'Late'}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (screen === 'finances') {
    return (
      <div className="lp-screen">
        <p className="lp-screen-kicker">{fr ? 'Revenus et dépenses' : 'Income & expenses'}</p>
        <div className="lp-screen-finance">
          <div>
            <small>{fr ? 'Cash-flow du mois' : 'Monthly cash-flow'}</small>
            <strong>+ 3 360 €</strong>
          </div>
          <ul>
            <li>
              <span>{fr ? 'Loyers' : 'Rent'}</span>
              <b>+4 280 €</b>
            </li>
            <li>
              <span>{fr ? 'Charges' : 'Charges'}</span>
              <b>−420 €</b>
            </li>
            <li>
              <span>{fr ? 'Travaux' : 'Works'}</span>
              <b>−500 €</b>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (screen === 'documents') {
    return (
      <div className="lp-screen">
        <p className="lp-screen-kicker">{fr ? 'Documents' : 'Documents'}</p>
        <div className="lp-screen-rows">
          <article>
            <strong>{fr ? 'Bail — Terreaux' : 'Lease — Terreaux'}</strong>
            <span>PDF</span>
          </article>
          <article>
            <strong>{fr ? 'Quittance août' : 'August receipt'}</strong>
            <span>PDF</span>
          </article>
          <article>
            <strong>{fr ? 'État des lieux' : 'Inventory'}</strong>
            <span>PDF</span>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-screen">
      <p className="lp-screen-kicker">{fr ? 'Maintenance' : 'Maintenance'}</p>
      <div className="lp-screen-rows">
        <article>
          <strong>{fr ? 'Fuite salle de bain' : 'Bathroomroom leak'}</strong>
          <span className="lp-pill late">{fr ? 'Priorité' : 'High'}</span>
        </article>
        <article>
          <strong>{fr ? 'Entretien chaudière' : 'Boiler service'}</strong>
          <span className="lp-pill warn">{fr ? 'Planifié' : 'Scheduled'}</span>
        </article>
        <article>
          <strong>{fr ? 'Peinture entrée' : 'Entrance paint'}</strong>
          <span className="lp-pill ok">{fr ? 'Terminé' : 'Done'}</span>
        </article>
      </div>
    </div>
  );
}
