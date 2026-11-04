import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-accent font-display text-lg text-accent-foreground shadow-[0_10px_24px_-10px_hsl(var(--accent)/0.8)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_28px_-10px_hsl(var(--accent)/0.9)]",
        outline: "border-2 border-border bg-card hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-md",
        ghost: "hover:bg-muted hover:text-accent",
      },
      size: { default: "h-14 px-7", sm: "h-11 px-4 text-sm", icon: "h-11 w-11" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
