'use client'

import { LayoutGrid, Armchair, UtensilsCrossed, Users, Settings, ShoppingCart, UserCheck, Calendar, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const MENU_ITEMS = [
    { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
    { icon: Armchair, label: "Canvas", href: "/dashboard/canvas" },
    { icon: UtensilsCrossed, label: "Menu", href: "/dashboard/menu" },
    { icon: ShoppingCart, label: "POS", href: "/dashboard/pos" },
    { icon: UserCheck, label: "Host", href: "/dashboard/host" },
    { icon: Calendar, label: "Booking", href: "/book/lumiere-dining" },
    { icon: Users, label: "Staff", href: "/dashboard/staff" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-20 flex-col items-center justify-between border-r border-white/20 bg-white/60 py-8 backdrop-blur-xl hidden md:flex">
            <div className="flex flex-col items-center gap-8">
                {/* Brand Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                    <span className="text-xl font-bold">G</span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-4">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-white text-primary shadow-md"
                                    : "text-gray-500 hover:bg-white/50 hover:text-foreground"
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <span className="absolute -right-1 top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-white" />
                                )}

                                {/* Tooltip */}
                                <span className="absolute left-16 z-50 rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                <form action="/auth/signout" method="post">
                    <button type="submit" className="flex h-12 w-12 items-center justify-center rounded-2xl text-destructive transition-colors hover:bg-red-50">
                        <LogOut size={24} />
                    </button>
                </form>
            </div>
        </aside>
    )
}
