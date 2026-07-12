import React from "react";

export type ButtonVariant = "primary" | "amber" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLight?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "py-1.5 px-3 text-xs gap-1.5",
  md: "py-3 px-4 text-sm gap-2",
};

function variantClasses(variant: ButtonVariant, isLight: boolean): string {
  switch (variant) {
    case "primary":
      return "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 focus:ring-orange-500";
    case "amber":
      return "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md shadow-amber-500/20 focus:ring-amber-500";
    case "danger":
      return "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 focus:ring-rose-500";
    case "secondary":
      return isLight
        ? "bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 focus:ring-zinc-400"
        : "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 focus:ring-zinc-600";
    case "ghost":
      return isLight
        ? "bg-transparent text-zinc-600 hover:bg-zinc-100 focus:ring-zinc-400"
        : "bg-transparent text-zinc-300 hover:bg-zinc-800/70 focus:ring-zinc-600";
  }
}

export function Button({
  variant = "primary",
  size = "md",
  isLight = false,
  fullWidth = false,
  icon,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 ${SIZE_CLASSES[size]} ${variantClasses(variant, isLight)} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
