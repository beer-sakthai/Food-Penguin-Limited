import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isLight?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export function Input({
  isLight = false,
  label,
  icon,
  className = "",
  id,
  ...rest
}: InputProps) {
  const fieldClasses = isLight
    ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white"
    : "bg-zinc-900 border-zinc-800 text-white focus:bg-black";

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.3)] ${fieldClasses} ${className}`}
          {...rest}
        />
      </div>
    </div>
  );
}
