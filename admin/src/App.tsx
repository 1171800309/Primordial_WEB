import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OperationLogsPage } from './pages/OperationLogsPage'
import { OrdersPage } from './pages/OrdersPage'
import { UserEditPage } from './pages/UserEditPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserEditPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/audit-logs" element={<OperationLogsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
