import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Keep the original shadcn variants available for existing consumers.
const standard = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
const actionColors = "bg-gradient-to-r from-app-action-start to-app-action-end text-foreground";
const actionHover = "hover:from-app-action-hover-start hover:to-app-action-hover-end";
const dialogHover = "hover:from-app-action-dialog-hover-start hover:to-app-action-dialog-hover-end";
const marketingColors = "bg-gradient-to-r from-marketing-action-start to-marketing-action-end text-marketing-action-foreground";
const marketingHover = "hover:from-marketing-action-hover-start hover:to-marketing-action-hover-end";
const tool = `${standard} border border-border bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground transition-colors`;

const styles = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        default: `${standard} bg-button text-button-foreground hover:bg-button/90 transition-colors`,
        destructive: `${standard} bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors`,
        outline: `${standard} border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors`,
        secondary: `${standard} bg-button-secondary text-button-secondary-foreground hover:bg-button-secondary/80 transition-colors`,
        ghost: `${standard} hover:bg-accent hover:text-accent-foreground transition-colors`,
        link: `${standard} text-foreground underline-offset-4 hover:underline transition-colors`,
        action: `flex items-center ${actionColors} ${actionHover} transition-all duration-200`,
        dialog: `relative overflow-hidden ${actionColors} ${dialogHover} transition-all duration-200`,
        danger: "relative overflow-hidden bg-gradient-to-r from-status-danger to-status-danger-soft hover:from-status-danger-hover hover:to-status-danger text-foreground shadow-md transition-all duration-200",
        quiet: "flex items-center bg-surface hover:bg-surface-emphasis border border-border hover:border-border-strong text-foreground transition-all duration-200",
        unavailable: "flex items-center bg-background border border-dashed border-border text-surface-control-disabled cursor-not-allowed opacity-60",
        close: "h-8 w-8 rounded-full hover:bg-border-subtle/70 transition-colors duration-200 flex items-center justify-center",
        choice: "block text-left bg-surface-field hover:bg-border-subtle/70 text-foreground font-medium transition-all duration-200 border border-border-subtle/50 hover:border-app-action-start/50",
        suggestion: "text-left bg-border hover:bg-border-strong text-foreground text-sm font-medium transition-colors flex items-center",
        selection: "bg-surface hover:bg-surface-emphasis text-muted-foreground hover:text-foreground transition-colors duration-200",
        text: "transition-colors",
        icon: "transition-colors",
        autofill: "relative overflow-hidden bg-foreground-nearwhite text-inverse transition duration-200 border border-transparent hover:opacity-90",
        generate: `flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${actionColors} ${dialogHover}`,
        lapse: "flex items-center gap-2 text-sm font-medium border border-status-error-border text-status-error hover:bg-status-error-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        billing: "font-medium transition ease-in-out duration-150 bg-action text-foreground",
        report: "flex items-center gap-2 transition-all duration-200 text-sm font-medium bg-transparent text-app-highlight hover:bg-surface-report-bug/60 hover:text-foreground data-[state=open]:bg-gradient-to-r data-[state=open]:from-app-action-start data-[state=open]:to-app-action-end data-[state=open]:text-foreground data-[state=open]:shadow-md data-[state=open]:hover:bg-transparent",
        save: `flex items-center shadow-lg transition-all duration-200 ${actionColors} ${actionHover} cursor-pointer`,
        signOut: "flex items-center justify-center gap-2 bg-transparent border border-status-danger/30 text-status-danger hover:bg-status-danger/10 hover:border-status-danger/50 hover:text-status-danger-soft transition-all duration-200 text-sm font-medium",
        send: "flex items-center justify-center text-foreground hover:bg-border-strong transition-colors",
        feedback: "border rounded-md transition-all duration-300",
        reminder: "flex items-center bg-gradient-to-r from-reminder-start to-reminder-end hover:from-reminder-hover-start hover:to-reminder-hover-end text-foreground transition-all duration-200 shadow-button-reminder hover:shadow-button-reminder-hover",
        marketing: `${marketingColors} ${marketingHover} flex items-center justify-center font-medium transition-all duration-200`,
        marketingNavigation: `${marketingColors} flex items-center transition-all duration-200 shadow-marketing-nav-button`,
        repository: "group relative overflow-hidden bg-background backdrop-blur-sm hover:bg-overlay/90 text-foreground font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 ease-out hover:scale-105 border border-foreground/10 flex items-center justify-center",
        signIn: "inline-flex justify-center items-center gap-x-2 text-sm font-medium border border-border bg-surface text-muted-foreground shadow-sm transition-all duration-200 hover:text-app-highlight hover:border-app-highlight",
        tool,
        toolActive: `${standard} bg-action hover:bg-action text-foreground transition-colors`,
        toolDanger: `${standard} border border-border bg-transparent text-status-error hover:text-status-error hover:bg-difficulty-hard-background transition-colors`,
        editorAction: "text-sm font-medium flex items-center space-x-2 text-foreground hover:text-foreground hover:bg-background/50 transition-all duration-200",
        workspaceMore: "px-3 py-2 text-sm font-medium rounded-full flex items-center gap-1.5 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-background/50 data-[state=open]:bg-app-action-end/15 data-[state=open]:text-foreground data-[active=true]:bg-app-action-end/15 data-[active=true]:text-foreground",
        disclosure: 'p-2 rounded-md hover:bg-border-subtle/50 cursor-pointer transition-colors duration-200 flex items-center justify-between text-lg font-semibold text-foreground',
        help: 'inline-flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors',
        contentsToggle: 'flex items-center cursor-pointer text-left font-bold',
      navigationToggle: "p-2 text-muted-foreground hover:text-foreground transition-colors",
        sidebarCollapse: "p-1.5 rounded-lg text-placeholder hover:text-foreground hover:bg-surface transition-colors flex-shrink-0",
        sidebarNav: "block w-full py-1.5 px-2 rounded-lg text-left transition-all duration-300 text-placeholder hover:bg-surface hover:text-foreground data-[active=true]:bg-gradient-to-r data-[active=true]:from-app-action-start data-[active=true]:to-app-action-end data-[active=true]:text-foreground",
        study: "bg-gradient-to-r from-metric-due to-app-action-end hover:from-app-action-hover-start hover:to-app-action-hover-end text-foreground font-medium flex items-center justify-center transition-all duration-200 shadow-lg shadow-app-action-end/20 hover:shadow-app-action-end/30",
        marketingFloating: `${marketingColors} ${marketingHover} flex items-center text-xs font-medium shadow-lg`,
        bare: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        natural: "",
        action: "px-4 py-2 rounded-lg",
        dialog: "py-2 px-6 rounded-md",
        compact: "text-xs px-3 py-1.5 rounded-md",
        small: "px-3 py-1.5 rounded-md",
        comfortable: "py-2.5 px-4 rounded-lg",
        large: "py-3 px-4 rounded-lg",
        choice: "py-3 px-4 rounded-md",
        hero: "px-8 py-4 rounded-lg",
        repository: "px-8 py-3 rounded-2xl",
        iconSm: "p-1 rounded-lg",
        iconMd: "p-2 rounded-lg",
        menu: "p-1.5 rounded-lg",
        calendar: "p-1.5 rounded-md",
        timer: "p-1 rounded",
        reminder: "px-4 py-3 rounded-full",
        feedback: "py-0.5 px-4",
        floating: "px-2 py-1.5 md:px-3 md:py-2 rounded-full text-xs",
        suggestion: "p-2.5 rounded-md",
        editorAction: "px-3 py-2 rounded-lg",
        fieldAccessory: "px-3",
        send: "px-4",
      },
      tone: {
        inherit: "",
        muted: "text-muted-foreground hover:text-foreground",
        placeholder: "text-placeholder hover:text-foreground",
        menu: "hover:bg-surface-emphasis text-placeholder hover:text-foreground",
        accent: "text-muted-foreground hover:text-app-highlight",
        editor: "text-foreground hover:text-foreground",
        appAction: actionHover,
        edit: "hover:bg-surface-emphasis text-placeholder hover:text-app-action-end duration-200",
        danger: "hover:bg-surface-emphasis text-placeholder hover:text-status-danger-soft duration-200",
        preview: "text-muted-foreground hover:text-foreground hover:bg-background",
        calendar: "hover:bg-calendar-inactive text-muted-foreground hover:text-foreground",
        timer: "hover:bg-background/50 text-muted-foreground",
        video: "text-foreground hover:text-muted-foreground",
        remove: "text-xs text-status-error hover:underline disabled:opacity-50",
        again: "border-status-error-border text-status-error hover:bg-status-error-background",
        hard: "border-feedback-hard-border text-feedback-hard hover:bg-feedback-hard-background",
        good: "border-feedback-good-border text-feedback-good hover:bg-feedback-good-background",
        easy: "border-feedback-easy-border text-feedback-easy hover:bg-feedback-easy-background",
        unrated: "border-border text-foreground",
      },
      weight: { normal: "font-normal", medium: "font-medium", semibold: "font-semibold" },
      emphasis: {
        none: "",
        dialog: "shadow-md",
        raised: "shadow-button-action hover:shadow-button-action-hover",
        marketingHero: "shadow-lg shadow-marketing-glow/20 hover:shadow-marketing-glow/30",
        marketingForm: "shadow-lg hover:shadow-marketing-action-hover",
        floating: "shadow-lg",
        study: "from-metric-due shadow-lg shadow-app-action-end/20 hover:shadow-app-action-end/30",
        navigation: "hover:shadow-marketing-nav-button-hover",
      },
    },
  }
);

type StyleProps = VariantProps<typeof styles>;
export type ButtonVariant = NonNullable<StyleProps['variant']>;
const standardVariants: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
const fadingVariants: ButtonVariant[] = ['dialog', 'danger', 'autofill', 'signIn'];

// State styles live here too: callers pass state, never reconstruct a disabled palette.
export function buttonVariants({ variant = 'default', size, disabled = false, loading = false, ...props }: StyleProps & { disabled?: boolean; loading?: boolean } = {}) {
  const unavailable = disabled || loading;
  return cn(
    styles({ ...props, variant, size: size ?? (standardVariants.includes(variant!) ? 'default' : 'natural') }),
    unavailable && fadingVariants.includes(variant!) && 'opacity-50 cursor-not-allowed',
    unavailable && variant === 'dialog' && props.emphasis !== 'dialog' && 'hover:from-app-action-start hover:to-app-action-end',
    unavailable && variant === 'signIn' && 'hover:text-muted-foreground hover:border-border',
    unavailable && variant === 'send' && 'text-muted-foreground cursor-not-allowed hover:bg-transparent',
    unavailable && variant === 'generate' && 'bg-none bg-border-subtle/50 text-foreground-quiet cursor-not-allowed',
    unavailable && variant === 'save' && 'bg-none bg-app-action-end/50 cursor-not-allowed',
    unavailable && variant === 'billing' && 'bg-control-disabled text-control-disabled-foreground cursor-not-allowed',
    unavailable && variant === 'marketing' && 'disabled:opacity-70 disabled:cursor-not-allowed',
    unavailable && variant === 'tool' && 'disabled:text-control-disabled-foreground disabled:bg-control-disabled',

  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  asChild?: boolean;
  /** Keep caller-provided progress content; expose busy state and prevent duplicate actions. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, tone, emphasis, weight, asChild = false, disabled = false, loading = false, type, onClick, onKeyDown, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const unavailable = disabled || loading;
    // Slot normally composes the child's handlers before its own. Suppress the
    // child too when a link is unavailable, so it cannot navigate or mutate state.
    const content = asChild && unavailable && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
          onClick: event => { event.preventDefault(); event.stopPropagation(); },
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); }
          },
        })
      : children;
    return (
      <Comp
        {...props}
        ref={ref}
        type={asChild ? undefined : type ?? 'button'}
        disabled={asChild ? undefined : unavailable}
        aria-disabled={asChild && unavailable ? true : props['aria-disabled']}
        aria-busy={loading ? true : props['aria-busy']}
        tabIndex={asChild && unavailable ? -1 : props.tabIndex}
        className={cn(buttonVariants({ variant, size, tone, emphasis, weight, disabled, loading }), className)}
        onClick={event => {
          if (unavailable) { event.preventDefault(); event.stopPropagation(); return; }
          onClick?.(event);
        }}
        onKeyDown={event => {
          if (unavailable && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.stopPropagation(); return; }
          onKeyDown?.(event);
        }}
      >
        {content}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
export { Button };
