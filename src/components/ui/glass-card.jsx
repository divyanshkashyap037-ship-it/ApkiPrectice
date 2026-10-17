import { cn } from '@/lib/utils';

export function GlassCard({ className, ...props }) {
  return (
    <div
      className={cn('glass-card', className)}
      {...props}
    />
  );
}
