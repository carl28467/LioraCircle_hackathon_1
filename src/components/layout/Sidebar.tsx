import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Utensils, Calendar, Activity, Brain } from "lucide-react"

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Family Circle", href: "/family" },
    { icon: Utensils, label: "Kitchen", href: "/kitchen" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: Activity, label: "Vitals", href: "/vitals" },
    { icon: Brain, label: "Liora Memory", href: "/memory" },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="flex w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-primary">LioraCircle</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
