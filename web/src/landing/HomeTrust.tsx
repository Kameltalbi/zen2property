import { useI18n } from '../i18n';
import { HomeIcon } from './HomeIcon';
import { Reveal } from './Reveal';

const icons = ['lock', 'file', 'users', 'devices'] as const;

export function HomeTrust() {
  const { t } = useI18n();
  const h = t.home.trust;

  return (
    <section className="home-section home-trust" id="trust" aria-labelledby="home-trust-title">
      <div className="home-wrap">
        <Reveal>
          <div className="home-intro">
            <h2 id="home-trust-title">{h.title}</h2>
            <p className="lede">{h.body}</p>
          </div>
          <ul className="home-trust-row">
            {h.items.map((item, i) => (
              <li key={item}>
                <span className="home-trust-icon" aria-hidden>
                  <HomeIcon name={icons[i] ?? 'lock'} />
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
