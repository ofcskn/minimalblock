
type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className = '', label = 'Loading…' }: SpinnerProps) {
  return (
    <div role="status" className={`flex flex-col items-center gap-2 ${className}`}>
      <span className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClass[size]}`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
