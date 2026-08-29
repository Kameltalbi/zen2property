import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { events, properties } from '../workspace/demo';
import { PageHeader } from '../workspace/ui';

export function CalendarPage() {
  const { locale } = useI18n();
  const fr = locale === 'fr';
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  return (
    <>
      <PageHeader
        kicker={fr ? 'Calendrier' : 'Calendar'}
        title="Septembre 2026"
        actions={
          <div className="ws-segment">
            <button type="button" className={view === 'month' ? 'on' : ''} onClick={() => setView('month')}>
              {fr ? 'Mois' : 'Month'}
            </button>
            <button type="button" className={view === 'week' ? 'on' : ''} onClick={() => setView('week')}>
              {fr ? 'Semaine' : 'Week'}
            </button>
            <button type="button" className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>
              {fr ? 'Liste' : 'List'}
            </button>
          </div>
        }
      />
      {view !== 'list' ? (
        <div className="ws-cal">
          {days.slice(0, view === 'week' ? 7 : 30).map((d) => {
            const iso = `2026-09-${String(d).padStart(2, '0')}`;
            const dayEvents = events.filter((e) => e.date === iso);
            return (
              <div key={d}>
                <strong>{d}</strong>
                {dayEvents.map((e) => (
                  <p key={e.id} className="muted">
                    {e.title}
                    {e.propertyId ? ` · ${properties.find((p) => p.id === e.propertyId)?.name}` : ''}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ws-card">
          {events.map((e) => (
            <p key={e.id}>
              {e.date} · {e.title} · {e.kind}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
