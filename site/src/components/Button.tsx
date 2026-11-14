import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
  solid:
    'inline-flex justify-center rounded-md py-1 px-4 font-ui text-base font-semibold tracking-tight shadow-sm',
  outline:
    'inline-flex justify-center rounded-md border py-[calc(--spacing(1)-1px)] px-[calc(--spacing(4)-1px)] font-ui text-base font-semibold tracking-tight',
}

const variantStyles = {
  solid: {
    slate:
      'bg-slate-900 text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:bg-slate-700 active:text-white/80 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    brand:
      'bg-brand-600 text-white hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:bg-brand-700 active:text-white/80 dark:bg-brand-300 dark:text-night dark:hover:bg-brand-200',
    white:
      'bg-white text-brand-600 hover:text-brand-700 focus-visible:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-brand-50 active:text-brand-900/80 dark:bg-night dark:text-brand-300 dark:hover:text-brand-200',
  },
  outline: {
    slate:
      'border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-night-2',
    brand:
      'border-brand-300 text-brand-600 hover:border-brand-400 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-night-2',
  },
}

type ButtonProps = (
  | {
      variant?: 'solid'
      color?: keyof typeof variantStyles.solid
    }
  | {
      variant: 'outline'
      color?: keyof typeof variantStyles.outline
    }
) &
  (
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
    | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
        href?: undefined
      })
  )

export function Button({ className, ...props }: ButtonProps) {
  props.variant ??= 'solid'
  props.color ??= 'slate'

  className = clsx(
    baseStyles[props.variant],
    props.variant === 'outline'
      ? variantStyles.outline[props.color]
      : props.variant === 'solid'
        ? variantStyles.solid[props.color]
        : undefined,
    className,
  )

  let { variant, color, ...rest } = props
  void variant
  void color

  if (typeof rest.href === 'undefined') {
    return (
      <button
        className={className}
        {...(rest as React.ComponentPropsWithoutRef<'button'>)}
      />
    )
  }
  // The app under /app/, a page anchor and another site are not Next.js
  // routes: link to them with a plain anchor, so that Next.js does not try to
  // prefetch them.
  if (typeof rest.href === 'string' && /^(\/app\/|#|https?:)/.test(rest.href)) {
    return (
      <a
        className={className}
        {...(rest as React.ComponentPropsWithoutRef<'a'>)}
      />
    )
  }
  return (
    <Link
      className={className}
      {...(rest as React.ComponentPropsWithoutRef<typeof Link>)}
    />
  )
}
