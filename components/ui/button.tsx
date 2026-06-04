import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform duration-100"

        const variants = {
            primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-md",
            secondary: "bg-white/80 text-foreground hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm",
            ghost: "hover:bg-black/5 dark:hover:bg-white/10",
            outline: "border border-gray-200 bg-transparent hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
        }

        const sizes = {
            sm: "h-8 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-10 w-10 p-2"
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
