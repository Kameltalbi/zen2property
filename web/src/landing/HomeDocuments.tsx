import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { HomeIcon } from './HomeIcon';
import { Reveal } from './Reveal';

export function HomeDocuments() {
  const { t } = useI18n();
  const h = t.home.documents;

  return (
    <section className="home-section home-docs" id="documents" aria-labelledby="home-docs-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-docs-panel">
            <div className="home-docs-photo">
              <img
                src="/signup.jpg"
                alt={h.imageAlt}
                width={576}
                height={1024}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="home-docs-copy">
              <p className="kicker">{h.kicker}</p>
              <h2 id="home-docs-title">{h.title}</h2>
              <p className="lede">{h.body}</p>
              <ul className="home-check-list">
                {h.checks.map((item) => (
                  <li key={item}>
                    <HomeIcon name="check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="home-section-cta is-left">
                <Link className="btn clay" to="/features#documents">
                  {h.cta}
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
