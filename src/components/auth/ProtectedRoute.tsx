import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

type ProtectedRouteProps = {
    children: React.ReactNode
    checkOnboarding?: boolean
}

export function ProtectedRoute({ children, checkOnboarding = true }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    // If we require onboarding completion (e.g. Dashboard) but it's not done
    if (checkOnboarding && (!profile || !profile.onboarding_completed)) {
        // Redirect to onboarding, but only if we aren't already there
        if (location.pathname !== "/onboarding") {
            return <Navigate to="/onboarding" replace />
        }
    }

    // If we are on onboarding page but already completed it, go to dashboard
    if (location.pathname === "/onboarding" && profile?.onboarding_completed) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
