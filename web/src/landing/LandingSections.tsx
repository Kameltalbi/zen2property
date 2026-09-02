import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppScreen, type ScreenId } from './AppScreen';
import { BrowserFrame } from './BrowserFrame';
import { Reveal } from './Reveal';

function IconFast() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path fill="currentColor" d="M13 3 4 14h7l-1 7 10-12h-7l0-6z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 1 1 4 0v2h-4V7zm3 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
      />
    </svg>
  );
}
function IconDevices() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M4 5h12a1 1 0 0 1 1 1v9H3V6a1 1 0 0 1 1-1zm-1 12h14v2H3v-2zm16-9h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2V8z"
      />
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 3v2h18V9H3zm0 5v3h6v-3H3z"
      />
    </svg>
  );
}

const trustIcons = [IconFast, IconLock, IconDevices, IconCard];

export function LandingSections() {
  const { t } = useI18n();
  const h = t.home;
  const [slide, setSlide] = useState(0);
  const screens = h.demo.slides;
  const current = screens[slide] ?? screens[0];

  return (
    <>
      <section className="lp-trust" aria-label={h.trust.aria}>
        <div className="container lp-trust-track">
          {h.trust.items.map((item, i) => {
            const Icon = trustIcons[i] ?? IconFast;
            return (
              <div className="lp-trust-item" key={item.id}>
                <span className="lp-trust-icon">
                  <Icon />
                </span>
                <div>
                  <p className="lp-trust-title">{item.title}</p>
                  <p className="muted">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lp-band section">
        <Reveal>
          <div className="container">
            <h2>{h.problem.title}</h2>
            <p className="lede lp-lede">{h.problem.lede}</p>
            <div className="lp-card-grid">
              {h.problem.cards.map((card) => (
                <article className="lp-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p className="muted">{card.body}</p>
                </article>
              ))}
            </div>
            <p className="lp-close">{h.problem.close}</p>
          </div>
        </Reveal>
      </section>

      <section className="container section" id="dashboard">
        <Reveal>
          <div className="lp-split">
            <div>
              <h2>{h.dashboard.title}</h2>
              <p className="lede lp-lede">{h.dashboard.lede}</p>
              <ul className="lp-bullets">
                {h.dashboard.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn secondary" to="/features#dashboard">
                {h.dashboard.cta}
              </Link>
            </div>
            <BrowserFrame title="www.rentelyo.com/app">
              <AppScreen screen="dashboard" />
            </BrowserFrame>
          </div>
        </Reveal>
      </section>

      <section className="lp-band section" id="features">
        <Reveal>
          <div className="container">
            <h2>{h.featureGrid.title}</h2>
            <p className="lede lp-lede">{h.featureGrid.lede}</p>
            <div className="lp-card-grid three">
              {h.featureGrid.items.map((item) => (
                <article className="lp-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.body}</p>
                </article>
              ))}
            </div>
            <p className="lp-actions">
              <Link className="btn secondary" to="/features">
                {h.featureGrid.cta}
              </Link>
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container section" id="how">
        <Reveal>
          <h2>{h.steps.title}</h2>
          <ol className="lp-steps">
            {h.steps.items.map((step, i) => (
              <li key={step.title}>
                <span className="lp-step-num" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.body}</p>
                </div>
                <BrowserFrame title={`step-${i + 1}`} className="lp-step-frame">
                  <AppScreen screen={i === 0 ? 'properties' : i === 1 ? 'rent' : 'dashboard'} />
                </BrowserFrame>
              </li>
            ))}
          </ol>
          <p className="lp-actions">
            <Link className="btn clay" to="/signup">
              {h.steps.cta}
            </Link>
          </p>
        </Reveal>
      </section>

      <section className="lp-band section" id="audience">
        <Reveal>
          <div className="container">
            <h2>{h.audience.title}</h2>
            <div className="lp-card-grid three">
              {h.audience.items.map((item) => (
                <article className="lp-card lp-audience-card" key={item.title}>
                  <div className={`lp-audience-art art-${item.title.length % 3}`} aria-hidden />
                  <h3>{item.title}</h3>
                  <p className="muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="lp-security section" id="security-teaser">
        <Reveal>
          <div className="container">
            <h2>{h.security.title}</h2>
            <p className="lede lp-lede">{h.security.lede}</p>
            <ul className="lp-security-list">
              {h.security.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link className="btn secondary" to="/security">
              {h.security.cta}
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="container section" id="demo">
        <Reveal>
          <h2>{h.demo.title}</h2>
          <p className="lede lp-lede">{h.demo.lede}</p>
          <div className="lp-demo">
            <BrowserFrame title={`app · ${current.title}`}>
              <AppScreen screen={current.screen as ScreenId} />
            </BrowserFrame>
            <div>
              <div className="lp-demo-tabs" role="tablist" aria-label={h.demo.title}>
                {screens.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    role="tab"
                    aria-selected={i === slide}
                    className={i === slide ? 'on' : ''}
                    onClick={() => setSlide(i)}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <h3>{current.title}</h3>
              <p className="muted">{current.body}</p>
              <p className="muted lp-video-slot">{h.demo.videoSlotNote}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="lp-band section" id="faq">
        <Reveal>
          <div className="container lp-faq">
            <h2>{h.faqHome.title}</h2>
            <div className="lp-accordion">
              {h.faqHome.items.map((item) => (
                <details key={item.q} className="lp-acc-item">
                  <summary>{item.q}</summary>
                  <p className="muted">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="lp-actions">
              <Link to="/help#faq">{h.faqHome.cta}</Link>
            </p>
          </div>
        </Reveal>
      </section>

      <section className="lp-final section" id="get-started">
        <Reveal>
          <div className="container lp-final-inner">
            <h2>{h.finalCta.title}</h2>
            <p className="lede">{h.finalCta.lede}</p>
            <div className="lp-final-actions">
              <Link className="btn clay" to="/signup">
                {h.finalCta.primary}
              </Link>
              <Link className="btn secondary" to="/features">
                {h.finalCta.secondary}
              </Link>
            </div>
            <p className="lp-final-note">{h.finalCta.note}</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
