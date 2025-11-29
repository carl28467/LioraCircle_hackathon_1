import { useState } from "react"
import { Bell, User, X, Check, AlertCircle, Calendar, Pill, LogOut, Settings, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function Header() {
    const { user, profile, signOut } = useAuth()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

    const [notifications, setNotifications] = useState([
        { id: 1, title: "Medication Reminder", message: "Time to take Lisinopril (10mg)", time: "Now", type: "medication", read: false },
        { id: 2, title: "Low Stock Alert", message: "Almond Milk is running low in the fridge.", time: "10m ago", type: "alert", read: false },
        { id: 3, title: "Appointment Tomorrow", message: "Cardiology follow-up with Dr. Chen at 10:00 AM.", time: "1h ago", type: "appointment", read: true },
    ])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const clearNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "medication": return <Pill className="h-4 w-4 text-blue-500" />
            case "alert": return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case "appointment": return <Calendar className="h-4 w-4 text-purple-500" />
            default: return <Bell className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6 relative z-50">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setShowNotifications(!showNotifications)
                            setShowProfile(false)
                        }}
                        className="relative"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
                        )}
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Notifications</h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${!notification.read ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
                                            >
                                                <div className="mt-1 rounded-full bg-slate-100 dark:bg-slate-800 p-2">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`text-sm font-medium leading-none ${!notification.read ? "text-slate-900 dark:text-slate-50" : "text-slate-500 dark:text-slate-400"}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="rounded-full p-1 text-blue-500 hover:bg-blue-500/10"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => clearNotification(notification.id)}
                                                        className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        title="Dismiss"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="border-t p-2 text-center">
                                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setNotifications([])}>
                                    Clear all
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                            setShowProfile(!showProfile)
                            setShowNotifications(false)
                        }}
                    >
                        <User className="h-5 w-5" />
                    </Button>

                    {showProfile && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="flex flex-col space-y-1 p-4 border-b border-slate-200 dark:border-slate-800">
                                <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-50">{profile?.full_name || user?.email?.split('@')[0] || "User"}</p>
                                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email}</p>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mt-2 w-fit">
                                    Member
                                </span>
                            </div>
                            <div className="p-2">
                                <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    Profile
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-800 p-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                    onClick={signOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
