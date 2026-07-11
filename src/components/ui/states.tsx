import { Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="w-8 h-8 text-champagne animate-spin mb-4"
        strokeWidth={1.5}
      />
      <p className="text-sm text-muted tracking-wide">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: StateAction;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 md:py-20 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <Icon
          className="w-12 h-12 text-champagne mb-5"
          strokeWidth={1}
          aria-hidden
        />
      )}
      <h2 className="font-serif text-2xl tracking-[0.12em] uppercase mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted max-w-md leading-relaxed mb-8">
          {description}
        </p>
      )}
      {action &&
        (action.href ? (
          <Button href={action.href} variant="primary" size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem continues, contact support.",
  action,
  secondaryAction,
  className,
}: {
  title?: string;
  description?: string;
  action?: StateAction;
  secondaryAction?: StateAction;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 md:py-20 px-4 text-center",
        className
      )}
      role="alert"
    >
      <div className="w-12 h-12 border border-crimson/40 text-crimson flex items-center justify-center mb-5 text-lg">
        !
      </div>
      <h2 className="font-serif text-2xl tracking-[0.12em] uppercase mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted max-w-md leading-relaxed mb-8">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action &&
          (action.href ? (
            <Button href={action.href} variant="primary" size="lg">
              {action.label}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        {secondaryAction &&
          (secondaryAction.href ? (
            <Button href={secondaryAction.href} variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ))}
      </div>
    </div>
  );
}

export function SuccessState({
  title,
  description,
  children,
  actions,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: StateAction[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 md:py-20 px-4 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full border border-champagne text-champagne flex items-center justify-center mb-6 text-xl">
        ✓
      </div>
      <h1 className="font-serif text-3xl tracking-[0.15em] uppercase mb-4">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted max-w-md leading-relaxed mb-4">
          {description}
        </p>
      )}
      {children}
      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          {actions.map((a) =>
            a.href ? (
              <Button
                key={a.label}
                href={a.href}
                variant={a === actions[0] ? "primary" : "outline"}
                size="lg"
              >
                {a.label}
              </Button>
            ) : (
              <Button
                key={a.label}
                type="button"
                variant={a === actions[0] ? "primary" : "outline"}
                size="lg"
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="aspect-[4/5] bg-cream mb-3" />
      <div className="h-3 bg-cream w-3/4 mb-2" />
      <div className="h-3 bg-cream w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageLoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <LoadingState label={label} />
    </div>
  );
}
