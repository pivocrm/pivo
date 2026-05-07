import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#D1E8C8] bg-white px-3 py-2 text-sm text-[#1A2547] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#5A6A82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DC93E] focus-visible:ring-offset-1 focus-visible:border-[#5DC93E] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
