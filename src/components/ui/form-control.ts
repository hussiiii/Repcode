import { cva } from 'class-variance-authority';

// Native control geometry and palettes are shared by Input, Textarea and NativeSelect.
const focus = 'outline-none focus:outline-none focus:border-app-action-start/70 focus:ring-1 focus:ring-app-action-end/50';
const dialog = `px-3 py-2 bg-surface-field border border-border-subtle/70 rounded-md shadow-sm ${focus} text-foreground`;
export const formControlVariants = cva('', {
  variants: {
    variant: {
      dialog: `${dialog} transition-all duration-200`,
      problem: `${dialog} transition-colors duration-75`,
      settings: `px-3 py-2 bg-background border border-border-subtle/70 rounded-md shadow-sm ${focus} transition-all duration-200 text-foreground`,
      marketing: 'bg-surface border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-placeholder focus:outline-none focus:border-marketing-focus transition-colors',
      search: 'bg-surface border border-border rounded-lg pl-11 pr-4 py-2.5 text-foreground placeholder-placeholder focus:outline-none focus:border-app-action-end transition-colors',
      destination: 'bg-surface-field border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:border-app-action-end transition-colors',
      credential: `px-4 py-2.5 bg-surface-field text-foreground ${focus} transition-all duration-200`,
      chat: 'px-4 py-2 bg-transparent text-background outline-none placeholder:text-muted-foreground',
      report: `px-3 py-2 bg-surface-field rounded-md shadow-sm ${focus} transition-all duration-200 text-foreground`,
    },
    size: { field: 'h-11', natural: '' },
    align: { left: '', center: 'text-center' },
  },
  defaultVariants: { variant: 'dialog', align: 'left' },
});
