import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold hover:from-green-400 hover:to-emerald-400 shadow-lg hover:shadow-green-500/20",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border border-red-700 hover:shadow-red-500/20",
        outline:
          "border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 hover:border-green-400/50 hover:text-white",
        secondary:
          "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700 hover:border-green-400/50",
        ghost: "text-gray-300 hover:bg-gray-800/50 hover:text-green-400",
        link: "text-green-400 hover:text-green-300 underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400 shadow-lg hover:shadow-purple-500/20"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-12 px-6 rounded-md text-base",
        xl: "h-14 px-8 rounded-lg text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
