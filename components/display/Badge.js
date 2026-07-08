import { cn } from "@/lib/utils";

export default function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-primary-container/10 text-primary",
    success: "bg-tertiary/10 text-tertiary",
    error: "bg-error-container/20 text-error",
    warning: "bg-primary-fixed text-on-primary-fixed",
  };

  return (
    <span className={cn(
      "inline-block px-3 py-1 rounded-full font-label-sm text-label-sm",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
