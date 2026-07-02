import React from "react";

export type CardVariant = "flat" | "gold" | "silver" | "copper" | "crystal";
export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  isLight?: boolean;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

// gold/silver/copper/crystal already switch light/dark off the .dark
// ancestor class in index.css, so only "flat" needs the isLight prop.
function variantClasses(variant: CardVariant, isLight: boolean): string {
  if (variant === "flat") {
    return isLight
      ? "bg-white border border-zinc-200 text-zinc-900 shadow-sm"
      : "bg-zinc-900 border border-zinc-800 text-white shadow-sm";
  }
  return `${variant}-liner-box`;
}

export function Card({
  variant = "flat",
  isLight = false,
  padding = "md",
  hover = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variant === "flat" ? "rounded-xl" : ""} ${PADDING_CLASSES[padding]} ${variantClasses(variant, isLight)} ${hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
