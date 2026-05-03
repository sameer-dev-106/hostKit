import React from 'react'
import { AuthProvider } from './feature/auth/Auth.context'
import { DashboardProvider } from './feature/dashboard/context/Dashboard.context'
import { AppRoutes } from './AppRoutes'

const App = () => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <AppRoutes />
      </DashboardProvider>
    </AuthProvider>
  )
}

export default App