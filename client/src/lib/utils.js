import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}

export function cva(base, config = {}) {
  return function cvaFn(props = {}) {
    const { className, ...rest } = props
    const variants = config.variants || {}
    const defaultVariants = config.defaultVariants || {}
    
    let classes = [base]
    
    // Add variant classes
    Object.keys(variants).forEach(variant => {
      const value = rest[variant] || defaultVariants[variant]
      if (value && variants[variant][value]) {
        classes.push(variants[variant][value])
      }
    })
    
    // Add className if provided
    if (className) {
      classes.push(className)
    }
    
    return cn(...classes)
  }
}
