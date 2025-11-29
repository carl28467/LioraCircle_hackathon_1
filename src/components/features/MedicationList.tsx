import { CheckSquare, Square } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import type { Medication } from "@/types/dashboard"

interface MedicationListProps {
    medications?: Medication[];
}

export function MedicationList({ medications = [] }: MedicationListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Medications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {medications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No medications scheduled.</p>
                    ) : (
                        medications.map((med) => (
                            <div key={med.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        {med.taken ? (
                                            <CheckSquare className="h-5 w-5 text-primary" />
                                        ) : (
                                            <Square className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </Button>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{med.name}</p>
                                        <p className="text-xs text-muted-foreground">{med.dose} • {med.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
