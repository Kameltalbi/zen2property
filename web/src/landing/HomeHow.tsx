import { useI18n } from '../i18n';
import { Reveal } from './Reveal';

export function HomeHow() {
  const { t } = useI18n();
  const h = t.home.how;

  return (
    <section className="home-section home-how" id="how" aria-labelledby="home-how-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-intro">
            <p className="kicker">{h.kicker}</p>
            <h2 id="home-how-title">{h.title}</h2>
          </div>
        </Reveal>
        <Reveal>
          <ol className="home-how-grid">
            {h.steps.map((step, i) => (
              <li key={step.title}>
                <article className="home-how-card">
                  <span className="home-how-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.body}</p>
                </article>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
