type BrandLogoProps = {
  className?: string;
  onDark?: boolean;
};

export function BrandLogo({ className = '', onDark = false }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={onDark ? '/logo-on-dark.png' : '/logo.png'}
      alt="Rentelyo"
      width={185}
      height={57}
    />
  );
}
