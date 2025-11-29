import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
    selectedDate: Date
    onDateSelect: (date: Date) => void
    events: { date: Date; memberColor: string }[]
}

export function CalendarGrid({ selectedDate, onDateSelect, events }: CalendarGridProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay()
    }

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const renderDays = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)

        const days = []

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10" />)
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const isToday = date.toDateString() === new Date().toDateString()

            const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString())

            days.push(
                <button
                    key={day}
                    onClick={() => onDateSelect(date)}
                    className={cn(
                        "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-all hover:bg-accent",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        isToday && !isSelected && "border border-primary text-primary font-bold"
                    )}
                >
                    {day}
                    {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((e, i) => (
                                <div key={i} className={`h-1 w-1 rounded-full ${e.memberColor}`} />
                            ))}
                        </div>
                    )}
                </button>
            )
        }

        return days
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center font-medium">
                        {day}
                    </div>
                ))}
                {renderDays()}
            </div>
        </div>
    )
}
