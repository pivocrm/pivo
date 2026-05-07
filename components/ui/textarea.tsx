import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-[#D1E8C8] bg-white px-3 py-2 text-sm text-[#1A2547] placeholder:text-[#5A6A82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5DC93E] focus-visible:ring-offset-1 focus-visible:border-[#5DC93E] disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
