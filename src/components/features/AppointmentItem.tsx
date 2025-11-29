import { Calendar, MapPin, User, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AppointmentItemProps {
    id: string
    title: string
    doctor: string
    specialty: string
    date: string
    time: string
    location: string
    notes?: string
}

export function AppointmentItem({ title, doctor, specialty, date, time, location, notes }: AppointmentItemProps) {
    return (
        <div className="group flex flex-col gap-3 rounded-lg border p-4 transition-all hover:bg-accent/50">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-medium leading-none">{title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{specialty}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 font-medium text-foreground bg-secondary/50 p-2 rounded-md">
                    <Calendar className="h-4 w-4" />
                    <span>{date} at {time}</span>
                </div>
            </div>

            {notes && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                    <span className="font-medium">Note:</span> {notes}
                </div>
            )}
        </div>
    )
}
