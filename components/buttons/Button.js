import { cn } from "@/lib/utils";

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className,
  ...props 
}) {
  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20",
    secondary: "bg-surface-container-high text-on-surface hover:bg-secondary-container/50",
    ghost: "bg-transparent text-primary hover:bg-primary-container/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  return (
    <button
      className={cn(
        "rounded-full font-label-sm text-label-sm transition-all duration-200 active:scale-95 cursor-pointer border-none outline-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
