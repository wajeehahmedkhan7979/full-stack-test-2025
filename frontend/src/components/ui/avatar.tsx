import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback: string;
  variant?: 'user' | 'assistant';
}

export function Avatar({ fallback, variant = 'user', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        variant === 'assistant'
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
          : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
        className,
      )}
      {...props}
    >
      {fallback}
    </div>
  );
}
