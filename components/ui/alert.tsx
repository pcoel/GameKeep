import React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "info";
}

export function Alert({
  className,
  variant = "info",
  children,
  ...props
}: AlertProps) {
  const variants = {
    info: "border-primary/40 bg-primary/10 text-primary-200",
    success: "border-accent-emerald/40 bg-accent-emerald/10 text-emerald-300",
    error: "border-accent-rose/40 bg-accent-rose/10 text-rose-300",
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-3.5 text-sm flex items-start gap-2.5 transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
    </div>
  );
}

