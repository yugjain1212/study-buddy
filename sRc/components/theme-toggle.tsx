import { Button } from './button';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** If sidebar is collapsed we only show icon without label */
  collapsed?: boolean;
  className?: string;
}

export function ThemeToggle({ collapsed, className = '' }: ThemeToggleProps) {
  const { isDark, toggle } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn('w-full justify-start hover:bg-secondary', className, collapsed ? 'px-2' : 'px-3')}
    >
      {isDark ? (
        <Sun className={cn('w-5 h-5', collapsed ? '' : 'mr-3')} />
      ) : (
        <Moon className={cn('w-5 h-5', collapsed ? '' : 'mr-3')} />
      )}
      {!collapsed && <span className="text-sm font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </Button>
  );
}
