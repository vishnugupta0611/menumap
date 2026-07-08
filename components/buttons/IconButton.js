import { cn } from "@/lib/utils";

export default function IconButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-container/10 transition-colors active:scale-90 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
