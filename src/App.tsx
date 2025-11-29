import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import Dashboard from "@/pages/Dashboard"
import Login from "@/pages/Login"
import Onboarding from "@/pages/Onboarding"

import FamilyCircle from "@/pages/FamilyCircle"
import Kitchen from "@/pages/Kitchen"
import Schedule from "@/pages/Schedule"
import Vitals from "@/pages/Vitals"
import LioraMemory from "@/pages/LioraMemory"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute checkOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute checkOnboarding={true}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="family" element={<FamilyCircle />} />
            <Route path="kitchen" element={<Kitchen />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="vitals" element={<Vitals />} />
            <Route path="memory" element={<LioraMemory />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
