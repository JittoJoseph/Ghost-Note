import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-bold text-[var(--color-foreground)] ml-1">{label}</label>}
        <input
          ref={ref}
          className={`px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-white placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-primary)] transition-all font-medium ${
            error ? "border-red-500 focus:border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-bold ml-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-bold text-[var(--color-foreground)] ml-1">{label}</label>}
        <textarea
          ref={ref}
          className={`px-4 py-3 rounded-2xl border-2 border-[var(--color-border)] bg-white placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-primary)] transition-all font-medium min-h-[100px] resize-y ${
            error ? "border-red-500 focus:border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-bold ml-1">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
