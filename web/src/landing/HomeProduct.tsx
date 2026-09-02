import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { BrowserFrame } from './BrowserFrame';
import { Reveal } from './Reveal';

export function HomeProduct() {
  const { t } = useI18n();
  const h = t.home.product;

  return (
    <section className="home-section home-product" id="product" aria-labelledby="home-product-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-intro">
            <p className="kicker">{h.kicker}</p>
            <h2 id="home-product-title">{h.title}</h2>
            <p className="lede">{h.body}</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="home-product-stage">
            <BrowserFrame title="app.rentelyo.com" flush className="home-product-frame">
              <img
                src="/capture-dashboard.jpg"
                alt={h.imageAlt}
                width={1600}
                height={980}
                loading="lazy"
                decoding="async"
              />
            </BrowserFrame>
            {h.chips.map((chip, i) => (
              <aside className={`home-chip home-chip-${i + 1}`} key={chip.title}>
                <span className={`home-chip-dot${i === 1 ? ' is-alert' : ''}`} aria-hidden />
                <p>{chip.title}</p>
              </aside>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="home-section-cta">
            <Link className="btn clay" to="/features">
              {h.cta}
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
