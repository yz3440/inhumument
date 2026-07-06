import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'accent' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const BASE = [
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)]',
  'font-sans text-[12px] font-medium',
  'transition-[color,background-color,opacity,box-shadow] duration-150',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-40',
  '[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
].join(' ');

const VARIANTS: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-[var(--shadow-chrome)] hover:bg-[var(--interactive-hover)]',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
  outline:
    'border border-border bg-background text-foreground shadow-[var(--shadow-chrome)] hover:bg-muted/80 hover:border-border',
  ghost: 'text-foreground hover:bg-muted/60',
  link: 'text-primary underline-offset-2 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  default: 'h-7 px-2.5',
  sm: 'h-6 px-2 text-[11px]',
  lg: 'h-8 px-3.5',
  icon: 'h-7 w-7',
};

export function buttonClasses(
  opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {},
): string {
  const { variant = 'default', size = 'default', className } = opts;
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
