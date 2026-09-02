import type { ReactNode } from 'react';

type BrowserFrameProps = {
  title: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export function BrowserFrame({ title, children, className = '', flush = false }: BrowserFrameProps) {
  return (
    <figure className={`lp-browser${flush ? ' is-flush' : ''} ${className}`.trim()}>
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
