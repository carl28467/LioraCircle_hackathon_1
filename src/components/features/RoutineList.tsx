import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const routines = [
    { id: 1, title: "Morning Yoga", time: "7:00 AM", status: "completed" },
    { id: 2, title: "Breakfast", time: "8:30 AM", status: "completed" },
    { id: 3, title: "Gym Session", time: "6:00 PM", status: "upcoming" },
]

export function RoutineList() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Daily Routine</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {routines.map((routine) => (
                        <div key={routine.id} className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                <CalendarClock className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{routine.title}</p>
                                <p className="text-xs text-muted-foreground">{routine.time}</p>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${routine.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
