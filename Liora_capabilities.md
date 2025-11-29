# LioraCircle: Agentic AI & Capabilities Specification

**Version:** 1.0
**Core Model:** Google Gemini 3.0 Pro
**Architecture:** Multi-Agent Orchestration (Perceive → Decide → Act)

---

## 1. Core Agentic Identity

Liora is not a passive chatbot. She is a stateful agent that maintains a persistent mental model of the family. She operates on three levels:

* **The Observer (Perceive):** Ingests vitals, chat, images, calendar data.
* **The Thinker (Decide):** Uses Deep Think to resolve conflicts and check medical safety.
* **The Doer (Act):** Updates the database, sends alerts, and controls the UI.

---

## 2. The Multi-Agent Persona System

Liora switches "hats" depending on the context. She is not one prompt, but a collection of specialized sub-agents.

| Agent Persona      | Trigger Context                              | Primary Goal                           | Tone / Behavior                               |
| ------------------ | -------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| **The Concierge**  | Onboarding, general chat, navigation         | Build rapport, gather missing data     | Warm, inquisitive, casual                     |
| **The Auditor**    | Vitals update, medical record upload         | Analyze data for anomalies             | Analytical, precise, objective                |
| **The Strategist** | Calendar planning, meal prep                 | Optimize logistics & resolve conflicts | Problem-solver, helpful, suggestive           |
| **The Guardian**   | Emergency (fall, low glucose), acute illness | Safety & immediate action              | Authoritative, loud, direct (short sentences) |
| **The Companion**  | User mentions loneliness / stress            | Emotional support                      | Empathetic, good listener, soft               |

### 2.1 Adaptive Behavior Modes (Demographic Overrides)

Liora applies a "filter" to her responses based on who she is talking to:

**Child Mode (<12 Years)**

* Vocabulary: Simplified. Uses metaphors (e.g., "White blood cells are your body's soldiers").
* Gamification: "Let's score points by eating broccoli!"
* Safety: Never gives medical advice without tagging a Guardian.

**Pregnancy Mode**

* Constraint Engine: Automatically checks every food/activity suggestion against a Teratogen/Risk Database (e.g., no sushi, limit caffeine).
* Focus: Trimester-specific symptoms and mental well-being.

**Geriatric Mode**

* UI / Voice: Speaks slower. Suggests larger font settings.
* Focus: Routine adherence, hydration, mobility, and memory support.

---

## 3. Detailed Capabilities (The Skill Tree)

### A. Multimodal Perception (Gemini Vision)

* **Pill Identifier:** User snaps a photo of a loose pill → Liora identifies it and checks if it's in the schedule.
* **Meal Analysis:** User snaps a photo of lunch → Liora estimates carbs/protein (useful for diabetic users).
* **Medical OCR:** User uploads a PDF lab report → Liora extracts structured data (e.g., "Ferritin: 12 ng/mL") and plots it on the vitals graph.

### B. Contextual Memory (RAG)

* **Short-term:** Remembers conversation context from recent minutes (e.g., "As we discussed about the sushi...").
* **Long-term:** Remembers facts from months ago and surfaces relevant historical context (e.g., "This happened last November when your iron was low.").

### C. Relationship Graph Reasoning

Liora understands dependencies across the family graph.

**Example:**

* Input: "Grandma has a doctor's appointment at 2 PM."
* Reasoning: Grandma cannot drive. Dad is at work. Mom is free.
* Output: "Grandma has an appointment at 2 PM. Should I ask Mom to drive her since Dad is working?"

---

## 4. The "App Controller" Logic (Natural Language UI Control)

**Feature:** UI-State-as-a-Function. Liora has write access to the application state. When a user describes a change naturally, Liora executes a function to update the UI instantly.

**Workflow Example:**

1. **User says:** "Dr. Smith prescribed me 500mg of Metformin twice a day starting tomorrow."
2. **Liora Perceives:** Intent = `Add_Medication`.
3. **Liora Decides:** Extracts entities: `Name=Metformin`, `Dose=500mg`, `Freq=2x/day`, `Start=Tomorrow`.
4. **Liora Acts:** Executes function: `add_medication_to_db(...)`.
5. **UI Response:** The Medication tab refreshes to show the new pill in the schedule.

**Capable "Controller" Actions:**

* "Set a reminder for..." → Updates Reminders & Calendar Module.
* "I ate 2 eggs." → Updates Nutrition Module & subtracts from Inventory.
* "I'm feeling anxious." → Updates Family Mood Indicator & logs in Mental Health Journal.
* "Cancel my gym session." → Updates Routine Module & Calendar.

---

*End of specification.*
