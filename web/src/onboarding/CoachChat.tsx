import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

const STORAGE_KEY = 'rentelyo.coach';
const RESET_EVENT = 'rentelyo-coach-reset';

type CoachState = {
  step: number;
  dismissed: boolean;
};

function storageKey(userId: string | undefined): string {
  return `${STORAGE_KEY}.${userId ?? 'guest'}`;
}

function readState(userId: string | undefined): CoachState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { step: 0, dismissed: false };
    const parsed = JSON.parse(raw) as CoachState;
    return {
      step: Number(parsed.step) || 0,
      dismissed: Boolean(parsed.dismissed),
    };
  } catch {
    return { step: 0, dismissed: false };
  }
}

function writeState(userId: string | undefined, state: CoachState): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function resetCoachTips(userId?: string): void {
  writeState(userId, { step: 0, dismissed: false });
  window.dispatchEvent(new Event(RESET_EVENT));
}

type Tip = {
  id: string;
  body: string;
  cta?: { to: string; label: string };
};

export function CoachChat() {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [state, setState] = useState<CoachState>(() => readState(user?.id));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setState(readState(user?.id));
  }, [user?.id]);

  useEffect(() => {
    function onReset() {
      setState({ step: 0, dismissed: false });
      setVisible(true);
    }
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  useEffect(() => {
    if (state.dismissed) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, [state.dismissed, location.pathname]);

  const tips: Tip[] = useMemo(
    () => [
      { id: 'welcome', body: t.coach.welcome },
      {
        id: 'property',
        body: t.coach.property,
        cta: { to: '/app/properties/new', label: t.coach.addProperty },
      },
      {
        id: 'rent',
        body: t.coach.rent,
        cta: { to: '/app/finances', label: t.coach.openFinances },
      },
      {
        id: 'settings',
        body: t.coach.settings,
        cta: { to: '/app/settings', label: t.coach.openSettings },
      },
      { id: 'done', body: t.coach.done },
    ],
    [t],
  );

  if (state.dismissed || !visible) return null;

  const index = Math.min(state.step, tips.length - 1);
  const tip = tips[index];
  const isLast = index >= tips.length - 1;

  function persist(next: CoachState) {
    setState(next);
    writeState(user?.id, next);
  }

  function next() {
    if (isLast) {
      persist({ step: tips.length, dismissed: true });
      setVisible(false);
      return;
    }
    persist({ step: index + 1, dismissed: false });
  }

  function skip() {
    persist({ step: tips.length, dismissed: true });
    setVisible(false);
  }

  return (
    <div className="coach" role="dialog" aria-label={t.coach.title}>
      <div className="coach-thread">
        <div className="coach-row">
          <span className="coach-avatar" aria-hidden>
            R
          </span>
          <div className="coach-bubble">
            <p className="coach-label">{t.coach.from}</p>
            <p className="coach-text">{tip.body}</p>
            {tip.cta && (
              <Link className="coach-link" to={tip.cta.to} onClick={() => next()}>
                {tip.cta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="coach-actions">
        <button type="button" className="coach-skip" onClick={skip}>
          {t.coach.skip}
        </button>
        <button type="button" className="coach-next" onClick={next}>
          {isLast ? t.coach.gotIt : t.coach.next}
        </button>
      </div>
      <p className="coach-progress">
        {index + 1} / {tips.length}
      </p>
    </div>
  );
}
