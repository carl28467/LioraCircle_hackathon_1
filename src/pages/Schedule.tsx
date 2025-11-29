import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScheduleItem } from "@/components/features/ScheduleItem"
import type { ScheduleItemProps } from "@/components/features/ScheduleItem"
import { CalendarGrid } from "@/components/features/CalendarGrid"
import { Plus, History, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { chatApi } from "@/api/client"
import { Sparkles, Send } from "lucide-react"

export default function Schedule() {
    const { profile } = useAuth()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTask, setNewTask] = useState({ title: "", time: "", type: "routine" as const, assigned_to: "family" })
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Extended data structure with date and member info
    const [scheduleData, setScheduleData] = useState<(ScheduleItemProps & { date: Date })[]>([])

    const [history, setHistory] = useState<ScheduleItemProps[]>([])

    // Assistant State
    const [assistantInput, setAssistantInput] = useState("")
    const [assistantResponse, setAssistantResponse] = useState("")
    const [isAssistantLoading, setIsAssistantLoading] = useState(false)

    useEffect(() => {
        const fetchMembers = async () => {
            if (!profile?.family_id) return
            const { data } = await supabase.from("profiles").select("*").eq("family_id", profile.family_id)
            if (data) {
                setMembers(data.map(m => ({
                    id: m.id,
                    name: m.full_name,
                    color: m.profile_data?.color || "bg-blue-500"
                })))
            }
        }
        fetchMembers()
    }, [profile?.family_id])

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!profile?.family_id) return
            setLoading(true)
            try {
                // Fetch daily schedules
                const res = await fetch(`http://localhost:8000/schedules/${profile.family_id}`)
                if (res.ok) {
                    const data = await res.json()
                    const formattedData = data.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        time: item.time,
                        type: item.type,
                        status: item.status,
                        description: item.description,
                        member: item.member,
                        date: new Date(item.date),
                        onToggleStatus: () => { } // Handled by parent
                    }))
                    setScheduleData(formattedData)
                }

                // Fetch history (completed items, limit 5)
                const historyRes = await fetch(`http://localhost:8000/schedules/${profile.family_id}?status=completed&limit=5`)
                if (historyRes.ok) {
                    const historyData = await historyRes.json()
                    const formattedHistory = historyData.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        time: new Date(item.date).toLocaleDateString() === new Date().toLocaleDateString() ? "Today" : "Yesterday", // Simplified relative time
                        type: item.type,
                        status: item.status,
                        member: item.member,
                        onToggleStatus: () => { }
                    }))
                    setHistory(formattedHistory)
                }

            } catch (error) {
                console.error("Failed to fetch schedules", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSchedules()

        // Realtime subscription
        const channel = supabase
            .channel('public:schedules')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules', filter: `family_id=eq.${profile?.family_id}` }, (payload) => {
                console.log('Realtime update:', payload)
                fetchSchedules() // Re-fetch to keep it simple and consistent with joins
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [profile?.family_id])

    const handleToggleStatus = async (id: string) => {
        const item = scheduleData.find(i => i.id === id)
        if (!item) return

        const newStatus = item.status === "completed" ? "pending" : "completed"

        // Optimistic update
        setScheduleData(scheduleData.map(i =>
            i.id === id ? { ...i, status: newStatus } : i
        ))

        try {
            await fetch(`http://localhost:8000/schedules/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
        } catch (error) {
            console.error("Failed to update status", error)
            // Revert on error
            setScheduleData(scheduleData.map(i =>
                i.id === id ? { ...i, status: item.status } : i
            ))
        }
    }

    const handleAddTask = async () => {
        if (!newTask.title || !newTask.time || !profile?.family_id) return

        const payload = {
            title: newTask.title,
            time: newTask.time,
            type: newTask.type,
            date: selectedDate.toISOString().split('T')[0],
            family_id: profile.family_id,
            assigned_to: newTask.assigned_to === "family" ? null : newTask.assigned_to
        }

        try {
            const res = await fetch("http://localhost:8000/schedules/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const createdItem = await res.json()
                const newItem = {
                    id: createdItem.id,
                    title: createdItem.title,
                    time: createdItem.time,
                    type: createdItem.type,
                    status: createdItem.status,
                    description: createdItem.description,
                    member: createdItem.member,
                    date: new Date(createdItem.date),
                    onToggleStatus: () => { }
                }
                setScheduleData([...scheduleData, newItem])
                setNewTask({ title: "", time: "", type: "routine", assigned_to: "family" })
                setShowAddForm(false)
            }
        } catch (error) {
            console.error("Failed to create schedule", error)
        }
    }

    const handleAssistantSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assistantInput.trim() || isAssistantLoading) return

        setIsAssistantLoading(true)
        try {
            // Pass profile info in context if needed, but backend handles it via auth usually. 
            // Here we pass family_id in context just in case.
            // Pass profile info in context. We explicitly set onboarding_completed to true 
            console.error("Assistant error:", error)
            setAssistantResponse("Sorry, I couldn't process that.")
        } finally {
            setIsAssistantLoading(false)
        }
    }

    // Filter events for the selected date
    const dailySchedule = scheduleData
        .filter(item => item.date.toDateString() === selectedDate.toDateString())
        .sort((a, b) => a.time.localeCompare(b.time))

    // Prepare events for calendar indicators
    const calendarEvents = scheduleData.map(item => ({
        date: item.date,
        memberColor: item.member?.color || "bg-gray-500"
    }))

    // Calculate completion rate for the selected date
    const totalDailyTasks = dailySchedule.length
    const completedDailyTasks = dailySchedule.filter(i => i.status === "completed").length
    const completionRate = totalDailyTasks > 0 ? Math.round((completedDailyTasks / totalDailyTasks) * 100) : 0

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:flex-row">
            {/* Main Schedule Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
                        <p className="text-muted-foreground">Manage family routines and appointments.</p>
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Routine
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                    {/* Calendar Column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="p-4">
                                <CalendarGrid
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    events={calendarEvents}
                                />
                            </CardContent>
                        </Card>

                        {/* Legend */}
                        <Card>
                            <CardHeader className="pb-2 p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle className="text-sm">Family Members</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex flex-wrap gap-2">
                                    {members.length > 0 ? members.map(m => (
                                        <div key={m.id} className="flex items-center gap-1.5 text-xs bg-secondary px-2 py-1 rounded-full">
                                            <div className={`h-2 w-2 rounded-full ${m.color}`} />
                                            <span>{m.name}</span>
                                        </div>
                                    )) : (
                                        <span className="text-xs text-muted-foreground">Loading members...</span>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs bg-secondary px-2 py-1 rounded-full">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        <span>Family</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Agenda Column */}
                    <div className="flex flex-col gap-4">
                        {/* Add Task Form */}
                        {showAddForm && (
                            <Card className="animate-in slide-in-from-top-4 fade-in">
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                placeholder="e.g., Take Vitamins"
                                                value={newTask.title}
                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Time</label>
                                            <Input
                                                type="time"
                                                value={newTask.time}
                                                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select
                                                value={newTask.type}
                                                onValueChange={(value: any) => setNewTask({ ...newTask, type: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="routine">Routine</SelectItem>
                                                    <SelectItem value="medication">Medication</SelectItem>
                                                    <SelectItem value="appointment">Appointment</SelectItem>
                                                    <SelectItem value="exercise">Exercise</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Assign To</label>
                                            <Select
                                                value={newTask.assigned_to}
                                                onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select member" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="family">Entire Family</SelectItem>
                                                    {members.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        <Button onClick={handleAddTask}>Save Routine</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline List */}
                        <div className="flex-1 overflow-y-auto space-y-3">
                            <h3 className="font-medium text-muted-foreground">
                                {selectedDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>

                            {loading ? (
                                <div className="flex h-40 items-center justify-center text-muted-foreground">
                                    Loading schedules...
                                </div>
                            ) : dailySchedule.length > 0 ? (
                                dailySchedule.map((item) => (
                                    <ScheduleItem
                                        key={item.id}
                                        {...item}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))
                            ) : (
                                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                    <p>No routines scheduled for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Panel: History & Assistant */}
            <div className="hidden md:flex w-80 flex-col gap-4">
                {/* Liora Assistant */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base text-primary">Liora Assistant</CardTitle>
                        </div>
                        <CardDescription>Ask me to schedule something!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {assistantResponse && (
                            <div className="bg-background/50 p-3 rounded-md text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                                {assistantResponse}
                            </div>
                        )}
                        <form onSubmit={handleAssistantSubmit} className="flex gap-2">
                            <Input
                                placeholder="e.g. 'Gym at 5pm'"
                                value={assistantInput}
                                onChange={(e) => setAssistantInput(e.target.value)}
                                className="bg-background"
                            />
                            <Button type="submit" size="icon" disabled={isAssistantLoading || !assistantInput.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">History</CardTitle>
                        </div>
                        <CardDescription>Recently completed items</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 opacity-70">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${item.member?.color || "bg-gray-500"}`} />
                                    <div>
                                        <p className="text-sm font-medium leading-none">{item.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.time} • {item.member?.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Daily Completion Rate</span>
                                <span className={cn("font-bold",
                                    completionRate >= 80 ? "text-green-600" :
                                        completionRate >= 50 ? "text-yellow-600" : "text-red-600"
                                )}>{completionRate}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-secondary overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-500",
                                        completionRate >= 80 ? "bg-green-500" :
                                            completionRate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
