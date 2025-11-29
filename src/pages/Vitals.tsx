import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MedicationItem } from "@/components/features/MedicationItem"
import type { MedicationItemProps } from "@/components/features/MedicationItem"
import { AppointmentItem } from "@/components/features/AppointmentItem"
import type { AppointmentItemProps } from "@/components/features/AppointmentItem"
import { LioraInsights } from "@/components/features/LioraInsights"
import { Plus, FileText, Upload, Activity, Pill, Calendar as CalendarIcon, Stethoscope } from "lucide-react"

export default function Vitals() {
    const [activeTab, setActiveTab] = useState<"medications" | "appointments" | "documents" | "vitals">("medications")
    const [showAddMed, setShowAddMed] = useState(false)

    // Mock Data
    const [medications, setMedications] = useState<MedicationItemProps[]>([
        { id: "1", name: "Lisinopril", dosage: "10mg", frequency: "Daily", time: "08:00 AM", type: "chronic", status: "taken", instructions: "Take with food", onToggleStatus: () => { } },
        { id: "2", name: "Metformin", dosage: "500mg", frequency: "Twice Daily", time: "08:00 AM", type: "chronic", status: "taken", onToggleStatus: () => { } },
        { id: "3", name: "Amoxicillin", dosage: "500mg", frequency: "Every 8 hours", time: "02:00 PM", type: "acute", status: "pending", instructions: "Finish full course", onToggleStatus: () => { } },
    ])

    const [appointments] = useState<AppointmentItemProps[]>([
        { id: "1", title: "Cardiology Follow-up", doctor: "Dr. Sarah Chen", specialty: "Cardiology", date: "Dec 15, 2025", time: "10:00 AM", location: "City Heart Center", notes: "Bring blood pressure logs" },
        { id: "2", title: "Annual Physical", doctor: "Dr. James Wilson", specialty: "Primary Care", date: "Jan 10, 2026", time: "09:30 AM", location: "Family Health Clinic" },
    ])

    const [documents] = useState([
        { id: "1", name: "Blood Work Results.pdf", date: "Nov 20, 2025", type: "Lab Report" },
        { id: "2", name: "Vaccination Record.pdf", date: "Oct 15, 2025", type: "Record" },
        { id: "3", name: "Cardiology Referral.pdf", date: "Nov 01, 2025", type: "Referral" },
    ])

    const handleToggleMedStatus = (id: string) => {
        setMedications(medications.map(med =>
            med.id === id
                ? { ...med, status: med.status === "taken" ? "pending" : "taken" }
                : med
        ))
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:flex-row">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Health & Wellness</h2>
                        <p className="text-muted-foreground">Manage medications, appointments, and records.</p>
                    </div>
                    {activeTab === "medications" && (
                        <Button onClick={() => setShowAddMed(!showAddMed)} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Medication
                        </Button>
                    )}
                    {activeTab === "appointments" && (
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Appointment
                        </Button>
                    )}
                    {activeTab === "documents" && (
                        <Button className="gap-2">
                            <Upload className="h-4 w-4" /> Upload
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
                    {[
                        { id: "medications", label: "Medications", icon: Pill },
                        { id: "appointments", label: "Appointments", icon: CalendarIcon },
                        { id: "documents", label: "Documents", icon: FileText },
                        { id: "vitals", label: "Vitals History", icon: Activity },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">

                    {/* Medications Tab */}
                    {activeTab === "medications" && (
                        <div className="space-y-6">
                            {/* Liora Message */}
                            <LioraInsights title="Liora's Health Tip" icon={Stethoscope}>
                                <div className="rounded-lg bg-card/50 p-4 text-sm leading-relaxed text-card-foreground shadow-sm">
                                    <p>
                                        You've been consistent with your Lisinopril! Remember, your Amoxicillin course ends in 2 days. Don't skip the last doses.
                                    </p>
                                </div>
                            </LioraInsights>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Chronic Medications
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {medications.filter(m => m.type === "chronic").map(med => (
                                        <MedicationItem key={med.id} {...med} onToggleStatus={handleToggleMedStatus} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-orange-500" /> Acute Medications
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {medications.filter(m => m.type === "acute").map(med => (
                                        <MedicationItem key={med.id} {...med} onToggleStatus={handleToggleMedStatus} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === "appointments" && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {appointments.map(apt => (
                                <AppointmentItem key={apt.id} {...apt} />
                            ))}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === "documents" && (
                        <div className="grid gap-4 md:grid-cols-3">
                            {documents.map(doc => (
                                <Card key={doc.id} className="hover:bg-accent/50 transition-colors cursor-pointer group">
                                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium truncate w-full">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.date} • {doc.type}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Vitals History Tab (Placeholder for now) */}
                    {activeTab === "vitals" && (
                        <div className="flex h-60 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            <p>Detailed vitals history charts will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
