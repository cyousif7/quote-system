import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import QuoteForm from './pages/QuoteForm'
import QuoteStatus from './pages/QuoteStatus'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import ArchivedTickets from './pages/ArchivedTickets'

function App() {
  return (
    <Routes>
      <Route path="/" element={<QuoteForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/quote/:token" element={<QuoteStatus />} />
      <Route path="/archived" element={
        <ProtectedRoute>
          <ArchivedTickets />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App