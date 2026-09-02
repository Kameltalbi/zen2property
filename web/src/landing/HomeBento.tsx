import { useI18n } from '../i18n';
import { HomeIcon } from './HomeIcon';
import { Reveal } from './Reveal';

export function HomeBento() {
  const { t } = useI18n();
  const f = t.home.features;
  const b = t.home.bento;

  return (
    <section className="home-section home-bento-section" id="features" aria-labelledby="home-bento-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-intro">
            <p className="kicker">{f.kicker}</p>
            <h2 id="home-bento-title">{f.title}</h2>
            <p className="lede">{f.body}</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="home-bento">
            <article className="home-bento-card is-main">
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name="building" />
              </span>
              <h3>{b.properties.title}</h3>
              <p className="muted">{b.properties.body}</p>
              <img
                className="home-bento-shot"
                src="/capture-properties.jpg"
                alt={b.properties.imageAlt}
                width={980}
                height={560}
                loading="lazy"
                decoding="async"
              />
            </article>

            <article className="home-bento-card is-tenants">
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name="users" />
              </span>
              <h3>{b.tenants.title}</h3>
              <p className="muted">{b.tenants.body}</p>
              <div className="home-mini-rows" aria-hidden>
                <span />
                <span />
                <span className="is-short" />
              </div>
            </article>

            <article className="home-bento-card is-rent">
              <div className="home-bento-head">
                <span className="home-bento-icon" aria-hidden>
                  <HomeIcon name="coins" />
                </span>
                <span className="home-late-pill">{b.rent.late}</span>
              </div>
              <h3>{b.rent.title}</h3>
              <p className="muted">{b.rent.body}</p>
              <div className="home-rent-track" aria-hidden>
                <i style={{ width: '82%' }} />
                <i className="is-late" style={{ width: '38%' }} />
              </div>
            </article>

            <article className="home-bento-card is-docs">
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name="pdf" />
              </span>
              <h3>{b.documents.title}</h3>
              <p className="muted">{b.documents.body}</p>
              <div className="home-paper-stack" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            </article>

            <article className="home-bento-card is-exp">
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name="chart" />
              </span>
              <h3>{b.expenses.title}</h3>
              <p className="muted">{b.expenses.body}</p>
              <div className="home-bars" aria-hidden>
                <i style={{ height: '62%' }} />
                <i style={{ height: '88%' }} />
                <i style={{ height: '44%' }} />
                <i style={{ height: '70%' }} />
              </div>
            </article>

            <article className="home-bento-card is-mnt">
              <span className="home-bento-icon" aria-hidden>
                <HomeIcon name="wrench" />
              </span>
              <h3>{b.maintenance.title}</h3>
              <p className="muted">{b.maintenance.body}</p>
              <ul className="home-mini-checks" aria-hidden>
                <li />
                <li />
                <li />
              </ul>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
