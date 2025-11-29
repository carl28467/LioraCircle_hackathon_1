import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MedicationList } from "@/components/features/MedicationList"
import { RoutineList } from "@/components/features/RoutineList"
import { CGMGraph } from "@/components/features/CGMGraph"
import { FamilyMood } from "@/components/features/FamilyMood"
import { AlertsBox } from "@/components/features/AlertsBox"
import { LioraInsights } from "@/components/features/LioraInsights"
import type { UserDashboardData, FamilyDashboardData } from "@/types/dashboard"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [userData, setUserData] = useState<UserDashboardData | null>(null)
    const [familyData, setFamilyData] = useState<FamilyDashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return

            try {
                const userId = user.id
                const familyId = profile?.family_id || "none"

                const promises = [
                    fetch(`http://localhost:8000/api/dashboard/user/${userId}`),
                ]

                if (familyId !== "none") {
                    promises.push(fetch(`http://localhost:8000/api/dashboard/family/${familyId}`))
                }

                const responses = await Promise.all(promises)
                const userRes = responses[0]
                const familyRes = responses[1]

                if (userRes.ok) {
                    const userJson = await userRes.json()
                    setUserData(userJson)
                }

                if (familyRes && familyRes.ok) {
                    const familyJson = await familyRes.json()
                    setFamilyData(familyJson)
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, profile?.family_id])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* Alerts Section - Full Width */}
            <AlertsBox />

            {/* Vitals Row - Now 5 columns */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.vitals.heart_rate.value} {userData?.vitals.heart_rate.unit}</div>
                        <p className="text-xs text-muted-foreground">{userData?.vitals.heart_rate.trend}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SpO2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.vitals.spo2.value}{userData?.vitals.spo2.unit}</div>
                        <p className="text-xs text-muted-foreground">{userData?.vitals.spo2.trend}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.vitals.steps.value?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Goal: {userData?.vitals.steps.goal?.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.vitals.sleep.value}</div>
                        <p className="text-xs text-muted-foreground">{userData?.vitals.sleep.trend}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userData?.vitals.calories.value?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Left: {userData?.vitals.calories.left} kcal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <CGMGraph />
                    <div className="grid gap-4 md:grid-cols-2">
                        <MedicationList medications={userData?.medications} />
                        <RoutineList />
                    </div>
                </div>
                <div className="col-span-3 space-y-4">
                    <LioraInsights />
                    <FamilyMood familyMembers={familyData?.family_members} overallVibe={familyData?.overall_vibe} />
                </div>
            </div>
        </div>
    )
}
