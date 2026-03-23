import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  id: string;
  label: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (itemId: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav
      className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(item.id)}
            className={cn(
              'text-sm transition-colors whitespace-nowrap',
              index === items.length - 1
                ? 'font-medium text-foreground cursor-default'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
          {index < items.length - 1 && (
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
      ))}
    </nav>
  );
}
