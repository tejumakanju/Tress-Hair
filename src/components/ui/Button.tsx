import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-noir text-white hover:bg-charcoal border border-noir",
  secondary:
    "bg-champagne text-noir hover:bg-champagne-light border border-champagne",
  outline:
    "bg-white text-noir border border-noir hover:bg-noir hover:text-white",
  ghost:
    "bg-transparent text-noir hover:text-champagne-dark",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2.5 text-xs tracking-widest",
  md: "min-h-12 px-6 py-3 text-xs tracking-[0.2em]",
  lg: "min-h-12 md:min-h-14 px-6 md:px-8 py-3.5 md:py-4 text-sm tracking-[0.25em]",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-sans uppercase transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
