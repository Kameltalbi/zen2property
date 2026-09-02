import type { ReactNode } from 'react';

type BrowserFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function BrowserFrame({ title, children, className = '' }: BrowserFrameProps) {
  return (
    <figure className={`lp-browser ${className}`}>
      <div className="lp-browser-chrome" aria-hidden>
        <span />
        <span />
        <span />
        <p className="lp-browser-url">{title}</p>
      </div>
      <div className="lp-browser-body">{children}</div>
    </figure>
  );
}
