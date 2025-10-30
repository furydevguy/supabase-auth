"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-[3px]",
      },
      variant: {
        default: "border-gray-900 dark:border-gray-100",
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessibility label for screen readers
   * @default "Loading"
   */
  "aria-label"?: string
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, "aria-label": ariaLabel = "Loading", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={cn(spinnerVariants({ size, variant, className }))}
        {...props}
      >
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

Spinner.displayName = "Spinner"

