import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent font-body text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"]))]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        outline:
          'border-neutral-200 bg-surface text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        secondary:
          'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
        ghost:
          'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
        destructive:
          'bg-error-light text-error hover:bg-error/10 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
        link: 'text-brand-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 gap-2 px-5',
        sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
        lg: 'h-12 gap-2 px-6',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
