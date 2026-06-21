import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export function Button({ children, variant = "primary", isLoading, className = "", disabled, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 rounded-full font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-sm hover:shadow-md hover:shadow-black/10",
    secondary: "bg-stone-100 hover:bg-stone-200 text-gray-800",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
    ghost: "bg-transparent hover:bg-stone-50 text-gray-600",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
