import logoSrc from '../assets/CoWave_logo.svg';

export default function CoWaveLogo({
  variant = 'full',
  size = 36,
  className = '',
}) {
  const computedSize =
    typeof size === 'number' ? Math.round(size * 1.15) : size;
  const dimension = typeof computedSize === 'number' ? `${computedSize}px` : computedSize;
  const image = (
    <img
      src={logoSrc}
      alt="CoWave"
      className="select-none"
      style={{
        height: dimension,
        width: variant === 'icon' ? dimension : 'auto',
      }}
      draggable={false}
      loading="lazy"
    />
  );

  if (variant === 'icon') {
    return <div className={className}>{image}</div>;
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center text-white font-semibold ${className}`}>
        CoWave
      </div>
    );
  }

  return <div className={`inline-flex items-center gap-3 ${className}`}>{image}</div>;
}
