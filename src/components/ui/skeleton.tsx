import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-bg-elevated via-border-hover to-bg-elevated animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
