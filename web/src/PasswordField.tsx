import { useId } from 'react';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  showLabel: string;
  hideLabel: string;
  autoComplete?: string;
  minLength?: number;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path
          fill="currentColor"
          d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
        />
        <path
          fill="currentColor"
          d="M3.3 3.3 20.7 20.7l-1.4 1.4L1.9 4.7z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      />
    </svg>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  showLabel,
  hideLabel,
  autoComplete = 'new-password',
  minLength = 8,
}: PasswordFieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="password-field">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
        />
        <button type="button" onClick={onToggleShow} aria-pressed={show} aria-label={show ? hideLabel : showLabel}>
          <EyeIcon open={show} />
        </button>
      </span>
    </div>
  );
}
