export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-3xl mx-auto w-full px-6 ${className}`}>
      {children}
    </div>
  );
}
