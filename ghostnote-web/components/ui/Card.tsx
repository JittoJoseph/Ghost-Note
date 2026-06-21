import { HTMLAttributes } from "react";

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[var(--color-border)] p-6 md:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
