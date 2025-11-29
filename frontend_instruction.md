LioraCircle Web App - User Flow & UI Specification

1. Authentication Phase

Goal: Low-friction entry.

Sign Up / Sign In Page:

Inputs: Email, Phone Number, Password, Full Name.

Social: "Continue with Google" button.

Logic: If existing user -> Direct to Dashboard. If new user -> Direct to Onboarding.

2. Liora Onboarding (The "Handshake")

Goal: Build the user profile through conversation, not forms.

Interface: Full-screen Chat UI.

Agent Behavior: Liora asks one question at a time:

Nickname preference.

Biometrics (Age, Height, Weight).

Medical Conditions (e.g., Diabetes -> Enables CGM widget).

Devices (e.g., Apple Watch -> Enables Vitals widgets).

3. Circle Formation (The "Fork")

Goal: Define the user's role in the ecosystem.

Selection Screen:

Option A: "I am a Pioneer" (Create a new Family Circle).

Option B: "Join a Family" (I have a code).

Path A: The Pioneer

Code Generation Page:

Display Unique Code: e.g., LIORA-FAM-772.

Action: "Share Code" (Simulated copy to clipboard).

Confirmation: "I have shared this with my family" button -> Unlocks Dashboard.

Path B: The Joiner

Input Page:

Input Field: Enter 6-digit Family Code.

Validation -> Unlocks Dashboard.

4. The Dashboard (The Hub)

Goal: Centralized view of health and family context.

Top Bar: Calendar Icon, Notifications (Bell), Profile Pic.

Widget Grid:

Vitals Card: Heart Rate, SpO2, Stress Level, Steps.

Dynamic Vitals: CGM Graph (if diabetic), Period Tracker (if female/applicable).

Medication: Checklist of daily meds (Due/Taken).

Routine: Next upcoming task (e.g., "Gym at 6 PM").

Family Mood: Visual bar/Emoji indicator of overall family sentiment.

Liora Alerts: Red/Yellow box for critical warnings (e.g., "Grandma fall detected").

5. Secondary Views (Navigation)

Family Circle Page: Visual nodes of all connected members. Click to view their specific data.

Inventory/Nutrition Page: View virtual fridge, upload grocery photos, recipe suggestions.

Appointment/Routine Page: Calendar view, set new events via UI or Chat.

6. Global Element: Liora Chat

Persistent Access: A floating action button (FAB) on the bottom right of every page.

Capabilities: Can set routines, log food, or answer health queries from anywhere.