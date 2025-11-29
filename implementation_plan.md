# Implementation Plan - Explicit Completion Confirmation

## Goal
Give the user control over when to finish onboarding, even after Liora is satisfied. Liora will suggest completion, and the user must confirm via a UI widget.

## Proposed Changes

### Backend Logic
#### [MODIFY] [backend/agents/onboarding.py](file:///c:/Users/HEXON/Desktop/LioraCircle/backend/agents/onboarding.py)
- **System Prompt**:
    -   Change instruction: When all data is collected, do NOT set `onboarding_completed: true`. Instead, set `suggest_completion: true`.
    -   Add instruction: If user sends "CONFIRM_COMPLETION", THEN set `onboarding_completed: true` (and generate family code if pioneer).
- **Process Message**:
    -   Ensure `suggest_completion` is passed through in `updates`.

### Frontend Logic
#### [MODIFY] [src/pages/Onboarding.tsx](file:///c:/Users/HEXON/Desktop/LioraCircle/src/pages/Onboarding.tsx)
- **State**: Add `showConfirmationWidget`.
- **Effect**: If `updates.suggest_completion` is true, show the widget.
- **Widget**:
    -   "Liora has everything she needs. Ready to finish?"
    -   [Yes, Finish]: Calls `handleSendMessage` with hidden text "CONFIRM_COMPLETION".
    -   [No, I have more]: Hides widget, allows user to type.

## Verification Plan
1.  **Chat**: Provide all info.
2.  **Verify**: Widget appears.
3.  **Action**: Click "No". Add more info (e.g., "Also I have a dog").
4.  **Verify**: Liora acknowledges. Widget might appear again (if she's still satisfied).
5.  **Action**: Click "Yes".
6.  **Verify**: Final "Success" / Family Code widget appears.
