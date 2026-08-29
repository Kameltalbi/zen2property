import { useI18n } from '../i18n';
import { jobs, properties } from '../workspace/demo';
import { money } from '../workspace/format';
import { PageHeader } from '../workspace/ui';

const COLS = [
  { id: 'todo', fr: 'À traiter', en: 'To do' },
  { id: 'planned', fr: 'Planifiées', en: 'Planned' },
  { id: 'progress', fr: 'En cours', en: 'In progress' },
  { id: 'done', fr: 'Terminées', en: 'Done' },
] as const;

export function MaintenancePage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  return (
    <>
      <PageHeader kicker="Maintenance" title={fr ? 'Interventions' : 'Jobs'} />
      <div className="ws-kanban">
        {COLS.map((col) => (
          <section className="ws-kanban-col" key={col.id}>
            <h3>{fr ? col.fr : col.en}</h3>
            {jobs
              .filter((j) => j.status === col.id)
              .map((j) => (
                <article className="ws-job" key={j.id}>
                  <span className={`ws-pill ${j.priority}`}>{j.priority}</span>
                  <p>
                    <strong>{j.title}</strong>
                  </p>
                  <p className="muted">{properties.find((p) => p.id === j.propertyId)?.name}</p>
                  <p className="muted">
                    {j.vendor} · {j.due} · {money(j.estimate)}
                  </p>
                </article>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}
