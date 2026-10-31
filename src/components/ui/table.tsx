import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './scroll-area';

export type TableVariant = 'app' | 'preview' | 'guideInfo' | 'guideReference';
const TableContext = React.createContext<TableVariant>('app');

export const TableContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <ScrollArea ref={ref} direction="horizontal" {...props} className={className} />
);
TableContainer.displayName = 'TableContainer';

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement> & { variant?: TableVariant }>(
  ({ variant = 'app', className, ...props }, ref) => <TableContext.Provider value={variant}>
    <table ref={ref} {...props} className={cn(
      variant === 'app' || variant === 'preview' ? 'w-full' : 'min-w-full bg-background',
      variant === 'guideInfo' && 'divide-y divide-border',
      variant === 'guideReference' && 'border border-border',
      className,
    )} />
  </TableContext.Provider>
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const variant = React.useContext(TableContext);
    return <thead ref={ref} {...props} className={cn(variant === 'guideInfo' && 'bg-background/70', className)} />;
  }
);
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const variant = React.useContext(TableContext);
    return <tbody ref={ref} {...props} className={cn(variant === 'guideInfo' && 'divide-y divide-border/30', className)} />;
  }
);
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr ref={ref} {...props} className={className} />
);
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }>(
  ({ align = 'left', className, ...props }, ref) => {
    const variant = React.useContext(TableContext);
    return <th ref={ref} scope="col" {...props} className={cn(
      variant === 'app' && 'py-4 px-6 text-muted-foreground font-medium text-sm',
      variant === 'preview' && 'py-4 text-muted-foreground font-medium text-sm',
      variant === 'guideInfo' && 'px-6 py-3 text-lg font-bold text-foreground',
      variant === 'guideReference' && 'px-4 py-2 border-b-2 border-border text-lg font-bold text-foreground',
      align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center',
      className,
    )} />;
  }
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right' | 'center';
  emphasis?: boolean;
}>(
  ({ align = 'left', emphasis = false, className, ...props }, ref) => {
    const variant = React.useContext(TableContext);
    return <td ref={ref} {...props} className={cn(
      variant === 'app' && 'py-4 px-6',
      variant === 'preview' && 'py-4',
      variant === 'guideInfo' && 'px-6 py-4 text-muted-foreground',
      variant === 'guideReference' && 'px-4 py-2 border-b border-border text-lg text-muted-foreground',
      emphasis && (variant === 'guideInfo' ? 'text-lg font-semibold' : 'font-bold'),
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      className,
    )} />;
  }
);
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} {...props} className={cn('mt-4 text-sm text-muted-foreground', className)} />
);
TableCaption.displayName = 'TableCaption';
