type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/logo.png"
      alt="Zen2Property"
      width={196}
      height={32}
    />
  );
}
