import { Smile } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { FamilyMember } from "@/types/dashboard"

interface FamilyMoodProps {
    familyMembers?: FamilyMember[];
    overallVibe?: string;
}

export function FamilyMood({ familyMembers = [], overallVibe = "Balanced" }: FamilyMoodProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Family Mood</CardTitle>
                <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-around py-4">
                    {familyMembers.map((member) => (
                        <div key={member.id} className="group relative flex flex-col items-center gap-2">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-secondary text-lg font-semibold transition-transform group-hover:scale-105",
                                member.color
                            )}>
                                {member.initial}
                            </div>
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                                <span className="text-xs">{member.mood}</span>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{member.name}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Overall Vibe</span>
                        <span className="font-medium text-foreground">{overallVibe}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[70%] bg-gradient-to-r from-green-500 via-yellow-400 to-green-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
