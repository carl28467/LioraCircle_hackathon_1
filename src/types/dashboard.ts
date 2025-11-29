export interface Vital {
    value: number | string;
    unit?: string;
    trend?: string;
    goal?: number;
    left?: number;
}

export interface Medication {
    id: number;
    name: string;
    dose: string;
    time: string;
    taken: boolean;
}

export interface Routine {
    id: number;
    name: string;
    time: string;
    completed: boolean;
}

export interface FamilyMember {
    id: number;
    name: string;
    initial: string;
    status: "good" | "warning" | "danger";
    mood: string;
    color: string;
}

export interface Alert {
    id: number;
    type: "warning" | "info" | "danger";
    message: string;
    time: string;
}

export interface UserDashboardData {
    vitals: {
        heart_rate: Vital;
        spo2: Vital;
        steps: Vital;
        sleep: Vital;
        calories: Vital;
    };
    medications: Medication[];
    routines: Routine[];
}

export interface FamilyDashboardData {
    family_members: FamilyMember[];
    overall_vibe: string;
    alerts: Alert[];
}
