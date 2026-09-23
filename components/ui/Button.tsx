import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 shadow-sm",
      secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm",
      outline: "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300",
      danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
      md: "h-9 px-3.5 text-xs font-medium rounded-lg gap-2",
      lg: "h-10 px-4 text-sm font-medium rounded-lg gap-2.5",
      icon: "h-8 w-8 p-0 rounded-lg justify-center items-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
