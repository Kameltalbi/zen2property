import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { Reveal } from './Reveal';

export function HomeCta() {
  const { t } = useI18n();
  const h = t.home.finalCta;

  return (
    <section className="home-section home-cta" id="get-started" aria-labelledby="home-cta-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-cta-panel">
            <h2 id="home-cta-title">{h.title}</h2>
            <p className="lede">{h.body}</p>
            <div className="home-cta-actions">
              <Link className="btn clay" to="/signup">
                {h.primary}
              </Link>
              <Link className="btn secondary" to="/features">
                {h.secondary}
              </Link>
            </div>
            <p className="home-cta-note">{h.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
