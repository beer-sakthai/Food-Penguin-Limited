import React from "react";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "brand";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  isLight?: boolean;
  pulse?: boolean;
  uppercase?: boolean;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

// Full class strings kept static (not interpolated) so Tailwind's scanner can find them.
const TONE_CLASSES_DARK: Record<BadgeTone, string> = {
  success: "bg-emerald-950/40 text-emerald-400 border-emerald-900/40",
  warning: "bg-amber-950/40 text-amber-400 border-amber-900/40",
  danger: "bg-rose-950/40 text-rose-400 border-rose-900/40",
  neutral: "bg-zinc-900 text-zinc-400 border-zinc-800",
  info: "bg-sky-950/40 text-sky-400 border-sky-900/40",
  brand: "bg-orange-950/40 text-orange-400 border-orange-900/40",
};

const TONE_CLASSES_LIGHT: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-rose-100 text-rose-700 border-rose-200",
  neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
  brand: "bg-orange-100 text-orange-700 border-orange-200",
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-zinc-500",
  info: "bg-sky-500",
  brand: "bg-orange-500",
};

function toneClasses(tone: BadgeTone, isLight: boolean): string {
  return isLight ? TONE_CLASSES_LIGHT[tone] : TONE_CLASSES_DARK[tone];
}

export function Badge({
  tone = "neutral",
  size = "md",
  isLight = false,
  pulse = false,
  uppercase = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-bold border ${SIZE_CLASSES[size]} ${toneClasses(tone, isLight)} ${uppercase ? "uppercase tracking-wide" : ""} ${className}`}
      {...rest}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${DOT_CLASSES[tone]}`} />
      )}
      {children}
    </span>
  );
}
